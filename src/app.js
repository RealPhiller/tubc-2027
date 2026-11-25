import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, reauthenticateWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, getDoc, writeBatch, serverTimestamp, query, orderBy, limit, deleteField } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const SEED = [["Hold PVP kickoff and split department ownership among the 3 PVP", "2026-11-29", "PVP", "todo", 0, "Set up a PVP x Dept Line group for each department"], ["Read TUBC 2026 and CLG 2026 debriefs", "2026-11-30", "PVP", "todo", 0, ""], ["Pick tentative dates: CLG (mid–late Aug), TUBC (early Oct)", "2026-12-06", "President", "todo", 0, "Aj. Pong checks against exams, AUBCC and CIBCC"], ["Book first meeting with Aj. Pong", "2026-12-13", "President", "todo", 0, "Aim for mid-January"], ["Draft head recruitment post (positions and PVP contacts)", "2026-12-18", "PVP", "todo", 0, "ER 2, Inven, PR, Venue, CR 2, Excur, Photog, IT 2, Doc, Buddy"], ["Post head recruitment to the BBA Line group", "2026-12-23", "PVP", "todo", 0, "Competition, Case Writer, Uni Affairs and Treasurer need no application"], ["Close head applications", "2026-12-26", "PVP", "todo", 0, ""], ["Tell 2026 heads that 2027 heads will reach out", "2026-12-31", "PVP", "todo", 0, ""], ["Set up 2027 Master Drive with Dept_TUBC2027 folders, shared to tubc@tbs.tu.ac.th", "2027-01-05", "PVP", "todo", 0, "Split each department folder into TUBC and CLG"], ["Finalize all heads and add them to the All Head Line group", "2027-01-07", "PVP", "todo", 0, ""], ["Duplicate the handover file (Head 32 x 33) for heads to fill", "2027-01-07", "PVP", "todo", 0, ""], ["Meet Aj. Pong: dates, format, invited teams, case company pricing, sponsorship proposal, advisor scope", "2027-01-15", "President", "todo", 1, "Advisor scope: pre-screening, judge screening, judge briefing"], ["Meet BBA Office with Treasurer: project-opening documents and budget process", "2027-01-20", "President", "todo", 1, "BBA Office gives opinions; Aj. Pong decides"], ["Agree PR x CR lead-time rules", "2027-01-24", "PVP", "todo", 1, "CR asked for about 1 week of lead time and at most 2 revision rounds"], ["Run the first all-head meeting", "2027-01-24", "PVP", "todo", 1, "Intros and concerns, work allocation, overview, recruitment timeline, vote the biweekly day"], ["Log into the tbs.tu.ac.th email on all devices and change the password", "2027-01-24", "PVP", "todo", 1, ""], ["Heads meet previous heads: record the call, fill the handover file", "2027-01-31", "All heads", "todo", 1, ""], ["List potential universities and send pre-invites", "2027-01-31", "Uni Affairs", "todo", 1, ""], ["Contact sponsors and case companies before Q1 budgets close", "2027-01-31", "ER", "todo", 1, "The 5-hour case company is the hardest to find"], ["Committee info session", "2027-02-06", "PR, CR, Doc", "todo", 2, ""], ["Close committee applications (one week)", "2027-02-12", "Doc", "todo", 2, "Extend two days if few apply"], ["Review each head's interview questions", "2027-02-13", "PVP", "todo", 2, ""], ["Finish committee interviews", "2027-02-24", "All heads", "todo", 2, ""], ["Interview and select Oper and Stage-co", "2027-02-28", "PVP", "todo", 2, ""], ["Announce the committee", "2027-03-02", "PVP", "todo", 2, ""], ["Announce CLG and TUBC themes", "2027-03-21", "CR, PR", "todo", 3, ""], ["CLG budget research deadline", "2027-04-10", "Treasurer", "todo", 3, "Include shipping fees; screenshots of online orders are no longer accepted"], ["Finalize TUBC format, team count and cash prizes", "2027-04-19", "PVP", "todo", 3, ""], ["Send official invitations to selected universities", "2027-04-22", "Uni Affairs", "todo", 3, ""], ["Submit CLG project and budget to BBA Office", "2027-04-30", "Treasurer", "todo", 3, ""], ["Secure the CLG case company", "2027-05-15", "ER", "todo", 3, "Keep confidential"], ["Lock the TUBC venue", "2027-05-31", "Venue", "todo", 3, "A bottleneck both years: hotels fill up"], ["Website, Airtable, emails and bank account ready for CLG", "2027-06-27", "IT, Doc, Treasurer", "todo", 3, ""], ["Open CLG applications", "2027-06-28", "PVP", "todo", 3, ""], ["Send TUBC participation fee invoices", "2027-07-15", "Uni Affairs", "todo", 4, "Fees must arrive net of transfer fees; set a firm deadline"], ["TUBC budget research deadline", "2027-07-17", "Treasurer", "todo", 4, ""], ["CLG judge screening day", "2027-08-08", "ER, Doc, Inven, Oper", "todo", 4, ""], ["Secure TUBC case companies (5-hour and 24-hour)", "2027-08-15", "ER", "todo", 4, "Was critical by mid-August in 2026"], ["All staff first meet", "2027-08-16", "PVP, Oper", "todo", 4, ""], ["The Challenger (CLG) day", "2027-08-22", "All", "todo", 4, "Tentative date"], ["Committee photoshoot", "2027-09-10", "Photog", "todo", 5, ""], ["TUBC site inspection with all departments", "2027-09-14", "Venue, PVP", "todo", 5, "Each department brings its questions"], ["Send the welcoming package to universities", "2027-09-21", "Uni Affairs", "todo", 5, "Two weeks before the event"], ["TUBC budget approved; start ordering", "2027-10-01", "Treasurer", "todo", 5, "Over 10,000 THB needs a TOR, a quote and 2 comparison quotes first"], ["TUBC week", "2027-10-04", "All", "todo", 5, "Tentative date"], ["Run the committee debrief", "2027-10-18", "PVP", "todo", 5, ""]];

// ---- settings ----
const firebaseConfig = {
  apiKey: "AIzaSyDfklg5XhpY2OAR34xLb5bHwJc5JzcVv5g",
  authDomain: "realphiller.github.io",
  projectId: "tubc-2027",
  storageBucket: "tubc-2027.firebasestorage.app",
  messagingSenderId: "1027304393926",
  appId: "1:1027304393926:web:32e8227211d680e130dbc7"
};
const BOOT_ADMINS = ["puripat_rob67@tbs.tu.ac.th"]; // must match firestore.rules

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PH = [["Kickoff","Nov–Jan","2026-11-23","2027-01-08"],["Setup","January","2027-01-08","2027-02-01"],["Recruitment","Feb–Mar","2027-02-01","2027-03-05"],["Planning","Mar–Jun","2027-03-05","2027-07-01"],["The Challenger","Jul–Aug","2027-07-01","2027-09-01"],["TUBC","Sep–Oct","2027-09-01","2027-10-20"]];
const ST = {todo:"To do",prog:"In progress",dn:"Done"}; // "Blocked" was removed 2026-11-25; old blk tasks read as In progress
const SLOTS = {"Oper":2,"Inven":1,"Doc":1,"CR":2,"PR":1,"Buddy":1,"Stage-co":1,"IT":2,"Photog":1,"ER":2,"Excur":1,"Treasurer":2,"Venue":1,"Case Writer":2,"Uni Affairs":1};
const OWNERS = {"Oper":"Puripat","Inven":"Puripat","Doc":"Puripat","Buddy":"Puripat and Sattam","CR":"Sattam","PR":"Sattam","Stage-co":"Krang","IT":"Krang","Photog":"Krang","ER":"All PVP","Excur":"All PVP","Treasurer":"All PVP","Venue":"All PVP","Case Writer":"Freelance · Competition team","Uni Affairs":"Freelance · Competition team"};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today = new Date().toISOString().slice(0,10);
const fmt = d => d ? new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : ""; // the project runs Nov 2026 - Oct 2027, so no month repeats and the year is left out
const DEPTS = ["PVP", ...Object.keys(SLOTS)];
// Multi-day tasks: an optional start date before the due date.
const spans = t => !!(t.start && t.due && t.start < t.due);
const addDays = (d,n) => { const x=new Date(d+"T00:00"); x.setDate(x.getDate()+n); return iso(x); };
const dayDiff = (a,b) => Math.round((Date.parse(b+"T00:00")-Date.parse(a+"T00:00"))/86400000);
function rng(a,b){ if(!b||a===b) return fmt(a); const A=new Date(a+"T00:00"), B=new Date(b+"T00:00"), o={day:"numeric",month:"short"}, y="";
  return A.getMonth()===B.getMonth()&&A.getFullYear()===B.getFullYear() ? `${A.getDate()}–${B.toLocaleDateString("en-GB",o)}${y}` : `${A.toLocaleDateString("en-GB",o)} – ${B.toLocaleDateString("en-GB",o)}${y}`; }
const when = t => spans(t) ? rng(t.start,t.due) : fmt(t.due);
// "in 3 days" / "Today" / "2 days late" under a date (open tasks only)
function relDue(t){ if(!t.due||t.status==="dn") return ""; const n=dayDiff(iso(new Date()),t.due);
  if(n<0) return `<span class="rd late">${-n} day${n===-1?"":"s"} late</span>`;
  if(n===0) return `<span class="rd soon">Today</span>`; if(n===1) return `<span class="rd soon">Tomorrow</span>`;
  return n<=30 ? `<span class="rd">in ${n} days</span>` : ""; }
const RM = matchMedia("(prefers-reduced-motion: reduce)"); const motion = () => !RM.matches;
// ---------- popup closing animation: every dialog.close() plays a short exit first (closeNow() skips it) ----------
{ const P=HTMLDialogElement.prototype, nClose=P.close, nShow=P.showModal;
  P.closeNow=function(v){ clearTimeout(this._outT); this._outT=null; this.classList.remove("dout"); if(this.open) nClose.call(this,v); };
  P.close=function(v){ if(!this.open||this._outT) return; if(!motion()) return this.closeNow(v);
    const fin=()=>{ if(this._outT) this.closeNow(v); };
    this.classList.add("dout"); this._outT=setTimeout(fin,320);
    const onEnd=e=>{ if(e.target!==this||e.pseudoElement) return; this.removeEventListener("animationend",onEnd); fin(); };
    this.addEventListener("animationend",onEnd); };
  P.showModal=function(){ if(this._outT) this.closeNow(); return nShow.call(this); }; }
const justDone = new Map(); // task id -> time it was ticked, for the done animation
const jd = id => { const t0=justDone.get(id); return t0==null ? "" : ` justdone" style="--ad:-${Math.min(1200,Date.now()-t0)}ms`; };
const prevW = {};
function animBars(root){ (root||document).querySelectorAll("[data-w]").forEach(el=>{ const k=el.dataset.k, w=+el.dataset.w, from=k in prevW?prevW[k]:0; prevW[k]=w;
  if(!motion()||from===w){ el.style.width=w+"%"; return; } el.style.width=from+"%"; el.getBoundingClientRect(); requestAnimationFrame(()=>{ el.style.width=w+"%"; }); }); }
const prevRing = {};
function animRings(root,fresh){ root.querySelectorAll("[data-ring]").forEach(el=>{ const k=el.dataset.rk, p=+el.dataset.ring, from=fresh?0:(k in prevRing?prevRing[k]:0); prevRing[k]=p;
  if(!motion()||from===p){ el.style.transition="none"; el.style.strokeDashoffset=100-p; return; }
  el.style.transition="none"; el.style.strokeDashoffset=100-from; el.getBoundingClientRect(); requestAnimationFrame(()=>{ el.style.transition=""; el.style.strokeDashoffset=100-p; }); }); }
const numFrom = {};
function animNum(key,el,to,fmtFn){ const from=numFrom[key]??0; numFrom[key]=to; if(!motion()||from===to){ fmtFn(el,to); return; }
  const t0=performance.now(), d=700; const step=t=>{ const p=Math.min(1,(t-t0)/d), e=1-Math.pow(1-p,3); fmtFn(el,Math.round(from+(to-from)*e)); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
const OWNER_GROUPS = [["Leadership",["PVP","President"]],["Shared",["All","All heads"]],["Departments",Object.keys(SLOTS)]];
const toks = s => String(s||"").split(",").map(x=>x.trim()).filter(Boolean);
// The phase follows the due date. Kickoff is PVP-only, so a task in the Kickoff dates not owned only by PVP/President counts as Setup.
const pvpOnly = o => { const d=toks(o); return d.length>0 && d.every(x=>x==="PVP"||x==="President"); };
function phaseFor(due, owner, fallback){ if(!due) return fallback ?? 1; let i=PH.findIndex(p=>due>=p[2]&&due<p[3]); if(i<0) i=due<PH[0][2]?0:PH.length-1; return i===0&&!pvpOnly(owner)?1:i; }
const DCOL = {"PVP":"#b4232a","President":"#b4232a","Oper":"#f76707","Inven":"#8d5524","Doc":"#66a80f","CR":"#e64980","PR":"#be4bdb","Buddy":"#e8a817","Stage-co":"#7048e8","IT":"#1c7ed6","Photog":"#15aabf","ER":"#2b8a3e","Excur":"#12b886","Treasurer":"#495057","Venue":"#4263eb","Case Writer":"#a61e4d","Uni Affairs":"#0b7285","All":"#868e96","All heads":"#868e96"};
const col = o => DCOL[o] || "#868e96";
const PHCOL = ["#5c7cfa","#0ca678","#f59f00","#7950f2","#e8590c","#c2255c"]; // one colour per phase (Kickoff → TUBC)
// Owner and phase as small coloured pills: one per department in its colour, then the phase.
const pills = t => toks(t.owner).map(d=>`<span class="pill own" style="--pc:${col(d)}">${esc(d)}</span>`).join("") + (PH[t.phase]?`<span class="pill ph" style="--pc:${PHCOL[t.phase]}">${PH[t.phase][0]}</span>`:"");
const tcol = t => { const o=(t.depts&&t.depts.length?t.depts:toks(t.owner)); const d=o.find(x=>DCOL[x]&&!["All","All heads"].includes(x))||o[0]; return col(d); };
const ownHtml = s => toks(s).map(o=>`<span class="dt" style="--dc:${col(o)}">${esc(o)}</span>`).join(" ");
const thb = n => (Math.round(+n||0)).toLocaleString("en-US");
let seenComments = null, swReg = null;
let inl = null, inlPending = false, openT = null; // rename-in-place state (see that section)
let mOpen = new Set(), mReveal = null; // My tasks: which folded groups are open
let events = [], comments = [], people = {}, sponsors = [], sponsAccess = {see:["ER","PVP","Treasurer"],edit:["ER","PVP","Treasurer"]};

let logs = [], ev = {challenger:"2027-08-22", tubc:"2027-10-04"};
let me = null, tasks = [], heads = {}, members = [], requests = [], unsub = [];
const ROLE_LABEL = {admin:"Admin",head:"Head",viewer:"Member"};
const PERMS = [["statusOwn","Change status of their department's tasks"],["statusAny","Change status of any task"],["editOwn","Edit their department's tasks (name, date, owner, notes, topic)"],["editAny","Edit any task"],["move","Drag tasks between topics and reorder them"],["add","Add new tasks"],["del","Delete tasks"],["headsOwn","Edit head names for their department"],["headsAny","Edit head names for any department"]];
const DEF_PERMS = {head:{statusOwn:true,headsOwn:true},viewer:{}};
let perms = JSON.parse(JSON.stringify(DEF_PERMS));
const f = {own:"",hide:false,late:false};

function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),3500); }
const fail = e => { console.error(e); toast(e && e.code==="permission-denied" ? "You don't have permission to change that." : "Couldn't save. Check your connection."); };

