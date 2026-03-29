# Virtual Tour App — CLAUDE.md

This file captures architecture decisions, conventions, and context for this project.
Update it as decisions are made or changed.

---

## Project Overview

A mobile-first web app that guides museum visitors through curated tours via QR code.
Visitors scan a QR code → land on a museum-specific page → choose language + tour type → step through artworks with images, text, and audio.

Multi-museum SaaS — a single deployment serves all museums via path-based routing.

**Status:** MVP complete (March 2026) — public tour player + admin panel deployed.

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast DX, strong ecosystem |
| Styling | Tailwind CSS | Utility-first, great for mobile |
| Routing | React Router v6 | Standard SPA |
| i18n | react-i18next | Mature, lazy-loads language bundles |
| HTTP/cache | TanStack Query | Loading states, caching, deduplication |
| Frontend hosting | Azure Static Web Apps (Standard) | Global CDN, HTTPS, SWA auth, linked backend |
| Backend | Azure Functions v4 (Node.js 24, TypeScript) | Serverless, scales to zero |
| Database | Azure Cosmos DB (serverless, Core API) | Flexible NoSQL, pay-per-RU |
| Media storage | Azure Blob Storage (direct, no CDN) | CDN removed for cost — add Front Door for production |
| TTS | Azure Cognitive Services Speech | Native Azure, multi-language neural voices |
| Admin auth | SWA built-in Azure AD | No MSAL library needed, zero config |
| IaC | Azure Bicep | Native ARM, readable |
| CI/CD | GitHub Actions | Auto-deploys on push to main |

### Why Standard SWA tier (not Free)
Linking an external Azure Functions app requires Standard tier. Free tier only supports managed (bundled) functions.

### Why no CDN
Azure Front Door Classic is retired for new profiles. Front Door Standard costs ~$35/month base fee — removed for dev to keep costs near $0. Add it back before production launch.

### Why `/api/mgmt/` for admin routes (not `/api/admin/`)
SWA intercepts requests containing `admin` in the path and returns 404 before forwarding to the linked Function App. All admin API routes use the `/api/mgmt/` prefix as a workaround.

---

## Supported Languages

| Code | Language | TTS Voice |
|---|---|---|
| `en` | English | `en-US-JennyNeural` |
| `pt` | Portuguese | `pt-BR-FranciscaNeural` |
| `es` | Spanish | `es-ES-ElviraNeural` |
| `uk` | Ukrainian | `uk-UA-PolinaNeural` |
| `ja` | Japanese | `ja-JP-NanamiNeural` |

Each museum defines its own `languages` array — visitors only see languages that museum supports.

---

## Multi-Tenancy

- Path-based: `yourdomain.com/tour/:museumSlug`
- All DB documents scoped by `museumId`
- Blob paths: `{container}/{museumId}/images/` and `{container}/{museumId}/audio/`
- No subdomain routing at launch
- Custom domains: museum adds a CNAME DNS record pointing to the SWA hostname; you run `az staticwebapp hostname set` + `az functionapp cors add`

---

## Data Model

### Collection: `museums`
```json
{
  "id": "mam-sp",
  "slug": "mam-sp",
  "name": { "en": "Museum of Modern Art SP", "pt": "MAM São Paulo" },
  "languages": ["en", "pt", "es"],
  "location": "São Paulo, Brazil",
  "heroImageUrl": "https://<storage>.blob.core.windows.net/media/mam-sp/images/hero.jpg"
}
```

### Collection: `tours`
```json
{
  "id": "mam-sp-full",
  "museumId": "mam-sp",
  "type": "full",
  "estimatedMinutes": 60,
  "stepIds": ["step-001", "step-002"]
}
```

