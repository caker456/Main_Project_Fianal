from db_conn import PostgresDB


# 전역 DB 인스턴스
db = PostgresDB()

def init_db():
    conn = db.get_conn()
    cur = conn.cursor()

    create_table_query = """
        CREATE TABLE IF NOT EXISTS pdf_documents(
            doc_id BIGSERIAL PRIMARY KEY, -- 또는
            -- doc_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            filename VARCHAR(255),
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_size NUMERIC,
            page_count NUMERIC,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            member_id NUMERIC
        );
        """

    cur.execute(create_table_query)
    conn.commit()
    cur.close()
    db.release_conn(conn)
    print("✅ pdf_documents 테이블 생성 완료 (새 구조)")