// ---------- auto-update: reload when a newer version is deployed ----------
const BUILD="b20261125o";
async function checkUpdate(){ try{ const t=await (await fetch(location.pathname+"?u="+Date.now(),{cache:"no-store"})).text(); const b=(t.match(/const BUILD="([^"]+)"/)||[])[1]; if(b && b!==BUILD && !sessionStorage.getItem("upd-"+b)){ sessionStorage.setItem("upd-"+b,"1"); location.replace(location.pathname+"?v="+b+location.hash); } }catch{} }
checkUpdate(); document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") checkUpdate(); });
const isAdmin = () => me?.role==="admin";
const isHeadUp = () => me?.role==="admin" || me?.role==="head";
const seeKickoff = () => isAdmin() || me?.dept==="PVP";
const phVis = i => i!==0 || seeKickoff();
const phOpts = sel => PH.map((p,i)=>phVis(i)?`<option value="${i}"${i===sel?" selected":""}>${p[0]}</option>`:"").join("");
const seeOverview = () => isHeadUp() || me?.dept==="PVP";
const canSpons = () => isAdmin() || (!!me?.dept && (sponsAccess.edit||[]).includes(me.dept));
const seeSpons = () => isAdmin() || (!!me?.dept && ((sponsAccess.see||[]).includes(me.dept) || (sponsAccess.edit||[]).includes(me.dept)));
const can = k => isAdmin() || !!(perms[me?.role]||{})[k];
const mine = t => !!me?.dept && (t.depts||toks(t.owner)).includes(me.dept);
const canTask = t => can("statusAny") || (can("statusOwn") && mine(t));
const canEdit = t => can("editAny") || (can("editOwn") && mine(t));
const canMove = t => can("move") || canEdit(t);
const canHeads = d => can("headsAny") || (can("headsOwn") && me?.dept===d);
const ordKey = t => typeof t.order==="number" ? t.order : (t.due ? Date.parse(t.due)/86400000 : 99999);

// ---------- mobile menu ----------
let scrimT=null;
function openMenu(){ $("drawer").classList.add("open"); clearTimeout(scrimT); $("scrim").hidden=false; requestAnimationFrame(()=>$("scrim").classList.add("on")); $("menu").setAttribute("aria-expanded","true"); document.body.style.overflow="hidden"; setTimeout(()=>$("dclose").focus(),50); }
function closeMenu(){ $("drawer").classList.remove("open"); $("scrim").classList.remove("on"); clearTimeout(scrimT); scrimT=setTimeout(()=>{ $("scrim").hidden=true; }, motion()?220:0); $("menu").setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
$("menu").onclick=openMenu; $("dclose").onclick=closeMenu; $("scrim").onclick=closeMenu;
document.querySelector(".tabs").addEventListener("click", e=>{ if(e.target.closest("a")) closeMenu(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeMenu(); });

// ---------- views ----------
const VIEWS = ["login","noaccess","profile","mine","overview","calendar","sponsors","structure","who","access"];
const PNAMES={profile:"My profile",mine:"Tasks",overview:"Overview",calendar:"Calendar",sponsors:"Sponsors",structure:"Team",who:"Team · Who to ask",access:"Access"};
let curView=null, prevView=null;
const VORDER=["mine","overview","calendar","sponsors","structure","who","profile","access"];
function show(v){ if($("pname")) $("pname").textContent = me ? (PNAMES[v]||"") : "";
  for(const n of VIEWS){ const el=$("v-"+n); if(el) el.hidden = n!==v; }
  if(v!==curView && curView && motion()){ const a=VORDER.indexOf(curView), b=VORDER.indexOf(v), dx=(a<0||b<0)?0:(b>a?1:-1);
    const root=$("v-"+v); if(root){ const parts=[...root.children].map(c=>c.classList.contains("band")?(c.querySelector(".wrap")||c):c);
      const kf=dx?[{opacity:0,transform:`translateX(${dx*56}px)`},{opacity:1,transform:"none"}]:[{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}];
      parts.forEach(el=>el.animate(kf,{duration:dx?1000:340,easing:"cubic-bezier(.22,.7,.25,1)"})); } }
  curView=v;
  const gate=(v==="login"||v==="noaccess"); document.documentElement.toggleAttribute("data-gate",gate);
  let tc=document.querySelector('meta[name="theme-color"]'); if(!tc){ tc=document.createElement("meta"); tc.name="theme-color"; document.head.appendChild(tc); }
  tc.content = gate ? "#71191a" : getComputedStyle(document.querySelector(".nav")).backgroundColor;
  const tabOf = (v==="structure"||v==="who") ? "team" : v;
  for(const n of ["mine","overview","calendar","sponsors","team"]){ const a=$("t-"+n); if(n===tabOf) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }
  document.querySelectorAll(".subtabs a").forEach(a=>{ if(a.dataset.sub===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); a.hidden = a.dataset.sub==="who" && !isHeadUp(); });
  closeUM(); requestAnimationFrame(()=>{ moveTabBar(); moveSubBars(); }); if(prevView!==v) staggerIn(v); prevView=v;
  document.querySelectorAll("#bnav [data-v]").forEach(a=>{ if(a.dataset.v===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  updateFab(); if(v==="mine") markMentionsSeen(); if(v==="profile") renderProfile(); }
function route(){ if(!me) return; const h=location.hash.slice(1); const hh = h==="team" ? "structure" : h; const ok={profile:1,calendar:1,structure:1,who:isHeadUp(),access:isAdmin(),overview:seeOverview(),sponsors:seeSpons()}; show(ok[hh]?hh:"mine"); }
window.addEventListener("hashchange", ()=>{ route(); window.scrollTo(0,0); });

// ---------- auth ----------
const INAPP=/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok|musical_ly|Twitter|Snapchat|LinkedInApp|GSA\/|; ?wv\)/i.test(navigator.userAgent);
if(INAPP){ $("inapp").hidden=false; }
$("inappcopy").onclick=async()=>{ const url=location.origin+location.pathname; try{ await navigator.clipboard.writeText(url); toast("Link copied. Paste it into Safari or Chrome."); }catch{ prompt("Copy this link:",url); } };
$("login").onclick = async ()=>{ $("lerr").textContent=""; try{ const pv=new GoogleAuthProvider(); pv.setCustomParameters({prompt:"select_account"}); await signInWithPopup(auth,pv); }catch(e){ $("lerr").textContent = e.code==="auth/popup-blocked" ? "Allow pop-ups for this site, then try again." : e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request" ? "" : "Sign-in didn't finish. Try again, or open this page in Safari."; if(e.code!=="auth/popup-closed-by-user") $("inapp").hidden=false; } };
$("out").onclick = $("out2").onclick = ()=>{ closeMenu(); closeUM(); signOut(auth); };

onAuthStateChanged(auth, async u=>{
  unsub.forEach(fn=>fn()); unsub=[]; me=null; events=[]; ann=null; $("annbar").hidden=true; stopPresence(); $("cdbar").hidden=true; logs=[]; mdPicked=false;
  document.querySelector(".tabs").hidden = true; $("me").hidden = true; $("menu").hidden = true; $("pname").textContent = ""; closeMenu();
  $("bnav").hidden = true; $("fab").hidden = true; document.body.classList.remove("authed"); comments=[]; seenComments=null; sponsors=[]; if(sponsUnsub){ sponsUnsub(); sponsUnsub=null; }
  if(!u){ show("login"); return; }
  const email = (u.email||"").toLowerCase();
  let snap = null;
  try { snap = await getDoc(doc(db,"members",email)); } catch(e) { console.error(e); }
  let m = snap && snap.exists() ? snap.data() : null;
  if(!m && BOOT_ADMINS.includes(email)){ m = {role:"admin",dept:""}; try{ await setDoc(doc(db,"members",email),{role:"admin",dept:"",name:u.displayName||""}); }catch(e){ console.error(e); } }
  if(!m){ $("naemail").textContent = email; $("rqn").value = u.displayName||""; $("rqd").innerHTML = deptOpts("");
    $("rqf").hidden=false; $("rqdone").hidden=true; show("noaccess");
    unsub.push(onSnapshot(doc(db,"requests",email), s=>{ const has=s.exists(); $("rqf").hidden=has; $("rqdone").hidden=!has; }, ()=>{}));
    unsub.push(onSnapshot(doc(db,"members",email), s=>{ if(s.exists()) location.reload(); }, ()=>{}));
    return; }
  me = {email, name:u.displayName||email, role:m.role, dept:m.dept||""};
  paintMe(); $("melvl").textContent = (ROLE_LABEL[me.role]||me.role) + (me.role==="head"&&me.dept?" · "+me.dept:"");
  $("me").hidden = false; document.querySelector(".tabs").hidden = false; $("menu").hidden = false; $("umaccess").hidden = !isAdmin(); applyStructView(); 
  $("t-overview").hidden = !seeOverview(); $("b-overview").hidden = !seeOverview(); $("t-sponsors").hidden = !seeSpons();
  $("bnav").hidden = false; document.body.classList.add("authed");
  me.photo=u.photoURL||""; syncProfile(u);
  if(me.role==="head" && me.dept) f.own = me.dept;
  start(); route(); renderCd(); setTimeout(maybeTour, 1500);
});

function start(){
  unsub.push(onSnapshot(collection(db,"tasks"), s=>{ tasks = s.docs.map(d=>{ const t={id:d.id,...d.data()}; if(t.status==="blk") t.status="prog"; t.phase=phaseFor(t.due,t.owner,t.phase); return t; }).filter(t=>phVis(t.phase)); render(); }, e=>{ fail(e); }));
  unsub.push(onSnapshot(collection(db,"presence"), s=>{ presence=s.docs.map(d=>({email:d.id,...d.data()})); renderOnline(); }, e=>console.warn("presence",e)));
  startPresence(); renderOnline();
  unsub.push(onSnapshot(doc(db,"settings","announce"), s=>{ ann=s.exists()?s.data():null; renderAnn(); }, e=>console.warn("announce",e)));
  unsub.push(onSnapshot(collection(db,"events"), s=>{ events=s.docs.map(d=>({id:d.id,...d.data()})); renderCal(); }, e=>console.warn("events",e)));
  unsub.push(onSnapshot(doc(db,"settings","event"), s=>{ if(s.exists()) ev={...ev,...s.data()}; renderCd(); renderKd(); }, ()=>{}));
  unsub.push(onSnapshot(query(collection(db,"log"),orderBy("at","desc"),limit(200)), s=>{ logs=s.docs.map(d=>({id:d.id,...d.data()})); renderFeed(); if($("td").open&&curTask) renderHist(curTask); }, e=>console.warn("log",e)));
  unsub.push(onSnapshot(doc(db,"settings","permissions"), s=>{ const d=s.exists()?s.data():{}; perms={head:{...DEF_PERMS.head,...(d.head||{})},viewer:{...DEF_PERMS.viewer,...(d.viewer||{})}}; render(); renderHeads(); renderPerms(); }, fail));
  unsub.push(onSnapshot(collection(db,"heads"), s=>{ heads={}; s.docs.forEach(d=>heads[d.id]=d.data().list||[]); renderHeads(); }, fail));
  unsub.push(onSnapshot(query(collection(db,"comments"),orderBy("at","desc"),limit(500)), s=>{ comments=s.docs.map(d=>({id:d.id,...d.data()})); notifyMentions(); renderMentions(); if($("td").open&&curTask) renderComments(curTask); render(); }, e=>console.warn("comments",e)));
  unsub.push(onSnapshot(collection(db,"people"), s=>{ people={}; s.docs.forEach(d=>people[d.id]=d.data()); const p=people[me.email]; if(p?.name&&p.name!==me.name){ me.name=p.name; } paintMe(); if(curView==="profile") renderProfile(); if($("td").open&&curTask) renderComments(curTask); }, e=>console.warn("people",e)));
  unsub.push(onSnapshot(doc(db,"settings","sponsors"), s=>{ const d=s.exists()?s.data():{}; sponsAccess={see:d.see||["ER","PVP","Treasurer"],edit:d.edit||["ER","PVP","Treasurer"]}; applySponsAccess(); renderSponsAccess(); }, e=>console.warn("sponsAccess",e)));
  if(isAdmin()) unsub.push(onSnapshot(collection(db,"requests"), s=>{ requests = s.docs.map(d=>({email:d.id,...d.data()})).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0)); renderRequests(); }, fail));
  if(isAdmin()) unsub.push(onSnapshot(collection(db,"members"), s=>{ members = s.docs.map(d=>({email:d.id,...d.data()})).sort((a,b)=>a.email.localeCompare(b.email)); renderMembers(); }, fail));
}

// ---------- render everything that shows tasks ----------
function render(){
  if (inl) { inlPending = true; return; }
  renderCal(); renderMine(); renderOverview();
}
function extras(t){ const ck=t.checks||[], n=ck.length, d=ck.filter(c=>c.d).length, l=(t.links||[]).length, c=comments.filter(x=>x.task===t.id).length;
  const p=[]; if(n) p.push(`☑ ${d}/${n} steps`); if(l) p.push(`🔗 ${l}`); if(c) p.push(`💬 ${c}`); return p.length?`<span class="tx">${p.join(" · ")}</span>`:""; }
const setStatus = (id,status)=>{ const t=tasks.find(x=>x.id===id), old=t?.status;
  if(status==="dn"&&old!=="dn"&&motion()){ justDone.set(id,Date.now()); setTimeout(()=>justDone.delete(id),1300); }
  return updateDoc(doc(db,"tasks",id),{status,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>{ if(t&&old!==status) logIt(t,"status",`${ST[old]||old||"?"} → ${ST[status]}`); }).catch(fail); };

document.addEventListener("click", e=>{
  const b=e.target.closest("[data-tick],[data-del],[data-go],.tree .dept[data-dept],[data-rm],[data-edit]"); if(!b) return;
  if(b.dataset.edit){ openEdit(b.dataset.edit); return; }
  if(b.dataset.tick){ const t=tasks.find(x=>x.id===b.dataset.tick); if(t) setStatus(t.id, t.status==="dn"?"todo":"dn"); }
  else if(b.dataset.del){ if(b.dataset.armed){ const dt=tasks.find(x=>x.id===b.dataset.del); deleteDoc(doc(db,"tasks",b.dataset.del)).then(()=>logIt(dt,"delete","Deleted the task")).catch(fail); } else { b.dataset.armed=1; b.textContent="Delete?"; b.style.fontSize="13px"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="×"; b.style.fontSize=""; } },3000); } }
  else if(b.dataset.go!==undefined){ const sec=$("mph"+b.dataset.go); if(sec) sec.scrollIntoView({behavior:motion()?"smooth":"auto",block:"start"}); else toast("No open tasks in "+PH[+b.dataset.go][0]+" for this view."); }
  else if(b.dataset.dept){ openDept(b.dataset.dept); }
  else if(b.dataset.rm){ if(b.dataset.armed){ deleteDoc(doc(db,"members",b.dataset.rm)).catch(fail); } else { b.dataset.armed=1; b.textContent="Remove?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Remove"; } },3000); } }
});
document.addEventListener("change", e=>{
  const el=e.target;
  if(el.dataset.st) setStatus(el.dataset.st, el.value);
  if(el.dataset.role) setDoc(doc(db,"members",el.dataset.role),{role:el.value},{merge:true}).catch(fail);
  if(el.dataset.mdept) setDoc(doc(db,"members",el.dataset.mdept),{dept:el.value},{merge:true}).catch(fail);
});
function addTask(title,due,owner,phase,start,extra){ return addDoc(collection(db,"tasks"),{title,due,...(start&&due&&start<due?{start}:{}),owner,depts:toks(owner),status:"todo",phase,note:"",order:due?Date.parse(due)/86400000:99999,...(extra||{}),updatedBy:me.name,updatedAt:serverTimestamp()}).then(r=>{ logIt({id:r.id,title},"add","Added for "+owner); toast("Task added."); return r; }); }
$("seed").onclick = async ()=>{ const b=writeBatch(db); SEED.forEach(t=>b.set(doc(collection(db,"tasks")),{title:t[0],due:t[1],owner:t[2],depts:toks(t[2]),status:"todo",phase:t[4],note:t[5]||"",order:Date.parse(t[1])/86400000,updatedBy:"",updatedAt:serverTimestamp()})); try{ await b.commit(); toast("Starter tasks loaded."); }catch(e){ fail(e); } };


// ---------- calendar ----------
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
let cm=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1);})();
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const chip=(t,withRange)=>`<button type="button" style="--dc:${tcol(t)}" class="chip2 ${t.status}${t.due<today&&t.status!=="dn"?" late":""}${canEdit(t)?" cand":""}" data-task="${t.id}" title="${esc(t.title)} · ${esc(t.owner)}">${esc(t.title)}${withRange&&spans(t)?` <small>${rng(t.start,t.due)}</small>`:""}</button>`;
function renderCal(){
  if(!$("cal")) return; fillGDept();
  const owners=[...new Set(tasks.flatMap(t=>toks(t.owner)))].sort(); if(f.own&&!owners.includes(f.own)) owners.push(f.own);
  $("cown").innerHTML='<option value="">Everyone</option>'+owners.map(o=>`<option${o===f.own?" selected":""}>${esc(o)}</option>`).join("");
  const T=tasks.filter(t=>t.due&&(!f.own||toks(t.owner).includes(f.own)));
  const singles=T.filter(t=>!spans(t)), multi=T.filter(spans), by={}; singles.forEach(t=>(by[t.due]=by[t.due]||[]).push(t));
  const y=cm.getFullYear(), m=cm.getMonth(), mk=`${y}-${String(m+1).padStart(2,"0")}`, m0=mk+"-01", m1=iso(new Date(y,m+1,0));
  $("cmon").textContent=MON[m]+" "+y;
  const inMonth=T.filter(t=>(spans(t)?t.start:t.due)<=m1&&t.due>=m0), open=inMonth.filter(t=>t.status!=="dn").length;
  const hint=[tasks.some(canEdit)?"drag a task to change its date":"",can("add")?"click a day to add a task":""].filter(Boolean).join(" · ");
  $("csub").innerHTML=esc(inMonth.length?`${inMonth.length} task${inMonth.length>1?"s":""} this month · ${open} still open`:"No tasks this month")+(hint?`<span class="cal-hint"> · ${esc(hint[0].toUpperCase()+hint.slice(1))}</span>`:"");
  $("cal").classList.toggle("can-add",can("add")); $("cadd").hidden=!isAdmin();
  const lead=(new Date(y,m,1).getDay()+6)%7, first=iso(new Date(y,m,1-lead)), weeks=Math.ceil((lead+new Date(y,m+1,0).getDate())/7);
  let html='<div class="dows">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="dow">${d}</div>`).join("")+"</div>";
  // Each week is its own grid: row 1 = day numbers, then one row ("lane") per overlapping bar, then the single-day chips.
  for(let w=0;w<weeks;w++){ const ws=addDays(first,w*7), we=addDays(ws,6);
    const items=[...events.filter(e=>e.start<=we&&e.end>=ws).map(e=>({ev:e,s:e.start,e:e.end})), ...multi.filter(t=>t.start<=we&&t.due>=ws).map(t=>({t,s:t.start,e:t.due}))]
      .sort((p,q)=>(!!p.t-!!q.t)||p.s.localeCompare(q.s)||q.e.localeCompare(p.e));
    const lanes=[]; items.forEach(it=>{ it.a=it.s<ws?ws:it.s; it.b=it.e>we?we:it.e; let l=lanes.findIndex(end=>end<it.a); if(l<0){ l=lanes.length; lanes.push(""); } lanes[l]=it.b; it.lane=l; });
    const L=lanes.length; let cells="", nums="", bars="", chips="";
    for(let i=0;i<7;i++){ const k=addDays(ws,i), out=!k.startsWith(mk), ts=by[k]||[];
      cells+=`<div class="day${out?" out":""}" data-date="${k}" data-col="${i}" style="grid-column:${i+1};grid-row:1/-1"></div>`;
      nums+=`<span class="dn2${out?" out":""}${k===today?" today":""}" style="grid-column:${i+1};grid-row:1">${+k.slice(8)}</span>`;
      chips+=`<div class="dch" style="grid-column:${i+1};grid-row:${L+2}">${ts.slice(0,3).map(t=>chip(t)).join("")}${ts.length>3?`<button type="button" class="more" data-day="${k}">+${ts.length-3} more</button>`:""}</div>`; }
    items.forEach(it=>{ const pos=`grid-column:${dayDiff(ws,it.a)+1}/span ${dayDiff(it.a,it.b)+1};grid-row:${it.lane+2}`, cls=(it.s<ws?" cl":"")+(it.e>we?" cr":"");
      if(it.ev){ const e=it.ev, adm=isAdmin();
        bars+=`<div class="evb${cls}${adm?" cane":""}" data-ev="${esc(e.id)}" style="${pos};--ec:${EVC[e.color]||EVC.grey}" title="${esc(e.title)} · ${rng(e.start,e.end)}${e.note?" · "+esc(e.note):""}">${esc(e.title)}${adm&&it.e<=we?'<span class="rsz" aria-hidden="true"></span>':""}</div>`; }
      else { const t=it.t, ed=canEdit(t);
        bars+=`<button type="button" class="chip2 tbar ${t.status}${t.due<today&&t.status!=="dn"?" late":""}${ed?" cand":""}${cls}" data-task="${t.id}" style="${pos};--dc:${tcol(t)}" title="${esc(t.title)} · ${rng(t.start,t.due)} · ${esc(t.owner)}">${esc(t.title)}${ed&&it.e<=we?'<span class="rsz" aria-hidden="true"></span>':""}</button>`; } });
    html+=`<div class="wk" style="grid-template-rows:28px${L?` repeat(${L},24px)`:""} minmax(56px,1fr)">${cells}${nums}${bars}${chips}</div>`; }
  $("cal").innerHTML=html;
  // Agenda (phones): events first, then each day; a multi-day task is listed once, on its first day in this month.
  const evM=events.filter(e=>e.start<=m1&&e.end>=m0).sort((p,q)=>p.start.localeCompare(q.start)), ag={};
  singles.filter(t=>t.due.startsWith(mk)).forEach(t=>(ag[t.due]=ag[t.due]||[]).push(t));
  multi.filter(t=>t.start<=m1&&t.due>=m0).forEach(t=>{ const k=t.start<m0?m0:t.start; (ag[k]=ag[k]||[]).push(t); });
  const days=Object.keys(ag).sort();
  $("agenda").innerHTML=(evM.length?`<div class="ag"><h3>Events</h3>${evM.map(e=>`<button type="button" class="agev" data-ev="${esc(e.id)}" style="--ec:${EVC[e.color]||EVC.grey}">${esc(e.title)} <small>${rng(e.start,e.end)}</small></button>`).join("")}</div>`:"")
    +(days.length?days.map(k=>`<div class="ag"><h3>${new Date(k+"T00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</h3>${ag[k].map(t=>chip(t,true)).join("")}</div>`).join(""):`<p class="empty">No tasks this month.</p>`);
}
$("cprev").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()-1,1);renderCal();};
$("cnext").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()+1,1);renderCal();};
$("ctoday").onclick=()=>{const d=new Date();cm=new Date(d.getFullYear(),d.getMonth(),1);renderCal();};
$("cown").addEventListener("change",e=>{f.own=e.target.value;render();});
// ---------- calendar editing ----------
// Drag a task (admins: also an event) to move it, drag the right edge of a bar to change its length, click an empty spot to add a task.
// Follows canEdit / can("add") / isAdmin(), which firestore.rules also enforce. Grid only (≥700px); touch needs a 350 ms press first so scrolling still works.
let cd=null, cdSkip=false;
function cdDay(x,y){ const wk=document.elementFromPoint(x,y)?.closest?.("#cal .wk"); if(!wk) return null; const r=wk.getBoundingClientRect(); return wk.querySelector(`.day[data-col="${Math.min(6,Math.max(0,Math.floor((x-r.left)/r.width*7)))}"]`); }
function cdHi(a,b){ document.querySelectorAll("#cal .day.cdover").forEach(d=>d.classList.remove("cdover")); if(a) document.querySelectorAll("#cal .day[data-date]").forEach(d=>{ const k=d.dataset.date; if(k>=a&&k<=b) d.classList.add("cdover"); }); }
function cdRange(c){ const it=c.ev?events.find(e=>e.id===c.id):tasks.find(t=>t.id===c.id); if(!it||!c.over) return null; const k=c.over.dataset.date;
  const s=c.ev?it.start:(spans(it)?it.start:it.due), e=c.ev?it.end:it.due;
  if(c.mode==="resize") return {s,e:k<s?s:k}; const off=dayDiff(c.grab,k); return {s:addDays(s,off),e:addDays(e,off)}; }
function cdBegin(){ const c=cd.el; cd.on=true; c.classList.add("cddrag"); document.body.classList.add("cdragging"); if(cd.mode==="resize") document.body.classList.add("cdresize");
  if(cd.mode==="move"){ const r=c.getBoundingClientRect(), g=c.cloneNode(true); g.classList.add("cdghost"); g.classList.remove("cand","cane","cl","cr","cddrag"); g.removeAttribute("data-task"); g.removeAttribute("data-ev"); g.querySelector(".rsz")?.remove();
    g.style.width=r.width+"px"; document.body.appendChild(g); Object.assign(cd,{ghost:g,dx:cd.x0-r.left,dy:cd.y0-r.top}); }
  cdMove(cd.x0,cd.y0); try{navigator.vibrate?.(10);}catch(_){} }
