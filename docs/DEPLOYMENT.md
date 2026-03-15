# EduManage Deployment Guide

Deploy the frontend (edum.ge) and backend so they work together online.

---

## 1. Backend deployment

Deploy your backend to a hosting provider (examples: Railway, Render, DigitalOcean, AWS, your own VPS).

**You need:**
- A public URL for the API, e.g. `https://api.edum.ge` or `https://edum-api.railway.app`
- The base URL for the frontend will be: `https://your-backend-url/api/v1`

### Backend requirements

1. **CORS** – allow your frontend domain:
   ```
   Access-Control-Allow-Origin: https://edum.ge
   ```
   Or in development: `http://localhost:3000`

2. **Environment** – set production env vars (e.g. database, JWT secrets).

3. **HTTPS** – use HTTPS for production.

---

## 2. Frontend configuration

### Step 1: Set the API URL

Create or edit `.env.production` in the project root:

```
REACT_APP_API_URL=https://YOUR-BACKEND-URL/api/v1
```

Example if backend is at `https://api.edum.ge`:
```
REACT_APP_API_URL=https://api.edum.ge/api/v1
```

### Step 2: Build the frontend

```bash
npm run build
```

This creates the `build/` folder with static files.

---

## 3. Deploy the frontend

### Option A: Static hosting (Vercel, Netlify, GitHub Pages)

1. Push the project to GitHub.
2. Connect the repo to Vercel or Netlify.
3. Configure environment variable:  
   `REACT_APP_API_URL` = your backend URL (e.g. `https://api.edum.ge/api/v1`)
4. Deploy. You’ll get a URL like `your-app.vercel.app` or `your-app.netlify.app`.

### Option B: domenebi.ge hosting

If domenebi.ge provides hosting:

1. Get access to hosting (FTP/SSH or control panel).
2. Upload the contents of the `build/` folder.
3. Configure the domain to point to that hosting.

### Option C: VPS / own server

1. Copy the `build/` folder to the server.
2. Serve it with Nginx or Apache.
3. Configure the domain to point to the server.

---

## 4. Point edum.ge to your frontend

In the domenebi.ge control panel (or your registrar):

1. **A record** – point `edum.ge` to the IP of your frontend hosting.
2. **CNAME** – if using Vercel/Netlify, use the CNAME they provide (e.g. `cname.vercel-dns.com`).
3. **HTTPS** – enable SSL (Let’s Encrypt or your host’s SSL).

---

## 5. Checklist

| Step | Action |
|------|--------|
| 1 | Deploy backend and get its public URL |
| 2 | Allow `https://edum.ge` in backend CORS |
| 3 | Set `REACT_APP_API_URL` in `.env.production` |
| 4 | Run `npm run build` |
| 5 | Deploy the `build/` folder |
| 6 | Point `edum.ge` DNS to the frontend host |
| 7 | Test the site at https://edum.ge |

---

## 6. Quick reference

**Frontend:** `https://edum.ge`  
**Backend API:** `https://YOUR-BACKEND-URL/api/v1`

Ensure backend CORS allows: `https://edum.ge` (and `http://localhost:3000` for local dev).
