import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60" },
  GOOD:     { label: "Good",     cls: "bg-sky-100/80 text-sky-700 border border-sky-200/60" },
  FAIR:     { label: "Fair",     cls: "bg-amber-100/80 text-amber-700 border border-amber-200/60" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-100/80 text-red-600 border border-red-200/60" },
};

function Home() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ category: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set("category", filters.category);
        if (filters.city) params.set("city", filters.city);
        const data = await apiRequest(`/api/listings?${params.toString()}`);
        setListings(data.listings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/40 py-14 lg:py-20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-center">
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Verified cricket marketplace
              </span>

              <h1 className="mt-6 text-5xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Buy & sell used<br />
                <span className="gradient-text">cricket gear</span><br />
                <span className="text-slate-400 text-4xl sm:text-5xl lg:text-6xl font-black">locally.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-500">
                Every listing is manually verified by our admin before going live. No scams, no surprises — just trusted second-hand cricket equipment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/sell" className="btn-primary">
                  List your gear
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a href="#listings"
                  className="glass inline-flex items-center rounded-xl px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white/80 transition-all duration-200">
                  Browse listings
                </a>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "100%", label: "Admin verified", gradient: "from-emerald-500 to-teal-500" },
                { value: "Local", label: "City-level focus", gradient: "from-sky-500 to-blue-500" },
                { value: "Free", label: "No listing fee", gradient: "from-violet-500 to-purple-500" },
                { value: "Safe", label: "No payment needed", gradient: "from-amber-500 to-orange-500" },
              ].map((stat, i) => (
                <div key={stat.label}
                  className="glass card-hover relative overflow-hidden rounded-2xl p-5"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                  <p className={`text-2xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Listings ── */}
      <section id="listings" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">

        {/* Filter bar */}
        <div className="glass mb-8 rounded-2xl p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilters((c) => ({ ...c, category: "" }))}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  filters.category === ""
                    ? "bg-slate-900 text-white shadow-md"
                    : "glass text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters((c) => ({ ...c, category: c.category === cat ? "" : cat }))}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                    filters.category === cat
                      ? "text-white shadow-md glow-emerald"
                      : "glass text-slate-600 hover:text-emerald-700"
                  }`}
                  style={filters.category === cat
                    ? { background: "linear-gradient(135deg, #059669, #0d9488)" }
                    : {}}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={filters.city}
                onChange={(e) => setFilters((c) => ({ ...c, city: e.target.value }))}
                placeholder="Search by city..."
                className="input-field pl-9 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass overflow-hidden rounded-2xl">
                <div className="shimmer aspect-[4/3]" />
                <div className="p-5 grid gap-3">
                  <div className="shimmer h-5 w-3/4 rounded-lg" />
                  <div className="shimmer h-4 w-1/2 rounded-lg" />
                  <div className="shimmer h-4 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass rounded-xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <p className="mb-5 text-sm font-semibold text-slate-500">
            {listings.length === 0
              ? "No listings found"
              : `${listings.length} listing${listings.length !== 1 ? "s" : ""} found`}
            {filters.category && <span className="ml-1 text-emerald-700">in {filters.category}</span>}
            {filters.city && <span className="ml-1 text-sky-700">near "{filters.city}"</span>}
          </p>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="float mx-auto mb-4 text-5xl">🏏</div>
            <h2 className="text-xl font-black text-slate-900">No listings found</h2>
            <p className="mt-2 text-sm text-slate-500">
              {filters.category || filters.city
                ? "Try clearing your filters."
                : "Approved equipment will appear here after admin verification."}
            </p>
            {!filters.category && !filters.city && (
              <Link to="/sell" className="btn-primary mt-6 inline-flex px-6 py-3">
                Be the first to list gear →
              </Link>
            )}
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const cover = listing.media?.find((m) => m.type === "IMAGE");
            const cond = CONDITION_META[listing.condition] || { label: listing.condition, cls: "bg-slate-100 text-slate-600" };

            return (
              <article
                key={listing.id}
                className="glass card-hover group overflow-hidden rounded-2xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {cover ? (
                    <img
                      src={cover.url}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-sky-50">
                      <span className="text-4xl">🏏</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">No photo</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur-sm"
                      style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                      ✓ Verified
                    </span>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className="glass rounded-full px-2.5 py-1 text-xs font-black text-sky-700 shadow backdrop-blur-md">
                      Rs. {listing.price.toLocaleString()}
                    </span>
                  </div>

                  {/* View button on hover */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="glass-dark rounded-xl px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h2 className="truncate text-base font-black text-slate-900">{listing.title}</h2>
                  {listing.brand && (
                    <p className="mt-0.5 text-xs font-semibold text-emerald-700">{listing.brand}</p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1C3.34 1 2 2.34 2 4c0 2.5 3 5 3 5s3-2.5 3-5c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="5" cy="4" r="1" fill="currentColor" />
                    </svg>
                    {listing.city}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600 backdrop-blur-sm">
                      {listing.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur-sm ${cond.cls}`}>
                      {cond.label}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{listing.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-4">
                    <p className="text-xs font-semibold text-slate-500">by {listing.seller?.name}</p>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:shadow-md"
                      style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Home;
