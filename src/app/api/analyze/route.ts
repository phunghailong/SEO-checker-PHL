import { NextRequest, NextResponse } from "next/server";
import { analyzeSEO, SEOResult } from "@/lib/seo-analyzer";

// --- SIMPLE SERVER-SIDE CACHE & RATE LIMITER (FOR FREE TIER WITHOUT DB) ---
// Note: In Vercel serverless, these are reset on cold starts.
// For production, use Redis (Vercel KV) or Supabase.
const cache = new Map<string, { data: SEOResult; timestamp: number }>();
const rateLimit = new Map<string, { count: number; date: string }>();

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_REQUESTS_PER_DAY = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { url, competitors } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // 1. RATE LIMITING CHECK
  const today = new Date().toISOString().split("T")[0];
  const userLimit = rateLimit.get(ip);

  if (userLimit && userLimit.date === today) {
    if (userLimit.count >= MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        { error: `Bạn đã đạt giới hạn ${MAX_REQUESTS_PER_DAY} lượt check/ngày. Hãy quay lại vào ngày mai!` },
        { status: 429 }
      );
    }
    rateLimit.set(ip, { count: userLimit.count + 1, date: today });
  } else {
    rateLimit.set(ip, { count: 1, date: today });
  }

  // 2. CACHE CHECK
  const cacheKey = `${url}-${(competitors || []).sort().join(",")}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for ${url}`);
    return NextResponse.json({
      ...cached.data,
      _meta: { 
        ...cached.data._meta, 
        cached: true,
        timestamp: cached.timestamp,
        ip: cached.data._meta?.ip || "unknown"
      }
    });
  }

  try {
    // 3. ANALYZE (In a real app, this would call PageSpeed Insights API)
    // For now, we use our refined analyzer logic but executed on the server.
    const result = await analyzeSEO(url, competitors);

    // 4. SAVE TO CACHE
    const responseData = {
      ...result,
      _meta: {
        cached: false,
        timestamp: Date.now(),
        ip: ip.split(",")[0].trim() // Privacy-safe IP (first hop only)
      }
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    // Manage cache size (keep only last 100)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Analysis API failed:", error);
    return NextResponse.json({ error: "Phân tích thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}
