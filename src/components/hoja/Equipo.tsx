import { preparedMax, signed, slotsLeft, slotsMax, slotTable, suggestedWeaponAttack, abilityMod } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { useStore } from "../../state/store";
import { useUI } from "../../state/ui";
import { AreaField, CheckField, NumField, TextField } from "../comunes/fields";

export function Armas() {
  const armas = useStore(s => s.hoja.armas);
  const car = useStore(s => s.hoja.car);
  const editHoja = useStore(s => s.editHoja);
  const { lvl, prof, atk } = useDerived();
  return (
    <section className="sec">
      <h2 className="sec-h">Armas y trucos de daño</h2>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th style={{ width: "28%" }}>Nombre</th><th style={{ width: "14%" }}>Bonif. atq. / CD</th><th style={{ width: "22%" }}>Daño y tipo</th><th>Notas</th><th><span className="vh">Quitar</span></th></tr></thead>
          <tbody>
            {armas.length ? armas.map((a, i) => (
              <tr key={i}>
                <td data-l="Nombre"><TextField path={`armas.${i}.nombre`} aria-label="Nombre del arma" /></td>
                <td data-l="Ataque / CD"><TextField path={`armas.${i}.atq`} className="num" placeholder={signed(suggestedWeaponAttack(a.nombre || "", car, lvl))} aria-label="Bonificador de ataque" /></td>
                <td data-l="Daño y tipo"><TextField path={`armas.${i}.dano`} aria-label="Daño y tipo" /></td>
                <td data-l="Notas"><TextField path={`armas.${i}.notas`} aria-label="Notas" /></td>
                <td><button type="button" className="x" aria-label={`Quitar ${a.nombre || "arma"}`} onClick={() => editHoja(h => { h.armas.splice(i, 1); })}>×</button></td>
              </tr>
            )) : <tr><td colSpan={5} className="hint">Sin armas anotadas.</td></tr>}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn add" onClick={() => editHoja(h => { h.armas.push({ nombre: "", atq: "", dano: "", notas: "" }); })}>+ Añadir arma</button>
      <p className="hint" style={{ marginTop: 8 }}>Sugerido con Fuerza: {signed(abilityMod(car.fue) + prof)} al ataque · Ataque de conjuro: {signed(atk)}</p>
    </section>
  );
}

export function EntrenamientoYMagia() {
  const preparados = useStore(s => s.grimorio.preparados.length);
  const usados = useStore(s => s.grimorio.usados);
  const extra = useStore(s => s.grimorio.extra);
  const setTab = useUI(s => s.setTab);
  const { lvl, spMod, dc, atk } = useDerived();
  return (
    <section className="sec two">
      <div className="box">
        <h2 className="sec-h">Entrenamiento y competencias</h2>
        <span className="lbl">Entrenamiento con armadura</span>
        <div className="row" style={{ justifyContent: "flex-start", gap: 16, margin: "6px 0 12px" }}>
          <CheckField path="armadura.ligeras" label="Ligeras" />
          <CheckField path="armadura.medias" label="Medias" />
          <CheckField path="armadura.pesadas" label="Pesadas" />
          <CheckField path="armadura.escudos" label="Escudos" />
        </div>
        <label><span className="lbl">Armas</span><AreaField path="armasComp" rows={2} /></label>
        <label><span className="lbl">Herramientas</span><AreaField path="herramientas" rows={2} /></label>
        <label><span className="lbl">Idiomas</span><AreaField path="idiomas" rows={2} /></label>
      </div>
      <div className="box">
        <h2 className="sec-h">Magia</h2>
        <div className="magic-sum">
          <div className="stat"><span className="lbl">Aptitud mágica</span><AptitudSelect /></div>
          <div className="stat"><span className="lbl">Modificador</span><div className="big">{signed(spMod)}</div></div>
          <div className="stat"><span className="lbl">CD de salvación</span><div className="big">{dc}</div></div>
          <div className="stat"><span className="lbl">Ataque de conjuros</span><div className="big">{signed(atk)}</div></div>
        </div>
        <div className="slots-line">
          <span><b>Espacios hoy</b></span>
          {slotTable(lvl).map((_, i) => <span key={i}><b>Nivel {i + 1}</b> {slotsLeft(lvl, i + 1, usados, extra)}/{slotsMax(lvl, i + 1, extra)}</span>)}
          <span><b>Preparados</b> {preparados}/{preparedMax(lvl)}</span>
        </div>
        <p style={{ marginTop: 14 }}><button type="button" className="btn solid" onClick={() => setTab("grimorio")}>Abrir el grimorio</button></p>
      </div>
    </section>
  );
}

