/* Conjuros del Mago (reglas 2024, en español), portados tal cual del prototipo.
 dm: daño {b:[dados,caras], tipo, per:[n,caras] por nivel de espacio superior, truco: escala con el nivel de personaje,
     alt: dado alternativo, plus: bonificador fijo, dardos/rayos: proyectiles por nivel, extra: texto adicional} */

export type Escuela = "abj" | "adi" | "con" | "enc" | "evo" | "ilu" | "nig" | "tra";

export interface Dano {
  b: [number, number];
  tipo: string;
  per?: [number, number] | null;
  truco?: number;
  alt?: [number, number];
  plus?: number;
  dardos?: number;
  rayos?: number;
  extra?: string;
}

export interface Conjuro {
  id: string;
  /** nombre */ n: string;
  /** nivel (0 = truco) */ l: number;
  /** escuela */ e: Escuela;
  /** tiempo */ t: string;
  /** alcance */ r: string;
  /** componentes */ c: string;
  /** material */ m?: string;
  /** duración */ d: string;
  conc?: number;
  rit?: number;
  /** "atq" o "salv:XXX" */ tipo?: string;
  dm?: Dano;
  /** descripción */ x: string;
  /** a niveles superiores */ up?: string;
  extra?: string;
  /** efecto corto (conjuros propios) */ ef?: string;
  custom?: number;
}

export const SCH: Record<Escuela, [string, string]> = {
  abj: ["Abjuración", "A"], adi: ["Adivinación", "D"], con: ["Conjuración", "C"], enc: ["Encantamiento", "E"],
  evo: ["Evocación", "V"], ilu: ["Ilusión", "I"], nig: ["Nigromancia", "N"], tra: ["Transmutación", "T"],
};

