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
      },
      colors: {
        paper: "rgb(var(--paper))",
        "paper-deep": "rgb(var(--paper-deep))",
        ink: "rgb(var(--ink))",
        clay: "rgb(var(--clay))",
        moss: "rgb(var(--moss))",
        gold: "rgb(var(--gold))",
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
