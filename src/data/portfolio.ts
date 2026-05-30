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
  focalPoint?: {
    x: number
    y: number
  }
}

export interface ProjectMedia {
  cover: ProjectMediaAsset
  summary?: ProjectMediaAsset
  proposalSlides?: ProjectMediaAsset[]
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
  overview: string
  objective: string
  solution: string
  results: string[]
  thumbnail: {
    col: 0 | 1 | 2
    row: 0 | 1
  }
  media?: ProjectMedia
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
}

export interface PortfolioUi {
  allFilter: string
  languageToggleAria: string
  cover: {
    title: string
    description: string
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
    back: string
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
  panels: Array<{
    title: string
    body: string
  }>
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
      name: "Minh Tam",
      role: "Social Planner & Creative Copywriter",
      greeting: "Hiiiiii,",
      headline: "I am Minh Tam",
      body: [
        "probably the most unique character you’ll ever come across, with a strong passion for creative works.",
        "Unlike Tam (The Story of Tam and Cam), who needed the help of a fairy godmother to find her happiness, I carry a sense of responsibility, a thirst for knowledge, and a dedicated work ethic to conquer my career goals, which is my true well-being.",
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
        title: "The Thinking",
        subtitle: "Strategic Planning",
        shortTitle: "Thinking",
        description:
          "Where ideas begin - through insight, structure, and intentional direction.",
        body:
          "Where ideas begin - through insight, structure, and intentional direction.",
        image: SHARED_FIELD_ASSETS.social.image,
        imageAlt: "Illustration for The Thinking projects",
        sheetImage: SHARED_FIELD_ASSETS.social.sheetImage,
        accent: "clay",
        filters: ["Strategy", "Campaign", "Content Plan"],
      },
      {
        id: "creative-copywriter",
        title: "The Making",
        subtitle: "Creative Content",
        shortTitle: "Making",
        description:
          "Where ideas come alive - crafted into stories, visuals, and meaningful experiences.",
        body:
          "Where ideas come alive - crafted into stories, visuals, and meaningful experiences.",
        image: SHARED_FIELD_ASSETS.copywriter.image,
        imageAlt: "Illustration for The Making projects",
        sheetImage: SHARED_FIELD_ASSETS.copywriter.sheetImage,
        accent: "moss",
        filters: ["Brand Story", "Campaign", "Content"],
      },
    ],
    projects: [
      {
        id: "tet-ve-nha",
        fieldId: "social-planner",
        title: "Tet Homecoming",
        eyebrow: "Project",
        category: "Campaign",
        summary: "A Tet 2024 campaign about returning, reconnecting, and sharing.",
        client: "ABC Brand",
        year: "2024",
        scope: ["Strategy", "Content Plan", "Creative Direction"],
        overview:
          "A Lunar New Year campaign retelling the journey home through small moments: meals, bus rides, gifts, and checking-in calls.",
        objective:
          "Grow emotional awareness and spark organic engagement during the Tet peak season.",
        solution:
          "Build a three-layer content series: family stories, community activation, and prompts inviting people to share their own memories.",
        results: ["2.5M+ engagements", "Saved-post rate up 38%", "1.2M+ short-video views"],
        thumbnail: { col: 0, row: 0 },
      },
      {
        id: "lang-nghe-viet",
        fieldId: "social-planner",
        title: "Vietnamese Craft Villages",
        eyebrow: "Project",
        category: "Strategy",
        summary: "Building a community around Vietnamese craft and village stories.",
        client: "Love Vietnamese Craft",
        year: "2024",
        scope: ["Community", "Content Pillars", "Editorial Calendar"],
        overview:
          "A project that helped the brand tell warmer stories about artisans, materials, and the journey behind each product.",
        objective:
          "Create a long-term content foundation so the community can understand and stay connected to Vietnamese craft values.",
        solution:
          "Design content pillars around people, process, materials, and lived moments with the products.",
        results: ["5 core content lines", "Higher-quality comments", "8-week publishing calendar"],
        thumbnail: { col: 1, row: 0 },
      },
      {
        id: "xanh-moi-ngay",
        fieldId: "social-planner",
        title: "Green Every Day",
        eyebrow: "Project",
        category: "Campaign",
        summary: "A Green Living campaign that makes sustainable habits feel doable.",
        client: "Green Living",
        year: "2024",
        scope: ["Campaign Idea", "Social Calendar", "Activation"],
        overview:
          "A campaign encouraging greener living through small actions close to urban everyday life.",
        objective:
          "Make sustainability feel less distant and increase participation in the challenge.",
        solution:
          "Split the campaign into weekly missions, each paired with practical guidance and inspiring stories.",
        results: ["4-week challenge", "Organic UGC growth", "Participation rate up 29%"],
        thumbnail: { col: 2, row: 0 },
      },
      {
        id: "an-lanh-song-khoe",
        fieldId: "social-planner",
        title: "Eat Well, Live Well",
        eyebrow: "Project",
        category: "Content Plan",
        summary: "A six-month content plan for a healthy food brand.",
        client: "Daily Bowl",
        year: "2023",
        scope: ["Content Plan", "Education Series", "Social Guidelines"],
        overview:
          "A content plan that helps the brand talk about nutrition in a simpler, more trustworthy, and more applicable way.",
        objective:
          "Build credibility and create a habit of following the brand’s educational content.",
        solution: "Develop content in three levels: understand well, choose easily, cook quickly.",
        results: ["6-month content calendar", "More saved recipes", "Stable brand voice"],
        thumbnail: { col: 0, row: 1 },
      },
      {
        id: "thuong-hieu-me-be",
        fieldId: "social-planner",
        title: "Mother & Baby Brand",
        eyebrow: "Project",
        category: "Strategy",
        summary: "Content strategy for a mother and baby brand.",
        client: "Little Nest",
        year: "2023",
        scope: ["Brand Voice", "Content Pillars", "Trust Building"],
        overview:
          "A project defining how the brand speaks to young parents: warm, informed, and never pressuring.",
        objective:
          "Build trust through advisory content, everyday stories, and product-choice guidance.",
        solution:
          "Set a content framework that balances expertise, emotion, and product proof.",
        results: ["4 core content groups", "More positive responses", "32-page guideline"],
        thumbnail: { col: 1, row: 1 },
      },
      {
        id: "back-to-school",
        fieldId: "social-planner",
        title: "Back To School",
        eyebrow: "Project",
        category: "Campaign",
        summary: "A school-opening campaign for education products.",
        client: "Bright Class",
        year: "2023",
        scope: ["Campaign Planning", "Key Visual Direction", "Social Content"],
        overview:
          "A campaign inspired by the excitement of preparing for a new school year.",
        objective:
          "Create early-season shopping demand through positive emotion, not only promotion.",
        solution:
          "Combine family preparation stories, useful checklists, and interactive content for students.",
        results: ["More landing-page clicks", "5 content formats", "Promotion message set"],
        thumbnail: { col: 2, row: 1 },
      },
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
        fieldId: "creative-copywriter",
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
        imageAlt: "Portfolio cover inspired by Vietnamese storybooks - Tam Sac Ben",
        nextAria: "Scroll to the introduction page",
        nextLabel: "Turn page",
      },
      fields: {
        heading: "Fields of Craft",
        body:
          "Each path opens a different story page, all leading toward clear, emotional brand storytelling.",
        lockedPrompt: "Choose a field to open the project page",
        unlockedPrompt: "Scroll on or choose another field",
      },
      gallery: {
        lockedEyebrow: "Field page",
        lockedTitle: "Choose a field first",
        lockedBody:
          "The project gallery will open after you choose The Thinking or The Making.",
        lockedAction: "Back to Fields",
        back: "Back",
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
        filters: ["Brand Story", "Campaign", "Content"],
      },
    ],
    projects: [
      {
        id: "tet-ve-nha",
        fieldId: "social-planner",
        title: "Tết Về Nhà",
        eyebrow: "Dự án",
        category: "Chiến dịch",
        summary: "Chiến dịch Tết 2024 về sự trở về, kết nối và sẻ chia.",
        client: "ABC Brand",
        year: "2024",
        scope: ["Strategy", "Content Plan", "Creative Direction"],
        overview:
          "Một chiến dịch mùa Tết kể lại hành trình trở về nhà qua những khoảnh khắc nhỏ: bữa cơm, chuyến xe, món quà và lời hỏi thăm.",
        objective:
          "Tăng nhận diện cảm xúc và thúc đẩy tương tác tự nhiên trong giai đoạn cao điểm Tết.",
        solution:
          "Xây dựng chuỗi nội dung ba lớp: câu chuyện gia đình, hoạt động cộng đồng và lời kêu gọi chia sẻ kỷ niệm cá nhân.",
        results: ["Tăng tương tác 2.5M+", "Tỷ lệ lưu bài tăng 38%", "1.2M+ lượt xem video ngắn"],
        thumbnail: { col: 0, row: 0 },
      },
      {
        id: "lang-nghe-viet",
        fieldId: "social-planner",
        title: "Làng Nghề Việt",
        eyebrow: "Dự án",
        category: "Chiến lược",
        summary: "Xây dựng cộng đồng yêu thủ công Việt và câu chuyện làng nghề.",
        client: "Love Vietnamese Craft",
        year: "2024",
        scope: ["Community", "Content Pillars", "Editorial Calendar"],
        overview:
          "Dự án giúp thương hiệu kể chuyện về nghệ nhân, chất liệu và hành trình sản phẩm một cách gần gũi.",
        objective:
          "Tạo nền tảng nội dung dài hạn để cộng đồng hiểu và gắn bó với giá trị thủ công Việt.",
        solution:
          "Thiết kế trụ cột nội dung xoay quanh con người, quy trình, chất liệu và khoảnh khắc sử dụng sản phẩm.",
        results: ["5 tuyến nội dung chủ lực", "Tăng bình luận chất lượng", "Tạo lịch đăng 8 tuần"],
        thumbnail: { col: 1, row: 0 },
      },
      {
        id: "xanh-moi-ngay",
        fieldId: "social-planner",
        title: "Xanh Mỗi Ngày",
        eyebrow: "Dự án",
        category: "Chiến dịch",
        summary: "Chiến dịch Green Living biến thói quen xanh thành chuyện dễ làm.",
        client: "Green Living",
        year: "2024",
        scope: ["Campaign Idea", "Social Calendar", "Activation"],
        overview:
          "Một chiến dịch khuyến khích lối sống xanh bằng những hành động nhỏ, gần với đời sống đô thị.",
        objective:
          "Giảm cảm giác xa vời của chủ đề bền vững và tăng tỷ lệ tham gia thử thách.",
        solution:
          "Chia chiến dịch thành các nhiệm vụ hằng tuần, mỗi nhiệm vụ đi kèm nội dung hướng dẫn và câu chuyện truyền cảm hứng.",
        results: ["4 tuần thử thách", "Tăng UGC tự nhiên", "Tỷ lệ tham gia tăng 29%"],
        thumbnail: { col: 2, row: 0 },
      },
      {
        id: "an-lanh-song-khoe",
        fieldId: "social-planner",
        title: "Ăn Lành Sống Khỏe",
        eyebrow: "Dự án",
        category: "Kế hoạch nội dung",
        summary: "Content plan 6 tháng cho thương hiệu thực phẩm lành mạnh.",
        client: "Daily Bowl",
        year: "2023",
        scope: ["Content Plan", "Education Series", "Social Guidelines"],
        overview:
          "Kế hoạch nội dung giúp thương hiệu nói về dinh dưỡng đơn giản hơn, dễ tin hơn và dễ áp dụng hơn.",
        objective:
          "Tăng độ tin cậy và tạo thói quen theo dõi nội dung giáo dục của thương hiệu.",
        solution: "Xây dựng chuỗi bài theo ba cấp độ: hiểu đúng, chọn dễ, nấu nhanh.",
        results: ["6 tháng lịch nội dung", "Tăng lượt lưu công thức", "Ổn định giọng nói thương hiệu"],
        thumbnail: { col: 0, row: 1 },
      },
      {
        id: "thuong-hieu-me-be",
        fieldId: "social-planner",
        title: "Thương Hiệu Mẹ & Bé",
        eyebrow: "Dự án",
        category: "Chiến lược",
        summary: "Chiến lược nội dung cho thương hiệu mẹ và bé.",
        client: "Little Nest",
        year: "2023",
        scope: ["Brand Voice", "Content Pillars", "Trust Building"],
        overview:
          "Dự án định hình cách thương hiệu trò chuyện với phụ huynh trẻ: ấm áp, hiểu biết và không gây áp lực.",
        objective:
          "Tạo sự tin cậy qua nội dung tư vấn, câu chuyện đời thường và hướng dẫn chọn sản phẩm.",
        solution:
          "Thiết lập khung nội dung cân bằng giữa chuyên môn, cảm xúc và bằng chứng sản phẩm.",
        results: ["4 nhóm nội dung chính", "Tăng phản hồi tích cực", "Tạo guideline 32 trang"],
        thumbnail: { col: 1, row: 1 },
      },
      {
        id: "back-to-school",
        fieldId: "social-planner",
        title: "Back To School",
        eyebrow: "Dự án",
        category: "Chiến dịch",
        summary: "Chiến dịch khai giảng cho sản phẩm học đường.",
        client: "Bright Class",
        year: "2023",
        scope: ["Campaign Planning", "Key Visual Direction", "Social Content"],
        overview:
          "Chiến dịch khai giảng lấy cảm hứng từ cảm giác háo hức chuẩn bị năm học mới.",
        objective:
          "Tạo nhu cầu mua sắm đầu mùa bằng cảm xúc tích cực thay vì chỉ dựa vào ưu đãi.",
        solution:
          "Kết hợp câu chuyện chuẩn bị của gia đình, checklist hữu ích và nội dung tương tác cho học sinh.",
        results: ["Tăng click đến landing page", "5 định dạng nội dung", "Tạo bộ thông điệp khuyến mãi"],
        thumbnail: { col: 2, row: 1 },
      },
      {
        id: "brand-story",
        fieldId: "creative-copywriter",
        title: "Brand Story",
        eyebrow: "Dự án",
        category: "Brand Story",
        summary: "Câu chuyện thương hiệu cho dòng sản phẩm chăm sóc da thảo mộc.",
        client: "XYZ Skincare",
        year: "2024",
        scope: ["Brand Story", "Website Copy", "Key Messages"],
        overview:
          "Dự án viết lại câu chuyện thương hiệu từ góc nhìn nguyên liệu, nhịp sống chậm và sự chăm sóc dịu dàng.",
        objective:
          "Giúp thương hiệu có một câu chuyện rõ ràng, khác biệt và dễ mở rộng sang nhiều kênh.",
        solution:
          "Xây dựng hệ thông điệp theo ba tầng: nguồn gốc, cảm nhận sản phẩm và lời hứa chăm sóc.",
        results: ["Hoàn thiện brand story", "12 thông điệp chủ đạo", "Tạo website copy framework"],
        thumbnail: { col: 0, row: 0 },
      },
      {
        id: "axe",
        fieldId: "creative-copywriter",
        title: "AXE",
        eyebrow: "Dự án",
        category: "Campaign",
        summary: "Một case campaign đậm chất proposal, tập trung vào attraction, confidence và visual storytelling.",
        client: "AXE",
        year: "2024",
        scope: ["Big Idea", "Campaign Proposal", "Creative Copy"],
        overview: AXE_CONTEXT,
        objective:
          "Làm cho trang case study có cảm giác như một proposal deck hoàn chỉnh thay vì bài viết nhiều chữ.",
        solution:
          "Dùng cover lớn, một trang summary riêng và carousel sẵn sàng nhận ảnh upload cho full proposal.",
        results: ["Trang detail thiên về hình ảnh", "Cấu trúc media sẵn sàng upload", "Carousel proposal"],
        thumbnail: { col: 1, row: 0 },
        media: AXE_PROJECT_MEDIA,
      },
      {
        id: "tvc-script",
        fieldId: "creative-copywriter",
        title: "TVC Script",
        eyebrow: "Dự án",
        category: "Content",
        summary: "Kịch bản TVC ngắn cho sản phẩm đời sống.",
        client: "Home Light",
        year: "2024",
        scope: ["Script", "VO", "Scene Beat"],
        overview:
          "Kịch bản kể về một khoảnh khắc đời thường được soi sáng bằng chi tiết nhỏ và lời thoại tiết chế.",
        objective:
          "Tạo kịch bản ngắn gọn, dễ sản xuất và có điểm nhớ cảm xúc.",
        solution: "Dựng nhịp ba hồi trong 30 giây: thiếu vắng, xuất hiện, ấm lại.",
        results: ["2 bản script", "Shot beat rõ ràng", "VO dễ thu âm"],
        thumbnail: { col: 2, row: 0 },
      },
      {
        id: "print-ad",
        fieldId: "creative-copywriter",
        title: "Print Ad",
        eyebrow: "Dự án",
        category: "Campaign",
        summary: "Headline và body copy cho bộ quảng cáo in.",
        client: "Mộc Market",
        year: "2023",
        scope: ["Headline", "Body Copy", "Message Matrix"],
        overview:
          "Bộ quảng cáo tập trung vào cảm giác chạm vào nguyên liệu thật và lựa chọn chậm rãi.",
        objective:
          "Tạo headline ngắn, có hình ảnh và phù hợp với nhịp đọc của ấn phẩm in.",
        solution:
          "Phát triển nhiều lớp câu chữ từ trực diện đến giàu ẩn dụ, sau đó chọn hướng cân bằng nhất.",
        results: ["18 headline options", "4 mẫu body copy", "Thông điệp nhất quán"],
        thumbnail: { col: 0, row: 1 },
      },
      {
        id: "website-copy",
        fieldId: "creative-copywriter",
        title: "Website Copy",
        eyebrow: "Dự án",
        category: "Content",
        summary: "Nội dung website cho dịch vụ sáng tạo boutique.",
        client: "Atelier Nine",
        year: "2023",
        scope: ["Landing Copy", "UX Writing", "CTA System"],
        overview:
          "Dự án tinh chỉnh ngôn ngữ website để thương hiệu nghe rõ ràng, cao cấp nhưng không xa cách.",
        objective:
          "Tăng độ rõ của đề xuất giá trị và giúp người xem đi từ tò mò đến liên hệ.",
        solution:
          "Viết lại cấu trúc nội dung theo từng lớp: lời hứa, bằng chứng, quy trình và lời mời.",
        results: ["Hoàn thiện landing copy", "CTA thống nhất", "Giảm đoạn copy dư thừa"],
        thumbnail: { col: 1, row: 1 },
      },
      {
        id: "slogan-series",
        fieldId: "creative-copywriter",
        title: "Slogan Series",
        eyebrow: "Dự án",
        category: "Brand Story",
        summary: "Chuỗi slogan theo mùa cho thương hiệu hạt giống.",
        client: "Seed Garden",
        year: "2023",
        scope: ["Slogan", "Tone System", "Seasonal Copy"],
        overview:
          "Chuỗi slogan nối hình ảnh gieo trồng với cảm giác bắt đầu lại của người trẻ.",
        objective:
          "Tạo bộ câu ngắn dễ nhớ, có thể dùng linh hoạt trên social, bao bì và activation.",
        solution:
          "Khai thác ẩn dụ hạt giống như một lời hứa nhỏ, rồi phát triển thành nhiều biến thể theo mùa.",
        results: ["24 slogan options", "6 câu được chọn", "Tone mềm mại nhưng rõ nét"],
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
        imageAlt: "Bìa portfolio Cổ tích Việt Nam cho dân sáng tạo - Tâm Sắc Bén",
        nextAria: "Cuộn đến trang giới thiệu",
        nextLabel: "Lật trang",
      },
      fields: {
        heading: "Lĩnh vực hoạt động",
        body:
          "Mỗi nhánh là một trang truyện riêng, cùng đi về một cách kể thương hiệu rõ ràng và có cảm xúc.",
        lockedPrompt: "Chọn một lĩnh vực để mở trang dự án",
        unlockedPrompt: "Cuộn tiếp hoặc chọn lĩnh vực khác",
      },
      gallery: {
        lockedEyebrow: "Trang lĩnh vực",
        lockedTitle: "Chọn một lĩnh vực trước",
        lockedBody:
          "Danh mục dự án sẽ mở ra sau khi bạn chọn The Thinking hoặc The Making.",
        lockedAction: "Quay lại Lĩnh vực",
        back: "Quay lại",
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
    eyebrow: "Unfold My Myth",
    title: "The Story Behind Minh Tam",
    lead:
      "Every fairytale has a strange little beginning. Mine starts with curiosity, creative work, and the decision to build happiness through the career I care about.",
    intro:
      "I do not wait for a fairy godmother to hand me a better chapter. I collect questions, sharpen my craft, and keep showing up with a sense of responsibility for the people and brands that trust me.",
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
    closingTitle: "That is my well-being",
    closingBody:
      "Career goals are not only milestones to chase. For me, they are a way to become more capable, more useful, and more honest in the stories I help bring to life.",
    portfolioLabel: "Back to Portfolio",
    imageAlt: "Minh Tam smiling among large green leaves",
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
