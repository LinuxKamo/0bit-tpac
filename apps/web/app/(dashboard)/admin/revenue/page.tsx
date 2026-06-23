"use client";
import { TrendingUp, DollarSign } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const BREAKDOWN = [
  { tier: "FOUNDER",   members: 578,  priceZAR: 1299, color: "#b86e00" },
  { tier: "BUILDER",   members: 1349, priceZAR: 499,  color: "#1e8c6e" },
  { tier: "CORPORATE", members: 289,  priceZAR: 4999, color: "#1b5ea6" },
  { tier: "DIASPORA",  members: 96,   priceZAR: 699,  color: "#c0392b" },
  { tier: "EXPLORER",  members: 2509, priceZAR: 0,    color: "#5b4fcf" },
];

export default function RevenuePage() {
  const mrr = BREAKDOWN.reduce((s, t) => s + t.members * t.priceZAR, 0);
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Revenue</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Monthly recurring revenue by tier (ZA)</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "MRR (ZAR)",  value: `R${(mrr / 1000).toFixed(0)}K`, sub: "+12% vs last month", color: "#1e8c6e" },
          { label: "ARR (ZAR)",  value: `R${(mrr * 12 / 1000000).toFixed(1)}M`, sub: "annualised", color: "#5b4fcf" },
          { label: "Paying Mbrs",value: (BREAKDOWN.filter(t => t.priceZAR > 0).reduce((s,t) => s+t.members, 0)).toLocaleString(), sub: "excl. Explorer", color: "#b86e00" },
        ].map(k => (
          <div key={k.label} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 8 }}>{k.label}</div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 28, fontWeight: 800 }}>{k.value}</div>
            <div style={{ color: k.color, fontSize: 11, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>MRR by Tier</span></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORD}` }}>
            {["Tier", "Members", "Price/mo", "MRR Contribution"].map(h => <th key={h} style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, textAlign: "left", padding: "10px 20px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {BREAKDOWN.map((t, i) => {
              const contrib = t.members * t.priceZAR;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${BORD}` }}>
                  <td style={{ padding: "14px 20px" }}><span style={{ background: `${t.color}18`, color: t.color, fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "3px 10px" }}>{t.tier}</span></td>
                  <td style={{ padding: "14px 20px", color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{t.members.toLocaleString()}</td>
                  <td style={{ padding: "14px 20px", color: "var(--color-text-muted)", fontSize: 13 }}>{t.priceZAR === 0 ? "Free" : `R${t.priceZAR.toLocaleString()}`}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: t.priceZAR === 0 ? "var(--color-text-muted)" : "#1e8c6e", fontWeight: 700, fontSize: 13 }}>{contrib === 0 ? "—" : `R${(contrib / 1000).toFixed(1)}K`}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
