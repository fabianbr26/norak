/** Lee y escribe propiedades anidadas con rutas tipo "pg.act" o "armas.0.nombre". */
export const getPath = (o: unknown, p: string): unknown =>
  p.split(".").reduce<unknown>((a, k) => (a == null ? undefined : (a as Record<string, unknown>)[k]), o);

export function setPath(o: object, p: string, v: unknown) {
  const ks = p.split(".");
  let a = o as Record<string, unknown>;
  for (let i = 0; i < ks.length - 1; i++) {
    if (a[ks[i]] == null) a[ks[i]] = {};
    a = a[ks[i]] as Record<string, unknown>;
  }
  a[ks[ks.length - 1]] = v;
}
