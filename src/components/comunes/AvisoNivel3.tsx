import { useState } from "react";
import { applyLevel3Update, undoReplace } from "../../state/importar";
import { useStore } from "../../state/store";
import { toast } from "../../state/ui";

/** Aviso único para dispositivos con Norak guardado antes de la actualización de nivel 3. */
export function AvisoNivel3() {
  const aviso = useStore(s => s.meta.aviso);
  const setAviso = useStore(s => s.setAviso);
  const [aplicado, setAplicado] = useState(false);

  if (aplicado) {
    return (
      <aside className="aviso" role="status">
        <p><b>Actualización de nivel 3 aplicada.</b> Norak ya es Adivino, con 12 conjuros en el libro. Se conservaron las sesiones de tu bitácora.</p>
        <div className="aviso-actions">
          <button type="button" className="btn" onClick={() => { if (undoReplace()) { setAviso("nivel3"); toast("Se restauraron tus datos anteriores."); } setAplicado(false); }}>Deshacer</button>
          <button type="button" className="btn solid" onClick={() => setAplicado(false)}>Listo</button>
        </div>
      </aside>
    );
  }
  if (aviso !== "nivel3") return null;
  return (
    <aside className="aviso" aria-labelledby="aviso-n3">
      <p id="aviso-n3"><b>Hay una actualización de nivel 3 para Norak.</b> Subclase Adivino (Portento), Salto de las nubes, dote Sanador,
        correcciones de reglas 2024, 12 conjuros en el libro y 21 po. Reemplaza la hoja y el grimorio de este dispositivo; tus sesiones de la bitácora se conservan.</p>
      <div className="aviso-actions">
        <button type="button" className="btn" onClick={() => setAviso(null)}>Ahora no</button>
        <button type="button" className="btn solid big-btn" onClick={() => { applyLevel3Update(); setAplicado(true); toast("Norak actualizado a nivel 3."); }}>
          Aplicar actualización de nivel 3
        </button>
      </div>
    </aside>
  );
}
