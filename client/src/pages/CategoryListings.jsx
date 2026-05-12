import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CATEGORY_META = {
  ALL: { label: "All Gear", gradient: "from-emerald-500 to-teal-500", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/thumbnail_IMG_1983_vzy0xp.jpg" },
  BAT: { label: "Bats", gradient: "from-amber-500 to-orange-500", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/606010_DSC_1213_31Jan2024-scaled-e1709300843109_oqqrkq.webp" },
  GLOVES: { label: "Gloves", gradient: "from-sky-500 to-blue-600", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923284/images_sd4ywb.jpg" },
  PADS: { label: "Pads", gradient: "from-violet-500 to-purple-600", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/image_c08621c8-3d28-4c6b-b792-4019c239bb5f_zlnfiq.webp" },
  HELMET: { label: "Helmets", gradient: "from-red-500 to-rose-600", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923533/Cricket-Helmets_r8r873_c_crop_w_1000_h_340_wdoy4r.webp" },
  SHOES: { label: "Shoes", gradient: "from-cyan-500 to-sky-600", bgImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80" },
  KIT: { label: "Full Kits", gradient: "from-lime-500 to-green-600", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/2CE-banner_ummbw1.webp" },
  OTHER: { label: "Other", gradient: "from-slate-500 to-slate-600", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/cricket-equipment-sportswear-set-players-tool-vector-icons-field-bat-ball-helmet-wicket-stumps-shoe-uniform-gloves-tools-219002067_bjjcu6.webp" },
};

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD: { label: "Good", cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR: { label: "Fair", cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const getCategoryKey = (categoryParam) => {
  if (!categoryParam) return "ALL";
  const normalized = categoryParam.toUpperCase();
  return normalized === "ALL" ? "ALL" : normalized;
};

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

  const categoryKey = getCategoryKey(category);
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

  const headerCopy = useMemo(() => {
    if (categoryKey === "ALL") return "Browse all verified listings in one place.";
    return `Browse verified ${meta.label.toLowerCase()} listings in your city.`;
  }, [categoryKey, meta.label]);

  const getListingPhotos = (listing) =>
    (listing?.media || []).filter((item) => item?.type === "IMAGE" && item?.url);

  if (!isValidCategory) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="glass rounded-2xl border border-red-200/70 p-10 text-center">
          <h1 className="text-xl font-black text-slate-900">Category not found</h1>
          <p className="mt-2 text-sm text-slate-500">Please choose a valid category.</p>
          <Link to="/" className="btn-primary mt-6 inline-flex px-5 py-2 text-sm">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${meta.bgImage})` }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-10">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            ← Back to marketplace
          </Link>
          <h1 className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${meta.gradient} bg-gradient-to-r bg-clip-text text-transparent`}>
            {meta.label}
          </h1>
          <p className="max-w-xl text-sm text-white/80 sm:text-base">{headerCopy}</p>
        </div>
      </section>

      <section className="sticky top-[57px] z-10 border-b border-white/40 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-2 sm:gap-3 sm:px-6 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr_1fr] lg:px-10">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="input-field py-2 text-xs"
          >
            <option value="">All conditions</option>
            <option value="LIKE_NEW">Like New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="NEEDS_REPAIR">Needs Repair</option>
          </select>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price"
            type="number"
            min="0"
            className="input-field py-2 text-xs"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price"
            type="number"
            min="0"
            className="input-field py-2 text-xs"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field py-2 text-xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="input-field w-full py-2 pl-8 text-xs"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass overflow-hidden rounded-2xl">
                <div className="shimmer aspect-[4/3]" />
                <div className="grid gap-2 p-4">
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-bold text-slate-400">No listings yet</p>
            <Link to="/sell" className="btn-primary px-4 py-2 text-xs">
              List first
            </Link>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const photos = getListingPhotos(listing);
              const firstPhoto = photos[0];
              const extraPhotoCount = Math.max(photos.length - 1, 0);
              const cond = CONDITION_META[listing?.condition] || { label: listing?.condition || "Unknown", cls: "bg-slate-100 text-slate-600" };
              const safePrice = Number.isFinite(listing?.price) ? listing.price : Number(listing?.price) || 0;
              return (
                <article key={listing?.id || listing?.title} className="glass card-hover group overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {firstPhoto ? (
                      <div className="relative h-full w-full overflow-hidden bg-slate-100">
                        <img
                          src={firstPhoto.url}
                          alt={listing?.title || "Listing"}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {extraPhotoCount > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-black text-white">
                            +{extraPhotoCount}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-sky-50">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">No photo</span>
                      </div>
                    )}

                    <div className="absolute left-2.5 top-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow backdrop-blur-sm" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                        Verified
                      </span>
                    </div>
                    <div className="absolute right-2.5 top-2.5">
                      <span className="glass rounded-full px-2 py-0.5 text-xs font-black text-sky-700 shadow backdrop-blur-md">
                        Rs. {safePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-black text-slate-900">{listing?.title || "Untitled listing"}</h3>
                    {listing?.brand && <p className="mt-0.5 text-xs font-semibold text-emerald-700">{listing.brand}</p>}
                    <p className="mt-0.5 text-xs text-slate-500">{listing?.city || "Unknown city"}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${cond.cls}`}>{cond.label}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100/60 pt-3">
                      <p className="text-xs text-slate-500">by {listing?.seller?.name || "Seller"}</p>
                      <Link to={`/listings/${listing.id}`} className="rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default CategoryListings;
