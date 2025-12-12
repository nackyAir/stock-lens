export interface StockPreset {
  symbol: string;
  name: string;
  nameEn?: string; // English name for reference
  category: string;
}

// Popular indices
export const POPULAR_INDICES: StockPreset[] = [
  { symbol: "^N225", name: "日経平均株価", nameEn: "Nikkei 225", category: "指数" },
  { symbol: "^GSPC", name: "S&P 500", nameEn: "S&P 500", category: "指数" },
  { symbol: "^DJI", name: "ダウ工業株30種", nameEn: "Dow Jones", category: "指数" },
  { symbol: "^IXIC", name: "ナスダック総合", nameEn: "NASDAQ", category: "指数" },
  { symbol: "^HSI", name: "香港ハンセン指数", nameEn: "Hang Seng", category: "指数" },
  { symbol: "^FTSE", name: "FTSE 100", nameEn: "FTSE 100", category: "指数" },
];

// GAFAM + Major Tech
export const TECH_STOCKS: StockPreset[] = [
  { symbol: "GOOGL", name: "アルファベット", nameEn: "Alphabet (Google)", category: "テック" },
  { symbol: "AAPL", name: "アップル", nameEn: "Apple", category: "テック" },
  { symbol: "META", name: "メタ", nameEn: "Meta (Facebook)", category: "テック" },
  { symbol: "AMZN", name: "アマゾン", nameEn: "Amazon", category: "テック" },
  { symbol: "MSFT", name: "マイクロソフト", nameEn: "Microsoft", category: "テック" },
  { symbol: "NVDA", name: "エヌビディア", nameEn: "NVIDIA", category: "テック" },
  { symbol: "TSLA", name: "テスラ", nameEn: "Tesla", category: "テック" },
  { symbol: "NFLX", name: "ネットフリックス", nameEn: "Netflix", category: "テック" },
  { symbol: "AMD", name: "アドバンスト・マイクロ・デバイセズ", nameEn: "AMD", category: "テック" },
  { symbol: "INTC", name: "インテル", nameEn: "Intel", category: "テック" },
];

// Japanese Stocks (Major companies)
export const JAPAN_STOCKS: StockPreset[] = [
  { symbol: "7203.T", name: "トヨタ自動車", nameEn: "Toyota", category: "日本株" },
  { symbol: "6758.T", name: "ソニーグループ", nameEn: "Sony", category: "日本株" },
  { symbol: "6861.T", name: "キーエンス", nameEn: "Keyence", category: "日本株" },
  { symbol: "9984.T", name: "ソフトバンクグループ", nameEn: "SoftBank Group", category: "日本株" },
  { symbol: "6501.T", name: "日立製作所", nameEn: "Hitachi", category: "日本株" },
  { symbol: "8306.T", name: "三菱UFJフィナンシャル", nameEn: "MUFG", category: "日本株" },
  { symbol: "9433.T", name: "KDDI", nameEn: "KDDI", category: "日本株" },
  { symbol: "4063.T", name: "信越化学工業", nameEn: "Shin-Etsu Chemical", category: "日本株" },
  { symbol: "6367.T", name: "ダイキン工業", nameEn: "Daikin", category: "日本株" },
  { symbol: "7741.T", name: "HOYA", nameEn: "HOYA", category: "日本株" },
];

// Other popular stocks
export const OTHER_STOCKS: StockPreset[] = [
  { symbol: "BRK-B", name: "バークシャー・ハサウェイ", nameEn: "Berkshire Hathaway", category: "金融" },
  { symbol: "JPM", name: "JPモルガン・チェース", nameEn: "JPMorgan Chase", category: "金融" },
  { symbol: "V", name: "ビザ", nameEn: "Visa", category: "金融" },
  { symbol: "JNJ", name: "ジョンソン・エンド・ジョンソン", nameEn: "Johnson & Johnson", category: "ヘルスケア" },
  { symbol: "PG", name: "プロクター・アンド・ギャンブル", nameEn: "Procter & Gamble", category: "消費財" },
  { symbol: "KO", name: "コカ・コーラ", nameEn: "Coca-Cola", category: "消費財" },
  { symbol: "DIS", name: "ウォルト・ディズニー", nameEn: "Walt Disney", category: "エンタメ" },
  { symbol: "NKE", name: "ナイキ", nameEn: "Nike", category: "消費財" },
];

// ETFs
export const POPULAR_ETFS: StockPreset[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF", nameEn: "SPDR S&P 500 ETF", category: "ETF" },
  { symbol: "QQQ", name: "インベスコQQQ (ナスダック100)", nameEn: "Invesco QQQ", category: "ETF" },
  { symbol: "VTI", name: "バンガード・トータル・ストック", nameEn: "Vanguard Total Stock", category: "ETF" },
  { symbol: "VOO", name: "バンガード S&P 500", nameEn: "Vanguard S&P 500", category: "ETF" },
  { symbol: "1306.T", name: "TOPIX連動型上場投資信託", nameEn: "TOPIX ETF", category: "ETF" },
  { symbol: "1321.T", name: "日経225連動型上場投資信託", nameEn: "Nikkei 225 ETF", category: "ETF" },
];

// All presets combined
export const ALL_PRESETS: StockPreset[] = [
  ...POPULAR_INDICES,
  ...TECH_STOCKS,
  ...JAPAN_STOCKS,
  ...OTHER_STOCKS,
  ...POPULAR_ETFS,
];

