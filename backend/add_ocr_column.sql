-- PDF_DOCUMENTS 테이블에 OCR 완료 여부 컬럼 추가

-- OCR 완료 여부를 나타내는 컬럼 추가
ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS ocr BOOLEAN DEFAULT FALSE;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_pdf_ocr ON pdf_documents(ocr);

-- 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pdf_documents' AND column_name = 'ocr';
