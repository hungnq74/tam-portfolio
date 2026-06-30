import { expect, type Page, test } from "@playwright/test"

const LOCALE_STORAGE_KEY = "tam-portfolio-locale"

type SmokeRoute = {
  path: string
  label: string
  verify: (page: Page) => Promise<void>
}

async function openPublicRoute(page: Page, path: string) {
  const browserErrors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  page.on("pageerror", (error) => browserErrors.push(error.message))

  await page.addInitScript((localeKey) => {
    window.localStorage.setItem(localeKey, "en")
    const disableSmoothScroll = () => {
      document.documentElement.style.scrollBehavior = "auto"
    }

    if (document.documentElement) {
      disableSmoothScroll()
    } else {
      window.addEventListener("DOMContentLoaded", disableSmoothScroll, { once: true })
    }
  }, LOCALE_STORAGE_KEY)
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready)

  await expect(page.getByText("Application error")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Tiếng Việt" })).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((localeKey) => window.localStorage.getItem(localeKey), LOCALE_STORAGE_KEY),
    )
    .toBe("en")

  return browserErrors
}

const routes: SmokeRoute[] = [
  {
    path: "/",
    label: "home cover",
    verify: async (page) => {
      await expect(page.locator('[data-section-id="cover"]')).toHaveCount(1)
      await expect(
        page.getByRole("navigation", { name: "Primary portfolio navigation" }),
      ).toHaveCount(0)
      await expect(
        page.getByRole("button", { name: "Scroll to the introduction page" }),
      ).toBeVisible()
    },
  },
  {
    path: "/#about",
    label: "home intro",
    verify: async (page) => {
      await expect(page.locator('[data-section-id="about"]')).toHaveCount(1)
      await expect(page.getByText(/Once upon a day/i)).toBeVisible()
      await expect(
        page.getByRole("navigation", { name: "Primary portfolio navigation" }),
      ).toBeVisible()
    },
  },
  {
    path: "/#fields",
    label: "work chooser",
    verify: async (page) => {
      await expect(page.locator('[data-section-id="fields"]')).toHaveCount(1)
      await expect(page.getByText("Thinking in Systems", { exact: true })).toBeVisible()
      await expect(page.getByRole("link", { name: "WORK", exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      )
    },
  },
  {
    path: "/content/creative-copywriter/scope/fanpage-always-on-content?project=aeon-vietnam",
    label: "content scope",
    verify: async (page) => {
      await expect(page.locator('[data-section-id="gallery"]')).toHaveCount(1)
      await expect(page.getByRole("heading", { name: "Fanpage Always-on Content" })).toBeVisible()
      await expect(page.getByText("AEON Vietnam", { exact: true })).toBeVisible()
    },
  },
  {
    path: "/work/aeon-vietnam",
    label: "AEON detail",
    verify: async (page) => {
      await expect(
        page.getByRole("img", { name: "AEON Vietnam always-on content horizontal cover" }),
      ).toBeVisible()
      await expect(page.getByText(/AEON is the kind of brand/i)).toBeVisible()

      const facebookHeading = page.getByRole("heading", { name: "FACEBOOK" })
      await facebookHeading.scrollIntoViewIfNeeded()
      await expect(facebookHeading).toBeVisible()

      const instagramHeading = page.getByRole("heading", { name: "INSTAGRAM" })
      await instagramHeading.scrollIntoViewIfNeeded()
      await expect(instagramHeading).toBeVisible()
    },
  },
  {
    path: "/work/social-outreach",
    label: "Social Outreach detail",
    verify: async (page) => {
      await expect(page.getByRole("heading", { name: "Social Outreach" })).toBeVisible()
      await expect(page.getByText("Poetry & Creative Writing")).toBeVisible()
    },
  },
  {
    path: "/myth",
    label: "Me page",
    verify: async (page) => {
      await expect(page.getByText(/THE WORLD MAKES MORE SENSE THAN IT SEEMS/i)).toBeVisible()
      await expect(page.getByRole("heading", { name: "Reader Reviews" })).toBeVisible()
      await expect(
        page.getByRole("region", { name: "Reader Reviews carousel" }),
      ).toBeVisible()
      await expect(page.getByRole("link", { name: "WORK", exact: true })).toBeVisible()
    },
  },
]

test.describe("public app smoke coverage", () => {
  for (const route of routes) {
    test(route.label, async ({ page }) => {
      const browserErrors = await openPublicRoute(page, route.path)

      await route.verify(page)

      expect(browserErrors).toEqual([])
    })
  }
})
