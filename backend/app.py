from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from db_conn import PostgresDB
from starlette.middleware.sessions import SessionMiddleware
app = FastAPI(title="File Upload API")

# ✅ CORS 설정
app.add_middleware(SessionMiddleware,secret_key="your_super_secret_key",)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite 기본 포트
    allow_credentials=True,  # 자격 증명 허용
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB 초기화
PostgresDB()

# ✅ 라우터 등록
app.include_router(router)



# ✅ 메인 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
