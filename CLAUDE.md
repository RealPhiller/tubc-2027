# TUBC 2027 Tracker

Task tracker for the TUBC 2027 organizing committee (Thammasat Undergraduate Business Challenge, plus The Challenger / CLG).
Owner: Puripat (President, GitHub `RealPhiller`). Reply to Puripat in Thai unless he writes in English; keep UI text in English.

- Live site: https://realphiller.github.io/tubc-2027/ (GitHub Pages, deploys from `main`, about 1 minute after a push)
- Firebase project: `tubc-2027` (Auth with Google sign-in + Firestore). No build server, no npm dependencies.
- Users: about 30 committee members, many on iPhone Safari and the LINE in-app browser.

## Files

| Path | What it is |
|---|---|
| `src/head.html` | `<head>`, all CSS (one `<style>` block), and all page markup (every view and dialog) |
| `src/app.js` | The whole app: one ES module (Firebase from the gstatic CDN) |
| `src/tail.html` | Closing tags |
| `index.html` | **Generated.** `head + <script type="module">\n + app.js + </script> + tail`. Commit it: Pages serves it as is |
| `tools/build.mjs` | `node tools/build.mjs` builds index.html; `--check` syntax-checks only; `--split` recreates `src/` from index.html |
| `assets.css` | Extra styles loaded before the inline `<style>` (gate/login art, fonts) |
| `sw.js` | Service worker: shows tag notifications and opens the task when one is tapped |
| `manifest.json`, `icon.svg` | Web app manifest + icon (needed for iPhone Add to Home Screen notifications) |
| `firestore.rules` | Firestore security rules. **Source of truth is this file**; deploy with `firebase deploy --only firestore:rules` |
| `firebase.json`, `.firebaserc` | Firebase CLI config (rules only; hosting is GitHub Pages, not Firebase) |

First time in a fresh clone: if `src/` does not exist yet, run `node tools/build.mjs --split` and commit `src/`.

## Workflow (every change)

1. Edit `src/head.html` / `src/app.js`. Never hand-edit `index.html`.
2. **Bump `const BUILD="b2026MMDDx"`** near the top of `src/app.js` (date + letter). Open tabs poll index.html and reload themselves when BUILD changes; if you forget, users keep the old version.
3. `node tools/build.mjs` (fails on a syntax error).
4. Test locally: `python3 -m http.server` then open `http://localhost:8000/`. Google sign-in may not work from localhost (the auth helper lives on realphiller.github.io), so for logged-in UI stub Firebase (see "Local preview" below) or check on the live site after pushing.
5. Commit `src/` + `index.html` together, push to `main`, wait ~1 min, hard-refresh the live site and check the console for errors.
6. If `firestore.rules` changed: `firebase deploy --only firestore:rules` (needs `firebase login` once as Puripat).

Commit messages: short imperative English summary.

## Architecture of src/app.js

Plain DOM, no framework. `$(id)` = getElementById, `esc()` HTML-escapes every interpolated value (always use it). Sections are marked `// ---------- name ----------`, in this order: auto-update, mobile menu, views, auth, tracker, calendar, task details bottom sheet (phones), edit + drag, permissions matrix, access requests, calendar export, Google Calendar, owner picker, activity log, countdown, my tasks, structure, access, task steps, task links, comments + @mentions, PVP overview, sponsors, bottom bar + FAB, sponsor access, profile, avatar menu + theme, sliding underline, stagger-in + count-up, search (Ctrl/⌘K), quick answers bubble, notifications.

