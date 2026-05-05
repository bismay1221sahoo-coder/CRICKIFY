import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/40 glass">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto_auto]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                CR
              </span>
              <span className="text-lg font-black text-slate-900">CRICKIFY</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
              A trusted local marketplace for buying and selling second-hand cricket equipment. Every listing is admin-verified.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Marketplace</p>
            <div className="grid gap-2">
              {[
                { to: "/", label: "Browse Listings" },
                { to: "/sell", label: "Sell Gear" },
                { to: "/my-listings", label: "My Listings" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Categories</p>
            <div className="grid gap-2">
              {["Bats", "Gloves", "Pads", "Helmets", "Shoes", "Full Kits"].map((cat) => (
                <span key={cat} className="text-sm font-semibold text-slate-600">{cat}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CRICKIFY. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Built for cricket players 🏏
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
