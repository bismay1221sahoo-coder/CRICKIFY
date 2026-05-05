import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";

const STATUS_META = {
  PENDING:  { label: "Pending",  cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  APPROVED: { label: "Approved", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  REJECTED: { label: "Rejected", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

const CONDITION_META = {
  LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair", NEEDS_REPAIR: "Needs Repair",
};

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const location = useLocation();

  // Show success toast if redirected from Sell page
  useEffect(() => {
    if (location.state?.submitted) {
      setToast("Listing submitted! Admin will verify it shortly.");
      setTimeout(() => setToast(""), 4000);
      window.history.replaceState({}, "");
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/listings/mine");
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteListing = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/listings/${id}`, { method: "DELETE" });
      setListings((c) => c.filter((l) => l.id !== id));
      setToast("Listing deleted.");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 fade-in-up">
          <div className="glass-emerald flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl">
            <span className="text-lg">✅</span>
            <p className="text-sm font-bold text-emerald-800">{toast}</p>
          </div>
        </div>
      )}

      <div className="fade-in-up mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/70 bg-sky-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-700 backdrop-blur-sm">
            My listings
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Your submissions</h1>
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
                <div className="flex-1 p-5 grid gap-3">
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
          <div className="float mx-auto mb-4 text-5xl">📦</div>
          <h2 className="text-xl font-black text-slate-900">No listings yet</h2>
          <p className="mt-2 text-sm text-slate-500">You haven't submitted any equipment for sale.</p>
          <Link to="/sell" className="btn-primary mt-6 inline-flex px-6 py-3">
            List your first item →
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing.media?.find((m) => m.type === "IMAGE");
          const status = STATUS_META[listing.status] || { label: listing.status, cls: "bg-slate-100 text-slate-600" };

          return (
            <article key={listing.id} className="glass card-hover overflow-hidden rounded-2xl shadow-sm">
              <div className="flex">
                <div className="relative h-auto w-36 shrink-0 overflow-hidden bg-slate-100 sm:w-44">
                  {cover ? (
                    <img src={cover.url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <div className="flex h-full min-h-[130px] items-center justify-center text-3xl">🏏</div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2 p-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-slate-900">{listing.title}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {listing.category} · {CONDITION_META[listing.condition] || listing.condition} · {listing.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-base font-black gradient-text">Rs. {listing.price.toLocaleString()}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{listing.description}</p>

                    {listing.status === "REJECTED" && listing.rejectReason && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200/60 bg-red-50/60 px-3 py-2.5">
                        <svg className="mt-0.5 shrink-0 text-red-500" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-xs font-semibold text-red-700">Rejected: {listing.rejectReason}</p>
                      </div>
                    )}

                    {listing.status === "PENDING" && (
                      <p className="mt-2 text-xs font-semibold text-amber-600">⏳ Awaiting admin verification</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100/60 pt-3">
                    <p className="text-xs text-slate-400">
                      {new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2">
                      {listing.status === "APPROVED" && (
                        <Link
                          to={`/listings/${listing.id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}
                        >
                          View live →
                        </Link>
                      )}
                      <button
                        onClick={() => deleteListing(listing.id, listing.title)}
                        className="rounded-lg border border-red-200/60 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

export default MyListings;
