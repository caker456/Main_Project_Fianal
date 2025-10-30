import zipfile, os
from db_conn import db_pool
from datetime import datetime


def fix_zip_filename(name: str) -> str:
    """ZIP 내부 한글 파일명 복원"""
    try:
        if any('\uac00' <= ch <= '\ud7a3' for ch in name):
            return name
        try:
            return name.encode('cp437').decode('utf-8')
        except UnicodeDecodeError:
            return name.encode('cp437').decode('cp949')
    except Exception:
        return name


def extract_zip(zip_path: str, zip_filename: str) -> int:
    """ZIP 파일 내부 PDF를 DB에 저장"""
    added = 0
    zip_root = os.path.splitext(zip_filename)[0]
    conn = db_pool.get_conn()
    cursor = conn.cursor()

    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            for info in z.infolist():
                if info.is_dir() or not info.filename.lower().endswith(".pdf"):
                    continue

                fixed = fix_zip_filename(info.filename).replace("\\", "/")
                filename = fixed
                new_path = f"{zip_root}/{filename}"

                # 중복 확인
                cursor.execute(
                    "SELECT 1 FROM pdf_documents WHERE filename = %s", (filename,)
                )
                if cursor.fetchone():
                    continue
                
                # 파일 삽입
                cursor.execute("""
                    INSERT INTO pdf_documents (filename, status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s)
                """, (filename, 'uploaded', datetime.now(), datetime.now()))
                added += 1

        conn.commit()
        return added
    except Exception as e:
        conn.rollback()
        print("ZIP 처리 오류:", e)
        raise e
    finally:
        cursor.close()
        db_pool.release_conn(conn)
