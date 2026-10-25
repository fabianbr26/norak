import { beforeEach, describe, expect, it } from "vitest";
import { blankGrim, blankSheet, merge, seedGrim, seedSheet } from "./defaults";
import { applyLevel3Update, level3Update, undoReplace } from "./importar";
import { migrateSaved, useStore } from "./store";

const reset = () => useStore.setState({ hoja: seedSheet(), grimorio: seedGrim(), meta: { modificado: null, ultimoRespaldo: null, aviso: null } });

describe("migración a nivel 3", () => {
  beforeEach(reset);
  const viejo = () => ({
    hoja: {
      nombre: "Norak del valle gris", nivel: 3, subclase: "", pg: { act: 9, max: 20, temp: 0 },
      bitacora: [{ fecha: "12/10/2026", notas: "Cueva de los gigantes", px: 300 }],
    },
    grimorio: { libro: ["dormir"], preparados: ["dormir"] },
    meta: { modificado: "2026-10-12T00:00:00.000Z", ultimoRespaldo: null } as { modificado: string; ultimoRespaldo: null; aviso?: string },
  });
  const aviso = (hoja: object, version = 1) =>
    (migrateSaved({ ...viejo(), hoja: { ...viejo().hoja, ...hoja } }, version) as ReturnType<typeof viejo>).meta.aviso;

  it("marca el aviso si Norak está en nivel 3 sin subclase, sin tocar sus datos", () => {
    const m = migrateSaved(viejo(), 1) as ReturnType<typeof viejo>;
    expect(m.meta.aviso).toBe("nivel3");
    expect(m.hoja.pg.act).toBe(9);
    expect(m.grimorio.libro).toEqual(["dormir"]);
  });
  it("no marca nada si ya tiene subclase, otro nivel u otro personaje, o si ya está en v2", () => {
    expect(aviso({ subclase: "Adivino" })).toBeUndefined();
    expect(aviso({ nivel: 4 })).toBeUndefined();
    expect(aviso({ nombre: "Otra" })).toBeUndefined();
    expect(aviso({}, 2)).toBeUndefined();
  });
  it("la actualización trae el nivel 3 y conserva la bitácora del dispositivo", () => {
    const { hoja, grimorio } = level3Update(merge(blankSheet(), viejo().hoja));
    expect(hoja.subclase).toBe("Adivino");
    expect(grimorio.libro).toHaveLength(12);
    expect(hoja.bitacora).toEqual([{ fecha: "12/10/2026", notas: "Cueva de los gigantes", px: 300 }]);
  });
  it("aplicar y deshacer", () => {
    useStore.setState({
      hoja: merge(blankSheet(), viejo().hoja), grimorio: merge(blankGrim(), viejo().grimorio),
      meta: { modificado: null, ultimoRespaldo: null, aviso: "nivel3" },
    });
    applyLevel3Update();
    expect(useStore.getState().hoja.subclase).toBe("Adivino");
    expect(useStore.getState().meta.aviso).toBeNull();
    expect(undoReplace()).toBe(true);
    expect(useStore.getState().hoja.subclase).toBe("");
    expect(useStore.getState().grimorio.libro).toEqual(["dormir"]);
    expect(undoReplace()).toBe(false);
  });
});

describe("Portento", () => {
  beforeEach(reset);

  it("tirar llena dos d20 y los anota en el registro", () => {
    useStore.getState().rollPortent();
    const p = useStore.getState().grimorio.portento;
    expect(p.dados).toHaveLength(2);
    expect(p.dados.every(d => typeof d === "number" && d >= 1 && d <= 20)).toBe(true);
    expect(useStore.getState().grimorio.registro.at(-1)?.t).toMatch(/^Portento del día/);
  });
  it("capturar a mano, usar con un toque y registrar", () => {
    useStore.getState().setPortent(0, 12);
    useStore.getState().setPortent(1, 25);
    expect(useStore.getState().grimorio.portento.dados).toEqual([12, 20]);
    expect(useStore.getState().togglePortent(0)).toBe("Usaste Portento: 12.");
    expect(useStore.getState().grimorio.portento.usados).toEqual([true, false]);
    expect(useStore.getState().grimorio.registro.at(-1)?.t).toBe("Usaste Portento: 12");
    useStore.getState().togglePortent(0);
    expect(useStore.getState().grimorio.portento.usados[0]).toBe(false);
  });
  it("una casilla vacía no se puede usar", () => {
    expect(useStore.getState().togglePortent(1)).toBe("");
  });
});

describe("Salto de las nubes e Inspiración", () => {
  beforeEach(reset);

  it("tantos usos como la competencia (2 en nivel 3)", () => {
    expect(useStore.getState().useCloudJump()).toContain("Te quedan 1");
    expect(useStore.getState().useCloudJump()).toContain("Te quedan 0");
    expect(useStore.getState().useCloudJump()).toMatch(/^No te quedan/);
    expect(useStore.getState().grimorio.saltoUsados).toBe(2);
    expect(useStore.getState().grimorio.registro.at(-1)?.t).toBe("Usaste Salto de las nubes (te quedan 0).");
  });
  it("con competencia +3 (nivel 5) hay 3 usos", () => {
    useStore.getState().setHoja("nivel", 5);
    for (let i = 0; i < 3; i++) useStore.getState().useCloudJump();
    expect(useStore.getState().grimorio.saltoUsados).toBe(3);
    expect(useStore.getState().useCloudJump()).toMatch(/^No te quedan/);
  });
  it("el descanso largo limpia Portento y restaura Salto de las nubes", () => {
    const s = useStore.getState();
    s.setPortent(0, 7);
    useStore.getState().togglePortent(0);
    useStore.getState().useCloudJump();
    useStore.getState().useCloudJump();
    expect(useStore.getState().longRest()).toContain("Tira tus 2 dados de Portento");
    const g = useStore.getState().grimorio;
    expect(g.portento).toEqual({ dados: ["", ""], usados: [false, false] });
    expect(g.saltoUsados).toBe(0);
  });
  it("gastar la Inspiración heroica desde el grimorio", () => {
    useStore.getState().setHoja("inspiracion", true);
    expect(useStore.getState().spendInspiration()).toMatch(/^Usaste/);
    expect(useStore.getState().hoja.inspiracion).toBe(false);
    expect(useStore.getState().spendInspiration()).toMatch(/^No tienes/);
  });
});

describe("aviso de componente con costo", () => {
  beforeEach(reset);

  it("avisa al lanzar Identificar sin perla en el equipo, sin bloquearlo", () => {
    const msg = useStore.getState().cast("identificar", 0, true);
    expect(msg).toContain("Lanzaste Identificar como ritual");
    expect(msg).toContain("cuesta 100 po");
  });
  it("no avisa si el equipo tiene una perla", () => {
    useStore.getState().editHoja(h => { h.equipo.push({ cant: 1, nombre: "Perla (100 po)" }); });
    expect(useStore.getState().cast("identificar", 1)).not.toContain("Ojo");
    expect(useStore.getState().grimorio.usados[1]).toBe(1);
  });
});
