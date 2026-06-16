import { expect, type Page, test } from "@playwright/test"

const LOCALE_STORAGE_KEY = "tam-portfolio-locale"

async function openEnglishPage(page: Page, path: string) {
  await page.addInitScript((localeKey) => {
    window.localStorage.setItem(localeKey, "en")
    document.documentElement.style.scrollBehavior = "auto"
  }, LOCALE_STORAGE_KEY)

  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
}

async function expectGalleryRestored(page: Page, heading: string) {
  const gallerySection = page.locator('[data-section-id="gallery"]')

  await page.waitForFunction(
    () => {
      const gallery = document.querySelector('[data-section-id="gallery"]')
      return gallery && Math.abs(gallery.getBoundingClientRect().top) <= 4
    },
    undefined,
    { timeout: 10_000 },
  )
  await expect(gallerySection.getByRole("heading", { name: heading })).toBeVisible()

  const position = await page.evaluate(() => {
    const cover = document.querySelector('[data-section-id="cover"]')
    const gallery = document.querySelector('[data-section-id="gallery"]')

    return {
      coverTop: cover?.getBoundingClientRect().top ?? null,
      galleryTop: gallery?.getBoundingClientRect().top ?? null,
    }
  })

  expect(Math.abs(position.galleryTop ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(4)
  expect(position.coverTop ?? 0).toBeLessThan(0)
}

async function expectWritingScopeHub(page: Page) {
  await expectGalleryRestored(page, "Writing with Intent")
  await expect(
    page.locator('[data-section-id="gallery"]').getByText("Social Outreach", { exact: true }),
  ).toBeVisible()
  expect(page.url()).toContain("field=creative-copywriter")
  expect(page.url()).not.toContain("project=social-outreach")
}

test.describe("project return navigation", () => {
  test("browser Back from a content project restores the exact gallery state", async ({ page }) => {
    await openEnglishPage(page, "/?field=creative-copywriter&project=weshare#gallery")
    await expectGalleryRestored(page, "Fanpage Always-on Content")

    await page.locator('a[href="/work/weshare"]').click()
    await page.waitForURL("**/work/weshare")
    await page.goBack({ waitUntil: "domcontentloaded" })

    await expectGalleryRestored(page, "Fanpage Always-on Content")
    expect(page.url()).toContain("field=creative-copywriter")
    expect(page.url()).toContain("project=weshare")
  })

  test("project Back link restores the matching content scope", async ({ page }) => {
    await openEnglishPage(page, "/work/tiktok")

    await page.getByRole("link", { name: "Back" }).click()

    await expectGalleryRestored(page, "Website Content")
    expect(page.url()).toContain("field=creative-copywriter")
    expect(page.url()).toContain("project=tiktok")
  })

  test("scope landing projects return to the scope hub from both exit paths", async ({ page }) => {
    await openEnglishPage(page, "/?field=creative-copywriter#gallery")
    await expectWritingScopeHub(page)

    await page.locator('a[href="/work/social-outreach"]').click()
    await page.waitForURL("**/work/social-outreach")
    await page.goBack({ waitUntil: "domcontentloaded" })
    await expectWritingScopeHub(page)

    await page.locator('a[href="/work/social-outreach"]').click()
    await page.waitForURL("**/work/social-outreach")
    await page.getByRole("link", { name: "Back" }).click()
    await expectWritingScopeHub(page)
  })
})
