import { NextResponse } from "next/server";
import {
  getAllStockData,
  getHistoricalData,
  getStockQuote,
  getIndexData,
  SYMBOLS,
} from "@/lib/stock-service";
import type { StockQuote, IndexData } from "@/lib/types";

// GET: Default stock data (backwards compatible)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";
    const period =
      (searchParams.get("period") as "1d" | "1wk" | "1mo" | "3mo") || "1mo";

    // Get current stock data
    const stockData = await getAllStockData();

    // Optionally include historical data for trend analysis
    let historicalData = null;
    if (includeHistory) {
      const [nikkeiHistory, sp500History, ...gafamHistory] = await Promise.all([
        getHistoricalData(SYMBOLS.NIKKEI_225, period),
        getHistoricalData(SYMBOLS.SP_500, period),
        ...SYMBOLS.GAFAM.map(({ symbol }) => getHistoricalData(symbol, period)),
      ]);

      historicalData = {
        nikkei225: nikkeiHistory,
        sp500: sp500History,
        gafam: SYMBOLS.GAFAM.reduce(
          (acc, { symbol }, index) => {
            acc[symbol] = gafamHistory[index];
            return acc;
          },
          {} as Record<string, typeof nikkeiHistory>
        ),
      };
    }

    return NextResponse.json({
      success: true,
      data: stockData,
      historicalData,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Custom stock selection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbols } = body as { symbols: { symbol: string; name: string }[] };

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { success: false, error: "symbols array is required" },
        { status: 400 }
      );
    }

    // Limit to 20 symbols
    const limitedSymbols = symbols.slice(0, 20);

    // Separate indices from stocks
    const indices: (IndexData | null)[] = [];
    const stocks: (StockQuote | null)[] = [];

    // Fetch all data in parallel
    const results = await Promise.all(
      limitedSymbols.map(async ({ symbol, name }) => {
        // Check if it's an index (starts with ^)
        if (symbol.startsWith("^")) {
          const data = await getIndexData(symbol, name);
          return { type: "index" as const, data };
        } else {
          const data = await getStockQuote(symbol, name);
          return { type: "stock" as const, data };
        }
      })
    );

    // Separate results
    results.forEach((result) => {
      if (result.type === "index") {
        indices.push(result.data);
      } else {
        stocks.push(result.data);
      }
    });

    const validIndices = indices.filter((i): i is IndexData => i !== null);
    const validStocks = stocks.filter((s): s is StockQuote => s !== null);

    return NextResponse.json({
      success: true,
      data: {
        indices: validIndices,
        stocks: validStocks,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching custom stock data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
