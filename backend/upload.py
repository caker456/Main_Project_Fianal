import os
from db_conn import db_pool
from fastapi import UploadFile, File
from zip_utiles import extract_zip
from datetime import datetime
from PyPDF2 import PdfReader


async def list_user_files(user_id: str ,file:  UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower()
    user_dir = os.path.join("uploads", str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    member_id=0
    # ✅ 3. 파일 저장
    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    user_id

    """특정 유저의 업로드 폴더 업로드"""
    conn = db_pool.get_conn()
    cur = conn.cursor()  
    #서치해서 맴버아이디 저장
    member_id = cur.execute("SELECT member_id FROM member_info WHERE id = %s", (user_id,))  
    try:
        if ext == "zip":
            added = extract_zip(file_path, file.filename,member_id)
            return {"message": f"ZIP 업로드 완료 ({added}개 추가됨)", "file_count": added}
        #pdf파일 db 존재유무
        elif ext == "pdf":
            
            #pdf 길이 
            reader = PdfReader(file_path)    
            page_count = len(reader.page)
            size = round(os.path.getsize(user_dir) / (1024 * 1024),4)
            cur.execute(
                "SELECT * FROM pdf_documents WHERE filename = %s", (file.filename,)
            )
            if cur.fetchone():
                return {"message": "이미 업로드된 파일입니다.", "file_count": 0}
            
            cur.execute("""
                INSERT INTO pdf_documents (filename,file_size , status, updated_at,page_count,member_id)
                VALUES (%s,%s,%s,%s, %s, %s, %s)
            """, (file.filename,size, "uploaded",  datetime.now(),page_count,member_id))
            conn.commit()
            return {"message": "PDF 업로드 완료", "file_count": 1}
        else:
            return {"error": "zip 또는 pdf만 업로드 가능"}
        
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        cur.close()
        db_pool.release_conn(conn)


  
    