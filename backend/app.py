from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from routes import router

app = FastAPI(title="File Upload API")

# ✅ 세션 설정
app.add_middleware(
    SessionMiddleware,
    secret_key="your_super_secret_key",  # 실제 환경에서는 환경변수로 관리
    max_age=3600,          # 🔹 세션 유지 시간 (초 단위) → 1시간 후 자동 로그아웃
    same_site="lax",
    https_only=False,      # 🔹 HTTPS 사용 시 True로 변경
)

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite 기본 포트
    allow_credentials=True,  # 자격 증명 허용
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(router)


# ✅ 메인 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
