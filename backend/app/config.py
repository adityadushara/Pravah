import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_masked_db_url() -> str:
    if not DATABASE_URL:
        return "Not configured"
    try:
        # e.g. postgresql://user:pass@host:port/dbname -> postgresql://user:***@host:port/dbname
        prefix, rest = DATABASE_URL.split("://", 1)
        if "@" in rest:
            auth_part, host_part = rest.split("@", 1)
            user = auth_part.split(":")[0] if ":" in auth_part else auth_part
            return f"{prefix}://{user}:***@{host_part}"
        return f"{prefix}://***"
    except Exception:
        return "Configured (masked)"
