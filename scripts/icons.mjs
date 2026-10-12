// Genera los íconos PNG de la PWA a partir del SVG. Uso: npm run icons
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { iconSvg } from "./icon-source.mjs";

mkdirSync("public/icons", { recursive: true });
const normal = Buffer.from(iconSvg());
const maskable = Buffer.from(iconSvg({ pad: 0.2, rounded: false }));
const square = Buffer.from(iconSvg({ pad: 0.12, rounded: false }));
writeFileSync("public/icon.svg", iconSvg());
await sharp(normal).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(normal).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(maskable).resize(512, 512).png().toFile("public/icons/icon-maskable-512.png");
await sharp(square).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
console.log("Íconos generados en public/icons");
