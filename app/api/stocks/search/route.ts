import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getJapaneseName } from "@/lib/popular-stocks";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

interface SearchResult {
  symbol: string;
  name: string;
  nameEn: string;
  type: string;
  exchange: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const results = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    });

    const stocks: SearchResult[] = (results.quotes || [])
      .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "INDEX" || q.quoteType === "ETF")
      .map((q) => {
        const symbol = q.symbol as string;
        const englishName = (q.shortname || q.longname || q.symbol) as string;
        return {
          symbol,
          name: getJapaneseName(symbol, englishName),
          nameEn: englishName,
          type: (q.quoteType || "EQUITY") as string,
          exchange: (q.exchange || "") as string,
        };
      });

    return NextResponse.json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search stocks",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
