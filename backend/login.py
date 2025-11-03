# login.py
import time
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor
from db_conn import PostgresDB
from member import get_member_by_id

# ✅ 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ DB 커넥션 풀
db = PostgresDB()


def login_member(user_id: str, password: str, session: dict):
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

        # ✅ 기존 세션 초기화
        session.clear()

        # ✅ 새 세션 저장
        session["user"] = {
            "member_id": int(row["member_id"]),
            "member_role": row["member_role"],
        }
        session["expiry"] = float(time.time() + 60*60)  # 60분 후 만료

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


# 세션에 로그인 정보가 있는지 확인
def get_current_user(session: dict):
    user = session.get("user")
    expiry = session.get("expiry")

    if not user:
        return {"error": "Not logged in"}

    try:
        expiry_time = float(expiry)
    except (TypeError, ValueError):
        session.clear()
        return {"error": "Invalid session expiry"}

    if time.time() > expiry_time:
        session.clear()
        return {"error": "Session expired"}

    return user

# 세션의 남은 시간 확인용
def get_session_remaining_info(session: dict):
    expiry = session.get("expiry")

    if not expiry:
        return {"remaining": 0, "message": "Not logged in"}

    try:
        remaining = float(expiry) - time.time()
    except (TypeError, ValueError):
        session.clear()
        return {"remaining": 0, "message": "Invalid session expiry"}

    if remaining < 1:
        session.clear()
        return {"remaining": 0, "message": "Session expired"}

    return {"remaining": int(remaining), "message": "Session active"}

# member_id와 role 세션에서 반환하는 함수
# login.py (추가)

def get_current_user_with_details(session: dict):
    """
    세션에 로그인한 사용자의 member_id와 name, role_name 반환
    기존 get_current_user를 안전하게 확장
    """
    user = session.get("user")
    expiry = session.get("expiry")

    if not user:
        return {"error": "Not logged in"}

    try:
        expiry_time = float(expiry)
    except (TypeError, ValueError):
        session.clear()
        return {"error": "Invalid session expiry"}

    if time.time() > expiry_time:
        session.clear()
        return {"error": "Session expired"}

    # DB에서 회원 정보 조회 (name, role_name)
    member_id = user.get("member_id")
    if not member_id:
        return {"error": "Invalid session user info"}

    conn = db.get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT mi.member_id, mi.name, mr.member_role_name
                FROM member_info mi
                LEFT JOIN member_roles mr ON mi.member_role = mr.member_role
                WHERE mi.member_id = %s
                """,
                (member_id,),
            )
            row = cur.fetchone()
            if not row:
                return {"error": "Member not found"}
            return {
                "member_id": row["member_id"],
                "name": row["name"],
                "role_name": row["member_role_name"],
            }
    finally:
        db.release_conn(conn)

