# AI Valuation Report Generator: Implementation Prompt Plan

## Overview

This document contains 34 sequential prompts for building the MELD AI Valuation Report Generator. Each prompt builds incrementally on the previous work, ensuring no orphaned code and continuous integration.

**Total Prompts:** 34  
**Phases:** 8

---

## Phase 1: Project Foundation

### Prompt 1.1: Initialize Next.js Project with TypeScript

```text
Create a new Next.js 14 project for an AI-powered valuation report generator. Use the App Router, TypeScript, and Tailwind CSS.

Project name: meld-report-generator

Set up the following folder structure:
/src
  /app
    /api
    /(auth)
    /(dashboard)
    layout.tsx
    page.tsx
  /components
    /ui
  /lib
    /db
    /utils
  /types

Install these dependencies:
- next (latest)
- react, react-dom
- typescript, @types/react, @types/node
- tailwindcss, postcss, autoprefixer
- prisma, @prisma/client (for database)

Create a .env.example file with placeholders for:
- DATABASE_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- ANTHROPIC_API_KEY
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

Create a basic layout.tsx with:
- HTML structure
- Tailwind base styles
- A simple wrapper div

Create a placeholder page.tsx that just shows "MELD Report Generator" centered on screen.

Make sure the project runs with `npm run dev`.
```

---

### Prompt 1.2: Set Up Prisma and Database Schema

```text
Building on the Next.js project, set up Prisma with PostgreSQL.

Run `npx prisma init` to create the prisma folder.

Create the following schema in prisma/schema.prisma:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

Models needed:

1. User
   - id: String (cuid, primary key)
   - email: String (unique)
   - googleId: String (unique)
   - createdAt: DateTime (default now)
   - lastLogin: DateTime
   - Relation: engagements (one-to-many)

2. Template
   - id: String (cuid, primary key)
   - name: String
   - type: Enum (FOUR09A, FIFTY_NINE_SIXTY)
   - filePath: String
   - uploadedAt: DateTime (default now)
   - updatedAt: DateTime (updatedAt)

3. StyleExample
   - id: String (cuid, primary key)
   - name: String
   - type: Enum (FOUR09A, FIFTY_NINE_SIXTY)
   - filePath: String
   - uploadedAt: DateTime (default now)

4. EconomicOutlook
   - id: String (cuid, primary key)
   - quarter: Int (1-4)
   - year: Int
   - filePath: String
   - uploadedAt: DateTime (default now)
   - Unique constraint on [quarter, year]

5. Engagement
   - id: String (cuid, primary key)
   - userId: String (foreign key to User)
   - companyName: String (nullable)
   - valuationDate: DateTime (nullable)
   - reportType: Enum (FOUR09A, FIFTY_NINE_SIXTY)
   - status: Enum (DRAFT, PROCESSING, COMPLETE, ERROR)
   - modelFilePath: String (nullable)
   - voiceTranscript: String (nullable, text type for long content)
   - createdAt: DateTime (default now)
   - updatedAt: DateTime (updatedAt)
   - expiresAt: DateTime
   - Relation: user (many-to-one)
   - Relation: generatedReports (one-to-many)

6. GeneratedReport
   - id: String (cuid, primary key)
   - engagementId: String (foreign key to Engagement)
   - filePath: String
   - version: Int (default 1)
   - createdAt: DateTime (default now)
   - expiresAt: DateTime
   - Relation: engagement (many-to-one)

Create the ReportType enum with values: FOUR09A, FIFTY_NINE_SIXTY
Create the EngagementStatus enum with values: DRAFT, PROCESSING, COMPLETE, ERROR

Create /src/lib/db/prisma.ts with a singleton pattern for the Prisma client to prevent multiple instances in development:

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

Add a script to package.json: "db:push": "prisma db push"
Add a script to package.json: "db:studio": "prisma studio"
```

---

### Prompt 1.3: Set Up NextAuth with Google OAuth

```text
Building on the existing project with Prisma, implement NextAuth.js with Google OAuth.

Install: next-auth @auth/prisma-adapter

Create /src/lib/auth/options.ts with NextAuth configuration:

- Use PrismaAdapter with our prisma client
- Configure Google provider with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Add a callback for signIn that checks if the user's email matches an allowed email from environment variable ALLOWED_EMAIL
- If email doesn't match, return false to deny access
- Add a callback for session that includes the user id in the session
- Add a callback for jwt that includes the user id in the token

Create /src/app/api/auth/[...nextauth]/route.ts:
- Export GET and POST handlers using NextAuth with the options

Create /src/lib/auth/session.ts with helper functions:
- getServerSession(): Gets the current session on the server
- getCurrentUser(): Gets the current user from session, returns null if not authenticated

Create /src/types/next-auth.d.ts to extend the Session type:
- Add user.id to the Session interface

Update .env.example to include ALLOWED_EMAIL placeholder.

Create a simple auth check: /src/lib/auth/requireAuth.ts
- Export an async function that gets the session and throws/redirects if not authenticated
- This will be used in server components and API routes

Wire it up by updating /src/app/layout.tsx:
- Wrap the app in a SessionProvider (create a client component wrapper for this)

Test by creating a temporary test page that shows session status.
```

---

### Prompt 1.4: Create Login Page UI

```text
Building on the NextAuth setup, create a professional login page.

Create /src/app/(auth)/login/page.tsx:
- Server component that checks if user is already logged in
- If logged in, redirect to /dashboard
- If not, render the LoginForm component

Create /src/components/auth/LoginForm.tsx (client component):
- Display "MELD Valuation" as the title (large, centered)
- Subtitle: "AI Report Generator"
- A "Sign in with Google" button styled with Tailwind:
  - White background, gray border, rounded
  - Google logo icon (use a simple SVG or text placeholder)
  - On hover, light gray background
- Use next-auth/react signIn function with provider "google"
- On success, redirect to /dashboard (use callbackUrl parameter)

Create /src/components/ui/Button.tsx:
- Reusable button component with variants (primary, secondary, outline)
- Props: variant, size, disabled, loading, children, onClick, type, className
- Include a loading spinner state

Style the login page:
- Centered card on a light gray background
- Card has white background, subtle shadow, rounded corners
- Padding and spacing for professional appearance

Update /src/app/page.tsx:
- Redirect to /login if not authenticated, otherwise to /dashboard
```

---

### Prompt 1.5: Create Dashboard Layout and Shell

