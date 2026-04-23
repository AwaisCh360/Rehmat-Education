import { NextResponse } from "next/server";

import { APP_ROLES } from "@/lib/auth/roles";
import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(_request: Request, context: { params: { id: string } }) {
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const id = context.params.id;

  try {
    const result = await db.$transaction(async (tx) => {
      const requestRecord = await tx.agentSignupRequest.findUnique({
        where: {
          id
        }
      });

      if (!requestRecord) {
        throw new Error("Request not found.");
      }

      if (requestRecord.status !== "PENDING") {
        throw new Error("This request has already been reviewed.");
      }

      const existingUser = await tx.user.findUnique({
        where: {
          email: requestRecord.email
        }
      });

      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      const user = await tx.user.create({
        data: {
          name: requestRecord.name,
          email: requestRecord.email,
          passwordHash: requestRecord.passwordHash,
          role: APP_ROLES.AGENT
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      await tx.agentSignupRequest.update({
        where: {
          id: requestRecord.id
        },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: admin.id
        }
      });

      return user;
    });

    return NextResponse.json({ ok: true, user: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to approve request."
      },
      { status: 400 }
    );
  }
}