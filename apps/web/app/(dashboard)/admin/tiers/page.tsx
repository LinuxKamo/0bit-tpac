"use client";
import { useState, useEffect, useCallback } from "react";
import { Layers, CheckCircle, ChevronDown, Globe, RefreshCw, Pencil, Check, X } from "lucide-react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

const TIER_COLORS: Record<string, string> = {
  EXPLORER:  "#5b4fcf",
  BUILDER:   "#1e8c6e",
  FOUNDER:   "#b86e00",
  CORPORATE: "#1b5ea6",
  DIASPORA:  "#c0392b",
};

const inputSt: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: "var(--color-bg-subtle)",
  border: `1px solid ${BORD}`, borderRadius: 8,
  fontSize: 13, color: "var(--color-text-primary)",
  outline: "none", boxSizing: "border-box",
};

interface Country {
  id: string;
  name: string;
  code: string;
  flagEmoji: string | null;
  currency: string;
  currencySymbol: string | null;
  status: string;
}

interface Tier {
  id: string;
  slot: string;
  name: string;
  price: number;
  billingCycle: string;
  isActive: boolean;
  isRecommended: boolean;
  description: string | null;
  featuresJson: any;
  guestDaysPerMonth: number | null;
}

// ── Country selector dropdown ──────────────────────────────────────────────────

