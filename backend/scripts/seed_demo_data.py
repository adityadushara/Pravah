"""
Pravah Logistics Platform — Comprehensive Demo Seed Data Generator
Populates realistic inventory items, balances, active convoys/shipments,
operational alerts, and transaction audit trails into Supabase PostgreSQL.
"""

import sys
import uuid
from datetime import datetime, timedelta
import psycopg
from app.config import DATABASE_URL
from app.db import get_db_connection

NEW_ITEMS = [
    # Rations & Sustenance
    ("food-001", "Emergency Ration Pack A (24-hr)", "Food & Rations", "packs", 300, 100),
    ("food-002", "Ready-to-Eat Meal Pack MRE-II", "Food & Rations", "packs", 250, 80),
    ("food-003", "High-Altitude Energy Bars (Crates of 120)", "Food & Rations", "crates", 40, 12),
    ("water-001", "Potable Water Canisters (20L Jerrycans)", "Water & Hydration", "canisters", 120, 45),
    ("water-002", "Water Purification Tablets (Box of 500)", "Water & Hydration", "boxes", 30, 8),

    # Fuel, Oil & Lubricants (POL)
    ("fuel-001", "Arctic Sub-Zero Diesel (D-80 Drums, 200L)", "Fuel & Lubricants", "drums", 100, 25),
    ("fuel-002", "Aviation Turbine Fuel (ATF K-50 Barrels)", "Fuel & Lubricants", "barrels", 50, 10),
    ("fuel-003", "Synthetic Sub-Zero Engine Oil (OW-40)", "Fuel & Lubricants", "litres", 80, 15),
    ("fuel-004", "Field Generator Fuel (Kerosene Blended)", "Fuel & Lubricants", "drums", 70, 18),

    # Medical & Trauma
    ("med-001", "Tactical Combat Casualty Care (TCCC) Kits", "Medical & Trauma", "kits", 35, 6),
    ("med-002", "Emergency Plasma & Saline Bags (500ml)", "Medical & Trauma", "units", 50, 8),
    ("med-003", "HAPE First-Line Emergency Kits", "Medical & Trauma", "kits", 20, 3),
    ("med-004", "Broad-Spectrum Antibiotics & Dressing Packs", "Medical & Trauma", "packs", 60, 10),
    ("med-005", "Portable Medical Oxygen Cylinders (4L)", "Medical & Trauma", "cylinders", 25, 4),

    # Maintenance & Vehicle Spares
    ("parts-001", "Heavy All-Terrain Run-Flat Tires (Set of 4)", "Maintenance & Spares", "sets", 20, 3),
    ("parts-002", "24V Cold-Cranking Military Batteries", "Maintenance & Spares", "units", 30, 5),
    ("parts-003", "Hydraulic Brake Caliper Assembly Kits", "Maintenance & Spares", "kits", 25, 4),
    ("parts-004", "Heavy Vehicle Snow Chains & Cleats", "Maintenance & Spares", "pairs", 40, 7),

    # Cold Weather & Tactical Gear
    ("gear-001", "Extreme Cold Weather Clothing System (Layer-3)", "Tactical Gear", "suits", 50, 8),
    ("gear-002", "Mountaineering Dynamic Ropes & Carabiners", "Tactical Gear", "coils", 25, 3),
    ("gear-003", "Thermal Sub-Zero Bivouac Sleeping Bags", "Tactical Gear", "bags", 45, 6),

    # Communications & Surveillance
    ("comm-001", "Tactical VHF/UHF Handheld Radio Sets", "Communications", "sets", 20, 2),
    ("comm-002", "Solar Field Charging Power Banks (100W)", "Communications", "units", 25, 3),
    ("comm-003", "Thermal Reconnaissance Monoculars (Gen-3)", "Communications", "units", 15, 1),
    ("comm-004", "Secure Satellite BGAN Field Terminals", "Communications", "units", 10, 1),

    # Ammunition & Reserves
    ("ammo-001", "7.62x51mm Linked Ball Ammo (Crates of 1000)", "Ammunition & Ordnance", "crates", 80, 15),
    ("ammo-002", "5.56x45mm Standard Cartridges (Crates of 1200)", "Ammunition & Ordnance", "crates", 100, 20),
    ("ammo-003", "Screening Multi-Spectral Smoke Canisters", "Ammunition & Ordnance", "canisters", 60, 8),
]

