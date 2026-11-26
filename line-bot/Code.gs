/**
 * TUBC 2027 LINE bot: a Google Apps Script web app used as the LINE Messaging API webhook.
 * It answers slash commands in the committee's LINE groups (one per department, e.g. "PVP x Oper") with task info read from Firestore.
 * Answers use the Reply API, which doesn't count against the LINE OA monthly quota. The one exception is announcements:
 * when an admin ticks "Also send to LINE" on the site, checkAnnounce() (a 1-minute time-driven trigger) pushes it to the
 * whole-committee and/or heads group. Pushes DO use the quota (one message per group member).
 * Mention the bot (@TUBC 2027 Tracker) to get tap buttons; /add, /edit and /delete walk through short forms with buttons.
 *
 * Script properties (Apps Script -> Project Settings -> Script properties):
 *   LINE_TOKEN   Messaging API channel access token (long-lived). You paste this in yourself.
 *   SETUP_CODE   Any secret word. In each group, an admin types "/setup <word> <department>" once
 *                (e.g. "/setup tubc2027 Oper"), "/setup <word>" for a whole-committee group, or "/setup <word> heads"
 *                for the all-heads group.
 *   READ_KEY     Secret for the read-only ?summary= link (life dashboard). Run showReadKey once to create it.
 * Written by the bot:
 *   GROUP_<groupId>   That group's department, ALL or HEADS. The bot stays silent in any group not registered.
 *   LAST_ANN          id of the last announcement pushed to LINE, so each one goes out at most once.
 *
 * Privacy: Firestore is read with the deploying account's own Google login, which skips the security rules.
 * So the bot shows Kickoff only in the PVP group (it is PVP-only in the app) and never reads people, comments or sponsors.
 */

const PROJECT = "tubc-2027";
const SITE = "https://realphiller.github.io/tubc-2027/";
const TZ = "Asia/Bangkok";
const MAX = 10;          // tasks listed per answer
const CACHE_SECONDS = 120; // keeps Firestore reads low when many people ask at once
const DEPTS = ["PVP", "Oper", "Inven", "Doc", "CR", "PR", "Buddy", "Stage-co", "IT", "Photog", "ER", "Excur", "Treasurer", "Venue", "Case Writer", "Uni Affairs"];
const ALIAS = { president: "PVP", stage: "Stage-co", case: "Case Writer", writer: "Case Writer", uni: "Uni Affairs", treasury: "Treasurer", photo: "Photog", inventory: "Inven" };
const ST = { todo: "To do", prog: "In progress", dn: "Done" }; // "Blocked" removed 2026-11-25; old blk tasks read as In progress
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------- web app entry points ----------
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    (body.events || []).forEach(handleEvent);
  } catch (err) {
    console.error(err);
  }
  return ContentService.createTextOutput("OK");
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.summary !== undefined) return summaryOut(p);
  return ContentService.createTextOutput("TUBC 2027 LINE bot is running.");
}

