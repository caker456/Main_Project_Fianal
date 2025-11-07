-- 작업 이력 테이블 생성
CREATE TABLE IF NOT EXISTS processing_log (
    log_id SERIAL PRIMARY KEY,
    doc_id INTEGER,
    filename VARCHAR(500),
    process_type VARCHAR(50) NOT NULL,  -- 'OCR', 'CLASSIFICATION', 'UPLOAD'
    status VARCHAR(50) NOT NULL,        -- 'SUCCESS', 'FAILED'
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doc_id) REFERENCES pdf_documents(doc_id) ON DELETE CASCADE
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_processing_log_created_at ON processing_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_log_doc_id ON processing_log(doc_id);
CREATE INDEX IF NOT EXISTS idx_processing_log_process_type ON processing_log(process_type);

-- 확인
SELECT * FROM processing_log ORDER BY created_at DESC LIMIT 10;
