from typing import Literal, Optional, List, Any, Dict
from pydantic import BaseModel, Field, field_validator

class InventoryTransactionRequest(BaseModel):
    item_id: str = Field(..., description="Item SKU (e.g. food-001) or Item UUID")
    location_id: str = Field(..., description="Location Code (e.g. loc-north) or Location UUID")
    transaction_type: Literal["receipt", "issue", "adjustment", "transfer"]
    quantity: float = Field(..., description="Quantity to transact. Must be positive.")
    to_location_id: Optional[str] = Field(None, description="Destination location code or UUID for transfers.")
    reason: Optional[str] = Field(None, description="Documented justification (mandatory for adjustments).")
    reference_no: Optional[str] = Field(None, description="Voucher or PO reference number.")
    actor_id: Optional[str] = Field("demo-officer", description="User ID or identifier of actor.")

    @field_validator("quantity")
    @classmethod
    def validate_positive_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Quantity must be strictly positive (greater than 0).")
        return v

    @field_validator("reason")
    @classmethod
    def validate_adjustment_reason(cls, v: Optional[str], info) -> Optional[str]:
        # If transaction_type is adjustment, reason must be non-empty
        tx_type = info.data.get("transaction_type")
        if tx_type == "adjustment" and (not v or not v.strip()):
            raise ValueError("A documented reason is mandatory for stock adjustments.")
        return v

class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category: str
    location_id: str
    location_name: str
    stock: float
    daily_usage: float
    reorder_level: float
    unit: str
    days_remaining: float
    status: Literal["Critical", "Low", "Healthy"]
    sku: Optional[str] = None
    item_uuid: Optional[str] = None
    location_uuid: Optional[str] = None

class LocationResponse(BaseModel):
    id: str
    name: str
    code: str
    region: Optional[str] = None
    location_type: Optional[str] = "Depot"
    description: Optional[str] = None
    is_active: bool = True

class AlertResponse(BaseModel):
    id: str
    severity: Literal["critical", "warning", "info"]
    title: str
    location: str
    detail: str
    item_id: Optional[str] = None
    status: Literal["open", "acknowledged", "resolved"] = "open"
    created_at: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    actor_id: Optional[str] = "demo-user"

class ForecastResponse(BaseModel):
    item_id: str
    item_name: str
    method: str
    training_performed: bool
    historical_observations: int
    predicted_daily_demand: float
    current_stock: float
    estimated_days_remaining: float
    forecast_horizon_days: int
    projected_7_day_demand: float
    model_status: str = "Active baseline"
    note: str

class ShipmentResponse(BaseModel):
    id: str
    reference_no: str
    origin_name: str
    destination_name: str
    status: Literal["planned", "dispatched", "in_transit", "delivered", "cancelled"]
    cargo_summary: Optional[str] = None
    planned_dispatch: Optional[str] = None
    estimated_arrival: Optional[str] = None

class CreateShipmentRequest(BaseModel):
    origin_location_id: str
    destination_location_id: str
    cargo_summary: str
    reference_no: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    metadata: Dict[str, Any]
    created_at: str

class SummaryResponse(BaseModel):
    locations: int
    inventory_items: int
    critical_items: int
    low_items: int
    total_stock_records: int
    items: List[InventoryItemResponse]
    database_connected: bool
    data_mode: str

class HealthResponse(BaseModel):
    status: str
    project: str
    data_mode: str
    database_connected: bool
    database_configured: bool