```text
Building on authentication, create the main dashboard layout and shell.

Create /src/app/(dashboard)/layout.tsx:
- Server component that requires authentication (redirect to /login if not)
- Get the current user session
- Render DashboardLayout component with user info

Create /src/components/layout/DashboardLayout.tsx:
- Header with:
  - "MELD Report Generator" logo/text on left
  - User email display on right
  - Sign out button (uses next-auth signOut)
- Main content area (children)
- Clean, professional styling with Tailwind

Create /src/components/layout/Header.tsx:
- Extract header into its own component
- Props: userEmail
- Client component for sign out functionality

Create /src/app/(dashboard)/dashboard/page.tsx:
- Welcome message with user's email
- "New Report" button (primary, links to /dashboard/new - placeholder for now)
- "Recent Engagements" section header (empty state for now: "No reports yet")
- "Settings" link in a secondary position

Create /src/components/ui/Card.tsx:
- Reusable card component for content containers
- Props: title (optional), children, className

Create /src/components/ui/EmptyState.tsx:
- Reusable empty state component
- Props: icon (optional), title, description, action (optional button)

Wire everything together:
- Ensure navigation works between pages
- Sign out redirects to login
- Protected routes redirect unauthenticated users

Test the flow: Login -> Dashboard -> Sign Out -> Login
```

---

## Phase 2: File Management Infrastructure

### Prompt 2.1: Set Up File Storage Utilities

```text
Building on the existing project, create file storage utilities.

Create /src/lib/storage/index.ts with the following:

Define storage directories (relative to project root or configurable via env):
- UPLOAD_DIR: ./uploads
- TEMPLATES_DIR: ./uploads/templates
- MODELS_DIR: ./uploads/models
- REPORTS_DIR: ./uploads/reports
- OUTLOOKS_DIR: ./uploads/outlooks
- EXAMPLES_DIR: ./uploads/examples

Create utility functions:

1. ensureDirectories(): 
   - Creates all directories if they don't exist
   - Call this on app startup

2. generateFileName(originalName: string, prefix?: string): string
   - Generates unique filename: {prefix}_{timestamp}_{random}_{sanitized-original}
   - Sanitize original name (remove special chars, spaces to underscores)

3. saveFile(buffer: Buffer, directory: string, fileName: string): Promise<string>
   - Saves buffer to specified directory with fileName
   - Returns full file path

4. deleteFile(filePath: string): Promise<void>
   - Deletes file if it exists
   - Doesn't throw if file doesn't exist

5. getFilePath(directory: string, fileName: string): string
   - Returns full path for a file

6. fileExists(filePath: string): Promise<boolean>
   - Checks if file exists

Create /src/lib/storage/cleanup.ts:

1. cleanupExpiredFiles(): Promise<void>
   - Query database for engagements and reports where expiresAt < now
   - Delete associated files
   - Delete database records
   - Log cleanup results

Create a type file /src/types/storage.ts:
- Define types for upload results, file metadata, etc.

Add to .env.example: UPLOAD_BASE_PATH (optional, defaults to ./uploads)

Wire up: Create an initialization function in /src/lib/init.ts that:
- Calls ensureDirectories()
- This will be called when the app starts
```

---

### Prompt 2.2: Create File Upload API Endpoint

```text
Building on storage utilities, create a file upload API endpoint.

Create /src/app/api/upload/route.ts:

POST handler:
- Requires authentication (check session, return 401 if not)
- Parse multipart form data (use Next.js built-in or install formidable/busboy)
- Accept form fields:
  - file: The uploaded file
  - type: "model" | "template" | "outlook" | "example"
- Validate file type based on 'type' parameter:
  - model: .xlsx, .xls only
  - template: .docx only
  - outlook: .docx only
  - example: .docx only
- Validate file size (max 50MB)
- Save file to appropriate directory based on type
- Return JSON: { success: true, fileName, filePath, size, mimeType }

Create /src/lib/utils/fileValidation.ts:
- validateFileType(mimeType: string, allowedTypes: string[]): boolean
- validateFileSize(size: number, maxSize: number): boolean
- getFileExtension(fileName: string): string
- ALLOWED_TYPES constant mapping type to allowed extensions/mimetypes

Handle errors gracefully:
- 400 for invalid file type or size
- 401 for unauthenticated
- 500 for server errors
- Always return JSON with error message

Create /src/types/api.ts:
- Define API response types
- Define upload response type

Test with a simple form (temporary):
- Create /src/app/(dashboard)/test-upload/page.tsx
- Simple form with file input and type select
- Display response on success
```

---

### Prompt 2.3: Create Template Management System

```text
Building on file upload, create template management.

Create /src/app/api/templates/route.ts:

GET handler:
- Requires auth
- Return all templates from database
- Include: id, name, type, uploadedAt, updatedAt

POST handler:
- Requires auth
- Accept: file (from form data), name, type (FOUR09A or FIFTY_NINE_SIXTY)
- Save file using upload utilities
- Create database record
- Return created template

Create /src/app/api/templates/[id]/route.ts:

GET handler:
- Return single template by id

DELETE handler:
- Delete file from storage
- Delete database record
- Return success

Create /src/app/(dashboard)/settings/page.tsx:
- Settings page with tabs or sections
- First section: "Templates"

Create /src/components/settings/TemplateManager.tsx (client component):
- Display list of templates in a table:
  - Name, Type (409A/59-60), Uploaded date, Actions
- "Upload New Template" button opens a modal or expandable form
- Upload form:
  - Name input
  - Type dropdown (409A, 59-60)
  - File input (accepts .docx)
  - Submit button
- Delete button with confirmation
- Use fetch to call API endpoints
- Show loading states

Create /src/components/ui/Modal.tsx:
- Reusable modal component
- Props: isOpen, onClose, title, children

Create /src/components/ui/Table.tsx:
- Reusable table component with header and rows
- Simple styling with Tailwind

Wire up:
- Add "Settings" link in dashboard navigation
- Template upload saves to database and storage
- List refreshes after upload/delete
```

---

### Prompt 2.4: Create Economic Outlook Management

```text
Building on template management patterns, create economic outlook management.

Create /src/app/api/economic-outlooks/route.ts:

GET handler:
- Requires auth
- Return all economic outlooks ordered by year desc, quarter desc
- Include: id, quarter, year, uploadedAt

POST handler:
- Requires auth
- Accept: file, quarter (1-4), year (YYYY)
- Validate quarter is 1-4
- Validate year is reasonable (2020-2100)
- Check if outlook for this quarter/year already exists (return error if so)
- Save file with naming convention: EOU_Q{quarter}_{year}.docx
- Create database record
- Return created outlook

Create /src/app/api/economic-outlooks/[id]/route.ts:

DELETE handler:
- Delete file from storage
- Delete database record

Create /src/lib/utils/economicOutlook.ts:
- getQuarterFromDate(date: Date): { quarter: number, year: number }
  - Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
- findOutlookForDate(date: Date): Promise<EconomicOutlook | null>
  - Query database for matching quarter/year
  - Return the outlook or null

Create /src/components/settings/EconomicOutlookManager.tsx (client component):
- Similar pattern to TemplateManager
- Display list: Quarter, Year, Uploaded date, Actions
- Upload form:
  - Quarter dropdown (Q1, Q2, Q3, Q4)
  - Year input (number, default to current year)
  - File input (.docx)
- Delete with confirmation
- Show "No outlook for Q{x} {year}" warnings if gaps exist

Update /src/app/(dashboard)/settings/page.tsx:
- Add "Economic Outlooks" section below Templates

Wire up:
- Upload saves file and creates record
- List shows all outlooks
- Delete removes both file and record
```

