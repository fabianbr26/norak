import { Caracteristicas } from "./Caracteristicas";
import { Identidad } from "./Encabezado";
import { Armas, EntrenamientoYMagia, HistoriaYEquipo, Rasgos } from "./Equipo";

export function HojaView() {
  return (
    <main className="scroll" aria-label="Hoja de personaje">
      <Identidad />
      <Caracteristicas />
      <Armas />
      <EntrenamientoYMagia />
      <Rasgos />
      <HistoriaYEquipo />
    </main>
  );
}
