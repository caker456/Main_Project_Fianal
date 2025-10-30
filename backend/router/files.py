from fastapi import APIRouter, UploadFile, File, Query,Form
from router.zip_utiles import extract_zip
from db_conn import db_pool
import shutil, os
from datetime import datetime
from fastapi.responses import JSONResponse

router = APIRouter()


@router.delete("/remove")
def remove_file(path: str = Query(..., description="삭제할 파일 경로")):
    conn = db_pool.get_conn()
    cur = None

    try:
        cur = conn.cursor()
        
        # 존재 여부 확인
        cur.execute("SELECT 1 FROM pdf_documents WHERE filename = %s", (path,))
        if not cur.fetchone():
            return JSONResponse(status_code=404, content={"success": False, "message": "해당 경로의 파일이 없습니다."})

        # 삭제 실행
        cur.execute("DELETE FROM pdf_documents WHERE filename = %s", (path,))
        conn.commit()

        return {"success": True, "message": f"{path} 삭제 완료"}

    except Exception as e:
        if conn:
            conn.rollback()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    finally:
        if cur:
            cur.close()
        db_pool.release_conn(conn)
@router.get("/files")
async def get_files():
    conn = db_pool.get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT filename
            FROM pdf_documents
            ORDER BY created_at DESC
        """)
        rows = cur.fetchall()

        # 프론트는 file.filepath를 참조하므로 key 이름을 맞춰줍니다.
        return [{"filepath": row[0]} for row in rows]
    except Exception as e:
        return {"error": str(e)}
    finally:
        cur.close()
        db_pool.release_conn(conn)
@router.post("/ocrcompleted")
async def ocrcomplet(filepath: str = Form(...)):
    print(f"📄 OCR 완료된 파일 경로: {filepath}")
    conn = db_pool.get_conn()#db연결해보고
    cur = conn.cursor()#db 지금 위치선정하기위해 커서 설정
    try:
        #너 파일 검색좀해보자?
        cur.execute("SELECT 1 FROM pdf_documents WHERE filename = %s", (filepath,))
        exists = cur.fetchone() 
        #너 없구나?
        if not exists:
            return {"success": False, "message": f"파일 {filepath} 이(가) DB에 없습니다."}
        #있네?
        else:
            cur.execute("""
            UPDATE pdf_documents
            SET ocr = TRUE, updated_at = NOW()
            WHERE filename = %s
            """, (filepath,))
            conn.commit()
            
        conn.commit()
        return {"success": True, "message": f"OCR 완료 처리됨: {filepath}"}
    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        db_pool.release_conn(conn)


    return 0


        
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    save_path = f"uploads/{file.filename}"
    save_size = os.path.getsize(file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ext = file.filename.split(".")[-1].lower()
    conn = db_pool.get_conn()
    cursor = conn.cursor()

    try:
        if ext == "zip":
            added = extract_zip(save_path, file.filename)
            return {"message": f"ZIP 업로드 완료 ({added}개 추가됨)", "file_count": added}
        elif ext == "pdf":
            cursor.execute(
                "SELECT 1 FROM pdf_documents WHERE filename = %s", (file.filename,)
            )
            if cursor.fetchone():
                return {"message": "이미 업로드된 파일입니다.", "file_count": 0}

            cursor.execute("""
                INSERT INTO pdf_documents (file_size ,filename, status, created_at, updated_at)
                VALUES (%s,%s, %s, %s, %s)
            """, (save_size,save_path, "uploaded", datetime.now(), datetime.now()))
            conn.commit()
            return {"message": "PDF 업로드 완료", "file_count": 1}
        else:
            return {"error": "zip 또는 pdf만 업로드 가능"}
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:    
        cursor.close()
        db_pool.release_conn(conn)
