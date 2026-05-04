import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../lib/api";

const initialForm = { name: "", email: "", password: "", phone: "", city: "" };

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) =>
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
      saveSession(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white transition-colors";

  return (
    <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-black text-white shadow-md">
            CR
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === "login" ? "Welcome back" : "Join CRICKIFY"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Login to buy or sell cricket gear"
              : "Create your free account today"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-all ${
                  mode === m
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3">
            {mode === "register" && (
              <>
                <input name="name" value={form.name} onChange={updateField} placeholder="Full name" className={inputClass} required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="phone" value={form.phone} onChange={updateField} placeholder="Phone number" className={inputClass} />
                  <input name="city" value={form.city} onChange={updateField} placeholder="City" className={inputClass} />
                </div>
              </>
            )}
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="Email address" className={inputClass} required />
            <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Password" className={inputClass} required />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition-colors"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login to account"
                : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="font-bold text-emerald-700 hover:underline"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
