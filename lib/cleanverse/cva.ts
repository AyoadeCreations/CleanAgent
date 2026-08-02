import { cleanverseFetch, delay, hashToRange, withFallback } from "./client";

export interface AssetVerification {
  assetId: string;
  name: string;
  symbol: string | null;
  verified: boolean;
  riskScore: number;
  provider: string;
  reference: string;
}

interface CvaAssetRequest {
  name: string;
  symbol?: string;
  assetType: string;
  contractAddress?: string;
  owner: string;
}

interface CvaAssetResponse {
  status: AssetVerification;
}

const reference = (seed: string) => `cva-ast-${seed.padStart(4, "0")}`;

function mockAsset(req: CvaAssetRequest): AssetVerification {
  const riskScore = hashToRange(req.contractAddress ?? req.name, 0, 55);
  const assetId = `cva-${req.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  return {
    assetId,
    name: req.name,
    symbol: req.symbol ?? null,
    verified: riskScore < 40,
    riskScore,
    provider: "CVA",
    reference: reference(req.name),
  };
}

/**
 * Verify an asset through the Cleanverse Asset Registry (CVA).
 */
export async function verifyAsset(req: CvaAssetRequest): Promise<AssetVerification> {
  await delay(400);
  return withFallback(
    async () => {
      const res = await cleanverseFetch<CvaAssetResponse>("/v1/cva/verify", {
        method: "POST",
        body: JSON.stringify(req),
      });
      return res.status;
    },
    () => mockAsset(req),
  );
}

export async function getAssetRiskScore(contractAddress: string): Promise<{ riskScore: number }> {
  await delay(180);
  return withFallback(
    async () => cleanverseFetch<{ riskScore: number }>(`/v1/cva/risk/${contractAddress}`),
    () => ({ riskScore: hashToRange(contractAddress, 0, 80) }),
  );
}
