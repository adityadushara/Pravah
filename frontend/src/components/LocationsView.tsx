import React from "react";
import { Warehouse, MapPin, CheckCircle, Package } from "lucide-react";
import { LocationItem, InventoryItem } from "../types";

interface LocationsViewProps {
  locations: LocationItem[];
  inventory: InventoryItem[];
  onSelectLocation: (locationCode: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  inventory,
  onSelectLocation,
}) => {
  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Supply Locations & Forward Depots</h1>
          <p className="page-subtitle">
            Monitored operational hubs, forward bases, and reserve holding depots in the fictional supply network.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {locations.map((loc) => {
          const locItems = inventory.filter(
            (i) => i.location_id === loc.code || i.location_name === loc.name || i.location_uuid === loc.id
          );
          const totalUnits = locItems.reduce((acc, curr) => acc + curr.stock, 0);
          const criticalItems = locItems.filter((i) => i.status === "Critical").length;
          const lowItems = locItems.filter((i) => i.status === "Low").length;

          return (
            <div key={loc.id} className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">{loc.name}</h3>
                  <div className="card-subtitle">
                    {loc.location_type || "Depot"} · Code: <strong>{loc.code}</strong>
                  </div>
                </div>
                <span className="status-pill healthy">
                  <CheckCircle size={12} /> Active
                </span>
              </div>

              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                  <MapPin size={15} color="#2563eb" />
                  <span>{loc.region || "Sector Demonstration Area"}</span>
                </div>

                <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
                  {loc.description || "Forward logistical depot supporting regional distribution detachments."}
                </p>

                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Tracked Items</span>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{locItems.length} SKUs</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Total Stored Volume</span>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{totalUnits.toLocaleString()} units</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Stock Health Risk</span>
                    {criticalItems > 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>
                        {criticalItems} Critical
                      </span>
                    ) : lowItems > 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>
                        {lowItems} Low Stock
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
                        Optimal
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", fontSize: 12 }}
                  onClick={() => onSelectLocation(loc.code || loc.id)}
                >
                  <Package size={14} /> Filter Inventory for {loc.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
