import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { StockDataResponse, AnalysisResult } from "@/lib/types";

const analysisSchema = z.object({
  summary: z.string().describe("Overall market summary in Japanese"),
  dailyTrend: z.string().describe("Daily trend analysis in Japanese"),
  weeklyTrend: z.string().describe("Weekly trend analysis in Japanese"),
  monthlyTrend: z.string().describe("Monthly trend analysis in Japanese"),
  keyInsights: z.array(z.string()).describe("Key insights as bullet points in Japanese"),
  recommendations: z.array(z.string()).describe("Investment recommendations in Japanese"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stockData, historicalData } = body as {
      stockData: StockDataResponse;
      historicalData?: Record<string, unknown>;
    };

    if (!stockData) {
      return NextResponse.json(
        { success: false, error: "Stock data is required" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // Prepare data summary for AI
    const dataSummary = prepareDataSummary(stockData, historicalData);

    // Generate analysis using AI SDK
    const { object: analysis } = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: analysisSchema,
      prompt: `
あなたは金融アナリストです。以下の株式市場データを分析し、日本語で詳細なレポートを作成してください。

## 現在の市場データ:
${dataSummary}

## 分析要件:
1. 全体的な市場サマリー（日経平均とS&P500の動向を含む）
2. 日次の傾向分析
3. 週次の傾向分析
4. 月次の傾向分析
5. 重要な洞察（3-5点）
6. 投資に関する推奨事項（3-5点）

注意: データに基づいた客観的な分析を行い、投資アドバイスは一般的な情報提供として扱ってください。
      `.trim(),
    });

    const result: AnalysisResult = {
      ...analysis,
      generatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error analyzing stock data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze stock data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function prepareDataSummary(
  stockData: StockDataResponse,
  historicalData?: Record<string, unknown>
): string {
  const lines: string[] = [];

  // Indices
  lines.push("### 主要指数");
  if (stockData.indices.nikkei225) {
    const n = stockData.indices.nikkei225;
    lines.push(
      `- 日経平均: ${n.value.toLocaleString()}円 (${n.change >= 0 ? "+" : ""}${n.change.toFixed(2)}, ${n.changePercent >= 0 ? "+" : ""}${n.changePercent.toFixed(2)}%)`
    );
  }
  if (stockData.indices.sp500) {
    const s = stockData.indices.sp500;
    lines.push(
      `- S&P 500: ${s.value.toLocaleString()} (${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}, ${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%)`
    );
  }

  // GAFAM stocks
  lines.push("\n### GAFAM株価");
  for (const stock of stockData.gafam) {
    lines.push(
      `- ${stock.name} (${stock.symbol}): $${stock.price.toFixed(2)} (${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}, ${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%)`
    );
    if (stock.marketCap) {
      lines.push(`  時価総額: $${(stock.marketCap / 1e12).toFixed(2)}兆`);
    }
  }

  // Historical summary if available
  if (historicalData) {
    lines.push("\n### 履歴データあり（傾向分析に使用）");
  }

  lines.push(`\n### データ取得日時: ${stockData.timestamp}`);

  return lines.join("\n");
}
