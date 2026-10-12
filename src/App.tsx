import { BitacoraView } from "./components/bitacora/BitacoraView";
import { BarraInferior, Encabezado } from "./components/comunes/Navegacion";
import { Toast } from "./components/comunes/Toast";
import { GrimorioView } from "./components/grimorio/GrimorioView";
import { HojaView } from "./components/hoja/HojaView";
import { useUI } from "./state/ui";

export default function App() {
  const tab = useUI(s => s.tab);
  return (
    <>
      <div className="wrap">
        <Encabezado />
        {tab === "hoja" && <HojaView />}
        {tab === "grimorio" && <GrimorioView />}
        {tab === "bitacora" && <BitacoraView />}
      </div>
      <BarraInferior />
      <Toast />
    </>
  );
}
