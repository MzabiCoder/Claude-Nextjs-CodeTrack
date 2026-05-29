import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
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
