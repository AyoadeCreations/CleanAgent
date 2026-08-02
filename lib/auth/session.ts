import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { SessionUser } from "@/lib/types";
import { db } from "@/lib/database/client";

const COOKIE_NAME = "cf_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.SESSION_SECRET ?? "cleanflow-dev-secret-change-me";
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encodeToken(payload: { uid: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeToken(token: string): { uid: string; exp: number } | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      uid: string;
      exp: number;
    };
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload = { uid: user.id, exp: Date.now() + SESSION_TTL_MS };
  cookieStore.set(COOKIE_NAME, encodeToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({ where: { id: payload.uid } });
  if (!user) return null;

  return {
    id: user.id,
    walletAddress: user.walletAddress,
    email: user.email,
    name: user.name,
    role: user.role,
    verified: user.verified,
    kycLevel: user.kycLevel,
  };
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
