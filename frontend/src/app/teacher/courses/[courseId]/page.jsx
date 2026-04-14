"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import teacherService from "@/app/services/teacherService";
import { uploadPdf, uploadVideo, getPdfDownloadUrl } from "@/app/services/uploadService";
import useAuthStore from "@/app/store/authStore";

const EMPTY_LESSON = { title: "", type: "TEXT", content: "", videoUrl: "", pdfUrl: "", order: "" };
const EMPTY_MODULE = { title: "", order: "" };

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(17,24,39,${alpha})`;
  let s = hex.replace("#", "").trim();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  if (s.length !== 6) return `rgba(17,24,39,${alpha})`;
  const n = parseInt(s, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

const getYoutubeEmbedUrl = (url = "") => {
  try {
    const p = new URL(url);
    if (p.hostname.includes("youtube.com")) {
      const id = p.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (p.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${p.pathname.slice(1)}`;
    }
    return "";
  } catch { return ""; }
};

const isCloudinaryVideo = (url = "") =>
  url.includes("cloudinary.com") && url.includes("/video/");

const getFileName = (url = "") => {
  try { return decodeURIComponent(new URL(url).pathname.split("/").pop() || "file.pdf"); }
  catch { return "file.pdf"; }
};

const fmt = (v) => {
  try { return v ? new Date(v).toLocaleDateString() : "—"; }
  catch { return "—"; }
};

