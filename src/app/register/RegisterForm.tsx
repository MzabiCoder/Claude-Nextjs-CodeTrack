"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.skipVerification) {
        toast.success("Account created! You can now sign in.");
        router.push("/sign-in?registered=1");
      } else {
        toast.success("Account created! Check your inbox to verify your email.");
        router.push("/verify-email");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Start your DevStash</p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={loading || githubLoading}
          onClick={() => {
            setGithubLoading(true);
            signIn("github", { callbackUrl: "/dashboard" });
          }}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          {githubLoading ? "Redirecting…" : "Continue with GitHub"}
        </Button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <hr className="flex-1 border-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <Input
              id="name"
              placeholder="Your name"
              value={form.name}
              onChange={update("name")}
              required
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
              required
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
              suppressHydrationWarning
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{" "}
        <a href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
}
