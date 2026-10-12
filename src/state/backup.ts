/* Respaldo: exportar e importar la hoja y el grimorio como un archivo JSON. */
import { blankGrim, blankSheet, merge } from "./defaults";
import type { Grimorio, Hoja } from "./types";

export const BACKUP_APP = "norak";
export const BACKUP_VERSION = 1;

export interface Respaldo {
  app: typeof BACKUP_APP;
  version: number;
  exportado: string;
  modificado: string | null;
  hoja: Hoja;
  grimorio: Grimorio;
}

export function buildBackup(hoja: Hoja, grimorio: Grimorio, modificado: string | null, fecha = new Date()): Respaldo {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportado: fecha.toISOString(), modificado, hoja, grimorio };
}

export function backupFileName(nombre: string, fecha = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  const slug = (nombre.split(" ")[0] || "personaje").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "") || "personaje";
  return `${slug}-respaldo-${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}-${p(fecha.getHours())}${p(fecha.getMinutes())}.json`;
}

export type ParseResult =
  | { ok: true; hoja: Hoja; grimorio: Grimorio; exportado: string | null; modificado: string | null }
  | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Valida un respaldo. Acepta el formato propio y también {hoja, grimorio} sueltos. */
export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try { data = JSON.parse(text); } catch { return { ok: false, error: "El archivo no es un JSON válido." }; }
  if (!isObj(data)) return { ok: false, error: "El archivo no contiene un respaldo." };
  if (data.app !== undefined && data.app !== BACKUP_APP) return { ok: false, error: "Este archivo es de otra aplicación." };
  if (typeof data.version === "number" && data.version > BACKUP_VERSION) return { ok: false, error: "El respaldo es de una versión más nueva de la app. Actualízala primero." };
  const { hoja, grimorio } = data;
  if (!isObj(hoja) || !isObj(grimorio)) return { ok: false, error: "Faltan la hoja o el grimorio en el archivo." };
  const listas = ["trucos", "libro", "preparados"] as const;
  if (listas.some(k => grimorio[k] !== undefined && !Array.isArray(grimorio[k]))) return { ok: false, error: "El grimorio del archivo está dañado." };
  return {
    ok: true,
    hoja: merge(blankSheet(), hoja),
    grimorio: merge(blankGrim(), grimorio),
    exportado: typeof data.exportado === "string" ? data.exportado : null,
    modificado: typeof data.modificado === "string" ? data.modificado : null,
  };
}

/** Descarga el respaldo; en celulares con «Compartir archivos» se puede enviar a Drive, WhatsApp, etc. */
export async function deliverBackup(json: string, fileName: string, mode: "download" | "share") {
  const blob = new Blob([json], { type: "application/json" });
  if (mode === "share") {
    const file = new File([blob], fileName, { type: "application/json" });
    await navigator.share({ files: [file], title: "Respaldo de Norak" });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function canShareFiles() {
  try {
    const f = new File(["{}"], "x.json", { type: "application/json" });
    return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [f] });
  } catch { return false; }
}
