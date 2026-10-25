import type { Conjuro } from "../data/spells";
import type { Car, NivelComp, PG, Puntuaciones, Usados } from "../rules/wizard2024";

export type Num = number | "";

export interface Arma { nombre: string; atq: string; dano: string; notas: string }
export interface Objeto { cant: Num; nombre: string }
export interface Sesion { fecha: string; notas: string; px: Num }

export interface Hoja {
  nombre: string; clase: string; subclase: string; nivel: Num; px: Num;
  especie: string; trasfondo: string; alineamiento: string;
  ca: Num; caEscudo: boolean;
  pg: PG;
  dg: { tipo: string; gastados: Num };
  muerte: { ok: number; bad: number };
  inspiracion: boolean;
  iniAjuste: Num; velocidad: string; tamano: string; percPasiva: Num;
  car: Puntuaciones;
  salv: Record<Car, boolean>;
  hab: Record<string, NivelComp | undefined>;
  armas: Arma[];
  armadura: { ligeras: boolean; medias: boolean; pesadas: boolean; escudos: boolean };
  armasComp: string; herramientas: string; idiomas: string;
  aptitud: Car;
  rasgosClase: string; atributosEspecie: string; dotes: string;
  aspecto: string; historia: string;
  equipo: Objeto[];
  sint: string[];
  monedas: { pc: Num; pp: Num; pe: Num; po: Num; ppt: Num };
  bitacora: Sesion[];
}

export interface EntradaRegistro { h: string; t: string }

export interface Grimorio {
  trucos: string[];
  libro: string[];
  preparados: string[];
  usados: Usados;
  extra: Usados;
  conc: string | null;
  recuperado: boolean;
  registro: EntradaRegistro[];
  custom: Conjuro[];
  /** Portento (Adivino): d20 tirados tras el descanso largo ("" = sin tirar) y cuáles ya se usaron */
  portento: { dados: Num[]; usados: boolean[] };
  /** Usos gastados de Salto de las nubes (goliath) desde el último descanso largo */
  saltoUsados: number;
}

export interface Meta {
  /** ISO de la última modificación en este dispositivo */
  modificado: string | null;
  /** ISO del último respaldo exportado desde este dispositivo */
  ultimoRespaldo: string | null;
  /** Aviso pendiente al abrir la app (p. ej. la actualización de nivel 3 de Norak) */
  aviso: "nivel3" | null;
}
