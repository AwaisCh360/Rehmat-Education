import { SignupForm } from "@/components/auth/signup-form";
import { getPortalSettings } from "@/lib/app/portal-settings";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const portalSettings = await getPortalSettings();

  if (!portalSettings.signupEnabled) {
    redirect("/login?signup=disabled");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_38%),linear-gradient(180deg,#020817_0%,#061229_100%)] px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Agent Registration
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Create your agent profile</h1>
          <p className="text-sm text-slate-300">Complete the form below. Admin approval is required before your first sign in.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
