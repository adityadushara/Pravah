import React, { useState } from "react";
import { Clock3, Search, ShieldCheck, Terminal } from "lucide-react";
import { AuditLogItem } from "../types";

interface AuditLogsViewProps {
  logs: AuditLogItem[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [query, setQuery] = useState("");

  const filtered = logs.filter((l) => {
    const q = query.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actor_id.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      JSON.stringify(l.metadata).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Immutable Audit Trail</h1>
          <p className="page-subtitle">
            Cryptographically sealed and transaction-backed ledger of all inventory operations.
          </p>
        </div>
      </div>

      <div className="disclaimer-banner" style={{ background: "#f8fafc", borderColor: "#cbd5e1", color: "#334155" }}>
        <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Tamper-Resistant Security:</strong> Row-Level Security (RLS) on PostgreSQL explicitly forbids UPDATE and DELETE
          operations on the <code>audit_logs</code> table. Every stock change writes a permanent audit record.
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or metadata..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Showing <strong>{filtered.length}</strong> recorded events
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor ID</th>
                <th>Operation</th>
                <th>Target Entity</th>
                <th>Transaction Payload / Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#1e3a8a",
                          background: "#eff6ff",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {log.actor_id}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: 0.5,
                          color:
                            log.action === "RECEIPT"
                              ? "#16a34a"
                              : log.action === "ISSUE"
                              ? "#dc2626"
                              : log.action === "TRANSFER"
                              ? "#2563eb"
                              : "#d97706",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#475569" }}>
                      {log.entity_type}
                    </td>
                    <td>
                      <div
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 11,
                          color: "#334155",
                          background: "#f8fafc",
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          maxWidth: 550,
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {JSON.stringify(log.metadata, null, 1)}
                      </div>
                    </td>
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
