"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const ACC  = "#5b4fcf";
const BORD = "var(--color-content-border)";
const CARD = "var(--color-content-card)";
const BG   = "var(--color-content-bg)";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Country { id: string; name: string; flagEmoji: string | null; status: string; }

interface Cohort {
  id: string; name: string; phase: string;
  startDate: string | null; endDate: string | null;
  maxParticipants: number | null;
  _count: { participants: number };
}

interface Programme {
  id: string; name: string; description: string | null;
  type: string; isActive: boolean;
  minimumTierSlot: string | null;
  enrollmentType: string; scheduleType: string; recurringFrequency: string | null;
  _count: { cohorts: number };
  cohorts: Cohort[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  BUILDERS_RESIDENCY:   "Builders Residency",
  CORPORATE_INNOVATION: "Corporate Innovation",
  ACCELERATOR:          "Accelerator",
  BOOTCAMP:             "Bootcamp",
  WORKSHOP_SERIES:      "Workshop Series",
  OTHER:                "Other",
};

const PHASE_META: Record<string, { label: string; dot: string }> = {
  APPLICATION: { label: "Applications Open", dot: "#2563eb" },
  SELECTION:   { label: "Selecting",         dot: "#7c3aed" },
  ACTIVE:      { label: "Active",            dot: "#16a34a" },
  DEMO_DAY:    { label: "Demo Day",          dot: "#d97706" },
  GRADUATED:   { label: "Graduated",         dot: "#6b7280" },
};

const TIER_OPTIONS = [
  { value: "",          label: "All tiers" },
  { value: "EXPLORER",  label: "Explorer +" },
  { value: "BUILDER",   label: "Builder +" },
  { value: "FOUNDER",   label: "Founder +" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "DIASPORA",  label: "Diaspora" },
];

const TYPES = [
  { value: "BUILDERS_RESIDENCY",   label: "Builders Residency" },
  { value: "CORPORATE_INNOVATION", label: "Corporate Innovation" },
  { value: "ACCELERATOR",          label: "Accelerator" },
  { value: "BOOTCAMP",             label: "Bootcamp" },
  { value: "WORKSHOP_SERIES",      label: "Workshop Series" },
  { value: "OTHER",                label: "Other" },
];

const inp = {
  width: "100%", padding: "9px 12px",
  border: `1px solid ${BORD}`, borderRadius: 8,
  fontSize: 13, color: "var(--color-text-primary)",
  background: BG, outline: "none", boxSizing: "border-box" as const,
};
const lbl = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "var(--color-text-muted)", textTransform: "uppercase" as const,
  letterSpacing: "0.06em", marginBottom: 6,
};

// ── Programme Form (shared by Create + Edit) ──────────────────────────────────

interface ProgrammeFormState {
  name: string; description: string; type: string;
  minimumTierSlot: string; enrollmentType: string;
  scheduleType: string; recurringFrequency: string;
}