### Collection: `steps`
```json
{
  "id": "step-001",
  "museumId": "mam-sp",
  "type": "artwork",
  "order": 1,
  "imageUrls": ["https://<storage>.blob.core.windows.net/media/mam-sp/images/artwork1.jpg"],
  "content": {
    "en": {
      "title": "Abaporu",
      "description": "Painted in 1928 by Tarsila do Amaral...",
      "audioUrl": "https://<storage>.blob.core.windows.net/media/mam-sp/audio/step-001-en.mp3"
    },
    "pt": {
      "title": "Abaporu",
      "description": "Pintado em 1928 por Tarsila do Amaral...",
      "audioUrl": null
    }
  }
}
```

`audioUrl: null` means TTS will be generated on first request and cached in Blob Storage.

---

## API Endpoints (Azure Functions)

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/api/museums/:slug` | Museum metadata + available tour types |
| GET | `/api/museums/:slug/tours/:type` | Ordered steps for a tour |
| GET | `/api/steps/:stepId?lang=en` | Single step with resolved audio URL |
| POST | `/api/audio/tts` | `{stepId, lang}` → generates/caches TTS, returns URL |

### Admin (requires Azure AD authentication via SWA)
| Method | Path | Description |
|---|---|---|
| GET | `/api/mgmt/me` | Returns authenticated user info |
| GET | `/api/mgmt/museums` | List all museums |
| POST | `/api/mgmt/museums` | Create/update museum |
| DELETE | `/api/mgmt/museums/:id` | Delete museum |
| GET | `/api/mgmt/museums/:id/tours` | List tours for museum |
| POST | `/api/mgmt/museums/:id/tours` | Create/update tour |
| DELETE | `/api/mgmt/tours/:id` | Delete tour |
| GET | `/api/mgmt/museums/:id/steps` | List steps for museum |
| POST | `/api/mgmt/museums/:id/steps` | Create/update step |
| DELETE | `/api/mgmt/steps/:id` | Delete step |
| POST | `/api/mgmt/media/upload` | Upload image or audio to Blob Storage |
| DELETE | `/api/mgmt/media` | Delete a blob |

---

## Frontend Routes

| Route | Page | Auth |
|---|---|---|
| `/tour/:museumSlug` | Landing — language + tour type selection | Public |
| `/tour/:museumSlug/:tourType` | Tour player — step-by-step | Public |
| `/admin/login` | Admin login page | Public |
| `/admin` | Dashboard — museum list | Azure AD |
| `/admin/museums/new` | Create museum | Azure AD |
| `/admin/museums/:id/edit` | Edit museum | Azure AD |
| `/admin/museums/:id/tours` | Manage tours | Azure AD |
| `/admin/museums/:id/steps/new` | Create step | Azure AD |
| `/admin/museums/:id/steps/:stepId/edit` | Edit step | Azure AD |

---

## Admin Authentication

Uses SWA built-in Azure AD provider — no MSAL library.

- Login: redirect to `/.auth/login/aad`
- User identity: `GET /.auth/me`
- Logout: redirect to `/.auth/logout`
- SWA injects `X-MS-CLIENT-PRINCIPAL` header (base64 JSON) into API calls
- Backend reads this header and checks `userId` against `ADMIN_USER_IDS` env var

**Important:** The `userId` in `X-MS-CLIENT-PRINCIPAL` is SWA's own hashed identifier — it is NOT the same as the AAD Object ID shown in Azure Portal. To find the correct value, temporarily add `yourUserId: principal.userId` to the 403 response in `adminAuth.ts`, trigger a login, read the value from the browser, then revert.

Adding more admins: add their SWA userId to `ADMIN_USER_IDS` as a comma-separated list.

---

## TTS Caching Strategy

1. Step has `audioUrl: null`
2. Frontend calls `POST /api/audio/tts` with `{stepId, lang}`
3. Function checks Blob Storage for cached file — returns URL if found
4. Otherwise: calls Azure Cognitive Services → saves MP3 to Blob → returns URL
5. All subsequent plays hit Blob Storage directly
6. Supported langs validated against allowlist to prevent abuse

---

## Project Structure

```
virtual-tour-app/
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD — deploys on push to main
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── admin/           # Admin panel (pages, components, API client)
│   │   ├── components/      # Public tour components
│   │   ├── hooks/           # useAdminAuth, useAudio, useTour
│   │   ├── i18n/locales/    # en, pt, es, uk
│   │   ├── pages/           # LandingPage, TourPlayerPage
│   │   └── types/           # Shared TypeScript types
│   └── public/
│       └── staticwebapp.config.json  # SWA routing + auth rules
├── backend/                 # Azure Functions API
│   └── src/
│       ├── db/              # cosmosClient, adminCosmosClient
│       ├── functions/       # Public functions
│       │   └── admin/       # Admin functions (mgmt routes)
│       ├── lib/             # adminAuth middleware
│       ├── seed/            # Dev seed script
│       └── storage/         # blobClient, adminBlobClient
├── infra/                   # Azure Bicep IaC
│   └── modules/             # Per-resource Bicep modules
├── CLAUDE.md                # This file
└── README.md
```

---

## Not Built Yet (Planned)

- **Visitor login**: Azure AD B2C with Google / Facebook / Apple
- **Payments**: Stripe Checkout; `isPPV` flag on Tour document
- **PWA / offline**: Service worker + Workbox asset caching
- **Analytics**: Azure Application Insights
- **CDN**: Add Azure Front Door Standard before production launch

---

## Local Development

### Prerequisites
- Node.js 24 (use `nvm use 20` — v25 is not supported by Azure Functions v4)
- Azure Functions Core Tools v4
- Azurite (local storage emulator): `npm install -g azurite`

### Setup

```bash
# Terminal 1 — Azurite storage emulator
azurite --silent --location C:\azurite

