import { NextRequest } from "next/server";
import { evaluateTransaction, generateComplianceReport, calculateRiskScore, riskScoreToLevel } from "@/lib/cleanverse";
import { hashToRange, delay } from "@/lib/cleanverse/client";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

function walletFor(seed: string): string {
  const base = "0x1f9090aae28b8a3dceadf281b0f12828e676c326";
  const h = hashToRange(seed, 0, 9999);
  return `${base.slice(0, 6)}${h.toString(16).padStart(4, "0")}${base.slice(10)}`;
}

const DEMO_RULES = [
  { id: "demo-allowlist", name: "Supplier allowlist", type: "ALLOWLIST", action: "BLOCK", enabled: true, priority: 1 },
  { id: "demo-cap", name: "Per-transaction cap", type: "MAX_AMOUNT", action: "BLOCK", enabled: true, priority: 2 },
  { id: "demo-blocklist", name: "Sanctions blocklist", type: "BLOCKLIST", action: "BLOCK", enabled: true, priority: 3 },
  { id: "demo-risk", name: "Risk score threshold", type: "RISK_THRESHOLD", action: "FLAG", enabled: true, priority: 4 },
];

const DEMO_RULE_CONDITIONS: Record<string, Record<string, unknown>> = {
  "demo-allowlist": { field: "receiver", operator: "in", value: ["0x1f9090aae28b8a3dceadf281b0f12828e676c326", walletFor("f1"), walletFor("f2"), walletFor("f3")] },
  "demo-cap": { field: "amount", operator: "lte", value: 25_000 },
  "demo-blocklist": { field: "receiver", operator: "in", value: [walletFor("bad"), "0x000000000000000000000000000000000000dead"] },
  "demo-risk": { field: "riskScore", operator: "lt", value: 70 },
};

interface StepResult {
  step: string;
  [key: string]: unknown;
}

