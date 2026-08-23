import type { Metadata } from "next";
import { MarketingAdminApp } from "@/components/marketing-admin/app";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Marketing Studio" };

export default async function MarketingPage() {
  await requireAdmin();

  return <MarketingAdminApp />;
}
