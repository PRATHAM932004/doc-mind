# DocMind — AI-Powered Company Knowledge Assistant

DocMind is a production-quality full-stack AI company knowledge assistant. Users can upload company documentation in **PDF**, **Word (DOCX)**, **Markdown (MD)**, and **Plain Text (TXT)** formats. The application parses the files, segments them semantically, embeds chunks using Google Gemini's `text-embedding-004` model (768 dimensions), indexes them in a PostgreSQL database using `pgvector`, and uses Retrieval-Augmented Generation (RAG) to provide grounded answers via `gemini-1.5-flash` with source citations.

---

## 1. Architecture Diagram

The flow of document ingestion and RAG querying is structured as follows:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client UI
    participant API as Next.js API Routes
    participant Extract as Document Extractors
    participant Chunk as Semantic Chunker
    participant Gemini as Google Gemini API
    participant DB as PostgreSQL + pgvector

    %% Phase 1: Ingestion
    Note over User, DB: Ingestion Pipeline
    User->>API: POST /api/documents/upload (FormData File)
    API->>API: Validate file format & size (< 20MB)
    API->>DB: Create Document (UPLOADING)
    API->>DB: Update Document (PROCESSING)
    API->>Extract: extractText / extractPdf / extractDocx
    Extract-->>API: Extracted raw text content
    API->>Chunk: chunkText (size ~1000, overlap ~200)
    Chunk-->>API: Semantic text segments
    loop For each chunk
        API->>Gemini: generateEmbedding (text-embedding-004)
        Gemini-->>API: 768-dimensional float vector
        API->>DB: Save Chunk (content, index, tokens)
        API->>DB: UPDATE raw vector embedding (cast to vector)
    end
    API->>DB: Update Document (COMPLETED)
    API-->>User: Ingestion success response

    %% Phase 2: Querying
    Note over User, DB: RAG Query Pipeline
    User->>API: POST /api/chat { "message": "query" }
    API->>Gemini: generateEmbedding ("query")
    Gemini-->>API: Query vector representation
    API->>DB: pgvector cosine similarity search (topK = 5)
    DB-->>API: Ranked top 5 chunks + parent document metadata
    API->>API: buildRagContext (format snippets with source names)
    API->>Gemini: Chat completion (gemini-1.5-flash) with context + strict system instructions
    Gemini-->>API: Grounded text answer
    API-->>User: ChatResponse (answer + source citations list)
```

---

## 2. Technology Stack

* **Frontend**: Next.js (App Router, TypeScript, React)
* **Design & Styling**: PrimeReact (component library), PrimeFlex (layout grid), Sass
* **Forms & Validation**: React Hook Form, Zod
* **Database & ORM**: PostgreSQL with `pgvector` extension, Prisma ORM
* **AI Engine**: Google Generative AI (Gemini Developer API - Free Tier)
* **Parsers**: `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction)
* **Timezones**: `moment-timezone` (Normalized to UTC server-side, `Asia/Kolkata` for frontend rendering)

---

## 3. Project Directory Structure

