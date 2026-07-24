# skyhyp — Trading Journal (frontend)

## Setup

```bash
npm install
npm run dev
```

Runs on http://localhost:5173 and expects the backend at http://localhost:8080
(change `BASE_URL` in `src/api/client.js` if that changes).

## Pages

- `/login` — email + password
- `/signup` — 3-step wizard: email → OTP → username/password
  (once you drop email verification server-side, just remove the OTP
  step in `SignupPage.jsx` — the email step can call `registerComplete`
  directly, or you can collapse steps 1 and 3 into one form)
- `/` — dashboard, list of journal entries
- `/journals/new` — create entry
- `/journals/:id` — read-only detail view
- `/journals/:id/edit` — edit entry

## Notes

- Tokens are stored in `localStorage` for now (`src/api/client.js`).
  Swap for an httpOnly cookie later if you want it XSS-hardened — say
  so and I'll wire that up (needs a small backend change too, since
  the refresh token would move to a Set-Cookie response instead of
  the JSON body).
- No animation/transition anywhere, per the brief — the CSS in
  `src/index.css` is the single source of the visual design; adjust
  the `:root` variables there to retune colors/spacing later.
- Enums in `src/constants/enums.js` are copy-pasted from your live
  Swagger schema — keep them in sync if the backend enums change.
