# WFH Attendance (frontend)

Web app for a work-from-home attendance system. Employees check in with a photo and check out. HR admins manage employees and view everyone's attendance.

## Stack

- React 19 and TypeScript, built with Vite
- React Router for routing
- TanStack Query and Axios for API calls
- React Hook Form and Zod for forms
- Tailwind CSS 4, Radix UI, react-day-picker and lucide-react for the UI
- Vitest and Testing Library for tests

## Run it

Requirements: Node.js 22 or newer, and the backend gateway running on `http://localhost:3000`.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The dev server forwards `/api` requests to the gateway.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built app |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm test` | Run the tests |