// ---------- read-only summary for Puripat's life dashboard ----------
// GET <exec URL>?summary=<READ_KEY>[&callback=fn] -> JSON (or JSONP): task counts, overdue, due this week, per dept and phase,
// plus a slim list of every task (title, due, owners, status, phase) so the dashboard can filter by department.
// READ_KEY is its own script property (run showReadKey once). It only reads; it never writes or pushes anything.
function summaryOut(p) {
  const key = PropertiesService.getScriptProperties().getProperty("READ_KEY");
  let body;
  if (!key || p.summary !== key) body = { ok: false, error: "forbidden" };
  else {
    try { body = summaryData(cachedTasks(), todayIso()); }
    catch (err) { body = { ok: false, error: String((err && err.message) || err) }; }
  }
  const json = JSON.stringify(body);
  if (p.callback && /^[A-Za-z_$][\w$]{0,40}$/.test(p.callback)) {
    return ContentService.createTextOutput(p.callback + "(" + json + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function summaryData(all, today) {
  const week = addDays(today, 7);
  const open = all.filter(t => t.status !== "dn");
  const counts = { todo: 0, prog: 0, dn: 0 };
  all.forEach(t => { counts[t.status in counts ? t.status : "todo"]++; });
  const slim = t => ({ title: short(String(t.title || ""), 60), due: t.due || "", owners: owners(t), status: t.status || "todo" });
  const overdue = open.filter(t => t.due && t.due < today).sort(byDue);
  const soon = open.filter(t => t.due && t.due >= today && t.due <= week).sort(byDue);
  const depts = {};
  open.forEach(t => owners(t).forEach(o => { const d = o === "President" ? "PVP" : o; depts[d] = (depts[d] || 0) + 1; }));
  const phases = PHASES.map((n, i) => ({
    name: n, start: PHASE_START[i],
    open: open.filter(t => Number(t.phase) === i).length,
    done: all.filter(t => Number(t.phase) === i && t.status === "dn").length
  }));
  return {
    ok: true, asOf: Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX"), today: today,
    total: all.length, counts: counts,
    overdueCount: overdue.length, overdue: overdue.slice(0, 5).map(slim),
    soonCount: soon.length, soon: soon.slice(0, 6).map(slim),
    depts: depts, phases: phases, site: SITE,
    tasks: all.slice(0, 400).map(t => ({ title: short(String(t.title || ""), 60), due: t.due || "", owners: owners(t), status: t.status || "todo", phase: Number(t.phase) || 0 }))
  };
}

// Run once from the editor: creates READ_KEY (if missing) and logs the dashboard link.
function showReadKey() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty("READ_KEY")) p.setProperty("READ_KEY", Utilities.getUuid().replace(/-/g, ""));
  console.log("Dashboard link = <your web app URL>?summary=" + p.getProperty("READ_KEY"));
}

function handleEvent(ev) {
  let out;
  try {
    out = respond(ev, liveCtx());
  } catch (err) {
    console.error(err);
    out = { text: "Sorry, something went wrong with the tracker. Please try again in a minute." };
  }
  if (out && ev.replyToken) reply(ev.replyToken, out);
}

function liveCtx() {
  return { store: scriptStore(), state: stateStore(), today: todayIso(), loadTasks: cachedTasks, addTask: addTaskDoc, updateTask: updateTaskDoc, deleteTask: deleteTaskDoc, nameOf: displayName };
}

// ---------- conversation (kept free of Apps Script calls so it can be tested anywhere) ----------
// Returns null (stay quiet) or { text, quick } where quick is a list of LINE quick-reply buttons.
function respond(ev, ctx) {
  const src = ev.source || {};
  const groupId = src.groupId || src.roomId || "";
  if (ev.type === "join") {
    return { text: "Hi! I'm the TUBC 2027 tracker bot. An admin needs to type /setup <code> <department> here once (for example /setup <code> Oper). After that, mention me (@TUBC 2027 Tracker) to open the menu." };
  }
  let text = "", data = "", date = "";
  if (ev.type === "message" && ev.message && ev.message.type === "text") text = String(ev.message.text || "").trim();
  else if (ev.type === "postback" && ev.postback) { data = ev.postback.data || ""; date = (ev.postback.params || {}).date || ""; }
  else return null;

  if (/^\/setup(\s|$)/i.test(text)) return setupAnswer(text, groupId, ctx.store);

  const scope = groupId && ctx.store.get("GROUP_" + groupId);
  if (!scope) return null; // only answer in registered groups
  const c = { home: scope === "ALL" || scope === "HEADS" ? null : scope, src: src, ctx: ctx, key: "add:" + groupId + ":" + (src.userId || "") };
  const pending = src.userId ? ctx.state.get(c.key) : null;

  if (data) { // a button tap
    const p = parseData(data);
    if (p.cmd) return command(p.cmd, p.arg || "", c);
    if (p.add) return addTap(p, date, pending, c);
    if (p.edit) return editTap(p, date, pending, c);
    return null;
  }
  const mentioned = !!(ev.message.mention && (ev.message.mention.mentionees || []).some(m => m.isSelf));
  if (mentioned) return menu(c.home, "Hi! What would you like to do?");
  if (text.charAt(0) === "/") {
    const parts = text.slice(1).trim().split(/\s+/);
    const cmd = (parts.shift() || "").toLowerCase();
    return command(cmd, parts.join(" "), c);
  }
  if (pending) return pending.mode === "edit" ? editTyped(text, pending, c) : addTyped(text, pending, c); // the person is answering a form question
  return null; // normal chat
}

function setupAnswer(text, groupId, store) {
  const parts = text.trim().split(/\s+/).slice(1);
  const code = store.get("SETUP_CODE");
  if (!groupId) return { text: "Type /setup inside a committee group, not in a private chat." };
  if (!code || parts[0] !== code) return null; // wrong or missing code: stay quiet
  const rest = parts.slice(1).join(" ");
  const d = rest ? (/^(all[\s-]*)?heads?$/i.test(rest) ? "HEADS" : findDept(rest)) : "ALL";
  if (!d) return { text: "I don't know that department. Use one of: " + DEPTS.join(", ") + ", or heads" };
  store.set("GROUP_" + groupId, d);
  return menu(d === "ALL" || d === "HEADS" ? null : d, d === "ALL"
    ? "Registered as a whole-committee group. Mention me any time to open the menu."
    : d === "HEADS" ? "Registered as the all-heads group. Announcements marked for the heads group come here. Mention me any time to open the menu."
    : "Registered as the " + d + " group. Mention me (@TUBC 2027 Tracker) any time to open the menu.");
}

function command(cmd, arg, c) {
  const home = c.home, ctx = c.ctx;
  const only = /^all$/i.test(arg) ? null : (findDept(arg) || home);
  if (cmd === "help" || cmd === "menu") return menu(home, helpText(home));
  if (cmd === "tasks" || cmd === "task") {
    const d = findDept(arg) || (!arg && home);
    if (!d) return menu(home, "Which department? For example: /tasks Oper\n\nDepartments: " + DEPTS.join(", "));
    return menu(home, deptAnswer(ctx.loadTasks(), d, ctx.today, home));
  }
  if (cmd === "upcoming" || cmd === "next") return menu(home, upcomingAnswer(ctx.loadTasks(), ctx.today, only, home));
  if (cmd === "overdue" || cmd === "late") return menu(home, overdueAnswer(ctx.loadTasks(), ctx.today, only, home));
  if (cmd === "today" || cmd === "tomorrow") return menu(home, soonAnswer(ctx.loadTasks(), ctx.today, only, home));
  if (cmd === "add") return startAdd(arg, c);
  if (cmd === "edit") return startEdit(arg, "edit", c);
  if (cmd === "delete" || cmd === "remove") return startEdit(arg, "delete", c);
  if (cmd === "cancel") return cancelAdd(c);
  return null; // unknown command: stay quiet so the bot doesn't spam the group
}

function helpText(home) {
  return [
    "TUBC 2027 tracker bot" + (home ? " \u00b7 " + home + " group" : ""),
    "Tap a button below, or type:",
    "",
    home ? "/tasks  \u00b7  " + home + "'s open tasks (/tasks ER for another department)" : "/tasks Oper  \u00b7  a department's open tasks",
    "/upcoming  \u00b7  the next 5 tasks" + (home ? " (/upcoming all for everyone)" : ""),
    "/overdue  \u00b7  past their due date" + (home ? " (/overdue all for everyone)" : ""),
    "/today  \u00b7  due today and tomorrow",
    "/add  \u00b7  add a task (I'll ask a few questions)",
    "/edit  \u00b7  change a task's status, date, name or owner",
    "/delete  \u00b7  delete a task (asks to confirm)",
    "",
    "" + SITE
  ].join("\n");
}

// ---------- buttons ----------
const btn = (label, data) => ({ type: "action", action: { type: "postback", label: label, data: data, displayText: label } });
function menu(home, text) {
  const items = [btn("Upcoming", "cmd=upcoming"), btn("Overdue", "cmd=overdue"), btn("Today", "cmd=today"), btn("Add task", "cmd=add"), btn("Edit task", "cmd=edit"), btn("Delete task", "cmd=delete")];
  if (home) items.unshift(btn("" + home + " tasks", "cmd=tasks"));
  return { text: text, quick: items };
}
function parseData(data) {
  const o = {};
  String(data).split("&").forEach(kv => { const i = kv.indexOf("="); if (i > 0) o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); });
  return o;
}

