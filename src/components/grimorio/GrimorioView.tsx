import { useUI, type Sub } from "../../state/ui";
import { Catalogo, Libro, Preparados, Registro } from "./Listas";
import { Reserva } from "./Reserva";

const SUBS: [Sub, string][] = [["hoy", "Preparados hoy"], ["libro", "Libro de conjuros"], ["biblio", "Aprender conjuros"], ["registro", "Registro del día"]];

export function GrimorioView() {
  const { sub, setSub } = useUI();
  return (
    <main className="scroll" aria-label="Grimorio">
      <Reserva />
      <div className="subtabs" role="tablist" aria-label="Secciones del grimorio">
        {SUBS.map(([id, label]) => (
          <button key={id} type="button" role="tab" id={`subtab-${id}`} className="subtab" aria-selected={sub === id} aria-controls="grim-panel" onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>
      <div id="grim-panel" role="tabpanel" aria-labelledby={`subtab-${sub}`}>
        {sub === "hoy" && <Preparados />}
        {sub === "libro" && <Libro />}
        {sub === "biblio" && <Catalogo />}
        {sub === "registro" && <Registro />}
      </div>
    </main>
  );
}
