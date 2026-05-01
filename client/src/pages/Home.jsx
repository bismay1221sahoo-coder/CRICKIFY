import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const categories = ["", "BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];

function Home() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ category: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadListings = async () => {
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

    loadListings();
  }, [filters]);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-semibold uppercase text-emerald-700">Verified cricket marketplace</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-slate-950">
            Affordable used cricket gear, checked before it goes live.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid gap-3 md:grid-cols-[220px_1fr]">
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
          >
            {categories.map((category) => (
              <option key={category || "ALL"} value={category}>
                {category ? category.replace("_", " ") : "All categories"}
              </option>
            ))}
          </select>
          <input
            value={filters.city}
            onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
            placeholder="Search city"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {loading && <p className="text-slate-600">Loading listings...</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-black text-slate-950">No verified listings yet</h2>
            <p className="mt-2 text-slate-600">Approved equipment will appear here after admin verification.</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const cover = listing.media?.find((item) => item.type === "IMAGE");

            return (
              <article key={listing.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-200">
                  {cover ? (
                    <img src={cover.url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                      CRICKIFY VERIFIED
                    </div>
                  )}
                </div>
                <div className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{listing.title}</h2>
                      <p className="text-sm text-slate-600">{listing.city}</p>
                    </div>
                    <p className="shrink-0 text-lg font-black text-emerald-700">Rs. {listing.price}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Admin Verified</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{listing.condition.replace("_", " ")}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600">{listing.description}</p>
                  <p className="text-sm font-semibold text-slate-700">Seller: {listing.seller?.name}</p>
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
