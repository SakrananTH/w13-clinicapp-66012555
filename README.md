# W13 Accommodation Booking App — Starter

**225381 · Application Development with Cloud Platform · Week 13**
**จัดทำ:** 17 กันยายน 2026 · โดยน้องวิจัย Oracle (AI-generated — พี่กิ๊กตรวจก่อนใช้)

A small Bangkok hotel room booking app. Three resources on Azure:

- **App Service** (`app-clinicapp-api-66012555`) — Node.js 20 LTS Express API
- **Web App** (`app-clinicapp-web-66012555`) — React + Vite front-end
- **Azure SQL Database** (`free-sql-db-9978530`) — rooms + bookings

## Layout

```
w13-clinicapp-starter/
├── README.md
├── .gitignore
├── .env.example
├── db/
│   ├── schema.sql         -- CREATE TABLE rooms + bookings
│   └── seed-data.sql      -- 5 sample rooms
├── server/                -- Express API
│   ├── package.json
│   ├── index.js
│   ├── db.js
│   ├── .env.example
│   └── .gitignore
└── web/                   -- React + Vite front-end
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── .gitignore
    └── src/
        ├── main.jsx
        └── App.jsx
```

## What it does

- `GET /` — health check
- `GET /rooms` — list rooms (JSON)
- `GET /bookings` — list bookings joined with room
- `POST /bookings` — book a room

## Run locally (no Azure needed)

```powershell
# 1. install
cd server; npm install; cd ..
cd web;    npm install; cd ..

# 2. start API (terminal 1)
cd server
copy .env.example .env
# leave AZURE_SQL_CONNECTION_STRING empty for now
npm run dev          # http://localhost:8080  (server boots; /rooms returns 503)

# 3. start front-end (terminal 2)
cd web
npm run dev          # http://localhost:5173
```

The front-end calls the API via Vite proxy (`/api/*` → `http://localhost:8080`).
Without a database, the UI shows a clear "Error: database_not_configured" — that's expected.

## Connect to Azure SQL

1. In Azure Portal → your SQL database → **Connection strings** → ADO.NET → copy
2. `server/.env` → paste into `AZURE_SQL_CONNECTION_STRING=...`
3. Load schema: Azure Portal → SQL database → **Query editor** → paste contents of `db/schema.sql` → Run
4. Then paste `db/seed-data.sql` → Run
5. `cd server && npm run dev` → visit `http://localhost:8080/rooms` → should return 5 rooms

## Deploy to Azure

### Backend → App Service

1. Azure Portal → **App Services** → use `app-clinicapp-api-66012555` (Node 20 LTS)
2. **Deployment Center** → GitHub → select your repo → **App Service** builds a workflow automatically
3. **Configuration** → Application settings → add:
   - `AZURE_SQL_CONNECTION_STRING` = (your string)
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true` (so `npm install` runs on the server)
4. Push to GitHub → Actions deploys → check `https://app-clinicapp-api-66012555.azurewebsites.net/rooms`

### Front-end → Static Web App

1. Azure Portal → **App Services** → use `app-clinicapp-web-66012555` → connect the frontend deployment
2. Build preset: **Vite** · App location: `web` · Output location: `dist`
3. Azure auto-creates `.github/workflows/azure-static-web-apps-*.yml`
4. Push → Actions deploys → get the public URL

> **The repo has one branch but two deployment workflows** — App Service deploys `server/` and Static Web App deploys `web/`. Both workflows coexist; each Azure service only cares about its own paths.

## How students use this

1. Fork the repo: <https://github.com/thammarat-ai/w13-clinicapp-starter>
2. Rename to `w13-clinicapp-<github-username>` (matches `lab-W13` naming convention)
3. Read `lessons/week-13/handout/handout-W13-azure-hands-on-1.md` for the 7-step lab
4. Deploy (follow this README) — the workflow auto-builds on every push
5. Take screenshots for the rubric in §11

## Endpoints match W13 lab rubric

| Rubric check | Endpoint | Status |
|--------------|----------|--------|
| API responds GET /rooms with JSON | `GET /rooms` | ✅ implemented |
| Front-end renders room list | `web/src/App.jsx` | ✅ implemented |
| Booking persists to SQL DB | `POST /bookings` | ✅ implemented |
| Auto-deploy on push | GitHub Actions (Azure-generated) | ✅ wired |
| Reflection | (student-written) | — |

## Notes

- The repo contains **no secrets**. Connection strings live in `.env` (not committed) or Azure App Service application settings (not committed).
- Azure Free tier F1 has 1-instance-per-region limit. If your W6 lab left an App Service behind, **delete it first** (B3 in the course plan).
- This is a teaching starter — production hardening (Key Vault, Managed Identity, Private Endpoint) is the focus of W14.

## License

MIT
