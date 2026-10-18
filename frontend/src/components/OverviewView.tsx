import React from "react";
import {
  Boxes,
  Warehouse,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  PackageCheck,
  BrainCircuit,
  Info,
  ShieldCheck
} from "lucide-react";
import { SummaryData, InventoryItem, AlertItem } from "../types";

interface OverviewViewProps {
  summary: SummaryData | null;
  alerts: AlertItem[];
  inventory: InventoryItem[];
  onSelectForecast: (item: InventoryItem) => void;
  onNavigateTab: (tab: any) => void;
  onOpenTransaction: (item: InventoryItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  alerts,
  inventory,
  onSelectForecast,
  onNavigateTab,
  onOpenTransaction,
}) => {
  const healthyCount = inventory.filter((i) => i.status === "Healthy").length;
  const lowCount = inventory.filter((i) => i.status === "Low").length;
  const criticalCount = inventory.filter((i) => i.status === "Critical").length;
  const totalCount = inventory.length || 1;
  const readiness = Math.round((healthyCount / totalCount) * 100);

  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && a.status !== "resolved");

  return (
    <div>
      <div className="disclaimer-banner">
        <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Smart India Hackathon Prototype Mode:</strong> All supply depot coordinates, stock levels, and consumption
          rates represent fictional demonstration data. No real military installations, live operational feeds, or classified logistics records are used.
        </div>
      </div>

      <div className="page-header-row">
        <div>
          <h1 className="page-title">Operational Logistics Overview</h1>
          <p className="page-subtitle">
            Centralized monitoring of forward supply readiness, depot inventory balances, and baseline demand forecasts.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigateTab("inventory")}>
          View Full Inventory <ArrowUpRight size={14} />
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="metrics-row">
        <div className="metric-widget">
          <div className="metric-widget-top">
            <span>Supply Depots</span>
            <div className="metric-icon-wrap">
              <Warehouse size={18} />
            </div>
          </div>
          <div className="metric-number">{summary?.locations ?? 5}</div>
          <div className="metric-caption">Monitored logistics locations</div>
        </div>

        <div className="metric-widget">
          <div className="metric-widget-top">
            <span>Tracked Stock Items</span>
            <div className="metric-icon-wrap">
              <Boxes size={18} />
            </div>
          </div>
          <div className="metric-number">{inventory.length}</div>
          <div className="metric-caption">Active inventory records across hubs</div>
        </div>

        <div className="metric-widget">
          <div className="metric-widget-top">
            <span>Critical Warnings</span>
            <div className="metric-icon-wrap danger">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-number" style={{ color: "#dc2626" }}>
            {criticalCount}
          </div>
          <div className="metric-caption">Stock below 2 days daily usage</div>
        </div>

        <div className="metric-widget">
          <div className="metric-widget-top">
            <span>Supply Readiness</span>
            <div className="metric-icon-wrap success">
              <Activity size={18} />
            </div>
          </div>
          <div className="metric-number" style={{ color: readiness >= 70 ? "#16a34a" : "#d97706" }}>
            {readiness}%
          </div>
          <div className="metric-caption">{healthyCount} of {inventory.length} items above reorder level</div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "24px", marginBottom: "24px" }}>
        {/* RECENT INVENTORY ACTIVITY & STATUS */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Depot Stock Positions</h2>
              <div className="card-subtitle">Real-time balances synchronized from PostgreSQL/Supabase</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab("inventory")}>
              Manage Stock
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item / SKU</th>
                  <th>Depot Location</th>
                  <th>Stock Available</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 6).map((item) => (
                  <tr key={`${item.id}-${item.location_id}`}>
                    <td>
                      <div className="item-name-cell">
                        <strong>{item.name}</strong>
                        <span>{item.category} · {item.sku || item.id}</span>
                      </div>
                    </td>
                    <td>{item.location_name}</td>
                    <td>
                      <strong>{item.stock}</strong>{" "}
                      <span style={{ fontSize: 11, color: "#64748b" }}>{item.unit}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.days_remaining}</span> days
                    </td>
                    <td>
                      <span className={`status-pill ${item.status.toLowerCase()}`}>
                        <span className="status-indicator" />
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenTransaction(item)}
                          title="Record Receipt or Issue"
                        >
                          Transact
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onSelectForecast(item)}
                          title="View 7-day Demand Forecast"
                        >
                          Forecast
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ATTENTION REQUIRED ALERTS */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Risk Warnings & Signals</h2>
              <div className="card-subtitle">Automated thresholds based on daily consumption rate</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab("alerts")}>
              All ({alerts.length})
            </button>
          </div>

          <div className="card-body" style={{ padding: "16px" }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b" }}>
                <PackageCheck size={36} color="#16a34a" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontWeight: 600, color: "#0f172a" }}>All items are currently healthy</div>
                <div style={{ fontSize: 12 }}>No locations have fallen below risk threshold.</div>
              </div>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className={`alert-card ${alert.severity}`}>
                  <AlertTriangle
                    size={18}
                    color={alert.severity === "critical" ? "#dc2626" : "#d97706"}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div className="alert-card-content">
                    <div className="alert-card-title">{alert.title}</div>
                    <div className="alert-card-meta">{alert.location}</div>
                    <div className="alert-card-detail">{alert.detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LOWER ROW: DEMAND INTELLIGENCE & READINESS BREAKDOWN */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Demand Forecasting Intelligence</h2>
              <div className="card-subtitle">7-day moving-average baseline calculation</div>
            </div>
            <BrainCircuit size={18} color="#2563eb" />
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
              Pravah models projected forward consumption using authenticated historical records. Baseline predictions
              quantify supply burn-rate without claiming speculative machine learning models where unnecessary.
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                className="btn btn-primary"
                onClick={() => inventory[0] && onSelectForecast(inventory[0])}
              >
                Inspect Sample Forecast <ArrowUpRight size={14} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigateTab("forecasts")}
              >
                Model Intelligence View
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Inventory Health Breakdown</h2>
              <div className="card-subtitle">Stock safety buffer distribution</div>
            </div>
            <Activity size={18} color="#16a34a" />
          </div>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span><strong>Healthy:</strong> {healthyCount} items</span>
              <span><strong>Low:</strong> {lowCount} items</span>
              <span><strong>Critical:</strong> {criticalCount} items</span>
            </div>
            <div style={{ height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${(healthyCount / totalCount) * 100}%`, background: "#16a34a" }} title="Healthy" />
              <div style={{ width: `${(lowCount / totalCount) * 100}%`, background: "#d97706" }} title="Low" />
              <div style={{ width: `${(criticalCount / totalCount) * 100}%`, background: "#dc2626" }} title="Critical" />
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 12, lineHeight: 1.5 }}>
              Green: &gt; Reorder threshold · Amber: &le; Reorder threshold · Red: &le; 2 days daily usage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