// ---------- add a task: title -> due date -> owner -> confirm ----------
const CANCEL = btn("Cancel", "add=cancel");
function startAdd(arg, c) {
  if (!c.src.userId) return { text: "I can't see your LINE ID. Add me as a friend first, then try again." };
  const st = { step: "title" };
  if (arg && arg.length >= 2) { st.title = arg.slice(0, 200); st.step = "due"; c.ctx.state.set(c.key, st); return askDue(st, c); }
  c.ctx.state.set(c.key, st);
  return { text: "New task" + (c.home ? " for " + c.home : "") + "\nWhat's the task? Type the title.", quick: [CANCEL] };
}
function cancelAdd(c) { c.ctx.state.del(c.key); return menu(c.home, "OK, cancelled. Nothing was added."); }

function askDue(st, c) {
  const t = c.ctx.today;
  return {
    text: "When is \u201c" + st.title + "\u201d due?\nTap a button, pick a date, or type it (e.g. 5/12).",
    quick: [btn("Today", "add=due&d=" + t), btn("Tomorrow", "add=due&d=" + addDays(t, 1)), btn("In 3 days", "add=due&d=" + addDays(t, 3)), btn("In a week", "add=due&d=" + addDays(t, 7)),
      { type: "action", action: { type: "datetimepicker", label: "Pick a date", data: "add=pick", mode: "date", initial: t, min: t } }, CANCEL]
  };
}
function askOwner(st, c) {
  const items = (c.home ? [c.home] : []).concat(["PVP", "All heads", "All"]).filter((v, i, a) => a.indexOf(v) === i).map(o => btn(o, "add=owner&o=" + encodeURIComponent(o)));
  return { text: "Who owns it? Tap one, or type a department (e.g. ER).", quick: items.concat([CANCEL]) };
}
function askConfirm(st) {
  return { text: "Add this task?\n\n\u2022 " + st.title + "\n\u2022 Due " + fmtDate(st.due) + "\n\u2022 Owner: " + st.owner, quick: [btn("Add it", "add=save"), CANCEL] };
}
function addTap(p, date, st, c) {
  if (p.add === "cancel") return cancelAdd(c);
  if (!st) return menu(c.home, "That add-task form has expired or belongs to someone else. Tap Add task to start your own.");
  if (p.add === "due" || p.add === "pick") {
    const d = p.add === "pick" ? date : p.d;
    if (!validIso(d)) return askDue(st, c);
    st.due = d; st.step = "owner"; c.ctx.state.set(c.key, st); return askOwner(st, c);
  }
  if (p.add === "owner") { st.owner = p.o; st.step = "confirm"; c.ctx.state.set(c.key, st); return askConfirm(st); }
  if (p.add === "save" && st.step === "confirm") return saveAdd(st, c);
  return null;
}
function addTyped(text, st, c) {
  if (/^(cancel|stop)$/i.test(text)) return cancelAdd(c);
  if (st.step === "title") {
    if (text.length < 2) return { text: "Type the task title (at least 2 characters).", quick: [CANCEL] };
    st.title = text.slice(0, 200); st.step = "due"; c.ctx.state.set(c.key, st); return askDue(st, c);
  }
  if (st.step === "due") {
    const d = parseDate(text, c.ctx.today);
    if (!d) { const q = askDue(st, c); q.text = "I couldn't read that date. Try 5/12 or 2026-12-05.\n\n" + q.text; return q; }
    st.due = d; st.step = "owner"; c.ctx.state.set(c.key, st); return askOwner(st, c);
  }
  if (st.step === "owner") {
    const o = /^all heads$/i.test(text) ? "All heads" : /^all$/i.test(text) ? "All" : findDept(text);
    if (!o) { const q = askOwner(st, c); q.text = "I don't know that department.\n\n" + q.text; return q; }
    st.owner = o; st.step = "confirm"; c.ctx.state.set(c.key, st); return askConfirm(st);
  }
  if (st.step === "confirm") {
    if (/^(yes|y|ok|add|confirm)$/i.test(text)) return saveAdd(st, c);
    return askConfirm(st);
  }
  return null;
}
function saveAdd(st, c) {
  const by = (c.ctx.nameOf(c.src) || "LINE user") + " (LINE)";
  const phase = phaseFor(st.due, st.owner);
  c.ctx.addTask({ title: st.title, due: st.due, owner: st.owner, phase: phase, by: by });
  c.ctx.state.del(c.key);
  return menu(c.home, "Added to the tracker\n\n\u2022 " + st.title + "\n\u2022 Due " + fmtDate(st.due) + " \u00b7 " + PHASES[phase] + "\n\u2022 Owner: " + st.owner + "\n\n" + SITE);
}

