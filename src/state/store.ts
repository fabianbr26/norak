import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { BYID, type Conjuro } from "../data/spells";
import {
  applyDamage, applyHeal, arcaneRecovery, clampLevel, damageText, preparedMax, slotsMax,
} from "../rules/wizard2024";
import { blankGrim, blankSheet, merge, seedGrim, seedSheet } from "./defaults";
import { setPath } from "./paths";
import type { Grimorio, Hoja, Meta } from "./types";

export const STORAGE_KEY = "norak-v2";

interface Datos { hoja: Hoja; grimorio: Grimorio; meta: Meta }

interface Acciones {
  setHoja: (path: string, value: unknown) => void;
  editHoja: (fn: (h: Hoja) => void) => void;
  editGrim: (fn: (g: Grimorio) => void) => void;
  replaceAll: (hoja: Hoja, grimorio: Grimorio) => void;
  markExported: () => void;

  damage: (n: number) => string;
  heal: (n: number) => string;
  levelUp: (hpGain: number) => void;

  cast: (id: string, slot: number, ritual?: boolean) => string;
  toggleGem: (spellLevel: number, spent: boolean) => void;
  endConcentration: () => void;
  prepare: (id: string) => string;
  unprepare: (id: string) => void;
  learn: (id: string) => string;
  forget: (id: string) => void;
  addCustom: (s: Omit<Conjuro, "id" | "custom">) => void;
  deleteCustom: (id: string) => void;
  shortRest: () => string;
  longRest: () => string;
}

export type Estado = Datos & Acciones;

/** Busca un conjuro en el catálogo o entre los propios. */
export const findSpell = (g: Grimorio, id: string | null | undefined): Conjuro | undefined =>
  id ? BYID[id] ?? g.custom.find(s => s.id === id) : undefined;

export const levelOf = (h: Hoja) => clampLevel(h.nivel);

function logIt(g: Grimorio, t: string) {
  const h = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  g.registro.push({ h, t });
  if (g.registro.length > 80) g.registro.shift();
}

const now = () => new Date().toISOString();

