
import shutil, os
from fastapi import APIRouter, UploadFile, File, Query,Form,HTTPException, Request, Response
from fastapi.responses import JSONResponse
from zip_utiles import extract_zip
from pydantic import BaseModel
from datetime import datetime
from login import login_member, get_current_user, logout_member
from member import add_member, update_member, delete_member, get_member_by_id, get_total_member_count
from db_conn import db_pool




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
            SELECT 
                p.doc_id,
                p.filename,
                p.upload_date,
                p.file_size,
                p.page_count,
                p.status,
                p.created_at,
                p.updated_at,
                p.member_id,
                m.username,
                m.email
            FROM pdf_documents p
            LEFT JOIN member_info m ON p.member_id = m.member_id
            ORDER BY p.created_at DESC
        """)
        rows = cur.fetchall()

        # 프론트는 file.filepath를 참조하므로 key 이름을 맞춰줍니다.
        return [{
            "doc_id": row[0],
            "filename": row[1],
            "upload_date": row[2],
            "file_size": row[3],
            "page_count": row[4],
            "status": row[5],
            "created_at": row[6],
            "updated_at": row[7],
            "member_id": row[8],
            "member_name": row[9],
            "member_email": row[10]
                 } for row in rows]
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


        
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(f"{file.id}", exist_ok=True)
    save_path = f"uploads/{file.filename}"
    save_size = os.path.getsize(file.filename)
    print("너는 경로가??????",save_path)
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



        # router.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from login import login_member, get_current_user, logout_member
from member import add_member, update_member, delete_member

# ===== 로그인 모델 =====
class LoginRequest(BaseModel):
    id: str
    password: str

# 로그인
@router.post("/login")
def login_endpoint(data: LoginRequest, request: Request):
    result = login_member(data.id, data.password, request.session)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

# 로그아웃
@router.get("/logout")
def logout_endpoint(request: Request):
    return logout_member(request.session)


@router.get("/me")
def get_current_user_endpoint(request: Request):
    result = get_current_user(request.session)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result


# ===== 회원 모델 =====
# 회원가입 모델
class AddMemberRequest(BaseModel):
    id: str
    password: str
    name: str
    phone: str
    email: str
    member_role: str = 'R2'
    member_grade: str = 'G2'

# 회원정보수정 모델
class UpdateMemberRequest(BaseModel):
    id: str
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    password: str | None = None
    member_role: str | None = None
    member_grade: str | None = None

# 회원가입
@router.post("/member/add")
def add_member_endpoint(data: AddMemberRequest):
    try:
        member_id = add_member(
            id=data.id,
            password=data.password,
            name=data.name,
            phone=data.phone,
            email=data.email,
            member_role=data.member_role,
            member_grade=data.member_grade
        )
        return {"message": "Member added successfully", "member_id": member_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 회원 정보 조회용
@router.get("/member/me")
def get_my_member_info(request: Request):
    session_user = get_current_user(request.session)
    if "error" in session_user:
        raise HTTPException(status_code=401, detail=session_user["error"])
    
    member_id = session_user["member_id"]
    member = get_member_by_id(member_id)  # member.py 함수 사용
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    return member  # 실제 회원 정보 반환

# 회원정보수정
@router.put("/member/update")
def update_member_endpoint(data: UpdateMemberRequest):
    success = update_member(
        id=data.id,
        name=data.name,
        phone=data.phone,
        email=data.email,
        password=data.password,
        member_role=data.member_role,
        member_grade=data.member_grade
    )
    if not success:
        raise HTTPException(status_code=400, detail="No fields to update or member not found")
    return {"message": "Member updated successfully"}

# 회원삭제
@router.delete("/member/delete/{member_id}")
def delete_member_endpoint(member_id: str, response: Response):
    success = delete_member(member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")

    # 세션 쿠키 삭제 → 브라우저에서 로그아웃 처리
    response.delete_cookie(key="session")

    return {"message": "Member deleted successfully"}

# 회원 정보 조회 - 관리자용
@router.get("/member/admin/{member_id}")
def get_member_endpoint(member_id: str):
    member = get_member_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

# 전체 회원수 조회 하는 코드 
@router.get("/member/count")
def get_member_count():
    """
    전체 회원 수 조회 API (member_role='R2'만)
    """
    try:
        total = get_total_member_count()
        return {"total_members": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_member_endpoint(member_id: str):
    success = delete_member(member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# 회원 정보 조회
@router.get("/member/{member_id}")
def get_member_endpoint(member_id: str):
    member = get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