function cdMove(x,y){ if(cd.ghost) cd.ghost.style.transform=`translate(${x-cd.dx}px,${y-cd.dy}px) rotate(2deg)`; cd.over=cdDay(x,y); const r=cdRange(cd); cdHi(r?.s,r?.e); }
function cdEnd(drop){ const c=cd; cd=null; if(!c) return; clearTimeout(c.timer); if(!c.on) return;
  cdSkip=true; setTimeout(()=>{cdSkip=false;},400);
  const r=drop?cdRange(c):null; c.ghost?.remove(); c.el.classList.remove("cddrag"); document.body.classList.remove("cdragging","cdresize"); cdHi(null);
  if(r) (c.ev?cdSaveEvent:cdSaveTask)(c.id,r); }
function cdSaveTask(id,r){ const t=tasks.find(x=>x.id===id); if(!t) return; const multi=r.s<r.e, was={start:t.start,due:t.due};
  if(r.e===t.due&&(multi?(spans(t)&&r.s===t.start):!spans(t))) return;
  const upd={due:r.e,updatedBy:me.name,updatedAt:serverTimestamp()}; if(multi) upd.start=r.s; else if(t.start) upd.start=deleteField();
  if(typeof t.order!=="number") upd.order=Date.parse(r.e)/86400000;
  const before=spans(t)?rng(t.start,t.due):(fmt(t.due)||"none"), label=multi?rng(r.s,r.e):fmt(r.e);
  t.due=r.e; if(multi) t.start=r.s; else delete t.start; render(); $("cal").querySelectorAll(`[data-task="${CSS.escape(id)}"]`).forEach(x=>x.classList.add("cdmoved"));
  updateDoc(doc(db,"tasks",id),upd).then(()=>{ logIt({id,title:t.title},"edit",`dates ${before} → ${label}`); toast(`Moved to ${label}.`); })
    .catch(e=>{ t.due=was.due; if(was.start) t.start=was.start; else delete t.start; render(); fail(e); }); }
function cdSaveEvent(id,r){ const e=events.find(x=>x.id===id); if(!e||(r.s===e.start&&r.e===e.end)) return; const was={start:e.start,end:e.end};
  e.start=r.s; e.end=r.e; renderCal(); $("cal").querySelectorAll(`[data-ev="${CSS.escape(id)}"]`).forEach(x=>x.classList.add("cdmoved"));
  updateDoc(doc(db,"events",id),{start:r.s,end:r.e,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>toast(`${e.title}: ${rng(r.s,r.e)}.`)).catch(err=>{ Object.assign(e,was); renderCal(); fail(err); }); }
$("cal").addEventListener("pointerdown",e=>{ if(e.button>0||cd) return; const el=e.target.closest(".chip2.cand,.evb.cane"); if(!el) return;
  const ev=!!el.dataset.ev, id=ev?el.dataset.ev:el.dataset.task, it=ev?events.find(x=>x.id===id):tasks.find(x=>x.id===id);
  if(!it||(ev?!isAdmin():!canEdit(it))) return; const grab=cdDay(e.clientX,e.clientY)?.dataset.date; if(!grab) return;
  cd={id,ev,el,grab,mode:e.target.closest(".rsz")?"resize":"move",x0:e.clientX,y0:e.clientY,pid:e.pointerId,touch:e.pointerType!=="mouse",on:false};
  if(cd.touch) cd.timer=setTimeout(()=>{ if(cd&&!cd.on) cdBegin(); },350); });
document.addEventListener("pointermove",e=>{ if(!cd||e.pointerId!==cd.pid) return; const far=Math.hypot(e.clientX-cd.x0,e.clientY-cd.y0);
  if(!cd.on){ if(cd.touch){ if(far>8){ clearTimeout(cd.timer); cd=null; } return; } if(far<5) return; cdBegin(); }
  cdMove(e.clientX,e.clientY); });
document.addEventListener("pointerup",e=>{ if(cd&&e.pointerId===cd.pid) cdEnd(true); });
document.addEventListener("pointercancel",e=>{ if(cd&&e.pointerId===cd.pid) cdEnd(false); });
document.addEventListener("touchmove",e=>{ if(cd?.on) e.preventDefault(); },{passive:false});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&cd?.on) cdEnd(false); });
document.addEventListener("click",e=>{ if(cdSkip){ cdSkip=false; e.stopPropagation(); e.preventDefault(); } },true);
$("cal").addEventListener("click",e=>{ if(!can("add")||e.target.closest("button,[data-ev]")) return; const d=e.target.closest(".day[data-date]"); if(d) openNewOn(d.dataset.date); });
function openNewOn(date){ openNew(date); }

// ---------- calendar events (bands such as exam weeks or holidays; admins add and edit, everyone sees them) ----------
const EVC={blue:"#1c7ed6",green:"#2b8a3e",gold:"#e8a817",red:"#c8302d",purple:"#7048e8",grey:"#868e96"};
let evEdit=null;
$("evcs").innerHTML=Object.entries(EVC).map(([k,c])=>`<label class="evc" title="${k}"><input type="radio" name="evc" value="${k}" aria-label="${k}"><span style="--ec:${c}"></span></label>`).join("");
function openEvent(id){ if(!isAdmin()) return; const e=id?events.find(x=>x.id===id):null, td=iso(new Date()); evEdit=e?.id||null;
  $("evt").textContent=e?"Edit event":"New event"; $("evn").value=e?.title||""; $("evs").value=e?.start||td; $("eve").value=e?.end||td; $("evno").value=e?.note||"";
  const c=e?.color||"blue"; document.querySelectorAll("#evcs input").forEach(i=>{ i.checked=i.value===c; });
  const del=$("evdel"); del.hidden=!e; delete del.dataset.armed; del.textContent="Delete";
  try{$("evd").showModal();}catch(_){ $("evd").setAttribute("open",""); } setTimeout(()=>$("evn").focus(),50); }
const closeEv=()=>{ try{$("evd").close();}catch(_){ $("evd").removeAttribute("open"); } };
$("evx").onclick=closeEv; $("evc").onclick=closeEv; $("cadd").onclick=()=>openEvent(null);
$("evs").addEventListener("change",()=>{ if($("eve").value<$("evs").value) $("eve").value=$("evs").value; });
$("evf").addEventListener("submit",e=>{ e.preventDefault(); const title=$("evn").value.trim(), start=$("evs").value, end=$("eve").value; if(!title||!start||!end) return;
  if(end<start){ toast("The end date must be on or after the start date."); return; }
  const data={title,start,end,color:document.querySelector("#evcs input:checked")?.value||"blue",note:$("evno").value.trim(),updatedBy:me.name,updatedAt:serverTimestamp()}, editing=evEdit;
  (editing?updateDoc(doc(db,"events",editing),data):addDoc(collection(db,"events"),data)).then(()=>{ closeEv(); toast(editing?"Event saved.":"Event added."); }).catch(fail); });
$("evdel").onclick=()=>{ const b=$("evdel"); if(!evEdit) return;
  if(b.dataset.armed){ deleteDoc(doc(db,"events",evEdit)).then(()=>{ closeEv(); toast("Event deleted."); }).catch(fail); }
  else { b.dataset.armed=1; b.textContent="Delete?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Delete"; } },3000); } };
document.addEventListener("click",e=>{ const b=e.target.closest("[data-ev]"); if(!b) return; const ev=events.find(x=>x.id===b.dataset.ev); if(!ev) return;
  if(isAdmin()) openEvent(ev.id); else toast(`${ev.title} · ${rng(ev.start,ev.end)}${ev.note?" · "+ev.note:""}`); });
let curTask=null;
function openTask(id){ const t=tasks.find(x=>x.id===id); if(!t) return; curTask=id;
  $("tdt").textContent=t.title; $("tdm").textContent=`${spans(t)?rng(t.start,t.due):"Due "+fmt(t.due)} · ${t.owner} · ${PH[t.phase]?.[0]||""}`;
  $("tdn").textContent=t.note||""; $("tdn").hidden=!t.note;
  $("tds").innerHTML=Object.entries(ST).map(([v,l])=>`<option value="${v}"${v===t.status?" selected":""}>${l}</option>`).join("");
  $("tds").className="st "+t.status; $("tds").disabled=!canTask(t);
  $("tde").hidden=!canEdit(t); $("tdg").hidden=!t.due; $("tdg").disabled=false; $("tdg").classList.remove("done"); $("tdg").lastChild.textContent="Add to Google Calendar";
  renderHist(id); renderSteps(t); renderLinks(t); renderComments(id); $("tcmi").value=""; $("mpop").hidden=true;
  $("tdb").textContent=t.updatedBy?`Updated by ${t.updatedBy}`:(canTask(t)?"":"You can view this task but not change it.");
  try{$("td").showModal();}catch(e){$("td").setAttribute("open","");} }
$("tds").addEventListener("change",e=>{ if(curTask){ setStatus(curTask,e.target.value); $("tds").className="st "+e.target.value; } });
$("tdx").onclick=()=>closeTd();
// ---------- task details as a bottom sheet on phones (drag the top bar down, tap above, ✕ or Esc to close) ----------
const sheetMQ=matchMedia("(max-width:760px)");
function closeTd(){ const d=$("td"); if(!d.open) return;
  const done=()=>{ d.classList.remove("closing"); d.style.transition=d.style.transform=""; try{d.closeNow();}catch(e){d.removeAttribute("open");} };
  if(!sheetMQ.matches||!motion()){ d.close(); return; }
  d.classList.add("closing"); d.style.transition="transform .22s ease-in"; d.style.transform="translateY(100%)"; setTimeout(done,220); }
let shY=null, shDy=0;
$("td").addEventListener("pointerdown",e=>{ const d=$("td"); if(!sheetMQ.matches||d.scrollTop>0||!e.target.closest(".grab,.dh")||e.target.closest("button")) return;
  shY=e.clientY; shDy=0; d.style.transition="none"; try{d.setPointerCapture(e.pointerId);}catch(_){} });
$("td").addEventListener("pointermove",e=>{ if(shY==null) return; shDy=Math.max(0,e.clientY-shY); $("td").style.transform=shDy?`translateY(${shDy}px)`:""; });
const shEnd=()=>{ if(shY==null) return; const d=$("td"); shY=null; if(shDy>90) closeTd(); else { d.style.transition="transform .2s ease-out"; d.style.transform=""; } };
$("td").addEventListener("pointerup",shEnd); $("td").addEventListener("pointercancel",shEnd);
$("td").addEventListener("cancel",e=>{ if(sheetMQ.matches&&motion()){ e.preventDefault(); closeTd(); } });
$("td").addEventListener("click",e=>{ if(sheetMQ.matches&&e.target===$("td")&&e.clientY<$("td").getBoundingClientRect().top) closeTd(); });
document.addEventListener("click",e=>{ if(e.target.closest(".inl-t,.inl-row")) return; const c=e.target.closest("[data-task]"); if(c){ if(inlTarget(e.target)){ clearTimeout(openT); const id=c.dataset.task; openT=setTimeout(()=>openTask(id),230); return; } openTask(c.dataset.task); return; } const mo=e.target.closest("[data-day]"); if(mo){ const ts=tasks.filter(t=>t.due===mo.dataset.day&&!spans(t)&&(!f.own||toks(t.owner).includes(f.own))); mo.outerHTML=ts.slice(3).map(t=>chip(t)).join(""); } });


// ---------- edit + drag ----------
let editId=null, ed=null; // ed = the open edit form's draft: { id, from, stamp, steps:[{t,d,o}], links:[{u,l,o}] } (o = index in the saved task, null = new)
const edStamp = t => t?.updatedAt?.toMillis ? t.updatedAt.toMillis() : 0;
// openEdit(null, from, {due}) opens the same box as a new task ("Add task"); on phones it then runs in 2 steps.
function openEdit(id, from, preset){ const isNew=id==null; const t=isNew?null:tasks.find(x=>x.id===id); if(isNew?!can("add"):(!t||!canEdit(t))) return; editId=id;
  const own=me?.dept&&me.role==="head"?me.dept:"PVP";
  ed = isNew ? { id:null, isNew:true, from:from||"", stamp:0, steps:[], links:[], blank:{title:"",due:preset?.due||"",start:"",owner:own,note:"",checks:[],links:[]} }
             : { id, from: from||"", stamp: edStamp(t), steps:(t.checks||[]).map((c,o)=>({t:c.t,d:!!c.d,o})), links:(t.links||[]).map((l,o)=>({u:l.u,l:l.l||"",o})) };
  const src=isNew?ed.blank:t;
  $("et").value=src.title||""; $("estart").value=!isNew&&spans(t)?t.start:""; $("edue").value=src.due||""; setPick("eown",src.owner||""); $("enote").value=src.note||"";
  $("esi").value=""; $("elu").value=""; $("eln").value=""; $("ebar").hidden=true;
  $("edt").textContent=isNew?"New task":"Edit task"; $("ed").classList.toggle("new",isNew); $("edel").hidden=isNew||!can("del");
  $("enote2").textContent=isNew?"Nothing is added until you press Add task.":"Changes are only sent when you press Save.";
  edStep(1); renderEdSteps(); renderEdLinks(); edUpdate();
  try{ $("td").close(); }catch(e){}
  try{$("ed").showModal();}catch(e){$("ed").setAttribute("open","");} setTimeout(()=>$("et").focus(),50); }
function closeE(){ const back=ed&&ed.from==="td"?ed.id:null; ed=null; try{$("ed").close();}catch(e){$("ed").removeAttribute("open");} if(back) openTask(back); }
const edT = () => ed && (ed.isNew ? ed.blank : tasks.find(x=>x.id===ed.id));
function edVals(){ const due=$("edue").value, owner=$("eown").value.trim()||"PVP", t=edT(); return { title:$("et").value.trim(), start:$("estart").value, due, phase:phaseFor(due,owner,t?.phase), owner, note:$("enote").value.trim() }; }
// Phones: a new task is filled in 2 steps (basics, then details). Computers show everything at once.
const edPhone=()=>matchMedia("(max-width:760px)").matches;
function edStep(n){ if(!ed) return; ed.step=n; const d=$("ed"); d.classList.toggle("s1",n===1); d.classList.toggle("s2",n===2);
  $("esind").textContent=n===1?"Step 1 of 2 · Basics":"Step 2 of 2 · Details (optional)"; d.scrollTop=0; }
function edNext(){ const er=edErrors(), v=edVals(); if(!v.title||!v.due||er.date){ edUpdate(true); (!v.title?$("et"):$("edue")).focus(); return; } edStep(2); setTimeout(()=>$("enote").focus(),50); }
$("enext").onclick=edNext; $("eback").onclick=()=>{ edStep(1); setTimeout(()=>$("et").focus(),50); };
// Everything that differs from the saved task, as short phrases (also used for the activity log).
function edChanges(){ const t=edT(); if(!t) return []; const v=edVals(), c=[], os=ed.isNew?"":(spans(t)?t.start:""), ns=v.start&&v.due&&v.start<v.due?v.start:"";
  if(v.title!==(t.title||"")) c.push("renamed");
  if(v.due!==(t.due||"")) c.push(`due ${fmt(t.due)||"none"} → ${fmt(v.due)||"none"}`);
  if(ns!==os) c.push(ns?`start ${fmt(ns)}`:"start date removed");
  if(!ed.isNew&&v.phase!==t.phase) c.push(`phase → ${PH[v.phase][0]}`);
  if(v.owner!==(t.owner||"")) c.push(`owner ${t.owner} → ${v.owner}`);
  if(v.note!==(t.note||"")) c.push("note updated");
  const n=(k,w)=>k+" "+w+(k===1?"":"s"), S=ed.steps, oc=(t.checks||[]);
  const sAdd=S.filter(s=>s.o==null).length, sRm=oc.length-S.filter(s=>s.o!=null).length, sRen=S.filter(s=>s.o!=null&&s.t.trim()!==oc[s.o].t).length, sTick=S.filter(s=>s.o!=null&&s.d!==!!oc[s.o].d).length;
  const kept=S.filter(s=>s.o!=null).map(s=>s.o), sMoved=kept.some((o,i)=>i&&o<kept[i-1]);
  if(sAdd) c.push(n(sAdd,"step")+" added"); if(sRm) c.push(n(sRm,"step")+" removed"); if(sRen) c.push(n(sRen,"step")+" renamed"); if(sTick) c.push(n(sTick,"step")+" ticked/unticked"); if(sMoved) c.push("steps reordered");
  const L=ed.links, ol=(t.links||[]);
  const lAdd=L.filter(l=>l.o==null).length, lRm=ol.length-L.filter(l=>l.o!=null).length, lCh=L.filter(l=>l.o!=null&&(l.u.trim()!==ol[l.o].u||l.l.trim()!==(ol[l.o].l||""))).length;
  if(lAdd) c.push(n(lAdd,"link")+" added"); if(lRm) c.push(n(lRm,"link")+" removed"); if(lCh) c.push(n(lCh,"link")+" changed");
  return c; }
function edErrors(show){ const v=edVals(), e={};
  if(!v.title && (!ed.isNew||show)) e.title="The task needs a name.";
  if(ed.isNew && show && !v.due) e.date="Pick a due date.";
  if(v.start&&v.due&&v.start>v.due) e.date="The start date must be on or before the due date.";
  if(v.start&&!v.due) e.date="Add a due date too, or clear the start date.";
  const bad=ed.links.find(l=>!/^https?:\/\/\S+$/i.test(l.u.trim())); if(bad) e.links="Every link must start with https:// (fix or remove the highlighted one).";
  if(ed.steps.some(s=>!s.t.trim())) e.steps="A step can't be empty (type something or remove it).";
  return e; }
// Refresh the Save button ("Save (3)"), inline errors and the error highlights.
function edUpdate(show){ if(!ed) return; const ch=edChanges(), er=edErrors(show), b=$("eds"), v=edVals();
  $("ephv").textContent=v.due?PH[v.phase][0]:"—"; $("ephs").textContent=v.due?"follows the due date":"set a due date";
  [["etitleerr",er.title],["edateerr",er.date],["esterr",er.steps],["elerr",er.links]].forEach(([id,m])=>{ const p=$(id); p.hidden=!m; p.textContent=m||""; });
  $("ell").querySelectorAll("li").forEach((li,i)=>li.classList.toggle("bad",!/^https?:\/\/\S+$/i.test((ed.links[i]?.u||"").trim())));
  $("esl").querySelectorAll("li").forEach((li,i)=>li.classList.toggle("bad",!(ed.steps[i]?.t||"").trim()));
  if(ed.isNew){ const ready=v.title&&v.due&&!Object.keys(edErrors(true)).length; b.disabled=!ready; b.textContent="Add task"; b.title=ready?"":"Needs a name and a due date"; $("enext").disabled=false; }
  else { b.disabled=!ch.length||Object.keys(er).length>0; b.textContent=ch.length?`Save (${ch.length})`:"Save"; b.title=ch.length?ch.join(" · "):"Nothing changed yet"; }
  $("esc").textContent=ed.steps.length?`${ed.steps.filter(s=>s.d).length} of ${ed.steps.length} done`:"";
  if(!$("ebar").hidden && $("ebar").dataset.kind==="discard" && !ch.length) $("ebar").hidden=true; }
function renderEdSteps(){ $("esl").innerHTML=ed.steps.map((s,i)=>`<li data-i="${i}"><span class="egrip" title="Drag to reorder" aria-hidden="true">⋮⋮</span><input type="checkbox" class="eck"${s.d?" checked":""} aria-label="Done"><input class="etx" value="${esc(s.t)}" maxlength="140" aria-label="Step ${i+1}"><button type="button" class="mini erm" aria-label="Remove step">×</button></li>`).join("")||'<li class="eempty">No steps yet. Add one below.</li>'; }
function renderEdLinks(){ $("ell").innerHTML=ed.links.map((l,i)=>{ const [c,k]=linkKind(l.u); return `<li data-i="${i}"><span class="lic" style="background:${c}">${k}</span><input class="eln2" value="${esc(l.l)}" maxlength="60" placeholder="Name (optional)" aria-label="Link name"><input class="elu2" type="url" value="${esc(l.u)}" maxlength="500" aria-label="Link address"><button type="button" class="mini erm" aria-label="Remove link">×</button></li>`; }).join("")||'<li class="eempty">No links yet. Add one below.</li>'; }
function edAddStep(){ const v=$("esi").value.trim(); if(!v) { $("esi").focus(); return; } if(ed.steps.length>=40){ toast("Up to 40 steps per task."); return; }
  ed.steps.push({t:v.slice(0,140),d:false,o:null}); $("esi").value=""; renderEdSteps(); edUpdate(); $("esl").lastElementChild?.classList.add("enew"); $("esi").focus(); }
