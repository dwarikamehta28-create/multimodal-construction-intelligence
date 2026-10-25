
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Layers3,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import "./App.css";

const features = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Site safety intelligence",
    description:
      "Review site images for visible hazards and safety concerns, with actionable guidance and clear limitations.",
  },
  {
    number: "02",
    icon: Layers3,
    title: "Construction progress",
    description:
      "Track completed work, pending milestones, project timelines, and overall delivery status.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Financial visibility",
    description:
      "Compare project budgets, actual spending, and revenue to understand financial performance.",
  },
  {
    number: "04",
    icon: MapPin,
    title: "Site intelligence",
    description:
      "Keep project locations, site information, and operational insights accessible in one workspace.",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing">
      <header className="site-nav">
        <Link className="wordmark" to="/" aria-label="BuildWise AI home">
          <span className="wordmark-icon">
            <Building2 size={21} strokeWidth={2.2} />
          </span>
          <span>
            buildwise<span className="wordmark-ai">.ai</span>
            <small>CONSTRUCTION INTELLIGENCE</small>
          </span>
        </Link>

        <button
          className="mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link className="nav-login" to="/login">Log in</Link>
          <Link className="button button-green nav-cta" to="/signup">
            Get started <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="hero" id="platform">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            THE INTELLIGENCE LAYER FOR CONSTRUCTION
          </div>

          <h1>
            Build with
            <br />
            <span>clarity.</span> Deliver
            <br />
            with confidence.
          </h1>

          <p className="hero-description">
            One workspace for construction progress, site insights, and
            project financials. Turn project data into decisions you can act on.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="button button-green">
              Explore the platform <ArrowRight size={17} />
            </Link>
            <a href="#capabilities" className="button button-outline">
              Discover capabilities <ArrowDownRight size={17} />
            </a>
          </div>

          <div className="hero-footnote">
            <ShieldCheck size={16} />
            Designed for visibility, accountability, and better decisions.
          </div>
        </div>

        <div className="hero-index">
          <span>01 / 04</span>
          <span className="index-line" />
          <span>PROJECT INTELLIGENCE</span>
        </div>

        <div className="hero-note">
          <span className="note-icon"><Sparkles size={16} /></span>
          <div>
            <strong>One connected view</strong>
            <span>Progress · Site · Financials</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>BUILT AROUND THE REALITIES OF CONSTRUCTION</span>
        <div><ClipboardCheck size={16} /> Project oversight</div>
        <div><TrendingUp size={16} /> Financial visibility</div>
        <div><CircleDot size={16} /> Site intelligence</div>
      </section>

      <section className="intro-section" id="workflow">
        <div className="section-label">A BETTER WAY TO BUILD</div>
        <div className="intro-grid">
          <h2>
            Complex projects.
            <br />
            <span>One clearer picture.</span>
          </h2>
          <div className="intro-copy">
            <p>
              Construction teams work across site reports, schedules,
              budgets, and photographs. BuildWise AI brings these perspectives
              into a unified project workspace.
            </p>
            <Link className="text-link" to="/signup">
              See the workspace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="capabilities-section" id="capabilities">
        <div className="capabilities-heading">
          <div>
            <div className="section-label">THE PLATFORM</div>
            <h2>Built for the bigger picture.</h2>
          </div>
          <p>
            Practical tools to understand what is happening on site and what
            needs attention next.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.number}>
                <div className="feature-top">
                  <span>{feature.number}</span>
                  <Icon size={23} strokeWidth={1.6} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to="/signup" aria-label={`Explore ${feature.title}`}>
                  Explore <ChevronRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="closing-section">
        <div>
          <div className="section-label">YOUR NEXT PROJECT STARTS HERE</div>
          <h2>
            Less uncertainty.
            <br />
            <span>More informed decisions.</span>
          </h2>
        </div>
        <Link className="button button-light" to="/signup">
          Get started <ArrowUpRight size={17} />
        </Link>
      </section>

      <footer className="site-footer">
        <Link className="wordmark footer-wordmark" to="/">
          <span className="wordmark-icon"><Building2 size={19} /></span>
          <span>buildwise<span className="wordmark-ai">.ai</span></span>
        </Link>
        <p>Construction intelligence, brought together.</p>
        <div className="footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Create account</Link>
        </div>
        <span className="copyright">© 2026 BuildWise AI · Project demonstration</span>
      </footer>
    </main>
  );
}

export default App;
