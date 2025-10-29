from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import io, zipfile, shutil, os

# ----------------- FastAPI 설정 -----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ⚠️ Vite 기본 포트 확인 (5173)
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- DB 설정 -----------------
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# ----------------- 모델 정의 -----------------
class FileDB(Base):
    __tablename__ = "upload_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    filepath = Column(String)  # 예: "test/test1/a.txt"
    created_at = Column(DateTime, default=datetime.now)
    filetype = Column(String)
    ocrCompleted = Column(Boolean, default=False)


# ----------------- DB 초기화 -----------------
Base.metadata.drop_all(bind=engine)



# ----------------- 유틸 함수 -----------------
def build_tree(file_list):
    """파일 경로 목록을 계층적 JSON 트리로 변환"""
    tree = []
    for file_path in file_list:
        parts = file_path.split('/')
        current_level = tree
        for i, part in enumerate(parts):
            node = next((n for n in current_level if n["name"] == part), None)
            if not node:
                node = {
                    "id": f"{hash(file_path)}-{i}",
                    "name": part,
                    "type": "folder" if i < len(parts) - 1 else "file",
                    "path": '/'.join(parts[:i + 1])
                }
                if node["type"] == "folder":
                    node["children"] = []
                current_level.append(node)
            if node["type"] == "folder":
                current_level = node["children"]
    return tree


# ----------------- API -----------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """ZIP 또는 단일 PDF 업로드 후 DB 저장"""
    os.makedirs("uploads", exist_ok=True)
    save_path = f"uploads/{file.filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    try:
        ext = file.filename.split('.')[-1].lower()

        # ✅ 1️⃣ ZIP 파일 처리
        if ext == "zip":
            zip_root_name = os.path.splitext(file.filename)[0]
            
            def fix_zip_filename(name: str) -> str:
                try:
                    # 이미 한글이 포함되어 있으면 그대로 반환
                    if any('\uac00' <= ch <= '\ud7a3' for ch in name):
                        return name
                    # 깨진 경우 복원 시도
                    try:
                        return name.encode('cp437').decode('utf-8')
                    except UnicodeDecodeError:
                        return name.encode('cp437').decode('cp949')
                except Exception:
                    return name
            
            with zipfile.ZipFile(save_path, "r") as z:
                file_list = []
                for info in z.infolist():
                    if not info.is_dir() and info.filename.lower().endswith(".pdf"):
                        fixed_name = fix_zip_filename(info.filename)
                        file_list.append(fixed_name.replace("\\", "/"))


                added_files = 0  # 몇 개 추가됐는지 카운트

                for original_path in file_list:
                    filename = os.path.basename(original_path)
                    relative_path = '/'.join(original_path.split('/')[1:])
                    new_path = f"{zip_root_name}/{relative_path}" if relative_path else f"{zip_root_name}/{filename}"

                    # ✅ 중복 체크: 이미 DB에 같은 경로 있으면 건너뛰기
                    exists = db.query(FileDB).filter(FileDB.filepath == new_path).first()
                    if exists:
                        continue

                    db_file = FileDB(
                        filename=filename,
                        filepath=new_path,
                        filetype="file",
                        ocrCompleted=False
                    )
                    db.add(db_file)
                    added_files += 1

                db.commit()
            return {"message": f"ZIP 업로드 완료 ({added_files}개 추가됨)", "file_count": added_files}

        # ✅ 2️⃣ 단일 PDF 파일 처리
        elif ext == "pdf":
            folder_path = "미분류"
            new_path = f"{folder_path}/{file.filename}"

            # ✅ 중복 체크
            exists = db.query(FileDB).filter(FileDB.filepath == new_path).first()
            if exists:
                return {"message": f"{file.filename}은(는) 이미 업로드된 파일입니다.", "file_count": 0}

            db_file = FileDB(
                filename=file.filename,
                filepath=new_path,
                filetype="file",
                ocrCompleted=False
            )
            db.add(db_file)
            db.commit()

            return {"message": "PDF 업로드 완료", "file_count": 1}

        else:
            return {"error": "허용되지 않은 파일 형식입니다. (zip 또는 pdf만 가능)"}

    finally:
        db.close()


@app.get("/api/files")
def get_files():
    """저장된 파일 목록 반환"""
    db = SessionLocal()
    files = db.query(FileDB).order_by(FileDB.created_at).all()
    db.close()

    return [
        {
            "id": f.id,
            "filename": f.filename,
            "filepath": f.filepath,
            "uploaded_at": f.created_at.isoformat()
        }
        for f in files
    ]


#db 제거 하는용도
@app.delete("/remove")
def remove_file(path: str = Query(...)):
    db = SessionLocal()
    try:
        deleted_count = db.query(FileDB).filter(FileDB.filepath == path).delete()
        db.commit()
        print(f"🗑️ 삭제된 행 개수: {deleted_count}")
        return {"message": "삭제 완료", "deleted": deleted_count}
    except Exception as e:
        db.rollback()
        print(f"❌ 삭제 오류: {e}")
        return {"error": str(e)}
    finally:
        db.close()



# ----------------- 서버 실행 -----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
##/api/files
##3000"postgresql://postgres:1234@localhost:5432/postgres"