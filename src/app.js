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
const ST = {todo:"To do",prog:"In progress",blk:"Blocked",dn:"Done"};
const SLOTS = {"Oper":2,"Inven":1,"Doc":1,"CR":2,"PR":1,"Buddy":1,"Stage-co":1,"IT":2,"Photog":1,"ER":2,"Excur":1,"Treasurer":2,"Venue":1,"Case Writer":2,"Uni Affairs":1};
const OWNERS = {"Oper":"Puripat","Inven":"Puripat","Doc":"Puripat","Buddy":"Puripat and Sattam","CR":"Sattam","PR":"Sattam","Stage-co":"Krang","IT":"Krang","Photog":"Krang","ER":"All PVP","Excur":"All PVP","Treasurer":"All PVP","Venue":"All PVP","Case Writer":"Freelance · Competition team","Uni Affairs":"Freelance · Competition team"};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today = new Date().toISOString().slice(0,10);
const fmt = d => d ? new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}) + (d.slice(0,4)==="2026"?" ’26":"") : "";
const DEPTS = ["PVP", ...Object.keys(SLOTS)];
const RM = matchMedia("(prefers-reduced-motion: reduce)"); const motion = () => !RM.matches;
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
const DCOL = {"PVP":"#b4232a","President":"#b4232a","Oper":"#f76707","Inven":"#8d5524","Doc":"#66a80f","CR":"#e64980","PR":"#be4bdb","Buddy":"#e8a817","Stage-co":"#7048e8","IT":"#1c7ed6","Photog":"#15aabf","ER":"#2b8a3e","Excur":"#12b886","Treasurer":"#495057","Venue":"#4263eb","Case Writer":"#a61e4d","Uni Affairs":"#0b7285","All":"#868e96","All heads":"#868e96"};
const col = o => DCOL[o] || "#868e96";
const tcol = t => { const o=(t.depts&&t.depts.length?t.depts:toks(t.owner)); const d=o.find(x=>DCOL[x]&&!["All","All heads"].includes(x))||o[0]; return col(d); };
const ownHtml = s => toks(s).map(o=>`<span class="dt" style="--dc:${col(o)}">${esc(o)}</span>`).join(" ");
const thb = n => (Math.round(+n||0)).toLocaleString("en-US");
let seenComments = null, swReg = null;
let comments = [], people = {}, sponsors = [], sponsAccess = {see:["ER","PVP","Treasurer"],edit:["ER","PVP","Treasurer"]};

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
const BUILD="b20261124t";
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
function openMenu(){ $("drawer").classList.add("open"); $("scrim").hidden=false; $("menu").setAttribute("aria-expanded","true"); document.body.style.overflow="hidden"; setTimeout(()=>$("dclose").focus(),50); }
function closeMenu(){ $("drawer").classList.remove("open"); $("scrim").hidden=true; $("menu").setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
$("menu").onclick=openMenu; $("dclose").onclick=closeMenu; $("scrim").onclick=closeMenu;
document.querySelector(".tabs").addEventListener("click", e=>{ if(e.target.closest("a")) closeMenu(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeMenu(); });

// ---------- views ----------
const VIEWS = ["login","noaccess","profile","mine","overview","tracker","calendar","sponsors","structure","who","access"];
const PNAMES={profile:"My profile",mine:"My tasks",overview:"Overview",tracker:"Tracker",calendar:"Calendar",sponsors:"Sponsors",structure:"Team",who:"Team · Who to ask",access:"Access"};
let curView=null, prevView=null;
const VORDER=["mine","overview","tracker","calendar","sponsors","structure","who","profile","access"];
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
  for(const n of ["mine","overview","tracker","calendar","sponsors","team"]){ const a=$("t-"+n); if(n===tabOf) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }
  document.querySelectorAll(".subtabs a").forEach(a=>{ if(a.dataset.sub===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); a.hidden = a.dataset.sub==="who" && !isHeadUp(); });
  closeUM(); requestAnimationFrame(()=>{ moveTabBar(); moveSubBars(); }); if(prevView!==v) staggerIn(v); prevView=v;
  document.querySelectorAll("#bnav [data-v]").forEach(a=>{ if(a.dataset.v===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  updateFab(); if(v==="mine") markMentionsSeen(); if(v==="profile") renderProfile(); }
function route(){ if(!me) return; const h=location.hash.slice(1); const hh = h==="team" ? "structure" : h; const ok={profile:1,tracker:1,calendar:1,structure:1,who:isHeadUp(),access:isAdmin(),overview:seeOverview(),sponsors:seeSpons()}; show(ok[hh]?hh:"mine"); }
window.addEventListener("hashchange", ()=>{ route(); window.scrollTo(0,0); });

// ---------- auth ----------
const INAPP=/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok|musical_ly|Twitter|Snapchat|LinkedInApp|GSA\/|; ?wv\)/i.test(navigator.userAgent);
if(INAPP){ $("inapp").hidden=false; }
$("inappcopy").onclick=async()=>{ const url=location.origin+location.pathname; try{ await navigator.clipboard.writeText(url); toast("Link copied. Paste it into Safari or Chrome."); }catch{ prompt("Copy this link:",url); } };
$("login").onclick = async ()=>{ $("lerr").textContent=""; try{ const pv=new GoogleAuthProvider(); pv.setCustomParameters({prompt:"select_account"}); await signInWithPopup(auth,pv); }catch(e){ $("lerr").textContent = e.code==="auth/popup-blocked" ? "Allow pop-ups for this site, then try again." : e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request" ? "" : "Sign-in didn't finish. Try again, or open this page in Safari."; if(e.code!=="auth/popup-closed-by-user") $("inapp").hidden=false; } };
$("out").onclick = $("out2").onclick = ()=>{ closeMenu(); closeUM(); signOut(auth); };

onAuthStateChanged(auth, async u=>{
  unsub.forEach(fn=>fn()); unsub=[]; me=null; $("cdbar").hidden=true; logs=[]; mdPicked=false;
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
  $("me").hidden = false; document.querySelector(".tabs").hidden = false; $("menu").hidden = false; $("umaccess").hidden = !isAdmin(); applyStructView(); $("np").innerHTML=phOpts(-1); $("nwp").innerHTML=phOpts(-1);
  $("t-overview").hidden = !seeOverview(); $("b-overview").hidden = !seeOverview(); $("t-sponsors").hidden = !seeSpons();
  $("bnav").hidden = false; document.body.classList.add("authed");
  me.photo=u.photoURL||""; syncProfile(u);
  if(me.role==="head" && me.dept) f.own = me.dept;
  start(); route(); renderCd();
});

function start(){
  unsub.push(onSnapshot(collection(db,"tasks"), s=>{ tasks = s.docs.map(d=>({id:d.id,...d.data()})).filter(t=>phVis(t.phase)); $("save").textContent = "Live · synced"; render(); }, e=>{ fail(e); $("save").textContent="Not connected"; }));
  unsub.push(onSnapshot(doc(db,"settings","event"), s=>{ if(s.exists()) ev={...ev,...s.data()}; renderCd(); if($("kd1")){ $("kd1").value=ev.challenger||""; $("kd2").value=ev.tubc||""; } }, ()=>{}));
  unsub.push(onSnapshot(query(collection(db,"log"),orderBy("at","desc"),limit(200)), s=>{ logs=s.docs.map(d=>({id:d.id,...d.data()})); renderFeed(); if($("td").open&&curTask) renderHist(curTask); }, e=>console.warn("log",e)));
  unsub.push(onSnapshot(doc(db,"settings","permissions"), s=>{ const d=s.exists()?s.data():{}; perms={head:{...DEF_PERMS.head,...(d.head||{})},viewer:{...DEF_PERMS.viewer,...(d.viewer||{})}}; render(); renderHeads(); renderPerms(); }, fail));
  unsub.push(onSnapshot(collection(db,"heads"), s=>{ heads={}; s.docs.forEach(d=>heads[d.id]=d.data().list||[]); renderHeads(); }, fail));
  unsub.push(onSnapshot(query(collection(db,"comments"),orderBy("at","desc"),limit(500)), s=>{ comments=s.docs.map(d=>({id:d.id,...d.data()})); notifyMentions(); renderMentions(); if($("td").open&&curTask) renderComments(curTask); render(); }, e=>console.warn("comments",e)));
  unsub.push(onSnapshot(collection(db,"people"), s=>{ people={}; s.docs.forEach(d=>people[d.id]=d.data()); const p=people[me.email]; if(p?.name&&p.name!==me.name){ me.name=p.name; } paintMe(); if(curView==="profile") renderProfile(); if($("td").open&&curTask) renderComments(curTask); }, e=>console.warn("people",e)));
  unsub.push(onSnapshot(doc(db,"settings","sponsors"), s=>{ const d=s.exists()?s.data():{}; sponsAccess={see:d.see||["ER","PVP","Treasurer"],edit:d.edit||["ER","PVP","Treasurer"]}; applySponsAccess(); renderSponsAccess(); }, e=>console.warn("sponsAccess",e)));
  if(isAdmin()) unsub.push(onSnapshot(collection(db,"requests"), s=>{ requests = s.docs.map(d=>({email:d.id,...d.data()})).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0)); renderRequests(); }, fail));
  if(isAdmin()) unsub.push(onSnapshot(collection(db,"members"), s=>{ members = s.docs.map(d=>({email:d.id,...d.data()})).sort((a,b)=>a.email.localeCompare(b.email)); renderMembers(); }, fail));
}

// ---------- tracker ----------
function render(){
  const T = tasks, done = T.filter(t=>t.status==="dn").length;
  animNum("pct",$("pct").firstChild,T.length?Math.round(done/T.length*100):0,(n,v)=>{ n.nodeValue=v+"%"; });
  $("cnt").textContent = done+" of "+T.length+" tasks done";
  const p0=seeKickoff()?0:1, t0=Date.parse(PH[p0][2]), t1=Date.parse(PH[5][3]), now=Date.now();
  $("line").style.gridTemplateColumns = innerWidth>760 ? `repeat(${PH.length-p0},minmax(0,1fr))` : "";
  $("line").innerHTML = PH.map((p,i)=>{ if(!phVis(i)) return ""; const ts=T.filter(t=>t.phase===i),d=ts.filter(t=>t.status==="dn").length;return `<button class="seg" data-go="${i}"><b>${p[0]}</b><span>${p[1]} · ${d}/${ts.length}</span><div class="bar"><i data-k="ph${i}" data-w="${ts.length?d/ts.length*100:0}"></i></div></button>`}).join("") + (now>=t0&&now<=t1?`<div class="now" style="left:${(now-t0)/(t1-t0)*100}%"></div>`:"");
  const owners=[...new Set(T.flatMap(t=>toks(t.owner)))].sort();
  if(f.own && !owners.includes(f.own)) owners.push(f.own);
  $("own").innerHTML = '<option value="">Everyone</option>'+owners.map(o=>`<option${o===f.own?" selected":""}>${esc(o)}</option>`).join("");
  $("seed").hidden = !(isAdmin() && T.length===0);
  $("addf").hidden = !can("add");
  const before=new Map(); if(motion()) document.querySelectorAll("#list .row").forEach(r=>before.set(r.dataset.id,r.getBoundingClientRect().top));
  $("list").innerHTML = PH.map((p,i)=>{ if(!phVis(i)) return "";
    const rows=T.filter(t=>t.phase===i && (!f.own||toks(t.owner).includes(f.own)) && (!f.hide||t.status!=="dn") && (!f.late||(t.due<today&&t.status!=="dn"))).sort((a,b)=>ordKey(a)-ordKey(b));
    const d=T.filter(t=>t.phase===i&&t.status==="dn").length, n=T.filter(t=>t.phase===i).length;
    return `<section class="phase" id="ph${i}" data-phase="${i}"><h2>${p[0]}<span>${p[1]} · ${d} of ${n} done</span></h2><div class="rows" data-phase="${i}">${rows.length?rows.map(t=>{const ok=canTask(t),ed=canEdit(t),mv=canMove(t);return `<div class="row${t.status==="dn"?" done":""}${t.due<today&&t.status!=="dn"?" late":""}${jd(t.id)}" style="--dc:${tcol(t)}" data-id="${t.id}"${mv?' draggable="true"':""}><span class="grip${mv?"":" off"}" title="${mv?"Drag to move":""}" aria-hidden="true">⋮⋮</span><button class="tick" data-tick="${t.id}" aria-label="Mark done"${ok?"":" disabled"}>✓</button><div class="meta m1"><span class="d">${fmt(t.due)}</span></div><div class="tcell"><button type="button" class="t tlink" data-task="${t.id}">${esc(t.title)}</button>${t.note?`<span class="n">${esc(t.note)}</span>`:""}${extras(t)}${t.updatedBy?`<span class="by">Updated by ${esc(t.updatedBy)}</span>`:""}</div><div class="meta m2"><span class="o">${ownHtml(t.owner)}</span><select class="st ${t.status}" data-st="${t.id}" aria-label="Status"${ok?"":" disabled"}>${Object.entries(ST).map(([v,l])=>`<option value="${v}"${v===t.status?" selected":""}>${l}</option>`).join("")}</select></div><div class="acts">${ed?`<button class="ico" data-edit="${t.id}" aria-label="Edit task" title="Edit">✎</button>`:""}${can("del")?`<button class="del" data-del="${t.id}" aria-label="Delete task">×</button>`:""}</div></div>`}).join(""):`<p class="empty drop-empty">${T.length?(f.own||f.hide||f.late?"Nothing here with these filters.":"No tasks in this topic yet."):"No tasks yet."}</p>`}</div></section>`;
  }).join("");
  animBars($("line"));
  if(before.size) document.querySelectorAll("#list .row").forEach(r=>{ const o=before.get(r.dataset.id); if(o==null) return; const dy=o-r.getBoundingClientRect().top;
    if(Math.abs(dy)>1&&Math.abs(dy)<2000) r.animate([{transform:`translateY(${dy}px)`},{transform:"none"}],{duration:300,easing:"cubic-bezier(.2,.8,.2,1)"}); });
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
  else if(b.dataset.go!==undefined){ $("ph"+b.dataset.go)?.scrollIntoView({behavior:"smooth"}); }
  else if(b.dataset.dept){ openDept(b.dataset.dept); }
  else if(b.dataset.rm){ if(b.dataset.armed){ deleteDoc(doc(db,"members",b.dataset.rm)).catch(fail); } else { b.dataset.armed=1; b.textContent="Remove?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent="Remove"; } },3000); } }
});
document.addEventListener("change", e=>{
  const el=e.target;
  if(el.dataset.st) setStatus(el.dataset.st, el.value);
  if(el.id==="own"){ f.own=el.value; render(); }
  if(el.dataset.role) setDoc(doc(db,"members",el.dataset.role),{role:el.value},{merge:true}).catch(fail);
  if(el.dataset.mdept) setDoc(doc(db,"members",el.dataset.mdept),{dept:el.value},{merge:true}).catch(fail);
});
$("hide").onclick=()=>{f.hide=!f.hide;$("hide").setAttribute("aria-pressed",f.hide);render();};
$("late").onclick=()=>{f.late=!f.late;$("late").setAttribute("aria-pressed",f.late);render();};
$("np").innerHTML = phOpts(-1);
function addTask(title,due,owner,phase){ return addDoc(collection(db,"tasks"),{title,due,owner,depts:toks(owner),status:"todo",phase,note:"",order:due?Date.parse(due)/86400000:99999,updatedBy:me.name,updatedAt:serverTimestamp()}).then(r=>{ logIt({id:r.id,title},"add","Added for "+owner); toast("Task added."); return r; }); }
$("addf").addEventListener("submit", e=>{ e.preventDefault(); const title=$("nt").value.trim(); if(!title) return; const owner=$("no").value.trim()||"PVP";
  addTask(title,$("nd").value,owner,+$("np").value).then(()=>{ $("nt").value=""; setPick("no","PVP");}).catch(fail); });
$("seed").onclick = async ()=>{ const b=writeBatch(db); SEED.forEach(t=>b.set(doc(collection(db,"tasks")),{title:t[0],due:t[1],owner:t[2],depts:toks(t[2]),status:"todo",phase:t[4],note:t[5]||"",order:Date.parse(t[1])/86400000,updatedBy:"",updatedAt:serverTimestamp()})); try{ await b.commit(); toast("Starter tasks loaded."); }catch(e){ fail(e); } };


// ---------- calendar ----------
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
let cm=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1);})();
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const chip=t=>`<button type="button" style="--dc:${tcol(t)}" class="chip2 ${t.status}${t.due<today&&t.status!=="dn"?" late":""}" data-task="${t.id}" title="${esc(t.title)} · ${esc(t.owner)}">${esc(t.title)}</button>`;
function renderCal(){
  if(!$("cal")) return; fillGDept();
  const owners=[...new Set(tasks.flatMap(t=>toks(t.owner)))].sort(); if(f.own&&!owners.includes(f.own)) owners.push(f.own);
  $("cown").innerHTML='<option value="">Everyone</option>'+owners.map(o=>`<option${o===f.own?" selected":""}>${esc(o)}</option>`).join("");
  const T=tasks.filter(t=>t.due&&(!f.own||toks(t.owner).includes(f.own)));
  const by={}; T.forEach(t=>(by[t.due]=by[t.due]||[]).push(t));
  const y=cm.getFullYear(), m=cm.getMonth();
  $("cmon").textContent=MON[m]+" "+y;
  const inMonth=T.filter(t=>t.due.startsWith(`${y}-${String(m+1).padStart(2,"0")}`));
  const open=inMonth.filter(t=>t.status!=="dn").length;
  $("csub").textContent=inMonth.length?`${inMonth.length} task${inMonth.length>1?"s":""} due this month · ${open} still open`:"No tasks due this month";
  const start=new Date(y,m,1); const lead=(start.getDay()+6)%7; const first=new Date(y,m,1-lead);
  const weeks=Math.ceil((lead+new Date(y,m+1,0).getDate())/7);
  let html=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="dow">${d}</div>`).join("");
  for(let i=0;i<weeks*7;i++){ const d=new Date(first.getFullYear(),first.getMonth(),first.getDate()+i), k=iso(d), ts=(by[k]||[]);
    html+=`<div class="day${d.getMonth()!==m?" out":""}${k===today?" today":""}"><span class="dn2">${d.getDate()}</span>${ts.slice(0,3).map(chip).join("")}${ts.length>3?`<button type="button" class="more" data-day="${k}">+${ts.length-3} more</button>`:""}</div>`; }
  $("cal").innerHTML=html;
  const days=Object.keys(by).filter(k=>k.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).sort();
  $("agenda").innerHTML=days.length?days.map(k=>`<div class="ag"><h3>${new Date(k+"T00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</h3>${by[k].map(chip).join("")}</div>`).join(""):`<p class="empty">No tasks due this month.</p>`;
}
$("cprev").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()-1,1);renderCal();};
$("cnext").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()+1,1);renderCal();};
$("ctoday").onclick=()=>{const d=new Date();cm=new Date(d.getFullYear(),d.getMonth(),1);renderCal();};
$("cown").addEventListener("change",e=>{f.own=e.target.value;render();});
let curTask=null;
function openTask(id){ const t=tasks.find(x=>x.id===id); if(!t) return; curTask=id;
  $("tdt").textContent=t.title; $("tdm").textContent=`Due ${fmt(t.due)} · ${t.owner} · ${PH[t.phase]?.[0]||""}`;
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
  const done=()=>{ d.classList.remove("closing"); d.style.transition=d.style.transform=""; try{d.close();}catch(e){d.removeAttribute("open");} };
  if(!sheetMQ.matches||!motion()){ done(); return; }
  d.classList.add("closing"); d.style.transition="transform .22s ease-in"; d.style.transform="translateY(100%)"; setTimeout(done,220); }
