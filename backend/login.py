# login.py
import time
import uuid
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor
from db_conn import PostgresDB
from session_tracker import add_session, remove_session  # WeakSet 관리 모듈
from fastapi import Request

# ✅ 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ DB 커넥션 풀
db = PostgresDB()


def login_member(user_id: str, password: str, session: dict, session_id: str = None):
    """
    로그인 처리
    session: FastAPI Request.session
    session_id: 세션 쿠키 값 (없으면 새로 생성)
    """
    conn = db.get_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 회원 정보 조회
        cursor.execute(
            """
            SELECT member_id, id, password, name, member_role, member_grade
            FROM member_info
            WHERE id = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()

        # 아이디/비밀번호 검증
        if not row or not pwd_context.verify(password, row["password"]):
            return {"error": "아이디나 패스워드가 유효하지 않습니다."}

        # 기존 세션 초기화
        if session_id:
            remove_session(session_id)  # 기존 서버 세션 삭제
        session.clear()

        # 새 세션 저장
        session["user"] = {
            "member_id": int(row["member_id"]),
            "member_role": row["member_role"],
        }
        session["expiry"] = float(time.time() + 60*60)  # 60분 후 만료

        # 새 session_id 없으면 생성
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # 서버 전체 세션 등록
        session_id = add_session(session, session_id)
        session["session_id"] = session_id

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

        return {"message": f"Welcome {row['name']}", "user": session["user"], "session_id": session_id}

    finally:
        cursor.close()
        db.release_conn(conn)


def logout_member(session: dict, session_id: str = None):
    """
    로그아웃 처리
    session_id가 있으면 서버 전체 세션에서도 제거
    """
    if session_id:
        remove_session(session_id)  # 서버 세션 삭제

    session.clear()  # 현재 브라우저 세션 초기화
    return {"message": "Logged out successfully"}


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


def get_current_user_with_details(session: dict):
    """
    세션에 로그인한 사용자의 member_id와 name, role_name 반환
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
