"use client";
import { Circle, Server, Database, Wifi, Cpu } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

function ServiceRow({ icon, name, status, latency, uptime }: any) {
  const ok = status === "operational";
  const dg = status === "degraded";
  const c  = ok ? "#1e8c6e" : dg ? "#b86e00" : "#c0392b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${BORD}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: c }}>{icon}</span></div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Circle size={6} style={{ fill: c, color: c }} />
          <span style={{ color: c, fontSize: 11, fontWeight: 600 }}>{status}</span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 700 }}>{latency}</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>avg latency</div>
      </div>
      <div style={{ textAlign: "right", minWidth: 60 }}>
        <div style={{ color: "#1e8c6e", fontSize: 13, fontWeight: 700 }}>{uptime}</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>uptime</div>
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>System Health</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Infrastructure status and performance metrics</p>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Services</span></div>
        <ServiceRow icon={<Server size={16}/>}   name="API Server (Railway)"   status="operational" latency="124ms" uptime="99.98%" />
        <ServiceRow icon={<Database size={16}/>} name="Database (Supabase)"    status="operational" latency="8ms"   uptime="99.99%" />
        <ServiceRow icon={<Wifi size={16}/>}     name="Storage CDN"            status="degraded"    latency="450ms" uptime="98.12%" />
        <ServiceRow icon={<Server size={16}/>}   name="Email Service (Resend)" status="operational" latency="55ms"  uptime="99.95%" />
        <ServiceRow icon={<Cpu size={16}/>}      name="Search Index"           status="operational" latency="32ms"  uptime="99.90%" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { label: "Total Requests (24h)",  value: "1.24M", sub: "+18% vs yesterday" },
          { label: "Cache Hit Rate",         value: "87.3%", sub: "Redis layer"        },
          { label: "DB Connections",         value: "124/200", sub: "Supabase pool"   },
        ].map(m => (
          <div key={m.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 8 }}>{m.label}</div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 28, fontWeight: 800 }}>{m.value}</div>
            <div style={{ color: "#1e8c6e", fontSize: 11, marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