let shY=null, shDy=0;
$("td").addEventListener("pointerdown",e=>{ const d=$("td"); if(!sheetMQ.matches||d.scrollTop>0||!e.target.closest(".grab,.dh")||e.target.closest("button")) return;
  shY=e.clientY; shDy=0; d.style.transition="none"; try{d.setPointerCapture(e.pointerId);}catch(_){} });
$("td").addEventListener("pointermove",e=>{ if(shY==null) return; shDy=Math.max(0,e.clientY-shY); $("td").style.transform=shDy?`translateY(${shDy}px)`:""; });
const shEnd=()=>{ if(shY==null) return; const d=$("td"); shY=null; if(shDy>90) closeTd(); else { d.style.transition="transform .2s ease-out"; d.style.transform=""; } };
$("td").addEventListener("pointerup",shEnd); $("td").addEventListener("pointercancel",shEnd);
$("td").addEventListener("cancel",e=>{ if(sheetMQ.matches&&motion()){ e.preventDefault(); closeTd(); } });
$("td").addEventListener("click",e=>{ if(sheetMQ.matches&&e.target===$("td")&&e.clientY<$("td").getBoundingClientRect().top) closeTd(); });
document.addEventListener("click",e=>{ const c=e.target.closest("[data-task]"); if(c){ openTask(c.dataset.task); return; } const mo=e.target.closest("[data-day]"); if(mo){ const ts=tasks.filter(t=>t.due===mo.dataset.day&&(!f.own||toks(t.owner).includes(f.own))); mo.outerHTML=ts.slice(3).map(chip).join(""); } });


