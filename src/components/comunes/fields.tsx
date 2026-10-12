/* Campos enlazados a la hoja por ruta ("pg.act", "armas.0.nombre"…). */
import { useLayoutEffect, useRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { getPath } from "../../state/paths";
import { useStore } from "../../state/store";

const useValue = (path: string) => useStore(s => getPath(s.hoja, path));
const useSet = () => useStore(s => s.setHoja);
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type InputProps = { path: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function TextField({ path, className, ...rest }: InputProps) {
  const v = useValue(path), set = useSet();
  return <input className={cx("ink", className)} value={String(v ?? "")} onChange={e => set(path, e.target.value)} {...rest} />;
}

/** Número: guarda "" si está vacío. Mantiene el texto mientras se escribe (p. ej. "-"). */
export function NumField({ path, className, signedInput, ...rest }: InputProps & { signedInput?: boolean }) {
  const v = useValue(path), set = useSet();
  const [raw, setRaw] = useState<string | null>(null);
  // El texto en curso solo se muestra si sigue coincidiendo con lo guardado (o aún no es un número, p. ej. "-").
  const rawMatches = raw !== null && (raw.trim() === "" ? v === "" : Number.isNaN(Number(raw)) || Number(raw) === v);
  return (
    <input
      className={cx("ink num", className)}
      inputMode={signedInput ? "text" : "numeric"}
      value={rawMatches ? raw : String(v ?? "")}
      onChange={e => {
        const t = e.target.value;
        setRaw(t);
        if (t.trim() === "") set(path, "");
        else if (!Number.isNaN(Number(t))) set(path, Number(t));
      }}
      onBlur={() => setRaw(null)}
      {...rest}
    />
  );
}

export function CheckField({ path, label, ...rest }: InputProps & { label: string }) {
  const v = useValue(path), set = useSet();
  return (
    <label className="chk">
      <input type="checkbox" checked={!!v} onChange={e => set(path, e.target.checked)} {...rest} /> {label}
    </label>
  );
}

type AreaProps = { path: string } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

/** Área de texto que crece con su contenido. */
export function AreaField({ path, className, ...rest }: AreaProps) {
  const v = String(useValue(path) ?? ""), set = useSet();
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const t = ref.current;
    if (!t || !t.offsetParent) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight + 4, 600) + "px";
  }, [v]);
  return <textarea ref={ref} className={cx("ink", className)} value={v} onChange={e => set(path, e.target.value)} {...rest} />;
}
