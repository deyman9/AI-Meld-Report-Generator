# MELD AI Valuation Report Generator

An AI-powered web application that automates the generation of business valuation reports. Upload your Excel valuation model, optionally provide voice commentary, and receive a professionally formatted Word document draft.

## Features

- **Automated Report Generation** — Transforms valuation models into formatted Word documents
- **Two Report Types** — Supports 409A and Gift & Estate (59-60) valuations
- **Excel Model Parsing** — Extracts key data points, approaches, and conclusions
- **Voice Input** — Optional brain dump via speech-to-text for qualitative context
- **AI-Powered Narratives** — Generates company overviews, industry outlooks, and valuation analysis
- **Template-Based** — Uses your firm's Word templates with placeholder replacement
- **Smart Flagging** — Highlights uncertain content and missing data for review
- **Email Notifications** — Get notified when your report is ready
- **30-Day Retention** — Automatic cleanup of engagement data for confidentiality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude Opus 4.5 (Anthropic API)
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **Document Generation**: docx.js
- **Hosting**: Railway

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Console project (for OAuth)
- Anthropic API key
- SMTP email service credentials

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/meld-report-generator.git
cd meld-report-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meld_reports"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
ALLOWED_EMAIL="your-email@example.com"

# AI
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="reports@yourdomain.com"

# Storage (optional, defaults to ./uploads)
UPLOAD_BASE_PATH="./uploads"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `ALLOWED_EMAIL` | Email address allowed to log in | Yes |
| `ANTHROPIC_API_KEY` | Claude API key from Anthropic | Yes |
| `SMTP_HOST` | SMTP server hostname | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASSWORD` | SMTP password | Yes |
| `SMTP_FROM` | From address for emails | Yes |
| `UPLOAD_BASE_PATH` | File storage directory | No |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your environment variables

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── engagements/     # Engagement CRUD
│   │   ├── templates/       # Template management
│   │   ├── economic-outlooks/
│   │   ├── style-examples/
│   │   ├── upload/          # File uploads
│   │   ├── parse-model/     # Excel parsing
│   │   └── jobs/            # Background job status
│   ├── (auth)/              # Auth pages (login)
│   └── (dashboard)/         # Protected pages
│       ├── dashboard/       # Main dashboard
│       ├── new/             # New engagement flow
│       └── settings/        # Admin settings
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   ├── engagement/          # Engagement flow components
│   ├── settings/            # Settings components
│   └── layout/              # Layout components
├── lib/
│   ├── ai/                  # Claude API integration
│   ├── auth/                # Auth utilities
│   ├── db/                  # Prisma client
│   ├── document/            # Word doc generation
│   ├── email/               # Email sending
│   ├── excel/               # Excel parsing
│   ├── generation/          # Report generation pipeline
│   ├── jobs/                # Background job queue
│   ├── narrative/           # AI narrative generation
│   ├── research/            # Company/industry research
│   ├── storage/             # File storage utilities
│   └── utils/               # General utilities
└── types/                   # TypeScript type definitions
```

## Usage

### Initial Setup (Settings Page)

Before generating reports, upload your assets:

1. **Templates** — Upload your 409A and 59-60 Word templates with placeholders (`*COMPANY`, `*VALUATIONDATE`)
2. **Economic Outlooks** — Upload quarterly economic outlook documents (named by quarter/year)
3. **Style Examples** — Upload 1-2 redacted sample reports for AI tone training

### Generating a Report

1. Click "New Report" on the dashboard
2. Select report type (409A or 59-60)
3. Upload your Excel valuation model
4. Optionally record a voice brain dump with qualitative context
5. Review extracted data and click "Generate"
6. Wait for email notification (5-10 minutes)
7. Download your report and edit in Word

### Excel Model Requirements

Your valuation model should have:

- Worksheets named `start` and `end` to mark exhibit boundaries
- Company name in cell `LEs!G819`
- Valuation date in cell `LEs!G824`
- A Summary worksheet with approaches and concluded values
- Notes labeled "notes" at the bottom of exhibit worksheets

## Deployment (Railway)

### 1. Create Railway Project

1. Sign up at [Railway](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Add a persistent volume for file uploads

### 2. Connect Repository

1. Connect your GitHub repository
2. Railway will auto-detect Next.js

### 3. Configure Environment Variables

Add all environment variables in Railway dashboard. Generate a new `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Configure Build Settings

Railway should auto-detect, but verify:

- Build command: `npm run build`
- Start command: `npm run start`

### 5. Deploy

Push to your main branch — Railway will automatically deploy.

### 6. Post-Deployment

1. Update Google OAuth redirect URIs with your Railway URL
2. Run database migrations: `npx prisma db push`
3. Upload templates and assets via the Settings page

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push Prisma schema to database
npm run db:studio  # Open Prisma Studio
```

## Data Retention

- **Templates, Style Examples, Economic Outlooks**: Stored permanently
- **Uploaded Models, Voice Transcripts, Generated Reports**: Deleted after 30 days

## Troubleshooting

### "Unauthorized" on login
- Verify `ALLOWED_EMAIL` matches your Google account email exactly

### Excel parsing fails
- Ensure worksheets named `start` and `end` exist
- Check that `LEs` worksheet exists with data in G819 and G824

### Report generation stuck
- Check API key is valid
- Review server logs for errors
- Verify templates are uploaded

### Emails not sending
- Verify SMTP credentials
- Check spam folder
- Test with a simple SMTP client

## License

Proprietary — MELD Valuation

---

Built with ❤️ using [Next.js](https://nextjs.org), [Prisma](https://prisma.io), and [Claude](https://anthropic.com)
