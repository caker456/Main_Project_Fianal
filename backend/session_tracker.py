import time
import uuid

# 서버 전체에서 활성 세션 관리
# key: session_id, value: dict (session)
session_store = {}

def add_session(session: dict, session_id: str = None) -> str:
    """
    로그인 시 호출: session_id가 없으면 새로 생성 후 session 저장
    반환값: session_id
    """
    if not session_id:
        session_id = str(uuid.uuid4())  # 새 session_id 생성

    session_store[session_id] = session
    return session_id

def remove_session(session_id: str):
    """로그아웃 시 호출: session 삭제"""
    session_store.pop(session_id, None)


def get_current_user_count() -> int:
    """현재 활성화된 세션 수 반환"""
    now = time.time()
    
    count = 0
    for session in session_store.values():
        expiry = session.get("expiry", 0)
        user = session.get("user")
        if user and expiry > now:
            count += 1
    return count
