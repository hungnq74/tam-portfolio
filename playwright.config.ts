import { defineConfig } from "@playwright/test"

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173)
const baseURL = `http://127.0.0.1:${PORT}`

const visualProjects = [
  { name: "mobile-375", viewport: { width: 375, height: 667 } },
  { name: "mobile-390", viewport: { width: 390, height: 844 } },
  { name: "tablet-768", viewport: { width: 768, height: 1024 } },
  { name: "desktop-1440", viewport: { width: 1440, height: 900 } },
]

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 90_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "light",
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: visualProjects.map((project) => ({
    name: project.name,
    use: {
      viewport: project.viewport,
    },
  })),
  webServer: {
    command: `next start -p ${PORT}`,
    env: {
      BLOB_READ_WRITE_TOKEN: "",
      BLOB_STORE_ID: "",
      VERCEL_OIDC_TOKEN: "",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
})
