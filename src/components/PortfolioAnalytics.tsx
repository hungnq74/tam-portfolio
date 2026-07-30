"use client"

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next"

export function PortfolioAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if ("url" in event && typeof event.url === "string") {
          try {
            if (new URL(event.url).pathname.startsWith("/stats")) {
              return null
            }
          } catch {
            return event
          }
        }

        return event
      }}
    />
  )
}
