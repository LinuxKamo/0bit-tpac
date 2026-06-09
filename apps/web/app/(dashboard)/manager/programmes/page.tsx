"use client";
import { Plus, GraduationCap, Users, Calendar } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const PHASES: Record<string, string> = { APPLY: "#5b4fcf", EXPLORE: "#1b5ea6", BUILD: "#1e8c6e", GROW: "#b86e00", GRADUATE: "#c0392b" };

const PROGRAMMES = [
  { name: "Tsh Launchpad", cohort: "Cohort 12", phase: "BUILD",     participants: 34, max: 40, startDate: "Feb 2026", endDate: "Aug 2026" },
  { name: "FinTech Accelerator", cohort: "Cohort 3", phase: "EXPLORE", participants: 20, max: 25, startDate: "Mar 2026", endDate: "Sep 2026" },
  { name: "Women in Tech",     cohort: "Cohort 7", phase: "GRADUATE", participants: 28, max: 30, startDate: "Sep 2025", endDate: "Mar 2026" },
  { name: "AI & Data",         cohort: "Cohort 1", phase: "APPLY",    participants: 8,  max: 30, startDate: "May 2026", endDate: "Nov 2026" },
];

export default function ProgrammesPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Programmes</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage cohorts and programme phases</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> New Programme</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {PROGRAMMES.map(p => {
          const c = PHASES[p.phase] ?? "#5b4fcf";
          const pct = Math.round((p.participants / p.max) * 100);
          return (
            <div key={p.name} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={18} style={{ color: c }} /></div>
                  <div>
                    <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{p.cohort}</div>
                  </div>
                </div>
                <span style={{ background: `${c}18`, color: c, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 10px" }}>{p.phase}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Users size={11}/> {p.participants}/{p.max} participants</span>
                  <span style={{ color: c, fontWeight: 700, fontSize: 12 }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "var(--color-content-border)" }}><div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 99 }}/></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)", fontSize: 11 }}><Calendar size={11}/> {p.startDate} — {p.endDate}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
