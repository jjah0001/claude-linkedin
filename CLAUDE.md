# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup
npm run setup          # install deps + generate Prisma client + run migrations

# Development
npm run dev            # Next.js dev server with Turbopack at http://localhost:3000
npm run dev:daemon     # Same, but backgrounded with logs in logs.txt

# Build / lint
npm run build
npm run lint

# Tests
npm test               # run all Vitest tests
npx vitest run src/path/to/__tests__/Foo.test.tsx   # run a single test file

# Database
npx prisma migrate dev  # apply new migrations
npm run db:reset        # wipe and re-migrate (destructive)
```

The app runs without `ANTHROPIC_API_KEY` — it falls back to a mock provider that returns static code instead of calling Claude.

## Architecture

### Overview

UIGen is an AI-powered React component generator. Users describe what they want in a chat; Claude generates JSX files into an in-memory virtual file system; a sandboxed `<iframe>` renders the result live.

### Data flow

1. **Chat** — `ChatProvider` (`src/lib/contexts/chat-context.tsx`) wraps Vercel AI SDK's `useChat`. On every send it serializes the virtual FS and passes it as `body.files` to `POST /api/chat`.

2. **API route** (`src/app/api/chat/route.ts`) — Reconstructs a `VirtualFileSystem` from the serialized data, then calls Claude via `streamText` with two tools:
   - `str_replace_editor` — create/str_replace/insert operations on files
   - `file_manager` — rename/delete operations

3. **File system sync** — Tool call results stream back to the client. `ChatContext` fires `onToolCall`, which routes to `FileSystemContext.handleToolCall` (`src/lib/contexts/file-system-context.tsx`), which mutates the in-memory `VirtualFileSystem` and increments `refreshTrigger`.

4. **Preview** — `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) watches `refreshTrigger`. On change it calls `createImportMap` + `createPreviewHTML` from `src/lib/transform/jsx-transformer.ts`, which:
   - Compiles every `.jsx/.tsx` file client-side with `@babel/standalone`
   - Creates `blob:` URLs for each compiled module
   - Builds an ES module import map (with `@/` alias support and `esm.sh` fallback for third-party packages)
   - Injects the import map + Tailwind CDN into a `srcdoc` HTML document

5. **Persistence** — Authenticated users have projects in SQLite via Prisma. The `onFinish` callback in the API route saves `messages` and `data` (serialized FS) back to the `Project` row. Anonymous work is held in `sessionStorage` (`src/lib/anon-work-tracker.ts`) until sign-up.

### Key files

| Path | Role |
|------|------|
| `src/lib/file-system.ts` | `VirtualFileSystem` class — the canonical in-memory FS |
| `src/lib/contexts/file-system-context.tsx` | React context wrapping the VFS; exposes `handleToolCall` |
| `src/lib/contexts/chat-context.tsx` | Vercel AI SDK chat wired to the VFS |
| `src/lib/transform/jsx-transformer.ts` | Babel transform + import map generation for the preview iframe |
| `src/app/api/chat/route.ts` | Streaming API route; system prompt lives here |
| `src/lib/auth.ts` | JWT sessions via `jose`; server-only |
| `prisma/schema.prisma` | `User` and `Project` models; SQLite at `prisma/dev.db` |

### Auth

JWT stored in an `httpOnly` cookie (`auth-token`). `getSession()` is server-only. The middleware (`src/middleware.ts`) guards `/api/projects` and `/api/filesystem`; `/api/chat` is intentionally unprotected so anonymous users can generate components. Project saving inside the chat route is silently skipped when unauthenticated.

### Routing

- `/` — anonymous users see the editor; authenticated users are redirected to their most recent project (or a newly created one)
- `/[projectId]` — loads a saved project; redirects to `/` if unauthenticated or project not found

### Generated-component constraints

The system prompt (in the API route) enforces:
- Every project must have `/App.jsx` as the entry point with a default export
- Use Tailwind CSS for styling (loaded via CDN in the preview iframe), not inline styles
- No HTML files — JSX only
- Local imports use the `@/` alias (maps to the VFS root `/`)