function ProgrammeForm({ form, onChange }: { form: ProgrammeFormState; onChange: (f: ProgrammeFormState) => void }) {
  const set = (k: keyof ProgrammeFormState, v: string) => onChange({ ...form, [k]: v });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={lbl}>Programme Type</label>
        <select value={form.type} onChange={e => set("type", e.target.value)} style={inp}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Name *</label>
        <input style={inp} placeholder="e.g. Builders Residency Season 5" value={form.name} onChange={e => set("name", e.target.value)} autoFocus />
      </div>
      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, minHeight: 68, resize: "vertical" as const, lineHeight: 1.6 }} placeholder="What this programme is about…" value={form.description} onChange={e => set("description", e.target.value)} />
      </div>
      <div style={{ borderTop: `1px solid ${BORD}`, paddingTop: 4 }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Access & Enrollment</p>
      </div>
      <div>
        <label style={lbl}>Minimum Tier</label>
        <select value={form.minimumTierSlot} onChange={e => set("minimumTierSlot", e.target.value)} style={inp}>
          {TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Enrollment Type</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { value: "OPEN",        label: "Open Enrollment",     desc: "Any eligible member joins directly" },
            { value: "APPLICATION", label: "Application Required", desc: "Members apply, admin selects" },
          ].map(opt => (
            <div key={opt.value} onClick={() => set("enrollmentType", opt.value)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: `2px solid ${form.enrollmentType === opt.value ? ACC : BORD}`, background: form.enrollmentType === opt.value ? `${ACC}0f` : "transparent", transition: "all 0.12s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: form.enrollmentType === opt.value ? ACC : "var(--color-text-primary)", marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label style={lbl}>Schedule</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { value: "ONE_TIME",  label: "One-Time",  desc: "Runs once" },
            { value: "RECURRING", label: "Recurring", desc: "Repeats on a cadence" },
          ].map(opt => (
            <div key={opt.value} onClick={() => set("scheduleType", opt.value)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: `2px solid ${form.scheduleType === opt.value ? ACC : BORD}`, background: form.scheduleType === opt.value ? `${ACC}0f` : "transparent", transition: "all 0.12s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: form.scheduleType === opt.value ? ACC : "var(--color-text-primary)", marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {form.scheduleType === "RECURRING" && (
        <div>
          <label style={lbl}>Frequency</label>
          <select value={form.recurringFrequency} onChange={e => set("recurringFrequency", e.target.value)} style={inp}>
            <option value="">Select…</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ── Create Programme Modal ────────────────────────────────────────────────────

function CreateProgrammeModal({ countryId, onClose, onCreated }: { countryId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<ProgrammeFormState>({ name: "", description: "", type: "BUILDERS_RESIDENCY", minimumTierSlot: "BUILDER", enrollmentType: "OPEN", scheduleType: "ONE_TIME", recurringFrequency: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      await apiClient.post(endpoints.admin.programmes, {
        countryId, name: form.name.trim(), description: form.description.trim() || null,
        type: form.type, minimumTierSlot: form.minimumTierSlot || null,
        enrollmentType: form.enrollmentType, scheduleType: form.scheduleType,
        recurringFrequency: form.scheduleType === "RECURRING" ? form.recurringFrequency || null : null,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e?.response?.data?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>New Programme</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}>×</button>
        </div>
        <ProgrammeForm form={form} onChange={setForm} />
        {error && <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-danger)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating…" : "Create Programme"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Programme Modal ──────────────────────────────────────────────────────

function EditProgrammeModal({ programme, onClose, onUpdated }: { programme: Programme; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState<ProgrammeFormState>({
    name: programme.name, description: programme.description ?? "",
    type: programme.type, minimumTierSlot: programme.minimumTierSlot ?? "",
    enrollmentType: programme.enrollmentType, scheduleType: programme.scheduleType,
    recurringFrequency: programme.recurringFrequency ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      await apiClient.patch(endpoints.admin.programmeById(programme.id), {
        name: form.name.trim(), description: form.description.trim() || null,
        type: form.type, minimumTierSlot: form.minimumTierSlot || null,
        enrollmentType: form.enrollmentType, scheduleType: form.scheduleType,
        recurringFrequency: form.scheduleType === "RECURRING" ? form.recurringFrequency || null : null,
      });
      onUpdated(); onClose();
    } catch (e: any) { setError(e?.response?.data?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>Edit Programme</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}>×</button>
        </div>
        <ProgrammeForm form={form} onChange={setForm} />
        {error && <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-danger)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Cohort Modal ───────────────────────────────────────────────────────

function CreateCohortModal({ programmeId, programmeName, onClose, onCreated }: { programmeId: string; programmeName: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", applicationOpenAt: "", applicationCloseAt: "", startDate: "", endDate: "", demoDayDate: "", maxParticipants: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      const p: any = { name: form.name.trim() };
      if (form.applicationOpenAt)  p.applicationOpenAt  = form.applicationOpenAt;
      if (form.applicationCloseAt) p.applicationCloseAt = form.applicationCloseAt;
      if (form.startDate)          p.startDate          = form.startDate;
      if (form.endDate)            p.endDate            = form.endDate;
      if (form.demoDayDate)        p.demoDayDate        = form.demoDayDate;
      if (form.maxParticipants)    p.maxParticipants    = Number(form.maxParticipants);
      await apiClient.post(endpoints.admin.programmeCohorts(programmeId), p);
      onCreated(); onClose();
    } catch (e: any) { setError(e?.response?.data?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>New Cohort</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}>×</button>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "var(--color-text-muted)" }}>Adding to <strong style={{ color: "var(--color-text-secondary)" }}>{programmeName}</strong></p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={lbl}>Cohort Name *</label><input style={inp} placeholder="e.g. Cohort 12 — Q1 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Applications Open</label><input type="date" style={inp} value={form.applicationOpenAt} onChange={e => setForm(f => ({ ...f, applicationOpenAt: e.target.value }))} /></div>
            <div><label style={lbl}>Applications Close</label><input type="date" style={inp} value={form.applicationCloseAt} onChange={e => setForm(f => ({ ...f, applicationCloseAt: e.target.value }))} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Start Date</label><input type="date" style={inp} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label style={lbl}>End Date</label><input type="date" style={inp} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Demo Day</label><input type="date" style={inp} value={form.demoDayDate} onChange={e => setForm(f => ({ ...f, demoDayDate: e.target.value }))} /></div>
            <div><label style={lbl}>Max Participants</label><input type="number" style={inp} placeholder="e.g. 25" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} /></div>
          </div>
          {error && <p style={{ margin: 0, fontSize: 13, color: "var(--color-danger)" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
            <button onClick={submit} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating…" : "Create Cohort"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Programme Row ─────────────────────────────────────────────────────────────

function ProgrammeRow({ programme, onRefresh }: { programme: Programme; onRefresh: () => void }) {
  const router = useRouter();
  const [expanded,    setExpanded]    = useState(true);
  const [showEdit,    setShowEdit]    = useState(false);
  const [showNewCohort, setShowNewCohort] = useState(false);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {/* Programme header */}
        <div style={{ padding: "16px 20px", borderBottom: expanded ? `1px solid ${BORD}` : "none", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{programme.name}</span>
              {!programme.isActive && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>INACTIVE</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{TYPE_LABELS[programme.type] ?? programme.type}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{programme._count.cohorts} cohort{programme._count.cohorts !== 1 ? "s" : ""}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>·</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: `${ACC}18`, color: ACC }}>
                {programme.minimumTierSlot ?? "ALL"} +
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: programme.enrollmentType === "OPEN" ? "#d1fae520" : "#fef3c720", color: programme.enrollmentType === "OPEN" ? "#059669" : "#d97706" }}>
                {programme.enrollmentType === "OPEN" ? "OPEN" : "APPLICATION"}
              </span>
            </div>
            {programme.description && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{programme.description}</p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowEdit(true)} style={{ padding: "6px 13px", borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--color-text-secondary)" }}>Edit</button>
            <button onClick={() => setShowNewCohort(true)} style={{ padding: "6px 13px", borderRadius: 7, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Cohort</button>
            <button onClick={() => setExpanded(e => !e)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", cursor: "pointer", fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {expanded ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Cohorts table */}
        {expanded && (
          <div>
            {programme.cohorts.length === 0 ? (
              <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>📋</div>
                No cohorts yet — create the first one to start enrolling participants.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Cohort", "Phase", "Participants", "Start", "End", ""].map((h, i) => (
                      <th key={i} style={{ padding: "9px 20px", textAlign: i === 5 ? "right" as const : "left" as const, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", background: "var(--color-content-bg)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programme.cohorts.map((c, i) => {
                    const phase = PHASE_META[c.phase] ?? PHASE_META.APPLICATION;
                    return (
                      <tr key={c.id} style={{ borderBottom: i < programme.cohorts.length - 1 ? `1px solid ${BORD}` : "none", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-content-bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: phase.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{phase.label}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                          {c._count.participants}{c.maxParticipants ? <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>/{c.maxParticipants}</span> : ""}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--color-text-muted)" }}>{formatDate(c.startDate)}</td>
                        <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--color-text-muted)" }}>{formatDate(c.endDate)}</td>
                        <td style={{ padding: "12px 20px", textAlign: "right" as const }}>
                          <button
                            onClick={() => router.push(`/admin/programmes/${programme.id}/cohorts/${c.id}`)}
                            style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: ACC, display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            Manage →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showEdit && <EditProgrammeModal programme={programme} onClose={() => setShowEdit(false)} onUpdated={() => { onRefresh(); setShowEdit(false); }} />}
      {showNewCohort && <CreateCohortModal programmeId={programme.id} programmeName={programme.name} onClose={() => setShowNewCohort(false)} onCreated={onRefresh} />}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgrammesPage() {
  const [countries,  setCountries]  = useState<Country[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    apiClient.get(endpoints.admin.countries).then(res => {
      const all: Country[] = res.data.data.countries ?? [];
      setCountries(all);
      const active = all.find(c => c.status === "ACTIVE") ?? all[0];
      if (active) setSelectedId(active.id);
    }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`${endpoints.admin.programmes}?countryId=${selectedId}`);
      setProgrammes(res.data.data.programmes ?? []);
    } catch { setProgrammes([]); }
    finally { setLoading(false); }
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);

  const selectedCountry = countries.find(c => c.id === selectedId);

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>Programmes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
            Manage programmes and cohorts{programmes.length > 0 && ` · ${programmes.length} programme${programmes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {countries.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>Country:</span>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${BORD}`, background: CARD, color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                {countries.map(c => <option key={c.id} value={c.id}>{c.flagEmoji ? `${c.flagEmoji} ` : ""}{c.name}</option>)}
              </select>
            </div>
          )}
          {selectedId && (
            <button onClick={() => setShowCreate(true)} style={{ padding: "9px 20px", background: ACC, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              + New Programme
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedId ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-muted)" }}>No countries configured.</div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-muted)" }}>Loading…</div>
      ) : programmes.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 20, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: `${ACC}18`, border: `2px dashed ${ACC}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎓</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)" }}>No programmes for {selectedCountry?.name}</h2>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-text-muted)", maxWidth: 400, lineHeight: 1.6 }}>Create a programme to start building cohorts, enrolling participants, and running the curriculum.</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ padding: "12px 24px", background: ACC, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Create First Programme</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {programmes.map(p => <ProgrammeRow key={p.id} programme={p} onRefresh={load} />)}
        </div>
      )}

      {showCreate && selectedId && (
        <CreateProgrammeModal countryId={selectedId} onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </div>
  );
}
