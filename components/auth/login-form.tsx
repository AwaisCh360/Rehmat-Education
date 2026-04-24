"use client";

import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  googleEnabled,
  initialError = null
}: {
  googleEnabled: boolean;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }

      router.push("/programs");
      router.refresh();
    });
  };

  const onGoogleSignIn = () => {
    setError(null);

    startGoogleTransition(() => {
      void signIn("google", {
        callbackUrl: "/"
      });
    });
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-slate-600/40 bg-slate-950/75 text-slate-100 shadow-[0_24px_70px_rgba(2,8,23,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription className="text-slate-300">Use your admin or agent credentials to access the dashboard.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {googleEnabled ? (
          <>
            <Button className="w-full" disabled={isPending || isGooglePending} onClick={onGoogleSignIn} type="button" variant="outline">
              {isGooglePending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold">G</span>}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-slate-400">or sign in with email</span>
              </div>
            </div>
          </>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input autoComplete="email" className="pl-9" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="agent@rehmatedu.local" type="email" value={email} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input autoComplete="current-password" id="password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" type="password" value={password} />
          </div>
          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : null}
          <Button className="w-full" disabled={isPending || isGooglePending} type="submit">
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Need an agent account?{" "}
            <Link className="font-medium text-sky-300 hover:text-sky-200 hover:underline" href="/signup">
              Submit a request
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
