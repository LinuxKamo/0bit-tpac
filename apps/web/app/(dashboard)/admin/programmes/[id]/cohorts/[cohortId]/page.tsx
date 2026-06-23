"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const ACC  = "#5b4fcf";
const BORD = "var(--color-content-border)";
const CARD = "var(--color-content-card)";
const BG   = "var(--color-content-bg)";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MentorUser { id: string; firstName: string | null; lastName: string | null; email: string; avatarUrl: string | null; displayName: string | null; }
interface CourseEntry { courseId: string; order: number; course: { id: string; title: string; status: string; sprintLabel: string; _count: { modules: number } }; }
interface MentorEntry { cohortId: string; userId: string; role: string; user: MentorUser; }
interface Milestone { id: string; title: string; description: string | null; dueDate: string | null; submissionType: string; }
interface Participant { id: string; user: { id: string; firstName: string | null; lastName: string | null; email: string; avatarUrl: string | null; displayName: string | null }; }
interface Cohort {
  id: string; name: string; phase: string;
  applicationOpenAt: string | null; applicationCloseAt: string | null;
  startDate: string | null; endDate: string | null; demoDayDate: string | null;
  maxParticipants: number | null; isRemote: boolean;
  programme: { id: string; name: string; type: string };
  _count: { participants: number };
  cohortCourses: CourseEntry[];
  cohortMentors: MentorEntry[];
  milestones: Milestone[];
  participants: Participant[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string; bg: string }> = {
  APPLICATION: { label: "Accepting Applications", color: "#2563eb", bg: "#eff6ff" },
  SELECTION:   { label: "Selecting",              color: "#7c3aed", bg: "#f5f3ff" },
  ACTIVE:      { label: "Active",                 color: "#16a34a", bg: "#f0fdf4" },
  DEMO_DAY:    { label: "Demo Day",               color: "#d97706", bg: "#fffbeb" },
  GRADUATED:   { label: "Graduated",              color: "#6b7280", bg: "#f9fafb" },
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: BG, outline: "none", boxSizing: "border-box" as const };
const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 };

// ── Confirm Modal ─────────────────────────────────────────────────────────────

