import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getUser } from "../lib/api";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      isActive ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="text-3xl font-black tracking-tight text-emerald-800">
          CRICKIFY
        </Link>

        <nav className="ml-auto flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-2 py-2 shadow-sm">
          <NavLink to="/" className={linkClass}>
            Marketplace
          </NavLink>
          <NavLink to="/sell" className={linkClass}>
            Sell
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
