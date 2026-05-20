import { SignInForm } from "./SignInForm";

interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignInForm
        callbackUrl={params.callbackUrl ?? "/dashboard"}
        urlError={params.error}
      />
    </div>
  );
}