- **Views** are `<div class="view" id="v-NAME">`, routed by `location.hash` in `route()` → `show(v)`. Views: mine, overview, tracker, calendar, sponsors, structure (Team › Committee), who (Team › Who to ask), profile, access, login, noaccess. `#team` maps to `structure`.
- **Data** arrives through `onSnapshot` listeners set up after sign-in; each listener updates a module variable (`tasks`, `comments`, `people`, `heads`, `sponsors`, …) and calls a `render*()` function. `render()` re-renders the tracker, then calendar, my tasks and overview.
- **Constants**: `PH` = the 6 phases (Kickoff, Setup, Recruitment, Planning, The Challenger, TUBC) with date ranges; `SLOTS` = departments and head counts; `OWNERS` = which PVP looks after each department; `DCOL` = department colours; `DEPTS = ["PVP", ...Object.keys(SLOTS)]`; `SEED` = starter task list (admin "seed" button when tasks is empty).
- **Animations** respect `prefers-reduced-motion` via `motion()`. Page change slides by tab order (`VORDER`, 1 s), cards stagger in (`staggerIn`), numbers count up (`countUp`/`animNum`), bars and Overview rings animate from their previous value (`animBars`, `animRings`).
- **Theme**: `data-theme` on `<html>` (light/auto/dark, saved in localStorage `tubc-theme`). Colours come from CSS variables (`--bg`, `--ink`, `--red`, `--line`, `--mute`, `--panel`, `--gold`, `--dc` = department colour).
- Breakpoints: top nav becomes a drawer + bottom bar under 1240px; phone layouts under 760px / 600px.

## Roles and who sees what

`members/{email}` = `{role: "admin"|"head"|"viewer", dept}`. UI label for viewer is **Member**. `BOOT_ADMINS` in app.js and `bootAdmin()` in rules must match (puripat_rob67@tbs.tu.ac.th).

| Thing | Who |
|---|---|
| Overview tab | `seeOverview()` = admin, head, or anyone in dept PVP |
| Kickoff phase (and its tasks everywhere) | `seeKickoff()` = admin or dept PVP. **UI-only filter**: tasks are still readable in Firestore |
| Team › Committee | PVP-grouped tree for `seeOverview()` users; flat "PVP → every department" grid for other members (`applyStructView`) |
| Team › Who to ask | `isHeadUp()` = admin or head |
| Sponsors | admin, or departments ticked on Access (`settings/sponsors` `{see:[], edit:[]}`, default ER, PVP, Treasurer) |
| Access page | admin only (in the avatar menu) |
| Task status / edit / move / heads | Permission switches on Access (`settings/permissions`), defaults `head: statusOwn, headsOwn`; helpers `can()`, `canTask`, `canEdit`, `canMove`, `canHeads`. Rules enforce the same switches |

New sign-ups create `requests/{email}`; an admin approves on Access (default role Member) which writes `members` and `people`.

## Firestore collections

`tasks` (title, due, owner, depts[], status todo|prog|blk|dn, phase 0–5, note, order, checks[], links[], updatedBy, updatedAt) · `comments` (task, text, by, email, at, mentions[] of emails or `dept:NAME`) · `log` (activity feed; action includes `comment`) · `people/{email}` (name, dept, nick, line, phone, batch, bio) · `heads/{dept}` ({list:[{name,line}]}) · `sponsors` · `members` · `requests` · `settings/permissions`, `settings/sponsors`, `settings/event` (key dates for the countdown).

Rules validate field names and sizes on writes; when you add a field to a collection, update `firestore.rules` too or writes fail with permission-denied.

## Features worth knowing before you touch them

