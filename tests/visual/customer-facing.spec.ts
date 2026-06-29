import { expect, test } from "@playwright/test"
import {
  assertVisualIntegrity,
  expectCustomerScreenshot,
  openCustomerPage,
  type VisualAnchor,
  type VisualLocale,
} from "./helpers"

type CustomerRoute = {
  slug: string
  path: string
  locale: VisualLocale
  anchors: VisualAnchor[]
}

const highRiskRoutes: CustomerRoute[] = [
  {
    slug: "home-en",
    path: "/",
    locale: "en",
    anchors: [
      {
        kind: "image",
        name: /Portfolio cover inspired by Vietnamese storybooks/i,
        label: "portfolio cover art",
      },
      {
        kind: "role",
        role: "button",
        name: "Scroll to the introduction page",
        label: "cover next control",
      },
    ],
  },
  {
    slug: "myth-en",
    path: "/myth",
    locale: "en",
    anchors: [
      {
        kind: "text",
        value: /THE WORLD MAKES MORE SENSE THAN IT SEEMS/i,
        label: "truth statement",
      },
      {
        kind: "image",
        name: "Minh Tâm presenting her marketing work",
        label: "truth portrait",
      },
      {
        kind: "text",
        value: "GET TO KNOW TÂM IN MANY VERSIONS",
        label: "truth timeline",
      },
    ],
  },
  {
    slug: "work-axe-en",
    path: "/work/axe",
    locale: "en",
    anchors: [
      {
        kind: "image",
        name: "AXE generated project cover artwork",
        label: "AXE cover",
      },
      {
        kind: "image",
        name: "AXE executive summary page from the proposal PDF",
        label: "AXE summary page",
      },
      {
        kind: "region",
        name: /AXE proposal carousel/i,
        label: "AXE proposal carousel",
      },
    ],
  },
  {
    slug: "work-tiktok-en",
    path: "/work/tiktok",
    locale: "en",
    anchors: [
      {
        kind: "image",
        name: "TikTok Tet to the Top website cover artwork",
        label: "TikTok cover",
      },
      {
        kind: "text",
        value: "Naming rationale",
        label: "TikTok naming rationale",
      },
      {
        kind: "region",
        name: "Website preview",
        label: "TikTok website preview",
      },
      {
        kind: "image",
        name: "Scrollable preview of the TikTok Tet to the Top website",
        label: "TikTok website screenshot",
      },
    ],
  },
  {
    slug: "work-social-outreach-en",
    path: "/work/social-outreach",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Social Outreach",
        label: "Social Outreach heading",
      },
      {
        kind: "text",
        value: "Voice 01",
        label: "first outreach voice label",
      },
      {
        kind: "region",
        name: "Formal & Academic Voice posts",
        label: "formal outreach carousel",
      },
      {
        kind: "text",
        value: "Voice 03",
        label: "third outreach voice label",
      },
      {
        kind: "role",
        role: "heading",
        name: "Poetry & Creative Writing",
        label: "poetry outreach heading",
      },
      {
        kind: "region",
        name: "Poetry & Creative Writing posts",
        label: "poetry outreach grid",
      },
    ],
  },
]