# Terminal 2 — Backend
cd backend && npm install && npm run start   # :7071

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev    # :5173
```

Open: `http://localhost:5173/tour/test-museum`

### Seed the database
```bash
cd backend && npx ts-node src/seed/seedData.ts
```

### Local env vars (backend/local.settings.json)
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "COSMOS_CONNECTION_STRING": "...",
    "COSMOS_DATABASE_NAME": "virtual-tour",
    "BLOB_CONNECTION_STRING": "...",
    "BLOB_CONTAINER_NAME": "media",
    "CDN_BASE_URL": "https://<storage>.blob.core.windows.net/media",
    "SPEECH_KEY": "...",
    "SPEECH_REGION": "westeurope",
    "ADMIN_USER_IDS": "<swa-user-id>",
    "DEV_ADMIN_BYPASS": "true"
  }
}
```

`DEV_ADMIN_BYPASS=true` skips the admin auth check locally. Never set this in production.

---

## Deployment

### CI/CD (normal workflow)
Push to `main` branch — GitHub Actions automatically deploys both frontend and backend.

### Provision Azure resources (one-time)
```bash
az group create --name rg-virtual-tour --location eastus

az deployment group create \
  --resource-group rg-virtual-tour \
  --template-file infra/main.bicep \
  --parameters environment=dev
```

### Manual deploy (if needed)

**Backend:**
```powershell
cd backend
npm run build
Compress-Archive -Force -Path dist, host.json, package.json, package-lock.json, node_modules -DestinationPath deploy.zip
```
```bash
az functionapp deployment source config-zip \
  --resource-group rg-virtual-tour \
  --name func-virtualtour \
  --src backend/deploy.zip
```

**Frontend:**
```powershell
cd frontend && npm run build
$token = az staticwebapp secrets list --name swa-virtualtour --resource-group rg-virtual-tour --query "properties.apiKey" -o tsv
npx @azure/static-web-apps-cli deploy ./dist --deployment-token $token --env production
```

### Onboarding a museum with a custom domain
```bash
# Museum adds CNAME: www.museumsite.com → <swa>.azurestaticapps.net
az staticwebapp hostname set --name swa-virtualtour --resource-group rg-virtual-tour --hostname www.museumsite.com
az functionapp cors add --name func-virtualtour --resource-group rg-virtual-tour --allowed-origins https://www.museumsite.com
```