---

### Prompt 2.5: Create Style Examples Management

```text
Building on the same patterns, create style examples management.

Create /src/app/api/style-examples/route.ts:

GET handler:
- Return all style examples
- Include: id, name, type, uploadedAt

POST handler:
- Accept: file, name, type
- Save file to examples directory
- Create database record

Create /src/app/api/style-examples/[id]/route.ts:

DELETE handler:
- Delete file and database record

Create /src/components/settings/StyleExampleManager.tsx (client component):
- Same pattern as other managers
- List: Name, Type, Uploaded date, Actions
- Upload form: Name, Type dropdown, File input
- Delete with confirmation

Update /src/app/(dashboard)/settings/page.tsx:
- Add "Style Examples" section
- Organize sections with clear headers and spacing
- Add a brief description for each section explaining its purpose:
  - Templates: "Word document templates with placeholders (*COMPANY, *VALUATIONDATE)"
  - Economic Outlooks: "Quarterly economic outlook documents matched to valuation dates"
  - Style Examples: "Redacted sample reports for AI tone and style training"

Create /src/components/settings/SettingsSection.tsx:
- Reusable section component
- Props: title, description, children
- Consistent styling for all settings sections

Wire everything together:
- All three managers work independently
- Settings page is complete and functional
- Test all upload/delete flows
```

---

## Phase 3: Excel Parsing

### Prompt 3.1: Set Up Excel Parser Foundation

```text
Building on the existing project, set up Excel parsing capabilities.

Install: xlsx (SheetJS library)

Create /src/lib/excel/parser.ts:

Import xlsx library.

Create types in /src/types/excel.ts:
- WorkbookData: { sheets: SheetInfo[], rawWorkbook: any }
- SheetInfo: { name: string, index: number }
- CellValue: string | number | Date | null
- ParsedModel: {
    companyName: string | null
    valuationDate: Date | null
    exhibits: ExhibitData[]
    summary: SummaryData | null
    errors: string[]
    warnings: string[]
  }
- ExhibitData: { sheetName: string, data: any, notes: string[] }
- SummaryData: { approaches: ApproachData[], concludedValue: number | null }
- ApproachData: { name: string, indicatedValue: number | null, weight: number | null }

Create functions in parser.ts:

1. loadWorkbook(filePath: string): Promise<WorkbookData>
   - Read file from disk
   - Parse with xlsx
   - Return workbook data with sheet list

2. getSheetNames(workbook: WorkbookData): string[]
   - Return array of all sheet names

3. findExhibitBoundaries(workbook: WorkbookData): { startIndex: number, endIndex: number } | null
   - Find sheets named "start" and "end" (case-insensitive)
   - Return their indices, or null if not found

4. getCellValue(workbook: WorkbookData, sheetName: string, cellAddress: string): CellValue
   - Get value from specific cell (e.g., "G819")
   - Handle different cell types (string, number, date)
   - Return null if cell doesn't exist

5. getSheetData(workbook: WorkbookData, sheetName: string): any[][]
   - Get all data from a sheet as 2D array
   - Handle merged cells appropriately

Create /src/lib/excel/index.ts:
- Export all parser functions
- This will be the main entry point

Test by creating a simple test script or API endpoint that:
- Loads a sample Excel file
- Lists all sheets
- Gets a specific cell value
```

---

### Prompt 3.2: Implement Data Extraction Logic

```text
Building on the Excel parser foundation, implement specific data extraction.

Update /src/lib/excel/parser.ts with new functions:

1. extractCompanyInfo(workbook: WorkbookData): { companyName: string | null, valuationDate: Date | null }
   - Get company name from LEs sheet, cell G819
   - Get valuation date from LEs sheet, cell G824
   - Parse date properly (Excel stores dates as numbers)
   - Return both values (null if not found or sheet doesn't exist)

2. extractExhibits(workbook: WorkbookData): ExhibitData[]
   - Find start and end sheet boundaries
   - Get all sheets between them (exclusive of start/end)
   - For each exhibit sheet:
     - Extract all data
     - Find notes (look for cells containing "notes" label, typically at bottom)
     - Create ExhibitData object
   - Return array of exhibits

3. findNotesInSheet(workbook: WorkbookData, sheetName: string): string[]
   - Scan sheet for cells containing "notes" (case-insensitive)
   - When found, get content from cells below/beside it
   - Return array of note strings

4. extractSummaryData(workbook: WorkbookData): SummaryData | null
   - Look for "Summary" sheet (or similar names)
   - Extract:
     - List of valuation approaches used
     - Indicated value for each approach
     - Weight for each approach
     - Concluded enterprise/equity value
   - This is more complex - use pattern matching to find relevant sections
   - Return null if Summary sheet not found

5. extractDLOM(workbook: WorkbookData): number | null
   - Search for DLOM in exhibits
   - Return percentage value if found, null otherwise

Create /src/lib/excel/parseValuationModel.ts:
- Main function: parseValuationModel(filePath: string): Promise<ParsedModel>
- Orchestrates all extraction functions
- Collects errors and warnings
- Returns complete ParsedModel object

Add error handling:
- File not found
- Invalid Excel format
- Missing required sheets
- Parsing errors

Log warnings for:
- Missing optional data
- Unusual structures
- Parsing assumptions made
```

---

### Prompt 3.3: Create Model Parsing API Endpoint

```text
Building on Excel parsing, create an API endpoint to parse models.

Create /src/app/api/parse-model/route.ts:

POST handler:
- Requires authentication
- Accept JSON body: { filePath: string }
- Call parseValuationModel with the file path
- Return parsed data as JSON:
  {
    success: true,
    data: {
      companyName: string | null,
      valuationDate: string | null (ISO format),
      exhibitCount: number,
      approaches: ApproachData[],
      concludedValue: number | null,
      dlom: number | null,
      warnings: string[],
      errors: string[]
    }
  }
- On error: { success: false, error: string }

Create /src/lib/excel/formatParsedData.ts:
- formatForAPI(parsed: ParsedModel): APIResponse
- Convert dates to ISO strings
- Summarize exhibits (count, names)
- Clean up data for frontend consumption

Update /src/types/api.ts:
- Add ParseModelResponse type
- Add ParseModelRequest type

Create a test page /src/app/(dashboard)/test-parser/page.tsx (temporary):
- Upload an Excel file
- Click "Parse" button
- Display extracted data in a formatted view
- Show any errors or warnings
- This helps verify parsing works before integrating into main flow

Wire up:
- Upload stores file and returns path
- Parse endpoint uses path to extract data
- Frontend displays results
```

---

## Phase 4: Engagement Flow

### Prompt 4.1: Create New Engagement Page - Basic Structure

