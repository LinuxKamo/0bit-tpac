"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Globe, Layers, Building2, Users, Shield,
  MessageSquare, Zap, Pencil, Check, X, RefreshCw, ChevronDown,
} from "lucide-react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";
import * as Flags from "country-flag-icons/react/3x2";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

function FlagImg({ code, size = 40 }: { code: string; size?: number }) {
  const FlagComponent = (Flags as any)[code.toUpperCase()];
  if (!FlagComponent) return <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>🌍</span>;
  return <FlagComponent style={{ width: size, height: "auto", borderRadius: 4, display: "block" }} title={code} />;
}

const inputSt: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: "var(--color-bg-subtle)",
  border: `1px solid ${BORD}`, borderRadius: 8,
  fontSize: 13, color: "var(--color-text-primary)",
  outline: "none", boxSizing: "border-box",
};
const labelSt: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "var(--color-text-muted)", letterSpacing: "0.06em",
  textTransform: "uppercase", marginBottom: 5,
};

// ── Status meta ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; note: string }> = {
  DRAFT:       { label: "Draft",       color: "#6b7280", note: "Internal only — not visible to the public" },
  COMING_SOON: { label: "Coming Soon", color: "#b86e00", note: "Public waitlist page is shown" },
  ACTIVE:      { label: "Active",      color: "#1e8c6e", note: "Fully live — members can register" },
  INACTIVE:    { label: "Inactive",    color: "#c0392b", note: "Hidden from public, existing members unaffected" },
};

const TIER_SLOTS = ["EXPLORER", "BUILDER", "FOUNDER", "CORPORATE", "DIASPORA"];
const CURRENCIES = [
  { code: "ZAR", symbol: "R" }, { code: "KES", symbol: "KSh" },
  { code: "NGN", symbol: "₦" }, { code: "GHS", symbol: "₵"  },
  { code: "USD", symbol: "$" }, { code: "EUR", symbol: "€"  },
  { code: "GBP", symbol: "£" },
];
const TIMEZONES = [
  "Africa/Johannesburg", "Africa/Nairobi", "Africa/Lagos",
  "Africa/Accra", "Africa/Cairo", "America/New_York", "Europe/London",
];

// ── Shared field row ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}
function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

// ── Section wrapper with edit toggle ──────────────────────────────────────────

function Section({
  title, icon: Icon, editing, onEdit, onSave, onCancel, saving, children, viewContent,
}: {
  title: string; icon: React.FC<any>; editing: boolean;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
  saving: boolean; children: React.ReactNode; viewContent: React.ReactNode;
}) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${BORD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(91,79,207,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} style={{ color: "#5b4fcf" }} />
          </div>
          <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 14 }}>{title}</span>
        </div>
        {!editing ? (
          <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#5b4fcf", background: "rgba(91,79,207,0.08)", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
            <Pencil size={12} /> Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", background: "transparent", border: `1px solid ${BORD}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
              <X size={12} /> Cancel
            </button>
            <button onClick={onSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#fff", background: "#5b4fcf", border: "none", borderRadius: 6, padding: "5px 14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              <Check size={12} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>
        {editing ? children : viewContent}
      </div>
    </div>
  );
}

// ── Read-only value display ────────────────────────────────────────────────────

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <div style={{ color: value ? "var(--color-text-primary)" : "var(--color-text-muted)", fontSize: 13, fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}
function KVGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
      {items.map(i => <KV key={i.label} label={i.label} value={i.value} />)}
    </div>
  );
}

