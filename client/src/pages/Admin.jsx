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

  useEffect(() => {
    loadPendingListings();
  }, []);

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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            Admin panel
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Pending listings</h1>
          <p className="mt-1 text-sm text-slate-500">Review and verify submitted equipment listings.</p>
        </div>
        {!loading && (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-center shadow-sm">
            <p className="text-2xl font-black text-amber-600">{listings.length}</p>
            <p className="text-xs font-semibold text-slate-500">Pending</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex gap-4">
                <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-100" />
                <div className="flex-1 grid gap-2">
                  <div className="h-5 w-1/2 rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            ✅
          </div>
          <h2 className="text-xl font-black text-slate-900">All caught up!</h2>
          <p className="mt-2 text-sm text-slate-500">No listings pending verification right now.</p>
        </div>
      )}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing.media?.find((m) => m.type === "IMAGE");
          return (
            <article
              key={listing.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="flex gap-0">
                {/* Thumbnail */}
                <div className="h-auto w-32 shrink-0 bg-slate-100 sm:w-40">
                  {cover ? (
                    <img src={cover.url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center text-2xl">🏏</div>
                  )}
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
                      <p className="text-lg font-black text-emerald-700">Rs. {listing.price.toLocaleString()}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{listing.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
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
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectListing(listing.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
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