// ---------- edit + drag ----------
let editId=null;
function openEdit(id){ const t=tasks.find(x=>x.id===id); if(!t||!canEdit(t)) return; editId=id;
  $("et").value=t.title||""; $("edue").value=t.due||""; setPick("eown",t.owner||""); $("enote").value=t.note||"";
  $("eph").innerHTML=phOpts(t.phase);
  try{ $("td").close(); }catch(e){}
  try{$("ed").showModal();}catch(e){$("ed").setAttribute("open","");} setTimeout(()=>$("et").focus(),50); }
const closeE=()=>{ try{$("ed").close();}catch(e){$("ed").removeAttribute("open");} };
$("edx").onclick=closeE; $("edc").onclick=closeE;
$("edf").addEventListener("submit", e=>{ e.preventDefault(); const t=tasks.find(x=>x.id===editId); if(!t) return;
  const title=$("et").value.trim(); if(!title) return; const owner=$("eown").value.trim()||"PVP"; const due=$("edue").value; const phase=+$("eph").value;
  const upd={title,due,owner,depts:toks(owner),note:$("enote").value.trim(),phase,updatedBy:me.name,updatedAt:serverTimestamp()};
  if(due!==t.due && typeof t.order!=="number") upd.order=due?Date.parse(due)/86400000:99999;
  if(phase!==t.phase){ const inP=tasks.filter(x=>x.phase===phase&&x.id!==t.id); upd.order=inP.length?Math.max(...inP.map(ordKey))+1:ordKey(t); }
  const ch=[]; if(title!==t.title) ch.push("renamed"); if(due!==(t.due||"")) ch.push(`due ${fmt(t.due)||"none"} → ${fmt(due)||"none"}`); if(owner!==t.owner) ch.push(`owner ${t.owner} → ${owner}`); if(phase!==t.phase) ch.push(`moved to ${PH[phase][0]}`); if(upd.note!==(t.note||"")) ch.push("note updated");
  updateDoc(doc(db,"tasks",editId),upd).then(()=>{ if(ch.length) logIt({id:t.id,title},"edit",ch.join(", ")); closeE();toast("Task saved.");}).catch(fail); });