```text
Building on existing components, create the new engagement page structure.

Create /src/app/(dashboard)/new/page.tsx:
- Server component that renders NewEngagementFlow

Create /src/components/engagement/NewEngagementFlow.tsx (client component):
- Multi-step form with state management
- Steps:
  1. Select Report Type
  2. Upload Model
  3. Voice Input (optional)
  4. Review & Generate
- State:
  - currentStep: number (1-4)
  - reportType: "FOUR09A" | "FIFTY_NINE_SIXTY" | null
  - modelFile: File | null
  - modelFilePath: string | null
  - parsedData: ParsedModelData | null
  - voiceTranscript: string
  - isProcessing: boolean
  - error: string | null
- Navigation: Back/Next buttons, step indicator

Create /src/components/engagement/StepIndicator.tsx:
- Visual step indicator showing progress
- Props: steps: string[], currentStep: number
- Highlight current step, show completed steps

Create /src/components/engagement/StepReportType.tsx:
- Two large selection cards:
  - "409A Valuation" with brief description
  - "Gift & Estate (59-60)" with brief description
- Click to select, highlight selected
- Props: value, onChange

Create /src/components/ui/SelectionCard.tsx:
- Reusable card for selection UIs
- Props: title, description, selected, onClick
- Styling: border highlight when selected, hover state

Wire up Step 1:
- User can select report type
- Next button enabled only when type selected
- Clicking Next advances to step 2
```

---

### Prompt 4.2: Implement Model Upload Step

```text
Building on the engagement flow, implement the model upload step.

Create /src/components/engagement/StepUploadModel.tsx:
- Props: onModelParsed(filePath: string, data: ParsedModelData): void
- Drag-and-drop zone for Excel files
- Also support click-to-browse
- Accept only .xlsx, .xls files
- Show upload progress
- After upload completes:
  - Automatically call parse-model API
  - Show loading state "Parsing model..."
  - On success, display extracted info:
    - Company Name (or "Not found" warning)
    - Valuation Date (or "Not found" warning)
    - Number of exhibits found
    - Approaches detected
  - On error, show error message with retry option
- Call onModelParsed when parsing succeeds

Create /src/components/ui/FileDropzone.tsx:
- Reusable drag-and-drop component
- Props: accept (file types), onFile(file: File), disabled
- Visual states: idle, drag-over, uploading, error
- Uses HTML5 drag-and-drop API

Create /src/components/engagement/ParsedDataPreview.tsx:
- Displays extracted model data
- Props: data: ParsedModelData
- Card layout showing:
  - Company: {name}
  - Valuation Date: {date formatted}
  - Exhibits: {count} found
  - Approaches: {list}
- Warning icons next to missing data

Update NewEngagementFlow:
- Step 2 renders StepUploadModel
- Store parsed data in state
- Next button enabled when model parsed successfully
- Allow re-upload to replace current model

Wire up:
- File uploads via /api/upload with type "model"
- Parsing via /api/parse-model
- Parsed data stored in flow state
```

---

### Prompt 4.3: Implement Voice Input Step

```text
Building on the engagement flow, implement voice input step.

Create /src/components/engagement/StepVoiceInput.tsx:
- Props: transcript: string, onTranscriptChange(transcript: string): void
- Explanation text: "Record a brain dump about this engagement (optional)"
- Bullet points of what to cover:
  - Comp selection rationale
  - Weighting decisions
  - Client-specific context
  - Any unusual circumstances
- Voice recording controls
- Transcript display/edit area
- Skip button (this step is optional)

Create /src/hooks/useSpeechRecognition.ts:
- Custom hook for browser speech recognition
- Returns:
  - isListening: boolean
  - transcript: string
  - start(): void
  - stop(): void
  - isSupported: boolean
  - error: string | null
- Use Web Speech API (webkitSpeechRecognition)
- Handle browser compatibility
- Continuous mode for long recordings
- Interim results for real-time feedback

Create /src/components/engagement/VoiceRecorder.tsx:
- Uses useSpeechRecognition hook
- Big microphone button (red when recording)
- Visual feedback (pulsing animation when active)
- Timer showing recording duration
- Browser compatibility warning if not supported
- Fallback: text area for manual entry

Create /src/components/ui/TextArea.tsx:
- Reusable textarea component
- Props: value, onChange, placeholder, rows, disabled
- Styled with Tailwind

Update StepVoiceInput:
- VoiceRecorder for capturing speech
- TextArea showing/editing transcript
- Clear button to reset
- Character/word count

Update NewEngagementFlow:
- Step 3 renders StepVoiceInput
- Transcript stored in state
- Next button always enabled (step is optional)
- Skip and Next both advance to step 4
```

---

### Prompt 4.4: Implement Review and Generate Step

```text
Building on the engagement flow, implement the review and generate step.

Create /src/components/engagement/StepReview.tsx:
- Props: reportType, parsedData, voiceTranscript, onGenerate(): void, isGenerating: boolean
- Summary display:
  - Report Type: 409A / Gift & Estate
  - Company: {name} (with edit note if missing)
  - Valuation Date: {date}
  - Model: {filename}
  - Voice Input: {word count} words (or "None provided")
- Expandable sections to review details
- Warning section if any data is missing
- "Generate Report" primary button
- Disclaimer: "Generation may take 5-10 minutes. You'll receive an email when ready."

Create /src/app/api/engagements/route.ts:

GET handler:
- Requires auth
- Return user's engagements ordered by createdAt desc
- Include basic info: id, companyName, valuationDate, reportType, status, createdAt

POST handler:
- Requires auth
- Accept JSON body: { reportType, modelFilePath, voiceTranscript, companyName, valuationDate }
- Create engagement in database with:
  - userId from session
  - status: DRAFT
  - expiresAt: 30 days from now
- Return created engagement

Create /src/app/api/engagements/[id]/route.ts:

GET handler:
- Return full engagement details

PATCH handler:
- Update engagement fields (voiceTranscript, status, etc.)

Create /src/app/api/engagements/[id]/generate/route.ts:

POST handler:
- Requires auth
- Verify engagement belongs to user
- Update status to PROCESSING
- Trigger background job (for now, just update status - actual generation in Phase 5)
- Return { success: true, message: "Generation started" }

Update NewEngagementFlow:
- Step 4 renders StepReview
- Generate button:
  1. Creates engagement via POST /api/engagements
  2. Calls POST /api/engagements/[id]/generate
  3. Redirects to dashboard with success message
```

---

### Prompt 4.5: Update Dashboard with Engagement List

