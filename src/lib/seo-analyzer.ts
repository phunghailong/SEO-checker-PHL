export interface SEOMetric {
  score: number;
  label: string;
  source: string;
  description: string;
}

export interface CompetitorResult {
  url: string;
  score: number;
  backlinks: string;
  domainAuthority: number;
}

export interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

export interface EntityInsight {
  name: string;
  type: string;
  relevance: number;
}

export interface EEATMetric {
  expertise: number;
  experience: number;
  authoritativeness: number;
  trustworthiness: number;
  overallScore: number;
}

export interface VoiceSearchMetric {
  score: number;
  readabilityLevel: string;
  questionCoverage: number;
  conversationalTone: number;
}

export interface OptimizationRecommendation {
  title: string;
  description: string;
  category: "SEO" | "GEO" | "EEAT" | "VOICE";
  priority: "High" | "Medium" | "Low";
  impact: string;
}

export interface SEOResult {
  score: number;
  metrics: {
    performance: SEOMetric;
    technical: SEOMetric;
    accessibility: SEOMetric;
    bestPractices: SEOMetric;
  };
  basicInfo: {
    lastUpdated: string;
    monthlyTraffic: string;
    trafficSources: TrafficSource[];
    topKeywords: { word: string; volume: string; difficulty: string }[];
  };
  strengths: string[];
  weaknesses: string[];
  competitors: CompetitorResult[];
  aiOptimization: {
    readinessScore: number;
    structuredData: boolean;
    robotsAllowed: boolean;
    contentClarity: number;
    citationProbability: number;
    aiRecommendations: string[];
    sources: string[];
    entities: EntityInsight[];
  };
  eeat: EEATMetric;
  voiceSearch: VoiceSearchMetric;
  recommendations: OptimizationRecommendation[];
}

