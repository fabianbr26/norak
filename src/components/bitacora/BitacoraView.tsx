import { useStore } from "../../state/store";
import { NumField, AreaField, TextField } from "../comunes/fields";
import { Respaldo } from "./Respaldo";

export function BitacoraView() {
  const bit = useStore(s => s.hoja.bitacora);
  const editHoja = useStore(s => s.editHoja);
  const total = bit.reduce((a, b) => a + (Number(b.px) || 0), 0);
  const add = () => {
    editHoja(h => { h.bitacora.unshift({ fecha: new Date().toLocaleDateString("es-MX"), notas: "", px: "" }); });
    requestAnimationFrame(() => document.getElementById("bit-0-notas")?.focus());
  };
  return (
    <main className="scroll" aria-label="Bitácora">
      <section className="sec">
        <h2 className="sec-h">Bitácora de partidas</h2>
        <p className="hint">Anota cada sesión: qué pasó, qué encontraste y cuánta experiencia ganaste.</p>
        <div className="filters">
          <button type="button" className="btn solid big-btn" onClick={add}>+ Nueva sesión</button>
          {bit.length > 0 && <span className="px-total">{bit.length} {bit.length === 1 ? "sesión" : "sesiones"} · {total} PX anotados</span>}
        </div>
        {bit.length ? bit.map((b, i) => (
          <div className="log-entry" key={bit.length - i}>
            <label><TextField path={`bitacora.${i}.fecha`} /><span className="lbl">Fecha</span></label>
            <label className="le-notes"><AreaField id={`bit-${i}-notas`} path={`bitacora.${i}.notas`} rows={2} style={{ minHeight: "3em" }} /><span className="lbl">Qué pasó</span></label>
            <label><NumField path={`bitacora.${i}.px`} /><span className="lbl">PX</span></label>
            <button type="button" className="x" aria-label={`Quitar sesión del ${b.fecha}`} onClick={() => editHoja(h => { h.bitacora.splice(i, 1); })}>×</button>
          </div>
        )) : <p className="hint">Todavía no hay sesiones anotadas.</p>}
      </section>
      <Respaldo />
    </main>
  );
}
