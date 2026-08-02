import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CleanFlow",
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to your CleanFlow workspace.">
      <LoginForm />
    </AuthShell>
  );
}
