import { useState, type FormEvent } from "react";
import { SCH, SPELLS, type Conjuro, type Escuela } from "../../data/spells";
import { cantripsKnown, maxSpellLevel, preparedMax } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { findSpell, useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { SpellCard } from "./SpellCard";

const byLevelName = (a: Conjuro, b: Conjuro) => a.l - b.l || a.n.localeCompare(b.n, "es");
const lvlName = (l: number) => (l === 0 ? "Truco" : `Nivel ${l}`);

const FlipHint = () => (
  <p className="flip-hint">Toca una tarjeta para leerla<span className="touch-only"> o deslízala de lado para voltearla</span>.</p>
);

export function Preparados() {
  const g = useStore(s => s.grimorio);
  const { lvl } = useDerived();
  const tr = g.trucos.map(id => findSpell(g, id)).filter((s): s is Conjuro => !!s);
  const pr = g.preparados.map(id => findSpell(g, id)).filter((s): s is Conjuro => !!s).sort(byLevelName);
  const rit = g.libro.map(id => findSpell(g, id)).filter((s): s is Conjuro => !!s && !!s.rit && !g.preparados.includes(s.id));
  const max = preparedMax(lvl), over = pr.length > max;
  return (
    <div>
      <div className="filters">
        <span className={"counter" + (over ? " over" : "")}>Preparados {pr.length} / {max}</span>
        <span className="hint" style={{ margin: 0 }}>
          {pr.length < max ? `Te ${max - pr.length === 1 ? "queda" : "quedan"} ${max - pr.length} por elegir en el Libro de conjuros.`
            : over ? "Tienes más preparados de los que permite tu nivel." : "Lista del día completa."}
        </span>
      </div>
      <FlipHint />
      <h3 className="group-h">Trucos · a voluntad</h3>
      <div className="cards">{tr.length ? tr.map(s => <SpellCard key={s.id} s={s} ctx="hoy" />) : <div className="empty">Aprende trucos en «Aprender conjuros».</div>}</div>
      <h3 className="group-h">Conjuros preparados</h3>
      <div className="cards">{pr.length ? pr.map(s => <SpellCard key={s.id} s={s} ctx="hoy" />) : <div className="empty">Aún no preparas nada para hoy. Ve al Libro de conjuros y pulsa «Preparar».</div>}</div>
      {rit.length > 0 && (
        <>
          <h3 className="group-h">Rituales del libro · sin preparar</h3>
          <p className="hint">Como mago puedes lanzar como ritual cualquier conjuro ritual de tu libro, aunque no esté preparado. Tarda 10 minutos más y no gasta espacio.</p>
          <div className="cards">{rit.map(s => <SpellCard key={s.id} s={s} ctx="rit" />)}</div>
        </>
      )}
    </div>
  );
}

export function Libro() {
  const g = useStore(s => s.grimorio);
  const { lvl } = useDerived();
  const bk = g.libro.map(id => findSpell(g, id)).filter((s): s is Conjuro => !!s).sort(byLevelName);
  const levels = [...new Set(bk.map(s => s.l))];
  const max = preparedMax(lvl), n = g.preparados.length;
  return (
    <div>
      <div className="filters">
        <span className={"counter" + (n > max ? " over" : "")}>Preparados {n} / {max}</span>
        <span className="hint" style={{ margin: 0 }}>Tu libro tiene {bk.length} conjuros. Elige cuáles preparar hoy; cambian tras un descanso largo.</span>
      </div>
      {n > max && <p className="warn-box" role="alert">Te pasaste por {n - max}: quita {n - max === 1 ? "uno" : "algunos"} para respetar tu límite de nivel {lvl}.</p>}
      <FlipHint />
      {levels.length ? levels.map(l => (
        <div key={l}>
          <h3 className="group-h">{lvlName(l)}</h3>
          <div className="cards">{bk.filter(s => s.l === l).map(s => <SpellCard key={s.id} s={s} ctx="libro" />)}</div>
        </div>
      )) : <div className="empty">El libro está vacío.</div>}
    </div>
  );
}

export function Catalogo() {
  const g = useStore(s => s.grimorio);
  const { lvl } = useDerived();
  const [fl, setFl] = useState<"all" | number>("all");
  const [q, setQ] = useState("");
  const all = SPELLS.concat(g.custom);
  const levels = [...new Set(all.map(s => s.l))].sort((a, b) => a - b);
  const query = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const list = all
    .filter(s => (fl === "all" || s.l === fl) && (!query || s.n.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(query)))
    .sort(byLevelName);
  return (
    <div>
      <div className="filters">
        {(["all", ...levels] as const).map(l => (
          <button key={l} type="button" className="chip" aria-pressed={fl === l} onClick={() => setFl(l)}>{l === "all" ? "Todos" : l === 0 ? "Trucos" : `Nivel ${l}`}</button>
        ))}
        <input className="ink search" type="search" placeholder="Buscar conjuro…" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar conjuro" />
        <span className="hint" style={{ margin: 0 }}>Puedes copiar conjuros de hasta nivel {maxSpellLevel(lvl)}. Trucos: {g.trucos.length}/{cantripsKnown(lvl)}.</span>
      </div>
      <div className="cards">
        {list.length ? list.map(s => <SpellCard key={s.id} s={s} ctx="biblio" />) : <div className="empty">No hay conjuros con ese filtro. Puedes crearlo abajo.</div>}
      </div>
      <ConjuroPropio />
    </div>
  );
}

const EMPTY_FORM = { n: "", l: "1", e: "evo" as Escuela, t: "Acción", r: "18 m", c: "V, S", d: "Instantáneo", conc: false, rit: false, ef: "", x: "", up: "" };

function ConjuroPropio() {
  const addCustom = useStore(s => s.addCustom);
  const [f, setF] = useState(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) => setF(p => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = f.n.trim();
    if (!n) return;
    addCustom({
      n, l: Math.max(0, Math.min(9, Number(f.l) || 0)), e: f.e, t: f.t, r: f.r, c: f.c, d: f.d,
      conc: f.conc ? 1 : 0, rit: f.rit ? 1 : 0, ef: f.ef.trim(), x: f.x.trim(), up: f.up.trim(),
    });
    setF(EMPTY_FORM);
    setOpen(false);
    toast(`${n} quedó escrito en tu libro.`);
  };
  return (
    <details className="custom" open={open} onToggle={e => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>Crear un conjuro propio</summary>
      <form className="form-grid" onSubmit={submit}>
        <label className="full"><span className="lbl">Nombre</span><input className="ink" required value={f.n} onChange={e => set("n", e.target.value)} /></label>
        <label><span className="lbl">Nivel (0 = truco)</span><input className="ink num" type="number" min={0} max={9} required value={f.l} onChange={e => set("l", e.target.value)} /></label>
        <label><span className="lbl">Escuela</span>
          <select className="ink" value={f.e} onChange={e => set("e", e.target.value as Escuela)}>
            {(Object.keys(SCH) as Escuela[]).map(k => <option key={k} value={k}>{SCH[k][0]}</option>)}
          </select>
        </label>
        <label><span className="lbl">Tiempo de lanzamiento</span><input className="ink" value={f.t} onChange={e => set("t", e.target.value)} /></label>
        <label><span className="lbl">Alcance</span><input className="ink" value={f.r} onChange={e => set("r", e.target.value)} /></label>
        <label><span className="lbl">Componentes</span><input className="ink" value={f.c} onChange={e => set("c", e.target.value)} /></label>
        <label><span className="lbl">Duración</span><input className="ink" value={f.d} onChange={e => set("d", e.target.value)} /></label>
        <label className="chk"><input type="checkbox" checked={f.conc} onChange={e => set("conc", e.target.checked)} /> Concentración</label>
        <label className="chk"><input type="checkbox" checked={f.rit} onChange={e => set("rit", e.target.checked)} /> Ritual</label>
        <label><span className="lbl">Efecto corto (opcional)</span><input className="ink" placeholder="Ej. 2d6 fuego, salvación DES" value={f.ef} onChange={e => set("ef", e.target.value)} /></label>
        <label className="full"><span className="lbl">Descripción</span><textarea className="ink" rows={4} value={f.x} onChange={e => set("x", e.target.value)} /></label>
        <label className="full"><span className="lbl">A niveles superiores (opcional)</span><input className="ink" value={f.up} onChange={e => set("up", e.target.value)} /></label>
        <div className="full"><button className="btn solid big-btn" type="submit">Escribir en el libro</button></div>
      </form>
    </details>
  );
}

export function Registro() {
  const reg = useStore(s => s.grimorio.registro);
  return (
    <ul className="cast-log" aria-label="Registro del día">
      {reg.length ? reg.slice().reverse().map((r, i) => <li key={reg.length - i}><time>{r.h}</time><span>{r.t}</span></li>)
        : <li><span className="hint">Nada lanzado desde el último descanso largo.</span></li>}
    </ul>
  );
}
