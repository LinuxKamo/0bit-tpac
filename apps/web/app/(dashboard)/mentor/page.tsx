"use client";
import { Users, Calendar, Star, BookOpen, Clock } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const MENTEES = [
  { name: "Sipho Dube",    focus: "Product Design", sessions: 6, nextSession: "Jun 12",  progress: 72 },
  { name: "Priya Naidoo",  focus: "FinTech",        sessions: 3, nextSession: "Jun 14",  progress: 45 },
  { name: "Zaid Ouma",     focus: "AI & Data",      sessions: 1, nextSession: "Jun 16",  progress: 20 },
];

const UPCOMING = [
  { mentee: "Sipho Dube",   time: "Thu Jun 12, 10:00", duration: "60 min", mode: "Video"  },
  { mentee: "Priya Naidoo", time: "Sat Jun 14, 14:00", duration: "45 min", mode: "In-person" },
];

export default function MentorDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Mentor Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Welcome back — you have 2 upcoming sessions</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Active Mentees",    value: "3",   sub: "max: 5",            color: "#b86e00", icon: <Users size={17}/> },
          { label: "Sessions This Month",value: "7",  sub: "2 this week",       color: "#5b4fcf", icon: <Calendar size={17}/> },
          { label: "Mentor Rating",     value: "4.9", sub: "12 reviews",        color: "#1e8c6e", icon: <Star size={17}/> },
          { label: "Resources Shared",  value: "14",  sub: "across mentees",    color: "#1b5ea6", icon: <BookOpen size={17}/> },
        ].map(k => (
          <div key={k.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><span style={{ color: k.color }}>{k.icon}</span></div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 26, fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{k.label}</div>
            <div style={{ color: k.color, fontSize: 11, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}` }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>My Mentees</span></div>
          {MENTEES.map((m, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: i < MENTEES.length - 1 ? `1px solid ${BORD}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                  <div style={{ color: "#b86e00", fontSize: 11, fontWeight: 600 }}>{m.focus}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{m.sessions} sessions</div>
                  <div style={{ color: "#5b4fcf", fontSize: 11, fontWeight: 600 }}>Next: {m.nextSession}</div>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}><div style={{ width: `${m.progress}%`, height: "100%", background: "#b86e00", borderRadius: 99 }}/></div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 10, marginTop: 4 }}>{m.progress}% programme progress</div>
            </div>
          ))}
        </div>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}` }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Upcoming Sessions</span></div>
          {UPCOMING.map((s, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: i < UPCOMING.length - 1 ? `1px solid ${BORD}` : "none" }}>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.mentee}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)", fontSize: 12, marginBottom: 8 }}><Clock size={11}/> {s.time}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "rgba(184,110,0,0.12)", color: "#b86e00", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>{s.duration}</span>
                <span style={{ background: "rgba(91,79,207,0.12)", color: "#5b4fcf", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>{s.mode}</span>
              </div>
            </div>
          ))}
          <div style={{ padding: "14px 20px" }}>
            <button style={{ width: "100%", padding: "8px 0", background: "#b86e00", border: "none", borderRadius: 8, color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Schedule Session</button>
          </div>
        </div>
      </div>
    </div>
  );
}
