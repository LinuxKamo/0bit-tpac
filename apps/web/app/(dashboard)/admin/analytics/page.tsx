"use client";
import { BarChart3, TrendingUp, Users, Globe } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SIGNUPS = [210, 310, 295, 420, 540, 610];
const MAX_S = Math.max(...SIGNUPS);

export default function AnalyticsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Analytics</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Growth metrics and engagement data</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Member Growth",      value: "+127",    sub: "this month",    color: "#5b4fcf", icon: <Users size={17}/> },
          { label: "Active Rate",        value: "82%",     sub: "30-day active", color: "#1e8c6e", icon: <TrendingUp size={17}/> },
          { label: "Avg Session (min)",  value: "14.2",    sub: "+2.1 vs LM",   color: "#b86e00", icon: <BarChart3 size={17}/> },
          { label: "Country Coverage",   value: "4",       sub: "live countries",color: "#1b5ea6", icon: <Globe size={17}/> },
        ].map(k => (
          <div key={k.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><span style={{ color: k.color }}>{k.icon}</span></div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 26, fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{k.label}</div>
            <div style={{ color: "#1e8c6e", fontSize: 11, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 24, marginBottom: 16 }}>
        <div style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Member Signups — 2026</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
          {MONTHS.map((m, i) => {
            const h = Math.round((SIGNUPS[i] / MAX_S) * 140);
            return (
              <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#5b4fcf", fontSize: 11, fontWeight: 700 }}>{SIGNUPS[i]}</span>
                <div style={{ width: "100%", height: h, background: "linear-gradient(to top, #5b4fcf, #8b7fef)", borderRadius: "4px 4px 0 0" }} />
                <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{m}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
