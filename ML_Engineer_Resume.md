# ML Engineer 이력서

## 📋 프로젝트 경험

### OCR 기반 문서 자동 분류 시스템
**기간:** 2024.09 - 2024.11
**역할:** ML Engineer
**기술 스택:** Python, PaddleOCR, BERT, PyTorch, Transformers, FastAPI, PostgreSQL

---

## 🎯 주요 성과

### 1. 문서 OCR 처리 파이프라인 구축
- **PaddleOCR-VL 엔진** 통합 및 GPU 최적화
  - PDF 문서를 페이지별로 이미지 변환 후 텍스트 추출
  - GPU 메모리 최적화: DPI 조정 및 배치 처리로 처리 속도 향상
  - 한글/영문 혼합 문서에서 평균 **95% 이상의 텍스트 추출 정확도** 달성

- **OCR 서비스 아키텍처 설계**
  ```python
  - PDF → Image 변환 (pdf2image)
  - PaddleOCR 텍스트 추출 (페이지별)
  - 후처리 및 DB 저장 (PostgreSQL)
  - 처리 시간 메트릭 수집
  ```

### 2. 2-Task BERT 문서 분류 모델 개발 및 배포
- **Multi-Label Classification 모델 설계**
  - Task 1 (기관 분류): 8개 카테고리 (의사국, 정무위원회 등)
  - Task 2 (문서유형 분류): 7개 카테고리 (의안원문, 심사보고서 등)
  - **평균 정확도 92%**, 신뢰도 기반 재검토 시스템 구현

- **BERT 기반 Multi-Task Learning 구현**
  ```python
  - 사전학습 모델: KoBERT / KoELECTRA
  - 멀티헤드 분류기: 기관 분류 + 문서유형 분류
  - Loss Function: Weighted Cross Entropy
  - 데이터 증강: Back-translation, Synonym replacement
  ```

- **모델 성능 최적화**
  - Hyperparameter Tuning: Learning Rate Scheduler, Gradient Clipping
  - 불균형 데이터 처리: Class Weighting, Focal Loss 적용
  - 추론 시간 단축: ONNX 변환 및 배치 추론 (50% 속도 향상)

### 3. ML 모델 서빙 및 프로덕션 배포
- **FastAPI 기반 ML 모델 서빙**
  ```python
  - RESTful API 설계 (/api/classify/document)
  - 비동기 처리 (async/await)
  - 신뢰도 점수 반환 (Confidence Score)
  - 에러 핸들링 및 로깅
  ```

- **실시간 분류 파이프라인**
  - OCR 완료 → 자동 분류 트리거
  - 신뢰도 70% 미만 시 재검토 플래그 자동 설정
  - 분류 결과 및 확률 분포 DB 저장

- **모델 버전 관리 및 배포**
  - 모델 체크포인트 관리 (model.pt, config.json, vocab.txt)
  - Label Mapping 관리 (label_mappings.json)
  - 모델 Hot-reload 지원 (무중단 업데이트)

### 4. 데이터 파이프라인 및 자동화
- **OCR 결과 후처리 파이프라인**
  - 노이즈 제거 (특수문자, 공백 정규화)
  - 페이지별 텍스트 병합 및 구조화
  - DB 스키마 설계 (ocr_results 테이블)

- **분류 결과 데이터 관리**
  - 분류 이력 추적 (classification_history)
  - 신뢰도 메트릭 수집 및 분석
  - 재학습용 데이터 자동 수집 (Low confidence samples)

### 5. 성능 모니터링 및 개선
- **ML 모델 성능 메트릭 대시보드**
  - 실시간 분류 정확도 추적
  - 신뢰도 분포 시각화
  - 카테고리별 성능 분석

- **모델 재학습 프로세스 구축**
  - 신뢰도 낮은 샘플 자동 수집
  - 사용자 피드백 반영 (재분류 데이터)
  - 주기적 Fine-tuning (Incremental Learning)

---

## 💡 기술적 도전 및 해결

### 1. GPU 메모리 최적화
**문제:** PaddleOCR 처리 시 GPU OOM 발생
**해결:**
- PDF DPI 조정 (300 → 100)
- 배치 처리 및 메모리 해제
- Mixed Precision Training (FP16)

### 2. 불균형 데이터 처리
**문제:** 특정 카테고리 데이터 부족 (10:1 불균형)
**해결:**
- Focal Loss 적용
- SMOTE 기반 데이터 증강
- Class Weight 조정

### 3. 한글 OCR 정확도 개선
**문제:** 복잡한 문서 레이아웃에서 낮은 OCR 정확도
**해결:**
- PaddleOCR-VL 모델로 업그레이드 (다국어 지원)
- 이미지 전처리 (Deskew, Denoising)
- 테이블/그래프 영역 별도 처리

