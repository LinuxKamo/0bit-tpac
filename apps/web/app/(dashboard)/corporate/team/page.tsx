"use client";
import { Users, Plus, MoreHorizontal } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const SEATS = [
  { name: "Sipho Ndlovu",   email: "sipho@absa.co.za",   role: "Product Lead",  status: "active",   joined: "Jan 2026"   },
  { name: "Amira Patel",    email: "amira@absa.co.za",   role: "Data Analyst",  status: "active",   joined: "Jan 2026"   },
  { name: "Kagiso Sithole", email: "kagiso@absa.co.za",  role: "UX Designer",   status: "active",   joined: "Feb 2026"   },
  { name: "Zanele Moyo",    email: "zanele@absa.co.za",  role: "Backend Dev",   status: "active",   joined: "Mar 2026"   },
  { name: "(open seat)",    email: "-",                   role: "-",             status: "open",     joined: "-"          },
];

export default function TeamPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Team Members</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage your organisation seats (4/10 used)</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1b5ea6", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Invite Member</button>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {SEATS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < SEATS.length - 1 ? `1px solid ${BORD}` : "none", opacity: s.status === "open" ? 0.4 : 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.status === "open" ? "rgba(255,255,255,0.06)" : "rgba(27,94,166,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={15} style={{ color: "#1b5ea6" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{s.email}</div>
            </div>
            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{s.role}</span>
            <span style={{ background: s.status === "active" ? "rgba(30,140,110,0.12)" : "rgba(255,255,255,0.06)", color: s.status === "active" ? "#1e8c6e" : "var(--color-text-muted)", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{s.status}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{s.joined}</span>
            {s.status !== "open" && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><MoreHorizontal size={16}/></button>}
          </div>
        ))}
      </div>
    </div>
  );
}
