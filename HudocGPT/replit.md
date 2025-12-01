# HUDOC API - ECHR Case Law API Wrapper

## Overview
A modern REST API wrapper for the European Court of Human Rights (ECHR) case law database (HUDOC). This application provides programmatic access to ECHR judgments, decisions, and legal documents through a clean REST interface with structured JSON responses optimized for legal research applications and AI/LLM integration.

## Current State
- **Version**: 1.0 Beta
- **Status**: Fully functional with search, filtering, and case retrieval capabilities

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Theme**: Supports light/dark mode with system preference detection

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **API Integration**: Axios for HUDOC requests
- **Caching**: node-cache for response caching (10 min TTL)
- **Rate Limiting**: express-rate-limit (100 req/min per IP)

### Key Files
```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── api-status.tsx
│   │   ├── case-card.tsx
│   │   ├── code-block.tsx
│   │   ├── endpoint-card.tsx
│   │   ├── navbar.tsx
│   │   ├── pagination.tsx
│   │   ├── search-filters.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── home.tsx      # Landing page with features
│   │   ├── docs.tsx      # API documentation
│   │   └── explorer.tsx  # Interactive API tester
│   └── App.tsx           # Main app with routing
server/
├── routes.ts             # API endpoint definitions
├── hudoc.ts              # HUDOC API integration
└── index.ts              # Server entry point
shared/
└── schema.ts             # TypeScript types & Zod schemas
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cases/search` | GET | Search cases with filters |
| `/api/cases/:id` | GET | Get full case details |
| `/api/articles` | GET | List ECHR articles |
| `/api/countries` | GET | List member states |
| `/api/status` | GET | API health check |

### Search Parameters
- `query` - Full-text search
- `applicationNumber` - Filter by app number
- `caseTitle` - Filter by case title
- `respondentState` - ISO country code (e.g., GBR, FRA)
- `article` - ECHR article number (e.g., 8, P1-1)
- `importance` - 1 (Key) to 4 (Low)
- `documentType` - JUDGMENTS, DECISIONS, etc.
- `dateFrom`, `dateTo` - Date range filters
- `violation` - Boolean for violation cases only
- `page`, `pageSize` - Pagination controls

## Running the Project

The application runs with a single command:
```bash
npm run dev
```

This starts both the Express backend and Vite development server on port 5000.

## Design System
- **Primary Font**: Inter
- **Monospace Font**: Fira Code
- **Color Scheme**: Blue primary (#1a56db) with neutral grays
- **Border Radius**: Small (3px), Medium (6px), Large (9px)

## User Preferences
- None recorded yet

## Recent Changes
- Initial implementation of HUDOC API wrapper
- Built documentation UI with interactive explorer
- Implemented caching and rate limiting
- Added dark mode support
