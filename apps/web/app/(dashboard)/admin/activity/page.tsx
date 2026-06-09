"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "#1e8c6e", LOGOUT: "#6b7280",
  USER_INVITED: "#5b4fcf", MANAGER_INVITED: "#5b4fcf", MENTOR_INVITED: "#5b4fcf",
  USER_STATUS_UPDATED: "#b86e00", USER_ROLE_UPDATED: "#b86e00",
  CREATE: "#1e8c6e", UPDATE: "#5b4fcf", DELETE: "#dc2626",
  SUSPEND: "#dc2626", ACTIVATE: "#1e8c6e",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const initials = (u: any) => {
  const name = u?.displayName || `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || u?.email || "?";
  return name.slice(0, 2).toUpperCase();
};

const displayName = (u: any) =>
  u?.displayName || `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || u?.email || "Unknown";

export default function ActivityLogsPage() {
  const [logs,    setLogs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState("");

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p };
      if (search) params.action = search;
      const res = await apiClient.get(endpoints.admin.activity, { params });
      const d = res.data.data;
      setLogs(d.logs ?? []);
      setTotal(d.pagination?.total ?? 0);
      setPages(d.pagination?.pages ?? 1);
      setPage(p);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "var(--color-content-bg)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)" }}>Activity Logs</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            Audit trail of all platform actions{total > 0 && <> · <strong style={{ color: "var(--color-text-primary)" }}>{total}</strong> entries</>}
          </p>
        </div>
        <button
          onClick={() => load(1)}
          style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, color: "var(--color-text-muted)", cursor: "pointer" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Card */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--color-text-muted)", pointerEvents: "none" }}>🔍</span>
            <input
              placeholder="Filter by action (e.g. LOGIN, INVITE)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 32, paddingRight: 10, height: 34, border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-content-bg)", outline: "none", boxSizing: "border-box" as const }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" as const, color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" as const, color: "var(--color-text-muted)", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            No activity yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                {["User", "Action", "Detail", "IP", "When"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", background: "var(--color-content-bg)", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const color = ACTION_COLORS[log.action] ?? "#6b7280";
                return (
                  <tr
                    key={log.id ?? i}
                    style={{ borderBottom: i < logs.length - 1 ? `1px solid ${BORD}` : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-content-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* User */}
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#5b4fcf18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#5b4fcf", flexShrink: 0 }}>
                          {initials(log.user)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>{displayName(log.user)}</div>
                          <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{log.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Action */}
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: `${color}15`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" as const }}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    {/* Detail */}
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--color-text-secondary)", maxWidth: 300 }}>
                      {log.meta ? JSON.stringify(log.meta) : "—"}
                    </td>
                    {/* IP */}
                    <td style={{ padding: "11px 16px", fontSize: 11, color: "var(--color-text-muted)", fontFamily: "monospace", whiteSpace: "nowrap" as const }}>
                      {log.ip ?? "—"}
                    </td>
                    {/* When */}
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" as const }}>
                      {fmtDate(log.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Page {page} of {pages}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => load(page - 1)} disabled={page <= 1} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", fontSize: 12, cursor: page <= 1 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= pages} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", fontSize: 12, cursor: page >= pages ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: page >= pages ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
