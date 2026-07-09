import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkedExtensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".txt"]);
const ignoredDirs = new Set([".git", "dist", "node_modules"]);
const failures = [];

for (const file of await listFiles(root)) {
  if (!checkedExtensions.has(path.extname(file))) continue;
  const content = await readFile(file, "utf8");
  if (content.includes("\t")) {
    failures.push(`${relative(file)} contains tab indentation`);
  }
  if (/[ \t]$/m.test(content)) {
    failures.push(`${relative(file)} contains trailing whitespace`);
  }
  if (!content.endsWith("\n")) {
    failures.push(`${relative(file)} must end with a newline`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("format:check passed");

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(root, file);
}
