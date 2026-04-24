# Deployment Guide

Follow these steps one by one to make your sites live.

---

## Step 1: Push Your Project to GitHub

Both Vercel and Cloudflare Pages deploy automatically from a GitHub repository.

### 1.1 Initialize Git (if not already done)

Open your terminal in the project root and run:

```bash
git init
git add .
git commit -m "Initial commit: client + server dashboard"
```

### 1.2 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `my-cust-v2` (or any name)
3. **Keep it Public** (required for free deploys)
4. **DO NOT** check "Add a README file" (you already have one)
5. **DO NOT** check "Add .gitignore" (you already have one)
6. Click **Create repository**

### 1.3 Push Your Local Code

Copy the commands shown on GitHub and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/my-cust-v2.git
git branch -M main
git push -u origin main
```

### 1.4 Verify

Refresh your GitHub repo page. You should see all files including `client/`, `server/`, `README.md`, and `.gitignore`.

**Once this is done, proceed to Step 2.**

---

## Step 2: Deploy the Server to Cloudflare Pages

The server app (dashboard + API) will be hosted on Cloudflare Pages.

### 2.1 Create Cloudflare Pages Project

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** (left sidebar) → Click **Create a project**
3. Select **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Find and select your `my-cust-v2` repository
6. Click **Begin setup**

### 2.2 Configure Build Settings

Fill in the form:

| Setting | Value |
|---------|-------|
| Project name | `my-cust-dashboard` (or any name) |
| Production branch | `main` |
| Root directory | `server` |
| Build command | *(leave empty)* |
| Build output directory | `public` |

Click **Save and Deploy**.

### 2.3 Wait for First Deploy

Cloudflare will deploy the static files. This takes ~1 minute. You will get a URL like:
`https://my-cust-dashboard.pages.dev`

### 2.4 Important: Cloudflare Pages Functions

Your API routes (in `functions/`) will be deployed automatically as Pages Functions. No extra build step is needed.

**Once this is done, proceed to Step 3.**

---

## Step 3: Create and Bind Cloudflare KV

Your data needs to be stored in Cloudflare KV.

### 3.1 Create a KV Namespace

1. In Cloudflare Dashboard, go to **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name it: `DASHBOARD_DATA`
4. Click **Add**

### 3.2 Bind KV to Your Pages Project

1. Go back to **Pages** → Select your `my-cust-dashboard` project
2. Click **Settings** (top tab) → **Functions** (left sidebar)
3. Scroll to **KV namespace bindings**
4. Click **Add binding**
5. Fill in:

| Field | Value |
|-------|-------|
| Variable name | `DATA` |
| KV namespace | `DASHBOARD_DATA` |

6. Click **Save**

### 3.3 Update wrangler.toml (Optional but Recommended)

In your local code, open `server/wrangler.toml` and update it with your KV IDs:

```toml
name = "my-cust-dashboard"
compatibility_date = "2024-05-01"

[[kv_namespaces]]
binding = "DATA"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_NAMESPACE_ID"
```

> Find your KV namespace ID in the Cloudflare Dashboard under Workers & Pages → KV.

**What is `preview_id`?**  
`preview_id` is used for local development (`wrangler dev`). If you only created **one** KV namespace in the dashboard, you can safely use the **same ID** for both `id` and `preview_id`. You only need different values if you want separate data for production vs local testing.


Commit and push this change:

```bash
git add server/wrangler.toml
git commit -m "Update KV namespace IDs"
git push
```

**Once this is done, proceed to Step 4.**

---

## Step 4: Deploy the Client to Vercel

The client app will be hosted on Vercel.

### 4.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub (same account)
3. Find and select your `my-cust-v2` repository
4. Click **Import**

### 4.2 Configure Project Settings

| Setting | Value |
|---------|-------|
| Project name | `my-cust-client` (or any name) |
| Framework preset | Vite |
| Root directory | `client` |
| Build command | `npm run build` (or leave default) |
| Output directory | `dist` |

### 4.3 Add Environment Variable

Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-cloudflare-pages-url.pages.dev` |

Replace with your actual Cloudflare Pages URL from Step 2.

Click **Deploy**.

### 4.4 Wait for Deploy

Vercel will build and deploy. You will get a URL like:
`https://my-cust-client.vercel.app`

**Once this is done, proceed to Step 5.**

---

## Step 5: Verify Everything Works

### 5.1 Test the Dashboard

1. Visit your Cloudflare Pages URL (e.g., `https://my-cust-dashboard.pages.dev`)
2. You should see the macOS-style dashboard
3. Add an item in the **Announcements** tab
4. Check that it saves and persists after refresh

### 5.2 Test the Client

1. Visit your Vercel URL (e.g., `https://my-cust-client.vercel.app`)
2. You should see the data you added in the dashboard
3. The data should match exactly

### 5.3 Test Export/Import

1. In the dashboard, go to **Data Management**
2. Click **Download Backup** — save the JSON file
3. Add a new item, then click **Download Backup** again — verify the new item is in the JSON
4. Click **Choose File** under Import and select your backup — verify data restores correctly

---

## Step 6: Future Updates (Normal Workflow)

From now on, you only need to:

```bash
git add .
git commit -m "your changes"
git push origin main
```

Both **Vercel** and **Cloudflare Pages** will automatically redeploy.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATA` is undefined in Functions | Go to Cloudflare Dashboard → Pages → Settings → Functions and check the KV binding name is exactly `DATA` |
| Client shows "Connection Error" | Check that `VITE_API_URL` in Vercel matches your Cloudflare Pages URL exactly (include `https://`) |
| CORS errors in browser | The `_middleware.js` handles CORS. Make sure it's in `server/functions/api/_middleware.js` |
| KV data not persisting | Remember: KV is eventually consistent. Wait 10-30 seconds after writing before reading in a different location. |
