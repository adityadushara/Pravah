import React from "react";
import { SlidersHorizontal, Database, ShieldCheck, Server, Sun, Terminal } from "lucide-react";

interface SettingsViewProps {
  dbConnected: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ dbConnected }) => {
  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Platform Settings & System Diagnostics</h1>
          <p className="page-subtitle">
            Configuration parameters, database connectivity health, and interface defaults.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Database & Infrastructure Diagnostics</h3>
            <div className="card-subtitle">Verified Supabase / PostgreSQL operational status</div>
          </div>
          <span className={`status-pill ${dbConnected ? "healthy" : "low"}`}>
            <span className="status-indicator" /> {dbConnected ? "Connected" : "Offline Fallback"}
          </span>
        </div>

        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Database size={16} color="#2563eb" />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>Supabase Project Connection</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Target Endpoint: <code>https://zqcbkxzlzrhbjafqvnww.supabase.co</code>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Connection Mode: <strong>Session / Transaction Pooler (Port 6543)</strong>
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Server size={16} color="#16a34a" />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>FastAPI Backend</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                API Endpoint: <code>http://127.0.0.1:8000</code>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Version: <strong>0.2.0 (SIH Logistics Prototype)</strong>
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={16} color="#2563eb" />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>PostgreSQL Row Level Security</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Status: <strong>Active on all 10 tables</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Audit Policy: <strong>Append-Only (Updates/Deletes Forbidden)</strong>
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sun size={16} color="#d97706" />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>User Interface Theme</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Active Theme: <strong>Enterprise Light Theme (Permanent)</strong>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Aesthetics: <strong>Off-white background, white cards, restrained navy accents</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Windows PowerShell Execution Commands</h3>
            <div className="card-subtitle">Quick-reference commands for local environment</div>
          </div>
          <Terminal size={16} color="#64748b" />
        </div>
        <div className="card-body">
          <pre
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              background: "#0f172a",
              color: "#f8fafc",
              padding: "16px",
              borderRadius: 8,
              overflowX: "auto",
              lineHeight: 1.6,
            }}
          >
{`# 1. Start Backend (Terminal 1)
cd backend
.\\.venv\\Scripts\\Activate.ps1
uvicorn app.main:app --reload

# 2. Run Database Migrations (Terminal 1)
python scripts/migrate.py

# 3. Start Frontend (Terminal 2)
cd frontend
npm run dev`}
          </pre>
        </div>
      </div>
    </div>
  );
};
