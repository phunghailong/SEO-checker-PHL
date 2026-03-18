import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "longphung.com@gmail.com";
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  try {
    const { email, url, score } = await req.json();

    if (!email || !url) {
      return NextResponse.json({ error: "Email và URL là bắt buộc" }, { status: 400 });
    }

    // 1. Gửi dữ liệu tới Google Sheets Webhook
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toLocaleString("vi-VN"),
          email,
          url,
          score
        }),
      }).catch(err => console.error("Google Sheets Webhook failed:", err));
    }

    // 2. Gửi email thông báo cho Admin qua Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "SEO & GEO Pro <onboarding@resend.dev>", // Cần verify domain trong Resend để đổi from email
        to: ADMIN_EMAIL,
        subject: `🔥 New Lead: ${url} (Score: ${score})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Có khách hàng mới vừa check SEO!</h2>
            <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
            <p><strong>Email khách:</strong> ${email}</p>
            <p><strong>Điểm SEO:</strong> <span style="font-size: 20px; font-weight: bold; color: #10b981;">${score}</span></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Bản ghi này đã được tự động lưu vào Google Sheets.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, message: "Lead captured successfully" });
  } catch (error) {
    console.error("Lead API Error:", error);
    // Vẫn trả về success để không làm gián đoạn UX khách hàng nếu email/sheets bị lỗi
    return NextResponse.json({ success: true, message: "Processed with background sync" });
  }
}