function edAddLink(){ const u=$("elu").value.trim(), l=$("eln").value.trim().slice(0,60); if(!u){ $("elu").focus(); return; }
  if(!/^https?:\/\/\S+$/i.test(u)){ $("elerr").hidden=false; $("elerr").textContent="Links must start with https://"; $("elu").focus(); return; }
  if(ed.links.length>=20){ toast("Up to 20 links per task."); return; }
  ed.links.push({u:u.slice(0,500),l,o:null}); $("elu").value=""; $("eln").value=""; renderEdLinks(); edUpdate(); $("ell").lastElementChild?.classList.add("enew"); $("elu").focus(); }
$("esa").onclick=edAddStep; $("ela").onclick=edAddLink;
$("esi").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); edAddStep(); } });
["elu","eln"].forEach(id=>$(id).addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); edAddLink(); } }));
$("esl").addEventListener("input",e=>{ const li=e.target.closest("li[data-i]"); if(!li) return; const s=ed.steps[+li.dataset.i]; if(e.target.classList.contains("etx")) s.t=e.target.value; edUpdate(); });
$("esl").addEventListener("change",e=>{ const li=e.target.closest("li[data-i]"); if(!li||!e.target.classList.contains("eck")) return; ed.steps[+li.dataset.i].d=e.target.checked; edUpdate(); });
$("ell").addEventListener("input",e=>{ const li=e.target.closest("li[data-i]"); if(!li) return; const l=ed.links[+li.dataset.i];
  if(e.target.classList.contains("eln2")) l.l=e.target.value; if(e.target.classList.contains("elu2")){ l.u=e.target.value; const [c,k]=linkKind(l.u.trim()), ic=li.querySelector(".lic"); ic.style.background=c; ic.textContent=k; } edUpdate(); });
[$("esl"),$("ell")].forEach(ul=>ul.addEventListener("click",e=>{ const b=e.target.closest(".erm"); if(!b) return; const i=+b.closest("li").dataset.i;
  if(ul.id==="esl"){ ed.steps.splice(i,1); renderEdSteps(); } else { ed.links.splice(i,1); renderEdLinks(); } edUpdate(); }));
// Drag a step by its ⋮⋮ handle to reorder (mouse or touch).
$("esl").addEventListener("pointerdown",e=>{ const g=e.target.closest(".egrip"); if(!g) return; e.preventDefault(); const li=g.closest("li"); li.classList.add("edrag"); try{g.setPointerCapture(e.pointerId);}catch(_){}
  const move=ev=>{ const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest("#esl li[data-i]"); if(!over||over===li) return; const r=over.getBoundingClientRect(); if(ev.clientY<r.top+r.height/2) over.before(li); else over.after(li); };
  const up=()=>{ g.removeEventListener("pointermove",move); g.removeEventListener("pointerup",up); g.removeEventListener("pointercancel",up); li.classList.remove("edrag");
    ed.steps=[...$("esl").querySelectorAll("li[data-i]")].map(x=>ed.steps[+x.dataset.i]); renderEdSteps(); edUpdate(); };
  g.addEventListener("pointermove",move); g.addEventListener("pointerup",up); g.addEventListener("pointercancel",up); });
// Fields: re-check after any edit (the owner picker updates its hidden input in its own handler, so wait a tick).
$("edf").addEventListener("input",()=>setTimeout(edUpdate,0)); $("edf").addEventListener("change",()=>setTimeout(edUpdate,0));
// Leaving with unsaved changes asks first.
function edBar(kind, who){ const b=$("ebar"); b.dataset.kind=kind; b.hidden=false;
  b.innerHTML = kind==="delete"
    ? `<span>Delete this task for everyone? This can't be undone.</span><div><button type="button" class="ghost sm" data-eb="keep">Keep it</button><button type="button" class="pri sm danger" data-eb="delete">Delete</button></div>`
    : kind==="discard"
    ? `<span>${ed?.isNew?"Discard this new task?":"Discard your unsaved changes?"}</span><div><button type="button" class="ghost sm" data-eb="keep">Keep editing</button><button type="button" class="pri sm danger" data-eb="discard">Discard</button></div>`
    : `<span><b>${esc(who||"Someone")}</b> changed this task while you were editing. Save yours over it?</span><div><button type="button" class="ghost sm" data-eb="keep">Keep editing</button><button type="button" class="pri sm" data-eb="force">Save anyway</button></div>`;
  b.querySelector('[data-eb="keep"]').focus(); }
$("ebar").addEventListener("click",e=>{ const k=e.target.closest("[data-eb]")?.dataset.eb; if(!k) return; $("ebar").hidden=true;
  if(k==="discard") closeE(); else if(k==="force") edSave(true);
  else if(k==="delete"){ const t=edT(); if(!t||ed.isNew) return; ed.from=""; deleteDoc(doc(db,"tasks",t.id)).then(()=>{ logIt(t,"delete","Deleted the task"); toast("Task deleted."); }).catch(fail); closeE(); } });
$("edel").onclick=()=>edBar("delete");
function edLeave(){ const dirty=ed&&(ed.isNew?(edVals().title||edVals().note||$("estart").value||ed.steps.length||ed.links.length):edChanges().length); if(dirty) edBar("discard"); else closeE(); }
$("edx").onclick=edLeave; $("edc").onclick=edLeave;
$("ed").addEventListener("cancel",e=>{ e.preventDefault(); if(!$("ebar").hidden) { $("ebar").hidden=true; return; } edLeave(); });
$("ed").addEventListener("click",e=>{ if(e.target===$("ed")){ const r=$("ed").getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) edLeave(); } });
// Save: one update with every changed field, one activity-log line.
function edSave(force){ if(ed?.isNew){ edCreate(); return; } const t=edT(); if(!t){ toast("This task was deleted while you were editing."); ed=null; closeE(); return; }
  const ch=edChanges(); if(!ch.length||Object.keys(edErrors()).length) return;
  if(!force && edStamp(t)!==ed.stamp && t.updatedBy!==me.name) { edBar("conflict", t.updatedBy); return; }
  const v=edVals(), os=spans(t)?t.start:"", ns=v.start&&v.due&&v.start<v.due?v.start:"", upd={updatedBy:me.name,updatedAt:serverTimestamp()};
  if(v.title!==(t.title||"")) upd.title=v.title;
  if(v.due!==(t.due||"")) { upd.due=v.due; if(typeof t.order!=="number") upd.order=v.due?Date.parse(v.due)/86400000:99999; }
  if(ns!==os) upd.start=ns||deleteField();
  if(v.owner!==(t.owner||"")) { upd.owner=v.owner; upd.depts=toks(v.owner); }
  if(v.note!==(t.note||"")) upd.note=v.note;
  if(v.phase!==t.phase) upd.phase=v.phase;
  const checks=ed.steps.map(s=>({t:s.t.trim().slice(0,140),d:!!s.d})); if(JSON.stringify(checks)!==JSON.stringify((t.checks||[]).map(c=>({t:c.t,d:!!c.d})))) upd.checks=checks;
  const links=ed.links.map(l=>({u:l.u.trim().slice(0,500),l:l.l.trim().slice(0,60)})); if(JSON.stringify(links)!==JSON.stringify((t.links||[]).map(l=>({u:l.u,l:l.l||""})))) upd.links=links;
  const title=v.title, id=t.id;
  updateDoc(doc(db,"tasks",id),upd).then(()=>{ logIt({id,title},"edit",ch.join(", ").slice(0,290)); toast("Saved."); }).catch(fail);
  closeE(); }
function edCreate(){ const v=edVals(); if(edPhone()&&ed.step===1){ edNext(); return; }
  if(!v.title||!v.due||Object.keys(edErrors(true)).length){ edUpdate(true); return; }
  const checks=ed.steps.map(s=>({t:s.t.trim().slice(0,140),d:!!s.d})), links=ed.links.map(l=>({u:l.u.trim().slice(0,500),l:l.l.trim().slice(0,60)}));
  addTask(v.title,v.due,v.owner,v.phase,v.start,{note:v.note,...(checks.length?{checks}:{}),...(links.length?{links}:{})}).catch(fail);
  ed=null; closeE(); }
$("edf").addEventListener("submit",e=>{ e.preventDefault(); edSave(false); });
$("tde").onclick=()=>{ if(curTask) openEdit(curTask,"td"); };

// ---------- permissions matrix ----------
function renderPerms(){ if(!$("pm")||!isAdmin()) return;
  $("pm").tBodies[0].innerHTML=PERMS.map(([k,l])=>`<tr><td>${esc(l)}</td><td class="pc2">Always</td>${["head","viewer"].map(r=>`<td class="pc2"><label class="sw"><input type="checkbox" data-perm="${r}.${k}"${perms[r]?.[k]?" checked":""} aria-label="${esc(l)} for ${ROLE_LABEL[r]}s"><span></span></label></td>`).join("")}</tr>`).join(""); }
document.addEventListener("change", e=>{ const p=e.target.dataset?.perm; if(!p) return; const [r,k]=p.split("."); setDoc(doc(db,"settings","permissions"),{[r]:{[k]:e.target.checked}},{merge:true}).then(()=>toast("Access updated.")).catch(fail); });


// ---------- access requests ----------
$("rqf").addEventListener("submit", e=>{ e.preventDefault(); const u=auth.currentUser; if(!u) return; const email=(u.email||"").toLowerCase();
  const name=$("rqn").value.trim(); if(!name) return;
  setDoc(doc(db,"requests",email),{name,dept:$("rqd").value,note:$("rqnote").value.trim(),createdAt:serverTimestamp()}).catch(e=>{ console.error(e); toast("Couldn't send the request. Try again."); }); });
function renderRequests(){ if(!$("rq")) return; $("rqbox").hidden=!requests.length; $("rqcnt").textContent=requests.length||"";
  if(isAdmin()){ $("umrq").hidden=!requests.length; $("umrq").textContent=requests.length; $("udot").hidden=!requests.length; }
  $("rq").tBodies[0].innerHTML=requests.map(r=>`<tr><td><b>${esc(r.name)}</b><br>${esc(r.email)}</td><td>${esc(r.note||"")}</td><td><select id="rql-${esc(r.email)}" aria-label="Level"><option value="viewer" selected>Member</option><option value="head">Head</option><option value="admin">Admin</option></select></td><td><select id="rqd-${esc(r.email)}" aria-label="Department">${deptOpts(r.dept||"")}</select></td><td style="white-space:nowrap"><button type="button" class="pri sm" data-approve="${esc(r.email)}">Approve</button> <button type="button" class="ghost sm" data-reject="${esc(r.email)}">Reject</button></td></tr>`).join(""); }
document.addEventListener("click", e=>{ const a=e.target.closest("[data-approve],[data-reject]"); if(!a) return;
  const email=a.dataset.approve||a.dataset.reject; const r=requests.find(x=>x.email===email);
  if(a.dataset.reject){ deleteDoc(doc(db,"requests",email)).then(()=>toast("Request rejected.")).catch(fail); return; }
  const b=writeBatch(db); b.set(doc(db,"members",email),{role:document.getElementById("rql-"+email).value,dept:document.getElementById("rqd-"+email).value,name:r?.name||""}); b.set(doc(db,"people",email),{name:r?.name||email.split("@")[0],dept:document.getElementById("rqd-"+email).value},{merge:true}); b.delete(doc(db,"requests",email));
  b.commit().then(()=>toast((r?.name||email)+" approved.")).catch(fail); });

