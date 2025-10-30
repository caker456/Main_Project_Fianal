from fastapi import APIRouter, UploadFile, File, Query,Form
from router.zip_utiles import extract_zip
from db_conn import db_pool
import shutil, os
from datetime import datetime
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader

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
        if os.path.exists(path):
            os.remove(path)
            print(f"🗑️ 실제 파일 삭제 완료: {path}")
        else:
            print(f"⚠️ 실제 파일 없음: {path}")

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
            SELECT *
            FROM pdf_documents
            ORDER BY created_at DESC
        """)
        rows = cur.fetchall()
        return [
            {
                "member_id": row[0],
                "filename" : row[1],
                "upload_date": row[2],
                "file_size" : row[3],
                "page_count": row[4],
                "status" : row[5],
                "created_at": row[6],
                "updated_at":row[7]
            }
            for row in rows
        ]
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        cur.close()
        db_pool.release_conn(conn)

@router.post("/ocrcompleted")
async def ocrcomplet(filepath: str = Form(...),
    full_text: str = Form(...),
    page_data: int = Form(...),
    ocr_engine: str = Form(...),
    processing_time: float = Form(...)):
    print(f"📄 OCR 완료된 파일 경로: {filepath}")
    conn = db_pool.get_conn()#db연결해보고
    cur = conn.cursor()#db 지금 위치선정하기위해 커서 설정
    
    try:
        
        cur.execute("""
                    

        SELETE do

        INSERT INTO ocr_results (doc_id,full_text, page_data, ocr_engine, processing_time, created_at)
        VALUES (%s,%s, %s, %s, %s, %s)
        """, (doc_id,full_text, page_data, ocr_engine, processing_time,datetime.now()))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        db_pool.release_conn(conn)



@router.post("/upload")


async def upload_file(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    save_path = f"uploads/{file.filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    save_size = round(os.path.getsize(save_path)/ (1024 * 1024),4)
    ext = file.filename.split(".")[-1].lower()
    conn = db_pool.get_conn()
    cursor = conn.cursor()

    try:
        
        if ext == "zip":
            added = extract_zip(save_path, file.filename)
            return {"message": f"ZIP 업로드 완료 ({added}개 추가됨)", "file_count": added}
        elif ext == "pdf":
            reader = PdfReader(save_path)
            
            cursor.execute(
                "SELECT 1 FROM pdf_documents WHERE filename = %s", (file.filename,)
            )
            if cursor.fetchone():
                return {"message": "이미 업로드된 파일입니다.", "file_count": 0}

            cursor.execute("""
                INSERT INTO pdf_documents (page_count,file_size,filename, status, created_at, updated_at)
                VALUES (%s,%s,%s, %s, %s, %s)
            """, (len(reader.pages),save_size,save_path, "uploaded", datetime.now(), datetime.now()))
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
