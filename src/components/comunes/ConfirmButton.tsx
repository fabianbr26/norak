import { useEffect, useRef, useState, type ReactNode } from "react";

/** Botón de doble toque: el primero pide confirmación, el segundo ejecuta (3 s de margen). */
export function ConfirmButton({ className = "btn", children, confirmText = "¿Seguro?", onConfirm, ...rest }: {
  className?: string; children: ReactNode; confirmText?: string; onConfirm: () => void; disabled?: boolean; "aria-label"?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={className + (armed ? " red" : "")}
      onClick={e => {
        e.stopPropagation();
        if (!armed) {
          setArmed(true);
          timer.current = window.setTimeout(() => setArmed(false), 3000);
          return;
        }
        window.clearTimeout(timer.current);
        setArmed(false);
        onConfirm();
      }}
      {...rest}
    >
      {armed ? confirmText : children}
    </button>
  );
}
