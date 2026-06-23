"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Shield, RefreshCw, Mail, Ban, CheckCircle, Trash2, X, Loader2 } from "lucide-react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

interface Admin {
  id:            string;
  email:         string;
  firstName:     string | null;
  lastName:      string | null;
  displayName:   string | null;
  accountStatus: AdminStatus;
  createdAt:     string;
  lastActiveAt:  string | null;
}

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AdminStatus, { label: string; bg: string; color: string }> = {
  ACTIVE:    { label: "Active",    bg: "rgba(30,140,110,0.12)",  color: "#1e8c6e" },
  SUSPENDED: { label: "Suspended", bg: "rgba(184,110,0,0.12)",   color: "#b86e00" },
  PENDING:   { label: "Pending",   bg: "rgba(91,79,207,0.12)",   color: "#5b4fcf" },
};

function StatusBadge({ status }: { status: AdminStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, borderRadius: 999, padding: "3px 10px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      <span style={{ color: cfg.color, fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 10,
      background: type === "success" ? "#1e8c6e" : "#c0392b",
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      animation: "slideIn 0.2s ease",
    }}>
      <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{msg}</span>
      <button onClick={onDone} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 0, lineHeight: 1 }}>
        <X size={14} />
      </button>
      <style>{`@keyframes slideIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────

function ConfirmDialog({ title, body, danger, onConfirm, onCancel, loading }: {
  title: string; body: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: 28, width: 360, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
        <h3 style={{ color: danger ? "#c0392b" : "var(--color-text-primary)", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>{title}</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 24px", lineHeight: 1.5 }}>{body}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, cursor: "pointer", color: "var(--color-text-secondary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, background: danger ? "#c0392b" : "#5b4fcf", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} />}
            {loading ? "Working..." : "Confirm"}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Invite modal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) { setError("Email is required"); return; }
    setLoading(true); setError(null);
    try {
      await apiClient.post(endpoints.superAdmin.adminInvite, {
        email:     form.email.trim().toLowerCase(),
        firstName: form.firstName.trim() || undefined,
        lastName:  form.lastName.trim()  || undefined,
      });
      onSuccess(`Invite sent to ${form.email}`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "var(--color-bg-subtle)",
    border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 13,
    color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box",
  };
  const labelSt: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "var(--color-text-muted)", letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, width: 420, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORD}` }}>
          <div>
            <h2 style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 16, margin: 0 }}>Invite Admin</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 3 }}>They will receive a set-password email</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>First name</label>
              <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Lerato" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Last name</label>
              <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Dlamini" style={inputSt} />
            </div>
          </div>
          <div>
            <label style={labelSt}>Email address *</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@tshimologong.co.za" style={inputSt} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 8, fontSize: 12, color: "#c0392b" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 20px", fontSize: 13, fontWeight: 600, background: "transparent", border: `1px solid ${BORD}`, borderRadius: 8, cursor: "pointer", color: "var(--color-text-secondary)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: "9px 20px", fontSize: 13, fontWeight: 700, background: "#5b4fcf", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} />}
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Inline action buttons ──────────────────────────────────────────────────────

function ActionBtn({ label, icon, onClick, danger }: {
  label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const bg    = danger
    ? (hov ? "rgba(192,57,43,0.14)" : "rgba(192,57,43,0.08)")
    : (hov ? "var(--color-bg-subtle)" : "transparent");
  const color = danger ? "#c0392b" : "var(--color-text-secondary)";
  const border = danger ? "1px solid rgba(192,57,43,0.25)" : `1px solid ${BORD}`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 7, border, background: bg,
        cursor: "pointer", color, fontSize: 12, fontWeight: 600,
        whiteSpace: "nowrap", transition: "background 0.1s",
      }}
    >
      <span style={{ display: "flex", color }}>{icon}</span>
      {label}
    </button>
  );
}

function RowActions({ admin, onAction }: { admin: Admin; onAction: (action: string, admin: Admin) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {admin.accountStatus === "PENDING" && (
        <ActionBtn label="Resend Invite" icon={<Mail size={12} />} onClick={() => onAction("resend", admin)} />
      )}
      {admin.accountStatus === "ACTIVE" && (
        <ActionBtn label="Suspend" icon={<Ban size={12} />} onClick={() => onAction("suspend", admin)} />
      )}
      {admin.accountStatus === "SUSPENDED" && (
        <ActionBtn label="Activate" icon={<CheckCircle size={12} />} onClick={() => onAction("activate", admin)} />
      )}
      <ActionBtn label="Delete" icon={<Trash2 size={12} />} onClick={() => onAction("delete", admin)} danger />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)    return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)     return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)    return `${days}d ago`;
  return formatDate(iso);
}

