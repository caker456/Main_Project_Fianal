# 문제 해결 가이드

## 현재 문제

### 1. BERT 분류가 "Unknown" 반환 (신뢰도 0%)

**증상:**
```
✅ 분류 완료 - 처리 시간: 0.00초
   기관: Unknown (신뢰도: 0.00%)
   문서유형: Unknown (신뢰도: 0.00%)
```

**원인:**
- classification_service가 "Model not available" 반환
- BERT 모델이 로드되지 않음

**해결 방법:**

#### A. 서버 시작 로그 확인
서버 시작 시 다음 로그가 나와야 합니다:
```
Loading tokenizer from twotask_bert_model...
Loading 2-Task model from twotask_bert_model...
✓ 2-Task Model loaded successfully on cuda/cpu
  Tasks: 기관 (XX labels), 문서유형 (XX labels)
```

만약 이 로그가 없다면:
```
⚠️ Classification service not available: [에러 메시지]
```

#### B. 모델 파일 확인
```bash
cd backend
dir twotask_bert_model
```

필수 파일:
- model.pt ✓
- config.json ✓
- label_mappings.json ✓
- tokenizer 관련 파일들 ✓

#### C. Python 환경 확인
```bash
cd backend
python -c "from classification_service import classification_service; print(classification_service.model)"
```

None이 나오면 모델 로딩 실패.

#### D. 직접 테스트
```python
from classification_service import classification_service

result = classification_service.predict("테스트 텍스트입니다", return_probs=True)
print(result)
```

### 2. Gemma3 Ollama 404 오류

**증상:**
```
⚠️  Gemma3 처리 중 오류: Ollama API 오류: 404. 기본 구조 사용
```

**원인:**
- Ollama가 실행되지 않음
- Gemma3 모델이 설치되지 않음

**해결 방법:**

#### A. Ollama 설치 확인
```bash
ollama --version
```

#### B. Ollama 실행
```bash
ollama serve
```

다른 터미널에서:
```bash
# Gemma3 모델 다운로드
ollama pull gemma2:3b

# 모델 목록 확인
ollama list
```

#### C. Ollama API 테스트
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "gemma2:3b",
  "prompt": "안녕하세요",
  "stream": false
}'
```

#### D. 대안 (Ollama 없이 사용)
Ollama 없이도 시스템이 작동하도록 설계되어 있습니다.
- 자동 생성 실패 시 → "일반문서" 카테고리로 폴백
- 수동 생성 사용 (manual-new, manual-existing)

### 3. OCR 텍스트가 너무 짧음

**증상:**
```
✅ OCR 결과 발견 - ocr_id=19, 텍스트 길이: 237 자
```

**원인:**
- PDF에서 텍스트 추출이 제대로 되지 않음
- 이미지 기반 PDF일 가능성

**해결 방법:**

#### A. OCR 결과 확인
```sql
SELECT doc_id, LENGTH(full_text), LEFT(full_text, 200)
FROM ocr_results
WHERE doc_id = 445;
```

#### B. OCR 재처리
문서 관리 화면에서 해당 파일의 OCR을 다시 실행

## 빠른 해결 체크리스트

### BERT 분류 문제
- [ ] 서버 재시작 후 BERT 로딩 로그 확인
- [ ] `twotask_bert_model/model.pt` 파일 존재 확인
- [ ] Python 환경에서 직접 import 테스트
- [ ] 필요시 모델 재학습

### Gemma3 문제
- [ ] `ollama serve` 실행
- [ ] `ollama pull gemma2:3b` 모델 다운로드
- [ ] `ollama list`로 모델 확인
- [ ] API 테스트: `curl http://localhost:11434/api/generate ...`

### OCR 문제
- [ ] OCR 결과 DB에서 확인
- [ ] 텍스트가 너무 짧으면 OCR 재처리
- [ ] PDF 파일 형식 확인 (이미지 vs 텍스트)

## 권장 테스트 순서

1. **BERT 모델 확인 (최우선)**
   ```bash
   cd backend
   python
   >>> from classification_service import classification_service
   >>> print(classification_service.model)
   >>> result = classification_service.predict("테스트")
   >>> print(result)
   ```

2. **서버 재시작 및 로그 확인**
   ```bash
   python app.py
   # 로그에서 "✓ 2-Task Model loaded successfully" 확인
   ```

3. **Ollama 설정 (선택)**
   ```bash
   ollama serve  # 별도 터미널
   ollama pull gemma2:3b  # 다른 터미널
   ```

4. **테스트**
   - 수동-기존 카테고리 분류 테스트 (BERT만 사용)
   - 수동-새 카테고리 생성 테스트 (BERT 학습)
   - 자동 생성 테스트 (Gemma3, 선택사항)

## 문의

문제가 계속되면 다음 정보를 제공해주세요:
1. 서버 시작 로그 전체
2. `classification_service.py` import 시 에러 메시지
3. Python 버전 및 설치된 패키지 목록 (`pip list`)
