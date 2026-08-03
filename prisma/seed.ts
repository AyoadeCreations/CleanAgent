import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  Role,
  AgentStatus,
  BusinessStatus,
  TransactionStatus,
  TransactionType,
  VerificationStatus,
  RiskLevel,
  AssetKind,
} from "../lib/generated/prisma/enums";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const wallet = (seed: string) => `0x${seed.padStart(40, "0").slice(0, 40)}`;

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600 * 1000);

const merchants = [
  { email: "merchant@cleanflow.dev", name: "Northwind Goods", wallet: "a1" },
  { email: "vida@cleanflow.dev", name: "Vida Coffee Co", wallet: "b2" },
  { email: "arclight@cleanflow.dev", name: "Arclight Retail", wallet: "a3" },
];

const businessOwners = [
  { email: "business@cleanflow.dev", name: "Helios Logistics", wallet: "c3" },
  { email: "northstar@cleanflow.dev", name: "Northstar Freight", wallet: "c4" },
  { email: "meridian@cleanflow.dev", name: "Meridian Trading", wallet: "c5" },
  { email: "bluepeak@cleanflow.dev", name: "Bluepeak Systems", wallet: "c6" },
  { email: "solvant@cleanflow.dev", name: "Solvant Capital", wallet: "c7" },
];

const compliance = { email: "compliance@cleanflow.dev", name: "Ava Sterling", wallet: "d4" };
const admin = { email: "admin@cleanflow.dev", name: "CleanFlow Admin", wallet: "e5" };

const businessProfiles: Array<{ name: string; description: string }> = [
  { name: "Helios Logistics", description: "Cross-border freight forwarding and supplier network." },
  { name: "Northstar Freight", description: "Air and sea cargo consolidation across EMEA." },
  { name: "Meridian Trading", description: "Commodity trading and settlement operations." },
  { name: "Bluepeak Systems", description: "SaaS billing, invoicing, and vendor payouts." },
  { name: "Solvant Capital", description: "Treasury management and receivables financing." },
];

