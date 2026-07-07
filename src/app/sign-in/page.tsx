import { SignInForm } from "./SignInForm";
import { MarketingNav } from "@/components/marketing/MarketingNav";

interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string; verified?: string; reset?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <>
      <MarketingNav />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
        <SignInForm
          callbackUrl={params.callbackUrl ?? "/dashboard"}
          urlError={params.error}
          registered={params.registered === "1"}
          verified={params.verified === "true"}
          reset={params.reset === "true"}
        />
      </div>
    </>
  );
}
