from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_is_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["data_mode"] == "synthetic-demo"

def test_inventory_has_derived_fields():
    response = client.get("/api/inventory")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all("days_remaining" in item and "status" in item for item in items)

def test_forecast_is_transparent_about_baseline():
    item_id = "food-001"
    response = client.get(f"/api/forecast/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["method"] == "7-day moving-average baseline"
    assert data["training_performed"] is False
    assert data["predicted_daily_demand"] > 0

def test_unknown_forecast_item_returns_404():
    assert client.get("/api/forecast/not-real").status_code == 404
