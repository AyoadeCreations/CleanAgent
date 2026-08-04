import type { SessionUser } from "@/lib/types";

export class ClientApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new ClientApiError(data.error ?? "Request failed", data.code);
  return data.data as T;
}

export async function requestWalletNonce(walletAddress: string): Promise<{ nonce: string; message: string }> {
  return postJson<{ nonce: string; message: string }>("/api/auth/nonce", { walletAddress });
}

export async function loginWithEmail(email: string, password: string): Promise<SessionUser> {
  const data = await postJson<{ user: SessionUser }>("/api/auth/session", { email, password });
  return data.user;
}

export async function loginWithWallet(
  walletAddress: string,
  nonce: string,
  signature: string,
  autoRegister = true
): Promise<SessionUser> {
  const data = await postJson<{ user: SessionUser }>("/api/auth/session", { walletAddress, nonce, signature, autoRegister });
  return data.user;
}

export async function registerAccount(input: {
  walletAddress: string;
  nonce: string;
  signature: string;
  email?: string;
  name?: string;
  role?: "MERCHANT" | "BUSINESS";
  sign: (message: string) => Promise<string>;
}): Promise<SessionUser> {
  await postJson("/api/user/create", {
    walletAddress: input.walletAddress,
    nonce: input.nonce,
    signature: input.signature,
    email: input.email,
    name: input.name,
    role: input.role,
  });

  const fresh = await requestWalletNonce(input.walletAddress);
  const freshSignature = await input.sign(fresh.message);
  return loginWithWallet(input.walletAddress, fresh.nonce, freshSignature, false);
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
  return postJson<{
    verified: boolean;
    level: number;
    reference: string;
    checkCount: number;
  }>("/api/verify", { walletAddress });
}

export async function createBusiness(input: {
  name: string;
  description?: string;
}): Promise<{ id: string; name: string; status: string }> {
  return postJson("/api/business", input);
}