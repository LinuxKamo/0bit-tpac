"use client";

import { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORD}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

function ToggleRow({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${BORD}` }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{description}</p>}
      </div>
      <button
        onClick={onChange}
        style={{ width: 44, height: 24, borderRadius: 999, background: checked ? "#5b4fcf" : "var(--color-content-border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
      >
        <div style={{ position: "absolute", top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "var(--color-bg-subtle)",
  border: `1px solid ${BORD}`,
  borderRadius: 8,
  fontSize: 13, color: "var(--color-text-primary)",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "var(--color-text-muted)", textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: 6,
};

export function SettingsPage() {
  const { user, logout } = useAuth();

  const [pwForm, setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const [notif, setNotif] = useState({
    memberApprovals:  true,
    mentorMatches:    true,
    eventReminders:   true,
    opportunities:    false,
    communityPosts:   false,
    platformUpdates:  true,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (pwForm.next.length < 8)         { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true); setPwError(null);
    try {
      await apiClient.patch(endpoints.users.password, { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Settings</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Manage your account preferences</p>
      </div>

      {/* Account info */}
      <Section title="Account" subtitle="Your platform identity">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#5b4fcf", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 20 }}>
              {(user?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 15 }}>{(user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email) ?? "—"}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 2 }}>{user?.email ?? "—"}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: "rgba(91,79,207,0.15)", border: "1px solid rgba(91,79,207,0.3)", borderRadius: 99, padding: "2px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5b4fcf" }} />
              <span style={{ color: "#a89fea", fontSize: 11, fontWeight: 600 }}>{user?.role?.replace("_", " ") ?? "—"}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" subtitle="Choose which platform events trigger email notifications">
        <ToggleRow
          checked={notif.memberApprovals}
          onChange={() => setNotif(p => ({ ...p, memberApprovals: !p.memberApprovals }))}
          label="Member approvals"
          description="Get notified when a member application requires your review"
        />
        <ToggleRow
          checked={notif.mentorMatches}
          onChange={() => setNotif(p => ({ ...p, mentorMatches: !p.mentorMatches }))}
          label="Mentor matches"
          description="Receive updates when mentor-mentee matches are confirmed"
        />
        <ToggleRow
          checked={notif.eventReminders}
          onChange={() => setNotif(p => ({ ...p, eventReminders: !p.eventReminders }))}
          label="Event reminders"
          description="24-hour reminder before events you are registered for"
        />
        <ToggleRow
          checked={notif.opportunities}
          onChange={() => setNotif(p => ({ ...p, opportunities: !p.opportunities }))}
          label="New opportunities"
          description="Grants, jobs, accelerators that match your profile"
        />
        <ToggleRow
          checked={notif.communityPosts}
          onChange={() => setNotif(p => ({ ...p, communityPosts: !p.communityPosts }))}
          label="Community posts"
          description="Activity in groups you are a member of"
        />
        <div style={{ padding: "12px 0" }}>
          <ToggleRow
            checked={notif.platformUpdates}
            onChange={() => setNotif(p => ({ ...p, platformUpdates: !p.platformUpdates }))}
            label="Platform updates"
            description="Product announcements and feature releases from Tshimologong"
          />
        </div>
      </Section>

      {/* Password */}
      <Section title="Password" subtitle="Change your account password">
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pwSuccess && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(30,140,110,0.1)", border: "1px solid rgba(30,140,110,0.25)", fontSize: 13, color: "#1e8c6e" }}>
              Password updated successfully
            </div>
          )}
          {pwError && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)", fontSize: 13, color: "#c0392b" }}>
              {pwError}
            </div>
          )}
          <div>
            <label style={labelStyle}>Current password</label>
            <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>New password</label>
            <input type={showPw ? "text" : "password"} value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} required minLength={8} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirm new password</label>
            <input type={showPw ? "text" : "password"} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={showPw} onChange={() => setShowPw(p => !p)} style={{ accentColor: "#5b4fcf" }} />
              Show passwords
            </label>
            <button type="submit" disabled={pwSaving} style={{ padding: "9px 22px", fontSize: 13, fontWeight: 600, background: "#5b4fcf", border: "none", borderRadius: 8, cursor: "pointer", color: "var(--color-text-primary)", opacity: pwSaving ? 0.6 : 1 }}>
              {pwSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </Section>

      {/* Danger zone */}
      <div style={{ background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(192,57,43,0.15)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#c0392b", margin: 0 }}>Danger Zone</h3>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>Irreversible actions — proceed with caution</p>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>Sign out of all sessions</p>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>You will be logged out of all devices immediately</p>
          </div>
          <button onClick={logout} style={{ padding: "8px 18px", fontSize: 12, fontWeight: 700, background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, cursor: "pointer", color: "#c0392b", whiteSpace: "nowrap" }}>
            Sign out everywhere
          </button>
        </div>
      </div>
    </div>
  );
}
