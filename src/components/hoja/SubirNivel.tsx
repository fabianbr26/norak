import { useState } from "react";
import { abilityMod, levelUpPlan, signed, WIZ_HIT_DIE } from "../../rules/wizard2024";
import { useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { Modal } from "../comunes/Modal";

export function SubirNivel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="lvlup-title">
      <Contenido onClose={onClose} />
    </Modal>
  );
}

function Contenido({ onClose }: { onClose: () => void }) {
  const h = useStore(s => s.hoja);
  const levelUp = useStore(s => s.levelUp);
  const plan = levelUpPlan(Number(h.nivel) || 1, h.car.con, h.especie);
  const conMod = abilityMod(h.car.con);
  const [hp, setHp] = useState(String(plan?.hpAverage ?? 0));
  const [rolled, setRolled] = useState<number | null>(null);

  if (!plan) return <><h2 id="lvlup-title">Nivel máximo</h2><p>Norak ya está en nivel 20.</p><div className="modal-actions"><button className="btn" onClick={onClose}>Cerrar</button></div></>;

  const roll = () => {
    const d = 1 + Math.floor(Math.random() * WIZ_HIT_DIE);
    setRolled(d);
    setHp(String(Math.max(1, d + conMod)));
  };
  const confirm = () => {
    levelUp(Number(hp) || 0);
    toast(`¡Norak sube a nivel ${plan.to}! Revisa lo que toca elegir.`);
    onClose();
  };

  return (
    <>
      <h2 id="lvlup-title">Subir de nivel</h2>
      <div className="lvl-jump" aria-label={`De nivel ${plan.from} a nivel ${plan.to}`}>
        {plan.from} <span aria-hidden="true">→</span> {plan.to}
      </div>

      <h3 className="group-h">Puntos de golpe</h3>
      <div className="row" style={{ justifyContent: "flex-start", gap: 10 }}>
        <label>
          <span className="lbl">PG máximos que sumas</span>
          <input className="ink num" style={{ width: "4em" }} type="number" min={1} inputMode="numeric" value={hp} onChange={e => setHp(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => { setRolled(null); setHp(String(plan.hpAverage)); }}>Promedio ({plan.hpAverage})</button>
        <button type="button" className="btn" onClick={roll}>Tirar 1d{WIZ_HIT_DIE} {signed(conMod)}</button>
      </div>
      <p className="calc-note">{rolled != null ? `Sacaste ${rolled} en el d${WIZ_HIT_DIE}.` : `Promedio del mago: 4 + mod. de Constitución (${signed(conMod)}), mínimo 1.`} También ganas un dado de golpe.</p>

      <h3 className="group-h">Cambia automáticamente</h3>
      <ul>
        {plan.changes.map(c => <li key={c}>{c}</li>)}
        <li>Espacios por nivel: {plan.slots[1].join(" / ")} · Trucos: {plan.cantrips[1]} · Preparados: {plan.prepared[1]}.</li>
      </ul>

      <h3 className="group-h">Te toca elegir</h3>
      <ul className="choose-list">
        {plan.choices.map(c => <li key={c}>{c}</li>)}
      </ul>

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn solid big-btn" onClick={confirm}>Subir a nivel {plan.to}</button>
      </div>
    </>
  );
}
