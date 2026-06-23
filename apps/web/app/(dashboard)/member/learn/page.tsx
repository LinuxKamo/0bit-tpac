"use client";
import { BookOpen, Clock, Play, Lock } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const TYPE_COLORS: Record<string, string> = { VIDEO: "#5b4fcf", ARTICLE: "#1e8c6e", COURSE: "#b86e00", PODCAST: "#1b5ea6", RESOURCE: "#c0392b" };

const CONTENT = [
  { title: "Intro to GenAI for African Startups", type: "VIDEO",   duration: "32 min", locked: false, progress: 100 },
  { title: "Fundraising in Africa: A Guide",       type: "ARTICLE", duration: "8 min",  locked: false, progress: 60  },
  { title: "Mobile-First Product Design",          type: "COURSE",  duration: "4 hrs",  locked: true,  progress: 0   },
  { title: "FinTech Regulation Panel 2026",        type: "PODCAST", duration: "55 min", locked: false, progress: 0   },
  { title: "POPIA Compliance Checklist",           type: "RESOURCE",duration: "5 min",  locked: false, progress: 0   },
];

export default function LearnPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Learn</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Courses, videos, and resources curated for you</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CONTENT.map((c, i) => {
          const tc = TYPE_COLORS[c.type] ?? "#5b4fcf";
          return (
            <div key={i} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 18, display: "flex", alignItems: "center", gap: 16, opacity: c.locked ? 0.6 : 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${tc}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <BookOpen size={20} style={{ color: tc }} />
                {c.locked && <div style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "var(--color-content-bg)", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Lock size={9} style={{ color: "var(--color-text-muted)" }}/></div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{c.title}</span>
                  {c.locked && <span style={{ background: "rgba(184,110,0,0.12)", color: "#b86e00", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 7px" }}>BUILDER+</span>}
                </div>
                <div style={{ display: "flex", gap: 12, color: "var(--color-text-muted)", fontSize: 12 }}>
                  <span style={{ background: `${tc}18`, color: tc, fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>{c.type}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11}/> {c.duration}</span>
                </div>
                {c.progress > 0 && <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: "var(--color-content-border)" }}><div style={{ width: `${c.progress}%`, height: "100%", background: tc, borderRadius: 99 }}/></div>}
              </div>
              {!c.locked && (
                <button style={{ width: 36, height: 36, borderRadius: "50%", background: tc, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Play size={14} style={{ color: "var(--color-text-primary)" }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
