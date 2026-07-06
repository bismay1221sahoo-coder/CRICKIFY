import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, Calendar, Edit3, ExternalLink, MapPin, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { apiRequest } from "../lib/api";
import { parseListingDescription } from "../lib/listingDescription";

const STATUS_META = {
  PENDING: { label: "Under Review", cls: "chip-warn" },
  APPROVED: { label: "Live & Verified", cls: "chip-brand" },
  REJECTED: { label: "Rejected", cls: "chip-danger" },
};

const CONDITION_META = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  NEEDS_REPAIR: "Needs Repair",
};

const CATEGORY_OPTIONS = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const CONDITION_OPTIONS = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];

const EXTRA_FIELDS = {
  BAT: [
    { name: "batWeight", label: "Bat Weight (approx)", type: "text", placeholder: "e.g. 1.1kg, 1.2kg", required: true },
    { name: "willowType", label: "Willow Type", type: "select", options: ["English Willow", "Kashmir Willow", "Tennis Ball Bat"], required: true },
    { name: "batSize", label: "Bat Size", type: "select", options: ["Boys", "Mens"], required: true },
    { name: "handleType", label: "Handle Type (optional)", type: "select", options: ["", "Round", "Oval"], required: false },
  ],
  GLOVES: [
    { name: "glovesType", label: "Gloves Type", type: "select", options: ["Wicket Keeping Gloves", "Batting Gloves"], required: true },
    { name: "battingHand", label: "Batting Hand", type: "select", options: ["RHB (Right Hand Bat)", "LHB (Left Hand Bat)"], required: true },
    { name: "glovesSize", label: "Gloves Size", type: "select", options: ["Boys", "Adult", "Mens"], required: true },
  ],
  PADS: [
    { name: "padsType", label: "Pads Type", type: "select", options: ["Wicket Keeping Pads", "Batting Pads"], required: true },
    { name: "padsSize", label: "Pads Size", type: "select", options: ["Boys", "Adult", "Mens"], required: true },
    { name: "padsBattingHand", label: "Batting Hand", type: "select", options: ["RHB (Right Hand Bat)", "LHB (Left Hand Bat)"], required: true },
  ],
  HELMET: [
    { name: "helmetSize", label: "Helmet Size", type: "select", options: ["Boys", "Adult", "Mens"], required: true },
    { name: "grillType", label: "Grill Type", type: "select", options: ["Titanium", "Stainless Steel", "Mild Steel", "Carbon Steel"], required: true },
  ],
  SHOES: [
    { name: "shoesType", label: "Shoes Type", type: "select", options: ["Studds", "Spikes"], required: true },
    { name: "nailsAvailable", label: "Nails Available", type: "select", options: ["Yes", "No"], required: true },
  ],
  KIT: [
    { name: "kitType", label: "Kit Type", type: "select", options: ["Wheel", "Carry", "Both"], required: true },
  ],
};

const CATEGORY_EXTRA_LINE_ORDER = {
  BAT: ["batWeight", "willowType", "batSize", "handleType"],
  GLOVES: ["glovesType", "battingHand", "glovesSize"],
  PADS: ["padsType", "padsSize", "padsBattingHand"],
  HELMET: ["helmetSize", "grillType"],
  SHOES: ["shoesType", "nailsAvailable"],
  KIT: ["kitType"],
};

const buildDefaultExtraDetails = (category) => {
  const fields = EXTRA_FIELDS[category] || [];
  return fields.reduce((acc, field) => {
    if (field.type === "select" && field.required && field.options?.length) {
      acc[field.name] = field.options[0];
    }
    return acc;
  }, {});
};

const getActiveExtraFieldOrder = (category, details) => {
  const baseOrder = CATEGORY_EXTRA_LINE_ORDER[category] || Object.keys(details || {});
  const normalizedGlovesType = String(details?.glovesType || "").trim().toLowerCase();
  const normalizedPadsType = String(details?.padsType || "").trim().toLowerCase();
  const normalizedShoesType = String(details?.shoesType || "").trim().toLowerCase();

  if (category === "GLOVES") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "glovesType" ||
        (normalizedGlovesType === "batting gloves" && (fieldName === "battingHand" || fieldName === "glovesSize"))
    );
  }

  if (category === "PADS") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "padsType" ||
        (normalizedPadsType === "batting pads" && (fieldName === "padsSize" || fieldName === "padsBattingHand"))
    );
  }

  if (category === "SHOES") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "shoesType" ||
        (normalizedShoesType === "spikes" && fieldName === "nailsAvailable")
    );
  }

  return baseOrder;
};

