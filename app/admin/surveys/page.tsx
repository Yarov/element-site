import type { Metadata } from "next";
import { SurveyStudioApp } from "@/components/survey-studio/app";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Survey Studio" };
export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  await requireAdmin();

  return <SurveyStudioApp />;
}
