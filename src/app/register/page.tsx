import { RegisterForm } from "./RegisterForm";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <>
      <MarketingNav />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
        <RegisterForm />
      </div>
    </>
  );
}
