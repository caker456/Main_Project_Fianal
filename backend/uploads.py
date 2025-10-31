
import shutil, os
from fastapi import  UploadFile, File, Request
from datetime import datetime
from db_conn import PostgresDB
from PyPDF2 import PdfReader

db = PostgresDB()


    
def upload_files(request: Request, file: UploadFile = File(...)):
    conn = db.get_conn()
    cursor = conn.cursor()
    userid = request.session["user"].get("member_id")
    try:
        cursor.execute(
            """
            SELECT member_id,id, name
            FROM member_info
            WHERE member_id = %s
            """,
            (userid,),
        )
        memberrow = cursor.fetchone()
        member_id = memberrow[0]
        user_uid = memberrow[1]
        username= memberrow[2]
        file_path = os.path.join(".","upload",username,user_uid,file.filename).replace("\\", "/")
        folder_path= os.path.dirname(file_path)
          # 프로젝트 안에 upload 폴더 있다고 가정
        #/upload/홍길동/aaaa/김근우_입사지원서_10월말 또는 11월 초 입사 가능_250930_101644.pdf
     
        os.makedirs(folder_path, exist_ok=True) 
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        page_count = len(PdfReader(file_path).pages)
        size = round(os.path.getsize(file_path)/(1024*1024),3   )
       
        cursor.execute(
            """
            INSERT INTO pdf_documents (member_id, filename,updated_at, status,page_count,file_size,upload_date)
            VALUES (%s,%s ,%s,%s,%s,%s,%s)""",
            (member_id,file_path,datetime.now(),"upload",page_count,size,datetime.now()),
        )
        conn.commit()



    finally:
        cursor.close()
        db.release_conn(conn)
    

 
    
    # 📦 파일 저장

    

    return {"message": "파일 업로드 성공", "uploaded_by": userid, "filename": file.filename}



