# AI Valuation Report Generator — Project Checklist

## Pre-Development Setup

### Accounts & Services
- [ ] Create Railway account (https://railway.app)
- [ ] Set up Google Cloud Console project for OAuth
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credentials
  - [ ] Configure authorized redirect URIs
  - [ ] Note Client ID and Client Secret
- [ ] Create Anthropic account and get API key (https://console.anthropic.com)
- [ ] Set up email service (choose one):
  - [ ] SendGrid account
  - [ ] Mailgun account
  - [ ] AWS SES
  - [ ] Other SMTP provider
- [ ] Get SMTP credentials (host, port, user, password)

### Local Development Environment
- [ ] Install Node.js (v18+ recommended)
- [ ] Install npm or yarn
- [ ] Install Git
- [ ] Install VS Code or Cursor IDE
- [ ] Install PostgreSQL locally (or use Docker)
- [ ] Set up a code repository (GitHub/GitLab)

### Prepare Assets
- [ ] Gather 409A report template (.docx)
- [ ] Gather 59-60 report template (.docx)
- [ ] Redact and prepare 1-2 style example reports
- [ ] Prepare current Economic Outlook document
- [ ] Prepare sample Excel valuation model for testing
- [ ] Note placeholder syntax used in templates (*COMPANY, *VALUATIONDATE, etc.)

---

## Phase 1: Project Foundation

### 1.1 Initialize Next.js Project
- [ ] Create new Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up folder structure:
  - [ ] `/src/app/api`
  - [ ] `/src/app/(auth)`
  - [ ] `/src/app/(dashboard)`
  - [ ] `/src/components/ui`
  - [ ] `/src/lib/db`
  - [ ] `/src/lib/utils`
  - [ ] `/src/types`
- [ ] Create `.env.example` with all placeholders
- [ ] Create `.env.local` with actual values
- [ ] Create basic `layout.tsx`
- [ ] Create placeholder `page.tsx`
- [ ] Verify project runs with `npm run dev`
- [ ] Add `.gitignore` (ensure .env.local is ignored)
- [ ] Initial commit to repository

### 1.2 Set Up Prisma and Database
- [ ] Install Prisma and @prisma/client
- [ ] Run `npx prisma init`
- [ ] Create database schema:
  - [ ] User model
  - [ ] Template model
  - [ ] StyleExample model
  - [ ] EconomicOutlook model
  - [ ] Engagement model
  - [ ] GeneratedReport model
  - [ ] ReportType enum
  - [ ] EngagementStatus enum
- [ ] Create Prisma client singleton (`/src/lib/db/prisma.ts`)
- [ ] Add db scripts to package.json
- [ ] Set up local PostgreSQL database
- [ ] Run `npx prisma db push`
- [ ] Verify with `npx prisma studio`
- [ ] Commit schema changes

### 1.3 Set Up NextAuth with Google OAuth
- [ ] Install next-auth and @auth/prisma-adapter
- [ ] Create auth options (`/src/lib/auth/options.ts`)
- [ ] Configure Google provider
- [ ] Implement email whitelist check in signIn callback
- [ ] Add user.id to session callback
- [ ] Create NextAuth API route (`/src/app/api/auth/[...nextauth]/route.ts`)
- [ ] Create session helpers (`/src/lib/auth/session.ts`)
- [ ] Create type definitions (`/src/types/next-auth.d.ts`)
- [ ] Create requireAuth utility
- [ ] Create SessionProvider wrapper component
- [ ] Update layout.tsx with SessionProvider
- [ ] Test authentication flow
- [ ] Commit auth setup

### 1.4 Create Login Page UI
- [ ] Create login page (`/src/app/(auth)/login/page.tsx`)
- [ ] Create LoginForm component
- [ ] Create reusable Button component with variants
- [ ] Style login page (centered card, branding)
- [ ] Implement Google sign-in button
- [ ] Handle redirect after login
- [ ] Update root page.tsx with auth redirect
- [ ] Test login flow end-to-end
- [ ] Test unauthorized email rejection
- [ ] Commit login page

### 1.5 Create Dashboard Layout and Shell
- [ ] Create dashboard layout (`/src/app/(dashboard)/layout.tsx`)
- [ ] Implement auth check and redirect
- [ ] Create DashboardLayout component
- [ ] Create Header component with:
  - [ ] Logo/branding
  - [ ] User email display
  - [ ] Sign out button
- [ ] Create dashboard home page
- [ ] Create Card component
- [ ] Create EmptyState component
- [ ] Add navigation links
- [ ] Test navigation flow
- [ ] Test sign out
- [ ] Commit dashboard shell

---

## Phase 2: File Management Infrastructure

### 2.1 Set Up File Storage Utilities
- [ ] Create storage directory constants
- [ ] Implement `ensureDirectories()`
- [ ] Implement `generateFileName()`
- [ ] Implement `saveFile()`
- [ ] Implement `deleteFile()`
- [ ] Implement `getFilePath()`
- [ ] Implement `fileExists()`
- [ ] Create storage types (`/src/types/storage.ts`)
- [ ] Create cleanup utilities (basic structure)
- [ ] Create initialization function
- [ ] Add UPLOAD_BASE_PATH to .env.example
- [ ] Test directory creation
- [ ] Commit storage utilities

### 2.2 Create File Upload API Endpoint
- [ ] Create upload API route (`/src/app/api/upload/route.ts`)
- [ ] Implement multipart form data parsing
- [ ] Create file validation utilities:
  - [ ] `validateFileType()`
  - [ ] `validateFileSize()`
  - [ ] `getFileExtension()`
  - [ ] ALLOWED_TYPES constant
- [ ] Implement file type validation by upload type
- [ ] Implement file size validation (50MB max)
- [ ] Save files to appropriate directories
- [ ] Return proper JSON responses
- [ ] Handle all error cases (400, 401, 500)
- [ ] Create API types (`/src/types/api.ts`)
- [ ] Create test upload page (temporary)
- [ ] Test uploads for each file type
- [ ] Commit upload endpoint

### 2.3 Create Template Management System
- [ ] Create templates API routes:
  - [ ] GET `/api/templates` - list all
  - [ ] POST `/api/templates` - upload new
  - [ ] GET `/api/templates/[id]` - get single
  - [ ] DELETE `/api/templates/[id]` - delete
- [ ] Create settings page (`/src/app/(dashboard)/settings/page.tsx`)
- [ ] Create TemplateManager component:
  - [ ] Template list table
  - [ ] Upload form (name, type, file)
  - [ ] Delete with confirmation
  - [ ] Loading states
- [ ] Create Modal component
- [ ] Create Table component
- [ ] Add Settings link to navigation
- [ ] Test template upload
- [ ] Test template list display
- [ ] Test template deletion
- [ ] Commit template management

### 2.4 Create Economic Outlook Management
- [ ] Create economic-outlooks API routes:
  - [ ] GET `/api/economic-outlooks` - list all
  - [ ] POST `/api/economic-outlooks` - upload new
  - [ ] DELETE `/api/economic-outlooks/[id]` - delete
- [ ] Create quarter/year utility functions:
  - [ ] `getQuarterFromDate()`
  - [ ] `findOutlookForDate()`
- [ ] Create EconomicOutlookManager component:
  - [ ] Outlook list
  - [ ] Upload form (quarter, year, file)
  - [ ] Delete with confirmation
  - [ ] Gap warnings
- [ ] Add to settings page
- [ ] Test outlook upload
- [ ] Test quarter/year validation
- [ ] Test duplicate prevention
- [ ] Commit outlook management

### 2.5 Create Style Examples Management
- [ ] Create style-examples API routes:
  - [ ] GET `/api/style-examples` - list all
  - [ ] POST `/api/style-examples` - upload new
  - [ ] DELETE `/api/style-examples/[id]` - delete
- [ ] Create StyleExampleManager component:
  - [ ] Examples list
  - [ ] Upload form (name, type, file)
  - [ ] Delete with confirmation
- [ ] Create SettingsSection component
- [ ] Add descriptions to each settings section
- [ ] Complete settings page layout
- [ ] Test all three managers together
- [ ] Commit style examples management
- [ ] **Phase 2 Complete Checkpoint**: Test all file management flows

---

## Phase 3: Excel Parsing

### 3.1 Set Up Excel Parser Foundation
- [ ] Install xlsx (SheetJS) library
- [ ] Create Excel types (`/src/types/excel.ts`):
  - [ ] WorkbookData
  - [ ] SheetInfo
  - [ ] CellValue
  - [ ] ParsedModel
  - [ ] ExhibitData
  - [ ] SummaryData
  - [ ] ApproachData
- [ ] Create parser module (`/src/lib/excel/parser.ts`):
  - [ ] `loadWorkbook()`
  - [ ] `getSheetNames()`
  - [ ] `findExhibitBoundaries()`
  - [ ] `getCellValue()`
  - [ ] `getSheetData()`
- [ ] Create index export file
- [ ] Test with sample Excel file
- [ ] Commit parser foundation

### 3.2 Implement Data Extraction Logic
- [ ] Implement `extractCompanyInfo()`:
  - [ ] Get company name from LEs!G819
  - [ ] Get valuation date from LEs!G824
  - [ ] Handle Excel date parsing
- [ ] Implement `extractExhibits()`:
  - [ ] Find start/end boundaries
  - [ ] Extract sheets between boundaries
  - [ ] Collect data from each exhibit
- [ ] Implement `findNotesInSheet()`:
  - [ ] Scan for "notes" labels
  - [ ] Extract note content
- [ ] Implement `extractSummaryData()`:
  - [ ] Find Summary sheet
  - [ ] Extract approaches
  - [ ] Extract values and weights
- [ ] Implement `extractDLOM()`:
  - [ ] Search for DLOM in exhibits
- [ ] Create main `parseValuationModel()` function
- [ ] Add comprehensive error handling
- [ ] Add warning collection
- [ ] Test with sample model
- [ ] Commit extraction logic

### 3.3 Create Model Parsing API Endpoint
- [ ] Create parse-model API route
- [ ] Implement POST handler
- [ ] Create `formatForAPI()` utility
- [ ] Add ParseModelResponse type
- [ ] Add ParseModelRequest type
- [ ] Create test parser page (temporary)
- [ ] Test parsing with various Excel files
- [ ] Test error cases:
  - [ ] Missing sheets
  - [ ] Invalid format
  - [ ] Missing data
- [ ] Commit parsing API
- [ ] **Phase 3 Complete Checkpoint**: Verify parsing works correctly

---

## Phase 4: Engagement Flow

### 4.1 Create New Engagement Page - Basic Structure
- [ ] Create new engagement page (`/src/app/(dashboard)/new/page.tsx`)
- [ ] Create NewEngagementFlow component:
  - [ ] Multi-step state management
  - [ ] Step navigation (Back/Next)
  - [ ] Step 1-4 structure
- [ ] Create StepIndicator component
- [ ] Create StepReportType component:
  - [ ] 409A selection card
  - [ ] 59-60 selection card
- [ ] Create SelectionCard component
- [ ] Implement step 1 flow
- [ ] Test report type selection
- [ ] Commit engagement structure

### 4.2 Implement Model Upload Step
- [ ] Create StepUploadModel component
- [ ] Create FileDropzone component:
  - [ ] Drag-and-drop support
  - [ ] Click-to-browse
  - [ ] Visual states (idle, hover, uploading, error)
- [ ] Create ParsedDataPreview component
- [ ] Implement upload flow:
  - [ ] Upload file via API
  - [ ] Auto-trigger parsing
  - [ ] Display extracted data
  - [ ] Handle errors
- [ ] Wire up to NewEngagementFlow
- [ ] Test file upload
- [ ] Test parsing integration
- [ ] Test error states
- [ ] Commit model upload step

### 4.3 Implement Voice Input Step
- [ ] Create useSpeechRecognition hook:
  - [ ] Web Speech API integration
  - [ ] Browser compatibility check
  - [ ] Continuous mode
  - [ ] Interim results
- [ ] Create VoiceRecorder component:
  - [ ] Microphone button
  - [ ] Recording indicator
  - [ ] Timer display
  - [ ] Compatibility fallback
- [ ] Create TextArea component
- [ ] Create StepVoiceInput component:
  - [ ] Instructions
  - [ ] Recorder
  - [ ] Transcript editor
  - [ ] Word count
- [ ] Wire up to NewEngagementFlow
- [ ] Test voice recording
- [ ] Test transcript editing
- [ ] Test skip functionality
- [ ] Commit voice input step

### 4.4 Implement Review and Generate Step
- [ ] Create StepReview component:
  - [ ] Summary display
  - [ ] Warning section
  - [ ] Generate button
- [ ] Create engagements API routes:
  - [ ] GET `/api/engagements` - list user's engagements
  - [ ] POST `/api/engagements` - create new
  - [ ] GET `/api/engagements/[id]` - get single
  - [ ] PATCH `/api/engagements/[id]` - update
- [ ] Create generate API route:
  - [ ] POST `/api/engagements/[id]/generate`
- [ ] Wire up generate flow:
  - [ ] Create engagement
  - [ ] Trigger generation
  - [ ] Redirect to dashboard
- [ ] Test engagement creation
- [ ] Test generate trigger
- [ ] Commit review step

### 4.5 Update Dashboard with Engagement List
- [ ] Update dashboard page to fetch engagements
- [ ] Create EngagementList component:
  - [ ] Table/card layout
  - [ ] Company name, type, date columns
  - [ ] Status badges
  - [ ] Action buttons
- [ ] Create Badge component
- [ ] Create download API route:
  - [ ] GET `/api/engagements/[id]/download`
- [ ] Implement status-based actions:
  - [ ] Draft: Continue link
  - [ ] Processing: Spinner
  - [ ] Complete: Download button
  - [ ] Error: View error button
- [ ] Add refresh functionality
- [ ] Test engagement list display
- [ ] Test status badges
- [ ] Commit dashboard updates
- [ ] **Phase 4 Complete Checkpoint**: Full engagement flow works

---

## Phase 5: AI Integration

### 5.1 Set Up Claude API Client
- [ ] Install @anthropic-ai/sdk
- [ ] Create AI client (`/src/lib/ai/client.ts`)
- [ ] Create generate utilities (`/src/lib/ai/generate.ts`):
  - [ ] `generateText()`
  - [ ] `generateWithContext()`
  - [ ] Retry logic with exponential backoff
- [ ] Create AI types (`/src/types/ai.ts`)
- [ ] Create AIError class
- [ ] Create test AI endpoint (temporary)
- [ ] Test API connection
- [ ] Test error handling
- [ ] Commit AI client

### 5.2 Implement Company Research Module
- [ ] Create company research module (`/src/lib/research/company.ts`)
- [ ] Create company research prompt (`/src/lib/ai/prompts/companyResearch.ts`)
- [ ] Implement `researchCompany()`:
  - [ ] Build comprehensive prompt
  - [ ] Request structured output
  - [ ] Parse response
- [ ] Create CompanyResearch type
- [ ] Implement `parseCompanyResearch()`
- [ ] Create test research endpoint (temporary)
- [ ] Test with various company names
- [ ] Test with context from voice transcript
- [ ] Commit company research

### 5.3 Implement Industry Research Module
- [ ] Create industry research module (`/src/lib/research/industry.ts`)
- [ ] Create industry research prompt (`/src/lib/ai/prompts/industryResearch.ts`)
- [ ] Implement `researchIndustry()`:
  - [ ] Build comprehensive prompt
  - [ ] Request citations
  - [ ] Parse response
- [ ] Create IndustryResearch type
- [ ] Create Citation type
- [ ] Implement `formatIndustryWithCitations()`
- [ ] Test with various industries
- [ ] Verify citation formatting
- [ ] Commit industry research

### 5.4 Implement Valuation Narrative Generation
- [ ] Create valuation prompts (`/src/lib/ai/prompts/valuationNarrative.ts`):
  - [ ] `buildGuidelineCompanyPrompt()`
  - [ ] `buildMATransactionPrompt()`
  - [ ] `buildIncomeApproachPrompt()`
  - [ ] `buildConclusionPrompt()`
- [ ] Create narrative generator (`/src/lib/narrative/generator.ts`):
  - [ ] `generateApproachNarrative()`
  - [ ] `generateConclusionNarrative()`
  - [ ] `generateAllNarratives()`
- [ ] Implement weighting heuristics:
  - [ ] OPM > 1 year → minimal weight
  - [ ] Pre-revenue → lower income weight
  - [ ] Recent funding → higher backsolve weight
  - [ ] Weak comp set → lower weight
- [ ] Create NarrativeSet type
- [ ] Test each approach narrative
- [ ] Test conclusion generation
- [ ] Commit narrative generation

### 5.5 Create Master Generation Orchestrator
- [ ] Create orchestrator (`/src/lib/generation/orchestrator.ts`)
- [ ] Implement `generateReportContent()`:
  - [ ] Load template
  - [ ] Load economic outlook
  - [ ] Load style examples
  - [ ] Generate company research
  - [ ] Generate industry research
  - [ ] Generate valuation narratives
  - [ ] Generate conclusion
  - [ ] Compile all content
- [ ] Create ReportContent type
- [ ] Create SectionContent type
- [ ] Create Flag type
- [ ] Implement `validateContent()`
- [ ] Add comprehensive error handling
- [ ] Test full orchestration
- [ ] Commit orchestrator
- [ ] **Phase 5 Complete Checkpoint**: AI generation produces content

---

## Phase 6: Document Generation

### 6.1 Set Up Word Document Generator
- [ ] Install docx library
- [ ] Create document generator (`/src/lib/document/generator.ts`):
  - [ ] `createDocument()`
  - [ ] `createHeading()`
  - [ ] `createParagraph()`
  - [ ] `createHighlightedText()`
  - [ ] `createPlaceholder()`
  - [ ] `createTable()`
- [ ] Create document styles (`/src/lib/document/styles.ts`)
- [ ] Create document types (`/src/types/document.ts`)
- [ ] Create test document endpoint (temporary)
- [ ] Test document creation
- [ ] Verify document opens in Word
- [ ] Commit document generator

### 6.2 Implement Template Loading and Parsing
- [ ] Install mammoth (if needed)
- [ ] Create template module (`/src/lib/document/template.ts`):
  - [ ] `loadTemplate()`
  - [ ] `findPlaceholders()`
  - [ ] `identifySections()`
  - [ ] `validateTemplate()`
- [ ] Create template types (`/src/types/template.ts`)
- [ ] Test template loading
- [ ] Test placeholder detection
- [ ] Test section identification
- [ ] Commit template loading

### 6.3 Implement Report Assembly
- [ ] Create assembler (`/src/lib/document/assembler.ts`)
- [ ] Implement `assembleReport()`:
  - [ ] Process boilerplate sections
  - [ ] Replace placeholders
  - [ ] Insert generated content
  - [ ] Add highlighting for flags
  - [ ] Insert cap table placeholder
  - [ ] Generate buffer
- [ ] Create placeholders module (`/src/lib/document/placeholders.ts`)
- [ ] Create footnotes module (`/src/lib/document/footnotes.ts`)
- [ ] Implement `saveReport()`
- [ ] Test with mock content
- [ ] Verify output in Word:
  - [ ] Formatting correct
  - [ ] Placeholders replaced
  - [ ] Highlighting visible
  - [ ] Footnotes working
- [ ] Commit report assembly

### 6.4 Create Complete Generation Pipeline
- [ ] Create pipeline (`/src/lib/generation/pipeline.ts`)
- [ ] Implement `generateReport()`:
  - [ ] Load engagement
  - [ ] Parse model
  - [ ] Load resources
  - [ ] Generate content
  - [ ] Assemble document
  - [ ] Save report
  - [ ] Create database record
  - [ ] Update engagement status
- [ ] Create status helpers (`/src/lib/generation/status.ts`)
- [ ] Add comprehensive error handling:
  - [ ] Log errors
  - [ ] Update status to ERROR
  - [ ] Store error message
- [ ] Update generate API to use pipeline
- [ ] Test full pipeline
- [ ] Verify generated reports
- [ ] Commit pipeline
- [ ] **Phase 6 Complete Checkpoint**: Reports generate correctly

---

## Phase 7: Background Processing & Notifications

### 7.1 Set Up Background Job Processing
- [ ] Create job queue (`/src/lib/jobs/queue.ts`):
  - [ ] Job interface
  - [ ] In-memory job storage
  - [ ] `queueGenerationJob()`
  - [ ] `getJobStatus()`
  - [ ] `processJob()`
- [ ] Create job status API (`/api/jobs/[id]/route.ts`)
- [ ] Update generate API to queue jobs
- [ ] Create GenerationStatus component:
  - [ ] Poll job status
  - [ ] Show progress stages
  - [ ] Handle completion
  - [ ] Handle errors
- [ ] Update engagement flow to show status
- [ ] Test background generation
- [ ] Test status polling
- [ ] Commit job processing

### 7.2 Implement Email Notifications
- [ ] Install nodemailer and types
- [ ] Create email client (`/src/lib/email/client.ts`)
- [ ] Create email templates:
  - [ ] `reportReady.ts` - success template
  - [ ] `reportFailed.ts` - failure template
- [ ] Create notify module (`/src/lib/email/notify.ts`):
  - [ ] `notifyReportComplete()`
  - [ ] `notifyReportFailed()`
- [ ] Update pipeline to send notifications
- [ ] Create test email endpoint (temporary)
- [ ] Test email sending
- [ ] Verify email formatting
- [ ] Test success notification
- [ ] Test failure notification
- [ ] Commit email notifications

### 7.3 Implement Data Cleanup Job
- [ ] Update cleanup module (`/src/lib/storage/cleanup.ts`):
  - [ ] `cleanupExpiredData()`
  - [ ] Delete expired engagements
  - [ ] Delete expired reports
  - [ ] Delete orphaned files
- [ ] Create cleanup API (`/api/admin/cleanup/route.ts`)
- [ ] Create lastCleanup tracker
- [ ] Implement `shouldRunCleanup()`
- [ ] Update app initialization to check cleanup
- [ ] Test cleanup functionality
- [ ] Verify files deleted correctly
- [ ] Verify database records removed
- [ ] Commit cleanup job
- [ ] **Phase 7 Complete Checkpoint**: Background processing works

---

## Phase 8: Polish & Finalization

### 8.1 Implement Error Handling UI
- [ ] Create Toast component:
  - [ ] Success, error, warning, info variants
  - [ ] Auto-dismiss
  - [ ] Stack multiple
- [ ] Create ToastProvider with useToast hook
- [ ] Create ErrorBoundary component
- [ ] Create ErrorMessage component
- [ ] Update flows with error handling:
  - [ ] Login flow
  - [ ] File upload
  - [ ] Generation flow
  - [ ] Download
- [ ] Add ToastProvider to layout
- [ ] Add ErrorBoundary to layout
- [ ] Test error scenarios
- [ ] Commit error handling

### 8.2 Add Loading States and Polish
- [ ] Create Spinner component
- [ ] Create Skeleton component
- [ ] Create LoadingOverlay component
- [ ] Add loading states to:
  - [ ] Dashboard (engagement list)
  - [ ] Settings page (all managers)
  - [ ] New engagement flow
  - [ ] Generation status
- [ ] Polish Button component:
  - [ ] Hover states
  - [ ] Active states
  - [ ] Focus rings
- [ ] Polish form inputs:
  - [ ] Focus states
  - [ ] Error states
  - [ ] Disabled states
- [ ] Polish Cards and Tables
- [ ] Add transitions and animations
- [ ] Commit UI polish

### 8.3 Final Integration Testing
- [ ] Create test data utilities
- [ ] **Authentication Tests**:
  - [ ] Google OAuth login works
  - [ ] Unauthorized email rejected
  - [ ] Session persists
  - [ ] Logout clears session
- [ ] **Settings Tests**:
  - [ ] Template upload/list/delete
  - [ ] Economic outlook upload/list/delete
  - [ ] Quarter/year matching works
  - [ ] Style example upload/list/delete
- [ ] **Engagement Flow Tests**:
  - [ ] Report type selection
  - [ ] Model upload (.xlsx)
  - [ ] Model parsing extracts data
  - [ ] Voice input records/transcribes
  - [ ] Review shows correct info
  - [ ] Generate creates engagement
- [ ] **Report Generation Tests**:
  - [ ] Background job starts
  - [ ] Status updates correctly
  - [ ] Email notification sends
  - [ ] Report downloads
  - [ ] Errors handled gracefully
- [ ] **Dashboard Tests**:
  - [ ] Engagements list displays
  - [ ] Status badges correct
  - [ ] Download works
  - [ ] Empty state shows
- [ ] **Error Handling Tests**:
  - [ ] Network errors show messages
  - [ ] Invalid files rejected
  - [ ] API errors don't crash app
- [ ] Fix all discovered bugs
- [ ] Update error messages
- [ ] Basic mobile responsiveness check
- [ ] Test production build locally
- [ ] Commit bug fixes

### 8.4 Deployment Configuration
- [ ] Update next.config.js for production
- [ ] Create railway.toml (if using config file)
- [ ] Create health check endpoint (`/api/health`)
- [ ] Update package.json scripts:
  - [ ] build script
  - [ ] start script
  - [ ] postinstall script
- [ ] Create env validation (`/src/lib/env.ts`)
- [ ] Update initialization for production
- [ ] Create README.md with:
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] Environment variables
  - [ ] Deployment guide
- [ ] Commit deployment config

---

## Deployment

### Railway Setup
- [ ] Create new Railway project
- [ ] Add PostgreSQL addon
- [ ] Configure persistent volume for uploads
- [ ] Connect GitHub repository
- [ ] Configure environment variables:
  - [ ] DATABASE_URL
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] NEXTAUTH_SECRET (generate new)
  - [ ] NEXTAUTH_URL (production URL)
  - [ ] ANTHROPIC_API_KEY
  - [ ] ALLOWED_EMAIL
  - [ ] SMTP_HOST
  - [ ] SMTP_PORT
  - [ ] SMTP_USER
  - [ ] SMTP_PASSWORD
  - [ ] SMTP_FROM
  - [ ] UPLOAD_BASE_PATH
