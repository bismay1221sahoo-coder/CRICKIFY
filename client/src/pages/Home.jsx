import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CATEGORY_META = {
  ALL:     { icon: "🏏", label: "All Gear",  gradient: "from-emerald-500 to-teal-500",  bg: "from-emerald-950/80 to-teal-900/80",    bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/thumbnail_IMG_1983_vzy0xp.jpg" },
  BAT:     { icon: "🏏", label: "Bats",      gradient: "from-amber-500 to-orange-500",  bg: "from-amber-950/80 to-orange-900/80",   bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/606010_DSC_1213_31Jan2024-scaled-e1709300843109_oqqrkq.webp" },
  GLOVES:  { icon: "🧤", label: "Gloves",    gradient: "from-sky-500 to-blue-600",      bg: "from-sky-950/80 to-blue-900/80",       bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923284/images_sd4ywb.jpg" },
  PADS:    { icon: "🦵", label: "Pads",      gradient: "from-violet-500 to-purple-600", bg: "from-violet-950/80 to-purple-900/80",  bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923286/image_c08621c8-3d28-4c6b-b792-4019c239bb5f_zlnfiq.webp" },
  HELMET:  { icon: "⛑️", label: "Helmets",   gradient: "from-red-500 to-rose-600",      bg: "from-red-950/80 to-rose-900/80",       bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923533/Cricket-Helmets_r8r873_c_crop_w_1000_h_340_wdoy4r.webp" },
  SHOES:   { icon: "👟", label: "Shoes",     gradient: "from-cyan-500 to-sky-600",      bg: "from-cyan-950/80 to-sky-900/80",       bgImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80" },
  KIT:     { icon: "🎒", label: "Full Kits", gradient: "from-lime-500 to-green-600",    bg: "from-lime-950/80 to-green-900/80",     bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/2CE-banner_ummbw1.webp" },
  OTHER:   { icon: "📦", label: "Other",     gradient: "from-slate-500 to-slate-600",   bg: "from-slate-800/80 to-slate-900/80",    bgImage: "https://res.cloudinary.com/dzlz0w47q/image/upload/v1777923285/cricket-equipment-sportswear-set-players-tool-vector-icons-field-bat-ball-helmet-wicket-stumps-shoe-uniform-gloves-tools-219002067_bjjcu6.webp" },
};

const CONDITION_META = {
  LIKE_NEW:     { label: "Like New",    cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD:         { label: "Good",        cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR:         { label: "Fair",        cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair",cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

const ALL_SECTIONS = ["ALL", ...CATEGORIES];

function CategorySection({ catKey, cityFilter }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[catKey];

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (catKey !== "ALL") params.set("category", catKey);
        if (cityFilter) params.set("city", cityFilter);
        const data = await apiRequest(`/api/listings?${params.toString()}`);
        setListings(data.listings);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, catKey, cityFilter]);

  const handleBannerClick = () => {
    setOpen(true);
    setTimeout(() => {
      document.getElementById(`cat-${catKey}-listings`)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section id={`cat-${catKey}`} className="relative overflow-hidden">
      {/* Category hero banner — clickable, text centered */}
      <button
        onClick={() => handleBannerClick()}
        className="group relative flex min-h-[42vh] w-full items-center justify-center overflow-hidden text-left"
      >
        {/* Background image */}
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

        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
          <span className="text-6xl drop-shadow-lg">{meta.icon}</span>
          <h2 className={`text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent drop-shadow-lg`}>
            {meta.label}
          </h2>
          <p className="text-sm font-semibold text-white/70">
            {loading ? "Loading..." : listings.length > 0
              ? `${listings.length} verified listing${listings.length !== 1 ? "s" : ""} — tap to browse`
              : "Tap to browse"}
          </p>
          {/* Arrow indicator */}
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4l5 6 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>

      {/* Listings — only shown after banner click */}
      {open && (
      <div id={`cat-${catKey}-listings`} className="px-4 py-8 sm:px-6 lg:px-10">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass overflow-hidden rounded-2xl">
                <div className="shimmer aspect-[4/3]" />
                <div className="p-4 grid gap-2">
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="flex items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm font-bold text-slate-400">No {meta.label.toLowerCase()} listed yet</p>
            <Link to="/sell" className="btn-primary px-4 py-2 text-xs">
              List first →
            </Link>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const cover = listing.media?.find((m) => m.type === "IMAGE");
              const cond = CONDITION_META[listing.condition] || { label: listing.condition, cls: "bg-slate-100 text-slate-600" };
              return (
                <article key={listing.id} className="glass card-hover group overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {cover ? (
                      <img src={cover.url} alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-sky-50">
                        <span className="text-4xl">{meta.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">No photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute left-2.5 top-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow backdrop-blur-sm"
                        style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                        ✓ Verified
                      </span>
                    </div>
                    <div className="absolute right-2.5 top-2.5">
                      <span className="glass rounded-full px-2 py-0.5 text-xs font-black text-sky-700 shadow backdrop-blur-md">
                        Rs. {listing.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-0 right-0 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link to={`/listings/${listing.id}`}
                        className="glass-dark rounded-xl px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        View Details →
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-black text-slate-900">{listing.title}</h3>
                    {listing.brand && <p className="mt-0.5 text-xs font-semibold text-emerald-700">{listing.brand}</p>}
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1C3.34 1 2 2.34 2 4c0 2.5 3 5 3 5s3-2.5 3-5c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="5" cy="4" r="1" fill="currentColor" />
                      </svg>
                      {listing.city}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${cond.cls}`}>
                        {cond.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100/60 pt-3">
                      <p className="text-xs text-slate-500">by {listing.seller?.name}</p>
                      <Link to={`/listings/${listing.id}`}
                        className="rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                        View →
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-4 sm:mx-6 lg:mx-10" />
    </section>
  );
}

function Home() {
  const [activeSection, setActiveSection] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const pillsRef = useRef(null);

  // Highlight pill based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveSection(id);
            // Scroll active pill into view
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/40 py-14 lg:py-20">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-center">
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Verified cricket marketplace
              </span>
              <h1 className="mt-6 text-5xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Buy & sell used<br />
                <span className="gradient-text">cricket gear</span><br />
                <span className="text-slate-400 text-4xl sm:text-5xl lg:text-6xl font-black">locally.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-500">
                Every listing is manually verified by our admin before going live. No scams, no surprises.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/sell" className="btn-primary">
                  List your gear
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <button onClick={() => scrollTo("ALL")}
                  className="glass inline-flex items-center rounded-xl px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white/80 transition-all duration-200">
                  Browse listings
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "100%", label: "Admin verified",   gradient: "from-emerald-500 to-teal-500" },
                { value: "Local", label: "City-level focus", gradient: "from-sky-500 to-blue-500" },
                { value: "Free",  label: "No listing fee",   gradient: "from-violet-500 to-purple-500" },
                { value: "Safe",  label: "No payment needed",gradient: "from-amber-500 to-orange-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass card-hover relative overflow-hidden rounded-2xl p-5">
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                  <p className={`text-2xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky nav strip ── */}
      <div className="sticky top-[57px] z-10 glass border-b border-white/40 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-10">
          <div ref={pillsRef} className="flex gap-2 overflow-x-auto scrollbar-none">
            {ALL_SECTIONS.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  data-cat={cat}
                  onClick={() => scrollTo(cat)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activeSection === cat
                      ? "text-white shadow-md"
                      : "glass text-slate-600 hover:text-slate-900"
                  }`}
                  style={activeSection === cat ? { background: `linear-gradient(135deg, ${getGradientColors(meta.gradient)})` } : {}}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
          <div className="relative shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="input-field pl-8 w-36 py-2 text-xs sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* ── Category sections ── */}
      {ALL_SECTIONS.map((cat) => (
        <CategorySection key={cat} catKey={cat} cityFilter={cityFilter} />
      ))}
    </main>
  );
}

// Helper to extract gradient colors for inline style
function getGradientColors(gradientClass) {
  const map = {
    "from-emerald-500 to-teal-500":   "#10b981, #14b8a6",
    "from-amber-500 to-orange-500":   "#f59e0b, #f97316",
    "from-sky-500 to-blue-600":       "#0ea5e9, #2563eb",
    "from-violet-500 to-purple-600":  "#8b5cf6, #9333ea",
    "from-red-500 to-rose-600":       "#ef4444, #e11d48",
    "from-cyan-500 to-sky-600":       "#06b6d4, #0284c7",
    "from-lime-500 to-green-600":     "#84cc16, #16a34a",
    "from-slate-500 to-slate-600":    "#64748b, #475569",
  };
  return map[gradientClass] || "#059669, #0d9488";
}

export default Home;
