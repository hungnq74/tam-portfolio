import { expect, type Page, test } from "@playwright/test"

const LOCALE_STORAGE_KEY = "tam-portfolio-locale"
type MotionMode = "default" | "reduced"

async function openEnglishPage(page: Page, path: string, motionMode: MotionMode = "default") {
  await page.addInitScript((localeKey) => {
    window.localStorage.setItem(localeKey, "en")
    document.documentElement.style.scrollBehavior = "auto"
  }, LOCALE_STORAGE_KEY)

  await page.emulateMedia({
    reducedMotion: motionMode === "reduced" ? "reduce" : "no-preference",
  })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("button", { name: "English" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Tiếng Việt" })).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((localeKey) => window.localStorage.getItem(localeKey), LOCALE_STORAGE_KEY),
    )
    .toBe("en")
}

async function expectContentGallery(
  page: Page,
  heading: string,
  { atTop = true }: { atTop?: boolean } = {},
) {
  const gallerySection = page.locator('[data-section-id="gallery"]')

  await expect(gallerySection).toHaveCount(1)
  await expect(gallerySection.getByRole("heading", { name: heading })).toBeAttached()
  await expect(page.locator('[data-section-id="cover"]')).toHaveCount(0)

  if (!atTop) {
    await page.waitForFunction(
      () => {
        const gallery = document.querySelector('[data-section-id="gallery"]')
        if (!gallery) return false

        const rect = gallery.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
      },
      undefined,
      { timeout: 10_000 },
    )
    return
  }

  await page.waitForFunction(
    () => {
      const gallery = document.querySelector('[data-section-id="gallery"]')
      return gallery && Math.abs(gallery.getBoundingClientRect().top) <= 4
    },
    undefined,
    { timeout: 10_000 },
  )

  const position = await page.evaluate(() => {
    const gallery = document.querySelector('[data-section-id="gallery"]')

    return {
      galleryTop: gallery?.getBoundingClientRect().top ?? null,
    }
  })

  expect(Math.abs(position.galleryTop ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(4)
}

async function expectWritingScopeHub(page: Page, options?: { atTop?: boolean }) {
  await expectContentGallery(page, "Writing with Intent", options)
  await expect(
    page.locator('[data-section-id="gallery"]').getByText("Social Outreach", { exact: true }),
  ).toBeAttached()
  expect(new URL(page.url()).pathname).toBe("/content/creative-copywriter")
}

async function expectHomeFieldChooser(page: Page) {
  await page.waitForURL("**/#fields")

  const url = new URL(page.url())
  expect(url.pathname).toBe("/")
  expect(url.hash).toBe("#fields")

  const fieldsSection = page.locator('[data-section-id="fields"]')

  await expect(fieldsSection).toHaveCount(1)
  await expect(fieldsSection.getByText("Thinking in Systems", { exact: true })).toBeAttached()
  await expect(fieldsSection.getByText("Writing with Intent", { exact: true })).toBeAttached()

  await page.waitForFunction(
    () => {
      const fields = document.querySelector('[data-section-id="fields"]')
      if (!fields) return false

      const rect = fields.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.65
    },
    undefined,
    { timeout: 10_000 },
  )
}

test.describe("project return navigation", () => {
  test("cold visits to the home page still start at the cover", async ({ page }) => {
    await openEnglishPage(page, "/")

    await expect(page.locator('[data-section-id="cover"]')).toHaveCount(1)
    await expect(
      page.getByRole("img", { name: /Portfolio cover inspired by Vietnamese storybooks/i }),
    ).toBeAttached()

    const position = await page.evaluate(() => ({
      scrollY: window.scrollY,
      coverTop:
        document.querySelector('[data-section-id="cover"]')?.getBoundingClientRect().top ?? null,
    }))

    expect(position.scrollY).toBe(0)
    expect(position.coverTop).toBe(0)
  })

  for (const motionMode of ["default", "reduced"] as const) {
    test.describe(`${motionMode} motion`, () => {
      test("Thinking content Back button returns to the home field chooser", async ({
        page,
      }) => {
        await openEnglishPage(page, "/content/social-planner", motionMode)
        await expectContentGallery(page, "Thinking in Systems")

        await page
          .locator('[data-section-id="gallery"]')
          .getByRole("button", { name: "Back" })
          .click()

        await expectHomeFieldChooser(page)
      })

      test("Writing content Back button returns to the home field chooser", async ({
        page,
      }) => {
        await openEnglishPage(page, "/content/creative-copywriter", motionMode)
        await expectWritingScopeHub(page)

        await page
          .locator('[data-section-id="gallery"]')
          .getByRole("button", { name: "Back" })
          .click()

        await expectHomeFieldChooser(page)
      })

      test("browser Back from a content project restores the exact content route", async ({
        page,
      }) => {
        await openEnglishPage(
          page,
          "/content/creative-copywriter/scope/fanpage-always-on-content?project=weshare",
          motionMode,
        )
        await expectContentGallery(page, "Fanpage Always-on Content")

        await page.locator('a[href="/work/weshare"]').click()
        await page.waitForURL("**/work/weshare")
        await page.goBack({ waitUntil: "domcontentloaded" })

        await expectContentGallery(page, "Fanpage Always-on Content", { atTop: false })
        const url = new URL(page.url())
        expect(url.pathname).toBe(
          "/content/creative-copywriter/scope/fanpage-always-on-content",
        )
        expect(url.searchParams.get("project")).toBe("weshare")
      })

      test("project Back link restores the matching content scope", async ({ page }) => {
        await openEnglishPage(page, "/work/tiktok", motionMode)

        await page.getByRole("link", { name: "Back" }).click()

        await expectContentGallery(page, "Website Content")
        const url = new URL(page.url())
        expect(url.pathname).toBe("/content/creative-copywriter/scope/website-content")
        expect(url.searchParams.get("project")).toBe("tiktok")
      })

      test("scope landing projects return to the scope hub from both exit paths", async ({
        page,
      }) => {
        await openEnglishPage(page, "/content/creative-copywriter", motionMode)
        await expectWritingScopeHub(page)

        await page.locator('a[href="/work/social-outreach"]').click()
        await page.waitForURL("**/work/social-outreach")
        await page.goBack({ waitUntil: "domcontentloaded" })
        await expectWritingScopeHub(page, { atTop: false })

        await page.locator('a[href="/work/social-outreach"]').click()
        await page.waitForURL("**/work/social-outreach")
        await page.getByRole("link", { name: "Back" }).click()
        await expectWritingScopeHub(page)
      })

      test("legacy gallery URLs redirect to content routes without rendering the cover", async ({
        page,
      }) => {
        await openEnglishPage(
          page,
          "/?field=creative-copywriter&project=weshare#gallery",
          motionMode,
        )

        await expectContentGallery(page, "Fanpage Always-on Content")
        const url = new URL(page.url())
        expect(url.pathname).toBe(
          "/content/creative-copywriter/scope/fanpage-always-on-content",
        )
        expect(url.searchParams.get("project")).toBe("weshare")
      })
    })
  }
})