export const useStore = create<Estado>()(
  persist(
    immer((set, get) => {
      /** Aplica un cambio y marca la fecha de modificación. */
      const edit = (fn: (s: Datos) => void) => set(s => { fn(s); s.meta.modificado = now(); });

      return {
        hoja: seedSheet(),
        grimorio: seedGrim(),
        meta: { modificado: null, ultimoRespaldo: null },

        setHoja: (path, value) => edit(s => setPath(s.hoja, path, value)),
        editHoja: fn => edit(s => fn(s.hoja)),
        editGrim: fn => edit(s => fn(s.grimorio)),
        replaceAll: (hoja, grimorio) => edit(s => {
          s.hoja = merge(blankSheet(), hoja);
          s.grimorio = merge(blankGrim(), grimorio);
        }),
        markExported: () => set(s => { s.meta.ultimoRespaldo = now(); }),

        damage: n => {
          edit(s => { s.hoja.pg = applyDamage(s.hoja.pg, n); });
          const act = get().hoja.pg.act;
          return act === 0 ? "Norak cae a 0 PG. Tira salvaciones contra muerte." : `Recibes daño. Te quedan ${act} PG.`;
        },
        heal: n => {
          edit(s => {
            s.hoja.pg = applyHeal(s.hoja.pg, n);
            if (Number(s.hoja.pg.act) > 0) s.hoja.muerte = { ok: 0, bad: 0 };
          });
          return `Te curas. Tienes ${get().hoja.pg.act} PG.`;
        },
        levelUp: hpGain => edit(s => {
          const to = Math.min(20, levelOf(s.hoja) + 1);
          s.hoja.nivel = to;
          const gain = Math.max(0, Math.floor(hpGain) || 0);
          s.hoja.pg.max = (Number(s.hoja.pg.max) || 0) + gain;
          s.hoja.pg.act = (Number(s.hoja.pg.act) || 0) + gain;
          logIt(s.grimorio, `Subiste a nivel ${to} (+${gain} PG máximos).`);
        }),

        cast: (id, slot, ritual = false) => {
          let msg = "";
          edit(s => {
            const g = s.grimorio, sp = findSpell(g, id);
            if (!sp) return;
            const lvl = levelOf(s.hoja);
            if (ritual) msg = `Lanzaste ${sp.n} como ritual (10 min más, sin gastar espacio).`;
            else if (sp.l === 0) msg = `Lanzaste ${sp.n}. ${damageText(sp, 0, lvl)}`.trim();
            else {
              g.usados[slot] = (Number(g.usados[slot]) || 0) + 1;
              msg = `Lanzaste ${sp.n} con un espacio de nivel ${slot}.${sp.dm ? " " + damageText(sp, slot, lvl) + "." : ""}`;
            }
            if (sp.conc) {
              const prev = g.conc && g.conc !== sp.id ? findSpell(g, g.conc) : undefined;
              g.conc = sp.id;
              if (prev) msg += ` Terminó tu concentración en ${prev.n}.`;
            }
            logIt(g, msg);
          });
          return msg;
        },
        toggleGem: (l, spent) => edit(s => {
          const g = s.grimorio, max = slotsMax(levelOf(s.hoja), l, g.extra);
          g.usados[l] = Math.max(0, Math.min(max, (Number(g.usados[l]) || 0) + (spent ? -1 : 1)));
        }),
        endConcentration: () => edit(s => {
          const c = findSpell(s.grimorio, s.grimorio.conc);
          s.grimorio.conc = null;
          logIt(s.grimorio, `Terminaste la concentración en ${c ? c.n : "el conjuro"}.`);
        }),
        prepare: id => {
          edit(s => { if (!s.grimorio.preparados.includes(id)) s.grimorio.preparados.push(id); });
          const { hoja, grimorio } = get(), max = preparedMax(levelOf(hoja)), n = grimorio.preparados.length;
          const sp = findSpell(grimorio, id);
          return n > max ? `Preparado, pero superas tu máximo de ${max}.` : `${sp?.n} preparado para hoy (${n}/${max}).`;
        },
        unprepare: id => edit(s => { s.grimorio.preparados = s.grimorio.preparados.filter(x => x !== id); }),
        learn: id => {
          const sp = findSpell(get().grimorio, id);
          if (!sp) return "";
          edit(s => {
            const list = sp.l === 0 ? s.grimorio.trucos : s.grimorio.libro;
            if (!list.includes(id)) list.push(id);
          });
          return sp.l === 0 ? `Aprendiste ${sp.n}.` : `${sp.n} copiado a tu libro. En 2024 cuesta 2 horas y 50 po por nivel copiarlo de un pergamino.`;
        },
        forget: id => edit(s => {
          const g = s.grimorio;
          g.trucos = g.trucos.filter(x => x !== id);
          g.libro = g.libro.filter(x => x !== id);
          g.preparados = g.preparados.filter(x => x !== id);
          if (g.conc === id) g.conc = null;
        }),
        addCustom: data => edit(s => {
          const sp: Conjuro = { ...data, id: "c-" + Date.now().toString(36), custom: 1 };
          s.grimorio.custom.push(sp);
          (sp.l === 0 ? s.grimorio.trucos : s.grimorio.libro).push(sp.id);
        }),
        deleteCustom: id => {
          get().forget(id);
          edit(s => { s.grimorio.custom = s.grimorio.custom.filter(x => x.id !== id); });
        },
        shortRest: () => {
          const { hoja, grimorio } = get();
          if (grimorio.recuperado) return "Ya usaste Recuperación arcana hoy.";
          const { usados, recovered } = arcaneRecovery(levelOf(hoja), grimorio.usados);
          if (!recovered.length) return "No tienes espacios gastados que recuperar.";
          const m = `Recuperación arcana: recuperas espacios de nivel ${recovered.join(", ")}.`;
          edit(s => { s.grimorio.usados = usados; s.grimorio.recuperado = true; logIt(s.grimorio, m); });
          return m;
        },
        longRest: () => {
          edit(s => {
            const g = s.grimorio, h = s.hoja;
            g.usados = {}; g.conc = null; g.recuperado = false; g.registro = [];
            logIt(g, "Descanso largo: espacios, PG y dados de golpe restaurados.");
            if (h.pg.max) h.pg.act = h.pg.max;
            h.pg.temp = 0; h.dg.gastados = 0; h.muerte = { ok: 0, bad: 0 };
          });
          return "Despiertas descansado. Elige tus conjuros preparados para hoy.";
        },
      };
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ hoja: s.hoja, grimorio: s.grimorio, meta: s.meta }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Datos>;
        return {
          ...current,
          hoja: p.hoja ? merge(blankSheet(), p.hoja) : current.hoja,
          grimorio: p.grimorio ? merge(blankGrim(), p.grimorio) : current.grimorio,
          meta: merge(current.meta, p.meta),
        };
      },
    },
  ),
);
