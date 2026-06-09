"use client";
import { Calendar, Plus, MapPin, Users } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const TYPE_COLORS: Record<string, string> = { WORKSHOP: "#5b4fcf", NETWORKING: "#1e8c6e", PITCH: "#b86e00", HACKATHON: "#c0392b", WEBINAR: "#1b5ea6" };

const EVENTS = [
  { title: "Pitch Night #14",      type: "PITCH",       date: "Jun 14, 2026", venue: "Tsh Auditorium", rsvp: 83, cap: 100, mode: "IN_PERSON"  },
  { title: "AI & Ethics Workshop", type: "WORKSHOP",    date: "Jun 18, 2026", venue: "Room 2B",         rsvp: 24, cap: 30,  mode: "IN_PERSON"  },
  { title: "FinTech Founders Chat", type: "NETWORKING", date: "Jun 22, 2026", venue: "Online",          rsvp: 47, cap: 200, mode: "VIRTUAL"    },
  { title: "48hr Agri Hackathon",  type: "HACKATHON",  date: "Jul 5, 2026",  venue: "Tsh Hub Floor 3", rsvp: 62, cap: 80,  mode: "IN_PERSON"  },
];

export default function EventsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Events</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage and publish community events</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Create Event</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {EVENTS.map(e => {
          const c = TYPE_COLORS[e.type] ?? "#5b4fcf"; const pct = Math.round((e.rsvp / e.cap) * 100);
          return (
            <div key={e.title} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{e.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ background: `${c}18`, color: c, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{e.type}</span>
                    <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>{e.mode}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, color: "var(--color-text-muted)", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={11}/> {e.date}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={11}/> {e.venue}</div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Users size={11}/> {e.rsvp}/{e.cap} RSVPs</span>
                  <span style={{ color: pct > 85 ? "#c0392b" : "#1e8c6e", fontWeight: 700, fontSize: 12 }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "var(--color-content-border)" }}><div style={{ width: `${pct}%`, height: "100%", background: pct > 85 ? "#c0392b" : c, borderRadius: 99 }}/></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
