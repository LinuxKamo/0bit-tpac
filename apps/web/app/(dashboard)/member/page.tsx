"use client";
import { BookOpen, Users, UserCheck, Briefcase, Calendar, GraduationCap, TrendingUp } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const QUICK_LINKS = [
  { label: "Continue Learning", icon: <BookOpen size={20}/>,     color: "#5b4fcf", href: "/member/learn"         },
  { label: "Find a Mentor",     icon: <UserCheck size={20}/>,    color: "#1e8c6e", href: "/member/mentorship"    },
  { label: "Browse Jobs",       icon: <Briefcase size={20}/>,    color: "#b86e00", href: "/member/opportunities" },
  { label: "View Events",       icon: <Calendar size={20}/>,     color: "#1b5ea6", href: "/member/events"        },
  { label: "Community",         icon: <Users size={20}/>,        color: "#c0392b", href: "/member/community"     },
  { label: "Programmes",        icon: <GraduationCap size={20}/>,color: "#1e8c6e", href: "/member/programmes"    },
];

export default function MemberDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Welcome back!</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Explorer Tier — Tshimologong Digital Precinct</p>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(91,79,207,0.2), rgba(30,140,110,0.15))", borderRadius: 16, border: "1px solid rgba(91,79,207,0.3)", padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 4 }}>YOUR PROGRESS</div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 18, fontWeight: 700 }}>Explorer Journey</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 4 }}>Complete 3 more activities to unlock Builder tier</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#5b4fcf", fontSize: 32, fontWeight: 800 }}>42%</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>journey complete</div>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.1)", marginTop: 16 }}>
          <div style={{ width: "42%", height: "100%", background: "linear-gradient(to right, #5b4fcf, #8b7fef)", borderRadius: 99 }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <TrendingUp size={13}/> Upgrade to Builder
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 14 }}>QUICK ACCESS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {QUICK_LINKS.map(l => (
            <div key={l.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20, cursor: "pointer", textAlign: "center" }}>
              <div style={{ color: l.color, marginBottom: 10 }}>{l.icon}</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>{l.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
        <div style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Upcoming for You</div>
        {[
          { type: "Event",      title: "Pitch Night #14",         date: "Jun 14",   color: "#b86e00" },
          { type: "Deadline",   title: "GSMA Innovation Fund",    date: "Jun 30",   color: "#c0392b" },
          { type: "Programme",  title: "AI & Data cohort opens",  date: "Jul 5",    color: "#1e8c6e" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${BORD}` : "none" }}>
            <span style={{ background: `${item.color}18`, color: item.color, fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 8px", width: 70, textAlign: "center" }}>{item.type}</span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 13, flex: 1 }}>{item.title}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
