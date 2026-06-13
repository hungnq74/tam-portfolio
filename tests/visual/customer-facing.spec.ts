import { test } from "@playwright/test"
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
    slug: "home-vi",
    path: "/",
    locale: "vi",
    anchors: [
      {
        kind: "image",
        name: /Bìa portfolio Cổ tích Việt Nam/i,
        label: "Vietnamese portfolio cover art",
      },
      {
        kind: "role",
        role: "button",
        name: "Cuộn đến trang giới thiệu",
        label: "Vietnamese cover next control",
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
    slug: "myth-vi",
    path: "/myth",
    locale: "vi",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Câu chuyện phía sau Minh Tâm",
        label: "Vietnamese myth heading",
      },
      {
        kind: "image",
        name: "Minh Tâm mỉm cười giữa những chiếc lá xanh lớn",
        label: "Vietnamese myth portrait",
      },
      {
        kind: "role",
        role: "link",
        name: /Về Portfolio/i,
        label: "Vietnamese myth portfolio CTA",
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
    slug: "work-axe-vi",
    path: "/work/axe",
    locale: "vi",
    anchors: [
      {
        kind: "image",
        name: "AXE generated project cover artwork",
        label: "AXE Vietnamese cover",
      },
      {
        kind: "image",
        name: "AXE executive summary page from the proposal PDF",
        label: "AXE Vietnamese summary page",
      },
      {
        kind: "region",
        name: /AXE carousel proposal/i,
        label: "AXE Vietnamese proposal carousel",
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
    slug: "work-tiktok-vi",
    path: "/work/tiktok",
    locale: "vi",
    anchors: [
      {
        kind: "image",
        name: "TikTok Tet to the Top website cover artwork",
        label: "TikTok Vietnamese cover",
      },
      {
        kind: "text",
        value: "Giải thích tên gọi",
        label: "TikTok Vietnamese naming rationale",
      },
      {
        kind: "region",
        name: "Xem trước website",
        label: "TikTok Vietnamese website preview",
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
    ],
  },
  {
    slug: "work-social-outreach-vi",
    path: "/work/social-outreach",
    locale: "vi",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Social Outreach",
        label: "Vietnamese Social Outreach heading",
      },
      {
        kind: "text",
        value: "Một không gian cho những thảo luận chỉn chu và câu chữ được chọn kỹ.",
        label: "Vietnamese formal outreach description",
      },
      {
        kind: "region",
        name: "Meme & Funny Voice posts",
        label: "Vietnamese meme outreach carousel",
      },
    ],
  },
]

const portfolioGalleryRoutes: CustomerRoute[] = [
  {
    slug: "gallery-thinking-en",
    path: "/?field=social-planner#gallery",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Thinking in Systems",
        label: "Thinking gallery heading",
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
    path: "/?field=creative-copywriter#gallery",
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
    path: "/?field=creative-copywriter&project=samsung#gallery",
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
    ],
  },
  {
    slug: "gallery-writing-fanpage-en",
    path: "/?field=creative-copywriter&project=weshare#gallery",
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
    slug: "gallery-writing-website-en",
    path: "/?field=creative-copywriter&project=tiktok#gallery",
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
    path: "/?field=creative-copywriter&project=social-outreach#gallery",
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
        name: "Content posts",
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
    slug: "work-tesla-education-en",
    path: "/work/tesla-education",
    locale: "en",
    anchors: [
      {
        kind: "role",
        role: "heading",
        name: "Tesla Education",
        label: "Tesla Education heading",
      },
      {
        kind: "image",
        name: "Abstract Tesla Education learning pathway cover",
        label: "Tesla Education cover",
      },
      {
        kind: "image",
        name: "Tesla Education brand introduction video preview",
        label: "Tesla Education video preview",
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
        name: "Content posts",
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
})