```text
Building on the engagement API, update the dashboard to show engagements.

Update /src/app/(dashboard)/dashboard/page.tsx:
- Fetch user's engagements on server
- Pass to EngagementList component
- Keep "New Report" button prominent at top

Create /src/components/dashboard/EngagementList.tsx:
- Props: engagements: Engagement[]
- Table or card list showing:
  - Company Name
  - Report Type (409A / 59-60)
  - Valuation Date
  - Status (with color-coded badge)
  - Created Date
  - Actions
- Status badges:
  - DRAFT: Gray "Draft"
  - PROCESSING: Yellow "Processing..." with spinner
  - COMPLETE: Green "Ready"
  - ERROR: Red "Error"
- Actions:
  - DRAFT: "Continue" link to edit
  - PROCESSING: No action
  - COMPLETE: "Download" button
  - ERROR: "View Error" button

Create /src/components/ui/Badge.tsx:
- Reusable status badge
- Props: variant (default, success, warning, error), children
- Colored backgrounds with matching text

Create /src/app/api/engagements/[id]/download/route.ts:

GET handler:
- Verify engagement belongs to user
- Verify status is COMPLETE
- Get latest generated report
- Return file for download with proper headers
- Filename: {companyName} - {reportType} - {valuationDate} - DRAFT_v1.docx

Update dashboard styling:
- "New Report" button at top right
- Engagement list below
- Empty state if no engagements
- Pagination if many engagements (optional for v1)

Wire up:
- Dashboard fetches and displays engagements
- Status updates would need polling/refresh (simple refresh button for now)
- Download works for completed reports
```

---

## Phase 5: AI Integration

### Prompt 5.1: Set Up Claude API Client

```text
Building on the existing project, set up Claude API integration.

Install: @anthropic-ai/sdk

Create /src/lib/ai/client.ts:
- Initialize Anthropic client with ANTHROPIC_API_KEY
- Export singleton client instance

Create /src/lib/ai/generate.ts:

1. generateText(prompt: string, options?: GenerateOptions): Promise<string>
   - Options: maxTokens, temperature, systemPrompt
   - Call Claude API with claude-opus-4-5-20250514 model
   - Handle rate limiting with exponential backoff
   - Retry up to 3 times on failure
   - Return generated text

2. generateWithContext(systemPrompt: string, userPrompt: string, context?: string): Promise<string>
   - Build messages array with system prompt
   - Include context if provided
   - Call Claude and return response

Create /src/lib/ai/prompts/index.ts:
- Central place for prompt templates
- Export functions that build prompts from data

Create /src/types/ai.ts:
- GenerateOptions type
- GenerateResponse type
- PromptContext type

Create /src/lib/ai/errors.ts:
- AIError class extending Error
- Handle specific API errors (rate limit, token limit, etc.)
- Provide user-friendly error messages

Test by creating /src/app/api/test-ai/route.ts (temporary):
- Simple endpoint that calls generateText
- Verify API connection works
- Test with a simple prompt

Wire up:
- Environment variable validation on startup
- Error logging for debugging
```

---

### Prompt 5.2: Implement Company Research Module

```text
Building on AI integration, implement company research.

Create /src/lib/research/company.ts:

For MVP, we'll use Claude's knowledge plus structured prompting rather than live web search:

1. researchCompany(companyName: string, additionalContext?: string): Promise<CompanyResearch>
   - Build a prompt asking Claude to provide company information
   - Include any context from voice transcript
   - Request structured output:
     - companyDescription: string
     - businessModel: string
     - products: string[]
     - revenueStreams: string
     - targetMarket: string
     - competitivePosition: string
     - recentDevelopments: string
     - keyFacts: string[]
   - Parse response into CompanyResearch type
   - Flag if information seems limited

Create /src/types/research.ts:
- CompanyResearch type with all fields
- ResearchConfidence: "high" | "medium" | "low"

Create /src/lib/ai/prompts/companyResearch.ts:
- buildCompanyResearchPrompt(companyName: string, context?: string): string
- Detailed prompt that:
  - Asks for comprehensive company information
  - Requests specific sections
  - Asks Claude to indicate confidence levels
  - Instructs to say "Information not available" if unknown

2. parseCompanyResearch(response: string): CompanyResearch
   - Parse Claude's response into structured data
   - Handle missing sections gracefully
   - Return typed object

Create test endpoint /src/app/api/test-research/route.ts (temporary):
- Accept company name
- Call researchCompany
- Return results

Note: For production, consider adding:
- Web search API integration (Tavily, Serper, etc.)
- Company website scraping
- LinkedIn API integration
These can be added in v2.
```

---

### Prompt 5.3: Implement Industry Research Module

```text
Building on research capabilities, implement industry research.

Create /src/lib/research/industry.ts:

1. researchIndustry(industry: string, companyContext?: string): Promise<IndustryResearch>
   - Determine industry from company context if not explicit
   - Build comprehensive prompt for industry analysis
   - Request:
     - Market size and growth
     - Key drivers
     - Competitive dynamics
     - Regulatory environment
     - Recent trends
     - Major players
     - Headwinds and tailwinds
   - Include citation placeholders
   - Parse into structured format

Create /src/lib/ai/prompts/industryResearch.ts:

buildIndustryResearchPrompt(industry: string, context?: string): string
- Comprehensive prompt requesting:
  - Detailed industry analysis
  - Specific data points where available
  - Source attributions (even if general: "Industry reports indicate...")
  - Professional valuation report tone
  - Minimum 500 words
  - Section headers for organization

Create /src/types/research.ts (update):
- IndustryResearch type:
  - overview: string
  - marketSize: string
  - growthRate: string
  - keyDrivers: string[]
  - competitiveLandscape: string
  - regulatoryEnvironment: string
  - recentTrends: string[]
  - majorPlayers: string[]
  - outlook: string
  - citations: Citation[]
- Citation type:
  - text: string
  - source: string

2. formatIndustryWithCitations(research: IndustryResearch): string
   - Combine sections into flowing narrative
   - Add footnote markers
   - Generate footnote list at end

Test with various industries to ensure quality output.
```

---

### Prompt 5.4: Implement Valuation Narrative Generation

```text
Building on AI capabilities, implement valuation narrative generation.

Create /src/lib/ai/prompts/valuationNarrative.ts:

1. buildGuidelineCompanyPrompt(data: ApproachData, context?: string): string
   - Request narrative explaining:
     - Why these specific comps were selected
     - Which multiples used and why
     - How subject company compares to comps
     - Any adjustments made
   - Use professional valuation report tone
   - Infer rationale from data patterns (revenue scale, industry, etc.)

2. buildMATransactionPrompt(data: ApproachData, context?: string): string
   - Similar structure for M&A comps
   - Explain transaction selection
   - Discuss relevance to subject company

3. buildIncomeApproachPrompt(data: ApproachData, context?: string): string
   - Explain DCF methodology
   - Discuss key assumptions (discount rate, growth, terminal value)
   - Professional framing

4. buildConclusionPrompt(approaches: ApproachData[], weights: WeightData[], context?: string): string
   - Explain weighting decisions
   - Apply heuristics:
     - OPM > 1 year old → minimal weight
     - Pre-revenue → lower income approach weight
     - Recent funding < 6 months → higher backsolve weight
     - Weak comp set → lower weight
   - Generate rationale paragraph

Create /src/lib/narrative/generator.ts:

1. generateApproachNarrative(approach: string, data: ApproachData, context?: string): Promise<string>
   - Route to appropriate prompt builder
   - Call Claude
   - Return narrative text

2. generateConclusionNarrative(parsedModel: ParsedModel, context?: string): Promise<string>
   - Analyze approaches and weights
   - Apply heuristics
   - Generate conclusion paragraph

3. generateAllNarratives(parsedModel: ParsedModel, voiceTranscript?: string): Promise<NarrativeSet>
   - Generate narratives for all approaches found in model
   - Generate conclusion
   - Return complete set

Create /src/types/narrative.ts:
- NarrativeSet type with all narrative sections
- ApproachNarrative type
```

