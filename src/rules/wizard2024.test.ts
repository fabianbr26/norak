import { describe, expect, it } from "vitest";
import { BYID, SPELLS } from "../data/spells";
import {
  abilityMod, applyDamage, applyHeal, arcaneRecovery, arcaneRecoveryBudget, cantripsKnown, castOptions, clampLevel,
  cloudJumpMax, costlyMaterial, damageText, effectParts, hasCloudJump, hasMaterialInEquipment, isDiviner, portentDice, hpAverageGain, levelUpPlan, passivePerception, preparedMax, profBonus, saveTotal,
  skillTotal, slotTable, slotsLeft, slotsMax, spellAttack, spellDC, suggestedWeaponAttack, type Puntuaciones,
} from "./wizard2024";

const norak: Puntuaciones = { fue: 16, des: 11, con: 14, int: 15, sab: 12, car: 9 };

describe("tablas del Mago 2024", () => {
  it("bonificador por competencia por nivel", () => {
    expect([1, 4, 5, 8, 9, 12, 13, 16, 17, 20].map(profBonus)).toEqual([2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });
  it("modificadores de característica", () => {
    expect([1, 8, 9, 10, 11, 15, 16, 20, 30].map(abilityMod)).toEqual([-5, -1, -1, 0, 0, 2, 3, 5, 10]);
    expect(abilityMod("")).toBe(0);
  });
  it("espacios de conjuro", () => {
    expect(slotTable(1)).toEqual([2]);
    expect(slotTable(3)).toEqual([4, 2]);
    expect(slotTable(5)).toEqual([4, 3, 2]);
    expect(slotTable(20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
  });
  it("trucos y preparados", () => {
    expect([1, 3, 4, 9, 10, 20].map(cantripsKnown)).toEqual([3, 3, 4, 4, 5, 5]);
    expect([1, 2, 3, 4, 5, 12, 13, 20].map(preparedMax)).toEqual([4, 5, 6, 7, 9, 16, 17, 25]);
  });
  it("nivel fuera de rango se limita a 1–20", () => {
    expect([0, -3, "", "abc", 25, 3.7].map(clampLevel)).toEqual([1, 1, 1, 1, 20, 3]);
  });
});

describe("Norak a nivel 3", () => {
  it("CD y ataque de conjuros con INT 15", () => {
    expect(spellDC(norak, "int", 3)).toBe(12);
    expect(spellAttack(norak, "int", 3)).toBe(4);
  });
  it("salvaciones y habilidades con competencia y pericia", () => {
    expect(saveTotal(norak, true, "int", 3)).toBe(4);
    expect(saveTotal(norak, false, "car", 3)).toBe(-1);
    expect(skillTotal(norak, { arcano: 1 }, "arcano", "int", 3)).toBe(4);
    expect(skillTotal(norak, { arcano: 2 }, "arcano", "int", 3)).toBe(6);
    expect(skillTotal(norak, {}, "sigilo", "des", 3)).toBe(0);
  });
  it("percepción pasiva", () => {
    expect(passivePerception(norak, {}, 3)).toBe(11);
    expect(passivePerception(norak, { percepcion: 1 }, 3)).toBe(13);
  });
  it("ataque sugerido con armas", () => {
    expect(suggestedWeaponAttack("Bastón", norak, 3)).toBe(5);
    expect(suggestedWeaponAttack("Daga", { ...norak, fue: 8, des: 16 }, 3)).toBe(5);
  });
});

describe("espacios gastados", () => {
  it("cuenta espacios restantes con extras", () => {
    expect(slotsMax(3, 1)).toBe(4);
    expect(slotsMax(3, 1, { 1: 1 })).toBe(5);
    expect(slotsLeft(3, 1, { 1: 3 })).toBe(1);
    expect(slotsLeft(3, 2, { 2: 5 })).toBe(0);
    expect(slotsMax(3, 3)).toBe(0);
  });
  it("opciones para lanzar: solo espacios iguales o superiores con cargas", () => {
    expect(castOptions(3, 1)).toEqual([1, 2]);
    expect(castOptions(3, 1, { 1: 4 })).toEqual([2]);
    expect(castOptions(3, 2, { 2: 2 })).toEqual([]);
  });
});

describe("Recuperación arcana", () => {
  it("presupuesto: mitad del nivel redondeado hacia arriba", () => {
    expect([1, 2, 3, 4, 5, 20].map(arcaneRecoveryBudget)).toEqual([1, 1, 2, 2, 3, 10]);
  });
  it("recupera primero los espacios más altos sin pasarse", () => {
    const r = arcaneRecovery(3, { 1: 3, 2: 1 });
    expect(r.recovered).toEqual([2]);
    expect(r.usados).toEqual({ 1: 3, 2: 0 });
  });
  it("completa con espacios bajos si sobra presupuesto", () => {
    const r = arcaneRecovery(5, { 1: 2, 2: 1 });
    expect(r.recovered).toEqual([2, 1]);
    expect(r.usados).toEqual({ 1: 1, 2: 0 });
  });
  it("no recupera espacios de nivel 6 o más", () => {
    const r = arcaneRecovery(20, { 6: 1, 7: 1, 9: 1 });
    expect(r.recovered).toEqual([]);
    expect(r.usados).toEqual({ 6: 1, 7: 1, 9: 1 });
  });
  it("no modifica el objeto original", () => {
    const u = { 1: 2 };
    arcaneRecovery(3, u);
    expect(u).toEqual({ 1: 2 });
  });
});

describe("daño de conjuros", () => {
  it("trucos escalan con el nivel de personaje", () => {
    const fb = BYID["descarga-de-fuego"];
    expect(damageText(fb, 0, 3)).toBe("1d10 fuego");
    expect(damageText(fb, 0, 5)).toBe("2d10 fuego");
    expect(damageText(fb, 0, 11)).toBe("3d10 fuego");
    expect(damageText(fb, 0, 17)).toBe("4d10 fuego");
  });
  it("tañido por los muertos muestra el dado alternativo", () => {
    expect(damageText(BYID["tanido-por-los-muertos"], 0, 5)).toBe("2d8 necrótico (2d12 si está herido)");
  });
  it("conjuros con dados por nivel superior", () => {
    const r = BYID["rayo-nauseabundo"];
    expect(damageText(r, 1, 3)).toBe("2d8 veneno");
    expect(damageText(r, 2, 3)).toBe("3d8 veneno");
  });
  it("proyectil mágico añade dardos", () => {
    const p = BYID["proyectil-magico"];
    expect(damageText(p, 1, 3)).toBe("3 dardos · 1d4+1 fuerza c/u");
    expect(damageText(p, 3, 5)).toBe("5 dardos · 1d4+1 fuerza c/u");
  });
  it("línea de efecto con ataque y CD calculados", () => {
    expect(effectParts(BYID["rayo-nauseabundo"], 1, 3, 4, 12)).toEqual([{ strong: "Ataque +4" }, { text: "2d8 veneno" }]);
    expect(effectParts(BYID["dormir"], 1, 3, 4, 12)).toEqual([{ strong: "Salv. SAB CD 12" }]);
  });
  it("todos los conjuros del catálogo tienen datos válidos", () => {
    const ids = new Set<string>();
    for (const s of SPELLS) {
      expect(ids.has(s.id), s.id).toBe(false);
      ids.add(s.id);
      expect(s.l).toBeGreaterThanOrEqual(0);
      expect(s.x.length).toBeGreaterThan(10);
      expect(() => damageText(s, Math.max(1, s.l), 3)).not.toThrow();
    }
  });
});

describe("puntos de golpe", () => {
  it("el daño gasta primero los temporales", () => {
    expect(applyDamage({ act: 20, max: 20, temp: 5 }, 3)).toEqual({ act: 20, max: 20, temp: 2 });
    expect(applyDamage({ act: 20, max: 20, temp: 5 }, 8)).toEqual({ act: 17, max: 20, temp: 0 });
  });
  it("no baja de 0", () => {
    expect(applyDamage({ act: 4, max: 20, temp: 0 }, 50).act).toBe(0);
  });
  it("la curación no supera el máximo", () => {
    expect(applyHeal({ act: 15, max: 20, temp: 0 }, 10).act).toBe(20);
    expect(applyHeal({ act: 0, max: "", temp: 0 }, 7).act).toBe(7);
  });
});

describe("subir de nivel", () => {
  it("PG promedio: 4 + mod. de CON, mínimo 1", () => {
    expect(hpAverageGain(14)).toBe(6);
    expect(hpAverageGain(3)).toBe(1);
  });
  it("de 3 a 4: truco, preparados y mejora de característica", () => {
    const p = levelUpPlan(3, 14)!;
    expect(p.to).toBe(4);
    expect(p.cantrips).toEqual([3, 4]);
    expect(p.prepared).toEqual([6, 7]);
    expect(p.slots[1]).toEqual([4, 3]);
    expect(p.choices.some(c => c.startsWith("Mejora de característica"))).toBe(true);
    expect(p.choices.some(c => c.startsWith("Aprende un truco"))).toBe(true);
    expect(p.changes).toContain("Espacios de nivel 2: 2 → 3.");
  });
  it("de 2 a 3: subclase y espacios de nivel 2", () => {
    const p = levelUpPlan(2, 14)!;
    expect(p.choices.some(c => c.startsWith("Subclase de mago"))).toBe(true);
    expect(p.changes.some(c => c.includes("Nuevos espacios de nivel 2"))).toBe(true);
  });
  it("de 4 a 5: competencia +3, nivel 3 de conjuro, trucos más fuertes y Forma grande del goliath", () => {
    const p = levelUpPlan(4, 14, "Goliath")!;
    expect(p.prof).toEqual([2, 3]);
    expect(p.changes.some(c => c.includes("Nuevos espacios de nivel 3"))).toBe(true);
    expect(p.changes).toContain("Tus trucos de daño suben un dado.");
    expect(p.choices.some(c => c.startsWith("Memorizar conjuro"))).toBe(true);
    expect(p.choices.some(c => c.startsWith("Goliath"))).toBe(true);
  });
  it("mejoras de característica a 4, 8, 12 y 16; don épico a 19", () => {
    const asi = (to: number) => levelUpPlan(to - 1, 10)!.choices.some(c => c.startsWith("Mejora de característica"));
    expect([4, 8, 12, 16].every(asi)).toBe(true);
    expect([5, 6, 7, 9, 19].some(asi)).toBe(false);
    expect(levelUpPlan(18, 10)!.choices.some(c => c.startsWith("Don épico"))).toBe(true);
  });
  it("en nivel 20 no se puede subir", () => {
    expect(levelUpPlan(20, 14)).toBeNull();
  });
});

describe("Adivino, goliath y materiales", () => {
  it("detecta la subclase Adivino y los dados de Portento", () => {
    expect(isDiviner("Adivino")).toBe(true);
    expect(isDiviner("adivinación")).toBe(true);
    expect(isDiviner("Evocador")).toBe(false);
    expect([3, 13, 14].map(portentDice)).toEqual([2, 2, 3]);
  });
  it("Salto de las nubes: usos = competencia", () => {
    expect(hasCloudJump("Ascendencia gigante: Salto de las nubes.")).toBe(true);
    expect(hasCloudJump("Forma grande")).toBe(false);
    expect([3, 4, 5, 9, 17].map(cloudJumpMax)).toEqual([2, 2, 3, 4, 6]);
  });
  it("Sabio de la adivinación al ganar un nivel nuevo de espacios", () => {
    const sabio = (lv: number, sub = "Adivino") => levelUpPlan(lv, 14, "Goliath", sub)!.choices.find(c => c.startsWith("Sabio"));
    expect(sabio(4)).toBe("Sabio de la adivinación: copia gratis un conjuro de adivinación de nivel 3.");
    expect(sabio(2)).toBe("Sabio de la adivinación: copia gratis un conjuro de adivinación de nivel 2.");
    expect(sabio(3)).toBeUndefined();
    expect(sabio(4, "Evocador")).toBeUndefined();
    expect(levelUpPlan(4, 14, "Goliath", "Adivino")!.changes).toContain("Salto de las nubes: ahora tienes 3 usos por descanso largo.");
  });
  it("materiales con costo", () => {
    expect(costlyMaterial(BYID["identificar"].m)).toEqual({ keyword: "perla", cost: 100 });
    expect(costlyMaterial(BYID["encontrar-familiar"].m)).toEqual({ keyword: "incienso", cost: 10 });
    expect(costlyMaterial(BYID["dormir"].m)).toBeNull();
    expect(costlyMaterial(undefined)).toBeNull();
    expect(hasMaterialInEquipment("perla", [{ nombre: "Mochila" }, { nombre: "Perla negra" }])).toBe(true);
    expect(hasMaterialInEquipment("perla", [{ nombre: "Mochila" }])).toBe(false);
  });
});