interface ConfirmState { title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; }

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
      <div style={{ background: CARD, borderRadius: 14, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{state.title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{state.message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${BORD}`, background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)" }}>
            Cancel
          </button>
          <button onClick={() => { state.onConfirm(); onClose(); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: state.danger ? "#dc2626" : ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {state.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 700, background: type === "error" ? "#dc2626" : "#16a34a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10, maxWidth: 380 }}>
      <span>{type === "error" ? "⚠" : "✓"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ cohort, onUpdated, showToast }: { cohort: Cohort; onUpdated: () => void; showToast: (m: string, t: "error"|"success") => void }) {
  const [form, setForm] = useState({
    name: cohort.name, phase: cohort.phase,
    applicationOpenAt:  cohort.applicationOpenAt  ? cohort.applicationOpenAt.split("T")[0]  : "",
    applicationCloseAt: cohort.applicationCloseAt ? cohort.applicationCloseAt.split("T")[0] : "",
    startDate:  cohort.startDate  ? cohort.startDate.split("T")[0]  : "",
    endDate:    cohort.endDate    ? cohort.endDate.split("T")[0]    : "",
    demoDayDate: cohort.demoDayDate ? cohort.demoDayDate.split("T")[0] : "",
    maxParticipants: cohort.maxParticipants?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const PHASES = ["APPLICATION", "SELECTION", "ACTIVE", "DEMO_DAY", "GRADUATED"];

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.patch(endpoints.admin.cohortById(cohort.programme.id, cohort.id), {
        name: form.name.trim(), phase: form.phase,
        applicationOpenAt:  form.applicationOpenAt  || null,
        applicationCloseAt: form.applicationCloseAt || null,
        startDate:   form.startDate   || null,
        endDate:     form.endDate     || null,
        demoDayDate: form.demoDayDate || null,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      });
      showToast("Changes saved", "success");
      onUpdated();
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Failed to save", "error");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={lbl}>Current Phase</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {PHASES.map(p => {
              const m = PHASE_META[p];
              return (
                <div key={p} onClick={() => setForm(f => ({ ...f, phase: p }))} style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", border: `2px solid ${form.phase === p ? m.color : BORD}`, background: form.phase === p ? m.bg : "transparent", display: "flex", alignItems: "center", gap: 6, transition: "all 0.12s" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
                  <span style={{ fontSize: 12, fontWeight: form.phase === p ? 700 : 400, color: form.phase === p ? m.color : "var(--color-text-secondary)" }}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label style={lbl}>Cohort Name</label>
          <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div>
          <label style={lbl}>Application Window</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Opens</span><input type="date" style={inp} value={form.applicationOpenAt} onChange={e => setForm(f => ({ ...f, applicationOpenAt: e.target.value }))} /></div>
            <div><span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Closes</span><input type="date" style={inp} value={form.applicationCloseAt} onChange={e => setForm(f => ({ ...f, applicationCloseAt: e.target.value }))} /></div>
          </div>
        </div>

        <div>
          <label style={lbl}>Programme Dates</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Start</span><input type="date" style={inp} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>End</span><input type="date" style={inp} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div><span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Demo Day</span><input type="date" style={inp} value={form.demoDayDate} onChange={e => setForm(f => ({ ...f, demoDayDate: e.target.value }))} /></div>
          </div>
        </div>

        <div style={{ maxWidth: 200 }}>
          <label style={lbl}>Max Participants</label>
          <input type="number" style={inp} placeholder="No limit" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} />
        </div>

        <div>
          <button onClick={save} disabled={saving} style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: ACC, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Courses ──────────────────────────────────────────────────────────────

function CoursesTab({ cohort, onUpdated, showToast, showConfirm }: { cohort: Cohort; onUpdated: () => void; showToast: (m: string, t: "error"|"success") => void; showConfirm: (s: ConfirmState) => void }) {
  const [catalog,    setCatalog]    = useState<any[]>([]);
  const [loadingC,   setLoadingC]   = useState(false);
  const [adding,     setAdding]     = useState<string | null>(null);
  const [removing,   setRemoving]   = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!showPicker) return;
    setLoadingC(true);
    apiClient.get(`${endpoints.admin.courses}?status=PUBLISHED`)
      .then(r => setCatalog(r.data.data.courses ?? []))
      .catch(() => showToast("Failed to load course catalog", "error"))
      .finally(() => setLoadingC(false));
  }, [showPicker]);

  const add = async (courseId: string) => {
    setAdding(courseId);
    try {
      await apiClient.post(endpoints.admin.cohortCourses(cohort.id), { courseId });
      showToast("Course assigned to cohort", "success");
      onUpdated(); setShowPicker(false);
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Failed to assign course", "error");
    } finally { setAdding(null); }
  };

  const remove = (courseId: string, courseTitle: string) => {
    showConfirm({
      title: "Remove Course",
      message: `Remove "${courseTitle}" from this cohort? Participants will lose access to this course.`,
      confirmLabel: "Remove",
      danger: true,
      onConfirm: async () => {
        setRemoving(courseId);
        try {
          await apiClient.delete(endpoints.admin.cohortCourse(cohort.id, courseId));
          showToast("Course removed", "success");
          onUpdated();
        } catch (e: any) {
          showToast(e?.response?.data?.message ?? "Failed to remove course", "error");
        } finally { setRemoving(null); }
      },
    });
  };

  const assigned = cohort.cohortCourses.map(cc => cc.courseId);
  const available = catalog.filter(c => !assigned.includes(c.id));
  const STATUS_COLORS: Record<string, string> = { PUBLISHED: "#16a34a", DRAFT: "#6b7280", IN_REVIEW: "#d97706", APPROVED: "#2563eb", ARCHIVED: "#9ca3af" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
          {cohort.cohortCourses.length === 0 ? "No courses assigned yet." : `${cohort.cohortCourses.length} course${cohort.cohortCourses.length !== 1 ? "s" : ""} assigned`}
        </p>
        <button onClick={() => setShowPicker(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          + Assign Course
        </button>
      </div>

      {cohort.cohortCourses.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", border: `2px dashed ${BORD}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>No courses yet</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>Assign published courses from the catalog to structure this cohort's learning path.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cohort.cohortCourses.map((cc, i) => (
            <div key={cc.courseId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORD}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${ACC}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: ACC, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{cc.course.title}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {cc.course._count.modules} {cc.course.sprintLabel.toLowerCase()}s
                  {" · "}
                  <span style={{ color: STATUS_COLORS[cc.course.status] ?? "#6b7280" }}>{cc.course.status}</span>
                </div>
              </div>
              <button onClick={() => remove(cc.courseId, cc.course.title)} disabled={removing === cc.courseId} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid #fecaca`, background: "#fef2f2", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#dc2626", opacity: removing === cc.courseId ? 0.5 : 1 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Course picker modal */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
          <div style={{ background: CARD, borderRadius: 14, padding: 24, width: 520, maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>Assign a Course</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}>×</button>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-muted)" }}>Only published courses are shown. Go to Course Catalog to publish a course first.</p>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loadingC ? (
                <p style={{ textAlign: "center", padding: 30, color: "var(--color-text-muted)", fontSize: 13 }}>Loading…</p>
              ) : available.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                    {catalog.length === 0 ? "No published courses found." : "All published courses are already assigned."}
                  </p>
                </div>
              ) : available.map((c: any) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, border: `1px solid ${BORD}`, marginBottom: 8, background: BG }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{c._count?.modules ?? 0} {c.sprintLabel?.toLowerCase() ?? "module"}s</div>
                  </div>
                  <button onClick={() => add(c.id)} disabled={adding === c.id} style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 600, cursor: adding ? "not-allowed" : "pointer", opacity: adding === c.id ? 0.6 : 1 }}>
                    {adding === c.id ? "Adding…" : "Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Mentors ──────────────────────────────────────────────────────────────

function MentorsTab({ cohort, onUpdated, showToast, showConfirm }: { cohort: Cohort; onUpdated: () => void; showToast: (m: string, t: "error"|"success") => void; showConfirm: (s: ConfirmState) => void }) {
  const [userSearch,   setUserSearch]   = useState("");
  const [userResults,  setUserResults]  = useState<MentorUser[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [adding,       setAdding]       = useState<string | null>(null);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [role,         setRole]         = useState("mentor");

  const search = async () => {
    if (!userSearch.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient.get(`${endpoints.admin.users}?search=${encodeURIComponent(userSearch)}`);
      setUserResults(res.data.data.users ?? []);
    } catch { showToast("Search failed", "error"); setUserResults([]); }
    finally { setSearching(false); }
  };

  const add = async (userId: string) => {
    setAdding(userId);
    try {
      await apiClient.post(endpoints.admin.cohortMentors(cohort.id), { userId, role });
      showToast("Mentor assigned", "success");
      onUpdated(); setUserResults([]); setUserSearch("");
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Failed to add mentor", "error");
    } finally { setAdding(null); }
  };

  const remove = (userId: string, name: string) => {
    showConfirm({
      title: "Remove Mentor",
      message: `Remove ${name} from this cohort? They will lose access to cohort resources.`,
      confirmLabel: "Remove",
      danger: true,
      onConfirm: async () => {
        setRemoving(userId);
        try {
          await apiClient.delete(endpoints.admin.cohortMentor(cohort.id, userId));
          showToast("Mentor removed", "success");
          onUpdated();
        } catch (e: any) {
          showToast(e?.response?.data?.message ?? "Failed to remove mentor", "error");
        } finally { setRemoving(null); }
      },
    });
  };

  const initials = (u: MentorUser) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || u.email[0].toUpperCase();
  const fullName  = (u: MentorUser) => u.displayName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
  const assigned  = new Set(cohort.cohortMentors.map(m => m.userId));

  return (
    <div>
      {cohort.cohortMentors.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>{cohort.cohortMentors.length} assigned</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cohort.cohortMentors.map(m => (
              <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORD}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${ACC}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: ACC, flexShrink: 0, overflow: "hidden" }}>
                  {m.user.avatarUrl ? <img src={m.user.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials(m.user)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{fullName(m.user)}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{m.user.email}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#e0e7ff", color: "#4338ca", textTransform: "capitalize" as const }}>{m.role}</span>
                <button onClick={() => remove(m.userId, fullName(m.user))} disabled={removing === m.userId} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#dc2626" }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 16 }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>Add Mentor / Facilitator</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, width: "auto", minWidth: 130 }}>
            <option value="mentor">Mentor</option>
            <option value="facilitator">Facilitator</option>
            <option value="assistant">Assistant</option>
          </select>
          <input style={{ ...inp, flex: 1 }} placeholder="Search by name or email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
          <button onClick={search} disabled={searching} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            {searching ? "…" : "Search"}
          </button>
        </div>
        {userResults.length > 0 && (
          <div style={{ border: `1px solid ${BORD}`, borderRadius: 8, overflow: "hidden" }}>
            {userResults.filter(u => !assigned.has(u.id)).map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: `1px solid ${BORD}` }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#374151", flexShrink: 0 }}>{initials(u)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{fullName(u)}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{u.email}</div>
                </div>
                <button onClick={() => add(u.id)} disabled={adding === u.id} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {adding === u.id ? "Adding…" : "Add"}
                </button>
              </div>
            ))}
            {userResults.filter(u => !assigned.has(u.id)).length === 0 && (
              <p style={{ padding: "10px 12px", margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>All found users are already assigned.</p>
            )}
          </div>
        )}
        {userResults.length === 0 && userSearch && !searching && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>No results. Try a different name or email.</p>
        )}
      </div>
    </div>
  );
}

// ── Tab: Milestones ───────────────────────────────────────────────────────────

function MilestonesTab({ cohort, onUpdated, showToast, showConfirm }: { cohort: Cohort; onUpdated: () => void; showToast: (m: string, t: "error"|"success") => void; showConfirm: (s: ConfirmState) => void }) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState({ title: "", description: "", dueDate: "", submissionType: "FILE_UPLOAD" });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const resetForm = () => setForm({ title: "", description: "", dueDate: "", submissionType: "FILE_UPLOAD" });

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await apiClient.patch(endpoints.admin.cohortMilestone(cohort.id, editId), { title: form.title, description: form.description || null, dueDate: form.dueDate || null, submissionType: form.submissionType });
        showToast("Milestone updated", "success");
        setEditId(null);
      } else {
        await apiClient.post(endpoints.admin.cohortMilestones(cohort.id), { title: form.title, description: form.description || null, dueDate: form.dueDate || null, submissionType: form.submissionType });
        showToast("Milestone added", "success");
        setShowAdd(false);
      }
      resetForm(); onUpdated();
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Failed to save milestone", "error");
    } finally { setSaving(false); }
  };

  const del = (id: string, title: string) => {
    showConfirm({
      title: "Delete Milestone",
      message: `Delete "${title}"? Any participant submissions for this milestone will also be deleted.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        setDeleting(id);
        try {
          await apiClient.delete(endpoints.admin.cohortMilestone(cohort.id, id));
          showToast("Milestone deleted", "success");
          onUpdated();
        } catch (e: any) {
          showToast(e?.response?.data?.message ?? "Failed to delete", "error");
        } finally { setDeleting(null); }
      },
    });
  };

  const startEdit = (m: Milestone) => {
    setForm({ title: m.title, description: m.description ?? "", dueDate: m.dueDate ? m.dueDate.split("T")[0] : "", submissionType: m.submissionType });
    setEditId(m.id); setShowAdd(false);
  };

  const MilestoneForm = () => (
    <div style={{ background: BG, border: `1px solid ${ACC}44`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input style={inp} placeholder="Milestone title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        <textarea style={{ ...inp, minHeight: 60, resize: "vertical" as const }} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Due Date</label><input type="date" style={inp} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          <div><label style={lbl}>Submission Type</label>
            <select style={inp} value={form.submissionType} onChange={e => setForm(f => ({ ...f, submissionType: e.target.value }))}>
              <option value="FILE_UPLOAD">File Upload</option>
              <option value="TEXT_ENTRY">Text Entry</option>
              <option value="LINK">Link</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => { resetForm(); setShowAdd(false); setEditId(null); }} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${BORD}`, background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--color-text-muted)" }}>Cancel</button>
          <button onClick={save} disabled={saving || !form.title.trim()} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving…" : editId ? "Save Changes" : "Add Milestone"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
          {cohort.milestones.length === 0 ? "No milestones yet." : `${cohort.milestones.length} milestone${cohort.milestones.length !== 1 ? "s" : ""}`}
        </p>
        {!showAdd && !editId && (
          <button onClick={() => { setShowAdd(true); setEditId(null); resetForm(); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            + Add Milestone
          </button>
        )}
      </div>

      {showAdd && <MilestoneForm />}

      {cohort.milestones.length === 0 && !showAdd ? (
        <div style={{ padding: "48px 0", textAlign: "center", border: `2px dashed ${BORD}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🏁</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>No milestones yet</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>Add milestones to track participant progress through the programme.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cohort.milestones.map((m, i) => (
            <div key={m.id}>
              {editId === m.id ? <MilestoneForm /> : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORD}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${ACC}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: ACC, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>{m.title}</div>
                    {m.description && <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{m.description}</div>}
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      {m.dueDate && <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Due {fmtDate(m.dueDate)}</span>}
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>{m.submissionType.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(m)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${BORD}`, background: "transparent", fontSize: 11, cursor: "pointer", color: "var(--color-text-secondary)" }}>Edit</button>
                    <button onClick={() => del(m.id, m.title)} disabled={deleting === m.id} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#dc2626" }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Participants ─────────────────────────────────────────────────────────

function ParticipantsTab({ cohort }: { cohort: Cohort }) {
  const fullName = (u: any) => u.displayName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
  const initials = (u: any) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || u.email[0].toUpperCase();

  return (
    <div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
        {cohort._count.participants} participant{cohort._count.participants !== 1 ? "s" : ""}
        {cohort.maxParticipants ? ` · ${Math.max(0, cohort.maxParticipants - cohort._count.participants)} spots remaining` : ""}
      </p>

      {cohort.participants.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", border: `2px dashed ${BORD}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>No participants yet</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>Participants will appear here once they enrol.</p>
        </div>
      ) : (
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
          {cohort.participants.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < cohort.participants.length - 1 ? `1px solid ${BORD}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#374151", flexShrink: 0, overflow: "hidden" }}>
                {p.user.avatarUrl ? <img src={p.user.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials(p.user)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{fullName(p.user)}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{p.user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview",     label: "Overview" },
  { key: "courses",      label: "Courses" },
  { key: "mentors",      label: "Mentors" },
  { key: "milestones",   label: "Milestones" },
  { key: "participants", label: "Participants" },
];

export default function CohortDetailPage() {
  const params      = useParams();
  const router      = useRouter();
  const cohortId    = params.cohortId as string;

  const [cohort,       setCohort]       = useState<Cohort | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("overview");
  const [confirm,      setConfirm]      = useState<ConfirmState | null>(null);
  const [toast,        setToast]        = useState<{ message: string; type: "error"|"success" } | null>(null);

  const showToast   = (message: string, type: "error"|"success") => setToast({ message, type });
  const showConfirm = (state: ConfirmState) => setConfirm(state);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.admin.cohortDetail(cohortId));
      setCohort(res.data.data.cohort);
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Failed to load cohort", "error");
    } finally { setLoading(false); }
  }, [cohortId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</div>;
  if (!cohort)  return <div style={{ textAlign: "center", padding: 60, color: "var(--color-danger)" }}>Cohort not found.</div>;

  const phase = PHASE_META[cohort.phase] ?? PHASE_META.APPLICATION;

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      {/* Header */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORD}`, padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <button onClick={() => router.push("/admin/programmes")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-text-muted)", padding: 0 }}>
            ← Programmes
          </button>
          <span style={{ color: BORD, fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{cohort.programme.name}</span>
          <span style={{ color: BORD, fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 600 }}>{cohort.name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)" }}>{cohort.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: phase.bg, color: phase.color, border: `1px solid ${phase.color}33` }}>
                {phase.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--color-text-muted)", flexWrap: "wrap" as const }}>
              <span>📅 {fmtDate(cohort.startDate)} → {fmtDate(cohort.endDate)}</span>
              <span>👥 {cohort._count.participants}{cohort.maxParticipants ? `/${cohort.maxParticipants}` : ""} participants</span>
              <span>📚 {cohort.cohortCourses.length} course{cohort.cohortCourses.length !== 1 ? "s" : ""}</span>
              <span>🎯 {cohort.milestones.length} milestone{cohort.milestones.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${BORD}`, marginBottom: -1 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 18px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? ACC : "var(--color-text-muted)",
              borderBottom: tab === t.key ? `2px solid ${ACC}` : "2px solid transparent",
              marginBottom: -1, transition: "all 0.12s",
            }}>
              {t.label}
              {t.key === "participants" && cohort._count.participants > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, background: `${ACC}18`, color: ACC, padding: "1px 6px", borderRadius: 99 }}>{cohort._count.participants}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "28px 32px" }}>
        {tab === "overview"     && <OverviewTab     cohort={cohort} onUpdated={load} showToast={showToast} />}
        {tab === "courses"      && <CoursesTab      cohort={cohort} onUpdated={load} showToast={showToast} showConfirm={showConfirm} />}
        {tab === "mentors"      && <MentorsTab      cohort={cohort} onUpdated={load} showToast={showToast} showConfirm={showConfirm} />}
        {tab === "milestones"   && <MilestonesTab   cohort={cohort} onUpdated={load} showToast={showToast} showConfirm={showConfirm} />}
        {tab === "participants" && <ParticipantsTab cohort={cohort} />}
      </div>

      {/* Confirm modal */}
      {confirm && <ConfirmModal state={confirm} onClose={() => setConfirm(null)} />}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
