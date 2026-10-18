import {
  SummaryData,
  InventoryItem,
  LocationItem,
  AlertItem,
  ForecastData,
  ShipmentItem,
  AuditLogItem,
  RoleItem
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchSummary(): Promise<SummaryData> {
  const res = await fetch(`${API_BASE}/api/summary`);
  if (!res.ok) throw new Error(`Summary fetch failed (${res.status})`);
  return res.json();
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/api/inventory`);
  if (!res.ok) throw new Error(`Inventory fetch failed (${res.status})`);
  return res.json();
}

export async function fetchLocations(): Promise<LocationItem[]> {
  const res = await fetch(`${API_BASE}/api/locations`);
  if (!res.ok) throw new Error(`Locations fetch failed (${res.status})`);
  return res.json();
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error(`Alerts fetch failed (${res.status})`);
  return res.json();
}

export async function acknowledgeAlert(alertId: string, actorId: string = "demo-user"): Promise<any> {
  const res = await fetch(`${API_BASE}/api/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor_id: actorId })
  });
  if (!res.ok) throw new Error("Acknowledge alert failed");
  return res.json();
}

export async function fetchForecast(itemId: string): Promise<ForecastData> {
  const res = await fetch(`${API_BASE}/api/forecast/${encodeURIComponent(itemId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Forecast unavailable");
  }
  return res.json();
}

export async function fetchShipments(): Promise<ShipmentItem[]> {
  const res = await fetch(`${API_BASE}/api/shipments`);
  if (!res.ok) throw new Error(`Shipments fetch failed (${res.status})`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  const res = await fetch(`${API_BASE}/api/audit-logs`);
  if (!res.ok) throw new Error(`Audit logs fetch failed (${res.status})`);
  return res.json();
}

export async function fetchRoles(): Promise<RoleItem[]> {
  const res = await fetch(`${API_BASE}/api/roles`);
  if (!res.ok) throw new Error(`Roles fetch failed (${res.status})`);
  return res.json();
}

export async function fetchDemoAccounts(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/demo-accounts`);
  if (!res.ok) throw new Error(`Demo accounts fetch failed (${res.status})`);
  return res.json();
}

export async function loginUser(email: string, password?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Authentication failed");
  }
  return data;
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) throw new Error(`Settings fetch failed (${res.status})`);
  return res.json();
}

export interface TransactionPayload {
  item_id: string;
  location_id: string;
  transaction_type: "receipt" | "issue" | "adjustment" | "transfer";
  quantity: number;
  to_location_id?: string;
  reason?: string;
  reference_no?: string;
  actor_id?: string;
}

export async function postInventoryTransaction(payload: TransactionPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/api/inventory/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Transaction failed with code ${res.status}`);
  }
  return data;
}
