import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiRequest, getUser, saveSession } from "../lib/api";

const initialForm = { name: "", email: "", password: "", phone: "", city: "" };

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect to home
  if (getUser()) return <Navigate to="/" replace />;

  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

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

  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }} />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #c4b5fd, transparent 70%)" }} />

      <div className="fade-in-up relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="float mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black text-white shadow-xl"
            style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" }}>
            CR
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === "login" ? "Welcome back" : "Join CRICKIFY"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login" ? "Login to buy or sell cricket gear" : "Create your free account today"}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-2xl bg-slate-100/80 p-1 backdrop-blur-sm">
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-emerald-700 shadow-md"
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
                <input name="name" value={form.name} onChange={updateField} placeholder="Full name" className="input-field" required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="phone" value={form.phone} onChange={updateField} placeholder="Phone" className="input-field" />
                  <input name="city" value={form.city} onChange={updateField} placeholder="City" className="input-field" />
                </div>
              </>
            )}
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="Email address" className="input-field" required />
            <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Password" className="input-field" required />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button disabled={loading} className="btn-primary mt-1 w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
                  </svg>
                  Please wait...
                </span>
              ) : mode === "login" ? "Login to account" : "Create account"}
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
