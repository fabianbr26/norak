import { useState } from "react";
import { cloudJumpMax, hasCloudJump, isDiviner, portentDice } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { ConfirmButton } from "../comunes/ConfirmButton";

/** Rasgos con usos por día: Inspiración heroica, Portento (Adivino) y Salto de las nubes (goliath). */
export function RasgosDelDia() {
  const subclase = useStore(s => s.hoja.subclase);
  const especie = useStore(s => s.hoja.atributosEspecie);
  return (
    <section className="rasgos" aria-label="Rasgos del día">
      <Inspiracion />
      {isDiviner(subclase) && <Portento />}
      {hasCloudJump(especie) && <SaltoNubes />}
    </section>
  );
}

function Inspiracion() {
  const insp = useStore(s => s.hoja.inspiracion);
  const { editHoja, spendInspiration } = useStore.getState();
  return (
    <div className="rasgo">
      <h3>Inspiración heroica</h3>
      <div className="row" style={{ justifyContent: "flex-start", gap: 14 }}>
        <button type="button" className="pip" aria-pressed={insp} style={{ width: 30, height: 30, margin: 6 }}
          aria-label={insp ? "Inspiración heroica: la tienes. Tocar para quitarla" : "Inspiración heroica: no la tienes. Tocar para ganarla"}
          onClick={() => editHoja(h => { h.inspiracion = !h.inspiracion; })} />
        <button type="button" className="btn" disabled={!insp} onClick={() => toast(spendInspiration())}>Gastar</button>
      </div>
      <p className="calc-note">{insp ? "Puedes repetir una tirada d20." : "Sin inspiración. Toca el rombo cuando la ganes."}</p>
    </div>
  );
}

function Portento() {
  const p = useStore(s => s.grimorio.portento);
  const { setPortent, rollPortent, togglePortent } = useStore.getState();
  const { lvl } = useDerived();
  const n = portentDice(lvl);
  const dados = Array.from({ length: n }, (_, i) => p.dados[i] ?? "");
  const hayDados = dados.some(d => d !== "");
  const roll = () => toast(rollPortent());
  return (
    <div className="rasgo">
      <h3>Portento</h3>
      <div className="portent">
        {dados.map((d, i) => (
          <div className="portent-slot" key={i}>
            <button type="button" className="d20" aria-pressed={!!p.usados[i]} disabled={d === ""}
              aria-label={d === "" ? `Portento ${i + 1}: sin tirar` : `Portento ${i + 1}: ${d}${p.usados[i] ? ", usado. Tocar para recuperarlo" : ". Tocar para usarlo"}`}
              onClick={() => toast(togglePortent(i))}>
              {d === "" ? "–" : d}
            </button>
            <PortentInput value={d} index={i} onSet={setPortent} />
          </div>
        ))}
      </div>
      {hayDados
        ? <ConfirmButton className="btn" confirmText="¿Volver a tirar?" onConfirm={roll}>Tirar de nuevo</ConfirmButton>
        : <button type="button" className="btn solid" onClick={roll}>Tirar {n}d20</button>}
      <p className="calc-note">{hayDados ? "Toca un resultado para usarlo." : "Tíralos aquí o escribe los que sacaste en la mesa."}</p>
    </div>
  );
}

function PortentInput({ value, index, onSet }: { value: number | ""; index: number; onSet: (i: number, v: number | "") => void }) {
  const [raw, setRaw] = useState<string | null>(null);
  return (
    <input className="ink num" inputMode="numeric" aria-label={`Anotar el d20 ${index + 1} a mano`} placeholder="d20"
      value={raw ?? String(value)}
      onChange={e => setRaw(e.target.value)}
      onBlur={() => {
        if (raw !== null) {
          const t = raw.trim(), v = Number(t);
          if (t === "") onSet(index, "");
          else if (Number.isFinite(v)) onSet(index, v);
        }
        setRaw(null);
      }}
      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
  );
}

function SaltoNubes() {
  const usados = useStore(s => s.grimorio.saltoUsados);
  const { useCloudJump, restoreCloudJump } = useStore.getState();
  const { lvl } = useDerived();
  const max = cloudJumpMax(lvl), quedan = Math.max(0, max - usados);
  return (
    <div className="rasgo">
      <h3>Salto de las nubes</h3>
      <div className="row" style={{ justifyContent: "flex-start", gap: 12 }}>
        <div className="gems" aria-label={`${quedan} de ${max} usos disponibles`}>
          {Array.from({ length: max }, (_, j) => (
            <button key={j} type="button" className={"gem cloud" + (j >= quedan ? " spent" : "")}
              aria-label={j < quedan ? "Uso disponible" : "Uso gastado: tocar para recuperarlo"}
              onClick={() => { if (j >= quedan) restoreCloudJump(); else toast(useCloudJump()); }} />
          ))}
        </div>
        <button type="button" className="btn blue" disabled={!quedan} onClick={() => toast(useCloudJump())}>Usar</button>
      </div>
      <p className="calc-note">Acción adicional: teletransporte de 9 m. {quedan} de {max} (tu competencia) hasta el descanso largo.</p>
    </div>
  );
}
