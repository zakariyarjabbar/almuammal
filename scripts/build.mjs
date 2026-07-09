import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "index.html"), path.join(dist, "index.html"));
await cp(path.join(root, "src"), path.join(dist, "src"), { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });

const indexPath = path.join(dist, "index.html");
const index = await readFile(indexPath, "utf8");
await writeFile(indexPath, index.replace('href="/"', 'href="./"'));

console.log("build complete: dist/");
