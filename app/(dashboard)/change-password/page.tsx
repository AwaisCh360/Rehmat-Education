"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle>Change your password</CardTitle>
          <CardDescription>For security, please update your password before continuing. Password must be at least 8 characters with at least one uppercase letter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              setSuccess(null);

              startTransition(async () => {
                const response = await fetch("/api/auth/change-password", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword
                  })
                });

                const payload = await response.json();

                if (!response.ok) {
                  setError(payload.error ?? "Unable to update password.");
                  return;
                }

                setSuccess("Password updated. Please sign in again.");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");

                await signOut({
                  redirect: false
                });
                router.replace("/login");
                router.refresh();
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="old-password">Old password</Label>
              <Input id="old-password" onChange={(event) => setOldPassword(event.target.value)} required type="password" value={oldPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
            </div>

            {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            {success ? <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{success}</div> : null}

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
