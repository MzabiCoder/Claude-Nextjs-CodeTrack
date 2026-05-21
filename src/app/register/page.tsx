import { RegisterForm } from "./RegisterForm";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <RegisterForm />
    </div>
  );
}
