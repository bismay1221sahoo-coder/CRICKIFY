import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "-");

function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadListing = async () => {
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

    loadListing();
  }, [id]);

  const media = useMemo(() => listing?.media || [], [listing]);

  if (loading) {
    return <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">Loading listing details...</main>;
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Listing not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-6">
        <Link to="/" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Back to Marketplace
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-emerald-100 bg-white/95 p-5 shadow-sm">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-sky-50">
            {activeMedia ? (
              activeMedia.type === "VIDEO" ? (
                <video src={activeMedia.url} controls className="h-full w-full object-cover" />
              ) : (
                <img src={activeMedia.url} alt={listing.title} className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">No media available</div>
            )}
          </div>

          {media.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className={`aspect-square overflow-hidden rounded-lg border ${
                    activeMedia?.id === item.id ? "border-emerald-400" : "border-emerald-100"
                  }`}
                >
                  {item.type === "VIDEO" ? (
                    <div className="flex h-full items-center justify-center bg-slate-900 text-xs font-bold text-white">VIDEO</div>
                  ) : (
                    <img src={item.url} alt={listing.title} className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </article>

        <aside className="rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Admin Verified</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">{listing.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{listing.city}</p>
            </div>
            <p className="text-3xl font-black text-sky-700">Rs. {listing.price}</p>
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-sm">
            <p>
              <span className="font-bold text-slate-800">Category:</span> {formatLabel(listing.category)}
            </p>
            <p>
              <span className="font-bold text-slate-800">Condition:</span> {formatLabel(listing.condition)}
            </p>
            <p>
              <span className="font-bold text-slate-800">Used Duration:</span> {listing.usedDuration}
            </p>
            <p>
              <span className="font-bold text-slate-800">Defects:</span> {listing.defects}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-900">Description</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{listing.description}</p>
          </div>

          <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-sky-700">Seller Contact</h2>
            <p className="mt-2 text-base font-semibold text-slate-900">{listing.seller?.name || "Seller"}</p>
            <p className="text-sm text-slate-700">{listing.seller?.city || listing.city}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Phone: {listing.seller?.phone || "Contact details will be shared by seller"}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ListingDetails;
