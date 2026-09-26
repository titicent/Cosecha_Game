/* Genera el pliego imprimible de la baraja (print & play).

       npm run imprimible          → mazo base + Bonanza
       npm run imprimible -- todo  → añade también Espantos

   Cartas de 63 × 88 mm, el tamaño de un naipe, nueve por hoja A4 con marcas
   de corte por fuera. Se abre en el navegador y se imprime desde ahí.

   Diseño de la carta (plantilla «V2 · C», definida con Ricardo):
     · Borde exterior recto (es lo que corta la tijera) y por dentro un marco
       de curvas de nivel, como las terrazas del cafetal.
     · Zonas fijas, iguales en todas las cartas: cabecera, ilustración,
       nombre, pictogramas y línea corta. Nada se mueve según el contenido.
     · Cabecera: ícono de tipo, solo el tipo («PLAGA RESISTENTE»), el sello
       del mazo y el costo en una ficha cuadrada.
     · Cultivos, plagas y remedios se explican con pictogramas; las faenas y
       los espantos llevan además una línea corta. El detalle está en la guía.

   Íconos de tipo: si existen public/cartas/iconos/t_<tipo>.png (blancos sobre
   transparente; ver prepara-iconos.py) se usan esos. Si no, van unos
   provisionales en vector.
*/
const R = require("./public/reglas.js");
const A = require("./public/arte.js");
const fs = require("fs");
const path = require("path");

const conEspantos = process.argv.includes("todo");
const mazo = R.crearMazo(true, conEspantos);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const HEX = c => R.CULTIVO[c].hex;
const TINTA = "#3A2E20", PAPEL = "#FBF8F1", ORO = "#9A7210";

/* ── Ilustraciones y fuentes ───────────────────────────────────── */
const dirArte = path.join(__dirname, "public", "cartas");
const propias = new Set(fs.existsSync(dirArte)
  ? fs.readdirSync(dirArte).filter(f => /\.png$/i.test(f)).map(f => f.replace(/\.png$/i, "")) : []);
const dirIconos = path.join(dirArte, "iconos");
const iconoPropio = k => fs.existsSync(path.join(dirIconos, k + ".png"));
/* Las fuentes van dentro del archivo: así imprime igual sin internet. */
const fuente = (fam, arch, w) => {
  const p = path.join(__dirname, "fuentes", arch + ".woff2");
  return fs.existsSync(p) ? `@font-face{font-family:"${fam}";font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}) format("woff2")}` : "";
};
const FUENTES = [fuente("Fredoka", "fredoka-latin-600-normal", 600),
  fuente("Andika", "andika-latin-400-normal", 400), fuente("Andika", "andika-latin-700-normal", 700)].join("\n");

/* ── Marco: curvas de nivel ────────────────────────────────────── */
const W = 63, H = 88, BANDA = 1.7;
function azar(txt) { let h = 1779033703 ^ txt.length; for (const ch of txt) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = h << 13 | h >>> 19; }
  return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function perimetro(d, r, paso) {
  const pts = [], x0 = d, y0 = d, x1 = W - d, y1 = H - d;
  const tramo = (ax, ay, bx, by, nx, ny) => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / paso));
    for (let i = 0; i < n; i++) pts.push({ x: ax + (bx - ax) * i / n, y: ay + (by - ay) * i / n, nx, ny }); };
  const arco = (cx, cy, a0) => { const n = Math.max(2, Math.round(Math.PI / 2 * r / paso));
    for (let i = 0; i < n; i++) { const a = a0 + Math.PI / 2 * i / n; pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), nx: -Math.cos(a), ny: -Math.sin(a) }); } };
  tramo(x0 + r, y0, x1 - r, y0, 0, 1); arco(x1 - r, y0 + r, -Math.PI / 2);
  tramo(x1, y0 + r, x1, y1 - r, -1, 0); arco(x1 - r, y1 - r, 0);
  tramo(x1 - r, y1, x0 + r, y1, 0, -1); arco(x0 + r, y1 - r, Math.PI / 2);
  tramo(x0, y1 - r, x0, y0 + r, 1, 0); arco(x0 + r, y0 + r, Math.PI);
  return pts;
}
const suaviza = (a, v) => a.map((_, i) => { let s = 0; for (let k = -v; k <= v; k++) s += a[(i + k + a.length) % a.length]; return s / (2 * v + 1); });
function marco(semilla, tono) {
  const rnd = azar(semilla), pts = perimetro(BANDA, 3, .45);
  const f1 = 2 * Math.PI / (9 + rnd() * 4), p1 = rnd() * 9, ruido = suaviza(suaviza(pts.map(() => rnd() - .5), 8), 8);
  const off = pts.map((_, i) => .9 + .6 * Math.sin(f1 * i * .45 + p1) + ruido[i] * .9);
  const curva = (sep, k) => pts.map((p, i) => { const o = off[i] + sep + Math.sin(f1 * i * .45 * (1.15 + k * .25) + p1 * 2) * .25;
    return (i ? "L" : "M") + (p.x + p.nx * o).toFixed(2) + " " + (p.y + p.ny * o).toFixed(2); }).join(" ") + "Z";
  const interior = pts.map((p, i) => (i ? "L" : "M") + (p.x + p.nx * off[i]).toFixed(2) + " " + (p.y + p.ny * off[i]).toFixed(2)).join(" ") + "Z";
  return `<svg class="marco" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path fill="${tono}" fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${interior}"/>` +
    `<path d="${curva(1.1, 0)}" fill="none" stroke="${tono}" stroke-width=".42" opacity=".85"/>` +
    `<path d="${curva(1.9, 1)}" fill="none" stroke="${tono}" stroke-width=".34" opacity=".6"/></svg>`;
}

