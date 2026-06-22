import type { Metadata } from "next"
import { Inter, Newsreader, Noto_Serif } from "next/font/google"
import { LenisProvider } from "@/components/LenisProvider"
import "./globals.css"

const serif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const sans = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
})

const prose = Newsreader({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  variable: "--font-prose",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Minh Tam Portfolio",
  description:
    "An English-only Vietnamese storybook-inspired portfolio for social planning and creative copywriting.",
  openGraph: {
    title: "Minh Tam Portfolio",
    description:
      "An English-only Vietnamese storybook-inspired portfolio for social planning and creative copywriting.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${prose.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