export default function TeacherCourseWorkspacePage() {
  const { courseId } = useParams();
  const { institute, token } = useAuthStore();

  const pc = institute?.primaryColor || "#2563eb";
  const sc = institute?.secondaryColor || "#7c3aed";

  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE);
  const [lessonForms, setLessonForms] = useState({});

  const [uploadingPdf, setUploadingPdf] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [videoPct, setVideoPct] = useState({});
  const [pdfPct, setPdfPct] = useState({});

  // "url" or "file" per module
  const [videoMode, setVideoMode] = useState({});

  useEffect(() => { setMounted(true); }, []);

  // ── styles ────────────────────────────────────────────────────────────────
  const pageBg = useMemo(() => ({
    background: `radial-gradient(circle at top left,${hexToRgba(pc,0.15)},transparent 30%),radial-gradient(circle at top right,${hexToRgba(sc,0.15)},transparent 25%),linear-gradient(180deg,#f8fafc,#eef4ff 50%,#f8fafc)`,
  }), [pc, sc]);

  const heroStyle = useMemo(() => ({
    background: `linear-gradient(135deg,${hexToRgba(pc,0.10)},${hexToRgba(sc,0.10)})`,
    borderColor: hexToRgba(pc, 0.18),
  }), [pc, sc]);

  const chip  = useMemo(() => ({ borderColor: hexToRgba(pc,0.25), backgroundColor: hexToRgba(pc,0.10), color: pc }), [pc]);
  const soft  = useMemo(() => ({ borderColor: hexToRgba(pc,0.15), background: `linear-gradient(135deg,${hexToRgba(pc,0.05)},${hexToRgba(sc,0.04)})` }), [pc, sc]);
  const inp   = useMemo(() => ({ borderColor: hexToRgba(pc,0.22), color: "#0f172a" }), [pc]);
  const btn   = useMemo(() => ({ background: `linear-gradient(135deg,${pc},${sc})`, boxShadow: `0 6px 20px ${hexToRgba(pc,0.3)}` }), [pc, sc]);
  const btnS  = useMemo(() => ({ borderColor: hexToRgba(pc,0.25), background: "#fff", color: pc }), [pc]);

  // ── data ──────────────────────────────────────────────────────────────────
  const loadAll = async () => {
    try {
      setLoading(true); setPageError("");
      const [cRes, sRes] = await Promise.all([
        teacherService.getCourseById(courseId),
        teacherService.getCourseStudentsProgress(courseId),
      ]);
      setCourse(cRes.data);
      setStudentsData(sRes.data);
    } catch (e) {
      setPageError(e?.response?.data?.message || "Failed to load course workspace");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (mounted && courseId) loadAll(); }, [mounted, courseId]);

  const getLF = (mid) => lessonForms[mid] || EMPTY_LESSON;
  const setLF = (mid, field, val) =>
    setLessonForms((p) => ({ ...p, [mid]: { ...(p[mid] || EMPTY_LESSON), [field]: val } }));

  // ── PDF upload ────────────────────────────────────────────────────────────
  const handlePdfUpload = async (mid, file) => {
    if (!file) return;
    setUploadingPdf(mid);
    setPdfPct((p) => ({ ...p, [mid]: 0 }));
    try {
      const res = await uploadPdf(file, token, (pct) => setPdfPct((p) => ({ ...p, [mid]: pct })));
      const url = res?.data?.url || "";
      if (!url) throw new Error("No URL returned");
      setLessonForms((p) => ({ ...p, [mid]: { ...(p[mid] || EMPTY_LESSON), pdfUrl: url } }));
    } catch (e) {
      alert(e?.message || "PDF upload failed");
    } finally {
      setUploadingPdf(null);
      setPdfPct((p) => ({ ...p, [mid]: 0 }));
    }
  };

  // ── Video upload ──────────────────────────────────────────────────────────
  const handleVideoUpload = async (mid, file) => {
    if (!file) return;
    setUploadingVideo(mid);
    setVideoPct((p) => ({ ...p, [mid]: 0 }));
    try {
      const res = await uploadVideo(file, token, (pct) => setVideoPct((p) => ({ ...p, [mid]: pct })));
      const url = res?.data?.url || "";
      if (!url) throw new Error("No URL returned");
      setLessonForms((p) => ({ ...p, [mid]: { ...(p[mid] || EMPTY_LESSON), videoUrl: url } }));
    } catch (e) {
      alert(e?.message || "Video upload failed. If the file is too large for Cloudinary, use a YouTube URL instead.");
    } finally {
      setUploadingVideo(null);
      setVideoPct((p) => ({ ...p, [mid]: 0 }));
    }
  };

  // ── module handlers ───────────────────────────────────────────────────────
  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await teacherService.createModule(courseId, {
        title: moduleForm.title,
        order: moduleForm.order ? Number(moduleForm.order) : undefined,
      });
      setModuleForm(EMPTY_MODULE);
      await loadAll();
    } catch (e) { alert(e?.response?.data?.message || "Failed to create module"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteModule = async (mid) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try { await teacherService.deleteModule(mid); await loadAll(); }
    catch (e) { alert(e?.response?.data?.message || "Failed to delete module"); }
  };

  // ── lesson handlers ───────────────────────────────────────────────────────
  const handleCreateLesson = async (e, mid) => {
    e.preventDefault();
    const form = getLF(mid);
    if (!form.title?.trim()) { alert("Lesson title is required"); return; }
    if (form.type === "TEXT" && !form.content?.trim()) { alert("Text content is required"); return; }
    if (form.type === "VIDEO" && !form.videoUrl?.trim()) { alert("Please paste a YouTube URL or upload a video file first."); return; }
    if (form.type === "PDF" && !form.pdfUrl?.trim()) { alert("Please upload a PDF file first."); return; }

    try {
      setSubmitting(true);
      await teacherService.createLesson(mid, {
        title: form.title.trim(),
        type: form.type,
        content: form.type === "TEXT" ? form.content : undefined,
        videoUrl: form.type === "VIDEO" ? form.videoUrl : undefined,
        pdfUrl: form.type === "PDF" ? form.pdfUrl : undefined,
        order: form.order ? Number(form.order) : undefined,
      });
      setLessonForms((p) => ({ ...p, [mid]: EMPTY_LESSON }));
      await loadAll();
    } catch (e) { alert(e?.response?.data?.message || "Failed to create lesson"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteLesson = async (lid) => {
    if (!confirm("Delete this lesson?")) return;
    try { await teacherService.deleteLesson(lid); await loadAll(); }
    catch (e) { alert(e?.response?.data?.message || "Failed to delete lesson"); }
  };

  const summary = studentsData?.summary || { totalEnrollments:0,totalLessons:0,averageCompletion:0,completedStudents:0,inProgressStudents:0,notStartedStudents:0 };
  const students = studentsData?.students || [];

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">Loading course workspace...</div>
    </div>
  );

  if (pageError) return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-8 text-red-600">{pageError}</div>
    </div>
  );

  if (!course) return null;

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 sm:px-6" style={pageBg}>
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="rounded-[28px] border p-6 sm:p-8" style={heroStyle}>
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={chip}>
              Course Workspace
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{course.title}</h1>
            <p className="text-sm leading-7 text-slate-600">{course.description || "No description."}</p>
            <div className="flex flex-wrap gap-3">
              {[["Status", course.status],["Category", course.category||"General"],["Modules", course.modules?.length||0],["Enrolled", summary.totalEnrollments]].map(([l,v])=>(
                <div key={l} className="rounded-full border px-4 py-1.5 text-sm font-semibold" style={chip}>{l}: {v}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSIGHTS + CREATE MODULE ───────────────────────────────────── */}
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

          {/* Insights */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Insights</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">Student Progress</h2>
              </div>
              <button onClick={async()=>{setRefreshing(true);try{const s=await teacherService.getCourseStudentsProgress(courseId);setStudentsData(s.data);}finally{setRefreshing(false);}}}
                className="rounded-2xl border px-4 py-2 text-sm font-semibold transition" style={btnS}>
                {refreshing?"Refreshing...":"Refresh"}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[["Enrollments",summary.totalEnrollments,"Students joined"],["Lessons",summary.totalLessons,"Total in course"],
                ["Avg. Completion",`${summary.averageCompletion}%`,"All students"],["Completed",summary.completedStudents,"Finished all"],
                ["In Progress",summary.inProgressStudents,"Started"],["Not Started",summary.notStartedStudents,"No progress"]].map(([l,v,h])=>(
                <div key={l} className="rounded-[20px] border p-4" style={soft}>
                  <p className="text-[11px] font-bold uppercase text-slate-400">{l}</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{v}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{h}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Create module */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Add Module</p>
            <h2 className="mt-1 mb-5 text-xl font-extrabold text-slate-900">Create a new module</h2>
            <form onSubmit={handleCreateModule} className="grid gap-3">
              <input type="text" placeholder="Module title" value={moduleForm.title}
                onChange={(e)=>setModuleForm(p=>({...p,title:e.target.value}))}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-[15px] font-medium outline-none placeholder:text-slate-400" style={inp}/>
              <input type="number" placeholder="Order (optional)" value={moduleForm.order}
                onChange={(e)=>setModuleForm(p=>({...p,order:e.target.value}))}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none placeholder:text-slate-400" style={inp}/>
              <button type="submit" disabled={submitting}
                className="w-full rounded-2xl px-4 py-3 font-semibold text-white disabled:opacity-60" style={btn}>
                {submitting?"Creating...":"Create Module"}
              </button>
            </form>
          </div>
        </section>

        {/* ── STUDENT LIST ───────────────────────────────────────────────── */}
        {students.length > 0 && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Enrolled Students</p>
            <h2 className="mt-1 mb-5 text-xl font-extrabold text-slate-900">Learner Progress</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {students.map(item=>(
                <div key={item.enrollmentId} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.student?.name}</p>
                      <p className="text-sm text-slate-500">{item.student?.email}</p>
                    </div>
                    <StatusBadge status={item.status}/>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all" style={{width:`${item.completionPercentage}%`,background:`linear-gradient(135deg,${pc},${sc})`}}/>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Enrolled: {fmt(item.enrolledAt)}</span>
                    <span>{item.completedLessons}/{item.totalLessons} lessons — {item.completionPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── MODULES ───────────────────────────────────────────────────── */}
        <section className="space-y-5">
          {!course.modules?.length ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No modules yet. Create one above.</div>
          ) : course.modules.map(module => {
            const form = getLF(module.id);
            const mode = videoMode[module.id] || "url";
            const ytEmbed = getYoutubeEmbedUrl(form.videoUrl);

            return (
              <div key={module.id} className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">

                {/* Module header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={chip}>
                      Module {module.order}
                    </span>
                    <h3 className="mt-3 text-xl font-extrabold text-slate-900">{module.title}</h3>
                  </div>
                  <button onClick={()=>handleDeleteModule(module.id)}
                    className="w-full rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto">
                    Delete Module
                  </button>
                </div>

                {/* Existing lessons */}
                <div className="mt-6">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Existing Lessons</p>
                  {!module.lessons?.length ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400">No lessons yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {module.lessons.map(lesson=>(
                        <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                                <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase" style={chip}>{lesson.type}</span>
                                <span className="text-xs text-slate-400">#{lesson.order}</span>
                              </div>

                              {/* TEXT preview */}
                              {lesson.type==="TEXT" && lesson.content && (
                                <p className="mt-2 line-clamp-3 text-sm text-slate-600 whitespace-pre-wrap">{lesson.content}</p>
                              )}

                              {/* VIDEO */}
                              {lesson.type==="VIDEO" && lesson.videoUrl && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                                  {getYoutubeEmbedUrl(lesson.videoUrl) ? (
                                    <iframe src={getYoutubeEmbedUrl(lesson.videoUrl)} title={lesson.title} className="aspect-video w-full" allowFullScreen/>
                                  ) : isCloudinaryVideo(lesson.videoUrl) ? (
                                    <video src={lesson.videoUrl} controls className="aspect-video w-full bg-black"/>
                                  ) : (
                                    <div className="p-3">
                                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="break-all text-sm font-medium underline" style={{color:pc}}>{lesson.videoUrl}</a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* PDF — open in new tab (browser PDF viewer) + download */}
                              {lesson.type==="PDF" && lesson.pdfUrl && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border p-3" style={soft}>
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={btn}>PDF</div>
                                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{getFileName(lesson.pdfUrl)}</p>
                                  {/* Open in new tab — browser shows its own PDF viewer */}
                                  <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white" style={btn}>
                                    View PDF
                                  </a>
                                  {/* Force download */}
                                  <a href={`${lesson.pdfUrl}?fl_attachment=true`} download={getFileName(lesson.pdfUrl)}
                                    className="shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold" style={btnS}>
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>

                            <button onClick={()=>handleDeleteLesson(lesson.id)}
                              className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Add lesson form ───────────────────────────────────── */}
                <form onSubmit={(e)=>handleCreateLesson(e,module.id)} className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Add Lesson</p>
                  <h4 className="mt-1 mb-4 text-lg font-extrabold text-slate-900">Create content</h4>

                  <div className="grid gap-4">
                    {/* Title */}
                    <input type="text" placeholder="Lesson title" value={form.title}
                      onChange={(e)=>setLF(module.id,"title",e.target.value)}
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-[15px] font-medium outline-none placeholder:text-slate-400" style={inp}/>

                    {/* Type + order */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid grid-cols-3 gap-2">
                        {["TEXT","VIDEO","PDF"].map(t=>(
                          <button key={t} type="button" onClick={()=>setLF(module.id,"type",t)}
                            className="rounded-2xl border py-3 text-sm font-bold transition"
                            style={form.type===t
                              ?{background:`linear-gradient(135deg,${pc},${sc})`,borderColor:pc,color:"#fff"}
                              :{borderColor:hexToRgba(pc,0.2),backgroundColor:"#fff",color:"#334155"}}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <input type="number" placeholder="Order (optional)" value={form.order}
                        onChange={(e)=>setLF(module.id,"order",e.target.value)}
                        className="w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none placeholder:text-slate-400" style={inp}/>
                    </div>

                    {/* ── TEXT ─────────────────────────────── */}
                    {form.type==="TEXT" && (
                      <textarea rows={7} placeholder="Write lesson content here..." value={form.content}
                        onChange={(e)=>setLF(module.id,"content",e.target.value)}
                        className="rounded-2xl border bg-white px-4 py-3 text-[15px] leading-7 outline-none placeholder:text-slate-400" style={inp}/>
                    )}

                    {/* ── VIDEO ────────────────────────────── */}
                    {form.type==="VIDEO" && (
                      <div className="grid gap-3">
                        {/* Mode toggle */}
                        <div className="flex gap-2">
                          {[["url","🔗 YouTube URL"],["file","📁 Upload File"]].map(([m,label])=>(
                            <button key={m} type="button"
                              onClick={()=>{
                                setVideoMode(p=>({...p,[module.id]:m}));
                                setLF(module.id,"videoUrl","");
                              }}
                              className="rounded-xl border px-4 py-2 text-sm font-semibold transition"
                              style={mode===m
                                ?{background:`linear-gradient(135deg,${pc},${sc})`,color:"#fff",borderColor:pc}
                                :{background:"#fff",color:"#475569",borderColor:hexToRgba(pc,0.2)}}>
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* YouTube URL */}
                        {mode==="url" && (
                          <div className="grid gap-2">
                            <input type="text" placeholder="Paste YouTube URL (e.g. https://youtu.be/xxxxx)"
                              value={form.videoUrl}
                              onChange={(e)=>setLF(module.id,"videoUrl",e.target.value)}
                              className="rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none placeholder:text-slate-400" style={inp}/>
                            <p className="text-xs text-slate-400">
                              💡 Use YouTube for videos larger than your Cloudinary plan allows. Upload as <strong>Unlisted</strong> on YouTube to keep it private.
                            </p>
                            {ytEmbed && (
                              <div className="overflow-hidden rounded-xl border border-slate-200">
                                <iframe src={ytEmbed} title="Preview" className="aspect-video w-full" allowFullScreen/>
                              </div>
                            )}
                          </div>
                        )}

                        {/* File upload */}
                        {mode==="file" && (
                          <div className="grid gap-3">
                            <div className="rounded-2xl border border-dashed bg-white p-5" style={{borderColor:hexToRgba(pc,0.3)}}>
                              <p className="mb-1 text-sm font-semibold text-slate-700">Upload Video File</p>
                              <p className="mb-3 text-xs text-slate-400">
                                MP4, WebM, MOV supported. For large videos, use the YouTube URL tab instead.
                              </p>
                              <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                disabled={uploadingVideo===module.id}
                                onChange={(e)=>{const f=e.target.files?.[0];if(f)handleVideoUpload(module.id,f);}}
                                className="block w-full text-sm text-slate-600 disabled:opacity-50"/>

                              {uploadingVideo===module.id && (
                                <div className="mt-3 space-y-1">
                                  <p className="text-sm font-medium text-blue-600">Uploading... {videoPct[module.id]??0}%</p>
                                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full transition-all" style={{width:`${videoPct[module.id]??0}%`,background:`linear-gradient(135deg,${pc},${sc})`}}/>
                                  </div>
                                  <p className="text-xs text-slate-400">Do not close this page</p>
                                </div>
                              )}
                              {isCloudinaryVideo(form.videoUrl) && uploadingVideo!==module.id && (
                                <p className="mt-2 text-sm font-medium text-emerald-600">✅ Video uploaded successfully</p>
                              )}
                            </div>

                            {/* Cloudinary video preview */}
                            {isCloudinaryVideo(form.videoUrl) && uploadingVideo!==module.id && (
                              <div className="overflow-hidden rounded-xl border border-slate-200">
                                <video src={form.videoUrl} controls className="aspect-video w-full bg-black"/>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── PDF ──────────────────────────────── */}
                    {form.type==="PDF" && (
                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-dashed bg-white p-5" style={{borderColor:hexToRgba(pc,0.3)}}>
                          <p className="mb-1 text-sm font-semibold text-slate-700">Upload PDF (max 10MB)</p>
                          <input type="file" accept="application/pdf"
                            disabled={uploadingPdf===module.id}
                            onChange={(e)=>handlePdfUpload(module.id,e.target.files?.[0])}
                            className="block w-full text-sm text-slate-600 disabled:opacity-50"/>

                          {uploadingPdf===module.id && (
                            <div className="mt-3 space-y-1">
                              <p className="text-sm font-medium text-blue-600">Uploading... {pdfPct[module.id]??0}%</p>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full transition-all" style={{width:`${pdfPct[module.id]??0}%`,background:`linear-gradient(135deg,${pc},${sc})`}}/>
                              </div>
                            </div>
                          )}
                          {form.pdfUrl && uploadingPdf!==module.id && (
                            <p className="mt-2 text-sm font-medium text-emerald-600">✅ PDF uploaded successfully</p>
                          )}
                        </div>

                        {/* PDF ready — view + download */}
                        {form.pdfUrl && uploadingPdf!==module.id && (
                          <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={soft}>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={btn}>PDF</div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{getFileName(form.pdfUrl)}</p>
                              <p className="text-xs text-slate-500">Ready — click Create Lesson to save</p>
                            </div>
                            {/* Opens in new tab — browser shows native PDF viewer */}
                            <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer"
                              className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white" style={btn}>
                              View PDF
                            </a>
                            {/* Force download */}
                            <a href={getPdfDownloadUrl(form.pdfUrl)} download={getFileName(form.pdfUrl)}
                              className="shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold" style={btnS}>
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit"
                      disabled={submitting||uploadingPdf===module.id||uploadingVideo===module.id}
                      className="w-full rounded-2xl px-4 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={btn}>
                      {submitting?"Creating...":"Create Lesson"}
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({status}) {
  const s = {
    COMPLETED:"border-green-200 bg-green-50 text-green-700",
    IN_PROGRESS:"border-amber-200 bg-amber-50 text-amber-700",
    NOT_STARTED:"border-slate-200 bg-slate-50 text-slate-600"
  };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${s[status]||s.NOT_STARTED}`}>
      {status==="IN_PROGRESS"?"In Progress":status==="NOT_STARTED"?"Not Started":"Completed"}
    </span>
  );
}