/* ── Íconos de tipo (provisionales hasta que lleguen los de Ricardo) ── */
const TIPO_SVG = {
  t_cultivo: `<path d="M12 20v-7M12 13.5c0-3.6 2.4-6 6-6 0 3.6-2.4 6-6 6ZM12 14.5c0-3-2-5-5-5 0 3 2 5 5 5Z" fill="#fff" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 20.5c1.5-2 4-3 7-3s5.5 1 7 3Z" fill="#fff"/>`,
  t_plaga: `<path d="M7 9 4 7M7 13H3.5M7 17l-3 2M17 9l3-2M17 13h3.5M17 17l3 2M10 6 8.5 3.5M14 6l1.5-2.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="12" cy="13.5" rx="5.6" ry="7" fill="#fff"/><path d="M12 7.5v13" stroke="var(--tono)" stroke-width="1.3"/>`,
  t_resistente: `<path d="M7 9 4 7M7 13H3.5M7 17l-3 2M17 9l3-2M17 13h3.5M17 17l3 2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="12" cy="13.5" rx="6" ry="7.4" fill="#fff"/><path d="M6.4 11.5h11.2M6.2 15.5h11.6" stroke="var(--tono)" stroke-width="1.5"/>`,
  t_remedio: `<rect x="9" y="2.5" width="6" height="3.2" rx="1" fill="#fff"/><path d="M7.5 7h9a1 1 0 0 1 1 1v11.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1Z" fill="#fff"/><path d="M12 10.5c1.8 2.3 2.8 3.9 2.8 5.2a2.8 2.8 0 0 1-5.6 0c0-1.3 1-2.9 2.8-5.2Z" fill="var(--tono)"/>`,
  t_bioinsumo: `<path d="M9.5 2.5h5M10.3 2.5v6.2L5 18.6A2 2 0 0 0 6.8 21.5h10.4a2 2 0 0 0 1.8-2.9L13.7 8.7V2.5" fill="#fff"/><circle cx="10" cy="17" r="1.3" fill="var(--tono)"/><circle cx="13.6" cy="15.2" r="1" fill="var(--tono)"/><circle cx="12.4" cy="18.6" r=".9" fill="var(--tono)"/>`,
  t_faena: `<path d="M4 20 15.5 8.5M13.5 6.5l4-4 4 4-4 4Z" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="#fff"/><path d="M20 20 8.5 8.5M9.5 4.5c-2 0-4 1.5-5 3.5 2.5 0 4 1 5 2.5l1.5-1.5c-.8-1.5-1-3-1.5-4.5Z" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="#fff"/>`,
  t_espanto: `<ellipse cx="12" cy="11" rx="10.5" ry="2.6" fill="#fff"/><path d="M7 11c0-4.2 2.2-7.5 5-7.5s5 3.3 5 7.5Z" fill="#fff"/><path d="M6.5 13.5h11l-1.4 6.5H7.9Z" fill="#fff"/><circle cx="10.2" cy="16.4" r="1.2" fill="var(--tono)"/><circle cx="13.8" cy="16.4" r="1.2" fill="var(--tono)"/>`
};
function claveTipo(c) {
  if (c.k === "cultivo") return "t_cultivo";
  if (c.k === "plaga") return c.t === "resistente" ? "t_resistente" : "t_plaga";
  if (c.k === "remedio") return c.t === "bioinsumo" ? "t_bioinsumo" : "t_remedio";
  return R.esEspanto(c) ? "t_espanto" : "t_faena";
}
const TIPO_TEXTO = { t_cultivo: "CULTIVO", t_plaga: "PLAGA", t_resistente: "PLAGA RESISTENTE", t_remedio: "REMEDIO",
  t_bioinsumo: "BIOINSUMO", t_faena: "FAENA", t_espanto: "ESPANTO" };
