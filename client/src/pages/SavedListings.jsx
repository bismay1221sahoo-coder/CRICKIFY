import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, ShoppingBag, Trash2 } from "lucide-react";
import { apiRequest } from "../lib/api";
import CategoryIcon from "../components/CategoryIcon";

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "chip-brand-soft" },
  GOOD: { label: "Good", cls: "chip-neutral" },
  FAIR: { label: "Fair", cls: "chip-warn" },
  NEEDS_REPAIR: { label: "Repair Needed", cls: "chip-danger" },
};

function SavedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/listings/saved");
        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeSaved = async (id) => {
    setListings((current) => current.filter((listing) => listing.id !== id));
    try {
      await apiRequest(`/api/listings/${id}/save`, { method: "DELETE" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-canvas py-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="chip chip-brand-soft mb-3">
              <Heart size={13} fill="currentColor" /> Saved Gear
            </span>
            <h1 className="text-4xl font-black text-ink">Your saved listings</h1>
            <p className="mt-2 text-sm font-bold text-muted">Keep track of gear you want to revisit.</p>
          </div>
          <Link to="/categories/ALL" className="btn-ghost px-6 py-3">
            Browse Marketplace
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger-ink">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="surface-card overflow-hidden">
                <div className="shimmer aspect-[4/3]" />
                <div className="space-y-3 p-5">
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="surface-card py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 text-faint">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-black text-ink">No saved gear yet</h2>
            <p className="mt-2 text-sm font-bold text-muted">Tap the heart on listings you like.</p>
            <Link to="/categories/ALL" className="btn-primary mt-8 px-8">
              Find Gear
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const photo = listing?.media?.find((item) => item.type === "IMAGE")?.url;
              const cond = CONDITION_META[listing?.condition] || { label: listing?.condition, cls: "chip-neutral" };
              const price = Number(listing?.price || 0);

              return (
                <article key={listing.id} className="surface-card group overflow-hidden">
                  <Link to={`/listings/${listing.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                      {photo ? (
                        <img src={photo} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-faint">
                          <CategoryIcon name={listing.category} size={44} />
                        </div>
                      )}
                      <span className="chip chip-brand absolute left-3 top-3 shadow-lg">Verified</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="truncate text-base font-black text-ink">{listing.title}</h2>
                        <div className="text-right">
                          <p className="text-lg font-black text-brand">₹{price.toLocaleString()}</p>
                          {listing.negotiable && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-faint">Negotiable</p>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                        <MapPin size={12} /> {listing.city}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                        <span className={`chip ${cond.cls}`}>{cond.label}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-faint">{listing.category}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t border-line p-3">
                    <button onClick={() => removeSaved(listing.id)} className="btn-ghost w-full border-danger py-2 text-xs text-danger hover:bg-danger/10">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default SavedListings;
