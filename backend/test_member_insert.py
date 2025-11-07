# 테스트용으로 나중에는 삭제

from passlib.context import CryptContext
from db_conn import PostgresDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def safe_bcrypt_hash(plain_password: str, max_bytes=72) -> str:
    encoded = plain_password.encode('utf-8')
    if len(encoded) > max_bytes:
        encoded = encoded[:max_bytes]
        while True:
            try:
                plain_password = encoded.decode('utf-8')
                break
            except UnicodeDecodeError:
                encoded = encoded[:-1]
    hashed = pwd_context.hash(plain_password)
    print(f"[DEBUG] Password (truncated safely to {max_bytes} bytes): '{plain_password}'")
    print(f"[DEBUG] Hashed password length: {len(hashed)}")
    return hashed


def insert_dummy_user(db: PostgresDB, user_id: str, plain_password: str,
                      user_role='R1', member_grade='G2', name='홍길동'):
    hashed_password = safe_bcrypt_hash(plain_password)

    conn = db.get_conn()
    cursor = conn.cursor()
    try:
        # member_id는 자동 생성됨 (IDENTITY)
        cursor.execute("""
            INSERT INTO member_info 
            (id, password, name, phone, email, member_role, member_grade)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING member_id
        """, (
            user_id, hashed_password, name,
            "010-0000-0000", f"{user_id}@example.com",
            user_role, member_grade
        ))

        member_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO member_log 
            (member_id, create_date, update_date, date_of_connection, access_count)
            VALUES (%s, CURRENT_TIMESTAMP, NULL, NULL, 0)
        """, (member_id,))

        conn.commit()
        print(f"✅ User '{user_id}' inserted successfully with member_id={member_id}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting user '{user_id}':", e)

    finally:
        cursor.close()
        db.release_conn(conn)


if __name__ == "__main__":
    db = PostgresDB()
    insert_dummy_user(db, "aaaa", "1234", user_role="R2", member_grade="G2", name="홍길동")
    insert_dummy_user(db, "bbbb", "1234", user_role="R2", member_grade="G2", name="김철수")
    db.close_all()
