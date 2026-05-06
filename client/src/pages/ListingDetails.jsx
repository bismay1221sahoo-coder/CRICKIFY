import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

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
        className="font-semibold text-sky-700 underline break-all"
      >
        {part}
      </a>
    );
  });

const CONDITION_META = {
  LIKE_NEW:     { label: "Like New",    cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD:         { label: "Good",        cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR:         { label: "Fair",        cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair",cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/listings/${id}`);
        setListing(data.listing);
        setActiveMedia(data.listing.media?.[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const media = useMemo(() => listing?.media || [], [listing]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="shimmer rounded-2xl aspect-[4/3]" />
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
          <div className="float text-4xl mb-3">😕</div>
          <p className="font-bold text-red-700">{error || "Listing not found."}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const cond = CONDITION_META[listing.condition] || { label: formatLabel(listing.condition), cls: "bg-slate-100 text-slate-600" };

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Blob */}
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />

      <Link to="/" className="fade-in-up inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* ── Media panel ── */}
        <div className="glass fade-in-up rounded-2xl p-4 shadow-md">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            {activeMedia ? (
              activeMedia.type === "VIDEO" ? (
                <video src={activeMedia.url} controls className="h-full w-full object-cover" />
              ) : (
                <img src={activeMedia.url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🏏</div>
            )}
            {/* Verified badge overlay */}
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur-sm"
                style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                ✓ Admin Verified
              </span>
            </div>
          </div>

          {media.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className={`shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeMedia?.id === item.id
                      ? "border-emerald-500 shadow-md glow-emerald scale-105"
                      : "border-transparent hover:border-slate-300 hover:scale-105"
                  }`}
                >
                  {item.type === "VIDEO" ? (
                    <div className="glass-dark flex h-full items-center justify-center text-[10px] font-bold text-white">▶</div>
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details panel ── */}
        <div className="grid gap-4 lg:sticky lg:top-20">
          {/* Main info */}
          <div className="glass fade-in-up rounded-2xl p-6 shadow-md">
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                ✓ Verified
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur-sm ${cond.cls}`}>
                {cond.label}
              </span>
              <span className="rounded-full bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                {listing.category}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight text-slate-900">{listing.title}</h1>
                {listing.brand && (
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{listing.brand}</p>
                )}
                <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1C4.34 1 3 2.34 3 4c0 2.5 3 7 3 7s3-4.5 3-7c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="6" cy="4" r="1.2" fill="currentColor" />
                  </svg>
                  {listing.city}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-3xl font-black gradient-text">Rs. {listing.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/70 p-4 backdrop-blur-sm">
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
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {renderTextWithLinks(listing.description)}
              </p>
            </div>
          </div>

          {/* Seller contact */}
          <div className="glass-emerald glow-emerald fade-in-up rounded-2xl p-5 shadow-md">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Contact Seller</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                {listing.seller?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <p className="font-bold text-slate-900">{listing.seller?.name || "Seller"}</p>
                <p className="text-xs text-slate-500">{listing.seller?.city || listing.city}</p>
              </div>
            </div>

            {listing.seller?.phone ? (
              <a
                href={`tel:${listing.seller.phone}`}
                className="btn-primary mt-4 w-full py-3"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2.5C2 2.5 3 1 4.5 1c.5 0 1 .5 1.5 1.5L7 4.5c.5 1 0 1.5-.5 2-.5.5-1 1 0 2.5s2 2 2.5 1.5c.5-.5 1-1 2-.5l2 1c1 .5 1.5 1 1.5 1.5 0 1.5-1.5 2.5-1.5 2.5C4 16 -2 4 2 2.5z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Call {listing.seller.phone}
              </a>
            ) : (
              <p className="mt-4 rounded-xl border border-emerald-200/60 bg-white/50 px-4 py-3 text-center text-xs font-semibold text-slate-500 backdrop-blur-sm">
                Contact details will be shared by seller
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ListingDetails;
