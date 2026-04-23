import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid name, email, and password." }, { status: 400 });
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
      passwordHash
    },
    update: {
      name: parsed.data.name,
      passwordHash,
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
