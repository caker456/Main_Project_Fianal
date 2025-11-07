"""
학습된 2-Task BERT 모델 테스트 및 추론
Tasks: 기관, 문서유형
"""
import os
import sys
import json
import torch
import numpy as np
from typing import Dict
from transformers import AutoTokenizer, AutoConfig

# 숫자로 시작하는 모듈 import
import importlib.util
spec = importlib.util.spec_from_file_location("train_module", "2_train_2task_bert.py")
train_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(train_module)
TwoTaskBertModel = train_module.TwoTaskBertModel


class TwoTaskPredictor:
    """학습된 2-Task 모델로 예측"""

    def __init__(self, model_dir: str):
        """
        Args:
            model_dir: 학습된 모델이 저장된 디렉토리
        """
        self.model_dir = model_dir
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 레이블 매핑 로드
        label_mapping_path = os.path.join(model_dir, "label_mappings.json")
        with open(label_mapping_path, 'r', encoding='utf-8') as f:
            self.label_mappings = json.load(f)

        # Config 로드
        config_path = os.path.join(model_dir, "config.json")
        with open(config_path, 'r', encoding='utf-8') as f:
            model_config = json.load(f)

        # 토크나이저 로드
        print(f"Loading tokenizer from {model_dir}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)

        # 모델 로드
        print(f"Loading 2-Task model from {model_dir}...")

        config = AutoConfig.from_pretrained(model_config['model_name'])
        self.model = TwoTaskBertModel(
            config=config,
            model_name=model_config['model_name'],
            num_labels_dict=model_config['num_labels']
        )

        # 모델 가중치 로드
        model_path = os.path.join(model_dir, "model.pt")
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))

        self.model.to(self.device)
        self.model.eval()

        print(f"✓ 2-Task Model loaded successfully on {self.device}")
        print(f"  Tasks: 기관 ({self.label_mappings['기관']['num_labels']} labels), "
              f"문서유형 ({self.label_mappings['문서유형']['num_labels']} labels)")

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
                "probabilities": {  # return_probs=True인 경우
                    "기관": {"의사국 의안과": 0.95, ...},
                    "문서유형": {"의안원문": 0.98, ...}
                }
            }
        """
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
        result = {}

        for task_name in ['기관', '문서유형']:
            task_logits = logits[task_name].cpu().numpy()[0]

            # 가장 높은 확률의 레이블
            pred_id = int(np.argmax(task_logits))
            pred_label = self.label_mappings[task_name]['id2label'][str(pred_id)]

            result[task_name] = pred_label

            # 확률값 계산
            if return_probs:
                probs = torch.softmax(torch.tensor(task_logits), dim=0).numpy()

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
        results = []
        for text in texts:
            result = self.predict(text, return_probs=return_probs)
            results.append(result)
        return results


def main():
    """테스트 실행"""
    MODEL_DIR = "./twotask_bert_model"
    DATA_DIR = "./multitask_training_data"

    print("=" * 70)
    print("2-Task BERT 모델 테스트")
    print("Tasks: 기관, 문서유형")
    print("=" * 70)

    # 예측기 초기화
    predictor = TwoTaskPredictor(MODEL_DIR)

    # 실제 테스트 데이터 로드
    test_path = os.path.join(DATA_DIR, "test.json")
    if not os.path.exists(test_path):
        print(f"\n❌ 테스트 데이터를 찾을 수 없습니다: {test_path}")
        return

    with open(test_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    print(f"\n✓ 테스트 데이터 로드 완료: {len(test_data)}개 샘플")

    print("\n" + "=" * 70)
    print("예측 테스트 (실제 테스트 데이터)")
    print("=" * 70)

    # 50개 샘플 테스트 (또는 전체 테스트 데이터가 50개 미만이면 전체)
    correct_기관 = 0
    correct_문서유형 = 0
    total = min(50, len(test_data))

    print(f"\n테스트 진행 중... (총 {total}개 샘플)")

    # 오답 기록
    errors = []

    for i in range(total):
        sample = test_data[i]
        text = sample['text']
        true_기관 = sample['기관']
        true_문서유형 = sample['문서유형']

        result = predictor.predict(text, return_probs=True)

        # 정답 체크
        기관_correct = result['기관'] == true_기관
        문서유형_correct = result['문서유형'] == true_문서유형

        if 기관_correct:
            correct_기관 += 1
        if 문서유형_correct:
            correct_문서유형 += 1

        # 오답만 기록
        if not 기관_correct or not 문서유형_correct:
            errors.append({
                'index': i + 1,
                'text_preview': text[:100].strip(),
                'true_기관': true_기관,
                'pred_기관': result['기관'],
                'correct_기관': 기관_correct,
                'true_문서유형': true_문서유형,
                'pred_문서유형': result['문서유형'],
                'correct_문서유형': 문서유형_correct,
                'probs': result.get('probabilities', {})
            })

        # 진행상황 표시 (10개마다)
        if (i + 1) % 10 == 0:
            print(f"  진행: {i + 1}/{total}...")

    # 정확도 출력
    print(f"\n" + "=" * 70)
    print(f"테스트 결과 (총 {total}개 샘플)")
    print("=" * 70)
    print(f"기관 정확도: {correct_기관}/{total} ({correct_기관/total*100:.1f}%)")
    print(f"문서유형 정확도: {correct_문서유형}/{total} ({correct_문서유형/total*100:.1f}%)")
    print(f"평균 정확도: {(correct_기관 + correct_문서유형)/(total*2)*100:.1f}%")

    # 오답 상세 출력
    if errors:
        print(f"\n" + "=" * 70)
        print(f"오답 상세 분석 (총 {len(errors)}개)")
        print("=" * 70)

        for err in errors[:10]:  # 처음 10개 오답만 상세 출력
            print(f"\n[오답 #{err['index']}]")
            print(f"Text preview: {err['text_preview']}...")

            if not err['correct_기관']:
                print(f"\n❌ 기관:")
                print(f"  정답: {err['true_기관']}")
                print(f"  예측: {err['pred_기관']}")
                if '기관' in err['probs']:
                    print(f"  확률 분포:")
                    for label, prob in list(err['probs']['기관'].items())[:3]:
                        marker = "★" if label == err['true_기관'] else " "
                        print(f"    {marker} {label}: {prob:.4f}")
            else:
                print(f"\n✓ 기관: {err['true_기관']}")

            if not err['correct_문서유형']:
                print(f"\n❌ 문서유형:")
                print(f"  정답: {err['true_문서유형']}")
                print(f"  예측: {err['pred_문서유형']}")
                if '문서유형' in err['probs']:
                    print(f"  확률 분포:")
                    for label, prob in list(err['probs']['문서유형'].items())[:3]:
                        marker = "★" if label == err['true_문서유형'] else " "
                        print(f"    {marker} {label}: {prob:.4f}")
            else:
                print(f"\n✓ 문서유형: {err['true_문서유형']}")

            print("\n" + "-" * 70)

        if len(errors) > 10:
            print(f"\n... 외 {len(errors) - 10}개 오답 (생략)")

    print("\n✓ 테스트 완료!")


if __name__ == "__main__":
    main()
