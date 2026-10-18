import React, { useState, useEffect } from "react";
import { BrainCircuit, Info, AlertCircle, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { InventoryItem, ForecastData } from "../types";
import { fetchForecast } from "../api";

interface ForecastsViewProps {
  inventory: InventoryItem[];
  preselectedItem?: InventoryItem | null;
}

export const ForecastsView: React.FC<ForecastsViewProps> = ({
  inventory,
  preselectedItem,
}) => {
  const [selectedItemKey, setSelectedItemKey] = useState<string>(
    preselectedItem ? preselectedItem.sku || preselectedItem.id : inventory[0]?.sku || inventory[0]?.id || "food-001"
  );
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeItem = inventory.find((i) => (i.sku || i.id) === selectedItemKey) || inventory[0];

  useEffect(() => {
    if (!selectedItemKey) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchForecast(selectedItemKey)
      .then((data) => {
        if (!cancelled) setForecast(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load forecast data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedItemKey]);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Demand Forecasts & Consumption Intelligence</h1>
          <p className="page-subtitle">
            Algorithmic burn-rate estimates and baseline projections to anticipate depot stockouts.
          </p>
        </div>
      </div>

      {/* MODEL INTEGRITY DISCLAIMER */}
      <div className="disclaimer-banner" style={{ background: "#f8fafc", borderColor: "#cbd5e1", color: "#334155" }}>
        <Info size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: "#0f172a" }}>Forecasting Model Transparency:</strong> All calculations currently utilize a{" "}
          <strong>7-day moving-average baseline</strong> calculated strictly from historical observations. No machine-learning model is claimed to be trained. Model status:{" "}
          <span style={{ color: "#16a34a", fontWeight: 600 }}>Active Baseline (Deterministic)</span>.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label htmlFor="forecast-item-select" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
              Select Inventory Item:
            </label>
            <select
              id="forecast-item-select"
              className="filter-select"
              value={selectedItemKey}
              onChange={(e) => setSelectedItemKey(e.target.value)}
              style={{ minWidth: 260 }}
            >
              {inventory.map((item) => (
                <option key={`${item.id}-${item.location_id}`} value={item.sku || item.id}>
                  {item.name} ({item.sku || item.id}) — {item.location_name}
                </option>
              ))}
            </select>
          </div>
          <span className="status-pill healthy">
            <CheckCircle size={12} /> Baseline Model Validated
          </span>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Calculating baseline forecast from consumption history...
            </div>
          ) : error ? (
            <div className="error-alert">{error}</div>
          ) : forecast ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                    {forecast.item_name}
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Target SKU: <strong>{forecast.item_id}</strong> · Method: <strong>{forecast.method}</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    Forecast Horizon
                  </div>
                  <strong style={{ fontSize: 16, color: "#2563eb" }}>
                    {forecast.forecast_horizon_days} Days Forward
                  </strong>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="forecast-stats-grid">
                <div className="forecast-stat-box">
                  <span>Predicted Daily Demand</span>
                  <strong>
                    {forecast.predicted_daily_demand}{" "}
                    <small style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>/ day</small>
                  </strong>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Based on 7-day trailing average
                  </div>
                </div>

                <div className="forecast-stat-box">
                  <span>7-Day Forward Burn</span>
                  <strong>{forecast.projected_7_day_demand}</strong>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Projected consumption volume
                  </div>
                </div>

                <div className="forecast-stat-box">
                  <span>Stock Runway</span>
                  <strong style={{ color: forecast.estimated_days_remaining <= 2 ? "#dc2626" : "#0f172a" }}>
                    {forecast.estimated_days_remaining}{" "}
                    <small style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>days</small>
                  </strong>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    {forecast.current_stock} units currently on hand
                  </div>
                </div>
              </div>

              {/* HISTORICAL OBSERVATIONS TABLE */}
              {forecast.history && forecast.history.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                    Historical Consumption Observations (Last {forecast.history.length} Days)
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      height: 120,
                      padding: "12px 16px",
                      background: "#fafbfc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    {forecast.history.map((val, idx) => {
                      const maxVal = Math.max(...(forecast.history || [1]));
                      const heightPercent = Math.max(15, Math.round((val / maxVal) * 100));
                      const isRecent7 = idx >= (forecast.history?.length || 0) - 7;
                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{val}</span>
                          <div
                            style={{
                              width: "100%",
                              height: `${heightPercent}%`,
                              backgroundColor: isRecent7 ? "#2563eb" : "#cbd5e1",
                              borderRadius: "4px 4px 0 0",
                            }}
                            title={`Day -${(forecast.history?.length || 0) - idx}: ${val} units`}
                          />
                          <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>
                            D-{ (forecast.history?.length || 0) - idx }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 10, height: 10, background: "#2563eb", borderRadius: 2 }} />
                      Active 7-Day Window (Used for Projection)
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 10, height: 10, background: "#cbd5e1", borderRadius: 2 }} />
                      Older Observation History
                    </span>
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: 20,
                  padding: 12,
                  background: "#f1f5f9",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <strong>Operational Note:</strong> {forecast.note}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
