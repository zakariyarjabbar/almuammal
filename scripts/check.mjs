import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { languages } from "../src/content/siteContent.js";
import { businessConfig } from "../src/data/businessConfig.js";
import { categories, services } from "../src/data/services.js";
import { projects } from "../src/data/projects.js";

const root = process.cwd();
const failures = [];
const categoryIds = new Set(categories.map((category) => category.id));
const serviceIds = new Set(services.map((service) => service.id));

assert(languages.ar?.dir === "rtl", "Arabic language must be RTL");
assert(languages.en?.dir === "ltr", "English language must be LTR");
assert(services.length === 7, "Exactly seven services are expected");
assert(projects.length >= 7, "Portfolio should include at least one slot per service");

for (const service of services) {
  assert(categoryIds.has(service.id), `Service ${service.id} must have a matching category`);
  assert(service.titleAr && service.titleEn, `Service ${service.id} needs bilingual titles`);
  assert(service.summaryAr && service.summaryEn, `Service ${service.id} needs bilingual summaries`);
  await assertAsset(service.image, `Service ${service.id}`);
}

for (const project of projects) {
  assert(serviceIds.has(project.category), `Project ${project.id} has unknown category ${project.category}`);
  assert(project.titleAr && project.titleEn, `Project ${project.id} needs bilingual titles`);
  assert(project.altAr && project.altEn, `Project ${project.id} needs bilingual alt text`);
  await assertAsset(project.image, `Project ${project.id}`);
}

await assertAsset("/assets/brand/logo-mark.svg", "Logo mark");
await assertAsset("/assets/placeholders/about-main.svg", "About image");

const sourceFiles = [
  "index.html",
  "src/js/main.js",
  "src/js/icons.js",
  "src/styles/main.css",
  "src/content/siteContent.js",
  "src/data/services.js",
  "src/data/projects.js"
];

for (const file of sourceFiles) {
  const content = await readFile(path.join(root, file), "utf8");
  assert(!content.includes("TODO_"), `${file} should not expose TODO placeholders`);
}

const businessTodos = Object.entries(flatten(businessConfig)).filter(([, value]) => typeof value === "string" && value.startsWith("TODO_"));
assert(businessTodos.length >= 7, "Missing real business values should remain explicit TODOs in businessConfig");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("lint/check passed");

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function assertAsset(assetPath, label) {
  if (!assetPath.startsWith("/assets/")) return;
  const localPath = path.join(root, "public", assetPath.replace(/^\/assets\//, "assets/"));
  try {
    await access(localPath);
  } catch {
    failures.push(`${label} references missing asset ${assetPath}`);
  }
}

function flatten(value, prefix = "") {
  if (value == null || typeof value !== "object") return { [prefix]: value };
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) => Object.entries(flatten(child, prefix ? `${prefix}.${key}` : key)))
  );
}
