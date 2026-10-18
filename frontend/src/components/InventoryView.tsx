import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
  ArrowRightLeft,
  BrainCircuit,
  Package
} from "lucide-react";
import { InventoryItem, LocationItem } from "../types";

interface InventoryViewProps {
  inventory: InventoryItem[];
  locations: LocationItem[];
  onOpenTransaction: (item: InventoryItem, defaultType?: "receipt" | "issue" | "adjustment" | "transfer") => void;
  onOpenForecast: (item: InventoryItem) => void;
  loading: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  locations,
  onOpenTransaction,
  onOpenForecast,
  loading,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((i) => i.category && set.add(i.category));
    return Array.from(set).sort();
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku || "").toLowerCase().includes(search.toLowerCase()) ||
        item.location_name.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchLocation =
        selectedLocation === "all" ||
        item.location_id === selectedLocation ||
        item.location_name === selectedLocation;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;

      return matchSearch && matchCategory && matchLocation && matchStatus;
    });
  }, [inventory, search, selectedCategory, selectedLocation, selectedStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredItems, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const paginatedItems = sortedItems.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">
            Manage depot stock balances, receive consignments, dispatch issues, and perform atomic transfers.
          </p>
        </div>
      </div>

      <div className="card">
        {/* TOOLBAR */}
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name, SKU, or depot..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filters-group">
            <Filter size={15} color="#64748b" />
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.code || loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Low">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                  Supply Item / SKU <ArrowUpDown size={12} style={{ display: "inline" }} />
                </th>
                <th>Category</th>
                <th onClick={() => toggleSort("location_name")} style={{ cursor: "pointer" }}>
                  Location Depot <ArrowUpDown size={12} style={{ display: "inline" }} />
                </th>
                <th onClick={() => toggleSort("stock")} style={{ cursor: "pointer" }}>
                  Available Balance <ArrowUpDown size={12} style={{ display: "inline" }} />
                </th>
                <th>Reorder Level</th>
                <th onClick={() => toggleSort("days_remaining")} style={{ cursor: "pointer" }}>
                  Days Remaining <ArrowUpDown size={12} style={{ display: "inline" }} />
                </th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Stock Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                    Loading database inventory records...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                    <Package size={32} style={{ margin: "0 auto 8px", color: "#94a3b8" }} />
                    <div style={{ fontWeight: 600 }}>No inventory items matched your criteria.</div>
                    <div style={{ fontSize: 12 }}>Try clearing your search query or filters.</div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={`${item.id}-${item.location_id}`}>
                    <td>
                      <div className="item-name-cell">
                        <strong>{item.name}</strong>
                        <span>{item.sku || item.id}</span>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location_name}</td>
                    <td>
                      <strong style={{ fontSize: 14 }}>{item.stock}</strong>{" "}
                      <span style={{ fontSize: 11, color: "#64748b" }}>{item.unit}</span>
                    </td>
                    <td>
                      {item.reorder_level} {item.unit}
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
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onOpenTransaction(item, "receipt")}
                          title="Record Receipt of Stock"
                        >
                          <PlusCircle size={13} /> Receive
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onOpenTransaction(item, "issue")}
                          title="Issue Stock"
                        >
                          <MinusCircle size={13} /> Issue
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenTransaction(item, "transfer")}
                          title="Atomic Transfer to Another Depot"
                        >
                          <ArrowRightLeft size={13} /> Transfer
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenTransaction(item, "adjustment")}
                          title="Stock Adjustment (Requires Justification)"
                        >
                          <SlidersHorizontal size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenForecast(item)}
                          title="Demand Forecast"
                        >
                          <BrainCircuit size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          <span>
            Showing <strong>{paginatedItems.length}</strong> of <strong>{sortedItems.length}</strong> records
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ padding: "4px 8px", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
