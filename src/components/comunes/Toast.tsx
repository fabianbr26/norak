import { useEffect, useState } from "react";
import { useUI } from "../../state/ui";

export function Toast() {
  const toast = useUI(s => s.toast);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);
  return <div className={"toast" + (show ? " show" : "")} role="status" aria-live="polite">{toast?.msg}</div>;
}
