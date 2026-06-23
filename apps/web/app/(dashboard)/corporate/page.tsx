"use client";
import { Users, TrendingUp, Calendar, FileText, ArrowUpRight } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const TEAM = [
  { name: "Sipho Ndlovu",     role: "Product Lead",    tier: "BUILDER",  progress: 82, lastActive: "Today"      },
  { name: "Amira Patel",      role: "Data Analyst",    tier: "BUILDER",  progress: 67, lastActive: "Yesterday"  },
  { name: "Kagiso Sithole",   role: "UX Designer",     tier: "BUILDER",  progress: 91, lastActive: "Today"      },
  { name: "Zanele Moyo",      role: "Backend Dev",     tier: "BUILDER",  progress: 55, lastActive: "3 days ago" },
];

export default function CorporateDashboardPage() {
  const avgProgress = Math.round(TEAM.reduce((s, m) => s + m.progress, 0) / TEAM.length);
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Corporate Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Absa Group — Corporate Account</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Team Members",      value: `${TEAM.length}/10`, sub: "seats used",     color: "#1b5ea6", icon: <Users size={17}/> },
          { label: "Avg Engagement",    value: `${avgProgress}%`,   sub: "programme progress", color: "#1e8c6e", icon: <TrendingUp size={17}/> },
          { label: "Upcoming Events",   value: "3",                  sub: "this month",     color: "#5b4fcf", icon: <Calendar size={17}/> },
          { label: "Compliance Docs",   value: "5/6",                sub: "submitted",      color: "#b86e00", icon: <FileText size={17}/> },
        ].map(k => (
          <div key={k.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: k.color }}>{k.icon}</span></div>
              <ArrowUpRight size={14} style={{ color: "#1e8c6e" }} />
            </div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 26, fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{k.label}</div>
            <div style={{ color: k.color, fontSize: 11, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Team Engagement</span></div>
        {TEAM.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 100px", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: i < TEAM.length - 1 ? `1px solid ${BORD}` : "none" }}>
            <div>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{m.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{m.role}</div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Progress</span>
                <span style={{ color: "#1e8c6e", fontWeight: 700, fontSize: 12 }}>{m.progress}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}><div style={{ width: `${m.progress}%`, height: "100%", background: "#1b5ea6", borderRadius: 99 }}/></div>
            </div>
            <span style={{ background: "rgba(27,94,166,0.12)", color: "#1b5ea6", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{m.tier}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{m.lastActive}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
