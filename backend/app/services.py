from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import psycopg
from .db import check_db_connection, get_db_connection
from .data import LOCATIONS as MOCK_LOCATIONS, INVENTORY as MOCK_INVENTORY, HISTORY as MOCK_HISTORY
from .models import InventoryTransactionRequest, InventoryItemResponse

def calculate_status(stock: float, daily_usage: float, reorder_level: float) -> tuple[float, str]:
    safe_daily = max(0.1, float(daily_usage))
    days_left = round(stock / safe_daily, 1)
    if stock <= safe_daily * 2:
        status = "Critical"
    elif stock <= reorder_level:
        status = "Low"
    else:
        status = "Healthy"
    return days_left, status

def get_locations_service() -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id::text, code, name, location_type, region, description, is_active
                    FROM public.locations
                    ORDER BY name;
                """)
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]
    # In-memory fallback
    return [
        {
            "id": loc["id"],
            "code": loc["id"],
            "name": loc["name"],
            "location_type": "Depot",
            "region": loc.get("region", "Demo Region"),
            "description": "Fictional logistics depot",
            "is_active": True
        }
        for loc in MOCK_LOCATIONS
    ]

def get_inventory_service() -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        b.id::text AS balance_id,
                        i.id::text AS item_uuid,
                        i.sku,
                        i.name,
                        i.category,
                        i.unit,
                        i.daily_usage::float AS daily_usage,
                        i.reorder_threshold::float AS reorder_level,
                        l.id::text AS location_uuid,
                        l.code AS location_id,
                        l.name AS location_name,
                        b.quantity::float AS stock
                    FROM public.inventory_balances b
                    JOIN public.inventory_items i ON b.item_id = i.id
                    JOIN public.locations l ON b.location_id = l.id
                    ORDER BY l.name, i.name;
                """)
                rows = cur.fetchall()
                if rows:
                    results = []
                    for r in rows:
                        days_left, status = calculate_status(r["stock"], r["daily_usage"], r["reorder_level"])
                        results.append({
                            "id": r["sku"],
                            "name": r["name"],
                            "category": r["category"],
                            "location_id": r["location_id"],
                            "location_name": r["location_name"],
                            "stock": r["stock"],
                            "daily_usage": r["daily_usage"],
                            "reorder_level": r["reorder_level"],
                            "unit": r["unit"],
                            "days_remaining": days_left,
                            "status": status,
                            "sku": r["sku"],
                            "item_uuid": r["item_uuid"],
                            "location_uuid": r["location_uuid"],
                        })
                    return results

    # In-memory fallback
    results = []
    for item in MOCK_INVENTORY:
        loc = next((x for x in MOCK_LOCATIONS if x["id"] == item["location_id"]), None)
        days_left, status = calculate_status(item["stock"], item["daily_usage"], item["reorder_level"])
        results.append({
            **item,
            "location_name": loc["name"] if loc else "Unknown location",
            "days_remaining": days_left,
            "status": status,
            "sku": item["id"],
            "item_uuid": item["id"],
            "location_uuid": item["location_id"],
        })
    return results

