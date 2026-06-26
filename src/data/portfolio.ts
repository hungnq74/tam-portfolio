export type Locale = "en" | "vi"

export type SectionId = "cover" | "about" | "fields" | "gallery" | "detail"

export type FieldId = "social-planner" | "creative-copywriter"

export interface Chapter {
  id: SectionId
  number: string
  label: string
  title: string
  description: string
}

export interface Author {
  name: string
  role: string
  opening?: string[]
  greeting: string
  headline: string
  body: string[]
  image: string
  imageAlt: string
  ctas: {
    explore: string
    myth: string
  }
}

export interface ProjectMediaAsset {
  src: string
  alt: string
  width: number
  height: number
  sourceUrl?: string
  caption?: string
  ctaLabel?: string
  focalPoint?: {
    x: number
    y: number
  }
}

export interface ProjectVideoCampaign {
  title: string
  description: string
  videos: ProjectMediaAsset[]
}

export interface ProjectImageCampaign {
  title: string
  description: string
  images: ProjectMediaAsset[]
}

export interface ProjectPostCampaignSection {
  title: string
  description: string
  posts: ProjectMediaAsset[]
}

export interface ProjectPostCampaign {
  title: string
  description: string
  posts?: ProjectMediaAsset[]
  sections?: ProjectPostCampaignSection[]
}

export interface ProjectOutreachSection {
  title: string
  description: string
  displayMode: "linked-posts" | "caption-posts" | "caption-grid"
  posts: ProjectMediaAsset[]
}

export interface ProjectMedia {
  cover: ProjectMediaAsset
  cardCover?: ProjectMediaAsset
  introLayout?: "split-cover"
  summary?: ProjectMediaAsset
  websitePreview?: ProjectMediaAsset
  proposalSlides?: ProjectMediaAsset[]
  contentPostsLayout?: "grid" | "carousel"
  contentPosts?: ProjectMediaAsset[]
  videoCampaigns?: ProjectVideoCampaign[]
  imageCampaigns?: ProjectImageCampaign[]
  postCampaigns?: ProjectPostCampaign[]
  outreachSections?: ProjectOutreachSection[]
}

export interface ProjectNamingRationale {
  eyebrow: string
  title: string
  items: Array<{
    term: string
    definition: string
  }>
  note: string
}

export interface ProjectProposalCta {
  label: string
  credit: string
  creditNames?: string[]
}

export interface Project {
  id: string
  fieldId: FieldId
  title: string
  eyebrow: string
  category: string
  summary: string
  client: string
  year: string
  scope: string[]
  campaignTitle?: string
  closingNote?: string
  overview: string
  objective: string
  solution: string
  results: string[]
  thumbnail: {
    col: 0 | 1 | 2
    row: 0 | 1
  }
  media?: ProjectMedia
  namingRationale?: ProjectNamingRationale
  proposalCta?: ProjectProposalCta
}

export interface FieldScopeCard {
  id: string
  title: string
  description: string
  category: string
  image: string
  imageAlt: string
  landingProjectId?: string
}

export interface Field {
  id: FieldId
  title: string
  subtitle: string
  shortTitle: string
  description: string
  body: string
  image: string
  imageAlt: string
  sheetImage: string
  accent: "clay" | "moss"
  filters: string[]
  scopeIntro?: string
  scopeCards?: FieldScopeCard[]
}

export interface PortfolioUi {
  allFilter: string
  languageToggleAria: string
  cover: {
    title: string
    description: string
    imageSrc: string
    imageAlt: string
    nextAria: string
    nextLabel: string
  }
  fields: {
    heading: string
    body: string
    lockedPrompt: string
    unlockedPrompt: string
  }
  gallery: {
    lockedEyebrow: string
    lockedTitle: string
    lockedBody: string
    lockedAction: string
    emptyTitle: string
    emptyBody: string
    back: string
    backToScopes: string
    eyebrow: string
  }
  detail: {
    lockedEyebrow: string
    lockedTitle: string
    lockedBody: string
    lockedAction: string
    back: string
    topAria: string
    client: string
    year: string
    scope: string
    objective: string
    solution: string
    results: string
    proposal: string
    websitePreview: string
    visitPost: string
    watchVideo: string
    postCaption: string
    readMoreCaption: string
    showLessCaption: string
    proposalCarousel: string
    previousSlide: string
    nextSlide: string
    showProposalSlide: string
  }
  projectCard: {
    action: string
  }
  progress: {
    aria: string
    lockedHint: string
    lockedAria: string
    goToPrefix: string
  }
}

export interface PortfolioContent {
  chapters: Chapter[]
  author: Author
  fields: Field[]
  projects: Project[]
  ui: PortfolioUi
}

export type PortfolioContentByLocale = Record<Locale, PortfolioContent>

export interface MythContent {
  eyebrow: string
  title: string
  lead: string
  intro: string
  image?: string
  panels: Array<{
    title: string
    body: string
  }>
  truth?: {
    greeting: string
    beliefPrefix: string
    beliefQuote: string
    paragraphs: string[]
    timelineTitle: string
    versions: Array<{
      title: string
      italic: string
      description: string
      work?: Array<{
        company: string
        role?: string
        dates?: string
        roles?: Array<{
          title: string
          dates: string
        }>
      }>
    }>
    contact?: {
      title: string
      body: string
      email: string
      phone: string
    }
  }
  closingTitle: string
  closingBody: string
  portfolioLabel: string
  imageAlt: string
}

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_STORAGE_KEY = "tam-portfolio-locale"

export const LOCALES: Array<{ id: Locale; label: string; name: string }> = [
  { id: "en", label: "EN", name: "English" },
  { id: "vi", label: "VI", name: "Tiếng Việt" },
]

const SHARED_FIELD_ASSETS = {
  social: {
    image: "/assets/storybook/social-field.png",
    sheetImage: "/assets/storybook/social-projects.png",
  },
  copywriter: {
    image: "/assets/storybook/copywriter-field.png",
    sheetImage: "/assets/storybook/copywriter-projects.png",
  },
}

const AXE_CONTEXT =
  "Context: Make AXE Vietnam the top #1 brand discussed by Gen Z on social media and distribute 2M product samples."
const AXE_CONTEXT_VI =
  "Bối cảnh: đưa AXE Vietnam trở thành thương hiệu được Gen Z thảo luận nhiều nhất trên social media và phân phối 2 triệu mẫu thử sản phẩm."

const AXE_PDF_PAGE_COUNT = 15
const AXE_PDF_PAGE_SIZE = {
  width: 1600,
  height: 900,
}

const AXE_PROJECT_MEDIA: ProjectMedia = {
  cover: {
    src: "/assets/projects/axe/cover.png",
    alt: "AXE generated project cover artwork",
    width: AXE_PDF_PAGE_SIZE.width,
    height: AXE_PDF_PAGE_SIZE.height,
    focalPoint: { x: 54, y: 50 },
  },
  summary: {
    src: "/assets/projects/axe/summary.png",
    alt: "AXE executive summary page from the proposal PDF",
    width: AXE_PDF_PAGE_SIZE.width,
    height: AXE_PDF_PAGE_SIZE.height,
  },
  proposalSlides: Array.from({ length: AXE_PDF_PAGE_COUNT }, (_, index) => ({
    src: `/assets/projects/axe/proposal-${String(index + 1).padStart(2, "0")}.png`,
    alt: `AXE full proposal page ${index + 1}`,
    width: AXE_PDF_PAGE_SIZE.width,
    height: AXE_PDF_PAGE_SIZE.height,
  })),
}

const AXE_PROJECT_MEDIA_VI: ProjectMedia = {
  cover: {
    ...AXE_PROJECT_MEDIA.cover,
    alt: "Ảnh bìa proposal chiến dịch AXE",
  },
  summary: AXE_PROJECT_MEDIA.summary
    ? {
        ...AXE_PROJECT_MEDIA.summary,
        alt: "Trang tóm tắt proposal AXE",
      }
    : undefined,
  proposalSlides: AXE_PROJECT_MEDIA.proposalSlides?.map((slide, index) => ({
    ...slide,
    alt: `Trang proposal AXE ${index + 1}`,
  })),
}

const TIKTOK_WEBSITE_URL = "https://tettothetop.splashthat.com/"
const TIKTOK_MEDIA_SIZE = {
  width: 1600,
  height: 900,
}

const TIKTOK_PROJECT_MEDIA: ProjectMedia = {
  cover: {
    src: "/assets/projects/tiktok/cover.png",
    alt: "TikTok Tet to the Top website cover artwork",
    width: TIKTOK_MEDIA_SIZE.width,
    height: TIKTOK_MEDIA_SIZE.height,
    focalPoint: { x: 50, y: 45 },
  },
  websitePreview: {
    src: "/assets/projects/tiktok/website-preview.png",
    alt: "Scrollable preview of the TikTok Tet to the Top website",
    width: 1600,
    height: 9477,
    sourceUrl: TIKTOK_WEBSITE_URL,
  },
}

const TIKTOK_PROJECT_MEDIA_VI: ProjectMedia = {
  cover: {
    ...TIKTOK_PROJECT_MEDIA.cover,
    alt: "Ảnh bìa website Tết to the Top của TikTok",
  },
  websitePreview: TIKTOK_PROJECT_MEDIA.websitePreview
    ? {
        ...TIKTOK_PROJECT_MEDIA.websitePreview,
        alt: "Bản xem trước website Tết to the Top của TikTok",
      }
    : undefined,
}

const ACECOOK_CONTENT_POST_SOURCES = [
  "https://www.facebook.com/photo.php?fbid=1085368150267062&set=pb.100063816609800.-2207520000&type=3",
  "https://www.facebook.com/photo.php?fbid=1078433207627223&set=pb.100063816609800.-2207520000&type=3",
  "https://www.facebook.com/photo.php?fbid=1079972137473330&set=pb.100063816609800.-2207520000&type=3",
  "https://www.facebook.com/photo.php?fbid=1103924538411423&set=pb.100063816609800.-2207520000&type=3",
] as const

const ACECOOK_PROJECT_MEDIA: ProjectMedia = {
  cover: {
    src: "/assets/projects/acecook/cover.jpg",
    alt: "Acecook Vietnam national football campaign cover artwork",
    width: 1920,
    height: 731,
    sourceUrl: "https://www.facebook.com/photo/?fbid=1169196428550900&set=a.702063185264229",
    focalPoint: { x: 50, y: 48 },
  },
  contentPostsLayout: "carousel",
  contentPosts: [
    {
      src: "/assets/projects/acecook/content-01.jpg",
      alt: "Acecook football campaign social content post 1",
      width: 1638,
      height: 2048,
      sourceUrl: ACECOOK_CONTENT_POST_SOURCES[0],
    },
    {
      src: "/assets/projects/acecook/content-02.jpg",
      alt: "Acecook football campaign social content post 2",
      width: 2048,
      height: 2048,
      sourceUrl: ACECOOK_CONTENT_POST_SOURCES[1],
    },
    {
      src: "/assets/projects/acecook/content-03.jpg",
      alt: "Acecook football campaign social content post 3",
      width: 1500,
      height: 1500,
      sourceUrl: ACECOOK_CONTENT_POST_SOURCES[2],
    },
    {
      src: "/assets/projects/acecook/content-04.jpg",
      alt: "Acecook football campaign social content post 4",
      width: 1638,
      height: 2048,
      sourceUrl: ACECOOK_CONTENT_POST_SOURCES[3],
    },
  ],
}

const ACECOOK_PROJECT_MEDIA_VI: ProjectMedia = {
  ...ACECOOK_PROJECT_MEDIA,
  cover: {
    ...ACECOOK_PROJECT_MEDIA.cover,
    alt: "Ảnh bìa chiến dịch bóng đá Acecook",
  },
  contentPosts: ACECOOK_PROJECT_MEDIA.contentPosts?.map((post, index) => ({
    ...post,
    alt: `Bài đăng social chiến dịch bóng đá Acecook ${index + 1}`,
  })),
}

const WESHARE_CONTENT_POST_SOURCES = [
  "https://www.facebook.com/weshareasia.shopnshare/posts/pfbid02A1oh1pd5gTtNvHfMNCn9iP8hZ9ZcaxTrrvFqvLzwR56xuBpk37MzjAUbtyVREGY8l",
  "https://www.facebook.com/photo.php?fbid=496909356244245&set=pb.100077755556916.-2207520000&type=3",
  "https://www.facebook.com/weshareasia.shopnshare/posts/pfbid02JpN1dJ1TouHsHFbUpYzHKNWFARwrnNamFefB4MDS7x7KdDKhexMPK22nVJs5Uu6sl",
  "https://www.facebook.com/photo.php?fbid=550786410856539&set=pb.100077755556916.-2207520000&type=3",
  "https://www.facebook.com/photo.php?fbid=507178915217289&set=pb.100077755556916.-2207520000&type=3",
  "https://www.facebook.com/photo.php?fbid=527680926500421&set=pb.100077755556916.-2207520000&type=3",
] as const

const WESHARE_STUDENT_CAMPAIGN_SOURCES = [
  "https://www.facebook.com/photo/?fbid=946450497525809&set=a.571399528364243",
  "https://www.facebook.com/photo/?fbid=937129305117020&set=a.459574422872513",
  "https://www.facebook.com/photo/?fbid=916697910489982&set=a.541724431320667",
] as const

const WESHARE_STUDENT_CAMPAIGN_IMAGES: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/weshare/student-campaign-01.jpg",
    alt: "WeShare student-led campaign with HCMUS",
    width: 2048,
    height: 1366,
    sourceUrl: WESHARE_STUDENT_CAMPAIGN_SOURCES[0],
  },
  {
    src: "/assets/projects/weshare/student-campaign-02.jpg",
    alt: "WeShare student-led campaign with HCMUE",
    width: 2048,
    height: 1365,
    sourceUrl: WESHARE_STUDENT_CAMPAIGN_SOURCES[1],
  },
  {
    src: "/assets/projects/weshare/student-campaign-03.jpg",
    alt: "WeShare student-led campaign with FTU",
    width: 2048,
    height: 1362,
    sourceUrl: WESHARE_STUDENT_CAMPAIGN_SOURCES[2],
  },
]