---

### Prompt 5.5: Create Master Generation Orchestrator

```text
Building on all generation modules, create the master orchestrator.

Create /src/lib/generation/orchestrator.ts:

1. generateReportContent(engagement: Engagement, parsedModel: ParsedModel): Promise<ReportContent>
   
   This is the main function that coordinates everything:
   
   a. Load required resources:
      - Get template for report type
      - Get economic outlook for valuation date
      - Get style examples for tone reference
   
   b. Generate company research:
      - Call researchCompany with company name
      - Include voice transcript as context
      - Store results
   
   c. Generate industry research:
      - Determine industry from company info
      - Call researchIndustry
      - Format with citations
   
   d. Get economic outlook:
      - Load stored document for matching quarter
      - Extract content
      - Flag if not found
   
   e. Generate valuation narratives:
      - For each approach in parsed model
      - Use voice transcript as context
      - Store narratives
   
   f. Generate conclusion narrative:
      - Apply weighting heuristics
      - Generate rationale
   
   g. Compile all content:
      - Structure into ReportContent object
      - Include all flags and warnings
      - Track what was AI-generated vs template vs missing

Create /src/types/generation.ts:
- ReportContent type with all sections:
  - companyOverview: SectionContent
  - industryOutlook: SectionContent
  - economicOutlook: SectionContent
  - valuationAnalysis: { [approach: string]: SectionContent }
  - conclusion: SectionContent
  - flags: Flag[]
  - warnings: string[]
- SectionContent: { content: string, source: "ai" | "template" | "stored", confidence: number }
- Flag: { section: string, message: string, type: "missing" | "uncertain" | "review" }

2. validateContent(content: ReportContent): ValidationResult
   - Check all required sections have content
   - Verify no critical errors
   - Return validation status

Add comprehensive error handling:
- Continue generation even if one section fails
- Track errors and include in flags
- Provide partial content when possible
```

---

## Phase 6: Document Generation

### Prompt 6.1: Set Up Word Document Generator

```text
Building on the existing project, set up Word document generation.

Install: docx (npm package for creating .docx files)

Create /src/lib/document/generator.ts:

Import necessary docx components:
- Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell
- HeadingLevel, AlignmentType, etc.

Create document generation utilities:

1. createDocument(options: DocumentOptions): Document
   - Set up document with:
     - Default styles (font, sizes)
     - Page margins
     - Header with company name
     - Footer with page numbers

2. createHeading(text: string, level: 1 | 2 | 3): Paragraph
   - Create styled heading paragraph

3. createParagraph(text: string, options?: ParagraphOptions): Paragraph
   - Create body paragraph
   - Support for highlighting (for flags)

4. createHighlightedText(text: string): TextRun
   - Yellow highlighted text for flagged content

5. createPlaceholder(message: string): Paragraph
   - Create highlighted placeholder: [MISSING: {message}]

6. createTable(data: TableData): Table
   - Create formatted table for value indications

Create /src/types/document.ts:
- DocumentOptions type
- ParagraphOptions type
- TableData type

Create /src/lib/document/styles.ts:
- Define document styles (fonts, sizes, colors)
- Match MELD branding as much as possible
- Professional valuation report appearance

Test by creating a simple document:
- /src/app/api/test-document/route.ts
- Generate a basic document with a heading and paragraph
- Return as downloadable file
```

---

### Prompt 6.2: Implement Template Loading and Parsing

```text
Building on document generation, implement template handling.

Install: mammoth (for reading .docx as HTML/text) or use docx for template parsing

Create /src/lib/document/template.ts:

1. loadTemplate(filePath: string): Promise<TemplateContent>
   - Read the .docx file
   - Parse structure (sections, paragraphs, tables)
   - Identify placeholder patterns (*COMPANY, *VALUATIONDATE, etc.)
   - Return structured template content

2. findPlaceholders(content: string): Placeholder[]
   - Find all *PLACEHOLDER patterns
   - Return list with:
     - placeholder: string (e.g., "*COMPANY")
     - position: number (character position)

3. identifySections(template: TemplateContent): TemplateSection[]
   - Parse template into logical sections
   - Identify which sections are:
     - boilerplate (keep as-is)
     - placeholder-only (simple substitution)
     - generated (needs AI content)
   - Map to our section types

Create /src/types/template.ts:
- TemplateContent type
- Placeholder type
- TemplateSection type with:
  - name: string
  - type: "boilerplate" | "substitution" | "generated"
  - content: string
  - placeholders: Placeholder[]

4. validateTemplate(template: TemplateContent, reportType: ReportType): ValidationResult
   - Check template has expected sections
   - Verify required placeholders exist
   - Return validation status with any issues

Note: Template parsing is complex. For MVP, we can use a simpler approach:
- Templates are structured documents
- We replace placeholders inline
- Generated content is inserted at known positions (by section heading)
```

---

### Prompt 6.3: Implement Report Assembly

```text
Building on template loading and content generation, implement report assembly.

Create /src/lib/document/assembler.ts:

1. assembleReport(template: TemplateContent, content: ReportContent, data: ReportData): Promise<Buffer>
   
   Main assembly function:
   
   a. Create new document based on template structure
   
   b. Process each section:
      - For boilerplate: copy directly
      - For substitution: replace placeholders with data:
        - *COMPANY → data.companyName
        - *VALUATIONDATE → formatted valuation date
        - Other placeholders as defined
      - For generated sections:
        - Company Overview: insert content.companyOverview
        - Industry Outlook: insert content.industryOutlook with footnotes
        - Economic Outlook: insert content.economicOutlook
        - Valuation Analysis: insert each approach narrative
        - Conclusion: insert value table + narrative
   
   c. Add flagged content highlighting:
      - Scan for content marked as uncertain
      - Apply yellow highlight
      - Add placeholders for missing data
   
   d. Insert special elements:
      - [INSERT CAP TABLE IMAGE HERE] placeholder
      - Footnotes for industry citations
   
   e. Build final document using docx library
   
   f. Generate buffer using Packer.toBuffer()
   
   Return the document buffer

Create /src/lib/document/placeholders.ts:
- PLACEHOLDER_MAP constant mapping placeholder names to data keys
- replacePlaceholder(text: string, placeholder: string, value: string): string
- replaceAllPlaceholders(text: string, data: ReportData): string

Create /src/lib/document/footnotes.ts:
- addFootnotes(content: string, citations: Citation[]): { content: string, footnotes: string[] }
- Format footnotes for the Industry Outlook section

2. saveReport(buffer: Buffer, engagement: Engagement): Promise<string>
   - Generate filename: {companyName} - {reportType} - {valuationDate} - DRAFT_v1.docx
   - Save to reports directory
   - Return file path

Create integration test:
- Load test template
- Use mock generated content
- Assemble document
- Verify output opens in Word correctly
```