const portfolioGalleryRoutes: CustomerRoute[] = [
  {
    slug: "gallery-thinking-en",
    path: "/content/social-planner",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Thinking in Systems",
        label: "Thinking gallery heading",
      },
      {
        kind: "text",
        value: "I look beyond what people do to understand why they do it.",
        label: "Thinking gallery intro",
      },
      {
        kind: "image",
        name: "AXE generated project cover artwork",
        label: "Thinking gallery AXE card media",
      },
      {
        kind: "text",
        value: "View project",
        label: "Thinking gallery project CTA",
      },
    ],
  },
  {
    slug: "gallery-writing-hub-en",
    path: "/content/creative-copywriter",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Writing with Intent",
        label: "Writing scope hub heading",
      },
      {
        kind: "text",
        value: "I write the words that do more than fill the space",
        label: "Writing scope hub intro",
      },
      {
        kind: "text",
        value: "Social Video Script",
        label: "Writing social video scope",
      },
    ],
  },
  {
    slug: "gallery-writing-video-en",
    path: "/content/creative-copywriter/scope/social-video-script?project=samsung",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Social Video Script",
        label: "Writing video scope heading",
      },
      {
        kind: "text",
        value: "Samsung",
        label: "Samsung gallery card",
      },
      {
        kind: "image",
        name: "Tesla Education brand introduction video preview",
        label: "Tesla Education gallery thumbnail",
      },
      {
        kind: "text",
        value: "Every school has a story",
        exact: false,
        label: "Tesla Education gallery summary",
      },
    ],
  },
  {
    slug: "gallery-writing-fanpage-en",
    path: "/content/creative-copywriter/scope/fanpage-always-on-content?project=weshare",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Fanpage Always-on Content",
        label: "Fanpage scope heading",
      },
      {
        kind: "text",
        value: "WeShare",
        label: "WeShare gallery card",
      },
    ],
  },
  {
    slug: "gallery-writing-fanpage-aeon-en",
    path: "/content/creative-copywriter/scope/fanpage-always-on-content?project=aeon-vietnam",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Fanpage Always-on Content",
        label: "Fanpage AEON scope heading",
      },
      {
        kind: "text",
        value: "AEON Vietnam",
        label: "AEON gallery card",
      },
      {
        kind: "text",
        value: "Let's help products find their way into shopping carts.",
        label: "AEON gallery summary",
      },
      {
        kind: "image",
        name: "AEON Vietnam logo thumbnail",
        label: "AEON gallery logo thumbnail",
      },
    ],
  },
  {
    slug: "gallery-writing-fanpage-tesla-en",
    path: "/content/creative-copywriter/scope/fanpage-always-on-content?project=tesla-education-always-on",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Fanpage Always-on Content",
        label: "Fanpage Tesla scope heading",
      },
      {
        kind: "text",
        value: "Tesla Education",
        label: "Tesla always-on gallery card",
      },
      {
        kind: "text",
        value: "Choosing a school is about finding a place that feels right",
        exact: false,
        label: "Tesla always-on gallery summary",
      },
      {
        kind: "image",
        name: "Tesla Education horizontal campaign thumbnail",
        label: "Tesla always-on gallery thumbnail",
      },
    ],
  },
  {
    slug: "gallery-writing-website-en",
    path: "/content/creative-copywriter/scope/website-content?project=tiktok",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Website Content",
        label: "Website scope heading",
      },
      {
        kind: "text",
        value: "TikTok",
        label: "TikTok gallery card",
      },
    ],
  },
  {
    slug: "gallery-writing-outreach-en",
    path: "/content/creative-copywriter",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Writing with Intent",
        label: "Writing outreach hub heading",
      },
      {
        kind: "text",
        value: "Social Outreach",
        label: "Social Outreach scope card",
      },
    ],
  },
]