const WESHARE_PROJECT_MEDIA_BASE: ProjectMedia = {
  introLayout: "split-cover",
  cover: {
    src: "/assets/projects/weshare/cover.jpg",
    alt: "WeShare brand content cover artwork",
    width: 1500,
    height: 1500,
    sourceUrl: "https://www.facebook.com/photo.php?fbid=529573256311188&set=pb.100077755556916.-2207520000&type=3",
  },
  contentPostsLayout: "carousel",
  contentPosts: [
    {
      src: "/assets/projects/weshare/content-01.jpg",
      alt: "WeShare always-on social content post 1",
      width: 1688,
      height: 1688,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[0],
      caption:
        "Với đội ngũ diễn viên nghiệp dư cùng đạo diễn không qua trường lớp, chúng tôi tin rằng WeShare sẽ phá đảo rạp phim Việt tháng 9 (không được thì thôi)\n#WeShare #ShopAndShare",
    },
    {
      src: "/assets/projects/weshare/content-02.jpg",
      alt: "WeShare always-on social content post 2",
      width: 1125,
      height: 1504,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[1],
      caption:
        "ĐỪNG BỎ QUA 🛑\n\nWeShare lên kệ mặt hàng mới nhân dịp sale giữa tháng 🛒\n\nĐặc điểm: Đẹp trai, cao 1m7++\nSở thích: Dùng WeShare trước khi mua sắm online để quyên góp cho các tổ chức thiện nguyện\nTình trạng: Độc thân ‼️\n\n50 tương tác công khai info. WeShare nói là làm !!!",
    },
    {
      src: "/assets/projects/weshare/content-03.jpg",
      alt: "WeShare always-on social content post 3",
      width: 500,
      height: 500,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[2],
      caption:
        "Cập nhật từ điển \"Anh trai vượt ngàn chông gai\" phiên bản WeShare-ers. Thực tập một câu dưới phần bình luận chứng tỏ đã thuộc bài \"tới bờ tới bến\" nha! ( •̀ ω •́ )✧",
    },
    {
      src: "/assets/projects/weshare/content-04.jpg",
      alt: "WeShare always-on social content post 4",
      width: 1052,
      height: 1440,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[3],
      caption:
        "Tự nhiên nhận được tin nhắn kì kì, kì này tình yêu tới đỡ hong kịp WeShare-ers ơi\n\n#WeShare #shopandshare",
    },
    {
      src: "/assets/projects/weshare/content-05.jpg",
      alt: "WeShare always-on social content post 5",
      width: 1192,
      height: 1440,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[4],
      caption:
        "Team Marketing khi nghe sếp bảo WeShare là ứng dụng thân thiện, phù hợp với mọi đối tượng muốn quyên góp cho các tổ chức xã hội qua các đơn hàng trực tuyến hàng ngày mà không phát sinh bất kỳ chi phí nào:",
    },
    {
      src: "/assets/projects/weshare/content-06.jpg",
      alt: "WeShare always-on social content post 6",
      width: 2000,
      height: 2000,
      sourceUrl: WESHARE_CONTENT_POST_SOURCES[5],
      caption:
        "Lần đầu ra mắt: WeShare-ers đạp gió, mở app 2024\n\nĐội trưởng nào sẽ đạt vị trí top quyên góp trong chương trình?\n\nĐộc quyền chỉ có trên weshare.asia - Đón xem ngay!\n\n#WeShare",
    },
  ],
}

const WESHARE_PROJECT_MEDIA_EN: ProjectMedia = {
  ...WESHARE_PROJECT_MEDIA_BASE,
  imageCampaigns: [
    {
      title: "Student-led Campaigns",
      description:
        "With students at the heart of our audience, we brought WeShare closer to campus life through a series of student-led campaigns and partnerships.\n\nThe result? More than 20,000 new users in just 10 months.\n\nTurns out, people are more willing to do good when it doesn't sound like homework.",
      images: WESHARE_STUDENT_CAMPAIGN_IMAGES,
    },
  ],
}

const WESHARE_PROJECT_MEDIA_VI: ProjectMedia = {
  ...WESHARE_PROJECT_MEDIA_BASE,
  cover: {
    ...WESHARE_PROJECT_MEDIA_BASE.cover,
    alt: "Ảnh bìa nội dung thương hiệu WeShare",
  },
  contentPosts: WESHARE_PROJECT_MEDIA_BASE.contentPosts?.map((post, index) => ({
    ...post,
    alt: `Bài đăng social always-on WeShare ${index + 1}`,
  })),
  imageCampaigns: [
    {
      title: "Chiến dịch do sinh viên dẫn dắt",
      description:
        "Với sinh viên là nhóm khán giả trọng tâm, WeShare đến gần hơn với đời sống campus thông qua chuỗi chiến dịch và hợp tác do sinh viên dẫn dắt.\n\nKết quả? Hơn 20.000 người dùng mới chỉ trong 10 tháng.\n\nHóa ra, mọi người sẵn sàng làm điều tốt hơn khi chuyện đó không nghe như bài tập về nhà.",
      images: WESHARE_STUDENT_CAMPAIGN_IMAGES.map((image, index) => ({
        ...image,
        alt: `Chiến dịch sinh viên của WeShare ${index + 1}`,
      })),
    },
  ],
}

const PANASONIC_PROJECT_MEDIA: ProjectMedia = {
  introLayout: "split-cover",
  cover: {
    src: "/assets/projects/panasonic/cover.png",
    alt: "Panasonic CRM Promote copy-on-visual campaign cover",
    width: 1080,
    height: 1080,
    sourceUrl: "https://drive.google.com/file/d/1PA1a3igLLqZ0RS-U2PgEy8SkQh6v0fa7/view",
  },
  contentPostsLayout: "carousel",
  contentPosts: [
    {
      src: "/assets/projects/panasonic/content-01.jpg",
      alt: "Panasonic CRM Promote digital ad copy-on-visual post 1",
      width: 1500,
      height: 1500,
    },
    {
      src: "/assets/projects/panasonic/content-02.jpg",
      alt: "Panasonic CRM Promote digital ad copy-on-visual post 2",
      width: 1500,
      height: 1500,
    },
    {
      src: "/assets/projects/panasonic/content-03.jpg",
      alt: "Panasonic CRM Promote digital ad copy-on-visual post 3",
      width: 1500,
      height: 1500,
    },
    {
      src: "/assets/projects/panasonic/content-04.jpg",
      alt: "Panasonic CRM Promote digital ad copy-on-visual post 4",
      width: 1500,
      height: 1500,
    },
  ],
}

const PANASONIC_PROJECT_MEDIA_VI: ProjectMedia = {
  ...PANASONIC_PROJECT_MEDIA,
  cover: {
    ...PANASONIC_PROJECT_MEDIA.cover,
    alt: "Ảnh bìa chiến dịch copy-on-visual CRM Promote của Panasonic",
  },
  contentPosts: PANASONIC_PROJECT_MEDIA.contentPosts?.map((post, index) => ({
    ...post,
    alt: `Mẫu digital ad CRM Promote của Panasonic ${index + 1}`,
  })),
}

const AEON_FACEBOOK_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/aeon-vietnam/facebook-01.jpg",
    alt: "AEON Vietnam Facebook always-on content post 1",
    width: 843,
    height: 1266,
    sourceUrl: "https://www.facebook.com/share/p/18xtmEosdh/",
  },
  {
    src: "/assets/projects/aeon-vietnam/facebook-02.jpg",
    alt: "AEON Vietnam Facebook always-on content post 2",
    width: 1180,
    height: 590,
    sourceUrl: "https://www.facebook.com/share/p/17ufbWoNTX/",
  },
  {
    src: "/assets/projects/aeon-vietnam/facebook-03.jpg",
    alt: "AEON Vietnam Facebook always-on content post 3",
    width: 2048,
    height: 2048,
    sourceUrl: "https://www.facebook.com/share/p/1DJGM2v1MS/",
  },
  {
    src: "/assets/projects/aeon-vietnam/facebook-04.jpg",
    alt: "AEON Vietnam Facebook always-on content post 4",
    width: 2048,
    height: 2048,
    sourceUrl: "https://www.facebook.com/share/p/1HFnSYsS1C/",
  },
  {
    src: "/assets/projects/aeon-vietnam/facebook-05.jpg",
    alt: "AEON Vietnam Facebook always-on content post 5",
    width: 2048,
    height: 2048,
    sourceUrl: "https://www.facebook.com/AeonVietnamPage/posts/pfbid02xDAxqNFC4Bg22QBad1tJRwy8jW3da1wwMR8cTkHGAeiPPDakVFVTaQZuc1m1jagJl",
  },
  {
    src: "/assets/projects/aeon-vietnam/facebook-06.jpg",
    alt: "AEON Vietnam Facebook always-on content post 6",
    width: 2048,
    height: 2048,
    sourceUrl: "https://www.facebook.com/share/p/14iCpnKu2jr/",
  },
]

const AEON_INSTAGRAM_CHRISTMAS_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-01.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 1",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DEJY6bZvl6s/",
    caption: "BẬT MOOD “NGOAN XINH YÊU” - DỊU DÀNG MÙA LỄ HỘI 💖\n\nNgọt ngào, xinh xắn như cô nàng Lọ Lem trong những buổi tiệc dịp cuối năm, tại sao không?\n\nCùng My Closet phối ngay:\n✨ Một chiếc đầm yếm đỏ vừa đủ nổi bật, tôn lên vẻ đẹp thanh thoát và duyên dáng\n✨ Một chiếc áo gân cuốn biên trắng với thiết kế đơn giản nhưng tinh tế, làm nàng thêm yêu kiều\nSet đồ là lựa chọn lý tưởng cho những cô nàng yêu thích sự dịu dàng và đặc biệt phù hợp để đi tiệc, dạo phố, đi làm,... \n\nĐến AEON mua sắm, bật mood “ngoan xinh yêu” để ghi điểm trong những dịp đặc biệt nàng nhé! 💎\n\n#AEON #AEONVietnam #MyCloset #CityCasual\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-02.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 2",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DD643yYvZJI/",
    caption: "BỘ SƯU TẬP URBAN CASUAL: PHỐ LÊN ĐÈN GIÁNG SINH - NÀNG LÊN ĐỒ SÀNH ĐIỆU\n\n🎄Giáng sinh về, mang theo không khí rộn ràng trên những con phố ngập tràn màu sắc. Vì vậy, các cô nàng sành điệu chắc chắn không thể bỏ qua Urban Casual – phong cách thời trang trẻ trung, cuốn hút, giúp bạn tỏa sáng trong mùa lễ hội.\n\nSẵn sàng lên đồ với những item xịn sò:\n✨ Áo gile phao cá tính mix cùng áo len cổ lọ - Bộ đôi ấm áp “over hợp” cho ngày đông lạnh.\n✨ Quần dài wash thêm chút phá cách, vừa thoải mái, lại vừa cá tính.\n\nCả 3 items cùng nhiều outfit Urban Casual khác đã có mặt tại AEON. Nhanh chân đến mua sắm ngay nàng nhé!\n\n#AEON #AEONVietnam #MyCloset #KnittedOuter #ComfortPullover\n---------------------------\nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản:\n☎️ HOTLINE MUA HÀNG: 1800.888.699\n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-03.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 3",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DDyub_pPZ9P/",
    caption: "ĐẦM TWEED ĐỎ XINH XẮN - HÓA NGỌN LỬA NHỎ NGÀY ĐÔNG 🎅🏻\n\nGiữa ngày đông se lạnh, nàng đã sẵn sàng hóa thân thành \"ngọn lửa nhỏ\" rực rỡ và lan tỏa sự ấm áp, cuốn hút mọi ánh nhìn chưa?\n\nThử ngay công thức: \n❤️ Đầm tweed đỏ với chất liệu dày dặn vừa giúp giữ ấm, vừa toát lên vẻ đẹp dịu dàng chuẩn vibe mùa lễ hội.\n❤️ Kết hợp cùng áo ren hoa cổ điển với điểm nhấn nơ tinh tế, nhẹ nhàng giúp mang đến nét nữ tính nhẹ nhàng và thanh thoát.\nVới sự hội tụ giữa vẻ đẹp cổ điển và hiện đại, tổng thể bộ trang phục sẽ giúp nàng luôn nổi bật dù là đi chơi, dạo phố hay đi làm,...\n\nĐến AEON rước ngay bộ đôi “ngoan xinh yêu” thôi nàng ơi!\n\n#AEON #AEONVietnam #MyCloset #MordenElegance #Feminine\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-04.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 4",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DDor00-vcwK/",
    caption: "NÀNG CHUỘNG FEMININE: TIỂU THƯ SANG CHẢNH - ĐÓN ĐÔNG AN LÀNH ✨\n\nGói trọn vẻ đẹp mùa đông trong một outfit đầy tinh tế, tại sao không? \n\nCùng khám phá ngay set đồ \"must-have\" cho nàng chuộng phong cách Feminine với:\n🎀 Một chiếc vest croptop trắng thanh lịch, tạo vẻ ngoài nhã nhặn và khí chất.\n🎀 Một chiếc váy chữ A tinh tế, tôn lên nét nữ tính, nhẹ nhàng.\nVới điểm nhấn là dãy cúc cùng hai chiếc nơ đỏ, outfit vừa đủ nổi bật, vừa giúp nàng bật lên khí chất tiểu thư.\n\nBộ sưu tập phong cách Feminine đã có sẵn tại AEON. Nhanh chân đến chọn mua cho mình những items ưng ý, tỏa sáng mùa lễ hội thôi nào!\n\n#AEON #AEONVietnam #MyCloset #RetroYoung #FeminineStreet\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-05.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 5",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DDWnvkZPxcJ/",
    caption: "HOODIE THỜI THƯỢNG: NĂNG ĐỘNG ĐÓN GIÓ ĐÔNG ❄️\n\nTrong những ngày se lạnh cuối năm, không thể bỏ qua hoodie - một items đa-zi-năng vừa thoải mái, vừa giúp giữ ấm và không kém phần thời thượng. \n\nCùng My Closet phối ngay set đồ \"chill\" cho những ngày lạnh với:\n🎄 Một chiếc áo hoodie ấm áp, năng động\n🎄 Một chiếc quần nỉ co giãn, tạo cảm giác thoải mái cho mọi hoạt động\nChỉ cần đi cùng một đôi sneakers đơn giản, nàng đã có ngay outfit hoàn hảo cho ngày trời trở gió. Bật mí, nàng có thể chọn tone đỏ để hợp với mùa giáng sinh gần kề nhé!\n\n🛍️ Các item đã có sẵn tại AEON. Đến ngay và sắm ngay thôi nào!\n\n#AEON #AEONVietnam #MyCloset #Urbancore #TexturedCable\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-christmas-06.jpg",
    alt: "AEON Vietnam Christmas Collection Instagram post 6",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DDbwJhAPqqR/",
    caption: "ÁO DÂY KÉO: NÀNG PHỐI SAO CHO KHÉO?\n\nNàng đang tìm kiếm một set đồ thanh lịch mà vẫn đầy cuốn hút cho những dịp gặp gỡ cuối năm? \n\nThử ngay công thức\n✨ Áo gân có cổ phối dây kéo tạo điểm nhấn tinh tế, ôm nhẹ tôn dáng mang đến vẻ đẹp vừa thanh lịch, vừa quyến rũ\n✨ Quần jean ống rộng sành điệu và thời thượng\nPhối cùng một chiếc túi xách đơn giản, nàng đã có ngay một outfit ấn tượng, phù hợp bất kể đi học, đi làm hay vi vu dạo phố.\n\nNhanh chân ghé AEON để sắm ngay bộ đôi ăn ý ngay nàng nhé!\n\n#AEON #AEONVietnam #MyCloset #Urbancore #OpenKnit #Artisti Denim\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
]

