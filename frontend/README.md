# LearnPath AI frontend

A React + Vite learning platform with Tailwind CSS, React Router, Axios, and Zod. The UI uses ordinary function components and local state. There is no UI component library, global state library, or custom hook layer.

## Run locally

```sh
npm install
npm run dev
```

Start the existing Express backend separately on port 8080. Vite runs on port 5173. By default, Axios calls `/api` and Vite forwards those requests to `http://localhost:8080`.

An existing `.env` can override this with `VITE_API_URL=http://localhost:8080/api`. See `.env.example`. A direct connection to another origin needs the backend's `CLIENT_URL` to match the frontend origin. Never put server secrets in `VITE_` variables: Vite exposes them to the browser.

For deployment, build with `npm run build` and serve `dist/`. The host must send React page URLs to `index.html`. Configure `VITE_API_URL` at build time or route `/api` to Express on the same origin. The development proxy is not included in the production build.

Tailwind uses its [official Vite integration](https://tailwindcss.com/docs/installation/using-vite). `index.css` contains base styles and a small collection of shared classes such as `panel`, `button-primary`, and `error-message`; responsive layout utilities stay in JSX.

The interface uses a compact header, plain course lists, and simple forms. The five colors are defined once in the Tailwind theme: `#051F20`, `#0B2B26`, `#163632`, `#235347`, and `#DAF1DE`. The supplied `#DAFIDE` was interpreted as `#DAF1DE` because hex colors cannot contain the letter I. Red is reserved for errors and destructive actions.

Typography is also defined in `index.css`: Georgia for headings and the wordmark, and Trebuchet MS for body text and controls. System fallbacks keep the pages usable without downloading fonts.

## File structure

```text
frontend/
  public/
    favicon.svg
  src/
    components/
      AuthLayout.jsx
      CourseCard.jsx
      CourseForm.jsx
      DashboardLayout.jsx
      Navbar.jsx
      ProtectedRoute.jsx
      RecommendationCard.jsx
    context/
      authContext.js
      AuthProvider.jsx
    pages/
      AIAdvisorPage.jsx
      CourseDetailsPage.jsx
      CourseEditorPage.jsx
      CoursesPage.jsx
      CourseStudentsPage.jsx
      InstructorCoursesPage.jsx
      InstructorDashboard.jsx
      LoginPage.jsx
      MyCoursesPage.jsx
      RegisterPage.jsx
      StudentDashboard.jsx
    services/
      api.js
      apiError.js
    validators/
      aiForms.js
      authForms.js
      courseForms.js
    App.jsx
    main.jsx
    index.css
  tests/
    ui.spec.js
    live-api.spec.js
  .env.example
  .gitignore
  eslint.config.js
  index.html
  package.json
  package-lock.json
  playwright.config.js
  vite.config.js
  README.md
```

- `components/`: shared UI, forms, navigation, and route protection. The dashboard layout is a component, so it no longer needs a separate folder.
- `pages/`: one component for each screen, including that screen's API calls and loading/error/empty states.
- `context/`: shared authentication state. The context object is separate from the provider component to support Vite Fast Refresh.
- `services/`: one Axios client plus readable API error messages. These replace `lib/`.
- `validators/`: Zod rules for authentication, courses, and AI prompts. Keeping validation separate prevents JSX from becoming difficult to read.
- `public/`: static files served directly, such as the favicon.
- `tests/`: browser flows and live Express checks; they are not shipped to users.
- `App.jsx`: public, student, and instructor routes.
- `main.jsx`: mounts React, the router, and the authentication provider.
- `index.css`: Tailwind and shared visual styles.

The former `hooks/` folder is gone: components read authentication directly with `useContext(AuthContext)`. No authentication or validation feature was removed.

## Hooks in this project

- `useState`: remembers values that affect the UI, such as a form, the logged-in user, course data, or a loading flag. Calling the setter makes React render the new state.
- `useEffect`: synchronizes a page with the API when it mounts or its course ID/filter changes. Cleanup aborts an old request so a response from a previous page cannot overwrite the current screen.
- `useContext`: reads `AuthContext` without passing the user and login/logout functions through every component.
- `useRef`: used only where an event-triggered request must be cancelled later (course enrollment and AI advice). It stores an `AbortController` without triggering renders. Form and display data stay in `useState`.
- Router hooks: `useParams` reads the course ID, `useNavigate` changes the page after an action, and `useLocation` remembers the protected page a visitor wanted before login.

The course editor has separate React keys for create and edit routes. This resets its state when switching modes, so a new course never starts with an old course's form values.

## How React talks to Express

1. A page validates the form and sets its loading state.
2. It calls the shared Axios client, for example `api.post('/enrollments', { courseId: id })`.
3. The client adds the API base URL and the current `Authorization: Bearer <token>` header from `sessionStorage`.
4. Express checks the JWT, role, ownership, and request body, then returns JSON.
5. The page updates React state with that JSON, or displays `getApiError(error)`.

Login returns a token and user; registration returns a user and requires a subsequent login. Refreshing the page restores the user with `GET /auth/me`. A protected API response with status 401 clears the expired session. A network/503 failure during restoration preserves the token and offers a retry.

Frontend route protection improves navigation; Express remains responsible for actual authorization. Password confirmation is checked in the browser and excluded from the registration payload. Course text and AI replies are rendered as plain React text, not injected HTML. The AI API key stays in Express.

These are the existing API routes used by the frontend; all are relative to `/api`:

| Feature | Method and route |
| --- | --- |
| Register / log in / restore session | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Browse / view course | `GET /courses`, `GET /courses/:id` |
| Create / update / archive course | `POST /courses`, `PATCH /courses/:id`, `DELETE /courses/:id` |
| Student enrollments | `GET /enrollments/me`, `POST /enrollments` |
| Instructor courses | `GET /instructor/courses?includeArchived=true` |
| Student roster / history | `GET /instructor/courses/:id/students`, optionally `?status=all` |
| Remove an enrollment | `PATCH /instructor/courses/:id/students/:studentId/unenroll` |
| AI recommendations | `POST /ai/recommendations` with `{ prompt }` |

Course search and filters run locally over the existing catalog response. The AI sends one goal per request; the visible conversation is temporary and is not sent as conversation history. Enrollment history and archived courses remain available in the relevant student/instructor screens.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
npm run test:live
```

Playwright starts its own Vite server on port 5174 with the API proxy enabled. It does not reuse or stop your development server on port 5173. `npm test` needs no backend: its network fixtures match the inspected Express contracts. `npm run test:live` requires the backend on port 8080 and at least one existing published course. It reads live data and sends only unauthenticated or invalid requests to write endpoints, which are rejected before writes occur.

Verified during this refactor:

- ESLint and production build: passed.
- Browser regression suite: 26 passed (13 flows each on desktop Chromium and a mobile Chromium viewport).
- Live Express integration suite: 2 passed, covering catalog/details rendering through the proxy, authentication requirements, and input validation.
- Existing backend `npm test`: 7 passed against the running API.
- Visual review: desktop catalog and mobile catalog/login; no page errors or horizontal overflow in the mobile review.

The browser suite covers search, empty/error states and retry, registration validation, login/logout and return paths, role redirects, expired versus unavailable sessions, enrollment payloads, unknown enrollment state, preserved history, editor resets and save methods, archive failure handling, roster filtering/removal, and AI validation/retry/recommendations.

Authenticated write flows and successful AI responses were checked with mocked network responses, not against live user accounts or the external AI provider. A real course archive remains blocked by an existing backend issue: `backend/src/controllers/courseController.js` uses `mongoose.connection.transaction` in `deleteCourse` without importing `mongoose`. Backend files were left unchanged. The frontend reports the archive failure and keeps the course visible.

## Five interview questions

1. **Why did you use Context for authentication?** Many screens need the current user and logout action. Context shares them without passing props through every intermediate component.
2. **What is a controlled form?** Input values come from React state. An `onChange` handler updates that state, and Zod validates it before submission.
3. **Why do API calls go in `useEffect`?** Loading data synchronizes the screen with the server. Dependencies rerun the effect when the relevant ID or filter changes; cleanup cancels stale requests.
4. **How are student and instructor pages secured?** React checks the role to guide navigation. Express independently verifies the JWT, role, and course ownership before allowing protected operations.
5. **Why use one Axios instance?** It keeps the base URL, timeout, and token header in one place. Pages can focus on the endpoint, request data, and how to display the result.
