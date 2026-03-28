# Virtual Tour App

QR-code-triggered museum tour web app. Visitors scan a QR code → choose language + tour type → step through artworks with images, text, and audio narration.

Multi-museum SaaS — one deployment serves all museums.

## Architecture

```
Browser / Phone
    └── Azure Static Web Apps (React SPA)
            ├── /tour/*     Public tour player
            └── /admin/*    Admin panel (Azure AD protected)
                    └── Azure Functions API (Node.js 20)
                            ├── Azure Cosmos DB       (content)
                            ├── Azure Blob Storage    (media)
                            └── Azure Cognitive Services Speech (TTS)
```

See [CLAUDE.md](CLAUDE.md) for full architecture documentation, API reference, and decision log.

## Project Structure

```
virtual-tour-app/
├── .github/workflows/   GitHub Actions CI/CD
├── frontend/            React + Vite + TypeScript SPA
├── backend/             Azure Functions API
└── infra/               Azure Bicep IaC
```

## Local Development

### Prerequisites
- Node.js 20 (`nvm use 20`)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- Azurite: `npm install -g azurite`

### Setup

```bash
# Terminal 1 — storage emulator
azurite --silent --location C:\azurite

# Terminal 2 — backend (http://localhost:7071)
cd backend
cp .env.example .env    # fill in connection strings
npm install
npm run start

# Terminal 3 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/tour/test-museum`

### Seed sample data
```bash
cd backend && npx ts-node src/seed/seedData.ts
```

## Deployment

Deployments are automated via GitHub Actions on every push to `main`.

### First-time Azure setup

```bash
# Create resource group
az group create --name rg-virtual-tour --location eastus

# Provision all resources (Cosmos DB, Blob Storage, Functions, Static Web App)
az deployment group create \
  --resource-group rg-virtual-tour \
  --template-file infra/main.bicep \
  --parameters environment=dev

# Link Functions app to Static Web App
az staticwebapp backends link \
  --name swa-virtualtour \
  --resource-group rg-virtual-tour \
  --backend-resource-id $(az functionapp show --name func-virtualtour --resource-group rg-virtual-tour --query id -o tsv) \
  --backend-region eastus
```

### GitHub Actions secrets

Add these in repo → Settings → Secrets and variables → Actions:

| Secret | Command to get value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `az staticwebapp secrets list --name swa-virtualtour --resource-group rg-virtual-tour --query "properties.apiKey" -o tsv` |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | `az functionapp deployment list-publishing-profiles --name func-virtualtour --resource-group rg-virtual-tour --xml` |

### Azure AD admin setup (one-time)

1. Azure Portal → Static Web App → Authentication → Add provider → Microsoft → Save
2. Set admin user: `az functionapp config appsettings set --name func-virtualtour --resource-group rg-virtual-tour --settings ADMIN_USER_IDS=<swa-user-id>`

> The SWA user ID is not the AAD Object ID. See CLAUDE.md for how to retrieve it.

## Admin Panel

Navigate to `/admin` — sign in with your Microsoft account.

Manage museums, tours, steps, and media uploads from the browser. No database or CLI access required.

## QR Code Format

Each museum QR code points to:
```
https://<your-domain>/tour/<museumSlug>
```

## Adding a Museum with a Custom Domain

1. Museum adds a DNS CNAME record: `www.museumsite.com → <swa>.azurestaticapps.net`
2. Register the domain on SWA:
```bash
az staticwebapp hostname set --name swa-virtualtour --resource-group rg-virtual-tour --hostname www.museumsite.com
az functionapp cors add --name func-virtualtour --resource-group rg-virtual-tour --allowed-origins https://www.museumsite.com
```
3. Create the museum via the admin panel at `/admin`

## Supported Languages

English, Portuguese, Spanish, Ukrainian. Each museum selects which languages to offer. Audio uses Azure Neural TTS voices and is cached after first generation.
