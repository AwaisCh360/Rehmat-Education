import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_30%)] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-8 shadow-panel">
          <div className="space-y-5">
            <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">Agent onboarding</div>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight">Create your agent account and start filtering programs instantly.</h1>
              <p className="max-w-xl text-base text-muted-foreground">
                New signups are created with the Agent role. You can browse the live catalog, use saved filters, and export student-ready PDFs.
              </p>
            </div>
          </div>
          <div className="grid gap-4 pt-10 sm:grid-cols-3">
            {[
              ["Agent", "Default role"],
              ["Live", "Catalog access"],
              ["Fast", "Filtered search"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
