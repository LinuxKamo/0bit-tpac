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
          No chapters configured
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 8, maxWidth: 400, lineHeight: 1.6 }}>
          Chapter configuration is the required first step before members can join, tiers are sold, or any revenue is tracked.
        </p>
      </div>
      <button
        onClick={onSetup}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 28px", background: "#5b4fcf", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
      >
        <Zap size={18} />
        Configure your first chapter
      </button>
      <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
        This takes about 5 minutes. You can start with a Draft and publish when ready.
      </p>
    </div>
  );
}

const STAT_ROWS = [
  { key: "members",  label: "MEMBERS",  icon: "person",    bg: "rgba(59,111,212,0.12)",  iconColor: "#4f8ef7" },
  { key: "managers", label: "MANAGERS", icon: "clipboard", bg: "rgba(107,107,138,0.12)", iconColor: "#9090b8" },
  { key: "tiers",    label: "TIERS",    icon: "layers",    bg: "rgba(124,77,204,0.12)",  iconColor: "#a06be0" },
] as const;

function StatIcon({ type, color }: { type: string; color: string }) {
  if (type === "person") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  if (type === "clipboard") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  );
}

function CountryCard({ country, onRefresh }: { country: Country; onRefresh: () => void }) {
  const joinedDate = new Date(country.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const currLabel  = `${country.currency}${country.currencySymbol ? ` (${country.currencySymbol})` : ""}`;
  const counts: Record<string, number> = {
    members:  country._count.members,
    managers: country._count.managers,
    tiers:    country._count.tiers,
  };

  return (
    <div style={{
      background: CARD,
      borderRadius: 18,
      border: `1px solid ${BORD}`,
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 0,
      maxWidth: 340,
    }}>
      {/* Flag + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <FlagImg code={country.code} size={52} />
        <StatusBadge status={country.status} />
      </div>

      {/* Name + subtitle */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{country.name}</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 5 }}>
          {country.code} · {currLabel} · Joined {joinedDate}
        </div>
      </div>

      {/* Stat rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {STAT_ROWS.map(row => (
          <div
            key={row.key}
            style={{
              background: row.bg,
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatIcon type={row.icon} color={row.iconColor} />
              <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>
                {row.label}
              </span>
            </div>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 16 }}>
              {counts[row.key].toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORD, marginBottom: 16 }} />

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link
          href={`/admin/countries/${country.id}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px",
            background: "#5b4fcf",
            borderRadius: 8,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Manage
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M19.07 4.93A10 10 0 0 1 4.93 19.07"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
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
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Chapter Management</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            Configure and manage chapter instances
            {countries.length > 0 && ` · ${countries.length} ${countries.length === 1 ? "chapter" : "chapters"}`}
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
              <Plus size={16} /> Add Chapter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200, color: "var(--color-text-muted)", fontSize: 14, gap: 10 }}>
          <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
          Loading chapters…
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
