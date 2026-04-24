"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, LoaderCircle, LockKeyhole, Mail, MapPin, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
          province,
          city,
          phoneNumber,
          cnic,
          address
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to create account.");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setCountry("");
      setProvince("");
      setCity("");
      setPhoneNumber("");
      setCnic("");
      setAddress("");
      setSuccessMessage(payload.message ?? "Registration request sent. Wait for admin approval before signing in.");
      router.refresh();
    });
  };

  return (
    <Card className="w-full rounded-2xl border-slate-600/40 bg-slate-950/75 text-slate-100 shadow-[0_24px_70px_rgba(2,8,23,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Create agent account</CardTitle>
          <CardDescription className="text-slate-300">Submit your registration request. Admin approval is required before you can sign in.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Personal details</div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input autoComplete="name" className="pl-9" id="name" onChange={(event) => setName(event.target.value)} placeholder="Admissions Agent" value={name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input autoComplete="email" className="pl-9" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="agent@rehmatedu.local" type="email" value={email} />
            </div>
          </div>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location and contact</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" onChange={(event) => setCountry(event.target.value)} placeholder="Pakistan" value={country} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province / State</Label>
                <Input id="province" onChange={(event) => setProvince(event.target.value)} placeholder="Punjab" value={province} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" id="city" onChange={(event) => setCity(event.target.value)} placeholder="Lahore" value={city} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="tel"
                    className="pl-9"
                    id="phoneNumber"
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="+92 300 1234567"
                    type="tel"
                    value={phoneNumber}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC / National ID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    id="cnic"
                    onChange={(event) => setCnic(event.target.value)}
                    placeholder="35202-1234567-8"
                    value={cnic}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street, area, city"
                  value={address}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input autoComplete="new-password" id="password" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" type="password" value={password} />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</div>
          ) : null}

          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Submit request
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-emerald-300 hover:text-emerald-200 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
