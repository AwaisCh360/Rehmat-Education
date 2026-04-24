import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  agencyName: z.string().trim().min(2).max(120),
  designation: z.string().trim().min(2).max(120),
  yearsOfExperience: z.coerce.number().int().min(0).max(45),
  website: z.string().trim().url().optional().or(z.literal("")),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(240),
  cnic: z
    .string()
    .trim()
    .min(5)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/, "Invalid CNIC format"),
  phoneNumber: z
    .string()
    .trim()
    .min(7)
    .max(24)
    .regex(/^[+0-9\s()-]+$/, "Invalid phone number format")
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid personal, location, and contact details." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({
    where: {
      email
    }
  });

  if (existing) {
    return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
  }

  const existingRequest = await db.agentSignupRequest.findUnique({
    where: {
      email
    }
  });

  if (existingRequest?.status === "PENDING") {
    return NextResponse.json({ error: "Your registration request is already pending admin approval." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const requestRecord = await db.agentSignupRequest.upsert({
    where: {
      email
    },
    create: {
      name: parsed.data.name,
      email,
      passwordHash,
      country: parsed.data.country,
      province: parsed.data.province,
      city: parsed.data.city,
      address: parsed.data.address,
      cnic: parsed.data.cnic,
      phoneNumber: parsed.data.phoneNumber,
      agencyName: parsed.data.agencyName,
      designation: parsed.data.designation,
      yearsOfExperience: parsed.data.yearsOfExperience,
      website: parsed.data.website || null,
      postalCode: parsed.data.postalCode
    },
    update: {
      name: parsed.data.name,
      passwordHash,
      country: parsed.data.country,
      province: parsed.data.province,
      city: parsed.data.city,
      address: parsed.data.address,
      cnic: parsed.data.cnic,
      phoneNumber: parsed.data.phoneNumber,
      agencyName: parsed.data.agencyName,
      designation: parsed.data.designation,
      yearsOfExperience: parsed.data.yearsOfExperience,
      website: parsed.data.website || null,
      postalCode: parsed.data.postalCode,
      status: "PENDING",
      reviewedAt: null,
      reviewedById: null
    }
  });

  return NextResponse.json(
    {
      ok: true,
      message: "Registration request submitted. Please wait for admin approval.",
      requestId: requestRecord.id
    },
    { status: 201 }
  );
}