// Category groups for UI
export const PRESET_CATEGORIES = [
  { id: "indices", name: "主要指数", stocks: POPULAR_INDICES },
  { id: "tech", name: "テック株", stocks: TECH_STOCKS },
  { id: "japan", name: "日本株", stocks: JAPAN_STOCKS },
  { id: "other", name: "その他", stocks: OTHER_STOCKS },
  { id: "etf", name: "ETF", stocks: POPULAR_ETFS },
];

// Symbol to Japanese name mapping for search results
export const SYMBOL_NAME_MAP: Record<string, string> = {
  // Indices
  "^N225": "日経平均株価",
  "^GSPC": "S&P 500",
  "^DJI": "ダウ工業株30種",
  "^IXIC": "ナスダック総合",
  "^HSI": "香港ハンセン指数",
  "^FTSE": "FTSE 100",
  "^GDAXI": "ドイツDAX",
  "^FCHI": "フランスCAC 40",

  // Tech
  "GOOGL": "アルファベット",
  "GOOG": "アルファベット",
  "AAPL": "アップル",
  "META": "メタ",
  "AMZN": "アマゾン",
  "MSFT": "マイクロソフト",
  "NVDA": "エヌビディア",
  "TSLA": "テスラ",
  "NFLX": "ネットフリックス",
  "AMD": "AMD",
  "INTC": "インテル",
  "ORCL": "オラクル",
  "CRM": "セールスフォース",
  "ADBE": "アドビ",
  "CSCO": "シスコシステムズ",
  "IBM": "IBM",
  "QCOM": "クアルコム",
  "TXN": "テキサス・インスツルメンツ",
  "AVGO": "ブロードコム",
  "MU": "マイクロン・テクノロジー",

  // Finance
  "BRK-B": "バークシャー・ハサウェイ",
  "BRK-A": "バークシャー・ハサウェイ",
  "JPM": "JPモルガン・チェース",
  "V": "ビザ",
  "MA": "マスターカード",
  "BAC": "バンク・オブ・アメリカ",
  "WFC": "ウェルズ・ファーゴ",
  "GS": "ゴールドマン・サックス",
  "MS": "モルガン・スタンレー",
  "AXP": "アメリカン・エキスプレス",
  "C": "シティグループ",

  // Healthcare
  "JNJ": "ジョンソン・エンド・ジョンソン",
  "UNH": "ユナイテッドヘルス",
  "PFE": "ファイザー",
  "MRK": "メルク",
  "ABBV": "アッヴィ",
  "LLY": "イーライリリー",
  "TMO": "サーモフィッシャー",
  "ABT": "アボット・ラボラトリーズ",
  "BMY": "ブリストル・マイヤーズ",
  "AMGN": "アムジェン",

  // Consumer
  "PG": "プロクター・アンド・ギャンブル",
  "KO": "コカ・コーラ",
  "PEP": "ペプシコ",
  "WMT": "ウォルマート",
  "COST": "コストコ",
  "HD": "ホームデポ",
  "MCD": "マクドナルド",
  "NKE": "ナイキ",
  "SBUX": "スターバックス",
  "DIS": "ウォルト・ディズニー",
  "CMCSA": "コムキャスト",

  // Energy
  "XOM": "エクソンモービル",
  "CVX": "シェブロン",
  "COP": "コノコフィリップス",
  "SLB": "シュルンベルジェ",

  // Industrial
  "CAT": "キャタピラー",
  "BA": "ボーイング",
  "GE": "ゼネラル・エレクトリック",
  "HON": "ハネウェル",
  "UPS": "UPS",
  "LMT": "ロッキード・マーチン",
  "RTX": "RTXコーポレーション",

  // ETFs
  "SPY": "SPDR S&P 500 ETF",
  "QQQ": "インベスコQQQ",
  "VTI": "バンガード・トータル・ストック",
  "VOO": "バンガード S&P 500",
  "IWM": "iシェアーズ ラッセル2000",
  "EFA": "iシェアーズ MSCI EAFE",
  "EEM": "iシェアーズ MSCI 新興国",
  "VWO": "バンガード 新興国株式",
  "GLD": "SPDR ゴールド",
  "SLV": "iシェアーズ シルバー",

  // Japanese stocks (Tokyo Stock Exchange)
  "7203.T": "トヨタ自動車",
  "6758.T": "ソニーグループ",
  "6861.T": "キーエンス",
  "9984.T": "ソフトバンクグループ",
  "6501.T": "日立製作所",
  "8306.T": "三菱UFJフィナンシャル",
  "9433.T": "KDDI",
  "4063.T": "信越化学工業",
  "6367.T": "ダイキン工業",
  "7741.T": "HOYA",
  "6902.T": "デンソー",
  "8035.T": "東京エレクトロン",
  "4502.T": "武田薬品工業",
  "6594.T": "日本電産",
  "9432.T": "日本電信電話",
  "7267.T": "本田技研工業",
  "6981.T": "村田製作所",
  "8058.T": "三菱商事",
  "9983.T": "ファーストリテイリング",
  "4519.T": "中外製薬",
  "6857.T": "アドバンテスト",
  "7974.T": "任天堂",
  "8766.T": "東京海上ホールディングス",
  "4568.T": "第一三共",
  "6098.T": "リクルートホールディングス",
  "1306.T": "TOPIX連動型上場投資信託",
  "1321.T": "日経225連動型上場投資信託",
};

// Helper function to get Japanese name for a symbol
export function getJapaneseName(symbol: string, fallbackName?: string): string {
  return SYMBOL_NAME_MAP[symbol] || fallbackName || symbol;
}
