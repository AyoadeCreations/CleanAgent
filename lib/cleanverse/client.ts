import type { RiskLevel } from "@/lib/types";

export const CLEANVERSE_MOCK_ENABLED =
  process.env.NEXT_PUBLIC_CLEANVERSE_MOCK === "true" || !process.env.CLEANVERSE_BASE_URL;

export async function delay(ms: number): Promise<void> {
  if (CLEANVERSE_MOCK_ENABLED) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hashToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function hashToRange(input: string, min: number, max: number): number {
  const h = hashToNumber(input);
  return min + (h % (max - min + 1));
}

export function riskScoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export async function cleanverseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.CLEANVERSE_BASE_URL;
  if (!baseUrl) throw new Error("CLEANVERSE_BASE_URL not configured");
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Cleanverse API error ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

export async function withFallback<T>(fn: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (!CLEANVERSE_MOCK_ENABLED) {
    try {
      return await fn();
    } catch {
      // fall through to mock when the upstream service is unreachable
    }
  }
  return fallback();
}
