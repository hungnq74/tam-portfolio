import { expect, type Page, test } from "@playwright/test"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { stabilizeVisualPage } from "./helpers"

const LOCALE_STORAGE_KEY = "tam-portfolio-locale"

type AdminCredentials = {
  username: string
  password: string
}

const credentials = getAdminCredentials()

test.skip(!credentials, "Admin credentials are required for admin E2E tests.")

async function login(page: Page) {
  if (!credentials) throw new Error("Admin credentials are not configured.")

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" })
  await submitLogin(page)

  if (await page.getByText(/invalid username or password/i).isVisible().catch(() => false)) {
    await submitLogin(page)
  }

  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible()
}

async function submitLogin(page: Page) {
  if (!credentials) throw new Error("Admin credentials are not configured.")

  const username = page.getByLabel("Username")
  const password = page.getByLabel("Password")

  await expect(username).toBeVisible()
  await username.fill(credentials.username)
  await expect(username).toHaveValue(credentials.username)
  await password.fill(credentials.password)
  await expect(password).toHaveValue(credentials.password)
  await Promise.all([
    page.waitForURL("**/admin", { timeout: 15_000 }).catch(() => null),
    page.getByRole("button", { name: /sign in/i }).click(),
  ])
}

async function openEnglishCustomerPage(page: Page, path: string) {
  await page.addInitScript((localeKey) => {
    window.localStorage.setItem(localeKey, "en")
    document.documentElement.style.scrollBehavior = "auto"
  }, LOCALE_STORAGE_KEY)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("button", { name: "English" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Tiếng Việt" })).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((localeKey) => window.localStorage.getItem(localeKey), LOCALE_STORAGE_KEY),
    )
    .toBe("en")
}

async function expectAdminScreenshot(page: Page, name: string) {
  await stabilizeVisualPage(page)
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  })
  await page.waitForTimeout(150)

  await expect(page).toHaveScreenshot(`${name}.png`, {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
    scale: "css",
  })
}

test.describe("admin proposal project flow", () => {
  test("protects admin routes, rejects bad credentials, and signs in with configured credentials", async ({
    page,
  }) => {
    if (!credentials) return

    await page.goto("/admin", { waitUntil: "domcontentloaded" })
    await page.waitForURL("**/admin/login")

    await page.getByLabel("Username").fill(credentials.username)
    await page.getByLabel("Password").fill("definitely-not-the-admin-password")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/invalid username or password/i)).toBeVisible()

    await page.getByLabel("Password").fill(credentials.password)
    await page.getByRole("button", { name: /sign in/i }).click()
    await page.waitForURL("**/admin")
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible()
  })

  test("lists only editable proposal projects and hides removed metadata controls", async ({
    page,
  }) => {
    await login(page)

    await expect(page.getByRole("link", { name: /new project/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/admin/projects/axe",
    )
    await expect(page.locator('a[href="/admin/projects/weshare"]')).toHaveCount(
      0,
    )
    await expect(page.locator('a[href="/admin/projects/tiktok"]')).toHaveCount(
      0,
    )
    await expect(
      page.locator(".admin-pill").filter({ hasText: /^social-planner$/ }),
    ).toHaveCount(0)
    await expect(
      page.locator(".admin-pill").filter({ hasText: /^creative-copywriter$/ }),
    ).toHaveCount(0)
    await expect(
      page.locator(".admin-pill").filter({ hasText: /^Campaign$/ }),
    ).toHaveCount(0)
  })

  test("renders the focused AXE edit form across content, media, and credits tabs", async ({
    page,
  }) => {
    await login(page)
    await page.goto("/admin/projects/axe", { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("tab", { name: "Content" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Media" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "CTA & Credits" })).toBeVisible()
    await expect(page.getByLabel("Project id")).toHaveValue("axe")
    await expect(page.getByLabel("Title")).toBeVisible()
    await expect(page.getByLabel("Summary")).toBeVisible()
    await expect(page.getByLabel("VI summary")).toHaveCount(0)
    await expect(page.getByText("Vietnamese content")).toHaveCount(0)
    await expect(page.getByLabel("Field")).toHaveCount(0)
    await expect(page.getByLabel("Year")).toHaveCount(0)
    await expect(page.getByLabel("Category")).toHaveCount(0)
    await expect(page.getByLabel("Client")).toHaveCount(0)
    await expect(page.getByLabel("Scope")).toHaveCount(0)
    await expect(page.getByLabel("Objective")).toHaveCount(0)
    await expect(page.getByLabel("Solution")).toHaveCount(0)
    await expect(page.getByLabel("Results")).toHaveCount(0)

    await page.getByRole("tab", { name: "Media" }).click()
    await expect(page.getByLabel(/upload cover image/i)).toBeVisible()
    await expect(page.getByLabel(/upload main image/i)).toBeVisible()
    await expect(page.getByLabel(/upload proposal PDF/i)).toBeVisible()
    await expect(page.getByText("Adjust cover crop")).toBeVisible()
    await expect(page.getByRole("button", { name: "Center" })).toBeVisible()
    await expect(page.getByLabel(/Move focus left or right/)).toBeVisible()
    await expect(page.getByLabel(/Move focus up or down/)).toBeVisible()
    await expect(page.getByText(/Cover focal/)).toHaveCount(0)
    await expect(
      page.locator("p").filter({ hasText: /^Main image$/ }),
    ).toBeVisible()
    await expect(
      page.locator("p").filter({ hasText: /^Slides$/ }),
    ).toBeVisible()

    await page.getByRole("tab", { name: "CTA & Credits" }).click()
    await expect(page.getByLabel("CTA label")).toHaveValue(
      "View full portfolio",
    )
    await expect(page.getByLabel("VI CTA label")).toHaveCount(0)
    await expect(page.getByLabel("VI credit intro")).toHaveCount(0)
    await expect(page.getByLabel("Collaborator names")).toContainText(
      "Minh Anh",
    )
    await expect(
      page.locator("span").filter({ hasText: /^Minh Anh$/ }),
    ).toBeVisible()
    await expect(
      page.locator("span").filter({ hasText: /^Hoàng Linh$/ }),
    ).toBeVisible()
    await expect(
      page.locator("span").filter({ hasText: /^Bảo Trân$/ }),
    ).toBeVisible()
  })

  test("prepares a new proposal project with slug generation and default CTA credits", async ({
    page,
  }) => {
    await login(page)
    await page.goto("/admin/projects/new", { waitUntil: "domcontentloaded" })

    await expect(
      page.getByRole("heading", { name: "New project" }),
    ).toBeVisible()
    await page.getByLabel("Title").fill("Summer Proposal 2026")
    await expect(page.getByLabel("Project id")).toHaveValue(
      "summer-proposal-2026",
    )

    await page.getByRole("tab", { name: "CTA & Credits" }).click()
    await expect(page.getByLabel("CTA label")).toHaveValue(
      "View full portfolio",
    )
    await expect(page.getByLabel("VI CTA label")).toHaveCount(0)
    await expect(page.getByLabel("Collaborator names")).toHaveValue(
      "Minh Anh\nHoàng Linh\nBảo Trân",
    )
    await expect(
      page.locator("span").filter({ hasText: /^Minh Anh$/ }),
    ).toBeVisible()
  })

  test("does not expose Writing projects through admin edit routes", async ({
    page,
  }) => {
    await login(page)

    const response = await page.goto("/admin/projects/weshare", {
      waitUntil: "domcontentloaded",
    })

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "Edit project" }),
    ).toHaveCount(0)
  })
})

test.describe("admin editorial CMS visuals", () => {
  test("captures the login page", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()

    await expectAdminScreenshot(page, "admin-login")
  })

  test("captures the project list", async ({ page }) => {
    await login(page)

    await expectAdminScreenshot(page, "admin-list")
  })

  test("captures the AXE project editor", async ({ page }) => {
    await login(page)
    await page.goto("/admin/projects/axe", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Edit project" })).toBeVisible()

    await expectAdminScreenshot(page, "admin-edit-axe")
  })

  test("captures the new project editor", async ({ page }) => {
    await login(page)
    await page.goto("/admin/projects/new", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "New project" })).toBeVisible()

    await expectAdminScreenshot(page, "admin-new-project")
  })
})

