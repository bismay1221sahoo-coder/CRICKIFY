import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getToken, uploadListingMedia } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const CONDITIONS = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];

const initialForm = {
  title: "", brand: "", category: "BAT", condition: "GOOD",
  price: "", city: "", usedDuration: "", defects: "", description: "",
};

const labelClass = "grid gap-1.5 text-sm font-semibold text-slate-700";

function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const isLoggedIn = Boolean(getToken());
  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadListingMedia(file);
        uploaded.push({
          ...result,
          localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          previewUrl: result.type === "IMAGE" ? result.url : null,
        });
      }
      setMedia((c) => [...c, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e) => {
    await uploadFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    await uploadFiles(Array.from(e.dataTransfer.files || []));
  };

  const removeMedia = (localId) => setMedia((c) => c.filter((m) => m.localId !== localId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!media.length) { setError("Upload at least one photo or video before submitting."); return; }
    setLoading(true);
    try {
      await apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), media }),
      });
      navigate("/my-listings", { state: { submitted: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />
        </div>
        <div className="glass fade-in-up w-full max-w-md rounded-3xl p-10 text-center shadow-xl">
          <div className="float mx-auto mb-4 text-4xl">🔒</div>
          <h1 className="text-xl font-black text-slate-900">Login required</h1>
          <p className="mt-2 text-sm text-slate-500">You need an account to list cricket equipment for sale.</p>
          <button onClick={() => navigate("/login")} className="btn-primary mt-6 w-full py-3">
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Blob */}
      <div className="pointer-events-none fixed -right-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />

      <div className="fade-in-up relative mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 backdrop-blur-sm">
          Seller submission
        </span>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Sell your cricket gear</h1>
        <p className="mt-2 text-sm text-slate-500">Fill in the details below. Admin will verify your listing before it goes live.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Equipment details */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Equipment details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Title *
              <input name="title" value={form.title} onChange={updateField} placeholder="e.g. SS Ton cricket bat" className="input-field" required />
            </label>
            <label className={labelClass}>
              Brand
              <input name="brand" value={form.brand} onChange={updateField} placeholder="e.g. SS, SG, Kookaburra" className="input-field" />
            </label>
            <label className={labelClass}>
              Category *
              <select name="category" value={form.category} onChange={updateField} className="input-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Condition *
              <select name="condition" value={form.condition} onChange={updateField} className="input-field">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Price (Rs.) *
              <input name="price" type="number" min="1" value={form.price} onChange={updateField} placeholder="e.g. 1500" className="input-field" required />
            </label>
            <label className={labelClass}>
              City *
              <input name="city" value={form.city} onChange={updateField} placeholder="e.g. Bhubaneswar" className="input-field" required />
            </label>
          </div>
        </div>

        {/* Condition details */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Condition details</p>
          <div className="grid gap-4">
            <label className={labelClass}>
              How long have you used it? *
              <input name="usedDuration" value={form.usedDuration} onChange={updateField} placeholder="e.g. 3 months, 1 season" className="input-field" required />
            </label>
            <label className={labelClass}>
              Any defects or damage? *
              <input name="defects" value={form.defects} onChange={updateField} placeholder="e.g. No defects / minor toe crack / grip worn" className="input-field" required />
            </label>
            <label className={labelClass}>
              Description *
              <textarea name="description" value={form.description} onChange={updateField} rows="4"
                placeholder="Describe the item in detail — brand, size, weight, why selling, etc."
                className="input-field resize-none" required />
            </label>
          </div>
        </div>

        {/* Media upload */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Photos & videos *</p>
          <p className="mb-4 text-xs text-slate-500">Upload clear photos from multiple angles. Max 25MB per file.</p>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
              dragOver
                ? "border-emerald-400 bg-emerald-50/60 scale-[1.01]"
                : "border-slate-200/80 bg-white/30 hover:border-emerald-300 hover:bg-emerald-50/30"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform duration-200 ${dragOver ? "scale-110" : ""}`}
              style={{ background: "linear-gradient(135deg, #d1fae5, #e0f2fe)" }}>
              📷
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {dragOver ? "Drop files here!" : "Click or drag & drop to upload"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">JPG, PNG, WEBP, MP4, MOV, WEBM</p>
            </div>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={handleFileInput} className="hidden" />
          </label>

          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
              </svg>
              Uploading...
            </div>
          )}

          {media.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <div key={item.localId} className="group relative aspect-square overflow-hidden rounded-xl border border-white/60 shadow-sm">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="upload" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="glass-dark flex h-full items-center justify-center text-xs font-bold text-white">▶ VIDEO</div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeMedia(item.localId)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 text-xs font-bold hover:bg-red-600 hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <button disabled={loading || uploading} className="btn-primary w-full py-4 text-sm">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
              </svg>
              Submitting...
            </span>
          ) : "Submit for verification →"}
        </button>
      </form>
    </main>
  );
}

export default Sell;
