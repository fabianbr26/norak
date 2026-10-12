import type { ReactElement } from "react";
import { useStore } from "../../state/store";
import { useUI, type Tab } from "../../state/ui";
import { clampLevel } from "../../rules/wizard2024";

const TABS: { id: Tab; label: string; short: string; icon: ReactElement }[] = [
  {
    id: "hoja", label: "Hoja de personaje", short: "Hoja",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 11h7M9 15h7M9 19h4" /></svg>,
  },
  {
    id: "grimorio", label: "Grimorio", short: "Grimorio",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /><path d="M12 6.5v5M10 8l2 1.5L14 8" strokeLinecap="round" /></svg>,
  },
  {
    id: "bitacora", label: "Bitácora", short: "Bitácora",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d="M7 3h10v18H7z" /><path d="M4 7h3M4 12h3M4 17h3M10 8h4M10 12h4" /></svg>,
  },
];

function fmt(iso: string | null) {
  if (!iso) return "nunca";
  return new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function Encabezado() {
  const h = useStore(s => s.hoja);
  const ultimo = useStore(s => s.meta.ultimoRespaldo);
  const { tab, setTab } = useUI();
  const sub = [h.clase && `${h.clase} ${clampLevel(h.nivel)}`, h.especie, h.trasfondo].filter(Boolean).join(" · ") || "Hoja de personaje · D&D 2024";
  return (
    <header className="top">
      <div className="brand">
        <h1>{h.nombre || "Norak del Valle Gris"}</h1>
        <p>{sub}</p>
      </div>
      <nav className="tabs" aria-label="Secciones">
        {TABS.map(t => (
          <button key={t.id} type="button" className="tab" aria-selected={tab === t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      <button type="button" className="save" data-s="ok" onClick={() => setTab("bitacora")} title="Ver opciones de respaldo">
        <i /><span>Guardado en este dispositivo<span className="long"> · respaldo: {fmt(ultimo)}</span></span>
      </button>
    </header>
  );
}

export function BarraInferior() {
  const { tab, setTab } = useUI();
  return (
    <nav className="bottom-nav" aria-label="Secciones">
      {TABS.map(t => (
        <button key={t.id} type="button" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
          {t.icon}<span>{t.short}</span>
        </button>
      ))}
    </nav>
  );
}
