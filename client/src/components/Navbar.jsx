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
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-black tracking-tight text-emerald-800">
          CRICKIFY
        </Link>

        <nav className="flex items-center gap-2">
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
              className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
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
