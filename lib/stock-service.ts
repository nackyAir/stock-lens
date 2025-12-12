import YahooFinance from "yahoo-finance2";
import type {
  StockQuote,
  IndexData,
  HistoricalData,
  StockDataResponse,
} from "./types";
import { getJapaneseName } from "./popular-stocks";

// Create Yahoo Finance instance (required for v3)
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Symbol mappings
const SYMBOLS = {
  // Indices
  NIKKEI_225: "^N225",
  SP_500: "^GSPC",

  // GAFAM stocks
  GAFAM: [
    { symbol: "GOOGL", name: "アルファベット" },
    { symbol: "AAPL", name: "アップル" },
    { symbol: "META", name: "メタ" },
    { symbol: "AMZN", name: "アマゾン" },
    { symbol: "MSFT", name: "マイクロソフト" },
  ],
} as const;

// Type for Yahoo Finance quote response
interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  regularMarketTime?: Date | string | number;
  marketCap?: number;
  currency?: string;
}

export async function getIndexData(symbol: string, customName?: string): Promise<IndexData | null> {
  try {
    const quote = (await yahooFinance.quote(symbol)) as YahooQuote | null;

    if (!quote) return null;

    const englishName = quote.shortName || quote.longName || symbol;
    const name = customName || getJapaneseName(symbol, englishName);

    return {
      symbol: quote.symbol,
      name,
      value: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      timestamp: new Date(quote.regularMarketTime || Date.now()),
    };
  } catch (error) {
    console.error(`Error fetching index data for ${symbol}:`, error);
    return null;
  }
}

export async function getStockQuote(
  symbol: string,
  name: string
): Promise<StockQuote | null> {
  try {
    const quote = (await yahooFinance.quote(symbol)) as YahooQuote | null;

    if (!quote) return null;

    return {
      symbol: quote.symbol,
      name: name,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      currency: quote.currency || "USD",
      timestamp: new Date(quote.regularMarketTime || Date.now()),
    };
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

interface YahooChartQuote {
  date: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
  adjclose?: number | null;
}

export async function getHistoricalData(
  symbol: string,
  period: "1d" | "1wk" | "1mo" | "3mo" = "1mo"
): Promise<HistoricalData[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1d":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "1wk":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1mo":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3mo":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    const result = (await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: period === "1d" ? "5m" : "1d",
    })) as { quotes?: YahooChartQuote[] };

    return ((result.quotes || []) as YahooChartQuote[]).map((quote) => ({
      date: new Date(quote.date),
      open: quote.open || 0,
      high: quote.high || 0,
      low: quote.low || 0,
      close: quote.close || 0,
      volume: quote.volume || 0,
      adjClose: quote.adjclose || quote.close || 0,
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

export async function getAllStockData(): Promise<StockDataResponse> {
  // Fetch indices in parallel
  const [nikkei225, sp500] = await Promise.all([
    getIndexData(SYMBOLS.NIKKEI_225),
    getIndexData(SYMBOLS.SP_500),
  ]);

  // Fetch GAFAM stocks in parallel
  const gafamPromises = SYMBOLS.GAFAM.map(({ symbol, name }) =>
    getStockQuote(symbol, name)
  );
  const gafamResults = await Promise.all(gafamPromises);
  const gafam = gafamResults.filter(
    (stock): stock is StockQuote => stock !== null
  );

  return {
    indices: {
      nikkei225,
      sp500,
    },
    gafam,
    timestamp: new Date(),
  };
}

export { SYMBOLS };
