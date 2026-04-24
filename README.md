# My Cust V2

A modular, dynamic two-app system:
- **Client** (`client/`): Public-facing website hosted on **Vercel**. Fetches live data from the server API.
- **Server** (`server/`): Admin dashboard + REST API hosted on **Cloudflare Pages**. Uses **Cloudflare KV** for persistent JSON storage.

## Architecture

```
My Cust V2/
├── client/          # React + Vite → Vercel
└── server/          # Cloudflare Pages + Functions + KV
    ├── functions/   # API routes
    └── public/      # macOS Dashboard UI
```

## Features

- **macOS-inspired glassmorphism dashboard** with sidebar navigation
- **Dynamic categories**: Add/remove categories without code changes
- **CRUD operations**: Create, read, update, delete items in any category
- **Export/Import JSON**: Backup and restore all data
- **Auto-deploy**: Push to GitHub → Vercel & Cloudflare Pages deploy automatically

## Tech Stack

| Layer | Tech |
|-------|------|
| Client | React, Vite, Tailwind CSS |
| Server UI | Alpine.js, Tailwind CSS CDN, Lucide Icons |
| Server API | Cloudflare Pages Functions |
| Storage | Cloudflare KV (key-value) |

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Local Development

Start both client and server:

```bash
npm run dev
```

- Client: http://localhost:5173
- Server Dashboard: http://localhost:8788

> **Note**: For local KV development, Cloudflare Pages will use local storage automatically.

### 3. Cloudflare Setup (One-time)

1. Create a **Cloudflare Pages** project connected to your GitHub repo
2. Set build settings:
   - Root directory: `server`
   - Build command: (leave empty for static + functions)
   - Output directory: `public`
3. Create a **KV Namespace** in the Cloudflare Dashboard
4. Bind the KV namespace to your Pages project with the binding name `DATA`
5. Update `server/wrangler.toml` with your KV namespace IDs (optional for Git deploys; required for local dev)

### 4. Vercel Setup (One-time)

1. Import your GitHub repo on Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-cloudflare-pages-url.pages.dev`

### 5. Adding New Categories

1. Open the **Data Management** tab in the dashboard
2. Add a new category to the config
3. The new tab appears automatically in both dashboard and client

## Data Model

KV Keys:
- `config` → Category definitions and metadata
- `data:{categoryId}` → Array of items for each category

Item Schema:
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "status": "active|completed|archived",
  "priority": "low|medium|high",
  "date": "ISO8601",
  "tags": ["array", "of", "strings"]
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Get category configuration |
| PUT | `/api/config` | Update category configuration |
| GET | `/api/data` | Get all categories + data |
| GET | `/api/:category` | Get items in a category |
| POST | `/api/:category` | Add item to category |
| PUT | `/api/:category?id=xxx` | Update item |
| DELETE | `/api/:category?id=xxx` | Delete item |
| GET | `/api/export` | Download full JSON backup |
| POST | `/api/import` | Upload JSON backup |

## Deployment

Both platforms deploy automatically when you push to GitHub:

```bash
git add .
git commit -m "update dashboard"
git push origin main
```

## License

MIT