### 4. 실시간 추론 성능 최적화
**문제:** BERT 추론 시간 과다 (문서당 2-3초)
**해결:**
- ONNX Runtime 적용 (50% 속도 향상)
- 배치 추론 (최대 32개 동시 처리)
- 모델 양자화 (INT8 Quantization)

---

## 🛠️ 기술 스택

### Machine Learning
- **Framework:** PyTorch, Transformers (Hugging Face)
- **Models:** BERT, KoBERT, PaddleOCR-VL
- **Libraries:** scikit-learn, numpy, pandas

### Deep Learning 최적화
- **Optimization:** ONNX Runtime, TensorRT
- **Training:** Mixed Precision (FP16), Gradient Accumulation
- **Data Processing:** Albumentations, pdf2image, Pillow

### Backend & Database
- **Framework:** FastAPI, Uvicorn
- **Database:** PostgreSQL, SQLAlchemy
- **Async Processing:** asyncio, concurrent.futures

### DevOps & Tools
- **Version Control:** Git
- **Environment:** conda, venv, Docker
- **Monitoring:** Python logging, TensorBoard

---

## 📊 정량적 성과

| 메트릭 | 성과 |
|--------|------|
| OCR 정확도 | 95%+ |
| 분류 정확도 | 92% (2-Task 평균) |
| 추론 속도 향상 | 50% (ONNX 적용) |
| GPU 메모리 절감 | 40% (최적화 후) |
| 처리량 | 100+ 문서/분 |
| 재검토 비율 | 12% (신뢰도 70% 미만) |

---

## 🎓 핵심 역량

### ML Engineering
- ✅ End-to-End ML 파이프라인 구축 (데이터 → 학습 → 배포)
- ✅ 프로덕션 환경에서의 모델 서빙 및 최적화
- ✅ Multi-Task Learning 모델 설계 및 학습
- ✅ 불균형 데이터 처리 및 성능 개선

### 문서 처리 전문성
- ✅ OCR 엔진 통합 및 성능 튜닝
- ✅ 텍스트 전처리 및 특징 추출
- ✅ 문서 분류 모델 개발 및 배포

### 시스템 설계 및 최적화
- ✅ ML 모델 서빙 아키텍처 설계
- ✅ GPU 리소스 최적화
- ✅ 실시간 추론 성능 최적화
- ✅ 데이터베이스 스키마 설계 및 쿼리 최적화

---

## 📚 학습 및 개선 경험

### 문제 해결 사례
1. **OCR 정확도 개선**
   - 초기: 78% → 개선 후: 95%+
   - 방법: 모델 업그레이드 + 이미지 전처리

2. **분류 모델 성능 향상**
   - 초기: 85% → 개선 후: 92%
   - 방법: Multi-Task Learning + Data Augmentation

3. **추론 속도 최적화**
   - 초기: 2.5초/문서 → 개선 후: 1.2초/문서
   - 방법: ONNX 변환 + 배치 처리

### 지속적 개선
- 사용자 피드백 기반 모델 재학습 파이프라인 구축
- A/B 테스트를 통한 모델 성능 비교
- 메트릭 기반 자동 알림 시스템

---

## 🔗 프로젝트 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    사용자 업로드                          │
│                    (PDF 문서)                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              OCR 처리 (PaddleOCR-VL)                     │
│  - PDF → Image 변환                                      │
│  - 페이지별 텍스트 추출                                    │
│  - 후처리 및 DB 저장                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│          자동 분류 (2-Task BERT)                         │
│  Task 1: 기관 분류 (8 classes)                          │
│  Task 2: 문서유형 분류 (7 classes)                       │
│  - 신뢰도 계산 및 평가                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                결과 저장 및 표시                          │
│  - 분류 결과 DB 저장                                      │
│  - 신뢰도 기반 재검토 플래그                               │
│  - 사용자 대시보드 표시                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 💼 협업 및 커뮤니케이션

- 프론트엔드 팀과 협업하여 ML 모델 결과 시각화
- 백엔드 팀과 API 인터페이스 설계 및 통합
- 성능 메트릭 공유 및 개선 방향 논의
- 기술 문서 작성 및 지식 공유 (SETUP_GUIDE.md)

---

## 🎯 향후 개선 계획

1. **모델 성능 향상**
   - Transformer 기반 최신 모델 적용 (GPT, T5)
   - Few-shot Learning 도입 (적은 데이터로 새 카테고리 학습)

2. **시스템 확장성**
   - 분산 처리 시스템 구축 (Celery, RabbitMQ)
   - 모델 A/B 테스트 자동화

3. **사용자 경험 개선**
   - 실시간 피드백 반영 (Active Learning)
   - 설명 가능한 AI (Attention Visualization)
