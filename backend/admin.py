# admin.py
from typing import List
from psycopg2.extras import RealDictCursor
from db_conn import PostgresDB

# DB 인스턴스 생성
db = PostgresDB()

def get_all_members(skip: int = 0, limit: int = 50) -> List[dict]:
    query = """
        SELECT member_id, id, name, phone, email, member_grade
        FROM member_info
        ORDER BY member_id
        OFFSET %s LIMIT %s
    """
    
    conn = db.get_conn()  # 인스턴스로 호출
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (skip, limit))
            members = cur.fetchall()
            return members
    finally:
        db.release_conn(conn)  # 인스턴스로 호출
