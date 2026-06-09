"use client";
import { Receipt, CreditCard, CheckCircle } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const INVOICES = [
  { id: "INV-2026-06", period: "Jun 2026", amount: "R4,999", status: "paid",    date: "Jun 1, 2026"  },
  { id: "INV-2026-05", period: "May 2026", amount: "R4,999", status: "paid",    date: "May 1, 2026"  },
  { id: "INV-2026-04", period: "Apr 2026", amount: "R4,999", status: "paid",    date: "Apr 1, 2026"  },
  { id: "INV-2026-03", period: "Mar 2026", amount: "R4,999", status: "paid",    date: "Mar 1, 2026"  },
];

export default function BillingPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Billing</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Subscription and payment history</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>
        <div style={{ background: CARD, borderRadius: 12, border: "1px solid rgba(27,94,166,0.4)", padding: 24 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 12 }}>CURRENT PLAN</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 32 }}>R4,999</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 4 }}>/month</span>
          </div>
          <div style={{ color: "#1b5ea6", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>CORPORATE TIER — 10 seats</div>
          {["Community access for all seats", "Compliance reporting", "Dedicated community manager", "Priority event access", "API integration"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CheckCircle size={12} style={{ color: "#1e8c6e" }} />
              <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{f}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORD}` }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Next billing: </span>
            <span style={{ color: "var(--color-text-primary)", fontSize: 12, fontWeight: 600 }}>Jul 1, 2026</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
          <div style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Payment Method</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${BORD}` }}>
            <CreditCard size={20} style={{ color: "var(--color-text-muted)" }} />
            <div>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>Absa Corporate Card</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>•••• •••• •••• 4821</div>
            </div>
          </div>
          <button style={{ marginTop: 12, width: "100%", padding: "8px 0", background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, color: "var(--color-text-muted)", fontSize: 12, cursor: "pointer" }}>Update Payment Method</button>
        </div>
      </div>
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}><span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Invoice History</span></div>
        {INVOICES.map((inv, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: i < INVOICES.length - 1 ? `1px solid ${BORD}` : "none" }}>
            <Receipt size={16} style={{ color: "var(--color-text-muted)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{inv.id} — {inv.period}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{inv.date}</div>
            </div>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>{inv.amount}</span>
            <span style={{ background: "rgba(30,140,110,0.12)", color: "#1e8c6e", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>PAID</span>
            <button style={{ padding: "4px 12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, color: "var(--color-text-muted)", fontSize: 11, cursor: "pointer" }}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}
