import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getToken, uploadListingMedia } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const CONDITIONS = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];

const initialForm = {
  title: "",
  brand: "",
  category: "BAT",
  condition: "GOOD",
  price: "",
  city: "",
  usedDuration: "",
  defects: "",
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white transition-colors";

const labelClass = "grid gap-1.5 text-sm font-semibold text-slate-700";

function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState([]);

  const isLoggedIn = Boolean(getToken());

  const updateField = (e) =>
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
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
      e.target.value = "";
    }
  };

  const removeMedia = (localId) =>
    setMedia((c) => c.filter((m) => m.localId !== localId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!media.length) {
      setError("Upload at least one photo or video before submitting.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), media }),
      });
      setForm(initialForm);
      setMedia([]);
      setMessage("Listing submitted! Admin will verify it shortly.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            🔒
          </div>
          <h1 className="text-xl font-black text-slate-900">Login required</h1>
          <p className="mt-2 text-sm text-slate-500">
            You need an account to list cricket equipment for sale.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
          Seller submission
        </span>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Sell your cricket gear</h1>
        <p className="mt-2 text-sm text-slate-500">
          Fill in the details below. Admin will verify your listing before it goes live.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-bold text-emerald-800">{message}</p>
            <p className="text-xs text-emerald-600">You'll be notified once it's approved.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Section 1 — Basic info */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-5 text-xs font-bold uppercase tracking-wide text-slate-400">Equipment details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Title *
              <input name="title" value={form.title} onChange={updateField} placeholder="e.g. SS Ton cricket bat" className={inputClass} required />
            </label>
            <label className={labelClass}>
              Brand
              <input name="brand" value={form.brand} onChange={updateField} placeholder="e.g. SS, SG, Kookaburra" className={inputClass} />
            </label>
            <label className={labelClass}>
              Category *
              <select name="category" value={form.category} onChange={updateField} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Condition *
              <select name="condition" value={form.condition} onChange={updateField} className={inputClass}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Price (Rs.) *
              <input name="price" type="number" min="1" value={form.price} onChange={updateField} placeholder="e.g. 1500" className={inputClass} required />
            </label>
            <label className={labelClass}>
              City *
              <input name="city" value={form.city} onChange={updateField} placeholder="e.g. Bhubaneswar" className={inputClass} required />
            </label>
          </div>
        </div>

        {/* Section 2 — Condition details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-5 text-xs font-bold uppercase tracking-wide text-slate-400">Condition details</p>
          <div className="grid gap-4">
            <label className={labelClass}>
              How long have you used it? *
              <input name="usedDuration" value={form.usedDuration} onChange={updateField} placeholder="e.g. 3 months, 1 season" className={inputClass} required />
            </label>
            <label className={labelClass}>
              Any defects or damage? *
              <input name="defects" value={form.defects} onChange={updateField} placeholder="e.g. No defects / minor toe crack / grip worn" className={inputClass} required />
            </label>
            <label className={labelClass}>
              Description *
              <textarea name="description" value={form.description} onChange={updateField} rows="4" placeholder="Describe the item in detail — brand, size, weight, why selling, etc." className={inputClass} required />
            </label>
          </div>
        </div>

        {/* Section 3 — Media */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Photos & videos *</p>
          <p className="mb-4 text-xs text-slate-500">Upload clear photos from multiple angles. Max 25MB per file.</p>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-xl">
              📷
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Click to upload photos or videos</p>
              <p className="mt-0.5 text-xs text-slate-400">JPG, PNG, WEBP, MP4, MOV, WEBM</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10"/></svg>
              Uploading...
            </div>
          )}

          {media.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <div key={item.localId} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="upload" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500">
                      VIDEO
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(item.localId)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        <button
          disabled={loading || uploading}
          className="w-full rounded-xl bg-emerald-700 py-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition-colors"
        >
          {loading ? "Submitting..." : "Submit for verification →"}
        </button>
      </form>
    </main>
  );
}

export default Sell;
