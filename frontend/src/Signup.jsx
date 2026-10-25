
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import "./Auth.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "Account registration is not connected to a server yet. You can explore the demo workspace from the login page.",
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
          <span className="auth-kicker">YOUR PROJECTS. ONE WORKSPACE.</span>
          <h1>Make every<br />project decision<br /><span>more informed.</span></h1>
          <p>
            Bring progress tracking, site observations, and project financials
            together in a clearer view.
          </p>
          <div className="auth-trust">
            <Building2 size={18} />
            <span>A smarter way to oversee construction projects</span>
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

          <span className="section-label">GET STARTED</span>
          <h2>Create your workspace</h2>
          <p className="auth-subtitle">
            Set up your profile to explore BuildWise AI.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="signup-name">Full name</label>
            <div className="auth-input-wrap">
              <UserRound size={17} />
              <input
                id="signup-name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <label htmlFor="signup-email">Work email</label>
            <div className="auth-input-wrap">
              <Mail size={17} />
              <input
                id="signup-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="signup-password">Create password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
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

            {message && <p className="auth-error">{message}</p>}

            <button className="button button-green auth-submit" type="submit">
              Create account <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-disclaimer">
            Demo version. Account registration is not connected to a server yet.
          </p>
        </div>
      </section>
    </main>
  );
}