$("tde").onclick=()=>{ if(curTask) openEdit(curTask); };

let dragId=null;
const clearDrop=()=>document.querySelectorAll(".drop-before,.drop-after,.drop-into").forEach(el=>el.classList.remove("drop-before","drop-after","drop-into"));
document.addEventListener("dragstart", e=>{ const r=e.target.closest?.(".row[draggable]"); if(!r) return; dragId=r.dataset.id; r.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; try{e.dataTransfer.setData("text/plain",dragId);}catch(_){} });
document.addEventListener("dragend", ()=>{ dropAt=null; document.querySelectorAll(".dragging").forEach(el=>el.classList.remove("dragging")); clearDrop(); dragId=null; });
let dropAt=null;
document.addEventListener("dragover", e=>{ if(!dragId) return; const box=e.target.closest?.(".rows"); if(!box) return; e.preventDefault();
  const r=e.target.closest(".row");
  if(r && r.dataset.id!==dragId){ const b=r.getBoundingClientRect(), mid=b.top+b.height/2; let pos=e.clientY<mid?"before":"after";
    if(dropAt&&dropAt.el===r&&Math.abs(e.clientY-mid)<18) pos=dropAt.pos;
    if(!dropAt||dropAt.el!==r||dropAt.pos!==pos){ clearDrop(); r.classList.add("drop-"+pos); dropAt={el:r,pos}; } }
  else if(!r && !box.classList.contains("drop-into")){ clearDrop(); dropAt=null; box.classList.add("drop-into"); } });
