import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LoginPage } from "./components/LoginPage";
import { OverviewView } from "./components/OverviewView";
import { InventoryView } from "./components/InventoryView";
import { ForecastsView } from "./components/ForecastsView";
import { LocationsView } from "./components/LocationsView";
import { TransportationView } from "./components/TransportationView";
import { AlertsView } from "./components/AlertsView";
import { AuditLogsView } from "./components/AuditLogsView";
import { UserManagementView } from "./components/UserManagementView";
import { SettingsView } from "./components/SettingsView";
import { TransactionModal } from "./components/TransactionModal";
import {
  NavTab,
  SummaryData,
  InventoryItem,
  LocationItem,
  AlertItem,
  ShipmentItem,
  AuditLogItem,
  RoleItem,
  DemoAccount,
} from "./types";
import {
  fetchSummary,
  fetchInventory,
  fetchLocations,
  fetchAlerts,
  fetchShipments,
  fetchAuditLogs,
  fetchRoles,
  fetchDemoAccounts,
} from "./api";
import { AlertCircle, ShieldCheck, X } from "lucide-react";

const INITIAL_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@pravah.gov",
    name: "Col. R. Kapoor",
    role: "System Administrator",
    avatar: "RK",
    badge: "Admin",
    description: "Full administrative control and user role configuration."
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "logistics@pravah.gov",
    name: "Maj. V. Sharma",
    role: "Senior Logistics Officer",
    avatar: "VS",
    badge: "Logistics",
    description: "Forward logistics oversight, allocations, and stock reviews."
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "inventory@pravah.gov",
    name: "Capt. A. Verma",
    role: "Inventory Officer",
    avatar: "AV",
    badge: "Depot Stock",
    description: "Direct stock receipts, issues, and depot balance reconciliation."
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "transport@pravah.gov",
    name: "Lt. S. Nair",
    role: "Transportation Officer",
    avatar: "SN",
    badge: "Movements",
    description: "Convoy scheduling, planned shipments, and transfer routes."
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "analyst@pravah.gov",
    name: "Dr. P. Sen",
    role: "Forecasting Analyst",
    avatar: "PS",
    badge: "Analytics",
    description: "Demand burn-rate analysis and baseline consumption modeling."
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    email: "auditor@pravah.gov",
    name: "Inspector K. Mehta",
    role: "Read-only Auditor",
    avatar: "KM",
    badge: "Auditor",
    description: "Read-only compliance checks and immutable audit log review."
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<DemoAccount | null>(() => {
    try {
      const stored = localStorage.getItem("pravah_active_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [userRole, setUserRole] = useState<string>(
    currentUser?.role || "Senior Logistics Officer"
  );

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(INITIAL_DEMO_ACCOUNTS);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Modal states
  const [txModalItem, setTxModalItem] = useState<InventoryItem | null>(null);
  const [txDefaultType, setTxDefaultType] = useState<"receipt" | "issue" | "adjustment" | "transfer">("receipt");
  const [selectedForecastItem, setSelectedForecastItem] = useState<InventoryItem | null>(null);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sumData, invData, locData, alertData, shipData, auditData, roleData, demoAccData] = await Promise.all([
        fetchSummary().catch(() => null),
        fetchInventory().catch(() => []),
        fetchLocations().catch(() => []),
        fetchAlerts().catch(() => []),
        fetchShipments().catch(() => []),
        fetchAuditLogs().catch(() => []),
        fetchRoles().catch(() => []),
        fetchDemoAccounts().catch(() => INITIAL_DEMO_ACCOUNTS),
      ]);

      if (sumData) setSummary(sumData);
      setInventory(invData);
      setLocations(locData);
      setAlerts(alertData);
      setShipments(shipData);
      setAuditLogs(auditData);
      setRoles(roleData);
      if (demoAccData && demoAccData.length > 0) {
        setDemoAccounts(demoAccData);
      }
    } catch (err: any) {
      setError("Cannot connect to FastAPI backend at http://127.0.0.1:8000. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (account: DemoAccount) => {
    setCurrentUser(account);
    setUserRole(account.role);
    try {
      localStorage.setItem("pravah_active_user", JSON.stringify(account));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("pravah_active_user");
    } catch {}
  };

  const handleRoleChange = (newRole: string) => {
    setUserRole(newRole);
    const matched = demoAccounts.find((a) => a.role === newRole);
    if (matched) {
      setCurrentUser(matched);
      try {
        localStorage.setItem("pravah_active_user", JSON.stringify(matched));
      } catch {}
    }
  };

  const handleOpenTransaction = (
    item: InventoryItem,
    type: "receipt" | "issue" | "adjustment" | "transfer" = "receipt"
  ) => {
    setTxModalItem(item);
    setTxDefaultType(type);
  };

  const handleOpenForecast = (item: InventoryItem) => {
    setSelectedForecastItem(item);
    setCurrentTab("forecasts");
  };

  const handleSelectLocationFilter = (locationCode: string) => {
    setCurrentTab("inventory");
  };

  // If user is not logged in, display the Single-Click Demo Login Page
  if (!currentUser) {
    return (
      <LoginPage
        demoAccounts={demoAccounts}
        onLoginSuccess={handleLogin}
        onSingleClickLogin={handleLogin}
      />
    );
  }

  const dbConnected = summary?.database_connected ?? true;

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alertCount={alerts.filter((a) => a.status === "open").length}
        dbConnected={dbConnected}
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="main-viewport">
        <TopBar
          currentTab={currentTab}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          onRefresh={loadData}
          loading={loading}
          onOpenHelp={() => setHelpOpen(true)}
          currentUser={currentUser}
          onSwitchAccount={handleLogout}
        />

        <main className="content-body">
          {error && (
            <div className="error-alert">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadData}>
                Retry Connection
              </button>
            </div>
          )}

          {currentTab === "overview" && (
            <OverviewView
              summary={summary}
              alerts={alerts}
              inventory={inventory}
              onSelectForecast={handleOpenForecast}
              onNavigateTab={setCurrentTab}
              onOpenTransaction={(item) => handleOpenTransaction(item, "receipt")}
            />
          )}

          {currentTab === "inventory" && (
            <InventoryView
              inventory={inventory}
              locations={locations}
              onOpenTransaction={handleOpenTransaction}
              onOpenForecast={handleOpenForecast}
              loading={loading}
            />
          )}

          {currentTab === "forecasts" && (
            <ForecastsView
              inventory={inventory}
              preselectedItem={selectedForecastItem}
            />
          )}

          {currentTab === "locations" && (
            <LocationsView
              locations={locations}
              inventory={inventory}
              onSelectLocation={handleSelectLocationFilter}
            />
          )}

          {currentTab === "transportation" && (
            <TransportationView
              shipments={shipments}
              locations={locations}
            />
          )}

          {currentTab === "alerts" && (
            <AlertsView
              alerts={alerts}
              onAlertAcknowledged={loadData}
            />
          )}

          {currentTab === "audit_logs" && (
            <AuditLogsView logs={auditLogs} />
          )}

          {currentTab === "users" && (
            <UserManagementView roles={roles} demoAccounts={demoAccounts} />
          )}

          {currentTab === "settings" && (
            <SettingsView dbConnected={dbConnected} />
          )}
        </main>
      </div>

      {/* TRANSACTION MODAL */}
      {txModalItem && (
        <TransactionModal
          item={txModalItem}
          locations={locations}
          defaultType={txDefaultType}
          onClose={() => setTxModalItem(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* HELP & SECURITY MODAL */}
      {helpOpen && (
        <div className="modal-overlay" onClick={() => setHelpOpen(false)} role="dialog">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h3 className="modal-title">Pravah Prototype Architecture</h3>
              </div>
              <button className="btn-icon" onClick={() => setHelpOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              <p style={{ marginBottom: 12 }}>
                <strong>Pravah</strong> is a predictive logistics and forward supply-chain intelligence dashboard built for
                the Smart India Hackathon prototype challenge.
              </p>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Security & Data Isolation
              </h4>
              <ul style={{ paddingLeft: 18, marginBottom: 14 }}>
                <li>Connected to PostgreSQL / Supabase with Row-Level Security (RLS) active on all 10 tables.</li>
                <li>All data is synthetic demonstration data. No classified or real military coordinates exist.</li>
                <li>Inventory mutations are atomic and verified through PostgreSQL transactions.</li>
                <li>Audit logs are immutable append-only records with updates/deletes prohibited by policy.</li>
              </ul>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Forecasting Transparency
              </h4>
              <p>
                Demand forecasting uses a verifiable 7-day moving-average baseline from historical daily usage observations.
                No unvalidated black-box AI claims are made.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setHelpOpen(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