// ---------- edit or delete a task: pick -> what to change -> new value ----------
const ECANCEL = btn("Cancel", "edit=cancel");
const short = (x, n) => x.length > n ? x.slice(0, n - 1) + "\u2026" : x;
function candidates(c) {
  const visible = visibleIn(c.home), t0 = c.ctx.today;
  const late = t => (t.due && t.due < t0 ? 0 : 1);
  return c.ctx.loadTasks().filter(t => visible(t) && t.status !== "dn" && (!c.home || forDept(t, c.home)))
    .sort((a, b) => late(a) - late(b) || String(a.due || "9999").localeCompare(String(b.due || "9999")));
}
function pickList(list, st, c, intro) {
  const top = list.slice(0, 10);
  st.ids = top.map(t => t.id); st.step = "pick"; c.ctx.state.set(c.key, st);
  const lines = top.map((t, i) => (i + 1) + ". " + when(t) + " \u00b7 " + t.title + (c.home ? "" : " \u2014 " + t.owner));
  return {
    text: intro + "\n\n" + lines.join("\n") + (list.length > 10 ? "\n\u2026and " + (list.length - 10) + " more. Type part of the name to find it." : ""),
    quick: top.map((t, i) => btn(short((i + 1) + ". " + t.title, 20), "edit=pick&i=" + i)).concat([ECANCEL])
  };
}
function startEdit(arg, intent, c) {
  if (!c.src.userId) return { text: "I can't see your LINE ID. Add me as a friend first, then try again." };
  const st = { mode: "edit", intent: intent };
  if (arg) return findForEdit(arg, st, c);
  const list = candidates(c);
  if (!list.length) return menu(c.home, "There are no open tasks" + (c.home ? " for " + c.home : "") + " to " + intent + ".");
  return pickList(list, st, c, (intent === "delete" ? "Delete which task?" : "Edit which task?") + " Tap a number, or type part of its name.");
}
function findForEdit(q, st, c) {
  const visible = visibleIn(c.home), k = q.toLowerCase();
  const hits = c.ctx.loadTasks().filter(t => visible(t) && String(t.title || "").toLowerCase().indexOf(k) >= 0)
    .sort((a, b) => String(a.due || "9999").localeCompare(String(b.due || "9999")));
  if (!hits.length) {
    st.step = "pick"; st.ids = []; c.ctx.state.set(c.key, st);
    return { text: "No task matches \u201c" + q + "\u201d. Try another word.", quick: [ECANCEL] };
  }
  if (hits.length === 1) return chooseTask(hits[0], st, c);
  return pickList(hits, st, c, hits.length + " tasks match \u201c" + q + "\u201d. Which one?");
}
function chooseTask(t, st, c) {
  st.id = t.id; st.step = "action"; c.ctx.state.set(c.key, st);
  if (st.intent === "delete") return askDelete(t, st, c);
  return {
    text: t.title + "\n\u2022 " + (t.due ? "Due " + when(t) : "No date") + " \u00b7 " + t.owner + " \u00b7 " + (ST[t.status] || t.status) + "\n\nWhat do you want to change?",
    quick: [btn("Status", "edit=act&a=status"), btn("Due date", "edit=act&a=date"), btn("Rename", "edit=act&a=rename"), btn("Owner", "edit=act&a=owner"), btn("Delete", "edit=act&a=delete"), ECANCEL]
  };
}
function askDelete(t, st, c) {
  st.step = "confirmdel"; c.ctx.state.set(c.key, st);
  return { text: "Delete \u201c" + t.title + "\u201d (" + (t.due ? when(t) : "no date") + ", " + t.owner + ")?\nThis can't be undone.", quick: [btn("Yes, delete", "edit=del"), ECANCEL] };
}
function taskById(id, c) { return c.ctx.loadTasks().filter(t => t.id === id)[0] || null; }
const editCancel = c => { c.ctx.state.del(c.key); return menu(c.home, "OK, cancelled. Nothing was changed."); };
const gone = c => { c.ctx.state.del(c.key); return menu(c.home, "That task is gone (maybe someone deleted it). Tap Edit task to see the current list."); };
// Re-point Add's date/owner buttons at the edit form.
const asEdit = q => { q.quick = q.quick.map(b => ({ type: "action", action: Object.assign({}, b.action, { data: b.action.data.replace(/^add=due/, "edit=due").replace(/^add=pick$/, "edit=date").replace(/^add=owner/, "edit=owner").replace(/^add=cancel$/, "edit=cancel") }) })); return q; };

