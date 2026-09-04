// Next.js `output: "standalone"` emits a self-contained server under
// apps/web/.next/standalone but does NOT copy the static asset folders
// (`.next/static`, `public/`) into it. Hostinger runs `npm start` ->
// `node server.js` -> the standalone server, which then 404s every asset
// unless we mirror those folders in after each build.
import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const webRoot = path.resolve("apps/web");
const standaloneWebRoot = path.join(webRoot, ".next/standalone/apps/web");

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function mirror(from, to) {
  if (!(await exists(from))) {
    return;
  }
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
  console.log(`synced ${path.relative(process.cwd(), to)}`);
}

if (!(await exists(standaloneWebRoot))) {
  console.log("no standalone build found, skipping asset sync");
  process.exit(0);
}

await mirror(
  path.join(webRoot, ".next/static"),
  path.join(standaloneWebRoot, ".next/static")
);
await mirror(
  path.join(webRoot, "public"),
  path.join(standaloneWebRoot, "public")
);
