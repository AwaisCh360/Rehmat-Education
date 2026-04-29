import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { APP_ROLES } from "@/lib/auth/roles";

const nextAdminEmail = "rehmat@education.test".toLowerCase();
const nextAdminPassword = "Rehmat1122#";

async function main() {
  const passwordHash = await hash(nextAdminPassword, 10);
  const fallbackAdminId = `admin_${Date.now()}`;

  const adminByRole = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "User"
    WHERE role = ${APP_ROLES.ADMIN}
    ORDER BY "createdAt" ASC
    LIMIT 1
  `;

  if (adminByRole.length > 0) {
    await db.$executeRaw`
      UPDATE "User"
      SET email = ${nextAdminEmail}, "passwordHash" = ${passwordHash}
      WHERE id = ${adminByRole[0].id}
    `;
  } else {
    await db.$executeRaw`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (${fallbackAdminId}, 'Platform Admin', ${nextAdminEmail}, ${passwordHash}, ${APP_ROLES.ADMIN}, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, "updatedAt" = NOW()
    `;
  }

  console.log(`Admin credentials updated for ${nextAdminEmail}`);
}

main()
  .catch((error) => {
    console.error("Failed to update admin credentials:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
