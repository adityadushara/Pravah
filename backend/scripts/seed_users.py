import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg
import json

base_dir = Path(__file__).resolve().parent.parent
load_dotenv(base_dir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set.")
    sys.exit(1)

DEMO_ACCOUNTS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@pravah.gov",
        "name": "Col. R. Kapoor",
        "role_name": "System Administrator",
        "password": "Pravah@2026",
        "avatar": "RK",
        "badge": "Admin",
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "logistics@pravah.gov",
        "name": "Maj. V. Sharma",
        "role_name": "Senior Logistics Officer",
        "password": "Pravah@2026",
        "avatar": "VS",
        "badge": "Logistics",
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "inventory@pravah.gov",
        "name": "Capt. A. Verma",
        "role_name": "Inventory Officer",
        "password": "Pravah@2026",
        "avatar": "AV",
        "badge": "Depot Stock",
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "email": "transport@pravah.gov",
        "name": "Lt. S. Nair",
        "role_name": "Transportation Officer",
        "password": "Pravah@2026",
        "avatar": "SN",
        "badge": "Movements",
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "email": "analyst@pravah.gov",
        "name": "Dr. P. Sen",
        "role_name": "Forecasting Analyst",
        "password": "Pravah@2026",
        "avatar": "PS",
        "badge": "Analytics",
    },
    {
        "id": "66666666-6666-6666-6666-666666666666",
        "email": "auditor@pravah.gov",
        "name": "Inspector K. Mehta",
        "role_name": "Read-only Auditor",
        "password": "Pravah@2026",
        "avatar": "KM",
        "badge": "Auditor",
    },
]

def seed_demo_users():
    print("Connecting to database to seed demo user accounts...")
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            for acc in DEMO_ACCOUNTS:
                app_meta = json.dumps({"provider": "email", "providers": ["email"]})
                user_meta = json.dumps({
                    "full_name": acc["name"],
                    "display_name": acc["name"],
                    "role": acc["role_name"],
                    "avatar": acc["avatar"]
                })

                # Insert or update auth.users
                cur.execute("""
                    INSERT INTO auth.users (
                        id, aud, role, email, encrypted_password, email_confirmed_at,
                        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
                    )
                    VALUES (
                        %s, 'authenticated', 'authenticated', %s,
                        crypt(%s, gen_salt('bf')), now(),
                        %s::jsonb, %s::jsonb, now(), now()
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        encrypted_password = EXCLUDED.encrypted_password,
                        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                        updated_at = now();
                """, (
                    acc["id"],
                    acc["email"],
                    acc["password"],
                    app_meta,
                    user_meta
                ))

                # Ensure public.profiles has record
                cur.execute("""
                    INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
                    VALUES (%s, %s, %s, now(), now())
                    ON CONFLICT (id) DO UPDATE SET
                        display_name = EXCLUDED.display_name,
                        email = EXCLUDED.email,
                        updated_at = now();
                """, (acc["id"], acc["name"], acc["email"]))

                # Get role_id
                cur.execute("SELECT id FROM public.roles WHERE name = %s;", (acc["role_name"],))
                role_row = cur.fetchone()
                if role_row:
                    role_id = role_row[0]
                    cur.execute("""
                        INSERT INTO public.user_roles (user_id, role_id, created_at)
                        VALUES (%s, %s, now())
                        ON CONFLICT (user_id, role_id) DO NOTHING;
                    """, (acc["id"], role_id))

                print(f"Seeded account: {acc['name']} <{acc['email']}> [{acc['role_name']}]")

            conn.commit()
            print("Successfully seeded all 6 demo accounts!")

if __name__ == "__main__":
    seed_demo_users()