- **@mentions**: people (`people` collection) and whole departments (`@Oper` → stored as `dept:Oper`). `tagsMe()` decides what lands in the Mentions box and notifications.
- **Notifications**: only while the site/app is open or in the background (service worker + Notification API, toggled in the avatar menu; iPhone needs Add to Home Screen). True push when closed needs Firebase Blaze + Cloud Functions + FCM: not built yet.
- **Google Calendar**: per-department calendars named `TUBC2027 - DEPT`, events upserted by a stable id from the task id (re-clicking updates instead of duplicating). It does **not** remove events for deleted/undated/moved tasks yet.
- **Search palette**: Ctrl/⌘K or the magnifier; scores title prefix > word prefix > contains > owner > notes. Rows are two lines (title + status, then date), titles clamp to 2 lines, colour bar is a `::before` pill.
- **Auto-update**: `checkUpdate()` compares BUILD in the fetched index.html.
- **Opening tasks**: a page-wide click handler opens any element with `data-task="<id>"` via `openTask()`. Give new task rows that attribute; don't add a second handler (the task would open twice).
- **Quick answers bubble** (💬 bottom-left, `#hb` / `#hp`, functions `hb*`): tap-only, no AI and no typing. Three choices: My tasks (own department + `All`, plus `All heads` for heads/admins; overdue + next 7 days), Overdue (all departments), Today & tomorrow. It reads the `tasks` array, which is already Kickoff-filtered by `phVis()`, so it never shows more than the user can see. Caps: `HB_MAX` = 5 tasks per answer (groups share the budget) with a "See all" link, `HB_LOG` = 5 chat bubbles, panel max 460px. Shows "• • •" for 450 ms before each answer (skipped under reduced motion). Shown/hidden from `updateFab()` → `updateBot()`.
- **Task details on phones (≤760px)**: `#td` becomes a bottom sheet with a `.grab` bar. Close by dragging the grab bar/header down more than 90px (pointer events), tapping the backdrop above it, ✕ or Esc; all go through `closeTd()`, which slides it out. Desktop keeps the centred dialog. Not yet checked with the iPhone keyboard open.

## iPhone sign-in (do not break)

Safari blocks third-party storage, so Firebase Auth's helper is self-hosted on the same site:
- `authDomain` in app.js is `realphiller.github.io` (not `tubc-2027.firebaseapp.com`).
- A separate repo `RealPhiller/RealPhiller.github.io` serves `/__/auth/handler`, `handler.js`, `experiments.js`, `iframe`, `iframe.js`, copied from `https://tubc-2027.firebaseapp.com/__/auth/...` by its GitHub Actions workflow `.github/workflows/pages.yml` (weekly cron, upload-pages-artifact@v4 + deploy-pages@v4).
- The Google Cloud OAuth client allows redirect `https://realphiller.github.io/__/auth/handler` and origin `https://realphiller.github.io`.
- LINE and other in-app browsers can't do Google sign-in; the login page detects them and tells people to open in Safari/Chrome.

## Local preview (logged-in UI without Firebase)

To screenshot logged-in screens locally, make a copy of index.html whose Firebase imports are replaced by stubs (`onAuthStateChanged` calls back with a fake user, `getDoc` returns `{role, dept}`, `onSnapshot` feeds sample arrays) and open it with Playwright/Chrome. Change the stubbed role/dept to check Admin, Head and Member views. Never commit the stub.

## Conventions

- Keep it a single module + single stylesheet unless Puripat agrees to split further; no frameworks, no bundler.
- Escape all user text with `esc()`. Never put personal data in URLs.
- Test Admin, Head and Member (and a PVP member) for anything permission-related, on desktop and a 390px phone width, light and dark.
- Department names are fixed in `SLOTS`; `PVP` and `President` both mean PVP; `All` / `All heads` are shared owners.

## Ideas not built yet (from earlier sessions)

Sync button that also deletes stale Google Calendar events · locking Kickoff in Firestore rules (needs a filtered tasks query) · closed-app push notifications (Blaze) · weekly summary for LINE · assign tasks to individual people · trash/undo for deleted tasks · task dependencies · approvals · recurring tasks · Gantt view · document library + handover export for next year's committee · swipe-to-done on phones · skeleton loading · confetti on milestones · hide the lone "Committee" sub-tab for members · `@All` / `@Heads` mentions · admin backup/export button (there is no backup today) · undo toast after a status change · overdue badge on the 💬 bubble · bigger (44px) bubble choices on phones · hide empty group headers in bubble answers · "Copy weekly summary" text for LINE · Add to Home Screen banner for iPhone · "New" dot on tasks changed since last visit.
