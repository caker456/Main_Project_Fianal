# 카테고리 분류 시스템 구현 요약

## 개요
문서 관리 시스템에 Gemma3 기반 자동 카테고리 생성과 BERT 기반 문서 분류 기능을 구현했습니다.

## 구현된 기능

### 1. 자동 생성 (Gemma3)
**경로:** `POST /api/category/auto-generate`

**기능:**
- Ollama의 Gemma3 모델을 사용하여 OCR 완료된 문서들로부터 카테고리 구조 자동 생성
- 사용자가 선택한 계층 깊이(1-4단계)에 맞춰 카테고리 구조 생성
- 생성된 카테고리에 각 문서 자동 배치

**요청 형식:**
```json
{
  "files": ["파일경로1", "파일경로2", ...],
  "level": 2  // 1-4 단계
}
```

**응답 형식:**
```json
{
  "success": true,
  "categories": {
    "재무보고서": {
      "분기별": ["2024 Q1", "2024 Q2"],
      "연간": ["2023", "2024"]
    }
  },
  "classified_documents": {
    "doc_id": {
      "file_path": "...",
      "category": "재무보고서",
      "subcategory": "분기별",
      "detail": "2024 Q1"
    }
  },
  "total_files": 10
}
```

**주요 구현 내용:**
- routes.py:1360-1496 - Gemma3 API 통합
- Ollama API 호출 (`http://localhost:11434/api/generate`)
- JSON 응답 파싱 (마크다운 코드 블록 또는 순수 JSON 지원)
- 연결 실패 시 기본 카테고리 구조로 폴백
- DB에 분류 결과 저장

---

### 2. 수동 생성 - 새 카테고리 (BERT 학습)
**경로:** `POST /api/category/train`

**기능:**
- 사용자가 정의한 카테고리와 샘플 문서로 BERT 모델 파인튜닝
- 학습된 모델 저장 및 메타데이터 생성
- 한국어 BERT 모델 (klue/bert-base) 사용

**요청 형식:**
```json
{
  "categories": {
    "카테고리1": ["doc_id1", "doc_id2"],
    "카테고리2": ["doc_id3", "doc_id4"]
  }
}
```

**응답 형식:**
```json
{
  "success": true,
  "model_path": "models/bert_custom_1730876543",
  "training_time": 45.32,
  "total_samples": 20,
  "train_samples": 16,
  "val_samples": 4,
  "categories": ["카테고리1", "카테고리2"],
  "num_categories": 2
}
```

**주요 구현 내용:**
- routes.py:1503-1837 - BERT 학습 로직
- transformers 라이브러리 사용
- 80/20 train/validation 분할
- 학습 설정:
  - Epochs: 3
  - Batch size: 8
  - Learning rate: warmup 100 steps
  - Weight decay: 0.01
- 레이블 매핑 및 메타데이터 JSON 저장
- 필수 라이브러리 체크 및 에러 처리

---

### 3. 커스텀 모델로 문서 분류
**경로:** `POST /api/category/classify-with-custom-model`

**기능:**
- 학습된 커스텀 BERT 모델로 문서 분류
- 여러 파일 배치 처리
- 신뢰도 점수 제공

**요청 형식:**
```json
{
  "model_path": "models/bert_custom_1730876543",
  "files": ["파일경로1", "파일경로2", ...]
}
```

**응답 형식:**
```json
{
  "success": true,
  "results": [
    {
      "doc_id": 123,
      "file_path": "upload/user/doc.pdf",
      "category": "카테고리1",
      "confidence": 0.95,
      "keyword_id": 456,
      "success": true
    }
  ],
  "total_files": 10,
  "classified_files": 10
}
```

**주요 구현 내용:**
- routes.py:1844-2029 - 커스텀 모델 분류
- 모델 및 토크나이저 로드
- 레이블 매핑 로드
- OCR 텍스트 조회 및 분류 수행
- DB에 분류 결과 저장
- document_keywords 테이블 활용

---

### 4. 수동 생성 - 기존 카테고리 (기존 BERT 사용)
**경로:** `POST /api/classify/document` (개선됨)

**기능:**
- 기존 학습된 2-Task BERT 모델로 문서 분류
- 기관(institution)과 문서유형(document type) 예측
- file_path 파라미터 지원 추가

**요청 형식:**
```
FormData:
- doc_id (optional): 문서 ID
- file_path (optional): 파일 경로
```

**응답 형식:**
```json
{
  "success": true,
  "doc_id": 123,
  "keyword_id": 456,
  "기관": "의사국 의안과",
  "문서유형": "의안원문",
  "confidence": {
    "기관": 0.95,
    "문서유형": 0.98
  },
  "processing_time": 0.52
}
```

**주요 구현 내용:**
- routes.py:756-892 - file_path 지원 추가
- 경로 정규화 및 doc_id 조회
- classification_service 사용
- 기존 2-Task BERT 모델 활용

---

## 프론트엔드 통합

### CategoryCreationProgress.tsx
**파일:** `front/src/components/CategoryCreationProgress.tsx`

**구현된 흐름:**

1. **자동 생성 (creationType='auto')**
   - Gemma3 API 호출
   - 카테고리 구조 생성 및 문서 배치
   - 진행률 표시