const AEON_INSTAGRAM_OFFICE_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/aeon-vietnam/instagram-office-01.jpg",
    alt: "AEON Vietnam Office Collection Instagram post 1",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/DAQWpztPyFW/",
    caption: "ĐI LÀM CÓ “GU”: BỘ ĐÔI ĂN Ý CHO HỘI CHỊ EM VĂN PHÒNG\n\nNàng đang tìm kiếm công thức mix & match với áo sơ mi để làm mới phong cách công sở hàng ngày? Cùng My Closet thử ngay outfit:\n- Áo sơ-mi màu pastel nhã nhặn, tạo cảm giác thoải mái cả ngày\n- Chân váy ngắn túi hộp hiện đại, trẻ trung\nPhối cùng một chiếc túi xách hợp màu, nàng đã có ngay một outfit vô cùng thanh lịch.\n\nNhanh chân ghé AEON để mua sắm bộ đôi “over hợp”, sẵn sàng ghi điểm khi đến văn phòng nhé các nàng ơi!\n\n#AEON #AEONVietnam #MyCloset #CityCasual #DailyCasual\n\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-office-02.jpg",
    alt: "AEON Vietnam Office Collection Instagram post 2",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/C_shE7lvdPN/",
    caption: "FEMININE STYLE - NÀNG KẸO NGỌT CÁ TÍNH\n\n🍭 Dịu dàng và nữ tính - Các nàng đã sẵn sàng hóa thân thành cô gái ngọt ngào với bộ sưu tập phong cách Feminine đến từ My Closet chưa?\n\nOutfit mở đầu cho vẻ đẹp nhẹ nhàng này là sự kết hợp hài hòa giữa:\n- Một chiếc quần yếm túi hộp trắng đáng yêu \n- Một chiếc áo thun tay dài xanh pastel ngọt ngào \nSet đồ mang đến vẻ đẹp thuần khiết pha chút tinh nghịch, đồng thời giúp nàng “hack tuổi” vô cùng hiệu quả.\n\n📍 Các item đã có mặt tại AEON. Nếu nàng “phải lòng” phong cách ngọt ngào, nữ tính thì đừng ngần ngại đến mua sắm ngay nhé!\n\n#AEON #AEONVietnam #MyCloset #CroppedKnit #ChicStreet\n\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
  {
    src: "/assets/projects/aeon-vietnam/instagram-office-03.jpg",
    alt: "AEON Vietnam Office Collection Instagram post 3",
    width: 1080,
    height: 1350,
    sourceUrl: "https://www.instagram.com/p/C_2j4B2PFYy/",
    caption: "LÊN ĐỒ TỐI GIẢN, NÀNG VẪN RẠNG NGỜI\n\n✨ Đôi khi, sự đơn giản lại là “vũ khí” mạnh mẽ nhất để nàng tỏa sáng.\n\nNhững cô nàng yêu thích phong cách tối giản nhưng vẫn muốn nổi bật khi xuất hiện đừng bỏ qua gợi ý phối đồ đến từ My Closet:\n- Áo tay dài cổ bẻ mềm mại \n- Quần short “đa-zi-năng” với phía trước xếp ly duyên dáng, phía sau là dáng quần lửng thoải mái khi di chuyển\nHoàn thiện outfit với một chiếc túi xách để nàng thêm phần nữ tính.\n\nCác item đang có sẵn tại AEON. Các nàng hãy nhanh chân đến để chọn cho mình những item yêu thích trong bộ sưu tập Feminine cùng My Closet nhé!\n\n#AEON #AEONVietnam #MyCloset #SoftMinimalism #NewNormalBasic\n\n--------------------------- \nTrải nghiệm mua sắm tại Trung tâm Bách hóa Tổng hợp & Siêu thị AEON đến từ Nhật Bản: \n☎️ HOTLINE MUA HÀNG: 1800.888.699 \n☎️ Hotline chăm sóc khách hàng: 1800.888.886",
  },
]

const AEON_PROJECT_MEDIA: ProjectMedia = {
  cover: {
    src: "/assets/projects/aeon-vietnam/cover.png",
    alt: "AEON Vietnam always-on content horizontal cover",
    width: 2400,
    height: 760,
    sourceUrl: "https://www.aeon.com.vn/wp-content/themes/aeon/images/logo_en.svg",
  },
  cardCover: {
    src: "/assets/projects/aeon-vietnam/card-cover.jpg",
    alt: "AEON Vietnam logo thumbnail",
    width: 1600,
    height: 1000,
    sourceUrl: "https://www.aeon.com.vn/wp-content/themes/aeon/images/logo_en.svg",
  },
  postCampaigns: [
    {
      title: "FACEBOOK",
      description:
        "From weekend promotions and shopping events to household essentials, content designed to turn everyday products into reasons to visit the store.",
      posts: AEON_FACEBOOK_POSTS,
    },
    {
      title: "INSTAGRAM",
      description:
        "From trend-driven launches to everyday fashion picks, every piece of content makes people stop scrolling and start imagining themselves in the outfit.",
      sections: [
        {
          title: "Christmas Collection",
          description: "A little festive spirit, a little fashion magic.",
          posts: AEON_INSTAGRAM_CHRISTMAS_POSTS,
        },
        {
          title: "Office Collection",
          description: "Dressed for the meeting. Styled for the feed.",
          posts: AEON_INSTAGRAM_OFFICE_POSTS,
        },
      ],
    },
  ],
}

const SAMSUNG_VIDEO_SOURCES = [
  "https://www.facebook.com/reel/1808331319865303",
  "https://www.facebook.com/share/v/1AxaYvs1yr/",
  "https://www.facebook.com/reel/1211040077846014",
  "https://www.tiktok.com/@puntangdong/video/7606569129998355733",
  "https://www.facebook.com/reel/1794262464584215",
  "https://www.facebook.com/reel/1380551776938897",
  "https://www.facebook.com/reel/25408362518856007",
  "https://www.facebook.com/share/v/1Jk3VhLNqs/",
] as const

const SAMSUNG_PROJECT_COVER: ProjectMediaAsset = {
  src: "/assets/projects/samsung/cover.png",
  alt: "Abstract Samsung Galaxy social video script cover artwork",
  width: 1500,
  height: 1500,
  focalPoint: { x: 50, y: 50 },
}

const SAMSUNG_PROJECT_COVER_VI: ProjectMediaAsset = {
  ...SAMSUNG_PROJECT_COVER,
  alt: "Ảnh bìa kịch bản video social Samsung Galaxy",
}

const SAMSUNG_TET_VIDEOS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/samsung/video-01.jpg",
    alt: "Samsung Tet Moi Ven Y Xua creator video preview 1",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[0],
  },
  {
    src: "/assets/projects/samsung/video-02.jpg",
    alt: "Samsung Tet Moi Ven Y Xua creator video preview 2",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[1],
  },
  {
    src: "/assets/projects/samsung/video-03.jpg",
    alt: "Samsung Tet Moi Ven Y Xua creator video preview 3",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[2],
  },
  {
    src: "/assets/projects/samsung/video-04.jpg",
    alt: "Samsung Tet Moi Ven Y Xua TikTok creator video preview",
    width: 1200,
    height: 630,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[3],
  },
]

const SAMSUNG_BETTER_YEAR_VIDEOS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/samsung/video-05.jpg",
    alt: "Samsung Galaxy A56 Gemini festive creator video preview 1",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[4],
  },
  {
    src: "/assets/projects/samsung/video-06.jpg",
    alt: "Samsung Galaxy A56 Gemini festive creator video preview 2",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[5],
  },
  {
    src: "/assets/projects/samsung/video-07.jpg",
    alt: "Samsung Galaxy A56 Gemini festive creator video preview 3",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[6],
  },
  {
    src: "/assets/projects/samsung/video-08.jpg",
    alt: "Samsung Galaxy A56 Gemini festive creator video preview 4",
    width: 675,
    height: 1200,
    sourceUrl: SAMSUNG_VIDEO_SOURCES[7],
  },
]

const SAMSUNG_TET_VIDEOS_VI: ProjectMediaAsset[] = SAMSUNG_TET_VIDEOS.map(
  (video, index) => ({
    ...video,
    alt: `Video preview creator chiến dịch Tết Mới Vẹn Ý Xưa ${index + 1}`,
  }),
)

const SAMSUNG_BETTER_YEAR_VIDEOS_VI: ProjectMediaAsset[] =
  SAMSUNG_BETTER_YEAR_VIDEOS.map((video, index) => ({
    ...video,
    alt: `Video preview creator chiến dịch Galaxy A56 Gemini ${index + 1}`,
  }))

const SAMSUNG_PROJECT_MEDIA_EN: ProjectMedia = {
  introLayout: "split-cover",
  cover: SAMSUNG_PROJECT_COVER,
  videoCampaigns: [
    {
      title: "Campaign Tết Mới Vẹn Ý Xưa",
      description:
        "Scripts that helped creators connect Galaxy AI with familiar Tet rituals, keeping old meanings while telling them in a newer voice.",
      videos: SAMSUNG_TET_VIDEOS,
    },
    {
      title: "Campaign Galaxy A56 5G / 07 / 17 - Gemini x Festive: Better new year",
      description:
        "Scripts that turned Gemini and Galaxy A56 5G features into creator-led festive moments, from playful crush stories to everyday new-year confidence.",
      videos: SAMSUNG_BETTER_YEAR_VIDEOS,
    },
  ],
}

const SAMSUNG_PROJECT_MEDIA_VI: ProjectMedia = {
  introLayout: "split-cover",
  cover: SAMSUNG_PROJECT_COVER_VI,
  videoCampaigns: [
    {
      title: "Chiến dịch Tết Mới Vẹn Ý Xưa",
      description:
        "Những kịch bản giúp creator kết nối Galaxy AI với các nghi thức Tết quen thuộc, giữ lại tinh thần cũ nhưng kể bằng một giọng mới hơn.",
      videos: SAMSUNG_TET_VIDEOS_VI,
    },
    {
      title: "Chiến dịch Galaxy A56 5G x Gemini: Năm mới tốt hơn",
      description:
        "Những kịch bản biến Gemini và các tính năng Galaxy A56 5G thành khoảnh khắc festive qua lăng kính creator, từ chuyện crush vui vui đến sự tự tin đầu năm.",
      videos: SAMSUNG_BETTER_YEAR_VIDEOS_VI,
    },
  ],
}

const TESLA_EDUCATION_VIDEO_SOURCE =
  "https://www.facebook.com/reel/1355172016653079"

const TESLA_EDUCATION_CARD_COVER: ProjectMediaAsset = {
  src: "/assets/projects/tesla-education/cover-wide.jpg",
  alt: "Tesla Education horizontal campaign thumbnail",
  width: 2048,
  height: 1365,
  sourceUrl: "https://www.facebook.com/photo.php?fbid=1407252798088393&set=pb.100064110576744.-2207520000&type=3",
}

const TESLA_EDUCATION_PROJECT_COVER: ProjectMediaAsset = {
  src: "/assets/projects/tesla-education/detail-cover.jpg",
  alt: "Tesla Education campus story project cover",
  width: 2048,
  height: 1365,
  sourceUrl: "https://www.facebook.com/photo.php?fbid=1407252808088392&set=pb.100064110576744.-2207520000&type=3",
}

const TESLA_EDUCATION_CARD_COVER_VI: ProjectMediaAsset = {
  ...TESLA_EDUCATION_CARD_COVER,
  alt: "Ảnh thumbnail ngang chiến dịch Tesla Education",
}

const TESLA_EDUCATION_PROJECT_COVER_VI: ProjectMediaAsset = {
  ...TESLA_EDUCATION_PROJECT_COVER,
  alt: "Ảnh bìa câu chuyện campus Tesla Education",
}

const TESLA_EDUCATION_VIDEO: ProjectMediaAsset = {
  src: "/assets/projects/tesla-education/video-01.jpg",
  alt: "Tesla Education brand introduction video preview",
  width: 1980,
  height: 1044,
  sourceUrl: TESLA_EDUCATION_VIDEO_SOURCE,
  ctaLabel: "TAKE ME THERE",
}

const TESLA_EDUCATION_VIDEO_VI: ProjectMediaAsset = {
  ...TESLA_EDUCATION_VIDEO,
  alt: "Video preview giới thiệu thương hiệu Tesla Education",
  ctaLabel: "TAKE ME THERE",
}

const TESLA_EDUCATION_ALWAYS_ON_SOURCES = [
  "https://www.facebook.com/share/p/1BU4L5Fegd/",
  "https://www.facebook.com/share/p/18geHsx1wA/",
  "https://www.facebook.com/share/p/1ERYo9z6rL/",
  "https://www.facebook.com/share/p/1JVuyMsCAn/",
  "https://www.facebook.com/share/p/1CxqNg9Uda/",
  "https://www.facebook.com/share/p/14fbhc2r9Nh/",
] as const