# Stock distributions across the 5 depots
# Format: (sku, loc_code, quantity)
STOCK_DISTRIBUTION = [
    # North Ridge Depot (loc-north) - High readiness forward base
    ("food-001", "loc-north", 650),
    ("food-002", "loc-north", 420),
    ("food-003", "loc-north", 85),
    ("water-001", "loc-north", 240),
    ("water-002", "loc-north", 65),
    ("fuel-001", "loc-north", 210),
    ("fuel-002", "loc-north", 75),
    ("fuel-003", "loc-north", 140),
    ("fuel-004", "loc-north", 95),
    ("med-001", "loc-north", 28),     # Low (reorder 35)
    ("med-002", "loc-north", 75),
    ("med-003", "loc-north", 8),      # Critical (daily 3, left 2.6d)
    ("med-004", "loc-north", 90),
    ("med-005", "loc-north", 35),
    ("parts-001", "loc-north", 30),
    ("parts-002", "loc-north", 18),   # Low (reorder 30)
    ("parts-003", "loc-north", 35),
    ("parts-004", "loc-north", 60),
    ("gear-001", "loc-north", 80),
    ("gear-002", "loc-north", 40),
    ("gear-003", "loc-north", 70),
    ("comm-001", "loc-north", 35),
    ("comm-002", "loc-north", 30),
    ("comm-003", "loc-north", 18),
    ("comm-004", "loc-north", 12),
    ("ammo-001", "loc-north", 120),
    ("ammo-002", "loc-north", 160),
    ("ammo-003", "loc-north", 95),

    # Valley Support Hub (loc-valley) - Central regional hub
    ("food-001", "loc-valley", 850),
    ("food-002", "loc-valley", 580),
    ("food-003", "loc-valley", 110),
    ("water-001", "loc-valley", 380),
    ("water-002", "loc-valley", 120),
    ("fuel-001", "loc-valley", 340),
    ("fuel-002", "loc-valley", 140),
    ("fuel-003", "loc-valley", 220),
    ("fuel-004", "loc-valley", 180),
    ("med-001", "loc-valley", 90),
    ("med-002", "loc-valley", 140),
    ("med-003", "loc-valley", 45),
    ("med-004", "loc-valley", 160),
    ("med-005", "loc-valley", 60),
    ("parts-001", "loc-valley", 45),
    ("parts-002", "loc-valley", 55),
    ("parts-003", "loc-valley", 50),
    ("parts-004", "loc-valley", 85),
    ("gear-001", "loc-valley", 130),
    ("gear-002", "loc-valley", 60),
    ("gear-003", "loc-valley", 115),
    ("comm-001", "loc-valley", 45),
    ("comm-002", "loc-valley", 50),
    ("comm-003", "loc-valley", 25),
    ("comm-004", "loc-valley", 15),
    ("ammo-001", "loc-valley", 210),
    ("ammo-002", "loc-valley", 280),
    ("ammo-003", "loc-valley", 140),

    # East Field Store (loc-east) - Border outpost
    ("food-001", "loc-east", 220),    # Low (reorder 300)
    ("food-002", "loc-east", 180),    # Low (reorder 250)
    ("food-003", "loc-east", 25),     # Low (reorder 40)
    ("water-001", "loc-east", 90),     # Low (reorder 120)
    ("water-002", "loc-east", 22),     # Low (reorder 30)
    ("fuel-001", "loc-east", 60),     # Low (reorder 100)
    ("fuel-002", "loc-east", 30),     # Low (reorder 50)
    ("fuel-003", "loc-east", 45),     # Low (reorder 80)
    ("fuel-004", "loc-east", 50),     # Low (reorder 70)
    ("med-001", "loc-east", 15),      # Low (reorder 35)
    ("med-002", "loc-east", 30),      # Low (reorder 50)
    ("med-003", "loc-east", 5),       # Critical (reorder 20, 5 left)
    ("med-004", "loc-east", 35),      # Low (reorder 60)
    ("med-005", "loc-east", 12),      # Low (reorder 25)
    ("parts-001", "loc-east", 10),    # Low (reorder 20)
    ("parts-002", "loc-east", 8),     # Critical (daily 5, left 1.6d)
    ("parts-003", "loc-east", 14),    # Low (reorder 25)
    ("parts-004", "loc-east", 22),    # Low (reorder 40)
    ("gear-001", "loc-east", 35),     # Low (reorder 50)
    ("gear-002", "loc-east", 18),     # Low (reorder 25)
    ("gear-003", "loc-east", 30),     # Low (reorder 45)
    ("comm-001", "loc-east", 12),     # Low (reorder 20)
    ("comm-002", "loc-east", 15),     # Low (reorder 25)
    ("comm-003", "loc-east", 6),      # Low (reorder 15)
    ("comm-004", "loc-east", 4),      # Low (reorder 10)
    ("ammo-001", "loc-east", 55),     # Low (reorder 80)
    ("ammo-002", "loc-east", 70),     # Low (reorder 100)
    ("ammo-003", "loc-east", 35),     # Low (reorder 60)

    # Western Forward Base (loc-west) - Austere mountain holding
    ("food-001", "loc-west", 160),    # Critical (1.6 days)
    ("food-002", "loc-west", 140),    # Low (reorder 250)
    ("food-003", "loc-west", 20),     # Critical (1.6 days)
    ("water-001", "loc-west", 65),     # Critical (1.4 days)
    ("water-002", "loc-west", 18),     # Low (reorder 30)
    ("fuel-001", "loc-west", 45),     # Critical (1.8 days)
    ("fuel-002", "loc-west", 15),     # Critical (1.5 days)
    ("fuel-003", "loc-west", 25),     # Critical (1.6 days)
    ("fuel-004", "loc-west", 30),     # Critical (1.6 days)
    ("med-001", "loc-west", 10),      # Critical (1.6 days)
    ("med-002", "loc-west", 18),      # Critical (2.2 days)
    ("med-003", "loc-west", 4),       # Critical (1.3 days)
    ("med-004", "loc-west", 22),      # Critical (2.2 days)
    ("med-005", "loc-west", 7),       # Critical (1.75 days)
    ("parts-001", "loc-west", 6),     # Critical (2 days)
    ("parts-002", "loc-west", 5),     # Critical (1 day)
    ("parts-003", "loc-west", 8),     # Critical (2 days)
    ("parts-004", "loc-west", 12),    # Critical (1.7 days)
    ("gear-001", "loc-west", 25),     # Low (reorder 50)
    ("gear-002", "loc-west", 12),     # Low (reorder 25)
    ("gear-003", "loc-west", 20),     # Low (reorder 45)
    ("comm-001", "loc-west", 8),      # Critical (4 days)
    ("comm-002", "loc-west", 10),     # Low (reorder 25)
    ("comm-003", "loc-west", 3),      # Critical (3 days)
    ("comm-004", "loc-west", 2),      # Critical (2 days)
    ("ammo-001", "loc-west", 35),     # Critical (2.3 days)
    ("ammo-002", "loc-west", 40),     # Critical (2 days)
    ("ammo-003", "loc-west", 20),     # Critical (2.5 days)

    # Central Reserve Hub (loc-central) - Main national strategic reserve
    ("food-001", "loc-central", 3500),
    ("food-002", "loc-central", 2800),
    ("food-003", "loc-central", 650),
    ("water-001", "loc-central", 1400),
    ("water-002", "loc-central", 450),
    ("fuel-001", "loc-central", 1800),
    ("fuel-002", "loc-central", 850),
    ("fuel-003", "loc-central", 950),
    ("fuel-004", "loc-central", 780),
    ("med-001", "loc-central", 420),
    ("med-002", "loc-central", 600),
    ("med-003", "loc-central", 180),
    ("med-004", "loc-central", 750),
    ("med-005", "loc-central", 240),
    ("parts-001", "loc-central", 180),
    ("parts-002", "loc-central", 220),
    ("parts-003", "loc-central", 190),
    ("parts-004", "loc-central", 340),
    ("gear-001", "loc-central", 550),
    ("gear-002", "loc-central", 280),
    ("gear-003", "loc-central", 460),
    ("comm-001", "loc-central", 190),
    ("comm-002", "loc-central", 220),
    ("comm-003", "loc-central", 85),
    ("comm-004", "loc-central", 60),
    ("ammo-001", "loc-central", 1200),
    ("ammo-002", "loc-central", 1600),
    ("ammo-003", "loc-central", 650),
]