def execute_transaction_service(req: InventoryTransactionRequest) -> Dict[str, Any]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Resolve item UUID by SKU or UUID
                cur.execute(
                    "SELECT id, sku, name FROM public.inventory_items WHERE sku = %s OR id::text = %s LIMIT 1;",
                    (req.item_id, req.item_id)
                )
                item_row = cur.fetchone()
                if not item_row:
                    raise ValueError(f"Inventory item '{req.item_id}' not found.")
                item_uuid = item_row["id"]

                # Resolve source location UUID
                cur.execute(
                    "SELECT id, code, name FROM public.locations WHERE code = %s OR id::text = %s LIMIT 1;",
                    (req.location_id, req.location_id)
                )
                loc_row = cur.fetchone()
                if not loc_row:
                    raise ValueError(f"Location '{req.location_id}' not found.")
                loc_uuid = loc_row["id"]

                # Resolve destination location if transfer
                to_loc_uuid = None
                if req.transaction_type == "transfer":
                    if not req.to_location_id:
                        raise ValueError("Destination location (to_location_id) is required for transfers.")
                    cur.execute(
                        "SELECT id, code, name FROM public.locations WHERE code = %s OR id::text = %s LIMIT 1;",
                        (req.to_location_id, req.to_location_id)
                    )
                    to_loc_row = cur.fetchone()
                    if not to_loc_row:
                        raise ValueError(f"Destination location '{req.to_location_id}' not found.")
                    to_loc_uuid = to_loc_row["id"]

                # Execute PostgreSQL RPC with explicit type casting
                try:
                    cur.execute("""
                        SELECT public.perform_inventory_transaction(
                            %s::uuid,
                            %s::uuid,
                            %s::text,
                            %s::numeric,
                            %s::uuid,
                            %s::text,
                            %s::text,
                            %s::text
                        ) AS result;
                    """, (
                        item_uuid,
                        loc_uuid,
                        req.transaction_type,
                        req.quantity,
                        to_loc_uuid,
                        req.reason,
                        req.reference_no,
                        req.actor_id or "system"
                    ))
                    res = cur.fetchone()
                    return res["result"] if res else {"success": True}
                except psycopg.Error as db_err:
                    err_msg = str(db_err).split("\n")[0].replace("ERROR: ", "").strip()
                    raise ValueError(err_msg)

    # In-memory transaction execution (for testing / offline fallback)
    target_item = next((x for x in MOCK_INVENTORY if x["id"] == req.item_id and x["location_id"] == req.location_id), None)
    if not target_item:
        # Check by id only
        target_item = next((x for x in MOCK_INVENTORY if x["id"] == req.item_id), None)
        if not target_item:
            raise ValueError(f"Inventory item '{req.item_id}' not found.")

    prev = target_item["stock"]
    if req.transaction_type == "receipt":
        target_item["stock"] += req.quantity
    elif req.transaction_type == "issue":
        if target_item["stock"] < req.quantity:
            raise ValueError(f"Insufficient stock. Available: {target_item['stock']}, requested: {req.quantity}")
        target_item["stock"] -= req.quantity
    elif req.transaction_type == "adjustment":
        target_item["stock"] = req.quantity
    elif req.transaction_type == "transfer":
        if target_item["stock"] < req.quantity:
            raise ValueError(f"Insufficient stock. Available: {target_item['stock']}, requested: {req.quantity}")
        if not req.to_location_id:
            raise ValueError("Destination location is required for transfers.")
        target_item["stock"] -= req.quantity
        # Find or create dest item in memory
        dest_item = next((x for x in MOCK_INVENTORY if x["id"] == req.item_id and x["location_id"] == req.to_location_id), None)
        if dest_item:
            dest_item["stock"] += req.quantity

    return {
        "success": True,
        "transaction_type": req.transaction_type,
        "previous_balance": prev,
        "resulting_balance": target_item["stock"],
        "actor_id": req.actor_id
    }

def get_alerts_service() -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        a.id::text AS id,
                        a.severity,
                        a.title,
                        COALESCE(l.name, 'All Locations') AS location,
                        a.description AS detail,
                        i.sku AS item_id,
                        a.status,
                        a.created_at::text AS created_at
                    FROM public.alerts a
                    LEFT JOIN public.locations l ON a.location_id = l.id
                    LEFT JOIN public.inventory_items i ON a.item_id = i.id
                    WHERE a.status IN ('open', 'acknowledged')
                    ORDER BY
                        CASE a.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
                        a.created_at DESC;
                """)
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]

    # In-memory fallback
    alerts = []
    inventory = get_inventory_service()
    for item in inventory:
        if item["status"] != "Healthy":
            alerts.append({
                "id": f"alert-{item['id']}-{item['location_id']}",
                "severity": "critical" if item["status"] == "Critical" else "warning",
                "title": f"{item['name']} stock is {item['status'].lower()}",
                "location": item["location_name"],
                "detail": f"Estimated {item['days_remaining']} days of stock at current usage.",
                "item_id": item["id"],
                "status": "open",
                "created_at": datetime.utcnow().isoformat()
            })
    return alerts

def acknowledge_alert_service(alert_id: str, actor_id: str = "demo-user") -> Dict[str, Any]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE public.alerts
                    SET status = 'acknowledged',
                        acknowledged_at = now(),
                        acknowledged_by = %s
                    WHERE id::text = %s OR id::text = %s
                    RETURNING id::text, status;
                """, (actor_id, alert_id, alert_id.replace("alert-", "")))
                row = cur.fetchone()
                if row:
                    return {"id": row["id"], "status": "acknowledged", "acknowledged_by": actor_id}

    return {"id": alert_id, "status": "acknowledged", "acknowledged_by": actor_id}

def get_forecast_service(item_id: str) -> Dict[str, Any]:
    inventory = get_inventory_service()
    item = next((x for x in inventory if x["id"] == item_id or x.get("sku") == item_id or x.get("item_uuid") == item_id), None)
    if not item:
        raise KeyError("Inventory item not found")

    history = MOCK_HISTORY.get(item_id) or MOCK_HISTORY.get(item.get("sku", "")) or []
    if not history:
        # Default representative synthetic baseline
        history = [round(item["daily_usage"] * (0.9 + 0.05 * (i % 5)), 1) for i in range(14)]

    recent = history[-7:]
    predicted_daily_demand = round(sum(recent) / len(recent), 2)
    days_remaining = round(item["stock"] / max(predicted_daily_demand, 0.1), 1)

    return {
        "item_id": item["id"],
        "item_name": item["name"],
        "method": "7-day moving-average baseline",
        "training_performed": False,
        "historical_observations": len(history),
        "predicted_daily_demand": predicted_daily_demand,
        "current_stock": item["stock"],
        "estimated_days_remaining": days_remaining,
        "forecast_horizon_days": 7,
        "projected_7_day_demand": round(predicted_daily_demand * 7, 1),
        "model_status": "Active baseline (rule-based)",
        "note": "Synthetic demonstration baseline only. No ML model training claimed.",
        "history": history
    }

