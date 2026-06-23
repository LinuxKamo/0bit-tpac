"use client";
import { BookOpen, Plus, Eye, ThumbsUp } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const TYPE_COLORS: Record<string, string> = { VIDEO: "#5b4fcf", ARTICLE: "#1e8c6e", COURSE: "#b86e00", PODCAST: "#1b5ea6", RESOURCE: "#c0392b" };

const CONTENT = [
  { title: "Intro to GenAI for African Startups", type: "VIDEO",    status: "published", views: 1240, likes: 87,  author: "Dr. Ama Owusu"    },
  { title: "Fundraising in Africa: A Guide",       type: "ARTICLE",  status: "published", views: 890,  likes: 124, author: "Sipho Ndlovu"     },
  { title: "Mobile-First Product Design",          type: "COURSE",   status: "draft",     views: 0,    likes: 0,   author: "Thandiwe Mokoena" },
  { title: "FinTech Regulation Panel 2026",        type: "PODCAST",  status: "published", views: 430,  likes: 39,  author: "Fatima Al-Rashid" },
  { title: "POPIA Compliance Checklist",           type: "RESOURCE", status: "published", views: 620,  likes: 55,  author: "Lerato Dlamini"   },
];

export default function ContentPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Content</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage learning content and resources</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Upload Content</button>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {CONTENT.map((c, i) => {
          const tc = TYPE_COLORS[c.type] ?? "#5b4fcf";
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 100px 80px 80px 80px 90px", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < CONTENT.length - 1 ? `1px solid ${BORD}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${tc}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={14} style={{ color: tc }}/></div>
              <div>
                <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{c.author}</div>
              </div>
              <span style={{ background: `${tc}18`, color: tc, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px", width: "fit-content" }}>{c.type}</span>
              <span style={{ background: c.status === "published" ? "rgba(30,140,110,0.12)" : "rgba(184,110,0,0.12)", color: c.status === "published" ? "#1e8c6e" : "#b86e00", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px", width: "fit-content" }}>{c.status}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", fontSize: 12 }}><Eye size={11}/> {c.views.toLocaleString()}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", fontSize: 12 }}><ThumbsUp size={11}/> {c.likes}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ padding: "4px 10px", background: "rgba(91,79,207,0.12)", border: "none", borderRadius: 6, color: "#5b4fcf", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