function AptitudSelect() {
  const apt = useStore(s => s.hoja.aptitud);
  const setHoja = useStore(s => s.setHoja);
  return (
    <select className="ink" style={{ fontSize: "1rem" }} value={apt} onChange={e => setHoja("aptitud", e.target.value)} aria-label="Aptitud mágica">
      <option value="int">Inteligencia</option><option value="sab">Sabiduría</option><option value="car">Carisma</option>
    </select>
  );
}

export function Rasgos() {
  return (
    <section className="sec three">
      <div className="box"><h2 className="sec-h">Rasgos de clase</h2><AreaField path="rasgosClase" rows={8} placeholder="Aún vacío en tu hoja." aria-label="Rasgos de clase" /></div>
      <div className="box"><h2 className="sec-h">Atributos de especie</h2><AreaField path="atributosEspecie" rows={8} aria-label="Atributos de especie" /></div>
      <div className="box"><h2 className="sec-h">Dotes</h2><AreaField path="dotes" rows={8} placeholder="Aún vacío en tu hoja." aria-label="Dotes" /></div>
    </section>
  );
}

const COINS = [["pc", "PC"], ["pp", "PP"], ["pe", "PE"], ["po", "PO"], ["ppt", "PPT"]] as const;

export function HistoriaYEquipo() {
  const equipo = useStore(s => s.hoja.equipo);
  const editHoja = useStore(s => s.editHoja);
  return (
    <section className="sec two">
      <div className="box">
        <h2 className="sec-h">Historia y personalidad</h2>
        <label><span className="lbl">Aspecto</span><AreaField path="aspecto" rows={3} placeholder="Cómo se ve Norak." /></label>
        <label><span className="lbl">Ideal, vínculo, defecto y rasgo</span><AreaField path="historia" rows={7} /></label>
      </div>
      <div className="box">
        <h2 className="sec-h">Equipo</h2>
        {equipo.length ? equipo.map((e, i) => (
          <div className="eq-row" key={i}>
            <NumField path={`equipo.${i}.cant`} aria-label="Cantidad" />
            <TextField path={`equipo.${i}.nombre`} aria-label="Objeto" />
            <button type="button" className="x" aria-label={`Quitar ${e.nombre || "objeto"}`} onClick={() => editHoja(h => { h.equipo.splice(i, 1); })}>×</button>
          </div>
        )) : <p className="hint">Mochila vacía.</p>}
        <button type="button" className="btn add" onClick={() => editHoja(h => { h.equipo.push({ cant: 1, nombre: "" }); })}>+ Añadir objeto</button>

        <span className="lbl" style={{ marginTop: 16 }}>Sintonización con objetos mágicos</span>
        {[0, 1, 2].map(i => (
          <div className="eq-row" key={i} style={{ marginTop: 4 }}>
            <span style={{ color: "var(--gold)" }} aria-hidden="true">◆</span>
            <TextField path={`sint.${i}`} aria-label={`Objeto sintonizado ${i + 1}`} />
          </div>
        ))}

        <span className="lbl" style={{ margin: "16px 0 6px" }}>Monedas</span>
        <div className="coins">
          {COINS.map(([k, l]) => <label className="coin" key={k}><b>{l}</b><NumField path={`monedas.${k}`} aria-label={`Monedas ${l}`} /></label>)}
        </div>
      </div>
    </section>
  );
}
