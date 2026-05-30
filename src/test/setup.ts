import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

const router = {
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

vi.mock("next/navigation", async () => {
  const redirect = vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`)
  })
  const notFound = vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  })

  return {
    useRouter: () => router,
    redirect,
    notFound,
  }
})

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: {
    ...globalThis.crypto,
    randomUUID: vi.fn(() => "test-upload-id"),
  },
})

Object.defineProperty(window.URL, "createObjectURL", {
  configurable: true,
  value: vi.fn(() => "blob:mock"),
})

Object.defineProperty(window.URL, "revokeObjectURL", {
  configurable: true,
  value: vi.fn(),
})

class TestImage {
  naturalWidth = 1600
  naturalHeight = 900
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

Object.defineProperty(window, "Image", {
  configurable: true,
  value: TestImage,
})

HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
  callback(new Blob(["png"], { type: "image/png" }))
}

export function getMockRouter() {
  return router
}
