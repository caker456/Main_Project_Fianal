# login.py
from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor
from db_conn import PostgresDB
from member import get_member_by_id

# ✅ 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ DB 커넥션 풀
db = PostgresDB()


def login_member(user_id: str, password: str, session: dict):
    """
    로그인 처리
    session: 라우터에서 전달되는 세션(dict)
    """
    conn = db.get_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT member_id, id, password, name, member_role, member_grade
            FROM member_info
            WHERE id = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()

        if not row or not pwd_context.verify(password, row["password"]):
            return {"error": "아이디나 패스워드가 유효하지 않습니다."}

        # 세션 저장
        session["user"] = {
            "member_id": int(row["member_id"]),
            "id": row["id"],
            "name": row["name"],
            "member_role": row["member_role"],
            "member_grade": row["member_grade"],
        }

        # member_log 업데이트
        cursor.execute(
            """
            INSERT INTO member_log (member_id, create_date, date_of_connection, access_count)
            VALUES (%s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
            ON CONFLICT (member_id)
            DO UPDATE SET 
                date_of_connection = CURRENT_TIMESTAMP,
                access_count = member_log.access_count + 1,
                update_date = CURRENT_TIMESTAMP
            """,
            (row["member_id"],),
        )
        conn.commit()

        return {"message": f"Welcome {row['name']}", "user": session["user"]}

    finally:
        cursor.close()
        db.release_conn(conn)


def logout_member(session: dict):
    """
    로그아웃 처리
    """
    session.clear()
    return {"message": "Logged out successfully"}


def get_current_user(session: dict):
    user = session.get("user")
    if not user:
        return {"error": "Not logged in"}
    # DB에서 실제 회원 정보 조회
    member = get_member_by_id(user["id"])
    if not member:
        return {"error": "Member not found"}
    return member
