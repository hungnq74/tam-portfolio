import { expect, type Locator, type Page } from "@playwright/test"

export type VisualLocale = "en" | "vi"

export type VisualAnchor =
  | {
      kind: "text"
      value: string | RegExp
      exact?: boolean
      label?: string
    }
  | {
      kind: "role"
      role: "button" | "heading" | "link" | "navigation" | "region"
      name: string | RegExp
      label?: string
    }
  | {
      kind: "image"
      name: string | RegExp
      label?: string
    }
  | {
      kind: "region"
      name: string | RegExp
      label?: string
    }

const LOCALE_STORAGE_KEY = "tam-portfolio-locale"
const CLIP_TOLERANCE_PX = 2

export async function openCustomerPage(
  page: Page,
  path: string,
  locale: VisualLocale,
) {
  await page.addInitScript(
    ({ localeKey, localeValue }) => {
      window.localStorage.setItem(localeKey, localeValue)
      document.documentElement.lang = localeValue
      document.documentElement.style.scrollBehavior = "auto"
    },
    { localeKey: LOCALE_STORAGE_KEY, localeValue: locale },
  )

  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await stabilizeVisualPage(page)
  await assertLocaleLoaded(page, locale)
}

export async function stabilizeVisualPage(page: Page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-delay: -1ms !important;
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `,
  })

  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready)
  await loadLazyImages(page)
  await page.evaluate(() => document.fonts?.ready)
  await assertImagesLoaded(page)
}

export async function assertVisualIntegrity(
  page: Page,
  anchors: VisualAnchor[],
) {
  await assertNoHorizontalPageOverflow(page)

  for (const anchor of anchors) {
    const locator = resolveAnchor(page, anchor)
    await assertVisibleAndNotHorizontallyClipped(
      page,
      locator,
      anchor.label ?? describeAnchor(anchor),
    )
  }
}

export async function expectCustomerScreenshot(page: Page, name: string) {
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

async function assertLocaleLoaded(page: Page, _locale: VisualLocale) {
  await expect(page.getByRole("button", { name: "English" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Tiếng Việt" })).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((localeKey) => window.localStorage.getItem(localeKey), LOCALE_STORAGE_KEY),
    )
    .toBe("en")
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("en")
}

async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    const sleep = (duration: number) =>
      new Promise((resolve) => window.setTimeout(resolve, duration))
    const originalX = window.scrollX
    const originalY = window.scrollY
    const maxY = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    )
    const viewportHeight = window.innerHeight || 1

    for (const image of Array.from(document.images)) {
      image.loading = "eager"
    }

    for (let y = 0; y <= maxY; y += Math.max(viewportHeight * 0.85, 240)) {
      window.scrollTo({ top: y, left: 0, behavior: "auto" })
      await sleep(35)
    }

    window.scrollTo({ top: originalY, left: originalX, behavior: "auto" })
    await sleep(80)
  })

  await page.waitForFunction(
    () =>
      Array.from(document.images).every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    null,
    { timeout: 12_000 },
  )
}

async function assertImagesLoaded(page: Page) {
  const brokenImages = await page.evaluate(() => {
    return Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => ({
        alt: image.alt,
        src: image.currentSrc || image.src,
      }))
  })

  expect(brokenImages).toEqual([])
}

async function assertNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const tolerance = 2
    const viewportWidth = window.innerWidth
    const documentElement = document.documentElement
    const body = document.body

    function isVisible(element: Element) {
      const style = window.getComputedStyle(element)

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      ) {
        return false
      }

      const rect = element.getBoundingClientRect()

      return rect.width > 0 && rect.height > 0
    }

    function hasHorizontalContainingAncestor(element: Element) {
      let parent = element.parentElement

      while (parent && parent !== body && parent !== documentElement) {
        const style = window.getComputedStyle(parent)
        const overflowX = style.overflowX

        if (
          overflowX === "auto" ||
          overflowX === "scroll" ||
          overflowX === "hidden" ||
          overflowX === "clip"
        ) {
          return true
        }

        parent = parent.parentElement
      }

      return false
    }

    const offenders = Array.from(body.querySelectorAll("*"))
      .filter((element) => {
        if (!isVisible(element)) return false
        if (hasHorizontalContainingAncestor(element)) return false

        const rect = element.getBoundingClientRect()

        return rect.left < -tolerance || rect.right > viewportWidth + tolerance
      })
      .slice(0, 10)
      .map((element) => {
        const rect = element.getBoundingClientRect()

        return {
          className:
            typeof (element as HTMLElement).className === "string"
              ? (element as HTMLElement).className
              : "",
          tag: element.tagName.toLowerCase(),
          text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90),
          x: Math.round(rect.x),
          width: Math.round(rect.width),
          right: Math.round(rect.right),
        }
      })

    return {
      bodyClientWidth: body.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      documentClientWidth: documentElement.clientWidth,
      documentScrollWidth: documentElement.scrollWidth,
      offenders,
    }
  })

  expect(overflow.documentScrollWidth).toBeLessThanOrEqual(
    overflow.documentClientWidth + CLIP_TOLERANCE_PX,
  )
  expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(
    overflow.bodyClientWidth + CLIP_TOLERANCE_PX,
  )
  expect(overflow.offenders).toEqual([])
}

function resolveAnchor(page: Page, anchor: VisualAnchor) {
  if (anchor.kind === "text") {
    return page.getByText(anchor.value, { exact: anchor.exact ?? true }).first()
  }

  if (anchor.kind === "image") {
    return page.getByRole("img", { name: anchor.name }).first()
  }

  if (anchor.kind === "region") {
    return page.getByRole("region", { name: anchor.name }).first()
  }

  return page.getByRole(anchor.role, { name: anchor.name }).first()
}

async function assertVisibleAndNotHorizontallyClipped(
  page: Page,
  locator: Locator,
  label: string,
) {
  await locator.scrollIntoViewIfNeeded()
  await expect(locator, label).toBeVisible()

  const box = await locator.boundingBox()
  const viewport = page.viewportSize()

  expect(box, `${label} has a bounding box`).not.toBeNull()
  expect(viewport, "viewport is available").not.toBeNull()

  if (!box || !viewport) return

  expect(box.x, `${label} is clipped on the left`).toBeGreaterThanOrEqual(
    -CLIP_TOLERANCE_PX,
  )
  expect(
    box.x + box.width,
    `${label} is clipped on the right`,
  ).toBeLessThanOrEqual(viewport.width + CLIP_TOLERANCE_PX)
}

function describeAnchor(anchor: VisualAnchor) {
  if (anchor.kind === "text") return `text ${String(anchor.value)}`
  if (anchor.kind === "image") return `image ${String(anchor.name)}`
  if (anchor.kind === "region") return `region ${String(anchor.name)}`

  return `${anchor.role} ${String(anchor.name)}`
}
