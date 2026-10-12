import { useStore } from "./store";
import { clampLevel, profBonus, spellAttack, spellDC, spellMod } from "../rules/wizard2024";

/** Valores calculados de la hoja que usan varias pantallas. */
export function useDerived() {
  const car = useStore(s => s.hoja.car);
  const apt = useStore(s => s.hoja.aptitud);
  const nivel = useStore(s => s.hoja.nivel);
  const lvl = clampLevel(nivel);
  return {
    lvl,
    prof: profBonus(lvl),
    spMod: spellMod(car, apt),
    dc: spellDC(car, apt, lvl),
    atk: spellAttack(car, apt, lvl),
  };
}
