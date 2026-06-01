"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      toast.success("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="text-base font-semibold">Change password</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="currentPassword">Current password</label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="••••••••"
            value={form.currentPassword}
            onChange={update("currentPassword")}
            required
            suppressHydrationWarning
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="newPassword">New password</label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={form.newPassword}
            onChange={update("newPassword")}
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

        <Button type="submit" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
