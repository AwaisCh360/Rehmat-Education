import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_30%)] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-8 shadow-panel">
          <div className="space-y-5">
            <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">Admissions operations</div>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight">Find the right program faster, and keep your catalog clean.</h1>
              <p className="max-w-xl text-base text-muted-foreground">
                Agents get a fast filtered catalog. Admins can curate the full dataset and ship source URL updates without leaving the dashboard.
              </p>
            </div>
          </div>
          <div className="grid gap-4 pt-10 sm:grid-cols-3">
            {[
              ["5,508", "Programs ready"],
              ["50", "Universities indexed"],
              ["2", "Protected roles"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
