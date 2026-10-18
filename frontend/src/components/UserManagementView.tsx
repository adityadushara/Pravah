import React from "react";
import {
  Users,
  Shield,
  Key,
  Lock,
  Check,
  Mail,
  LayoutDashboard,
  Boxes,
  BrainCircuit,
  Warehouse,
  Truck,
  AlertTriangle,
  Clock3,
  Settings,
  ArrowRight,
  Sparkles,
  MapPin,
  KeyRound,
  ShieldCheck,
  Info
} from "lucide-react";
import { RoleItem, DemoAccount, ROLE_PERMISSIONS, NavTab } from "../types";

interface UserManagementViewProps {
  roles: RoleItem[];
  demoAccounts?: DemoAccount[];
  onSelectRole?: (role: string) => void;
  onSwitchToAccount?: (account: DemoAccount) => void;
}

const DASHBOARD_METAS: Record<
  NavTab,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  overview: {
    label: "Overview",
    icon: <LayoutDashboard size={12} />,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  inventory: {
    label: "Inventory",
    icon: <Boxes size={12} />,
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  forecasts: {
    label: "Demand Forecasts",
    icon: <BrainCircuit size={12} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  locations: {
    label: "Supply Locations",
    icon: <Warehouse size={12} />,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  transportation: {
    label: "Transportation",
    icon: <Truck size={12} />,
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  alerts: {
    label: "Alerts & Risks",
    icon: <AlertTriangle size={12} />,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  audit_logs: {
    label: "Audit Logs",
    icon: <Clock3 size={12} />,
    color: "#475569",
    bg: "#f1f5f9",
    border: "#cbd5e1",
  },
  users: {
    label: "User Management",
    icon: <Users size={12} />,
    color: "#9333ea",
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
  settings: {
    label: "Settings",
    icon: <Settings size={12} />,
    color: "#334155",
    bg: "#f8fafc",
    border: "#e2e8f0",
  },
};

const ROLE_ENTRIES = [
  {
    role: "System Administrator",
    operator: "Col. R. Kapoor",
    email: "admin@pravah.gov",
    avatar: "RK",
    station: "Army HQ (New Delhi)",
    clearance: "Level 5: Top Secret (Admin)",
    clearanceColor: "#7c3aed",
    clearanceBg: "#f5f3ff",
    summary: "Full administrative control, user roles & settings configuration",
    testScenario: "Inspect full 9 dashboards. Configure user roles, check Supabase pooler health, review cryptographic audit ledger.",
  },
  {
    role: "Senior Logistics Officer",
    operator: "Maj. V. Sharma",
    email: "logistics@pravah.gov",
    avatar: "VS",
    station: "Northern Command Logistics Depot",
    clearance: "Level 4: Secret (Operational)",
    clearanceColor: "#2563eb",
    clearanceBg: "#eff6ff",
    summary: "Forward logistics oversight, allocations, and stock reviews",
    testScenario: "Accesses 7 dashboards. Notice User Admin and Settings are hidden. Can approve transfers and review AI demand models.",
  },
  {
    role: "Inventory Officer",
    operator: "Capt. A. Verma",
    email: "inventory@pravah.gov",
    avatar: "AV",
    station: "14 Corps Forward Base (Leh)",
    clearance: "Level 3: Confidential (Depot)",
    clearanceColor: "#059669",
    clearanceBg: "#ecfdf5",
    summary: "Depot stock management, receipts, issues, transfers & adjustments",
    testScenario: "Only 4 dashboards accessible (Overview, Inventory, Locations, Alerts). Perform stock receipts with atomic transactions.",
  },
  {
    role: "Transportation Officer",
    operator: "Lt. K. Singh",
    email: "transport@pravah.gov",
    avatar: "KS",
    station: "Northern Transit Hub (Srinagar)",
    clearance: "Level 3: Confidential (Convoy)",
    clearanceColor: "#0284c7",
    clearanceBg: "#f0f9ff",
    summary: "Convoy route tracking, dispatch approvals, and depot transits",
    testScenario: "Only 4 dashboards accessible (Overview, Transportation, Locations, Alerts). Notice Inventory is completely hidden.",
  },
  {
    role: "Forecasting Analyst",
    operator: "Dr. P. Nair",
    email: "analyst@pravah.gov",
    avatar: "PN",
    station: "Defense Analytics Wing (Pune)",
    clearance: "Level 3: Confidential (Analytics)",
    clearanceColor: "#d97706",
    clearanceBg: "#fffbeb",
    summary: "Demand intelligence modeling, stock exhaustion projections",
    testScenario: "Only 4 dashboards accessible. In Inventory, all stock mutation buttons are hidden (Read-Only access).",
  },
  {
    role: "Read-only Auditor",
    operator: "Insp. S. Gupta",
    email: "auditor@pravah.gov",
    avatar: "SG",
    station: "Central Inspectorate Directorate",
    clearance: "Level 2: Compliance Auditor",
    clearanceColor: "#475569",
    clearanceBg: "#f1f5f9",
    summary: "Compliance audit trail verification and immutable ledger review",
    testScenario: "Only 4 dashboards accessible (Overview, Inventory, Alerts, Audit Logs). Cannot mutate stock or acknowledge alerts.",
  },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  roles,
  demoAccounts,
  onSelectRole,
  onSwitchToAccount,
}) => {
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

      {/* DEMO EVALUATION GUIDE & INTERACTIVE PERSONA CARDS */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color="#2563eb" />
              <h3 className="card-title">Live Prototype Evaluation Scenarios</h3>
            </div>
            <div className="card-subtitle">
              Pre-seeded military operator personas — click any card to instantly switch persona and test RBAC dashboard scoping
            </div>
          </div>
          <span className="status-pill healthy">
            <KeyRound size={12} /> Default Demo Password: <strong>Pravah@2026</strong>
          </span>
        </div>

        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {ROLE_ENTRIES.map((entry) => {
              const matchedAcc = demoAccounts?.find((a) => a.role === entry.role);
              const config = ROLE_PERMISSIONS[entry.role] || { allowedTabs: [] };
              return (
                <div
                  key={entry.role}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: entry.clearanceColor,
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {entry.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                            {entry.operator}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: entry.clearanceColor }}>
                            {entry.role}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: config.allowedTabs.length === 9 ? "#ecfdf5" : "#eff6ff",
                          color: config.allowedTabs.length === 9 ? "#059669" : "#2563eb",
                        }}
                      >
                        {config.allowedTabs.length} / 9 Tabs
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", marginBottom: 8 }}>
                      <MapPin size={12} color="#94a3b8" />
                      <span>{entry.station}</span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontWeight: 600, color: entry.clearanceColor }}>{entry.clearance}</span>
                    </div>

                    <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.45, marginBottom: 12, background: "#f8fafc", padding: "8px 10px", borderRadius: 6, border: "1px solid #f1f5f9" }}>
                      <strong style={{ color: "#0f172a", fontSize: 11, display: "block", marginBottom: 2 }}>
                        🧪 Evaluation Scenario:
                      </strong>
                      {entry.testScenario}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>
                        Accessible Dashboards:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {config.allowedTabs.map((tab) => {
                          const meta = DASHBOARD_METAS[tab];
                          if (!meta) return null;
                          return (
                            <span
                              key={tab}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: meta.bg,
                                color: meta.color,
                                border: `1px solid ${meta.border}`,
                              }}
                            >
                              {meta.icon}
                              <span>{meta.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%", justifyContent: "center", fontSize: 12, fontWeight: 600, gap: 6 }}
                    onClick={() => {
                      if (matchedAcc && onSwitchToAccount) {
                        onSwitchToAccount(matchedAcc);
                      } else if (onSelectRole) {
                        onSelectRole(entry.role);
                      }
                    }}
                  >
                    <span>Switch to {entry.operator.split(" ")[0]} ({entry.role})</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACCESSIBLE DASHBOARDS TABLE */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Accessible Dashboards Per Role</h3>
            <div className="card-subtitle">
              Strict RBAC enforcement — only authorized dashboards are displayed in navigation and accessible to each role
            </div>
          </div>
          <span className="status-pill healthy">
            <Lock size={12} /> Least Privilege Model
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Role Title & Station</th>
                <th style={{ width: "44%" }}>Accessible Dashboards (Scoped per Role)</th>
                <th style={{ width: "20%" }}>Operational Scope & Clearance</th>
                <th style={{ width: "14%", textAlign: "center" }}>Access Scope</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_ENTRIES.map((entry) => {
                const config = ROLE_PERMISSIONS[entry.role] || {
                  allowedTabs: [],
                };
                const matchedAcc = demoAccounts?.find((a) => a.role === entry.role);
                return (
                  <tr key={entry.role}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: entry.clearanceBg,
                            color: entry.clearanceColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          <Key size={16} />
                        </div>
                        <div>
                          <strong style={{ color: "#0f172a", fontSize: 13 }}>{entry.role}</strong>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {entry.operator} • <span style={{ color: "#475569" }}>{entry.station}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 0" }}>
                        {config.allowedTabs.map((tab) => {
                          const meta = DASHBOARD_METAS[tab];
                          if (!meta) return null;
                          return (
                            <span
                              key={tab}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: meta.bg,
                                color: meta.color,
                                border: `1px solid ${meta.border}`,
                              }}
                            >
                              {meta.icon}
                              <span>{meta.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.4, marginBottom: 4 }}>
                        {entry.summary}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: entry.clearanceBg,
                          color: entry.clearanceColor,
                        }}
                      >
                        {entry.clearance}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className="status-pill"
                        style={{
                          background: config.allowedTabs.length === 9 ? "#ecfdf5" : "#f1f5f9",
                          color: config.allowedTabs.length === 9 ? "#059669" : "#475569",
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {config.allowedTabs.length} / 9 Dashboards
                      </span>
                      <div style={{ marginTop: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => {
                            if (matchedAcc && onSwitchToAccount) {
                              onSwitchToAccount(matchedAcc);
                            } else if (onSelectRole) {
                              onSelectRole(entry.role);
                            }
                          }}
                        >
                          <span>Preview</span>
                          <ArrowRight size={11} style={{ marginLeft: 3 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYSTEM ROLE DEFINITIONS */}
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

      {/* REGISTERED OPERATOR ACCOUNTS */}
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
                  <th>Demo Password</th>
                  <th>Access Scope</th>
                  <th style={{ textAlign: "center" }}>Action</th>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: 4, width: "fit-content" }}>
                        <KeyRound size={12} color="#059669" />
                        <span>Pravah@2026</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#475569" }}>{acc.description}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {onSwitchToAccount && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => onSwitchToAccount(acc)}
                          title="Instant single-click demo switch"
                        >
                          <span>Log In</span>
                          <ArrowRight size={11} style={{ marginLeft: 3 }} />
                        </button>
                      )}
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
