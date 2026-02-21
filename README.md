# VC Intelligence Interface

A production-grade, thesis-native venture intelligence platform designed for discovery, tracking, and AI-powered enrichment of startups. Built for speed, precision, and usability.

**🚀 Live Demo:** [https://vc-intel-khaki.vercel.app](https://vc-intel-khaki.vercel.app)

## ✨ Features

- **Thesis-Native Discovery**: Instant search and faceted filtering (Industry, Stage, Country) across a seeded pipeline.
- **AI enrichment**: One-click deep-dive into any company. Fetches real data using **Jina Reader** and extracts structured intelligence (Summary, Signals, Sources) via **Gemini 1.5 Flash**.
- **Portfolio Management**: Create custom lists, save searches, and add internal notes to any company.
- **Persistence**: Hybrid architecture using serverless APIs for enrichment and `localStorage` for secure, zero-latency client-side data management.
- **Premium UI**: Sleek dark-mode interface with collapsible navigation, responsive pill-chip filters, and optimized typography.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with custom design tokens (Zero runtime overhead)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI / Data**: 
  - [Google Gemini 1.5 Flash](https://ai.google.dev/) (Structured Extraction)
  - [Jina Reader API](https://jina.ai/reader/) (Web Content Fetching)
- **Deployment**: [Vercel](https://vercel.app)

## 📦 Setup & Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd vc-intel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_ai_studio_key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment (Vercel)

To deploy your own version:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Add the secret: `vercel env add GEMINI_API_KEY`
4. Deploy to production: `vercel --prod`

## 📂 Project Structure

- `app/api/enrich/`: Server-side enrichment pipeline.
- `app/companies/`: Main discovery and profile views.
- `app/lists/`: Custom list management.
- `app/saved/`: Saved search functionality.
- `components/`: Reusable UI components (Sidebar, etc.).
- `data/`: Seed dataset (`companies.json`).
- `lib/`: Shared utilities and type definitions.

---
Built with pride as a high-performance VC tool.
