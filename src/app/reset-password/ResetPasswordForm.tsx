"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  token: string;
}

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "InvalidToken") {
          setError("This reset link is invalid. Please request a new one.");
        } else if (data.error === "ExpiredToken") {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      router.push("/sign-in?reset=true");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">New password</label>
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
            <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm new password</label>
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
            {loading ? "Resetting…" : "Reset password"}
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
