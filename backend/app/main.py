from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from .config import DATABASE_URL, SUPABASE_URL, get_masked_db_url
from .db import check_db_connection
from .models import (
    InventoryTransactionRequest,
    AlertAcknowledgeRequest,
    HealthResponse,
    SummaryResponse,
    LocationResponse,
    InventoryItemResponse,
    AlertResponse,
    ForecastResponse,
    ShipmentResponse,
    AuditLogResponse,
)
from .services import (
    get_locations_service,
    get_inventory_service,
    execute_transaction_service,
    get_alerts_service,
    acknowledge_alert_service,
    get_forecast_service,
    get_shipments_service,
    get_audit_logs_service,
    get_roles_service,
    get_demo_accounts_service,
)
from pydantic import BaseModel

app = FastAPI(
    title="Pravah Predictive Logistics & Supply Chain API",
    description="Backend API for Smart India Hackathon Pravah prototype. Backed by PostgreSQL/Supabase with atomic inventory transactions.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    connected = check_db_connection()
    return {
        "status": "ok",
        "project": "Pravah",
        "data_mode": "synthetic-demo",
        "database_connected": connected,
        "database_configured": bool(DATABASE_URL),
        "storage_backend": "supabase-live" if connected else "in-memory",
    }

@app.get("/api/summary")
def summary():
    connected = check_db_connection()
    locations = get_locations_service()
    items = get_inventory_service()
    critical_count = sum(1 for x in items if x["status"] == "Critical")
    low_count = sum(1 for x in items if x["status"] == "Low")

    return {
        "locations": len(locations),
        "inventory_items": len(items),
        "critical_items": critical_count,
        "low_items": low_count,
        "total_stock_records": len(items),
        "items": items,
        "database_connected": connected,
        "data_mode": "supabase-live" if connected else "synthetic-demo",
    }

@app.get("/api/locations")
def get_locations():
    return get_locations_service()

@app.get("/api/inventory")
def get_inventory():
    return get_inventory_service()

@app.post("/api/inventory/transactions")
def post_transaction(req: InventoryTransactionRequest):
    try:
        result = execute_transaction_service(req)
        return {
            "success": True,
            "message": f"Successfully performed {req.transaction_type} of {req.quantity} units.",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction processing error: {str(e)}",
        )

@app.get("/api/alerts")
def get_alerts():
    return get_alerts_service()

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, req: Optional[AlertAcknowledgeRequest] = None):
    actor = req.actor_id if req else "demo-user"
    return acknowledge_alert_service(alert_id, actor)

@app.get("/api/forecast/{item_id}")
@app.get("/api/forecasts/{item_id}")
def forecast(item_id: str):
    try:
        return get_forecast_service(item_id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory item '{item_id}' not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/api/shipments")
def get_shipments():
    return get_shipments_service()

@app.get("/api/audit-logs")
def get_audit_logs():
    return get_audit_logs_service()

@app.get("/api/roles")
def get_roles():
    return get_roles_service()

@app.get("/api/demo-accounts")
def get_demo_accounts():
    return get_demo_accounts_service()

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

@app.post("/api/auth/login")
def login(req: LoginRequest):
    users = get_demo_accounts_service()
    user = next((u for u in users if u["email"].lower() == req.email.lower()), None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Operator account not recognized. Please use a valid registered demo account."
        )
    return {
        "success": True,
        "user": user,
        "token": f"demo-jwt-{user['id']}"
    }

@app.get("/api/settings")
def get_settings():
    connected = check_db_connection()
    return {
        "project": "Pravah — Predictive Logistics & Forward Supply Chain",
        "version": "0.2.0",
        "database_connected": connected,
        "database_url_masked": get_masked_db_url(),
        "supabase_configured": bool(SUPABASE_URL),
        "data_mode": "PostgreSQL (Supabase Live)" if connected else "Synthetic In-Memory Demo",
        "environment": "Development / SIH Prototype",
        "model_training_active": False,
        "baseline_method": "7-day Moving Average",
    }