// ---------- calendar export ----------
const ymd = d => d.replace(/-/g,"");
const nextDay = d => { const x=new Date(d+"T00:00"); x.setDate(x.getDate()+1); return iso(x).replace(/-/g,""); };
function gcalUrl(t){ const p=new URLSearchParams({action:"TEMPLATE",text:"[TUBC] "+t.title,dates:ymd(spans(t)?t.start:t.due)+"/"+nextDay(t.due),details:[t.note,"Owner: "+t.owner,"Topic: "+(PH[t.phase]?.[0]||""),"Tracker: "+location.origin+location.pathname].filter(Boolean).join("\n")}); return "https://calendar.google.com/calendar/render?"+p.toString(); }
const icsEsc = s => String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
$("cics").onclick=()=>{ const T=gTasks(); const gd=$("gdept").value;
  if(!T.length){ toast("No tasks with dates to export."); return; }
  const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//TUBC 2027//Tracker//EN","CALSCALE:GREGORIAN","X-WR-CALNAME:TUBC 2027"+(gd?" · "+gd:"")];
  T.forEach(t=>lines.push("BEGIN:VEVENT","UID:"+t.id+"@tubc-2027","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+ymd(spans(t)?t.start:t.due),"DTEND;VALUE=DATE:"+nextDay(t.due),"SUMMARY:"+icsEsc("[TUBC] "+t.title),"DESCRIPTION:"+icsEsc([t.note,"Owner: "+t.owner,"Status: "+ST[t.status]].filter(Boolean).join("\n")),"END:VEVENT"));
  lines.push("END:VCALENDAR");
  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="tubc-2027"+(gd?"-"+gd.toLowerCase().replace(/\W+/g,"-"):"")+".ics"; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); };


// ---------- Google Calendar (direct, via Calendar API) ----------
let gTok=null, gTokExp=0;
async function gcalToken(){
  if(gTok && Date.now()<gTokExp) return gTok;
  const pv=new GoogleAuthProvider(); pv.addScope("https://www.googleapis.com/auth/calendar.app.created");
  pv.setCustomParameters({login_hint:auth.currentUser.email});
  const r=await reauthenticateWithPopup(auth.currentUser,pv);
  const c=GoogleAuthProvider.credentialFromResult(r);
  if(!c?.accessToken) throw new Error("no-token");
  gTok=c.accessToken; gTokExp=Date.now()+50*60*1000; return gTok;
}
const evId = id => "tubc"+[...new TextEncoder().encode(id)].map(b=>b.toString(16).padStart(2,"0")).join("");
const nextIso = d => { const x=new Date(d+"T00:00"); x.setDate(x.getDate()+1); return iso(x); };
function evBody(t){ return { summary:"[TUBC] "+t.title, status:"confirmed",
  description:[t.note,"Owner: "+t.owner,"Topic: "+(PH[t.phase]?.[0]||""),"Tracker: "+location.origin+location.pathname].filter(Boolean).join("\n"),
  start:{date:spans(t)?t.start:t.due}, end:{date:nextIso(t.due)}, transparency:"transparent",
  source:{title:"TUBC 2027 Tracker", url:location.origin+location.pathname} }; }
async function gapi(tok,method,url,body){
  const r=await fetch("https://www.googleapis.com/calendar/v3"+url,{method,headers:{Authorization:"Bearer "+tok,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
  if(r.status===401) gTok=null;
  if(!r.ok){ const e=new Error("api-"+r.status); e.status=r.status; throw e; }
  return r.status===204?null:r.json();
}
// One Google calendar per department: "TUBC2027 - ER", so people can show/hide each one.
const CAL_PREFIX="TUBC2027 - ";
let calMap=null;
const LS_CALS="tubc-gcals:";
function cachedCals(){ try{ return JSON.parse(localStorage.getItem(LS_CALS+(auth.currentUser?.email||""))||"{}"); }catch(e){ return {}; } }
function saveCals(m){ try{ localStorage.setItem(LS_CALS+(auth.currentUser?.email||""),JSON.stringify(m)); }catch(e){} }
async function loadCals(tok){ if(calMap) return calMap; let m={};
  try{ let pt=""; do{ const j=await gapi(tok,"GET","/users/me/calendarList?maxResults=250"+(pt?"&pageToken="+encodeURIComponent(pt):""));
      (j.items||[]).forEach(c=>{ if((c.summary||"").startsWith(CAL_PREFIX)) m[c.summary]=c.id; }); pt=j.nextPageToken; } while(pt); saveCals(m); }
  catch(e){ if(e.status!==403) throw e; m=cachedCals(); }
  return calMap=m; }
const calColor = n => String(1+[...n].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%24);
async function calFor(tok,name){ const m=await loadCals(tok), full=CAL_PREFIX+name; if(m[full]) return m[full];
  const c=await gapi(tok,"POST","/calendars",{summary:full,description:"TUBC 2027 tasks for "+name+". Added from "+location.origin+location.pathname,timeZone:"Asia/Bangkok"});
  m[full]=c.id; saveCals(m); try{ await gapi(tok,"PATCH","/users/me/calendarList/"+encodeURIComponent(c.id),{colorId:calColor(name)}); }catch(e){}
  return c.id; }
// Which department calendars a task belongs in.
function calNames(t,chosen){ if(chosen) return [chosen];
  const o=(t.depts?.length?t.depts:toks(t.owner)).map(x=>x==="President"?"PVP":x==="All heads"?"All":x);
  const u=[...new Set(o)]; return u.length?u:["PVP"]; }
async function pushEvent(tok,t,chosen){
  for(const name of calNames(t,chosen)){
    const cal=encodeURIComponent(await calFor(tok,name)), id=evId(t.id), body={id,...evBody(t)};
    try{ await gapi(tok,"PUT",`/calendars/${cal}/events/${id}`,body); }
    catch(e){ if(e.status!==404) throw e; await gapi(tok,"POST",`/calendars/${cal}/events`,body); }
  }
}
function gcalFail(e){ console.error(e);
  const c=e?.code||"";
  if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request") return toast("Cancelled.");
  if(c==="auth/popup-blocked") return toast("Allow pop-ups for this site, then try again.");
  if(c==="auth/user-mismatch") return toast("Pick the same Google account you're signed in with.");
  if(e?.status===403) return toast("Google Calendar access wasn't granted. Click again and tick the calendar box.");
  toast("Couldn't add to Google Calendar. Try again."); }
$("tdg").onclick=async()=>{ const t=tasks.find(x=>x.id===curTask); if(!t?.due) return; const b=$("tdg");
  const L=b.lastChild; b.disabled=true; L.textContent="Adding…";
  try{ const tok=await gcalToken(); await pushEvent(tok,t); L.textContent="✓ In your Google Calendar"; b.classList.add("done"); toast("Added to "+calNames(t).map(n=>CAL_PREFIX+n).join(", ")+"."); }
  catch(e){ b.disabled=false; L.textContent="Add to Google Calendar"; gcalFail(e); } };
var EVERY=["All","All heads"];
function gTasks(){ const d=$("gdept").value, inc=$("gall").checked;
  return tasks.filter(t=>{ if(!t.due) return false; if(!d) return true; const o=t.depts?.length?t.depts:toks(t.owner);
    if(d==="PVP") return o.some(x=>x==="PVP"||x==="President")||(inc&&EVERY.includes(o[0])&&o.length===1); return o.includes(d)||(inc&&o.some(x=>EVERY.includes(x))); }); }
function gLabel(){ const n=gTasks().length, d=$("gdept").value; $("cglbl").textContent = n ? `Add ${n} ${d?d+" ":""}task${n>1?"s":""} to Google Calendar` : "No dated tasks for this department"; $("cgall").disabled=!n; }
let gdPicked=false;
function fillGDept(){ const sel=$("gdept"), cur=gdPicked?sel.value:(me?.dept||""); sel.innerHTML='<option value="">All departments</option><option value="PVP">PVP / President</option>'+Object.keys(SLOTS).map(d=>`<option${d===cur?" selected":""}>${esc(d)}</option>`).join(""); if(cur==="PVP") sel.value="PVP"; gLabel(); }
$("gdept").addEventListener("change",()=>{gdPicked=true;gLabel();}); $("gall").addEventListener("change",gLabel);
$("cgall").onclick=async()=>{ const T=gTasks(); if(!T.length) return;
  const b=$("cgall"), L=$("cglbl"); b.disabled=true;
  try{ const tok=await gcalToken(); let n=0;
    const gd=$("gdept").value||null; for(const t of T){ L.textContent=`Adding ${++n}/${T.length}…`; await pushEvent(tok,t,gd); }
    toast(`${T.length} task${T.length>1?"s":""} added to Google Calendar${$("gdept").value?" under "+CAL_PREFIX+$("gdept").value:""}.`); }
  catch(e){ gcalFail(e); }
  finally{ b.disabled=false; gLabel(); } };


// ---------- owner picker ----------
function pickRender(d){ const inp=$(d.dataset.for), cur=toks(inp.value); const known=OWNER_GROUPS.flatMap(g=>g[1]); const extra=cur.filter(x=>!known.includes(x));
  const box=(o)=>`<label><input type="checkbox" value="${esc(o)}"${cur.includes(o)?" checked":""}> ${esc(o)}</label>`;
  d.querySelector(".opop").innerHTML=OWNER_GROUPS.map(([n,l])=>`<div class="ohd">${n}</div>`+l.map(box).join("")).join("")+(extra.length?'<div class="ohd">Other</div>'+extra.map(box).join(""):"");
  d.querySelector("summary").textContent=cur.length?cur.join(", "):"Choose owner…"; }
function setPick(id,val){ $(id).value=val; pickRender(document.querySelector(`.opick[data-for="${id}"]`)); }
document.querySelectorAll(".opick").forEach(d=>{ pickRender(d);
  d.addEventListener("change",e=>{ if(e.target.type!=="checkbox") return; const v=[...d.querySelectorAll("input:checked")].map(x=>x.value); $(d.dataset.for).value=v.join(", "); d.querySelector("summary").textContent=v.length?v.join(", "):"Choose owner…"; }); });
document.addEventListener("click",e=>{ document.querySelectorAll(".opick[open]").forEach(d=>{ if(!d.contains(e.target)) d.open=false; }); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape") document.querySelectorAll(".opick[open]").forEach(d=>{ d.open=false; d.querySelector("summary").focus(); }); });


// ---------- activity log ----------
function logIt(t,action,detail){ if(!me||!t) return;
  addDoc(collection(db,"log"),{task:t.id||"",title:String(t.title||"").slice(0,200),action,detail:String(detail||"").slice(0,300),by:me.name,email:me.email,at:serverTimestamp()}).catch(e=>console.warn("log",e)); }
function rel(ts){ const d=ts?.toDate?ts.toDate():null; if(!d) return "just now"; const m=Math.round((Date.now()-d)/60000);
  if(m<1) return "just now"; if(m<60) return m+" min ago"; const hh=Math.round(m/60); if(hh<24) return hh+" h ago"; if(hh<48) return "yesterday";
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
const VERB={status:"updated",edit:"edited",move:"moved",add:"added",delete:"deleted"};
function renderFeed(){ if(!$("feed")) return; const L=logs.slice(0,10);
  $("feed").innerHTML=L.length?L.map(l=>`<li><b>${esc(l.by||"Someone")}</b> ${VERB[l.action]||"changed"} ${tasks.some(t=>t.id===l.task)?`<button type="button" class="ft" data-task="${esc(l.task)}">${esc(l.title)}</button>`:`<i>${esc(l.title)}</i>`}<br><span class="fd">${esc(l.detail||"")}</span><time>${rel(l.at)}</time></li>`).join(""):'<li class="fd">No changes yet. Edits and status updates will show up here.</li>'; }
function renderHist(id){ if(!$("tdh")) return; const L=logs.filter(l=>l.task===id).slice(0,8);
  $("tdh").innerHTML=L.length?'<h4>History</h4><ul>'+L.map(l=>`<li><b>${esc(l.by||"")}</b>: ${esc(l.detail||VERB[l.action]||"")}<time>${rel(l.at)}</time></li>`).join("")+"</ul>":""; }

// ---------- countdown ----------
function renderCd(){ const el=$("cdbar"); if(!el) return; if(!me){ el.hidden=true; return; }
  const td=iso(new Date()), d0=new Date(td+"T00:00");
  const item=k=>{ const n=Math.round((new Date(k.date+"T00:00")-d0)/864e5);
    const txt = n>1?`<b>${n}</b> days`: n===1?`<b>Tomorrow</b>`: n===0?`<b>Today</b>`:`Done ✓`;
    return `<div class="cdi${n<0?" past":""}${n>=0&&n<=14?" soon":""}"><em>${esc(k.name)}</em><span>${txt}</span><small>${fmt(k.date)}</small></div>`; };
  const vis=kdList().filter(k=>k.date&&canSee(k)).sort((a,b)=>a.date.localeCompare(b.date)), up=vis.filter(k=>k.date>=td);
  const show=(up.length?up:vis.slice(-2)).slice(0,4);
  el.hidden=!show.length; $("cdin").innerHTML=show.map(item).join(""); }

// ---------- tasks (one page: urgent first, then phase → month) ----------
// Scope: a department (default: your own) or "*" = everyone. Overdue and the next 7 days come first, then each phase
// with its later tasks grouped by month. A phase shows its first 3 tasks until someone taps "Show more".
let mdPicked=false, mScope="";
$("mdept").addEventListener("change",()=>{ mdPicked=true; mScope=$("mdept").value; renderMine(); });
$("mall").addEventListener("change",renderMine);
$("madd").onclick=()=>openNew();
const monKey=d=>d.slice(0,7), monLabel=k=>MON[+k.slice(5,7)-1]+" "+k.slice(0,4);
function renderMine(){ if(!$("mlist")||!me) return;
  const reveal=mReveal; mReveal=null;
  const sel=$("mdept"), cur=mdPicked?mScope:(me.dept||"*"), all=cur==="*";
  sel.innerHTML='<option value="*">Everyone</option>'+DEPTS.map(d=>`<option value="${esc(d)}"${d===cur?" selected":""}>${esc(d)}</option>`).join(""); sel.value=cur;
  $("mallw").hidden=all; $("madd").hidden=!can("add");
  const inc=$("mall").checked, shared=["All","All heads"];
  const T=all?tasks:tasks.filter(t=>{ const o=t.depts?.length?t.depts:toks(t.owner); return o.includes(cur)||(cur==="PVP"&&o.includes("President"))||(inc&&o.some(x=>shared.includes(x))); });
  const td=iso(new Date()), plus=n=>{ const x=new Date(); x.setDate(x.getDate()+n); return iso(x); }, w=plus(7);
  const byDue=(a,b)=>(a.due||"9999").localeCompare(b.due||"9999")||ordKey(a)-ordKey(b);
  const open=T.filter(t=>t.status!=="dn").sort(byDue), done=T.filter(t=>t.status==="dn");
  const over=open.filter(t=>t.due&&t.due<td), week=open.filter(t=>t.due&&t.due>=td&&t.due<=w), later=open.filter(t=>t.due>w), nod=open.filter(t=>!t.due);
  const label=all?"Everyone":cur;
  $("msum").textContent=`${label}: ${open.length} open${over.length?` · ${over.length} overdue`:""} · ${done.length} of ${T.length} done`;
  $("mbarf").dataset.k="mine-"+cur; $("mbarf").dataset.w=T.length?done.length/T.length*100:0; animBars($("mbarf").parentNode);
  // phase strip in the header: progress per phase for this view; tap to jump
  const p0=seeKickoff()?0:1, t0=Date.parse(PH[p0][2]), t1=Date.parse(PH[5][3]), now=Date.now();
  $("line").style.setProperty("--phn", PH.length-p0);
  $("line").innerHTML = PH.map((p,i)=>{ if(!phVis(i)) return ""; const ts=T.filter(t=>t.phase===i),d=ts.filter(t=>t.status==="dn").length; return `<button type="button" class="seg" data-go="${i}"><b>${p[0]}</b><span>${p[1]} · ${d}/${ts.length}</span><div class="bar"><i data-k="ph${i}-${esc(cur)}" data-w="${ts.length?d/ts.length*100:0}"></i></div></button>`; }).join("") + (now>=t0&&now<=t1?(x=>`<div class="now${x<6?" l":x>94?" r":""}" style="left:${x}%"></div>`)((now-t0)/(t1-t0)*100):"");
  animBars($("line"));
  const item=t=>`<li class="mi ${t.status}${jd(t.id)}" style="--dc:${tcol(t)}"><button type="button" class="mt" data-task="${t.id}"><span class="md">${t.due?when(t):"—"}${relDue(t)}</span><span class="mtt"${canEdit(t)?' title="Double-click to rename"':""}>${esc(t.title)}</span><span class="mo">${pills(t)}</span>${extras(t)}</button><select class="st ${t.status}" data-st="${t.id}" aria-label="Status"${canTask(t)?"":" disabled"}>${Object.entries(ST).map(([v,l])=>`<option value="${v}"${v===t.status?" selected":""}>${l}</option>`).join("")}</select></li>`;
  const MFOLD=3, more=(k,n,closed)=>`<li class="mmw"><button type="button" class="mmore" data-mmore="${k}" aria-expanded="${!closed}">${closed?`Show ${n-MFOLD} more`:"Show less"}</button></li>`;
  const flat=(k,l,a)=>a.length?`<section class="mg ${k}"><h2>${l} <span class="n">${a.length}</span></h2><ul>${a.map(item).join("")}</ul></section>`:"";
  const phases=PH.map((p,i)=>{ if(!phVis(i)) return ""; const a=later.filter(t=>t.phase===i); if(!a.length) return "";
    const k="p"+i, fold=a.length>MFOLD+1, closed=fold&&!mOpen.has(k), list=closed?a.slice(0,MFOLD):a;
    const ts=T.filter(t=>t.phase===i), d=ts.filter(t=>t.status==="dn").length;
    let html="", m=null; list.forEach(t=>{ const mk=monKey(t.due); if(mk!==m){ if(m) html+="</ul>"; html+=`<h3 class="mmon">${monLabel(mk)}</h3><ul>`; m=mk; } html+=item(t); }); if(m) html+="</ul>";
    if(fold) html+=`<ul>${more(k,a.length,closed)}</ul>`;
    return `<section class="mg mph ${k}" id="mph${i}"><h2>${p[0]} <small>${p[1]} · ${d} of ${ts.length} done</small> <span class="n">${a.length}</span></h2>${html}</section>`; }).join("");
  const empty = !T.length && isAdmin() && !tasks.length ? `<p class="mempty">No tasks yet.</p><button type="button" class="pri" id="seed2">Load the 46 starter tasks</button>`
    : '<p class="mempty">Nothing open here. 🎉</p>';
  $("mlist").innerHTML=(open.length? flat("over","Overdue",over)+flat("week","Due in the next 7 days",week)+phases+flat("nod","No date",nod) : empty)
    +(done.length?`<details class="mdone"><summary>Done (${done.length})</summary><ul style="list-style:none;padding:0;display:grid;gap:8px;margin-top:8px">${done.map(item).join("")}</ul></details>`:"");
  if($("seed2")) $("seed2").onclick=()=>$("seed").click();
  if(reveal&&motion()) $("mlist").querySelectorAll(`.mg.${reveal} li.mi`).forEach((li,i)=>{ if(i>=MFOLD){ li.classList.add("mrev"); li.style.animationDelay=Math.min(i-MFOLD,12)*35+"ms"; } });
  renderFeed(); }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-mmore]"); if(!b) return; const k=b.dataset.mmore;
  if(mOpen.has(k)){ mOpen.delete(k); renderMine(); $("mlist").querySelector(`.mg.${k}`)?.scrollIntoView({block:"nearest",behavior:motion()?"smooth":"auto"}); }
  else { mOpen.add(k); mReveal=k; renderMine(); } });

// ---------- structure ----------
// Members see a flat list (PVP -> every department); PVP and heads see who in the PVP owns what.
$("dgrid").innerHTML=Object.keys(SLOTS).sort((a,b)=>a.localeCompare(b)).map(d=>`<li><button type="button" class="dept" data-dept="${esc(d)}" style="--dc:${col(d)}">${esc(d)}<b>${SLOTS[d]} head${SLOTS[d]>1?"s":""}</b><span class="hn"></span></button></li>`).join("");
function applyStructView(){ const full=seeOverview(); $("tpvp").hidden=!full; $("tflat").hidden=full; $("stleg").hidden=!full;
  $("stsub").textContent = full ? "Who in the PVP looks after which department, and how many heads each has. Tap a department to add its heads or see its tasks." : "Every department and its heads. Tap a department to see who to contact and its tasks."; }
function renderHeads(){
  document.querySelectorAll(".tree .dept[data-dept]").forEach(b=>{
    const hs=(heads[b.dataset.dept]||[]).filter(x=>x.name), s=b.querySelector(".hn");
    s.textContent = hs.length ? hs.map(x=>x.name).join(", ") : "TBC"; s.classList.toggle("tbc",!hs.length);
  });
}
let cur=null;
function openDept(d){
  cur=d; const n=SLOTS[d]||1, hs=heads[d]||[], ed=canHeads(d);
  $("ddt").textContent=d; $("ddr").textContent=n+(n>1?" heads":" head")+(seeOverview()?" · under "+OWNERS[d]:"");
  $("ddh").innerHTML=Array.from({length:n},(_,i)=>`<div class="hr"><input id="hn${i}" placeholder="Head ${n>1?i+1:""} name" aria-label="Head ${i+1} name" value="${esc(hs[i]?.name)}"${ed?"":" readonly"}><input id="hl${i}" placeholder="Line ID or phone" aria-label="Head ${i+1} Line ID" value="${esc(hs[i]?.line)}"${ed?"":" readonly"}></div>`).join("");
  const ts=tasks.filter(t=>t.status!=="dn"&&toks(t.owner).includes(d)).sort((a,b)=>(a.due||"").localeCompare(b.due||""));
  $("ddtk").innerHTML = ts.length ? ts.slice(0,6).map(t=>`<div class="tk"><span>${fmt(t.due)}</span>${esc(t.title)}</div>`).join("")+(ts.length>6?`<div class="tk">+${ts.length-6} more</div>`:"") : `<p class="empty">No open tasks for ${esc(d)} yet.</p>`;
  $("ddgo").hidden=!ts.length; $("dds").hidden=!ed;
  try{$("dd").showModal();}catch(e){$("dd").setAttribute("open","");}
}
const closeD=()=>{ try{$("dd").close();}catch(e){$("dd").removeAttribute("open");} };
$("ddx").onclick=closeD;
$("ddf").addEventListener("submit", e=>{ e.preventDefault(); const n=SLOTS[cur]||1; const list=Array.from({length:n},(_,i)=>({name:$("hn"+i).value.trim(),line:$("hl"+i).value.trim()}));
  setDoc(doc(db,"heads",cur),{list,updatedBy:me.name}).then(closeD).catch(fail); });
$("ddgo").onclick=()=>{ f.own=cur; closeD(); location.hash="#tracker"; render(); };

// ---------- access ----------
const deptOpts = sel => '<option value="">No department</option>'+DEPTS.map(d=>`<option${d===sel?" selected":""}>${esc(d)}</option>`).join("");
$("md").innerHTML = deptOpts("");
function backfillPeople(){ if(!isAdmin()) return; members.forEach(mb=>{ const p=people[mb.email]; const name=(mb.name||"").trim()||mb.email.split("@")[0];
    if(!p) setDoc(doc(db,"people",mb.email),{name,dept:mb.dept||""}).catch(e=>console.warn("people",e));
    else if((p.dept||"")!==(mb.dept||"")) setDoc(doc(db,"people",mb.email),{dept:mb.dept||""},{merge:true}).catch(e=>console.warn("people",e)); }); }
function renderMembers(){ renderPerms(); backfillPeople();
  $("mt").tBodies[0].innerHTML = members.map(m=>{ const self=m.email===me.email; return `<tr><td>${m.name?`<b>${esc(m.name)}</b><br>`:""}${esc(m.email)}${self?" (you)":""}</td><td><select data-role="${esc(m.email)}" aria-label="Level"${self?" disabled":""}>${["viewer","head","admin"].map(r=>`<option value="${r}"${r===m.role?" selected":""}>${ROLE_LABEL[r]}</option>`).join("")}</select></td><td><select data-mdept="${esc(m.email)}" aria-label="Department">${deptOpts(m.dept||"")}</select></td><td>${self?"":`<button type="button" class="ghost sm" data-rm="${esc(m.email)}">Remove</button>`}</td></tr>`; }).join("");
}
$("mf").addEventListener("submit", e=>{ e.preventDefault(); const email=$("me1").value.trim().toLowerCase(); if(!email) return;
  setDoc(doc(db,"members",email),{role:$("mr").value,dept:$("md").value},{merge:true}).then(()=>{$("me1").value=""; toast(email+" added.");}).catch(fail); });


// ---------- task steps (checklist) ----------
const canSteps = t => canTask(t) || canEdit(t);
function renderSteps(t){ const ck=t.checks||[], n=ck.length, d=ck.filter(c=>c.d).length, ok=canSteps(t);
  $("tckc").textContent=n?`${d} of ${n} done`:""; $("tckb").parentNode.hidden=!n; $("tckb").style.width=(n?d/n*100:0)+"%";
  $("tckl").innerHTML=ck.map((c,i)=>`<li class="${c.d?"on":""}"><input type="checkbox" id="ck${i}" data-ck="${i}"${c.d?" checked":""}${ok?"":" disabled"}><label for="ck${i}">${esc(c.t)}</label></li>`).join("");
  $("tckf").hidden=true; $("tck").hidden=!n; } // adding, renaming and removing steps happens in Edit
function saveSteps(t,checks,what){ t.checks=checks; renderSteps(t); render();
  return updateDoc(doc(db,"tasks",t.id),{checks,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>{ if(what) logIt(t,"edit",what); }).catch(fail); }
$("tckl").addEventListener("change",e=>{ const i=e.target.dataset.ck; if(i==null) return; const t=tasks.find(x=>x.id===curTask); if(!t) return;
  const ck=(t.checks||[]).map((c,j)=>j==i?{...c,d:e.target.checked}:c); saveSteps(t,ck,(e.target.checked?"ticked: ":"unticked: ")+String(ck[i].t).slice(0,80)); });

// ---------- task links ----------
function linkKind(u){ try{ const h=new URL(u).hostname; if(/docs\.google/.test(h)) return ["#1a73e8","G"]; if(/drive\.google/.test(h)) return ["#188038","D"]; if(/canva/.test(h)) return ["#7d2ae8","C"]; if(/figma/.test(h)) return ["#a259ff","F"]; if(/notion/.test(h)) return ["#37352f","N"]; if(/airtable/.test(h)) return ["#f82b60","A"]; return ["#868e96","↗"]; }catch{ return ["#868e96","↗"]; } }
function renderLinks(t){ const L=t.links||[], ok=canEdit(t);
  $("tlkl").innerHTML=L.map((l,i)=>{ const [c,k]=linkKind(l.u); let host=""; try{ host=new URL(l.u).hostname.replace(/^www\./,""); }catch{}
    return `<li><a href="${esc(l.u)}" target="_blank" rel="noopener noreferrer"><span class="lic" style="background:${c}">${k}</span><b>${esc(l.l||host||l.u)}</b><span class="lh">${esc(host)}</span></a></li>`; }).join("");
  $("tlkf").hidden=true; $("tlk").hidden=!L.length; } // adding and removing links happens in Edit

// ---------- comments + @mentions ----------
const initials = s => String(s||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const pcol = email => col(people[email]?.dept||"");
function fmtComment(txt){ let h=esc(txt); const names=Object.values(people).map(p=>p.name).filter(Boolean).sort((a,b)=>b.length-a.length);
  names.forEach(n=>{ const e=esc("@"+n); h=h.split(e).join(`<span class="at">${e}</span>`); });
  DEPTS.forEach(d=>{ h=h.replace(new RegExp("(^|[^\\w@>])(@"+reEsc(esc(d))+")(?![\\w-])","gi"),(m,a,b)=>`${a}<span class="at atd" style="--dc:${col(d)}">${b}</span>`); }); return h.replace(/\n/g,"<br>"); }
function renderComments(id){ const L=comments.filter(c=>c.task===id).sort((a,b)=>(a.at?.seconds||9e12)-(b.at?.seconds||9e12));
  $("tcmc").textContent=L.length?String(L.length):"";
  $("tcml").innerHTML=L.map(c=>`<li><button type="button" class="av avb" data-person="${esc(c.email)}" aria-label="View ${esc(c.by)}'s profile" style="--dc:${pcol(c.email)}">${esc(initials(c.by))}</button><div class="cmb"><header><b>${esc(c.by)}</b><time>${rel(c.at)}</time>${c.email===me.email||isAdmin()?`<button type="button" class="cdel" data-cmrm="${c.id}">Delete</button>`:""}</header>${fmtComment(c.text)}</div></li>`).join("")||'<li style="display:block;color:var(--mute);font-size:14px">No comments yet.</li>';
  const box=$("tcml"); box.scrollTop=box.scrollHeight; }
let mq=null, mSel=0;
const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const hasTag = (text,name) => new RegExp("(^|[^\\w@])@"+reEsc(name)+"(?![\\w-])","i").test(text);
const deptCount = d => Object.values(people).filter(p=>p.name&&p.dept===d).length;
function deptMatches(q){ q=q.toLowerCase(); return DEPTS.filter(d=>!q||d.toLowerCase().split(/[\s-]+/).some(w=>w.startsWith(q))||d.toLowerCase().startsWith(q)).sort((a,b)=>(b.toLowerCase().startsWith(q))-(a.toLowerCase().startsWith(q))); }
function mentionList(q){ q=q.toLowerCase(); const words=p=>[p.name,p.nick,p.dept].filter(Boolean).map(x=>String(x).toLowerCase());
  const score=([e,p])=>{ if(!q) return 1; const w=words(p), parts=w.flatMap(x=>x.split(/\s+/)), loc=e.split("@")[0].toLowerCase();
    if(parts.some(x=>x.startsWith(q))) return 3; if(loc.startsWith(q)) return 2; if(w.some(x=>x.includes(q))||loc.includes(q)) return 1; return 0; };
  return Object.entries(people).filter(([e,p])=>p.name&&e!==me.email).map(x=>[x,score(x)]).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]||a[0][1].name.localeCompare(b[0][1].name)).slice(0,8).map(([x])=>x); }
function showMentions(){ const ta=$("tcmi"), pre=ta.value.slice(0,ta.selectionStart), m2=pre.match(/(^|\s)@([^\s@]{0,30})$/);
  if(!m2){ $("mpop").hidden=true; mq=null; return; } mq={start:pre.length-m2[2].length-1,q:m2[2]};
  const P=mentionList(m2[2]), D=deptMatches(m2[2]).slice(0,m2[2]?4:3);
  const items=m2[2]&&D.some(d=>d.toLowerCase().startsWith(m2[2].toLowerCase())) ? [...D.map(d=>["d",d]),...P.map(x=>["p",x])] : [...P.map(x=>["p",x]),...D.map(d=>["d",d])];
  if(!items.length){ $("mpop").hidden=true; return; } mSel=Math.min(mSel,items.length-1);
  $("mpop").innerHTML=items.map((it,i)=>{ const on=i===mSel?"on":""; if(it[0]==="d"){ const d=it[1], n=deptCount(d); return `<button type="button" data-mend="${esc(d)}" class="${on}"><span class="av avd" style="--dc:${col(d)}">#</span>@${esc(d)} <small>Whole department${n?` · ${n} ${n===1?"person":"people"}`:""}</small></button>`; }
    const [e,p]=it[1]; return `<button type="button" data-men="${esc(e)}" class="${on}"><span class="av" style="--dc:${col(p.dept)}">${esc(initials(p.name))}</span>${esc(p.name)} <small>${esc(p.dept||"")}</small></button>`; }).join(""); $("mpop").hidden=false; }
function pickMention(email,dept){ const name=dept||people[email]?.name; if(!name||!mq) return; const ta=$("tcmi"), v=ta.value, end=ta.selectionStart;
  ta.value=v.slice(0,mq.start)+"@"+name+" "+v.slice(end); const pos=mq.start+name.length+2; ta.setSelectionRange(pos,pos); ta.focus(); $("mpop").hidden=true; mq=null; }
$("tcmi").addEventListener("input",()=>{ mSel=0; showMentions(); });
$("tcmi").addEventListener("keydown",e=>{ if($("mpop").hidden){ if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); $("tcmf").requestSubmit(); } return; }
  const n=$("mpop").children.length; if(e.key==="ArrowDown"){ e.preventDefault(); mSel=(mSel+1)%n; showMentions(); } else if(e.key==="ArrowUp"){ e.preventDefault(); mSel=(mSel-1+n)%n; showMentions(); }
  else if(e.key==="Enter"||e.key==="Tab"){ e.preventDefault(); const b=$("mpop").children[mSel]; if(b) pickMention(b.dataset.men,b.dataset.mend); } else if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); $("mpop").hidden=true; } });
