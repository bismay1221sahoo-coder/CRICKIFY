import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { apiRequest } from "../lib/api";
import CategoryIcon from "../components/CategoryIcon";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CATEGORY_META = {
  ALL: { label: "All Gear", desc: "Browse every verified listing", bgImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400" },
  BAT: { label: "Bats", desc: "English & Kashmir Willow", bgImage: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=1400" },
  GLOVES: { label: "Gloves", desc: "Batting & Keeping protection", bgImage: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1400" },
  PADS: { label: "Pads", desc: "Lightweight leg guards", bgImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400" },
  HELMET: { label: "Helmets", desc: "Safety certified headwear", bgImage: "https://images.unsplash.com/photo-1589188734056-cb8293963884?q=80&w=1400" },
  SHOES: { label: "Shoes", desc: "Spikes & field shoes", bgImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400" },
  KIT: { label: "Full Kits", desc: "Complete sets for players", bgImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400" },
  OTHER: { label: "Accessories", desc: "Grips, balls, and more", bgImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400" },
};

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "chip-brand-soft" },
  GOOD: { label: "Good", cls: "chip-neutral" },
  FAIR: { label: "Fair", cls: "chip-warn" },
  NEEDS_REPAIR: { label: "Repair Needed", cls: "chip-danger" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

function CategoryListings() {
  const { category } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [debouncedMin, setDebouncedMin] = useState("");
  const [debouncedMax, setDebouncedMax] = useState("");

  const categoryKey = (category || "ALL").toUpperCase();
  const isValidCategory = categoryKey === "ALL" || CATEGORIES.includes(categoryKey);
  const meta = CATEGORY_META[categoryKey] || CATEGORY_META.ALL;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(cityFilter.trim()), 350);
    return () => clearTimeout(timer);
  }, [cityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMin(minPrice.trim()), 350);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMax(maxPrice.trim()), 350);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  useEffect(() => {
    if (!isValidCategory) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (categoryKey !== "ALL") params.set("category", categoryKey);
        if (debouncedCity) params.set("city", debouncedCity);
        if (conditionFilter) params.set("condition", conditionFilter);
        if (debouncedMin) params.set("minPrice", debouncedMin);
        if (debouncedMax) params.set("maxPrice", debouncedMax);
        if (sort) params.set("sort", sort);
        const data = await apiRequest(`/api/listings?${params.toString()}`);
        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryKey, debouncedCity, conditionFilter, debouncedMin, debouncedMax, sort, isValidCategory]);

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <section className="relative bg-ink py-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={meta.bgImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Marketplace
          </Link>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-lg">
                <CategoryIcon name={categoryKey} size={32} />
             </div>
             <div>
                <h1 className="text-4xl font-black sm:text-5xl">{meta.label}</h1>
                <p className="mt-2 text-slate-300 font-bold">{meta.desc}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Filter by city..."
                  className="input-field w-full py-2 pl-9 text-xs sm:w-48"
                />
              </div>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="input-field py-2 text-xs sm:w-40"
              >
                <option value="">All Conditions</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="NEEDS_REPAIR">Needs Repair</option>
              </select>
              <div className="flex items-center gap-1">
                 <input
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    type="number"
                    className="input-field w-20 py-2 text-xs"
                  />
                  <span className="text-line">-</span>
                  <input
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    type="number"
                    className="input-field w-20 py-2 text-xs"
                  />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line pt-4 lg:border-0 lg:pt-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-faint">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field py-2 text-xs sm:w-48"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Listing Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-4 text-sm font-bold text-danger-ink">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="surface-card overflow-hidden">
                <div className="shimmer aspect-[4/3]" />
                <div className="p-5 space-y-3">
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line py-24 text-center">
             <div className="mb-4 rounded-full bg-surface-2 p-6 text-faint">
                <Search size={40} />
             </div>
            <h2 className="text-xl font-black text-ink">No gear found</h2>
            <p className="mt-2 text-muted">Try adjusting your filters or search criteria.</p>
            <button onClick={() => { setCityFilter(""); setConditionFilter(""); setMinPrice(""); setMaxPrice(""); }} className="btn-ghost mt-6 px-8">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const photo = listing?.media?.find(m => m.type === "IMAGE")?.url;
              const cond = CONDITION_META[listing?.condition] || { label: listing?.condition, cls: "chip-neutral" };
              const price = Number(listing?.price || 0);

              return (
                <Link 
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="surface-card card-hover group overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                    {photo ? (
                      <img
                        src={photo}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-faint">
                        <CategoryIcon name={listing.category} size={48} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className="chip chip-brand shadow-lg">Verified</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="truncate text-base font-black text-ink">{listing.title}</h3>
                      <p className="text-lg font-black text-brand shrink-0">₹{price.toLocaleString()}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                      <MapPin size={12} /> {listing.city}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <span className={`chip ${cond.cls}`}>{cond.label}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-faint">
                        by {listing?.seller?.name?.split(" ")[0] || "Seller" }
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default CategoryListings;
