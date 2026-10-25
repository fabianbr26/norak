/* Reemplazo de datos con copia para deshacer: lo usan «Importar respaldo» y la actualización de nivel 3. */
import { buildBackup, parseBackup } from "./backup";
import { seedGrim, seedSheet } from "./defaults";
import { STORAGE_KEY, useStore } from "./store";
import type { Grimorio, Hoja } from "./types";
import { useUI } from "./ui";

export const UNDO_KEY = STORAGE_KEY + ":antes-de-importar";

export function hasUndo() {
  try { return !!localStorage.getItem(UNDO_KEY); } catch { return false; }
}

/** Guarda una copia de los datos actuales y los reemplaza. */
export function replaceWithUndo(hoja: Hoja, grimorio: Grimorio) {
  const s = useStore.getState();
  try { localStorage.setItem(UNDO_KEY, JSON.stringify(buildBackup(s.hoja, s.grimorio, s.meta.modificado))); }
  catch { /* sin espacio para la copia; se reemplaza igual */ }
  s.replaceAll(hoja, grimorio);
  useUI.getState().setUndo(hasUndo());
}

/** Restaura los datos de antes del último reemplazo. */
export function undoReplace() {
  let text: string | null = null;
  try { text = localStorage.getItem(UNDO_KEY); } catch { /* nada */ }
  const r = text ? parseBackup(text) : null;
  if (!r || !r.ok) return false;
  useStore.getState().replaceAll(r.hoja, r.grimorio);
  try { localStorage.removeItem(UNDO_KEY); } catch { /* nada */ }
  useUI.getState().setUndo(false);
  return true;
}

/**
 * Actualización de nivel 3: los datos nuevos de la semilla, conservando las sesiones de la bitácora
 * que se anotaron en este dispositivo.
 */
export function level3Update(actual: Hoja): { hoja: Hoja; grimorio: Grimorio } {
  const hoja = seedSheet(), grimorio = seedGrim();
  const key = (b: Hoja["bitacora"][number]) => `${b.fecha}|${b.notas}`;
  const vistos = new Set(hoja.bitacora.map(key));
  hoja.bitacora = [...actual.bitacora.filter(b => !vistos.has(key(b))), ...hoja.bitacora];
  return { hoja, grimorio };
}

export function applyLevel3Update() {
  const { hoja, grimorio } = level3Update(useStore.getState().hoja);
  replaceWithUndo(hoja, grimorio);
  useStore.getState().setAviso(null);
}
