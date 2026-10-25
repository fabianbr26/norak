import { useRef, useState } from "react";
import { backupFileName, buildBackup, canShareFiles, deliverBackup, parseBackup, type ParseResult } from "../../state/backup";
import { replaceWithUndo, undoReplace } from "../../state/importar";
import { useStore } from "../../state/store";
import { toast, useUI } from "../../state/ui";
import { Modal } from "../comunes/Modal";

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "nunca";

export function Respaldo() {
  const meta = useStore(s => s.meta);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Extract<ParseResult, { ok: true }> | null>(null);
  const undo = useUI(s => s.undo);
  const share = canShareFiles();

  const exportar = async (mode: "download" | "share") => {
    const { hoja, grimorio, meta, markExported } = useStore.getState();
    const json = JSON.stringify(buildBackup(hoja, grimorio, meta.modificado), null, 2);
    try {
      await deliverBackup(json, backupFileName(hoja.nombre), mode);
      markExported();
      toast(mode === "share" ? "Respaldo listo para enviar." : "Respaldo descargado.");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast("No se pudo exportar el respaldo.");
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const r = parseBackup(await file.text());
    if (fileRef.current) fileRef.current.value = "";
    if (!r.ok) { toast(r.error); return; }
    setPending(r);
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceWithUndo(pending.hoja, pending.grimorio);
    setPending(null);
    toast("Respaldo importado. Norak está al día en este dispositivo.");
  };

  const doUndo = () => {
    if (undoReplace()) toast("Se restauraron los datos que tenías antes de importar.");
  };

  const older = pending && pending.modificado && meta.modificado && pending.modificado < meta.modificado;

  return (
    <section className="sec">
      <h2 className="sec-h">Respaldo</h2>
      <p className="hint">
        Norak se guarda solo en este dispositivo y funciona sin internet. Para pasarlo entre el celular y la PC,
        exporta un respaldo en uno e impórtalo en el otro (por ejemplo, enviándotelo por correo, WhatsApp o Drive).
      </p>
      <div className="backup-grid">
        <div><span className="lbl">Último cambio en este dispositivo</span>{fmt(meta.modificado)}</div>
        <div><span className="lbl">Último respaldo exportado</span>{fmt(meta.ultimoRespaldo)}</div>
      </div>
      <div className="backup-actions">
        <button type="button" className="btn solid big-btn" onClick={() => exportar("download")}>Exportar respaldo</button>
        {share && <button type="button" className="btn big-btn" onClick={() => exportar("share")}>Compartir respaldo</button>}
        <button type="button" className="btn blue big-btn" onClick={() => fileRef.current?.click()}>Importar respaldo</button>
        <input ref={fileRef} className="file-input" type="file" accept="application/json,.json" tabIndex={-1} aria-hidden="true" onChange={e => onFile(e.target.files?.[0])} />
        {undo && <button type="button" className="btn" onClick={doUndo}>Deshacer última importación</button>}
      </div>

      <Modal open={!!pending} onClose={() => setPending(null)} labelledBy="imp-title">
        {pending && (
          <>
            <h2 id="imp-title">¿Importar este respaldo?</h2>
            <p><b>{pending.hoja.nombre || "Personaje sin nombre"}</b> · {pending.hoja.clase} nivel {pending.hoja.nivel} · {pending.grimorio.libro.length} conjuros en el libro.</p>
            <ul>
              <li>Exportado: {fmt(pending.exportado)}</li>
              <li>Último cambio en el respaldo: {fmt(pending.modificado)}</li>
              <li>Último cambio aquí: {fmt(meta.modificado)}</li>
            </ul>
            {older
              ? <p className="warn-box" role="alert">Este respaldo es <b>más antiguo</b> que lo que tienes en este dispositivo. Si lo importas perderás los cambios más recientes.</p>
              : <p>Reemplazará la hoja y el grimorio de este dispositivo. Podrás deshacerlo justo después.</p>}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setPending(null)}>Cancelar</button>
              <button type="button" className={"btn big-btn " + (older ? "red" : "solid")} onClick={confirmImport}>Reemplazar datos</button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
