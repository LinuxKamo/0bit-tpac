"use client";
import { Calendar, Clock, Video, MapPin, CheckCircle } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const SESSIONS = [
  { mentee: "Sipho Dube",    date: "Thu Jun 12, 10:00", duration: "60 min", mode: "VIDEO",      status: "upcoming",   notes: "Product critique exercise"              },
  { mentee: "Priya Naidoo",  date: "Sat Jun 14, 14:00", duration: "45 min", mode: "IN_PERSON",  status: "upcoming",   notes: "FinTech pitch practice"                 },
  { mentee: "Zaid Ouma",     date: "Mon Jun 16, 09:00", duration: "30 min", mode: "VIDEO",      status: "upcoming",   notes: "Intro check-in"                         },
  { mentee: "Sipho Dube",    date: "Thu Jun 5, 10:00",  duration: "60 min", mode: "VIDEO",      status: "completed",  notes: "Figma prototype review"                 },
  { mentee: "Priya Naidoo",  date: "Sat May 31, 14:00", duration: "45 min", mode: "IN_PERSON",  status: "completed",  notes: "Business model canvas"                  },
];

const MODE_ICONS: Record<string, any> = { VIDEO: <Video size={13}/>, IN_PERSON: <MapPin size={13}/> };

export default function MentorSessionsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Sessions</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Your mentoring session history and schedule</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SESSIONS.map((s, i) => (
          <div key={i} style={{ background: CARD, borderRadius: 12, border: `1px solid ${s.status === "upcoming" ? "rgba(184,110,0,0.3)" : BORD}`, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.status === "upcoming" ? "rgba(184,110,0,0.12)" : "rgba(30,140,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.status === "upcoming" ? <Calendar size={18} style={{ color: "#b86e00" }}/> : <CheckCircle size={18} style={{ color: "#1e8c6e" }}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>{s.mentee}</span>
                <span style={{ background: s.status === "upcoming" ? "rgba(184,110,0,0.12)" : "rgba(30,140,110,0.10)", color: s.status === "upcoming" ? "#b86e00" : "#1e8c6e", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{s.status}</span>
              </div>
              <div style={{ display: "flex", gap: 14, color: "var(--color-text-muted)", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11}/> {s.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{MODE_ICONS[s.mode]} {s.mode.replace("_", " ")}</span>
                <span>{s.duration}</span>
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 4 }}>{s.notes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
