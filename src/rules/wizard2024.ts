/* Reglas D&D 2024 para un mago: tablas y cálculos puros (sin estado ni DOM). */
import type { Conjuro } from "../data/spells";

export type Car = "fue" | "des" | "con" | "int" | "sab" | "car";
export type Puntuaciones = Record<Car, number | "">;
export type NivelComp = 0 | 1 | 2; // sin competencia / competencia / pericia

export const ABIL: [Car, string][] = [
  ["fue", "Fuerza"], ["des", "Destreza"], ["con", "Constitución"],
  ["int", "Inteligencia"], ["sab", "Sabiduría"], ["car", "Carisma"],
];

export const SKILLS: [string, string, Car][] = [
  ["atletismo", "Atletismo", "fue"], ["acrobacias", "Acrobacias", "des"], ["juegomanos", "Juego de manos", "des"], ["sigilo", "Sigilo", "des"],
  ["arcano", "Conocimiento arcano", "int"], ["historia", "Historia", "int"], ["investigacion", "Investigación", "int"], ["naturaleza", "Naturaleza", "int"], ["religion", "Religión", "int"],
  ["medicina", "Medicina", "sab"], ["percepcion", "Percepción", "sab"], ["perspicacia", "Perspicacia", "sab"], ["supervivencia", "Supervivencia", "sab"], ["animales", "Trato con animales", "sab"],
  ["engano", "Engaño", "car"], ["interpretacion", "Interpretación", "car"], ["intimidacion", "Intimidación", "car"], ["persuasion", "Persuasión", "car"],
];

/** Mago 2024: espacios de conjuro por nivel de personaje (índice 0 = nivel 1 de conjuro). */
export const WIZ_SLOTS: Record<number, number[]> = {
  1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};
/** Conjuros preparados por nivel (índice = nivel de personaje). */
export const WIZ_PREP = [0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25];
export const WIZ_HIT_DIE = 6;
export const ASI_LEVELS = [4, 8, 12, 16];

export const clampLevel = (n: unknown) => Math.max(1, Math.min(20, Math.floor(Number(n)) || 1));
export const profBonus = (level: number) => 2 + Math.floor((clampLevel(level) - 1) / 4);
export const abilityMod = (score: number | "" | undefined) => Math.floor(((Number(score) || 10) - 10) / 2);
export const signed = (n: number) => (n >= 0 ? "+" : "") + n;

export const cantripsKnown = (level: number) => (level >= 10 ? 5 : level >= 4 ? 4 : 3);
export const preparedMax = (level: number) => WIZ_PREP[clampLevel(level)];
export const slotTable = (level: number) => WIZ_SLOTS[clampLevel(level)] ?? [];
export const maxSpellLevel = (level: number) => slotTable(level).length;
/** Dados extra de los trucos: x1, x2 a nivel 5, x3 a 11, x4 a 17. */
export const cantripTier = (level: number) => 1 + +(level >= 5) + +(level >= 11) + +(level >= 17);
/** Recuperación arcana: suma de niveles recuperables tras un descanso corto. */
export const arcaneRecoveryBudget = (level: number) => Math.ceil(clampLevel(level) / 2);

export function skillTotal(car: Puntuaciones, hab: Record<string, NivelComp | undefined>, id: string, ab: Car, level: number) {
  return abilityMod(car[ab]) + (hab[id] || 0) * profBonus(level);
}
export const saveTotal = (car: Puntuaciones, competente: boolean, ab: Car, level: number) =>
  abilityMod(car[ab]) + (competente ? profBonus(level) : 0);
export const passivePerception = (car: Puntuaciones, hab: Record<string, NivelComp | undefined>, level: number) =>
  10 + skillTotal(car, hab, "percepcion", "sab", level);

export const spellMod = (car: Puntuaciones, apt: Car) => abilityMod(car[apt]);
export const spellDC = (car: Puntuaciones, apt: Car, level: number) => 8 + profBonus(level) + spellMod(car, apt);
export const spellAttack = (car: Puntuaciones, apt: Car, level: number) => profBonus(level) + spellMod(car, apt);

/** Ataque sugerido con un arma: sutiles y a distancia usan el mejor entre FUE y DES. */
export function suggestedWeaponAttack(nombre: string, car: Puntuaciones, level: number) {
  const finesse = /daga|estoque|cimitarra|arco|ballesta|dardo|honda/.test(nombre.toLowerCase());
  const m = finesse ? Math.max(abilityMod(car.fue), abilityMod(car.des)) : abilityMod(car.fue);
  return m + profBonus(level);
}

