import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, FileText, Loader2, Lock, Tag, UploadCloud, X } from "lucide-react";
import { apiRequest, getToken, uploadListingMedia } from "../lib/api";

const CATEGORIES = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const CONDITIONS = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];
const MAX_PRODUCT_MEDIA_SIZE = 8 * 1024 * 1024;
const MAX_PROOF_MEDIA_SIZE = 500 * 1024;

const EXTRA_FIELDS = {
  BAT: [
    { name: "batWeight",   label: "Bat Weight (approx)",  type: "text",   placeholder: "e.g. 1.1kg, 1.2kg",          required: true },
    { name: "willowType",  label: "Willow Type",           type: "select", options: ["English Willow", "Kashmir Willow", "Tennis Ball Bat"], required: true },
    { name: "batSize",     label: "Bat Size",              type: "select", options: ["Boys", "Mens"],                 required: true },
    { name: "handleType",  label: "Handle Type (optional)",type: "select", options: ["", "Round", "Oval"],            required: false },
  ],
  GLOVES: [
    { name: "glovesType",  label: "Gloves Type",           type: "select", options: ["Wicket Keeping Gloves", "Batting Gloves"], required: true },
    { name: "glovesSize",  label: "Gloves Size",           type: "select", options: ["Boys", "Adult", "Mens"], required: true },
    { name: "battingHand", label: "Batting Hand",          type: "select", options: ["RHB (Right Hand Bat)", "LHB (Left Hand Bat)"], required: true },
  ],
  PADS: [
    { name: "padsType", label: "Pads Type", type: "select", options: ["Wicket Keeping Pads", "Batting Pads"], required: true },
    { name: "padsSize", label: "Pads Size", type: "select", options: ["Boys", "Adult", "Mens"], required: true },
    { name: "padsBattingHand", label: "Batting Hand", type: "select", options: ["RHB (Right Hand Bat)", "LHB (Left Hand Bat)"], required: true },
  ],
  HELMET: [
    { name: "helmetSize", label: "Helmet Size", type: "select", options: ["Boys", "Adult", "Mens"], required: true },
    {
      name: "grillType",
      label: "Grill Type",
      type: "select",
      options: ["Titanium", "Stainless Steel", "Mild Steel", "Carbon Steel"],
      required: true,
    },
  ],
  SHOES: [
    { name: "shoesType", label: "Shoes Type", type: "select", options: ["Studds", "Spikes"], required: true },
    { name: "nailsAvailable", label: "Nails Available", type: "select", options: ["Yes", "No"], required: true },
  ],
  KIT: [
    { name: "kitType", label: "Kit Type", type: "select", options: ["Wheel", "Carry", "Both"], required: true },
    { name: "kitSize", label: "Kit Size", type: "select", options: ["Small", "Medium", "Large"], required: true },
  ],
};

const EXTRA_FIELD_LABELS = {
  batWeight: "Bat Weight (approx)",
  willowType: "Willow Type",
  batSize: "Bat Size",
  handleType: "Handle Type",
  glovesType: "Gloves Type",
  battingHand: "Batting Hand",
  glovesSize: "Gloves Size",
  padsType: "Pads Type",
  padsSize: "Pads Size",
  padsBattingHand: "Batting Hand",
  helmetSize: "Helmet Size",
  grillType: "Grill Type",
  shoesType: "Shoes Type",
  nailsAvailable: "Nails Available",
  kitType: "Kit Type",
  kitSize: "Kit Size",
};

const CATEGORY_EXTRA_LINE_ORDER = {
  BAT: ["batWeight", "willowType", "batSize", "handleType"],
  GLOVES: ["glovesType", "glovesSize", "battingHand"],
  PADS: ["padsType", "padsSize", "padsBattingHand"],
  HELMET: ["helmetSize", "grillType"],
  SHOES: ["shoesType", "nailsAvailable"],
  KIT: ["kitType", "kitSize"],
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
        fieldName === "glovesSize" ||
        (normalizedGlovesType === "batting gloves" && fieldName === "battingHand")
    );
  }

  if (category === "PADS") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "padsType" ||
        fieldName === "padsSize" ||
        (normalizedPadsType === "batting pads" && fieldName === "padsBattingHand")
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

const initialForm = {
  title: "", brand: "", category: "BAT", condition: "GOOD",
  price: "", city: "", usedDuration: "", defects: "", description: "",
};

