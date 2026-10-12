import { beforeEach, describe, expect, it } from "vitest";
import { buildBackup, backupFileName, parseBackup } from "./backup";
import { blankGrim, blankSheet, merge, seedGrim, seedSheet } from "./defaults";
import { useStore } from "./store";

const reset = () => useStore.setState({ hoja: seedSheet(), grimorio: seedGrim(), meta: { modificado: null, ultimoRespaldo: null } });

describe("datos iniciales", () => {
  it("cargan a Norak desde hoja.json y grimorio.json", () => {
    const h = seedSheet(), g = seedGrim();
    expect(h.nombre).toBe("Norak del valle gris");
    expect(h.nivel).toBe(3);
    expect(h.trasfondo).toBe("Ermitaño");
    expect(g.trucos).toHaveLength(3);
    expect(g.preparados).toEqual(["rayo-nauseabundo", "dormir", "grasa", "sirviente-invisible"]);
  });
  it("merge conserva campos nuevos y respeta los guardados", () => {
    const m = merge(blankSheet(), { nombre: "X", pg: { act: 5 } });
    expect(m.nombre).toBe("X");
    expect(m.pg).toEqual({ act: 5, max: 0, temp: 0 });
    expect(m.sint).toEqual(["", "", ""]);
  });
});

describe("respaldo", () => {
  it("ida y vuelta", () => {
    const b = buildBackup(seedSheet(), seedGrim(), "2026-10-10T10:00:00.000Z", new Date("2026-10-10T12:00:00Z"));
    const r = parseBackup(JSON.stringify(b));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.hoja.nombre).toBe("Norak del valle gris");
      expect(r.grimorio.libro).toHaveLength(10);
      expect(r.modificado).toBe("2026-10-10T10:00:00.000Z");
    }
  });
  it("acepta {hoja, grimorio} sin cabecera", () => {
    const r = parseBackup(JSON.stringify({ hoja: { nombre: "A" }, grimorio: {} }));
    expect(r.ok && r.hoja.nombre).toBe("A");
    expect(r.ok && r.grimorio).toEqual(blankGrim());
  });
  it("rechaza archivos inválidos", () => {
    expect(parseBackup("no es json").ok).toBe(false);
    expect(parseBackup("[]").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ hoja: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: "otra", hoja: {}, grimorio: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: "norak", version: 99, hoja: {}, grimorio: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ hoja: {}, grimorio: { libro: "x" } })).ok).toBe(false);
  });
  it("nombre de archivo con fecha", () => {
    expect(backupFileName("Norak del valle gris", new Date(2026, 9, 10, 18, 5))).toBe("norak-respaldo-2026-10-10-1805.json");
  });
});

describe("acciones del store", () => {
  beforeEach(reset);

  it("lanzar gasta un espacio y fija la concentración", () => {
    const s = useStore.getState();
    s.cast("dormir", 1);
    expect(useStore.getState().grimorio.usados[1]).toBe(1);
    expect(useStore.getState().grimorio.conc).toBe("dormir");
    const msg = useStore.getState().cast("telarana", 2);
    expect(msg).toContain("Terminó tu concentración en Dormir");
    expect(useStore.getState().grimorio.conc).toBe("telarana");
  });
  it("rituales y trucos no gastan espacios", () => {
    useStore.getState().cast("deteccion-de-la-magia", 0, true);
    useStore.getState().cast("descarga-de-fuego", 0);
    expect(useStore.getState().grimorio.usados).toEqual({});
  });
  it("descanso corto una vez al día; descanso largo restaura todo", () => {
    const s = useStore.getState();
    s.cast("dormir", 1); s.cast("grasa", 1); s.cast("paso-brumoso", 2);
    s.damage(25);
    expect(useStore.getState().shortRest()).toContain("nivel 2");
    expect(useStore.getState().grimorio.usados).toEqual({ 1: 2, 2: 0 });
    expect(useStore.getState().shortRest()).toBe("Ya usaste Recuperación arcana hoy.");
    useStore.getState().longRest();
    const { hoja, grimorio } = useStore.getState();
    expect(grimorio.usados).toEqual({});
    expect(grimorio.recuperado).toBe(false);
    expect(grimorio.conc).toBeNull();
    expect(hoja.pg.act).toBe(20);
  });
  it("subir de nivel suma PG y nivel", () => {
    useStore.getState().levelUp(6);
    const h = useStore.getState().hoja;
    expect(h.nivel).toBe(4);
    expect(h.pg.max).toBe(26);
    expect(h.pg.act).toBe(26);
  });
  it("las modificaciones marcan la fecha", () => {
    useStore.getState().setHoja("pg.act", 10);
    expect(useStore.getState().hoja.pg.act).toBe(10);
    expect(useStore.getState().meta.modificado).not.toBeNull();
  });
  it("conjuros propios se escriben en el libro y se pueden borrar", () => {
    useStore.getState().addCustom({ n: "Chispa", l: 0, e: "evo", t: "Acción", r: "9 m", c: "V", d: "Instantáneo", x: "Una chispa pequeña." });
    const g = useStore.getState().grimorio, id = g.custom[0].id;
    expect(g.trucos).toContain(id);
    useStore.getState().deleteCustom(id);
    expect(useStore.getState().grimorio.custom).toHaveLength(0);
    expect(useStore.getState().grimorio.trucos).not.toContain(id);
  });
});