/* ---------- espacios ---------- */
export type Usados = Record<number | string, number | undefined>;

export const slotsMax = (level: number, spellLevel: number, extra: Usados = {}) =>
  (slotTable(level)[spellLevel - 1] || 0) + (Number(extra[spellLevel]) || 0);
export const slotsLeft = (level: number, spellLevel: number, usados: Usados = {}, extra: Usados = {}) =>
  Math.max(0, slotsMax(level, spellLevel, extra) - (Number(usados[spellLevel]) || 0));

/** Niveles de espacio con los que se puede lanzar un conjuro (>= su nivel, con espacios libres). */
export function castOptions(level: number, spellLevel: number, usados: Usados = {}, extra: Usados = {}) {
  return slotTable(level).map((_, i) => i + 1).filter(l => l >= spellLevel && slotsLeft(level, l, usados, extra) > 0);
}

/**
 * Recuperación arcana (una vez al día, tras un descanso corto): recupera espacios gastados cuya suma
 * de niveles no supere la mitad del nivel de mago (redondeando hacia arriba) y ninguno de nivel 6+.
 * Se recuperan primero los espacios más altos.
 */
export function arcaneRecovery(level: number, usados: Usados) {
  let budget = arcaneRecoveryBudget(level);
  const next: Usados = { ...usados };
  const recovered: number[] = [];
  for (let l = Math.min(5, maxSpellLevel(level)); l >= 1; l--) {
    while (budget >= l && (Number(next[l]) || 0) > 0) {
      next[l] = (Number(next[l]) || 0) - 1;
      budget -= l;
      recovered.push(l);
    }
  }
  return { usados: next, recovered };
}

/* ---------- daño de conjuros ---------- */
export function damageText(s: Pick<Conjuro, "l" | "dm">, slot: number, level: number) {
  const d = s.dm;
  if (!d) return "";
  let n = d.b[0];
  if (d.truco) n *= cantripTier(level);
  else if (d.per && slot > s.l) n += d.per[0] * (slot - s.l);
  let txt = `${n}d${d.b[1]}${d.plus ? "+" + d.plus : ""} ${d.tipo}`;
  if (d.alt) txt += ` (${d.alt[0] * cantripTier(level)}d${d.alt[1]} si está herido)`;
  const up = Math.max(0, slot - s.l);
  if (d.dardos) txt = `${d.dardos + up} dardos · ${txt} c/u`;
  if (d.rayos) txt = `${d.rayos + up} rayos · ${txt} c/u`;
  if (d.extra) txt += ` · ${d.extra}`;
  return txt;
}

/** ¿El daño cambia según el espacio usado? (para mostrar la comparación al elegir espacio) */
export const scalesWithSlot = (s: Pick<Conjuro, "dm">) => !!(s.dm && !s.dm.truco && (s.dm.per || s.dm.dardos || s.dm.rayos));

/** Línea de efecto de la tarjeta: ataque o CD ya calculados y el daño al nivel dado. */
export function effectParts(s: Conjuro, slot: number, level: number, atk: number, dc: number) {
  const parts: { strong?: string; text?: string }[] = [];
  if (s.tipo === "atq") parts.push({ strong: `Ataque ${signed(atk)}` });
  else if (s.tipo?.startsWith("salv:")) parts.push({ strong: `Salv. ${s.tipo.slice(5)} CD ${dc}` });
  const d = damageText(s, slot, level);
  if (d) parts.push({ text: d });
  if (s.ef) parts.push({ text: s.ef });
  return parts;
}

/* ---------- puntos de golpe ---------- */
export interface PG { act: number | ""; max: number | ""; temp: number | "" }

/** El daño se resta primero de los PG temporales. */
export function applyDamage(pg: PG, amount: number): PG {
  let n = Math.max(0, amount);
  const temp = Number(pg.temp) || 0;
  const fromTemp = Math.min(temp, n);
  n -= fromTemp;
  return { ...pg, temp: temp - fromTemp, act: Math.max(0, (Number(pg.act) || 0) - n) };
}
export function applyHeal(pg: PG, amount: number): PG {
  const max = Number(pg.max) || Infinity;
  return { ...pg, act: Math.min(max, (Number(pg.act) || 0) + Math.max(0, amount)) };
}

/* ---------- subir de nivel ---------- */
export const hpAverageGain = (conScore: number | "") => Math.max(1, WIZ_HIT_DIE / 2 + 1 + abilityMod(conScore));

