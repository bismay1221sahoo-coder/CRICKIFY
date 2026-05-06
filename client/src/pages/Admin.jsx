import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function Admin() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, listingId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const loadPendingListings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/admin/listings/pending");
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (err) {
      setError(err.message);
      setListings([]);
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

  const openRejectModal = (id) => {
    setRejectModal({ open: true, listingId: id });
    setRejectReason("");
  };

  const closeRejectModal = () => {
    if (rejectSubmitting) return;
    setRejectModal({ open: false, listingId: null });
    setRejectReason("");
  };

  const rejectListing = async () => {
    const reason = rejectReason.trim();
    if (!reason || !rejectModal.listingId) return;
    setRejectSubmitting(true);
    try {
      await apiRequest(`/api/admin/listings/${rejectModal.listingId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      closeRejectModal();
      loadPendingListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setRejectSubmitting(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #fde68a, transparent)" }} />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 backdrop-blur-sm">
            Admin panel
          </span>
          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Pending listings</h1>
          <p className="mt-1 text-sm text-slate-500">Review and verify submitted equipment listings.</p>
        </div>
        {!loading && (
          <div className="glass w-fit rounded-2xl px-6 py-4 text-center shadow-md">
            <p className="text-3xl font-black" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {listings.length}
            </p>
            <p className="text-xs font-semibold text-slate-500">Pending</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass overflow-hidden rounded-2xl">
              <div className="flex flex-col sm:flex-row">
                <div className="shimmer h-40 w-full sm:h-32 sm:w-36" />
                <div className="grid flex-1 gap-3 p-5">
                  <div className="shimmer h-5 w-1/2 rounded-lg" />
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-4 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center shadow-md">
          <h2 className="text-xl font-black text-slate-900">All caught up</h2>
          <p className="mt-2 text-sm text-slate-500">No listings pending verification right now.</p>
        </div>
      )}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing?.media?.find((m) => m?.type === "IMAGE" && m?.url);
          const safePrice = Number.isFinite(listing?.price) ? listing.price : Number(listing?.price) || 0;
          const safeCondition = (listing?.condition || "UNKNOWN").replace(/_/g, " ");

          return (
            <article key={listing?.id || listing?.title} className="glass card-hover overflow-hidden rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-44">
                  {cover ? (
                    <img
                      src={cover.url}
                      alt={listing?.title || "Listing"}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-44 w-full object-cover transition-transform duration-500 hover:scale-110 sm:h-full"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm font-semibold text-slate-500 sm:h-full">No image</div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">{listing?.title || "Untitled listing"}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {listing?.category || "Unknown"} · {safeCondition} · {listing?.city || "Unknown city"}
                        </p>
                      </div>
                      <p className="text-lg font-black gradient-text">Rs. {safePrice.toLocaleString()}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{listing?.description || "No description provided."}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span><span className="font-semibold text-slate-700">Defects:</span> {listing?.defects || "-"}</span>
                      <span><span className="font-semibold text-slate-700">Seller:</span> {listing?.seller?.name || "Unknown"}{listing?.seller?.phone ? ` · ${listing.seller.phone}` : ""}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => approveListing(listing.id)} className="btn-primary px-5 py-2 text-sm">Approve</button>
                    <button onClick={() => openRejectModal(listing.id)} className="glass rounded-xl border border-red-200/60 px-5 py-2 text-sm font-bold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50/80">Reject</button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-5 shadow-2xl sm:p-6">
            <h3 className="text-lg font-black text-slate-900">Reject listing</h3>
            <p className="mt-1 text-sm text-slate-500">Give a clear reason. This will be shown to the seller.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="input-field mt-4 resize-none"
              placeholder="Example: Images are unclear, missing product condition details, etc."
              disabled={rejectSubmitting}
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectModal}
                className="glass rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-white/80"
                disabled={rejectSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={rejectListing}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={rejectSubmitting || !rejectReason.trim()}
              >
                {rejectSubmitting ? "Rejecting..." : "Reject listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin;