$("mpop").addEventListener("mousedown",e=>{ const b=e.target.closest("[data-men],[data-mend]"); if(b){ e.preventDefault(); pickMention(b.dataset.men,b.dataset.mend); } });
$("tcmf").addEventListener("submit",e=>{ e.preventDefault(); const t=tasks.find(x=>x.id===curTask), text=$("tcmi").value.trim(); if(!t||!text) return;
  const dm=DEPTS.filter(d=>hasTag(text,d)).map(d=>"dept:"+d);
  const mentions=[...dm,...Object.entries(people).filter(([em,p])=>p.name&&em!==me.email&&text.includes("@"+p.name)).map(([em])=>em)].slice(0,20);
  $("tcmi").value=""; $("mpop").hidden=true;
  addDoc(collection(db,"comments"),{task:t.id,text:text.slice(0,1000),by:me.name,email:me.email,at:serverTimestamp(),mentions}).then(()=>logIt(t,"comment",text.slice(0,120))).catch(e2=>{ $("tcmi").value=text; fail(e2); }); });
$("tcml").addEventListener("click",e=>{ const b=e.target.closest("[data-cmrm]"); if(!b) return; if(b.dataset.armed){ deleteDoc(doc(db,"comments",b.dataset.cmrm)).catch(fail); } else { b.dataset.armed=1; b.textContent="Delete?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Delete"; } },3000); } });
const SEEN_KEY = () => "tubc-seen-"+(me?.email||"");
const tagsMe = c => { const m=c.mentions||[]; return m.includes(me?.email) || (!!me?.dept && m.includes("dept:"+me.dept)); };
function mentionsForMe(){ return comments.filter(c=>tagsMe(c)&&c.email!==me?.email); }
function renderMentions(){ if(!me) return; const L=mentionsForMe(), seen=+(localStorage.getItem(SEEN_KEY())||0);
  const fresh=L.filter(c=>(c.at?.seconds||0)*1000>seen).length;
  [$("mbadge"),$("bbadge"),$("mencnt")].forEach(b=>{ b.hidden=!fresh; b.textContent=fresh>9?"9+":String(fresh); });
  $("mens").hidden=!L.length;
  $("menl").innerHTML=L.slice(0,8).map(c=>{ const t=tasks.find(x=>x.id===c.task); return `<li class="${(c.at?.seconds||0)*1000>seen?"new":""}"><button type="button" ${t?`data-task="${esc(c.task)}"`:""}><b>${esc(c.by)}</b> on ${esc(t?.title||"a deleted task")}<small>${esc(String(c.text).slice(0,120))} · ${rel(c.at)}</small></button></li>`; }).join(""); }
function markMentionsSeen(){ if(!me) return; const L=mentionsForMe(); if(!L.length) return; const latest=Math.max(...L.map(c=>(c.at?.seconds||0)*1000));
  setTimeout(()=>{ try{ localStorage.setItem(SEEN_KEY(),String(latest)); }catch{} [$("mbadge"),$("bbadge"),$("mencnt")].forEach(b=>b.hidden=true); },4000); }
VERB.comment="commented on";

// ---------- PVP overview ----------
function renderOverview(){ if(!$("ogrid")||!me||!seeOverview()) return;
  const td=iso(new Date()), w=(()=>{ const x=new Date(); x.setDate(x.getDate()+7); return iso(x); })();
  const open=tasks.filter(t=>t.status!=="dn"), late=open.filter(t=>t.due&&t.due<td).sort((a,b)=>a.due.localeCompare(b.due)), week=open.filter(t=>t.due&&t.due>=td&&t.due<=w).sort((a,b)=>a.due.localeCompare(b.due));
  const done=tasks.length-open.length;
  $("okpi").innerHTML=[[tasks.length?Math.round(done/tasks.length*100):0,"%","done overall","","ov-pct"],[open.length,"","open tasks","","ov-open"],[late.length,"","overdue",late.length?"warn":"","ov-late"],[week.length,"","due in 7 days","","ov-wk"]].map(([n,suf,s,c,k])=>`<div class="kpi ${c}"><b data-n="${n}" data-k="${k}" data-suf="${suf}">${n}${suf}</b><span>${s}</span></div>`).join(""); countUp($("okpi"));
  const own=t=>t.depts&&t.depts.length?t.depts:toks(t.owner);
  $("ogrid").innerHTML=DEPTS.map(d=>{ const T=tasks.filter(t=>own(t).includes(d)||(d==="PVP"&&own(t).includes("President"))); const dn=T.filter(t=>t.status==="dn").length, op=T.filter(t=>t.status!=="dn");
    const lt=op.filter(t=>t.due&&t.due<td).length, nx=op.filter(t=>t.due).sort((a,b)=>a.due.localeCompare(b.due))[0];
    const hs=(heads[d]||[]).filter(x=>x.name).map(x=>x.name).join(", ");
    const pc=T.length?Math.round(dn/T.length*100):0;
    return `<button type="button" class="oc" style="--dc:${col(d)}" data-ogo="${esc(d)}"><div class="otop"><div><h3>${esc(d)}</h3><div class="hn2">${d==="PVP"?"Puripat, Sattam, Krang":esc(hs||"Heads TBC")}</div></div><span class="orw${pc===100?" full":""}" role="img" aria-label="${pc}% done"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="otr" cx="22" cy="22" r="18" pathLength="100"/><circle class="orc" cx="22" cy="22" r="18" pathLength="100" data-ring="${pc}" data-rk="r-${esc(d)}"/></svg><b data-n="${pc}" data-k="ov-r-${esc(d)}" data-suf="%">${pc}%</b></span></div><div class="ost"><span>${dn}/${T.length} done</span>${lt?`<span class="bad">${lt} overdue</span>`:""}</div>${nx?`<div class="onext">Next: <b>${fmt(nx.due)}</b> ${esc(nx.title)}</div>`:`<div class="onext" style="color:var(--mute)">${T.length?"Nothing open 🎉":"No tasks yet"}</div>`}</button>`; }).join("");
  animBars($("ogrid")); animRings($("ogrid")); countUp($("ogrid"));
  const li=(t,cls)=>`<li class="${cls}"><button type="button" data-task="${t.id}"><span class="d">${fmt(t.due)}</span><span>${esc(t.title)}</span><span>${ownHtml(t.owner)}</span></button></li>`;
  $("olate").innerHTML=late.slice(0,12).map(t=>li(t,"late")).join("")||'<li style="color:var(--mute);font-size:14px">Nothing overdue. 🎉</li>';
  $("oweek").innerHTML=week.slice(0,12).map(t=>li(t,"")).join("")||'<li style="color:var(--mute);font-size:14px">Nothing due this week.</li>';
  const fin=[];
  if(seeSpons()){ const yes=sponsors.filter(s=>["yes","docs"].includes(s.stage)); fin.push(`<a href="#sponsors"><b>${thb(yes.reduce((a,s)=>a+(+s.amount||0),0))} THB</b><span>from ${yes.length} sponsor${yes.length===1?"":"s"} agreed · ${sponsors.filter(s=>!["yes","docs","no"].includes(s.stage)).length} in progress</span></a>`); }
  $("ofin").innerHTML=fin.join(""); }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-ogo]"); if(!b) return; f.own=b.dataset.ogo; location.hash="#tracker"; render(); });

// ---------- sponsors ----------
const SSTAGE=[["lead","Contacted"],["meet","Meeting set"],["prop","Proposal sent"],["yes","Agreed"],["docs","Docs done"],["no","Declined"]];
let curS=null, dragS=null;
function renderSponsors(){ if(!$("board")||!me||!seeSpons()) return; const ed=canSpons(), td=iso(new Date());
  const sum=st=>sponsors.filter(s=>st.includes(s.stage)).reduce((a,s)=>a+(+s.amount||0),0);
  const sa=sum(["yes","docs"]), sp=sum(["lead","meet","prop"]), sn=sponsors.filter(s=>s.stage!=="no").length;
  $("ssum").innerHTML=`<div class="kpi"><b data-n="${sa}" data-k="sp-yes">${thb(sa)}</b><span>THB agreed</span></div><div class="kpi"><b data-n="${sp}" data-k="sp-pipe">${thb(sp)}</b><span>THB in the pipeline</span></div><div class="kpi"><b data-n="${sn}" data-k="sp-n">${sn}</b><span>active sponsors</span></div>`; countUp($("ssum"));
  $("board").innerHTML=SSTAGE.map(([k,l])=>{ const L=sponsors.filter(s=>(s.stage||"lead")===k).sort((a,b)=>(a.next||"9999").localeCompare(b.next||"9999"));
    return `<section class="col ${k}" data-sst="${k}"><h3>${l}<span>${L.length}${L.length&&sum([k])?" · "+thb(sum([k])):""}</span></h3>${L.map(s=>`<button type="button" class="sc" data-sp="${s.id}"${ed?' draggable="true"':""}><b>${esc(s.name)}</b>${s.amount?`<span class="amt">${thb(s.amount)} THB</span> `:""}${s.pkg?`<span>${esc(s.pkg)}</span>`:""}${s.owner?`<small>Ours: ${esc(s.owner)}</small>`:""}${s.next&&!["docs","no"].includes(k)?`<small class="${s.next<td?"late":""}">Next step by ${fmt(s.next)}</small>`:""}</button>`).join("")}${ed&&k==="lead"?'<button type="button" class="addb" id="sadd">+ Add sponsor</button>':""}</section>`; }).join(""); }
function openSponsor(id){ const s=id?sponsors.find(x=>x.id===id):null; curS=s?s.id:null; const ed=canSpons();
  $("sdt").textContent=s?s.name:"New sponsor"; $("sst").innerHTML=SSTAGE.map(([k,l])=>`<option value="${k}"${(s?.stage||"lead")===k?" selected":""}>${l}</option>`).join("");
  $("sn").value=s?.name||""; $("sam").value=s?.amount||""; $("spk").value=s?.pkg||""; $("snx").value=s?.next||""; $("sow").value=s?.owner||(s?"":me.name); $("sct").value=s?.contact||""; $("sno").value=s?.note||"";
  $("sdf").querySelectorAll("input,select,textarea").forEach(x=>x.disabled=!ed); $("sds").hidden=!ed; $("sdel").hidden=!(ed&&s);
  try{$("sd").showModal();}catch(e){$("sd").setAttribute("open","");} if(ed&&!s) setTimeout(()=>$("sn").focus(),50); }
const closeS=()=>{ try{$("sd").close();}catch(e){$("sd").removeAttribute("open");} };
$("sdx").onclick=closeS; $("sdc").onclick=closeS;
$("sdf").addEventListener("submit",e=>{ e.preventDefault(); if(!canSpons()) return; const name=$("sn").value.trim(); if(!name) return;
  const data={name:name.slice(0,80),stage:$("sst").value,amount:Math.max(0,Math.round(+$("sam").value||0)),pkg:$("spk").value.trim().slice(0,80),next:$("snx").value,owner:$("sow").value.trim().slice(0,60),contact:$("sct").value.trim().slice(0,120),note:$("sno").value.trim().slice(0,1000),updatedBy:me.name,updatedAt:serverTimestamp()};
  (curS?setDoc(doc(db,"sponsors",curS),data):addDoc(collection(db,"sponsors"),data)).then(()=>{ closeS(); toast("Sponsor saved."); }).catch(fail); });
$("sdel").onclick=()=>{ const b=$("sdel"); if(!curS) return; if(b.dataset.armed){ deleteDoc(doc(db,"sponsors",curS)).then(()=>{ closeS(); toast("Sponsor deleted."); }).catch(fail); delete b.dataset.armed; b.textContent="Delete"; } else { b.dataset.armed=1; b.textContent="Delete for good?"; setTimeout(()=>{ delete b.dataset.armed; b.textContent="Delete"; },3000); } };
document.addEventListener("click",e=>{ const c=e.target.closest("[data-sp]"); if(c){ openSponsor(c.dataset.sp); return; } if(e.target.closest("#sadd")) openSponsor(null); });
document.addEventListener("dragstart",e=>{ const c=e.target.closest?.(".sc[draggable]"); if(!c) return; dragS=c.dataset.sp; c.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; try{e.dataTransfer.setData("text/plain",dragS);}catch(_){} });
document.addEventListener("dragend",()=>{ if(!dragS) return; document.querySelectorAll(".sc.dragging").forEach(x=>x.classList.remove("dragging")); document.querySelectorAll(".col.drop").forEach(x=>x.classList.remove("drop")); dragS=null; });
document.addEventListener("dragover",e=>{ if(!dragS) return; const c=e.target.closest?.(".col[data-sst]"); if(!c) return; e.preventDefault(); document.querySelectorAll(".col.drop").forEach(x=>{ if(x!==c) x.classList.remove("drop"); }); c.classList.add("drop"); });
document.addEventListener("drop",e=>{ if(!dragS) return; const c=e.target.closest?.(".col[data-sst]"); if(!c) return; e.preventDefault(); const s=sponsors.find(x=>x.id===dragS), st=c.dataset.sst; dragS=null; c.classList.remove("drop");
  if(!s||s.stage===st) return; s.stage=st; renderSponsors(); updateDoc(doc(db,"sponsors",s.id),{stage:st,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>toast(`${s.name} → ${SSTAGE.find(x=>x[0]===st)[1]}`)).catch(fail); });

// ---------- bottom bar + floating add ----------
$("bmore").onclick=openMenu;
$("bnav").addEventListener("click",e=>{ const a=e.target.closest("a[data-v]"); if(!a) return; if(curView===a.dataset.v){ e.preventDefault(); scrollTo({top:0,behavior:motion()?"smooth":"auto"}); setTimeout(()=>{ if(scrollY>40) scrollTo({top:0,behavior:"instant"}); },1000); } });
function updateFab(){ const v=curView; let show=false, label="Add task";
  if(me&&!["login","noaccess"].includes(v)){ if(v==="sponsors"){ show=canSpons(); label="Add sponsor"; } else if(["mine","calendar","overview"].includes(v)){ show=can("add"); } }
  $("fab").hidden=!show; $("fab").setAttribute("aria-label",label); $("fab").title=label; updateBot(); }
function openNew(due){ openEdit(null,"",{due:due||""}); }
$("fab").onclick=()=>{ if(curView==="sponsors") openSponsor(null); else openNew(); };

// ---------- who can see sponsors (set on the Access page) ----------
let sponsUnsub=null;
function applySponsAccess(){ if(!me) return; const see=seeSpons();
  $("t-sponsors").hidden=!see;
  if(see && !sponsUnsub) sponsUnsub=onSnapshot(collection(db,"sponsors"), s=>{ sponsors=s.docs.map(d=>({id:d.id,...d.data()})); renderSponsors(); renderOverview(); }, e=>console.warn("sponsors",e));
  if(!see && sponsUnsub){ sponsUnsub(); sponsUnsub=null; sponsors=[]; }
  renderSponsors(); renderOverview(); if(curView==="sponsors"&&!see) location.hash="#mine"; else if(location.hash==="#sponsors"&&see&&curView!=="sponsors") route(); updateFab(); }
function renderSponsAccess(){ if(!$("spa")||!isAdmin()) return;
  $("spa").tBodies[0].innerHTML=DEPTS.map(d=>`<tr><td><span class="dt" style="--dc:${col(d)}">${esc(d)}</span></td>${["see","edit"].map(k=>`<td class="pc2"><label class="sw"><input type="checkbox" data-spa="${k}" value="${esc(d)}"${(sponsAccess[k]||[]).includes(d)?" checked":""} aria-label="${k==="see"?"See":"Edit"} sponsors: ${esc(d)}"><span></span></label></td>`).join("")}</tr>`).join(""); }
document.addEventListener("change",e=>{ const k=e.target.dataset?.spa; if(!k||!isAdmin()) return; const v=e.target.value;
  const next={see:[...(sponsAccess.see||[])],edit:[...(sponsAccess.edit||[])]};
  const set=(key,on)=>{ next[key]=next[key].filter(x=>x!==v); if(on) next[key].push(v); };
  set(k,e.target.checked); if(k==="edit"&&e.target.checked) set("see",true); if(k==="see"&&!e.target.checked) set("edit",false);
  setDoc(doc(db,"settings","sponsors"),next).then(()=>toast("Sponsor access updated.")).catch(fail); });
document.querySelectorAll(".brand").forEach(b=>{ b.setAttribute("role","link"); b.tabIndex=0; b.style.cursor="pointer";
  const go=()=>{ if(!me) return; closeMenu(); location.hash = seeOverview() ? "#overview" : "#mine"; };
  b.addEventListener("click",go); b.addEventListener("keydown",e=>{ if(e.key==="Enter") go(); }); });

// ---------- profile ----------
const PF=["name","nick","line","phone","batch","bio"];
async function syncProfile(u){ try{ const s=await getDoc(doc(db,"people",me.email)); const d=s.exists()?s.data():{};
  if(d.name) me.name=d.name; paintMe();
  if(!s.exists()||d.dept!==me.dept||!d.name) await setDoc(doc(db,"people",me.email),{name:d.name||u.displayName||me.email,dept:me.dept},{merge:true}); }catch(e){ console.warn("people",e); } }
function avatarHtml(email,name,photo,cls){ const p=people[email]||{}; return photo?`<img class="${cls}" src="${esc(photo)}" alt="" referrerpolicy="no-referrer">`:`<span class="${cls}" style="--dc:${col(p.dept||"")}">${esc(initials(name))}</span>`; }
function paintMe(){ if(!me) return; $("menm").textContent=me.name; $("umname").textContent=me.name; $("umemail").textContent=me.email; $("meav").outerHTML=avatarHtml(me.email,me.name,me.photo,"meav\" id=\"meav"); }
function renderProfile(){ if(!me||!$("pff")) return; const p=people[me.email]||{};
  $("pfhead").innerHTML=`${avatarHtml(me.email,me.name,me.photo,"pfav")}<div><h1>${esc(p.name||me.name)}${p.nick?` <span class="pfnick">(${esc(p.nick)})</span>`:""}</h1><p class="sub">${esc(me.email)}</p><p class="pfrole"><span class="lvl">${esc(ROLE_LABEL[me.role]||me.role)}</span>${me.dept?`<span class="dt" style="--dc:${col(me.dept)}">${esc(me.dept)}</span>`:'<span class="sub">No department yet</span>'}</p></div>`;
  if(!$("pff").contains(document.activeElement)) PF.forEach(k=>{ $("pf"+k).value = k==="name" ? (p.name||me.name) : (p[k]||""); });
  const own=t=>t.depts&&t.depts.length?t.depts:toks(t.owner);
  const T=me.dept?tasks.filter(t=>own(t).includes(me.dept)||(me.dept==="PVP"&&own(t).includes("President"))):[]; const dn=T.filter(t=>t.status==="dn").length;
  const mc=comments.filter(c=>c.email===me.email).length, mm=mentionsForMe().length, td=iso(new Date()), late=T.filter(t=>t.status!=="dn"&&t.due&&t.due<td).length;
  $("pfst").innerHTML=[[me.dept?`${dn}/${T.length}`:"—",me.dept?`${esc(me.dept)} tasks done`:"department tasks"],[late,"overdue in your department"],[mc,"comments written"],[mm,"times you were tagged"]].map(([b,s])=>`<div class="pfs"><b>${b}</b><span>${s}</span></div>`).join(""); }
$("pff").addEventListener("submit",e=>{ e.preventDefault(); if(!me) return; const d={dept:me.dept};
  PF.forEach(k=>{ d[k]=$("pf"+k).value.trim().slice(0,k==="bio"?300:k==="name"?80:60); }); if(!d.name){ toast("Your name can't be empty."); return; }
  setDoc(doc(db,"people",me.email),d,{merge:true}).then(()=>{ me.name=d.name; paintMe(); toast("Profile saved."); }).catch(fail); });
$("pfcancel").onclick=()=>{ document.activeElement?.blur(); renderProfile(); };
// someone else's profile card
function openPerson(email){ const p=people[email]; if(!p) return;
  $("pcard").innerHTML=`<div class="dh"><div class="pch">${avatarHtml(email,p.name,"","pfav sm")}<div><h3>${esc(p.name)}${p.nick?` <span class="pfnick">(${esc(p.nick)})</span>`:""}</h3><p class="role">${p.dept?`<span class="dt" style="--dc:${col(p.dept)}">${esc(p.dept)}</span>`:""}${p.batch?` · ${esc(p.batch)}`:""}</p></div></div><button type="button" class="x" id="pcx" aria-label="Close">×</button></div>${p.bio?`<p>${esc(p.bio)}</p>`:""}<dl class="pcdl">${p.line?`<dt>LINE</dt><dd>${esc(p.line)}</dd>`:""}${p.phone?`<dt>Phone</dt><dd><a href="tel:${esc(p.phone.replace(/[^\d+]/g,""))}">${esc(p.phone)}</a></dd>`:""}<dt>Email</dt><dd><a href="mailto:${esc(email)}">${esc(email)}</a></dd></dl>`;
  $("pcx").onclick=()=>{ try{$("pcd").close();}catch(e){$("pcd").removeAttribute("open");} };
  try{$("pcd").showModal();}catch(e){$("pcd").setAttribute("open","");} }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-person]"); if(b){ e.preventDefault(); openPerson(b.dataset.person); } });

