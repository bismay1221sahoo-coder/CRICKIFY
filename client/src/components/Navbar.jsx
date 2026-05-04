import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getUser } from "../lib/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/login");
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
      isActive
        ? "text-emerald-700 bg-emerald-50"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-black text-white">
            CR
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900">
            CRICKIFY
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((c) => !c)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-[57px] z-30 flex-col gap-1 border-b border-slate-100 bg-white px-4 pb-4 pt-2 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Marketplace
          </NavLink>
          <NavLink to="/sell" className={linkClass} onClick={() => setMenuOpen(false)}>
            Sell Gear
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}

          <div className="md:ml-3 md:pl-3 md:border-l md:border-slate-200">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-semibold text-slate-700 md:block">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
