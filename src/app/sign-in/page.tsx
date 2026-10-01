import { SignInForm } from "./SignInForm";
import { AuthShell } from "@/components/shared/AuthShell";

interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string; verified?: string; reset?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <AuthShell>
      <SignInForm
        callbackUrl={params.callbackUrl ?? "/dashboard"}
        urlError={params.error}
        registered={params.registered === "1"}
        verified={params.verified === "true"}
        reset={params.reset === "true"}
      />
    </AuthShell>
  );
}
