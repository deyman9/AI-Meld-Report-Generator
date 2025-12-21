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

### 1.1 Initialize Next.js Project ✅
- [x] Create new Next.js 14 project with TypeScript
- [x] Configure Tailwind CSS
- [x] Set up folder structure:
  - [x] `/src/app/api`
  - [x] `/src/app/(auth)`
  - [x] `/src/app/(dashboard)`
  - [x] `/src/components/ui`
  - [x] `/src/lib/db`
  - [x] `/src/lib/utils`
  - [x] `/src/types`
- [x] Create `.env.example` with all placeholders
- [ ] Create `.env.local` with actual values
- [x] Create basic `layout.tsx`
- [x] Create placeholder `page.tsx`
- [x] Verify project runs with `npm run dev`
- [x] Add `.gitignore` (ensure .env.local is ignored)
- [x] Initial commit to repository

### 1.2 Set Up Prisma and Database ✅
- [x] Install Prisma and @prisma/client
- [x] Run `npx prisma init`
- [x] Create database schema:
  - [x] User model
  - [x] Template model
  - [x] StyleExample model
  - [x] EconomicOutlook model
  - [x] Engagement model
  - [x] GeneratedReport model
  - [x] ReportType enum
  - [x] EngagementStatus enum
- [x] Create Prisma client singleton (`/src/lib/db/prisma.ts`)
- [x] Add db scripts to package.json
- [x] Set up PostgreSQL database (Neon cloud)
- [x] Run `npx prisma db push`
- [x] Verify with `npx prisma studio` (optional) - verified via Google OAuth test
- [x] Commit schema changes

### 1.3 Set Up NextAuth with Google OAuth ✅
- [x] Install next-auth and @auth/prisma-adapter
- [x] Create auth options (`/src/lib/auth/options.ts`)
- [x] Configure Google provider
- [x] Implement email whitelist check in signIn callback
- [x] Add user.id to session callback
- [x] Create NextAuth API route (`/src/app/api/auth/[...nextauth]/route.ts`)
- [x] Create session helpers (`/src/lib/auth/session.ts`)
- [x] Create type definitions (`/src/types/next-auth.d.ts`)
- [x] Create requireAuth utility
- [x] Create SessionProvider wrapper component
- [x] Update layout.tsx with SessionProvider
- [x] Test authentication flow (requires Google OAuth credentials)
- [x] Commit auth setup

### 1.4 Create Login Page UI ✅
- [x] Create login page (`/src/app/(auth)/login/page.tsx`)
- [x] Create LoginForm component
- [x] Create reusable Button component with variants
- [x] Style login page (centered card, branding)
- [x] Implement Google sign-in button
- [x] Handle redirect after login
- [x] Update root page.tsx with auth redirect
- [x] Test login flow end-to-end
- [x] Test unauthorized email rejection
- [x] Commit login page

### 1.5 Create Dashboard Layout and Shell ✅
- [x] Create dashboard layout (`/src/app/(dashboard)/layout.tsx`)
- [x] Implement auth check and redirect
- [x] Create DashboardLayout component
- [x] Create Header component with:
  - [x] Logo/branding
  - [x] User email display
  - [x] Sign out button
- [x] Create dashboard home page
- [x] Create Card component
- [x] Create EmptyState component
- [x] Add navigation links
- [x] Test navigation flow
- [x] Test sign out
- [x] Commit dashboard shell

---

## Phase 2: File Management Infrastructure ✅

### 2.1 Set Up File Storage Utilities ✅
- [x] Create storage directory constants
- [x] Implement `ensureDirectories()`
- [x] Implement `generateFileName()`
- [x] Implement `saveFile()`
- [x] Implement `deleteFile()`
- [x] Implement `getFilePath()`
- [x] Implement `fileExists()`
- [x] Create storage types (`/src/types/storage.ts`)
- [x] Create cleanup utilities (basic structure)
- [x] Create initialization function
- [x] Add UPLOAD_BASE_PATH to .env.example
- [x] Test directory creation
- [x] Commit storage utilities

### 2.2 Create File Upload API Endpoint ✅
- [x] Create upload API route (`/src/app/api/upload/route.ts`)
- [x] Implement multipart form data parsing
- [x] Create file validation utilities:
  - [x] `validateFileType()`
  - [x] `validateFileSize()`
  - [x] `getFileExtension()`
  - [x] ALLOWED_TYPES constant
- [x] Implement file type validation by upload type
- [x] Implement file size validation (50MB max)
- [x] Save files to appropriate directories
- [x] Return proper JSON responses
- [x] Handle all error cases (400, 401, 500)
- [x] Create API types (`/src/types/api.ts`)
- [x] Create test upload page (temporary)
- [x] Test uploads for each file type
- [x] Commit upload endpoint

