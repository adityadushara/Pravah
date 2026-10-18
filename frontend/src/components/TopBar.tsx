import React from "react";
import { RefreshCw, ShieldCheck, ChevronRight, HelpCircle, LogOut } from "lucide-react";
import { NavTab, DemoAccount } from "../types";

interface TopBarProps {
  currentTab: NavTab;
  userRole: string;
  onRoleChange: (newRole: string) => void;
  onRefresh: () => void;
  loading: boolean;
  onOpenHelp: () => void;
  currentUser?: DemoAccount | null;
  onSwitchAccount?: () => void;
}

const ROLES = [
  "Senior Logistics Officer",
  "Inventory Officer",
  "Transportation Officer",
  "Forecasting Analyst",
  "Read-only Auditor",
  "System Administrator"
];

const TAB_TITLES: Record<NavTab, string> = {
  overview: "Operational Overview",
  inventory: "Inventory Management",
  forecasts: "Demand Intelligence & Forecasts",
  locations: "Supply Depots & Forward Bases",
  transportation: "Transportation & Shipments",
  alerts: "Risk Signals & Stock Warnings",
  audit_logs: "System Audit Trail",
  users: "User & Role Administration",
  settings: "Platform Settings & Diagnostics",
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  userRole,
  onRoleChange,
  onRefresh,
  loading,
  onOpenHelp,
  currentUser,
  onSwitchAccount,
}) => {
  return (
    <header className="topbar">
      <div className="breadcrumb-nav">
        <span>Workspace</span>
        <ChevronRight size={14} />
        <span className="current">{TAB_TITLES[currentTab]}</span>
      </div>

      <div className="topbar-right">
        <div className="role-select-box">
          <ShieldCheck size={16} color="#2563eb" />
          <label htmlFor="role-select" style={{ fontSize: 11, color: "#64748b" }}>Role Preview:</label>
          <select
            id="role-select"
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-icon"
          onClick={onRefresh}
          title="Refresh real-time data"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin-animation" : ""} />
        </button>

        <button
          className="btn-icon"
          onClick={onOpenHelp}
          title="Prototype & Security Information"
        >
          <HelpCircle size={16} />
        </button>

        {onSwitchAccount && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onSwitchAccount}
            title="Switch demo account or sign in as another role"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px" }}
          >
            <LogOut size={13} color="#64748b" />
            <span>Switch Account</span>
          </button>
        )}
      </div>
    </header>
  );
};
