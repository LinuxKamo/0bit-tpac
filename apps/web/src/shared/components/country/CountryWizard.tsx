"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Globe, Layers, Building2, Users, Shield, MessageSquare, Zap, X } from "lucide-react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

// ── Step definitions ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Identity",      icon: Globe         },
  { id: 2, label: "Tiers",         icon: Layers        },
  { id: 3, label: "Physical",      icon: Building2     },
  { id: 4, label: "Community",     icon: Users         },
  { id: 5, label: "Compliance",    icon: Shield        },
  { id: 6, label: "Comms",         icon: MessageSquare },
  { id: 7, label: "Publish",       icon: Zap           },
];

const TIER_SLOTS = [
  { slot: "EXPLORER",  label: "Explorer",  defaultPrice: 0,    free: true,  cycle: "monthly" },
  { slot: "BUILDER",   label: "Builder",   defaultPrice: 299,  free: false, cycle: "monthly" },
  { slot: "FOUNDER",   label: "Founder",   defaultPrice: 799,  free: false, cycle: "monthly" },
  { slot: "CORPORATE", label: "Corporate", defaultPrice: 0,    free: false, cycle: "custom"  },
  { slot: "DIASPORA",  label: "Diaspora",  defaultPrice: 15,   free: false, cycle: "monthly" },
];

const TIMEZONES = [
  "Africa/Johannesburg", "Africa/Nairobi", "Africa/Lagos",
  "Africa/Accra", "Africa/Cairo", "Africa/Casablanca",
  "America/New_York", "Europe/London", "Asia/Dubai",
];

const CURRENCIES = [
  { code: "ZAR", symbol: "R",   label: "South African Rand" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
  { code: "NGN", symbol: "₦",   label: "Nigerian Naira" },
  { code: "GHS", symbol: "₵",   label: "Ghanaian Cedi" },
  { code: "USD", symbol: "$",   label: "US Dollar" },
  { code: "EUR", symbol: "€",   label: "Euro" },
  { code: "GBP", symbol: "£",   label: "British Pound" },
];

const GATEWAYS = [
  { value: "payfast", label: "PayFast",  note: "ZAR payments — South Africa" },
  { value: "stripe",  label: "Stripe",   note: "International / USD payments" },
  { value: "manual",  label: "Manual",   note: "Invoice-based, no auto-billing" },
];

// ── Shared UI pieces ───────────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "var(--color-bg-subtle)",
  border: `1px solid ${BORD}`,
  borderRadius: 8, fontSize: 13,
  color: "var(--color-text-primary)",
  outline: "none", boxSizing: "border-box",
};
const labelSt: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "var(--color-text-muted)", letterSpacing: "0.06em",
  textTransform: "uppercase", marginBottom: 6,
};
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={labelSt}>{label}</label>
    {children}
  </div>
);
const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
);

// ── Main wizard ────────────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
  onCancel?:  () => void;
}

