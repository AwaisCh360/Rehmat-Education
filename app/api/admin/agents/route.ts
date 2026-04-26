import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { APP_ROLES } from "@/lib/auth/roles";
import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
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
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const payload = await request.json();
  const parsed = createAgentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide complete agent profile details." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  });

  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        role: APP_ROLES.AGENT
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    await tx.agentSignupRequest.upsert({
      where: {
        email
      },
      create: {
        name: parsed.data.name,
        email,
        passwordHash,
        agencyName: parsed.data.agencyName,
        designation: parsed.data.designation,
        yearsOfExperience: parsed.data.yearsOfExperience,
        website: parsed.data.website || null,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        province: parsed.data.province,
        city: parsed.data.city,
        address: parsed.data.address,
        cnic: parsed.data.cnic,
        phoneNumber: parsed.data.phoneNumber,
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: admin.id
      },
      update: {
        name: parsed.data.name,
        passwordHash,
        agencyName: parsed.data.agencyName,
        designation: parsed.data.designation,
        yearsOfExperience: parsed.data.yearsOfExperience,
        website: parsed.data.website || null,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        province: parsed.data.province,
        city: parsed.data.city,
        address: parsed.data.address,
        cnic: parsed.data.cnic,
        phoneNumber: parsed.data.phoneNumber,
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: admin.id
      }
    });

    return created;
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}