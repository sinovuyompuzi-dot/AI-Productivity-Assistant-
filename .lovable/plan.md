# AI Workplace Productivity Assistant — Build Plan

A responsive, professional productivity suite with three AI tools (Email Generator, Notes Summarizer, Task Planner), powered by Lovable AI Gateway.

## Pages & Routes

- `/` — Home: hero with title, description, three feature cards (icons + links), "Get Started" CTA.
- `/email` — Smart Email Generator: form (recipient type, subject, purpose, tone) → AI-generated email in output card with Copy / Clear / Regenerate.
- `/notes` — Meeting Notes Summarizer: textarea → structured output cards (Summary, Key Points, Decisions, Action Items, Deadlines, Responsible Person).
- `/planner` — AI Task Planner: form (working hours, tasks, priority) → timeline layout with to-do list, schedule, time blocks, breaks, productivity tips.
- `/about` — About page explaining purpose and AI review reminder.

## Shared Layout

- Persistent sidebar/top nav (responsive: sidebar on desktop, hamburger sheet on mobile) with links to all 5 pages.
- Dark mode toggle in header (persisted in localStorage, toggles `.dark` class on `<html>`).
- Footer disclaimer on every page: *"AI-generated content may contain mistakes. Users should review all generated information before sending emails or making business decisions."*
- Sonner toast for success notifications ("Copied!", "Generated successfully").
- Loading spinner overlay on generate buttons.

## AI Backend

Three TanStack `createServerFn` POST endpoints in `src/lib/ai.functions.ts`, each calling Lovable AI Gateway with `google/gemini-3-flash-preview`:

- `generateEmail({ recipientType, subject, purpose, tone })` → returns `{ email: string }`.
- `summarizeNotes({ notes })` → structured output via Zod schema returning `{ summary, keyPoints[], decisions[], actionItems[], deadlines[], responsiblePerson[] }`.
- `generateSchedule({ workingHours, tasks, priority })` → structured output returning `{ todos[], schedule[{time, task}], timeBlocks[], breaks[], tips[] }`.

Server provider helper in `src/lib/ai-gateway.server.ts` using `@ai-sdk/openai-compatible` with `LOVABLE_API_KEY`. Surfaces 429/402 errors as friendly toasts.

## Design

- Blue/white palette via semantic tokens in `src/styles.css` (`--primary` blue, soft surfaces, dark mode mirror).
- Rounded `2xl` cards, soft shadows, Lucide icons (Mail, FileText, Calendar, Sparkles, Info, Home).
- Tailwind animations (`fade-in`, `scale-in`) on cards and outputs.
- Typography: Inter via `@fontsource-variable/inter`.

## Technical Details

- Routes under `src/routes/`: `index.tsx`, `email.tsx`, `notes.tsx`, `planner.tsx`, `about.tsx`; shared layout in `__root.tsx`.
- Each route sets unique `head()` meta (title + description + og tags).
- Lovable Cloud not required (no DB/auth); only AI Gateway via auto-provisioned `LOVABLE_API_KEY`.
- Forms: shadcn `Form` + `react-hook-form` + `zod`.
- Client calls server fns via `useServerFn` + TanStack Query `useMutation`.
- Dark mode: small `ThemeProvider` hook managing `documentElement.classList`.

Ready to build on approval.