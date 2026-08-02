import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export async function getApiUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError("UNAUTHORIZED", 401);
  return user;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(code: string, status = 400, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.code, error.status, error.code);
  }
  const message = error instanceof Error ? error.message : "Internal server error";
  console.error("[api]", error);
  return fail(message, 500, "INTERNAL");
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