function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState([]);
  const [proofMedia, setProofMedia] = useState([]);
  const [proofReason, setProofReason] = useState("");
  const [proofUploading, setProofUploading] = useState(false);
  const [proofDragOver, setProofDragOver] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [extraDetails, setExtraDetails] = useState(() =>
    buildDefaultExtraDetails(initialForm.category)
  );
  const isLoggedIn = Boolean(getToken());
  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  const updateExtra = (e) => setExtraDetails((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;
    setForm((c) => ({ ...c, category: nextCategory }));
    setExtraDetails(buildDefaultExtraDetails(nextCategory));
  };

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setError("");
    const oversized = files.find((file) => file.size > MAX_PRODUCT_MEDIA_SIZE);
    if (oversized) {
      setError("Product photo/video file size must be 8MB or less.");
      return;
    }
    setUploading(true);
    try {
      const results = await Promise.allSettled(
        files.map((file) => uploadListingMedia(file, { purpose: "listing" }))
      );

      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => ({
          ...result.value,
          localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          previewUrl: result.value.type === "IMAGE" ? result.value.url : null,
        }));

      if (uploaded.length) {
        setMedia((c) => [...c, ...uploaded]);
      }

      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length) {
        const message = failures[0]?.reason?.message || "Some files failed to upload.";
        setError(message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e) => {
    await uploadFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    await uploadFiles(Array.from(e.dataTransfer.files || []));
  };

  const removeMedia = (localId) => setMedia((c) => c.filter((m) => m.localId !== localId));
  const removeProofMedia = (localId) => setProofMedia((c) => c.filter((m) => m.localId !== localId));

  const uploadProofFiles = async (files) => {
    if (!files.length) return;
    setError("");
    const oversized = files.find((file) => file.size > MAX_PROOF_MEDIA_SIZE);
    if (oversized) {
      setError("Invoice/proof file size must be 500KB or less.");
      return;
    }
    setProofUploading(true);
    try {
      const results = await Promise.allSettled(
        files.map((file) => uploadListingMedia(file, { purpose: "proof" }))
      );

      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => ({
          ...result.value,
          localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          previewUrl: result.value.type === "IMAGE" ? result.value.url : null,
        }));

      if (uploaded.length) {
        setProofMedia((c) => [...c, ...uploaded]);
        setProofReason("");
      }

      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length) {
        const message = failures[0]?.reason?.message || "Some proof files failed to upload.";
        setError(message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProofUploading(false);
    }
  };

  const handleProofFileInput = async (e) => {
    await uploadProofFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleProofDrop = async (e) => {
    e.preventDefault();
    setProofDragOver(false);
    await uploadProofFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!media.length) { setError("Upload at least one photo or video before submitting."); return; }
    if (!proofMedia.length && !proofReason.trim()) {
      setError("Upload invoice/bill/purchase proof, or give a valid reason for not having proof.");
      return;
    }
    setLoading(true);
    try {
      const extraFieldOrder = getActiveExtraFieldOrder(form.category, extraDetails);
      const extraLines = extraFieldOrder
        .filter((fieldName) => extraDetails[fieldName])
        .map((fieldName) => `${EXTRA_FIELD_LABELS[fieldName] || fieldName}: ${extraDetails[fieldName]}`);
      const proofLines = proofMedia.length
        ? [`Purchase Proof: ${proofMedia.map((item) => item.url).join(", ")}`]
        : [`Purchase Proof Reason: ${proofReason.trim()}`];
      const proofPublicIds = proofMedia.map((item) => item.publicId).filter(Boolean);
      const proofMarker = proofPublicIds.length ? `\n\n[[PROOF_PUBLIC_IDS:${proofPublicIds.join(",")}]]` : "";
      const fullDescription = extraLines.length
        ? `${extraLines.join(" | ")}\n${proofLines.join(" | ")}\n\n${form.description}`
        : `${proofLines.join(" | ")}\n\n${form.description}`;

      await apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify({ ...form, description: `${fullDescription}${proofMarker}`, price: Number(form.price), media }),
      });
      navigate("/my-listings", { state: { submitted: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-canvas px-4">
        <div className="surface-card w-full max-w-md p-10 text-center shadow-xl elevated">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-weak text-brand">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-ink">Login Required</h1>
          <p className="mt-4 text-muted font-medium">You need an account to list gear for sale on Crickify.</p>
          <button onClick={() => navigate("/login")} className="btn-primary mt-8 w-full py-4">
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas py-12 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center fade-in-up">
          <span className="chip chip-brand-soft mb-4">Seller Submission</span>
          <h1 className="text-4xl font-black text-ink">Sell your gear</h1>
          <p className="mt-2 text-muted font-bold">Fill in the details. Admin will verify before going live.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic Details */}
          <div className="surface-card p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-brand"><Tag size={16} /></div>
              <h2 className="text-lg font-black text-ink">Equipment Details</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Title *</span>
                <input name="title" value={form.title} onChange={updateField} placeholder="e.g. SS Ton Grade 1 Bat" className="input-field" required />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Brand</span>
                <input name="brand" value={form.brand} onChange={updateField} placeholder="e.g. SS, SG, GM" className="input-field" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Category *</span>
                <select name="category" value={form.category} onChange={handleCategoryChange} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Condition *</span>
                <select name="condition" value={form.condition} onChange={updateField} className="input-field">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Price (₹) *</span>
                <input name="price" type="number" value={form.price} onChange={updateField} placeholder="e.g. 4500" className="input-field" required />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-faint">City *</span>
                <input name="city" value={form.city} onChange={updateField} placeholder="e.g. Mumbai" className="input-field" required />
              </label>
            </div>
          </div>

          {/* Section: Category Specifics */}
          {EXTRA_FIELDS[form.category] && (
            <div className="surface-card p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-brand"><FileText size={16} /></div>
                <h2 className="text-lg font-black text-ink">{form.category.replace("_", " ")} Specifications</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {EXTRA_FIELDS[form.category]
                  .filter((field) => getActiveExtraFieldOrder(form.category, extraDetails).includes(field.name))
                  .map((field) => (
                  <label key={field.name} className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-widest text-faint">{field.label} {field.required && "*"}</span>
                    {field.type === "select" ? (
                      <select name={field.name} value={extraDetails[field.name] || ""} onChange={updateExtra} className="input-field" required={field.required}>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt || "-- Select --"}</option>)}
                      </select>
                    ) : (
                      <input name={field.name} value={extraDetails[field.name] || ""} onChange={updateExtra} placeholder={field.placeholder} className="input-field" required={field.required} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section: Condition & Description */}
          <div className="surface-card p-8 shadow-lg">
             <div className="space-y-6">
                <label className="block space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-faint">How long have you used it? *</span>
                  <input name="usedDuration" value={form.usedDuration} onChange={updateField} placeholder="e.g. 1 season, 6 months" className="input-field" required />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-faint">Any defects or damage? *</span>
                  <input name="defects" value={form.defects} onChange={updateField} placeholder="e.g. Minor toe crack, no defects" className="input-field" required />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-faint">Detailed Description *</span>
                  <textarea name="description" value={form.description} onChange={updateField} rows="5" className="input-field resize-none" placeholder="Describe the item in detail..." required />
                </label>
             </div>
          </div>

          {/* Section: Purchase Proof */}
          <div className="surface-card p-8 shadow-lg">
             <h2 className="text-lg font-black text-ink mb-2">Purchase Proof</h2>
             <p className="text-xs font-bold text-muted mb-8">Upload bill/invoice up to 500KB or provide a valid reason below.</p>
             
             <label 
                onDragOver={(e) => { e.preventDefault(); setProofDragOver(true); }}
                onDragLeave={() => setProofDragOver(false)}
                onDrop={handleProofDrop}
                className={`flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-10 transition-all cursor-pointer ${
                   proofDragOver ? "border-brand bg-brand-weak scale-[1.02]" : "border-line bg-surface-2/30 hover:border-faint"
                }`}
              >
                <div className="mb-4 rounded-full bg-surface p-4 text-brand shadow-sm"><FileText size={24} /></div>
                <p className="text-sm font-bold text-ink">{proofDragOver ? "Drop proof here" : "Click to upload invoice/proof"}</p>
                <input type="file" multiple accept="image/*,pdf" onChange={handleProofFileInput} className="hidden" />
              </label>

              {proofMedia.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                   {proofMedia.map(item => (
                      <div key={item.localId} className="group relative aspect-square rounded-xl overflow-hidden border border-line">
                         <img src={item.previewUrl || "#"} alt="" className="h-full w-full object-cover" />
                         <button onClick={() => removeProofMedia(item.localId)} className="absolute right-2 top-2 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center shadow-lg"><X size={12} /></button>
                      </div>
                   ))}
                </div>
              )}

              <label className="block space-y-2 mt-8">
                <span className="text-xs font-black uppercase tracking-widest text-faint">Reason if proof is not available</span>
                <textarea value={proofReason} onChange={(e) => setProofReason(e.target.value)} rows="3" className="input-field resize-none" placeholder="e.g. Lost the bill, gift item..." disabled={proofMedia.length > 0} />
              </label>
          </div>

          {/* Section: Photos & Media */}
          <div className="surface-card p-8 shadow-lg">
            <h2 className="text-lg font-black text-ink mb-2">Photos & Videos</h2>
            <p className="text-xs font-bold text-muted mb-8">Upload clear media from multiple angles. Max 8MB.</p>

            <label 
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-12 transition-all cursor-pointer ${
                dragOver ? "border-brand bg-brand-weak scale-[1.02]" : "border-line bg-surface-2/30 hover:border-faint"
              }`}
            >
              <div className="mb-4 rounded-full bg-surface p-4 text-brand shadow-sm"><UploadCloud size={32} /></div>
              <p className="text-sm font-bold text-ink">{dragOver ? "Drop files now" : "Click or drag & drop media"}</p>
              <p className="mt-1 text-xs font-bold text-faint">JPG, PNG, MP4 supported</p>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileInput} className="hidden" />
            </label>

            {media.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {media.map(item => (
                  <div key={item.localId} className="group relative aspect-square rounded-2xl overflow-hidden border border-line">
                    <img src={item.previewUrl || "#"} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeMedia(item.localId)} className="absolute right-2 top-2 h-8 w-8 rounded-full bg-danger text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button disabled={loading || uploading || proofUploading} className="btn-primary w-full py-5 text-lg shadow-xl elevated">
              {loading ? <><Loader2 size={20} className="animate-spin mr-2" /> Submitting...</> : "Submit for Verification"}
            </button>
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-danger/10 p-4 text-sm font-bold text-danger-ink border border-danger/20">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

export default Sell;