### 2.3 Create Template Management System ✅
- [x] Create templates API routes:
  - [x] GET `/api/templates` - list all
  - [x] POST `/api/templates` - upload new
  - [x] GET `/api/templates/[id]` - get single
  - [x] DELETE `/api/templates/[id]` - delete
- [x] Create settings page (`/src/app/(dashboard)/settings/page.tsx`)
- [x] Create TemplateManager component:
  - [x] Template list table
  - [x] Upload form (name, type, file)
  - [x] Delete with confirmation
  - [x] Loading states
- [x] Create Modal component
- [x] Create Table component
- [x] Add Settings link to navigation
- [x] Test template upload
- [x] Test template list display
- [x] Test template deletion
- [x] Commit template management

### 2.4 Create Economic Outlook Management ✅
- [x] Create economic-outlooks API routes:
  - [x] GET `/api/economic-outlooks` - list all
  - [x] POST `/api/economic-outlooks` - upload new
  - [x] DELETE `/api/economic-outlooks/[id]` - delete
- [x] Create quarter/year utility functions:
  - [x] `getQuarterFromDate()`
  - [x] `findOutlookForDate()`
- [x] Create EconomicOutlookManager component:
  - [x] Outlook list
  - [x] Upload form (quarter, year, file)
  - [x] Delete with confirmation
  - [x] Gap warnings
- [x] Add to settings page
- [x] Test outlook upload
- [x] Test quarter/year validation
- [x] Test duplicate prevention
- [x] Commit outlook management

### 2.5 Create Style Examples Management ✅
- [x] Create style-examples API routes:
  - [x] GET `/api/style-examples` - list all
  - [x] POST `/api/style-examples` - upload new
  - [x] DELETE `/api/style-examples/[id]` - delete
- [x] Create StyleExampleManager component:
  - [x] Examples list
  - [x] Upload form (name, type, file)
  - [x] Delete with confirmation
- [x] Create SettingsSection component
- [x] Add descriptions to each settings section
- [x] Complete settings page layout
- [x] Test all three managers together
- [x] Commit style examples management
- [x] **Phase 2 Complete Checkpoint**: Test all file management flows

---

## Phase 3: Excel Parsing ✅

### 3.1 Set Up Excel Parser Foundation ✅
- [x] Install xlsx (SheetJS) library
- [x] Create Excel types (`/src/types/excel.ts`):
  - [x] WorkbookData
  - [x] SheetInfo
  - [x] CellValue
  - [x] ParsedModel
  - [x] ExhibitData
  - [x] SummaryData
  - [x] ApproachData
- [x] Create parser module (`/src/lib/excel/parser.ts`):
  - [x] `loadWorkbook()`
  - [x] `getSheetNames()`
  - [x] `findExhibitBoundaries()`
  - [x] `getCellValue()`
  - [x] `getSheetData()`
- [x] Create index export file
- [x] Test with sample Excel file
- [x] Commit parser foundation

### 3.2 Implement Data Extraction Logic ✅
- [x] Implement `extractCompanyInfo()`:
  - [x] Get company name from LEs!G819
  - [x] Get valuation date from LEs!G824
  - [x] Handle Excel date parsing
- [x] Implement `extractExhibits()`:
  - [x] Find start/end boundaries
  - [x] Extract sheets between boundaries
  - [x] Collect data from each exhibit
- [x] Implement `findNotesInSheet()`:
  - [x] Scan for "notes" labels
  - [x] Extract note content
- [x] Implement `extractSummaryData()`:
  - [x] Find Summary sheet
  - [x] Extract approaches
  - [x] Extract values and weights
- [x] Implement `extractDLOM()`:
  - [x] Search for DLOM in exhibits
- [x] Create main `parseValuationModel()` function
- [x] Add comprehensive error handling
- [x] Add warning collection
- [x] Test with sample model
- [x] Commit extraction logic

### 3.3 Create Model Parsing API Endpoint ✅
- [x] Create parse-model API route
- [x] Implement POST handler
- [x] Create `formatForAPI()` utility
- [x] Add ParseModelResponse type
- [x] Add ParseModelRequest type
- [x] Create test parser page (temporary)
- [x] Test parsing with various Excel files
- [x] Test error cases:
  - [x] Missing sheets
  - [x] Invalid format
  - [x] Missing data
- [x] Commit parsing API
- [x] **Phase 3 Complete Checkpoint**: Verify parsing works correctly

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
| Phase 1: Foundation | ✅ Complete | |
| Phase 2: File Management | ✅ Complete | |
| Phase 3: Excel Parsing | ✅ Complete | |
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
