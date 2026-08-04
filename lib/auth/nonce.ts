import "server-only";
import { randomBytes } from "node:crypto";
import { verifyMessage, type Address, type Hex } from "viem";
import { db } from "@/lib/database/client";
import { ApiError } from "@/lib/api";

const NONCE_TTL_MS = 10 * 60 * 1000;
const NONCE_RE = /^[0-9a-f]{64}$/;

export function buildWalletMessage(walletAddress: string, nonce: string): string {
  return `Sign in to CleanFlow\n\nWallet: ${walletAddress}\nNonce: ${nonce}`;
}

export async function issueWalletNonce(walletAddress: string): Promise<{ nonce: string; message: string }> {
  const nonce = randomBytes(32).toString("hex");
  await db.walletNonce.upsert({
    where: { walletAddress },
    update: { nonce, expiresAt: new Date(Date.now() + NONCE_TTL_MS) },
    create: { walletAddress, nonce, expiresAt: new Date(Date.now() + NONCE_TTL_MS) },
  });
  return { nonce, message: buildWalletMessage(walletAddress, nonce) };
}

export async function verifyWalletProof(walletAddress: string, nonce: string, signature: string): Promise<boolean> {
  if (!NONCE_RE.test(nonce)) return false;
  const record = await db.walletNonce.findUnique({ where: { walletAddress } });
  if (!record || record.nonce !== nonce) return false;
  if (record.expiresAt.getTime() < Date.now()) return false;

  const message = buildWalletMessage(walletAddress, nonce);
  let valid = false;
  try {
    valid = await verifyMessage({ address: walletAddress as Address, message, signature: signature as Hex });
  } catch {
    valid = false;
  }
  if (!valid) return false;

  await db.walletNonce.delete({ where: { walletAddress } }).catch(() => {});
  return true;
}

export async function requireWalletProof(walletAddress: string, nonce: string, signature: string): Promise<void> {
  const valid = await verifyWalletProof(walletAddress, nonce, signature);
  if (!valid) {
    throw new ApiError("INVALID_SIGNATURE", 401, "Wallet signature could not be verified.");
  }
}