test.describe("public AXE proposal flow", () => {
  test("keeps CTA before the carousel and credit chips after the carousel", async ({
    page,
  }) => {
    await openEnglishCustomerPage(page, "/work/axe")

    const cta = page.getByRole("link", {
      name: "View full portfolio: Full proposal",
    })
    const carousel = page.getByRole("region", {
      name: /AXE proposal carousel/i,
    })
    const credit = page.getByText(
      "Shout out to the friends who built this proposal with me.",
    )

    await expect(
      page.getByRole("img", { name: "AXE generated project cover artwork" }),
    ).toBeVisible()
    await expect(
      page.getByRole("img", {
        name: "AXE executive summary page from the proposal PDF",
      }),
    ).toBeVisible()
    await expect(cta).toHaveAttribute("href", "#axe-proposal-carousel")
    await expect(carousel).toHaveAttribute("id", "axe-proposal-carousel")
    await expect(
      page.locator("span").filter({ hasText: /^Minh Anh$/ }),
    ).toBeVisible()
    await expect(
      page.locator("span").filter({ hasText: /^Hoàng Linh$/ }),
    ).toBeVisible()
    await expect(
      page.locator("span").filter({ hasText: /^Bảo Trân$/ }),
    ).toBeVisible()

    await expect(
      page.locator("img[alt='AXE full proposal page 1']").first(),
    ).toHaveJSProperty("naturalWidth", 1600)

    const order = await page.evaluate(() => {
      const summary = document.querySelector(
        "img[alt='AXE executive summary page from the proposal PDF']",
      )
      const ctaLink = document.querySelector("a[href='#axe-proposal-carousel']")
      const carouselRegion = document.querySelector("#axe-proposal-carousel")
      const creditText = Array.from(document.querySelectorAll("p")).find(
        (item) =>
          item.textContent?.includes(
            "Shout out to the friends who built this proposal with me.",
          ),
      )

      if (!summary || !ctaLink || !carouselRegion || !creditText) return null

      return {
        summaryBeforeCta: Boolean(
          summary.compareDocumentPosition(ctaLink) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        ctaBeforeCarousel: Boolean(
          ctaLink.compareDocumentPosition(carouselRegion) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        carouselBeforeCredit: Boolean(
          carouselRegion.compareDocumentPosition(creditText) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      }
    })

    expect(order).toEqual({
      summaryBeforeCta: true,
      ctaBeforeCarousel: true,
      carouselBeforeCredit: true,
    })

    await cta.click()
    await expect(page).toHaveURL(/#axe-proposal-carousel$/)
    await expect(carousel).toBeInViewport()
  })
})

function getAdminCredentials(): AdminCredentials | null {
  const envFile = readLocalEnv()
  const username = process.env.ADMIN_USERNAME ?? envFile.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD ?? envFile.ADMIN_PASSWORD

  return username && password ? { username, password } : null
}

function readLocalEnv() {
  const envPath = join(process.cwd(), ".env.local")

  if (!existsSync(envPath)) return {} as Record<string, string>

  return readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .reduce(
      (acc, line) => {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (!match) return acc

        acc[match[1]] = match[2].replace(/^['"]|['"]$/g, "")
        return acc
      },
      {} as Record<string, string>,
    )
}
