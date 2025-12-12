# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stock Lens is a Japanese-language stock analysis dashboard that fetches real-time market data, generates AI-powered analysis using Claude, and can email reports to users. The UI is entirely in Japanese.

## Development Commands

```bash
pnpm dev      # Start development server on localhost:3000
pnpm build    # Production build
pnpm lint     # Run ESLint
pnpm start    # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **AI**: Vercel AI SDK with Anthropic Claude for analysis
- **Data**: yahoo-finance2 for stock quotes and search
- **Email**: Resend with React Email templates

### Key Data Flow

1. **Stock Selection** (`app/page.tsx`): Users select stocks from presets or search
2. **Data Fetching** (`/api/stocks`): Fetches quotes via yahoo-finance2
3. **AI Analysis** (`/api/analyze`): Claude analyzes data and returns structured insights
4. **Email Delivery** (`/api/send-email`): Resend sends HTML email via React Email template

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stocks` | GET | Fetch default GAFAM + indices data |
| `/api/stocks` | POST | Fetch custom symbol list (max 20) |
| `/api/stocks/search` | GET | Search stocks by query via Yahoo Finance |
| `/api/analyze` | POST | Generate AI analysis from stock data |
| `/api/send-email` | POST | Send report email |

### Core Libraries

- `lib/stock-service.ts` - Yahoo Finance wrapper for quotes, indices, historical data
- `lib/popular-stocks.ts` - Preset stock categories and symbol-to-Japanese-name mapping
- `lib/types.ts` - TypeScript interfaces for stock data and analysis results
- `emails/stock-report.tsx` - React Email template for reports

### UI Components

Located in `components/ui/` - standard shadcn/ui components (Button, Card, Input, Table, Tabs, etc.)

## Environment Variables

Required in `.env.local`:
- `ANTHROPIC_API_KEY` - For Claude AI analysis
- `RESEND_API_KEY` - For email sending
- `RESEND_FROM_EMAIL` - Sender address (default: onboarding@resend.dev for testing)

## Conventions

- All user-facing text is in Japanese
- Stock symbols starting with `^` are treated as indices
- Japanese stock symbols use `.T` suffix (e.g., `7203.T` for Toyota)
- Maximum 20 stocks can be selected at once
