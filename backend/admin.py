from typing import List, Tuple, Optional
from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext
from db_conn import PostgresDB

db = PostgresDB()

# 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def admin_get_all_members(skip: int = 0, limit: int = 50) -> Tuple[List[dict], int]:
    """
    전체 회원 목록 + 전체 회원 수를 함께 반환 (R1 제외)
    member_grade 대신 member_rating_name 포함
    """
    members_query = """
        SELECT 
            m.member_id,
            m.id,
            m.name,
            m.phone,
            m.email,
            m.member_grade,
            g.member_rating_name
        FROM member_info m
        LEFT JOIN member_grades g
            ON m.member_grade = g.member_grade
        WHERE m.member_role != 'R1'
        ORDER BY m.member_id
        OFFSET %s LIMIT %s
    """
    
    count_query = "SELECT COUNT(*) FROM member_info WHERE member_role != 'R1'"

    conn = db.get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1️⃣ 페이징된 회원 목록 조회
            cur.execute(members_query, (skip, limit))
            members = cur.fetchall()

            # 2️⃣ 전체 회원 수 조회
            cur.execute(count_query)
            total_count = cur.fetchone()["count"]

            # 3️⃣ 목록 + 전체 개수 함께 반환
            return members, total_count

    finally:
        db.release_conn(conn)

def admin_search_members(query: str, skip: int = 0, limit: int = 50) -> Tuple[List[dict], int]:
    """
    id 또는 name에 query가 포함된 회원 목록 반환 (R1 제외)
    """
    search_sql = """
        SELECT member_id, id, name, phone, email, member_grade
        FROM member_info
        WHERE member_role != 'R1' AND (id ILIKE %s OR name ILIKE %s)
        ORDER BY member_id
        OFFSET %s LIMIT %s
    """
    count_sql = """
        SELECT COUNT(*)
        FROM member_info
        WHERE member_role != 'R1' AND (id ILIKE %s OR name ILIKE %s)
    """
    search_pattern = f"%{query}%"

    conn = db.get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 검색 결과 조회
            cur.execute(search_sql, (search_pattern, search_pattern, skip, limit))
            members = cur.fetchall()

            # 검색 결과 전체 개수 조회
            cur.execute(count_sql, (search_pattern, search_pattern))
            total_count = cur.fetchone()["count"]

            return members, total_count
    finally:
        db.release_conn(conn)

def admin_delete_member_by_id(member_id: int) -> bool:
    """
    특정 회원(member_id)을 삭제합니다.
    - 먼저 member_log의 외래키 제약조건을 처리한 뒤
    - member_info에서 해당 회원을 삭제합니다.
    - 성공 시 True, 실패 시 False 반환
    """
    conn = db.get_conn()
    try:
        with conn.cursor() as cur:
            # 🔹 1️⃣ 먼저 로그 테이블에서 해당 회원 삭제 (FK 제약조건 때문에)
            cur.execute("DELETE FROM member_log WHERE member_id = %s", (member_id,))

            # 🔹 2️⃣ 회원 정보 삭제
            cur.execute("DELETE FROM member_info WHERE member_id = %s", (member_id,))

            # 🔹 3️⃣ 커밋
            conn.commit()

            # 삭제된 행이 1개 이상이면 성공 처리
            return cur.rowcount > 0

    except Exception as e:
        conn.rollback()
        print(f"❌ Error deleting member_id={member_id}: {e}")
        return False

    finally:
        db.release_conn(conn)

# 회원 추가 (CREATE) - bcrypt + 트랜잭션 블록
def admin_create_member(
    id: str,
    password: str,
    name: str,
    phone: str,
    email: str,
    member_role: str = "R2",
    member_grade: str = "G2"
) -> Optional[int]:
    """
    새로운 회원 생성 후 member_id 반환
    비밀번호는 bcrypt로 안전하게 해시
    """
    # 비밀번호 안전하게 해싱 (72바이트 제한 처리)
    encoded = password.encode('utf-8')
    if len(encoded) > 72:
        encoded = encoded[:72]
        while True:
            try:
                password = encoded.decode('utf-8')
                break
            except UnicodeDecodeError:
                encoded = encoded[:-1]

    hashed_password = pwd_context.hash(password)

    conn = db.get_conn()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # member_info 삽입
                cur.execute(
                    """
                    INSERT INTO member_info (id, password, name, phone, email, member_role, member_grade)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING member_id
                    """,
                    (id, hashed_password, name, phone, email, member_role, member_grade)
                )
                member_id = cur.fetchone()['member_id']

            # member_log 초기화
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO member_log (member_id, create_date, update_date, date_of_connection, access_count)
                    VALUES (%s, CURRENT_TIMESTAMP, NULL, NULL, 0)
                    """,
                    (member_id,)
                )

        return member_id

    finally:
        db.release_conn(conn)

# 회원 정보 업데이트 (UPDATE)
def admin_update_member(
    member_id: int,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    member_grade: Optional[str] = None
) -> bool:
    """
    member_id에 해당하는 회원 정보 업데이트
    """
    fields = []
    values = []

    if name is not None:
        fields.append("name = %s")
        values.append(name)
    if phone is not None:
        fields.append("phone = %s")
        values.append(phone)
    if email is not None:
        fields.append("email = %s")
        values.append(email)
    if member_grade is not None:
        fields.append("member_grade = %s")
        values.append(member_grade)

    if not fields:
        return False  # 변경할 내용 없음

    # update_date 기록
    fields.append("update_date = CURRENT_TIMESTAMP")

    sql = f"UPDATE member_info SET {', '.join(fields)} WHERE member_id = %s"
    values.append(member_id)

    conn = db.get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, tuple(values))
            conn.commit()
            return cur.rowcount > 0
    except Exception as e:
        conn.rollback()
        print(f"❌ Error updating member_id={member_id}: {e}")
        return False
    finally:
        db.release_conn(conn)

# 한 회원 상세 조회 (SELECT)
def admin_get_member_detail(member_id: int) -> Optional[dict]:
    """
    member_id로 회원 상세 정보 조회
    반환 컬럼: memberId, id, name, phone, email, member_rating_name,
             create_date, update_date, date_of_connection, access_count
    """
    sql = """
        SELECT 
            m.member_id,
            m.id,
            m.name,
            m.phone,
            m.email,
            g.member_rating_name,
            l.create_date,
            l.update_date,
            l.date_of_connection,
            l.access_count
        FROM member_info m
        LEFT JOIN member_grades g ON m.member_grade = g.member_grade
        LEFT JOIN member_log l ON m.member_id = l.member_id
        WHERE m.member_id = %s
    """

    conn = db.get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (member_id,))
            result = cur.fetchone()
            return result
    finally:
        db.release_conn(conn)
