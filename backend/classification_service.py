"""
문서 카테고리 자동 분류 서비스
학습된 2-Task BERT 모델 사용 (기관, 문서유형)
"""
import os
import json
import gc
import torch
import torch.nn as nn
import numpy as np
from typing import Dict

try:
    from transformers import AutoTokenizer, AutoConfig, AutoModel

    # 2-Task BERT 모델 클래스 정의
    class TwoTaskBertModel(nn.Module):
        """2개의 분류 태스크를 수행하는 BERT 모델"""

        def __init__(self, config, model_name, num_labels_dict):
            super().__init__()
            self.bert = AutoModel.from_pretrained(model_name, config=config)

            # 각 태스크별 분류 헤드
            self.classifiers = nn.ModuleDict({
                task: nn.Linear(config.hidden_size, num_labels)
                for task, num_labels in num_labels_dict.items()
            })

        def forward(self, input_ids, attention_mask=None, token_type_ids=None, **kwargs):
            # BERT 인코딩
            outputs = self.bert(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids
            )

            # [CLS] 토큰의 출력 사용
            pooled_output = outputs.last_hidden_state[:, 0, :]

            # 각 태스크별 로짓 계산
            logits = {
                task: classifier(pooled_output)
                for task, classifier in self.classifiers.items()
            }

            # transformers 스타일 출력
            class ModelOutput:
                def __init__(self, logits):
                    self.logits = logits

            return ModelOutput(logits)

    BERT_AVAILABLE = True
except Exception as e:
    BERT_AVAILABLE = False
    TwoTaskBertModel = None
    print(f"⚠️ BERT model not available: {e}")


class ClassificationService:
    """문서 분류 서비스 - Lazy loading으로 VRAM 효율적 사용"""

    def __init__(self, model_dir: str = None):
        """
        Args:
            model_dir: 학습된 모델이 저장된 디렉토리
        """
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), "twotask_bert_model")

        self.model_dir = model_dir
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.label_mappings = None
        self._is_loaded = False

    def __enter__(self):
        """Context manager 진입"""
        self._ensure_loaded()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager 종료 - 메모리 해제"""
        self.cleanup()
        return False

    def _load_model(self):
        """모델 로드"""
        try:
            # 레이블 매핑 로드
            label_mapping_path = os.path.join(self.model_dir, "label_mappings.json")
            with open(label_mapping_path, 'r', encoding='utf-8') as f:
                self.label_mappings = json.load(f)

            # Config 로드
            config_path = os.path.join(self.model_dir, "config.json")
            with open(config_path, 'r', encoding='utf-8') as f:
                model_config = json.load(f)

            # 토크나이저 로드
            print(f"Loading tokenizer from {self.model_dir}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)

            # 모델 로드
            print(f"Loading 2-Task model from {self.model_dir}...")
            config = AutoConfig.from_pretrained(model_config['model_name'])
            self.model = TwoTaskBertModel(
                config=config,
                model_name=model_config['model_name'],
                num_labels_dict=model_config['num_labels']
            )

            # 모델 가중치 로드
            model_path = os.path.join(self.model_dir, "model.pt")
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))

            self.model.to(self.device)
            self.model.eval()

            print(f"✓ 2-Task Model loaded successfully on {self.device}")
            print(f"  Tasks: 기관 ({self.label_mappings['기관']['num_labels']} labels), "
                  f"문서유형 ({self.label_mappings['문서유형']['num_labels']} labels)")

        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            self.model = None

    def _ensure_loaded(self):
        """모델이 로드되지 않았으면 로드"""
        if not self._is_loaded and BERT_AVAILABLE and TwoTaskBertModel:
            self._load_model()
            if self.model is not None:
                self._is_loaded = True

    def cleanup(self):
        """모델 언로드 및 메모리 해제"""
        if self._is_loaded:
            print(f"🧹 Cleaning up BERT model from {self.device}...")

            # 모델 삭제
            if self.model is not None:
                del self.model
                self.model = None

            if self.tokenizer is not None:
                del self.tokenizer
                self.tokenizer = None

            # GPU 메모리 해제
            if self.device == "cuda":
                torch.cuda.empty_cache()

            # Python 가비지 컬렉션
            gc.collect()

            self._is_loaded = False
            print(f"✓ BERT model cleaned up")

    def predict(self, text: str, return_probs: bool = False) -> Dict:
        """
        텍스트에 대한 2개 카테고리 예측

        Args:
            text: 입력 텍스트
            return_probs: 확률값도 반환할지 여부

        Returns:
            {
                "기관": "의사국 의안과",
                "문서유형": "의안원문",
                "confidence": {
                    "기관": 0.95,
                    "문서유형": 0.98
                },
                "probabilities": {  # return_probs=True인 경우
                    "기관": {"의사국 의안과": 0.95, ...},
                    "문서유형": {"의안원문": 0.98, ...}
                }
            }
        """
        # 모델이 로드되지 않았으면 로드
        self._ensure_loaded()

        if not BERT_AVAILABLE or self.model is None:
            return {
                "기관": "Unknown",
                "문서유형": "Unknown",
                "confidence": {"기관": 0.0, "문서유형": 0.0},
                "error": "Model not available"
            }

        # 토크나이징
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )

        # GPU로 이동
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # 예측
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits

        # 결과 파싱
        result = {"confidence": {}}

        for task_name in ['기관', '문서유형']:
            task_logits = logits[task_name].cpu().numpy()[0]

            # 가장 높은 확률의 레이블
            pred_id = int(np.argmax(task_logits))
            pred_label = self.label_mappings[task_name]['id2label'][str(pred_id)]

            result[task_name] = pred_label

            # 확률값 계산
            probs = torch.softmax(torch.tensor(task_logits), dim=0).numpy()
            result["confidence"][task_name] = float(probs[pred_id])

            if return_probs:
                # 상위 5개 레이블과 확률
                top_k = min(5, len(probs))
                top_indices = np.argsort(probs)[-top_k:][::-1]

                if 'probabilities' not in result:
                    result['probabilities'] = {}

                result['probabilities'][task_name] = {
                    self.label_mappings[task_name]['id2label'][str(idx)]: float(probs[idx])
                    for idx in top_indices
                }

        return result

    def predict_batch(self, texts: list, return_probs: bool = False) -> list:
        """여러 텍스트에 대한 배치 예측"""
        self._ensure_loaded()
        results = []
        for text in texts:
            result = self.predict(text, return_probs=return_probs)
            results.append(result)
        return results


# 헬퍼 함수 - 간편한 사용을 위한 래퍼
def get_classification_service():
    """ClassificationService 인스턴스를 반환 (context manager 사용 권장)"""
    return ClassificationService()
