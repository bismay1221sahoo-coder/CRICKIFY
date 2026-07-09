import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Heart, Info, MapPin, Phone, ShieldCheck, X } from "lucide-react";
import { apiRequest, getUser } from "../lib/api";
import { parseListingDescription } from "../lib/listingDescription";
import CategoryIcon from "../components/CategoryIcon";

const CONDITION_META = {
  LIKE_NEW: { label: "Like New", cls: "chip-brand-soft" },
  GOOD: { label: "Good", cls: "chip-neutral" },
  FAIR: { label: "Fair", cls: "chip-warn" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "chip-danger" },
};

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportToast, setReportToast] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/listings/${id}`);
        setListing(data.listing);
        setActiveMedia(data.listing?.media?.[0] || null);
        const [relatedData, savedData] = await Promise.all([
          apiRequest(`/api/listings/${id}/related`).catch(() => ({ listings: [] })),
          getUser() ? apiRequest("/api/listings/saved").catch(() => ({ savedIds: [] })) : Promise.resolve({ savedIds: [] }),
        ]);
        setRelated(Array.isArray(relatedData.listings) ? relatedData.listings : []);
        setSavedIds(Array.isArray(savedData.savedIds) ? savedData.savedIds : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleSaved = async () => {
    if (!listing) return;
    if (!getUser()) {
      navigate("/login");
      return;
    }
    const isSaved = savedIds.includes(listing.id);
    setSavedIds((current) =>
      isSaved ? current.filter((savedId) => savedId !== listing.id) : [...current, listing.id]
    );
    try {
      await apiRequest(`/api/listings/${listing.id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });
    } catch {
      setSavedIds((current) =>
        isSaved ? [...current, listing.id] : current.filter((savedId) => savedId !== listing.id)
      );
    }
  };

  const { cleanDescription, proofUrls, proofReason } = useMemo(
    () => parseListingDescription(listing?.description),
    [listing?.description]
  );

  const submitReport = async () => {
    const reason = reportReason.trim();
    if (reason.length < 10) {
      setReportToast("Please enter at least 10 characters.");
      return;
    }
    setReportSubmitting(true);
    try {
      await apiRequest(`/api/listings/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setReportToast("Report submitted. Thank you.");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      setReportToast(err.message);
    } finally {
      setReportSubmitting(false);
      setTimeout(() => setReportToast(""), 3500);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="shimmer aspect-[4/3] rounded-[2rem]" />
          <div className="space-y-6">
            <div className="shimmer h-12 w-3/4 rounded-xl" />
            <div className="shimmer h-6 w-1/4 rounded-xl" />
            <div className="shimmer h-40 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-ink">Listing not found</h1>
        <p className="mt-2 text-muted">{error || "This item may have been sold or removed."}</p>
        <Link to="/" className="btn-primary mt-8 px-8">Back to Marketplace</Link>
      </main>
    );
  }

  const cond = CONDITION_META[listing.condition] || { label: listing.condition, cls: "chip-neutral" };

  return (
    <main className="min-h-screen bg-canvas pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-faint hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lg elevated">
              {activeMedia?.type === "VIDEO" ? (
                <video src={activeMedia.url} controls className="h-full w-full object-cover" />
              ) : (
                <button onClick={() => setLightboxOpen(true)} className="h-full w-full cursor-zoom-in group">
                  <img src={activeMedia?.url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </button>
              )}
              <div className="absolute left-4 top-4">
                <span className="chip chip-brand shadow-xl py-1.5 px-3">
                  <ShieldCheck size={12} className="mr-1" /> Verified Gear
                </span>
              </div>
            </div>

            {listing.media?.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {listing.media.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMedia(m)}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                      activeMedia?.id === m.id ? "border-brand scale-105 shadow-md" : "border-transparent hover:border-faint"
                    }`}
                  >
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div className="surface-card p-8 shadow-lg elevated">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`chip ${cond.cls}`}>{cond.label}</span>
                <span className="chip chip-neutral">{listing.category}</span>
                {listing.negotiable && <span className="chip chip-brand-soft">Negotiable</span>}
              </div>
              
              <h1 className="text-3xl font-black text-ink leading-tight">{listing.title}</h1>
              {listing.brand && <p className="text-lg font-bold text-brand mt-1">{listing.brand}</p>}
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-black text-ink">₹{Number(listing.price).toLocaleString()}</span>
                <span className="text-xs font-black text-faint uppercase tracking-widest">
                  {listing.negotiable ? "Asking Price" : "Final Price"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSaved}
                className="btn-ghost mt-5 w-full py-3"
              >
                <Heart size={17} fill={savedIds.includes(listing.id) ? "currentColor" : "none"} />
                {savedIds.includes(listing.id) ? "Saved" : "Save Listing"}
              </button>

              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6">
                <div className="flex items-center gap-3 text-ink">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-faint">Used for</p>
                    <p className="text-sm font-bold">{listing.usedDuration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-ink">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-faint">Location</p>
                    <p className="text-sm font-bold">{listing.city}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-faint">Defects Reported</p>
                <div className="text-sm font-bold text-ink bg-surface-2/50 p-4 rounded-xl border border-line">
                  {listing.defects || "No major defects reported by seller."}
                </div>
              </div>
            </div>

            {/* Contact Panel */}
            <div className="surface-card bg-brand p-8 text-on-brand shadow-xl elevated relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 relative z-10">Interested in this gear?</p>
              <div className="mt-4 flex items-center gap-4 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
                  {listing.seller?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <Link to={`/sellers/${listing.seller?.id}`} className="text-lg font-black hover:underline">
                    {listing.seller?.name || "Seller"}
                  </Link>
                  <p className="text-xs font-bold opacity-70 flex items-center gap-1">
                    <MapPin size={10} /> {listing.seller?.city || listing.city}
                  </p>
                </div>
              </div>

              {listing.seller?.phone ? (
                <a href={`tel:${listing.seller.phone}`} className="btn-primary mt-8 w-full bg-white text-ink hover:bg-slate-100 py-4 text-base relative z-10">
                  <Phone size={18} /> Call Seller Now
                </a>
              ) : (
                <div className="mt-8 rounded-2xl bg-white/10 p-4 border border-white/20 text-center relative z-10">
                  <p className="text-sm font-bold">Contact details shared on request</p>
                </div>
              )}
              
              <button 
                onClick={() => setReportOpen(true)}
                className="mt-6 w-full text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 relative z-10"
              >
                <Info size={12} /> Report suspicious listing
              </button>
            </div>

            {/* Description */}
            <div className="surface-card p-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-faint mb-4">Product Description</h4>
              <p className="text-sm font-medium leading-relaxed text-muted whitespace-pre-wrap">{cleanDescription}</p>
              
              {(proofUrls?.length > 0 || proofReason) && (
                <div className="mt-8 rounded-2xl bg-surface-2 p-6 border border-line">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">Proof of Ownership</p>
                  {proofUrls?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {proofUrls.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand underline hover:text-brand-strong transition-colors">View Invoice</a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted italic">{proofReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">Related gear</h2>
                <p className="mt-1 text-sm font-bold text-muted">Similar category or city.</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => {
                const photo = item?.media?.find((media) => media.type === "IMAGE")?.url;
                const price = Number(item?.price || 0);
                return (
                  <Link key={item.id} to={`/listings/${item.id}`} className="surface-card group overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden bg-surface-2">
                      {photo ? (
                        <img src={photo} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-faint">
                          <CategoryIcon name={item.category} size={42} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="truncate text-base font-black text-ink">{item.title}</h3>
                        <div className="text-right">
                          <p className="text-lg font-black text-brand">₹{price.toLocaleString()}</p>
                          {item.negotiable && <p className="text-[10px] font-black uppercase tracking-widest text-faint">Negotiable</p>}
                        </div>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                        <MapPin size={12} /> {item.city}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Modals & Toasts */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="surface-card w-full max-w-md p-8 shadow-2xl elevated">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-black text-ink">Report Listing</h3>
               <button onClick={() => setReportOpen(false)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <p className="text-sm text-muted mb-6">Help us keep Crickify safe. Tell us what's wrong with this listing.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="input-field resize-none mb-6"
              placeholder="e.g. Fake photos, suspicious price, scam attempt..."
              disabled={reportSubmitting}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setReportOpen(false)} className="btn-ghost" disabled={reportSubmitting}>Cancel</button>
              <button 
                onClick={submitReport} 
                className="btn-primary bg-danger text-white hover:bg-danger-ink" 
                disabled={reportSubmitting || reportReason.trim().length < 10}
              >
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && activeMedia?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4" onClick={() => setLightboxOpen(false)}>
           <button className="absolute right-6 top-6 text-white/60 hover:text-white"><X size={32} /></button>
           <img src={activeMedia.url} alt="" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {reportToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-in-up">
           <div className="chip chip-brand shadow-2xl py-3 px-6 text-sm">
              {reportToast}
           </div>
        </div>
      )}
    </main>
  );
}

export default ListingDetails;