async function runStep(step: string, body: Record<string, unknown>): Promise<StepResult> {
  switch (step) {
    case "merchant": {
      const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Helios Logistics";
      const industry = typeof body.industry === "string" && body.industry.trim() ? body.industry.trim() : "Freight & logistics";
      const merchantWallet = walletFor(`merchant-${name}`);
      return {
        step,
        name,
        industry,
        merchantId: hashToRange(`merchant-${name}`, 1000, 9999).toString(),
        walletAddress: merchantWallet,
        kycLevel: 2,
        message: `Onboarded ${name} with KYC level 2.`,
      };
    }

    case "cvi": {
      const merchantName = typeof body.name === "string" ? body.name : "Helios Logistics";
      await delay(900);
      const cviRef = `cvi-${merchantName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 12)}-${hashToRange(`cvi-${merchantName}`, 1000, 9999)}`;
      return {
        step,
        verified: true,
        reference: cviRef,
        provider: "CVI",
        documents: ["Certificate of incorporation", "UEN", "Beneficial ownership"],
        identityScore: 96,
        message: "Identity verified against national registries.",
      };
    }

    case "cva": {
      const assetType = typeof body.assetType === "string" ? body.assetType : "USDC";
      await delay(900);
      return {
        step,
        verified: true,
        reference: `cva-${assetType.toLowerCase()}-${hashToRange(`cva-${assetType}`, 1000, 9999)}`,
        provider: "CVA",
        assetType,
        liquidity: assetType === "USDC" ? "USDC · fiat-backed, audited monthly" : "On-chain treasury asset",
        assetScore: 92,
        message: `${assetType} treasury asset verified.`,
      };
    }

    case "agent": {
      const agentName = typeof body.agentName === "string" && body.agentName.trim() ? body.agentName.trim() : "Payables Agent";
      const dailyLimit = typeof body.dailyLimit === "number" ? body.dailyLimit : 10_000;
      const monthlyLimit = dailyLimit * 22;
      return {
        step,
        agentId: `agt-${hashToRange(`agent-${agentName}`, 1000, 9999)}`,
        name: agentName,
        walletAddress: walletFor(`agent-${agentName}`),
        permissions: ["TRANSFER", "PAYMENT", "PAYROLL", "SUPPLIER_PAYMENT"],
        dailyLimit,
        monthlyLimit,
        status: "ACTIVE",
        message: `Agent "${agentName}" activated with a ${dailyLimit.toLocaleString()} daily spend limit.`,
      };
    }

    case "rules": {
      const allowlist = DEMO_RULE_CONDITIONS["demo-allowlist"].value as string[];
      return {
        step,
        rules: DEMO_RULES,
        conditions: DEMO_RULE_CONDITIONS,
        allowlist,
        ruleCount: DEMO_RULES.length,
        message: `${DEMO_RULES.length} compliance policies compiled into the tenant's CCP.`,
      };
    }

    case "transaction": {
      const amount = typeof body.amount === "number" ? body.amount : 4_200;
      const assetType = typeof body.assetType === "string" ? body.assetType : "USDC";
      const receiverRaw = typeof body.receiver === "string" ? body.receiver : "";
      const receiver = /^0x[a-fA-F0-9]{40}$/.test(receiverRaw) ? receiverRaw : walletFor("f1");
      const sender = walletFor("merchant-helios-logistics");
      const reference = typeof body.reference === "string" && body.reference.trim() ? body.reference.trim() : "INV-2026-001";

      const riskScore = calculateRiskScore({ sender, receiver, amount, assetType, reference, isVerified: true, assetVerified: true });
      const rules = DEMO_RULES.map((r) => ({ ...r, conditions: DEMO_RULE_CONDITIONS[r.id] ?? {} }));
      const result = await evaluateTransaction({ sender, receiver, amount, assetType, reference, dailyLimit: 10_000 }, rules);

      return {
        step,
        transactionId: `tx-${hashToRange(`tx-${reference}-${amount}`, 1000, 9999)}`,
        reference,
        sender,
        receiver,
        amount,
        assetType,
        riskScore,
        riskLevel: riskScoreToLevel(riskScore),
        decisions: result.decisions,
        flags: result.flags,
        approved: result.approved,
        message: result.approved
          ? "Transaction passed all policy checks."
          : "Transaction was blocked by compliance policy.",
      };
    }

    case "settlement": {
      const amount = typeof body.amount === "number" ? body.amount : 4_200;
      const assetType = typeof body.assetType === "string" ? body.assetType : "USDC";
      const reference = typeof body.reference === "string" ? body.reference : "INV-2026-001";
      await delay(800);
      return {
        step,
        settled: true,
        amount,
        assetType,
        reference,
        settlementRef: `stl-${hashToRange(`stl-${reference}`, 1000, 9999)}`,
        fee: Math.round(amount * 0.001 * 100) / 100,
        message: `${amount.toLocaleString()} ${assetType} released to the verified receiver.`,
      };
    }

    case "audit": {
      const name = typeof body.name === "string" ? body.name : "Helios Logistics";
      const amount = typeof body.amount === "number" ? body.amount : 4_200;
      const assetType = typeof body.assetType === "string" ? body.assetType : "USDC";
      const reference = typeof body.reference === "string" ? body.reference : "INV-2026-001";
      const receiver = typeof body.receiver === "string" && /^0x[a-fA-F0-9]{40}$/.test(body.receiver)
        ? body.receiver
        : walletFor("f1");

      const periodStart = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      const periodEnd = new Date();
      const sender = walletFor("merchant-helios-logistics");
      const tx = {
        id: `demo-${hashToRange(`tx-${reference}`, 1000, 9999)}`,
        reference,
        sender,
        receiver,
        amount,
        assetType,
        type: "PAYMENT",
        createdAt: periodEnd,
        riskScore: calculateRiskScore({ sender, receiver, amount, assetType, reference, isVerified: true, assetVerified: true }),
        riskLevel: "LOW",
        status: "EXECUTED",
      };

      const { data, reportHash } = generateComplianceReport({
        userId: "demo",
        periodStart,
        periodEnd,
        transactions: [tx],
      });

      return {
        step,
        reportId: `demo-${hashToRange(`report-${reference}`, 1000, 9999)}`,
        reportHash,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalVolume: data.totalVolume,
        transactions: data.transactions,
        flags: data.flags,
        blocked: data.blocked,
        entries: data.entries,
        merchant: name,
        message: "Signed compliance report generated for the demo walkthrough.",
      };
    }

    default:
      throw new Error(`Unknown demo step: ${step}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const step = typeof body.step === "string" ? body.step : "";
    if (!step) return fail("Missing demo step", 400, "BAD_REQUEST");
    const result = await runStep(step, body.input as Record<string, unknown>);
    return ok(result);
  } catch (error) {
    console.error("[demo]", error);
    return fail("Demo step failed", 500, "INTERNAL");
  }
}
