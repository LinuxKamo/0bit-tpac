"use client";
import { useEffect, useState } from "react";
import { Activity, Users, AlertTriangle, Shield, TrendingUp, TrendingDown, Circle } from "lucide-react";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

function StatCard({ icon, label, value, trend, trendUp, color }: any) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: trendUp ? "#1e8c6e" : "#c0392b", fontSize: 12, fontWeight: 600 }}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <div style={{ color: "var(--color-text-primary)", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

const LOGS = [
  { time: "14:32", role: "Admin",       roleColor: "#5b4fcf", action: "Created member account - Priya Naidoo",         country: "ZA"     },
  { time: "14:18", role: "Manager",     roleColor: "#1e8c6e", action: "Updated cohort 12 phase to Build",              country: "KE"     },
  { time: "14:05", role: "Super Admin", roleColor: "#c0392b", action: "Toggled feature flag: Beta Payments",           country: "Global" },
  { time: "13:52", role: "Admin",       roleColor: "#5b4fcf", action: "Suspended corporate account - Absa Group",      country: "ZA"     },
  { time: "13:40", role: "Manager",     roleColor: "#1e8c6e", action: "Matched mentor Thandiwe Mokoena with mentee",   country: "NG"     },
  { time: "13:28", role: "Admin",       roleColor: "#1b5ea6", action: "Approved Founder tier upgrade - Oluwaseun A.",  country: "NG"     },
  { time: "13:15", role: "Manager",     roleColor: "#1e8c6e", action: "Published opportunity: GSMA Innovation Fund",   country: "Global" },
  { time: "13:01", role: "Admin",       roleColor: "#5b4fcf", action: "Reset password - Amara Diallo",                country: "GH"     },
  { time: "12:44", role: "Super Admin", roleColor: "#c0392b", action: "Enabled Rwanda country configuration",         country: "Global" },
  { time: "12:30", role: "Manager",     roleColor: "#1e8c6e", action: "Closed event registrations: Tech Summit 2026", country: "ZA"     },
];

function GaugeBar({ label, value }: { label: string; value: number }) {
  const c = value > 85 ? "#c0392b" : value > 70 ? "#b86e00" : "#1e8c6e";
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{label}</span>
        <span style={{ color: c, fontSize: 13, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${value}%`, height: "100%", background: c, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 3000); return () => clearInterval(t); }, []);
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Real-time monitoring</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Activity size={17}/>}     label="Platform Uptime"  value="99.97%"                             trend="+0.02%" trendUp color="#1e8c6e" />
        <StatCard icon={<Users size={17}/>}         label="Active Sessions"  value={(1247 + (tick % 5)).toLocaleString()} trend="+124" trendUp color="#5b4fcf" />
        <StatCard icon={<AlertTriangle size={17}/>} label="Error Rate Today" value="0.12%"                             trend="-0.04%" trendUp color="#b86e00" />
        <StatCard icon={<Shield size={17}/>}        label="Admin Accounts"   value="14"                                trend="+2"     trendUp color="#1b5ea6" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ borderRadius: 12, background: CARD, border: `1px solid ${BORD}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e8c6e" }} />
              <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Real-time Activity</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>LIVE</span>
          </div>
          <div style={{ maxHeight: 460, overflowY: "auto" }}>
            {LOGS.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${BORD}` }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, minWidth: 38, marginTop: 1 }}>{e.time}</span>
                <span style={{ background: `${e.roleColor}22`, color: e.roleColor, fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 8px", flexShrink: 0 }}>{e.role}</span>
                <span style={{ color: "var(--color-text-secondary)", fontSize: 12, flex: 1 }}>{e.action}</span>
                <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>{e.country}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: 12, background: CARD, border: `1px solid ${BORD}` }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}>
            <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>System Health</span>
          </div>
          <div style={{ padding: 20 }}>
            <GaugeBar label="CPU Usage" value={42} />
            <GaugeBar label="Memory"    value={67} />
            <GaugeBar label="Storage"   value={55} />
            <div style={{ borderRadius: 8, padding: 12, background: "rgba(30,140,110,0.1)", border: "1px solid rgba(30,140,110,0.2)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Circle size={8} style={{ fill: "#1e8c6e", color: "#1e8c6e" }} />
                <span style={{ color: "#1e8c6e", fontSize: 12, fontWeight: 600 }}>All systems operational</span>
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 4 }}>Last incident: 12 days ago</div>
            </div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: "0.06em" }}>SERVICES</div>
            {[{ name: "Auth Service", ok: true }, { name: "Payment API", ok: true }, { name: "Email Service", ok: true }, { name: "Storage CDN", ok: false }, { name: "Search Index", ok: true }].map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{s.name}</span>
                <span style={{ background: s.ok ? "rgba(30,140,110,0.15)" : "rgba(192,57,43,0.15)", color: s.ok ? "#1e8c6e" : "#c0392b", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 8px" }}>{s.ok ? "OK" : "DEGRADED"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
