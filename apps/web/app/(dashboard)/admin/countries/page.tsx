"use client";
import { useState, useEffect, useCallback } from "react";
import { Globe, Plus, CheckCircle, Clock, AlertTriangle, RefreshCw, Settings, Zap } from "lucide-react";
import Link from "next/link";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";
import CountryWizard from "@/shared/components/country/CountryWizard";
import * as Flags from "country-flag-icons/react/3x2";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

// Local SVG flag — no network needed, works everywhere
function FlagImg({ code, size = 32 }: { code: string; size?: number }) {
  const FlagComponent = (Flags as any)[code.toUpperCase()];
  if (!FlagComponent) return <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>🌍</span>;
  return <FlagComponent style={{ width: size, height: "auto", borderRadius: 3, display: "block" }} title={code} />;
}

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string | null;
  flagEmoji: string | null;
  status: "DRAFT" | "COMING_SOON" | "ACTIVE" | "INACTIVE";
  createdAt: string;
  _count: { members: number; managers: number; tiers: number };
}

const STATUS_META: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  ACTIVE:      { label: "Active",      color: "#1e8c6e", icon: CheckCircle  },
  COMING_SOON: { label: "Coming Soon", color: "#b86e00", icon: Clock        },
  DRAFT:       { label: "Draft",       color: "#6b7280", icon: Settings     },
  INACTIVE:    { label: "Inactive",    color: "#c0392b", icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <span style={{ background: `${m.color}18`, color: m.color, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 10px", letterSpacing: "0.04em" }}>
      {m.label.toUpperCase()}
    </span>
  );
}

function EmptyState({ onSetup }: { onSetup: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 24, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(91,79,207,0.10)", border: "2px dashed rgba(91,79,207,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Globe size={36} style={{ color: "#5b4fcf" }} />
      </div>
      <div>
        <h2 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 22, margin: 0 }}>
          No countries configured
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 8, maxWidth: 400, lineHeight: 1.6 }}>
          Country configuration is the required first step before members can join, tiers are sold, or any revenue is tracked.
        </p>
      </div>
      <button
        onClick={onSetup}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 28px", background: "#5b4fcf", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
      >
        <Zap size={18} />
        Configure your first country
      </button>
      <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
        This takes about 5 minutes. You can start with a Draft and publish when ready.
      </p>
    </div>
  );
}

function CountryCard({ country, onRefresh }: { country: Country; onRefresh: () => void }) {
  const m = STATUS_META[country.status] ?? STATUS_META.DRAFT;
  const Icon = m.icon;

  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORD}`, padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FlagImg code={country.code} size={44} />
          <div>
            <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 15 }}>{country.name}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 2 }}>
              {country.code} · {country.currency}{country.currencySymbol ? ` (${country.currencySymbol})` : ""}
            </div>
          </div>
        </div>
        <StatusBadge status={country.status} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Members",  value: country._count.members.toLocaleString() },
          { label: "Managers", value: country._count.managers.toLocaleString() },
          { label: "Tiers",    value: country._count.tiers.toString() },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--color-bg-subtle)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 18, fontWeight: 800, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${BORD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={12} style={{ color: m.color }} />
          <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
            Added {new Date(country.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <Link
          href={`/admin/countries/${country.id}`}
          style={{ fontSize: 12, fontWeight: 600, color: "#5b4fcf", background: "rgba(91,79,207,0.08)", borderRadius: 6, padding: "5px 12px", textDecoration: "none" }}
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

export default function CountryManagementPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(endpoints.admin.countries);
      setCountries(res.data.data.countries ?? []);
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    load();
  };

  if (showWizard) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 32px", background: BG }}>
        <CountryWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Country Management</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            Configure and manage country instances
            {countries.length > 0 && ` · ${countries.length} ${countries.length === 1 ? "country" : "countries"}`}
          </p>
        </div>
        {countries.length > 0 && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={load}
              title="Refresh"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, color: "var(--color-text-muted)", cursor: "pointer", fontSize: 13 }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowWizard(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#5b4fcf", border: "none", borderRadius: 8, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              <Plus size={16} /> Add Country
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200, color: "var(--color-text-muted)", fontSize: 14, gap: 10 }}>
          <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
          Loading countries…
        </div>
      ) : countries.length === 0 ? (
        <EmptyState onSetup={() => setShowWizard(true)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {countries.map(c => <CountryCard key={c.id} country={c} onRefresh={load} />)}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
