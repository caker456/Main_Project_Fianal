# DB 연결과 커넥션 풀을 사용하는 코드

import psycopg2
from psycopg2 import pool

class PostgresDB:
    def __init__(self):
        # 커넥션 풀 생성
        self.postgre_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,  # 최소 커넥션 수
            maxconn=10, # 최대 커넥션 수
            dbname="postgres",
            user="postgres",
            password="1234",
            host="localhost",
            port="5432"
        )

        if self.postgre_pool:
            print("PostgreSQL Connection Pool 생성 완료")

    def get_conn(self):
        """
        커넥션 풀에서 커넥션 가져오기
        """
        return self.postgre_pool.getconn()

    def release_conn(self, conn):
        """
        사용한 커넥션을 커넥션 풀에 반환
        """
        self.postgre_pool.putconn(conn)

    def close_all(self):
        """
        모든 커넥션 종료
        """
        self.postgre_pool.closeall()
        print("모든 커넥션 종료")
db_pool = PostgresDB()
# ===== 사용 예시 =====
if __name__ == "__main__":


    # 커넥션 가져오기
    conn = db_pool.get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT version();")
    print(cursor.fetchone())

    cursor.close()
    db_pool.release_conn(conn)

    # 모든 커넥션 종료
    db_pool.close_all()
