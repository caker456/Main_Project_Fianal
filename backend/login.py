from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor
from db_conn import PostgresDB

app = FastAPI()

# ✅ 세션 미들웨어
app.add_middleware(SessionMiddleware, secret_key="your_super_secret_key")

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 주소에 맞게 수정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ DB 커넥션 풀
db = PostgresDB()


# ✅ 로그인 요청 모델
class LoginRequest(BaseModel):
    id: str
    password: str


# ✅ 로그인 엔드포인트
@app.post("/login")
def login(data: LoginRequest, request: Request):
    print(f"Login attempt for ID: {data.id}")

    conn = db.get_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 사용자 조회
        cursor.execute(
            """
            SELECT member_id, id, password, name, member_role, member_grade
            FROM member_info
            WHERE id = %s
            """,
            (data.id,),
        )
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        user_id = row["member_id"]
        user_login_id = row["id"]
        hashed_password = row["password"]
        name = row["name"]
        member_role = row["member_role"]
        member_grade = row["member_grade"]

        # 비밀번호 확인
        if not pwd_context.verify(data.password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # ✅ 세션에 로그인 정보 저장
        request.session["user"] = {
            "member_id": int(user_id),
            "id": user_login_id,
            "name": name,
            "member_role": member_role,
            "member_grade": member_grade,
        }

        # ✅ member_log 업데이트
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
            (user_id,),
        )
        conn.commit()

    finally:
        cursor.close()
        db.release_conn(conn)

    return {
        "message": f"Welcome {name}",
        "user": request.session["user"],
    }


# ✅ 로그아웃
@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}


# ✅ 현재 로그인 사용자 정보 조회
@app.get("/me")
def get_current_user(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return user