const projectTemplateRoutes: CustomerRoute[] = [
  {
    slug: "work-brand-story-en",
    path: "/work/brand-story",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Brand Story",
        label: "Brand Story heading",
      },
      {
        kind: "text",
        value: "Objective",
        label: "Brand Story objective block",
      },
      {
        kind: "text",
        value: "Results",
        label: "Brand Story results block",
      },
    ],
  },
  {
    slug: "work-acecook-en",
    path: "/work/acecook",
    locale: "en",
    anchors: [
      {
        kind: "image",
        name: "Acecook Vietnam national football campaign cover artwork",
        label: "Acecook cover",
      },
      {
        kind: "text",
        value: "Bền Chí Kiên Tâm",
        exact: false,
        label: "Acecook campaign title",
      },
      {
        kind: "region",
        name: "Acecook content posts",
        label: "Acecook content posts",
      },
    ],
  },
  {
    slug: "work-weshare-en",
    path: "/work/weshare",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "WeShare",
        label: "WeShare heading",
      },
      {
        kind: "image",
        name: "WeShare brand content cover artwork",
        label: "WeShare cover",
      },
      {
        kind: "region",
        name: "WeShare content posts",
        label: "WeShare content carousel",
      },
      {
        kind: "text",
        value: "Student-led Campaigns",
        label: "WeShare student campaigns",
      },
      {
        kind: "role",
        role: "navigation",
        name: "More in Fanpage Always-on Content",
        label: "WeShare same-scope navigation",
      },
      {
        kind: "role",
        role: "link",
        name: "Previous project: Acecook",
        label: "WeShare previous project link",
      },
      {
        kind: "role",
        role: "link",
        name: "Next project: Panasonic",
        label: "WeShare next project link",
      },
    ],
  },
  {
    slug: "work-samsung-en",
    path: "/work/samsung",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Samsung",
        label: "Samsung heading",
      },
      {
        kind: "image",
        name: "Abstract Samsung Galaxy social video script cover artwork",
        label: "Samsung cover",
      },
      {
        kind: "region",
        name: "Video campaigns",
        label: "Samsung video campaign section",
      },
    ],
  },
  {
    slug: "work-aeon-vietnam-en",
    path: "/work/aeon-vietnam",
    locale: "en",
    anchors: [
      {
        kind: "image",
        name: "AEON Vietnam always-on content horizontal cover",
        label: "AEON cover",
      },
      {
        kind: "text",
        value: "AEON is the kind of brand that sells almost everything",
        exact: false,
        label: "AEON overview",
      },
      {
        kind: "role",
        role: "heading",
        name: "FACEBOOK",
        label: "AEON Facebook section",
      },
      {
        kind: "region",
        name: "FACEBOOK posts",
        label: "AEON Facebook posts",
      },
      {
        kind: "role",
        role: "heading",
        name: "Christmas Collection",
        label: "AEON Christmas section",
      },
      {
        kind: "role",
        role: "heading",
        name: "Office Collection",
        label: "AEON Office section",
      },
    ],
  },
  {
    slug: "work-tesla-education-en",
    path: "/work/tesla-education",
    locale: "en",
    anchors: [
      {
        kind: "text",
        value: "My role was to develop the creative concept",
        exact: false,
        label: "Tesla Education video overview",
      },
      {
        kind: "text",
        value: "Mind taking a quick trip to Tesla Education's Fanpage instead?",
        exact: false,
        label: "Tesla Education video CTA note",
      },
      {
        kind: "role",
        role: "link",
        name: "TAKE ME THERE: Tesla Education brand introduction video preview",
        label: "Tesla Education video CTA",
      },
      {
        kind: "image",
        name: "Tesla Education brand introduction video preview",
        label: "Tesla Education video cover",
      },
    ],
  },
  {
    slug: "work-tesla-education-always-on-en",
    path: "/work/tesla-education-always-on",
    locale: "en",
    anchors: [
      {
        kind: "text",
        value: "For Tesla Education's always-on content",
        exact: false,
        label: "Tesla Education always-on overview",
      },
      {
        kind: "image",
        name: "Tesla Education campus story project cover",
        label: "Tesla Education always-on cover",
      },
      {
        kind: "region",
        name: "Tesla Education content posts",
        label: "Tesla Education always-on carousel",
      },
    ],
  },
  {
    slug: "work-panasonic-en",
    path: "/work/panasonic",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "CRM Promote",
        label: "Panasonic campaign heading",
      },
      {
        kind: "image",
        name: "Panasonic CRM Promote copy-on-visual campaign cover",
        label: "Panasonic cover",
      },
      {
        kind: "region",
        name: "Panasonic content posts",
        label: "Panasonic content posts",
      },
    ],
  },
]

const customerRoutes = [
  ...highRiskRoutes,
  ...portfolioGalleryRoutes,
  ...projectTemplateRoutes,
]

test.describe("customer-facing mobile visual regression", () => {
  for (const route of customerRoutes) {
    test(route.slug, async ({ page }) => {
      await openCustomerPage(page, route.path, route.locale)
      await assertVisualIntegrity(page, route.anchors)
      await expectCustomerScreenshot(page, route.slug)
    })
  }

  test("work-social-outreach-en meme carousel includes sixth Bức thư post", async ({
    page,
  }) => {
    await openCustomerPage(page, "/work/social-outreach", "en")

    const memeRegion = page.getByRole("region", {
      name: "Meme & Funny Voice posts",
    })

    await expect(memeRegion).toHaveAttribute("aria-roledescription", "carousel")
    await expect(
      memeRegion.getByRole("img", { name: /Meme outreach post from/ }),
    ).toHaveCount(6)
    await expect(memeRegion).toContainText("Bức thư của Hà Nội")
    await expect(memeRegion).toContainText(
      "Giây phút nhận ra tôi chỉ là hữu duyên",
    )
  })

  test("stale Vietnamese locale storage still renders English-only UI", async ({ page }) => {
    await openCustomerPage(page, "/work/axe", "vi")
    await assertVisualIntegrity(page, [
      {
        kind: "image",
        name: "AXE generated project cover artwork",
        label: "AXE English cover with stale locale",
      },
      {
        kind: "region",
        name: /AXE proposal carousel/i,
        label: "AXE English carousel with stale locale",
      },
      {
        kind: "text",
        value: "View full portfolio",
        label: "English CTA with stale locale",
      },
    ])
  })
})