NEW_SHIPMENTS = [
    {
        "reference_no": "CV-2026-091",
        "origin_code": "loc-central",
        "dest_code": "loc-west",
        "status": "in_transit",
        "cargo": "Priority Resupply: 200 Arctic Fuel Drums, 500 Food Packs, 15 HAPE Kits",
        "dispatch_offset_hours": -12,
        "arrival_offset_hours": 8,
    },
    {
        "reference_no": "CV-2026-092",
        "origin_code": "loc-valley",
        "dest_code": "loc-east",
        "status": "in_transit",
        "cargo": "Advance Medical & Winter Apparel: 40 TCCC Kits & 80 ECWCS Suits",
        "dispatch_offset_hours": -6,
        "arrival_offset_hours": 14,
    },
    {
        "reference_no": "CV-2026-093",
        "origin_code": "loc-north",
        "dest_code": "loc-west",
        "status": "in_transit",
        "cargo": "Critical Battery & Traction Spares: 25 24V Batteries & 30 Snow Chains",
        "dispatch_offset_hours": -3,
        "arrival_offset_hours": 9,
    },
    {
        "reference_no": "CV-2026-094",
        "origin_code": "loc-central",
        "dest_code": "loc-valley",
        "status": "planned",
        "cargo": "Strategic Reserve Rotation: 500 Food Packs & 300 Ammo Crates",
        "dispatch_offset_hours": 18,
        "arrival_offset_hours": 42,
    },
    {
        "reference_no": "CV-2026-088",
        "origin_code": "loc-valley",
        "dest_code": "loc-north",
        "status": "delivered",
        "cargo": "Bulk Fuel Convoy: 150 Fuel Drums & 100 Water Jerrycans (Verified)",
        "dispatch_offset_hours": -48,
        "arrival_offset_hours": -6,
    },
    {
        "reference_no": "CV-2026-085",
        "origin_code": "loc-central",
        "dest_code": "loc-north",
        "status": "delivered",
        "cargo": "Communications Overhaul: 30 Tactical Radios & 10 BGAN Satellite Terminals",
        "dispatch_offset_hours": -72,
        "arrival_offset_hours": -24,
    },
    {
        "reference_no": "CV-2026-096",
        "origin_code": "loc-east",
        "dest_code": "loc-north",
        "status": "in_transit",
        "cargo": "Emergency Reallocation: Heavy Mountain Ropes & Portable Oxygen Concentrators",
        "dispatch_offset_hours": -18,
        "arrival_offset_hours": 30,
    },
]

