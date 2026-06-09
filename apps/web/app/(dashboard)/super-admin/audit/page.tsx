"use client";
import { ScrollText, Filter } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const ENTRIES = [
  { ts: "2026-06-09 14:32:11", user: "Lerato Dlamini",   role: "Admin",       action: "CREATE",   resource: "User",         detail: "Created member: priya.naidoo@email.com",           ip: "196.22.1.1"  },
  { ts: "2026-06-09 14:18:44", user: "Kwame Mensah",     role: "Manager",     action: "UPDATE",   resource: "Cohort",       detail: "Cohort #12 phase: EXPLORE -> BUILD",                ip: "154.0.7.2"   },
  { ts: "2026-06-09 14:05:03", user: "System (cron)",    role: "Super Admin", action: "TOGGLE",   resource: "FeatureFlag",  detail: "beta_payments enabled",                            ip: "10.0.0.1"    },
  { ts: "2026-06-09 13:52:18", user: "Lerato Dlamini",   role: "Admin",       action: "SUSPEND",  resource: "Organisation", detail: "Org: Absa Group (ID: org_9183) suspended",         ip: "196.22.1.1"  },
  { ts: "2026-06-09 13:40:55", user: "Sipho Ntuli",      role: "Manager",     action: "CREATE",   resource: "MentorMatch",  detail: "Matched mentor_id:m42 -> mentee_id:u891",          ip: "105.24.3.8"  },
  { ts: "2026-06-09 13:28:01", user: "Fatima Al-Rashid", role: "Admin",       action: "APPROVE",  resource: "Subscription", detail: "Tier upgrade: EXPLORER -> FOUNDER (Oluwaseun A.)", ip: "41.185.0.5"  },
  { ts: "2026-06-09 13:15:33", user: "Amara Diallo",     role: "Manager",     action: "PUBLISH",  resource: "Opportunity",  detail: "Published: GSMA Innovation Fund 2026",             ip: "197.254.1.9" },
  { ts: "2026-06-09 13:01:49", user: "Lerato Dlamini",   role: "Admin",       action: "UPDATE",   resource: "User",         detail: "Password reset for user: amara.diallo@email.com",  ip: "196.22.1.1"  },
];

const ACTION_COLORS: Record<string, string> = { CREATE: "#1e8c6e", UPDATE: "#5b4fcf", TOGGLE: "#b86e00", SUSPEND: "#c0392b", APPROVE: "#1b5ea6", PUBLISH: "#1e8c6e" };
const ROLE_COLORS:   Record<string, string> = { "Admin": "#5b4fcf", "Manager": "#1e8c6e", "Super Admin": "#c0392b" };

export default function AuditLogPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Activity Logs</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Immutable audit trail for all platform actions</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: `1px solid ${BORD}`, borderRadius: 8, color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>
          <Filter size={14} /> Filter
        </button>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: `1px solid ${BORD}` }}>
          <ScrollText size={15} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Showing latest 8 entries — export for full history</span>
        </div>
        {ENTRIES.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 150px 90px 80px 130px 1fr 100px", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < ENTRIES.length - 1 ? `1px solid ${BORD}` : "none" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontFamily: "monospace" }}>{e.ts}</span>
            <div>
              <div style={{ color: "var(--color-text-primary)", fontSize: 12, fontWeight: 600 }}>{e.user}</div>
              <span style={{ background: `${ROLE_COLORS[e.role] ?? "#5b4fcf"}22`, color: ROLE_COLORS[e.role] ?? "#5b4fcf", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 6px" }}>{e.role}</span>
            </div>
            <span style={{ background: `${ACTION_COLORS[e.action] ?? "#5b4fcf"}18`, color: ACTION_COLORS[e.action] ?? "#5b4fcf", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 8px", width: "fit-content" }}>{e.action}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{e.resource}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 10, fontFamily: "monospace" }}>{e.ip}</span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>{e.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
