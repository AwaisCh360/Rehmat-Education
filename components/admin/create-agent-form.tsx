"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAgentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Add new agent</CardTitle>
        <CardDescription>Create an agent account directly from settings without waiting for signup approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(async () => {
              const response = await fetch("/api/admin/agents", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name,
                  email,
                  password
                })
              });

              const payload = await response.json();

              if (!response.ok) {
                toast.error(payload.error ?? "Unable to create agent.");
                return;
              }

              toast.success("Agent account created.");
              setName("");
              setEmail("");
              setPassword("");
              router.refresh();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="create-agent-name">Full name</Label>
            <Input id="create-agent-name" onChange={(event) => setName(event.target.value)} placeholder="Agent full name" required value={name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-agent-email">Email</Label>
            <Input id="create-agent-email" onChange={(event) => setEmail(event.target.value)} placeholder="agent@example.com" required type="email" value={email} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="create-agent-password">Temporary password</Label>
            <Input
              id="create-agent-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={password}
            />
          </div>

          <div className="md:col-span-2">
            <Button disabled={isPending} type="submit">
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create agent
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}