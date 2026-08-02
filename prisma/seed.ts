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

const merchants = [
  { email: "merchant@cleanflow.dev", name: "Northwind Goods", wallet: "a1" },
  { email: "vida@cleanflow.dev", name: "Vida Coffee Co", wallet: "b2" },
];

const businessOwner = { email: "business@cleanflow.dev", name: "Helios Logistics", wallet: "c3" };
const compliance = { email: "compliance@cleanflow.dev", name: "Ava Sterling", wallet: "d4" };
const admin = { email: "admin@cleanflow.dev", name: "CleanFlow Admin", wallet: "e5" };

async function main() {
  console.log("Seeding CleanFlow database…");

  // Wipe existing data (idempotent for dev).
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
  const merchantUsers = [];
  for (const m of merchants) {
    const user = await prisma.user.create({
      data: {
        email: m.email,
        name: m.name,
        walletAddress: wallet(m.wallet),
        role: Role.MERCHANT,
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        kycLevel: 2,
      },
    });
    merchantUsers.push(user);
  }

  const owner = await prisma.user.create({
    data: {
      email: businessOwner.email,
      name: businessOwner.name,
      walletAddress: wallet(businessOwner.wallet),
      role: Role.BUSINESS,
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      kycLevel: 2,
    },
  });

  const complianceUser = await prisma.user.create({
    data: {
      email: compliance.email,
      name: compliance.name,
      walletAddress: wallet(compliance.wallet),
      role: Role.COMPLIANCE,
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      kycLevel: 3,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: admin.email,
      name: admin.name,
      walletAddress: wallet(admin.wallet),
      role: Role.ADMIN,
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      kycLevel: 3,
    },
  });

  // --- Business ------------------------------------------------------------
  const business = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Helios Logistics",
      description: "Cross-border freight forwarding and supplier network.",
      status: BusinessStatus.ACTIVE,
    },
  });

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
    },
  });

  const treasuryAgent = await prisma.agent.create({
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
    },
  });

  const researchAgent = await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Market Analyzer",
      description: "Read-only market data agent. No spend permissions.",
      dailyLimit: 0,
      monthlyLimit: 0,
      permissions: { actions: ["READ", "ANALYZE"], spendLimit: 0, allowlist: [] },
      status: AgentStatus.ACTIVE,
    },
  });

  const deactivatedAgent = await prisma.agent.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Legacy Invoicer",
      description: "Retired invoicing agent.",
      dailyLimit: 1000,
      monthlyLimit: 10000,
      permissions: { actions: ["INVOICE"], spendLimit: 1000, allowlist: [] },
      status: AgentStatus.DEACTIVATED,
    },
  });

  // --- Assets --------------------------------------------------------------
  const assets = [
    { name: "USD Circle Stablecoin", symbol: "USDC", type: AssetKind.TOKEN, risk: 2 },
    { name: "Monad Wrapped MON", symbol: "WMON", type: AssetKind.TOKEN, risk: 12 },
    { name: "Ocean Freight Invoice #118", symbol: null, type: AssetKind.RECEIVABLE, risk: 34 },
    { name: "Origin Pass NFT", symbol: "ORIGIN", type: AssetKind.NFT, risk: 8 },
  ];
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    await prisma.asset.create({
      data: {
        ownerId: i % 2 === 0 ? owner.id : merchantUsers[0].id,
        name: a.name,
        symbol: a.symbol,
        assetType: a.type,
        contractAddress: wallet(`aa${i}`),
        chain: "monad-testnet",
        riskScore: a.risk,
        verified: a.risk < 20,
        metadata: { source: "CVA" },
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
      conditions: { field: "receiver", operator: "in", value: [wallet("f1"), wallet("f2"), wallet("f3")] },
      action: "ALLOW",
      priority: 10,
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
    },
  });
  await prisma.rule.create({
    data: {
      ownerId: owner.id,
      businessId: business.id,
      name: "Sanctions blocklist",
      description: "Block transfers to flagged addresses.",
      type: "BLOCKLIST",
      conditions: { field: "receiver", operator: "not_in", value: [wallet("deadbeef")] },
      action: "BLOCK",
      priority: 5,
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
    },
  });

  // --- Transactions --------------------------------------------------------
  const txs: Array<{
    sender: string;
    receiver: string;
    amount: number;
    assetType: string;
    risk: number;
    status: TransactionStatus;
    type: TransactionType;
    agentId?: string;
    reference?: string;
  }> = [
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 4200, assetType: "USDC", risk: 6, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2201" },
    { sender: wallet("c3"), receiver: wallet("f2"), amount: 1850, assetType: "USDC", risk: 12, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2202" },
    { sender: wallet("c3"), receiver: wallet("a1"), amount: 9600, assetType: "USDC", risk: 9, status: TransactionStatus.EXECUTED, type: TransactionType.PAYROLL, reference: "PR-031" },
    { sender: wallet("a1"), receiver: wallet("c3"), amount: 31500, assetType: "USDC", risk: 78, status: TransactionStatus.BLOCKED, type: TransactionType.PAYMENT, reference: "PAY-8821" },
    { sender: wallet("a1"), receiver: wallet("f5"), amount: 220, assetType: "WMON", risk: 41, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8822" },
    { sender: wallet("c3"), receiver: wallet("f4"), amount: 15000, assetType: "USDC", risk: 22, status: TransactionStatus.APPROVED, type: TransactionType.TREASURY, reference: "TR-077" },
    { sender: wallet("c3"), receiver: wallet("f1"), amount: 4700, assetType: "USDC", risk: 55, status: TransactionStatus.SUSPENDED, type: TransactionType.SUPPLIER, reference: "INV-2203" },
    { sender: wallet("c3"), receiver: wallet("f3"), amount: 900, assetType: "USDC", risk: 3, status: TransactionStatus.EXECUTED, type: TransactionType.SUPPLIER, reference: "INV-2204" },
    { sender: wallet("a1"), receiver: wallet("b2"), amount: 12500, assetType: "USDC", risk: 18, status: TransactionStatus.PENDING, type: TransactionType.PAYMENT, reference: "PAY-8823" },
    { sender: wallet("a1"), receiver: wallet("f6"), amount: 6400, assetType: "USDC", risk: 88, status: TransactionStatus.BLOCKED, type: TransactionType.PAYMENT, reference: "PAY-8824" },
    { sender: wallet("c3"), receiver: wallet("f2"), amount: 2300, assetType: "USDC", risk: 27, status: TransactionStatus.EXECUTED, type: TransactionType.PAYROLL, reference: "PR-032" },
    { sender: wallet("b2"), receiver: wallet("a1"), amount: 180, assetType: "WMON", risk: 15, status: TransactionStatus.EXECUTED, type: TransactionType.PAYMENT, reference: "PAY-8830" },
  ];

  for (const t of txs) {
    await prisma.transaction.create({
      data: {
        sender: t.sender,
        receiver: t.receiver,
        amount: t.amount,
        assetType: t.assetType,
        riskScore: t.risk,
        riskLevel: t.risk >= 80 ? RiskLevel.CRITICAL : t.risk >= 50 ? RiskLevel.HIGH : t.risk >= 25 ? RiskLevel.MEDIUM : RiskLevel.LOW,
        status: t.status,
        type: t.type,
        reference: t.reference,
        agentId: t.type === TransactionType.PAYROLL || t.type === TransactionType.TREASURY ? payablesAgent.id : undefined,
        metadata: { currency: "USD", via: t.agentId ? "agent" : "manual" },
      },
    });
  }

  // --- Reports -------------------------------------------------------------
  await prisma.report.create({
    data: {
      userId: complianceUser.id,
      reportHash: "0x9f4b2e7a1c8d3f0e5b6a7c8d9e0f1a2b3c4d5e6f",
      type: "COMPLIANCE",
      periodStart: new Date(new Date().setDate(new Date().getDate() - 30)),
      periodEnd: new Date(),
      data: { totalVolume: 94250, transactions: 12, flags: 3, suspensions: 1 },
    },
  });

  // --- Verifications -------------------------------------------------------
  await prisma.verification.createMany({
    data: [
      { userId: owner.id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: "cvi-ver-0001", verifiedAt: new Date() },
      { userId: merchantUsers[0].id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: "cvi-ver-0002", verifiedAt: new Date() },
      { userId: merchantUsers[1].id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: "cvi-ver-0003", verifiedAt: new Date() },
      { userId: complianceUser.id, type: "IDENTITY", provider: "CVI", status: VerificationStatus.VERIFIED, reference: "cvi-ver-0004", verifiedAt: new Date() },
      { userId: owner.id, type: "ASSET", provider: "CVA", status: VerificationStatus.VERIFIED, reference: "cva-ast-0001", verifiedAt: new Date() },
      { userId: merchantUsers[0].id, type: "ASSET", provider: "CVA", status: VerificationStatus.VERIFIED, reference: "cva-ast-0002", verifiedAt: new Date() },
    ],
  });

  // --- Audit logs ----------------------------------------------------------
  const logSeed: Array<[string, string, string, string?, string?]> = [
    ["c3", "Role.BUSINESS", "AUTH_LOGIN", "session", owner.id],
    ["c3", "Role.BUSINESS", "AGENT_CREATE", "agent", payablesAgent.id],
    ["c3", "Role.BUSINESS", "RULE_CREATE", "rule", null],
    ["c3", "Role.BUSINESS", "TRANSACTION_EXECUTE", "transaction", null],
    ["d4", "Role.COMPLIANCE", "TRANSACTION_SUSPEND", "transaction", null],
    ["d4", "Role.COMPLIANCE", "REPORT_GENERATE", "report", null],
  ];
  for (const [seed, role, action, resourceType, resourceId] of logSeed) {
    const u = await prisma.user.findUnique({ where: { walletAddress: wallet(seed) } });
    if (!u) continue;
    await prisma.auditLog.create({
      data: {
        actorId: u.id,
        actorRole: role.replace("Role.", ""),
        action,
        resourceType: resourceType ?? "system",
        resourceId,
        ipAddress: "10.0.0.1",
        metadata: { source: "seed" },
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    businesses: await prisma.business.count(),
    agents: await prisma.agent.count(),
    transactions: await prisma.transaction.count(),
    rules: await prisma.rule.count(),
  };
  console.log("Seeded:", counts);

  console.log("Demo logins:");
  console.log("  merchant    →", merchants[0].email);
  console.log("  business    →", businessOwner.email);
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
