"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

// ── Types ─────────────────────────────────────────────────────────────────────

type LessonType =
  | "READING" | "DIALOG" | "EXERCISE" | "EXERCISE_ANSWER"
  | "LAB" | "SCRIPT" | "QUESTIONNAIRE" | "CASE_STUDY" | "MCQ" | "ASSESSMENT" | "VIDEO";

interface Lesson {
  id: string; title: string; code: string; type: LessonType;
  order: number; isResource: boolean; submissionRequired: boolean; content: any;
}

interface Module {
  id: string; title: string; description: string | null; order: number; lessons: Lesson[];
}

interface Course {
  id: string; title: string; status: string; sprintLabel: string; modules: Module[];
}

// ── Lesson type config ────────────────────────────────────────────────────────

const LESSON_TYPES: { value: LessonType; label: string; code: string; color: string }[] = [
  { value: "READING",         label: "Reading",         code: "R",      color: "#3b82f6" },
  { value: "DIALOG",          label: "Dialog",          code: "D",      color: "#8b5cf6" },
  { value: "EXERCISE",        label: "Exercise",        code: "EX",     color: "#f59e0b" },
  { value: "EXERCISE_ANSWER", label: "Exercise Answer", code: "EX-ANS", color: "#10b981" },
  { value: "LAB",             label: "Lab Session",     code: "L",      color: "#06b6d4" },
  { value: "SCRIPT",          label: "Script",          code: "SCRIPT", color: "#6366f1" },
  { value: "QUESTIONNAIRE",   label: "Questionnaire",   code: "Q",      color: "#ec4899" },
  { value: "CASE_STUDY",      label: "Case Study",      code: "CS",     color: "#84cc16" },
  { value: "MCQ",             label: "MCQ",             code: "MCQ",    color: "#f97316" },
  { value: "ASSESSMENT",      label: "Assessment",      code: "ASMT",   color: "#dc2626" },
  { value: "VIDEO",           label: "Video",           code: "V",      color: "#ef4444" },
];

const typeColor = (t: LessonType) => LESSON_TYPES.find(x => x.value === t)?.color ?? "#94a3b8";
const typeCode  = (t: LessonType) => LESSON_TYPES.find(x => x.value === t)?.code  ?? t;

const PDF_TYPES:        LessonType[] = ["READING","DIALOG","LAB","CASE_STUDY","EXERCISE_ANSWER","SCRIPT"];
const ASSESSMENT_TYPES: LessonType[] = ["ASSESSMENT","EXERCISE","QUESTIONNAIRE"];

// ── Add Lesson Modal ──────────────────────────────────────────────────────────