// ---------- avatar menu, theme ----------
function closeUM(){ if(!$("umenu")||$("umenu").hidden) return; $("umenu").hidden=true; $("mename").setAttribute("aria-expanded","false"); }
$("mename").addEventListener("click",e=>{ e.stopPropagation(); const open=$("umenu").hidden; $("umenu").hidden=!open; $("mename").setAttribute("aria-expanded",String(open)); if(open){ paintTheme(); paintNotif(); } });
document.addEventListener("click",e=>{ if(!e.target.closest(".umw")) closeUM(); else if(e.target.closest("a.umi")) closeUM(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!$("umenu").hidden){ closeUM(); $("mename").focus(); } });
function curTheme(){ try{ return localStorage.getItem("tubc-theme")||"auto"; }catch{ return "auto"; } }
function paintTheme(){ const t=curTheme(); document.querySelectorAll("[data-theme-set]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.themeSet===t))); }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-theme-set]"); if(!b) return; const t=b.dataset.themeSet;
  try{ localStorage.setItem("tubc-theme",t); }catch{} if(t==="auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme",t);
  paintTheme(); const tc=document.querySelector('meta[name="theme-color"]'); if(tc&&!document.documentElement.hasAttribute("data-gate")) tc.content=getComputedStyle(document.querySelector(".nav")).backgroundColor; });

// ---------- sliding underline (top tabs + Team sub-tabs) ----------
function placeBar(bar,el,box,anim){ if(!bar) return; if(!el||el.hidden||!el.offsetWidth){ bar.style.width="0"; return; }
  const b=box.getBoundingClientRect(), r=el.getBoundingClientRect(); const x=r.left-b.left+box.scrollLeft;
  bar.classList.toggle("anim",!!anim&&motion()); bar.style.width=r.width+"px"; bar.style.transform=`translateX(${x}px)`; }
let barReady=false;
function moveTabBar(){ const tabs=document.querySelector(".tabs"); if(!tabs||tabs.hidden||matchMedia("(max-width:1240px)").matches){ tabs?.classList.remove("hasbar"); return; }
  placeBar($("tabbar"),tabs.querySelector('a[aria-current="page"]'),tabs,barReady); tabs.classList.add("hasbar"); barReady=true; }
function moveSubBars(){ document.querySelectorAll(".subtabs").forEach(n=>{ if(n.offsetParent===null) return; placeBar(n.querySelector(".subbar"),n.querySelector('a[aria-current="page"]'),n,n.dataset.ready==="1"); n.dataset.ready="1"; }); }
addEventListener("resize",()=>{ barReady=false; moveTabBar(); document.querySelectorAll(".subtabs").forEach(n=>n.dataset.ready="0"); moveSubBars(); });
document.fonts?.ready?.then(()=>{ barReady=false; moveTabBar(); moveSubBars(); });
document.querySelector(".subtabs")&&document.addEventListener("click",e=>{ const a=e.target.closest(".subtabs a"); if(!a) return; const other=document.querySelector(`#v-${a.dataset.sub} .subtabs`); if(other){ const from=e.target.closest(".subtabs").querySelector(".subbar"); const to=other.querySelector(".subbar"); to.style.transform=from.style.transform; to.style.width=from.style.width; other.dataset.ready="1"; } });

// ---------- stagger-in cards + count-up numbers ----------
function staggerIn(v){ if(!motion()) return; const root=$("v-"+v); if(!root) return;
  const els=[...root.querySelectorAll(".kpi,.oc,.col,.pc,.lvl1 .dept,.dgrid li,.cdi,.mg li,.pfs,.olist li")].slice(0,40);
  els.forEach((el,i)=>el.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:380,delay:Math.min(i*35,500),easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}));
  if(v==="overview") animRings(root,true);
  if(v==="overview"||v==="sponsors"){ Object.keys(numFrom).filter(k=>k.startsWith(v==="overview"?"ov-":"sp-")).forEach(k=>numFrom[k]=0); countUp(root); } }
function countUp(root){ root.querySelectorAll("[data-n][data-k]").forEach(el=>{ const n=+el.dataset.n, suf=el.dataset.suf||""; animNum(el.dataset.k,el,n,(e,x)=>{ e.textContent=thb(x)+suf; }); }); }

// ---------- search (Ctrl/Cmd+K) ----------
let qkSel=0, qkRes=[];
function openSearch(){ if(!me) return; closeMenu(); closeUM(); $("qki").value=""; runSearch(); try{$("qk").showModal();}catch(e){$("qk").setAttribute("open","");} setTimeout(()=>$("qki").focus(),30); }
const closeSearch=()=>{ try{$("qk").close();}catch(e){$("qk").removeAttribute("open");} };
const hl=(s,q)=>{ const t=esc(s); if(!q) return t; const i=s.toLowerCase().indexOf(q); if(i<0) return t; return esc(s.slice(0,i))+"<mark>"+esc(s.slice(i,i+q.length))+"</mark>"+esc(s.slice(i+q.length)); };
function runSearch(){ const q=$("qki").value.trim().toLowerCase(); const td=iso(new Date());
  const sc=t=>{ if(!q) return t.status==="dn"?0:1; const ti=(t.title||"").toLowerCase(); if(ti.startsWith(q)) return 5; if(ti.split(/\s+/).some(w=>w.startsWith(q))) return 4; if(ti.includes(q)) return 3; if(toks(t.owner).some(o=>o.toLowerCase().startsWith(q))) return 2; if((t.note||"").toLowerCase().includes(q)||(t.checks||[]).some(c=>c.t.toLowerCase().includes(q))) return 1; return 0; };
  qkRes=tasks.map(t=>[t,sc(t)]).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]||(a[0].due||"9").localeCompare(b[0].due||"9")).slice(0,30).map(([t])=>t);
  if(!q) qkRes=qkRes.filter(t=>t.status!=="dn").slice(0,8);
  qkSel=0; paintSearch(q); }
function paintSearch(q){ q=q??$("qki").value.trim().toLowerCase(); const td=iso(new Date());
  $("qkl").innerHTML=qkRes.length?qkRes.map((t,i)=>`<li role="option" data-qk="${t.id}" class="${i===qkSel?"on":""}" aria-selected="${i===qkSel}" style="--dc:${tcol(t)}"><span class="d"${t.due&&t.due<td&&t.status!=="dn"?' style="color:var(--red);font-weight:700"':""}>${t.due?fmt(t.due):"—"}</span><span class="t">${hl(t.title||"",q)}</span><span class="s">${esc(ST[t.status]||"")}</span></li>`).join(""):`<li class="none">${q?"No tasks match “"+esc(q)+"”.":"No open tasks."}</li>`;
  $("qkl").querySelector("li.on")?.scrollIntoView({block:"nearest"}); }
$("qki").addEventListener("input",runSearch);
$("qki").addEventListener("keydown",e=>{ if(e.key==="ArrowDown"){ e.preventDefault(); qkSel=Math.min(qkSel+1,qkRes.length-1); paintSearch(); } else if(e.key==="ArrowUp"){ e.preventDefault(); qkSel=Math.max(qkSel-1,0); paintSearch(); } else if(e.key==="Enter"){ e.preventDefault(); const t=qkRes[qkSel]; if(t){ closeSearch(); openTask(t.id); } } });
$("qkl").addEventListener("click",e=>{ const li=e.target.closest("[data-qk]"); if(li){ closeSearch(); openTask(li.dataset.qk); } });
$("qk").addEventListener("click",e=>{ if(e.target===$("qk")) closeSearch(); });
document.addEventListener("keydown",e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); if($("qk").open) closeSearch(); else openSearch(); } });
$("srchbtn").onclick=openSearch; $("tsearch").onclick=openSearch;
if(/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent)) document.querySelectorAll(".tsearch kbd").forEach(k=>k.textContent="⌘K");

// ---------- quick answers bubble (canned choices, no AI; reads only the tasks this user can already see) ----------
const HB_MAX=5, HB_LOG=5; // tasks shown per answer, chat bubbles kept
const hbOwn=t=>t.depts?.length?t.depts:toks(t.owner);
const hbFor=(t,d)=>{ const o=hbOwn(t); return o.includes(d)||(d==="PVP"&&o.includes("President")); };
const hbDay=n=>{ const x=new Date(); x.setDate(x.getDate()+n); return iso(x); };
const hbDate=d=>new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});
const hbByDue=(a,b)=>(a.due||"9999").localeCompare(b.due||"9999");
let hbStarted=false;
function updateBot(){ const show=!!me&&!["login","noaccess"].includes(curView); $("hb").hidden=!show; if(!show) closeBot(); }
function openBot(){ $("hp").hidden=false; $("hb").setAttribute("aria-expanded","true");
  if(!hbStarted){ hbStarted=true; const nm=people[me.email]?.nick||String(me.name||"").split(" ")[0]; hbSay(`Hi ${esc(nm)}! What do you want to check?`); }
  hbMenu(); setTimeout(()=>$("hch").querySelector("button")?.focus(),30); }
function closeBot(){ $("hp").hidden=true; $("hb").setAttribute("aria-expanded","false"); }
function hbAdd(cls,html){ const el=document.createElement("div"); el.className="hm "+cls; el.innerHTML=html; const log=$("hlog"); log.appendChild(el);
  while(log.children.length>HB_LOG) log.firstElementChild.remove(); return el; }
const hbSay=(html,wide)=>hbAdd("bot"+(wide?" wide":""),html);
function hbMenu(){ $("hch").innerHTML=[["mine","My tasks"],["over","Overdue"],["soon","Today & tomorrow"]].map(([k,l])=>`<button type="button" data-hb="${k}">${l}</button>`).join(""); }
const hbItem=(t,td)=>`<li><button type="button" data-task="${esc(t.id)}" style="--dc:${tcol(t)}"><span class="d${t.due&&t.due<td?" late":""}">${t.due?hbDate(t.due):"—"}</span><span class="t">${esc(t.title)}</span><span class="o">${esc(t.owner)} · ${ST[t.status]||""}</span></button></li>`;
// Groups share one budget of HB_MAX tasks so an answer never gets long; the rest is a "see all" link.
function hbGroups(G,td,go,goLabel){ let left=HB_MAX, hidden=0;
  const html=G.filter(g=>g[2].length).map(([cls,label,a])=>{ const shown=a.slice(0,Math.max(0,left)); left-=shown.length; hidden+=a.length-shown.length;
    return `<h4 class="${cls}">${label} (${a.length})</h4>`+(shown.length?`<ul>${shown.map(t=>hbItem(t,td)).join("")}</ul>`:""); }).join("");
  return html+(hidden?`<button type="button" class="more" data-go="${go}">+ ${hidden} more · See all in ${goLabel}</button>`:""); }
function hbAnswer(k){ const td=iso(new Date()), open=tasks.filter(t=>t.status!=="dn");
  if(k==="mine"){
    if(!me.dept){ hbSay("Your department isn't set yet, so I can't tell which tasks are yours. Ask a PVP to set it on the Access page. You can still check Overdue or Today & tomorrow."); return; }
    const shared=isHeadUp()?["All","All heads"]:["All"], w=hbDay(7);
    const T=open.filter(t=>hbFor(t,me.dept)||hbOwn(t).some(x=>shared.includes(x)));
    const over=T.filter(t=>t.due&&t.due<td).sort(hbByDue), week=T.filter(t=>t.due&&t.due>=td&&t.due<=w).sort(hbByDue);
    if(!over.length&&!week.length){ const nx=T.filter(t=>t.due&&t.due>w).sort(hbByDue)[0];
      hbSay(`Nothing due for ${esc(me.dept)} in the next 7 days. 🎉`+(nx?` Next up: <b>${esc(nx.title)}</b> on ${hbDate(nx.due)}.`:"")); }
    else hbSay(`<p class="sum">${esc(me.dept)} + shared tasks</p>`+hbGroups([["over","Overdue",over],["","Next 7 days",week]],td,"#mine","Tasks"),true);
  } else if(k==="over"){
    const a=open.filter(t=>t.due&&t.due<td).sort(hbByDue);
    hbSay(a.length?`<p class="sum">Across all departments, oldest first</p>`+hbGroups([["over","Overdue",a]],td,"late","Tasks"):"Nothing is overdue. 🎉",a.length>0);
  } else if(k==="soon"){
    const a=open.filter(t=>t.due===td), b=open.filter(t=>t.due===hbDay(1));
    hbSay(a.length||b.length?hbGroups([["over","Today",a],["","Tomorrow",b]],td,"#calendar","Calendar"):"Nothing is due today or tomorrow. 🎉",a.length+b.length>0);
  }
  hbMenu(); }
let hbBusy=false;
// Show "• • •" briefly before the answer so it reads like a reply (skipped when reduced motion is on).
function hbAsk(label,k){ if(hbBusy) return; const log=$("hlog"), you=hbAdd("you",""); you.textContent=label;
  if(!motion()){ hbAnswer(k); log.scrollTop=you.offsetTop-8; return; }
  hbBusy=true; $("hch").classList.add("busy"); const dots=hbAdd("bot typing",'<span class="hty"><i></i><i></i><i></i></span>'); dots.setAttribute("aria-hidden","true"); log.scrollTop=log.scrollHeight;
  setTimeout(()=>{ dots.remove(); hbAnswer(k); log.scrollTop=you.offsetTop-8; hbBusy=false; $("hch").classList.remove("busy"); },450); }
function hbGo(go){ closeBot(); if(go==="late"){ mScope="*"; mdPicked=true; renderMine(); if(location.hash!=="#mine") location.hash="#mine"; else scrollTo(0,0); } else location.hash=go; }
$("hb").onclick=()=>{ if($("hp").hidden) openBot(); else closeBot(); };
$("hpx").onclick=()=>{ closeBot(); $("hb").focus(); };
$("hch").addEventListener("click",e=>{ const b=e.target.closest("[data-hb]"); if(b) hbAsk(b.textContent,b.dataset.hb); });
$("hlog").addEventListener("click",e=>{ const g=e.target.closest("[data-go]"); if(g) hbGo(g.dataset.go); }); // task rows open via the page-wide [data-task] handler
$("hp").addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); closeBot(); $("hb").focus(); } });
document.addEventListener("click",e=>{ if($("hp").hidden) return; if(!e.target.isConnected||e.target.closest("#hp,#hb,dialog")) return; closeBot(); });

// ---------- announcement banner (admins post it on the Access page; stored in settings/announce) ----------
let ann = null, annDirty = false;
const ANN_KEY = id => "tubc-ann-closed:" + id;
function renderAnn(){
  const b = $("annbar"), a = ann && ann.text ? ann : null;
  let closed = false; try { closed = !!(a && localStorage.getItem(ANN_KEY(a.id))); } catch {}
  const show = !!me && !!a && !closed && canSee(a);
  b.hidden = !show; if (show) b.classList.remove("out");
  if (a) {
    $("annlab").textContent = a.level === "urgent" ? "Urgent" : "Announcement";
    $("anntext").textContent = a.text; b.classList.toggle("urgent", a.level === "urgent");
    const aud = ((a.depts || []).length || a.heads) && isAdmin() ? " · for " + audLabel(a) : "";
    $("annmeta").textContent = (a.by ? a.by + " · " : "") + rel(a.at) + aud;
    const L = $("annlink"); L.hidden = !a.link; if (a.link) L.href = a.link;
  }
  if (isAdmin()) {
    $("annrm").hidden = !a;
    if (!annDirty) { if (a) { $("annt").value = a.text; $("annl").value = a.level || "info"; $("annu").value = a.link || ""; } $("annaudw").innerHTML = audHtml("annaud", a || {}); }
  }
}
$("annx").onclick = () => { if (!ann) return; try { localStorage.setItem(ANN_KEY(ann.id), "1"); } catch {}
  const b = $("annbar"); if (!motion()) { b.hidden = true; return; } b.classList.add("out"); setTimeout(() => { b.hidden = true; b.classList.remove("out"); }, 280); };
