import { useState } from "react";
import { abilityMod, passivePerception, signed } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { CheckField, NumField, TextField } from "../comunes/fields";
import { SubirNivel } from "./SubirNivel";

export function Identidad() {
  const [open, setOpen] = useState(false);
  const { lvl } = useDerived();
  const subclase = useStore(s => s.hoja.subclase);
  return (
    <section className="sec">
      <div className="ident">
        <div>
          <TextField path="nombre" className="name" placeholder="Nombre del personaje" aria-label="Nombre del personaje" />
          <span className="lbl">Nombre del personaje</span>
        </div>
        <div className="ident-grid">
          <label><TextField path="clase" /><span className="lbl">Clase</span></label>
          <label><TextField path="subclase" /><span className="lbl">Subclase</span></label>
          <label><NumField path="nivel" /><span className="lbl">Nivel</span></label>
          <label><NumField path="px" /><span className="lbl">Puntos de experiencia</span></label>
          <label><TextField path="especie" /><span className="lbl">Especie</span></label>
          <label><TextField path="trasfondo" /><span className="lbl">Trasfondo</span></label>
          <label style={{ gridColumn: "span 2" }}><TextField path="alineamiento" /><span className="lbl">Alineamiento</span></label>
        </div>
      </div>
      <div className="ident-actions">
        <button type="button" className="btn gold big-btn" onClick={() => setOpen(true)} disabled={lvl >= 20}>
          <span aria-hidden="true">⬆</span> Subir de nivel
        </button>
        {lvl >= 3 && !subclase.trim() && <span className="calc-note">Aún no anotas tu subclase de mago (nivel 3).</span>}
      </div>
      <SubirNivel open={open} onClose={() => setOpen(false)} />
      <Vitales />
      <Stats />
    </section>
  );
}

function Vitales() {
  const pg = useStore(s => s.hoja.pg);
  const muerte = useStore(s => s.hoja.muerte);
  const insp = useStore(s => s.hoja.inspiracion);
  const { damage, heal, editHoja } = useStore.getState();
  const { lvl } = useDerived();
  const [amt, setAmt] = useState("1");
  const n = Math.max(0, Number(amt) || 0);
  const mx = Number(pg.max) || 0, act = Number(pg.act) || 0;
  const pct = mx ? Math.max(0, Math.min(100, (act / mx) * 100)) : 0;

  const pip = (k: "ok" | "bad", i: number) => (
    <button key={i} type="button" className={"pip" + (k === "bad" ? " bad" : "")} aria-pressed={i < muerte[k]}
      aria-label={`${k === "ok" ? "Éxito" : "Fallo"} ${i + 1}`}
      onClick={() => editHoja(h => { h.muerte[k] = h.muerte[k] === i + 1 ? i : i + 1; })} />
  );

  return (
    <div className="vitals">
      <div className="seal shield">
        <h3>Clase de armadura</h3>
        <NumField path="ca" className="big" aria-label="Clase de armadura" />
        <CheckField path="caEscudo" label="Escudo" />
      </div>
      <div className="seal wide hp-actions">
        <h3>Puntos de golpe</h3>
        <div className="row" style={{ gap: 18 }}>
          <div><NumField path="pg.act" className="big" style={{ width: "3em" }} aria-label="PG actuales" /><div className="sub">actuales</div></div>
          <div><NumField path="pg.max" className="mini" aria-label="PG máximos" /><div className="sub">máx.</div></div>
          <div><NumField path="pg.temp" className="mini" aria-label="PG temporales" /><div className="sub">temp.</div></div>
        </div>
        <div className="hpbar"><i style={{ width: pct + "%" }} /></div>
        <div className="row">
          <input className="ink num mini" type="number" min={1} inputMode="numeric" value={amt} onChange={e => setAmt(e.target.value)} aria-label="Cantidad de daño o curación" />
          <button type="button" className="btn red big-btn" onClick={() => toast(damage(n))} disabled={!n}>Daño</button>
          <button type="button" className="btn ok big-btn" onClick={() => toast(heal(n))} disabled={!n}>Curar</button>
        </div>
      </div>
      <div className="seal">
        <h3>Dados de golpe</h3>
        <div className="row"><TextField path="dg.tipo" className="num mini" aria-label="Tipo de dado" /></div>
        <div className="sub" style={{ marginTop: 6 }}>gastados</div>
        <div className="row"><NumField path="dg.gastados" className="mini" aria-label="Dados gastados" /> <span className="sub">/ {lvl}</span></div>
      </div>
      <div className="seal">
        <h3>Salvaciones contra muerte</h3>
        <div className="sub">Éxitos</div>
        <div className="row" style={{ margin: "4px 0 8px" }}>{[0, 1, 2].map(i => pip("ok", i))}</div>
        <div className="sub">Fallos</div>
        <div className="row" style={{ marginTop: 4 }}>{[0, 1, 2].map(i => pip("bad", i))}</div>
      </div>
      <div className="seal">
        <h3>Inspiración heroica</h3>
        <button type="button" className="pip" aria-pressed={insp} aria-label="Inspiración heroica"
          style={{ width: 34, height: 34, margin: "10px auto 6px", display: "block" }}
          onClick={() => editHoja(h => { h.inspiracion = !h.inspiracion; })} />
        <div className="sub">{insp ? "¡inspirado!" : "sin inspiración"}</div>
      </div>
    </div>
  );
}

function Stats() {
  const h = useStore(s => s.hoja);
  const { lvl, prof } = useDerived();
  const pp = passivePerception(h.car, h.hab, lvl);
  return (
    <div className="stats5">
      <div className="stat"><span className="lbl">Bonif. por competencia</span><div className="big">{signed(prof)}</div><div className="calc-note">según nivel</div></div>
      <div className="stat">
        <span className="lbl">Iniciativa</span><div className="big">{signed(abilityMod(h.car.des) + (Number(h.iniAjuste) || 0))}</div>
        <label className="calc-note">ajuste <NumField path="iniAjuste" signedInput className="mini" style={{ width: "2.6em" }} /></label>
      </div>
      <div className="stat"><span className="lbl">Velocidad</span><TextField path="velocidad" className="big" style={{ fontSize: "1.6rem", border: 0 }} aria-label="Velocidad" /></div>
      <div className="stat"><span className="lbl">Tamaño / altura</span><TextField path="tamano" className="big" style={{ fontSize: "1.6rem", border: 0 }} aria-label="Tamaño o altura" /></div>
      <div className="stat">
        <span className="lbl">Percepción pasiva</span>
        <NumField path="percPasiva" className="big" style={{ fontSize: "1.6rem", border: 0 }} placeholder={String(pp)} aria-label="Percepción pasiva" />
        <div className="calc-note">calculada: {pp}</div>
      </div>
    </div>
  );
}
