import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { BYID, type Conjuro } from "../data/spells";
import {
  applyDamage, applyHeal, arcaneRecovery, clampLevel, cloudJumpMax, costlyMaterial, damageText, hasMaterialInEquipment,
  isDiviner, portentDice, preparedMax, rollD20, slotsMax,
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
  setAviso: (a: Meta["aviso"]) => void;

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

  setPortent: (i: number, value: number | "") => void;
  rollPortent: () => string;
  togglePortent: (i: number) => string;
  useCloudJump: () => string;
  restoreCloudJump: () => void;
  spendInspiration: () => string;
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
        meta: { modificado: null, ultimoRespaldo: null, aviso: null },

        setHoja: (path, value) => edit(s => setPath(s.hoja, path, value)),
        editHoja: fn => edit(s => fn(s.hoja)),
        editGrim: fn => edit(s => fn(s.grimorio)),
        replaceAll: (hoja, grimorio) => edit(s => {
          s.hoja = merge(blankSheet(), hoja);
          s.grimorio = merge(blankGrim(), grimorio);
        }),
        markExported: () => set(s => { s.meta.ultimoRespaldo = now(); }),
        setAviso: a => set(s => { s.meta.aviso = a; }),

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
            const mat = costlyMaterial(sp.m);
            if (sp.l > 0 && mat && !hasMaterialInEquipment(mat.keyword, s.hoja.equipo))
              msg += ` Ojo: el material cuesta ${mat.cost} po (${sp.m}) y no lo veo en tu equipo.`;
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
            const n = portentDice(levelOf(h));
            g.portento = { dados: Array(n).fill(""), usados: Array(n).fill(false) };
            g.saltoUsados = 0;
            logIt(g, "Descanso largo: espacios, PG y dados de golpe restaurados.");
            if (h.pg.max) h.pg.act = h.pg.max;
            h.pg.temp = 0; h.dg.gastados = 0; h.muerte = { ok: 0, bad: 0 };
          });
          const portento = isDiviner(get().hoja.subclase) ? ` Tira tus ${portentDice(levelOf(get().hoja))} dados de Portento.` : "";
          return `Despiertas descansado. Elige tus conjuros preparados para hoy.${portento}`;
        },

        setPortent: (i, value) => edit(s => {
          const p = s.grimorio.portento;
          p.dados[i] = value === "" ? "" : Math.max(1, Math.min(20, Math.floor(value)));
          p.usados[i] = false;
        }),
        rollPortent: () => {
          edit(s => {
            const n = portentDice(levelOf(s.hoja));
            s.grimorio.portento = { dados: Array.from({ length: n }, () => rollD20()), usados: Array(n).fill(false) };
          });
          const d = get().grimorio.portento.dados;
          edit(s => logIt(s.grimorio, `Portento del día: ${d.join(" y ")}.`));
          return `Tus visiones de hoy: ${d.join(" y ")}.`;
        },
        togglePortent: i => {
          const p = get().grimorio.portento, v = p.dados[i];
          if (v === "" || v === undefined) return "";
          const usar = !p.usados[i];
          edit(s => {
            s.grimorio.portento.usados[i] = usar;
            if (usar) logIt(s.grimorio, `Usaste Portento: ${v}`);
          });
          return usar ? `Usaste Portento: ${v}.` : `Portento ${v} disponible otra vez.`;
        },
        useCloudJump: () => {
          const max = cloudJumpMax(levelOf(get().hoja));
          if (get().grimorio.saltoUsados >= max) return "No te quedan usos de Salto de las nubes. Vuelven con el descanso largo.";
          edit(s => {
            s.grimorio.saltoUsados += 1;
            logIt(s.grimorio, `Usaste Salto de las nubes (te quedan ${max - s.grimorio.saltoUsados}).`);
          });
          return `Salto de las nubes: te teletransportas hasta 9 m. Te quedan ${max - get().grimorio.saltoUsados}.`;
        },
        restoreCloudJump: () => edit(s => { s.grimorio.saltoUsados = Math.max(0, s.grimorio.saltoUsados - 1); }),
        spendInspiration: () => {
          if (!get().hoja.inspiracion) return "No tienes Inspiración heroica.";
          edit(s => { s.hoja.inspiracion = false; logIt(s.grimorio, "Usaste Inspiración heroica."); });
          return "Usaste Inspiración heroica: repite una tirada d20.";
        },
      };
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: migrateSaved,
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

/**
 * Migraciones de los datos guardados. v1 → v2: si Norak sigue en nivel 3 sin subclase, se marca
 * un aviso para ofrecer la actualización de nivel 3 (no se cambia nada sin confirmar).
 */
export function migrateSaved(persisted: unknown, version: number): unknown {
  const p = (persisted ?? {}) as { hoja?: Partial<Hoja>; meta?: Partial<Meta> };
  if (version < 2 && p.hoja) {
    const h = p.hoja;
    const norak = /norak/i.test(h.nombre ?? "") && clampLevel(h.nivel) === 3 && !String(h.subclase ?? "").trim();
    if (norak) p.meta = { ...p.meta, aviso: "nivel3" };
  }
  return p;
}
