const fs = require("node:fs");
const path = require("node:path");

const standaloneServerPath = path.join(
  __dirname,
  "apps",
  "web",
  ".next",
  "standalone",
  "apps",
  "web",
  "server.js"
);

if (!fs.existsSync(standaloneServerPath)) {
  console.error(
    "SAMADHAN production server was not found. Run `npm run build` before `npm start`."
  );
  console.error(`Missing file: ${standaloneServerPath}`);
  process.exit(1);
}

require(standaloneServerPath);