document.addEventListener("drop", e=>{ if(!dragId) return; const box=e.target.closest?.(".rows"); if(!box) return; e.preventDefault();
  const phase=+box.dataset.phase; const r=e.target.closest(".row"); const ids=[...box.querySelectorAll(".row")].map(x=>x.dataset.id).filter(id=>id!==dragId);
  let idx=ids.length; if(r && r.dataset.id!==dragId){ const b=r.getBoundingClientRect(); idx=ids.indexOf(r.dataset.id)+(r.classList.contains("drop-before")?0:r.classList.contains("drop-after")?1:(e.clientY<b.top+b.height/2?0:1)); }
  const key=id=>ordKey(tasks.find(x=>x.id===id));
  const prev=idx>0?key(ids[idx-1]):null, next=idx<ids.length?key(ids[idx]):null;
  const order= prev==null&&next==null ? ordKey(tasks.find(x=>x.id===dragId)) : prev==null ? next-1 : next==null ? prev+1 : (prev+next)/2;
  const t=tasks.find(x=>x.id===dragId); clearDrop(); const id=dragId; dragId=null;
  if(!t || (t.phase===phase && ordKey(t)===order)) return;
  const oldP=t.phase; t.phase=phase; t.order=order; render();
  updateDoc(doc(db,"tasks",id),{phase,order,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>{ if(oldP!==phase) logIt(t,"move",`Moved to ${PH[phase][0]}`); }).catch(fail); });

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
function gcalUrl(t){ const p=new URLSearchParams({action:"TEMPLATE",text:"[TUBC] "+t.title,dates:ymd(t.due)+"/"+nextDay(t.due),details:[t.note,"Owner: "+t.owner,"Topic: "+(PH[t.phase]?.[0]||""),"Tracker: "+location.origin+location.pathname].filter(Boolean).join("\n")}); return "https://calendar.google.com/calendar/render?"+p.toString(); }
const icsEsc = s => String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
$("cics").onclick=()=>{ const T=gTasks(); const gd=$("gdept").value;
  if(!T.length){ toast("No tasks with dates to export."); return; }
  const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//TUBC 2027//Tracker//EN","CALSCALE:GREGORIAN","X-WR-CALNAME:TUBC 2027"+(gd?" · "+gd:"")];
  T.forEach(t=>lines.push("BEGIN:VEVENT","UID:"+t.id+"@tubc-2027","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+ymd(t.due),"DTEND;VALUE=DATE:"+nextDay(t.due),"SUMMARY:"+icsEsc("[TUBC] "+t.title),"DESCRIPTION:"+icsEsc([t.note,"Owner: "+t.owner,"Status: "+ST[t.status]].filter(Boolean).join("\n")),"END:VEVENT"));
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
  start:{date:t.due}, end:{date:nextIso(t.due)}, transparency:"transparent",
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
function renderFeed(){ if(!$("feed")) return; const L=logs.slice(0,25);
  $("feed").innerHTML=L.length?L.map(l=>`<li><b>${esc(l.by||"Someone")}</b> ${VERB[l.action]||"changed"} ${tasks.some(t=>t.id===l.task)?`<button type="button" class="ft" data-task="${esc(l.task)}">${esc(l.title)}</button>`:`<i>${esc(l.title)}</i>`}<br><span class="fd">${esc(l.detail||"")}</span><time>${rel(l.at)}</time></li>`).join(""):'<li class="fd">No changes yet. Edits and status updates will show up here.</li>'; }
function renderHist(id){ if(!$("tdh")) return; const L=logs.filter(l=>l.task===id).slice(0,8);
  $("tdh").innerHTML=L.length?'<h4>History</h4><ul>'+L.map(l=>`<li><b>${esc(l.by||"")}</b>: ${esc(l.detail||VERB[l.action]||"")}<time>${rel(l.at)}</time></li>`).join("")+"</ul>":""; }

// ---------- countdown ----------
function renderCd(){ const el=$("cdbar"); if(!el) return; if(!me){ el.hidden=true; return; }
  const d0=new Date(iso(new Date())+"T00:00");
  const item=(lbl,d)=>{ if(!d) return ""; const n=Math.round((new Date(d+"T00:00")-d0)/864e5);
    const txt = n>1?`<b>${n}</b> days`: n===1?`<b>Tomorrow</b>`: n===0?`<b>Today</b>`:`Done ✓`;
    return `<div class="cdi${n<0?" past":""}${n>=0&&n<=14?" soon":""}"><em>${lbl}</em><span>${txt}</span><small>${fmt(d)}${d.slice(0,4)!=="2026"?" "+d.slice(0,4):""}</small></div>`; };
  $("cdin").innerHTML=item("The Challenger",ev.challenger)+item("TUBC",ev.tubc); el.hidden=false; }
$("kdf").addEventListener("submit",e=>{ e.preventDefault(); setDoc(doc(db,"settings","event"),{challenger:$("kd1").value,tubc:$("kd2").value},{merge:true}).then(()=>toast("Key dates saved.")).catch(fail); });

// ---------- my tasks ----------
let mdPicked=false;
$("mdept").addEventListener("change",()=>{ mdPicked=true; renderMine(); });
$("mall").addEventListener("change",renderMine);
function renderMine(){ if(!$("mlist")||!me) return;
  const sel=$("mdept"), cur=mdPicked?sel.value:(me.dept||"");
  sel.innerHTML='<option value="">Choose a department…</option>'+DEPTS.map(d=>`<option${d===cur?" selected":""}>${esc(d)}</option>`).join(""); sel.value=cur;
  if(!cur){ $("mlist").innerHTML='<p class="mempty">Pick a department above to see its tasks. Ask a PVP to set your department in Access so this opens automatically.</p>'; $("msum").textContent="What your department needs to do next."; $("mbarf").style.width="0"; renderFeed(); return; }
  const inc=$("mall").checked, shared=["All","All heads"];
  const T=tasks.filter(t=>{ const o=t.depts?.length?t.depts:toks(t.owner); return o.includes(cur)||(cur==="PVP"&&o.includes("President"))||(inc&&o.some(x=>shared.includes(x))); });
  const td=iso(new Date()), plus=n=>{ const x=new Date(); x.setDate(x.getDate()+n); return iso(x); }, w=plus(7), m=plus(30);
  const open=T.filter(t=>t.status!=="dn").sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999")), done=T.filter(t=>t.status==="dn");
  const G=[["over","Overdue",open.filter(t=>t.due&&t.due<td)],["week","Due in the next 7 days",open.filter(t=>t.due&&t.due>=td&&t.due<=w)],["month","Next 30 days",open.filter(t=>t.due>w&&t.due<=m)],["later","Later",open.filter(t=>t.due>m)],["nod","No date",open.filter(t=>!t.due)]];
  const item=t=>`<li class="mi ${t.status}${jd(t.id)}" style="--dc:${tcol(t)}"><button type="button" class="mt" data-task="${t.id}"><span class="md">${t.due?fmt(t.due):"—"}</span><span class="mtt">${esc(t.title)}</span><span class="mo">${esc(t.owner)} · ${PH[t.phase]?.[0]||""}</span></button><select class="st ${t.status}" data-st="${t.id}" aria-label="Status"${canTask(t)?"":" disabled"}>${Object.entries(ST).map(([v,l])=>`<option value="${v}"${v===t.status?" selected":""}>${l}</option>`).join("")}</select></li>`;
  const over=G[0][2].length;
  $("msum").textContent=`${cur}: ${open.length} open${over?` · ${over} overdue`:""} · ${done.length} of ${T.length} done`;
  $("mbarf").dataset.k="mine-"+cur; $("mbarf").dataset.w=T.length?done.length/T.length*100:0; animBars($("mbarf").parentNode);
  $("mlist").innerHTML=(open.length?G.filter(g=>g[2].length).map(([k,l,a])=>`<section class="mg ${k}"><h2>${l} <span class="n">${a.length}</span></h2><ul>${a.map(item).join("")}</ul></section>`).join(""):'<p class="mempty">Nothing open for this department. 🎉</p>')
    +(done.length?`<details class="mdone"><summary>Done (${done.length})</summary><ul style="list-style:none;padding:0;display:grid;gap:8px;margin-top:8px">${done.map(item).join("")}</ul></details>`:"");
  renderFeed(); }

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
  $("tckl").innerHTML=ck.map((c,i)=>`<li class="${c.d?"on":""}"><input type="checkbox" id="ck${i}" data-ck="${i}"${c.d?" checked":""}${ok?"":" disabled"}><label for="ck${i}">${esc(c.t)}</label>${ok?`<button type="button" class="mini" data-ckrm="${i}" aria-label="Remove step">×</button>`:""}</li>`).join("")||(ok?"":'<li class="fd" style="color:var(--mute);font-size:14px">No steps.</li>');
  $("tckf").hidden=!ok; $("tck").hidden=!n&&!ok; }
function saveSteps(t,checks,what){ t.checks=checks; renderSteps(t); render();
  return updateDoc(doc(db,"tasks",t.id),{checks,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>{ if(what) logIt(t,"edit",what); }).catch(fail); }
$("tckf").addEventListener("submit",e=>{ e.preventDefault(); const t=tasks.find(x=>x.id===curTask), v=$("tcki").value.trim(); if(!t||!v) return; if((t.checks||[]).length>=40){ toast("Up to 40 steps per task."); return; }
  saveSteps(t,[...(t.checks||[]),{t:v.slice(0,140),d:false}],"step added: "+v.slice(0,80)); $("tcki").value=""; $("tcki").focus(); });
$("tckl").addEventListener("change",e=>{ const i=e.target.dataset.ck; if(i==null) return; const t=tasks.find(x=>x.id===curTask); if(!t) return;
  const ck=(t.checks||[]).map((c,j)=>j==i?{...c,d:e.target.checked}:c); saveSteps(t,ck,(e.target.checked?"ticked: ":"unticked: ")+String(ck[i].t).slice(0,80)); });
$("tckl").addEventListener("click",e=>{ const b=e.target.closest("[data-ckrm]"); if(!b) return; const t=tasks.find(x=>x.id===curTask); if(!t) return;
  const ck=[...(t.checks||[])]; const [rm]=ck.splice(+b.dataset.ckrm,1); saveSteps(t,ck,"step removed: "+String(rm?.t||"").slice(0,80)); });

// ---------- task links ----------
function linkKind(u){ try{ const h=new URL(u).hostname; if(/docs\.google/.test(h)) return ["#1a73e8","G"]; if(/drive\.google/.test(h)) return ["#188038","D"]; if(/canva/.test(h)) return ["#7d2ae8","C"]; if(/figma/.test(h)) return ["#a259ff","F"]; if(/notion/.test(h)) return ["#37352f","N"]; if(/airtable/.test(h)) return ["#f82b60","A"]; return ["#868e96","↗"]; }catch{ return ["#868e96","↗"]; } }
function renderLinks(t){ const L=t.links||[], ok=canEdit(t);
  $("tlkl").innerHTML=L.map((l,i)=>{ const [c,k]=linkKind(l.u); let host=""; try{ host=new URL(l.u).hostname.replace(/^www\./,""); }catch{}
    return `<li><a href="${esc(l.u)}" target="_blank" rel="noopener noreferrer"><span class="lic" style="background:${c}">${k}</span><b>${esc(l.l||host||l.u)}</b><span class="lh">${esc(host)}</span></a>${ok?`<button type="button" class="mini" data-lkrm="${i}" aria-label="Remove link">×</button>`:""}</li>`; }).join("");
  $("tlkf").hidden=!ok; $("tlk").hidden=!L.length&&!ok; }
$("tlkf").addEventListener("submit",e=>{ e.preventDefault(); const t=tasks.find(x=>x.id===curTask); if(!t) return; let u=$("tlku").value.trim();
  if(!/^https?:\/\//i.test(u)){ toast("Links must start with https://"); return; } if((t.links||[]).length>=20){ toast("Up to 20 links per task."); return; }
  const l=$("tlkn").value.trim().slice(0,60); const links=[...(t.links||[]),{u:u.slice(0,500),l}]; t.links=links; renderLinks(t); render();
  updateDoc(doc(db,"tasks",t.id),{links,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>logIt(t,"edit","link added: "+(l||u).slice(0,80))).catch(fail); $("tlku").value=""; $("tlkn").value=""; });
$("tlkl").addEventListener("click",e=>{ const b=e.target.closest("[data-lkrm]"); if(!b) return; const t=tasks.find(x=>x.id===curTask); if(!t) return;
  const links=[...(t.links||[])]; const [rm]=links.splice(+b.dataset.lkrm,1); t.links=links; renderLinks(t); render();
  updateDoc(doc(db,"tasks",t.id),{links,updatedBy:me.name,updatedAt:serverTimestamp()}).then(()=>logIt(t,"edit","link removed: "+(rm?.l||rm?.u||"").slice(0,80))).catch(fail); });

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
  const done=tasks.length-open.length, blk=open.filter(t=>t.status==="blk").length;
  $("okpi").innerHTML=[[tasks.length?Math.round(done/tasks.length*100):0,"%","done overall","","ov-pct"],[open.length,"","open tasks","","ov-open"],[late.length,"","overdue",late.length?"warn":"","ov-late"],[blk,"","blocked",blk?"warn":"","ov-blk"]].map(([n,suf,s,c,k])=>`<div class="kpi ${c}"><b data-n="${n}" data-k="${k}" data-suf="${suf}">${n}${suf}</b><span>${s}</span></div>`).join(""); countUp($("okpi"));
  const own=t=>t.depts&&t.depts.length?t.depts:toks(t.owner);
  $("ogrid").innerHTML=DEPTS.map(d=>{ const T=tasks.filter(t=>own(t).includes(d)||(d==="PVP"&&own(t).includes("President"))); const dn=T.filter(t=>t.status==="dn").length, op=T.filter(t=>t.status!=="dn");
    const lt=op.filter(t=>t.due&&t.due<td).length, bk=op.filter(t=>t.status==="blk").length, nx=op.filter(t=>t.due).sort((a,b)=>a.due.localeCompare(b.due))[0];
    const hs=(heads[d]||[]).filter(x=>x.name).map(x=>x.name).join(", ");
    const pc=T.length?Math.round(dn/T.length*100):0;
    return `<button type="button" class="oc" style="--dc:${col(d)}" data-ogo="${esc(d)}"><div class="otop"><div><h3>${esc(d)}</h3><div class="hn2">${d==="PVP"?"Puripat, Sattam, Krang":esc(hs||"Heads TBC")}</div></div><span class="orw${pc===100?" full":""}" role="img" aria-label="${pc}% done"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="otr" cx="22" cy="22" r="18" pathLength="100"/><circle class="orc" cx="22" cy="22" r="18" pathLength="100" data-ring="${pc}" data-rk="r-${esc(d)}"/></svg><b data-n="${pc}" data-k="ov-r-${esc(d)}" data-suf="%">${pc}%</b></span></div><div class="ost"><span>${dn}/${T.length} done</span>${lt?`<span class="bad">${lt} overdue</span>`:""}${bk?`<span class="bad">${bk} blocked</span>`:""}</div>${nx?`<div class="onext">Next: <b>${fmt(nx.due)}</b> ${esc(nx.title)}</div>`:`<div class="onext" style="color:var(--mute)">${T.length?"Nothing open 🎉":"No tasks yet"}</div>`}</button>`; }).join("");
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
function updateFab(){ const v=curView; let show=false, label="Add task";
  if(me&&!["login","noaccess"].includes(v)){ if(v==="sponsors"){ show=canSpons(); label="Add sponsor"; } else if(["mine","tracker","calendar","overview"].includes(v)){ show=can("add"); } }
  $("fab").hidden=!show; $("fab").setAttribute("aria-label",label); $("fab").title=label; updateBot(); }
$("nwp").innerHTML=phOpts(-1);
function openNew(){ $("nwtt").value=""; $("nwd2").value=""; const own=me?.dept&&me.role==="head"?me.dept:"PVP"; setPick("nwo",own);
  const td=iso(new Date()); const ph=PH.findIndex(p=>td>=p[2]&&td<p[3]); $("nwp").value=String(Math.max(ph<0?0:ph, phVis(0)?0:1));
  try{$("nwd").showModal();}catch(e){$("nwd").setAttribute("open","");} setTimeout(()=>$("nwtt").focus(),50); }
const closeN=()=>{ try{$("nwd").close();}catch(e){$("nwd").removeAttribute("open");} };
$("nwx").onclick=closeN; $("nwc").onclick=closeN;
$("nwf").addEventListener("submit",e=>{ e.preventDefault(); const title=$("nwtt").value.trim(); if(!title) return; addTask(title,$("nwd2").value,$("nwo").value.trim()||"PVP",+$("nwp").value).then(closeN).catch(fail); });
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
    else hbSay(`<p class="sum">${esc(me.dept)} + shared tasks</p>`+hbGroups([["over","Overdue",over],["","Next 7 days",week]],td,"#mine","My tasks"),true);
  } else if(k==="over"){
    const a=open.filter(t=>t.due&&t.due<td).sort(hbByDue);
    hbSay(a.length?`<p class="sum">Across all departments, oldest first</p>`+hbGroups([["over","Overdue",a]],td,"late","Tracker"):"Nothing is overdue. 🎉",a.length>0);
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
function hbGo(go){ closeBot(); if(go==="late"){ if(location.hash!=="#tracker") location.hash="#tracker"; if(!f.late) $("late").click(); } else location.hash=go; }
$("hb").onclick=()=>{ if($("hp").hidden) openBot(); else closeBot(); };
$("hpx").onclick=()=>{ closeBot(); $("hb").focus(); };
$("hch").addEventListener("click",e=>{ const b=e.target.closest("[data-hb]"); if(b) hbAsk(b.textContent,b.dataset.hb); });
$("hlog").addEventListener("click",e=>{ const g=e.target.closest("[data-go]"); if(g) hbGo(g.dataset.go); }); // task rows open via the page-wide [data-task] handler
$("hp").addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); closeBot(); $("hb").focus(); } });
document.addEventListener("click",e=>{ if($("hp").hidden) return; if(!e.target.isConnected||e.target.closest("#hp,#hb,dialog")) return; closeBot(); });

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
