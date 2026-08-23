import "server-only";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ADMIN_ROLE, getAuthConfiguration } from "@/lib/auth/config";

export async function requireAdmin(): Promise<void> {
  const { redirect } = await import("next/navigation");
  const session = getAuthConfiguration() ? await auth() : null;

  if (!session?.user || session.user.role !== ADMIN_ROLE) {
    redirect("/admin/login");
  }
}

export async function requireAdminApi(): Promise<NextResponse | null> {
  if (!getAuthConfiguration()) return unauthorized();

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== ADMIN_ROLE) return forbidden();

  return null;
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
