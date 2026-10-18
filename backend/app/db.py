import os
from contextlib import contextmanager
import psycopg
from psycopg.rows import dict_row
from .config import DATABASE_URL

_db_healthy: bool | None = None

def check_db_connection() -> bool:
    global _db_healthy
    if not DATABASE_URL:
        _db_healthy = False
        return False
    try:
        with psycopg.connect(DATABASE_URL, connect_timeout=5) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                _db_healthy = True
                return True
    except Exception:
        _db_healthy = False
        return False

@contextmanager
def get_db_connection():
    if not DATABASE_URL:
        raise ConnectionError("DATABASE_URL is not configured.")
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
