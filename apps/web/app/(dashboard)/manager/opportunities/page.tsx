"use client";
import { Briefcase, Plus, Calendar, Globe } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";
const TYPE_COLORS: Record<string, string> = { GRANT: "#1e8c6e", JOB: "#5b4fcf", ACCELERATOR: "#b86e00", FELLOWSHIP: "#1b5ea6", COMPETITION: "#c0392b" };

const OPPS = [
  { title: "GSMA Innovation Fund 2026",       type: "GRANT",       deadline: "Jun 30, 2026", eligibility: "African startups", amount: "$100K",  status: "open"   },
  { title: "Google for Startups Africa",       type: "ACCELERATOR", deadline: "Jul 15, 2026", eligibility: "Seed stage",       amount: "$200K",  status: "open"   },
  { title: "Lead Engineer — Safaricom",        type: "JOB",         deadline: "Jul 1, 2026",  eligibility: "KE, open",         amount: "KES 3M", status: "open"   },
  { title: "AU Youth Entrepreneurship Fellow", type: "FELLOWSHIP",  deadline: "Jun 20, 2026", eligibility: "Under 35",         amount: "$50K",   status: "closing" },
  { title: "Seedstars Africa Summit",          type: "COMPETITION", deadline: "Jun 25, 2026", eligibility: "All African",      amount: "$500K",  status: "open"   },
];

export default function OpportunitiesPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Opportunities</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Curate grants, jobs, accelerators and fellowships</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Plus size={16}/> Add Opportunity</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {OPPS.map(o => {
          const c = TYPE_COLORS[o.type] ?? "#5b4fcf";
          return (
            <div key={o.title} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Briefcase size={20} style={{ color: c }}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>{o.title}</span>
                  <span style={{ background: `${c}18`, color: c, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{o.type}</span>
                  {o.status === "closing" && <span style={{ background: "rgba(192,57,43,0.12)", color: "#c0392b", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>CLOSING SOON</span>}
                </div>
                <div style={{ display: "flex", gap: 16, color: "var(--color-text-muted)", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11}/> Deadline: {o.deadline}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Globe size={11}/> {o.eligibility}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#1e8c6e", fontWeight: 800, fontSize: 16 }}>{o.amount}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>value</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