def get_shipments_service() -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        s.id::text AS id,
                        s.reference_no,
                        o.name AS origin_name,
                        d.name AS destination_name,
                        s.status,
                        s.cargo_summary,
                        s.planned_dispatch::text AS planned_dispatch,
                        s.estimated_arrival::text AS estimated_arrival
                    FROM public.shipments s
                    JOIN public.locations o ON s.origin_location_id = o.id
                    JOIN public.locations d ON s.destination_location_id = d.id
                    ORDER BY s.created_at DESC;
                """)
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]

    return [
        {
            "id": "shp-demo-01",
            "reference_no": "SHP-2026-001",
            "origin_name": "Valley Support Hub",
            "destination_name": "East Field Store",
            "status": "in_transit",
            "cargo_summary": "Emergency Resupply: 50 Medical Kits & 300 Food Packs",
            "planned_dispatch": "2026-10-18T14:00:00Z",
            "estimated_arrival": "2026-10-18T20:00:00Z"
        },
        {
            "id": "shp-demo-02",
            "reference_no": "SHP-2026-002",
            "origin_name": "North Ridge Depot",
            "destination_name": "East Field Store",
            "status": "planned",
            "cargo_summary": "Routine Replenishment: 400L Fuel & 100 Water Containers",
            "planned_dispatch": "2026-10-19T06:00:00Z",
            "estimated_arrival": "2026-10-19T16:00:00Z"
        }
    ]

def get_audit_logs_service(limit: int = 50) -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        id::text AS id,
                        actor_id,
                        action,
                        entity_type,
                        entity_id,
                        metadata,
                        created_at::text AS created_at
                    FROM public.audit_logs
                    ORDER BY created_at DESC
                    LIMIT %s;
                """, (limit,))
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]

    return [
        {
            "id": "audit-mock-01",
            "actor_id": "system",
            "action": "SYSTEM_STARTUP",
            "entity_type": "server",
            "entity_id": "pravah-app",
            "metadata": {"mode": "demo", "status": "active"},
            "created_at": datetime.utcnow().isoformat()
        }
    ]

def get_roles_service() -> List[Dict[str, Any]]:
    if check_db_connection():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id::text AS id, name, description FROM public.roles ORDER BY name;")
                rows = cur.fetchall()
                if rows:
                    return [dict(r) for r in rows]

    return [
        {"id": "r1", "name": "System Administrator", "description": "Full system management and configuration privileges."},
        {"id": "r2", "name": "Senior Logistics Officer", "description": "Reviews logistics readiness, approves supply allocations and shipments."},
        {"id": "r3", "name": "Inventory Officer", "description": "Manages depot stock levels, receives goods, and oversees issues and transfers."},
        {"id": "r4", "name": "Transportation Officer", "description": "Schedules and oversees convoy movement and inter-depot shipments."},
        {"id": "r5", "name": "Forecasting Analyst", "description": "Monitors demand models, stock projections, and consumption variability."},
        {"id": "r6", "name": "Read-only Auditor", "description": "Reviews audit logs, transaction histories, and compliance records without write access."}
    ]

DEMO_USERS_LIST = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@pravah.gov",
        "name": "Col. R. Kapoor",
        "role": "System Administrator",
        "avatar": "RK",
        "badge": "Admin",
        "description": "Full administrative control and user role configuration."
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "logistics@pravah.gov",
        "name": "Maj. V. Sharma",
        "role": "Senior Logistics Officer",
        "avatar": "VS",
        "badge": "Logistics",
        "description": "Forward logistics oversight, allocations, and stock reviews."
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "inventory@pravah.gov",
        "name": "Capt. A. Verma",
        "role": "Inventory Officer",
        "avatar": "AV",
        "badge": "Depot Stock",
        "description": "Direct stock receipts, issues, and depot balance reconciliation."
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "email": "transport@pravah.gov",
        "name": "Lt. S. Nair",
        "role": "Transportation Officer",
        "avatar": "SN",
        "badge": "Movements",
        "description": "Convoy scheduling, planned shipments, and transfer routes."
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "email": "analyst@pravah.gov",
        "name": "Dr. P. Sen",
        "role": "Forecasting Analyst",
        "avatar": "PS",
        "badge": "Analytics",
        "description": "Demand burn-rate analysis and baseline consumption modeling."
    },
    {
        "id": "66666666-6666-6666-6666-666666666666",
        "email": "auditor@pravah.gov",
        "name": "Inspector K. Mehta",
        "role": "Read-only Auditor",
        "avatar": "KM",
        "badge": "Auditor",
        "description": "Read-only compliance checks and immutable audit log review."
    }
]

def get_demo_accounts_service() -> List[Dict[str, Any]]:
    return DEMO_USERS_LIST

