---
name: obsidian-ui
description: Component, styling and state conventions for the Obsidian frontend — shadcn-style primitives in src/components/ui, Tailwind v4, motion, lucide-react, sonner, and React 19 with the React Compiler enabled. Use this skill whenever you create or edit anything under src/components/ or src/app/ that renders UI, add a dialog, panel, list item or form, wire up loading and error states, or are tempted to install a UI library. Use it before writing the first JSX of a new component.
---

# Obsidian: frontend conventions

## Do not install anything

Everything you need is already here: `src/components/ui/` (shadcn-style, ~60 primitives), `lucide-react` for icons, `motion` for animation, `sonner` for toasts, `react-markdown` + `remark-gfm` + `rehype-sanitize` behind `src/components/ui/markdown.tsx`, Tailwind v4. Adding a component library, an icon set, or a form library is a regression.

Before hand-rolling anything, check whether the primitive exists: `ls src/components/ui/`.

## React 19 with the compiler on

`reactCompiler: true` is set in `next.config.ts`. Do **not** hand-write `useMemo` or `useCallback` for performance — write plain values and functions. Use them only when you need referential identity for correctness.

## Visual language to match

Look at `document-item.tsx`, `documents-panel.tsx` and `document-preview-dialog.tsx` before writing new UI, and copy their idiom:

- `size-4` icons, `text-sm` body, `text-xs text-muted-foreground` for metadata
- `rounded-md`, `border`, `bg-card/90`, `bg-muted/40` for hover
- `Card` with `py-0` and an `h-12 shrink-0 border-b px-3` header row for panels
- `ScrollArea` around `min-h-0 flex-1` for scrolling regions
- `AlertDialog` for destructive confirmations, never `window.confirm`
- `toast.success` / `toast.error` from `sonner` for outcomes
- `Skeleton` for loading, never a bare spinner in a layout slot

## Non-negotiable states

Every data-driven surface needs four: **loading**, **empty**, **error with a retry affordance**, and **success**. The existing preview dialog is a good reference — it caches per id, exposes a Retry button, and never renders a blank box.

## Accessibility

- Every icon-only button gets an `aria-label`. The codebase does this consistently; do not break the pattern.
- Interactive rows use a real `<button>` overlay, not `onClick` on a `div`. Watch that overlays do not swallow clicks on nested controls (checkboxes, menus) — those need `relative z-10`.
- Respect `useReducedMotion()` from `motion/react`, as `documents-panel.tsx` does.
- Radix handles focus trapping in dialogs; verify you have not broken it, do not reimplement it.

## Data fetching from client components

Fetch through the API routes, parse the envelope, and surface `payload.error.message`:

```ts
const response = await fetch(url, { method: "POST", body: formData });
const payload = await response.json();
if (!response.ok || !payload.success) {
  throw new Error(payload?.error?.message ?? "Something went wrong.");
}
```

Optimistic updates need a rollback path — `project-workspace.tsx` removes its temporary message on failure. Match that.

## Where state lives

`ProjectWorkspace` is the state owner for chats, documents, selection and messages. Child panels take props and callbacks; they do not fetch. Keep it that way rather than scattering fetches into leaves.

## Registries over hardcoding

When behaviour varies by type (file format, preview mode, status), drive it from one exported array or map, and render from that array. If adding a seventh case means editing three files, the design is wrong.
