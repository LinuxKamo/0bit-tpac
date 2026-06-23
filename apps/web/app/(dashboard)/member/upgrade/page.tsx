"use client";
import { CheckCircle, ArrowRight, Star } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const TIERS = [
  { slot: "BUILDER",  price: "R499",   color: "#1e8c6e", recommended: false, features: ["All Explorer", "Unlimited events", "Mentorship access", "Co-working 10 days/mo"] },
  { slot: "FOUNDER",  price: "R1,299", color: "#b86e00", recommended: true,  features: ["All Builder", "Unlimited co-working", "1-on-1 mentor sessions", "Investor introductions", "Programme priority"] },
  { slot: "DIASPORA", price: "R699",   color: "#c0392b", recommended: false, features: ["Remote community", "Virtual events", "Remote mentorship", "Content library"] },
];

export default function UpgradePage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 28, margin: 0 }}>Upgrade Your Membership</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 8 }}>Unlock more of the Tshimologong ecosystem</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        {TIERS.map(t => (
          <div key={t.slot} style={{ background: CARD, borderRadius: 16, border: t.recommended ? `2px solid ${t.color}` : `1px solid ${BORD}`, padding: 24, position: "relative" }}>
            {t.recommended && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: t.color, borderRadius: 99, padding: "4px 14px", display: "flex", alignItems: "center", gap: 5 }}>
                <Star size={11} style={{ color: "var(--color-text-primary)" }} />
                <span style={{ color: "var(--color-text-primary)", fontSize: 11, fontWeight: 700 }}>RECOMMENDED</span>
              </div>
            )}
            <div style={{ color: t.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>{t.slot}</div>
            <div style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 32, marginBottom: 2 }}>{t.price}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 20 }}>per month</div>
            <div style={{ marginBottom: 24 }}>
              {t.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <CheckCircle size={13} style={{ color: t.color, marginTop: 1, flexShrink: 0 }} />
                  <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "12px 0", background: t.recommended ? t.color : "transparent", border: `1px solid ${t.color}`, borderRadius: 10, color: t.recommended ? "#fff" : t.color, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Upgrade to {t.slot} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Billed monthly. Cancel anytime. Payment via Paystack.</p>
      </div>
    </div>
  );
}
