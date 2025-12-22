# Meld Report Generator

An AI-powered valuation report generation platform for Meld Valuation. Automates the creation of 409A and ASC 718 valuation reports by combining Excel model data, AI-generated narratives, and custom templates.

## Features

- **409A & ASC 718 Reports**: Generate comprehensive valuation reports
- **Excel Model Parsing**: Automatically extract data from valuation Excel models
- **AI-Powered Narratives**: Use Claude AI to generate professional report sections
- **Template System**: Customize report structure and formatting
- **Voice Input**: Record and transcribe company notes using browser audio
- **Background Processing**: Generate reports asynchronously with status updates
- **Email Notifications**: Receive alerts when reports are ready
- **Economic Outlook Integration**: Include relevant market conditions

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

4. Configure environment variables (see [Environment Variables](#environment-variables))

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

Create a `.env` file with the following variables:

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

# Storage (optional)
UPLOAD_BASE_PATH="./uploads"
```

### Generating Secrets

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

## Deployment

### Railway Deployment (Recommended)

1. Create a new project on [Railway](https://railway.app/)

2. Add a PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the DATABASE_URL from the database settings

3. Deploy from GitHub:
   - Connect your repository
   - Railway will auto-detect the configuration from `railway.toml`

4. Configure environment variables:
   - Go to your service settings → Variables
   - Add all required environment variables
   - Make sure NEXTAUTH_URL matches your Railway domain

5. Add persistent storage for uploads:
   - Go to service settings → Volumes
   - Create a volume mounted at `/app/uploads`
   - Set `UPLOAD_BASE_PATH=/app/uploads`

6. Deploy:
   - Push to your connected branch
   - Railway will automatically build and deploy

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t meld-report-generator .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  -e ALLOWED_EMAIL="..." \
  -e ANTHROPIC_API_KEY="..." \
  -v ./uploads:/app/uploads \
  meld-report-generator
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/meld
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
      - ALLOWED_EMAIL=${ALLOWED_EMAIL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - uploads:/app/uploads
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=meld
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  uploads:
  postgres_data:
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── engagement/        # Report flow components
│   ├── settings/          # Settings page components
│   └── ui/                # Reusable UI components
├── lib/                   # Core libraries
│   ├── ai/                # AI integration (Claude)
│   ├── auth/              # Authentication config
│   ├── document/          # Word document generation
│   ├── email/             # Email notifications
│   ├── excel/             # Excel parsing
│   ├── generation/        # Report generation pipeline
│   ├── jobs/              # Background job queue
│   ├── research/          # Web research utilities
│   └── storage/           # File storage
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## API Endpoints

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth.js handlers

### Engagements
- `GET /api/engagements` - List engagements
- `POST /api/engagements` - Create new engagement
- `GET /api/engagements/[id]` - Get engagement details

### Generation
- `POST /api/generate` - Start report generation
- `GET /api/generate/status` - Check generation status

### Settings
- `GET/POST/DELETE /api/settings/templates` - Manage templates
- `GET/POST/DELETE /api/settings/outlooks` - Manage outlooks
- `GET/POST/DELETE /api/settings/examples` - Manage examples

### Health
- `GET /api/health` - Health check endpoint

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run db:push  # Push Prisma schema to database
npm run db:studio # Open Prisma Studio
```

## Usage Guide

### Creating a Report

1. **Login**: Sign in with authorized Google account
2. **New Report**: Click "New Report" button
3. **Select Type**: Choose 409A or ASC 718
4. **Upload Model**: Upload the Excel valuation model
5. **Add Notes**: Record or type company notes
6. **Review**: Verify extracted data
7. **Generate**: Start AI report generation
8. **Download**: Access completed report from dashboard

### Settings Configuration

- **Templates**: Upload Word templates for report structure
- **Outlooks**: Add quarterly economic outlook documents
- **Style Examples**: Provide example documents for AI style matching

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Build to verify: `npm run build`
5. Submit a pull request

## License

Proprietary - Meld Valuation

## Support

For support, contact the development team or open an issue in the repository.