NEW_ALERTS = [
    {
        "severity": "critical",
        "title": "Extreme Sub-Zero Engine Oil Depletion Hazard",
        "loc_code": "loc-west",
        "item_sku": "fuel-003",
        "detail": "Western Forward Base reports only 1.6 days (25L) of OW-40 synthetic engine lubricant remaining. Risk of vehicle freezing during night ops.",
        "status": "open",
    },
    {
        "severity": "critical",
        "title": "HAPE First-Line Kits Exhaustion Warning",
        "loc_code": "loc-west",
        "item_sku": "med-003",
        "detail": "Western Forward Base has only 4 HAPE kits on hand (1.3 days). High-altitude altitude acclimation protocol breached.",
        "status": "open",
    },
    {
        "severity": "critical",
        "title": "Cold-Cranking Batteries Depleted",
        "loc_code": "loc-west",
        "item_sku": "parts-002",
        "detail": "Only 5 batteries remaining at Western Forward Base (1.0 day of normal turnaround). Fast-track convoy CV-2026-093 in transit.",
        "status": "open",
    },
    {
        "severity": "warning",
        "title": "Mountain Pass Avalanche Risk Affecting Convoy CV-2026-096",
        "loc_code": "loc-east",
        "item_sku": "gear-002",
        "detail": "Severe weather alert along Sela Pass route. Estimated delay of 12 hours reported by Transport Escort Team.",
        "status": "open",
    },
    {
        "severity": "warning",
        "title": "TCCC Field Trauma Kits Below Reorder Threshold",
        "loc_code": "loc-north",
        "item_sku": "med-001",
        "detail": "North Ridge Depot stock reached 28 kits (Threshold: 35). Automated replenishment requisition queued.",
        "status": "open",
    },
    {
        "severity": "warning",
        "title": "Water Containers Stock Depleting Faster Than Baseline",
        "loc_code": "loc-east",
        "item_sku": "water-001",
        "detail": "East Field Store current stock is 90 units (Threshold: 120). Winter freezing rate increased potable usage.",
        "status": "open",
    },
    {
        "severity": "warning",
        "title": "Winter Arctic Diesel Buffer Required",
        "loc_code": "loc-east",
        "item_sku": "fuel-001",
        "detail": "East Field Store has 60 drums remaining (Threshold: 100). Recommend emergency inter-depot transfer from Central Reserve Hub.",
        "status": "open",
    },
]