const TESLA_EDUCATION_ALWAYS_ON_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/tesla-education/always-on-01.jpg",
    alt: "Tesla Education always-on post about IB learner risk-takers",
    width: 600,
    height: 783,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[0],
  },
  {
    src: "/assets/projects/tesla-education/always-on-02.jpg",
    alt: "Tesla Education always-on post about future-ready learning",
    width: 600,
    height: 783,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[1],
  },
  {
    src: "/assets/projects/tesla-education/always-on-03.jpg",
    alt: "Tesla Education always-on post for summer at Tesla",
    width: 900,
    height: 600,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[2],
  },
  {
    src: "/assets/projects/tesla-education/always-on-04.jpg",
    alt: "Tesla Education always-on post about end of year exhibitions",
    width: 900,
    height: 600,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[3],
  },
  {
    src: "/assets/projects/tesla-education/always-on-05.jpg",
    alt: "Tesla Education always-on post about future global leaders",
    width: 600,
    height: 900,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[4],
  },
  {
    src: "/assets/projects/tesla-education/always-on-06.jpg",
    alt: "Tesla Education always-on post about IB education journey",
    width: 900,
    height: 600,
    sourceUrl: TESLA_EDUCATION_ALWAYS_ON_SOURCES[5],
  },
]

const TESLA_EDUCATION_ALWAYS_ON_POSTS_VI: ProjectMediaAsset[] =
  TESLA_EDUCATION_ALWAYS_ON_POSTS.map((post) => ({ ...post }))

const TESLA_EDUCATION_VIDEO_PROJECT_MEDIA_EN: ProjectMedia = {
  cover: TESLA_EDUCATION_VIDEO,
  cardCover: TESLA_EDUCATION_VIDEO,
  videoCampaigns: [
    {
      title: "Brand Introduction Video",
      description:
        "I'd love to show you the video right here, but it's apparently too heavy for this little portfolio to carry. Mind taking a quick trip to Tesla Education's Fanpage instead?",
      videos: [TESLA_EDUCATION_VIDEO],
    },
  ],
}

const TESLA_EDUCATION_VIDEO_PROJECT_MEDIA_VI: ProjectMedia = {
  cover: TESLA_EDUCATION_VIDEO_VI,
  cardCover: TESLA_EDUCATION_VIDEO_VI,
  videoCampaigns: [
    {
      title: "Brand Introduction Video",
      description:
        "I'd love to show you the video right here, but it's apparently too heavy for this little portfolio to carry. Mind taking a quick trip to Tesla Education's Fanpage instead?",
      videos: [TESLA_EDUCATION_VIDEO_VI],
    },
  ],
}

const TESLA_EDUCATION_ALWAYS_ON_MEDIA_EN: ProjectMedia = {
  introLayout: "split-cover",
  cover: TESLA_EDUCATION_PROJECT_COVER,
  cardCover: TESLA_EDUCATION_CARD_COVER,
  contentPostsLayout: "carousel",
  contentPosts: TESLA_EDUCATION_ALWAYS_ON_POSTS,
}

const TESLA_EDUCATION_ALWAYS_ON_MEDIA_VI: ProjectMedia = {
  introLayout: "split-cover",
  cover: TESLA_EDUCATION_PROJECT_COVER_VI,
  cardCover: TESLA_EDUCATION_CARD_COVER_VI,
  contentPostsLayout: "carousel",
  contentPosts: TESLA_EDUCATION_ALWAYS_ON_POSTS_VI,
}

const SOCIAL_OUTREACH_FORMAL_SOURCES = [
  "https://www.facebook.com/photo/?fbid=860187803286762&set=a.183686904270192",
  "https://www.facebook.com/share/p/14drtNwZqAC/",
  "https://www.facebook.com/BrandsVietnam/posts/pfbid0RConB3x176ZimTHz7QgZZhAsQAMntBd9Qv1hDpyZGVVMsX3AQy4UunQd3XDSm6c2l",
  "https://www.facebook.com/BrandsVietnam/posts/pfbid02wGtYvaptjxC6ExEKwtEifgE86YX6Jkvr6KE24ia49YQYCZipnEkk6aJwQYkyW8F3l",
] as const

const SOCIAL_OUTREACH_FORMAL_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/social-outreach/formal-01.jpg",
    alt: "Formal social outreach post about Samsung health and wellness",
    width: 2000,
    height: 2000,
    sourceUrl: SOCIAL_OUTREACH_FORMAL_SOURCES[0],
  },
  {
    src: "/assets/projects/social-outreach/formal-02.jpg",
    alt: "Formal social outreach post for VIB Privilege Banking",
    width: 2000,
    height: 2000,
    sourceUrl: SOCIAL_OUTREACH_FORMAL_SOURCES[1],
  },
  {
    src: "/assets/projects/social-outreach/formal-03.jpg",
    alt: "Formal social outreach post about Galaxy Z Flip7 and creative limits",
    width: 1200,
    height: 1200,
    sourceUrl: SOCIAL_OUTREACH_FORMAL_SOURCES[2],
  },
  {
    src: "/assets/projects/social-outreach/formal-04.jpg",
    alt: "Formal social outreach post about Vexere Tet campaign",
    width: 1180,
    height: 1036,
    sourceUrl: SOCIAL_OUTREACH_FORMAL_SOURCES[3],
  },
]

const SOCIAL_OUTREACH_MEME_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/social-outreach/meme-01.jpg",
    alt: "Meme outreach post from Xem cái này không phí tiền mạng",
    width: 1280,
    height: 1014,
    caption:
      "Xem cái này không phí tiền mạng\n\nSau khi ăn kem thì giờ tới tiết mục ăn chửi\n\n#HopTacVinamilk #KemVinamilk #KemNgonRõVịRõVui",
  },
  {
    src: "/assets/projects/social-outreach/meme-02.jpg",
    alt: "Meme outreach post from Ở Đây Zui Nè",
    width: 960,
    height: 957,
    caption:
      "Ở Đây Zui Nè\n\nMấy khúc này thấy có phước lắm mới quen được ảnh\n\n#HopTacVinamilk #KemVinamilk #KemNgonRõVịRõVui",
  },
  {
    src: "/assets/projects/social-outreach/meme-03.jpg",
    alt: "Meme outreach post from Insight mất lòng",
    width: 1080,
    height: 1080,
    caption:
      "Insight mất lòng\n\nVẫn là em bé\n\n#HopTacVinamilk #KemVinamilk #KemNgonRõVịRõVui",
  },
  {
    src: "/assets/projects/social-outreach/meme-04.jpg",
    alt: "Meme outreach post from Sinh Viên Sài Gòn Confessions",
    width: 962,
    height: 1176,
    caption:
      "Sinh Viên Sài Gòn Confessions\n\n+1 máy nghe nhạc Tết nhiều hơn nghe giảng bài\n\nMuốn Tết chắc một vé về quê thăm ba má Vexere đặt cho yên tâm nha mấy ní. Kho vé khổng lồ với hơn 3000 nhà xe, tàu, máy bay... muốn đi phương tiện gì cũng có. Giá vé thì minh bạch, rõ ràng, đang sẵn có chương trình giảm 25% (tối đa 50K) ngay cho ní nào mua vé lần đầu trên website hoặc ứng dụng nữa.\n\nVì một cái Tết chắc cú, lên Vexere ngay nha mấy fen ơi\n\n#VeTet #Vexere #DatVexere #TetChacMotVe",
  },
  {
    src: "/assets/projects/social-outreach/meme-05.jpg",
    alt: "Meme outreach post from Why So Serious",
    width: 1500,
    height: 1500,
    caption:
      "Why So Serious\n\nTag ngay đứa bạn thân sắp về quê để dặn nó sớm lên chơi với mình\n\nMà nghe nói Tết này trên Vexere có kho vé khổng lồ với hơn 3000 nhà xe, 5000 tuyến đường cùng giá vé minh bạch và đảm bảo khởi hành đúng lịch. Đã vậy những ai lần đầu đặt qua ứng dụng hoặc website còn được Vexere trợ giá giảm 50K nữa, cụ thể như nào thì check comment nha! Còn tui khóc tiếp đây\n\n#VeTet #Vexere #DatVexere #TetChacMotVe",
  },
]

const SOCIAL_OUTREACH_POETRY_SOURCES = [
  "https://www.facebook.com/share/p/18QnGE11k5/",
  "https://www.facebook.com/share/p/1Yt63fJATB/",
  "https://www.facebook.com/share/p/18MhmYU1wr/",
] as const

const SOCIAL_OUTREACH_POETRY_POSTS: ProjectMediaAsset[] = [
  {
    src: "/assets/projects/social-outreach/poetry-01.jpg",
    alt: "Poetry post from Thìa đầy thơ: Mình biết rằng hôm nay bạn mệt",
    width: 600,
    height: 608,
    sourceUrl: SOCIAL_OUTREACH_POETRY_SOURCES[0],
    caption:
      "Mình biết rằng hôm nay bạn mệt\nVới một ngày toàn những lo âu\nNhưng mình tin sẽ chẳng sao đâu\nBởi mình biết chúng ta đều giỏi\n\nCó bao giờ bạn đặt câu hỏi\n“Mình đang phải cố gắng vì ai\nMọi nỗ lực liệu...",
  },
  {
    src: "/assets/projects/social-outreach/poetry-02.jpg",
    alt: "Poetry post from Thìa đầy thơ: Ở bên ngoài cửa sổ",
    width: 600,
    height: 600,
    sourceUrl: SOCIAL_OUTREACH_POETRY_SOURCES[1],
    caption:
      "Ở bên ngoài cửa sổ\nCó một chú mèo hoang\nNằm ngắm ảnh trăng vàng\nGiữa màn đêm yên ắng\n\nLòng mèo đang trống vắng \nVì lạc mất tình yêu\nKhông biết giá bao nhiêu\nNhưng sao mèo buồn thế\n\nMèo đừng đau lòng...",
  },
  {
    src: "/assets/projects/social-outreach/poetry-03.jpg",
    alt: "Poetry post from Thìa đầy thơ: Có một việc mình mong bạn hiểu",
    width: 563,
    height: 562,
    sourceUrl: SOCIAL_OUTREACH_POETRY_SOURCES[2],
    caption:
      "Có một việc mình mong bạn hiểu\nCuộc sống này dài ngắn bao nhiêu\nBạn phải luôn ghi nhớ một điều\nHãy luôn yêu bản thân mình nhất\n\nBạn quý giá hơn nhiều vật chất\nBạn sinh ra để được yêu thương\nBạn xinh...",
  },
]

const SOCIAL_OUTREACH_FORMAL_POSTS_VI: ProjectMediaAsset[] =
  SOCIAL_OUTREACH_FORMAL_POSTS.map((post, index) => ({
    ...post,
    alt: `Bài outreach giọng formal ${index + 1}`,
  }))

const SOCIAL_OUTREACH_MEME_POSTS_VI: ProjectMediaAsset[] =
  SOCIAL_OUTREACH_MEME_POSTS.map((post, index) => ({
    ...post,
    alt: `Bài outreach giọng meme ${index + 1}`,
  }))

const SOCIAL_OUTREACH_POETRY_POSTS_VI: ProjectMediaAsset[] =
  SOCIAL_OUTREACH_POETRY_POSTS.map((post, index) => ({
    ...post,
    alt: `Bài outreach giọng thơ và creative writing ${index + 1}`,
  }))

const SOCIAL_OUTREACH_PROJECT_MEDIA_EN: ProjectMedia = {
  cover: {
    src: "/assets/storybook/scope-social-outreach.png",
    alt: "Vietnamese storybook style social outreach background",
    width: 1448,
    height: 1086,
  },
  outreachSections: [
    {
      title: "Formal & Academic Voice",
      description: "A place for thoughtful discussions and carefully chosen words.",
      displayMode: "linked-posts",
      posts: SOCIAL_OUTREACH_FORMAL_POSTS,
    },
    {
      title: "Meme & Funny Voice",
      description: "A place where the same brain occasionally communicates through memes.",
      displayMode: "caption-posts",
      posts: SOCIAL_OUTREACH_MEME_POSTS,
    },
    {
      title: "Poetry & Creative Writing",
      description:
        "A place where I shamelessly flex my rhyming skills (without client's brief).",
      displayMode: "caption-grid",
      posts: SOCIAL_OUTREACH_POETRY_POSTS,
    },
  ],
}

const SOCIAL_OUTREACH_PROJECT_MEDIA_VI: ProjectMedia = {
  cover: {
    src: "/assets/storybook/scope-social-outreach.png",
    alt: "Nền minh họa phong cách truyện Việt cho social outreach",
    width: 1448,
    height: 1086,
  },
  outreachSections: [
    {
      title: "Giọng formal và học thuật",
      description: "Một không gian cho những thảo luận chỉn chu và câu chữ được chọn kỹ.",
      displayMode: "linked-posts",
      posts: SOCIAL_OUTREACH_FORMAL_POSTS_VI,
    },
    {
      title: "Giọng meme và hài hước",
      description: "Một không gian nơi cùng một bộ não đôi khi giao tiếp bằng meme.",
      displayMode: "caption-posts",
      posts: SOCIAL_OUTREACH_MEME_POSTS_VI,
    },
    {
      title: "Thơ và creative writing",
      description:
        "Một không gian nơi mình shamelessly flex kỹ năng gieo vần (không cần brief của client).",
      displayMode: "caption-grid",
      posts: SOCIAL_OUTREACH_POETRY_POSTS_VI,
    },
  ],
}

const TIKTOK_NAMING_RATIONALE_EN: ProjectNamingRationale = {
  eyebrow: "Naming rationale",
  title: "TET TO THE TOP",
  items: [
    {
      term: "TET",
      definition: "Highlight the festive season",
    },
    {
      term: "TO THE TOP",
      definition: "Represent the growth, momentum, and sales breakthrough",
    },
  ],
  note: "Also sounds like TIK to the TOK (hope so)",
}