function CountryPicker({
  countries, selected, onSelect,
}: {
  countries: Country[];
  selected: Country | null;
  onSelect: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "#1e8c6e", COMING_SOON: "#b86e00", DRAFT: "#6b7280", INACTIVE: "#c0392b",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", background: CARD,
          border: `1px solid ${BORD}`, borderRadius: 10,
          cursor: "pointer", minWidth: 220,
        }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: 20 }}>{selected.flagEmoji || "🌍"}</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13 }}>{selected.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{selected.code} · {selected.currency}</div>
            </div>
          </>
        ) : (
          <>
            <Globe size={16} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ color: "var(--color-text-muted)", fontSize: 13, flex: 1, textAlign: "left" }}>Select a country</span>
          </>
        )}
        <ChevronDown size={14} style={{ color: "var(--color-text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: 6, zIndex: 101, minWidth: 240, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            {countries.map(c => (
              <button
                key={c.id}
                onClick={() => { onSelect(c); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 12px",
                  background: selected?.id === c.id ? "rgba(91,79,207,0.08)" : "transparent",
                  border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18 }}>{c.flagEmoji || "🌍"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{c.code} · {c.currency}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 8px",
                  color: STATUS_COLOR[c.status] ?? "#6b7280",
                  background: `${STATUS_COLOR[c.status] ?? "#6b7280"}18`,
                }}>
                  {c.status.replace("_", " ")}
                </span>
                {selected?.id === c.id && <Check size={13} style={{ color: "#5b4fcf", flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Tier card ──────────────────────────────────────────────────────────────────

function TierCard({
  tier, country, onSaved,
}: {
  tier: Tier;
  country: Country;
  onSaved: (updated: Tier) => void;
}) {
  const color = TIER_COLORS[tier.slot] ?? "#5b4fcf";
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [draft,   setDraft]   = useState<Tier>({ ...tier });

  const startEdit = () => { setDraft({ ...tier }); setError(null); setEditing(true); };
  const cancel    = () => { setEditing(false); setError(null); };

  const save = async () => {
    setSaving(true); setError(null);
    try {
      await apiClient.post(endpoints.admin.countryTiers(country.id), {
        tiers: [{ slot: draft.slot, name: draft.name, price: draft.price, isActive: draft.isActive, isRecommended: draft.isRecommended, description: draft.description, guestDaysPerMonth: draft.guestDaysPerMonth }],
      });
      onSaved(draft);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const sym = country.currencySymbol || country.currency;
  const priceLabel = tier.slot === "EXPLORER" ? "Free" : tier.slot === "CORPORATE" ? "Custom" : `${sym}${tier.price}/mo`;

  return (
    <div style={{
      background: CARD, borderRadius: 14,
      border: `1px solid ${editing ? color : BORD}`,
      display: "flex", flexDirection: "column",
      transition: "border-color 0.15s",
      opacity: tier.isActive ? 1 : 0.55,
    }}>
      {/* Coloured top bar */}
      <div style={{ height: 3, background: tier.isActive ? color : "var(--color-content-border)", borderRadius: "14px 14px 0 0" }} />

      <div style={{ padding: "20px 20px 16px", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={16} style={{ color }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {tier.isRecommended && (
              <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}15`, borderRadius: 99, padding: "2px 8px", letterSpacing: "0.04em" }}>RECOMMENDED</span>
            )}
            {!tier.isActive && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", background: "rgba(107,114,128,0.12)", borderRadius: 99, padding: "2px 8px" }}>INACTIVE</span>
            )}
          </div>
        </div>

        {!editing ? (
          <>
            <div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 3 }}>{tier.slot}</div>
            <div style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 22, marginBottom: 2 }}>{priceLabel}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginBottom: 10 }}>
              {tier.slot === "EXPLORER" ? "forever" : tier.slot === "CORPORATE" ? "contact for pricing" : `per month · ${country.currency}`}
            </div>
            {tier.description && (
              <p style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{tier.description}</p>
            )}
            {tier.guestDaysPerMonth != null && tier.guestDaysPerMonth > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <CheckCircle size={11} style={{ color, flexShrink: 0 }} />
                <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>{tier.guestDaysPerMonth} co-working days/mo</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Display name</label>
              <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} style={inputSt} />
            </div>

            {tier.slot !== "EXPLORER" && tier.slot !== "CORPORATE" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Price ({country.currency})</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{sym}</span>
                  <input type="number" min={0} value={draft.price} onChange={e => setDraft(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} style={{ ...inputSt, width: 100 }} />
                </div>
              </div>
            )}

            {tier.slot !== "EXPLORER" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Co-working days/mo</label>
                <input type="number" min={0} value={draft.guestDaysPerMonth ?? ""} placeholder="0 = unlimited" onChange={e => setDraft(p => ({ ...p, guestDaysPerMonth: parseInt(e.target.value) || null }))} style={{ ...inputSt, width: 120 }} />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Description</label>
              <textarea value={draft.description ?? ""} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputSt, resize: "vertical" }} />
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Active",      key: "isActive"      as const },
                { label: "Recommended", key: "isRecommended" as const },
              ].map(({ label, key }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <button
                    type="button"
                    onClick={() => setDraft(p => ({ ...p, [key]: !p[key] }))}
                    style={{ width: 36, height: 20, borderRadius: 999, background: draft[key] ? color : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                  >
                    <div style={{ position: "absolute", top: 2, left: draft[key] ? 17 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                  <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{label}</span>
                </label>
              ))}
            </div>

            {error && <div style={{ color: "#c0392b", fontSize: 12 }}>{error}</div>}
          </div>
        )}
      </div>

      {/* Footer action */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORD}` }}>
        {!editing ? (
          <button onClick={startEdit} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "8px 0", background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Pencil size={12} /> Edit Tier
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={cancel} disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 0", background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, color: "var(--color-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <X size={12} /> Cancel
            </button>
            <button onClick={save} disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 0", background: color, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              <Check size={12} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty / no country selected state ─────────────────────────────────────────

function NoSelection({ hasCountries }: { hasCountries: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(91,79,207,0.08)", border: "2px dashed rgba(91,79,207,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Globe size={28} style={{ color: "#5b4fcf" }} />
      </div>
      <div>
        <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 16 }}>
          {hasCountries ? "Select a country to view its tiers" : "No countries configured yet"}
        </div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 6 }}>
          {hasCountries
            ? "Use the country selector above to view and edit tier pricing."
            : "Set up a country first from the Country Management page."}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TierPricingPage() {
  const [countries,        setCountries]        = useState<Country[]>([]);
  const [selectedCountry,  setSelectedCountry]  = useState<Country | null>(null);
  const [tiers,            setTiers]            = useState<Tier[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingTiers,     setLoadingTiers]     = useState(false);

  // Load countries on mount
  useEffect(() => {
    apiClient.get(endpoints.admin.countries)
      .then(res => {
        const list: Country[] = res.data.data.countries ?? [];
        setCountries(list);
        // Auto-select the first active country if available, else first in list
        const first = list.find(c => c.status === "ACTIVE") ?? list[0] ?? null;
        if (first) setSelectedCountry(first);
      })
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // Load tiers whenever selected country changes
  const loadTiers = useCallback(async (countryId: string) => {
    setLoadingTiers(true);
    try {
      const res = await apiClient.get(endpoints.admin.countryTiers(countryId));
      setTiers(res.data.data.tiers ?? []);
    } catch {
      setTiers([]);
    } finally {
      setLoadingTiers(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) loadTiers(selectedCountry.id);
    else setTiers([]);
  }, [selectedCountry, loadTiers]);

  const handleTierSaved = (updated: Tier) => {
    setTiers(prev => prev.map(t => t.slot === updated.slot ? updated : t));
  };

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Tier & Pricing</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            {selectedCountry
              ? `Viewing tiers for ${selectedCountry.flagEmoji ?? ""} ${selectedCountry.name} · prices in ${selectedCountry.currency}`
              : "Select a country to manage its membership tiers"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loadingCountries ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: 13 }}>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading countries…
            </div>
          ) : (
            <CountryPicker
              countries={countries}
              selected={selectedCountry}
              onSelect={c => setSelectedCountry(c)}
            />
          )}
          {selectedCountry && (
            <button onClick={() => loadTiers(selectedCountry.id)} title="Refresh tiers" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORD}`, borderRadius: 8, cursor: "pointer", color: "var(--color-text-muted)" }}>
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {!selectedCountry ? (
        <NoSelection hasCountries={countries.length > 0} />
      ) : loadingTiers ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--color-text-muted)", fontSize: 14 }}>
          <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Loading tiers…
        </div>
      ) : tiers.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12, textAlign: "center" }}>
          <Layers size={32} style={{ color: "var(--color-text-muted)" }} />
          <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 15 }}>No tiers configured for {selectedCountry.name}</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            Go to <a href={`/admin/countries/${selectedCountry.id}`} style={{ color: "#5b4fcf" }}>Country Management → {selectedCountry.name}</a> to configure tiers.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {tiers.map(t => (
            <TierCard key={t.slot} tier={t} country={selectedCountry} onSaved={handleTierSaved} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
