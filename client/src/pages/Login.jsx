import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
};

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      saveSession(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center px-6 py-14 lg:px-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-emerald-100 bg-white/95 p-8 shadow-md">
        <div className="mb-6 flex rounded-md bg-emerald-50 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === "register" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
          >
            Register
          </button>
        </div>

        <h1 className="text-3xl font-black text-slate-950">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {mode === "register" && (
            <>
              <input name="name" value={form.name} onChange={updateField} placeholder="Name" className="rounded-md border border-emerald-200 px-3 py-2 outline-none focus:border-emerald-400" />
              <input name="phone" value={form.phone} onChange={updateField} placeholder="Phone" className="rounded-md border border-emerald-200 px-3 py-2 outline-none focus:border-emerald-400" />
              <input name="city" value={form.city} onChange={updateField} placeholder="City" className="rounded-md border border-sky-200 px-3 py-2 outline-none focus:border-sky-400" />
            </>
          )}
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="Email" className="rounded-md border border-sky-200 px-3 py-2 outline-none focus:border-sky-400" />
          <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Password" className="rounded-md border border-emerald-200 px-3 py-2 outline-none focus:border-emerald-400" />

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          <button disabled={loading} className="rounded-md bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
