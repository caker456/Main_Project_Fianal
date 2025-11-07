-- PROCESSING_LOG 테이블에 message 컬럼 추가

-- message 컬럼 추가 (없으면)
ALTER TABLE processing_log
ADD COLUMN IF NOT EXISTS message TEXT;

-- 기존 레코드의 message를 기본값으로 업데이트 (NULL인 경우)
UPDATE processing_log
SET message = '처리 완료'
WHERE message IS NULL;

-- 이제 NOT NULL 제약조건 추가
ALTER TABLE processing_log
ALTER COLUMN message SET NOT NULL;

-- 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'processing_log'
ORDER BY ordinal_position;
