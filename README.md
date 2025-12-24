# Meld AI Report Generator

An AI-powered section generator for valuation reports. Generates the narrative sections of 409A and Gift & Estate (59-60) valuation reports, outputting a clean Word document with all sections ready for copy/paste into your templates.

## What It Does

Instead of generating complete reports from templates, this tool generates the **hard-to-write narrative sections**:

- **Company Overview** - AI-researched company description
- **Industry Outlook** - AI-generated industry analysis with citations
- **Economic Outlook** - Pulled from your quarterly outlook documents
- **Valuation Analysis** - Narratives for each approach (GPC, M&A, Income, Backsolve)
- **Conclusion & Weighting** - Explanation of weighting rationale
- **Review Notes** - Flags for items needing attention

The output is a Word document with clearly labeled sections that you can copy into your existing report templates.

## Features

- **Excel Model Parsing**: Automatically extracts company name, valuation date, approaches, values, weights, DLOM, and notes
- **AI-Powered Narratives**: Uses Claude AI to generate professional report sections
- **Style Matching**: Upload example reports for the AI to match your writing style
- **Background Processing**: Generate sections asynchronously with progress updates
- **Email Notifications**: Receive alerts when sections are ready
- **Economic Outlook Integration**: Pull from stored quarterly outlook documents
- **30-Day Data Retention**: Automatic cleanup of old engagements

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: Anthropic Claude API
- **Documents**: docx library for Word generation
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud Console project (for OAuth)
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meld-report-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables (see below)

5. Initialize the database:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meld_reports"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
ALLOWED_EMAIL="authorized@meldvaluation.com"

# AI
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Email (optional in development)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@meldvaluation.com"

# Storage
UPLOAD_BASE_PATH="./uploads"
```

## Usage

### Workflow

1. **Select Report Type** - Choose 409A or Gift & Estate (59-60)
2. **Upload Excel Model** - Upload your valuation model (.xlsx, .xls, .xlsm)
3. **Enter Context** (optional) - Add qualitative notes about comp selection, weighting rationale, etc.
4. **Review & Generate** - Verify extracted data and start generation
5. **Receive Email** - Get notified when sections are ready
6. **Download** - Get the Word document with all sections
7. **Copy to Template** - Paste each section into your actual report template

### Output Document

The generated Word document contains:

```
GENERATED REPORT SECTIONS
Company Name: [from model]
Valuation Date: [date]
Report Type: 409A/59-60
Generated: [timestamp]

────────────────────────────────

COMPANY OVERVIEW
[AI-generated narrative]

────────────────────────────────

INDUSTRY OUTLOOK
[AI-generated narrative with citations]

Sources:
[1] Source citation...

────────────────────────────────

ECONOMIC OUTLOOK
[From quarterly outlook document]

────────────────────────────────

VALUATION ANALYSIS - GUIDELINE PUBLIC COMPANY
[AI-generated narrative]

────────────────────────────────

[Additional approach sections as applicable]

────────────────────────────────

CONCLUSION & WEIGHTING RATIONALE
[Weighting table and narrative]

────────────────────────────────

FLAGS & REVIEW NOTES
[Items needing attention]
```

### Settings

Configure in **Settings**:

- **Economic Outlooks**: Upload quarterly economic outlook documents
- **Style Examples**: Upload example reports for AI style matching

## Deployment

### Railway (Recommended)

1. Create a Railway project with PostgreSQL
2. Deploy from GitHub
3. Set environment variables
4. Add a volume mounted at `/app/uploads`
5. Push to deploy

### Docker

```bash
docker build -t meld-report-generator .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e ANTHROPIC_API_KEY="..." \
  [other env vars] \
  -v ./uploads:/app/uploads \
  meld-report-generator
```

## File Naming

Output files are named:
```
[Company Name] - [Report Type] - [Valuation Date] - SECTIONS.docx
```

## License

Proprietary - Meld Valuation
