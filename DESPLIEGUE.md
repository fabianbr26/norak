# Norak: cómo usar, publicar e instalar la app

## Cómo se guardan los datos

- Todo se guarda **solo en el dispositivo** (en el almacenamiento local del navegador o de la app instalada) y funciona sin internet.
- La primera vez que abres la app se carga Norak desde `src/data/hoja.json` y `src/data/grimorio.json`.
- Para pasar a Norak entre el celular y la PC, ve a **Bitácora → Respaldo**:
  1. En el dispositivo con los cambios más recientes, pulsa **Exportar respaldo**. En el celular, **Compartir respaldo** te deja enviarlo por WhatsApp o correo, o guardarlo en Drive o Archivos.
  2. En el otro dispositivo, pulsa **Importar respaldo** y elige el archivo.
  3. La app te avisa si el respaldo es **más antiguo** que lo que ya tienes. Justo después de importar puedes usar **Deshacer última importación**.
- Si usas los dos dispositivos a la vez, decide cuál manda en cada sesión y exporta desde ese al terminar.
- **Haz respaldos seguido.** Si borras los datos del navegador o desinstalas la app, se pierde lo guardado en ese dispositivo.

## Comandos (en la carpeta `norak`)

En PowerShell escribe **`npm.cmd`** en lugar de `npm`. Así no hace falta ser administrador ni cambiar
la política de scripts (con `npm` a secas, PowerShell responde "la ejecución de scripts está deshabilitada").

```
npm.cmd install        # solo la primera vez
npm.cmd run dev        # servidor de desarrollo: http://localhost:5173
npm.cmd test           # pruebas de reglas, estado y respaldo (Vitest)
npm.cmd run build      # genera la app lista para publicar en dist/
npm.cmd run preview    # sirve dist/ en http://localhost:4173 para probarla
npm.cmd run icons      # regenera los íconos desde scripts/icon-source.mjs
```

> Los scripts llaman a `node` directamente porque el `&` del nombre de la carpeta `D&D` rompe los
> atajos `.cmd` de npm en Windows. Por eso no funcionan `npx vite` ni `npx vitest`; usa siempre `npm run …`.

## Publicar gratis (hace falta HTTPS para instalarla en el celular)

### Opción A: GitHub Pages (recomendada, se actualiza sola)

1. Crea una cuenta en https://github.com si no tienes una.
2. Crea un repositorio nuevo, por ejemplo `norak`. Puede ser **público**: el código no contiene datos tuyos más allá de la hoja inicial.
3. Desde la carpeta `norak`, en una terminal:
   ```
   git init
   git add .
   git commit -m "Norak PWA"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/norak.git
   git push -u origin main
   ```
4. En GitHub, abre el repositorio y ve a **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**.
5. El flujo `.github/workflows/deploy.yml` corre las pruebas, compila y publica. En la pestaña **Actions** verás el avance.
   Al terminar, la app queda en `https://TU_USUARIO.github.io/norak/`.
6. Cada `git push` a `main` publica una versión nueva. La app instalada se actualiza sola la próxima vez que la abras con internet.

### Opción B: Netlify Drop (sin git)

1. Ejecuta `npm run build`.
2. Entra a https://app.netlify.com/drop, inicia sesión con una cuenta gratuita y **arrastra la carpeta `dist`**.
3. Netlify te da una dirección `https://algo.netlify.app`. Para actualizar, repite el build y arrastra la carpeta de nuevo en tu sitio (**Deploys**).

## Instalar la app

- **Android (Chrome):** abre la dirección publicada y ve a menú **⋮ → Agregar a la pantalla principal** (o **Instalar app**).
- **iPhone (Safari):** abre la dirección y ve a **Compartir → Agregar a inicio**. Tiene que ser desde Safari.
- **PC (Chrome o Edge):** usa el ícono de instalar en la barra de direcciones, o menú **→ Instalar Norak**.

Ábrela una vez con internet después de instalarla. Cuando aparezca el aviso *"Norak está listo para usarse sin conexión"*,
ya la puedes usar en modo avión.

> En iPhone, la app instalada guarda sus datos aparte de Safari. Si antes usaste Norak en Safari, exporta desde
> Safari e importa en la app instalada.
