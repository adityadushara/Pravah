import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg

# Load environment
base_dir = Path(__file__).resolve().parent.parent
load_dotenv(base_dir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set in backend/.env")
    sys.exit(1)

def run_migrations():
    print(f"Connecting to database...")
    workspace_root = base_dir.parent
    migrations_dir = workspace_root / "supabase" / "migrations"
    seed_file = workspace_root / "supabase" / "seed.sql"

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            # Create migrations tracking table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS public._schema_migrations (
                    version TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            conn.commit()

            # Find all migration files
            migration_files = sorted(migrations_dir.glob("*.sql"))
            for m_path in migration_files:
                version = m_path.name
                cur.execute("SELECT 1 FROM public._schema_migrations WHERE version = %s", (version,))
                if cur.fetchone():
                    print(f"Migration {version} already applied. Skipping.")
                    continue

                print(f"Applying migration {version}...")
                with open(m_path, "r", encoding="utf-8") as f:
                    sql_content = f.read()

                cur.execute(sql_content)
                cur.execute("INSERT INTO public._schema_migrations (version) VALUES (%s)", (version,))
                conn.commit()
                print(f"Successfully applied {version}")

            # Apply seed data
            if seed_file.exists():
                print("Applying seed data...")
                with open(seed_file, "r", encoding="utf-8") as f:
                    seed_sql = f.read()
                cur.execute(seed_sql)
                conn.commit()
                print("Seed data successfully applied!")

if __name__ == "__main__":
    run_migrations()
