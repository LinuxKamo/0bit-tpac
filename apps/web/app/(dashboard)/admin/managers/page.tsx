"use client";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";
import UserTable, {
  UserRow, UserAction, ActionConfig,
  InviteModal, ConfirmModal, Toast,
} from "@/shared/components/users/UserTable";

const ACC  = "#5b4fcf";
const BORD = "var(--color-content-border)";
const CARD = "var(--color-content-card)";

const STATUS_TABS = ["All", "Active", "Pending", "Suspended"];

const ACTIONS: ActionConfig[] = [
  { action: "activate",      label: "Activate",     show: u => u.accountStatus === "SUSPENDED" },
  { action: "suspend",       label: "Suspend",       show: u => u.accountStatus === "ACTIVE" },
  { action: "resend_invite", label: "Resend Invite", show: u => u.accountStatus === "PENDING" },
  { action: "hard_delete",   label: "Hard Delete",   danger: true },
];

export default function ManagersPage() {
  const [users,      setUsers]      = useState<UserRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [tab,        setTab]        = useState("All");
  const [showInvite, setShowInvite] = useState(false);
  const [confirm,    setConfirm]    = useState<{ action: UserAction; user: UserRow } | null>(null);
  const [toast,      setToast]      = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await apiClient.get(endpoints.admin.managers, { params });
      setUsers(res.data.data.managers ?? []);
    } catch { showToast("Failed to load managers", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const executeAction = async (action: UserAction, user: UserRow) => {
    try {
      if (action === "activate" || action === "suspend") {
        const status = action === "activate" ? "ACTIVE" : "SUSPENDED";
        await apiClient.patch(endpoints.admin.userStatus(user.id), { status });
        showToast(`Manager ${action === "activate" ? "activated" : "suspended"}`);
      } else if (action === "resend_invite") {
        await apiClient.post(endpoints.admin.userResendInvite(user.id));
        showToast("Invite resent successfully");
      } else if (action === "hard_delete") {
        await apiClient.delete(endpoints.admin.userHardDelete(user.id));
        showToast("Manager permanently deleted");
      }
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Action failed", "error");
    }
  };

  const handleAction = (action: UserAction, user: UserRow) => {
    if (action === "hard_delete" || action === "suspend") {
      setConfirm({ action, user });
    } else {
      executeAction(action, user);
    }
  };

  const handleInvite = async (firstName: string, lastName: string, email: string) => {
    await apiClient.post(endpoints.admin.managerInvite, { firstName, lastName, email });
    showToast(`Invite sent to ${email}`);
    load();
  };

  const filtered = users.filter(u => {
    if (tab === "All") return true;
    return u.accountStatus === tab.toUpperCase();
  });

  const counts: Record<string, number> = {
    All: users.length,
    Active: users.filter(u => u.accountStatus === "ACTIVE").length,
    Pending: users.filter(u => u.accountStatus === "PENDING").length,
    Suspended: users.filter(u => u.accountStatus === "SUSPENDED").length,
  };

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "var(--color-content-bg)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)" }}>Managers</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            Invite community managers. They are invited by email and get their own dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{ padding: "10px 20px", background: ACC, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          + Invite Manager
        </button>
      </div>

      {/* Card */}
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--color-text-muted)", pointerEvents: "none" }}>🔍</span>
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 32, paddingRight: 10, height: 34, border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-content-bg)", outline: "none", boxSizing: "border-box" as const }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {STATUS_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 12px", borderRadius: 99, border: tab === t ? `1.5px solid ${ACC}` : `1px solid ${BORD}`, background: tab === t ? `${ACC}14` : "transparent", color: tab === t ? ACC : "var(--color-text-muted)", fontSize: 12, fontWeight: tab === t ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                {t}
                <span style={{ fontSize: 10, background: tab === t ? ACC : "var(--color-content-bg)", color: tab === t ? "#fff" : "var(--color-text-muted)", borderRadius: 99, padding: "0 5px", minWidth: 16, textAlign: "center" as const }}>
                  {counts[t] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <UserTable
          users={filtered}
          actions={ACTIONS}
          onAction={handleAction}
          loading={loading}
        />
      </div>

      {showInvite && (
        <InviteModal role="Manager" onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      )}

      {confirm?.action === "hard_delete" && (
        <ConfirmModal
          title="Hard Delete Manager"
          message={`Permanently delete ${confirm.user.email}? This cannot be undone.`}
          confirmLabel="Delete Permanently"
          danger
          onConfirm={() => executeAction("hard_delete", confirm.user)}
          onClose={() => setConfirm(null)}
        />
      )}

      {confirm?.action === "suspend" && (
        <ConfirmModal
          title="Suspend Manager"
          message={`Suspend ${confirm.user.email}? They won't be able to log in until reactivated.`}
          confirmLabel="Suspend"
          danger
          onConfirm={() => executeAction("suspend", confirm.user)}
          onClose={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
