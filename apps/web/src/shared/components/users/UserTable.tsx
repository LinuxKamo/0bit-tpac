"use client";
import { useState, useEffect } from "react";

const BORD = "var(--color-content-border)";
const CARD = "var(--color-content-card)";
const ACC  = "#5b4fcf";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  accountStatus: string;
  createdAt: string;
  lastActiveAt?: string | null;
  role?: string;
  _count?: Record<string, number>;
}

export type UserAction =
  | "activate"
  | "suspend"
  | "resend_invite"
  | "hard_delete";

export interface ActionConfig {
  action: UserAction;
  label: string;
  danger?: boolean;
  show?: (user: UserRow) => boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#16a34a", bg: "#f0fdf4" },
  PENDING:   { label: "Pending",   color: "#d97706", bg: "#fffbeb" },
  SUSPENDED: { label: "Suspended", color: "#dc2626", bg: "#fef2f2" },
  DELETED:   { label: "Deleted",   color: "#6b7280", bg: "#f9fafb" },
};

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const timeAgo = (d: string | null | undefined) => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
};

export const initials = (u: UserRow) =>
  `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || u.email[0].toUpperCase();

export const fullName = (u: UserRow) =>
  u.displayName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

// ── Action Buttons ────────────────────────────────────────────────────────────

function ActionButtons({
  user, actions, onAction,
}: {
  user: UserRow;
  actions: ActionConfig[];
  onAction: (action: UserAction, user: UserRow) => void;
}) {
  const visible = actions.filter(a => !a.show || a.show(user));
  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
      {visible.map(a => (
        <button
          key={a.action}
          onClick={() => onAction(a.action, user)}
          style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap" as const,
            border: a.danger ? "1px solid #fca5a5" : `1px solid ${BORD}`,
            background: a.danger ? "#fef2f2" : "transparent",
            color: a.danger ? "#dc2626" : "var(--color-text-secondary)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = a.danger ? "#fee2e2" : "var(--color-content-bg)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = a.danger ? "#fef2f2" : "transparent";
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ── Invite Modal ──────────────────────────────────────────────────────────────

export function InviteModal({
  role, onClose, onInvite,
}: {
  role: string;
  onClose: () => void;
  onInvite: (firstName: string, lastName: string, email: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.email.trim()) { setError("Email is required"); return; }
    setLoading(true); setError("");
    try {
      await onInvite(form.firstName.trim(), form.lastName.trim(), form.email.trim().toLowerCase());
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to send invite");
    } finally { setLoading(false); }
  };

  const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-content-bg)", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>Invite {role}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>First Name</label>
              <input style={inp} placeholder="e.g. Sipho" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} autoFocus />
            </div>
            <div>
              <label style={lbl}>Last Name</label>
              <input style={inp} placeholder="e.g. Dlamini" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={lbl}>Email Address *</label>
            <input type="email" style={inp} placeholder="person@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          <div style={{ padding: "10px 12px", background: `${ACC}0a`, border: `1px solid ${ACC}22`, borderRadius: 8, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            They'll receive an email with a link to set their password and activate their account.
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
            <button onClick={submit} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

export function ConfirmModal({
  title, message, confirmLabel = "Confirm", danger = false,
  onConfirm, onClose,
}: {
  title: string; message: string; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
      <div style={{ background: CARD, borderRadius: 14, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: danger ? "#dc2626" : ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500, background: type === "error" ? "#dc2626" : "#16a34a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10, maxWidth: 380 }}>
      <span>{type === "error" ? "⚠" : "✓"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16 }}>×</button>
    </div>
  );
}

// ── Main UserTable ─────────────────────────────────────────────────────────────

export default function UserTable({
  users, actions, onAction, extraColumns, loading,
}: {
  users: UserRow[];
  actions: ActionConfig[];
  onAction: (action: UserAction, user: UserRow) => void;
  extraColumns?: { header: string; render: (u: UserRow) => React.ReactNode }[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
        <p style={{ margin: 0 }}>No users found.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" as const }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORD}` }}>
            {["User", "Status", ...(extraColumns?.map(c => c.header) ?? []), "Joined", "Last Active", "Actions"].map((h, i) => (
              <th key={i} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", background: "var(--color-content-bg)", whiteSpace: "nowrap" as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => {
            const sm = STATUS_META[u.accountStatus] ?? STATUS_META.PENDING;
            return (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${BORD}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-content-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {/* User */}
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${ACC}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: ACC, flexShrink: 0, overflow: "hidden" }}>
                      {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials(u)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{fullName(u)}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                {/* Status */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: sm.bg, color: sm.color, border: `1px solid ${sm.color}33` }}>
                    {sm.label}
                  </span>
                </td>
                {/* Extra columns */}
                {extraColumns?.map((col, ci) => (
                  <td key={ci} style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-text-muted)" }}>
                    {col.render(u)}
                  </td>
                ))}
                {/* Joined */}
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" as const }}>
                  {fmtDate(u.createdAt)}
                </td>
                {/* Last Active */}
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" as const }}>
                  {timeAgo(u.lastActiveAt)}
                </td>
                {/* Actions */}
                <td style={{ padding: "12px 16px" }}>
                  <ActionButtons user={u} actions={actions} onAction={onAction} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
