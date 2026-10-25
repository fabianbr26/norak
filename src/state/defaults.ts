import type { Grimorio, Hoja } from "./types";
import hojaSeed from "../data/hoja.json";
import grimorioSeed from "../data/grimorio.json";

export const blankSheet = (): Hoja => ({
  nombre: "", clase: "", subclase: "", nivel: 1, px: 0, especie: "", trasfondo: "", alineamiento: "",
  ca: 10, caEscudo: false, pg: { act: 0, max: 0, temp: 0 }, dg: { tipo: "d6", gastados: 0 }, muerte: { ok: 0, bad: 0 }, inspiracion: false,
  iniAjuste: 0, velocidad: "9 m", tamano: "", percPasiva: "",
  car: { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 }, salv: { fue: false, des: false, con: false, int: false, sab: false, car: false },
  hab: {}, armas: [], armadura: { ligeras: false, medias: false, pesadas: false, escudos: false }, armasComp: "", herramientas: "", idiomas: "",
  aptitud: "int", rasgosClase: "", atributosEspecie: "", dotes: "", aspecto: "", historia: "", equipo: [], sint: ["", "", ""],
  monedas: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 }, bitacora: [],
});

export const blankGrim = (): Grimorio => ({
  trucos: [], libro: [], preparados: [], usados: {}, extra: {}, conc: null, recuperado: false, registro: [], custom: [],
  portento: { dados: ["", ""], usados: [false, false] }, saltoUsados: 0,
});

/** Mezcla datos guardados sobre los valores por defecto: conserva campos nuevos y acepta datos viejos. */
export function merge<T>(def: T, src: unknown): T {
  if (Array.isArray(def)) return (Array.isArray(src) ? src : def) as T;
  if (def && typeof def === "object") {
    const o: Record<string, unknown> = { ...(def as Record<string, unknown>) };
    if (src && typeof src === "object" && !Array.isArray(src)) {
      for (const k of Object.keys(src)) {
        const v = (src as Record<string, unknown>)[k];
        o[k] = k in o ? merge(o[k], v) : v;
      }
    }
    return o as T;
  }
  return (src === undefined || src === null ? def : src) as T;
}

/** Datos reales de Norak para el primer arranque. */
export const seedSheet = () => merge(blankSheet(), structuredClone(hojaSeed));
export const seedGrim = () => merge(blankGrim(), structuredClone(grimorioSeed));
