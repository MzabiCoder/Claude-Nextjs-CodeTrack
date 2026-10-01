import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-background px-4">
      <div className="aura-field" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="ring-highlight space-y-4 rounded-2xl border border-border bg-card/80 p-6 text-center backdrop-blur-xl shadow-lifted sm:p-7">
          <div className="text-4xl">📬</div>
          <div>
            <h1 className="text-xl font-semibold">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              We sent you a verification link. Click it to activate your account.
              The link expires in 24 hours.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t get it? Check your spam folder.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already verified?{" "}
          <Link
            href="/sign-in"
            className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