NEW_AUDIT_LOGS = [
    {
        "actor_id": "Col. R. Kapoor (Admin)",
        "action": "CONFIG_UPDATE",
        "entity_type": "security_policy",
        "entity_id": "rls_inventory_balances",
        "metadata": {"detail": "Updated RLS policies on inventory_balances and enforced least-privilege role matrix."},
        "hours_ago": 1,
    },
    {
        "actor_id": "Capt. A. Verma (Inventory)",
        "action": "STOCK_RECEIPT",
        "entity_type": "inventory",
        "entity_id": "fuel-001",
        "metadata": {"detail": "Received 150 drums of Arctic Sub-Zero Diesel at North Ridge Depot (Ref: PO-2026-4401)."},
        "hours_ago": 3,
    },
    {
        "actor_id": "Lt. K. Singh (Transport)",
        "action": "CONVOY_DISPATCH",
        "entity_type": "shipment",
        "entity_id": "CV-2026-091",
        "metadata": {"detail": "Authorized convoy CV-2026-091 departure from Central Reserve Hub to Western Forward Base."},
        "hours_ago": 5,
    },
    {
        "actor_id": "Maj. V. Sharma (Logistics)",
        "action": "TRANSFER_APPROVE",
        "entity_type": "inventory",
        "entity_id": "med-001",
        "metadata": {"detail": "Approved urgent transfer of 40 TCCC Medical Kits from Valley Support Hub to East Field Store."},
        "hours_ago": 8,
    },
    {
        "actor_id": "Dr. P. Nair (Analyst)",
        "action": "FORECAST_EVAL",
        "entity_type": "model",
        "entity_id": "baseline_7d_food",
        "metadata": {"detail": "Executed 7-day moving-average consumption baseline on ration pack category across all sectors."},
        "hours_ago": 12,
    },
    {
        "actor_id": "Insp. S. Gupta (Auditor)",
        "action": "SECURITY_AUDIT",
        "entity_type": "audit_trail",
        "entity_id": "sha256_ledger",
        "metadata": {"detail": "Cryptographic ledger hash validation passed with zero drift across 140 balances."},
        "hours_ago": 16,
    },
    {
        "actor_id": "Capt. A. Verma (Inventory)",
        "action": "STOCK_ISSUE",
        "entity_type": "inventory",
        "entity_id": "parts-002",
        "metadata": {"detail": "Issued 20 units of 24V Cold-Weather Batteries to Forward Detachment Alpha."},
        "hours_ago": 24,
    },
    {
        "actor_id": "Capt. A. Verma (Inventory)",
        "action": "STOCK_ADJUSTMENT",
        "entity_type": "inventory",
        "entity_id": "water-001",
        "metadata": {"detail": "Physical audit reconciliation: adjusted potable water canisters balance by +15 at North Ridge Depot."},
        "hours_ago": 36,
    },
]

