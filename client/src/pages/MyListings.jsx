import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";

const STATUS_META = {
  PENDING: { label: "Pending", cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  APPROVED: { label: "Approved", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  REJECTED: { label: "Rejected", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

const CONDITION_META = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  NEEDS_REPAIR: "Needs Repair",
};

const CATEGORY_OPTIONS = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const CONDITION_OPTIONS = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    brand: "",
    category: "BAT",
    condition: "GOOD",
    price: "",
    city: "",
    usedDuration: "",
    defects: "",
    description: "",
  });
  const location = useLocation();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!location.state?.submitted) return;

    setToast("Listing submitted! Admin will verify it shortly.");
    const timer = setTimeout(() => setToast(""), 4000);
    window.history.replaceState({}, "", window.location.pathname);

    return () => clearTimeout(timer);
  }, [location.state]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/listings/mine");
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const deleteListing = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/listings/${id}`, { method: "DELETE" });
      setListings((current) => current.filter((item) => item.id !== id));
      setToast("Listing deleted.");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (listing) => {
    setEditTargetId(listing.id);
    setEditForm({
      title: listing.title || "",
      brand: listing.brand || "",
      category: listing.category || "BAT",
      condition: listing.condition || "GOOD",
      price: String(listing.price ?? ""),
      city: listing.city || "",
      usedDuration: listing.usedDuration || "",
      defects: listing.defects || "",
      description: listing.description || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (editSubmitting) return;
    setEditOpen(false);
    setEditTargetId(null);
  };

  const updateEditField = (e) => {
    const { name, value } = e.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editTargetId) return;
    setEditSubmitting(true);
    setError("");
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
      };
      const data = await apiRequest(`/api/listings/${editTargetId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setListings((current) =>
        current.map((item) => (item.id === editTargetId ? data.listing : item))
      );
      setToast("Listing updated.");
      setTimeout(() => setToast(""), 3000);
      closeEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 fade-in-up">
          <div className="glass-emerald flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl">
            <p className="text-sm font-bold text-emerald-800">{toast}</p>
          </div>
        </div>
      )}

      <div className="fade-in-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/70 bg-sky-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-700 backdrop-blur-sm">
            My listings
          </span>
          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Your submissions</h1>
          <p className="mt-1 text-sm text-slate-500">Track the status of all your listed equipment.</p>
        </div>
        <Link to="/sell" className="btn-primary shrink-0 px-5 py-2.5 text-sm">
          + New listing
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass overflow-hidden rounded-2xl">
              <div className="flex">
                <div className="shimmer h-32 w-36 shrink-0" />
                <div className="grid flex-1 gap-3 p-5">
                  <div className="shimmer h-5 w-1/2 rounded-lg" />
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-4 w-1/3 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center shadow-md">
          <h2 className="text-xl font-black text-slate-900">No listings yet</h2>
          <p className="mt-2 text-sm text-slate-500">You have not submitted any equipment for sale.</p>
          <Link to="/sell" className="btn-primary mt-6 inline-flex px-6 py-3">
            List your first item
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing?.media?.find((m) => m?.type === "IMAGE" && m?.url);
          const safeStatus = listing?.status || "PENDING";
          const status = STATUS_META[safeStatus] || { label: safeStatus, cls: "bg-slate-100 text-slate-600" };
          const safeTitle = listing?.title || "Untitled listing";
          const safePrice = Number.isFinite(listing?.price) ? listing.price : Number(listing?.price) || 0;
          const safeCreatedAt = listing?.createdAt ? new Date(listing.createdAt) : null;
          const hasValidCreatedAt = safeCreatedAt && !Number.isNaN(safeCreatedAt.getTime());

          return (
            <article key={listing?.id || safeTitle} className="glass card-hover overflow-hidden rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-44 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-44">
                  {cover ? (
                    <img
                      src={cover.url}
                      alt={safeTitle}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full min-h-[130px] items-center justify-center text-xs font-semibold text-slate-500">No image</div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2 p-4 sm:p-5">
                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-slate-900">{safeTitle}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {listing?.category || "Unknown"} · {CONDITION_META[listing?.condition] || listing?.condition || "Unknown"} · {listing?.city || "Unknown city"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="gradient-text text-base font-black">Rs. {safePrice.toLocaleString()}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{listing?.description || "No description provided."}</p>

                    {safeStatus === "REJECTED" && listing?.rejectReason && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200/60 bg-red-50/60 px-3 py-2.5">
                        <p className="text-xs font-semibold text-red-700">Rejected: {listing.rejectReason}</p>
                      </div>
                    )}

                    {safeStatus === "PENDING" && (
                      <p className="mt-2 text-xs font-semibold text-amber-600">Awaiting admin verification</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      {hasValidCreatedAt
                        ? safeCreatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "Date unavailable"}
                    </p>
                    <div className="flex items-center gap-2">
                      {safeStatus === "APPROVED" && listing?.id && (
                        <Link
                          to={`/listings/${listing.id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}
                        >
                          View live
                        </Link>
                      )}
                      {safeStatus === "PENDING" && listing?.id && (
                        <button
                          onClick={() => openEdit(listing)}
                          className="rounded-lg border border-sky-200/60 bg-sky-50/60 px-3 py-1.5 text-xs font-bold text-sky-700 transition-colors hover:bg-sky-100"
                        >
                          Edit
                        </button>
                      )}
                      {listing?.id && (
                        <button
                          onClick={() => deleteListing(listing.id, safeTitle)}
                          className="rounded-lg border border-red-200/60 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submitEdit}
            className="glass w-full max-w-2xl rounded-2xl p-5 shadow-2xl sm:p-6"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-slate-900">Edit listing</h3>
              <p className="text-sm text-slate-500">Only pending listings can be edited.</p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Title
                <input
                  name="title"
                  value={editForm.title}
                  onChange={updateEditField}
                  className="input-field"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Brand
                <input
                  name="brand"
                  value={editForm.brand}
                  onChange={updateEditField}
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Category
                <select
                  name="category"
                  value={editForm.category}
                  onChange={updateEditField}
                  className="input-field"
                  required
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Condition
                <select
                  name="condition"
                  value={editForm.condition}
                  onChange={updateEditField}
                  className="input-field"
                  required
                >
                  {CONDITION_OPTIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Price (Rs.)
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={editForm.price}
                  onChange={updateEditField}
                  className="input-field"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                City
                <input
                  name="city"
                  value={editForm.city}
                  onChange={updateEditField}
                  className="input-field"
                  required
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Used duration
                <input
                  name="usedDuration"
                  value={editForm.usedDuration}
                  onChange={updateEditField}
                  className="input-field"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Defects
                <input
                  name="defects"
                  value={editForm.defects}
                  onChange={updateEditField}
                  className="input-field"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Description
                <textarea
                  name="description"
                  rows={4}
                  value={editForm.description}
                  onChange={updateEditField}
                  className="input-field resize-none"
                  required
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEdit}
                className="glass rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-white/80"
                disabled={editSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-5 py-2 text-sm"
                disabled={editSubmitting}
              >
                {editSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default MyListings;