```text
doc-mind/
├── prisma/
│   └── schema.prisma        # Database schema models & extensions (768 dimensions)
├── scripts/
│   ├── test-ingest.ts       # E2E Ingestion test check
│   └── test-rag.ts          # E2E Vector search & RAG test check
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx   # Sidebar dashboard navigation frame
│   │   │   ├── page.tsx     # Dashboard home page (stats)
│   │   │   ├── documents/
│   │   │   │   └── page.tsx # Document manager table & uploader UI
│   │   │   └── chat/
│   │   │       └── page.tsx # Interactive RAG chat UI
│   │   ├── api/
│   │   │   ├── documents/
│   │   │   │   ├── route.ts          # GET: list documents
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts      # POST: upload/process pipeline
│   │   │   │   └── [id]/
│   │   │       │   └── route.ts      # DELETE: delete document & cascade
│   │   │   └── chat/
│   │   │       └── route.ts          # POST: chat completion
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   │   └── Providers.tsx # Client-side wrapper for PrimeReact Provider
│   │   ├── documents/
│   │   │   ├── FileUpload.tsx# Custom drag-drop file uploader
│   │   │   └── DocTable.tsx  # Document listing datatable
│   │   └── layout/
│   │       └── Sidebar.tsx   # Sidebar navigation links
│   ├── lib/
│   │   ├── prisma.ts         # Prisma Client singleton
│   │   ├── gemini.ts         # Gemini API client singleton
│   │   ├── documents/
│   │   │   ├── clean.ts      # Extracted text sanitization utility
│   │   │   ├── extract-pdf.ts
│   │   │   ├── extract-docx.ts
│   │   │   ├── extract-text.ts
│   │   │   ├── extract-markdown.ts
│   │   │   └── chunk.ts
│   │   ├── embeddings/
│   │   │   └── generate.ts
│   │   └── rag/
│   │       ├── search.ts
│   │       ├── context.ts
│   │       └── answer.ts
│   ├── schemas/
│   │   ├── document.ts       # Ingestion validators (Zod)
│   │   └── chat.ts           # Chat query validator (Zod)
│   ├── types/
│   │   ├── document.ts
│   │   └── chat.ts
│   └── utils/
│       └── date.ts           # moment-timezone display formatter
├── docker-compose.yml
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 4. Database Schema Design

### `Document`
- `id` (UUID, Primary Key)
- `name` (String)
- `originalName` (String)
- `mimeType` (String)
- `size` (Integer bytes)
- `status` (Enum: `UPLOADING`, `PROCESSING`, `COMPLETED`, `FAILED`)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### `DocumentChunk`
- `id` (UUID, Primary Key)
- `documentId` (Foreign Key, references `Document.id` with `onDelete: Cascade`)
- `content` (String snippet text)
- `chunkIndex` (Integer index)
- `tokenCount` (Integer character-based tokens count)
- `embedding` (Unsupported(`vector(768)`) - vector column mapped in PostgreSQL)
- `createdAt` (DateTime)

An **HNSW Index** is created on the `embedding` vector column using cosine similarity (`vector_cosine_ops`) to optimize search queries.

---

## 5. Getting Started & Setup

### Requirements

- Node.js (v18+)
- Docker and Docker Compose
- Google Gemini API Key (Free developer tier available at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Navigate to the project root:
   ```bash
   cd doc-mind
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Provide your `GEMINI_API_KEY` in the `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/docmind?schema=public"
   GEMINI_API_KEY="your-gemini-api-key"
   GEMINI_CHAT_MODEL="gemini-1.5-flash"
   GEMINI_EMBEDDING_MODEL="text-embedding-004"
   ```
   *(Note: The database host port is mapped to `5433` to prevent conflicts with any local PostgreSQL instance running natively on the default port `5432`)*

### Running Database

1. Spin up the PostgreSQL + `pgvector` container in the background:
   ```bash
   docker compose up -d
   ```

2. Synchronize the Prisma schema database models:
   ```bash
   npx prisma db push
   ```

3. Run the SQL initialization script to create the HNSW vector index:
   ```bash
   node -e "
   const { PrismaClient } = require('@prisma/client');
   const p = new PrismaClient();
   p.\$executeRawUnsafe('CREATE INDEX IF NOT EXISTS docchunk_embedding_hnsw_idx ON \"DocumentChunk\" USING hnsw (embedding vector_cosine_ops);')
     .then(() => { console.log('HNSW Index created successfully.'); p.\$disconnect(); })
     .catch(e => { console.error(e); p.\$disconnect(); });
   "
   ```

---

## 6. Running the Application

### Development Server

Run the Next.js development server:
```bash
npm run dev
```
Open `http://localhost:3000` to view the application dashboard.

---

## 7. API Endpoints Reference

### Documents API

- **POST `/api/documents/upload`**
  - Payload: `FormData` containing a `file` field.
  - Returns: `{ success: true, document: { id, name, status, ... } }`.
  - Process: Creates db record, runs file extraction and text sanitization, chunks text, generates embeddings (Gemini 768 dimensions), saves to PostgreSQL, and updates status.
  
- **GET `/api/documents`**
  - Returns: `{ documents: [ { id, name, mimeType, size, status, chunksCount, ... } ] }`.
  
- **DELETE `/api/documents/[id]`**
  - Returns: `{ success: true, message: "..." }`.
  - Process: Removes document record; cascades down to automatically delete associated chunks.

### Chat API

- **POST `/api/chat`**
  - Request Body: `{ "message": "What is our leave policy?" }`.
  - Returns:
    ```json
    {
      "answer": "Employees are entitled to 20 days of annual leave.",
      "sources": [
        {
          "documentId": "uuid-string",
          "documentName": "Employee Handbook.pdf",
          "chunkIndex": 3,
          "content": "Employees are entitled to..."
        }
      ]
    }
    ```