def seed():
    print("Beginning seeding of rich demo inventory stocks, shipments, alerts, and audit logs...", flush=True)
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Ensure inventory items exist
            print("1. Seeding 28 military inventory items...", flush=True)
            for sku, name, category, unit, reorder_thresh, daily_usage in NEW_ITEMS:
                cur.execute("""
                    INSERT INTO public.inventory_items (sku, name, category, unit, reorder_threshold, daily_usage, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, true)
                    ON CONFLICT (sku) DO UPDATE SET
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        unit = EXCLUDED.unit,
                        reorder_threshold = EXCLUDED.reorder_threshold,
                        daily_usage = EXCLUDED.daily_usage;
                """, (sku, name, category, unit, reorder_thresh, daily_usage))

            # Fetch map of SKU -> Item ID and Code -> Loc ID
            cur.execute("SELECT id, sku FROM public.inventory_items;")
            item_map = {row["sku"]: row["id"] for row in cur.fetchall()}

            cur.execute("SELECT id, code FROM public.locations;")
            loc_map = {row["code"]: row["id"] for row in cur.fetchall()}

            # 2. Seed stock balances across all locations
            print("2. Seeding stock balances across 5 depots (140 balances total)...", flush=True)
            for sku, loc_code, quantity in STOCK_DISTRIBUTION:
                item_id = item_map.get(sku)
                loc_id = loc_map.get(loc_code)
                if item_id and loc_id:
                    cur.execute("""
                        INSERT INTO public.inventory_balances (location_id, item_id, quantity)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (location_id, item_id) DO UPDATE SET
                            quantity = EXCLUDED.quantity,
                            updated_at = now();
                    """, (loc_id, item_id, quantity))

            # 3. Seed Shipments / Convoys
            print("3. Seeding active and completed convoy shipments...", flush=True)
            now = datetime.now()
            for s in NEW_SHIPMENTS:
                orig_id = loc_map.get(s["origin_code"])
                dest_id = loc_map.get(s["dest_code"])
                if orig_id and dest_id:
                    dispatch_time = now + timedelta(hours=s["dispatch_offset_hours"])
                    arrival_time = now + timedelta(hours=s["arrival_offset_hours"])
                    cur.execute("""
                        INSERT INTO public.shipments (
                            reference_no, origin_location_id, destination_location_id,
                            status, cargo_summary, planned_dispatch, estimated_arrival
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (reference_no) DO UPDATE SET
                            status = EXCLUDED.status,
                            cargo_summary = EXCLUDED.cargo_summary,
                            planned_dispatch = EXCLUDED.planned_dispatch,
                            estimated_arrival = EXCLUDED.estimated_arrival;
                    """, (s["reference_no"], orig_id, dest_id, s["status"], s["cargo"], dispatch_time, arrival_time))

            # 4. Seed Alerts
            print("4. Seeding operational and risk alerts...", flush=True)
            for a in NEW_ALERTS:
                loc_id = loc_map.get(a["loc_code"])
                item_id = item_map.get(a["item_sku"])
                # Check if exists by title
                cur.execute("SELECT id FROM public.alerts WHERE title = %s;", (a["title"],))
                existing = cur.fetchone()
                if not existing:
                    cur.execute("""
                        INSERT INTO public.alerts (
                            severity, title, description, location_id, item_id, status, created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, now());
                    """, (a["severity"], a["title"], a["detail"], loc_id, item_id, a["status"]))

            # 5. Seed Audit Logs
            print("5. Seeding audit trail logs...", flush=True)
            import json
            for log in NEW_AUDIT_LOGS:
                created_time = now - timedelta(hours=log["hours_ago"])
                cur.execute("SELECT id FROM public.audit_logs WHERE action = %s AND entity_id = %s;", (log["action"], log["entity_id"]))
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s);
                    """, (log["actor_id"], log["action"], log["entity_type"], log["entity_id"], json.dumps(log["metadata"]), created_time))

            conn.commit()
            print("Successfully seeded all demo inventory stocks and logistics data into PostgreSQL!", flush=True)

if __name__ == "__main__":
    seed()
