"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  callbackUrl: string;
  urlError?: string;
  registered?: boolean;
  verified?: boolean;
  reset?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallbackError: "GitHub sign-in failed. Please try again.",
  OAuthSignin: "GitHub sign-in failed. Please try again.",
  CredentialsSignin: "Invalid email or password.",
  unverified: "Please verify your email before signing in. Check your inbox.",
  InvalidToken: "This verification link is invalid.",
  ExpiredToken: "This verification link has expired. Please register again.",
  rate_limited: "Too many sign-in attempts. Please try again in a few minutes.",
};

export function SignInForm({ callbackUrl, urlError, registered, verified, reset }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"github" | "credentials" | null>(null);
  const [credError, setCredError] = useState<string | null>(null);
  const router = useRouter();

  const errorMessage = urlError
    ? (ERROR_MESSAGES[urlError] ?? "Something went wrong. Please try again.")
    : null;

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading("credentials");
    setCredError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setCredError(ERROR_MESSAGES[result.error] ?? "Something went wrong. Please try again.");
      setLoading(null);
    } else {
      router.refresh();
      router.push(callbackUrl);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back</p>
        </div>

        {reset && (
          <p className="text-sm text-emerald-400">Password reset — you can now sign in with your new password.</p>
        )}

        {!reset && verified && (
          <p className="text-sm text-emerald-400">Email verified — you can now sign in.</p>
        )}

        {!reset && !verified && registered && (
          <p className="text-sm text-emerald-400">Account created — check your inbox to verify your email.</p>
        )}

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button
          variant="outline"
          className="w-full"
          disabled={loading !== null}
          onClick={() => {
            setLoading("github");
            signIn("github", { callbackUrl });
          }}
        >
          <svg
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          {loading === "github" ? "Redirecting…" : "Continue with GitHub"}
        </Button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <hr className="flex-1 border-border" />
        </div>

        <form onSubmit={handleCredentials} className="space-y-3">
          {credError && (
            <p className="text-sm text-destructive">{credError}</p>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading !== null}
          >
            {loading === "credentials" ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Sign up
        </a>
      </p>
    </div>
  );
}
