import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Tag, Zap } from "lucide-react";
import CategoryIcon from "../components/CategoryIcon";

const CATEGORIES = [
  { id: "BAT", label: "Cricket Bats", description: "English & Kashmir Willow" },
  { id: "GLOVES", label: "Batting Gloves", description: "Pro-grade protection" },
  { id: "PADS", label: "Leg Guards", description: "Lightweight batting pads" },
  { id: "HELMET", label: "Helmets", description: "Safety certified gear" },
  { id: "SHOES", label: "Shoes", description: "Spikes & rubber studs" },
  { id: "KIT", label: "Full Kits", description: "Complete gear bags" },
  { id: "OTHER", label: "Accessories", description: "Balls, grips, & more" },
];

function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="fade-in-up space-y-8">
              <div>
                <span className="chip chip-brand-soft mb-4">
                  <ShieldCheck size={12} className="mr-1" />
                  Admin Verified Marketplace
                </span>
                <h1 className="text-5xl font-black leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
                  Buy & sell used <br />
                  <span className="text-brand">cricket gear</span> <br />
                  with confidence.
                </h1>
                <p className="mt-6 max-w-lg text-lg text-muted">
                  The most trusted platform for local players to trade verified gear. 
                  No scams, just pure cricket.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/sell" className="btn-primary py-4 px-8 text-base">
                  List your gear
                  <ArrowRight size={18} />
                </Link>
                <Link to="/categories/ALL" className="btn-ghost py-4 px-8 text-base">
                  Browse marketplace
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
                {[
                  { icon: CheckCircle2, label: "Verified", sub: "Manually checked" },
                  { icon: Zap, label: "Local", sub: "In your city" },
                  { icon: Tag, label: "Zero Fee", sub: "Free to list" },
                  { icon: ShieldCheck, label: "Secure", sub: "Peer-to-peer" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1.5">
                    <stat.icon size={20} className="text-brand" />
                    <div>
                      <p className="text-sm font-bold text-ink">{stat.label}</p>
                      <p className="text-[11px] font-medium text-muted">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-surface shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1400&auto=format&fit=crop" 
                  alt="Cricket match" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 surface-card p-6 shadow-xl elevated fade-in-up">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-10 w-10 rounded-full border-2 border-surface bg-slate-200 overflow-hidden`}>
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Join 2,000+ players</p>
                    <p className="text-xs text-muted">Trading gear every month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="bg-surface py-20 sm:py-24 border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-ink sm:text-4xl">Browse by category</h2>
            <p className="mt-2 text-muted">Find exactly what you need for your next match</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Link 
              to="/categories/ALL"
              className="surface-card card-hover group flex flex-col items-center justify-center p-8 text-center sm:col-span-1"
            >
              <div className="mb-4 rounded-2xl bg-brand-weak p-4 text-brand transition-colors group-hover:bg-brand group-hover:text-on-brand">
                <CategoryIcon name="ALL" size={32} />
              </div>
              <h3 className="font-bold text-ink">All Marketplace</h3>
              <p className="text-xs text-muted mt-1">View all gear</p>
            </Link>

            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="surface-card card-hover group flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="mb-4 rounded-2xl bg-surface-2 p-4 text-muted transition-colors group-hover:bg-brand group-hover:text-on-brand">
                  <CategoryIcon name={cat.id} size={32} />
                </div>
                <h3 className="font-bold text-ink">{cat.label}</h3>
                <p className="text-xs text-muted mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-12 text-center text-white sm:px-16 sm:py-20">
            <div className="absolute inset-0 opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop" 
                alt="Stadium background" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">Ready to upgrade your game?</h2>
              <p className="mt-4 text-slate-300">List your unused gear today and get it in front of thousands of local players.</p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/sell" className="btn-primary bg-white text-ink hover:bg-slate-100 px-10">
                  List Gear Now
                </Link>
                <Link to="/categories/ALL" className="btn-ghost border-slate-700 text-white hover:bg-white/10 px-10">
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
