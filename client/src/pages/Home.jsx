import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CATEGORY_META = {
  ALL: { icon: "All", label: "All Gear", gradient: "from-emerald-500 to-teal-500", bg: "from-emerald-950/80 to-teal-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/thumbnail_IMG_1983_vzy0xp.jpg" },
  BAT: { icon: "Bat", label: "Bats", gradient: "from-amber-500 to-orange-500", bg: "from-amber-950/80 to-orange-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/606010_DSC_1213_31Jan2024-scaled-e1709300843109_oqqrkq.webp" },
  GLOVES: { icon: "Glv", label: "Gloves", gradient: "from-sky-500 to-blue-600", bg: "from-sky-950/80 to-blue-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923284/images_sd4ywb.jpg" },
  PADS: { icon: "Pad", label: "Pads", gradient: "from-violet-500 to-purple-600", bg: "from-violet-950/80 to-purple-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/image_c08621c8-3d28-4c6b-b792-4019c239bb5f_zlnfiq.webp" },
  HELMET: { icon: "Hlm", label: "Helmets", gradient: "from-red-500 to-rose-600", bg: "from-red-950/80 to-rose-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923533/Cricket-Helmets_r8r873_c_crop_w_1000_h_340_wdoy4r.webp" },
  SHOES: { icon: "Sho", label: "Shoes", gradient: "from-cyan-500 to-sky-600", bg: "from-cyan-950/80 to-sky-900/80", bgImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80" },
  KIT: { icon: "Kit", label: "Full Kits", gradient: "from-lime-500 to-green-600", bg: "from-lime-950/80 to-green-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/2CE-banner_ummbw1.webp" },
  OTHER: { icon: "Oth", label: "Other", gradient: "from-slate-500 to-slate-600", bg: "from-slate-800/80 to-slate-900/80", bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/cricket-equipment-sportswear-set-players-tool-vector-icons-field-bat-ball-helmet-wicket-stumps-shoe-uniform-gloves-tools-219002067_bjjcu6.webp" },
};

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD: { label: "Good", cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR: { label: "Fair", cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

const ALL_SECTIONS = ["ALL", ...CATEGORIES];

function CategorySection({ catKey, cityFilter, conditionFilter, minPrice, maxPrice, sort }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(() => catKey === "ALL");
  const meta = CATEGORY_META[catKey];

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (catKey !== "ALL") params.set("category", catKey);
        if (cityFilter) params.set("city", cityFilter);
        if (conditionFilter) params.set("condition", conditionFilter);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sort) params.set("sort", sort);
        const data = await apiRequest(`/api/listings?${params.toString()}`);
        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, catKey, cityFilter, conditionFilter, minPrice, maxPrice, sort]);

  const handleBannerClick = () => {
    setOpen(true);
    setTimeout(() => {
      document.getElementById(`cat-${catKey}-listings`)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section id={`cat-${catKey}`} className="relative overflow-hidden">
      <button
        onClick={handleBannerClick}
        className="group relative flex min-h-[30vh] w-full items-center justify-center overflow-hidden text-left sm:min-h-[36vh] lg:min-h-[42vh]"
      >
        {meta.bgImage ? (
          <>
            <div
              className="absolute inset-0 scale-100 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${meta.bgImage})` }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.bg}`} />
        )}

        <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center sm:gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white sm:text-sm">{meta.icon}</span>
          <h2 className={`bg-gradient-to-r ${meta.gradient} bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-lg sm:text-6xl lg:text-7xl`}>
            {meta.label}
          </h2>
          <p className="text-xs font-semibold text-white/70 sm:text-sm">
            {loading
              ? "Loading..."
              : listings.length > 0
                ? `${listings.length} verified listing${listings.length !== 1 ? "s" : ""} - tap to browse`
                : "Tap to browse"}
          </p>
        </div>
      </button>

      {open && (
        <div id={`cat-${catKey}-listings`} className="px-4 py-8 sm:px-6 lg:px-10">
          {loading && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
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
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-8 text-center sm:flex-row sm:gap-4">
              <p className="text-sm font-bold text-slate-400">No {meta.label.toLowerCase()} listed yet</p>
              <Link to="/sell" className="btn-primary px-4 py-2 text-xs">
                List first
              </Link>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => {
                const cover = listing?.media?.find((m) => m?.type === "IMAGE" && m?.url);
                const cond = CONDITION_META[listing?.condition] || { label: listing?.condition || "Unknown", cls: "bg-slate-100 text-slate-600" };
                const safePrice = Number.isFinite(listing?.price) ? listing.price : Number(listing?.price) || 0;
                return (
                  <article key={listing?.id || listing?.title} className="glass card-hover group overflow-hidden rounded-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={listing?.title || "Listing"}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
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
        </div>
      )}

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:mx-6 lg:mx-10" />
    </section>
  );
}

function Home() {
  const [activeSection, setActiveSection] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const [debouncedCityFilter, setDebouncedCityFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const pillsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCityFilter(cityFilter.trim()), 350);
    return () => clearTimeout(timer);
  }, [cityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMinPrice(minPrice.trim()), 350);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMaxPrice(maxPrice.trim()), 350);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveSection(id);
            const pill = pillsRef.current?.querySelector(`[data-cat="${id}"]`);
            pill?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
          }
        });
      },
      { threshold: 0.3 }
    );

    ALL_SECTIONS.forEach((cat) => {
      const el = document.getElementById(`cat-${cat}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (catKey) => {
    document.getElementById(`cat-${catKey}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/40 py-10 sm:py-14 lg:py-20">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-center lg:gap-12">
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 backdrop-blur-sm">
                Verified cricket marketplace
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-slate-950 sm:mt-6 sm:text-6xl lg:text-7xl">
                Buy & sell used
                <br />
                <span className="gradient-text">cricket gear</span>
                <br />
                <span className="text-3xl font-black text-slate-400 sm:text-5xl lg:text-6xl">locally.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-base">
                Every listing is manually verified by our admin before going live. No scams, no surprises.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
                <Link to="/sell" className="btn-primary">
                  List your gear
                </Link>
                <button onClick={() => scrollTo("ALL")} className="glass inline-flex items-center rounded-xl px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-white/80">
                  Browse listings
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "100%", label: "Admin verified", gradient: "from-emerald-500 to-teal-500" },
                { value: "Local", label: "City-level focus", gradient: "from-sky-500 to-blue-500" },
                { value: "Free", label: "No listing fee", gradient: "from-violet-500 to-purple-500" },
                { value: "Safe", label: "No payment needed", gradient: "from-amber-500 to-orange-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass card-hover relative overflow-hidden rounded-2xl p-4 sm:p-5">
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                  <p className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-xl font-black text-transparent sm:text-2xl`}>{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[57px] z-10 glass border-b border-white/40 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-10">
          <div ref={pillsRef} className="flex w-full gap-2 overflow-x-auto scrollbar-none lg:w-auto">
            {ALL_SECTIONS.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  data-cat={cat}
                  onClick={() => scrollTo(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activeSection === cat ? "text-white shadow-md" : "glass text-slate-600 hover:text-slate-900"
                  }`}
                  style={activeSection === cat ? { background: `linear-gradient(135deg, ${getGradientColors(meta.gradient)})` } : {}}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div className="relative w-full shrink-0 lg:w-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="input-field w-full py-2 pl-8 text-xs sm:w-44 lg:w-44"
            />
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 pb-3 sm:grid-cols-2 sm:gap-3 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] lg:px-10">
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
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {ALL_SECTIONS.map((cat) => (
        <CategorySection
          key={cat}
          catKey={cat}
          cityFilter={debouncedCityFilter}
          conditionFilter={conditionFilter}
          minPrice={debouncedMinPrice}
          maxPrice={debouncedMaxPrice}
          sort={sort}
        />
      ))}
    </main>
  );
}

function getGradientColors(gradientClass) {
  const map = {
    "from-emerald-500 to-teal-500": "#10b981, #14b8a6",
    "from-amber-500 to-orange-500": "#f59e0b, #f97316",
    "from-sky-500 to-blue-600": "#0ea5e9, #2563eb",
    "from-violet-500 to-purple-600": "#8b5cf6, #9333ea",
    "from-red-500 to-rose-600": "#ef4444, #e11d48",
    "from-cyan-500 to-sky-600": "#06b6d4, #0284c7",
    "from-lime-500 to-green-600": "#84cc16, #16a34a",
    "from-slate-500 to-slate-600": "#64748b, #475569",
  };
  return map[gradientClass] || "#059669, #0d9488";
}

export default Home;
