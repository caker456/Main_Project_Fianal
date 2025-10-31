# router.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from login import login_member, get_current_user, logout_member
from member import add_member, update_member, delete_member

router = APIRouter()

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

# 회원 정보확인
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