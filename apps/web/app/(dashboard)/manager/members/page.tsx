"use client";
import { useState } from "react";
import { Search, UserCheck, UserX, MoreHorizontal } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const TIER_COLORS: Record<string, string> = { EXPLORER: "#5b4fcf", BUILDER: "#1e8c6e", FOUNDER: "#b86e00", CORPORATE: "#1b5ea6", DIASPORA: "#c0392b" };

const MEMBERS = [
  { name: "Priya Naidoo",     email: "priya@email.com",   tier: "BUILDER",  status: "active",  joined: "Today",       attendance: "92%" },
  { name: "Sipho Dube",       email: "sipho@email.com",   tier: "EXPLORER", status: "active",  joined: "2 days ago",  attendance: "78%" },
  { name: "Fatou Sow",        email: "fatou@email.com",   tier: "DIASPORA", status: "active",  joined: "1 week ago",  attendance: "65%" },
  { name: "Amara Diallo",     email: "amara@email.com",   tier: "EXPLORER", status: "pending", joined: "3 hrs ago",   attendance: "-"   },
  { name: "Zaid Ouma",        email: "zaid@email.com",    tier: "BUILDER",  status: "pending", joined: "10 min ago",  attendance: "-"   },
];

export default function ManagerMembersPage() {
  const [search, setSearch] = useState("");
  const filtered = MEMBERS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Members</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage community members for your country</p>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={15} style={{ color: "var(--color-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." style={{ flex: 1, background: "transparent", border: "none", color: "var(--color-text-primary)", fontSize: 13, outline: "none" }} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORD}` }}>
            {["Member", "Tier", "Status", "Joined", "Attendance", ""].map(h => <th key={h} style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, textAlign: "left", padding: "10px 20px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${BORD}` }}>
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{m.email}</div>
                </td>
                <td style={{ padding: "12px 20px" }}><span style={{ background: `${TIER_COLORS[m.tier]}18`, color: TIER_COLORS[m.tier], fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{m.tier}</span></td>
                <td style={{ padding: "12px 20px" }}><span style={{ background: m.status === "active" ? "rgba(30,140,110,0.12)" : "rgba(184,110,0,0.12)", color: m.status === "active" ? "#1e8c6e" : "#b86e00", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{m.status}</span></td>
                <td style={{ padding: "12px 20px", color: "var(--color-text-muted)", fontSize: 12 }}>{m.joined}</td>
                <td style={{ padding: "12px 20px", color: m.attendance === "-" ? "var(--color-text-muted)" : "#1e8c6e", fontSize: 12, fontWeight: 600 }}>{m.attendance}</td>
                <td style={{ padding: "12px 20px" }}>
                  {m.status === "pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ padding: "4px 10px", background: "rgba(30,140,110,0.15)", border: "none", borderRadius: 6, color: "#1e8c6e", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><UserCheck size={11}/> Approve</button>
                      <button style={{ padding: "4px 10px", background: "rgba(192,57,43,0.12)", border: "none", borderRadius: 6, color: "#c0392b", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><UserX size={11}/> Reject</button>
                    </div>
                  ) : (
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><MoreHorizontal size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