---

### Prompt 6.4: Create Complete Generation Pipeline

```text
Building on all generation components, create the complete pipeline.

Create /src/lib/generation/pipeline.ts:

1. async generateReport(engagementId: string): Promise<GenerationResult>
   
   Complete pipeline:
   
   a. Load engagement from database
      - Verify status is PROCESSING
      - Get all engagement data
   
   b. Load model file and parse
      - Call parseValuationModel
      - Handle parsing errors
   
   c. Load required resources
      - Get template for report type
      - Get economic outlook for date
      - Get style examples
   
   d. Generate all content
      - Call orchestrator.generateReportContent
      - This generates all AI content
   
   e. Assemble document
      - Call assembler.assembleReport
      - Save document to storage
   
   f. Create database record
      - Create GeneratedReport record
      - Link to engagement
      - Set expiresAt
   
   g. Update engagement status
      - Set status to COMPLETE
      - Store report reference
   
   h. Return result
      - Success: { success: true, reportPath, warnings }
      - Failure: { success: false, error }

2. Handle errors at each step:
   - Log detailed errors
   - Update engagement status to ERROR if fatal
   - Store error message in engagement
   - Allow partial success where possible

Create /src/lib/generation/status.ts:
- updateEngagementStatus(id: string, status: EngagementStatus, error?: string): Promise<void>
- Helper for consistent status updates

Create /src/types/generation.ts (update):
- GenerationResult type
- GenerationError type

Update /src/app/api/engagements/[id]/generate/route.ts:
- Call generateReport function
- For now, run synchronously (background processing in next step)
- Return generation result
```

---

## Phase 7: Background Processing & Notifications

### Prompt 7.1: Set Up Background Job Processing

```text
Building on the generation pipeline, implement background processing.

For MVP, we'll use a simple approach without external queue services:

Create /src/lib/jobs/queue.ts:

Simple in-memory job tracking (for single-instance deployment):

interface Job {
  id: string
  engagementId: string
  status: 'pending' | 'running' | 'complete' | 'failed'
  startedAt?: Date
  completedAt?: Date
  error?: string
}

const jobs: Map<string, Job> = new Map()

1. queueGenerationJob(engagementId: string): string
   - Create job record
   - Return job ID
   - Trigger async generation

2. getJobStatus(jobId: string): Job | null
   - Return current job status

3. async processJob(job: Job): Promise<void>
   - Update job status to 'running'
   - Call generateReport
   - Update status to 'complete' or 'failed'
   - Store any errors

4. Start processing immediately after queue (no external worker)

Create /src/app/api/jobs/[id]/route.ts:

GET handler:
- Return job status
- Include progress info if available

Update /src/app/api/engagements/[id]/generate/route.ts:
- Queue the job instead of running synchronously
- Return job ID immediately
- Client can poll for status

Create /src/components/engagement/GenerationStatus.tsx:
- Polls job status endpoint
- Shows progress (Parsing model... Researching company... Generating... etc.)
- Redirects to dashboard when complete

Update the new engagement flow:
- After clicking Generate, show GenerationStatus component
- Poll every 5 seconds
- Show completion or error state
- Link to download when ready

Note: For production scale, consider:
- Redis/BullMQ for job queue
- Separate worker process
- Database-backed job storage
```

---

### Prompt 7.2: Implement Email Notifications

```text
Building on background processing, add email notifications.

Install: nodemailer, @types/nodemailer

Create /src/lib/email/client.ts:

1. Initialize nodemailer transporter with SMTP settings from env:
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASSWORD
   - SMTP_FROM

2. sendEmail(options: EmailOptions): Promise<void>
   - to: string
   - subject: string
   - html: string
   - text: string (plain text fallback)
   - Handle send errors gracefully

Create /src/lib/email/templates/reportReady.ts:

1. buildReportReadyEmail(data: ReportReadyData): { subject: string, html: string, text: string }
   - Subject: "Your {companyName} Valuation Report is Ready"
   - HTML template with:
     - MELD branding
     - Completion message
     - Report details (company, type, date)
     - Link to download (dashboard URL)
     - Any warnings to note
   - Plain text version

Create /src/lib/email/templates/reportFailed.ts:

1. buildReportFailedEmail(data: ReportFailedData): { subject: string, html: string, text: string }
   - Subject: "Report Generation Failed - {companyName}"
   - Error information
   - Suggestion to retry or contact support

Create /src/lib/email/notify.ts:

1. notifyReportComplete(engagement: Engagement, warnings: string[]): Promise<void>
   - Get user email from engagement.user
   - Build email content
   - Send email
   - Log success/failure

2. notifyReportFailed(engagement: Engagement, error: string): Promise<void>
   - Similar but for failures

Update /src/lib/generation/pipeline.ts:
- After successful generation, call notifyReportComplete
- After failure, call notifyReportFailed

Test email sending:
- Create test endpoint
- Verify emails arrive correctly
- Check formatting in email clients
```

---

### Prompt 7.3: Implement Data Cleanup Job

```text
Building on the storage utilities, implement data cleanup.

Update /src/lib/storage/cleanup.ts:

1. cleanupExpiredData(): Promise<CleanupResult>
   
   a. Find expired engagements:
      - Query: WHERE expiresAt < NOW()
   
   b. For each expired engagement:
      - Delete model file if exists
      - Delete any generated reports and their files
      - Delete engagement record
   
   c. Find orphaned files:
      - List files in models directory
      - Check if each has a corresponding database record
      - Delete orphaned files
   
   d. Same for reports directory
   
   e. Return cleanup summary:
      - engagementsDeleted: number
      - filesDeleted: number
      - spaceReclaimed: number (bytes)

2. Add logging throughout cleanup process

Create /src/app/api/admin/cleanup/route.ts:

POST handler:
- Requires auth
- Runs cleanupExpiredData
- Returns cleanup results

Note: For automated cleanup, options include:
- Cron job hitting the API endpoint
- Vercel Cron (if using Vercel)
- Railway cron jobs
- Run on app startup if > 24 hours since last cleanup

Create /src/lib/storage/lastCleanup.ts:
- Track when cleanup last ran (store in database or file)
- shouldRunCleanup(): boolean - returns true if > 24 hours

Update app initialization:
- Check shouldRunCleanup on startup
- Run cleanup in background if needed
- Don't block app startup
```

---

## Phase 8: Polish & Finalization

### Prompt 8.1: Implement Error Handling UI

