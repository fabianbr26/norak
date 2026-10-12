import { useEffect, useRef, useState } from "react";
import { arcaneRecoveryBudget, slotsLeft, slotsMax, slotTable } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { findSpell, useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { ConfirmButton } from "../comunes/ConfirmButton";

/** Espacios de conjuro (gemas), concentración y descansos. */
export function Reserva() {
  const g = useStore(s => s.grimorio);
  const { toggleGem, endConcentration, shortRest, longRest } = useStore.getState();
  const { lvl } = useDerived();
  const pop = usePop(g.usados);
  const conc = findSpell(g, g.conc);

  return (
    <section className="reserve">
      <div>
        <h2 className="sec-h" style={{ justifyContent: "flex-start" }}>Espacios de conjuro</h2>
        {slotTable(lvl).length ? slotTable(lvl).map((_, i) => {
          const l = i + 1, mx = slotsMax(lvl, l, g.extra), left = slotsLeft(lvl, l, g.usados, g.extra);
          return (
            <div className="slot-row" key={l}>
              <span className="lv">Nivel {l}</span>
              <div className="gems">
                {Array.from({ length: mx }, (_, j) => (
                  <button key={j} type="button" className={"gem" + (j >= left ? " spent" : "") + (pop.has(l) ? " pop" : "")}
                    aria-label={`Espacio de nivel ${l} ${j < left ? "disponible: tocar para gastar" : "gastado: tocar para recuperar"}`}
                    onClick={() => toggleGem(l, j >= left)} />
                ))}
              </div>
              <span className="cnt">{left} / {mx}</span>
            </div>
          );
        }) : <p className="hint">Sin espacios a este nivel.</p>}
        <p className="hint" style={{ marginTop: 8 }}>Toca una gema para gastarla o recuperarla a mano. Los trucos no gastan espacios.</p>
      </div>
      <div>
        <div className={"conc" + (conc ? " on" : "")} aria-live="polite">
          <span className="lbl">{conc ? "Concentrándote en" : "Concentración"}</span>
          {conc ? (
            <>
              <strong>{conc.n}</strong>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
                <span className="calc-note">Si recibes daño: salvación de CON, CD 10 o la mitad del daño (máx. 30).</span>
                <button type="button" className="btn" onClick={endConcentration}>Terminar</button>
              </div>
            </>
          ) : <span className="calc-note">Ningún conjuro de concentración activo.</span>}
        </div>
        <div className="rest">
          <button type="button" className="btn blue big-btn" disabled={g.recuperado} onClick={() => toast(shortRest())}>
            Descanso corto · Recuperación arcana
          </button>
          <p>{g.recuperado
            ? "Ya usaste Recuperación arcana hoy. Vuelve con el descanso largo."
            : `Una vez al día, tras un descanso corto, recuperas espacios que sumen hasta ${arcaneRecoveryBudget(lvl)} niveles (ninguno de nivel 6 o más).`}</p>
          <ConfirmButton className="btn solid big-btn" confirmText="Pulsa otra vez para descansar" onConfirm={() => toast(longRest())}>
            Descanso largo
          </ConfirmButton>
          <p>Recupera todos los espacios, los PG y los dados de golpe, y vuelve a elegir tus conjuros preparados.</p>
        </div>
      </div>
    </section>
  );
}

/** Niveles cuyas gemas cambiaron hace un momento (para la animación). */
function usePop(usados: Record<string | number, number | undefined>) {
  const prev = useRef(usados);
  const [pop, setPop] = useState<Set<number>>(new Set());
  useEffect(() => {
    const keys = new Set([...Object.keys(prev.current), ...Object.keys(usados)]);
    const changed = new Set([...keys].filter(k => (Number(prev.current[k]) || 0) !== (Number(usados[k]) || 0)).map(Number));
    prev.current = usados;
    if (!changed.size) return;
    setPop(changed);
    const t = window.setTimeout(() => setPop(new Set()), 550);
    return () => window.clearTimeout(t);
  }, [usados]);
  return pop;
}
