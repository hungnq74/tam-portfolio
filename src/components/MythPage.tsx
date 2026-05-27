"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, Feather, Sparkles } from "lucide-react"
import { LocaleToggle } from "@/components/LocaleToggle"
import { getPortfolioContent, MYTH_CONTENT } from "@/data/portfolio"
import { useLocale } from "@/hooks/useLocale"

export function MythPage() {
  const { locale, setLocale } = useLocale()
  const portfolio = getPortfolioContent(locale)
  const myth = MYTH_CONTENT[locale]

  return (
    <main className="story-texture min-h-screen overflow-x-clip px-4 py-24 sm:px-6 lg:px-[5.5rem]">
      <LocaleToggle
        locale={locale}
        ariaLabel={portfolio.ui.languageToggleAria}
        onLocaleChange={setLocale}
        className="fixed left-4 top-4 z-[60]"
      />

      <section className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(116,63,36,0.22)] bg-paper/82 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-clay shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-gold/18 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
        >
          <ArrowLeft className="h-4 w-4" />
          {myth.portfolioLabel}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <article>
            <div className="mb-8 flex items-center gap-4 text-clay">
              <span className="h-px w-16 bg-gold/45" />
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold/18 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                <BookOpen className="h-4 w-4" />
                {myth.eyebrow}
              </span>
            </div>
            <h1 className="max-w-4xl font-serif text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.9] text-moss">
              {myth.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/82 sm:text-xl sm:leading-9">
              {myth.lead}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/68">
              {myth.intro}
            </p>
          </article>

          <div className="paper-panel story-frame relative overflow-hidden rounded-[10px] p-3 shadow-story">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] border border-[rgba(116,63,36,0.24)] bg-paper-deep">
              <img
                src="/assets/storybook/minh-tam.jpg"
                alt={myth.imageAlt}
                className="h-full w-full object-cover object-[center_32%]"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {myth.panels.map((panel, index) => (
            <article
              key={panel.title}
              className="paper-panel story-frame rounded-[8px] p-6 shadow-story"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/55 bg-gold/12 text-clay">
                {index === 0 ? (
                  <Feather className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </span>
              <h2 className="mt-6 font-serif text-3xl font-semibold leading-tight text-moss">
                {panel.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/72">{panel.body}</p>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-12 max-w-3xl border-t border-[rgba(116,63,36,0.18)] pt-8 text-center">
          <h2 className="font-serif text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-none text-clay">
            {myth.closingTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/72">
            {myth.closingBody}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:-translate-y-0.5 hover:bg-[#87331f] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-4 focus:ring-offset-paper"
          >
            {myth.portfolioLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </section>
    </main>
  )
}
