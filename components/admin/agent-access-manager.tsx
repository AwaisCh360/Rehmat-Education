"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, LoaderCircle, Mail, RotateCcw, Search, ShieldCheck, ShieldX, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ManagedAgent = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  accessStatus: "ACTIVE" | "REVOKED";
};

type StatusFilter = "all" | "active" | "revoked";
type AccessAction = "revoke" | "restore";

export function AgentAccessManager({ initialAgents }: { initialAgents: ManagedAgent[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetAgent, setResetAgent] = useState<ManagedAgent | null>(null);
  const [accessReview, setAccessReview] = useState<{ agent: ManagedAgent; action: AccessAction } | null>(null);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesQuery = !normalizedQuery || agent.name.toLowerCase().includes(normalizedQuery) || agent.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && agent.accessStatus === "ACTIVE") ||
        (statusFilter === "revoked" && agent.accessStatus === "REVOKED");

      return matchesQuery && matchesStatus;
    });
  }, [agents, query, statusFilter]);

  const activeCount = useMemo(() => agents.filter((agent) => agent.accessStatus === "ACTIVE").length, [agents]);
  const revokedCount = agents.length - activeCount;

  const updateAccess = async (agentId: string, action: AccessAction) => {
    setBusyId(agentId);

    try {
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
      setAccessReview(null);
    } finally {
      setBusyId(null);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied.");
    } catch {
      toast.error("Unable to copy email.");
    }
  };

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>Agent control center</CardTitle>
            <CardDescription>Approve access decisions, audit agent status, and reset credentials only when needed.</CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <AgentMetric icon={Users} label="Total" value={agents.length} />
            <AgentMetric icon={ShieldCheck} label="Active" value={activeCount} />
            <AgentMetric icon={ShieldX} label="Revoked" value={revokedCount} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" value={query} />
          </div>
          <Select onValueChange={(value) => setStatusFilter(value as StatusFilter)} value={statusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="revoked">Revoked only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAgents.length ? (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => {
                    const isRowBusy = busyId === agent.id;
                    const accessAction = agent.accessStatus === "ACTIVE" ? "revoke" : "restore";

                    return (
                      <TableRow key={agent.id}>
                        <TableCell className="min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                              {getInitials(agent.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{agent.name}</div>
                              <div className="text-xs text-muted-foreground">{agent.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[260px]">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{agent.email}</span>
                            <Button className="h-8 w-8 shrink-0" onClick={() => copyEmail(agent.email)} size="icon" title="Copy email" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[190px]">
                          <div>{formatDate(agent.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeDays(agent.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.accessStatus === "ACTIVE" ? "success" : "destructive"}>{agent.accessStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button disabled={isRowBusy} onClick={() => setResetAgent(agent)} size="sm" variant="outline">
                              <KeyRound className="h-4 w-4" />
                              Reset
                            </Button>
                            <Button
                              disabled={isRowBusy}
                              onClick={() => setAccessReview({ agent, action: accessAction })}
                              size="sm"
                              variant={accessAction === "revoke" ? "destructive" : "secondary"}
                            >
                              {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : accessAction === "revoke" ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                              {accessAction === "revoke" ? "Revoke" : "Restore"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            {agents.length ? "No agents match the current filters." : "No agents found yet."}
          </div>
        )}
      </CardContent>

      <PasswordResetDialog agent={resetAgent} busyId={busyId} onClose={() => setResetAgent(null)} onUpdated={() => setResetAgent(null)} setBusyId={setBusyId} />

      <Dialog onOpenChange={(open) => !open && setAccessReview(null)} open={Boolean(accessReview)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{accessReview?.action === "revoke" ? "Revoke agent access" : "Restore agent access"}</DialogTitle>
            <DialogDescription>
              {accessReview?.agent.name} will {accessReview?.action === "revoke" ? "lose access to the dashboard immediately." : "be able to sign in again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAccessReview(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={Boolean(accessReview && busyId === accessReview.agent.id)}
              onClick={() => accessReview && updateAccess(accessReview.agent.id, accessReview.action)}
              variant={accessReview?.action === "revoke" ? "destructive" : "default"}
            >
              {accessReview && busyId === accessReview.agent.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {accessReview?.action === "revoke" ? "Revoke access" : "Restore access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PasswordResetDialog({
  agent,
  busyId,
  onClose,
  onUpdated,
  setBusyId
}: {
  agent: ManagedAgent | null;
  busyId: string | null;
  onClose: () => void;
  onUpdated: () => void;
  setBusyId: (id: string | null) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = Boolean(agent && busyId === agent.id);

  const close = () => {
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  const updatePassword = async () => {
    if (!agent) {
      return;
    }

    const nextPassword = password.trim();

    if (nextPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setBusyId(agent.id);

    try {
      const response = await fetch(`/api/admin/agents/${agent.id}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: nextPassword })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Unable to update password.");
        return;
      }

      toast.success("Agent password updated.");
      setPassword("");
      setShowPassword(false);
      onUpdated();
    } finally {
      setBusyId(null);
    }
  };

  const generatePassword = () => {
    const nextPassword = createPassword();
    setPassword(nextPassword);
    setShowPassword(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && close()} open={Boolean(agent)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>{agent ? `Set a new password for ${agent.name}.` : ""}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/35 px-4 py-3 text-sm">
            <div className="font-medium">{agent?.email}</div>
            <div className="text-xs text-muted-foreground">Minimum 8 characters. Share the new password outside the dashboard.</div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  autoComplete="new-password"
                  className="pr-10"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <Button className="absolute right-0 top-0 h-10 w-10" onClick={() => setShowPassword((current) => !current)} size="icon" type="button" variant="ghost">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={generatePassword} type="button" variant="outline">
                <RotateCcw className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={close} variant="outline">
            Cancel
          </Button>
          <Button disabled={isBusy || password.trim().length < 8} onClick={updatePassword}>
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Save password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentMetric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || <UserCheck className="h-4 w-4" />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatRelativeDays(value: string) {
  const createdAt = new Date(value).getTime();
  const diffDays = Math.max(Math.floor((Date.now() - createdAt) / 86_400_000), 0);

  if (diffDays === 0) {
    return "Joined today";
  }

  if (diffDays === 1) {
    return "Joined yesterday";
  }

  return `Joined ${diffDays} days ago`;
}

function createPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