2. **수동 - 새 카테고리 (manualType='new')**
   - BERT 학습 API 호출 (TODO: categoryStructure prop 필요)
   - 커스텀 모델로 분류 API 호출
   - 현재는 시뮬레이션으로 동작

3. **수동 - 기존 카테고리 (manualType='existing')**
   - 각 파일별로 BERT 분류 API 호출
   - 2-Task BERT 모델 사용
   - 완전히 구현됨

**TODO 항목:**
```typescript
// 수동-새카테고리 플로우를 위해 추가 필요한 props:
categoryStructure?: { [category: string]: string[] }; // 카테고리명 -> 샘플 doc_ids
existingModelPath?: string; // 커스텀 모델 경로
```

---

## 필수 의존성

### Python (Backend)
```bash
pip install transformers torch scikit-learn requests
```

### Ollama (Gemma3용)
```bash
# Ollama 설치 및 Gemma3 모델 다운로드
ollama pull gemma2:3b

# Ollama 서버 실행
ollama serve  # http://localhost:11434
```

---

## 데이터베이스 연동

### 사용 테이블

1. **pdf_documents**
   - 문서 정보 저장
   - `ocr` 컬럼: OCR 완료 여부
   - `status` 컬럼: 문서 상태 (CLASSIFIED 등)

2. **ocr_results**
   - OCR 추출 텍스트 저장
   - `full_text` 컬럼: 분류에 사용

3. **document_keywords**
   - 분류 결과 저장
   - `keywords`: JSON 형식 분류 정보
   - `main_topic`: 주요 카테고리
   - `model_name`: 사용된 모델명

---

## 에러 처리

### Gemma3 API
- **연결 실패**: 기본 "일반문서" 카테고리로 폴백
- **JSON 파싱 실패**: "자동분류" 카테고리로 폴백
- **일반 오류**: "미분류" 카테고리로 폴백

### BERT 학습
- **라이브러리 없음**: ImportError 반환 및 설치 안내
- **학습 실패**: Exception 상세 정보 반환

### 커스텀 모델 분류
- **모델 없음**: 모델 경로 오류 반환
- **파일 없음**: 개별 파일 건너뛰고 계속 진행
- **OCR 텍스트 없음**: 개별 파일 건너뛰고 계속 진행

---

## 사용 예시

### 1. Gemma3로 자동 카테고리 생성
```bash
curl -X POST http://localhost:8000/api/category/auto-generate \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["upload/user/doc1.pdf", "upload/user/doc2.pdf"],
    "level": 3
  }'
```

### 2. BERT 모델 학습
```bash
curl -X POST http://localhost:8000/api/category/train \
  -H "Content-Type: application/json" \
  -d '{
    "categories": {
      "계약서": [1, 2, 3],
      "청구서": [4, 5, 6]
    }
  }'
```

### 3. 커스텀 모델로 분류
```bash
curl -X POST http://localhost:8000/api/category/classify-with-custom-model \
  -H "Content-Type: application/json" \
  -d '{
    "model_path": "models/bert_custom_1730876543",
    "files": ["upload/user/doc3.pdf", "upload/user/doc4.pdf"]
  }'
```

### 4. 기존 모델로 분류
```bash
curl -X POST http://localhost:8000/api/classify/document \
  -F "file_path=upload/user/doc1.pdf"
```

---

## 파일 구조

```
backend/
├── routes.py (주요 API 엔드포인트)
│   ├── /api/category/auto-generate (1360-1496)
│   ├── /api/category/train (1503-1837)
│   ├── /api/category/classify-with-custom-model (1844-2029)
│   └── /api/classify/document (756-892, 개선됨)
├── classification_service.py (2-Task BERT 서비스)
└── models/ (학습된 모델 저장 디렉토리)
    └── bert_custom_*/

front/
└── src/components/
    ├── CategoryCreationProgress.tsx (진행 화면)
    └── CategoryClassification.tsx (메인 플로우)
```

---

## 다음 단계 (TODO)

1. **수동-새카테고리 플로우 완성**
   - CategoryClassification.tsx에서 카테고리 구조 정의 UI 추가
   - 샘플 문서 선택 UI 추가
   - CategoryCreationProgress에 categoryStructure prop 전달

2. **커스텀 모델 관리**
   - 학습된 모델 목록 조회 API
   - 모델 삭제/이름변경 기능
   - 모델 성능 메트릭 표시

3. **테스트**
   - Ollama 서버 연동 테스트
   - BERT 학습 및 분류 통합 테스트
   - 에러 케이스 처리 검증

4. **최적화**
   - BERT 배치 분류 (현재는 파일별 순차 처리)
   - 모델 캐싱 (매 요청마다 로드하지 않도록)
   - Gemma3 프롬프트 최적화

---

## 참고사항

- **Gemma3 모델**: `gemma2:3b` 사용 (경량화 버전)
- **BERT 모델**: `klue/bert-base` (한국어 최적화)
- **GPU 지원**: torch.cuda 자동 감지
- **타임아웃**: Ollama API 120초, BERT 학습은 무제한
- **파일 경로**: 상대경로/절대경로 모두 지원, 자동 정규화

---

## 문의 및 지원

구현 관련 질문이나 문제가 있으면 이슈를 등록해주세요.
