import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import StockReportEmail from "@/emails/stock-report";
import type { StockDataResponse, AnalysisResult } from "@/lib/types";

// 時間帯に応じた挨拶を生成
function generateGreeting(): { greeting: string; personalMessage: string } {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let greeting: string;
  let personalMessage: string;

  if (hour >= 5 && hour < 10) {
    greeting = "おはようございます";
    if (isWeekend) {
      personalMessage = "週末の朝、ゆっくりとお過ごしでしょうか。本日の市場レポートをお届けいたします。";
    } else {
      personalMessage = "本日も素敵な一日になりますように。市場の動きをまとめてお届けいたします。";
    }
  } else if (hour >= 10 && hour < 12) {
    greeting = "おはようございます";
    personalMessage = "午前中の市場の動きをお伝えいたします。";
  } else if (hour >= 12 && hour < 15) {
    greeting = "こんにちは";
    personalMessage = "お昼のひととき、本日の市場状況をご確認ください。";
  } else if (hour >= 15 && hour < 18) {
    greeting = "こんにちは";
    personalMessage = "本日の市場の動きをまとめてお届けいたします。";
  } else if (hour >= 18 && hour < 21) {
    greeting = "こんばんは";
    personalMessage = "本日もお疲れさまでした。一日の市場をふりかえります。";
  } else {
    greeting = "こんばんは";
    personalMessage = "夜分遅くに失礼いたします。本日の市場レポートをお届けいたします。";
  }

  return { greeting, personalMessage };
}

// 親しみやすいメールの件名を生成
function generateSubject(reportDate: string): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return `おはようございます。${reportDate}の市場レポートです`;
  } else if (hour >= 12 && hour < 18) {
    return `${reportDate}の市場レポートをお届けします`;
  } else {
    return `本日もお疲れさまでした。${reportDate}の市場まとめ`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, stockData, analysis } = body as {
      to: string;
      stockData: StockDataResponse;
      analysis: AnalysisResult;
    };

    // Validate required fields
    if (!to || !stockData || !analysis) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, stockData, analysis" },
        { status: 400 }
      );
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: "Resend API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Generate report date (日本語で読みやすい形式)
    const reportDate = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

    // 時間帯に応じた挨拶を生成
    const { greeting, personalMessage } = generateGreeting();

    // Render React Email to HTML
    const emailHtml = await render(
      StockReportEmail({
        stockData,
        analysis,
        reportDate,
        greeting,
        personalMessage,
      })
    );

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Stock Lens <onboarding@resend.dev>",
      to: [to],
      subject: generateSubject(reportDate),
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
      emailId: data?.id,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
