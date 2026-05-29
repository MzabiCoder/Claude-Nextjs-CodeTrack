"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [oauthOnly, setOauthOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.oauthOnly) {
        setOauthOnly(true);
        return;
      }

      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (oauthOnly) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
          <div className="text-4xl">🔗</div>
          <div>
            <h1 className="text-xl font-semibold">GitHub account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              This email is linked to a GitHub account. Sign in with GitHub — there&apos;s no password to reset.
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          <a href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Back to sign in
          </a>
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <div>
            <h1 className="text-xl font-semibold">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              If an account exists for <span className="text-foreground font-medium">{email}</span>, we&apos;ve sent a reset link. It expires in 1 hour.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Didn&apos;t get it? Check your spam folder.</p>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          <a href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Back to sign in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter your email and we&apos;ll send a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        <a href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Back to sign in
        </a>
      </p>
    </div>
  );
}
