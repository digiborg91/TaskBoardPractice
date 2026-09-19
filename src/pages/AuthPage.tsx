import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error: err } = await fn(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="10" height="24" rx="2" fill="#3b82f6" />
              <rect x="18" y="8" width="10" height="16" rx="2" fill="#10b981" />
              <rect x="18" y="28" width="10" height="4" rx="2" fill="#10b981" opacity="0.5" />
              <rect x="32" y="8" width="4" height="24" rx="2" fill="#6b7280" />
            </svg>
          </div>
          <h1>TaskBoard</h1>
          <p>{mode === "signin" ? "Welcome back. Sign in to your boards." : "Create an account to get started."}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              data-testid="email-input"
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              data-testid="password-input"
            />
          </label>

          {error && (
            <div className="auth-error" data-testid="auth-error">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} data-testid="auth-submit">
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "signin" ? (
            <p>
              No account?{" "}
              <button onClick={() => { setMode("signup"); setError(null); }} data-testid="toggle-signup">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(null); }} data-testid="toggle-signin">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
