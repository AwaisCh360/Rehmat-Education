import { expect, test } from "@playwright/test";

test("agent can sign in and reach the catalog", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("agent@rehmatedu.local");
  await page.getByLabel("Password").fill("AgentPass123!");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page).toHaveURL(/\/programs$/);
  await expect(page.getByText("Browse the live university catalog.")).toBeVisible();
});
