import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

const formatLabel = (v) => (v ? v.replaceAll("_", " ") : "-");

const CONDITION_COLORS = {
  LIKE_NEW: "bg-emerald-100 text-emerald-700",
  GOOD: "bg-sky-100 text-sky-700",
  FAIR: "bg-amber-100 text-amber-700",
  NEEDS_REPAIR: "bg-red-100 text-red-600",
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
          <div className="animate-pulse rounded-2xl bg-slate-100 aspect-[4/3]" />
          <div className="grid gap-4 animate-pulse">
            <div className="h-8 w-3/4 rounded-xl bg-slate-100" />
            <div className="h-5 w-1/2 rounded-xl bg-slate-100" />
            <div className="h-32 rounded-xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="font-bold text-red-700">{error || "Listing not found."}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const conditionClass = CONDITION_COLORS[listing.condition] || "bg-slate-100 text-slate-600";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* Media */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            {activeMedia ? (
              activeMedia.type === "VIDEO" ? (
                <video src={activeMedia.url} controls className="h-full w-full object-cover" />
              ) : (
                <img src={activeMedia.url} alt={listing.title} className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">🏏</div>
            )}
          </div>

          {media.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className={`shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeMedia?.id === item.id
                      ? "border-emerald-500"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  {item.type === "VIDEO" ? (
                    <div className="flex h-full items-center justify-center bg-slate-900 text-[10px] font-bold text-white">
                      ▶ VIDEO
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid gap-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    ✓ Admin Verified
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${conditionClass}`}>
                    {formatLabel(listing.condition)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                    {listing.category}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{listing.title}</h1>
                <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.34 1 3 2.34 3 4c0 2.5 3 7 3 7s3-4.5 3-7c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="4" r="1.2" fill="currentColor"/></svg>
                  {listing.city}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-3xl font-black text-emerald-700">Rs. {listing.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Used for</p>
                <p className="mt-1 font-semibold text-slate-800">{listing.usedDuration}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Defects</p>
                <p className="mt-1 font-semibold text-slate-800">{listing.defects}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase text-slate-400">Description</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{listing.description}</p>
            </div>
          </div>

          {/* Seller contact */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-3">Contact Seller</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">
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
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2.5C2 2.5 3 1 4.5 1c.5 0 1 .5 1.5 1.5L7 4.5c.5 1 0 1.5-.5 2-.5.5-1 1 0 2.5s2 2 2.5 1.5c.5-.5 1-1 2-.5l2 1c1 .5 1.5 1 1.5 1.5 0 1.5-1.5 2.5-1.5 2.5C4 16 -2 4 2 2.5z" stroke="currentColor" strokeWidth="1.2"/></svg>
                Call {listing.seller.phone}
              </a>
            ) : (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center text-xs font-semibold text-slate-500">
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