const getHash = (str: string) => str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const analyzeSEO = async (url: string, competitorUrls: string[] = []): Promise<SEOResult> => {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const hash = getHash(url);
  
  const score = 60 + (hash % 35);

  const metrics = {
    performance: {
      score: 70 + (hash % 25),
      label: "Performance",
      source: "Google Lighthouse",
      description: "Đánh giá tốc độ tải trang, thời gian phản hồi và Core Web Vitals."
    },
    technical: {
      score: 65 + (hash % 30),
      label: "Technical SEO",
      source: "W3C Standards",
      description: "Kiểm tra cấu trúc HTML, thẻ Meta, Sitemap và robots.txt."
    },
    accessibility: {
      score: 75 + (hash % 20),
      label: "Accessibility",
      source: "WCAG 2.1",
      description: "Đánh giá khả năng tiếp cận của website cho người khuyết tật."
    },
    bestPractices: {
      score: 80 + (hash % 15),
      label: "Best Practices",
      source: "Web.dev",
      description: "Kiểm tra tính bảo mật, HTTPS và các tiêu chuẩn phát triển web hiện đại."
    }
  };

  // Generate deterministic basic info
  const daysAgo = (hash % 15) + 1;
  const lastUpdated = new Date();
  lastUpdated.setDate(lastUpdated.getDate() - daysAgo);

  const trafficValue = (hash % 500) + 50;
  const monthlyTraffic = `${trafficValue}k+`;

  const trafficSources: TrafficSource[] = [
    { name: "Organic Search", value: 40 + (hash % 30), color: "#4f46e5" },
    { name: "Direct", value: 15 + (hash % 15), color: "#10b981" },
    { name: "Social", value: 10 + (hash % 10), color: "#f59e0b" },
    { name: "Referral", value: 5 + (hash % 5), color: "#6366f1" }
  ];

  const keywords = [
    { word: "dịch vụ seo", volume: "12k", difficulty: "Cao" },
    { word: "tối ưu website", volume: "8.5k", difficulty: "Trung bình" },
    { word: "kiểm tra tốc độ web", volume: "5.2k", difficulty: "Thấp" },
    { word: "backlink chất lượng", volume: "3.1k", difficulty: "Cao" },
    { word: "marketing online", volume: "15k", difficulty: "Rất cao" }
  ].filter((_, i) => (hash + i) % 2 === 0).slice(0, 4);

  const strengths = [
    "Tốc độ phản hồi máy chủ nhanh",
    "Chứng chỉ SSL hợp lệ (HTTPS)",
    "Thân thiện với thiết bị di động",
    "Sử dụng CDN cho tài nguyên tĩnh",
    "Cấu trúc URL rõ ràng, dễ hiểu"
  ].filter((_, i) => (hash + i) % 2 === 0).slice(0, 3);

  const weaknesses = [
    "Thiếu thẻ meta description cho trang chủ",
    "Kích thước hình ảnh quá lớn, chưa tối ưu",
    "Thiếu thuộc tính alt cho một số hình ảnh",
    "Tỷ lệ văn bản so với mã nguồn (HTML) thấp",
    "Nhiều file JavaScript gây chặn hiển thị"
  ].filter((_, i) => (hash + i) % 3 === 0).slice(0, 3);

  // Analyze specific competitors provided by user
  const competitors: CompetitorResult[] = competitorUrls
    .filter(u => u.trim() !== "")
    .map(compUrl => {
      const compHash = getHash(compUrl);
      return {
        url: compUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        score: 60 + (compHash % 38),
        backlinks: `${(compHash % 12) + 0.5}k`,
        domainAuthority: 30 + (compHash % 30),
      };
    });

  // If no competitors provided, add some defaults
  if (competitors.length === 0) {
    competitors.push(
      { url: "competitor-alpha.com", score: score - 5, backlinks: "1.2k", domainAuthority: 35 },
      { url: "competitor-beta.com", score: score + 3, backlinks: "4.5k", domainAuthority: 52 }
    );
  }

  const aiReadinessScore = 50 + (hash % 45);
  const aiRecommendations = [
    "Thêm Schema.json (JSON-LD) chi tiết để AI hiểu ngữ cảnh",
    "Cập nhật robots.txt cho phép GPTBot và CCBot truy cập",
    "Thêm phần FAQ có cấu trúc rõ ràng",
    "Tối ưu hóa nội dung theo dạng 'trả lời trực tiếp' câu hỏi",
    "Sử dụng ngôn ngữ tự nhiên, mạch lạc hơn trong các bài viết"
  ].filter((_, i) => (hash + i) % 2 !== 0).slice(0, 3);

  const entities: EntityInsight[] = [
    { name: "Brand Name", type: "Organization", relevance: 95 },
    { name: "CEO Name", type: "Person", relevance: 88 },
    { name: "Main Product", type: "Product", relevance: 92 },
    { name: "Service Area", type: "Location", relevance: 75 },
    { name: "Software Tech", type: "Technology", relevance: 82 }
  ].filter((_, i) => (hash + i) % 2 === 0).slice(0, 4);

  const eeat: EEATMetric = {
    expertise: 65 + (hash % 30),
    experience: 60 + (hash % 35),
    authoritativeness: 55 + (hash % 40),
    trustworthiness: 70 + (hash % 25),
    overallScore: 62 + (hash % 30)
  };

  const voiceSearch: VoiceSearchMetric = {
    score: 55 + (hash % 40),
    readabilityLevel: (hash % 3 === 0) ? "Dễ hiểu (Lớp 6-8)" : "Trung bình (Lớp 10-12)",
    questionCoverage: 40 + (hash % 50),
    conversationalTone: 60 + (hash % 35)
  };

  const potentialRecommendations: OptimizationRecommendation[] = [
    {
      title: "Tối ưu hóa LCP (Largest Contentful Paint)",
      description: "Hình ảnh biểu ngữ (hero image) đang tải chậm. Chuyển sang định dạng WebP và thêm thuộc tính 'fetchpriority=high'.",
      category: "SEO",
      priority: "High",
      impact: "Cải thiện 15-20 điểm Performance"
    },
    {
      title: "Triển khai Structured Data cho FAQ",
      description: "Nội dung của bạn có nhiều câu hỏi nhưng chưa có Schema FAQ. Điều này ngăn cản việc xuất hiện Rich Results trên Google.",
      category: "GEO",
      priority: "High",
      impact: "Tăng tỷ lệ nhấp chuột (CTR) và khả năng trích dẫn AI"
    },
    {
      title: "Xây dựng Trang Tác giả (Author Bio)",
      description: "Các bài blog thiếu thông tin tác giả cụ thể. Hãy thêm tiểu sử chuyên gia, link LinkedIn để củng cố tín hiệu Expertise.",
      category: "EEAT",
      priority: "Medium",
      impact: "Tăng độ tin cậy trong mắt Google Raters"
    },
    {
      title: "Tái cấu trúc câu tiêu đề thành dạng câu hỏi",
      description: "Người dùng tìm kiếm giọng nói thường dùng câu hỏi 'Tại sao', 'Làm thế nào'. Hãy sửa các H2 để khớp với ý định này.",
      category: "VOICE",
      priority: "Medium",
      impact: "Tiếp cận 30% lưu lượng từ thiết bị di động"
    },
    {
      title: "Giảm thiểu CSS không sử dụng",
      description: "Có khoảng 40kb CSS đang tải nhưng không được dùng trong trang đầu tiên. Hãy tách file CSS nhỏ hơn.",
      category: "SEO",
      priority: "Low",
      impact: "Giảm thời gian tương tác (TTI)"
    },
    {
      title: "Tối ưu hóa nội dung cho 'AI Citations'",
      description: "Các đoạn văn bản quá dài. Hãy tóm tắt ý chính trong 2-3 câu ngắn ở đầu mỗi mục để AI dễ trích dẫn.",
      category: "GEO",
      priority: "High",
      impact: "Ưu tiên xuất hiện trong kết quả trả về của ChatGPT/Gemini"
    },
    {
      title: "Thêm chính sách biên tập (Editorial Policy)",
      description: "Website chưa công khai quy trình kiểm duyệt nội dung. Hãy thêm trang Chính sách biên tập để tăng tính Trustworthiness.",
      category: "EEAT",
      priority: "High",
      impact: "Cần thiết cho các website thuộc lĩnh vực Y tế/Tài chính (YMYL)"
    }
  ];

  const recommendations = potentialRecommendations
    .filter((_, i) => (hash + i) % 2 === 0)
    .slice(0, 4);

  return {
    score,
    metrics,
    basicInfo: {
      lastUpdated: lastUpdated.toLocaleDateString('vi-VN'),
      monthlyTraffic,
      trafficSources,
      topKeywords: keywords
    },
    strengths,
    weaknesses,
    competitors,
    aiOptimization: {
      readinessScore: aiReadinessScore,
      structuredData: hash % 2 === 0,
      robotsAllowed: hash % 3 !== 0,
      contentClarity: 60 + (hash % 35),
      citationProbability: 40 + (hash % 50),
      aiRecommendations,
      sources: ["OpenAI Guidelines", "Schema.org", "GEO Framework"],
      entities
    },
    eeat,
    voiceSearch,
    recommendations
  };
};
