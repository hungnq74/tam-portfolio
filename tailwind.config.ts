import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        prose: ["var(--font-prose)", "Georgia", "serif"],
      },
      colors: {
        paper: "rgb(var(--paper))",
        "paper-deep": "rgb(var(--paper-deep))",
        ink: "rgb(var(--ink))",
        clay: "rgb(var(--clay))",
        moss: "rgb(var(--moss))",
        gold: "rgb(var(--gold))",
        // Admin palette: values live on .admin-app in globals.css.
        "admin-canvas": "rgb(var(--admin-canvas) / <alpha-value>)",
        "admin-surface": "rgb(var(--admin-surface) / <alpha-value>)",
        "admin-soft": "rgb(var(--admin-soft) / <alpha-value>)",
        "admin-soft-2": "rgb(var(--admin-soft-2) / <alpha-value>)",
        "admin-line": "rgb(var(--admin-line) / <alpha-value>)",
        "admin-line-strong": "rgb(var(--admin-line-strong) / <alpha-value>)",
        "admin-ink": "rgb(var(--admin-ink) / <alpha-value>)",
        "admin-body": "rgb(var(--admin-body) / <alpha-value>)",
        "admin-muted": "rgb(var(--admin-muted) / <alpha-value>)",
        "admin-faint": "rgb(var(--admin-faint) / <alpha-value>)",
        "admin-primary": "rgb(var(--admin-primary) / <alpha-value>)",
        "admin-primary-hover": "rgb(var(--admin-primary-hover) / <alpha-value>)",
        "admin-accent": "rgb(var(--admin-accent) / <alpha-value>)",
      },
      boxShadow: {
        story: "0 24px 70px rgba(48, 34, 18, 0.18)",
        insetpaper: "inset 0 0 0 1px rgba(122, 61, 39, 0.18)",
      },
    },
  },
  plugins: [],
}

export default config
