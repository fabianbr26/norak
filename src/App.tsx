import { BitacoraView } from "./components/bitacora/BitacoraView";
import { AvisoNivel3 } from "./components/comunes/AvisoNivel3";
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
        <AvisoNivel3 />
        {tab === "hoja" && <HojaView />}
        {tab === "grimorio" && <GrimorioView />}
        {tab === "bitacora" && <BitacoraView />}
      </div>
      <BarraInferior />
      <Toast />
    </>
  );
}
