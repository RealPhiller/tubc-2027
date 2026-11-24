// Build index.html from src/, or split an existing index.html back into src/.
//   node tools/build.mjs          -> writes index.html from src/head.html + src/app.js + src/tail.html
//   node tools/build.mjs --split  -> one-time: creates src/ from the current index.html
//   node tools/build.mjs --check  -> syntax-checks src/app.js without writing anything
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OPEN = '<script type="module">\n', CLOSE = "</script>";
const arg = process.argv[2] || "";

if (arg === "--split") {
  const html = readFileSync("index.html", "utf8");
  const a = html.indexOf(OPEN);
  if (a < 0 || html.indexOf(OPEN, a + 1) >= 0) throw new Error("Expected exactly one module script in index.html");
  const b = html.indexOf(CLOSE, a + OPEN.length);
  mkdirSync("src", { recursive: true });
  writeFileSync("src/head.html", html.slice(0, a));
  writeFileSync("src/app.js", html.slice(a + OPEN.length, b));
  writeFileSync("src/tail.html", html.slice(b + CLOSE.length));
  console.log("Split index.html into src/head.html, src/app.js, src/tail.html");
  process.exit(0);
}

if (!existsSync("src/app.js")) throw new Error("src/ is missing. Run: node tools/build.mjs --split");
const head = readFileSync("src/head.html", "utf8"), app = readFileSync("src/app.js", "utf8"), tail = readFileSync("src/tail.html", "utf8");
if (app.includes(CLOSE)) throw new Error("src/app.js must not contain a literal </script>");

// Syntax check the module before writing.
const tmp = join(tmpdir(), "tubc-app-check.mjs");
writeFileSync(tmp, app);
execFileSync(process.execPath, ["--check", tmp], { stdio: "inherit" });
if (arg === "--check") { console.log("src/app.js: syntax OK"); process.exit(0); }

const build = (app.match(/const BUILD="([^"]+)"/) || [])[1];
writeFileSync("index.html", head + OPEN + app + CLOSE + tail);
console.log(`Wrote index.html (BUILD ${build || "?"}). Remember: bump BUILD on every deploy.`);