// ── Toggle helper ──────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 999, background: value ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
      <div style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [country,  setCountry]  = useState<any>(null);
  const [tiers,    setTiers]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Section edit state ─────────────────────────────────────────────────────
  const [editSection, setEditSection] = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [sectionErr,  setSectionErr]  = useState<string | null>(null);

  // Draft values per section (populated when Edit is clicked)
  const [draftIdentity,    setDraftIdentity]    = useState<any>({});
  const [draftPhysical,    setDraftPhysical]    = useState<any>({});
  const [draftCommunity,   setDraftCommunity]   = useState<any>({});
  const [draftCompliance,  setDraftCompliance]  = useState<any>({});
  const [draftComms,       setDraftComms]       = useState<any>({});
  const [draftTiers,       setDraftTiers]       = useState<any[]>([]);

  // Status change state
  const [statusOpen,     setStatusOpen]     = useState(false);
  const [statusSaving,   setStatusSaving]   = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        apiClient.get(endpoints.admin.countryById(id)),
        apiClient.get(endpoints.admin.countryTiers(id)),
      ]);
      setCountry(cRes.data.data.country);
      setTiers(tRes.data.data.tiers ?? []);
    } catch {
      setError("Failed to load country");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Edit helpers ───────────────────────────────────────────────────────────

  const startEdit = (section: string) => {
    setSectionErr(null);
    setEditSection(section);
    if (section === "identity")   setDraftIdentity({ name: country.name, code: country.code, currency: country.currency, currencySymbol: country.currencySymbol, timezone: country.timezone, flagEmoji: country.flagEmoji });
    if (section === "tiers")      setDraftTiers(tiers.map(t => ({ ...t })));
    if (section === "physical")   setDraftPhysical({ physicalAccessEnabled: country.physicalAccessEnabled, physicalLocation: country.physicalLocation, physicalAddress: country.physicalAddress });
    if (section === "community")  setDraftCommunity({ chapterName: country.chapterName, showGlobalContent: country.showGlobalContent });
    if (section === "compliance") setDraftCompliance({ complianceFramework: country.complianceFramework, paymentGateway: country.paymentGateway, taxConfigJson: country.taxConfigJson ?? {} });
    if (section === "comms")      setDraftComms({ registrationMode: country.registrationMode, waitlistMessage: country.waitlistMessage, onboardingMessage: country.onboardingMessage });
  };

  const cancelEdit = () => { setEditSection(null); setSectionErr(null); };

  const saveSection = async (section: string, payload: any) => {
    setSaving(true); setSectionErr(null);
    try {
      if (section === "tiers") {
        await apiClient.post(endpoints.admin.countryTiers(id), { tiers: draftTiers });
        setTiers(draftTiers);
      } else {
        await apiClient.patch(endpoints.admin.countryById(id), payload);
        setCountry((prev: any) => ({ ...prev, ...payload }));
      }
      setEditSection(null);
    } catch (err: any) {
      setSectionErr(err?.response?.data?.message ?? "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Status change ──────────────────────────────────────────────────────────

  const changeStatus = async (status: string) => {
    setStatusSaving(true); setSectionErr(null);
    try {
      await apiClient.patch(endpoints.admin.countryStatus(id), { status });
      setCountry((prev: any) => ({ ...prev, status }));
      setStatusOpen(false);
    } catch (err: any) {
      setSectionErr(err?.response?.data?.message ?? "Status change failed.");
    } finally {
      setStatusSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--color-text-muted)", fontSize: 14 }}>
      <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !country) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
      {error ?? "Country not found"}
    </div>
  );

  const sm = STATUS_META[country.status] ?? STATUS_META.DRAFT;

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px", background: BG }}>

      {/* ── Back + header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <button onClick={() => router.push("/admin/countries")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}>
            <ArrowLeft size={14} /> Back to Country Management
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <FlagImg code={country.code} size={48} />
            <div>
              <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>{country.name}</h1>
              <div style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 3 }}>
                {country.code} · {country.currency}{country.currencySymbol ? ` (${country.currencySymbol})` : ""} · {country.timezone}
              </div>
            </div>
          </div>
        </div>

        {/* ── Status control ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setStatusOpen(p => !p)}
            disabled={statusSaving}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: CARD, border: `1.5px solid ${sm.color}`, borderRadius: 10, cursor: "pointer", opacity: statusSaving ? 0.7 : 1 }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: sm.color }} />
            <span style={{ color: sm.color, fontWeight: 700, fontSize: 13 }}>{sm.label}</span>
            <ChevronDown size={14} style={{ color: sm.color, transform: statusOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          {statusOpen && (
            <>
              <div onClick={() => setStatusOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: 6, zIndex: 101, minWidth: 260, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => changeStatus(key)}
                    disabled={key === country.status}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", padding: "10px 14px", background: key === country.status ? `${meta.color}10` : "transparent", border: "none", borderRadius: 8, cursor: key === country.status ? "default" : "pointer", textAlign: "left" }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ color: meta.color, fontWeight: 700, fontSize: 13 }}>{meta.label}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 2 }}>{meta.note}</div>
                    </div>
                    {key === country.status && <Check size={14} style={{ color: meta.color, marginLeft: "auto", flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Global error ── */}
      {sectionErr && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 8, fontSize: 13, color: "#c0392b" }}>
          {sectionErr}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── 1. Identity ── */}
        <Section
          title="Identity" icon={Globe}
          editing={editSection === "identity"}
          onEdit={() => startEdit("identity")}
          onSave={() => saveSection("identity", draftIdentity)}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <KVGrid items={[
              { label: "Name",            value: country.name },
              { label: "ISO Code",        value: country.code },
              { label: "Currency",        value: country.currency },
              { label: "Symbol",          value: country.currencySymbol },
              { label: "Timezone",        value: country.timezone },
              { label: "Flag",            value: <FlagImg code={country.code} size={24} /> },
            ]} />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Country name *">
                <input value={draftIdentity.name ?? ""} onChange={e => setDraftIdentity((p: any) => ({ ...p, name: e.target.value }))} style={inputSt} />
              </Field>
              <Field label="ISO code">
                <input value={draftIdentity.code ?? ""} onChange={e => setDraftIdentity((p: any) => ({ ...p, code: e.target.value.toUpperCase().slice(0, 2) }))} style={{ ...inputSt, textTransform: "uppercase" }} maxLength={2} />
              </Field>
            </div>
            <Row2>
              <Field label="Currency">
                <select value={draftIdentity.currency ?? ""} onChange={e => {
                  const sym = CURRENCIES.find(c => c.code === e.target.value)?.symbol ?? "";
                  setDraftIdentity((p: any) => ({ ...p, currency: e.target.value, currencySymbol: sym }));
                }} style={inputSt}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </Field>
              <Field label="Currency symbol">
                <input value={draftIdentity.currencySymbol ?? ""} onChange={e => setDraftIdentity((p: any) => ({ ...p, currencySymbol: e.target.value }))} style={inputSt} />
              </Field>
            </Row2>
            <Row2>
              <Field label="Timezone">
                <select value={draftIdentity.timezone ?? ""} onChange={e => setDraftIdentity((p: any) => ({ ...p, timezone: e.target.value }))} style={inputSt}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="Flag emoji">
                <input value={draftIdentity.flagEmoji ?? ""} onChange={e => setDraftIdentity((p: any) => ({ ...p, flagEmoji: e.target.value }))} style={{ ...inputSt, fontSize: 20 }} />
              </Field>
            </Row2>
          </div>
        </Section>

        {/* ── 2. Tiers ── */}
        <Section
          title="Tier Configuration" icon={Layers}
          editing={editSection === "tiers"}
          onEdit={() => startEdit("tiers")}
          onSave={() => saveSection("tiers", {})}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tiers.length === 0 ? (
                <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>No tiers configured</span>
              ) : tiers.map(t => (
                <div key={t.slot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg-subtle)", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.isActive ? "#1e8c6e" : "var(--color-content-border)" }} />
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{t.slot}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {t.isRecommended && <span style={{ fontSize: 10, fontWeight: 700, color: "#5b4fcf", background: "rgba(91,79,207,0.1)", borderRadius: 99, padding: "2px 8px" }}>RECOMMENDED</span>}
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>
                      {t.slot === "EXPLORER" ? "Free" : t.slot === "CORPORATE" ? "Custom" : `${country.currencySymbol ?? country.currency} ${t.price}/mo`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIER_SLOTS.map(slot => {
              const idx = draftTiers.findIndex(t => t.slot === slot);
              const tier = idx >= 0 ? draftTiers[idx] : { slot, name: slot, price: 0, isActive: false, isRecommended: false };
              const update = (patch: any) => setDraftTiers(prev => {
                const next = [...prev];
                if (idx >= 0) next[idx] = { ...next[idx], ...patch };
                else next.push({ slot, name: slot, price: 0, billingCycle: "monthly", isActive: false, isRecommended: false, ...patch });
                return next;
              });
              return (
                <div key={slot} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
                  <Toggle value={tier.isActive} onChange={v => update({ isActive: v })} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: tier.isActive ? "var(--color-text-primary)" : "var(--color-text-muted)", fontWeight: 700, fontSize: 13 }}>{tier.name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{slot}</div>
                  </div>
                  {slot === "EXPLORER" ? (
                    <span style={{ color: "#1e8c6e", fontWeight: 700, fontSize: 12, padding: "3px 10px", background: "rgba(30,140,110,0.1)", borderRadius: 99 }}>Free</span>
                  ) : slot === "CORPORATE" ? (
                    <span style={{ color: "#b86e00", fontWeight: 700, fontSize: 12, padding: "3px 10px", background: "rgba(184,110,0,0.1)", borderRadius: 99 }}>Custom</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{country.currencySymbol}</span>
                      <input type="number" min={0} value={tier.price} onChange={e => update({ price: parseFloat(e.target.value) || 0 })} disabled={!tier.isActive} style={{ ...inputSt, width: 80, textAlign: "right" }} />
                      <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>/mo</span>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>REC.</span>
                    <Toggle value={tier.isRecommended} onChange={v => setDraftTiers(prev => prev.map((t, i) => ({ ...t, isRecommended: i === idx ? v : false })))} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── 3. Physical ── */}
        <Section
          title="Physical Settings" icon={Building2}
          editing={editSection === "physical"}
          onEdit={() => startEdit("physical")}
          onSave={() => saveSection("physical", draftPhysical)}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <KVGrid items={[
              { label: "Physical access", value: country.physicalAccessEnabled ? "Enabled" : "Disabled" },
              { label: "Venue",           value: country.physicalLocation },
              { label: "Address",         value: country.physicalAddress },
            ]} />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
              <div>
                <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>Physical co-working access</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>Members with eligible tiers can book desk days</div>
              </div>
              <Toggle value={draftPhysical.physicalAccessEnabled ?? false} onChange={v => setDraftPhysical((p: any) => ({ ...p, physicalAccessEnabled: v }))} />
            </div>
            {draftPhysical.physicalAccessEnabled && (
              <>
                <Field label="Venue name">
                  <input value={draftPhysical.physicalLocation ?? ""} onChange={e => setDraftPhysical((p: any) => ({ ...p, physicalLocation: e.target.value }))} style={inputSt} />
                </Field>
                <Field label="Full address">
                  <input value={draftPhysical.physicalAddress ?? ""} onChange={e => setDraftPhysical((p: any) => ({ ...p, physicalAddress: e.target.value }))} style={inputSt} />
                </Field>
              </>
            )}
          </div>
        </Section>

        {/* ── 4. Community ── */}
        <Section
          title="Community" icon={Users}
          editing={editSection === "community"}
          onEdit={() => startEdit("community")}
          onSave={() => saveSection("community", draftCommunity)}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <KVGrid items={[
              { label: "Chapter name",      value: country.chapterName },
              { label: "Show global content", value: country.showGlobalContent ? "Yes" : "No — local only" },
            ]} />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Chapter name">
              <input value={draftCommunity.chapterName ?? ""} onChange={e => setDraftCommunity((p: any) => ({ ...p, chapterName: e.target.value }))} style={inputSt} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "14px 16px", background: "var(--color-bg-subtle)", borderRadius: 10, border: `1px solid ${BORD}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>Show global content</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                  While local content is being built, show the global library as a scaffold. Turn off once the local curriculum is ready — local content is always the priority.
                </div>
              </div>
              <Toggle value={draftCommunity.showGlobalContent ?? true} onChange={v => setDraftCommunity((p: any) => ({ ...p, showGlobalContent: v }))} />
            </div>
          </div>
        </Section>

        {/* ── 5. Compliance ── */}
        <Section
          title="Compliance & Payments" icon={Shield}
          editing={editSection === "compliance"}
          onEdit={() => startEdit("compliance")}
          onSave={() => saveSection("compliance", draftCompliance)}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <KVGrid items={[
              { label: "Framework",       value: country.complianceFramework },
              { label: "Payment gateway", value: country.paymentGateway },
              { label: "VAT rate",        value: country.taxConfigJson?.vatRate ? `${country.taxConfigJson.vatRate}%` : null },
            ]} />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Compliance framework">
              <input value={draftCompliance.complianceFramework ?? ""} onChange={e => setDraftCompliance((p: any) => ({ ...p, complianceFramework: e.target.value }))} style={inputSt} />
            </Field>
            <Row2>
              <Field label="Payment gateway">
                <select value={draftCompliance.paymentGateway ?? ""} onChange={e => setDraftCompliance((p: any) => ({ ...p, paymentGateway: e.target.value }))} style={inputSt}>
                  {["payfast", "stripe", "manual"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="VAT rate (%)">
                <input type="number" min={0} max={100} value={draftCompliance.taxConfigJson?.vatRate ?? ""} onChange={e => setDraftCompliance((p: any) => ({ ...p, taxConfigJson: { ...p.taxConfigJson, vatRate: e.target.value } }))} style={inputSt} />
              </Field>
            </Row2>
          </div>
        </Section>

        {/* ── 6. Communications ── */}
        <Section
          title="Communications" icon={MessageSquare}
          editing={editSection === "comms"}
          onEdit={() => startEdit("comms")}
          onSave={() => saveSection("comms", draftComms)}
          onCancel={cancelEdit} saving={saving}
          viewContent={
            <KVGrid items={[
              { label: "Registration mode",   value: country.registrationMode?.replace(/_/g, " ") },
              { label: "Waitlist message",    value: country.waitlistMessage ? "Set" : null },
              { label: "Onboarding message",  value: country.onboardingMessage ? "Set" : null },
            ]} />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Registration mode">
              <select value={draftComms.registrationMode ?? ""} onChange={e => setDraftComms((p: any) => ({ ...p, registrationMode: e.target.value }))} style={inputSt}>
                <option value="SELF_REGISTER">Open — anyone can register</option>
                <option value="SELF_REGISTER_AUTO">Auto-approve — register and activate instantly</option>
                <option value="INVITE_ONLY">Invite only — manager sends invites</option>
              </select>
            </Field>
            <Field label="Waitlist message (shown when Coming Soon)">
              <textarea value={draftComms.waitlistMessage ?? ""} onChange={e => setDraftComms((p: any) => ({ ...p, waitlistMessage: e.target.value }))} rows={3} style={{ ...inputSt, resize: "vertical" }} />
            </Field>
            <Field label="Welcome / onboarding message">
              <textarea value={draftComms.onboardingMessage ?? ""} onChange={e => setDraftComms((p: any) => ({ ...p, onboardingMessage: e.target.value }))} rows={3} style={{ ...inputSt, resize: "vertical" }} />
            </Field>
          </div>
        </Section>

      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
