export type StatusType = "Critical" | "Low" | "Healthy";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location_id: string;
  location_name: string;
  stock: number;
  daily_usage: number;
  reorder_level: number;
  unit: string;
  days_remaining: number;
  status: StatusType;
  sku?: string;
  item_uuid?: string;
  location_uuid?: string;
}

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  location: string;
  detail: string;
  item_id?: string;
  status: "open" | "acknowledged" | "resolved";
  created_at?: string;
}

export interface LocationItem {
  id: string;
  code: string;
  name: string;
  location_type?: string;
  region?: string;
  description?: string;
  is_active?: boolean;
}

export interface ShipmentItem {
  id: string;
  reference_no: string;
  origin_name: string;
  destination_name: string;
  status: "planned" | "dispatched" | "in_transit" | "delivered" | "cancelled";
  cargo_summary?: string;
  planned_dispatch?: string;
  estimated_arrival?: string;
}

export interface AuditLogItem {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
}

export interface DemoAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  badge: string;
  description: string;
}

export interface SummaryData {
  locations: number;
  inventory_items: number;
  critical_items: number;
  low_items: number;
  total_stock_records: number;
  database_connected: boolean;
  data_mode: string;
  items: InventoryItem[];
}

export interface ForecastData {
  item_id: string;
  item_name: string;
  method: string;
  training_performed: boolean;
  historical_observations: number;
  predicted_daily_demand: number;
  current_stock: number;
  estimated_days_remaining: number;
  forecast_horizon_days: number;
  projected_7_day_demand: number;
  model_status?: string;
  note: string;
  history?: number[];
  error?: string;
}

export type NavTab =
  | "overview"
  | "inventory"
  | "forecasts"
  | "locations"
  | "transportation"
  | "alerts"
  | "audit_logs"
  | "users"
  | "settings";

export interface RolePermissionConfig {
  allowedTabs: NavTab[];
  canMutateInventory: boolean;
  canManageShipments: boolean;
  canManageUsers: boolean;
  canAcknowledgeAlerts: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissionConfig> = {
  "System Administrator": {
    allowedTabs: ["overview", "inventory", "forecasts", "locations", "transportation", "alerts", "audit_logs", "users", "settings"],
    canMutateInventory: true,
    canManageShipments: true,
    canManageUsers: true,
    canAcknowledgeAlerts: true,
    canViewAuditLogs: true,
  },
  "Senior Logistics Officer": {
    allowedTabs: ["overview", "inventory", "forecasts", "locations", "transportation", "alerts", "audit_logs"],
    canMutateInventory: true,
    canManageShipments: true,
    canManageUsers: false,
    canAcknowledgeAlerts: true,
    canViewAuditLogs: true,
  },
  "Inventory Officer": {
    allowedTabs: ["overview", "inventory", "locations", "alerts"],
    canMutateInventory: true,
    canManageShipments: false,
    canManageUsers: false,
    canAcknowledgeAlerts: true,
    canViewAuditLogs: false,
  },
  "Transportation Officer": {
    allowedTabs: ["overview", "transportation", "locations", "alerts"],
    canMutateInventory: false,
    canManageShipments: true,
    canManageUsers: false,
    canAcknowledgeAlerts: true,
    canViewAuditLogs: false,
  },
  "Forecasting Analyst": {
    allowedTabs: ["overview", "forecasts", "inventory", "locations"],
    canMutateInventory: false,
    canManageShipments: false,
    canManageUsers: false,
    canAcknowledgeAlerts: false,
    canViewAuditLogs: false,
  },
  "Read-only Auditor": {
    allowedTabs: ["overview", "inventory", "alerts", "audit_logs"],
    canMutateInventory: false,
    canManageShipments: false,
    canManageUsers: false,
    canAcknowledgeAlerts: false,
    canViewAuditLogs: true,
  },
};

export function getRolePermissions(roleName: string): RolePermissionConfig {
  return (
    ROLE_PERMISSIONS[roleName] ||
    ROLE_PERMISSIONS["Read-only Auditor"]
  );
}