const TIKTOK_NAMING_RATIONALE_VI: ProjectNamingRationale = {
  eyebrow: "Giải thích tên gọi",
  title: "TET TO THE TOP",
  items: [
    {
      term: "TET",
      definition: "Gợi nhắc mùa lễ hội",
    },
    {
      term: "TO THE TOP",
      definition: "Đại diện cho tăng trưởng, đà bứt phá và doanh số đi lên",
    },
  ],
  note: "Nghe cũng gần giống TIK to the TOK nữa, hy vọng là vậy.",
}

export const PORTFOLIO_CONTENT: Record<Locale, PortfolioContent> = {
  en: {
    chapters: [
      {
        id: "cover",
        number: "01",
        label: "Cover",
        title: "Open the Cover",
        description: "The opening cover of the portfolio.",
      },
      {
        id: "about",
        number: "02",
        label: "Page 01",
        title: "About the Author",
        description: "A first introduction to Minh Tam and her way of working.",
      },
      {
        id: "fields",
        number: "03",
        label: "Page 02",
        title: "Fields of Craft",
        description: "Choose one creative path to view related projects.",
      },
      {
        id: "gallery",
        number: "04",
        label: "Field Page",
        title: "Project Gallery",
        description: "Projects from the selected field.",
      },
      {
        id: "detail",
        number: "05",
        label: "Project Detail",
        title: "Project Detail",
        description: "Story, solution, and results for a selected project.",
      },
    ],
    author: {
      name: "Minh Tâm",
      role: "Social Planner & Creative Copywriter",
      opening: [
        "Once upon a day, there is a girl who believes that creativity can make changes to the world.",
      ],
      greeting: "Yes, it’s meeee -",
      headline: "Minh Tâm",
      body: [
        "probably the most distinctive character you’ve met.",
        "Unlike Tấm (The Story of Tấm Cám), who needed the help of a fairy godmother to find her happiness, I carry a sense of responsibility, a thirst for knowledge, a curious mind and a dedicated work ethic to conquer my career goals, which is my true well-being.",
        "Let's read my story and get to know me better!",
      ],
      image: "/assets/storybook/minh-tam.jpg",
      imageAlt: "Portrait of Minh Tam among green leaves",
      ctas: {
        explore: "Explore My Craft",
        myth: "Unfold My Myth",
      },
    },
    fields: [
      {
        id: "social-planner",
        title: "Thinking in Systems",
        subtitle: "Strategic Planning",
        shortTitle: "Thinking",
        description:
          "Look beyond the surface. Break down what drives decisions and shapes behavior.",
        body:
          "Look beyond the surface. Break down what drives decisions and shapes behavior.",
        scopeIntro:
          "I look beyond what people do to understand why they do it.",
        image: "/assets/storybook/thinking-systems-field.png",
        imageAlt: "",
        sheetImage: SHARED_FIELD_ASSETS.social.sheetImage,
        accent: "clay",
        filters: ["Strategy", "Campaign", "Content Plan"],
      },
      {
        id: "creative-copywriter",
        title: "Writing with Intent",
        subtitle: "Creative Content",
        shortTitle: "Writing",
        description:
          "Choose words that carry meaning. Make every line do something.",
        body:
          "Choose words that carry meaning. Make every line do something.",
        image: "/assets/storybook/writing-intent-field.png",
        imageAlt: "",
        sheetImage: SHARED_FIELD_ASSETS.copywriter.sheetImage,
        accent: "moss",
        filters: [
          "Social Video Script",
          "Fanpage Always-on Content",
          "Website Content",
          "Social Outreach",
        ],
        scopeIntro: "I write the words that do more than fill the space",
        scopeCards: [
          {
            id: "social-video-script",
            title: "Social Video Script",
            description: "Words that stop the scroll.",
            category: "Social Video Script",
            image: "/assets/storybook/scope-social-video-script.png",
            imageAlt: "Vietnamese storybook style social video script background",
          },
          {
            id: "fanpage-always-on-content",
            title: "Fanpage Always-on Content",
            description: "Words that stay in the feed.",
            category: "Fanpage Always-on Content",
            image: "/assets/storybook/scope-fanpage-always-on-content.png",
            imageAlt: "Vietnamese storybook style fanpage content background",
          },
          {
            id: "website-content",
            title: "Website Content",
            description: "Words that shape the journey.",
            category: "Website Content",
            image: "/assets/storybook/scope-website-content.png",
            imageAlt: "Vietnamese storybook style website content background",
          },
          {
            id: "social-outreach",
            title: "Social Outreach",
            description: "Words that travel further.",
            category: "Social Outreach",
            image: "/assets/storybook/scope-social-outreach.png",
            imageAlt: "Vietnamese storybook style social outreach background",
            landingProjectId: "social-outreach",
          },
        ],
      },
    ],
    projects: [
      {
        id: "brand-story",
        fieldId: "creative-copywriter",
        title: "Brand Story",
        eyebrow: "Project",
        category: "Brand Story",
        summary: "A brand story for an herbal skincare line.",
        client: "XYZ Skincare",
        year: "2024",
        scope: ["Brand Story", "Website Copy", "Key Messages"],
        overview:
          "A rewrite of the brand story through ingredients, slow living, and gentle care.",
        objective:
          "Give the brand a clear, distinct story that can expand across multiple channels.",
        solution:
          "Build a three-level message system: origin, product feeling, and the promise of care.",
        results: ["Completed brand story", "12 key messages", "Website copy framework"],
        thumbnail: { col: 0, row: 0 },
      },
      {
        id: "axe",
        fieldId: "social-planner",
        title: "AXE",
        eyebrow: "Project",
        category: "Campaign",
        summary: "A bold proposal-style campaign detail built around attraction, confidence, and visual storytelling.",
        client: "AXE",
        year: "2024",
        scope: ["Big Idea", "Campaign Proposal", "Creative Copy"],
        overview: AXE_CONTEXT,
        objective:
          "Make the case page feel closer to a finished proposal deck than a text article.",
        solution:
          "Use a large cover image, a standalone summary page, and an upload-ready carousel for the full proposal.",
        results: ["Image-led detail page", "Upload-ready media structure", "Carousel proposal flow"],
        thumbnail: { col: 1, row: 0 },
        media: AXE_PROJECT_MEDIA,
        proposalCta: {
          label: "View full portfolio",
          credit: "Shout out to the friends who built this proposal with me.",
          creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
        },
      },
      {
        id: "samsung",
        fieldId: "creative-copywriter",
        title: "Samsung",
        eyebrow: "Project",
        category: "Social Video Script",
        summary: "TikTok video scripts for Samsung Galaxy creator campaigns across different voices and audiences.",
        client: "Samsung",
        year: "2025",
        scope: ["TikTok Video Script", "KOL Script Adaptation", "Galaxy Campaigns"],
        overview:
          "The same message can sound completely different depending on who's telling it.\n\nAcross multiple Galaxy product campaigns, I worked on TikTok video scripts for KOLs and creators with very different personalities. Each creator had a different style, audience, and way of telling stories, which meant every script needed its own personality while still bringing the product to the center of attention.",
        objective:
          "Adapt Galaxy campaign messages into creator-ready video scripts that felt natural to each KOL's personality and audience.",
        solution:
          "Shape each script around the creator's own storytelling rhythm while keeping the Galaxy product benefit clear and central.",
        results: ["Creator-specific scripts", "Galaxy product storytelling", "Two mini-campaign script sets"],
        thumbnail: { col: 0, row: 0 },
        media: SAMSUNG_PROJECT_MEDIA_EN,
      },
      {
        id: "tesla-education",
        fieldId: "creative-copywriter",
        title: "Tesla Education",
        eyebrow: "Project",
        category: "Social Video Script",
        summary: "Every school has a story. The challenge is telling it in a way that people can actually feel.",
        client: "Tesla Education",
        year: "2026",
        scope: ["Brand Introduction Video", "Creative Concept", "Full Script"],
        overview:
          "My role was to develop the creative concept and write the full script for an inspiring brand introduction video, bringing together the voices of teachers, leaders, and educators who shape the learning journey every day.\n\nRather than listing achievements or facilities, the video focused on the beliefs behind them - turning educational values into a story that felt authentic, human, and worth remembering.",
        objective:
          "Turn Tesla Education's school story into a brand introduction video that felt human, inspiring, and emotionally clear.",
        solution:
          "Build the concept and full script around the beliefs behind the school, weaving together educator voices instead of simply listing facilities or achievements.",
        results: ["Creative concept", "Full brand video script", "Education value storytelling"],
        thumbnail: { col: 1, row: 0 },
        media: TESLA_EDUCATION_VIDEO_PROJECT_MEDIA_EN,
      },
      {
        id: "acecook",
        fieldId: "creative-copywriter",
        title: "Acecook",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Always-on football content and key visual copy for Acecook's Vietnam National Football Team campaign.",
        client: "Acecook",
        year: "2025",
        scope: ["Always-on Content", "Social Captions", "Key Visual Copy"],
        campaignTitle: "Bền Chí Kiên Tâm\nVững Vàng Tạo Kỳ Tích",
        closingNote:
          "Little flex: before I joined, most always-on content needed 5-6 rounds of feedback, then mine usually called it a day after 1 or 2.",
        overview:
          "Some campaigns are about products. This one was about national pride.\n\nAs the main sponsor of the Vietnam National Football Team, Acecook launched Việt Nam Quyết Tiến – Khởi Sắc Vinh Quang to celebrate the team's journey and ignite the pride of millions of Vietnamese fans.\n\nMy role was to develop always-on content throughout the campaign, from social captions to key visual copy, ensuring every touchpoint carried the same uplifting and heroic spirit. Because when football brings a nation together, every word deserves to sound like part of the anthem.",
        objective:
          "Keep the campaign's football pride alive across always-on social touchpoints while staying connected to Acecook's sponsorship role.",
        solution:
          "Develop captions and key visual copy with an uplifting, heroic tone so each post felt like part of the same national rallying cry.",
        results: ["Always-on content direction", "Social caption system", "Key visual copy"],
        thumbnail: { col: 0, row: 0 },
        media: ACECOOK_PROJECT_MEDIA,
      },
      {
        id: "weshare",
        fieldId: "creative-copywriter",
        title: "WeShare",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Always-on social content and campaign storytelling for a Gen Z-friendly charity-tech platform.",
        client: "WeShare",
        year: "2025",
        scope: ["Always-on Content", "Brand Voice", "Conversion-driven Campaigns"],
        overview:
          "Doing good shouldn't feel complicated.\n\nWeShare was built to make giving back a little easier, allowing users to donate a portion of their shopping commissions directly to the charitable organizations they care about.\n\nAs Marketing Acting Lead, I led the team in shaping a brand voice that felt closer to Gen Z than a typical charity-tech platform. Through trendy content, relatable storytelling, and conversion-driven campaigns, we turned acts of giving into something more approachable, shareable, and engaging.",
        objective:
          "Make WeShare feel approachable for young users while keeping the platform's giving-back mechanism clear and motivating.",
        solution:
          "Shape an always-on content voice around trendy references, relatable storytelling, and campaign messages that made donation feel easy to join.",
        results: ["Gen Z-friendly brand voice", "Always-on content direction", "Conversion-driven campaign messaging"],
        thumbnail: { col: 1, row: 0 },
        media: WESHARE_PROJECT_MEDIA_EN,
      },
      {
        id: "panasonic",
        fieldId: "creative-copywriter",
        title: "Panasonic",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Copy-on-visuals for Panasonic's CRM Promote digital advertising assets.",
        client: "Panasonic",
        year: "2025",
        scope: ["Copy-on-visuals", "Digital Ads", "Promotional Headlines"],
        campaignTitle: "CRM Promote",
        overview:
          "In advertising, every word is paying rent.\n\nFor Panasonic's CRM Promote ads campaign, I developed copy-on-visuals across digital advertising assets, turning product benefits and promotional messages into short, catchy headlines that could grab attention in seconds.",
        objective:
          "Turn product benefits and promotional messages into concise ad copy that could catch attention quickly in digital placements.",
        solution:
          "Write short, benefit-led headlines for each visual asset, keeping the message sharp enough for fast-scrolling ad contexts.",
        results: ["Digital ad copy-on-visuals", "Short promotional headlines", "CRM Promote message adaptation"],
        thumbnail: { col: 2, row: 0 },
        media: PANASONIC_PROJECT_MEDIA,
      },
      {
        id: "aeon-vietnam",
        fieldId: "creative-copywriter",
        title: "AEON Vietnam",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Let's help products find their way into shopping carts.",
        client: "AEON Vietnam",
        year: "2025",
        scope: ["Facebook Always-on Content", "Instagram Content", "Product Storytelling"],
        overview:
          "AEON is the kind of brand that sells almost everything, which means content can never be one-size-fits-all. Different products, different audiences, different platforms, different ways of selling products.",
        objective:
          "Turn AEON Vietnam's wide product mix into always-on content that gives shoppers clear reasons to visit and buy.",
        solution:
          "Shape platform-specific product stories across Facebook and Instagram, matching promotions, lifestyle launches, and fashion picks to the audience and format.",
        results: ["Facebook promotional content", "Instagram fashion collection copy", "Always-on product storytelling"],
        thumbnail: { col: 0, row: 1 },
        media: AEON_PROJECT_MEDIA,
      },
      {
        id: "tesla-education-always-on",
        fieldId: "creative-copywriter",
        title: "Tesla Education",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Choosing a school is about finding a place that feels right for your child's story.",
        client: "Tesla Education",
        year: "2026",
        scope: ["Monthly Content Planning", "Bilingual Content", "Fanpage Always-on Content"],
        overview:
          "For Tesla Education's always-on content, I developed monthly content plans and created bilingual content across platforms, translating educational concepts into stories, insights, and messages that resonated with parents. From academic excellence and student development to school culture and everyday learning moments, each content angle was designed to help families better understand what makes Tesla, Tesla.",
        objective:
          "Help families understand Tesla Education through consistent always-on content across platforms.",
        solution:
          "Turn educational concepts, school culture, and everyday learning moments into parent-facing stories, insights, and social messages.",
        results: ["Monthly content plans", "Bilingual platform content", "Parent-facing education storytelling"],
        thumbnail: { col: 1, row: 1 },
        media: TESLA_EDUCATION_ALWAYS_ON_MEDIA_EN,
      },
      {
        id: "social-outreach",
        fieldId: "creative-copywriter",
        title: "Social Outreach",
        eyebrow: "Scope",
        category: "Social Outreach",
        summary: "Community outreach content across formal discussions, hot pages, and meme-led social spaces.",
        client: "Social Outreach",
        year: "2025",
        scope: ["Community Seeding", "Voice Adaptation", "Social Outreach"],
        overview:
          "Not every piece of content stays on the brand's fanpage.\n\nSome travel to communities. Some spark conversations on hot pages. Others find their way into niche groups where audiences speak an entirely different language.\n\nThat's where social outreach comes in.\n\nFrom formal and academic communities to meme-loving corners of the internet, every audience requires a different way of joining the conversation.",
        objective:
          "Adapt campaign messages so they could travel into communities, hot pages, and niche groups without sounding copied from the brand fanpage.",
        solution:
          "Shift tone and framing by audience, moving between formal discussion, academic context, and meme-led conversation while keeping the core message intact.",
        results: ["Formal community posts", "Meme-led outreach posts", "Audience-specific voice adaptation"],
        thumbnail: { col: 2, row: 1 },
        media: SOCIAL_OUTREACH_PROJECT_MEDIA_EN,
      },
      {
        id: "tiktok",
        fieldId: "creative-copywriter",
        title: "TikTok",
        eyebrow: "Project",
        category: "Website Content",
        summary: "Website content and naming for TikTok's Tet to the Top commercial initiative.",
        client: "TikTok",
        year: "2025",
        scope: ["Naming", "Website Content", "Key Messaging"],
        overview:
          "Every year, as Tết approaches, TikTok launches one of its biggest commercial and creative initiatives to help SMEs unlock growth during the year's most important shopping season.\n\nIn 2025, I had the opportunity to join the project as a Copywriter, contributing to the development of the event's content concept - from naming to website content and key messaging.\n\nThat was also the year Tết to the Top came to life.",
        objective:
          "Create a content concept that makes the campaign feel festive, commercial, and growth-focused for SMEs preparing for Tet.",
        solution:
          "Shape the name Tet to the Top around the festive season and the idea of sales momentum, then extend that message across the website flow.",
        results: ["Tet to the Top naming", "Website content direction", "Key message system"],
        thumbnail: { col: 2, row: 0 },
        media: TIKTOK_PROJECT_MEDIA,
        namingRationale: TIKTOK_NAMING_RATIONALE_EN,
      },
      {
        id: "tvc-script",
        fieldId: "creative-copywriter",
        title: "TVC Script",
        eyebrow: "Project",
        category: "Content",
        summary: "A short TVC script for a lifestyle product.",
        client: "Home Light",
        year: "2024",
        scope: ["Script", "VO", "Scene Beat"],
        overview:
          "A script about an everyday moment brightened by small details and restrained dialogue.",
        objective:
          "Create a concise, production-friendly script with a memorable emotional point.",
        solution: "Shape a 30-second three-act rhythm: absence, arrival, warmth restored.",
        results: ["2 script drafts", "Clear shot beats", "Voiceover ready to record"],
        thumbnail: { col: 2, row: 0 },
      },
      {
        id: "print-ad",
        fieldId: "creative-copywriter",
        title: "Print Ad",
        eyebrow: "Project",
        category: "Campaign",
        summary: "Headline and body copy for a print ad set.",
        client: "Moc Market",
        year: "2023",
        scope: ["Headline", "Body Copy", "Message Matrix"],
        overview:
          "A print set centered on the feeling of touching real ingredients and choosing slowly.",
        objective:
          "Create short, image-rich headlines that fit the reading rhythm of print media.",
        solution:
          "Develop layers of wording from direct to metaphorical, then select the most balanced direction.",
        results: ["18 headline options", "4 body copy samples", "Consistent messaging"],
        thumbnail: { col: 0, row: 1 },
      },
      {
        id: "website-copy",
        fieldId: "creative-copywriter",
        title: "Website Copy",
        eyebrow: "Project",
        category: "Content",
        summary: "Website copy for a boutique creative service.",
        client: "Atelier Nine",
        year: "2023",
        scope: ["Landing Copy", "UX Writing", "CTA System"],
        overview:
          "A project refining the website language so the brand sounds clear and premium without feeling distant.",
        objective:
          "Clarify the value proposition and move visitors from curiosity to contact.",
        solution:
          "Rewrite the content structure in layers: promise, proof, process, and invitation.",
        results: ["Landing copy completed", "Unified CTA system", "Reduced redundant copy"],
        thumbnail: { col: 1, row: 1 },
      },
      {
        id: "slogan-series",
        fieldId: "creative-copywriter",
        title: "Slogan Series",
        eyebrow: "Project",
        category: "Brand Story",
        summary: "Seasonal slogan series for a seed brand.",
        client: "Seed Garden",
        year: "2023",
        scope: ["Slogan", "Tone System", "Seasonal Copy"],
        overview:
          "A slogan series linking the image of planting to the feeling of beginning again.",
        objective:
          "Create short, memorable lines that can flex across social, packaging, and activation.",
        solution:
          "Use the seed as a small promise, then develop variations across seasons.",
        results: ["24 slogan options", "6 selected lines", "Soft but clear tone"],
        thumbnail: { col: 2, row: 1 },
      },
    ],
    ui: {
      allFilter: "All",
      languageToggleAria: "Switch portfolio language",
      cover: {
        title: "Portfolio - A Vietnamese Fairytale for Creative Minds",
        description:
          "Storytelling, strategy, and creativity in a portfolio you can unfold by scrolling.",
        imageSrc: "/assets/storybook/cover-en.png",
        imageAlt: "Portfolio cover inspired by Vietnamese storybooks - Tam Sac Ben",
        nextAria: "Scroll to the introduction page",
        nextLabel: "Turn page",
      },
      fields: {
        heading: "How Tâm Outgrows Tấm",
        body:
          "No magic. No shortcuts. Just curiosity, logic, and a slightly mischievous way of seeing the world.",
        lockedPrompt: "Choose a field to open the project page",
        unlockedPrompt: "Choose a field to continue",
      },
      gallery: {
        lockedEyebrow: "Field page",
        lockedTitle: "Choose a field first",
        lockedBody:
          "The project gallery will open after you choose The Thinking or The Making.",
        lockedAction: "Back to Fields",
        emptyTitle: "This scope is still waiting.",
        emptyBody: "Choose another scope to keep exploring the work.",
        back: "Back",
        backToScopes: "Back to scopes",
        eyebrow: "Field page",
      },
      detail: {
        lockedEyebrow: "Project detail",
        lockedTitle: "No project selected yet",
        lockedBody:
          "The detail page will open after you choose a field and a specific project.",
        lockedAction: "Back to Fields",
        back: "Back",
        topAria: "Back to cover",
        client: "Client",
        year: "Year",
        scope: "Scope",
        objective: "Objective",
        solution: "Solution",
        results: "Results",
        proposal: "Full proposal",
        websitePreview: "Website preview",
        visitPost: "Visit post",
        watchVideo: "Watch video",
        postCaption: "Facebook caption",
        readMoreCaption: "Read more",
        showLessCaption: "Show less",
        proposalCarousel: "proposal carousel",
        previousSlide: "Previous slide",
        nextSlide: "Next slide",
        showProposalSlide: "Show proposal slide",
      },
      projectCard: {
        action: "View project",
      },
      progress: {
        aria: "Chapter navigation",
        lockedHint: "Choose a field first",
        lockedAria: "is locked. Choose a field first.",
        goToPrefix: "Go to",
      },
    },
  },
  vi: {
    chapters: [
      {
        id: "cover",
        number: "01",
        label: "Cover",
        title: "Mở bìa",
        description: "Trang bìa hiện khi truy cập portfolio.",
      },
      {
        id: "about",
        number: "02",
        label: "Trang 01",
        title: "Về tác giả",
        description: "Giới thiệu Minh Tâm và cách làm việc.",
      },
      {
        id: "fields",
        number: "03",
        label: "Trang 02",
        title: "Lĩnh vực",
        description: "Chọn một nhánh để xem các dự án liên quan.",
      },
      {
        id: "gallery",
        number: "04",
        label: "Trang lĩnh vực",
        title: "Danh mục dự án",
        description: "Hiển thị dự án của lĩnh vực đang chọn.",
      },
      {
        id: "detail",
        number: "05",
        label: "Chi tiết dự án",
        title: "Xem chi tiết",
        description: "Câu chuyện, giải pháp và kết quả của dự án.",
      },
    ],
    author: {
      name: "Minh Tâm",
      role: "Social Planner & Creative Copywriter",
      greeting: "Hiiiiii,",
      headline: "Mình là Minh Tâm",
      body: [
        "có lẽ là một nhân vật độc nhất mà bạn từng gặp, với niềm say mê mạnh mẽ dành cho những công việc sáng tạo.",
        "Khác với Tấm trong truyện Tấm Cám, người cần Bụt giúp để tìm hạnh phúc, mình mang theo tinh thần trách nhiệm, khát khao học hỏi và thái độ làm việc tận tâm để chinh phục mục tiêu sự nghiệp. Đó chính là hạnh phúc thật sự của mình.",
        "Cùng đọc câu chuyện của mình và hiểu mình hơn nhé!",
      ],
      image: "/assets/storybook/minh-tam.jpg",
      imageAlt: "Chân dung Minh Tâm giữa những tán lá xanh",
      ctas: {
        explore: "Khám phá lĩnh vực",
        myth: "Mở câu chuyện của mình",
      },
    },
    fields: [
      {
        id: "social-planner",
        title: "The Thinking",
        subtitle: "Lập kế hoạch chiến lược",
        shortTitle: "Thinking",
        description:
          "Nơi ý tưởng bắt đầu - qua insight, cấu trúc và định hướng có chủ đích.",
        body:
          "Nơi ý tưởng bắt đầu - qua insight, cấu trúc và định hướng có chủ đích.",
        scopeIntro:
          "I look beyond what people do to understand why they do it.",
        image: SHARED_FIELD_ASSETS.social.image,
        imageAlt: "Minh họa lĩnh vực The Thinking",
        sheetImage: SHARED_FIELD_ASSETS.social.sheetImage,
        accent: "clay",
        filters: ["Chiến lược", "Chiến dịch", "Kế hoạch nội dung"],
      },
      {
        id: "creative-copywriter",
        title: "The Making",
        subtitle: "Nội dung sáng tạo",
        shortTitle: "Making",
        description:
          "Nơi ý tưởng thành hình - được kể thành câu chuyện, hình ảnh và những trải nghiệm có ý nghĩa.",
        body:
          "Nơi ý tưởng thành hình - được kể thành câu chuyện, hình ảnh và những trải nghiệm có ý nghĩa.",
        image: SHARED_FIELD_ASSETS.copywriter.image,
        imageAlt: "Minh họa lĩnh vực The Making",
        sheetImage: SHARED_FIELD_ASSETS.copywriter.sheetImage,
        accent: "moss",
        filters: [
          "Kịch bản video social",
          "Nội dung fanpage always-on",
          "Nội dung website",
          "Social outreach",
        ],
        scopeIntro: "Mình viết những câu chữ không chỉ để lấp đầy khoảng trống.",
        scopeCards: [
          {
            id: "social-video-script",
            title: "Kịch bản video social",
            description: "Câu chữ khiến người xem dừng lại.",
            category: "Kịch bản video social",
            image: "/assets/storybook/scope-social-video-script.png",
            imageAlt: "Nền minh họa phong cách truyện Việt cho kịch bản video social",
          },
          {
            id: "fanpage-always-on-content",
            title: "Nội dung fanpage always-on",
            description: "Câu chữ ở lại trong feed.",
            category: "Nội dung fanpage always-on",
            image: "/assets/storybook/scope-fanpage-always-on-content.png",
            imageAlt: "Nền minh họa phong cách truyện Việt cho nội dung fanpage",
          },
          {
            id: "website-content",
            title: "Nội dung website",
            description: "Câu chữ định hình hành trình.",
            category: "Nội dung website",
            image: "/assets/storybook/scope-website-content.png",
            imageAlt: "Nền minh họa phong cách truyện Việt cho nội dung website",
          },
          {
            id: "social-outreach",
            title: "Social outreach",
            description: "Câu chữ đi xa hơn.",
            category: "Social outreach",
            image: "/assets/storybook/scope-social-outreach.png",
            imageAlt: "Nền minh họa phong cách truyện Việt cho social outreach",
            landingProjectId: "social-outreach",
          },
        ],
      },
    ],
    projects: [
      {
        id: "brand-story",
        fieldId: "creative-copywriter",
        title: "Câu chuyện thương hiệu",
        eyebrow: "Dự án",
        category: "Câu chuyện thương hiệu",
        summary: "Câu chuyện thương hiệu cho dòng sản phẩm chăm sóc da thảo mộc.",
        client: "XYZ Skincare",
        year: "2024",
        scope: ["Câu chuyện thương hiệu", "Copy website", "Thông điệp chủ đạo"],
        overview:
          "Dự án viết lại câu chuyện thương hiệu từ góc nhìn nguyên liệu, nhịp sống chậm và sự chăm sóc dịu dàng.",
        objective:
          "Giúp thương hiệu có một câu chuyện rõ ràng, khác biệt và dễ mở rộng sang nhiều kênh.",
        solution:
          "Xây dựng hệ thông điệp theo ba tầng: nguồn gốc, cảm nhận sản phẩm và lời hứa chăm sóc.",
        results: ["Hoàn thiện câu chuyện thương hiệu", "12 thông điệp chủ đạo", "Khung nội dung website"],
        thumbnail: { col: 0, row: 0 },
      },
      {
        id: "axe",
        fieldId: "social-planner",
        title: "AXE",
        eyebrow: "Dự án",
        category: "Chiến dịch",
        summary: "Một case chiến dịch đậm chất proposal, xoay quanh sức hút, sự tự tin và kể chuyện bằng hình ảnh.",
        client: "AXE",
        year: "2024",
        scope: ["Ý tưởng lớn", "Proposal chiến dịch", "Copy sáng tạo"],
        overview: AXE_CONTEXT_VI,
        objective:
          "Làm cho trang case study có cảm giác như một proposal deck hoàn chỉnh thay vì bài viết nhiều chữ.",
        solution:
          "Dùng cover lớn, một trang tóm tắt riêng và carousel để trình bày trọn vẹn proposal.",
        results: ["Trang chi tiết thiên về hình ảnh", "Cấu trúc media sẵn sàng upload", "Carousel proposal đầy đủ"],
        thumbnail: { col: 1, row: 0 },
        media: AXE_PROJECT_MEDIA_VI,
        proposalCta: {
          label: "Coi full portfolio",
          credit: "Shout out những người đã cùng làm proposal với tôi.",
          creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
        },
      },
      {
        id: "samsung",
        fieldId: "creative-copywriter",
        title: "Samsung",
        eyebrow: "Dự án",
        category: "Kịch bản video social",
        summary: "Kịch bản TikTok video cho các chiến dịch Samsung Galaxy với nhiều giọng kể creator khác nhau.",
        client: "Samsung",
        year: "2025",
        scope: ["Kịch bản video TikTok", "Điều chỉnh giọng KOL", "Chiến dịch Galaxy"],
        overview:
          "Cùng một thông điệp có thể nghe rất khác nhau tùy vào người kể nó.\n\nQua nhiều chiến dịch sản phẩm Galaxy, mình viết kịch bản TikTok video cho các KOL và creator có cá tính rất khác nhau. Mỗi creator có một phong cách, một nhóm khán giả và một cách kể chuyện riêng, nên mỗi kịch bản cũng cần có tính cách riêng nhưng vẫn đưa sản phẩm về đúng vị trí trung tâm.",
        objective:
          "Chuyển thông điệp chiến dịch Galaxy thành các kịch bản video sẵn sàng cho creator, tự nhiên với cá tính và tệp khán giả của từng KOL.",
        solution:
          "Xây dựng từng kịch bản theo nhịp kể chuyện riêng của creator, đồng thời giữ lợi ích sản phẩm Galaxy rõ ràng và nổi bật.",
        results: ["Kịch bản riêng theo từng creator", "Kể chuyện sản phẩm Galaxy", "Hai nhóm chiến dịch nhỏ"],
        thumbnail: { col: 0, row: 0 },
        media: SAMSUNG_PROJECT_MEDIA_VI,
      },
      {
        id: "tesla-education",
        fieldId: "creative-copywriter",
        title: "Tesla Education",
        eyebrow: "Dự án",
        category: "Kịch bản video social",
        summary: "Every school has a story. The challenge is telling it in a way that people can actually feel.",
        client: "Tesla Education",
        year: "2026",
        scope: ["Brand Introduction Video", "Creative Concept", "Full Script"],
        overview:
          "My role was to develop the creative concept and write the full script for an inspiring brand introduction video, bringing together the voices of teachers, leaders, and educators who shape the learning journey every day.\n\nRather than listing achievements or facilities, the video focused on the beliefs behind them - turning educational values into a story that felt authentic, human, and worth remembering.",
        objective:
          "Turn Tesla Education's school story into a brand introduction video that felt human, inspiring, and emotionally clear.",
        solution:
          "Build the concept and full script around the beliefs behind the school, weaving together educator voices instead of simply listing facilities or achievements.",
        results: ["Creative concept", "Full brand video script", "Education value storytelling"],
        thumbnail: { col: 1, row: 0 },
        media: TESLA_EDUCATION_VIDEO_PROJECT_MEDIA_VI,
      },
      {
        id: "acecook",
        fieldId: "creative-copywriter",
        title: "Acecook",
        eyebrow: "Dự án",
        category: "Nội dung fanpage always-on",
        summary: "Nội dung bóng đá always-on và copy key visual cho chiến dịch đội tuyển quốc gia của Acecook.",
        client: "Acecook",
        year: "2025",
        scope: ["Nội dung always-on", "Caption social", "Copy key visual"],
        campaignTitle: "Bền Chí Kiên Tâm\nVững Vàng Tạo Kỳ Tích",
        closingNote:
          "Khoe nhẹ một chút: trước khi mình tham gia, phần lớn nội dung always-on thường cần 5-6 vòng feedback; còn bài của mình thường chốt sau 1-2 vòng.",
        overview:
          "Có những chiến dịch nói về sản phẩm. Chiến dịch này nói về niềm tự hào dân tộc.\n\nVới vai trò nhà tài trợ chính của Đội tuyển Bóng đá Quốc gia Việt Nam, Acecook ra mắt Việt Nam Quyết Tiến – Khởi Sắc Vinh Quang để tôn vinh hành trình của đội tuyển và thắp lên niềm tự hào của hàng triệu người hâm mộ Việt Nam.\n\nVai trò của mình là phát triển nội dung always-on xuyên suốt chiến dịch, từ social captions đến copy key visual, để mọi điểm chạm đều giữ chung một tinh thần cổ vũ hào hùng. Vì khi bóng đá gắn kết cả một quốc gia, từng câu chữ cũng cần vang lên như một phần của bài ca chiến thắng.",
        objective:
          "Duy trì tinh thần tự hào bóng đá xuyên suốt các điểm chạm social always-on, đồng thời gắn kết tự nhiên với vai trò nhà tài trợ của Acecook.",
        solution:
          "Phát triển caption và copy key visual theo giọng điệu nâng tinh thần, hào hùng, để mỗi bài đăng đều thuộc về cùng một lời cổ vũ quốc gia.",
        results: ["Định hướng nội dung always-on", "Hệ caption social", "Copy key visual"],
        thumbnail: { col: 0, row: 0 },
        media: ACECOOK_PROJECT_MEDIA_VI,
      },
      {
        id: "weshare",
        fieldId: "creative-copywriter",
        title: "WeShare",
        eyebrow: "Dự án",
        category: "Nội dung fanpage always-on",
        summary: "Nội dung social always-on và storytelling chiến dịch cho một nền tảng công nghệ thiện nguyện gần gũi với Gen Z.",
        client: "WeShare",
        year: "2025",
        scope: ["Nội dung always-on", "Giọng thương hiệu", "Chiến dịch thúc đẩy chuyển đổi"],
        overview:
          "Làm điều tốt không nên là một chuyện phức tạp.\n\nWeShare được xây dựng để việc đóng góp trở nên dễ dàng hơn, cho phép người dùng trích một phần hoa hồng mua sắm để gửi trực tiếp đến những tổ chức thiện nguyện mà họ quan tâm.\n\nTrong vai trò Acting Lead Marketing, mình dẫn dắt team định hình một giọng thương hiệu gần với Gen Z hơn một nền tảng công nghệ thiện nguyện thông thường. Thông qua nội dung bắt xu hướng, lối kể chuyện gần gũi và các chiến dịch hướng đến chuyển đổi, tụi mình biến việc cho đi thành một trải nghiệm dễ tiếp cận, dễ chia sẻ và cuốn hút hơn.",
        objective:
          "Làm cho WeShare trở nên gần gũi với người dùng trẻ, đồng thời giữ cơ chế đóng góp của nền tảng rõ ràng và có sức thúc đẩy hành động.",
        solution:
          "Xây dựng giọng nội dung always-on dựa trên xu hướng, câu chuyện đời thường và thông điệp chiến dịch khiến việc đóng góp trở nên dễ tham gia.",
        results: ["Giọng thương hiệu gần với Gen Z", "Định hướng nội dung always-on", "Thông điệp chiến dịch hướng chuyển đổi"],
        thumbnail: { col: 1, row: 0 },
        media: WESHARE_PROJECT_MEDIA_VI,
      },
      {
        id: "panasonic",
        fieldId: "creative-copywriter",
        title: "Panasonic",
        eyebrow: "Dự án",
        category: "Nội dung fanpage always-on",
        summary: "Copy trên visual cho các quảng cáo digital trong chiến dịch CRM Promote của Panasonic.",
        client: "Panasonic",
        year: "2025",
        scope: ["Copy trên visual", "Quảng cáo digital", "Headline khuyến mãi"],
        campaignTitle: "CRM Promote",
        overview:
          "Trong quảng cáo, từng chữ đều phải tự chứng minh giá trị của mình.\n\nVới chiến dịch quảng cáo CRM Promote của Panasonic, mình phát triển copy trên visual cho các tài sản quảng cáo digital, biến lợi ích sản phẩm và thông điệp khuyến mãi thành những headline ngắn, bắt tai và có thể thu hút sự chú ý chỉ trong vài giây.",
        objective:
          "Chuyển lợi ích sản phẩm và thông điệp khuyến mãi thành copy quảng cáo ngắn gọn, đủ nhanh để bắt sự chú ý trong các vị trí hiển thị digital.",
        solution:
          "Viết headline ngắn theo từng mẫu visual, giữ thông điệp rõ lợi ích và đủ sắc trong bối cảnh người xem lướt rất nhanh.",
        results: ["Copy trên visual cho digital ads", "Headline khuyến mãi ngắn gọn", "Điều chỉnh thông điệp CRM Promote"],
        thumbnail: { col: 2, row: 0 },
        media: PANASONIC_PROJECT_MEDIA_VI,
      },
      {
        id: "aeon-vietnam",
        fieldId: "creative-copywriter",
        title: "AEON Vietnam",
        eyebrow: "Project",
        category: "Fanpage Always-on Content",
        summary: "Let's help products find their way into shopping carts.",
        client: "AEON Vietnam",
        year: "2025",
        scope: ["Facebook Always-on Content", "Instagram Content", "Product Storytelling"],
        overview:
          "AEON is the kind of brand that sells almost everything, which means content can never be one-size-fits-all. Different products, different audiences, different platforms, different ways of selling products.",
        objective:
          "Turn AEON Vietnam's wide product mix into always-on content that gives shoppers clear reasons to visit and buy.",
        solution:
          "Shape platform-specific product stories across Facebook and Instagram, matching promotions, lifestyle launches, and fashion picks to the audience and format.",
        results: ["Facebook promotional content", "Instagram fashion collection copy", "Always-on product storytelling"],
        thumbnail: { col: 0, row: 1 },
        media: AEON_PROJECT_MEDIA,
      },
      {
        id: "tesla-education-always-on",
        fieldId: "creative-copywriter",
        title: "Tesla Education",
        eyebrow: "Dự án",
        category: "Nội dung fanpage always-on",
        summary: "Choosing a school is about finding a place that feels right for your child's story.",
        client: "Tesla Education",
        year: "2026",
        scope: ["Monthly Content Planning", "Bilingual Content", "Fanpage Always-on Content"],
        overview:
          "For Tesla Education's always-on content, I developed monthly content plans and created bilingual content across platforms, translating educational concepts into stories, insights, and messages that resonated with parents. From academic excellence and student development to school culture and everyday learning moments, each content angle was designed to help families better understand what makes Tesla, Tesla.",
        objective:
          "Help families understand Tesla Education through consistent always-on content across platforms.",
        solution:
          "Turn educational concepts, school culture, and everyday learning moments into parent-facing stories, insights, and social messages.",
        results: ["Monthly content plans", "Bilingual platform content", "Parent-facing education storytelling"],
        thumbnail: { col: 1, row: 1 },
        media: TESLA_EDUCATION_ALWAYS_ON_MEDIA_VI,
      },
      {
        id: "social-outreach",
        fieldId: "creative-copywriter",
        title: "Social Outreach",
        eyebrow: "Phạm vi",
        category: "Social outreach",
        summary: "Nội dung outreach đi vào cộng đồng, hot page và những góc meme/ngách trên social.",
        client: "Social Outreach",
        year: "2025",
        scope: ["Seeding cộng đồng", "Điều chỉnh giọng viết", "Social outreach"],
        overview:
          "Không phải nội dung nào cũng ở lại trên fanpage của thương hiệu.\n\nCó nội dung đi vào cộng đồng. Có nội dung khơi gợi cuộc trò chuyện trên hot page. Có nội dung tìm đường vào những nhóm ngách, nơi khán giả nói bằng một ngôn ngữ rất khác.\n\nĐó là lúc social outreach xuất hiện.\n\nTừ những cộng đồng trang trọng, học thuật đến các góc internet sống bằng meme, mỗi nhóm khán giả đều cần một cách khác nhau để bước vào cuộc trò chuyện.",
        objective:
          "Điều chỉnh thông điệp chiến dịch để có thể đi vào cộng đồng, hot page và nhóm ngách mà không nghe như copy từ fanpage thương hiệu.",
        solution:
          "Chuyển đổi giọng điệu và góc tiếp cận theo từng tệp khán giả, từ thảo luận chỉn chu, ngữ cảnh học thuật đến cuộc trò chuyện bằng meme, nhưng vẫn giữ lõi thông điệp.",
        results: ["Bài outreach cho cộng đồng chỉn chu", "Bài outreach theo giọng meme", "Điều chỉnh giọng viết theo từng nhóm khán giả"],
        thumbnail: { col: 2, row: 1 },
        media: SOCIAL_OUTREACH_PROJECT_MEDIA_VI,
      },
      {
        id: "tiktok",
        fieldId: "creative-copywriter",
        title: "TikTok",
        eyebrow: "Dự án",
        category: "Nội dung website",
        summary: "Nội dung website và đặt tên cho sáng kiến Tết to the Top của TikTok.",
        client: "TikTok",
        year: "2025",
        scope: ["Đặt tên", "Nội dung website", "Thông điệp chính"],
        overview:
          "Mỗi năm khi Tết đến gần, TikTok triển khai một trong những sáng kiến thương mại và sáng tạo lớn nhất để giúp các doanh nghiệp nhỏ và vừa mở khóa tăng trưởng trong mùa mua sắm quan trọng nhất năm. Năm 2025, mình tham gia dự án với vai trò copywriter, đóng góp vào ý tưởng nội dung của sự kiện - từ đặt tên đến nội dung website và thông điệp chính.",
        objective:
          "Tạo một ý tưởng nội dung vừa có không khí Tết, vừa thể hiện rõ tinh thần tăng trưởng và bứt phá doanh số cho doanh nghiệp nhỏ và vừa.",
        solution:
          "Phát triển tên gọi Tet to the Top từ tinh thần mùa lễ hội và ý niệm đi lên trong tăng trưởng, rồi mở rộng thông điệp đó xuyên suốt website.",
        results: ["Tên gọi Tet to the Top", "Định hướng nội dung website", "Hệ thông điệp chính"],
        thumbnail: { col: 2, row: 0 },
        media: TIKTOK_PROJECT_MEDIA_VI,
        namingRationale: TIKTOK_NAMING_RATIONALE_VI,
      },
      {
        id: "tvc-script",
        fieldId: "creative-copywriter",
        title: "Kịch bản TVC",
        eyebrow: "Dự án",
        category: "Nội dung",
        summary: "Kịch bản TVC ngắn cho sản phẩm đời sống.",
        client: "Home Light",
        year: "2024",
        scope: ["Kịch bản", "Lời bình", "Nhịp cảnh"],
        overview:
          "Kịch bản kể về một khoảnh khắc đời thường được soi sáng bằng chi tiết nhỏ và lời thoại tiết chế.",
        objective:
          "Tạo kịch bản ngắn gọn, dễ sản xuất và có điểm nhớ cảm xúc.",
        solution: "Dựng nhịp ba hồi trong 30 giây: thiếu vắng, xuất hiện, ấm lại.",
        results: ["2 bản kịch bản", "Nhịp cảnh rõ ràng", "Lời bình sẵn sàng thu âm"],
        thumbnail: { col: 2, row: 0 },
      },
      {
        id: "print-ad",
        fieldId: "creative-copywriter",
        title: "Quảng cáo in",
        eyebrow: "Dự án",
        category: "Chiến dịch",
        summary: "Headline và body copy cho bộ quảng cáo in.",
        client: "Mộc Market",
        year: "2023",
        scope: ["Headline", "Body copy", "Ma trận thông điệp"],
        overview:
          "Bộ quảng cáo tập trung vào cảm giác chạm vào nguyên liệu thật và lựa chọn chậm rãi.",
        objective:
          "Tạo headline ngắn, có hình ảnh và phù hợp với nhịp đọc của ấn phẩm in.",
        solution:
          "Phát triển nhiều lớp câu chữ từ trực diện đến giàu ẩn dụ, sau đó chọn hướng cân bằng nhất.",
        results: ["18 lựa chọn headline", "4 mẫu body copy", "Thông điệp nhất quán"],
        thumbnail: { col: 0, row: 1 },
      },
      {
        id: "website-copy",
        fieldId: "creative-copywriter",
        title: "Copy website",
        eyebrow: "Dự án",
        category: "Nội dung",
        summary: "Nội dung website cho dịch vụ sáng tạo boutique.",
        client: "Atelier Nine",
        year: "2023",
        scope: ["Copy landing page", "UX writing", "Hệ CTA"],
        overview:
          "Dự án tinh chỉnh ngôn ngữ website để thương hiệu nghe rõ ràng, cao cấp nhưng không xa cách.",
        objective:
          "Tăng độ rõ của đề xuất giá trị và giúp người xem đi từ tò mò đến liên hệ.",
        solution:
          "Viết lại cấu trúc nội dung theo từng lớp: lời hứa, bằng chứng, quy trình và lời mời.",
        results: ["Hoàn thiện copy landing page", "Hệ CTA thống nhất", "Giảm nội dung trùng lặp"],
        thumbnail: { col: 1, row: 1 },
      },
      {
        id: "slogan-series",
        fieldId: "creative-copywriter",
        title: "Chuỗi slogan",
        eyebrow: "Dự án",
        category: "Câu chuyện thương hiệu",
        summary: "Chuỗi slogan theo mùa cho thương hiệu hạt giống.",
        client: "Seed Garden",
        year: "2023",
        scope: ["Slogan", "Hệ giọng điệu", "Copy theo mùa"],
        overview:
          "Chuỗi slogan nối hình ảnh gieo trồng với cảm giác bắt đầu lại của người trẻ.",
        objective:
          "Tạo bộ câu ngắn dễ nhớ, có thể dùng linh hoạt trên social, bao bì và activation.",
        solution:
          "Khai thác ẩn dụ hạt giống như một lời hứa nhỏ, rồi phát triển thành nhiều biến thể theo mùa.",
        results: ["24 lựa chọn slogan", "6 câu được chọn", "Giọng viết mềm mại nhưng rõ nét"],
        thumbnail: { col: 2, row: 1 },
      },
    ],
    ui: {
      allFilter: "Tất cả",
      languageToggleAria: "Chuyển ngôn ngữ portfolio",
      cover: {
        title: "Portfolio - Cổ tích Việt Nam cho dân sáng tạo",
        description:
          "Storytelling, strategy, creativity. Một cuốn portfolio được lật mở bằng nhịp cuộn.",
        imageSrc: "/assets/storybook/cover.png",
        imageAlt: "Bìa portfolio Cổ tích Việt Nam cho dân sáng tạo - Tâm Sắc Bén",
        nextAria: "Cuộn đến trang giới thiệu",
        nextLabel: "Lật trang",
      },
      fields: {
        heading: "Lĩnh vực hoạt động",
        body:
          "Mỗi nhánh là một trang truyện riêng, cùng đi về một cách kể thương hiệu rõ ràng và có cảm xúc.",
        lockedPrompt: "Chọn một lĩnh vực để mở trang dự án",
        unlockedPrompt: "Chọn một lĩnh vực để tiếp tục",
      },
      gallery: {
        lockedEyebrow: "Trang lĩnh vực",
        lockedTitle: "Chọn một lĩnh vực trước",
        lockedBody:
          "Danh mục dự án sẽ mở ra sau khi bạn chọn The Thinking hoặc The Making.",
        lockedAction: "Quay lại Lĩnh vực",
        emptyTitle: "Scope này vẫn đang chờ nội dung.",
        emptyBody: "Chọn một scope khác để tiếp tục xem các dự án.",
        back: "Quay lại",
        backToScopes: "Quay lại scope",
        eyebrow: "Trang lĩnh vực",
      },
      detail: {
        lockedEyebrow: "Chi tiết dự án",
        lockedTitle: "Chưa có dự án được chọn",
        lockedBody:
          "Trang chi tiết sẽ mở sau khi bạn chọn một lĩnh vực và một dự án cụ thể.",
        lockedAction: "Quay lại Lĩnh vực",
        back: "Quay lại",
        topAria: "Quay về bìa",
        client: "Client",
        year: "Year",
        scope: "Scope",
        objective: "Objective",
        solution: "Solution",
        results: "Kết quả",
        proposal: "Proposal đầy đủ",
        websitePreview: "Xem trước website",
        visitPost: "Xem bài post",
        watchVideo: "Xem video",
        postCaption: "Caption Facebook",
        readMoreCaption: "Xem thêm",
        showLessCaption: "Thu gọn",
        proposalCarousel: "carousel proposal",
        previousSlide: "Slide trước",
        nextSlide: "Slide tiếp theo",
        showProposalSlide: "Xem proposal slide",
      },
      projectCard: {
        action: "Xem dự án",
      },
      progress: {
        aria: "Điều hướng chương",
        lockedHint: "Chọn lĩnh vực trước",
        lockedAria: "đang khóa. Chọn lĩnh vực trước.",
        goToPrefix: "Đến",
      },
    },
  },
}

