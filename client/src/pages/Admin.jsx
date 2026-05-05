import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function Admin() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPendingListings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/admin/listings/pending");
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPendingListings(); }, []);

  const approveListing = async (id) => {
    try {
      await apiRequest(`/api/admin/listings/${id}/approve`, { method: "PATCH" });
      loadPendingListings();
    } catch (err) {
      setError(err.message);
    }
  };

  const rejectListing = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await apiRequest(`/api/admin/listings/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      loadPendingListings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      {/* Blob */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #fde68a, transparent)" }} />

      {/* Header */}
      <div className="fade-in-up mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 backdrop-blur-sm">
            Admin panel
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Pending listings</h1>
          <p className="mt-1 text-sm text-slate-500">Review and verify submitted equipment listings.</p>
        </div>
        {!loading && (
          <div className="glass shrink-0 rounded-2xl px-6 py-4 text-center shadow-md">
            <p className="text-3xl font-black" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {listings.length}
            </p>
            <p className="text-xs font-semibold text-slate-500">Pending</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass overflow-hidden rounded-2xl">
              <div className="flex gap-0">
                <div className="shimmer h-32 w-36 shrink-0" />
                <div className="flex-1 p-5 grid gap-3">
                  <div className="shimmer h-5 w-1/2 rounded-lg" />
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-4 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && listings.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center shadow-md">
          <div className="float mx-auto mb-4 text-5xl">✅</div>
          <h2 className="text-xl font-black text-slate-900">All caught up!</h2>
          <p className="mt-2 text-sm text-slate-500">No listings pending verification right now.</p>
        </div>
      )}

      {/* Listing cards */}
      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing.media?.find((m) => m.type === "IMAGE");
          return (
            <article
              key={listing.id}
              className="glass card-hover overflow-hidden rounded-2xl shadow-sm"
            >
              <div className="flex">
                {/* Thumbnail strip */}
                <div className="relative h-auto w-36 shrink-0 overflow-hidden bg-slate-100 sm:w-44">
                  {cover ? (
                    <img src={cover.url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <div className="flex h-full min-h-[130px] items-center justify-center text-3xl">🏏</div>
                  )}
                  {listing.media?.length > 1 && (
                    <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      +{listing.media.length - 1}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">{listing.title}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {listing.category} · {listing.condition.replace(/_/g, " ")} · {listing.city}
                        </p>
                      </div>
                      <p className="text-lg font-black gradient-text">
                        Rs. {listing.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{listing.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        <span className="font-semibold text-slate-700">Defects:</span> {listing.defects}
                      </span>
                      <span>
                        <span className="font-semibold text-slate-700">Seller:</span> {listing.seller?.name}
                        {listing.seller?.phone ? ` · ${listing.seller.phone}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveListing(listing.id)}
                      className="btn-primary px-5 py-2 text-sm"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectListing(listing.id)}
                      className="glass rounded-xl border border-red-200/60 px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-50/80 hover:border-red-300 transition-all duration-200"
                    >
                      ✕ Reject
                    </button>
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

export default Admin;
