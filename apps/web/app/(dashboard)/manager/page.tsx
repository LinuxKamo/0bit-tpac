"use client";
import { Users, Calendar, BookOpen, Briefcase, UserCheck, MessageSquare } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const QUICK_ACTIONS = [
  { label: "Approve Member",     icon: <Users size={18}/>,       color: "#5b4fcf", href: "/manager/members"       },
  { label: "Create Event",       icon: <Calendar size={18}/>,    color: "#1e8c6e", href: "/manager/events"         },
  { label: "Publish Content",    icon: <BookOpen size={18}/>,    color: "#b86e00", href: "/manager/content"        },
  { label: "Post Opportunity",   icon: <Briefcase size={18}/>,   color: "#1b5ea6", href: "/manager/opportunities"  },
  { label: "Match Mentor",       icon: <UserCheck size={18}/>,   color: "#c0392b", href: "/manager/mentorship"     },
  { label: "Send Comms",         icon: <MessageSquare size={18}/>,color: "#5b4fcf",href: "/manager/comms"          },
];

const PENDING = [
  { type: "Member Approval",  name: "Zaid Ouma",          detail: "BUILDER tier application",       time: "10 min ago" },
  { type: "Content Review",   name: "Intro to GenAI",     detail: "Video uploaded by mentor",        time: "1 hr ago"   },
  { type: "Event RSVP",       name: "Pitch Night #14",    detail: "83 confirmed / 100 capacity",     time: "2 hrs ago"  },
  { type: "Mentor Match",     name: "Amina Kofi",         detail: "Matched: needs confirmation",     time: "3 hrs ago"  },
  { type: "Opportunity",      name: "Founders Factory",   detail: "Grant application deadline today", time: "5 hrs ago" },
];

export default function ManagerDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Manager Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Community overview — South Africa</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Active Members",     value: "3,210", sub: "+14 today",  color: "#5b4fcf" },
          { label: "Events This Month",  value: "12",    sub: "3 upcoming",  color: "#1e8c6e" },
          { label: "Active Mentorships", value: "87",    sub: "12 new",      color: "#b86e00" },
          { label: "Open Opportunities", value: "24",    sub: "6 closing soon", color: "#1b5ea6" },
        ].map(k => (
          <div key={k.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ color: "var(--color-text-primary)", fontSize: 26, fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>{k.label}</div>
            <div style={{ color: k.color, fontSize: 11, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}` }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Pending Actions</span></div>
          {PENDING.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < PENDING.length - 1 ? `1px solid ${BORD}` : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ background: "rgba(91,79,207,0.15)", color: "#5b4fcf", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>{p.type}</span>
                </div>
                <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{p.detail}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{p.time}</span>
                <button style={{ padding: "4px 12px", background: "#5b4fcf", border: "none", borderRadius: 6, color: "#ffffff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Review</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
          <div style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {QUICK_ACTIONS.map(a => (
              <div key={a.label} style={{ background: `${a.color}10`, border: `1px solid ${a.color}30`, borderRadius: 10, padding: "14px 12px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ color: a.color, marginBottom: 6 }}>{a.icon}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