- [ ] Configure build settings
- [ ] Deploy application
- [ ] Run database migrations (`prisma db push`)
- [ ] Verify health check endpoint

### Post-Deployment
- [ ] Update Google OAuth redirect URIs for production
- [ ] Test login on production
- [ ] Upload templates
- [ ] Upload economic outlook
- [ ] Upload style examples
- [ ] Test full flow on production:
  - [ ] Create engagement
  - [ ] Upload model
  - [ ] Add voice input
  - [ ] Generate report
  - [ ] Receive email
  - [ ] Download report
- [ ] Verify report quality in Word
- [ ] Monitor for errors
- [ ] Set up error alerting (optional)

---

## Post-Launch

### Immediate (Week 1)
- [ ] Monitor application logs
- [ ] Address any production bugs
- [ ] Gather initial feedback
- [ ] Document any issues

### Short-term (Month 1)
- [ ] Review generated report quality
- [ ] Tune AI prompts based on output
- [ ] Add additional weighting heuristics if needed
- [ ] Consider additional error handling

### Future Enhancements (V2+)
- [ ] Automated cap table image extraction
- [ ] Auto-refresh Economic Outlook
- [ ] Native table generation (comps, transactions)
- [ ] Multiple scenario handling
- [ ] Assumption ledger with source tagging
- [ ] Multi-user support
- [ ] Report version history
- [ ] Web search API integration for research
- [ ] Company website scraping
- [ ] LinkedIn API integration

---

## Notes & Issues

### Known Issues
<!-- Track any known issues here -->

### Technical Debt
<!-- Track technical debt items here -->

### Ideas for Improvement
<!-- Track enhancement ideas here -->

---

## Progress Summary

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 1: Foundation | ⬜ Not Started | |
| Phase 2: File Management | ⬜ Not Started | |
| Phase 3: Excel Parsing | ⬜ Not Started | |
| Phase 4: Engagement Flow | ⬜ Not Started | |
| Phase 5: AI Integration | ⬜ Not Started | |
| Phase 6: Document Generation | ⬜ Not Started | |
| Phase 7: Background Processing | ⬜ Not Started | |
| Phase 8: Polish & Deploy | ⬜ Not Started | |
| Deployment | ⬜ Not Started | |

**Legend:**
- ⬜ Not Started
- 🟡 In Progress
- ✅ Complete
