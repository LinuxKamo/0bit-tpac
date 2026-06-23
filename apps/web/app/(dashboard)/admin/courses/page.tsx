"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

const BG   = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";
const ACC  = "#5b4fcf";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CourseUser {
  id: string;
  firstName: string | null;
  lastName:  string | null;
  email:     string;
}

interface Course {
  id:          string;
  title:       string;
  description: string | null;
  status:      "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  sprintLabel: string;
  createdBy:   CourseUser;
  reviewedBy:  CourseUser | null;
  reviewNote:  string | null;
  publishedAt: string | null;
  createdAt:   string;
  _count: { modules: number; cohortCourses: number; tierCourses: number };
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Draft",       color: "#6b7280", bg: "#f9fafb"  },
  IN_REVIEW: { label: "In Review",   color: "#d97706", bg: "#fffbeb"  },
  APPROVED:  { label: "Approved",    color: "#2563eb", bg: "#eff6ff"  },
  PUBLISHED: { label: "Published",   color: "#16a34a", bg: "#f0fdf4"  },
  ARCHIVED:  { label: "Archived",    color: "#9ca3af", bg: "#f3f4f6"  },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      padding: "2px 9px", borderRadius: 99,
      color: m.color, background: m.bg, border: `1px solid ${m.color}33`,
    }}>
      {m.label.toUpperCase()}
    </span>
  );
}

const ALL_STATUSES = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"];

// ── Create Course Modal ───────────────────────────────────────────────────────

function CreateCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState({ title: "", description: "", sprintLabel: "Module" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await apiClient.post(endpoints.admin.courses, form);
      onCreated(res.data.data.course.id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create course");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    border: `1px solid ${BORD}`, borderRadius: 8,
    fontSize: 13, color: "var(--color-text-primary)",
    background: BG, outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "var(--color-text-muted)", textTransform: "uppercase" as const,
    letterSpacing: "0.06em", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>New Course</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
              You'll add modules and lessons in the builder.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Course Title *</label>
            <input style={inputStyle} autoFocus placeholder="e.g. Design Thinking Fundamentals"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" as const, lineHeight: 1.6 }}
              placeholder="What will participants learn?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Module Label</label>
            <select value={form.sprintLabel} onChange={e => setForm(f => ({ ...f, sprintLabel: e.target.value }))} style={inputStyle}>
              <option value="Module">Module</option>
              <option value="Week">Week</option>
              <option value="Sprint">Sprint</option>
              <option value="Session">Session</option>
              <option value="Unit">Unit</option>
            </select>
            <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--color-text-muted)" }}>
              How groups of lessons are labelled in the builder.
            </p>
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: "var(--color-danger)" }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button onClick={onClose} style={{
              padding: "9px 18px", borderRadius: 8, border: `1px solid ${BORD}`,
              background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)",
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: ACC, color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Creating..." : "Create & Open Builder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  course, onClose, onDone,
}: {
  course: Course;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);

  const act = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      await apiClient.patch(endpoints.admin.courseStatus(course.id), { action, reviewNote: note });
      onDone();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: CARD, borderRadius: 16, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>Review Course</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
          {course.title}
        </p>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--color-text-muted)" }}>
          {course._count.modules} module{course._count.modules !== 1 ? "s" : ""} ·
          Submitted by {course.createdBy.firstName ?? course.createdBy.email}
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Review Note (optional)
          </label>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add feedback for the course creator..."
            style={{
              width: "100%", padding: "9px 12px", minHeight: 80,
              border: `1px solid ${BORD}`, borderRadius: 8,
              fontSize: 13, color: "var(--color-text-primary)",
              background: BG, outline: "none", resize: "vertical" as const,
              lineHeight: 1.6, boxSizing: "border-box" as const,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "9px 16px", borderRadius: 8, border: `1px solid ${BORD}`,
            background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-text-muted)",
          }}>Cancel</button>
          <button onClick={() => act("reject")} disabled={loading} style={{
            padding: "9px 18px", borderRadius: 8, border: "1px solid #dc2626",
            background: "transparent", color: "#dc2626", fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "..." : "Request Changes"}
          </button>
          <button onClick={() => act("approve")} disabled={loading} style={{
            padding: "9px 18px", borderRadius: 8, border: "none",
            background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Saving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({
  course, onRefresh,
}: {
  course: Course;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [reviewModal, setReviewModal] = useState(false);
  const [actLoading,  setActLoading]  = useState("");

  const creatorName = [course.createdBy.firstName, course.createdBy.lastName].filter(Boolean).join(" ")
    || course.createdBy.email;

  const act = async (action: string) => {
    setActLoading(action);
    try {
      await apiClient.patch(endpoints.admin.courseStatus(course.id), { action });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setActLoading(""); }
  };

  return (
    <>
      <div style={{
        background: CARD, borderRadius: 14, border: `1px solid ${BORD}`,
        padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 5 }}>
              {course.title}
            </div>
            {course.description && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
              }}>
                {course.description}
              </p>
            )}
          </div>
          <StatusBadge status={course.status} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>
              {course._count.modules}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {course.sprintLabel.toLowerCase()}{course._count.modules !== 1 ? "s" : ""}
            </span>
          </div>
          {course._count.cohortCourses > 0 && (
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              · Used in {course._count.cohortCourses} cohort{course._count.cohortCourses !== 1 ? "s" : ""}
            </div>
          )}
          {course._count.tierCourses > 0 && (
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              · In {course._count.tierCourses} tier librar{course._count.tierCourses !== 1 ? "ies" : "y"}
            </div>
          )}
        </div>

        {/* Review note */}
        {course.reviewNote && (
          <div style={{
            padding: "10px 12px", borderRadius: 8,
            background: course.status === "DRAFT" ? "#fef2f218" : "#f0fdf418",
            border: `1px solid ${course.status === "DRAFT" ? "#fca5a533" : "#86efac33"}`,
            fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5,
          }}>
            <strong style={{ color: course.status === "DRAFT" ? "#dc2626" : "#16a34a" }}>
              {course.status === "DRAFT" ? "Changes requested: " : "Review note: "}
            </strong>
            {course.reviewNote}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12, borderTop: `1px solid ${BORD}`,
        }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            By {creatorName} · {new Date(course.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {/* Always: open builder */}
            {(course.status === "DRAFT" || course.status === "APPROVED") && (
              <button onClick={() => router.push(`/admin/courses/${course.id}/builder`)} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                border: `1px solid ${BORD}`, background: "transparent",
                color: "var(--color-text-secondary)", cursor: "pointer",
              }}>
                ✏️ Build
              </button>
            )}

            {/* DRAFT → submit for review */}
            {course.status === "DRAFT" && (
              <button onClick={() => act("submit")} disabled={!!actLoading} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                border: "none", background: "#d97706", color: "#fff", cursor: "pointer",
                opacity: actLoading === "submit" ? 0.7 : 1,
              }}>
                {actLoading === "submit" ? "…" : "Submit for Review"}
              </button>
            )}

            {/* IN_REVIEW → review modal */}
            {course.status === "IN_REVIEW" && (
              <>
                <button onClick={() => router.push(`/admin/courses/${course.id}/builder`)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${BORD}`, background: "transparent",
                  color: "var(--color-text-secondary)", cursor: "pointer",
                }}>
                  👁 View
                </button>
                <button onClick={() => setReviewModal(true)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  border: "none", background: ACC, color: "#fff", cursor: "pointer",
                }}>
                  Review
                </button>
              </>
            )}

            {/* APPROVED → publish */}
            {course.status === "APPROVED" && (
              <button onClick={() => act("publish")} disabled={!!actLoading} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                border: "none", background: "#16a34a", color: "#fff", cursor: "pointer",
                opacity: actLoading === "publish" ? 0.7 : 1,
              }}>
                {actLoading === "publish" ? "…" : "Publish"}
              </button>
            )}

            {/* PUBLISHED → view builder + unpublish */}
            {course.status === "PUBLISHED" && (
              <>
                <button onClick={() => router.push(`/admin/courses/${course.id}/builder`)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${BORD}`, background: "transparent",
                  color: "var(--color-text-secondary)", cursor: "pointer",
                }}>
                  👁 View
                </button>
                <button onClick={() => act("unpublish")} disabled={!!actLoading} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "1px solid #dc2626", background: "transparent",
                  color: "#dc2626", cursor: "pointer",
                }}>
                  Unpublish
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {reviewModal && (
        <ReviewModal course={course} onClose={() => setReviewModal(false)} onDone={onRefresh} />
      )}
    </>
  );
}

