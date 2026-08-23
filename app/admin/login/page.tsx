import { AdminLoginForm } from "@/components/admin-login-form";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const destination = callbackUrl?.startsWith("/admin/")
    ? callbackUrl
    : "/admin/surveys";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <section className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage surveys and campaigns.
        </p>
        <div className="mt-6">
          <AdminLoginForm callbackUrl={destination} />
        </div>
      </section>
    </main>
  );
}
