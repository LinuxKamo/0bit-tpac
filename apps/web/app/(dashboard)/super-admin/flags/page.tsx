"use client";
import { useState } from "react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const INIT_FLAGS = [
  { key: "beta_payments",          label: "Beta Payments",          desc: "Stripe + Paystack dual-payment flow",        env: "Global", enabled: false },
  { key: "ai_mentor_matching",     label: "AI Mentor Matching",     desc: "ML-powered mentor-mentee recommendations",   env: "Global", enabled: true  },
  { key: "cohort_certificates",    label: "Cohort Certificates",    desc: "Auto-generate PDF completion certificates",  env: "ZA",     enabled: true  },
  { key: "diaspora_tier",          label: "Diaspora Tier",          desc: "Unlock Diaspora membership tier globally",   env: "Global", enabled: false },
  { key: "corporate_sso",          label: "Corporate SSO",          desc: "SAML 2.0 SSO for corporate accounts",        env: "Global", enabled: false },
  { key: "opportunity_alerts",     label: "Opportunity Alerts",     desc: "Push notifications for new opportunities",   env: "Global", enabled: true  },
  { key: "multi_language",         label: "Multi-language UI",      desc: "French, Swahili, Arabic UI support",         env: "Global", enabled: false },
  { key: "peer_review_content",    label: "Peer Review Content",    desc: "Community peer-review for uploaded content", env: "Global", enabled: true  },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(INIT_FLAGS);
  const toggle = (key: string) => setFlags(f => f.map(fl => fl.key === key ? { ...fl, enabled: !fl.enabled } : fl));
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Feature Flags</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Enable or disable platform features without a deployment</p>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {flags.map((f, i) => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: i < flags.length - 1 ? `1px solid ${BORD}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 600 }}>{f.label}</span>
                <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>{f.env}</span>
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 3 }}>{f.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: f.enabled ? "#1e8c6e" : "var(--color-text-muted)", fontSize: 12, fontWeight: 600 }}>{f.enabled ? "Enabled" : "Disabled"}</span>
              <button onClick={() => toggle(f.key)} style={{ width: 44, height: 24, borderRadius: 99, background: f.enabled ? "#5b4fcf" : "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: f.enabled ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
