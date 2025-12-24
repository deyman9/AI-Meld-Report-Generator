# AI Valuation Report Generator — Section Generator

This project generates the narrative sections of valuation reports (409A and Gift & Estate 59-60), outputting them as a clean Word document for easy copy/paste into existing templates.

## Architecture Summary

- **Input**: Excel valuation model + optional qualitative context
- **Processing**: AI generates narrative sections using Claude
- **Output**: Word document with all sections clearly labeled

## Core Features

- [x] Excel model parsing (company name, date, approaches, values, weights, DLOM)
- [x] Qualitative context input (text field)
- [x] AI generation of report sections
- [x] Style example matching
- [x] Economic outlook integration
- [x] Background job processing
- [x] Email notifications
- [x] 30-day data cleanup
- [x] Google OAuth authentication

## User Flow

1. Select report type (409A or 59-60)
2. Upload Excel model
3. Enter qualitative context (optional)
4. Review extracted data
5. Generate sections
6. Receive email notification
7. Download Word document

## Output Sections

1. **Header** - Company, date, report type, timestamp
2. **Company Overview** - AI-generated narrative
3. **Industry Outlook** - AI-generated with citations
4. **Economic Outlook** - From stored quarterly document
5. **Valuation Analysis** - For each approach used
6. **Conclusion & Weighting** - Table and rationale
7. **Flags & Review Notes** - Items needing attention

## Settings

- **Economic Outlooks** - Upload quarterly outlook documents
- **Style Examples** - Upload example reports for AI style matching

## Deployment

Deployed on Railway with:
- PostgreSQL database
- Persistent volume for uploads
- Docker-based builds

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login page
│   ├── (dashboard)/       # Dashboard and settings
│   └── api/               # API routes
├── components/
│   ├── engagement/        # Report generation flow
│   ├── settings/          # Settings components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── ai/                # Claude AI integration
│   ├── document/          # Word document generation
│   ├── excel/             # Excel model parsing
│   ├── generation/        # Report generation pipeline
│   ├── jobs/              # Background job queue
│   └── research/          # Company/industry research
└── types/                 # TypeScript definitions
```

## Recent Changes

### Section Generator Refactor (Dec 2024)

- Removed template upload/management
- Removed voice recording (replaced with text input)
- Simplified document output to section-based format
- Renamed `voiceTranscript` to `qualitativeContext`
- Simplified engagement flow to 4 steps

## Environment Variables

```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.railway.app
ALLOWED_EMAIL=user@meldvaluation.com
ANTHROPIC_API_KEY=...
UPLOAD_BASE_PATH=/app/uploads
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=...
```

## Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npx prisma studio # Database GUI
```
