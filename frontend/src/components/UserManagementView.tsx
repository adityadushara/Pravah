import React from "react";
import { Users, Shield, Key, Lock, Check, X, Mail } from "lucide-react";
import { RoleItem, DemoAccount } from "../types";

interface UserManagementViewProps {
  roles: RoleItem[];
  demoAccounts?: DemoAccount[];
}

interface PermissionRow {
  role: string;
  manageUsers: boolean;
  stockTransactions: boolean;
  approveShipments: boolean;
  modelAnalytics: boolean;
  readAuditLogs: boolean;
}

const PERMISSION_MATRIX: PermissionRow[] = [
  {
    role: "System Administrator",
    manageUsers: true,
    stockTransactions: true,
    approveShipments: true,
    modelAnalytics: true,
    readAuditLogs: true,
  },
  {
    role: "Senior Logistics Officer",
    manageUsers: false,
    stockTransactions: true,
    approveShipments: true,
    modelAnalytics: true,
    readAuditLogs: true,
  },
  {
    role: "Inventory Officer",
    manageUsers: false,
    stockTransactions: true,
    approveShipments: false,
    modelAnalytics: false,
    readAuditLogs: false,
  },
  {
    role: "Transportation Officer",
    manageUsers: false,
    stockTransactions: false,
    approveShipments: true,
    modelAnalytics: false,
    readAuditLogs: false,
  },
  {
    role: "Forecasting Analyst",
    manageUsers: false,
    stockTransactions: false,
    approveShipments: false,
    modelAnalytics: true,
    readAuditLogs: true,
  },
  {
    role: "Read-only Auditor",
    manageUsers: false,
    stockTransactions: false,
    approveShipments: false,
    modelAnalytics: false,
    readAuditLogs: true,
  },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({ roles, demoAccounts }) => {
  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">User & Role Administration</h1>
          <p className="page-subtitle">
            Role-Based Access Control (RBAC) security matrix and operator permission scopes.
          </p>
        </div>
      </div>

      <div className="disclaimer-banner">
        <Shield size={18} color="#1e3a8a" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Security Architecture Notice:</strong> Role assignments are governed by the <code>public.user_roles</code> table
          and PostgreSQL RLS policies. The top navigation bar role switcher is a <strong>prototype demonstration aid</strong> for
          evaluating the user experience across personas. Production enforcement is strictly validated on the FastAPI backend and database.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Role-Based Access Control (RBAC) Matrix</h3>
            <div className="card-subtitle">Server-enforced operational capabilities per role</div>
          </div>
          <span className="status-pill healthy">
            <Lock size={12} /> Least Privilege Model
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Title</th>
                <th style={{ textAlign: "center" }}>User Administration</th>
                <th style={{ textAlign: "center" }}>Inventory Mutations</th>
                <th style={{ textAlign: "center" }}>Convoy & Shipments</th>
                <th style={{ textAlign: "center" }}>Demand Modeling</th>
                <th style={{ textAlign: "center" }}>Audit Trail Access</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.role}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Key size={14} />
                      </div>
                      <strong style={{ color: "#0f172a" }}>{row.role}</strong>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.manageUsers ? <Check size={16} color="#16a34a" /> : <X size={16} color="#94a3b8" />}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.stockTransactions ? <Check size={16} color="#16a34a" /> : <X size={16} color="#94a3b8" />}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.approveShipments ? <Check size={16} color="#16a34a" /> : <X size={16} color="#94a3b8" />}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.modelAnalytics ? <Check size={16} color="#16a34a" /> : <X size={16} color="#94a3b8" />}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {row.readAuditLogs ? <Check size={16} color="#16a34a" /> : <X size={16} color="#94a3b8" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">System Role Definitions</h3>
            <div className="card-subtitle">Configured roles in public.roles</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {roles.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "14px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 4 }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  {r.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {demoAccounts && demoAccounts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Registered Operator Accounts (Supabase Auth & Profiles)</h3>
              <div className="card-subtitle">Active accounts seeded with credentials in PostgreSQL</div>
            </div>
            <span className="status-pill healthy">
              <Check size={12} /> {demoAccounts.length} Accounts Seeded
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Operator Name</th>
                  <th>Assigned Role</th>
                  <th>Email Login</th>
                  <th>Access Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {demoAccounts.map((acc: DemoAccount) => (
                  <tr key={acc.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: 12,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {acc.avatar}
                        </div>
                        <div>
                          <strong style={{ color: "#0f172a" }}>{acc.name}</strong>
                          <div style={{ fontSize: 11, color: "#64748b" }}>ID: {acc.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: "#1e3a8a", fontSize: 13 }}>{acc.role}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#334155" }}>
                        <Mail size={13} color="#64748b" />
                        <span>{acc.email}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#475569" }}>{acc.description}</span>
                    </td>
                    <td>
                      <span className="status-pill healthy">
                        <span className="status-indicator" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
