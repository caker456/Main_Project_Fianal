-- 폴더 정보를 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS folders (
    folder_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id       INTEGER NOT NULL,
    folder_name     VARCHAR(255) NOT NULL,
    folder_path     VARCHAR(500) NOT NULL,  -- 전체 경로
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_folder_member
        FOREIGN KEY (member_id) REFERENCES member_info(member_id) ON DELETE CASCADE,
    CONSTRAINT unique_folder_path
        UNIQUE (member_id, folder_path)
);

-- 인덱스 생성
CREATE INDEX idx_folders_member_id ON folders(member_id);
CREATE INDEX idx_folders_path ON folders(folder_path);
