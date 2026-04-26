"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAgentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [website, setWebsite] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [cnic, setCnic] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Add new agent</CardTitle>
        <CardDescription>Create agent manually from admin settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full justify-between" onClick={() => setIsExpanded((current) => !current)} type="button" variant="outline">
          <span>New agent details</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isExpanded ? (
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
                    password,
                    agencyName,
                    designation,
                    yearsOfExperience,
                    website,
                    postalCode,
                    country,
                    province,
                    city,
                    address,
                    cnic,
                    phoneNumber
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
                setAgencyName("");
                setDesignation("");
                setYearsOfExperience("0");
                setWebsite("");
                setPostalCode("");
                setCountry("");
                setProvince("");
                setCity("");
                setAddress("");
                setCnic("");
                setPhoneNumber("");
                setIsExpanded(false);
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

            <div className="space-y-2">
              <Label htmlFor="create-agent-agency">Agency name</Label>
              <Input id="create-agent-agency" onChange={(event) => setAgencyName(event.target.value)} placeholder="Your agency" required value={agencyName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-designation">Designation</Label>
              <Input id="create-agent-designation" onChange={(event) => setDesignation(event.target.value)} placeholder="Senior counselor" required value={designation} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-experience">Years of experience</Label>
              <Input
                id="create-agent-experience"
                max={45}
                min={0}
                onChange={(event) => setYearsOfExperience(event.target.value)}
                required
                type="number"
                value={yearsOfExperience}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-website">Website (optional)</Label>
              <Input id="create-agent-website" onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" type="url" value={website} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-postal">Postal code</Label>
              <Input id="create-agent-postal" onChange={(event) => setPostalCode(event.target.value)} placeholder="54000" required value={postalCode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-country">Country</Label>
              <Input id="create-agent-country" onChange={(event) => setCountry(event.target.value)} placeholder="Pakistan" required value={country} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-province">Province</Label>
              <Input id="create-agent-province" onChange={(event) => setProvince(event.target.value)} placeholder="Punjab" required value={province} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-city">City</Label>
              <Input id="create-agent-city" onChange={(event) => setCity(event.target.value)} placeholder="Lahore" required value={city} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-phone">Phone number</Label>
              <Input id="create-agent-phone" onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+92 300 0000000" required value={phoneNumber} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-agent-cnic">CNIC</Label>
              <Input id="create-agent-cnic" onChange={(event) => setCnic(event.target.value)} placeholder="35201-1234567-1" required value={cnic} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="create-agent-address">Address</Label>
              <Input id="create-agent-address" onChange={(event) => setAddress(event.target.value)} placeholder="Street, area, city" required value={address} />
            </div>

            <div className="md:col-span-2">
              <Button disabled={isPending} type="submit">
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create agent
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}