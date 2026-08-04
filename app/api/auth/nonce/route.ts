import { fail, ok, readJson, ApiError } from "@/lib/api";
import { issueWalletNonce } from "@/lib/auth/nonce";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().toLowerCase() : "";
    if (!WALLET_RE.test(walletAddress)) {
      throw new ApiError("INVALID_WALLET", 400, "Wallet address must be a valid EVM address.");
    }
    const { nonce, message } = await issueWalletNonce(walletAddress);
    return ok({ nonce, message });
  } catch (error) {
    if (error instanceof ApiError) return fail(error.code, error.status, error.code);
    console.error("[auth/nonce]", error);
    return fail("Failed to issue nonce", 500, "INTERNAL");
  }
}
