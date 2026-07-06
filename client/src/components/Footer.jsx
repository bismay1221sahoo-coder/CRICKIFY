import { Link } from "react-router-dom";
import { AtSign, ExternalLink, Mail, ShoppingBag } from "lucide-react";

function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
                <ShoppingBag size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-ink">CRICKIFY</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The trusted local marketplace for serious cricket players. 
              Buy and sell verified second-hand gear with confidence.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="mailto:hello@crickify.local" className="text-faint hover:text-brand transition-colors" aria-label="Email Crickify">
                <Mail size={20} />
              </a>
              <a href="#" className="text-faint hover:text-brand transition-colors" aria-label="Crickify social profile">
                <AtSign size={20} />
              </a>
              <a href="#" className="text-faint hover:text-brand transition-colors" aria-label="Crickify community link">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-ink">Marketplace</h4>
            <nav className="mt-4 grid gap-3">
              {[
                { to: "/", label: "Browse All" },
                { to: "/sell", label: "Sell Your Gear" },
                { to: "/my-listings", label: "My Submissions" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm font-bold text-muted hover:text-brand transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-ink">Popular Categories</h4>
            <div className="mt-4 grid gap-3">
              {["Bats", "Gloves", "Pads", "Helmets"].map((cat) => (
                <Link 
                  key={cat} 
                  to={`/categories/${cat.toUpperCase()}`} 
                  className="text-sm font-bold text-muted hover:text-brand transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs font-bold text-faint">
            © {new Date().getFullYear()} CRICKIFY. Built for the cricket community.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs font-bold text-faint hover:text-ink">Privacy Policy</Link>
            <Link to="#" className="text-xs font-bold text-faint hover:text-ink">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