function editTap(p, date, st, c) {
  if (p.edit === "cancel") return editCancel(c);
  if (!st || st.mode !== "edit") return menu(c.home, "That form has expired or belongs to someone else. Tap Edit task to start your own.");
  if (p.edit === "pick") { const t = taskById((st.ids || [])[Number(p.i)], c); return t ? chooseTask(t, st, c) : gone(c); }
  const t = st.id && taskById(st.id, c);
  if (!t) return gone(c);
  if (p.edit === "act") {
    st.step = p.a; c.ctx.state.set(c.key, st);
    if (p.a === "status") return { text: "New status for \u201c" + t.title + "\u201d? (now " + (ST[t.status] || t.status) + ")", quick: Object.keys(ST).map(k => btn(ST[k], "edit=status&s=" + k)).concat([ECANCEL]) };
    if (p.a === "date") { const q = asEdit(askDue({ title: t.title }, c)); q.text = "New due date for \u201c" + t.title + "\u201d? (now " + (t.due ? when(t) : "none") + ")\nTap a button, pick a date, or type it (e.g. 5/12)."; return q; }
    if (p.a === "rename") return { text: "Type the new name for \u201c" + t.title + "\u201d.", quick: [ECANCEL] };
    if (p.a === "owner") { const q = asEdit(askOwner({}, c)); q.text = "New owner for \u201c" + t.title + "\u201d? (now " + t.owner + ")\nTap one, or type a department."; return q; }
    if (p.a === "delete") return askDelete(t, st, c);
    return null;
  }
  if (p.edit === "status" && ST[p.s]) return saveEdit(t, { status: p.s }, "status", (ST[t.status] || t.status) + " \u2192 " + ST[p.s], c);
  if (p.edit === "due" || p.edit === "date") { const d = p.edit === "date" ? date : p.d; return validIso(d) ? saveDue(t, d, c) : null; }
  if (p.edit === "owner") return saveOwner(t, p.o, c);
  if (p.edit === "del" && st.step === "confirmdel") {
    c.ctx.deleteTask(t, (c.ctx.nameOf(c.src) || "LINE user") + " (LINE)");
    c.ctx.state.del(c.key);
    return menu(c.home, "Deleted \u201c" + t.title + "\u201d.");
  }
  return null;
}
function editTyped(text, st, c) {
  if (/^(cancel|stop)$/i.test(text)) return editCancel(c);
  if (st.step === "pick") {
    if (/^\d{1,2}$/.test(text)) { const t = taskById((st.ids || [])[Number(text) - 1], c); if (t) return chooseTask(t, st, c); }
    return findForEdit(text, st, c);
  }
  const t = st.id && taskById(st.id, c);
  if (!t) return gone(c);
  if (st.step === "rename") {
    if (text.length < 2) return { text: "Type the new name (at least 2 characters).", quick: [ECANCEL] };
    const name = text.slice(0, 200);
    return saveEdit(t, { title: name }, "edit", "renamed to \u201c" + name + "\u201d", c);
  }
  if (st.step === "date") {
    const d = parseDate(text, c.ctx.today);
    return d ? saveDue(t, d, c) : { text: "I couldn't read that date. Try 5/12 or 2026-12-05.", quick: [ECANCEL] };
  }
  if (st.step === "owner") {
    const o = /^all heads$/i.test(text) ? "All heads" : /^all$/i.test(text) ? "All" : findDept(text);
    return o ? saveOwner(t, o, c) : { text: "I don't know that department. Try e.g. ER or PVP.", quick: [ECANCEL] };
  }
  if (st.step === "confirmdel") return askDelete(t, st, c);
  return null;
}
function saveDue(t, d, c) {
  const patch = { due: d }, ph = phaseFor(d, t.owner);
  if (ph !== Number(t.phase)) patch.phase = ph;
  if (t.start && t.start >= d) patch.start = null; // a multi-day task whose start is now on or after the new due date becomes a one-day task
  return saveEdit(t, patch, "edit", "due " + (t.due ? fmtDate(t.due) : "none") + " \u2192 " + fmtDate(d), c);
}
function saveOwner(t, o, c) {
  return saveEdit(t, { owner: o, depts: o.split(",").map(x => x.trim()).filter(Boolean) }, "edit", "owner " + t.owner + " \u2192 " + o, c);
}
function saveEdit(t, patch, action, detail, c) {
  c.ctx.updateTask(t, patch, (c.ctx.nameOf(c.src) || "LINE user") + " (LINE)", action, detail);
  c.ctx.state.del(c.key);
  return menu(c.home, "Saved: " + (patch.title || t.title) + "\n\u2022 " + detail.charAt(0).toUpperCase() + detail.slice(1));
}