export const SPELLS: Conjuro[] = [
// ---- Trucos ----
{id:"descarga-de-fuego",n:"Descarga de fuego",l:0,e:"evo",t:"Acción",r:"36 m",c:"V, S",d:"Instantáneo",tipo:"atq",dm:{b:[1,10],tipo:"fuego",truco:1},
 x:"Lanzas una mota de fuego contra una criatura u objeto dentro del alcance. Haz una tirada de ataque de conjuro a distancia. Si impacta, el objetivo recibe 1d10 de daño de fuego. Un objeto inflamable que nadie lleve puesto ni transporte se prende fuego.",
 up:"El daño aumenta en 1d10 a nivel 5 (2d10), 11 (3d10) y 17 (4d10)."},
{id:"rayo-de-escarcha",n:"Rayo de escarcha",l:0,e:"evo",t:"Acción",r:"18 m",c:"V, S",d:"Instantáneo",tipo:"atq",dm:{b:[1,8],tipo:"frío",truco:1},
 x:"Un rayo gélido de luz azulada sale disparado hacia una criatura dentro del alcance. Haz una tirada de ataque de conjuro a distancia. Si impacta, recibe 1d8 de daño de frío y su velocidad se reduce 3 m hasta el inicio de tu siguiente turno.",
 up:"El daño aumenta en 1d8 a nivel 5 (2d8), 11 (3d8) y 17 (4d8)."},
{id:"tanido-por-los-muertos",n:"Tañido por los muertos",l:0,e:"nig",t:"Acción",r:"18 m",c:"V, S",d:"Instantáneo",tipo:"salv:SAB",dm:{b:[1,8],alt:[1,12],tipo:"necrótico",truco:1},
 x:"Señalas a una criatura que puedas ver dentro del alcance y suena una campana lúgubre que solo ella oye. Debe superar una tirada de salvación de Sabiduría o recibir 1d8 de daño necrótico. Si a la criatura le falta algún punto de golpe, recibe 1d12 en su lugar.",
 up:"El daño aumenta en un dado a nivel 5, 11 y 17."},
{id:"mano-de-mago",n:"Mano de mago",l:0,e:"con",t:"Acción",r:"9 m",c:"V, S",d:"1 minuto",
 x:"Aparece una mano espectral flotante en un punto dentro del alcance. Con la acción Magia puedes usarla para manipular un objeto, abrir una puerta o recipiente sin cerrar con llave, guardar o sacar un objeto de un recipiente abierto o verter su contenido. Puede moverse hasta 9 m cada vez que la usas. No puede atacar, activar objetos mágicos ni cargar más de 5 kg. Desaparece si se aleja más de 9 m de ti."},
{id:"prestidigitacion",n:"Prestidigitación",l:0,e:"tra",t:"Acción",r:"3 m",c:"V, S",d:"Hasta 1 hora",
 x:"Creas un pequeño efecto mágico inofensivo: chispas o una brisa, encender o apagar una vela, limpiar o ensuciar un objeto pequeño, enfriar, calentar o dar sabor a material inerte, dejar una marca o símbolo durante 1 hora, o crear una baratija o imagen ilusoria que cabe en tu mano hasta el final de tu siguiente turno. Puedes tener hasta tres efectos no instantáneos activos a la vez."},
{id:"luz",n:"Luz",l:0,e:"evo",t:"Acción",r:"Toque",c:"V, M",m:"una luciérnaga o musgo fosforescente",d:"1 hora",
 x:"Tocas un objeto de tamaño Grande o menor que nadie lleve puesto ni sostenga. Emite luz brillante en un radio de 6 m y luz tenue 6 m más allá, del color que elijas. Cubrirlo por completo con algo opaco bloquea la luz. Termina si lo lanzas de nuevo."},
{id:"mensaje",n:"Mensaje",l:0,e:"tra",t:"Acción",r:"36 m",c:"S, M",m:"un trozo de alambre de cobre",d:"1 asalto",
 x:"Señalas a una criatura dentro del alcance y le susurras un mensaje. Solo ella lo oye y puede responder con un susurro que solo tú oyes. Puedes lanzarlo a través de objetos sólidos si conoces bien al objetivo y sabes que está al otro lado."},
{id:"ilusion-menor",n:"Ilusión menor",l:0,e:"ilu",t:"Acción",r:"9 m",c:"S, M",m:"un poco de vellón",d:"1 minuto",
 x:"Creas un sonido o la imagen de un objeto dentro del alcance. La imagen cabe en un cubo de 1,5 m y no puede crear sonido, luz, olor ni otro efecto sensorial. Interactuar físicamente revela que es una ilusión. Una criatura puede usar la acción Estudiar y hacer una prueba de Inteligencia (Investigación) contra tu CD para descubrirla."},
{id:"toque-electrizante",n:"Toque electrizante",l:0,e:"evo",t:"Acción",r:"Toque",c:"V, S",d:"Instantáneo",tipo:"atq",dm:{b:[1,8],tipo:"relámpago",truco:1},
 x:"Haz un ataque de conjuro cuerpo a cuerpo contra una criatura. Si impacta, recibe 1d8 de daño de relámpago y no puede hacer ataques de oportunidad hasta el inicio de su siguiente turno.",up:"Aumenta un dado a nivel 5, 11 y 17."},
{id:"reparar",n:"Reparar",l:0,e:"tra",t:"1 minuto",r:"Toque",c:"V, S, M",m:"dos imanes",d:"Instantáneo",
 x:"Reparas una única rotura o desgarro en un objeto que toques, como un eslabón roto, una llave partida o una capa rasgada, siempre que no mida más de 30 cm en ninguna dimensión."},
// ---- Nivel 1 ----
{id:"rayo-nauseabundo",n:"Rayo nauseabundo",l:1,e:"nig",t:"Acción",r:"18 m",c:"V, S",d:"Instantáneo",tipo:"atq",dm:{b:[2,8],tipo:"veneno",per:[1,8]},
 x:"Disparas un rayo verdoso contra una criatura dentro del alcance. Haz una tirada de ataque de conjuro a distancia. Si impacta, recibe 2d8 de daño de veneno y tiene el estado envenenado hasta el final de tu siguiente turno.",
 up:"El daño aumenta 1d8 por cada nivel de espacio por encima de 1."},
{id:"dormir",n:"Dormir",l:1,e:"enc",t:"Acción",r:"18 m",c:"V, S, M",m:"una pizca de arena o pétalos de rosa",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:SAB",
 x:"Cada criatura que elijas en una esfera de 1,5 m de radio centrada en un punto dentro del alcance debe superar una salvación de Sabiduría o quedar incapacitada hasta el final de su siguiente turno; en ese momento repite la salvación. Si la falla, queda inconsciente mientras dure el conjuro. El conjuro termina en un objetivo si recibe daño o alguien a 1,5 m usa una acción para despertarlo.",
 extra:"Las criaturas que no duermen (como los elfos) o inmunes al cansancio superan la salvación automáticamente."},
{id:"grasa",n:"Grasa",l:1,e:"con",t:"Acción",r:"18 m",c:"V, S, M",m:"un poco de corteza de cerdo o mantequilla",d:"1 minuto",tipo:"salv:DES",
 x:"Cubres de grasa no inflamable un cuadrado de 3 m de lado centrado en un punto dentro del alcance; se convierte en terreno difícil. Cuando aparece, cada criatura en el área debe superar una salvación de Destreza o quedar derribada. Una criatura que entre en el área o termine su turno en ella también debe superar la salvación o quedar derribada."},
{id:"sirviente-invisible",n:"Sirviente invisible",l:1,e:"con",t:"Acción o ritual",r:"18 m",c:"V, S, M",m:"un trozo de cuerda y de madera",d:"1 hora",rit:1,
 x:"Creas una fuerza invisible, sin mente ni forma, de tamaño Mediano, que realiza tareas simples a tus órdenes. Tiene CA 10, 1 PG, Fuerza 2 y no puede atacar; si llega a 0 PG, el conjuro termina. Una vez por turno, como acción adicional, puedes ordenarle mentalmente que se mueva hasta 4,5 m e interactúe con un objeto. Puede buscar cosas, limpiar, remendar, doblar ropa, encender fuego, servir comida o verter vino. Si le ordenas algo que lo aleje más de 18 m de ti, el conjuro termina."},
{id:"escudo",n:"Escudo",l:1,e:"abj",t:"Reacción",r:"Personal",c:"V, S",d:"1 asalto",
 x:"Una barrera invisible de fuerza mágica te protege. Hasta el inicio de tu siguiente turno tienes +5 a la CA, incluso contra el ataque que la provocó, y no recibes daño de Proyectil mágico.",
 extra:"Reacción: la usas cuando te impacta una tirada de ataque o eres objetivo de Proyectil mágico."},
{id:"deteccion-de-la-magia",n:"Detección de la magia",l:1,e:"adi",t:"Acción o ritual",r:"Personal",c:"V, S",d:"Concentración, hasta 10 minutos",conc:1,rit:1,
 x:"Mientras dure, percibes la presencia de efectos mágicos a 9 m o menos de ti. Si percibes alguno, puedes usar la acción Magia para ver un aura tenue alrededor de cualquier criatura u objeto visible en esa zona que tenga magia, y si tiene escuela de magia, cuál es. Lo bloquean 30 cm de piedra, tierra o madera, 2,5 cm de metal o una lámina fina de plomo."},
{id:"proyectil-magico",n:"Proyectil mágico",l:1,e:"evo",t:"Acción",r:"36 m",c:"V, S",d:"Instantáneo",dm:{b:[1,4],plus:1,tipo:"fuerza",dardos:3},
 x:"Creas tres dardos brillantes de fuerza mágica. Cada uno impacta automáticamente a una criatura que elijas dentro del alcance y causa 1d4+1 de daño de fuerza. Todos golpean a la vez y puedes dirigirlos a una o varias criaturas.",
 up:"Un dardo más por cada nivel de espacio por encima de 1."},
{id:"armadura-de-mago",n:"Armadura de mago",l:1,e:"abj",t:"Acción",r:"Toque",c:"V, S, M",m:"un trozo de cuero curtido",d:"8 horas",
 x:"Tocas a una criatura voluntaria que no lleve armadura. Hasta que termine el conjuro, su CA base pasa a ser 13 + su modificador de Destreza. Termina si el objetivo se pone armadura o si lo terminas tú."},
{id:"manos-ardientes",n:"Manos ardientes",l:1,e:"evo",t:"Acción",r:"Personal (cono de 4,5 m)",c:"V, S",d:"Instantáneo",tipo:"salv:DES",dm:{b:[3,6],tipo:"fuego",per:[1,6]},
 x:"Una lámina de llamas sale de tus dedos. Cada criatura en un cono de 4,5 m hace una salvación de Destreza: si falla recibe 3d6 de daño de fuego, la mitad si la supera. Los objetos inflamables en el cono que nadie lleve se prenden fuego.",up:"+1d6 por cada nivel de espacio por encima de 1."},
{id:"hechizar-persona",n:"Hechizar persona",l:1,e:"enc",t:"Acción",r:"9 m",c:"V, S",d:"1 hora",tipo:"salv:SAB",
 x:"Un humanoide que puedas ver dentro del alcance hace una salvación de Sabiduría (con ventaja si tú o tus aliados están luchando contra él). Si la falla, queda hechizado por ti hasta que el conjuro termine o tú o tus aliados le hagan daño. Te considera un conocido amistoso. Al terminar, sabe que lo hechizaste.",up:"Una criatura adicional por cada nivel de espacio por encima de 1."},
{id:"rociada-de-color",n:"Rociada de color",l:1,e:"ilu",t:"Acción",r:"Personal (cono de 4,5 m)",c:"V, S, M",m:"una pizca de arena de colores",d:"1 asalto",tipo:"salv:CON",
 x:"Lanzas un destello deslumbrante de luz multicolor. Cada criatura en un cono de 4,5 m debe superar una salvación de Constitución o quedar cegada hasta el final de tu siguiente turno."},
{id:"caida-de-pluma",n:"Caída de pluma",l:1,e:"tra",t:"Reacción",r:"18 m",c:"V, M",m:"una pluma pequeña",d:"1 minuto",
 x:"Eliges hasta cinco criaturas que estén cayendo dentro del alcance. Su descenso se frena a 18 m por asalto hasta que el conjuro termine. Si una aterriza antes, no recibe daño por caída y puede caer de pie.",extra:"Reacción: cuando tú o una criatura a 18 m caéis."},
{id:"encontrar-familiar",n:"Encontrar familiar",l:1,e:"con",t:"1 hora o ritual",r:"3 m",c:"V, S, M",m:"incienso por valor de 10+ po, que se consume",d:"Instantáneo",rit:1,
 x:"Obtienes el servicio de un familiar, un espíritu con forma de animal pequeño (búho, gato, cuervo, rata, araña, etc.). Actúa de forma independiente pero siempre te obedece. Mientras esté a 30 m, puedes comunicarte telepáticamente con él y, como acción adicional, ver y oír a través de sus sentidos. Puede entregar tus conjuros de toque. Si llega a 0 PG desaparece y puedes volver a invocarlo."},
{id:"identificar",n:"Identificar",l:1,e:"adi",t:"1 minuto o ritual",r:"Toque",c:"V, S, M",m:"una perla de 100+ po",d:"Instantáneo",rit:1,
 x:"Tocas un objeto. Si es mágico o está imbuido de magia, aprendes sus propiedades, cómo usarlas, si requiere sintonización y cuántas cargas tiene. También sabes qué conjuros le afectan. Si tocas a una criatura, aprendes qué conjuros la afectan."},
{id:"disfrazarse",n:"Disfrazarse",l:1,e:"ilu",t:"Acción",r:"Personal",c:"V, S",d:"1 hora",
 x:"Cambias tu aspecto, ropa, armadura y equipo. Puedes parecer hasta 30 cm más alto o más bajo y más delgado o corpulento, pero mantienes el mismo tipo de cuerpo. Una criatura puede usar la acción Estudiar y una prueba de Inteligencia (Investigación) contra tu CD para descubrirte."},
{id:"ola-atronadora",n:"Ola atronadora",l:1,e:"evo",t:"Acción",r:"Personal (cubo de 4,5 m)",c:"V, S",d:"Instantáneo",tipo:"salv:CON",dm:{b:[2,8],tipo:"trueno",per:[1,8]},
 x:"Una ola de fuerza atronadora sale de ti. Cada criatura en un cubo de 4,5 m que se origina en ti hace una salvación de Constitución: si falla recibe 2d8 de daño de trueno y es empujada 3 m; si la supera recibe la mitad y no es empujada. El trueno se oye a 90 m.",up:"+1d8 por cada nivel de espacio por encima de 1."},
{id:"retirada-expeditiva",n:"Retirada expeditiva",l:1,e:"tra",t:"Acción adicional",r:"Personal",c:"V, S",d:"Concentración, hasta 10 minutos",conc:1,
 x:"Al lanzarlo realizas la acción Correr y, hasta que termine, puedes volver a hacerlo como acción adicional en cada uno de tus turnos."},
{id:"falsa-vida",n:"Falsa vida",l:1,e:"nig",t:"Acción",r:"Personal",c:"V, S, M",m:"una gota de alcohol",d:"Instantáneo",
 x:"Obtienes 2d4 + 4 puntos de golpe temporales.",up:"+5 PG temporales por cada nivel de espacio por encima de 1."},
{id:"nube-de-niebla",n:"Nube de niebla",l:1,e:"con",t:"Acción",r:"36 m",c:"V, S",d:"Concentración, hasta 1 hora",conc:1,
 x:"Creas una esfera de niebla de 6 m de radio centrada en un punto dentro del alcance. El área está muy oscurecida. Dura el tiempo del conjuro o hasta que un viento fuerte la disperse.",up:"El radio aumenta 6 m por cada nivel de espacio por encima de 1."},
{id:"comprension-idiomas",n:"Comprensión idiomática",l:1,e:"adi",t:"Acción o ritual",r:"Personal",c:"V, S, M",m:"una pizca de hollín y sal",d:"1 hora",rit:1,
 x:"Entiendes el significado literal de cualquier idioma hablado que oigas. También entiendes cualquier idioma escrito que veas si tocas la superficie donde está escrito (1 minuto por página). No descifra mensajes cifrados ni símbolos que no formen parte de un idioma."},
{id:"alarma",n:"Alarma",l:1,e:"abj",t:"1 minuto o ritual",r:"9 m",c:"V, S, M",m:"una campanilla y un hilo de plata",d:"8 horas",rit:1,
 x:"Pones una alarma contra intrusos en una puerta, ventana o un cubo de hasta 6 m. Cuando una criatura toca o entra en el área sin que la hayas designado, la alarma se activa: mental (solo tú lo notas, te despierta) o audible (una campanilla que se oye a 18 m durante 10 segundos)."},
{id:"daga-de-hielo",n:"Cuchillo de hielo",l:1,e:"con",t:"Acción",r:"18 m",c:"S, M",m:"una gota de agua o un trozo de hielo",d:"Instantáneo",tipo:"atq",dm:{b:[1,10],tipo:"perforante",extra:"+2d6 frío en 1,5 m (salv. DES)",per:null},
 x:"Creas un fragmento de hielo y lo lanzas a una criatura. Haz un ataque de conjuro a distancia: si impacta, recibe 1d10 de daño perforante. Impacte o falle, el fragmento explota: el objetivo y cada criatura a 1,5 m de él deben superar una salvación de Destreza o recibir 2d6 de daño de frío.",up:"El daño de frío aumenta 1d6 por cada nivel de espacio por encima de 1."},
// ---- Nivel 2 ----
{id:"paso-brumoso",n:"Paso brumoso",l:2,e:"con",t:"Acción adicional",r:"Personal",c:"V",d:"Instantáneo",
 x:"Te rodea brevemente una niebla plateada y te teletransportas hasta 9 m a un espacio desocupado que puedas ver."},
{id:"telarana",n:"Telaraña",l:2,e:"con",t:"Acción",r:"18 m",c:"V, S, M",m:"un poco de telaraña",d:"Concentración, hasta 1 hora",conc:1,tipo:"salv:DES",
 x:"Conjuras una masa de telarañas pegajosas en un cubo de 6 m. Es terreno difícil y está ligeramente oscurecido. Si no está anclada entre dos superficies sólidas, se desploma sobre sí misma. Cada criatura que empiece su turno en ella o entre en ella debe superar una salvación de Destreza o quedar apresada mientras siga dentro. Una criatura apresada puede usar una acción para hacer una prueba de Fuerza (Atletismo) contra tu CD; si tiene éxito, se libera. Cada cubo de 1,5 m expuesto al fuego arde en 1 asalto y causa 2d4 de daño de fuego a quien empiece su turno en él."},
{id:"rayo-de-debilitamiento",n:"Rayo de debilitación",l:2,e:"nig",t:"Acción",r:"18 m",c:"V, S",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:CON",
 x:"Un rayo de energía enervante sale hacia una criatura dentro del alcance, que hace una salvación de Constitución. Si la supera, tiene desventaja en la siguiente tirada de ataque que haga antes del inicio de tu siguiente turno. Si la falla, tiene desventaja en las pruebas d20 basadas en Fuerza y resta 1d8 a todas sus tiradas de daño mientras dure el conjuro. Repite la salvación al final de cada uno de sus turnos y el conjuro termina si la supera."},
{id:"ver-lo-invisible",n:"Ver lo invisible",l:2,e:"adi",t:"Acción",r:"Personal",c:"V, S, M",m:"una pizca de talco y polvo de plata",d:"1 hora",
 x:"Ves a las criaturas y objetos que tienen el estado invisible como si fueran visibles, y puedes ver el plano Etéreo. Las criaturas y objetos de allí parecen fantasmales."},
{id:"invisibilidad",n:"Invisibilidad",l:2,e:"ilu",t:"Acción",r:"Toque",c:"V, S, M",m:"una pestaña dentro de goma arábiga",d:"Concentración, hasta 1 hora",conc:1,
 x:"Una criatura que toques obtiene el estado invisible hasta que termine el conjuro. El conjuro termina para el objetivo si hace una tirada de ataque, causa daño o lanza un conjuro.",up:"Un objetivo adicional por cada nivel de espacio por encima de 2."},
{id:"imagen-multiple",n:"Imagen múltiple",l:2,e:"ilu",t:"Acción",r:"Personal",c:"V, S",d:"1 minuto",
 x:"Aparecen tres duplicados ilusorios de ti que se mueven contigo. Cada vez que una criatura te impacte con un ataque, tira 1d6 por cada duplicado que quede. Si alguno saca 3 o más, el ataque impacta a un duplicado, que se destruye. Las criaturas con vista ciega o visión verdadera no se ven afectadas."},
{id:"rayo-abrasador",n:"Rayo abrasador",l:2,e:"evo",t:"Acción",r:"36 m",c:"V, S",d:"Instantáneo",tipo:"atq",dm:{b:[2,6],tipo:"fuego",rayos:3},
 x:"Creas tres rayos de fuego y los lanzas a objetivos dentro del alcance, a uno o a varios. Haz un ataque de conjuro a distancia por cada rayo. Si impacta, el objetivo recibe 2d6 de daño de fuego.",up:"Un rayo adicional por cada nivel de espacio por encima de 2."},
{id:"inmovilizar-persona",n:"Inmovilizar persona",l:2,e:"enc",t:"Acción",r:"18 m",c:"V, S, M",m:"un trozo de hierro recto",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:SAB",
 x:"Elige un humanoide que puedas ver dentro del alcance. Debe superar una salvación de Sabiduría o quedar paralizado mientras dure. Al final de cada uno de sus turnos repite la salvación y, si la supera, el conjuro termina.",up:"Un humanoide adicional por cada nivel de espacio por encima de 2."},
{id:"sugestion",n:"Sugestión",l:2,e:"enc",t:"Acción",r:"9 m",c:"V, M",m:"una gota de miel",d:"Concentración, hasta 8 horas",conc:1,tipo:"salv:SAB",
 x:"Sugieres un curso de acción (25 palabras o menos) a una criatura que pueda oírte y entenderte. Debe superar una salvación de Sabiduría o queda hechizada y sigue la sugerencia lo mejor que puede. La sugerencia no puede ser obviamente dañina. El conjuro termina si tú o tus aliados le hacen daño."},
{id:"levitar",n:"Levitar",l:2,e:"tra",t:"Acción",r:"18 m",c:"V, S, M",m:"un muelle de metal",d:"Concentración, hasta 10 minutos",conc:1,tipo:"salv:CON",
 x:"Una criatura u objeto suelto de hasta 250 kg se eleva verticalmente hasta 6 m y queda suspendido. Una criatura que no quiera puede hacer una salvación de Constitución para evitarlo. En cada uno de tus turnos puedes usar la acción Magia para moverlo hasta 6 m arriba o abajo."},
{id:"trepar-cual-aracnido",n:"Trepar cual arácnido",l:2,e:"tra",t:"Acción",r:"Toque",c:"V, S, M",m:"una gota de betún y una araña",d:"Concentración, hasta 1 hora",conc:1,
 x:"Una criatura voluntaria que toques puede moverse por superficies verticales y techos con las manos libres, y obtiene una velocidad de trepar igual a su velocidad."},
{id:"esfera-flamigera",n:"Esfera flamígera",l:2,e:"evo",t:"Acción",r:"18 m",c:"V, S, M",m:"una bola de cera",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:DES",dm:{b:[2,6],tipo:"fuego",per:[1,6]},
 x:"Creas una esfera de fuego de 1,5 m de diámetro. Toda criatura que termine su turno a 1,5 m de ella hace una salvación de Destreza: 2d6 de daño de fuego si falla, la mitad si la supera. Como acción adicional puedes moverla hasta 9 m; si choca con una criatura, esta hace la salvación y la esfera se detiene.",up:"+1d6 por cada nivel de espacio por encima de 2."},
{id:"borrosidad",n:"Borrosidad",l:2,e:"ilu",t:"Acción",r:"Personal",c:"V",d:"Concentración, hasta 1 minuto",conc:1,
 x:"Tu cuerpo se vuelve borroso. Las criaturas tienen desventaja en las tiradas de ataque contra ti. No afecta a quien no dependa de la vista o tenga visión verdadera."},
{id:"romper",n:"Romper",l:2,e:"evo",t:"Acción",r:"18 m",c:"V, S, M",m:"una astilla de mica",d:"Instantáneo",tipo:"salv:CON",dm:{b:[3,8],tipo:"trueno",per:[1,8]},
 x:"Un estruendo doloroso estalla en una esfera de 3 m de radio. Cada criatura en ella hace una salvación de Constitución: 3d8 de daño de trueno si falla, la mitad si la supera. Las criaturas de piedra, cristal o metal tienen desventaja. Los objetos no transportados también reciben el daño.",up:"+1d8 por cada nivel de espacio por encima de 2."},
{id:"oscuridad",n:"Oscuridad",l:2,e:"evo",t:"Acción",r:"18 m",c:"V, M",m:"pelo de murciélago y un trozo de carbón",d:"Concentración, hasta 10 minutos",conc:1,
 x:"Una oscuridad mágica llena una esfera de 4,5 m de radio. La visión en la oscuridad no puede atravesarla y la luz no mágica no la ilumina. Si la centras en un objeto que sostienes, se mueve con él."},
{id:"flecha-acida",n:"Flecha ácida",l:2,e:"evo",t:"Acción",r:"27 m",c:"V, S, M",m:"hoja de ruibarbo en polvo",d:"Instantáneo",tipo:"atq",dm:{b:[4,4],tipo:"ácido",per:[1,4],extra:"+2d4 ácido al final de su siguiente turno"},
 x:"Una flecha verde centelleante sale disparada. Haz un ataque de conjuro a distancia: si impacta, el objetivo recibe 4d4 de daño de ácido y 2d4 más al final de su siguiente turno. Si falla, recibe la mitad del daño inicial.",up:"El daño inicial y el posterior aumentan 1d4 por cada nivel de espacio por encima de 2."},
{id:"detectar-pensamientos",n:"Detectar pensamientos",l:2,e:"adi",t:"Acción",r:"Personal",c:"V, S, M",m:"una pieza de cobre",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:SAB",
 x:"Percibes la presencia de mentes a 9 m. Con la acción Magia puedes leer los pensamientos superficiales de una criatura que veas. Puedes sondear más hondo: hace una salvación de Sabiduría y, si la falla, conoces sus razonamientos, emociones y lo que más le importa."},
{id:"apertura",n:"Apertura",l:2,e:"tra",t:"Acción",r:"18 m",c:"V",d:"Instantáneo",
 x:"Eliges un objeto cerrado, bloqueado o con cerrojo (puerta, cofre, grilletes): se abre o desbloquea. Si estaba protegido por Cerradura arcana, esta se suprime 10 minutos. Suena un fuerte golpe audible a 90 m."},
// ---- Nivel 3 ----
{id:"bola-de-fuego",n:"Bola de fuego",l:3,e:"evo",t:"Acción",r:"45 m",c:"V, S, M",m:"una bolita de guano y azufre",d:"Instantáneo",tipo:"salv:DES",dm:{b:[8,6],tipo:"fuego",per:[1,6]},
 x:"Un destello brillante sale de tu dedo hacia un punto y estalla en llamas en una esfera de 6 m de radio. Cada criatura en ella hace una salvación de Destreza: 8d6 de daño de fuego si falla, la mitad si la supera. Los objetos inflamables no transportados se prenden fuego.",up:"+1d6 por cada nivel de espacio por encima de 3."},
{id:"relampago",n:"Relámpago",l:3,e:"evo",t:"Acción",r:"Personal (línea de 30 m)",c:"V, S, M",m:"un poco de piel y una vara de cristal",d:"Instantáneo",tipo:"salv:DES",dm:{b:[8,6],tipo:"relámpago",per:[1,6]},
 x:"Un rayo forma una línea de 30 m de largo y 1,5 m de ancho. Cada criatura en ella hace una salvación de Destreza: 8d6 de daño de relámpago si falla, la mitad si la supera.",up:"+1d6 por cada nivel de espacio por encima de 3."},
{id:"contraconjuro",n:"Contraconjuro",l:3,e:"abj",t:"Reacción",r:"18 m",c:"S",d:"Instantáneo",tipo:"salv:CON",
 x:"Intentas interrumpir a una criatura que estás viendo lanzar un conjuro. Hace una salvación de Constitución. Si la falla, el conjuro se disipa sin efecto y la acción, acción adicional o reacción usada se pierde, pero no gasta el espacio de conjuro."},
{id:"disipar-magia",n:"Disipar magia",l:3,e:"abj",t:"Acción",r:"36 m",c:"V, S",d:"Instantáneo",
 x:"Eliges una criatura, objeto o efecto mágico. Cualquier conjuro de nivel 3 o inferior sobre él termina. Por cada conjuro de nivel 4 o superior haz una prueba de tu característica de lanzamiento con CD 10 + el nivel de ese conjuro; si tienes éxito, termina.",up:"Terminas automáticamente conjuros de nivel igual o inferior al espacio usado."},
{id:"volar",n:"Volar",l:3,e:"tra",t:"Acción",r:"Toque",c:"V, S, M",m:"una pluma de ala",d:"Concentración, hasta 10 minutos",conc:1,
 x:"Una criatura voluntaria que toques obtiene velocidad de vuelo de 18 m y puede flotar. Cuando el conjuro termina, cae si sigue en el aire.",up:"Un objetivo adicional por cada nivel de espacio por encima de 3."},
{id:"acelerar",n:"Acelerar",l:3,e:"tra",t:"Acción",r:"9 m",c:"V, S, M",m:"una viruta de raíz de regaliz",d:"Concentración, hasta 1 minuto",conc:1,
 x:"Una criatura voluntaria duplica su velocidad, obtiene +2 a la CA, ventaja en salvaciones de Destreza y una acción adicional en cada turno, que solo puede usar para Atacar (un ataque con arma), Correr, Destrabarse, Esconderse o Utilizar. Cuando termina, no puede moverse ni actuar hasta después de su siguiente turno."},
{id:"lentitud",n:"Lentitud",l:3,e:"tra",t:"Acción",r:"36 m",c:"V, S, M",m:"una gota de melaza",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:SAB",
 x:"Hasta seis criaturas en un cubo de 12 m hacen una salvación de Sabiduría. Si fallan, su velocidad se reduce a la mitad, tienen −2 a la CA y a las salvaciones de Destreza, no pueden usar reacciones y en su turno solo pueden usar una acción o una acción adicional, y no más de un ataque. Repiten la salvación al final de cada turno."},
{id:"patron-hipnotico",n:"Patrón hipnótico",l:3,e:"ilu",t:"Acción",r:"36 m",c:"S, M",m:"una barra de incienso encendida",d:"Concentración, hasta 1 minuto",conc:1,tipo:"salv:SAB",
 x:"Un patrón de colores serpentea en un cubo de 9 m. Cada criatura que lo vea hace una salvación de Sabiduría. Si falla, queda hechizada, incapacitada y con velocidad 0. Termina para una criatura si recibe daño o alguien usa una acción para sacudirla."},
{id:"toque-vampirico",n:"Toque vampírico",l:3,e:"nig",t:"Acción",r:"Personal",c:"V, S",d:"Concentración, hasta 1 minuto",conc:1,tipo:"atq",dm:{b:[3,6],tipo:"necrótico",per:[1,6]},
 x:"Haz un ataque de conjuro cuerpo a cuerpo. Si impacta, el objetivo recibe 3d6 de daño necrótico y recuperas PG iguales a la mitad del daño causado. Mientras dure, puedes repetir el ataque con la acción Magia en cada turno.",up:"+1d6 por cada nivel de espacio por encima de 3."},
{id:"pequena-choza",n:"Pequeña choza de Leomund",l:3,e:"abj",t:"1 minuto o ritual",r:"Personal (semiesfera de 3 m)",c:"V, S, M",m:"una cuenta de cristal",d:"8 horas",rit:1,
 x:"Una cúpula inmóvil de fuerza de 3 m de radio te rodea. Hasta nueve criaturas Medianas caben dentro. Nada puede atravesarla desde fuera salvo tú y quien designes; los conjuros no la cruzan. El interior es seco y templado, con la luz que elijas. Termina si sales de ella."},
];

export const BYID: Record<string, Conjuro> = Object.fromEntries(SPELLS.map(s => [s.id, s]));
