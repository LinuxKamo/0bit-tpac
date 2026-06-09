"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Globe, TrendingUp, GraduationCap, BarChart3, ArrowUpRight, Zap, ChevronRight } from "lucide-react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

const TIER_COLORS: Record<string, string> = {
  EXPLORER: "#5b4fcf", BUILDER: "#1e8c6e", FOUNDER: "#b86e00",
  CORPORATE: "#1b5ea6", DIASPORA: "#c0392b",
};

function KPI({ label, value, sub, color, icon }: any) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <ArrowUpRight size={14} style={{ color: "#1e8c6e" }} />
      </div>
      <div style={{ color: "var(--color-text-primary)", fontSize: 26, fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>{label}</div>
      <div style={{ color: "#1e8c6e", fontSize: 11, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SetupBanner({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(91,79,207,0.12) 0%, rgba(91,79,207,0.04) 100%)", border: "1.5px solid rgba(91,79,207,0.25)", borderRadius: 16, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(91,79,207,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={26} style={{ color: "#5b4fcf" }} />
        </div>
        <div>
          <div style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
            Set up your first country to get started
          </div>
          <div style={{ color: "var(--color-text-muted)", fontSize: 13, lineHeight: 1.5, maxWidth: 520 }}>
            Country configuration is required before members can register, tiers are sold, or any platform features are available. This takes about 5 minutes.
          </div>
        </div>
      </div>
      <button
        onClick={onStart}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#5b4fcf", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
      >
        Configure a country <ChevronRight size={16} />
      </button>
    </div>
  );
}

const MOCK_MEMBERS = [
  { name: "Priya Naidoo",      country: "ZA", tier: "BUILDER",   joined: "2 hrs ago"  },
  { name: "Oluwaseun Adefemi", country: "NG", tier: "FOUNDER",   joined: "5 hrs ago"  },
  { name: "Amara Diallo",      country: "GH", tier: "EXPLORER",  joined: "1 day ago"  },
  { name: "Thandiwe Mokoena",  country: "ZA", tier: "CORPORATE", joined: "2 days ago" },
  { name: "Kwame Asante",      country: "KE", tier: "EXPLORER",  joined: "2 days ago" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [hasCountries, setHasCountries] = useState<boolean | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Check countries AND dashboard stats in parallel
    Promise.all([
      apiClient.get(endpoints.admin.countries).catch(() => ({ data: { data: { countries: [] } } })),
      apiClient.get(endpoints.admin.dashboard).catch(() => null),
    ]).then(([cRes, dRes]) => {
      const countries = cRes?.data?.data?.countries ?? [];
      setHasCountries(countries.length > 0);
      if (dRes?.data?.data) setStats(dRes.data.data);
    });
  }, []);

  const goSetup = () => router.push("/admin/countries");

  if (hasCountries === null) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
          {hasCountries ? "Platform-wide overview" : "Welcome — let's get the platform set up"}
        </p>
      </div>

      {/* Setup banner — shown when no countries */}
      {!hasCountries && <SetupBanner onStart={goSetup} />}

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24, opacity: hasCountries ? 1 : 0.4, pointerEvents: hasCountries ? "auto" : "none" }}>
        <KPI label="Total Members"     value={stats?.totalMembers   ?? "—"}  sub="Across all countries"  color="#5b4fcf" icon={<Users size={17}/>}         />
        <KPI label="Active Countries"  value={stats?.activeCountries ?? "—"} sub="Configured & live"     color="#1e8c6e" icon={<Globe size={17}/>}         />
        <KPI label="MRR"               value={stats?.mrr            ?? "—"}  sub="All currencies"        color="#b86e00" icon={<TrendingUp size={17}/>}    />
        <KPI label="Active Programmes" value={stats?.programmes     ?? "—"}  sub="Including cohorts"     color="#1b5ea6" icon={<GraduationCap size={17}/>} />
      </div>

      {hasCountries ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          {/* Recent members table */}
          <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}>
              <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>Recent Members</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                  {["Name", "Country", "Tier", "Joined"].map(h => (
                    <th key={h} style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, textAlign: "left", padding: "10px 20px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentMembers ?? MOCK_MEMBERS).map((m: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORD}` }}>
                    <td style={{ padding: "12px 20px", color: "var(--color-text-primary)", fontSize: 13, fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>{m.country}</span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ background: `${TIER_COLORS[m.tier] ?? "#5b4fcf"}18`, color: TIER_COLORS[m.tier] ?? "#5b4fcf", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{m.tier}</span>
                    </td>
                    <td style={{ padding: "12px 20px", color: "var(--color-text-muted)", fontSize: 12 }}>{m.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tier distribution */}
          <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20 }}>
            <div style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tier Distribution</div>
            {Object.entries(stats?.tierDistribution ?? { EXPLORER: 52, BUILDER: 28, FOUNDER: 12, CORPORATE: 6, DIASPORA: 2 }).map(([tier, pct]: [string, any]) => (
              <div key={tier} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{tier}</span>
                  <span style={{ color: TIER_COLORS[tier], fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "var(--color-content-border)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: TIER_COLORS[tier], borderRadius: 99 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <BarChart3 size={14} style={{ color: "var(--color-text-muted)", marginBottom: 6 }} />
              <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
                {stats?.totalMembers ?? "—"} total members across all tiers
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No countries — show a checklist of what's coming */
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: "28px 32px" }}>
          <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Platform setup checklist</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { step: 1, label: "Configure first country",       done: false, action: "Start now →", href: goSetup },
              { step: 2, label: "Set up tier pricing",           done: false, action: null },
              { step: 3, label: "Invite country managers",       done: false, action: null },
              { step: 4, label: "Publish country (go live)",     done: false, action: null },
              { step: 5, label: "Send first member invitations", done: false, action: null },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.done ? "#1e8c6e" : "var(--color-bg-subtle)", border: `2px solid ${item.done ? "#1e8c6e" : BORD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.done
                    ? <span style={{ color: "#fff", fontSize: 12 }}>✓</span>
                    : <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700 }}>{item.step}</span>
                  }
                </div>
                <span style={{ color: item.done ? "var(--color-text-muted)" : "var(--color-text-primary)", fontSize: 14, flex: 1, textDecoration: item.done ? "line-through" : "none" }}>
                  {item.label}
                </span>
                {item.action && (
                  <button onClick={item.href} style={{ color: "#5b4fcf", background: "rgba(91,79,207,0.08)", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {item.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
