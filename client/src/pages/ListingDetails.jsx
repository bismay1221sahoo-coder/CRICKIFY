import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { parseListingDescription } from "../lib/listingDescription";

const formatLabel = (v) => (v ? v.replaceAll("_", " ") : "-");
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const renderTextWithLinks = (text = "") =>
  text.split(URL_REGEX).map((part, index) => {
    if (!part.match(URL_REGEX)) return <span key={`txt-${index}`}>{part}</span>;
    return (
      <a
        key={`url-${index}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-semibold text-sky-700 underline"
      >
        {part}
      </a>
    );
  });

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD: { label: "Good", cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR: { label: "Fair", cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportToast, setReportToast] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/listings/${id}`);
        setListing(data.listing);
        setActiveMedia(data.listing?.media?.[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const media = useMemo(() => listing?.media || [], [listing]);
  const { cleanDescription, proofUrls, proofReason } = useMemo(
    () => parseListingDescription(listing?.description),
    [listing?.description]
  );
  const isImageActive = activeMedia?.type !== "VIDEO" && Boolean(activeMedia?.url);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="shimmer aspect-[4/3] rounded-2xl" />
          <div className="grid gap-4">
            <div className="shimmer h-8 w-3/4 rounded-xl" />
            <div className="shimmer h-5 w-1/2 rounded-xl" />
            <div className="shimmer h-32 rounded-xl" />
            <div className="shimmer h-24 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="glass rounded-2xl border border-red-200/60 p-10 text-center">
          <p className="font-bold text-red-700">{error || "Listing not found."}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const cond = CONDITION_META[listing.condition] || { label: formatLabel(listing.condition), cls: "bg-slate-100 text-slate-600" };
  const safePrice = Number.isFinite(listing?.price) ? listing.price : Number(listing?.price) || 0;

  const submitReport = async () => {
    const reason = reportReason.trim();
    if (reason.length < 10) {
      setReportToast("Please enter at least 10 characters.");
      return;
    }
    setReportSubmitting(true);
    try {
      await apiRequest(`/api/listings/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setReportToast("Report submitted. Thank you.");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      setReportToast(err.message);
    } finally {
      setReportSubmitting(false);
      setTimeout(() => setReportToast(""), 3500);
    }
  };

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />

      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:mb-6">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Marketplace
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8">
        <div className="glass rounded-2xl p-3 shadow-md sm:p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            {activeMedia ? (
              activeMedia.type === "VIDEO" ? (
                <video src={activeMedia.url} controls className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="h-full w-full cursor-zoom-in"
                  aria-label="Open full image"
                >
                  <img
                    src={activeMedia.url}
                    alt={listing.title}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">No media</div>
            )}
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur-sm" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                Admin Verified
              </span>
            </div>
          </div>

          {media.length > 1 && (
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">More photos</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMedia(item)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      activeMedia?.id === item.id ? "glow-emerald scale-105 border-emerald-500 shadow-md" : "border-transparent hover:scale-105 hover:border-slate-300"
                    }`}
                  >
                    {item.type === "VIDEO" ? (
                      <div className="glass-dark flex h-full items-center justify-center text-[10px] font-bold text-white">VIDEO</div>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:sticky lg:top-20">
          <div className="glass rounded-2xl p-4 shadow-md sm:p-6">
            <div className="mb-4 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                Verified
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur-sm ${cond.cls}`}>{cond.label}</span>
              <span className="rounded-full bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">{listing.category}</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight text-slate-900">{listing.title}</h1>
                {listing.brand && <p className="mt-1 text-sm font-semibold text-emerald-700">{listing.brand}</p>}
                <p className="mt-1.5 text-sm text-slate-500">{listing.city}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="gradient-text text-3xl font-black">Rs. {safePrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50/70 p-4 backdrop-blur-sm sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Used for</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{listing.usedDuration}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Defects</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{listing.defects}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{renderTextWithLinks(cleanDescription)}</p>
            </div>

            {(proofUrls.length > 0 || proofReason) && (
              <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Purchase Proof</p>
                {proofUrls.length > 0 ? (
                  <div className="mt-2 grid gap-1">
                    {proofUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm font-semibold text-sky-700 underline"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">{proofReason}</p>
                )}
              </div>
            )}
          </div>

          <div className="glass-emerald glow-emerald rounded-2xl p-5 shadow-md">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Contact Seller</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                {listing.seller?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <p className="font-bold text-slate-900">{listing.seller?.name || "Seller"}</p>
                <p className="text-xs text-slate-500">{listing.seller?.city || listing.city}</p>
              </div>
            </div>

            {listing.seller?.phone ? (
              <a href={`tel:${listing.seller.phone}`} className="btn-primary mt-4 w-full py-3">
                Call {listing.seller.phone}
              </a>
            ) : (
              <p className="mt-4 rounded-xl border border-emerald-200/60 bg-white/50 px-4 py-3 text-center text-xs font-semibold text-slate-500 backdrop-blur-sm">
                Contact details will be shared by seller
              </p>
            )}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="mt-3 w-full rounded-xl border border-red-200/70 bg-white/70 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              Report listing
            </button>
          </div>
        </div>
      </div>

      {reportToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="glass-emerald rounded-2xl px-5 py-3 text-sm font-bold text-emerald-800 shadow-xl">
            {reportToast}
          </div>
        </div>
      )}

      {lightboxOpen && isImageActive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white hover:bg-white/30"
          >
            Close
          </button>
          <img
            src={activeMedia.url}
            alt={listing.title}
            decoding="async"
            referrerPolicy="no-referrer"
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-5 shadow-2xl sm:p-6">
            <h3 className="text-lg font-black text-slate-900">Report listing</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tell us what is wrong with this listing. We review all reports.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="input-field mt-4 resize-none"
              placeholder="Example: Scam attempt, misleading photos, suspicious price, etc."
              disabled={reportSubmitting}
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="glass rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-white/80"
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={reportSubmitting || reportReason.trim().length < 10}
              >
                {reportSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ListingDetails;
