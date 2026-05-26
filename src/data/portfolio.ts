export type SectionId = "cover" | "about" | "fields" | "gallery" | "detail"

export interface Chapter {
  id: SectionId
  number: string
  label: string
  title: string
  description: string
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
}

export type FieldId = "social-planner" | "creative-copywriter"

export interface Field {
  id: FieldId
  title: string
  shortTitle: string
  description: string
  body: string
  image: string
  sheetImage: string
  accent: "clay" | "moss"
  filters: string[]
}

export const CHAPTERS: Chapter[] = [
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
    description: "Giới thiệu người kể chuyện và cách làm việc.",
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
]

export const AUTHOR = {
  name: "Ngọc",
  title: "Social Planner & Creative Copywriter",
  greeting: "Xin chào!",
  intro:
    "Mình tin mỗi thương hiệu đều có một câu chuyện cần được kể đúng nhịp. Công việc của mình là biến chiến lược thành trải nghiệm rõ ràng, đẹp mắt và có sức lan tỏa.",
  note:
    "Portfolio này được dựng như một cuốn truyện: có mở đầu, thử thách, lựa chọn và những trang dự án để bạn lật xem.",
  image: "/assets/storybook/author.png",
}

export const FIELDS: Field[] = [
  {
    id: "social-planner",
    title: "Social Planner",
    shortTitle: "Social",
    description: "Chiến lược nội dung, lập kế hoạch, kết nối.",
    body:
      "Dành cho những dự án cần mạch nội dung rõ ràng, nhịp chiến dịch chặt chẽ và góc nhìn cộng đồng.",
    image: "/assets/storybook/social-field.png",
    sheetImage: "/assets/storybook/social-projects.png",
    accent: "clay",
    filters: ["Chiến lược", "Chiến dịch", "Kế hoạch nội dung"],
  },
  {
    id: "creative-copywriter",
    title: "Creative Copywriter",
    shortTitle: "Copy",
    description: "Ý tưởng, ngôn từ, cảm xúc, chuyển động.",
    body:
      "Dành cho những dự án cần giọng nói thương hiệu, big idea, nội dung chuyển đổi và thông điệp dễ nhớ.",
    image: "/assets/storybook/copywriter-field.png",
    sheetImage: "/assets/storybook/copywriter-projects.png",
    accent: "moss",
    filters: ["Brand Story", "Campaign", "Content"],
  },
]

export const PROJECTS: Project[] = [
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
    solution:
      "Xây dựng chuỗi bài theo ba cấp độ: hiểu đúng, chọn dễ, nấu nhanh.",
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
    id: "product-campaign",
    fieldId: "creative-copywriter",
    title: "Product Campaign",
    eyebrow: "Dự án",
    category: "Campaign",
    summary: "Big idea và copy cho chiến dịch ra mắt sản phẩm nội thất.",
    client: "Still Chair",
    year: "2024",
    scope: ["Big Idea", "Tagline", "Ad Copy"],
    overview:
      "Chiến dịch biến chiếc ghế thành biểu tượng của khoảng nghỉ giữa ngày bận rộn.",
    objective:
      "Tạo thông điệp ra mắt có tính cảm xúc nhưng vẫn làm nổi bật lợi ích sản phẩm.",
    solution:
      "Viết bộ copy xoay quanh ý niệm ngồi xuống để nghe mình rõ hơn.",
    results: ["3 hướng tagline", "10 mẫu ad copy", "1 key message system"],
    thumbnail: { col: 1, row: 0 },
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
    solution:
      "Dựng nhịp ba hồi trong 30 giây: thiếu vắng, xuất hiện, ấm lại.",
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
]

export function getField(fieldId: FieldId) {
  return FIELDS.find((field) => field.id === fieldId) ?? FIELDS[0]
}

export function getProjectsByField(fieldId: FieldId) {
  return PROJECTS.filter((project) => project.fieldId === fieldId)
}
