import React, { useState } from "react";
import { Truck, Navigation, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ShipmentItem, LocationItem } from "../types";

interface TransportationViewProps {
  shipments: ShipmentItem[];
  locations: LocationItem[];
}

export const TransportationView: React.FC<TransportationViewProps> = ({
  shipments,
  locations,
}) => {
  const [filter, setFilter] = useState("all");

  const filtered = shipments.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const getStatusBadge = (status: ShipmentItem["status"]) => {
    switch (status) {
      case "in_transit":
        return (
          <span className="status-pill" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
            <span className="status-indicator" style={{ background: "#2563eb" }} /> In Transit
          </span>
        );
      case "planned":
        return (
          <span className="status-pill" style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1" }}>
            <span className="status-indicator" style={{ background: "#64748b" }} /> Planned
          </span>
        );
      case "delivered":
        return (
          <span className="status-pill healthy">
            <span className="status-indicator" /> Delivered
          </span>
        );
      case "dispatched":
        return (
          <span className="status-pill" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
            <span className="status-indicator" style={{ background: "#d97706" }} /> Dispatched
          </span>
        );
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Transportation & Convoy Logistics</h1>
          <p className="page-subtitle">
            Inter-depot movement planning, scheduled transfers, and shipment dispatch monitoring.
          </p>
        </div>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div className="disclaimer-banner" style={{ background: "#fefce8", borderColor: "#fde047", color: "#854d0e" }}>
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Transportation Prototype Notice:</strong> This module models scheduled cargo manifests and inter-depot movements.
          It does <strong>not</strong> connect to live vehicle telemetry, classified military convoy routes, or live GIS satellite routing systems.
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("all")}
            >
              All Movements ({shipments.length})
            </button>
            <button
              className={`btn btn-sm ${filter === "in_transit" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("in_transit")}
            >
              In Transit
            </button>
            <button
              className={`btn btn-sm ${filter === "planned" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("planned")}
            >
              Planned
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Manifest Ref</th>
                <th>Route (Origin &rarr; Destination)</th>
                <th>Cargo Summary</th>
                <th>Scheduled Dispatch</th>
                <th>Estimated Arrival</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No shipments match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ fontFamily: "JetBrains Mono, monospace", color: "#1e3a8a" }}>
                        {s.reference_no}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                        <span>{s.origin_name}</span>
                        <ArrowRight size={14} color="#64748b" />
                        <span style={{ color: "#2563eb" }}>{s.destination_name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#334155" }}>{s.cargo_summary || "General replenishment"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                        <Clock size={13} />
                        {s.planned_dispatch ? new Date(s.planned_dispatch).toLocaleString() : "TBD"}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                        <Clock size={13} />
                        {s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleString() : "TBD"}
                      </div>
                    </td>
                    <td>{getStatusBadge(s.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
