import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function Admin() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPendingListings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/admin/listings/pending");
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    apiRequest("/api/admin/listings/pending")
      .then((data) => {
        if (isMounted) {
          setListings(data.listings);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const approveListing = async (id) => {
    await apiRequest(`/api/admin/listings/${id}/approve`, { method: "PATCH" });
    loadPendingListings();
  };

  const rejectListing = async (id) => {
    const reason = window.prompt("Reject reason");
    if (!reason) return;

    await apiRequest(`/api/admin/listings/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    loadPendingListings();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-emerald-700">Admin verification</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Pending listings</h1>
      </div>

      {loading && <p className="text-slate-600">Loading pending listings...</p>}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div className="rounded-lg border border-dashed border-emerald-200 bg-white/90 p-8 text-center shadow-sm">
          <h2 className="text-xl font-black text-slate-950">No pending listings</h2>
        </div>
      )}

      <div className="grid gap-5">
        {listings.map((listing) => (
          <article key={listing.id} className="grid gap-4 rounded-xl border border-emerald-100 bg-white/95 p-5 shadow-sm md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-xl font-black text-slate-950">{listing.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {listing.category} - {listing.condition.replace("_", " ")} - Rs. {listing.price} - {listing.city}
              </p>
              <p className="mt-3 text-sm text-slate-700">{listing.description}</p>
              <p className="mt-2 text-sm font-semibold text-slate-700">Defects: {listing.defects}</p>
              <p className="mt-2 text-sm text-slate-600">
                Seller: {listing.seller?.name} - {listing.seller?.phone || "No phone"}
              </p>
            </div>
            <div className="flex items-center gap-2 md:flex-col md:items-stretch">
              <button onClick={() => approveListing(listing.id)} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800">
                Approve
              </button>
              <button onClick={() => rejectListing(listing.id)} className="rounded-md border border-sky-200 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Admin;
