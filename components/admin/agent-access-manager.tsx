"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ManagedAgent = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  accessStatus: "ACTIVE" | "REVOKED";
};

export function AgentAccessManager({ initialAgents }: { initialAgents: ManagedAgent[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasAgents = useMemo(() => agents.length > 0, [agents]);

  const updatePassword = (agentId: string) => {
    const password = (passwordDrafts[agentId] ?? "").trim();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      setBusyId(agentId);

      const response = await fetch(`/api/admin/agents/${agentId}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Unable to update password.");
        setBusyId(null);
        return;
      }

      setPasswordDrafts((current) => ({
        ...current,
        [agentId]: ""
      }));
      toast.success("Agent password updated.");
      setBusyId(null);
    });
  };

  const updateAccess = (agentId: string, action: "revoke" | "restore") => {
    startTransition(async () => {
      setBusyId(agentId);

      const response = await fetch(`/api/admin/agents/${agentId}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Unable to update access.");
        setBusyId(null);
        return;
      }

      setAgents((current) =>
        current.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                accessStatus: payload.status === "REVOKED" ? "REVOKED" : "ACTIVE"
              }
            : agent
        )
      );

      toast.success(action === "revoke" ? "Agent access revoked." : "Agent access restored.");
      setBusyId(null);
    });
  };

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Manage agents</CardTitle>
        <CardDescription>View all agents, change their passwords, and revoke or restore dashboard access.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasAgents ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[240px]">New password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => {
                const isRowBusy = isPending && busyId === agent.id;

                return (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{new Date(agent.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={agent.accessStatus === "ACTIVE" ? "success" : "destructive"}>{agent.accessStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        autoComplete="new-password"
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [agent.id]: event.target.value
                          }))
                        }
                        placeholder="Enter new password"
                        type="password"
                        value={passwordDrafts[agent.id] ?? ""}
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button disabled={isRowBusy} onClick={() => updatePassword(agent.id)} size="sm" variant="outline">
                        {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Update password
                      </Button>
                      {agent.accessStatus === "ACTIVE" ? (
                        <Button disabled={isRowBusy} onClick={() => updateAccess(agent.id, "revoke")} size="sm" variant="destructive">
                          {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                          Revoke access
                        </Button>
                      ) : (
                        <Button disabled={isRowBusy} onClick={() => updateAccess(agent.id, "restore")} size="sm" variant="secondary">
                          {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                          Restore access
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">No agents found yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