const FEATURES: Record<number, string[]> = {
  2: ["Erudito: elige una habilidad con competencia entre Conocimiento arcano, Historia, Investigación, Medicina, Naturaleza o Religión y obtén pericia en ella."],
  3: ["Subclase de mago: elige Abjurador, Adivino, Evocador o Ilusionista y anota sus rasgos de nivel 3."],
  5: ["Memorizar conjuro: tras un descanso corto puedes cambiar un conjuro preparado por otro de nivel 1+ de tu libro."],
  6: ["Rasgo de subclase de nivel 6."],
  10: ["Rasgo de subclase de nivel 10."],
  14: ["Rasgo de subclase de nivel 14."],
  18: ["Dominio de conjuros: elige un conjuro de nivel 1 y otro de nivel 2 de tu libro (de tiempo «Acción»); los lanzas a su nivel más bajo sin gastar espacio."],
  19: ["Don épico: elige una dote de Don épico u otra dote para la que cumplas los requisitos."],
  20: ["Conjuros característicos: elige dos conjuros de nivel 3 de tu libro; siempre están preparados y lanzas cada uno una vez a nivel 3 sin gastar espacio (se recupera con descanso corto o largo)."],
};
const ASI_TEXT = "Mejora de característica: +2 a una característica o +1 a dos (máximo 20), o elige una dote para la que cumplas los requisitos.";

export interface LevelUpPlan {
  from: number;
  to: number;
  prof: [number, number];
  slots: [number[], number[]];
  cantrips: [number, number];
  prepared: [number, number];
  recovery: [number, number];
  hpAverage: number;
  /** Cosas que el jugador debe elegir o anotar. */
  choices: string[];
  /** Cambios automáticos, en texto. */
  changes: string[];
}

/** Calcula qué cambia al pasar de `level` a `level + 1`. Devuelve null en nivel 20. */
export function levelUpPlan(level: number, conScore: number | "", especie = ""): LevelUpPlan | null {
  const from = clampLevel(level);
  if (from >= 20) return null;
  const to = from + 1;
  const plan: LevelUpPlan = {
    from, to,
    prof: [profBonus(from), profBonus(to)],
    slots: [slotTable(from), slotTable(to)],
    cantrips: [cantripsKnown(from), cantripsKnown(to)],
    prepared: [preparedMax(from), preparedMax(to)],
    recovery: [arcaneRecoveryBudget(from), arcaneRecoveryBudget(to)],
    hpAverage: hpAverageGain(conScore),
    choices: [],
    changes: [],
  };
  const c = plan.changes, ch = plan.choices;
  if (plan.prof[1] !== plan.prof[0]) c.push(`Bonificador por competencia: ${signed(plan.prof[0])} → ${signed(plan.prof[1])} (sube tu CD, ataque de conjuro, salvaciones y habilidades).`);
  const newLevel = plan.slots[1].length > plan.slots[0].length ? plan.slots[1].length : 0;
  if (newLevel) c.push(`¡Nuevos espacios de nivel ${newLevel}! Ya puedes lanzar conjuros de nivel ${newLevel}.`);
  const slotDiffs = plan.slots[1].map((n, i) => [i + 1, plan.slots[0][i] || 0, n] as const).filter(([, a, b]) => a !== b && a > 0);
  for (const [l, a, b] of slotDiffs) c.push(`Espacios de nivel ${l}: ${a} → ${b}.`);
  if (plan.prepared[1] !== plan.prepared[0]) c.push(`Conjuros preparados: ${plan.prepared[0]} → ${plan.prepared[1]}.`);
  if (plan.recovery[1] !== plan.recovery[0]) c.push(`Recuperación arcana: hasta ${plan.recovery[1]} niveles de espacio.`);
  if (cantripTier(to) > cantripTier(from)) c.push("Tus trucos de daño suben un dado.");

  ch.push("Copia gratis dos conjuros de mago a tu libro (de un nivel para el que tengas espacios).");
  if (plan.cantrips[1] > plan.cantrips[0]) ch.push(`Aprende un truco nuevo (ahora conoces ${plan.cantrips[1]}).`);
  if (ASI_LEVELS.includes(to)) ch.push(ASI_TEXT);
  ch.push(...(FEATURES[to] ?? []));
  if (to === 5 && /goliat/i.test(especie)) ch.push("Goliath: obtienes Forma grande (acción adicional, 10 minutos, una vez por descanso largo).");
  return plan;
}