export default function CountryWizard({ onComplete, onCancel }: Props) {
  const router = useRouter();

  const [step,      setStep]      = useState(1);
  const [countryId, setCountryId] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Step 1 — Identity
  const [identity, setIdentity] = useState({
    name: "", code: "", currency: "ZAR", currencySymbol: "R",
    timezone: "Africa/Johannesburg",
  });

  // ── Step 2 — Tiers
  const [tiers, setTiers] = useState(
    TIER_SLOTS.map(t => ({
      slot: t.slot, name: t.label, price: t.defaultPrice,
      billingCycle: t.cycle, isActive: true, isRecommended: t.slot === "FOUNDER",
      guestDaysPerMonth: null as number | null,
    })),
  );

  // ── Step 3 — Physical
  const [physical, setPhysical] = useState({
    physicalAccessEnabled: false, physicalLocation: "", physicalAddress: "",
  });

  // ── Step 4 — Community
  const [community, setCommunity] = useState({
    chapterName: "", showGlobalContent: true,
  });

  // ── Step 5 — Compliance
  const [compliance, setCompliance] = useState({
    complianceFramework: "", paymentGateway: "stripe",
    taxConfigJson: { vatRate: "" },
  });

  // ── Step 6 — Comms
  const [comms, setComms] = useState({
    registrationMode: "SELF_REGISTER" as "INVITE_ONLY" | "SELF_REGISTER" | "SELF_REGISTER_AUTO",
    waitlistMessage: "", onboardingMessage: "",
  });

  // ── Step 7 — Status
  const [targetStatus, setTargetStatus] = useState<"DRAFT" | "COMING_SOON" | "ACTIVE">("DRAFT");

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const go = (n: number) => { setError(null); setStep(n); };

  const saveAndNext = async () => {
    setSaving(true); setError(null);
    try {
      if (step === 1) {
        if (!identity.name || !identity.code || !identity.currency || !identity.timezone) {
          setError("Name, country code, currency, and timezone are required."); setSaving(false); return;
        }
        if (countryId) {
          // editing existing draft — patch
          await apiClient.patch(endpoints.admin.countryById(countryId), identity);
        } else {
          const res = await apiClient.post(endpoints.admin.countries, identity);
          setCountryId(res.data.data.country.id);
        }
      }

      if (step === 2 && countryId) {
        await apiClient.post(endpoints.admin.countryTiers(countryId), { tiers });
      }

      if (step === 3 && countryId) {
        await apiClient.patch(endpoints.admin.countryById(countryId), physical);
      }

      if (step === 4 && countryId) {
        await apiClient.patch(endpoints.admin.countryById(countryId), community);
      }

      if (step === 5 && countryId) {
        await apiClient.patch(endpoints.admin.countryById(countryId), {
          complianceFramework: compliance.complianceFramework,
          paymentGateway:      compliance.paymentGateway,
          taxConfigJson:       compliance.taxConfigJson,
        });
      }

      if (step === 6 && countryId) {
        await apiClient.patch(endpoints.admin.countryById(countryId), comms);
      }

      if (step === 7 && countryId) {
        await apiClient.patch(endpoints.admin.countryStatus(countryId), { status: targetStatus });
        onComplete();
        return;
      }

      go(step + 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Progress bar ───────────────────────────────────────────────────────────

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 720, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 22, margin: 0 }}>
            Set up a new chapter
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} style={{ background: "none", border: `1px solid ${BORD}`, cursor: "pointer", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 12px", borderRadius: 8 }}>
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      {/* ── Step indicators ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, overflowX: "auto" }}>
        {STEPS.map((s, i) => {
          const done    = step > s.id;
          const current = step === s.id;
          const Icon    = s.icon;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div
                onClick={() => countryId && step > s.id ? go(s.id) : undefined}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  cursor: done ? "pointer" : "default", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#5b4fcf" : current ? "rgba(91,79,207,0.12)" : "var(--color-bg-subtle)",
                  border: current ? "2px solid #5b4fcf" : done ? "none" : `2px solid ${BORD}`,
                  transition: "all 0.15s",
                }}>
                  {done
                    ? <Check size={16} style={{ color: "#fff" }} />
                    : <Icon  size={15} style={{ color: current ? "#5b4fcf" : "var(--color-text-muted)" }} />
                  }
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: current ? "#5b4fcf" : done ? "var(--color-text-secondary)" : "var(--color-text-muted)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  {s.label.toUpperCase()}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.id ? "#5b4fcf" : BORD, margin: "0 4px", marginBottom: 22, transition: "background 0.15s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step content card ── */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>

        {/* Purple top bar */}
        <div style={{ height: 3, background: "#5b4fcf" }} />

        <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Step 1 — Identity ── */}
          {step === 1 && (
            <>
              <Row2>
                <Field label="Country name *">
                  <input value={identity.name} onChange={e => setIdentity(p => ({ ...p, name: e.target.value }))} placeholder="South Africa" style={inputSt} />
                </Field>
                <Field label="ISO code * (2 letters)">
                  <input value={identity.code} onChange={e => setIdentity(p => ({ ...p, code: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="ZA" style={{ ...inputSt, textTransform: "uppercase" }} maxLength={2} />
                </Field>
              </Row2>
              <Row2>
                <Field label="Currency *">
                  <select value={identity.currency} onChange={e => {
                    const cur = CURRENCIES.find(c => c.code === e.target.value);
                    setIdentity(p => ({ ...p, currency: e.target.value, currencySymbol: cur?.symbol ?? "" }));
                  }} style={inputSt}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                  </select>
                </Field>
                <Field label="Currency symbol">
                  <input value={identity.currencySymbol} onChange={e => setIdentity(p => ({ ...p, currencySymbol: e.target.value }))} placeholder="R" style={inputSt} />
                </Field>
              </Row2>
              <Row2>
                <Field label="Timezone *">
                  <select value={identity.timezone} onChange={e => setIdentity(p => ({ ...p, timezone: e.target.value }))} style={inputSt}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </Field>
              </Row2>
            </>
          )}

          {/* ── Step 2 — Tier configuration ── */}
          {step === 2 && (
            <>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 8px" }}>
                Configure which tiers are active for <strong style={{ color: "var(--color-text-primary)" }}>{identity.name}</strong> and set prices in <strong style={{ color: "var(--color-text-primary)" }}>{identity.currency}</strong>. Prices can be changed at any time.
              </p>
              {tiers.map((t, i) => (
                <div key={t.slot} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
                  {/* Active toggle */}
                  <button
                    type="button"
                    onClick={() => setTiers(p => p.map((x, j) => j === i ? { ...x, isActive: !x.isActive } : x))}
                    style={{ width: 40, height: 22, borderRadius: 999, background: t.isActive ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                  >
                    <div style={{ position: "absolute", top: 3, left: t.isActive ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>

                  {/* Tier name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: t.isActive ? "var(--color-text-primary)" : "var(--color-text-muted)", fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 2 }}>{t.slot} slot</div>
                  </div>

                  {/* Price */}
                  {t.slot === "EXPLORER" ? (
                    <span style={{ color: "#1e8c6e", fontWeight: 700, fontSize: 13, padding: "4px 12px", background: "rgba(30,140,110,0.10)", borderRadius: 99 }}>Free</span>
                  ) : t.slot === "CORPORATE" ? (
                    <span style={{ color: "#b86e00", fontWeight: 700, fontSize: 13, padding: "4px 12px", background: "rgba(184,110,0,0.10)", borderRadius: 99 }}>Custom pricing</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{identity.currencySymbol || identity.currency}</span>
                      <input
                        type="number" min={0} value={t.price}
                        onChange={e => setTiers(p => p.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value) || 0 } : x))}
                        style={{ ...inputSt, width: 90, textAlign: "right" }}
                        disabled={!t.isActive}
                      />
                      <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>/mo</span>
                    </div>
                  )}

                  {/* Recommended toggle */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>RECOMMENDED</span>
                    <button
                      type="button"
                      onClick={() => setTiers(p => p.map((x, j) => ({ ...x, isRecommended: j === i ? !x.isRecommended : false })))}
                      style={{ width: 32, height: 18, borderRadius: 999, background: t.isRecommended ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                    >
                      <div style={{ position: "absolute", top: 2, left: t.isRecommended ? 14 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Step 3 — Physical settings ── */}
          {step === 3 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
                <div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 14 }}>Physical co-working access</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>Members with eligible tiers can book desk days at a physical location</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhysical(p => ({ ...p, physicalAccessEnabled: !p.physicalAccessEnabled }))}
                  style={{ width: 44, height: 24, borderRadius: 999, background: physical.physicalAccessEnabled ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                >
                  <div style={{ position: "absolute", top: 3, left: physical.physicalAccessEnabled ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>

              {physical.physicalAccessEnabled && (
                <>
                  <Field label="Venue / location name">
                    <input value={physical.physicalLocation} onChange={e => setPhysical(p => ({ ...p, physicalLocation: e.target.value }))} placeholder="Tshimologong Digital Precinct" style={inputSt} />
                  </Field>
                  <Field label="Full address">
                    <input value={physical.physicalAddress} onChange={e => setPhysical(p => ({ ...p, physicalAddress: e.target.value }))} placeholder="Braamfontein, Johannesburg, 2001" style={inputSt} />
                  </Field>
                  <div style={{ padding: "12px 16px", background: "rgba(27,94,166,0.08)", border: "1px solid rgba(27,94,166,0.2)", borderRadius: 8 }}>
                    <p style={{ margin: 0, color: "#1b5ea6", fontSize: 12, lineHeight: 1.5 }}>
                      Guest day allocations per tier are configured in Tier settings (Founder gets physical days by default). You can adjust the days per tier after setup.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Step 4 — Community ── */}
          {step === 4 && (
            <>
              <Field label="Chapter name">
                <input value={community.chapterName} onChange={e => setCommunity(p => ({ ...p, chapterName: e.target.value }))} placeholder={`Tshimologong ${identity.name}`} style={inputSt} />
              </Field>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 14 }}>Show global content</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                    While local content is being built, show the global content library as a scaffold. Turn off once the local curriculum is ready — local content is always the priority.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCommunity(p => ({ ...p, showGlobalContent: !p.showGlobalContent }))}
                  style={{ width: 44, height: 24, borderRadius: 999, background: community.showGlobalContent ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                >
                  <div style={{ position: "absolute", top: 3, left: community.showGlobalContent ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 5 — Compliance & Payment ── */}
          {step === 5 && (
            <>
              <Field label="Compliance framework name">
                <input value={compliance.complianceFramework} onChange={e => setCompliance(p => ({ ...p, complianceFramework: e.target.value }))} placeholder="BBBEE + ESD (South Africa)" style={inputSt} />
              </Field>
              <Field label="VAT / tax rate (%)">
                <input
                  type="number" min={0} max={100}
                  value={compliance.taxConfigJson.vatRate}
                  onChange={e => setCompliance(p => ({ ...p, taxConfigJson: { ...p.taxConfigJson, vatRate: e.target.value } }))}
                  placeholder="15"
                  style={{ ...inputSt, width: 120 }}
                />
              </Field>
              <Field label="Payment gateway *">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GATEWAYS.map(g => (
                    <label key={g.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: compliance.paymentGateway === g.value ? "rgba(91,79,207,0.08)" : "var(--color-bg-subtle)", border: `1.5px solid ${compliance.paymentGateway === g.value ? "#5b4fcf" : BORD}`, borderRadius: 10, cursor: "pointer", transition: "all 0.12s" }}>
                      <input type="radio" value={g.value} checked={compliance.paymentGateway === g.value} onChange={e => setCompliance(p => ({ ...p, paymentGateway: e.target.value }))} style={{ accentColor: "#5b4fcf" }} />
                      <div>
                        <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>{g.label}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{g.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── Step 6 — Communications ── */}
          {step === 6 && (
            <>
              <Field label="Registration mode">
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "SELF_REGISTER",      label: "Open",        note: "Anyone can register" },
                    { value: "SELF_REGISTER_AUTO", label: "Auto-approve", note: "Register and auto-activate" },
                    { value: "INVITE_ONLY",        label: "Invite only",  note: "Manager sends invites" },
                  ].map(m => (
                    <label key={m.value} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", background: comms.registrationMode === m.value ? "rgba(91,79,207,0.08)" : "var(--color-bg-subtle)", border: `1.5px solid ${comms.registrationMode === m.value ? "#5b4fcf" : BORD}`, borderRadius: 10, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="radio" value={m.value} checked={comms.registrationMode === m.value} onChange={e => setComms(p => ({ ...p, registrationMode: e.target.value as any }))} style={{ accentColor: "#5b4fcf" }} />
                        <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>{m.label}</span>
                      </div>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 11, paddingLeft: 20 }}>{m.note}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Waitlist message (shown when status is Coming Soon)">
                <textarea value={comms.waitlistMessage} onChange={e => setComms(p => ({ ...p, waitlistMessage: e.target.value }))} placeholder="We're coming to your country soon. Join the waitlist to be first to know." rows={3} style={{ ...inputSt, resize: "vertical" }} />
              </Field>
              <Field label="Welcome / onboarding message">
                <textarea value={comms.onboardingMessage} onChange={e => setComms(p => ({ ...p, onboardingMessage: e.target.value }))} placeholder="Welcome to the Tshimologong community in {country}. Here's how to get started..." rows={3} style={{ ...inputSt, resize: "vertical" }} />
              </Field>
            </>
          )}

          {/* ── Step 7 — Publish ── */}
          {step === 7 && (
            <>
              <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(30,140,110,0.08)", border: "1px solid rgba(30,140,110,0.2)", borderRadius: 10, alignItems: "flex-start" }}>
                <Check size={16} style={{ color: "#1e8c6e", flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, color: "#1e8c6e", fontSize: 13, lineHeight: 1.5 }}>
                  All steps complete. <strong>{identity.name}</strong> is ready to publish. Choose a status below — you can change this at any time.
                </p>
              </div>

              {/* Summary card */}
              <div style={{ background: "var(--color-bg-subtle)", borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
                {[
                  { label: "Country",    value: `${identity.name} (${identity.code})` },
                  { label: "Currency",   value: `${identity.currency} (${identity.currencySymbol})` },
                  { label: "Timezone",   value: identity.timezone },
                  { label: "Gateway",    value: GATEWAYS.find(g => g.value === compliance.paymentGateway)?.label ?? compliance.paymentGateway },
                  { label: "Tiers",      value: tiers.filter(t => t.isActive).map(t => t.name).join(", ") },
                  { label: "Physical",   value: physical.physicalAccessEnabled ? physical.physicalLocation || "Yes" : "No" },
                  { label: "Registration", value: comms.registrationMode.replace(/_/g, " ") },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 12, fontWeight: 600 }}>{row.label}</span>
                    <span style={{ color: "var(--color-text-primary)", fontSize: 12, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <Field label="Initial status">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {([
                    { value: "DRAFT",       label: "Draft",       note: "Internal only — not visible to the public", color: "#6b7280" },
                    { value: "COMING_SOON", label: "Coming Soon", note: "Shows a public waitlist page",              color: "#b86e00" },
                    { value: "ACTIVE",      label: "Active",      note: "Fully live — members can register",         color: "#1e8c6e" },
                  ] as const).map(s => (
                    <label key={s.value} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: targetStatus === s.value ? `${s.color}0f` : "var(--color-bg-subtle)", border: `1.5px solid ${targetStatus === s.value ? s.color : BORD}`, borderRadius: 10, cursor: "pointer" }}>
                      <input type="radio" value={s.value} checked={targetStatus === s.value} onChange={() => setTargetStatus(s.value)} style={{ accentColor: s.color, marginTop: 2 }} />
                      <div>
                        <div style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>{s.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 8, fontSize: 13, color: "#c0392b" }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: `1px solid ${BORD}`, padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg-subtle)" }}>
          <button
            onClick={() => go(step - 1)}
            disabled={step === 1 || saving}
            style={{ padding: "9px 20px", fontSize: 13, fontWeight: 600, background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, cursor: step === 1 ? "default" : "pointer", color: "var(--color-text-secondary)", opacity: step === 1 ? 0.4 : 1 }}
          >
            Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Dot indicators */}
            {STEPS.map(s => (
              <div key={s.id} style={{ width: 6, height: 6, borderRadius: "50%", background: step === s.id ? "#5b4fcf" : step > s.id ? "rgba(91,79,207,0.4)" : BORD, transition: "background 0.15s" }} />
            ))}
          </div>

          <button
            onClick={saveAndNext}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 24px", fontSize: 13, fontWeight: 700, background: "#5b4fcf", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : step === 7 ? `Publish as ${targetStatus.replace("_", " ")}` : (
              <><span>Save & Continue</span><ChevronRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
