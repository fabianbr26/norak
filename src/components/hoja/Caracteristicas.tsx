import { ABIL, abilityMod, saveTotal, signed, skillTotal, SKILLS, type NivelComp } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { useStore } from "../../state/store";
import { NumField } from "../comunes/fields";

const COMP = ["sin competencia", "competencia", "pericia"];

export function Caracteristicas() {
  const car = useStore(s => s.hoja.car);
  const salv = useStore(s => s.hoja.salv);
  const hab = useStore(s => s.hoja.hab);
  const editHoja = useStore(s => s.editHoja);
  const { lvl } = useDerived();

  return (
    <section className="sec">
      <h2 className="sec-h">Características y habilidades</h2>
      <div className="abils">
        {ABIL.map(([k, name]) => (
          <div className="abil" key={k}>
            <div className="abil-top">
              <div className="medal">{signed(abilityMod(car[k]))}</div>
              <div>
                <div className="abil-name">{name}</div>
                <label className="abil-score"><span className="lbl" style={{ margin: 0 }}>Puntuación</span>
                  <NumField path={`car.${k}`} aria-label={`Puntuación de ${name}`} />
                </label>
              </div>
            </div>
            <div className="skl save-row">
              <button type="button" className="prof" data-v={salv[k] ? 1 : 0}
                aria-label={`Salvación de ${name}: ${salv[k] ? "con" : "sin"} competencia`}
                onClick={() => editHoja(h => { h.salv[k] = !h.salv[k]; })} />
              <span className="val">{signed(saveTotal(car, salv[k], k, lvl))}</span>
              <span className="nm">Tirada de salvación</span>
            </div>
            {SKILLS.filter(s => s[2] === k).map(([id, nm]) => {
              const v = hab[id] || 0;
              return (
                <div className="skl" key={id}>
                  <button type="button" className="prof" data-v={v} aria-label={`${nm}: ${COMP[v]}. Toca para cambiar.`}
                    onClick={() => editHoja(h => { h.hab[id] = (((h.hab[id] || 0) + 1) % 3) as NivelComp; })} />
                  <span className="val">{signed(skillTotal(car, hab, id, k, lvl))}</span>
                  <span className="nm">{nm}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="legend">
        <span><span className="prof" data-v="0" /> sin competencia</span>
        <span><span className="prof" data-v="1" /> competencia</span>
        <span><span className="prof" data-v="2" /> pericia (doble)</span>
        <span>Toca el círculo para cambiarlo.</span>
      </div>
    </section>
  );
}