async function main() {
  console.log("Seeding CleanFlow database…");

  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---------------------------------------------------------------
  const merchantUsers: Array<{ id: string; email: string; name: string; walletAddress: string }> = [];
  for (let i = 0; i < merchants.length; i++) {
    const m = merchants[i];
    const user = await prisma.user.create({
      data: {
        email: m.email,
        name: m.name,
        walletAddress: wallet(m.wallet),
        role: Role.MERCHANT,
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        kycLevel: i === 2 ? 1 : 2,
        createdAt: daysAgo(60 - i * 4),
      },
    });
    merchantUsers.push({ id: user.id, email: user.email ?? "", name: user.name ?? "", walletAddress: user.walletAddress });
  }

  const businessUsers: Array<{ id: string; email: string; name: string; walletAddress: string }> = [];
  for (let i = 0; i < businessOwners.length; i++) {
    const b = businessOwners[i];
    const user = await prisma.user.create({
      data: {
        email: b.email,
        name: b.name,
        walletAddress: wallet(b.wallet),
        role: Role.BUSINESS,
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        kycLevel: i === 0 ? 2 : 1,
        createdAt: daysAgo(55 - i * 3),
      },
    });
    businessUsers.push({ id: user.id, email: user.email ?? "", name: user.name ?? "", walletAddress: user.walletAddress });
  }

  const complianceUser = await prisma.user.create({
    data: {
      email: compliance.email,
      name: compliance.name,
      walletAddress: wallet(compliance.wallet),
      role: Role.COMPLIANCE,
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      kycLevel: 3,
      createdAt: daysAgo(70),
    },
  });

  await prisma.user.create({
    data: {
      email: admin.email,
      name: admin.name,
      walletAddress: wallet(admin.wallet),
      role: Role.ADMIN,
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      kycLevel: 3,
      createdAt: daysAgo(70),
    },
  });

  // --- Businesses ----------------------------------------------------------
  const businesses: Array<{ id: string; ownerId: string }> = [];
  for (let i = 0; i < businessUsers.length; i++) {
    const biz = await prisma.business.create({
      data: {
        ownerId: businessUsers[i].id,
        name: businessProfiles[i].name,
        description: businessProfiles[i].description,
        status: i === 4 ? BusinessStatus.PENDING : BusinessStatus.ACTIVE,
        createdAt: daysAgo(50 - i * 2),
      },
    });
    businesses.push({ id: biz.id, ownerId: businessUsers[i].id });
  }
  const business = businesses[0];
  const owner = businessUsers[0];

  // --- Agents --------------------------------------------------------------
  const payablesAgent = await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Payables Bot",
      description: "Executes approved supplier payments within daily budget.",
      dailyLimit: 5000,
      monthlyLimit: 90000,
      permissions: {
        actions: ["TRANSFER", "PAYROLL", "SUPPLIER_PAYMENT"],
        spendLimit: 5000,
        allowlist: [wallet("f1"), wallet("f2"), wallet("f3")],
      },
      status: AgentStatus.ACTIVE,
      createdAt: daysAgo(45),
    },
  });

  await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Treasury Optimizer",
      description: "Moves idle funds between treasury buckets.",
      dailyLimit: 20000,
      monthlyLimit: 200000,
      permissions: {
        actions: ["TRANSFER", "TREASURY_MOVE"],
        spendLimit: 20000,
        allowlist: [wallet("f1"), wallet("f4")],
      },
      status: AgentStatus.ACTIVE,
      createdAt: daysAgo(38),
    },
  });

  const analyzerAgent = await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Market Analyzer",
      description: "Read-only market data agent. No spend permissions.",
      dailyLimit: 0,
      monthlyLimit: 0,
      permissions: { actions: ["READ", "ANALYZE"], spendLimit: 0, allowlist: [] },
      status: AgentStatus.ACTIVE,
      createdAt: daysAgo(30),
    },
  });

  await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Legacy Invoicer",
      description: "Retired invoicing agent.",
      dailyLimit: 1000,
      monthlyLimit: 10000,
      permissions: { actions: ["INVOICE"], spendLimit: 1000, allowlist: [] },
      status: AgentStatus.DEACTIVATED,
      createdAt: daysAgo(60),
    },
  });

  const freightDispatcher = await prisma.agent.create({
    data: {
      ownerId: businessUsers[1].id,
      businessId: businesses[1].id,
      name: "Freight Dispatcher",
      description: "Dispatches approved carrier payments.",
      dailyLimit: 3000,
      monthlyLimit: 40000,
      permissions: {
        actions: ["TRANSFER", "SUPPLIER_PAYMENT"],
        spendLimit: 3000,
        allowlist: [wallet("f7"), wallet("f8")],
      },
      status: AgentStatus.ACTIVE,
      createdAt: daysAgo(20),
    },
  });

  // --- Assets --------------------------------------------------------------
  const assets = [
    { name: "USD Circle Stablecoin", symbol: "USDC", type: AssetKind.TOKEN, risk: 2, ownerIdx: 0 },
    { name: "Monad Wrapped MON", symbol: "WMON", type: AssetKind.TOKEN, risk: 12, ownerIdx: 1 },
    { name: "Ocean Freight Invoice #118", symbol: null, type: AssetKind.RECEIVABLE, risk: 34, ownerIdx: 0 },
    { name: "Origin Pass NFT", symbol: "ORIGIN", type: AssetKind.NFT, risk: 8, ownerIdx: 1 },
    { name: "Port Demurrage Claim #041", symbol: null, type: AssetKind.RECEIVABLE, risk: 46, ownerIdx: 0 },
  ];
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    await prisma.asset.create({
      data: {
        ownerId: a.ownerIdx === 0 ? owner.id : merchantUsers[0].id,
        name: a.name,
        symbol: a.symbol,
        assetType: a.type,
        contractAddress: wallet(`aa${i}`),
        chain: "monad-testnet",
        riskScore: a.risk,
        verified: a.risk < 20,
        metadata: { source: "CVA", verifiedAt: daysAgo(40 - i * 5).toISOString() },
        createdAt: daysAgo(40 - i * 5),
      },
    });
  }

  // --- Rules ---------------------------------------------------------------
  await prisma.rule.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Supplier allowlist",
      description: "Only allow supplier payments to known counterparties.",
      type: "ALLOWLIST",
      conditions: { field: "receiver", operator: "in", value: [wallet("f1"), wallet("f2"), wallet("f3"), wallet("f7"), wallet("f8")] },
      action: "ALLOW",
      priority: 10,
      createdAt: daysAgo(35),
    },
  });
  await prisma.rule.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Per-transaction cap",
      description: "Block any single transaction above $25,000.",
      type: "MAX_AMOUNT",
      conditions: { field: "amount", operator: "lte", value: 25000 },
      action: "ALLOW",
      priority: 20,
      createdAt: daysAgo(35),
    },
  });
  await prisma.rule.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Sanctions blocklist",
      description: "Block transfers to flagged addresses.",
      type: "BLOCKLIST",
      conditions: { field: "receiver", operator: "in", value: [wallet("deadbeef"), wallet("f6")] },
      action: "BLOCK",
      priority: 5,
      createdAt: daysAgo(35),
    },
  });
  await prisma.rule.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "High-risk flag",
      description: "Flag transactions scoring above 70.",
      type: "RISK_THRESHOLD",
      conditions: { field: "riskScore", operator: "lt", value: 70 },
      action: "FLAG",
      priority: 1,
      createdAt: daysAgo(35),
    },
  });
  await prisma.rule.create({
    data: {
      ownerId: businessUsers[1].id,
      businessId: businesses[1].id,
      name: "Carrier allowlist",
      description: "Only pay vetted carriers.",
      type: "ALLOWLIST",
      conditions: { field: "receiver", operator: "in", value: [wallet("f7"), wallet("f8")] },
      action: "ALLOW",
      priority: 10,
      createdAt: daysAgo(18),
    },
  });

  // --- Transactions (20, spread over ~60 days) -----------------------------
  type TxSeed = {
    sender: string;
    receiver: string;
    amount: number;
    assetType: string;
    risk: number;
    status: TransactionStatus;
    type: TransactionType;
    agentId?: string;
    reference?: string;
    createdAt: Date;
  };

  const txns: TxSeed[] = [
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 4200, assetType: "USDC", risk: 6, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2201", createdAt: daysAgo(58) },
    { sender: wallet("c3"), receiver: wallet("f2"), amount: 1850, assetType: "USDC", risk: 12, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2202", createdAt: daysAgo(54) },
    { sender: wallet("c3"), receiver: wallet("a1"), amount: 9600, assetType: "USDC", risk: 9, status: TransactionStatus.EXECUTED, type: TransactionType.PAYROLL, reference: "PR-031", createdAt: daysAgo(50) },
    { sender: wallet("a1"), receiver: wallet("f5"), amount: 220, assetType: "WMON", risk: 41, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8822", createdAt: daysAgo(47) },
    { sender: wallet("c3"), receiver: wallet("f4"), amount: 15000, assetType: "USDC", risk: 22, status: TransactionStatus.APPROVED, type: TransactionType.TREASURY, reference: "TR-077", createdAt: daysAgo(43) },
    { sender: wallet("c3"), receiver: wallet("f3"), amount: 900, assetType: "USDC", risk: 3, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2204", createdAt: daysAgo(40) },
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 4700, assetType: "USDC", risk: 55, status: TransactionStatus.SUSPENDED, type: TransactionType.SUPPLIER, reference: "INV-2203", createdAt: daysAgo(36) },
    { sender: wallet("a1"), receiver: wallet("b2"), amount: 12500, assetType: "USDC", risk: 18, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8823", createdAt: daysAgo(32) },
    { sender: wallet("b2"), receiver: wallet("a1"), amount: 180, assetType: "WMON", risk: 15, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8830", createdAt: daysAgo(28) },
    { sender: wallet("c3"), receiver: wallet("f2"), amount: 2300, assetType: "USDC", risk: 27, status: TransactionStatus.EXECUTED, type: TransactionType.PAYROLL, reference: "PR-032", createdAt: daysAgo(24) },
    { sender: wallet("a1"), receiver: wallet("f6"), amount: 6400, assetType: "USDC", risk: 88, status: TransactionStatus.BLOCKED, type: TransactionType.PAYMENT, reference: "PAY-8824", createdAt: daysAgo(20) },
    { sender: wallet("a1"), receiver: wallet("c3"), amount: 31500, assetType: "USDC", risk: 78, status: TransactionStatus.BLOCKED, type: TransactionType.PAYMENT, reference: "PAY-8821", createdAt: daysAgo(18) },
    { sender: wallet("c4"), receiver: wallet("f7"), amount: 5600, assetType: "USDC", risk: 8, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "FRT-1101", createdAt: daysAgo(16) },
    { sender: wallet("c4"), receiver: wallet("f8"), amount: 3100, assetType: "USDC", risk: 14, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "FRT-1102", createdAt: daysAgo(13) },
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 3900, assetType: "USDC", risk: 5, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2210", createdAt: daysAgo(11) },
    { sender: wallet("a1"), receiver: wallet("b2"), amount: 7300, assetType: "USDC", risk: 20, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8840", createdAt: daysAgo(8) },
    { sender: wallet("c3"), receiver: wallet("f4"), amount: 11800, assetType: "USDC", risk: 32, status: TransactionStatus.EXECUTED, type: TransactionType.TREASURY, reference: "TR-088", createdAt: daysAgo(6) },
    { sender: wallet("c3"), receiver: wallet("f2"), amount: 2750, assetType: "USDC", risk: 21, status: TransactionStatus.PENDING, type: TransactionType.PAYROLL, reference: "PR-033", createdAt: daysAgo(3) },
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 6200, assetType: "USDC", risk: 62, status: TransactionStatus.SUSPENDED, type: TransactionType.SUPPLIER, reference: "INV-2215", createdAt: hoursAgo(30) },
    { sender: wallet("c3"), receiver: wallet("f3"), amount: 1450, assetType: "USDC", risk: 7, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2216", createdAt: hoursAgo(6) },
  ];

  const transactionRows: Array<{ id: string; createdAt: Date; status: TransactionStatus; riskScore: number; reference: string | null; sender: string; receiver: string; amount: number; assetType: string; type: string }> = [];

  for (let i = 0; i < txns.length; i++) {
    const t = txns[i];
    const riskLevel = t.risk >= 80 ? RiskLevel.CRITICAL : t.risk >= 50 ? RiskLevel.HIGH : t.risk >= 25 ? RiskLevel.MEDIUM : RiskLevel.LOW;
    const agentId =
      t.type === TransactionType.PAYROLL || t.type === TransactionType.TREASURY ? payablesAgent.id : t.type === TransactionType.SUPPLIER && t.sender === wallet("c4") ? freightDispatcher.id : undefined;

    const row = await prisma.transaction.create({
      data: {
        sender: t.sender,
        receiver: t.receiver,
        amount: t.amount,
        assetType: t.assetType,
        riskScore: t.risk,
        riskLevel,
        status: t.status,
        type: t.type,
        reference: t.reference,
        agentId,
        createdAt: t.createdAt,
        metadata: {
          currency: "USD",
          via: agentId ? "agent" : "manual",
          auditHash: `0x${(i + 1).toString(16).padStart(2, "0")}${"f".repeat(40)}`,
          decisions: [
            { rule: "Supplier allowlist", result: ["f1", "f2", "f3", "f4", "f5", "f7", "f8"].includes(t.receiver) ? "PASS" : "FAIL" },
            { rule: "Per-transaction cap", result: t.amount <= 25000 ? "PASS" : "FAIL" },
            { rule: "Sanctions blocklist", result: ["f6", "deadbeef"].some((w) => t.receiver === wallet(w)) ? "FAIL" : "PASS" },
            { rule: "High-risk flag", result: t.risk >= 70 ? "FLAG" : "PASS" },
          ],
        },
      },
    });
    transactionRows.push({
      id: row.id,
      createdAt: row.createdAt,
      status: row.status,
      riskScore: row.riskScore,
      reference: row.reference,
      sender: row.sender,
      receiver: row.receiver,
      amount: row.amount,
      assetType: row.assetType,
      type: row.type,
    });
  }

  // --- Reports (10, staggered periods) -------------------------------------
  for (let i = 0; i < 10; i++) {
    const periodEnd = daysAgo(2 + i * 3);
    const periodStart = new Date(periodEnd.getTime() - 30 * 24 * 3600 * 1000);
    const inPeriod = transactionRows.filter((t) => t.createdAt >= periodStart && t.createdAt <= periodEnd);
    const totalVolume = inPeriod.filter((t) => t.status === "EXECUTED" || t.status === "APPROVED").reduce((s, t) => s + t.amount, 0);
    const flags = inPeriod.filter((t) => t.riskScore >= 50).length;
    const suspensions = inPeriod.filter((t) => t.status === TransactionStatus.SUSPENDED).length;
    const blocked = inPeriod.filter((t) => t.status === TransactionStatus.BLOCKED).length;

    const reportData = {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalVolume,
      transactions: inPeriod.length,
      flags,
      suspensions,
      blocked,
      generatedBy: complianceUser.id,
      entries: inPeriod.map((t) => ({
        transactionId: t.id,
        reference: t.reference,
        sender: t.sender,
        receiver: t.receiver,
        amount: t.amount,
        assetType: t.assetType,
        type: t.type,
        timestamp: t.createdAt.toISOString(),
        riskScore: t.riskScore,
        riskLevel: t.riskScore >= 80 ? "CRITICAL" : t.riskScore >= 50 ? "HIGH" : t.riskScore >= 25 ? "MEDIUM" : "LOW",
        status: t.status,
        validation: t.status === "BLOCKED" ? "REJECTED" : t.status === "SUSPENDED" ? "FLAGGED" : t.status === "PENDING" ? "PENDING" : "PASS",
      })),
    };

    await prisma.report.create({
      data: {
        userId: complianceUser.id,
        reportHash: `0x${(i + 1).toString(16).padStart(8, "0")}${"a".repeat(56)}`,
        type: "COMPLIANCE",
        periodStart,
        periodEnd,
        data: reportData,
        createdAt: periodEnd,
      },
    });
  }

  // --- Verifications -------------------------------------------------------
  await prisma.verification.createMany({
    data: [
      ...businessUsers.map((u, i) => ({ userId: u.id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: `cvi-ver-${String(i + 1).padStart(4, "0")}`, verifiedAt: daysAgo(50 - i * 3) })),
      ...merchantUsers.map((u, i) => ({ userId: u.id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: `cvi-ver-${String(i + 11).padStart(4, "0")}`, verifiedAt: daysAgo(55 - i * 4) })),
      { userId: complianceUser.id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: "cvi-ver-0020", verifiedAt: daysAgo(60) },
      { userId: owner.id, type: "ASSET", provider: "CVA", status: VerificationStatus.VERIFIED, reference: "cva-ast-0001", verifiedAt: daysAgo(40) },
      { userId: merchantUsers[0].id, type: "ASSET", provider: "CVA", status: VerificationStatus.VERIFIED, reference: "cva-ast-0002", verifiedAt: daysAgo(38) },
    ],
  });

  // --- Audit logs ----------------------------------------------------------
  const logSeed: Array<[string, string, string, string | null | undefined, string | null | undefined, number]> = [
    ["c3", "BUSINESS", "AUTH_LOGIN", "session", owner.id, 2],
    ["c3", "BUSINESS", "AGENT_CREATE", "agent", payablesAgent.id, 2],
    ["c3", "BUSINESS", "AGENT_CREATE", "agent", analyzerAgent.id, 2],
    ["c3", "BUSINESS", "RULE_CREATE", "rule", null, 2],
    ["c3", "BUSINESS", "TRANSACTION_CREATE", "transaction", null, 2],
    ["c3", "BUSINESS", "TRANSACTION_BLOCKED", "transaction", null, 2],
    ["d4", "COMPLIANCE", "TRANSACTION_SUSPEND", "transaction", null, 2],
    ["d4", "COMPLIANCE", "REPORT_GENERATE", "report", null, 2],
    ["c4", "BUSINESS", "AGENT_CREATE", "agent", freightDispatcher.id, 2],
    ["a1", "MERCHANT", "TRANSACTION_CREATE", "transaction", null, 2],
  ];
  for (const [seed, role, action, resourceType, resourceId, daysAgoSeed] of logSeed) {
    const u = await prisma.user.findUnique({ where: { walletAddress: wallet(seed) } });
    if (!u) continue;
    await prisma.auditLog.create({
      data: {
        actorId: u.id,
        actorRole: role,
        action,
        resourceType: resourceType ?? "system",
        resourceId,
        ipAddress: "10.0.0.1",
        metadata: { source: "seed" },
        createdAt: daysAgo(daysAgoSeed),
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    businesses: await prisma.business.count(),
    agents: await prisma.agent.count(),
    transactions: await prisma.transaction.count(),
    rules: await prisma.rule.count(),
    reports: await prisma.report.count(),
  };
  console.log("Seeded:", counts);

  console.log("Demo logins:");
  console.log("  merchant    →", merchants[0].email);
  console.log("  business    →", businessOwners[0].email);
  console.log("  compliance  →", compliance.email);
  console.log("  admin       →", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
