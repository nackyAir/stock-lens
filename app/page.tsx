"use client";

import { useState, useEffect, useCallback } from "react";
import { PRESET_CATEGORIES, type StockPreset } from "@/lib/popular-stocks";
import type { AnalysisResult, StockQuote, IndexData } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  X,
  Mail,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Step = "select" | "fetching" | "analyzing" | "ready" | "sending" | "sent";

interface SearchResult {
  symbol: string;
  name: string;
  nameEn: string;
  type: string;
  exchange: string;
}

interface CustomStockData {
  indices: IndexData[];
  stocks: StockQuote[];
  timestamp: Date;
}

export default function Dashboard() {
  const [step, setStep] = useState<Step>("select");
  const [selectedStocks, setSelectedStocks] = useState<StockPreset[]>([]);
  const [stockData, setStockData] = useState<CustomStockData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchStocks]);

  const toggleStock = (stock: StockPreset) => {
    setSelectedStocks((prev) => {
      const exists = prev.some((s) => s.symbol === stock.symbol);
      if (exists) {
        return prev.filter((s) => s.symbol !== stock.symbol);
      }
      if (prev.length >= 20) {
        return prev;
      }
      return [...prev, stock];
    });
  };

  const addFromSearch = (result: SearchResult) => {
    const stock: StockPreset = {
      symbol: result.symbol,
      name: result.name,
      category: result.type,
    };
    if (
      !selectedStocks.some((s) => s.symbol === stock.symbol) &&
      selectedStocks.length < 20
    ) {
      setSelectedStocks((prev) => [...prev, stock]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const fetchStockData = async () => {
    if (selectedStocks.length === 0) return;

    setStep("fetching");
    setError(null);

    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: selectedStocks.map((s) => ({
            symbol: s.symbol,
            name: s.name,
          })),
        }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stock data");
      }

      setStockData(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      setStep("select");
      throw err;
    }
  };

  const analyzeData = async (data: CustomStockData) => {
    setStep("analyzing");

    try {
      const analysisPayload = {
        stockData: {
          indices: {
            nikkei225: data.indices.find((i) => i.symbol === "^N225") || null,
            sp500: data.indices.find((i) => i.symbol === "^GSPC") || null,
          },
          gafam: data.stocks,
          timestamp: data.timestamp,
          allIndices: data.indices,
          allStocks: data.stocks,
        },
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisPayload),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to analyze data");
      }

      setAnalysis(result.data);
      setStep("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze data");
      setStep("select");
    }
  };

  const handleFetchAndAnalyze = async () => {
    try {
      const data = await fetchStockData();
      if (data) {
        await analyzeData(data);
      }
    } catch {
      // Error already handled
    }
  };

  const handleSendEmail = async () => {
    if (!email || !stockData || !analysis) return;

    setStep("sending");
    setError(null);

    try {
      const emailPayload = {
        to: email,
        stockData: {
          indices: {
            nikkei225:
              stockData.indices.find((i) => i.symbol === "^N225") || null,
            sp500: stockData.indices.find((i) => i.symbol === "^GSPC") || null,
          },
          gafam: stockData.stocks,
          timestamp: stockData.timestamp,
        },
        analysis,
      };

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
      setStep("ready");
    }
  };

  const reset = () => {
    setStep("select");
    setStockData(null);
    setAnalysis(null);
    setError(null);
  };

  const formatNumber = (num: number, decimals = 2) =>
    num.toLocaleString("ja-JP", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <span
        className={`inline-flex items-center gap-1 ${
          isPositive ? "text-emerald-600" : "text-red-600"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {isPositive ? "+" : ""}
        {formatNumber(change)} ({isPositive ? "+" : ""}
        {formatNumber(percent)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Stock Lens</span>
          </div>
          <span className="mx-3 h-4 w-px bg-border hidden sm:block" />
          <p className="text-sm text-muted-foreground hidden sm:block">
            毎日の市場をわかりやすく
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Stock Selection */}
        {step === "select" && (
          <div className="space-y-8">
            {/* Search */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  気になる銘柄を探す
                </CardTitle>
                <CardDescription className="text-sm">
                  会社名やティッカーシンボルで検索できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="例: Apple, AAPL, トヨタ, 7203.T"
                    className="h-10 pr-10 bg-white"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {searchResults.length > 0 && (
                    <Card className="absolute z-10 mt-2 w-full shadow-lg border-border/60">
                      <ScrollArea className="max-h-72">
                        {searchResults.map((result, index) => (
                          <div key={result.symbol}>
                            <button
                              onClick={() => addFromSearch(result)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {result.symbol}
                                  </span>
                                  <span className="text-sm text-muted-foreground">{result.name}</span>
                                </div>
                                {result.name !== result.nameEn && (
                                  <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                                    {result.nameEn}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                                {result.type}
                              </Badge>
                            </button>
                            {index < searchResults.length - 1 && <Separator />}
                          </div>
                        ))}
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Stocks */}
            {selectedStocks.length > 0 && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">チェックしている銘柄</CardTitle>
                      <CardDescription className="text-sm">
                        {selectedStocks.length}銘柄を選んでいます（最大20銘柄まで）
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStocks([])}
                      className="text-muted-foreground hover:text-destructive text-xs h-8"
                    >
                      すべて取り消す
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedStocks.map((stock) => (
                      <Badge
                        key={stock.symbol}
                        variant="default"
                        className="gap-1.5 pl-3 pr-1.5 py-1.5 text-sm font-normal"
                      >
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-xs opacity-75">{stock.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-0.5 hover:bg-primary-foreground/20 rounded-full"
                          onClick={() => toggleStock(stock)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preset Categories */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">よく見られている銘柄</CardTitle>
                <CardDescription className="text-sm">
                  カテゴリーから選んで追加できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="indices">
                  <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
                    {PRESET_CATEGORIES.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {PRESET_CATEGORIES.map((category) => (
                    <TabsContent key={category.id} value={category.id}>
                      <div className="flex flex-wrap gap-2">
                        {category.stocks.map((stock) => {
                          const isSelected = selectedStocks.some(
                            (s) => s.symbol === stock.symbol
                          );
                          return (
                            <Button
                              key={stock.symbol}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleStock(stock)}
                              className={`h-auto py-2 px-3 text-sm font-normal ${
                                !isSelected && "border-border/60 hover:bg-muted/50"
                              }`}
                            >
                              <span className="font-medium">
                                {stock.symbol}
                              </span>
                              <span className="ml-1.5 text-xs opacity-70">
                                {stock.name.length > 10
                                  ? stock.name.slice(0, 10) + "..."
                                  : stock.name}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleFetchAndAnalyze}
                disabled={selectedStocks.length === 0}
                className="h-12 px-10 text-base font-medium shadow-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                この銘柄を分析する（{selectedStocks.length}銘柄）
              </Button>
              {selectedStocks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  まずは気になる銘柄を選んでください
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading States */}
        {(step === "fetching" || step === "analyzing") && (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-base font-medium">
                  {step === "fetching" && "最新の株価を取得しています..."}
                  {step === "analyzing" && "AIが分析しています..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {selectedStocks.length}銘柄の情報を集めています。少々お待ちください。
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2.5 mt-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {(step === "ready" || step === "sending" || step === "sent") &&
          stockData &&
          analysis && (
            <div className="space-y-8">
              {/* Indices */}
              {stockData.indices.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">主な株価指数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {stockData.indices.map((index) => (
                        <div
                          key={index.symbol}
                          className="rounded-lg border border-border/60 bg-muted/30 p-4"
                        >
                          <p className="text-sm text-muted-foreground">
                            {index.name}
                          </p>
                          <p className="text-xl font-semibold mt-1 tracking-tight">
                            {formatNumber(index.value, 0)}
                          </p>
                          <div className="mt-1.5 text-sm">
                            {formatChange(index.change, index.changePercent)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stocks */}
              {stockData.stocks.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">
                      選んだ銘柄の株価（{stockData.stocks.length}銘柄）
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs font-medium text-muted-foreground">銘柄</TableHead>
                          <TableHead className="text-right text-xs font-medium text-muted-foreground">株価</TableHead>
                          <TableHead className="text-right text-xs font-medium text-muted-foreground">変動</TableHead>
                          <TableHead className="text-right hidden md:table-cell text-xs font-medium text-muted-foreground">
                            時価総額
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockData.stocks.map((stock) => (
                          <TableRow key={stock.symbol} className="hover:bg-muted/30">
                            <TableCell className="py-3">
                              <div className="font-medium text-sm">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {stock.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm py-3">
                              {stock.currency === "JPY" ? "¥" : "$"}
                              {formatNumber(stock.price)}
                            </TableCell>
                            <TableCell className="text-right py-3 text-sm">
                              {formatChange(stock.change, stock.changePercent)}
                            </TableCell>
                            <TableCell className="text-right hidden md:table-cell text-muted-foreground text-sm py-3">
                              {stock.marketCap
                                ? stock.marketCap >= 1e12
                                  ? `$${(stock.marketCap / 1e12).toFixed(2)}T`
                                  : `$${(stock.marketCap / 1e9).toFixed(1)}B`
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* AI Analysis */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AIによる分析結果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Summary */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">今日のまとめ</h3>
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                      <p className="text-sm leading-relaxed text-foreground/90">{analysis.summary}</p>
                    </div>
                  </div>

                  {/* Trends */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/60 p-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        今日の動き
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {analysis.dailyTrend}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        今週の傾向
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {analysis.weeklyTrend}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        今月の傾向
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {analysis.monthlyTrend}
                      </p>
                    </div>
                  </div>

                  {/* Insights and Recommendations */}
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-4">注目ポイント</h3>
                      <ul className="space-y-3">
                        {analysis.keyInsights.map((insight, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span className="leading-relaxed">
                              {insight}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-4">ご参考までに</h3>
                      <ul className="space-y-3">
                        {analysis.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <ArrowRight className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Section */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    このレポートをメールで受け取る
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {step === "sent" ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                      </div>
                      <p className="text-base font-medium">
                        メールをお送りしました
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        受信ボックスをご確認ください
                      </p>
                      <Button variant="link" onClick={reset} className="mt-3 text-sm">
                        別の銘柄を分析する
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        分析結果をメールでお届けします。毎朝の確認にご活用ください。
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="メールアドレスを入力"
                          className="flex-1 h-10 bg-white"
                          disabled={step === "sending"}
                        />
                        <Button
                          onClick={handleSendEmail}
                          disabled={!email || step === "sending"}
                          className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6"
                        >
                          {step === "sending" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              送信中...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              送信する
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reset Button */}
              {step !== "sent" && (
                <div className="flex justify-center pt-2">
                  <Button variant="ghost" onClick={reset} className="text-sm text-muted-foreground">
                    別の銘柄を選び直す
                  </Button>
                </div>
              )}
            </div>
          )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">Stock Lens - 毎日の市場をわかりやすく</p>
          <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
            市場データはYahoo Financeより取得しています。<br />
            投資に関する最終的なご判断はご自身の責任でお願いいたします。
          </p>
        </div>
      </footer>
    </div>
  );
}
