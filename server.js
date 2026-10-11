// Entry point for container environments that execute `node server.js`
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distCjs = path.join(__dirname, "dist", "server.cjs");

if (fs.existsSync(distCjs)) {
  await import("./dist/server.cjs");
} else {
  await import("./server.ts");
}
