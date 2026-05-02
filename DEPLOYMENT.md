# HairFlip Deployment Guide

## Step 1 — Push code to GitHub

If not already done:
1. Go to github.com and create a new repository called "hairflip-ai" — set it to Public
2. In your project root folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial HairFlip commit"
   git remote add origin https://github.com/YOUR_USERNAME/hairflip-ai.git
   git push -u origin main
   ```

## Step 2 — Deploy Backend to Render

1. Go to render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your `hairflip-ai` repository
5. Configure:
   - **Name:** `hairflip-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
6. Click "Advanced" → "Add Environment Variables"
   Add ALL of these one by one:
   
   - `CLOUDINARY_CLOUD_NAME = your_value`
   - `CLOUDINARY_API_KEY = your_value`  
   - `CLOUDINARY_API_SECRET = your_value`
   - `LIGHTX_API_KEY = your_value`
   - `OPENAI_API_KEY = your_value`

7. Click "Create Web Service"
8. Wait 3-5 minutes for build to complete
9. Copy your Render URL — looks like: `https://hairflip-backend.onrender.com`

## Step 3 — Update Frontend with Render URL

1. Open `/frontend/.env.production`
2. Replace `REPLACE_WITH_YOUR_RENDER_URL` with your actual Render URL:
   `VITE_API_URL=https://hairflip-backend.onrender.com`
3. Save the file
4. Commit and push:
   ```bash
   git add .
   git commit -m "Add production API URL"
   git push
   ```

## Step 4 — Deploy Frontend to Vercel

1. Go to vercel.com and sign up with GitHub (free)
2. Click "Add New..." → "Project"
3. Import your `hairflip-ai` repository
4. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Environment Variables" and add:
   `VITE_API_URL = https://hairflip-backend.onrender.com` (same Render URL from Step 2)
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your live URL will be: `https://hairflip-ai.vercel.app` (or similar — Vercel generates the name)

## Step 5 — Update Backend CORS with Vercel URL

Now that you know your Vercel URL, update CORS in `/backend/main.py` to be specific:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hairflip-ai.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push — Render will auto-redeploy.

## Step 6 — Test Production

1. Open your Vercel URL in a new browser tab
2. Go through the full flow:
   - Upload a photo ✓
   - Check face shape detection works ✓
   - Generate a hairstyle ✓
   - Download the result ✓
3. Test on your phone too

## Important: Render Free Tier Sleep

The free Render tier sleeps after 15 minutes of inactivity. The first request after sleep takes 30-60 seconds to wake up.

To fix this for your LinkedIn demo:
- Open the app URL 2 minutes before recording
- This wakes up the backend
- Then record your demo video

For a permanent fix later (after getting a job):
- Upgrade Render to paid ($7/month)
- OR use Railway which has better free tier

## Your Live URLs after deployment:
- **Frontend:** https://hairflip-ai.vercel.app
- **Backend:**  https://hairflip-backend.onrender.com
- **API docs:** https://hairflip-backend.onrender.com/docs
