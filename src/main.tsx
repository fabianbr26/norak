import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource/uncial-antiqua/400.css";
import "./styles/pergamino.css";
import "./styles/app.css";
import App from "./App";
import { STORAGE_KEY, useStore } from "./state/store";
import { toast } from "./state/ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker: deja la app y las fuentes en caché para jugar sin conexión.
registerSW({
  immediate: true,
  onOfflineReady: () => toast("Norak está listo para usarse sin conexión."),
});

// Pide al navegador que no borre los datos locales cuando falte espacio.
navigator.storage?.persist?.().catch(() => {});

// Si Norak está abierto en dos pestañas, mantenerlas iguales.
window.addEventListener("storage", e => {
  if (e.key === STORAGE_KEY) useStore.persist.rehydrate();
});
