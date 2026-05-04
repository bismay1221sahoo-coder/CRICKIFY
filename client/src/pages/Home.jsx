import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

const CONDITION_COLORS = {
  LIKE_NEW: "bg-emerald-100 text-emerald-700",
  GOOD: "bg-sky-100 text-sky-700",
  FAIR: "bg-amber-100 text-amber-700",
  NEEDS_REPAIR: "bg-red-100 text-red-600",
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
      {/* Hero */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Verified cricket marketplace
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Buy & sell used<br />
                <span className="text-emerald-700">cricket gear</span> locally.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500">
                Every listing is manually verified by our admin before going live. No scams, no surprises — just trusted second-hand cricket equipment.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                >
                  List your gear
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <a
                  href="#listings"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Browse listings
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "100%", label: "Admin verified", color: "text-emerald-700" },
                { value: "Local", label: "City-level focus", color: "text-sky-700" },
                { value: "Free", label: "No listing fee", color: "text-violet-700" },
                { value: "Safe", label: "No payment needed", color: "text-amber-600" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters((c) => ({ ...c, category: "" }))}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                filters.category === ""
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters((c) => ({ ...c, category: c.category === cat ? "" : cat }))}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  filters.category === cat
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={filters.city}
              onChange={(e) => setFilters((c) => ({ ...c, city: e.target.value }))}
              placeholder="Search by city..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 sm:w-52"
            />
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white">
                <div className="aspect-[4/3] rounded-t-2xl bg-slate-100" />
                <div className="p-5 grid gap-3">
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🏏
            </div>
            <h2 className="text-xl font-black text-slate-900">No listings found</h2>
            <p className="mt-2 text-sm text-slate-500">
              {filters.category || filters.city
                ? "Try clearing your filters."
                : "Approved equipment will appear here after admin verification."}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const cover = listing.media?.find((m) => m.type === "IMAGE");
            const conditionClass = CONDITION_COLORS[listing.condition] || "bg-slate-100 text-slate-600";

            return (
              <article
                key={listing.id}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {cover ? (
                    <img
                      src={cover.url}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🏏</div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-sky-700 shadow backdrop-blur-sm">
                      Rs. {listing.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-900">{listing.title}</h2>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.34 1 2 2.34 2 4c0 2.5 3 5 3 5s3-2.5 3-5c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2"/><circle cx="5" cy="4" r="1" fill="currentColor"/></svg>
                        {listing.city}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                      {listing.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${conditionClass}`}>
                      {listing.condition.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{listing.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">
                      by {listing.seller?.name}
                    </p>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
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
