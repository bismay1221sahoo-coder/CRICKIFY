import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { apiRequest } from "../lib/api";
import CategoryIcon from "../components/CategoryIcon";

function SellerProfile() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/listings/sellers/${sellerId}`);
        setSeller(data.seller);
        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sellerId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="shimmer h-44 rounded-[2rem]" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="surface-card overflow-hidden">
              <div className="shimmer aspect-[4/3]" />
              <div className="p-5"><div className="shimmer h-5 rounded-lg" /></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-ink">Seller not found</h1>
        <p className="mt-2 text-muted">{error || "This seller profile is unavailable."}</p>
        <Link to="/categories/ALL" className="btn-primary mt-8 px-8">Browse Gear</Link>
      </main>
    );
  }

  const joined = seller.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Recently";

  return (
    <main className="min-h-screen bg-canvas py-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="surface-card overflow-hidden p-8 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-3xl font-black text-on-brand">
                {seller.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <span className="chip chip-brand-soft mb-3">
                  <ShieldCheck size={13} /> Verified Seller
                </span>
                <h1 className="text-4xl font-black text-ink">{seller.name}</h1>
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {seller.city || "India"}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} /> Joined {joined}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-2 px-6 py-4 text-center">
              <p className="text-3xl font-black text-brand">{seller.approvedListingsCount || listings.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-faint">Live listings</p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Gear from this seller</h2>
            <p className="mt-1 text-sm font-bold text-muted">Approved listings only.</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="surface-card mt-6 py-20 text-center">
            <ShoppingBag size={40} className="mx-auto text-faint" />
            <h3 className="mt-4 text-xl font-black text-ink">No live listings</h3>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => {
              const photo = listing?.media?.find((item) => item.type === "IMAGE")?.url;
              const price = Number(listing?.price || 0);
              return (
                <Link key={listing.id} to={`/listings/${listing.id}`} className="surface-card group overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-surface-2">
                    {photo ? (
                      <img src={photo} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-faint">
                        <CategoryIcon name={listing.category} size={44} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-base font-black text-ink">{listing.title}</h3>
                      <div className="text-right">
                        <p className="text-lg font-black text-brand">₹{price.toLocaleString()}</p>
                        {listing.negotiable && <p className="text-[10px] font-black uppercase tracking-widest text-faint">Negotiable</p>}
                      </div>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                      <MapPin size={12} /> {listing.city}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default SellerProfile;
