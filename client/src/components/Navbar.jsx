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
    `text-sm font-medium transition ${isActive ? "text-emerald-700" : "text-slate-600 hover:text-slate-950"}`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-black tracking-tight text-slate-950">
          CRICKIFY
        </Link>

        <nav className="flex items-center gap-4">
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
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
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
