# WFH Attendance (frontend)

React SPA for the WFH attendance system. Employees check in with a photo and check out. HR admins manage employees and view everyone's attendance (view only).

Design brief: [docs/DESIGN_PROMPT.md](docs/DESIGN_PROMPT.md). Architecture: [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md).

## Run

The gateway must run on `http://localhost:3000`.

```bash
npm install
npm run dev        # http://localhost:5173, /api is proxied to the gateway
npm test           # Vitest
npm run typecheck
npm run lint
npm run build
```

`VITE_API_BASE_URL` defaults to `/api` (see `.env.example`).

## Stack

React 19, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form with Zod, Tailwind CSS 4, Radix Select and Popover, react-day-picker, cva with tailwind-merge, lucide icons. Fonts are self-hosted (Hanken Grotesk, DM Mono), so a strict CSP (`default-src 'self'; img-src 'self' blob:`) works.

```
src/
  app/        providers, router, layouts (AuthLayout, AppLayout), guards, error boundary
  pages/      one component per route
  features/   auth, attendance, employees (api, queries, components, schemas)
  shared/     api client and errors, UI components (ui/ holds shadcn-style primitives), hooks, lib, types
```

The custom component is `features/attendance/components/PhotoUploader.tsx`: click or tap to choose, drag and drop, preview with Replace and Remove, client-side type, size and empty checks, and an upload progress overlay. Its object URLs are revoked when the file changes.

## Proxy and cookies

The gateway has no global prefix. The SPA calls `/api/...` and the proxy strips `/api`, so the SPA route `/attendance/me` never collides with the API route.

The gateway sets the refresh cookie with `Path=/auth`. The browser calls `/api/auth/refresh`, so the dev proxy rewrites the cookie path (`cookiePathRewrite: { '/auth': '/api/auth' }` in `vite.config.ts`). Without the rewrite, the refresh cookie is never sent and every session ends after the 15-minute access token. In production with Nginx, use the same rewrite:

```nginx
location /api/ {
  proxy_pass http://gateway:3000/;
  proxy_cookie_path /auth /api/auth;
}
```

## Design tokens

Defined once in `src/index.css` as CSS variables, exposed to Tailwind through `@theme`. Light and dark themes are included. The dark theme follows the system until the person uses the toggle in the top bar.

| Token | Light | Use |
|---|---|---|
| `ground` | `oklch(0.982 0.003 85)` | page background |
| `surface` | `#fff` | cards, top bar, sidebar |
| `sunken` | `oklch(0.958 0.004 85)` | photo frames, read-only fields |
| `ink` | `oklch(0.225 0.008 70)` | text, warm near-black |
| `muted` | `oklch(0.49 0.01 70)` | secondary text (5.9:1 on ground) |
| `line` | ink at 13% | hairlines |
| `action` | `oklch(0.49 0.165 258)` | the one accent: primary buttons, focus ring, active nav |
| `ok` / `ok-soft` | green | Present, Active |
| `warn` / `warn-soft` | amber | Late |
| `neutral-soft` | grey | Not checked out, Inactive |
| `danger` / `danger-soft` | red | errors and destructive actions only |

Every text and badge pair passes WCAG AA in both themes. Status is never shown by colour alone: each badge has its word, and Present and Late also have an icon.

- **Glass:** soft frosted panels over a pale fixed "aurora" (three radial washes: blue, aqua, peach). `.glass` is used for cards, tables and the sidebar, `.glass-bar` for the top bar and the phone tab bar, and `.glass-strong` for dialogs and toasts. Panels blur at 18px with 60–86% opacity. Muted text keeps at least 4.5:1 even at the strongest wash. Panels go solid when the browser has no `backdrop-filter` or the person sets `prefers-reduced-transparency`.
- **Form primitives** (`src/shared/components/ui/`, shadcn style): `Input` (variants `default` and `line`, sizes `default` and `sm`), `Label`, and the Radix `Select` family (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, ...). They share one `cva` style in `ui/variants.ts`. `Field`, `TextField` and `SelectField` in `shared/components/Field.tsx` wrap them with a label, hint and error. `SelectField` takes `options`, `value` and `onValueChange`, plus `emptyLabel` for an "All ..." choice that maps to an empty string; use it with React Hook Form through `Controller`. `Popover` and `Calendar` (react-day-picker, weeks start on Monday) build `DatePicker` (`shared/components/DatePicker.tsx`), wrapped as `DateField`. It takes and returns plain `YYYY-MM-DD` strings, so dates never shift with the browser timezone, and supports `min`, `max` and a `highlight` range.
- **Search and requests:** typed filters are debounced: the Employees name search (`SearchField`, 350ms, Enter searches at once) and the HR attendance employee picker (`Combobox`, 300ms). The combobox loads nothing until the person types, then asks `GET /employees?search=…&limit=10`. Every read passes TanStack Query's `AbortSignal` to Axios, so a request replaced by a newer one, or left behind by a page change, is cancelled. A failed combobox search is not retried, and cancellations never show as errors.
- **Type:** Hanken Grotesk. 13px labels (the floor), 14px secondary, 16px body and fields, 20px card titles, 24 to 30px page titles. Sentence case, no tracked capitals. DM Mono for employee codes.
- **Spacing:** the 4px scale only (4, 8, 12, 16, 24, 32, 48, 64).
- **Radius:** `control` 8px (buttons, fields), `panel` 12px, `card` 16px.
- **Controls:** fields and buttons are 40px with a mouse and 44px on touch screens (row actions 32px/36px). Text in fields is 16px, so phones don't zoom.
- **Motion:** buttons step 1px up on hover and sink 1px (scale .985) on press, in 150/120/90ms. A linked card lifts 2px and a thumbnail zooms to 1.03. The focus ring never animates. Under reduced motion only colours change.
