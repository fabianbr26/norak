import { useEffect, useRef, type ReactNode } from "react";

/** Diálogo modal nativo (<dialog>): atrapa el foco, se cierra con Esc y devuelve el foco al cerrar. */
export function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={e => { if (e.target === ref.current) onClose(); }}
    >
      {open && <div className="scroll">{children}</div>}
    </dialog>
  );
}
