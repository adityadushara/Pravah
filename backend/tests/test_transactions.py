import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["data_mode"] == "synthetic-demo"
    assert "database_connected" in data

def test_get_locations():
    res = client.get("/api/locations")
    assert res.status_code == 200
    locations = res.json()
    assert len(locations) >= 3
    assert any("North" in loc["name"] for loc in locations)

def test_inventory_list():
    res = client.get("/api/inventory")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 4
    for item in items:
        assert "stock" in item
        assert "days_remaining" in item
        assert item["status"] in ("Critical", "Low", "Healthy")

def test_transaction_input_validation_negative_quantity():
    payload = {
        "item_id": "food-001",
        "location_id": "loc-north",
        "transaction_type": "receipt",
        "quantity": -10,
    }
    res = client.post("/api/inventory/transactions", json=payload)
    assert res.status_code == 422  # Pydantic validation error

def test_transaction_adjustment_requires_reason():
    payload = {
        "item_id": "food-001",
        "location_id": "loc-north",
        "transaction_type": "adjustment",
        "quantity": 100,
        "reason": "",  # Empty reason must be rejected
    }
    res = client.post("/api/inventory/transactions", json=payload)
    assert res.status_code in (400, 422)

def test_transaction_receipt_increases_stock():
    # Fetch current stock of food-001 at North Ridge Depot
    inv_res = client.get("/api/inventory")
    items = inv_res.json()
    target = next((x for x in items if x["id"] == "food-001" and ("North" in x["location_name"] or x["location_id"] == "loc-north")), None)
    assert target is not None
    initial_stock = target["stock"]

    payload = {
        "item_id": "food-001",
        "location_id": target["location_id"],
        "transaction_type": "receipt",
        "quantity": 25,
        "reference_no": "TEST-RECEIPT-01",
        "reason": "Test receipt",
        "actor_id": "tester"
    }
    res = client.post("/api/inventory/transactions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True

    # Re-verify stock increased
    inv_res2 = client.get("/api/inventory")
    items2 = inv_res2.json()
    target2 = next(x for x in items2 if x["id"] == "food-001" and ("North" in x["location_name"] or x["location_id"] == "loc-north"))
    assert target2["stock"] == initial_stock + 25

def test_transaction_issue_insufficient_stock_fails():
    payload = {
        "item_id": "food-001",
        "location_id": "loc-north",
        "transaction_type": "issue",
        "quantity": 99999999,
        "reference_no": "TEST-FAIL-01",
        "actor_id": "tester"
    }
    res = client.post("/api/inventory/transactions", json=payload)
    assert res.status_code == 400
    assert "insufficient" in res.json()["detail"].lower()

def test_transaction_transfer_requires_distinct_locations():
    payload = {
        "item_id": "fuel-001",
        "location_id": "loc-north",
        "to_location_id": "loc-north",  # Same destination as origin!
        "transaction_type": "transfer",
        "quantity": 50,
        "actor_id": "tester"
    }
    res = client.post("/api/inventory/transactions", json=payload)
    assert res.status_code == 400

def test_alerts_endpoint_and_acknowledge():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert isinstance(alerts, list)
    if len(alerts) > 0:
        alert_id = alerts[0]["id"]
        ack_res = client.post(f"/api/alerts/{alert_id}/acknowledge", json={"actor_id": "auditor-01"})
        assert ack_res.status_code == 200
        assert ack_res.json()["status"] == "acknowledged"

def test_shipments_endpoint():
    res = client.get("/api/shipments")
    assert res.status_code == 200
    shipments = res.json()
    assert len(shipments) >= 1
    assert "reference_no" in shipments[0]

def test_audit_logs_endpoint():
    res = client.get("/api/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    assert "action" in logs[0]

def test_demo_accounts_endpoint():
    res = client.get("/api/demo-accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) == 6
    roles = [a["role"] for a in accounts]
    assert "System Administrator" in roles
    assert "Senior Logistics Officer" in roles
    assert "Inventory Officer" in roles
    assert "Transportation Officer" in roles
    assert "Forecasting Analyst" in roles
    assert "Read-only Auditor" in roles

def test_single_click_login_endpoint():
    res = client.post("/api/auth/login", json={"email": "admin@pravah.gov"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["email"] == "admin@pravah.gov"
    assert data["user"]["role"] == "System Administrator"
    assert "token" in data