const parseEditExtraDetails = (raw = "", category = "BAT") => {
  const text = String(raw || "");
  const [metaBlock = ""] = text.split("\n\n");
  const fields = EXTRA_FIELDS[category] || [];
  const labelToField = new Map(fields.map((field) => [field.label.toLowerCase(), field.name]));
  const details = buildDefaultExtraDetails(category);

  metaBlock
    .split(/\s*\|\s*|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf(":");
      if (separatorIndex === -1) return;
      const label = part.slice(0, separatorIndex).trim().toLowerCase();
      const value = part.slice(separatorIndex + 1).trim();
      const fieldName = labelToField.get(label);
      if (fieldName && value) {
        details[fieldName] = value;
      }
    });

  return details;
};

const getUserDescription = (raw = "") => {
  const text = String(raw || "");
  const cleaned = parseListingDescription(text).cleanDescription;
  const parts = cleaned.split("\n\n");
  if (parts.length > 1) return parts.slice(1).join("\n\n").trim();
  return cleaned;
};

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editExtraDetails, setEditExtraDetails] = useState(() => buildDefaultExtraDetails("BAT"));
  const [editForm, setEditForm] = useState({
    title: "",
    brand: "",
    category: "BAT",
    condition: "GOOD",
    price: "",
    city: "",
    usedDuration: "",
    defects: "",
    description: "",
  });
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.submitted) return;
    const showTimer = setTimeout(() => {
      setToast("Listing submitted! Admin will verify it shortly.");
    }, 0);
    const hideTimer = setTimeout(() => setToast(""), 4000);
    window.history.replaceState({}, "", window.location.pathname);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.state]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/listings/mine");
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const deleteListing = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/listings/${id}`, { method: "DELETE" });
      setListings((current) => current.filter((item) => item.id !== id));
      setToast("Listing deleted.");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (listing) => {
    const userDescription = getUserDescription(listing.description);
    const extras = parseEditExtraDetails(listing.description, listing.category || "BAT");
    setEditTargetId(listing.id);
    setEditForm({
      title: listing.title || "",
      brand: listing.brand || "",
      category: listing.category || "BAT",
      condition: listing.condition || "GOOD",
      price: String(listing.price ?? ""),
      city: listing.city || "",
      usedDuration: listing.usedDuration || "",
      defects: listing.defects || "",
      description: userDescription,
    });
    setEditExtraDetails(extras);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (editSubmitting) return;
    setEditOpen(false);
    setEditTargetId(null);
  };

  const updateEditField = (e) => {
    const { name, value } = e.target;
    setEditForm((current) => {
      const nextForm = { ...current, [name]: value };
      if (name === "category") {
        setEditExtraDetails(buildDefaultExtraDetails(value));
      }
      return nextForm;
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editTargetId) return;
    setEditSubmitting(true);
    setError("");
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
      };
      getActiveExtraFieldOrder(editForm.category, editExtraDetails).forEach((fieldName) => {
        const value = editExtraDetails[fieldName];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          payload[fieldName] = value;
        }
      });
      const data = await apiRequest(`/api/listings/${editTargetId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setListings((current) =>
        current.map((item) => (item.id === editTargetId ? data.listing : item))
      );
      setToast("Listing updated.");
      setTimeout(() => setToast(""), 3000);
      closeEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas py-12 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between fade-in-up">
          <div>
            <span className="chip chip-neutral mb-3">Seller Dashboard</span>
            <h1 className="text-4xl font-black text-ink">Your submissions</h1>
            <p className="mt-2 text-muted font-bold">Manage your listed equipment and track verification status.</p>
          </div>
          <Link to="/sell" className="btn-primary py-3 px-6 shadow-lg elevated">
            <Plus size={18} /> New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-danger/10 p-4 border border-danger/20 text-sm font-bold text-danger-ink flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="surface-card p-4 flex gap-6 overflow-hidden">
                <div className="shimmer h-32 w-40 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                   <div className="shimmer h-6 w-1/2 rounded-lg" />
                   <div className="shimmer h-4 w-3/4 rounded-lg" />
                   <div className="shimmer h-4 w-1/4 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="surface-card p-20 text-center shadow-lg">
             <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 text-faint">
                <ShoppingBag size={40} />
             </div>
             <h2 className="text-2xl font-black text-ink">No listings found</h2>
             <p className="mt-2 text-muted font-medium">You haven't listed any gear for sale yet.</p>
             <Link to="/sell" className="btn-primary mt-10 px-10">Start Selling</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const photo = listing?.media?.find(m => m.type === "IMAGE")?.url;
              const status = STATUS_META[listing.status] || STATUS_META.PENDING;
              const createdAt = new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

              return (
                <article key={listing.id} className="surface-card group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48 bg-surface-2">
                      {photo ? (
                        <img src={photo} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-faint"><ShoppingBag size={32} /></div>
                      )}
                      <div className="absolute top-3 left-3">
                         <span className={`chip ${status.cls} shadow-lg`}>{status.label}</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                      <div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                           <h2 className="text-xl font-black text-ink">{listing.title}</h2>
                           <p className="text-2xl font-black text-brand">₹{Number(listing.price).toLocaleString()}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-muted uppercase tracking-widest">
                           <span className="flex items-center gap-1"><MapPin size={12} /> {listing.city}</span>
                           <span>{listing.category} · {CONDITION_META[listing.condition]}</span>
                        </div>
                        
                        {listing.status === "REJECTED" && listing.rejectReason && (
                          <div className="mt-4 rounded-xl bg-danger/5 p-4 border border-danger/10 text-xs font-bold text-danger-ink">
                             Reason: {listing.rejectReason}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-faint">
                           <Calendar size={12} /> Submitted {createdAt}
                        </div>
                        <div className="flex items-center gap-3">
                           {listing.status === "APPROVED" && (
                             <Link to={`/listings/${listing.id}`} className="btn-ghost py-2 px-4 text-xs">
                                <ExternalLink size={14} className="mr-1" /> View Live
                             </Link>
                           )}
                           {listing.status === "PENDING" && (
                             <button onClick={() => openEdit(listing)} className="btn-ghost border-brand text-brand hover:bg-brand-weak py-2 px-4 text-xs">
                                <Edit3 size={14} className="mr-1" /> Edit Details
                             </button>
                           )}
                           <button onClick={() => deleteListing(listing.id, listing.title)} className="btn-ghost border-danger text-danger hover:bg-danger/10 py-2 px-4 text-xs">
                              <Trash2 size={14} className="mr-1" /> Remove
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
             <div className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl elevated">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-black text-ink">Edit Submission</h3>
                   <button onClick={closeEdit} className="text-muted hover:text-ink"><X size={24} /></button>
                </div>
                <form onSubmit={submitEdit} className="space-y-6">
                   <div className="grid gap-6 sm:grid-cols-2">
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Title</span>
                         <input name="title" value={editForm.title} onChange={updateEditField} className="input-field" required />
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Brand</span>
                         <input name="brand" value={editForm.brand} onChange={updateEditField} className="input-field" />
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Category</span>
                         <select name="category" value={editForm.category} onChange={updateEditField} className="input-field" required>
                            {CATEGORY_OPTIONS.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                         </select>
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Condition</span>
                         <select name="condition" value={editForm.condition} onChange={updateEditField} className="input-field" required>
                            {CONDITION_OPTIONS.map((condition) => (
                              <option key={condition} value={condition}>{CONDITION_META[condition]}</option>
                            ))}
                         </select>
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Price (₹)</span>
                         <input name="price" type="number" value={editForm.price} onChange={updateEditField} className="input-field" required />
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">City</span>
                         <input name="city" value={editForm.city} onChange={updateEditField} className="input-field" required />
                      </label>
                   </div>

                   {EXTRA_FIELDS[editForm.category]?.length > 0 && (
                    <div className="rounded-2xl border border-line bg-surface-2/40 p-5">
                      <p className="mb-4 text-xs font-black uppercase tracking-widest text-faint">
                        {editForm.category} details
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {EXTRA_FIELDS[editForm.category].map((field) => (
                          <label key={field.name} className="space-y-2">
                            <span className="text-xs font-black uppercase tracking-widest text-faint">
                              {field.label} {field.required && "*"}
                            </span>
                            {field.type === "select" ? (
                              <select
                                name={field.name}
                                value={editExtraDetails[field.name] || ""}
                                onChange={(e) =>
                                  setEditExtraDetails((current) => ({
                                    ...current,
                                    [e.target.name]: e.target.value,
                                  }))
                                }
                                className="input-field"
                                required={field.required}
                              >
                                {field.options.map((option) => (
                                  <option key={option} value={option}>{option || "-- Select --"}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                name={field.name}
                                value={editExtraDetails[field.name] || ""}
                                onChange={(e) =>
                                  setEditExtraDetails((current) => ({
                                    ...current,
                                    [e.target.name]: e.target.value,
                                  }))
                                }
                                className="input-field"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                   )}

                   <div className="grid gap-6 sm:grid-cols-2">
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Used for</span>
                         <input name="usedDuration" value={editForm.usedDuration} onChange={updateEditField} className="input-field" required />
                      </label>
                      <label className="space-y-2">
                         <span className="text-xs font-black uppercase tracking-widest text-faint">Defects</span>
                         <input name="defects" value={editForm.defects} onChange={updateEditField} className="input-field" required />
                      </label>
                   </div>

                   <label className="block space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-faint">Description</span>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={updateEditField}
                        rows={5}
                        className="input-field resize-none"
                        required
                      />
                   </label>

                   <div className="pt-6 flex justify-end gap-3">
                      <button type="button" onClick={closeEdit} className="btn-ghost">Cancel</button>
                      <button type="submit" disabled={editSubmitting} className="btn-primary px-10">
                         {editSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-in-up">
            <div className="chip chip-brand shadow-2xl py-3 px-6 text-sm">{toast}</div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyListings;
