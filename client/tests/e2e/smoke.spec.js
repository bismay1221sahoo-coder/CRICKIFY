import { expect, test } from "@playwright/test";

test("home page loads with hero and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "CRICKIFY" })).toBeVisible();
  await expect(page.getByText("Buy & sell used", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Browse listings" })).toBeVisible();
});

test("login page opens from navbar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: /login to account/i })).toBeVisible();
});

test("listing details route handles missing listing gracefully", async ({ page }) => {
  await page.goto("/listings/non-existing-id");
  await expect(page.getByText(/listing not found|not found/i)).toBeVisible();
});
