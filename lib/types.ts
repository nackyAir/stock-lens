// Stock data types
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  currency: string;
  timestamp: Date;
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface StockDataResponse {
  indices: {
    nikkei225: IndexData | null;
    sp500: IndexData | null;
  };
  gafam: StockQuote[];
  timestamp: Date;
}

export interface AnalysisResult {
  summary: string;
  dailyTrend: string;
  weeklyTrend: string;
  monthlyTrend: string;
  keyInsights: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface EmailPayload {
  to: string;
  subject: string;
  stockData: StockDataResponse;
  analysis: AnalysisResult;
}
