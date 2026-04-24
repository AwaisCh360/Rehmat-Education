"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type PendingAgentRequest = {
  id: string;
  name: string;
  email: string;
  agencyName: string | null;
  designation: string | null;
  yearsOfExperience: number | null;
  website: string | null;
  postalCode: string | null;
  address: string | null;
  cnic: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  phoneNumber: string | null;
  createdAt: string;
  status: string;
};

export function AgentApprovalRequests({ initialRequests }: { initialRequests: PendingAgentRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasRequests = useMemo(() => requests.length > 0, [requests]);

  const reviewRequest = (id: string, action: "approve" | "reject") => {
    startTransition(async () => {
      setBusyId(id);

      const response = await fetch(`/api/admin/agent-requests/${id}/${action}`, {
        method: "POST"
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? `Unable to ${action} request.`);
        setBusyId(null);
        return;
      }

      setRequests((current) => current.filter((request) => request.id !== id));
      toast.success(action === "approve" ? "Agent approved and account created." : "Agent request rejected.");
      setBusyId(null);
    });
  };

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Agent approval requests</CardTitle>
        <CardDescription>New agents must be approved by admin before they can log in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasRequests ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const isRowBusy = busyId === request.id;

                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      <div>{request.phoneNumber || "Not provided"}</div>
                      <div className="text-xs text-muted-foreground">{request.address || "Address not provided"}</div>
                    </TableCell>
                    <TableCell>
                      {[request.city, request.province, request.country].filter(Boolean).join(", ") || "Not provided"}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.agencyName || "Not provided"}</div>
                      <div className="text-xs text-muted-foreground">{request.designation || "No designation"}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.yearsOfExperience !== null && request.yearsOfExperience !== undefined
                          ? `${request.yearsOfExperience} years exp`
                          : "Experience not provided"}
                      </div>
                      <div className="text-xs text-muted-foreground">{request.postalCode || "Postal code not provided"}</div>
                      {request.website ? (
                        <a className="text-xs text-primary hover:underline" href={request.website} rel="noreferrer" target="_blank">
                          {request.website}
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{request.cnic || "Not provided"}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="warning">{request.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button disabled={isPending || isRowBusy} onClick={() => reviewRequest(request.id, "reject")} size="sm" variant="outline">
                        {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Reject
                      </Button>
                      <Button disabled={isPending || isRowBusy} onClick={() => reviewRequest(request.id, "approve")} size="sm">
                        {isRowBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">No pending agent requests right now.</div>
        )}
      </CardContent>
    </Card>
  );
}