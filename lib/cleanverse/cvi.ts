import { cleanverseFetch, delay, hashToRange, withFallback } from "./client";

export interface IdentityStatus {
  walletAddress: string;
  verified: boolean;
  level: number;
  provider: string;
  reference: string;
  checkCount: number;
}

interface CviVerificationRequest {
  walletAddress: string;
  name?: string;
  email?: string;
}

interface CviVerificationResponse {
  status: IdentityStatus;
}

const reference = (seed: string) => `cvi-ver-${seed.padStart(4, "0")}`;

function mockIdentity(walletAddress: string): IdentityStatus {
  const level = hashToRange(walletAddress, 0, 3);
  return {
    walletAddress,
    verified: level >= 1,
    level,
    provider: "CVI",
    reference: reference(walletAddress),
    checkCount: hashToRange(walletAddress.slice(2, 12), 1, 40),
  };
}

/**
 * Verify a wallet identity through the Cleanverse Identity Registry (CVI).
 * Falls back to deterministic mock data when the upstream service is unavailable.
 */
export async function verifyIdentity(req: CviVerificationRequest): Promise<IdentityStatus> {
  await delay(450);
  return withFallback(
    async () => {
      const res = await cleanverseFetch<CviVerificationResponse>("/v1/cvi/verify", {
        method: "POST",
        body: JSON.stringify(req),
      });
      return res.status;
    },
    () => mockIdentity(req.walletAddress),
  );
}

export async function getVerificationStatus(walletAddress: string): Promise<IdentityStatus> {
  await delay(200);
  return withFallback(
    async () => {
      const res = await cleanverseFetch<CviVerificationResponse>(`/v1/cvi/status/${walletAddress}`);
      return res.status;
    },
    () => mockIdentity(walletAddress),
  );
}

export async function revokeIdentity(walletAddress: string): Promise<{ revoked: boolean }> {
  await delay(350);
  return withFallback(
    async () => cleanverseFetch<{ revoked: boolean }>(`/v1/cvi/revoke/${walletAddress}`, { method: "POST" }),
    () => ({ revoked: true }),
  );
}
