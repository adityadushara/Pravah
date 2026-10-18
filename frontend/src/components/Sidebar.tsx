import React from "react";
import {
  LayoutDashboard,
  Boxes,
  BrainCircuit,
  Warehouse,
  Truck,
  AlertTriangle,
  Clock3,
  Users,
  Settings as SettingsIcon,
  ShieldCheck,
  Command,
  Database,
  LogOut
} from "lucide-react";
import { NavTab, DemoAccount, getRolePermissions } from "../types";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount: number;
  dbConnected: boolean;
  userRole: string;
  currentUser?: DemoAccount | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  alertCount,
  dbConnected,
  userRole,
  currentUser,
  onLogout,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "inventory", label: "Inventory", icon: <Boxes size={18} /> },
    { id: "forecasts", label: "Demand Forecasts", icon: <BrainCircuit size={18} /> },
    { id: "locations", label: "Supply Locations", icon: <Warehouse size={18} /> },
    { id: "transportation", label: "Transportation", icon: <Truck size={18} /> },
    { id: "alerts", label: "Alerts", icon: <AlertTriangle size={18} />, badge: alertCount },
    { id: "audit_logs", label: "Audit Logs", icon: <Clock3 size={18} /> },
    { id: "users", label: "User Management", icon: <Users size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ];

  const roleConfig = getRolePermissions(userRole);
  const visibleNavItems = navItems.filter((item) => roleConfig.allowedTabs.includes(item.id));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Command size={22} />
          </div>
          <div>
            <div className="brand-title">PRAVAH</div>
            <div className="brand-subtitle">Predictive Logistics</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav-container">
        <div className="nav-section-label">Accessible Dashboards</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? "active" : ""}`}
              onClick={() => onSelectTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="env-status-badge">
          <Database size={14} color={dbConnected ? "#16a34a" : "#ca8a04"} />
          <span style={{ fontWeight: 600 }}>
            {dbConnected ? "Supabase Live DB" : "In-Memory Prototype"}
          </span>
          <span
            className="status-dot"
            style={{ backgroundColor: dbConnected ? "#16a34a" : "#ca8a04" }}
          />
        </div>

        <div className="user-profile-widget" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <div className="user-avatar" style={{ background: "#2563eb", color: "#ffffff" }}>
              {currentUser?.avatar || userRole.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name || "Authorized Operator"}</div>
              <div className="user-role-label">{currentUser?.role || userRole}</div>
            </div>
          </div>
          {onLogout && (
            <button
              className="btn-icon"
              style={{ width: 28, height: 28, flexShrink: 0 }}
              onClick={onLogout}
              title="Switch Account / Sign Out"
            >
              <LogOut size={14} color="#64748b" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
