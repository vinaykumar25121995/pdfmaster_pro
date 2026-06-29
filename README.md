# PDFMaster Pro

PDFMaster Pro is a complete professional-grade PDF document platform designed as a web application (React, Next.js, Express, PostgreSQL) and a downloadable Windows desktop application (Electron). The application is equipped with full vector editing canvases, client-side WebAssembly OCR (Tesseract.js), document converters, secure cryptographic signatures, and conversational AI document assistants.

---

## Workspace Architecture

```text
pdfmaster-pro/
├── backend/          # Express REST API (TypeScript)
│   ├── src/
│   │   ├── controllers/  # Controllers for Auth, Docs, AI, PDF Utilities, Admin
│   │   ├── db/           # Schema SQL and connection pooling
│   │   ├── middleware/   # JWT verification and Admin requirements
│   │   └── server.ts     # Express entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/         # Next.js 14 App Router (Tailwind CSS, TypeScript)
│   ├── src/app/
│   │   ├── admin/        # Platform Admin dashboard
│   │   ├── auth/         # Login & Sign Up templates
│   │   ├── dashboard/    # Sidebar navigation shell & modules
│   │   │   ├── documents/ # Folder manager & tag libraries
│   │   │   ├── reader/    # PDF Reader continuous scroll canvas
│   │   │   ├── editor/    # Shape drawer and annotation overlays
│   │   │   ├── ocr/       # Wasm OCR (Tesseract.js local worker)
│   │   │   ├── convert/   # Format conversion panels
│   │   │   ├── utilities/ # Merging, splitting, watermarking blocks
│   │   │   └── signature/ # Draw, type, & placement overlays
│   │   └── page.tsx      # Premium marketing Landing Page
│   ├── Dockerfile
│   └── package.json
│
├── desktop/          # Electron Windows wrapper (offline supports)
│   ├── main.js       # Main process handles windows & IPC bridges
│   ├── preload.js    # Preload scripts for local file accesses
│   └── package.json
│
└── docker-compose.yml # Service container orchestrations
```

---

## Features Matrix

1. **Premium Landing Page**: Dynamic feature cards, price toggles, FAQ segments, reviews, and dark/light themes.
2. **Interactive Document Manager**: Create folders, filter tags, search text, soft delete (Trash), and drag-and-drop file upload areas.
3. **Continuous PDF Reader**: Zoom overlays, 90-degree rotations, presentation slides, night mode, page-by-page bookmarks, and highlighted keyword searches.
4. **Vector PDF Editor**: Edit text, add rectangles/circles/arrows/lines, paint drawings (pencil/marker), and add comment reply threads.
5. **Local WebAssembly OCR**: Select languages (English, Hindi, Spanish, Chinese), preprocess image skew/contrast, and parse to DOCX, JSON, or TXT.
6. **Drag-and-Drop Signatures**: Draw or type signature shapes, place seals on document pages, timestamp stamps, and hash verify revisions.
7. **AI Chatbot Assistant**: Generate document summaries, find contacts, build data tables, and ask contextual questions.
8. **Platform Admin Panel**: Revenue widgets, user lists, active subscription details, error logs, and customer support tickets.

---

## Local Installation

### Prerequisites
- [Node.js v18+](https://nodejs.org/)
- PostgreSQL (Optional; falls back to full mock in-memory DB)
- [Gemini API Key](https://aistudio.google.com/) (Optional; falls back to local heuristic extraction engines)

### 1. Run via Docker Compose (Recommended)
Compile and launch database, backend API, and Next.js frontend instantly:
```bash
docker-compose up --build
```
- Frontend starts at: `http://localhost:3000`
- Backend API starts at: `http://localhost:5000`

### 2. Manual Development Setup

**Start Backend Server:**
```bash
cd backend
npm install
npm run dev
```

**Start Next.js Frontend:**
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in browser.

**Start Electron Desktop:**
```bash
cd ../desktop
npm install
npm run start
```

---

## Environment Configuration
Configure in `backend/.env` or docker environment mappings:
- `PORT`: REST port (default 5000)
- `DATABASE_URL`: Postgres SQL connection string
- `JWT_SECRET`: Secret key for authentication token hashes
- `GEMINI_API_KEY`: API key for Gemini 2.5 Flash model features

---

## Mock Access Credentials

For local testing and evaluation, the following pre-seeded logins can be used:

### Administrator Account
- **Email**: `admin@pdfmaster.com`
- **Password**: `admin123`

### Standard User Account
- **Email**: `user@pdfmaster.com`
- **Password**: `admin123`