export const MYTH_CONTENT: Record<Locale, MythContent> = {
  en: {
    eyebrow: "Unfold My Truth",
    title: "Unfold My Truth",
    lead:
      "THE WORLD MAKES MORE SENSE THAN IT SEEMS.",
    intro:
      "A deeper introduction to Minh Tâm and the many versions of her creative journey.",
    image: "/assets/storybook/minh-tam-truth.jpg",
    panels: [
      {
        title: "Responsibility",
        body:
          "I take ownership of the brief, the details, and the invisible parts of the work. A good story needs charm, but it also needs someone who can carry it from idea to execution.",
      },
      {
        title: "Thirst for Knowledge",
        body:
          "I like learning how people think, how brands move, and why some words stay in memory. Every project becomes a small field study for sharper strategy and richer creative direction.",
      },
      {
        title: "Dedicated Work Ethic",
        body:
          "Creative work feels magical only after very human effort: drafts, edits, research, listening, and the patience to make the message clear enough to travel.",
      },
    ],
    truth: {
      greeting: "Hiii,",
      beliefPrefix:
        "I’m Minh Tâm - who always believe that",
      beliefQuote: "THE WORLD MAKES MORE SENSE THAN IT SEEMS.",
      paragraphs: [
        "As a true Gen Z with a strong passion for creative work, I’m always curious about what lies beneath the surface: the insight behind a campaign, the thinking behind a product, and the reason why something works (or unfortunately doesn’t).",
        "With over 3 years of experience across different roles in Marketing, I’ve had the chance to work in various types of marketing environments - from in-house teams to agencies and freelance projects. During the journey, my scope of work moves from planning to execution, from making ideas happen to understanding why they should.",
        "To me, creativity doesn’t just make things look better but makes the world more meaningful, and somehow, make more sense in its own way. If we’re on the same page, why don't we write the next chapter of Tâm Sắc Bén together?",
      ],
      timelineTitle: "GET TO KNOW TÂM IN MANY VERSIONS",
      versions: [
        {
          title: "2019 | The Curious One",
          italic:
            "Start noticing the spark of creating something that people actually care about.",
          description:
            "While still in school, I had a chance to join the prom communication team. At first, it was just about writing posts, coming up with ideas, making things look nice. But somewhere in between deadlines and random brainstorms, I realized I genuinely enjoyed doing this.",
        },
        {
          title: "2020 | The Committed One",
          italic:
            "Turn curiosity into something worth taking seriously.",
          description:
            "I chose to study Marketing at University of Economics Ho Chi Minh City (UEH) - not by chance, but because I wanted to understand what I had started to enjoy. Here I started learning how to think behind the work and eventually graduated with distinction.",
        },
        {
          title: "2022 - Present | The Driven One",
          italic:
            "Step into the creative world I’ve always desired and finally bring what's in my mind to life.",
          description: "",
          work: [
            {
              company: "Shopee",
              role: "Campus Ambassador",
              dates: "Dec 2021 - Aug 2022",
            },
            {
              company: "AND Agency",
              role: "Account Intern",
              dates: "Nov 2022 - Jan 2023",
            },
            {
              company: "GSI Group",
              role: "Junior Marketing Executive",
              dates: "May 2023 - Jun 2024",
            },
            {
              company: "WeShare",
              role: "Marketing Acting Lead",
              dates: "Apr 2024 - Feb 2025 (Contract)",
            },
            {
              company: "Brandy Agency",
              roles: [
                {
                  title: "Content",
                  dates: "Aug 2024 - Sep 2025",
                },
                {
                  title: "Social Planner",
                  dates: "Oct 2025 - Present",
                },
              ],
            },
          ],
        },
      ],
      contact: {
        title: "CONTACT",
        body: "Seems like I’ve caught your attention. Let’s meet in real life.",
        email: "ttmtam76@gmail.com",
        phone: "(+84)934064685",
      },
    },
    closingTitle: "That is my well-being",
    closingBody:
      "Career goals are not only milestones to chase. For me, they are a way to become more capable, more useful, and more honest in the stories I help bring to life.",
    portfolioLabel: "Back to Portfolio",
    imageAlt: "Minh Tâm presenting her marketing work",
  },
  vi: {
    eyebrow: "Mở câu chuyện của mình",
    title: "Câu chuyện phía sau Minh Tâm",
    lead:
      "Cổ tích nào cũng có một khởi đầu hơi kỳ lạ. Câu chuyện của mình bắt đầu bằng sự tò mò, công việc sáng tạo và lựa chọn xây hạnh phúc từ chính sự nghiệp mình theo đuổi.",
    intro:
      "Mình không chờ một ông Bụt xuất hiện để trao cho mình chương tiếp theo đẹp hơn. Mình gom nhặt câu hỏi, mài sắc nghề, và luôn xuất hiện với tinh thần trách nhiệm dành cho những con người và thương hiệu tin tưởng mình.",
    panels: [
      {
        title: "Tinh thần trách nhiệm",
        body:
          "Mình chịu trách nhiệm với brief, với chi tiết, và cả những phần không dễ nhìn thấy của công việc. Một câu chuyện hay cần sức hút, nhưng cũng cần người đưa nó đi từ ý tưởng đến thực thi.",
      },
      {
        title: "Khát khao học hỏi",
        body:
          "Mình thích tìm hiểu cách con người suy nghĩ, cách thương hiệu chuyển động, và vì sao có những câu chữ ở lại trong trí nhớ. Mỗi dự án là một cuộc nghiên cứu nhỏ để chiến lược sắc hơn và sáng tạo giàu hơn.",
      },
      {
        title: "Thái độ làm việc tận tâm",
        body:
          "Công việc sáng tạo chỉ trông có vẻ nhiệm màu sau rất nhiều nỗ lực rất đời thường: nháp, sửa, nghiên cứu, lắng nghe và kiên nhẫn làm thông điệp đủ rõ để có thể lan đi.",
      },
    ],
    closingTitle: "Đó là hạnh phúc thật sự của mình",
    closingBody:
      "Mục tiêu sự nghiệp không chỉ là những cột mốc để chinh phục. Với mình, đó là cách để trở nên vững vàng hơn, hữu ích hơn và thành thật hơn trong những câu chuyện mình góp phần tạo nên.",
    portfolioLabel: "Về Portfolio",
    imageAlt: "Minh Tâm mỉm cười giữa những chiếc lá xanh lớn",
  },
}

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "vi"
}

export function getPortfolioContent(locale: Locale) {
  return PORTFOLIO_CONTENT[locale]
}

export function createPortfolioContentByLocale(
  projectsByLocale: Record<Locale, Project[]>,
): PortfolioContentByLocale {
  return {
    en: {
      ...PORTFOLIO_CONTENT.en,
      projects: projectsByLocale.en,
    },
    vi: {
      ...PORTFOLIO_CONTENT.vi,
      projects: projectsByLocale.vi,
    },
  }
}

export function getStaticProjectsByLocale(): Record<Locale, Project[]> {
  return {
    en: PORTFOLIO_CONTENT.en.projects,
    vi: PORTFOLIO_CONTENT.vi.projects,
  }
}

export function getStaticPortfolioContentByLocale(): PortfolioContentByLocale {
  return createPortfolioContentByLocale(getStaticProjectsByLocale())
}

export function getPortfolioProjectIds() {
  return PORTFOLIO_CONTENT[DEFAULT_LOCALE].projects.map((project) => project.id)
}

export function getPortfolioProject(locale: Locale, projectId: string) {
  return PORTFOLIO_CONTENT[locale].projects.find((project) => project.id === projectId)
}