// Same phase rule as the site: the phase follows the due date. Kickoff is PVP-only, so a task in the Kickoff dates
// that isn't owned only by PVP/President goes to Setup.
const PHASES = ["Kickoff", "Setup", "Recruitment", "Planning", "The Challenger", "TUBC"];
const PHASE_START = ["2026-11-23", "2027-01-08", "2027-02-01", "2027-03-05", "2027-07-01", "2027-09-01"];
function pvpOnly(owner) { const o = String(owner || "").split(",").map(x => x.trim()).filter(Boolean); return o.length > 0 && o.every(x => x === "PVP" || x === "President"); }
function phaseFor(due, owner) {
  let i = 0;
  PHASE_START.forEach((s, k) => { if (due >= s) i = k; });
  return i === 0 && !pvpOnly(owner) ? 1 : i;
}
function validIso(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d || ""))) return false;
  const p = d.split("-").map(Number), x = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return x.getUTCFullYear() === p[0] && x.getUTCMonth() === p[1] - 1 && x.getUTCDate() === p[2];
}
function parseDate(text, today) {
  const t = String(text || "").trim().toLowerCase();
  if (t === "today") return today;
  if (t === "tomorrow") return addDays(today, 1);
  if (validIso(t)) return t;
  const m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/);
  if (!m) return null;
  let y = m[3] ? Number(m[3]) : Number(today.slice(0, 4));
  if (y < 100) y += 2000;
  if (y > 2400) y -= 543; // Thai Buddhist year
  const iso = y + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[1]).padStart(2, "0");
  if (!validIso(iso)) return null;
  return !m[3] && iso < today ? (y + 1) + iso.slice(4) : iso; // "5/1" in December means next January
}

function upcomingAnswer(all, today, only, home) {
  const visible = visibleIn(home);
  const list = all.filter(t => visible(t) && t.status !== "dn" && t.due && t.due >= today && (!only || forDept(t, only))).sort(byDue).slice(0, 5);
  if (!list.length) return "Nothing coming up" + (only ? " for " + only : "") + ".";
  return ["Next " + list.length + (only ? " for " + only : ""), ""].concat(list.map(t => line(t, !only)), ["", "" + SITE]).join("\n");
}

function deptAnswer(all, d, today, home) {
  const visible = visibleIn(home);
  const T = all.filter(t => visible(t) && forDept(t, d));
  const open = T.filter(t => t.status !== "dn");
  const until = addDays(today, 14);
  const over = open.filter(t => t.due && t.due < today).sort(byDue);
  const soon = open.filter(t => t.due && t.due >= today && t.due <= until).sort(byDue);
  const later = open.length - over.length - soon.length;
  const head = "" + d + ": " + open.length + " open" + (over.length ? " \u00b7 " + over.length + " overdue" : "") + " \u00b7 " + (T.length - open.length) + " of " + T.length + " done";
  if (!open.length) return head + "\n\nNothing open.";
  let left = MAX;
  const out = [head];
  [["Overdue", over], ["Next 14 days", soon]].forEach(([label, list]) => {
    if (!list.length) return;
    const shown = list.slice(0, Math.max(0, left));
    left -= shown.length;
    out.push("", label + " (" + list.length + ")");
    shown.forEach(t => out.push(line(t, false)));
    if (shown.length < list.length) out.push("\u2026and " + (list.length - shown.length) + " more");
  });
  if (later > 0) out.push("", "+ " + later + " later or with no date");
  out.push("", "" + SITE);
  return out.join("\n");
}

function overdueAnswer(all, today, only, home) {
  const visible = visibleIn(home);
  const list = all.filter(t => visible(t) && t.status !== "dn" && t.due && t.due < today && (!only || forDept(t, only))).sort(byDue);
  if (!list.length) return "Nothing " + (only ? "for " + only + " " : "") + "is overdue.";
  const out = ["" + list.length + " overdue" + (only ? " for " + only : "") + ", oldest first", ""];
  list.slice(0, MAX).forEach(t => out.push(line(t, !only)));
  if (list.length > MAX) out.push("\u2026and " + (list.length - MAX) + " more");
  out.push("", "" + SITE);
  return out.join("\n");
}

function soonAnswer(all, today, only, home) {
  const visible = visibleIn(home);
  const tomorrow = addDays(today, 1);
  const open = all.filter(t => visible(t) && t.status !== "dn" && (!only || forDept(t, only)));
  const a = open.filter(t => t.due === today);
  const b = open.filter(t => t.due === tomorrow);
  if (!a.length && !b.length) return "Nothing " + (only ? "for " + only + " " : "") + "is due today or tomorrow.";
  const out = [];
  [["Today", a], ["Tomorrow", b]].forEach(([label, list]) => {
    if (!list.length) return;
    if (out.length) out.push("");
    out.push(label + " (" + list.length + ")");
    list.slice(0, MAX).forEach(t => out.push(line(t, !only)));
    if (list.length > MAX) out.push("\u2026and " + (list.length - MAX) + " more");
  });
  out.push("", "" + SITE);
  return out.join("\n");
}

// ---------- helpers ----------
const owners = t => (t.depts && t.depts.length) ? t.depts : String(t.owner || "").split(",").map(s => s.trim()).filter(Boolean);
const forDept = (t, d) => { const o = owners(t); return o.indexOf(d) >= 0 || (d === "PVP" && o.indexOf("President") >= 0); };
const visibleIn = home => t => Number(t.phase) !== 0 || home === "PVP"; // Kickoff is PVP-only on the site, so only the PVP group sees it
const byDue = (a, b) => String(a.due).localeCompare(String(b.due));
const spans = t => !!(t.start && t.due && t.start < t.due);

