Frontend Vercel setup (frontend)

Recommended approach: deploy frontend and backend as two Vercel projects.

1) Frontend project settings (web UI)
- In Vercel dashboard, create a new Project and set Root Directory to: `frontend`.
- Framework Preset: `Create React App` (or `Other` if not detected).
- Build Command: `npm run build`
- Output Directory: `build`

2) Required env var for frontend
- `API_BASE` — URL of your backend deployment (e.g. `https://your-backend.vercel.app`)
- Add this in Settings → Environment Variables for Production/Preview/Development.

3) CLI quick commands (link & deploy)
```bash
# install and login
npm i -g vercel
vercel login

# from repo root, link frontend to Vercel project
cd frontend
vercel link

# add API_BASE (interactive prompt for value)
vercel env add API_BASE production
vercel env add API_BASE preview
vercel env add API_BASE development

# deploy
vercel --prod
```

4) Make frontend talk to backend
- Deploy backend first as its own Vercel project with Root `bank-app-deploy`.
- After backend deploy, copy its production URL and set it as `API_BASE` in the frontend project envs.
- In your frontend code, read `process.env.API_BASE` (or runtime-injected `window` var) to call API endpoints, e.g. `${process.env.API_BASE}/api/auth/login`.

5) Single-project alternative (monorepo)
- You can also have a single Vercel project with Root `.` and configure builds so frontend builds and backend functions live under `bank-app-deploy/api`. This requires careful `vercel.json` routing and is more complex.

6) Quick checks
- After deploying backend and setting `API_BASE`, deploy frontend and test:
  - `GET https://<frontend>/api/health` or fetch `${API_BASE}/api/health` in browser/network tab.
