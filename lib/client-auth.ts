import type { SessionUser } from "@/lib/types";

export class ClientApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export async function loginWithEmail(email: string): Promise<SessionUser> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Login failed", data.code);
  return data.data.user as SessionUser;
}

export async function loginWithWallet(walletAddress: string, autoRegister = true): Promise<SessionUser> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, autoRegister }),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Login failed", data.code);
  return data.data.user as SessionUser;
}

export async function registerAccount(input: {
  walletAddress: string;
  email?: string;
  name?: string;
  role?: "MERCHANT" | "BUSINESS";
}): Promise<SessionUser> {
  const res = await fetch("/api/user/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Registration failed", data.code);

  const session = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: input.walletAddress, autoRegister: false }),
  });
  const sessionData = await session.json();
  if (!sessionData.ok) throw new ClientApiError(sessionData.error ?? "Login failed", sessionData.code);
  return sessionData.data.user as SessionUser;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export async function verifyIdentity(walletAddress?: string): Promise<{
  verified: boolean;
  level: number;
  reference: string;
  checkCount: number;
}> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Verification failed", data.code);
  return data.data.status;
}

export async function createBusiness(input: {
  name: string;
  description?: string;
}): Promise<{ id: string; name: string; status: string }> {
  const res = await fetch("/api/business", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Failed to create business", data.code);
  return data.data.business;
}
