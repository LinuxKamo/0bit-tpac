"use client";
import { UserCheck, Plus, Clock } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const MATCHES = [
  { mentor: "Thandiwe Mokoena", mentee: "Sipho Dube",      focus: "Product Design", sessions: 6, status: "active"  },
  { mentor: "Kwame Asante",     mentee: "Priya Naidoo",    focus: "FinTech",        sessions: 3, status: "active"  },
  { mentor: "Amira Hassan",     mentee: "Zaid Ouma",       focus: "AI & Data",      sessions: 0, status: "pending" },
  { mentor: "Bongani Zulu",     mentee: "Fatou Sow",       focus: "AgriTech",       sessions: 9, status: "active"  },
  { mentor: "Chioma Eze",       mentee: "Amara Diallo",    focus: "E-commerce",     sessions: 2, status: "active"  },
];

export default function MentorshipPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Mentorship</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage mentor-mentee matches and sessions</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Create Match</button>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {MATCHES.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 80px 100px", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < MATCHES.length - 1 ? `1px solid ${BORD}` : "none" }}>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>MENTOR</div>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{m.mentor}</div>
            </div>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>MENTEE</div>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{m.mentee}</div>
            </div>
            <span style={{ background: "rgba(91,79,207,0.12)", color: "#5b4fcf", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "4px 10px", width: "fit-content" }}>{m.focus}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} style={{ color: "#1e8c6e" }}/><span style={{ color: "#1e8c6e", fontWeight: 600, fontSize: 12 }}>{m.sessions} sess.</span></div>
            <span style={{ background: m.status === "active" ? "rgba(30,140,110,0.12)" : "rgba(184,110,0,0.12)", color: m.status === "active" ? "#1e8c6e" : "#b86e00", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 10px", width: "fit-content" }}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
