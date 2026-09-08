import { existsSync, mkdirSync, copyFileSync, unlinkSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "Matrixtwin_opal.glb");
const destination = resolve(root, "public/images/Matrixtwin_opal.glb");

mkdirSync(dirname(destination), { recursive: true });

if (!existsSync(source)) {
  // Never allow an invalid placeholder to masquerade as the production model.
  if (existsSync(destination) && statSync(destination).size < 1024) {
    unlinkSync(destination);
  }
  console.warn("[ProvenanceOS] Matrix Twin source not found at repo root. Continuing without the production GLB.");
  process.exit(0);
}

const size = statSync(source).size;
if (size < 20) {
  throw new Error(`[ProvenanceOS] Matrix Twin source is invalid (${size} bytes). Expected a binary GLB.`);
}

copyFileSync(source, destination);
console.log(`[ProvenanceOS] Matrix Twin copied to public/images/Matrixtwin_opal.glb (${(size / 1024 / 1024).toFixed(2)} MB)`);
