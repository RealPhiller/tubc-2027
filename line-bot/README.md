# TUBC 2027 LINE bot

A LINE bot that answers task questions inside the committee's LINE groups ("PVP x Oper", "PVP x ER", …).
It runs free on Google Apps Script, reads the `tasks` collection from Firestore, and only sends **reply** messages, which don't count against the LINE Official Account's monthly message quota.

## Commands
**Easiest:** mention the bot (`@TUBC 2027 Tracker`) and tap the buttons that appear. In a department group, everything shows that department by default.

| Command | What it does |
|---|---|
| `/tasks` | The group's department: overdue + next 14 days (`/tasks ER` for another department) |
| `/upcoming` | The next 5 tasks (`/upcoming all` for every department) |
| `/overdue` | Past their due date (`/overdue all` for every department) |
| `/today` | Due today and tomorrow |
| `/add` | Adds a task: asks for the title, due date (buttons or a date picker), owner, then confirms. `/add <title>` skips the first question |
| `/edit` | Pick a task (numbered buttons, or type part of its name), then change its status, due date, name or owner. `/edit <words>` searches straight away |
| `/delete` | Pick a task, then confirm. Can't be undone |
| `/help` | The command list |

Anyone in a registered group can add, edit and delete tasks; they show on the site as "Updated by <LINE name> (LINE)" and in the activity log.
Tasks dated in Kickoff go to Setup unless the group is the PVP group (Kickoff is PVP-only on the site).

It ignores normal chat, private chats, unknown commands and any group that wasn't registered with `/setup`.
It never shows Kickoff tasks (PVP-only in the app) and never reads people, comments or sponsors.

## One-time setup

### A. LINE (about 10 minutes)
1. Go to [LINE Official Account Manager](https://manager.line.biz/) and create an account, e.g. **TUBC 2027 Tracker** (free plan).
2. In that account: **Settings → Messaging API → Enable Messaging API** (pick or create a provider).
3. **Settings → Response settings:** turn **Webhooks on**, and turn **Auto-reply messages off** (and Greeting message off if you like).
4. **Settings → Account settings → Toggle features:** set **Join groups and multi-person chats** to **Allow**.
5. Open [LINE Developers Console](https://developers.line.biz/console/) → your provider → the channel → **Messaging API** tab → **Channel access token (long-lived) → Issue**. Keep this tab open; you'll paste the token in step B4.

### B. Apps Script (about 10 minutes)
Use the Google account that owns the Firebase project `tubc-2027`.
1. Go to [script.google.com](https://script.google.com/) → **New project**, name it **TUBC LINE bot**.
2. Replace the contents of `Code.gs` with this folder's `Code.gs`.
3. **Project Settings** (gear) → tick **Show "appsscript.json" manifest file in editor**, then replace `appsscript.json` with this folder's `appsscript.json`.
4. **Project Settings → Script properties → Add script property:**
   - `LINE_TOKEN` = the channel access token from A5
   - `SETUP_CODE` = any secret word, e.g. `tubc2027-xyz`
5. Back in the editor, pick the function **testRead** and click **Run**. Approve the permissions. Google shows "Google hasn't verified this app" because it's your own script: **Advanced → Go to TUBC LINE bot (unsafe) → Allow**. The log should say `Read N tasks from Firestore`.
6. **Deploy → New deployment →** type **Web app**, Execute as **Me**, Who has access **Anyone** → **Deploy**. Copy the **Web app URL** (ends in `/exec`).

### C. Connect them
1. LINE Developers Console → **Messaging API** tab → **Webhook URL** = the `/exec` URL → **Update**, then turn **Use webhook** on.
   (The **Verify** button may report an error because Apps Script answers through a redirect. Messages still arrive; test in a group instead.)
2. Add the bot as a friend (QR code in LINE Official Account Manager → Home), then invite it to each group.
3. In each group, an admin types `/setup <SETUP_CODE> <department>`, e.g. `/setup tubc2027-xyz Oper`.
   For a whole-committee group: `/setup tubc2027-xyz`. You can unsend that message afterwards.
4. Type `/help` to check it answers.

## Updating the code later
Paste the new `Code.gs`, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same, so LINE needs no change.

## Notes
- **Firestore access:** the script reads Firestore with the deploying account's Google login (`X-Goog-User-Project: tubc-2027`), which skips the security rules. That's why the bot filters Kickoff itself.
- **Signature check:** Apps Script can't read request headers, so the bot can't verify LINE's `X-Line-Signature`. A forged request can't get data out: answers only go back through LINE's reply API to the chat that sent the message, and only registered groups get answers.
- **Reads:** task lists are cached for 2 minutes, so a busy group costs about one Firestore read per task every 2 minutes, well inside the free 50,000 reads a day.
- **Firestore 403 "API has not been used in project …":** in Apps Script **Project Settings → Google Cloud Platform (GCP) Project → Change project**, enter the project number of `tubc-2027` (Firebase console → Project settings), then run `testRead` again.

## Announcements to LINE (added 2026-11-25)

On the site's Access page, an admin can tick **Also send to LINE → Everyone group / All-heads group** when posting an announcement. The bot then **pushes** it once to those groups.

- Register the groups first: in the whole-committee group type `/setup <code>`, and in the all-heads group type `/setup <code> heads`.
- Add the trigger once: Apps Script → **Triggers** (clock icon) → **Add trigger** → function `checkAnnounce`, event source **Time-driven**, **Minutes timer**, **Every minute** → Save (approve the permission prompt).
- Pushes use the LINE OA monthly message quota: one message per member of each group. When the quota runs out, the site shows "monthly LINE message limit reached" under the form.
- Each announcement is sent at most once (`LAST_ANN` script property). The bot writes `lineSent`, `lineErr` and `lineAt` back to `settings/announce` so the admin sees the result.
