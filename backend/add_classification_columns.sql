-- PDF_DOCUMENTS 테이블에 분류 정보 컬럼 추가

-- 분류 정보를 저장하는 컬럼들 추가
ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS agency VARCHAR(200);

ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS document_type VARCHAR(200);

ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS confidence_agency FLOAT;

ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS confidence_document_type FLOAT;

ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS is_classified BOOLEAN DEFAULT FALSE;

ALTER TABLE pdf_documents
ADD COLUMN IF NOT EXISTS classified_date TIMESTAMP;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_pdf_classified ON pdf_documents(is_classified);
CREATE INDEX IF NOT EXISTS idx_pdf_agency ON pdf_documents(agency);
CREATE INDEX IF NOT EXISTS idx_pdf_document_type ON pdf_documents(document_type);

-- 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pdf_documents'
  AND column_name IN ('agency', 'document_type', 'confidence_agency', 'confidence_document_type', 'is_classified', 'classified_date')
ORDER BY ordinal_position;
