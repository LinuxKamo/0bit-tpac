"use client";
import { MessageSquare, Plus, Users } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const GROUPS = [
  { name: "FinTech Founders ZA",     members: 234, posts: 12, lastActive: "5 min ago",  category: "Sector"   },
  { name: "Women in Tech",           members: 189, posts: 8,  lastActive: "1 hr ago",   category: "Network"  },
  { name: "AgriTech Innovators",     members: 97,  posts: 3,  lastActive: "3 hrs ago",  category: "Sector"   },
  { name: "Launchpad Cohort 12",     members: 34,  posts: 28, lastActive: "10 min ago", category: "Cohort"   },
  { name: "Remote Founders (Dias.)", members: 56,  posts: 6,  lastActive: "2 hrs ago",  category: "Diaspora" },
];
const CAT_COLORS: Record<string, string> = { Sector: "#5b4fcf", Network: "#1e8c6e", Cohort: "#b86e00", Diaspora: "#1b5ea6" };

export default function CommunityPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Community</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage groups and community posts</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Create Group</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {GROUPS.map(g => {
          const c = CAT_COLORS[g.category] ?? "#5b4fcf";
          return (
            <div key={g.name} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageSquare size={18} style={{ color: c }}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>{g.name}</span>
                  <span style={{ background: `${c}18`, color: c, fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>{g.category}</span>
                </div>
                <div style={{ display: "flex", gap: 16, color: "var(--color-text-muted)", fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={11}/> {g.members} members</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MessageSquare size={11}/> {g.posts} posts today</span>
                  <span>Last active: {g.lastActive}</span>
                </div>
              </div>
              <button style={{ padding: "6px 14px", background: "rgba(91,79,207,0.12)", border: "none", borderRadius: 8, color: "#5b4fcf", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Manage</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
