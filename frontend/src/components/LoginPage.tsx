import React, { useState } from "react";
import { Command, ShieldCheck, ArrowRight, Lock, Mail, KeyRound, Check, Sparkles } from "lucide-react";
import { DemoAccount } from "../types";

interface LoginPageProps {
  demoAccounts: DemoAccount[];
  onLoginSuccess: (account: DemoAccount) => void;
  onSingleClickLogin: (account: DemoAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  demoAccounts,
  onLoginSuccess,
  onSingleClickLogin,
}) => {
  const [email, setEmail] = useState("admin@pravah.gov");
  const [password, setPassword] = useState("Pravah@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const matched = demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!matched) {
      setError("Account not found. Please choose one of the registered demo accounts below.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(matched);
    }, 250);
  };

  const handleQuickClick = (account: DemoAccount) => {
    setActiveCardId(account.id);
    setEmail(account.email);
    setPassword("Pravah@2026");
    onSingleClickLogin(account);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "min(880px, 100%)" }}>
        {/* BRAND HEADER */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                borderRadius: 10,
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
              }}
            >
              <Command size={26} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "#0f172a" }}>
                PRAVAH
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase" }}>
                Predictive Logistics & Forward Supply Chain
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", maxWidth: 540, margin: "0 auto" }}>
            Authorized operator portal for forward depot stock visibility, demand projection, and logistics coordination.
          </p>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              background: "#fafbfc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              <Lock size={16} color="#2563eb" />
              <span>Operator Sign-In & Single-Click Access</span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 9999,
                background: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <ShieldCheck size={13} /> Supabase RLS Active
            </span>
          </div>

          <div style={{ padding: "28px" }}>
            {error && <div className="error-alert" style={{ marginBottom: 20 }}>{error}</div>}

            {/* SINGLE CLICK DEMO ROLES SECTION */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={16} color="#2563eb" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Single-Click Demo Accounts (Instant Access)
                </h3>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                Click on any authorized role below to sign in immediately with full pre-configured permissions:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {demoAccounts.map((acc) => {
                  const isSelected = activeCardId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickClick(acc)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "14px",
                        background: isSelected ? "#eff6ff" : "#ffffff",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        borderRadius: 10,
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s ease-in-out",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#93c5fd";
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isSelected ? "#2563eb" : "#e2e8f0";
                        e.currentTarget.style.background = isSelected ? "#eff6ff" : "#ffffff";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: isSelected ? "#2563eb" : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#1e3a8a",
                          fontWeight: 700,
                          fontSize: 13,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {acc.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>{acc.name}</strong>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "#f1f5f9",
                              color: "#475569",
                            }}
                          >
                            {acc.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginTop: 2 }}>
                          {acc.role}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>
                          {acc.email}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.4 }}>
                          {acc.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIVIDER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                margin: "24px 0 20px",
                color: "#94a3b8",
                fontSize: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span>Or sign in manually with credentials</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* MANUAL LOGIN FORM */}
            <form onSubmit={handleManualSubmit} style={{ maxWidth: 440, margin: "0 auto" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Operator Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. admin@pravah.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 34 }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 10, top: 11 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: 34 }}
                  />
                  <KeyRound size={16} color="#94a3b8" style={{ position: "absolute", left: 10, top: 11 }} />
                </div>
                <div className="form-hint">
                  Demo password for all seeded accounts is: <code>Pravah@2026</code>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "10px", marginTop: 8 }}
                disabled={loading}
              >
                {loading ? "Authenticating Operator..." : "Authenticate & Open Workspace"} <ArrowRight size={15} />
              </button>
            </form>
          </div>

          <div
            style={{
              padding: "14px 24px",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              fontSize: 11.5,
              color: "#64748b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>Pravah Logistics Intelligence Prototype · Smart India Hackathon</span>
            <span>All accounts use fictional credentials & synthetic demo data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
