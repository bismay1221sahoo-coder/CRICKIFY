import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getToken } from "../lib/api";

const categories = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const conditions = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];

const initialForm = {
  title: "",
  brand: "",
  category: "BAT",
  condition: "GOOD",
  price: "",
  city: "",
  usedDuration: "",
  defects: "",
  description: "",
  mediaUrl: "",
};

function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(getToken());

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const media = form.mediaUrl
        ? [
            {
              url: form.mediaUrl,
              type: form.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? "VIDEO" : "IMAGE",
            },
          ]
        : [];

      await apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          media,
        }),
      });

      setForm(initialForm);
      setMessage("Listing submitted for admin verification.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-black text-slate-950">Login required</h1>
        <p className="mt-3 text-slate-600">Create an account or login before submitting cricket equipment.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
        >
          Go to login
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-emerald-700">Seller submission</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Sell used cricket equipment</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Title
            <input name="title" value={form.title} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Brand
            <input name="brand" value={form.brand} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Category
            <select name="category" value={form.category} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Condition
            <select name="condition" value={form.condition} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2">
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Price
            <input name="price" type="number" min="1" value={form.price} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            City
            <input name="city" value={form.city} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Used duration
          <input name="usedDuration" value={form.usedDuration} onChange={updateField} placeholder="3 months" className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Defects
          <input name="defects" value={form.defects} onChange={updateField} placeholder="No defects / toe crack / grip worn" className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Photo or video URL
          <input name="mediaUrl" value={form.mediaUrl} onChange={updateField} className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Description
          <textarea name="description" value={form.description} onChange={updateField} rows="4" className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p>}

        <button disabled={loading} className="rounded-md bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
          {loading ? "Submitting..." : "Submit for verification"}
        </button>
      </form>
    </main>
  );
}

export default Sell;