// ── Status Filter Tabs ────────────────────────────────────────────────────────

function FilterTabs({ active, counts, onChange }: {
  active: string;
  counts: Record<string, number>;
  onChange: (s: string) => void;
}) {
  const tabs = [
    { key: "ALL",       label: "All"        },
    { key: "DRAFT",     label: "Draft"      },
    { key: "IN_REVIEW", label: "In Review"  },
    { key: "APPROVED",  label: "Approved"   },
    { key: "PUBLISHED", label: "Published"  },
    { key: "ARCHIVED",  label: "Archived"   },
  ];

  return (
    <div style={{ display: "flex", gap: 4, background: "var(--color-bg-subtle)", borderRadius: 10, padding: 4 }}>
      {tabs.map(t => {
        const count = t.key === "ALL"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[t.key] ?? 0);
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: isActive ? 700 : 400,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            background: isActive ? CARD : "transparent",
            color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s",
          }}>
            {t.label}
            {count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                background: isActive ? `${ACC}18` : "transparent",
                color: isActive ? ACC : "var(--color-text-muted)",
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseCatalogPage() {
  const router = useRouter();
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("ALL");
  const [showCreate,  setShowCreate]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(endpoints.admin.courses);
      setCourses(res.data.data.courses ?? []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Count per status
  const counts = courses.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = filter === "ALL" ? courses : courses.filter(c => c.status === filter);

  const handleCreated = (id: string) => {
    router.push(`/admin/courses/${id}/builder`);
  };

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>
            Course Catalog
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
            Build reusable courses · assign to cohorts or tier libraries
            {courses.length > 0 && ` · ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 20px", background: ACC, border: "none",
          borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>
          + New Course
        </button>
      </div>

      {/* Filter tabs */}
      {courses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <FilterTabs active={filter} counts={counts} onChange={setFilter} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          Loading…
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "50vh", gap: 20, textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: `${ACC}18`, border: `2px dashed ${ACC}55`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>
            📚
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)" }}>
              No courses yet
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-text-muted)", maxWidth: 420, lineHeight: 1.6 }}>
              Build your first course. Once published, you can assign it to cohorts or make it available to tier members as a self-paced library course.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            padding: "12px 24px", background: ACC, border: "none",
            borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Build First Course
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)", fontSize: 13 }}>
          No courses with status "{filter.replace("_", " ")}".
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(c => (
            <CourseCard key={c.id} course={c} onRefresh={load} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateCourseModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
