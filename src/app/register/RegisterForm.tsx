"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
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

      toast.success("Account created! Check your inbox to verify your email.");
      router.push("/verify-email");
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
