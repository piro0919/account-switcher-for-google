import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

await build({
  entryPoints: ["src/content.ts", "src/background.ts"],
  outdir: "dist",
  bundle: true,
  format: "iife",
  target: "firefox140",
});

for (const file of ["manifest.json"]) {
  await cp(`src/${file}`, `dist/${file}`, { recursive: true });
}