function line(t, withOwner) {
  const st = t.status && t.status !== "todo" ? " (" + (ST[t.status] || t.status) + ")" : "";
  return "\u2022 " + when(t) + " \u00b7 " + t.title + st + (withOwner && t.owner ? " \u2014 " + t.owner : "");
}
function when(t) {
  if (!t.due) return "no date";
  if (!spans(t)) return fmtDate(t.due);
  const [, am, ad] = t.start.split("-").map(Number), [, bm, bd] = t.due.split("-").map(Number);
  return am === bm ? ad + "\u2013" + bd + " " + MON[bm - 1] : ad + " " + MON[am - 1] + " \u2013 " + bd + " " + MON[bm - 1];
}
function fmtDate(iso) { const p = iso.split("-").map(Number); return p[2] + " " + MON[p[1] - 1]; }
function addDays(iso, n) {
  const p = iso.split("-").map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}
function findDept(arg) {
  const k = String(arg || "").toLowerCase().replace(/[\s\-_]/g, "");
  if (!k) return null;
  const hit = DEPTS.find(d => d.toLowerCase().replace(/[\s\-_]/g, "") === k);
  return hit || ALIAS[k] || null;
}

// ---------- Apps Script services ----------
function todayIso() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd"); }

function scriptStore() {
  const p = PropertiesService.getScriptProperties();
  return { get: k => p.getProperty(k), set: (k, v) => p.setProperty(k, v) };
}

function cachedTasks() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get("tasks");
  if (hit) return JSON.parse(hit);
  const tasks = loadTasks();
  try { cache.put("tasks", JSON.stringify(tasks), CACHE_SECONDS); } catch (err) { console.warn(err); }
  return tasks;
}

// Reads the tasks collection through the Firestore REST API with the deploying account's Google login.
function loadTasks() {
  const fields = ["title", "start", "due", "owner", "depts", "status", "phase"].map(f => "mask.fieldPaths=" + f).join("&");
  const out = [];
  let token = "";
  do {
    const url = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/tasks?pageSize=300&" + fields + (token ? "&pageToken=" + encodeURIComponent(token) : "");
    const r = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken(), "X-Goog-User-Project": PROJECT }, muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error("Firestore " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
    const j = JSON.parse(r.getContentText());
    (j.documents || []).forEach(d => { const t = Object.assign({ id: d.name.split("/").pop() }, fromFields(d.fields || {})); if (t.status === "blk") t.status = "prog"; if (t.due) t.phase = phaseFor(t.due, t.owner); out.push(t); });
    token = j.nextPageToken || "";
  } while (token);
  return out;
}
function fromFields(f) { const o = {}; Object.keys(f).forEach(k => { o[k] = fromValue(f[k]); }); return o; }
function fromValue(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
  if ("timestampValue" in v) return v.timestampValue;
  return null;
}

function reply(replyToken, out) {
  const token = PropertiesService.getScriptProperties().getProperty("LINE_TOKEN");
  if (!token || !replyToken) { console.error("LINE_TOKEN script property is missing"); return; }
  const msg = { type: "text", text: String(out.text || "").slice(0, 4900) };
  if (out.quick && out.quick.length) msg.quickReply = { items: out.quick.slice(0, 13) };
  const r = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ replyToken: replyToken, messages: [msg] }),
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) console.error("LINE reply " + r.getResponseCode() + ": " + r.getContentText());
}

// Remembers each person's half-finished add-task form for 15 minutes.
function stateStore() {
  const cache = CacheService.getScriptCache();
  return {
    get: k => { const v = cache.get(k); return v ? JSON.parse(v) : null; },
    set: (k, v) => cache.put(k, JSON.stringify(v), 900),
    del: k => cache.remove(k)
  };
}

