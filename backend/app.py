from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.router_m import router
from db import init_db

app = FastAPI(title="File Upload API")

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite 기본 포트
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB 초기화
init_db()

# ✅ 라우터 등록
app.include_router(router, prefix="/api", tags=["Files"])

# ✅ 메인 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