```text
Building on the existing UI, implement comprehensive error handling.

Create /src/components/ui/Toast.tsx:
- Toast notification component
- Variants: success, error, warning, info
- Auto-dismiss after configurable time
- Stacks multiple toasts

Create /src/components/providers/ToastProvider.tsx:
- Context for managing toasts
- useToast hook: { toast(options), dismiss(id) }
- Render toast container

Create /src/components/ui/ErrorBoundary.tsx:
- React error boundary
- Catches render errors
- Shows friendly error message
- Option to retry
- Logs errors for debugging

Create /src/components/ui/ErrorMessage.tsx:
- Reusable error display component
- Props: error, onRetry
- Styled error box with message and retry button

Update key flows with error handling:

1. Login flow:
   - Handle OAuth errors
   - Show message for unauthorized email

2. File upload:
   - Handle upload failures
   - Handle parsing errors
   - Show specific error messages

3. Generation flow:
   - Handle job failures
   - Show generation errors
   - Provide retry option

4. Download:
   - Handle missing files
   - Show appropriate errors

Update /src/app/(dashboard)/layout.tsx:
- Wrap in ErrorBoundary
- Include ToastProvider

Add try-catch blocks to all API calls in components.
```

---

### Prompt 8.2: Add Loading States and Polish

```text
Building on the existing UI, add loading states and polish.

Create /src/components/ui/Spinner.tsx:
- Simple loading spinner
- Props: size (sm, md, lg)
- Animated SVG or Tailwind CSS animation

Create /src/components/ui/Skeleton.tsx:
- Skeleton loading placeholder
- Props: width, height, rounded
- Animated shimmer effect

Create /src/components/ui/LoadingOverlay.tsx:
- Full-screen loading overlay
- Props: message
- Semi-transparent background with spinner

Update components with loading states:

1. Dashboard:
   - Skeleton for engagement list while loading
   - Spinner on refresh

2. Settings page:
   - Skeleton for template/outlook lists
   - Disable form during upload

3. New engagement flow:
   - Loading state during file upload
   - Loading state during parsing
   - Clear progress indicators

4. Generation status:
   - Animated progress
   - Clear stage indicators

Polish existing components:

1. Buttons:
   - Hover and active states
   - Focus rings for accessibility
   - Consistent sizing

2. Forms:
   - Input focus states
   - Error states
   - Disabled states

3. Cards:
   - Consistent shadows
   - Hover states where clickable

4. Tables:
   - Row hover states
   - Better spacing

Add transitions:
- Smooth page transitions
- Modal open/close animations
- Toast slide-in animations
```

---

### Prompt 8.3: Final Integration Testing and Bug Fixes

```text
Perform comprehensive testing of the complete application.

Create /src/lib/test/testData.ts:
- Sample data for testing all flows
- Mock Excel model data
- Mock template data

Testing checklist:

1. Authentication:
   [ ] Google OAuth login works
   [ ] Unauthorized email is rejected
   [ ] Session persists across page reloads
   [ ] Logout clears session

2. Settings:
   [ ] Template upload works
   [ ] Template list displays correctly
   [ ] Template delete works
   [ ] Economic outlook upload works
   [ ] Correct quarter/year matching
   [ ] Style example upload works

3. New Engagement Flow:
   [ ] Report type selection works
   [ ] Model upload works with .xlsx files
   [ ] Model parsing extracts correct data
   [ ] Voice input records and transcribes
   [ ] Review shows correct information
   [ ] Generate creates engagement

4. Report Generation:
   [ ] Background job starts
   [ ] Status updates correctly
   [ ] Email notification sends
   [ ] Report downloads correctly
   [ ] Errors are handled gracefully

5. Dashboard:
   [ ] Engagements list shows all engagements
   [ ] Status badges are correct
   [ ] Download works for complete reports
   [ ] Empty state shows correctly

6. Error Handling:
   [ ] Network errors show appropriate messages
   [ ] Invalid files are rejected
   [ ] API errors don't crash the app

Fix any bugs discovered during testing.

Update error messages to be user-friendly.

Verify mobile responsiveness (basic).

Create production build and verify it works:
npm run build
npm run start
```

---

### Prompt 8.4: Deployment Configuration

```text
Prepare the application for production deployment on Railway.

Update next.config.js:
- Configure for production
- Set up any needed rewrites/redirects
- Configure image domains if using next/image

Create railway.toml (or configure in Railway dashboard):
- Node.js environment
- Build command: npm run build
- Start command: npm run start
- Health check endpoint

Create health check endpoint /src/app/api/health/route.ts:
- GET handler returns { status: "ok", timestamp }
- Used by Railway for health monitoring

Update package.json scripts:
- "build": "prisma generate && next build"
- "start": "next start"
- "postinstall": "prisma generate"

Environment variables checklist for Railway:
- DATABASE_URL (Railway PostgreSQL)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTAUTH_SECRET (generate with openssl rand -base64 32)
- NEXTAUTH_URL (production URL)
- ANTHROPIC_API_KEY
- ALLOWED_EMAIL
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM

Database setup:
- Railway PostgreSQL addon
- Run prisma db push after deployment

Storage setup:
- Configure persistent volume in Railway
- Mount at /app/uploads
- Update UPLOAD_BASE_PATH env var

Create /src/lib/env.ts:
- Validate all required environment variables on startup
- Throw helpful errors if missing

Update initialization:
- Validate env vars
- Ensure upload directories exist
- Run cleanup check

Document deployment process in README.md.
```

---

## Summary

### Phase 1: Project Foundation (5 prompts)
1. Initialize Next.js Project with TypeScript
2. Set Up Prisma and Database Schema
3. Set Up NextAuth with Google OAuth
4. Create Login Page UI
5. Create Dashboard Layout and Shell

### Phase 2: File Management Infrastructure (5 prompts)
1. Set Up File Storage Utilities
2. Create File Upload API Endpoint
3. Create Template Management System
4. Create Economic Outlook Management
5. Create Style Examples Management

### Phase 3: Excel Parsing (3 prompts)
1. Set Up Excel Parser Foundation
2. Implement Data Extraction Logic
3. Create Model Parsing API Endpoint

### Phase 4: Engagement Flow (5 prompts)
1. Create New Engagement Page - Basic Structure
2. Implement Model Upload Step
3. Implement Voice Input Step
4. Implement Review and Generate Step
5. Update Dashboard with Engagement List

### Phase 5: AI Integration (5 prompts)
1. Set Up Claude API Client
2. Implement Company Research Module
3. Implement Industry Research Module
4. Implement Valuation Narrative Generation
5. Create Master Generation Orchestrator

### Phase 6: Document Generation (4 prompts)
1. Set Up Word Document Generator
2. Implement Template Loading and Parsing
3. Implement Report Assembly
4. Create Complete Generation Pipeline

### Phase 7: Background Processing & Notifications (3 prompts)
1. Set Up Background Job Processing
2. Implement Email Notifications
3. Implement Data Cleanup Job

### Phase 8: Polish & Finalization (4 prompts)
1. Implement Error Handling UI
2. Add Loading States and Polish
3. Final Integration Testing and Bug Fixes
4. Deployment Configuration

---

**Total: 34 prompts**

Each prompt is designed to:
- Be self-contained but build on previous work
- End with integration/wiring
- Be small enough to complete safely
- Be large enough to make meaningful progress
- Result in working, testable functionality