// The asker's LINE display name, for "Updated by" on the site.
function displayName(src) {
  const token = PropertiesService.getScriptProperties().getProperty("LINE_TOKEN");
  if (!token || !src.userId) return "";
  const path = src.groupId ? "group/" + src.groupId : src.roomId ? "room/" + src.roomId : "";
  const r = UrlFetchApp.fetch("https://api.line.me/v2/bot/" + (path ? path + "/member/" : "profile/") + src.userId, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return "";
  try { return JSON.parse(r.getContentText()).displayName || ""; } catch (err) { return ""; }
}

// Creates a task in Firestore (same fields the site writes) and an activity-log entry.
function addTaskDoc(t) {
  const base = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/";
  const headers = { Authorization: "Bearer " + ScriptApp.getOAuthToken(), "X-Goog-User-Project": PROJECT };
  const now = new Date().toISOString();
  const depts = t.owner.split(",").map(x => x.trim()).filter(Boolean);
  const str = v => ({ stringValue: String(v) });
  const fields = {
    title: str(t.title), due: str(t.due), owner: str(t.owner), depts: { arrayValue: { values: depts.map(str) } },
    status: str("todo"), phase: { integerValue: String(t.phase) }, note: str(""),
    order: { integerValue: String(Math.round(Date.parse(t.due + "T00:00:00Z") / 86400000)) },
    updatedBy: str(t.by), updatedAt: { timestampValue: now }
  };
  const r = UrlFetchApp.fetch(base + "tasks", { method: "post", contentType: "application/json", headers: headers, payload: JSON.stringify({ fields: fields }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Firestore add " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
  const id = JSON.parse(r.getContentText()).name.split("/").pop();
  UrlFetchApp.fetch(base + "log", { method: "post", contentType: "application/json", headers: headers, muteHttpExceptions: true, payload: JSON.stringify({ fields: {
    task: str(id), title: str(t.title), action: str("add"), detail: str("Added for " + t.owner + " via LINE"), by: str(t.by), email: str("line-bot"), at: { timestampValue: now } } }) });
  CacheService.getScriptCache().remove("tasks");
  return id;
}

// Updates only the given task fields (null removes a field) and logs the change like the site does.
function updateTaskDoc(t, patch, by, action, detail) {
  const now = new Date().toISOString();
  const str = v => ({ stringValue: String(v) });
  const enc = v => Array.isArray(v) ? { arrayValue: { values: v.map(str) } } : typeof v === "number" ? { integerValue: String(v) } : str(v);
  const fields = { updatedBy: str(by), updatedAt: { timestampValue: now } };
  Object.keys(patch).forEach(k => { if (patch[k] !== null) fields[k] = enc(patch[k]); });
  const mask = Object.keys(patch).concat(["updatedBy", "updatedAt"]).map(k => "updateMask.fieldPaths=" + k).join("&");
  const r = UrlFetchApp.fetch(fsBase() + "tasks/" + t.id + "?" + mask + "&currentDocument.exists=true", { method: "patch", contentType: "application/json", headers: fsHeaders(), payload: JSON.stringify({ fields: fields }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Firestore update " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
  writeLog(t.id, patch.title || t.title, action, detail, by);
}

function deleteTaskDoc(t, by) {
  const r = UrlFetchApp.fetch(fsBase() + "tasks/" + t.id, { method: "delete", headers: fsHeaders(), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Firestore delete " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
  writeLog(t.id, t.title, "delete", "Deleted the task via LINE", by);
}

function writeLog(taskId, title, action, detail, by) {
  const str = v => ({ stringValue: String(v) });
  UrlFetchApp.fetch(fsBase() + "log", { method: "post", contentType: "application/json", headers: fsHeaders(), muteHttpExceptions: true,
    payload: JSON.stringify({ fields: { task: str(taskId), title: str(title), action: str(action), detail: str(detail), by: str(by), email: str("line-bot"), at: { timestampValue: new Date().toISOString() } } }) });
  CacheService.getScriptCache().remove("tasks");
}
function fsBase() { return "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/"; }
function fsHeaders() { return { Authorization: "Bearer " + ScriptApp.getOAuthToken(), "X-Goog-User-Project": PROJECT }; }

// ---------- announcements to LINE ----------
// Add a time-driven trigger for checkAnnounce (every minute) in Apps Script -> Triggers. It reads settings/announce and,
// if the admin ticked "Also send to LINE" on a new announcement, pushes it once to the chosen groups (ALL and/or HEADS).
function checkAnnounce() {
  const props = PropertiesService.getScriptProperties();
  const r = UrlFetchApp.fetch(fsBase() + "settings/announce", { headers: fsHeaders(), muteHttpExceptions: true });
  if (r.getResponseCode() === 404) return;
  if (r.getResponseCode() !== 200) throw new Error("Firestore " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
  const a = fromFields(JSON.parse(r.getContentText()).fields || {});
  const to = (a.line || []).filter(x => x === "ALL" || x === "HEADS");
  if (!to.length || !a.id || !a.text || props.getProperty("LAST_ANN") === String(a.id)) return;
  props.setProperty("LAST_ANN", String(a.id)); // mark first: at most one send per announcement, even if something fails (protects the quota)
  const all = props.getProperties();
  const groups = Object.keys(all).filter(k => k.indexOf("GROUP_") === 0 && to.indexOf(all[k]) >= 0).map(k => k.slice(6));
  const head = a.level === "urgent" ? "\uD83D\uDEA8 URGENT ANNOUNCEMENT" : "\uD83D\uDCE2 Announcement";
  const text = head + "\n\n" + a.text + (a.link ? "\n\n" + a.link : "") + "\n\n- " + (a.by || "TUBC 2027") + "\n" + SITE;
  let sent = 0, err = groups.length ? "" : "no " + to.map(x => x === "ALL" ? "whole-committee" : "heads").join(" or ") + " group is registered (/setup)";
  groups.forEach(id => { const res = pushText(id, text); if (res === 200) sent++; else err = res === 429 ? "monthly LINE message limit reached" : "LINE error " + res; });
  const now = new Date().toISOString(), str = v => ({ stringValue: String(v) });
  const fields = { lineId: str(a.id), lineSent: { integerValue: String(sent) }, lineErr: str(err), lineAt: { timestampValue: now } };
  const mask = Object.keys(fields).map(k => "updateMask.fieldPaths=" + k).join("&");
  const u = UrlFetchApp.fetch(fsBase() + "settings/announce?" + mask + "&currentDocument.exists=true", { method: "patch", contentType: "application/json", headers: fsHeaders(), payload: JSON.stringify({ fields: fields }), muteHttpExceptions: true });
  if (u.getResponseCode() !== 200) console.warn("announce status " + u.getResponseCode() + ": " + u.getContentText().slice(0, 200));
}
function pushText(to, text) {
  const token = PropertiesService.getScriptProperties().getProperty("LINE_TOKEN");
  if (!token) { console.error("LINE_TOKEN script property is missing"); return 0; }
  const r = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ to: to, messages: [{ type: "text", text: String(text).slice(0, 4900) }] }), muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) console.error("LINE push " + r.getResponseCode() + ": " + r.getContentText());
  return r.getResponseCode();
}

// Run this once from the editor: it asks for permission, then logs how many tasks it can read.
function testRead() {
  const tasks = loadTasks();
  console.log("Read " + tasks.length + " tasks from Firestore. Example: " + JSON.stringify(tasks[0] || {}));
}