const iconoTipo = k => iconoPropio(k)
  ? `<img src="public/cartas/iconos/${k}.png" alt="">`
  : `<svg viewBox="0 0 24 24">${TIPO_SVG[k]}</svg>`;

/* ── Pictogramas (24 × 24, trazo de tinta) ─────────────────────── */
const ic = (cuerpo, t = "") => `<svg class="ic ${t}" viewBox="0 0 24 24">${cuerpo}</svg>`;
const TACHA = `<path d="M3.5 20.5 20.5 3.5" stroke="#B3261E" stroke-width="2.6" stroke-linecap="round"/>`;
const GLIFO = {
  cafe: `<circle cx="9.6" cy="14" r="3.3" fill="#fff"/><circle cx="14.8" cy="13.2" r="3.3" fill="#fff"/><path d="M12 10.5c0-3 2-4.6 4.8-4.8-.2 2.8-2 4.6-4.8 4.8Z" fill="#fff"/>`,
  platano: `<path d="M6.5 8.5c1 6 4.5 9.5 11 9.2.6 0 .8-.8.2-1-4.7-1.3-7.4-4.6-8.6-9-.3-1-2.8-.7-2.6.8Z" fill="#fff"/><path d="M7.3 7.8 6.6 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
  cacao: `<path d="M12 4.8c3.4 1.5 4.9 4.6 4.9 7.4S15.4 18.3 12 19.4c-3.4-1.1-4.9-4.4-4.9-7.2S8.6 6.3 12 4.8Z" fill="#fff"/><path d="M12 6.5v11M9.6 8.2c-.6 2.8-.6 5.4 0 8M14.4 8.2c.6 2.8.6 5.4 0 8" stroke="#7B4B2A" stroke-width="1" fill="none"/>`,
  cana: `<rect x="10.4" y="5" width="3.2" height="14.5" rx="1" fill="#fff"/><path d="M9.6 9.6h4.8M9.6 14.4h4.8" stroke="#C9A227" stroke-width="1.1"/><path d="M13.4 6.4c2-1.8 4-2.2 5.6-1.8-1.3 1.6-3.3 2.3-5.6 1.8Z" fill="#fff"/>`,
  huerta: `<path d="M5.5 11.5h13l-1.6 7.2a1.6 1.6 0 0 1-1.6 1.3H8.7a1.6 1.6 0 0 1-1.6-1.3Z" fill="#fff"/><path d="M8 11.5c0-3.4 1.8-5.5 4-5.5s4 2.1 4 5.5" fill="none" stroke="#fff" stroke-width="1.6"/>`,
  vivero: `<path d="M5 11.5 12 5.5l7 6V19H5Z" fill="#fff"/><path d="M12 18v-4M12 15c0-1.6 1-2.6 2.6-2.6 0 1.6-1 2.6-2.6 2.6Z" stroke="#6E7A88" stroke-width="1.1" fill="#6E7A88"/>`,
  injerto: `<path d="M12 19.5c-2.5-2-1-4.5 0-6s2-4-.5-6.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="14.5" cy="8" r="3" fill="#fff"/><circle cx="13.6" cy="7.6" r=".7" fill="#D97A16"/><circle cx="15.6" cy="7.6" r=".7" fill="#D97A16"/>`,
  neutra: `<path d="M12 18v-7M12 12c0-3 2-5 5-5 0 3-2 5-5 5ZM12 13c0-2.4-1.7-4-4-4 0 2.4 1.7 4 4 4Z" fill="#fff" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>`
};
const INSIGNIA = {
  ok: `<circle cx="19.5" cy="4.5" r="4.2" fill="#2E7D4F" stroke="${PAPEL}" stroke-width="1.2"/><path d="M17.6 4.6l1.4 1.4 2.4-2.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
  no: `<circle cx="19.5" cy="4.5" r="4.2" fill="#B3261E" stroke="${PAPEL}" stroke-width="1.2"/><path d="M17.8 2.8l3.4 3.4M21.2 2.8l-3.4 3.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`,
  bicho: `<circle cx="19.5" cy="4.5" r="4.2" fill="${TINTA}" stroke="${PAPEL}" stroke-width="1.2"/><ellipse cx="19.5" cy="4.8" rx="1.8" ry="2.3" fill="#fff"/>`
};
const colorMata = k => k === "neutra" ? "#8A8F7E" : HEX(k);
const G = {
  mata: (k, ins) => ic(`<rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="${colorMata(k)}"/>${GLIFO[k]}${ins ? INSIGNIA[ins] : ""}`),
  bicho: c => ic(`<path d="M6 8 3 6M6 12H2.5M6 16l-3 2M18 8l3-2M18 12h3.5M18 16l3 2M9 5.5 7.5 3M15 5.5 16.5 3" stroke="${TINTA}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="13" rx="6.2" ry="7.5" fill="${c}" stroke="${TINTA}" stroke-width="1.4"/><path d="M12 6v14" stroke="${TINTA}" stroke-width="1.2"/>`),
  blindado: c => ic(`<path d="M6 8 3 6M6 12H2.5M6 16l-3 2M18 8l3-2M18 12h3.5M18 16l3 2" stroke="${TINTA}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="13" rx="6.2" ry="7.5" fill="${c}" stroke="${TINTA}" stroke-width="2.4"/><path d="M7 11h10M7 15h10" stroke="${TINTA}" stroke-width="1.3"/>`),
  bichoFuera: () => ic(`<path d="M6 8 3 6M6 12H2.5M6 16l-3 2M18 8l3-2M18 12h3.5M18 16l3 2" stroke="${TINTA}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="13" rx="6.2" ry="7.5" fill="#999" stroke="${TINTA}" stroke-width="1.4"/>${TACHA}`),
  frasco: c => ic(`<path d="M9.5 3h5M10.5 3v5L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L13.5 8V3" fill="#fff" stroke="${TINTA}" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.4 14h9.2l2.1 4.2a1.6 1.6 0 0 1-1.4 2.3H6.7a1.6 1.6 0 0 1-1.4-2.3Z" fill="${c}"/>`),
  tu: () => ic(`<circle cx="12" cy="8" r="4" fill="${TINTA}"/><path d="M4.5 21c.6-4.5 3.6-7 7.5-7s6.9 2.5 7.5 7Z" fill="${TINTA}"/>`),
  vecino: () => ic(`<circle cx="12" cy="8" r="3.7" fill="none" stroke="${TINTA}" stroke-width="1.6"/><path d="M4.8 20.5c.6-4.3 3.5-6.6 7.2-6.6s6.6 2.3 7.2 6.6Z" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round"/>`),
  todos: () => ic(`<circle cx="7" cy="9" r="2.8" fill="none" stroke="${TINTA}" stroke-width="1.4"/><circle cx="17" cy="9" r="2.8" fill="none" stroke="${TINTA}" stroke-width="1.4"/><path d="M2 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5M12 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5" fill="none" stroke="${TINTA}" stroke-width="1.4"/>`),
  flecha: () => ic(`<path d="M3 12h16M14 6.5 19.5 12 14 17.5" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`, "chica"),
  cambio: () => ic(`<path d="M3 8.5h16M15.5 5l3.5 3.5-3.5 3.5M21 15.5H5M8.5 12 5 15.5 8.5 19" fill="none" stroke="${TINTA}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, "chica"),
  giro: () => ic(`<path d="M18.5 9A7 7 0 0 0 5.6 8M5.5 15a7 7 0 0 0 12.9 1" fill="none" stroke="${TINTA}" stroke-width="2" stroke-linecap="round"/><path d="M5 4v4.5h4.5M19 20v-4.5h-4.5" fill="none" stroke="${TINTA}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  certificada: tach => ic(`<path d="M12 2.5l2.3 1.7 2.8-.2.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.2L12 21.5l-2.3-1.7-2.8.2-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.2Z" fill="#C9A227" stroke="${TINTA}" stroke-width="1.2"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>${tach ? TACHA : ""}`),
  trofeo: tach => ic(`<path d="M7 3h10v5a5 5 0 0 1-10 0Z" fill="#C9A227" stroke="${TINTA}" stroke-width="1.4"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8 21h8M9.5 17h5v4h-5Z" fill="none" stroke="${TINTA}" stroke-width="1.4"/>${tach ? TACHA : ""}`),
  escudo: () => ic(`<path d="M12 2.5 20 5.5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6Z" fill="#3F6B4A" stroke="${TINTA}" stroke-width="1.3"/><path d="M8.3 12.2l2.6 2.6 4.8-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  ataque: () => ic(`<rect x="3" y="5" width="9" height="13" rx="1.6" fill="#fff" stroke="${TINTA}" stroke-width="1.4" transform="rotate(-12 7.5 11.5)"/><path d="M12.5 12h8M17 8.5 20.5 12 17 15.5" fill="none" stroke="#B3261E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  gota: () => ic(`<path d="M12 3c3.6 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.4-6.4 6-11Z" fill="#5B8FC7" stroke="${TINTA}" stroke-width="1.3"/>`),
  mano: (tach) => ic(`<g stroke="${TINTA}" stroke-width="1.3"><rect x="3.5" y="6" width="8" height="12" rx="1.4" fill="#fff" transform="rotate(-14 7.5 12)"/><rect x="8" y="5" width="8" height="12" rx="1.4" fill="#fff"/><rect x="12.5" y="6" width="8" height="12" rx="1.4" fill="#fff" transform="rotate(14 16.5 12)"/></g>${tach ? TACHA : ""}`),
  monton: () => ic(`<g stroke="${TINTA}" stroke-width="1.3"><rect x="5" y="8" width="14" height="12" rx="1.4" fill="#E8DFC8"/><rect x="5" y="6" width="14" height="12" rx="1.4" fill="#E8DFC8"/><rect x="5" y="4" width="14" height="12" rx="1.4" fill="#fff"/></g>`),
  finca: (quien) => `<span class="duena">${ic(`<rect x="1.5" y="6" width="21" height="12" rx="2.5" fill="#E8DFC8" stroke="${TINTA}" stroke-width="1.2"/><rect x="3.8" y="8.5" width="4.6" height="7" rx="1.2" fill="${HEX("cafe")}"/><rect x="9.7" y="8.5" width="4.6" height="7" rx="1.2" fill="${HEX("platano")}"/><rect x="15.6" y="8.5" width="4.6" height="7" rx="1.2" fill="${HEX("cana")}"/>`)}<span class="punto">${quien === "tu" ? G.tu() : G.vecino()}</span></span>`,
  barra: () => `<span class="barra">/</span>`,
  jornal: t => `<span class="chip">${t}</span>`
};
const tuya = k => `<span class="duena">${G.mata(k)}<span class="punto">${G.tu()}</span></span>`;
const ajena = k => `<span class="duena">${G.mata(k)}<span class="punto">${G.vecino()}</span></span>`;
const CULTIVOS = ["cafe", "platano", "cacao", "cana"];

/* Qué muestra cada carta: filas de pictogramas y, en faenas y espantos, una línea corta. */
function contenido(c) {
  if (c.k === "cultivo") {
    if (c.c === "huerta") return { filas: [[G.tu(), G.flecha(), G.mata("huerta")], [G.bicho("#999"), G.barra(), G.frasco("#999")]] };
    if (c.c === "vivero") return { filas: [[G.tu(), G.flecha(), G.mata("vivero")], [G.certificada(false), G.barra(), G.bichoFuera()]] };
    if (c.c === "injerto") return { filas: [[G.mata("neutra", "no"), G.flecha(), G.mata("injerto")]] };
    return { filas: [[G.tu(), G.flecha(), G.mata(c.c)]] };
  }
  if (c.k === "plaga") {
    const bicho = c.t === "resistente" ? G.blindado(HEX(c.c)) : G.bicho(HEX(c.c));
    const dest = c.c === "huerta" ? CULTIVOS.map(k => G.mata(k)) : [G.mata(c.c), G.barra(), G.mata("huerta")];
    return { filas: [[bicho, G.flecha(), ...dest]] };
  }
  if (c.k === "remedio") {
    const dest = c.c === "huerta" ? CULTIVOS.map(k => tuya(k)) : [tuya(c.c), G.barra(), tuya("huerta")];
    const f = [[G.frasco(HEX(c.c)), G.flecha(), ...dest]];
    if (c.t === "bioinsumo") f.push([G.certificada(false), G.barra(), G.blindado("#AAA")]);
    return { filas: f };
  }
  const col = c.tr.startsWith("mohan_") ? c.tr.split("_")[1] : null;
  if (col) return { filas: [[ajena(col), G.barra(), ajena("huerta"), G.flecha(), G.tu()], [G.certificada(false)]],
    linea: `Te llevas su ${R.CULTIVO[col].label.toLowerCase()} o una huerta, aunque esté certificada.` };
  const T = {
    trueque: { filas: [[tuya("neutra"), G.cambio(), ajena("neutra")], [G.certificada(true)]], linea: "Cambias una mata tuya por una del vecino." },
    saqueo: { filas: [[ajena("neutra"), G.flecha(), G.tu()], [G.certificada(true)]], linea: "Te llevas una mata de un vecino a tu finca." },
    propagacion: { filas: [[G.mata("neutra", "bicho"), G.flecha(), ajena("neutra"), ajena("neutra")]], linea: "Tus plagas saltan a matas sanas de los vecinos." },
    chaparron: { filas: [[G.todos(), G.flecha(), G.mano(true)]], linea: "Los demás botan su mano y pierden el turno." },
    lindero: { filas: [[G.finca("tu"), G.cambio(), G.finca("vecino")]], linea: "Cambias tu finca entera con la de un vecino." },
    jornalExtra: { filas: [[G.jornal("−1"), G.flecha(), G.jornal("+2")]], linea: "Cuesta un jornal y te da dos." },
    consejo: { filas: [[G.mano(false), G.cambio(), G.mano(false), G.jornal("+1")]], linea: "Cambias tu mano con la de un vecino. Te devuelve un jornal." },
    mallasombra: { filas: [[G.ataque(), G.escudo()]], linea: "En el turno de otro: la carta que va contra ti no te toca." },
    erradicacion: { filas: [[G.mata("neutra", "bicho"), G.flecha(), G.bichoFuera()]], linea: "Saca del juego las plagas de una mata." },
    patasola: { filas: [[G.mata("neutra"), G.cambio(), G.mata("neutra")], [G.certificada(false)]], linea: "Cambia dos matas de dos fincas, aunque estén certificadas." },
    duende: { filas: [[G.monton(), G.flecha(), G.mano(false), G.jornal("+1")]], linea: "Cambias el Duende por la carta de arriba del montón." },
    llorona: { filas: [[G.gota(), G.flecha(), G.mata("neutra", "ok"), G.barra(), G.mata("neutra", "no")]], linea: "Cura o certifica una mata; o la arrasa o le lava el remedio. Tú eliges." },
    madremonte: { filas: [[G.vecino(), G.flecha(), G.trofeo(true)]], linea: "El vecino no puede cosechar hasta que cure una mata ajena." },
    sombreron: { filas: [[G.finca("tu"), G.giro(), G.finca("vecino")]], linea: "Todas las fincas pasan al vecino del lado que elijas." }
  };
  return T[c.tr] || { filas: [] };
}

/* ── Carta: zonas fijas (plantilla V2), en mm desde arriba ─────── */
const Z = { cab: [5.6, 5.2], obra: [11.6, 45.8], nombre: [57.6, 5.6], pictos: [63.8, 11.4], linea: [75.8, 6.6] };
const zona = n => `style="top:${Z[n][0]}mm;height:${Z[n][1]}mm"`;
function cara(c) {
  const tono = R.colorCarta(c), mz = R.mazoDe(c), kt = claveTipo(c);
  const arte = A.clavesCarta(c).find(x => propias.has(x));
  const p = contenido(c);
  const nombre = R.nombreCarta(c).replace(/^El Mohán: .*/, "El Mohán");
  const costo = c.tr === "mallasombra" ? 0 : R.cuesta(c);
  return `<div class="carta" style="--tono:${tono}">
  <div class="z cab" ${zona("cab")}><span class="tipo">${iconoTipo(kt)}</span><span class="tit">${TIPO_TEXTO[kt]}</span><span class="sello" style="--sello:${R.MAZOS[mz].hex}" title="Mazo ${R.MAZOS[mz].nombre}">${A.sello(mz, "#FFFFFF")}</span><span class="ficha" title="jornales">${costo}</span></div>
  <div class="z obra" ${zona("obra")}>${arte ? `<img src="public/cartas/${arte}.png" alt="">` : A.dibujo(c, tono)}</div>
  <div class="z nombre${nombre.length > 16 ? " largo" : ""}" ${zona("nombre")}>${esc(nombre)}</div>
  <div class="z pictos${p.filas.length > 1 ? " dos" : ""}" ${zona("pictos")}>${p.filas.map(f => `<div class="fila">${f.join("")}</div>`).join("")}</div>
  <div class="z linea" ${zona("linea")}>${p.linea ? esc(p.linea) : ""}</div>
  ${marco((c.c || "") + (c.t || "") + (c.tr || ""), tono)}
</div>`;
}

/* ── Pliego ────────────────────────────────────────────────────── */
const POR_HOJA = 9, COLS = 3, ANCHO = COLS * W, ALTO = 3 * H;
const hojas = [];
for (let i = 0; i < mazo.length; i += POR_HOJA) hojas.push(mazo.slice(i, i + POR_HOJA));
/* Los reversos van en espejo por filas: al voltear la hoja (doble cara por el
   borde largo) la columna izquierda queda a la derecha. En una hoja llena da
   igual, pero en la última, incompleta, cada reverso cae detrás de su carta. */
/* marcas de corte por fuera de la grilla: nunca tocan las cartas */
const marcas = (() => {
  const m = [], L = 5;
  for (let i = 0; i <= COLS; i++) { const x = i * W; m.push(`<i style="left:${x}mm;top:-${L + 1}mm;width:0;height:${L}mm"></i><i style="left:${x}mm;top:${ALTO + 1}mm;width:0;height:${L}mm"></i>`); }
  for (let j = 0; j <= 3; j++) { const y = j * H; m.push(`<i style="top:${y}mm;left:-${L + 1}mm;height:0;width:${L}mm"></i><i style="top:${y}mm;left:${ANCHO + 1}mm;height:0;width:${L}mm"></i>`); }
  return `<div class="marcas">${m.join("")}</div>`;
})();
const dorso = `<div class="carta dorso"><div class="dorsoArte"><div class="dorsoMarca">COSECHA</div><div class="dorsoSub">juego de finca</div></div>${marco("dorso", "#4A6338")}</div>`;

const css = `${FUENTES}
@page { size: A4; margin: 0; }
*{box-sizing:border-box}
body{margin:0;background:#E8E3D6;font-family:Andika,ui-sans-serif,system-ui,sans-serif;color:#1F2415}
.aviso{max-width:190mm;margin:14px auto;padding:14px 18px;background:#FBF7EC;border:1px solid #D6CBB4;border-radius:4px;font-size:13.5px;line-height:1.6}
.aviso h1{font-family:Fredoka,sans-serif;font-weight:600;font-size:20px;margin:0 0 6px}
.aviso ol{margin:8px 0 0;padding-left:20px}
.hoja{width:210mm;height:297mm;margin:10px auto;background:#fff;position:relative;overflow:hidden;page-break-after:always}
.rejilla{position:absolute;left:${(210 - ANCHO) / 2}mm;top:${(297 - ALTO) / 2}mm;width:${ANCHO}mm;height:${ALTO}mm;display:grid;grid-template-columns:repeat(3,${W}mm);grid-auto-rows:${H}mm}
.marcas{position:absolute;inset:0;pointer-events:none}
.marcas i{position:absolute;border-left:.2mm solid #555;border-top:.2mm solid #555}
.carta{width:${W}mm;height:${H}mm;position:relative;background:${PAPEL};overflow:hidden}
.carta .marco{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.z{position:absolute;left:6.6mm;right:6.6mm;display:flex;align-items:center;justify-content:center;min-width:0}
.cab{justify-content:flex-start;gap:1.2mm}
.tipo{width:5mm;height:5mm;flex:none;border-radius:50%;background:var(--tono);padding:.7mm;display:block}
.tipo svg,.tipo img{width:100%;height:100%;display:block;object-fit:contain}
.tit{font-family:Fredoka;font-weight:600;font-size:3mm;color:var(--tono);letter-spacing:.03em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sello{flex:none;width:3.4mm;height:3.4mm;border-radius:50%;background:var(--sello);padding:.5mm;margin-right:.3mm}
.sello svg{width:100%;height:100%;display:block}
.ficha{flex:none;width:5.2mm;height:5.2mm;border-radius:1.1mm;background:${ORO};color:#fff;font-family:Fredoka;font-weight:600;font-size:3.2mm;display:grid;place-items:center;box-shadow:inset 0 0 0 .45mm ${PAPEL},0 0 0 .3mm ${ORO}}
.obra img,.obra svg{width:100%;height:100%;object-fit:contain;display:block}
.nombre{font-family:Fredoka;font-weight:600;font-size:4.6mm;color:#2A2114;white-space:nowrap}
.nombre.largo{font-size:3.7mm}
.pictos{flex-direction:column;gap:.6mm}
.fila{display:flex;align-items:center;justify-content:center;gap:.6mm}
.ic{width:5.4mm;height:5.4mm;display:block}
.ic.chica{width:3.9mm;height:3.9mm}
.pictos.dos .ic{width:5mm;height:5mm}.pictos.dos .ic.chica{width:3.6mm;height:3.6mm}
.barra{font-family:Fredoka;font-size:3.6mm;color:#8C7E66;margin:0 .2mm}
.chip{font-family:Fredoka;font-weight:600;font-size:2.9mm;color:#fff;background:${ORO};border-radius:1mm;padding:.3mm 1.2mm;margin:0 .4mm}
.duena{position:relative;display:block}
.duena .punto{position:absolute;right:-1.1mm;top:-.5mm;width:3.8mm;height:3.8mm;border-radius:50%;background:${PAPEL};padding:.35mm}
.duena .punto .ic{width:100%;height:100%}
.linea{font-family:Andika;font-size:2.55mm;line-height:1.25;text-align:center;color:#3A2E20;padding:0 2mm}
.dorso{background:#4A6338}
.dorsoArte{position:absolute;inset:5mm;border-radius:1.5mm;background:repeating-linear-gradient(45deg,#4A6338 0 3mm,#41592F 3mm 6mm);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm}
.dorsoMarca{color:#F4EFE2;font-family:Fredoka;font-weight:600;font-size:7mm;letter-spacing:.12em}
.dorsoSub{color:#C9D8B5;font-size:2.8mm;letter-spacing:.2em;text-transform:uppercase}
@media print{ body{background:#fff} .aviso{display:none} .hoja{margin:0;box-shadow:none} }`;

const provisionales = Object.keys(TIPO_SVG).filter(k => !iconoPropio(k));
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Cosecha · pliego para imprimir</title>
<style>${css}</style></head><body>
<div class="aviso">
  <h1>Cosecha · ${mazo.length} cartas para imprimir</h1>
  <p>Imprime en A4 desde el navegador, <b>sin ajustar al papel</b> (escala 100 % o «tamaño real») y sin márgenes,
    para que las cartas queden de 63 × 88 mm, la medida de un naipe.</p>
  <ol>
    <li>Usa papel de 200 g o más, o pega las hojas sobre cartulina.</li>
    <li>Las hojas verdes son los reversos y van intercaladas: imprime a doble cara, volteando por el borde largo. Si tu impresora no imprime a doble cara, imprímelas aparte y pégalas por detrás.</li>
    <li>Corta siguiendo las marcas de las orillas de la hoja: el borde de cada carta es recto.</li>
    <li>Si vas a jugar mucho, mételas en fundas de 63 × 88 mm.</li>
    <li>Cada carta lleva en la cabecera el <b>sello de su mazo</b>, junto a la ficha del costo: grano verde para Cosecha,
      sol dorado para Bonanza, luna morada para Espantos. Sirve para volver a separar las barajas.</li>
  </ol>
  <p style="margin-bottom:0"><b>${conEspantos ? "Incluye Espantos." : "Mazo base y Bonanza."}</b>
    ${conEspantos ? "" : "Para añadir los espantos, corre <code>npm run imprimible -- todo</code>."}
    ${provisionales.length ? `Íconos de tipo provisionales: ${provisionales.join(", ")}.` : ""}</p>
</div>
${hojas.map(h => `<section class="hoja"><div class="rejilla">${h.map(cara).join("")}${marcas}</div></section>
<section class="hoja"><div class="rejilla">${h.map((_, i) => dorso.replace('class="carta dorso"', `class="carta dorso" style="grid-row:${Math.floor(i / COLS) + 1};grid-column:${COLS - (i % COLS)}"`)).join("")}${marcas}</div></section>`).join("\n")}
</body></html>`;

const salida = conEspantos ? "cosecha-imprimible-completo.html" : "cosecha-imprimible.html";
fs.writeFileSync(path.join(__dirname, salida), html);
console.log(`${salida} · ${mazo.length} cartas · ${hojas.length} hojas de caras + ${hojas.length} de reversos · ` +
  `${Math.round(html.length / 1024)} KB` + (provisionales.length ? ` · ${provisionales.length} íconos de tipo provisionales` : ""));