["annt", "annl", "annu"].forEach(id => $(id).addEventListener("input", () => { annDirty = true; }));
$("annf").addEventListener("change", () => { annDirty = true; });
$("annf").addEventListener("submit", e => { e.preventDefault(); const text = $("annt").value.trim(), link = $("annu").value.trim(); if (!text) return;
  if (link && !/^https?:\/\//i.test(link)) { toast("The link must start with https://"); return; }
  const aud = $("annaud") ? audRead($("annaud")) : { depts: [], heads: false };
  setDoc(doc(db,"settings","announce"), { text, level: $("annl").value, link, depts: aud.depts, heads: aud.heads, by: me.name, at: serverTimestamp(), id: String(Date.now()) })
    .then(() => { annDirty = false; toast("Announcement posted. Everyone sees it now."); }).catch(fail); });
$("annrm").onclick = () => { deleteDoc(doc(db,"settings","announce")).then(() => { annDirty = false; $("annt").value = ""; $("annu").value = ""; $("annl").value = "info"; toast("Announcement removed."); }).catch(fail); };

// ---------- audience picker ("who can see this") for key dates and the announcement ----------
// Display filter only: every member can still read these documents in Firestore, so don't put secrets in them.
const canSee = a => !a || isAdmin() || ((!(a.depts || []).length || a.depts.includes(me?.dept) || (a.depts.includes("PVP") && me?.dept === "President")) && (!a.heads || isHeadUp()));
function audLabel(a){ const d = (a && a.depts) || []; return (d.length ? (d.length > 3 ? d.slice(0, 3).join(", ") + " +" + (d.length - 3) : d.join(", ")) : "Everyone") + (a && a.heads ? " · heads only" : ""); }
function audHtml(id, a){ a = a || {}; const sel = new Set(a.depts || []);
  return `<details class="aud" id="${esc(id)}"><summary>${esc(audLabel(a))}</summary><div class="audpop">`
    + `<label class="audall"><input type="checkbox" data-aud-all${sel.size ? "" : " checked"}> Everyone</label>`
    + `<div class="audgrid">${DEPTS.map(d => `<label><input type="checkbox" value="${esc(d)}"${sel.has(d) ? " checked" : ""}> ${esc(d)}</label>`).join("")}</div>`
    + `<label class="audheads"><input type="checkbox" data-aud-heads${a.heads ? " checked" : ""}> Heads and admins only</label></div></details>`; }
function audRead(el){ return { depts: [...el.querySelectorAll(".audgrid input:checked")].map(i => i.value), heads: !!el.querySelector("[data-aud-heads]")?.checked }; }
document.addEventListener("change", e => { const box = e.target.closest(".aud"); if (!box) return;
  if (e.target.matches("[data-aud-all]") && e.target.checked) box.querySelectorAll(".audgrid input").forEach(i => { i.checked = false; });
  if (e.target.closest(".audgrid")) box.querySelector("[data-aud-all]").checked = !box.querySelector(".audgrid input:checked");
  box.querySelector("summary").textContent = audLabel(audRead(box)); });
document.addEventListener("click", e => { document.querySelectorAll("details.aud[open]").forEach(d => { if (!d.contains(e.target)) d.open = false; }); });

// ---------- key dates (settings/event.dates; the countdown shows the next 4 each person can see) ----------
let kdDirty = false;
const kdList = () => (ev.dates && ev.dates.length) ? ev.dates : [{ id: "clg", name: "The Challenger", date: ev.challenger || "" }, { id: "tubc", name: "TUBC", date: ev.tubc || "" }];
function kdRow(k){ return `<div class="kdrow" data-id="${esc(k.id)}"><input class="kdn" maxlength="40" placeholder="Name, e.g. Recruitment opens" value="${esc(k.name || "")}" aria-label="Key date name"><input class="kdd" type="date" value="${esc(k.date || "")}" aria-label="Date"><div class="kda"><span>Who sees it</span>${audHtml("kaud-" + k.id, k)}</div><button type="button" class="kdx" aria-label="Remove this key date">×</button></div>`; }
function renderKd(){ if (!$("kdlist") || kdDirty) return; $("kdlist").innerHTML = kdList().map(kdRow).join(""); }
$("kdadd").onclick = () => { kdDirty = true; $("kdlist").insertAdjacentHTML("beforeend", kdRow({ id: "k" + Date.now().toString(36), name: "", date: "" })); $("kdlist").lastElementChild.querySelector(".kdn").focus(); };
$("kdlist").addEventListener("click", e => { const x = e.target.closest(".kdx"); if (x) { kdDirty = true; x.closest(".kdrow").remove(); } });
$("kdlist").addEventListener("input", () => { kdDirty = true; });
$("kdlist").addEventListener("change", () => { kdDirty = true; });
$("kdf").addEventListener("submit", e => { e.preventDefault(); const dates = [];
  for (const r of $("kdlist").querySelectorAll(".kdrow")) {
    const name = r.querySelector(".kdn").value.trim(), date = r.querySelector(".kdd").value;
    if (!name && !date) continue;
    if (!name || !date) { toast("Each key date needs a name and a date."); return; }
    const a = audRead(r.querySelector(".aud")); dates.push({ id: r.dataset.id, name, date, depts: a.depts, heads: a.heads });
  }
  dates.sort((x, y) => x.date.localeCompare(y.date));
  setDoc(doc(db,"settings","event"), { dates }, { merge: true }).then(() => { kdDirty = false; toast("Key dates saved."); }).catch(fail); });

// ---------- who's online (presence/{email}: last seen while the tracker is open on screen) ----------
let presence = [], beatT = null;
const ONLINE_MS = 6 * 60e3, BEAT_MS = 3 * 60e3;
function beat(){ if (!me || document.visibilityState !== "visible") return; setDoc(doc(db,"presence",me.email), { name: me.name || "", dept: me.dept || "", at: serverTimestamp() }).catch(e => console.warn("presence", e)); }
function startPresence(){ clearInterval(beatT); beat(); beatT = setInterval(beat, BEAT_MS); }
function stopPresence(){ clearInterval(beatT); beatT = null; presence = []; $("onl").hidden = $("onl2").hidden = true; $("onlpop").hidden = true; }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") beat(); });
setInterval(() => { if (me) renderOnline(); }, 60e3);
const ini = n => String(n || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const pnm = p => people[p.email]?.nick || people[p.email]?.name || p.name || p.email;
function onlineNow(){ const now = Date.now();
  const L = presence.filter(p => p.email === me?.email || (p.at?.toMillis && now - p.at.toMillis() < ONLINE_MS));
  if (me && !L.some(p => p.email === me.email)) L.push({ email: me.email, name: me.name, dept: me.dept });
  return L.sort((a, b) => (a.email === me.email ? -1 : b.email === me.email ? 1 : 0) || String(pnm(a)).localeCompare(pnm(b))); }
function renderOnline(){ const L = me ? onlineNow() : [];
  const html = L.length ? `<span class="dot" aria-hidden="true"></span><span class="avs" aria-hidden="true">${L.slice(0, 3).map(p => `<span class="av" style="--dc:${col(p.dept)}">${esc(ini(pnm(p)))}</span>`).join("")}</span><span>${L.length}<span class="lbl"> online</span></span>` : "";
  ["onl", "onl2"].forEach(id => { const b = $(id); b.hidden = !me; b.innerHTML = html; b.setAttribute("aria-label", L.length + " online now"); b.title = "Who's online"; });
  if (!$("onlpop").hidden) paintOnl(); }
function paintOnl(){ const L = onlineNow(), now = Date.now();
  $("onlc").textContent = L.length + (L.length === 1 ? " person" : " people");
  $("onll").innerHTML = L.map(p => { const m = p.at?.toMillis ? Math.round((now - p.at.toMillis()) / 60000) : 0;
    return `<li><span class="av" style="--dc:${col(p.dept)}">${esc(ini(pnm(p)))}</span><span class="nm">${esc(pnm(p))}${p.email === me.email ? " (you)" : ""}<small>${esc(p.dept || "No department")}</small></span><span class="ago">${m < 2 ? "now" : m + " min ago"}</span></li>`; }).join(""); }
function toggleOnl(btn){ const pop = $("onlpop"); if (!pop.hidden) { pop.hidden = true; return; }
  paintOnl(); pop.hidden = false; const r = btn.getBoundingClientRect(), w = pop.offsetWidth;
  pop.style.top = (r.bottom + 8) + "px"; pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w)) + "px"; }
$("onl").onclick = e => { e.stopPropagation(); toggleOnl(e.currentTarget); };
$("onl2").onclick = e => { e.stopPropagation(); toggleOnl(e.currentTarget); };
document.addEventListener("click", e => { if (!$("onlpop").hidden && !e.target.closest("#onlpop,.onl")) $("onlpop").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("onlpop").hidden = true; });

// ---------- rename a task in place: double-click its name (computer only; a single click still opens the task) ----------
const finePointer = matchMedia("(pointer:fine)");
function inlTarget(el){
  if (!finePointer.matches) return null;
  const n = el.closest?.("#list .tlink, #mlist .mt"); if (!n) return null;
  const t = tasks.find(x => x.id === n.dataset.task);
  return t && canEdit(t) ? { node: n, t } : null;
}
function startInline(hit){
  if (inl) endInline(true);
  const { node, t } = hit, inp = document.createElement("input");
  inp.className = "inl-t"; inp.value = t.title || ""; inp.maxLength = 200; inp.setAttribute("aria-label", "Task name");
  let swap = node;
  if (node.classList.contains("mt")) { // My tasks: the whole row is a button, so swap it for a plain box holding the input
    swap = document.createElement("div"); swap.className = "mt inl-row"; swap.innerHTML = node.innerHTML;
    swap.querySelector(".mtt").replaceWith(inp); node.replaceWith(swap);
  } else node.replaceWith(inp);
  inl = { id: t.id, orig: t.title || "", inp };
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); endInline(true); } else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); endInline(false); } });
  inp.addEventListener("blur", () => endInline(true));
  inp.focus(); inp.select();
}
function endInline(save){
  if (!inl) return; const { id, orig, inp } = inl; inl = null;
  const v = inp.value.trim();
  if (save && v && v !== orig) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.title = v;
      updateDoc(doc(db,"tasks",id), { title: v, updatedBy: me.name, updatedAt: serverTimestamp() })
        .then(() => { logIt({ id, title: v }, "edit", "renamed"); toast("Renamed."); })
        .catch(e => { t.title = orig; render(); fail(e); }); }
  }
  inlPending = false; render();
}
document.addEventListener("dblclick", e => { const hit = inlTarget(e.target); if (!hit) return; e.preventDefault(); clearTimeout(openT); startInline(hit); });

// ---------- first-time tour (shown once per account; replay from the avatar menu) ----------
const TOUR_KEY = () => "tubc-tour-v1:" + (me?.email || "");
let tour = null;
const tourPick = (...sels) => sels.map(s => document.querySelector(s)).find(el => el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden") || null;
function tourSteps(){
  const nm = people[me.email]?.nick || String(me.name || "").split(" ")[0];
  const phone = innerWidth <= 760, ios = /iPhone|iPad/.test(navigator.userAgent);
  return [
    { title: `Welcome, ${nm}!`, text: "This is where the TUBC 2027 committee keeps track of every task. Here's a one-minute tour of the main parts." },
    { el: () => tourPick('.bnav a[data-v="mine"]', "#t-mine"), title: "Tasks",
      text: (me.dept ? `Opens on your department's tasks (${me.dept}).` : "Shows everyone's tasks until a PVP sets your department.") + " Overdue and the next 7 days come first, then each phase from Kickoff to TUBC, month by month. Switch to Everyone at the top to see all departments." },
    { el: () => tourPick("#mlist .mi"), title: "A task",
      text: tasks.some(canTask) ? "Tap the name to open details, steps, links and comments. Change the status with the box on the right." : "Tap the name to open details, links and comments. You can comment and @mention a person or a whole department (e.g. @Oper)." },
    seeOverview() && { el: () => tourPick("#b-overview", "#t-overview"), title: "Overview", text: "The big picture: progress by department and by phase." },
    { el: () => tourPick('.bnav a[data-v="calendar"]', "#t-calendar"), title: "Calendar",
      text: "Tasks by date, plus events like exam weeks." + (tasks.some(canEdit) ? " On a computer you can drag a task to another day, or click a day to add one." : "") + " You can also add the dates to your own Google Calendar." },
    { el: () => tourPick("#srchbtn", "#tsearch"), title: "Search", text: "Find any task by name, owner or notes." + (phone ? "" : " Shortcut: Ctrl+K (⌘K on Mac).") },
    { el: () => tourPick("#hb"), title: "Quick answers", text: "Tap for your department's tasks, what's overdue, or what's due today and tomorrow. No typing needed." },
    can("add") && { el: () => tourPick("#fab"), title: "Add a task", text: "Tap + to add a new task with a due date and owner." },
    { el: () => tourPick("#mename", "#menu"), title: "Your account",
      text: (tourPick("#mename") ? "Tap your name" : "Open the menu (☰), then your name") + " to edit your profile (nickname, LINE ID), get notified when someone tags you, and switch light or dark. You can replay this tour from there too." + (ios ? " On iPhone, add the site to your Home Screen first to get notifications." : "") },
    { title: "You're all set 🎉", text: "If you get stuck, ask your department head or a PVP. Have a great TUBC 2027!" }
  ].filter(Boolean);
}
function startTour(){
  if (!me || tour) return;
  closeUM(); closeMenu();
  if (curView !== "mine") location.hash = "#mine";
  setTimeout(() => {
    const steps = tourSteps().filter(s => !s.el || s.el());
    tour = { steps, i: 0, back: document.activeElement };
    $("tour").hidden = false; document.body.classList.add("touring");
    tourShow();
  }, 350);
}
function endTour(){
  if (!tour) return;
  try { localStorage.setItem(TOUR_KEY(), "1"); } catch {}
  $("tour").hidden = true; document.body.classList.remove("touring");
  const back = tour.back; tour = null; back?.focus?.();
}
function tourShow(){
  const s = tour.steps[tour.i], el = s.el ? s.el() : null, n = tour.steps.length;
  $("tourn").textContent = `${tour.i + 1} of ${n}`; $("tourt").textContent = s.title; $("tourp").textContent = s.text;
  $("tourback").hidden = tour.i === 0; $("tournext").textContent = tour.i === n - 1 ? "Done" : "Next";
  $("tourskip").hidden = tour.i === n - 1;
  if (el) { const r = el.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 20) el.scrollIntoView({ block: "center" }); }
  tourPlace(el);
  setTimeout(() => $("tournext").focus(), 50);
}
function tourPlace(el){
  const hole = $("tourhole"), card = $("tourcard"), pad = 6, cw = card.offsetWidth, ch = card.offsetHeight, m = 12;
  const W = innerWidth, Hh = innerHeight, outer = `M0 0H${W}V${Hh}H0Z`;
  if (!el) { $("tourpath").setAttribute("d", outer); hole.className = "tour-hole none"; Object.assign(card.style, { left: (W - cw) / 2 + "px", top: Math.max(m, (Hh - ch) / 2) + "px" }); return; }
  const r = el.getBoundingClientRect(), x = r.left - pad, y = r.top - pad, w = r.width + pad * 2, h = r.height + pad * 2, k = Math.min(12, w / 2, h / 2);
  // Dim everything except a rounded cut-out around the target (SVG even-odd fill draws reliably everywhere, unlike a huge box-shadow).
  $("tourpath").setAttribute("d", outer + `M${x + k} ${y}H${x + w - k}A${k} ${k} 0 0 1 ${x + w} ${y + k}V${y + h - k}A${k} ${k} 0 0 1 ${x + w - k} ${y + h}H${x + k}A${k} ${k} 0 0 1 ${x} ${y + h - k}V${y + k}A${k} ${k} 0 0 1 ${x + k} ${y}Z`);
  hole.className = "tour-hole";
  Object.assign(hole.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
  const below = r.bottom + pad + m + ch <= innerHeight, top = below ? r.bottom + pad + m : Math.max(m, r.top - pad - m - ch);
  const left = Math.min(innerWidth - cw - m, Math.max(m, r.left + r.width / 2 - cw / 2));
  Object.assign(card.style, { left: left + "px", top: top + "px" });
}
function tourGo(d){ if (!tour) return; const j = tour.i + d; if (j < 0) return; if (j >= tour.steps.length) return endTour(); tour.i = j; tourShow(); }
$("tournext").onclick = () => tourGo(1);
$("tourback").onclick = () => tourGo(-1);
$("tourskip").onclick = endTour;
$("umtour").onclick = () => { try { localStorage.removeItem(TOUR_KEY()); } catch {} startTour(); };
document.addEventListener("keydown", e => { if (!tour) return; if (e.key === "Escape") { e.preventDefault(); endTour(); } else if (e.key === "ArrowRight") tourGo(1); else if (e.key === "ArrowLeft") tourGo(-1); });
addEventListener("resize", () => { if (tour) tourPlace(tour.steps[tour.i].el ? tour.steps[tour.i].el() : null); });
addEventListener("scroll", () => { if (tour) tourPlace(tour.steps[tour.i].el ? tour.steps[tour.i].el() : null); }, { passive: true });
// Runs shortly after sign-in, once per account, when nothing else is open.
function maybeTour(){
  if (!me || tour || ["login", "noaccess"].includes(curView)) return;
  try { if (localStorage.getItem(TOUR_KEY())) return; } catch { return; }
  if (document.querySelector("dialog[open]")) { setTimeout(maybeTour, 3000); return; }
  startTour();
}

// ---------- notifications when someone tags you ----------
const NKEY="tubc-notify";
const notifSupported = () => "Notification" in window && !!navigator.serviceWorker;
try{ navigator.serviceWorker?.register("sw.js").then(r=>{ swReg=r; }).catch(e=>console.warn("sw",e)); }catch(e){ console.warn("sw",e); }
function notifOn(){ try{ return localStorage.getItem(NKEY)==="1" && Notification.permission==="granted"; }catch{ return false; } }
function paintNotif(){ const s=$("umnst"); if(!s) return; let t="Off", on=false;
  if(!notifSupported()) t=/iPhone|iPad/.test(navigator.userAgent)?"Add to Home Screen first":"Not supported";
  else if(Notification.permission==="denied") t="Blocked in browser";
  else if(notifOn()){ t="On"; on=true; }
  s.textContent=t; s.classList.toggle("on",on); }
$("umnotif").addEventListener("click",async()=>{ if(!notifSupported()){ toast(/iPhone|iPad/.test(navigator.userAgent)?"On iPhone: tap Share → Add to Home Screen, open TUBC 2027 from there, then turn this on.":"This browser can't show notifications."); return; }
  if(notifOn()){ try{ localStorage.setItem(NKEY,"0"); }catch{} paintNotif(); toast("Notifications off."); return; }
  if(Notification.permission==="denied"){ toast("Notifications are blocked. Allow them in your browser's site settings, then try again."); return; }
  const p=await Notification.requestPermission(); if(p==="granted"){ try{ localStorage.setItem(NKEY,"1"); }catch{} paintNotif(); showNote("Notifications are on","You'll get a notification here when someone tags you.",null); } else { paintNotif(); toast("Notifications weren't allowed."); } });
async function showNote(title,body,taskId,tag){ if(!notifOn()) return; const url=location.origin+location.pathname+(taskId?"?task="+encodeURIComponent(taskId):"")+"#mine";
  const opt={body,tag:tag||"tubc",icon:"icon.svg",badge:"icon.svg",data:{url,task:taskId||""}};
  try{ const r=swReg||await navigator.serviceWorker.ready; await r.showNotification(title,opt); }catch(e){ try{ const n=new Notification(title,opt); n.onclick=()=>{ focus(); if(taskId) openTask(taskId); n.close(); }; }catch(_){} } }
function notifyMentions(){ if(!me) return; const ids=new Set(comments.map(c=>c.id)); if(seenComments===null){ seenComments=ids; return; }
  comments.forEach(c=>{ if(seenComments.has(c.id)) return; if(!tagsMe(c)||c.email===me.email) return; const viaDept=!(c.mentions||[]).includes(me.email);
    const t=tasks.find(x=>x.id===c.task); if(document.visibilityState==="visible"&&document.hasFocus()&&$("td").open&&curTask===c.task) return;
    showNote(viaDept?`${c.by} tagged @${me.dept}`:`${c.by} tagged you`, `${t?t.title+": ":""}${String(c.text).slice(0,140)}`, c.task, "c"+c.id); });
  seenComments=ids; }
navigator.serviceWorker?.addEventListener("message",e=>{ if(e.data?.task){ const go=()=>tasks.length?openTask(e.data.task):setTimeout(go,300); go(); } });
(()=>{ const q=new URLSearchParams(location.search).get("task"); if(!q) return; const go=()=>{ if(me&&tasks.some(t=>t.id===q)){ openTask(q); history.replaceState(null,"",location.pathname+location.hash); } else setTimeout(go,400); }; setTimeout(go,600); })();
// Esc: let the closing animation play (dialogs with their own Esc handling call preventDefault first)
document.querySelectorAll("dialog").forEach(d=>d.addEventListener("cancel",e=>{ if(e.defaultPrevented) return; e.preventDefault(); d.close(); }));
