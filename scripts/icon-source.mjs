// Ícono: libro de hechizos cerrado sobre cuero oscuro, con una runa arcana en la tapa.
// pad = 0..1 margen interno (para la versión "maskable" el libro debe caber en el 80 % central).
export function iconSvg({ pad = 0.08, rounded = true } = {}) {
  const s = 512, inner = s * (1 - pad * 2), o = s * pad, k = inner / 512;
  const T = (x, y) => `${(o + x * k).toFixed(1)},${(o + y * k).toFixed(1)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="#4a3424"/><stop offset=".6" stop-color="#2c2017"/><stop offset="1" stop-color="#1d1510"/></radialGradient>
    <linearGradient id="cover" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f2a1b"/><stop offset="1" stop-color="#5a170e"/></linearGradient>
    <linearGradient id="pages" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3cd9b"/><stop offset="1" stop-color="#f2e5c4"/></linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".95"/><stop offset=".45" stop-color="#6f9bff" stop-opacity=".55"/><stop offset="1" stop-color="#6f9bff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 104 : 0}" fill="url(#bg)"/>
  <polygon points="${T(150, 92)} ${T(408, 92)} ${T(408, 420)} ${T(150, 420)}" fill="url(#pages)"/>
  <polygon points="${T(104, 72)} ${T(380, 72)} ${T(380, 440)} ${T(104, 440)}" fill="url(#cover)" stroke="#a8812f" stroke-width="${10 * k}" stroke-linejoin="round"/>
  <polygon points="${T(104, 72)} ${T(140, 72)} ${T(140, 440)} ${T(104, 440)}" fill="#3a0f08" opacity=".55"/>
  <polygon points="${T(166, 104)} ${T(352, 104)} ${T(352, 408)} ${T(166, 408)}" fill="none" stroke="#a8812f" stroke-width="${4 * k}" opacity=".85"/>
  <circle cx="${(o + 259 * k).toFixed(1)}" cy="${(o + 256 * k).toFixed(1)}" r="${(110 * k).toFixed(1)}" fill="url(#glow)"/>
  <g fill="none" stroke="#e8f0ff" stroke-width="${14 * k}" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="${T(259, 180)} ${T(259, 332)}"/>
    <polyline points="${T(209, 216)} ${T(259, 256)} ${T(309, 216)}"/>
    <polyline points="${T(219, 312)} ${T(259, 286)} ${T(299, 312)}"/>
  </g>
  <circle cx="${(o + 259 * k).toFixed(1)}" cy="${(o + 256 * k).toFixed(1)}" r="${(94 * k).toFixed(1)}" fill="none" stroke="#a8812f" stroke-width="${5 * k}" opacity=".9"/>
</svg>`;
}
