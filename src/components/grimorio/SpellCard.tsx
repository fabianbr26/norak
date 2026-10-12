import { useRef, useState, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { SCH, type Conjuro } from "../../data/spells";
import { castOptions, damageText, effectParts, scalesWithSlot, slotsLeft } from "../../rules/wizard2024";
import { useDerived } from "../../state/derived";
import { useStore } from "../../state/store";
import { toast } from "../../state/ui";
import { ConfirmButton } from "../comunes/ConfirmButton";

/** Dónde se muestra la tarjeta: preparados de hoy, libro, catálogo o rituales sin preparar. */
export type Ctx = "hoy" | "libro" | "biblio" | "rit";

const lvlName = (l: number) => (l === 0 ? "Truco" : `Nivel ${l}`);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function sparkle(card: HTMLElement) {
  if (reducedMotion()) return;
  card.classList.remove("casting");
  void card.offsetWidth;
  card.classList.add("casting");
  for (let i = 0; i < 14; i++) {
    const sp = document.createElement("span");
    sp.className = "spark";
    const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 90;
    sp.style.left = "50%"; sp.style.top = "40%";
    sp.style.setProperty("--dx", Math.cos(a) * r + "px");
    sp.style.setProperty("--dy", Math.sin(a) * r + "px");
    card.appendChild(sp);
    setTimeout(() => sp.remove(), 950);
  }
}
function shake(card: HTMLElement) {
  if (reducedMotion()) return;
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

export function SpellCard({ s, ctx }: { s: Conjuro; ctx: Ctx }) {
  const g = useStore(st => st.grimorio);
  const { cast, prepare, unprepare, learn, forget, deleteCustom } = useStore.getState();
  const { lvl, atk, dc } = useDerived();
  const [flip, setFlip] = useState(false);
  const [chooser, setChooser] = useState<number[] | null>(null);
  const ref = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const inBook = g.libro.includes(s.id) || g.trucos.includes(s.id);
  const prep = s.l > 0 && g.preparados.includes(s.id);
  const canCast = s.l === 0 ? g.trucos.includes(s.id) : prep;
  const ritualOk = !!s.rit && g.libro.includes(s.id);
  const eff = effectParts(s, s.l, lvl, atk, dc);

  const doCast = (slot: number, ritual = false) => {
    setChooser(null);
    toast(cast(s.id, slot, ritual));
    if (ref.current) sparkle(ref.current);
  };
  const onCast = () => {
    setFlip(false);
    if (s.l === 0) return doCast(0);
    const opts = castOptions(lvl, s.l, g.usados, g.extra);
    if (!opts.length) {
      if (ref.current) shake(ref.current);
      toast(`No te quedan espacios de nivel ${s.l} o superior.${ritualOk ? " Puedes lanzarlo como ritual." : " Toma un descanso."}`);
      return;
    }
    if (opts.length === 1) return doCast(opts[0]);
    setChooser(opts);
  };

  const toggle = () => { setFlip(f => !f); setChooser(null); };
  const onPointerDown = (e: RPointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY }; swiped.current = false; };
  const onPointerUp = (e: RPointerEvent) => {
    const st = swipe.current;
    swipe.current = null;
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; toggle(); }
  };
  const onFaceClick = (e: RMouseEvent) => {
    if (swiped.current) { swiped.current = false; return; }
    if ((e.target as HTMLElement).closest("button, .chooser")) return;
    toggle();
  };

  const actions = (
    <>
      {ctx === "biblio" ? (
        <>
          {inBook
            ? <ConfirmButton onConfirm={() => forget(s.id)}>{s.l === 0 ? "Olvidar truco" : "Borrar del libro"}</ConfirmButton>
            : <button type="button" className="btn solid" onClick={() => toast(learn(s.id))}>{s.l === 0 ? "Aprender truco" : "Copiar al libro"}</button>}
          {s.custom ? <ConfirmButton className="btn red" onConfirm={() => deleteCustom(s.id)}>Eliminar</ConfirmButton> : null}
        </>
      ) : (
        <>
          {canCast && <button type="button" className="btn cast" onClick={onCast}>Lanzar</button>}
          {ritualOk && <button type="button" className="btn" title="No gasta espacio; tarda 10 minutos más" onClick={() => doCast(0, true)}>Ritual</button>}
          {s.l > 0 && ctx === "libro" && (prep
            ? <button type="button" className="btn" onClick={() => unprepare(s.id)}>Quitar de hoy</button>
            : <button type="button" className="btn blue" onClick={() => toast(prepare(s.id))}>Preparar</button>)}
          {s.l > 0 && ctx === "hoy" && <button type="button" className="btn" onClick={() => unprepare(s.id)}>Quitar</button>}
        </>
      )}
      <button type="button" className="btn" onClick={toggle} aria-label={flip ? `Ver frente de ${s.n}` : `Leer ${s.n}`}>{flip ? "Volver" : "Leer"}</button>
    </>
  );

  const tags = <>{s.conc ? <span className="tag" title="Concentración">C</span> : null}{s.rit ? <span className="tag" title="Ritual">R</span> : null}</>;
  const snip = (s.x || "").split(". ")[0] + ".";

  return (
    <article ref={ref} className={`card s-${s.e}${prep ? " prepared" : ""}${flip ? " flip" : ""}`} aria-label={`${s.n}, ${lvlName(s.l)}`}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null; }}>
      <div className="inner">
        <div className="face front" onClick={onFaceClick} inert={flip}>
          <div className="band"><span className="sigil" aria-hidden="true">{SCH[s.e][1]}</span><span className="lvl">{lvlName(s.l)}</span><span className="tags">{tags}</span></div>
          {prep && ctx !== "hoy" && <span className="ribbon">Preparado</span>}
          <h3>{s.n}</h3>
          <p className="school">{SCH[s.e][0]}{s.custom ? " · propio" : ""}</p>
          <dl><dt>Tiempo</dt><dd>{s.t}</dd><dt>Alcance</dt><dd>{s.r}</dd><dt>Comp.</dt><dd>{s.c}</dd><dt>Duración</dt><dd>{s.d}</dd></dl>
          {eff.length > 0 && (
            <div className="effect">
              {eff.map((p, i) => <span key={i}>{i > 0 && " · "}{p.strong ? <b>{p.strong}</b> : p.text}</span>)}
            </div>
          )}
          <p className="snip">{snip}</p>
          <div className="actions">{actions}</div>
        </div>
        <div className="face back" onClick={onFaceClick} inert={!flip}>
          <div className="band"><span className="sigil" aria-hidden="true">{SCH[s.e][1]}</span><span className="lvl">{lvlName(s.l)} · {SCH[s.e][0]}</span></div>
          <h4>{s.n}</h4>
          <div className="desc">
            <p>{s.x}</p>
            {s.extra && <p><i>{s.extra}</i></p>}
            {s.m && <p className="mat">Material: {s.m}</p>}
            {s.up && <p className="up"><b>{s.l === 0 ? "Mejora de truco" : "A niveles superiores"}.</b> {s.up}</p>}
          </div>
          <div className="actions">{actions}</div>
        </div>
        {chooser && (
          <div className="chooser" role="group" aria-label="Elegir espacio de conjuro">
            <p>¿Con qué espacio?</p>
            <div className="row">
              {chooser.map(l => (
                <button key={l} type="button" className={"btn" + (l === s.l ? " solid" : "")} onClick={() => doCast(l)}>
                  Nivel {l} · {slotsLeft(lvl, l, g.usados, g.extra)}
                </button>
              ))}
              <button type="button" className="btn" onClick={() => setChooser(null)}>Cancelar</button>
            </div>
            {scalesWithSlot(s) && (
              <p className="calc-note" style={{ marginTop: 6, textTransform: "none", letterSpacing: 0 }}>
                {chooser.map(l => `Nv ${l}: ${damageText(s, l, lvl)}`).join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
