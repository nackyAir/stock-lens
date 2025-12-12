import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import type { StockDataResponse, AnalysisResult } from "@/lib/types";

interface StockReportEmailProps {
  stockData: StockDataResponse;
  analysis: AnalysisResult;
  reportDate: string;
  greeting?: string;
  personalMessage?: string;
}

export const StockReportEmail = ({
  stockData,
  analysis,
  reportDate,
  greeting = "おはようございます",
  personalMessage,
}: StockReportEmailProps) => {
  const formatNumber = (num: number, decimals = 2) =>
    num.toLocaleString("ja-JP", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? "+" : "";
    const color = change >= 0 ? "#059669" : "#dc2626";
    const bgColor = change >= 0 ? "#ecfdf5" : "#fef2f2";
    return (
      <span style={{ color, backgroundColor: bgColor, padding: "2px 8px", borderRadius: "4px", fontSize: "14px" }}>
        {sign}{formatNumber(change)} ({sign}{formatNumber(percent)}%)
      </span>
    );
  };

  // デフォルトのパーソナルメッセージを生成
  const defaultPersonalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 10) {
      return "本日も素敵な一日になりますように。";
    } else if (hour < 15) {
      return "本日の市場の動きをまとめてお届けいたします。";
    } else {
      return "本日もお疲れさまでした。";
    }
  };

  const message = personalMessage || defaultPersonalMessage();

  return (
    <Html>
      <Head />
      <Preview>【Stock Lens】{reportDate}の市場レポートをお届けします</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Stock Lens</Text>
            <Text style={headerSubtitle}>毎日の市場をわかりやすく</Text>
          </Section>

          {/* Greeting Section */}
          <Section style={greetingSection}>
            <Text style={greetingText}>{greeting}</Text>
            <Text style={dateText}>{reportDate}</Text>
            <Text style={personalMessageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          {/* AI Summary - 最も重要な情報を最初に */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              本日のまとめ
            </Heading>
            <div style={summaryBox}>
              <Text style={summaryText}>{analysis.summary}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Market Indices - 大きく見やすく */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              主な指数
            </Heading>
            <Text style={sectionDescription}>
              日本と米国の代表的な株価指数です
            </Text>
            <Row style={indicesRow}>
              <Column style={indexColumn}>
                <Text style={indexLabel}>日経平均株価</Text>
                {stockData.indices.nikkei225 && (
                  <>
                    <Text style={indexValue}>
                      {formatNumber(stockData.indices.nikkei225.value, 0)}円
                    </Text>
                    <div style={indexChangeWrapper}>
                      {formatChange(
                        stockData.indices.nikkei225.change,
                        stockData.indices.nikkei225.changePercent
                      )}
                    </div>
                  </>
                )}
              </Column>
              <Column style={indexColumn}>
                <Text style={indexLabel}>S&amp;P 500</Text>
                {stockData.indices.sp500 && (
                  <>
                    <Text style={indexValue}>
                      {formatNumber(stockData.indices.sp500.value, 0)}
                    </Text>
                    <div style={indexChangeWrapper}>
                      {formatChange(
                        stockData.indices.sp500.change,
                        stockData.indices.sp500.changePercent
                      )}
                    </div>
                  </>
                )}
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Selected Stocks - わかりやすい表示 */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              注目銘柄の値動き
            </Heading>
            <Text style={sectionDescription}>
              選択された銘柄の本日の株価です
            </Text>
            {stockData.gafam.map((stock) => (
              <div key={stock.symbol} style={stockCard}>
                <Row>
                  <Column style={stockInfoColumn}>
                    <Text style={stockSymbol}>{stock.symbol}</Text>
                    <Text style={stockName}>{stock.name}</Text>
                  </Column>
                  <Column style={stockPriceColumn}>
                    <Text style={stockPrice}>
                      {stock.currency === "JPY" ? "" : "$"}{formatNumber(stock.price)}
                      {stock.currency === "JPY" ? "円" : ""}
                    </Text>
                    <div style={stockChangeWrapper}>
                      {formatChange(stock.change, stock.changePercent)}
                    </div>
                  </Column>
                </Row>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Trend Analysis - シンプルに */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              市場の傾向
            </Heading>

            <div style={trendCard}>
              <Text style={trendLabel}>今日の動き</Text>
              <Text style={trendText}>{analysis.dailyTrend}</Text>
            </div>

            <div style={trendCard}>
              <Text style={trendLabel}>今週の傾向</Text>
              <Text style={trendText}>{analysis.weeklyTrend}</Text>
            </div>

            <div style={trendCard}>
              <Text style={trendLabel}>今月の傾向</Text>
              <Text style={trendText}>{analysis.monthlyTrend}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Key Insights - ポイントを絞って */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              今日のポイント
            </Heading>
            {analysis.keyInsights.map((insight, index) => (
              <div key={index} style={insightItem}>
                <Text style={insightNumber}>{index + 1}</Text>
                <Text style={insightText}>{insight}</Text>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Recommendations - やさしい表現で */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              ご参考までに
            </Heading>
            <Text style={sectionDescription}>
              AIからの提案です。投資のご判断は慎重にお願いいたします。
            </Text>
            {analysis.recommendations.map((rec, index) => (
              <div key={index} style={recommendationItem}>
                <Text style={recommendationIcon}>💡</Text>
                <Text style={recommendationText}>{rec}</Text>
              </div>
            ))}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerHr} />
            <Text style={footerGreeting}>
              明日もよろしくお願いいたします。
            </Text>
            <Text style={footerText}>
              Stock Lens - あなたの投資をサポートします
            </Text>
            <Text style={footerNote}>
              ※このレポートは参考情報です。投資判断は自己責任でお願いいたします。
            </Text>
            <Text style={footerDate}>
              レポート作成: {new Date(analysis.generatedAt).toLocaleString("ja-JP")}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles - 40-60代女性向けに最適化
const main = {
  backgroundColor: "#faf9f7",
  fontFamily:
    '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
};

const header = {
  padding: "32px 40px",
  backgroundColor: "#4a5568",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 4px",
  letterSpacing: "1px",
};

const headerSubtitle = {
  color: "#cbd5e0",
  fontSize: "14px",
  margin: "0",
};

const greetingSection = {
  padding: "28px 40px",
  backgroundColor: "#f7fafc",
  textAlign: "center" as const,
};

const greetingText = {
  color: "#2d3748",
  fontSize: "22px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const dateText = {
  color: "#718096",
  fontSize: "15px",
  margin: "0 0 12px",
};

const personalMessageText = {
  color: "#4a5568",
  fontSize: "15px",
  margin: "0",
  lineHeight: "1.6",
};

const h2 = {
  color: "#2d3748",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
  paddingBottom: "8px",
  borderBottom: "2px solid #e2e8f0",
};

const section = {
  padding: "28px 40px",
};

const sectionDescription = {
  color: "#718096",
  fontSize: "14px",
  margin: "0 0 20px",
  lineHeight: "1.5",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
};

const summaryBox = {
  backgroundColor: "#f0fff4",
  border: "1px solid #c6f6d5",
  borderRadius: "8px",
  padding: "20px",
};

const summaryText = {
  color: "#276749",
  fontSize: "16px",
  lineHeight: "1.8",
  margin: "0",
};

const indicesRow = {
  marginTop: "16px",
};

const indexColumn = {
  width: "48%",
  textAlign: "center" as const,
  padding: "20px 16px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const indexLabel = {
  color: "#4a5568",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 12px",
};

const indexValue = {
  color: "#1a202c",
  fontSize: "26px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const indexChangeWrapper = {
  marginTop: "4px",
};

const stockCard = {
  padding: "16px",
  marginBottom: "12px",
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const stockInfoColumn = {
  width: "55%",
};

const stockPriceColumn = {
  width: "45%",
  textAlign: "right" as const,
};

const stockSymbol = {
  color: "#2d3748",
  fontSize: "17px",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const stockName = {
  color: "#718096",
  fontSize: "13px",
  margin: "0",
};

const stockPrice = {
  color: "#1a202c",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 6px",
};

const stockChangeWrapper = {
  marginTop: "2px",
};

const trendCard = {
  padding: "16px 20px",
  marginBottom: "12px",
  backgroundColor: "#fafafa",
  borderRadius: "6px",
  borderLeft: "4px solid #4a5568",
};

const trendLabel = {
  color: "#4a5568",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const trendText = {
  color: "#2d3748",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0",
};

const insightItem = {
  display: "flex",
  marginBottom: "16px",
  padding: "12px 16px",
  backgroundColor: "#fffbeb",
  borderRadius: "6px",
  border: "1px solid #fcd34d",
};

const insightNumber = {
  color: "#d97706",
  fontSize: "16px",
  fontWeight: "bold",
  marginRight: "12px",
  minWidth: "24px",
};

const insightText = {
  color: "#78350f",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
  flex: "1",
};

const recommendationItem = {
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "14px",
  padding: "14px 16px",
  backgroundColor: "#f0f9ff",
  borderRadius: "6px",
  border: "1px solid #bae6fd",
};

const recommendationIcon = {
  fontSize: "18px",
  marginRight: "12px",
  marginTop: "0",
};

const recommendationText = {
  color: "#0c4a6e",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
  flex: "1",
};

const footer = {
  padding: "24px 40px 32px",
  backgroundColor: "#f7fafc",
  textAlign: "center" as const,
};

const footerHr = {
  borderColor: "#e2e8f0",
  marginBottom: "20px",
};

const footerGreeting = {
  color: "#4a5568",
  fontSize: "15px",
  fontWeight: "500",
  margin: "0 0 16px",
};

const footerText = {
  color: "#718096",
  fontSize: "13px",
  margin: "0 0 8px",
};

const footerNote = {
  color: "#a0aec0",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 12px",
};

const footerDate = {
  color: "#cbd5e0",
  fontSize: "11px",
  margin: "0",
};

export default StockReportEmail;
