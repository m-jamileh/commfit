"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@commfit/ui";

export default function TechLoginPage() {
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
    if (email.includes("@tech.") || email.includes("@commfit.com")) {
      document.cookie = "commfit-tech-session=demo; path=/; max-age=86400; SameSite=Lax";
      router.push("/today");
    } else {
      setError("Use your @tech. technician email to log in.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary px-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent mb-3">
            <span className="text-2xl font-bold text-white font-display">CF</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-primary-foreground">Field App</h1>
          <p className="text-sm text-primary-foreground/70 mt-1">Comm-Fit Technician Portal</p>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@tech.commfit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
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
        </div>
      </div>
    </div>
  );
}
