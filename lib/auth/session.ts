import "server-only";
import { cookies } from "next/headers";
import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { SessionUser } from "@/lib/types";
import { db } from "@/lib/database/client";

const COOKIE_NAME = "cf_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value === "cleanflow-dev-secret-change-me") {
    throw new Error("SESSION_SECRET is not configured. Set a strong random value in your environment.");
  }
  return value;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface TokenPayload {
  uid: string;
  sid: string;
  exp: number;
}

function encodeToken(payload: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeToken(token: string): TokenPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.uid !== "string" || typeof payload.sid !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const exp = Date.now() + SESSION_TTL_MS;
  const sid = randomBytes(24).toString("hex");
  const token = encodeToken({ uid: user.id, sid, exp });

  await db.session.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(`${sid}.${user.id}`),
      expiresAt: new Date(exp),
    },
  });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = decodeToken(token);
    if (payload) {
      await db.session.deleteMany({ where: { tokenHash: tokenHash(`${payload.sid}.${payload.uid}`) } });
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;

  const row = await db.session.findUnique({
    where: { tokenHash: tokenHash(`${payload.sid}.${payload.uid}`) },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row && row.expiresAt.getTime() < Date.now()) {
      await db.session.deleteMany({ where: { tokenHash: tokenHash(`${payload.sid}.${payload.uid}`) } });
    }
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  const user = await db.user.findUnique({ where: { id: payload.uid } });
  if (!user) {
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  return toSessionUser(user);
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function toSessionUser(user: {
  id: string;
  walletAddress: string;
  email: string | null;
  name: string | null;
  role: string;
  verified: boolean;
  kycLevel: number;
}): SessionUser {
  return {
    id: user.id,
    walletAddress: user.walletAddress,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
    verified: user.verified,
    kycLevel: user.kycLevel,
  };
}
