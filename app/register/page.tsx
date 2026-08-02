import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a CleanFlow account",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Connect a wallet to get started. Identity verification is next."
    >
      <RegisterForm />
    </AuthShell>
  );
}
