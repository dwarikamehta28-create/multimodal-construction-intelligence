
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError(
      "Login is not connected to an authentication server yet. Please use the demo workspace.",
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link className="auth-brand" to="/">
          <span className="wordmark-icon"><Building2 size={21} /></span>
          <span>buildwise<span className="wordmark-ai">.ai</span></span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-kicker">CONSTRUCTION INTELLIGENCE</span>
          <h1>See the site.<br />Understand the numbers.<br /><span>Move forward.</span></h1>
          <p>
            Bring project progress, site information, and financial visibility
            into one workspace.
          </p>
          <div className="auth-trust">
            <ShieldCheck size={18} />
            <span>A connected view of your construction projects</span>
          </div>
        </div>

        <span className="auth-image-credit">BUILDWISE AI · PROJECT WORKSPACE</span>
      </section>

      <section className="auth-form-side">
        <Link to="/" className="back-home">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="wordmark-icon"><Building2 size={21} /></span>
            <strong>buildwise<span className="wordmark-ai">.ai</span></strong>
          </div>

          <span className="section-label">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className="auth-subtitle">
            Access your construction project overview.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={17} />
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="button button-green auth-submit" type="submit">
              Sign in <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <button
            className="button demo-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Explore demo workspace <ArrowRight size={16} />
          </button>

          <p className="auth-switch">
            New to BuildWise AI? <Link to="/signup">Create an account</Link>
          </p>
          <p className="auth-disclaimer">
            Demo version. Authentication is not connected to a server yet.
          </p>
        </div>
      </section>
    </main>
  );
}
