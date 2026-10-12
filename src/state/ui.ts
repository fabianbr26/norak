import { create } from "zustand";

export type Tab = "hoja" | "grimorio" | "bitacora";
export type Sub = "hoy" | "libro" | "biblio" | "registro";

const TAB_KEY = "norak-v2:tab";
const readTab = (): Tab => {
  try {
    const t = localStorage.getItem(TAB_KEY);
    if (t === "hoja" || t === "grimorio" || t === "bitacora") return t;
  } catch { /* sin almacenamiento */ }
  return "hoja";
};

interface UI {
  tab: Tab;
  sub: Sub;
  toast: { msg: string; id: number } | null;
  setTab: (t: Tab) => void;
  setSub: (s: Sub) => void;
  showToast: (msg: string) => void;
}

export const useUI = create<UI>()(set => ({
  tab: readTab(),
  sub: "hoy",
  toast: null,
  setTab: tab => {
    try { localStorage.setItem(TAB_KEY, tab); } catch { /* sin almacenamiento */ }
    set({ tab });
    window.scrollTo({ top: 0 });
  },
  setSub: sub => set({ sub }),
  showToast: msg => set({ toast: { msg, id: Date.now() } }),
}));

export const toast = (msg: string) => { if (msg) useUI.getState().showToast(msg); };
