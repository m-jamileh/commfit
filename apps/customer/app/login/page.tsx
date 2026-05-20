"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@commfit/ui";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email.includes("@")) {
      router.push("/overview");
    } else {
      setError("Please enter a valid email address.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent mb-3">
            <span className="text-xl font-bold text-white font-display">CF</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Customer Portal</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your fitness facilities</p>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-md p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-center text-text-muted mt-4">
            Demo: use any email with any password to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