function adminName(a: Admin) {
  return a.displayName || [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email;
}

function initials(a: Admin) {
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ");
  if (!name) return a.email[0].toUpperCase();
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Page ───────────────────────────────────────────────────────────────────────

type ToastState = { msg: string; type: "success" | "error" } | null;
type Confirm    = { title: string; body: string; danger?: boolean; action: () => Promise<void> } | null;

export default function AdminAccountsPage() {
  const [admins,  setAdmins]  = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState<ToastState>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(endpoints.superAdmin.admins);
      setAdmins(res.data.data.admins ?? []);
    } catch {
      setToast({ msg: "Failed to load admins", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const toast$ = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      await confirm.action();
    } catch {
      // action already handles its own toast
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  const handleAction = (action: string, admin: Admin) => {
    if (action === "delete") {
      setConfirm({
        title:  `Delete ${adminName(admin)}?`,
        body:   `This permanently removes the account and frees the email address. This cannot be undone.`,
        danger: true,
        action: async () => {
          try {
            await apiClient.delete(endpoints.superAdmin.adminRemove(admin.id));
            setAdmins(p => p.filter(a => a.id !== admin.id));
            toast$(`${adminName(admin)} deleted`);
          } catch (err: any) {
            toast$(err?.response?.data?.message ?? "Delete failed", "error");
          }
        },
      });
    }

    if (action === "suspend") {
      setConfirm({
        title:  `Suspend ${adminName(admin)}?`,
        body:   `They will immediately lose access to the platform. You can reactivate them at any time.`,
        action: async () => {
          try {
            await apiClient.patch(endpoints.superAdmin.adminSuspend(admin.id));
            setAdmins(p => p.map(a => a.id === admin.id ? { ...a, accountStatus: "SUSPENDED" } : a));
            toast$(`${adminName(admin)} suspended`);
          } catch (err: any) {
            toast$(err?.response?.data?.message ?? "Suspend failed", "error");
          }
        },
      });
    }

    if (action === "activate") {
      (async () => {
        try {
          await apiClient.patch(endpoints.superAdmin.adminActivate(admin.id));
          setAdmins(p => p.map(a => a.id === admin.id ? { ...a, accountStatus: "ACTIVE" } : a));
          toast$(`${adminName(admin)} activated`);
        } catch (err: any) {
          toast$(err?.response?.data?.message ?? "Activate failed", "error");
        }
      })();
    }

    if (action === "resend") {
      (async () => {
        try {
          await apiClient.post(endpoints.superAdmin.adminResendInvite(admin.id));
          toast$(`Invite resent to ${admin.email}`);
        } catch (err: any) {
          toast$(err?.response?.data?.message ?? "Resend failed", "error");
        }
      })();
    }
  };

  const filtered = admins.filter(a =>
    adminName(a).toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const COLS = [
    { label: "Admin",       width: "35%"   },
    { label: "Status",      width: "120px" },
    { label: "Joined",      width: "120px" },
    { label: "Last Active", width: "120px" },
    { label: "Actions",     width: "220px" },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Admin Accounts</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            {loading ? "Loading..." : `${admins.length} admin${admins.length !== 1 ? "s" : ""} · ${admins.filter(a => a.accountStatus === "ACTIVE").length} active`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            title="Refresh"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 8, background: "transparent", border: `1px solid ${BORD}`, cursor: "pointer", color: "var(--color-text-muted)" }}
          >
            <RefreshCw size={15} style={{ animation: loading ? "spin 0.7s linear infinite" : "none" }} />
          </button>
          <button
            onClick={() => setShowInvite(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 18px", height: 38, background: "#5b4fcf", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            <Plus size={15} /> Invite Admin
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>

        {/* Search bar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={15} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ flex: 1, background: "transparent", border: "none", color: "var(--color-text-primary)", fontSize: 13, outline: "none" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 64, gap: 10, color: "var(--color-text-muted)" }}>
            <Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} />
            <span style={{ fontSize: 13 }}>Loading admins…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={22} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: 0 }}>
              {search ? "No admins match your search" : "No admins yet — invite one to get started"}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                {COLS.map(col => (
                  <th key={col.label} style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textAlign: "left", padding: "10px 20px", whiteSpace: "nowrap", width: col.width }}>
                    {col.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${BORD}` }}>

                  {/* Admin info */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#5b4fcf22", border: "1px solid rgba(91,79,207,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#5b4fcf", fontWeight: 700, fontSize: 12 }}>{initials(a)}</span>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600 }}>{adminName(a)}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 1 }}>{a.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={a.accountStatus} />
                  </td>

                  {/* Joined */}
                  <td style={{ padding: "14px 20px", color: "var(--color-text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(a.createdAt)}
                  </td>

                  {/* Last active */}
                  <td style={{ padding: "14px 20px", color: "var(--color-text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatRelative(a.lastActiveAt)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "10px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <RowActions admin={a} onAction={handleAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals & overlays ── */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={msg => { toast$(msg); fetchAdmins(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          body={confirm.body}
          danger={confirm.danger}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
          loading={confirmLoading}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