function AddLessonModal({
  module: mod, courseId, onClose, onCreated,
}: {
  module: Module; courseId: string;
  onClose: () => void; onCreated: (l: Lesson) => void;
}) {
  const [form, setForm] = useState({ title: "", code: "", type: "READING" as LessonType, isResource: false, submissionRequired: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const base = typeCode(form.type);
    const num  = mod.lessons.length + 1;
    setForm(f => ({ ...f, code: `${base}${num}` }));
  }, [form.type, mod.lessons.length]);

  const submit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await apiClient.post(
        endpoints.admin.courseLessons(courseId, mod.id),
        { title: form.title.trim(), code: form.code.trim(), type: form.type, isResource: form.isResource, submissionRequired: form.submissionRequired },
      );
      onCreated(res.data.data.lesson);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed");
      setLoading(false);
    }
  };

  const inp = { width:"100%", padding:"8px 12px", border:"1px solid var(--color-content-border)", borderRadius:8, fontSize:13, color:"var(--color-text-primary)", background:"var(--color-content-bg)", outline:"none", boxSizing:"border-box" as const };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400 }}>
      <div style={{ background:"var(--color-content-card)", borderRadius:16, padding:28, width:480, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"var(--color-text-primary)" }}>Add Lesson to {mod.title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--color-text-muted)" }}>×</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Lesson Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {LESSON_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))} style={{
                  padding:"7px 10px", borderRadius:7, cursor:"pointer",
                  border:`1px solid ${form.type === t.value ? t.color : "var(--color-content-border)"}`,
                  backgroundColor: form.type === t.value ? t.color + "18" : "transparent",
                  display:"flex", alignItems:"center", gap:7, transition:"all 0.12s",
                }}>
                  <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, backgroundColor:t.color, color:"#fff" }}>{t.code}</span>
                  <span style={{ fontSize:12, fontWeight: form.type === t.value ? 600 : 400, color:"var(--color-text-primary)" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Title</label>
            <input style={inp} placeholder="e.g. Introduction to Design Thinking" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          </div>

          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Code (auto-generated)</label>
            <input style={inp} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </div>

          <div style={{ display:"flex", gap:16 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"var(--color-text-secondary)" }}>
              <input type="checkbox" checked={form.isResource} onChange={e => setForm(f => ({ ...f, isResource: e.target.checked }))} />
              Resource (downloadable)
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"var(--color-text-secondary)" }}>
              <input type="checkbox" checked={form.submissionRequired} onChange={e => setForm(f => ({ ...f, submissionRequired: e.target.checked }))} />
              Requires submission
            </label>
          </div>

          {error && <p style={{ margin:0, fontSize:13, color:"var(--color-danger)" }}>{error}</p>}

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:7, border:"1px solid var(--color-content-border)", background:"transparent", fontSize:13, cursor:"pointer", color:"var(--color-text-muted)" }}>Cancel</button>
            <button onClick={submit} disabled={loading} style={{ padding:"8px 20px", borderRadius:7, border:"none", background:"#5b4fcf", color:"#fff", fontSize:13, fontWeight:600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Adding..." : "Add Lesson"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Editor (right panel) ───────────────────────────────────────────────

function LessonEditor({ lesson, module: mod, courseId, onUpdated }: { lesson: Lesson; module: Module; courseId: string; onUpdated: () => void }) {
  const [editTitle,  setEditTitle]  = useState(false);
  const [titleVal,   setTitleVal]   = useState(lesson.title);
  const [saving,     setSaving]     = useState(false);

  // Content state per type
  const [pdfUrl,    setPdfUrl]    = useState(lesson.content?.fileUrl    ?? "");
  const [ytUrl,     setYtUrl]     = useState(lesson.content?.youtubeUrl ?? "");
  const [ytId,      setYtId]      = useState(lesson.content?.youtubeId  ?? "");
  const [mcqQs,     setMcqQs]     = useState<any[]>(lesson.content?.questions ?? []);
  const [passScore, setPassScore]  = useState(lesson.content?.passingScore ?? 70);
  const [exForm,    setExForm]     = useState({ purpose: lesson.content?.purpose ?? "", instructions: lesson.content?.instructions ?? "", submissionType: lesson.content?.submissionType ?? "FILE_UPLOAD" });
  const [contentSaving, setContentSaving] = useState(false);
  const [saved,     setSaved]     = useState(false);

  const patchLesson = async (data: any) => {
    setContentSaving(true);
    try {
      await apiClient.patch(endpoints.admin.courseLesson(courseId, mod.id, lesson.id), data);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      onUpdated();
    } catch (e) { console.error(e); }
    finally { setContentSaving(false); }
  };

  const saveTitle = async () => {
    if (!titleVal.trim() || titleVal === lesson.title) { setEditTitle(false); return; }
    setSaving(true);
    try { await apiClient.patch(endpoints.admin.courseLesson(courseId, mod.id, lesson.id), { title: titleVal.trim() }); onUpdated(); }
    catch (e) { console.error(e); }
    finally { setSaving(false); setEditTitle(false); }
  };

  // YouTube ID extraction
  const extractYtId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  const inp = { width:"100%", padding:"9px 12px", border:"1px solid var(--color-content-border)", borderRadius:8, fontSize:13, color:"var(--color-text-primary)", background:"var(--color-content-bg)", outline:"none", boxSizing:"border-box" as const };
  const lbl = { display:"block", fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:6 };
  const saveBtn = (onClick: () => void, label: string) => (
    <button onClick={onClick} disabled={contentSaving} style={{ padding:"9px 22px", borderRadius:8, border:"none", background:"#5b4fcf", color:"#fff", fontSize:13, fontWeight:600, cursor: contentSaving ? "not-allowed" : "pointer", opacity: contentSaving ? 0.7 : 1, alignSelf:"flex-start" as const }}>
      {contentSaving ? "Saving…" : saved ? "✓ Saved" : label}
    </button>
  );

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Lesson header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, paddingBottom:12, borderBottom:"1px solid var(--color-content-border)", flexShrink:0 }}>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:6, backgroundColor:typeColor(lesson.type), color:"#fff", flexShrink:0 }}>
          {typeCode(lesson.type)}
        </span>
        {editTitle ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <input value={titleVal} onChange={e => setTitleVal(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter") saveTitle(); if (e.key==="Escape") { setEditTitle(false); setTitleVal(lesson.title); } }}
              autoFocus style={{ flex:1, padding:"6px 10px", fontSize:16, fontWeight:700, border:"1px solid #5b4fcf", borderRadius:7, outline:"none", color:"var(--color-text-primary)", background:"var(--color-content-bg)" }} />
            <button onClick={saveTitle} disabled={saving} style={{ padding:"5px 12px", borderRadius:7, border:"none", background:"#5b4fcf", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>{saving?"…":"Save"}</button>
            <button onClick={() => { setEditTitle(false); setTitleVal(lesson.title); }} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid var(--color-content-border)", background:"transparent", fontSize:12, cursor:"pointer", color:"var(--color-text-muted)" }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--color-text-primary)", margin:0 }}>{lesson.title}</h2>
            <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>{lesson.code}</span>
            <button onClick={() => setEditTitle(true)} style={{ marginLeft:4, padding:"3px 8px", borderRadius:6, border:"1px solid var(--color-content-border)", background:"transparent", fontSize:11, cursor:"pointer", color:"var(--color-text-muted)" }}>Edit</button>
          </div>
        )}
      </div>

      {/* Content editor by type */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>

        {/* PDF types */}
        {PDF_TYPES.includes(lesson.type) && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><p style={{ margin:0, fontSize:13, color:"var(--color-text-muted)", lineHeight:1.6 }}>Upload a PDF for this lesson. Participants will read it inline.</p></div>
            <div>
              <label style={lbl}>PDF URL (upload via file storage)</label>
              <input style={inp} placeholder="https://..." value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
            </div>
            {saveBtn(() => patchLesson({ content: { ...lesson.content, fileUrl: pdfUrl } }), "Save PDF")}
          </div>
        )}

        {/* Video */}
        {lesson.type === "VIDEO" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"12px 14px", borderRadius:8, background:"rgba(91,79,207,0.06)", border:"1px solid rgba(91,79,207,0.2)" }}>
              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:"#5b4fcf" }}>📹 How to add a video</p>
              <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.6 }}>Upload to YouTube (set to <strong>Unlisted</strong>), then paste the URL below.</p>
            </div>
            <div>
              <label style={lbl}>YouTube URL</label>
              <input style={inp} placeholder="https://youtube.com/watch?v=..." value={ytUrl}
                onChange={e => { setYtUrl(e.target.value); const id = extractYtId(e.target.value); setYtId(id ?? ""); }} />
              {ytId && <p style={{ margin:"4px 0 0", fontSize:11, color:"#16a34a" }}>✓ Valid YouTube video detected</p>}
            </div>
            {ytId && (
              <div style={{ borderRadius:10, overflow:"hidden", aspectRatio:"16/9", background:"#000" }}>
                <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} style={{ width:"100%", height:"100%", border:"none" }} allowFullScreen />
              </div>
            )}
            {saveBtn(() => patchLesson({ content: { youtubeUrl: ytUrl, youtubeId: ytId } }), "Save Video")}
          </div>
        )}

        {/* MCQ */}
        {lesson.type === "MCQ" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Passing score:</label>
              <input type="number" min="0" max="100" value={passScore} onChange={e => setPassScore(Number(e.target.value))} style={{ ...inp, width:70 }} />
              <span style={{ fontSize:13, color:"var(--color-text-muted)" }}>%</span>
            </div>
            {mcqQs.map((q: any, qi: number) => (
              <div key={q.id} style={{ border:"1px solid var(--color-content-border)", borderRadius:10, padding:14, background:"var(--color-content-bg)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase" }}>Question {qi+1}</span>
                  <button onClick={() => setMcqQs(qs => qs.filter((_,i) => i !== qi))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-danger)", fontSize:12 }}>Remove</button>
                </div>
                <input style={{ ...inp, marginBottom:10 }} placeholder="Question text..." value={q.text} onChange={e => setMcqQs(qs => qs.map((x,i) => i===qi ? { ...x, text: e.target.value } : x))} />
                {q.options.map((opt: any) => (
                  <div key={opt.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <input type="radio" name={`correct-${q.id}`} checked={q.correctOptionId===opt.id} onChange={() => setMcqQs(qs => qs.map((x,i) => i===qi ? { ...x, correctOptionId: opt.id } : x))} style={{ cursor:"pointer", accentColor:"#5b4fcf" }} />
                    <span style={{ fontSize:11, fontWeight:700, width:16, color: q.correctOptionId===opt.id ? "#5b4fcf" : "var(--color-text-muted)", textTransform:"uppercase" }}>{opt.id}</span>
                    <input style={inp} placeholder={`Option ${opt.id.toUpperCase()}…`} value={opt.text} onChange={e => setMcqQs(qs => qs.map((x,i) => i===qi ? { ...x, options: x.options.map((o: any) => o.id===opt.id ? { ...o, text: e.target.value } : o) } : x))} />
                  </div>
                ))}
                <input style={{ ...inp, marginTop:6 }} placeholder="Explanation (shown after submission)…" value={q.explanation} onChange={e => setMcqQs(qs => qs.map((x,i) => i===qi ? { ...x, explanation: e.target.value } : x))} />
              </div>
            ))}
            <button onClick={() => setMcqQs(qs => [...qs, { id: Date.now().toString(), text:"", options:[{id:"a",text:""},{id:"b",text:""},{id:"c",text:""},{id:"d",text:""}], correctOptionId:"a", explanation:"" }])} style={{ padding:"8px 16px", border:"1px dashed #5b4fcf", borderRadius:8, background:"transparent", color:"#5b4fcf", fontSize:12, fontWeight:600, cursor:"pointer", alignSelf:"flex-start" }}>
              + Add Question
            </button>
            {mcqQs.length > 0 && saveBtn(() => patchLesson({ content: { questions: mcqQs, passingScore: passScore } }), "Save Questions")}
          </div>
        )}

        {/* Exercise / Questionnaire */}
        {(lesson.type === "EXERCISE" || lesson.type === "QUESTIONNAIRE") && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={lbl}>Purpose</label>
              <textarea style={{ ...inp, minHeight:60, resize:"vertical" as const }} placeholder="The purpose of this exercise…" value={exForm.purpose} onChange={e => setExForm(f => ({ ...f, purpose: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Instructions</label>
              <textarea style={{ ...inp, minHeight:100, resize:"vertical" as const }} placeholder="Step-by-step instructions…" value={exForm.instructions} onChange={e => setExForm(f => ({ ...f, instructions: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Submission Type</label>
              <div style={{ display:"flex", gap:10 }}>
                {[{value:"FILE_UPLOAD",label:"File Upload"},{value:"TEXT_ENTRY",label:"Text Entry"}].map(opt => (
                  <div key={opt.value} onClick={() => setExForm(f => ({ ...f, submissionType: opt.value }))} style={{ flex:1, padding:10, borderRadius:8, cursor:"pointer", border:`2px solid ${exForm.submissionType===opt.value ? "#5b4fcf" : "var(--color-content-border)"}`, background: exForm.submissionType===opt.value ? "rgba(91,79,207,0.06)" : "transparent", fontSize:13, fontWeight: exForm.submissionType===opt.value ? 600 : 400, color:"var(--color-text-primary)", textAlign:"center" as const, transition:"all 0.12s" }}>
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
            {saveBtn(() => patchLesson({ content: { purpose: exForm.purpose, instructions: exForm.instructions, submissionType: exForm.submissionType }, submissionRequired: true }), "Save Exercise")}
          </div>
        )}

        {/* Assessment */}
        {lesson.type === "ASSESSMENT" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <p style={{ margin:0, fontSize:13, color:"var(--color-text-muted)" }}>Configure assessment details and upload a test paper (PDF).</p>
            <div>
              <label style={lbl}>Instructions</label>
              <textarea style={{ ...inp, minHeight:80, resize:"vertical" as const }} placeholder="Instructions for completing this assessment…" value={exForm.instructions} onChange={e => setExForm(f => ({ ...f, instructions: e.target.value }))} />
            </div>
            {saveBtn(() => patchLesson({ content: { ...lesson.content, instructions: exForm.instructions }, submissionRequired: true }), "Save Assessment")}
          </div>
        )}

        {/* Default — unhandled type */}
        {!PDF_TYPES.includes(lesson.type) && lesson.type !== "VIDEO" && lesson.type !== "MCQ" && lesson.type !== "EXERCISE" && lesson.type !== "QUESTIONNAIRE" && lesson.type !== "ASSESSMENT" && (
          <p style={{ color:"var(--color-text-muted)", fontSize:13 }}>Content editor for <strong>{lesson.type}</strong> lessons — coming soon.</p>
        )}
      </div>
    </div>
  );
}

// ── Main Builder ──────────────────────────────────────────────────────────────

export default function CourseBuilderPage() {
  const params   = useParams();
  const router   = useRouter();
  const courseId = params.id as string;

  const [course,         setCourse]         = useState<Course | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [addLessonTo,    setAddLessonTo]    = useState<Module | null>(null);
  const [newModTitle,    setNewModTitle]    = useState("");
  const [addingMod,      setAddingMod]      = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [savingStatus,   setSavingStatus]   = useState("");
  const [confirmDel,     setConfirmDel]     = useState<{ msg: string; onConfirm: () => void } | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.admin.courseById(courseId));
      setCourse(res.data.data.course);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const addModule = async () => {
    if (!newModTitle.trim()) return;
    setAddingMod(true);
    try {
      await apiClient.post(endpoints.admin.courseModules(courseId), { title: newModTitle.trim() });
      setNewModTitle("");
      await fetchCourse();
    } catch (e) { console.error(e); }
    finally { setAddingMod(false); }
  };

  const deleteModule = (moduleId: string) => {
    setConfirmDel({
      msg: "Delete this module and all its lessons? This cannot be undone.",
      onConfirm: async () => {
        setConfirmDel(null);
        try {
          await apiClient.delete(endpoints.admin.courseModule(courseId, moduleId));
          if (selectedModule === moduleId) { setSelectedModule(null); setSelectedLesson(null); }
          await fetchCourse();
        } catch (e) { console.error(e); }
      },
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setConfirmDel({
      msg: "Delete this lesson? This cannot be undone.",
      onConfirm: async () => {
        setConfirmDel(null);
        try {
          await apiClient.delete(endpoints.admin.courseLesson(courseId, moduleId, lessonId));
          if (selectedLesson === lessonId) setSelectedLesson(null);
          await fetchCourse();
        } catch (e) { console.error(e); }
      },
    });
  };

  const submitForReview = async () => {
    if (!course) return;
    setSavingStatus("Submitting…");
    try {
      await apiClient.patch(endpoints.admin.courseStatus(courseId), { action: "submit" });
      await fetchCourse();
      setSavingStatus("Submitted for review");
      setTimeout(() => setSavingStatus(""), 2000);
    } catch (e: any) {
      setSavingStatus(e?.response?.data?.message ?? "Error");
      setTimeout(() => setSavingStatus(""), 3000);
    }
  };

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", color:"var(--color-text-muted)", fontSize:14 }}>Loading…</div>;
  if (!course)  return <div style={{ textAlign:"center", padding:60, color:"var(--color-danger)" }}>Course not found.</div>;

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const selMod  = course.modules.find(m => m.id === selectedModule);
  const selLesson = selMod?.lessons.find(l => l.id === selectedLesson);

  // Flat list for prev/next
  const flatLessons = course.modules.flatMap(m => m.lessons.map(l => ({ moduleId: m.id, lesson: l })));
  const flatIdx     = flatLessons.findIndex(f => f.lesson.id === selectedLesson);
  const hasPrev     = flatIdx > 0;
  const hasNext     = flatIdx < flatLessons.length - 1;
  const navTo = (idx: number) => {
    const { moduleId, lesson } = flatLessons[idx];
    setSelectedModule(moduleId);
    setSelectedLesson(lesson.id);
  };

  const moduleColors = ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ec4899","#06b6d4","#f97316","#84cc16"];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - var(--topnav-height))", overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 24px", background:"var(--color-content-card)", borderBottom:"1px solid var(--color-content-border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => router.push("/admin/courses")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--color-text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            ← Course Catalog
          </button>
          <span style={{ color:"var(--color-content-border)" }}>|</span>
          <span style={{ fontSize:14, fontWeight:600, color:"var(--color-text-primary)" }}>{course.title}</span>
          <span style={{
            fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, textTransform:"uppercase",
            background: course.status === "PUBLISHED" ? "rgba(22,163,74,0.1)" : course.status === "IN_REVIEW" ? "rgba(217,119,6,0.1)" : "rgba(107,114,128,0.1)",
            color:      course.status === "PUBLISHED" ? "#16a34a"             : course.status === "IN_REVIEW" ? "#d97706"           : "#6b7280",
          }}>{course.status.replace("_"," ")}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>
            {course.modules.length} {course.sprintLabel.toLowerCase()}s · {totalLessons} lessons
          </span>
          {savingStatus && <span style={{ fontSize:12, color:"var(--color-text-muted)" }}>{savingStatus}</span>}
          {course.status === "DRAFT" && (
            <button onClick={submitForReview} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"#d97706", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width:280, flexShrink:0, borderRight:"1px solid var(--color-content-border)", background:"var(--color-content-card)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--color-content-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {course.sprintLabel}s
              </span>
              <button onClick={() => setSidebarOpen(false)} style={{ background:"var(--color-content-bg)", border:"1px solid var(--color-content-border)", cursor:"pointer", color:"var(--color-text-muted)", fontSize:13, width:26, height:26, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:8 }}>
              {course.modules.map((mod, mi) => {
                const accent  = moduleColors[mi % moduleColors.length];
                const isOpen  = selectedModule === mod.id;
                return (
                  <div key={mod.id} style={{ marginBottom:6 }}>
                    <div onClick={() => { setSelectedModule(mod.id === selectedModule ? null : mod.id); setSelectedLesson(null); }} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 10px 10px 12px", borderRadius:8, cursor:"pointer",
                      background: isOpen ? "rgba(0,0,0,0.04)" : "var(--color-content-bg)",
                      border:`1px solid ${isOpen ? accent+"44" : "var(--color-content-border)"}`, borderLeft:`3px solid ${accent}`,
                      transition:"all 0.12s",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:accent, minWidth:14 }}>{mi+1}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{mod.title}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                        <span style={{ fontSize:10, color:"var(--color-text-muted)" }}>{mod.lessons.length}</span>
                        <button onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-muted)", fontSize:14, padding:"0 2px", lineHeight:1 }}>×</button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ paddingLeft:10, paddingTop:3 }}>
                        {mod.lessons.map(lesson => (
                          <div key={lesson.id} onClick={() => setSelectedLesson(lesson.id === selectedLesson ? null : lesson.id)} style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"6px 8px 6px 14px", borderRadius:7, cursor:"pointer",
                            background: selectedLesson===lesson.id ? "rgba(91,79,207,0.08)" : "transparent",
                            border: selectedLesson===lesson.id ? "1px solid rgba(91,79,207,0.2)" : "1px solid transparent",
                            marginBottom:2, transition:"all 0.1s",
                          }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
                              <span style={{ fontSize:9, fontWeight:700, padding:"2px 4px", borderRadius:3, background:typeColor(lesson.type), color:"#fff", flexShrink:0 }}>{typeCode(lesson.type)}</span>
                              <span style={{ fontSize:12, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{lesson.title}</span>
                            </div>
                            <button onClick={e => { e.stopPropagation(); deleteLesson(mod.id, lesson.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-muted)", fontSize:12, padding:"0 2px", flexShrink:0, opacity:0.6 }}>×</button>
                          </div>
                        ))}
                        <button onClick={() => setAddLessonTo(mod)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 8px 5px 14px", border:"1px dashed rgba(91,79,207,0.3)", borderRadius:7, background:"transparent", cursor:"pointer", width:"100%", fontSize:11, color:"#5b4fcf", fontWeight:600, marginTop:4 }}>
                          + Add lesson
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add module */}
              <div style={{ padding:"8px 0", marginTop:8, borderTop:"1px solid var(--color-content-border)" }}>
                <input
                  placeholder={`+ Add ${course.sprintLabel.toLowerCase()}…`}
                  value={newModTitle} onChange={e => setNewModTitle(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") addModule(); }}
                  style={{ width:"100%", padding:"7px 10px", border:"1px dashed var(--color-content-border)", borderRadius:8, fontSize:12, color:"var(--color-text-primary)", background:"transparent", outline:"none", boxSizing:"border-box" as const }}
                />
                {newModTitle && (
                  <button onClick={addModule} disabled={addingMod} style={{ marginTop:6, width:"100%", padding:6, background:"#5b4fcf", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {addingMod ? "Adding…" : `Add ${course.sprintLabel}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <div style={{ width:48, flexShrink:0, borderRight:"1px solid var(--color-content-border)", background:"var(--color-content-card)", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:10 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ width:32, height:32, borderRadius:7, border:"1px solid var(--color-content-border)", background:"var(--color-content-bg)", cursor:"pointer", fontSize:12, color:"var(--color-text-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}>→</button>
            {course.modules.map((mod, mi) => (
              <div key={mod.id} title={mod.title} onClick={() => { setSidebarOpen(true); setSelectedModule(mod.id); }} style={{ width:28, height:28, borderRadius:6, cursor:"pointer", background: selectedModule===mod.id ? "rgba(91,79,207,0.1)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", marginTop:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:moduleColors[mi % moduleColors.length] }}>{mi+1}</span>
              </div>
            ))}
          </div>
        )}

        {/* Right panel */}
        <div style={{ flex:1, background:"var(--color-content-bg)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {!selectedLesson && !selectedModule && (
            <div style={{ textAlign:"center", padding:80, color:"var(--color-text-muted)", fontSize:14 }}>
              <div style={{ fontSize:40, marginBottom:16 }}>📋</div>
              <p>Select a {course.sprintLabel.toLowerCase()} or lesson to edit, or add one on the left.</p>
            </div>
          )}

          {selMod && !selectedLesson && (
            <div style={{ padding:32, maxWidth:600 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"var(--color-text-primary)", marginBottom:8 }}>{selMod.title}</h2>
              <p style={{ fontSize:13, color:"var(--color-text-muted)", marginBottom:20 }}>{selMod.lessons.length} lesson{selMod.lessons.length!==1?"s":""} · click a lesson to edit its content</p>
              <button onClick={() => setAddLessonTo(selMod)} style={{ padding:"9px 20px", background:"#5b4fcf", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                + Add Lesson
              </button>
            </div>
          )}

          {selLesson && selMod && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto", padding:"16px 24px 24px" }}>
              <LessonEditor lesson={selLesson} module={selMod} courseId={courseId} onUpdated={fetchCourse} />
            </div>
          )}

          {selectedLesson && (
            <div style={{ flexShrink:0, borderTop:"1px solid var(--color-content-border)", background:"var(--color-content-card)", padding:"12px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button onClick={() => hasPrev && navTo(flatIdx-1)} disabled={!hasPrev} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid var(--color-content-border)", background:"transparent", fontSize:13, fontWeight:500, color: hasPrev ? "var(--color-text-secondary)" : "var(--color-text-muted)", cursor: hasPrev ? "pointer" : "not-allowed", opacity: hasPrev ? 1 : 0.4 }}>
                ← Previous
              </button>
              <span style={{ fontSize:12, color:"var(--color-text-muted)", fontStyle:"italic" }}>Editing lesson content</span>
              <button onClick={() => hasNext && navTo(flatIdx+1)} style={{ padding:"8px 24px", borderRadius:8, border:"none", background:"#5b4fcf", color:"#fff", fontSize:13, fontWeight:600, cursor: hasNext ? "pointer" : "default", opacity: hasNext ? 1 : 0.6 }}>
                {hasNext ? "Next →" : "Last lesson"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:"var(--color-content-card)", borderRadius:14, padding:28, width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"var(--color-text-primary)", lineHeight:1.6 }}>{confirmDel.msg}</p>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setConfirmDel(null)} style={{ padding:"8px 16px", borderRadius:7, border:"1px solid var(--color-content-border)", background:"transparent", fontSize:13, cursor:"pointer", color:"var(--color-text-muted)" }}>Cancel</button>
              <button onClick={confirmDel.onConfirm} style={{ padding:"8px 18px", borderRadius:7, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {addLessonTo && (
        <AddLessonModal
          module={addLessonTo}
          courseId={courseId}
          onClose={() => setAddLessonTo(null)}
          onCreated={async () => { await fetchCourse(); setAddLessonTo(null); }}
        />
      )}
    </div>
  );
}
