import { LoginForm } from "@/components/auth/login-form";
import { getPortalSettings } from "@/lib/app/portal-settings";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const error = Array.isArray(searchParams?.error) ? searchParams?.error[0] : searchParams?.error;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const portalSettings = await getPortalSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_36%),linear-gradient(180deg,#020817_0%,#061229_100%)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            {portalSettings.appName}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-slate-300">{portalSettings.slogan}</p>
        </div>
        <LoginForm googleEnabled={googleEnabled} initialError={getLoginErrorMessage(error)} signupEnabled={portalSettings.signupEnabled} />
      </div>
    </div>
  );
}

function getLoginErrorMessage(error: string | undefined) {
  if (!error) {
    return null;
  }

  if (error === "AccessDenied") {
    return "This Google account is not approved for dashboard access.";
  }

  if (error.startsWith("OAuth")) {
    return "Google sign-in failed. Check the OAuth client settings and try again.";
  }

  return "Unable to sign in. Please try again.";
}
