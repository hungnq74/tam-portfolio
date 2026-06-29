"use client"

import Link from "next/link"
import { type KeyboardEvent, useState } from "react"
import { ArrowLeft, ArrowRight, BookOpen, Check, Copy, ExternalLink, Feather, Mail, Phone, Sparkles } from "lucide-react"
import { GlobalPortfolioNav } from "@/components/GlobalPortfolioNav"
import { LocaleToggle } from "@/components/LocaleToggle"
import { getPortfolioContent, MYTH_CONTENT, type MythContent } from "@/data/portfolio"
import { useLocale } from "@/hooks/useLocale"

type MythRecommendations = NonNullable<NonNullable<MythContent["truth"]>["recommendations"]>

export function MythPage() {
  const { locale, setLocale } = useLocale()
  const [copiedContact, setCopiedContact] = useState<"email" | "phone" | null>(null)
  const portfolio = getPortfolioContent(locale)
  const myth = MYTH_CONTENT[locale]
  const truth = myth.truth

  async function copyContact(target: "email" | "phone", value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedContact(target)
      window.setTimeout(() => {
        setCopiedContact((current) => (current === target ? null : current))
      }, 1400)
    } catch {
      setCopiedContact(null)
    }
  }

  if (truth) {
    const [beliefName, beliefRest] = truth.beliefPrefix.split(" - ")
    const contact = truth.contact

    return (
      <main className="story-texture min-h-screen overflow-x-clip px-4 pb-24 pt-24 sm:px-6 lg:px-[5.5rem]">
        <GlobalPortfolioNav />
        <LocaleToggle
          locale={locale}
          ariaLabel={portfolio.ui.languageToggleAria}
          onLocaleChange={setLocale}
          className="fixed left-4 top-4 z-[60]"
        />

        <section className="mx-auto w-full max-w-6xl">
          <div className="mb-12 border-y border-[rgba(116,63,36,0.18)] py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="group inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-clay transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
              >
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                {myth.portfolioLabel}
              </Link>
              <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-moss/78">
                <span className="hidden h-px w-12 bg-gold/45 sm:block" />
                <BookOpen className="h-4 w-4 text-clay" />
                <span>{myth.eyebrow}</span>
              </div>
            </div>
          </div>

          <article className="min-w-0 max-w-[64rem]">
            <p className="font-prose text-base leading-7 text-ink/74 sm:text-lg sm:leading-8">
              {truth.greeting}
            </p>
            <h1 className="font-prose mt-2 max-w-[58rem] break-words text-base leading-7 text-ink/74 text-balance sm:text-lg sm:leading-8">
              <span>{beliefName}</span>
              {beliefRest ? (
                <span> - {beliefRest}</span>
              ) : null}
            </h1>
            <blockquote className="mt-6 max-w-[55rem] border-l-2 border-gold/60 py-1 pl-5 sm:pl-7">
              <p className="max-w-[12.5ch] break-words font-serif text-[clamp(1.75rem,7.5vw,3.85rem)] font-semibold leading-[1.05] text-clay text-balance sm:max-w-none sm:text-[clamp(2rem,3.55vw,3.85rem)]">
                “{truth.beliefQuote}”
              </p>
            </blockquote>
            <div className="font-prose mt-9 max-w-[55rem] space-y-6 text-base leading-8 text-ink/76 lg:text-lg lg:leading-9">
              {truth.paragraphs.map((paragraph) => {
                const emphasis = "why don't we write the next chapter of Tâm Sắc Bén together?"
                const [beforeEmphasis, afterEmphasis] = paragraph.split(emphasis)

                return (
                  <p key={paragraph}>
                    {beforeEmphasis}
                    {paragraph.includes(emphasis) ? (
                      <strong className="font-bold italic text-moss">{emphasis}</strong>
                    ) : null}
                    {afterEmphasis}
                  </p>
                )
              })}
            </div>
          </article>

          <figure className="story-frame relative mt-16 overflow-hidden rounded-[10px] border border-[rgba(116,63,36,0.18)] bg-paper/58 p-2.5 shadow-[0_22px_70px_rgba(72,50,24,0.16)]">
            <span
              aria-hidden="true"
              className="absolute left-5 top-5 z-10 h-10 w-10 border-l border-t border-clay/35"
            />
            <span
              aria-hidden="true"
              className="absolute right-5 top-5 z-10 h-10 w-10 border-r border-t border-clay/35"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b border-l border-clay/35"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 right-5 z-10 h-10 w-10 border-b border-r border-clay/35"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-[rgba(116,63,36,0.24)] bg-paper-deep sm:aspect-[16/9]">
              <img
                src={myth.image ?? "/assets/storybook/minh-tam.jpg"}
                alt={myth.imageAlt}
                className="h-full w-full object-cover object-[center_48%]"
              />
            </div>
          </figure>

          <section className="mt-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="max-w-xl text-xs font-bold uppercase tracking-[0.24em] text-clay">
                {truth.timelineTitle}
              </h2>
              <span className="hidden h-px flex-1 bg-gold/45 sm:block" />
            </div>

            <div className="border-t border-[rgba(116,63,36,0.22)]">
              {truth.versions.map((version) => {
                const [year, title = ""] = version.title.split(" | ")

                return (
                  <article
                    key={version.title}
                    className="grid gap-5 border-b border-[rgba(116,63,36,0.18)] py-8 lg:grid-cols-[0.56fr_1.44fr] lg:gap-14 lg:py-10"
                  >
                    <h3 className="flex flex-col gap-1 break-words font-serif text-[clamp(1.28rem,5.2vw,2.1rem)] font-semibold leading-[1.12] text-moss sm:text-[clamp(1.55rem,2.1vw,2.3rem)]">
                      <span>{year}</span>
                      <span className="whitespace-nowrap">{title}</span>
                    </h3>
                    <div>
                      <p className="font-prose text-base italic leading-8 text-clay sm:text-lg sm:leading-9">
                        {version.italic}
                      </p>
                      {version.description ? (
                        <p className="font-prose mt-4 max-w-[43rem] text-[0.98rem] leading-7 text-ink/74 sm:text-base sm:leading-8">
                          {version.description}
                        </p>
                      ) : null}
                      {version.work ? (
                        <div className="mt-7 max-w-[43rem] border-t border-[rgba(116,63,36,0.18)]">
                          {version.work.map((item) => (
                            <div
                              key={item.company}
                              className="border-b border-[rgba(116,63,36,0.14)] py-4"
                            >
                              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                                <div>
                                  <p className="text-sm font-bold uppercase tracking-[0.08em] text-ink">
                                    {item.company}
                                  </p>
                                  {item.role ? (
                                    <p className="font-prose mt-1 text-sm leading-6 text-ink/68">
                                      {item.role}
                                    </p>
                                  ) : null}
                                </div>
                                {item.dates ? (
                                  <p className="font-prose text-sm leading-6 text-ink/64 sm:text-right">
                                    {item.dates}
                                  </p>
                                ) : null}
                              </div>
                              {item.roles ? (
                                <div className="mt-3 space-y-2">
                                  {item.roles.map((role) => (
                                    <div
                                      key={`${item.company}-${role.title}`}
                                      className="grid gap-1 sm:grid-cols-[1fr_auto]"
                                    >
                                      <p className="font-prose text-sm leading-6 text-ink/72">
                                        {role.title}
                                      </p>
                                      <p className="font-prose text-sm leading-6 text-ink/64 sm:text-right">
                                        {role.dates}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {truth.recommendations ? (
            <RecommendationCarousel recommendations={truth.recommendations} />
          ) : null}

          {contact ? (
            <section className="mt-16 border-y border-[rgba(116,63,36,0.22)] py-10 sm:mt-20 sm:py-12">
              <div className="grid gap-7 lg:grid-cols-[0.68fr_1.32fr] lg:gap-14">
                <h2 className="font-serif text-[clamp(2.2rem,4vw,4.1rem)] font-semibold leading-none text-clay">
                  {contact.title}
                </h2>
                <div className="max-w-[43rem]">
                  <p className="font-prose text-xl italic leading-9 text-moss sm:text-2xl sm:leading-10">
                    {contact.body}
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                    <div className="inline-flex w-fit items-center gap-1.5">
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-paper/70 px-4 py-2 text-sm font-bold tracking-[0.04em] text-ink transition hover:-translate-y-0.5 hover:bg-gold/16 hover:text-clay focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
                      >
                        <Mail className="h-4 w-4 text-clay" />
                        {contact.email}
                      </a>
                      <button
                        type="button"
                        aria-label="Copy email address"
                        title="Copy email address"
                        onClick={() => void copyContact("email", contact.email)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-paper/70 text-clay transition hover:-translate-y-0.5 hover:bg-gold/16 hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
                      >
                        {copiedContact === "email" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="inline-flex w-fit items-center gap-1.5">
                      <a
                        href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-paper/70 px-4 py-2 text-sm font-bold tracking-[0.04em] text-ink transition hover:-translate-y-0.5 hover:bg-gold/16 hover:text-clay focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
                      >
                        <Phone className="h-4 w-4 text-clay" />
                        {contact.phone}
                      </a>
                      <button
                        type="button"
                        aria-label="Copy phone number"
                        title="Copy phone number"
                        onClick={() => void copyContact("phone", contact.phone)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-paper/70 text-clay transition hover:-translate-y-0.5 hover:bg-gold/16 hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
                      >
                        {copiedContact === "phone" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <main className="story-texture min-h-screen overflow-x-clip px-4 py-24 sm:px-6 lg:px-[5.5rem]">
      <GlobalPortfolioNav />
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
            <p className="font-prose mt-7 max-w-2xl text-lg leading-8 text-ink/82 sm:text-xl sm:leading-9">
              {myth.lead}
            </p>
            <p className="font-prose mt-5 max-w-2xl text-base leading-8 text-ink/68">
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
              <p className="font-prose mt-4 text-sm leading-7 text-ink/72">{panel.body}</p>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-12 max-w-3xl border-t border-[rgba(116,63,36,0.18)] pt-8 text-center">
          <h2 className="font-serif text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-none text-clay">
            {myth.closingTitle}
          </h2>
          <p className="font-prose mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/72">
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

function getWrappedIndex(index: number, length: number) {
  return (index + length) % length
}

function RecommendationCarousel({
  recommendations,
}: {
  recommendations: MythRecommendations
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const items = recommendations.items
  const activeItem = items[activeIndex]
  const hasMultipleItems = items.length > 1

  function goToRecommendation(direction: number) {
    if (!hasMultipleItems) return
    setActiveIndex((index) => getWrappedIndex(index + direction, items.length))
  }

  function onCarouselKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

    event.preventDefault()
    goToRecommendation(event.key === "ArrowLeft" ? -1 : 1)
  }

  if (!activeItem) return null

  const previousItem = items[getWrappedIndex(activeIndex - 1, items.length)] ?? activeItem
  const nextItem = items[getWrappedIndex(activeIndex + 1, items.length)] ?? activeItem

  return (
    <section className="mt-14 border-y border-[rgba(116,63,36,0.2)] py-10 sm:mt-16 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex items-center justify-center gap-3 text-gold">
          <span className="h-px flex-1 bg-gold/42" />
          <span className="h-2 w-2 rotate-45 bg-gold/80" />
          <span className="h-px flex-1 bg-gold/42" />
        </div>
        <h2
          className="font-serif font-semibold leading-[0.95] text-moss"
          style={{ fontSize: "clamp(2rem, 3.7vw, 3.2rem)" }}
        >
          {recommendations.title}
        </h2>
        <p className="font-prose mx-auto mt-3 max-w-xl text-sm italic leading-6 text-ink/70 sm:text-base sm:leading-7">
          {recommendations.subtitle}
        </p>
      </div>

      <div
        className="mx-auto mt-7 max-w-5xl focus:outline-none sm:mt-8"
        role="region"
        aria-label={`${recommendations.title} carousel`}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onCarouselKeyDown}
      >
        <div className="mb-3 flex items-center justify-between px-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink/58 sm:px-8 sm:text-xs">
          <span aria-live="polite">{activeIndex + 1} / {items.length}</span>
          <span>{activeItem.reviewer}</span>
        </div>

        <div className="relative overflow-hidden px-0 py-1.5 lg:px-20">
          {hasMultipleItems ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 hidden w-[19%] -translate-y-1/2 opacity-35 blur-[0.2px] lg:block"
              >
                <img
                  src={previousItem.image.src}
                  alt=""
                  width={previousItem.image.width}
                  height={previousItem.image.height}
                  className="mx-auto h-auto w-full rounded-[8px] border border-gold/24 shadow-[0_14px_32px_rgba(45,32,21,0.1)]"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-1/2 hidden w-[19%] -translate-y-1/2 opacity-35 blur-[0.2px] lg:block"
              >
                <img
                  src={nextItem.image.src}
                  alt=""
                  width={nextItem.image.width}
                  height={nextItem.image.height}
                  className="mx-auto h-auto w-full rounded-[8px] border border-gold/24 shadow-[0_14px_32px_rgba(45,32,21,0.1)]"
                />
              </div>
            </>
          ) : null}

          <div className="relative z-10 mx-auto max-w-2xl">
            <img
              src={activeItem.image.src}
              alt={activeItem.image.alt}
              width={activeItem.image.width}
              height={activeItem.image.height}
              className="h-auto w-full rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_18px_42px_rgba(45,32,21,0.14)]"
            />
          </div>
        </div>

        {hasMultipleItems ? (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous recommendation"
              onClick={() => goToRecommendation(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-clay/30 bg-paper/72 text-clay transition hover:-translate-y-0.5 hover:border-clay hover:bg-clay hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2" aria-hidden="true">
              {items.map((item, index) => (
                <span
                  key={item.image.src}
                  className={
                    index === activeIndex
                      ? "h-2.5 w-2.5 rounded-full bg-moss"
                      : "h-2.5 w-2.5 rounded-full border border-gold/70"
                  }
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next recommendation"
              onClick={() => goToRecommendation(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-clay/30 bg-paper/72 text-clay transition hover:-translate-y-0.5 hover:border-clay hover:bg-clay hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="mt-5 text-center">
          <a
            href={recommendations.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-clay underline decoration-clay/35 underline-offset-4 transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
          >
            {recommendations.sourceLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
