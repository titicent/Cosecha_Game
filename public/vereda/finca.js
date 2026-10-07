/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — Mi finca (la pantalla)
   Las reglas viven en finca-reglas.js (FINCA); aquí se pinta la finca en
   diagonal, se atienden los toques y se cobran o pagan las monedas del
   costal de La Vereda. Diseño en MI-FINCA.md.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
const V = VEREDA, A = ARTE, R = REGLAS, FI = FINCA, esc = V.esc;
const app = document.getElementById("app");
const LLAVE = "cosecha.finca";
const ahora = () => Date.now();
const MONEDA = V.GRANO;

/* ── Guardado ──────────────────────────────────────────────── */
function cargar() {
  try {
    const f = JSON.parse(localStorage.getItem(LLAVE) || "null");
    if (f && f.v === 1 && Array.isArray(f.lotes)) { FI.llenarEncargos(f); return f; }
  } catch (e) {}
  return FI.nueva(ahora());
}
let F = cargar();
function guardar() {
  try { localStorage.setItem(LLAVE, JSON.stringify(F)); } catch (e) {}
  publicar();
}
/* La autopista para los vecinos: con cuenta, la finca sube su vista pública. */
let relojPublicar = null;
function publicar() {
  const C = window.CUENTA;
  if (!C || !C.estado.conectado || !C.publicarFinca) return;
  clearTimeout(relojPublicar);
  relojPublicar = setTimeout(() => {
    let cara = null; try { cara = parseInt(localStorage.getItem("cosecha.cara"), 10); } catch (e) {}
    C.publicarFinca(FI.vistaPublica(F, ahora(), { nombre: V.nombre(), cara: Number.isInteger(cara) ? cara : null }));
  }, 4000);
}
/* Regalo de bienvenida: para que la primera semilla no dependa de haber jugado antes. */
const REGALO = 20;
if (!F.regalo) { F.regalo = true; V.sumar(REGALO); guardar(); }

/* ── Dibujos de respaldo (mientras llegan las ilustraciones) ── */
const MONTICULO = `<svg width="56" height="30" viewBox="0 0 44 24"><ellipse cx="22" cy="16" rx="17" ry="6.5" fill="#4B2E16"/><ellipse cx="22" cy="14" rx="13" ry="4.6" fill="#6E4426"/><circle cx="18" cy="12.5" r="1.6" fill="#E8D7A8"/><circle cx="25" cy="13" r="1.6" fill="#E8D7A8"/></svg>`;
const BROTE = `<svg width="58" height="52" viewBox="0 0 44 40"><ellipse cx="22" cy="32" rx="17" ry="6.5" fill="#4B2E16"/><ellipse cx="22" cy="30" rx="13" ry="4.6" fill="#6E4426"/><path d="M22 31V16" stroke="#3E7A28" stroke-width="2.6" stroke-linecap="round"/><path d="M22 20c-9 1-12-5-12-8 6-1 11 2 12 8z" fill="#6DAE3E"/><path d="M22 17c8-1 11-6 11-9-6 0-10 3-11 9z" fill="#8CC152"/></svg>`;
const SECA = `<svg width="60" height="60" viewBox="0 0 44 44"><ellipse cx="22" cy="38" rx="16" ry="5.5" fill="#4B2E16"/><path d="M22 37V18" stroke="#7A5A2E" stroke-width="3" stroke-linecap="round"/><path d="M22 24c-7 0-11 4-12 9 5 0 10-3 12-9zM22 20c6-1 10 2 11 7-5 0-9-2-11-7z" fill="#9C7A3E"/><path d="M22 18c-2-4 0-8 3-9" stroke="#7A5A2E" stroke-width="2" fill="none"/></svg>`;
const CASA = `<svg width="150" height="132" viewBox="-8 -10 136 122"><polygon points="0,62 55,90 55,56 0,28" fill="#F4EEDF"/><polygon points="55,90 120,58 120,24 55,56" fill="#E2D7BE"/>
  <polygon points="14,60 26,66 26,46 14,40" fill="#2D6CA3"/><polygon points="34,70 46,76 46,64 34,58" fill="#C0392B"/>
  <polygon points="70,72 84,65 84,52 70,59" fill="#3E8E4E"/><polygon points="96,60 110,53 110,40 96,47" fill="#3E8E4E"/>
  <polygon points="68,74 112,52 112,56 68,78" fill="#C0392B"/><polygon points="-8,30 55,62 62,-6" fill="#C2562E"/><polygon points="55,62 128,24 62,-6" fill="#9E3F1F"/>
  <path d="M10 30l45 23M20 25l40 20M34 18l30 15" stroke="#8E3518" stroke-width="1.4" opacity=".6"/></svg>`;
const PUESTO = `<svg width="118" height="104" viewBox="0 0 100 88"><polygon points="12,62 50,80 88,62 50,44" fill="#8A5A33"/><polygon points="12,62 50,80 50,86 12,68" fill="#6A4224"/><polygon points="50,80 88,62 88,68 50,86" fill="#5A3820"/>
  <path d="M16 62V30M50 78V44M84 62V30" stroke="#C9A060" stroke-width="3.4"/><g><polygon points="6,32 50,52 94,32 50,12" fill="#E8D7A8"/>
  <path d="M17 37L61 17M28 42L72 22M39 47L83 27" stroke="#C0392B" stroke-width="6"/></g>
  <ellipse cx="38" cy="60" rx="9" ry="5" fill="#A0782E"/><circle cx="35" cy="56" r="4" fill="#C0392B"/><circle cx="41" cy="57" r="4" fill="#C0392B"/><ellipse cx="62" cy="58" rx="9" ry="5" fill="#A0782E"/><path d="M56 55c4-6 10-6 12 0" stroke="#D9C24A" stroke-width="5" fill="none"/></svg>`;
const TABLERO = `<svg width="84" height="96" viewBox="0 0 70 80"><path d="M14 76V26M56 76V26" stroke="#7A5A2E" stroke-width="5" stroke-linecap="round"/><polygon points="6,26 64,26 58,16 12,16" fill="#9AA4AA"/>
  <rect x="10" y="26" width="50" height="34" rx="3" fill="#B98A50" stroke="#6A4224" stroke-width="2"/><rect x="15" y="31" width="12" height="15" fill="#FBF8F1" transform="rotate(-6 21 38)"/><rect x="30" y="30" width="12" height="15" fill="#FBF8F1"/><rect x="45" y="31" width="11" height="15" fill="#FBF8F1" transform="rotate(5 50 38)"/></svg>`;
const SECADERO = `<svg width="118" height="104" viewBox="0 0 96 84"><polygon points="6,52 46,72 90,50 50,30" fill="#8A5A33"/><polygon points="6,52 46,72 46,78 6,58" fill="#6A4224"/><polygon points="46,72 90,50 90,56 46,78" fill="#5A3820"/>
  <g fill="#B5562E">${Array.from({ length: 22 }, (_, k) => `<circle cx="${22 + (k % 6) * 9 + Math.floor(k / 6) * 5}" cy="${48 + Math.floor(k / 6) * 4 - (k % 6) * 2.4}" r="2"/>`).join("")}</g>
  <path d="M10 50V22M46 70V40M86 50V22M50 32V6" stroke="#4A2E18" stroke-width="3"/><polygon points="2,24 46,42 92,20 50,2" fill="#CFE3EA" opacity=".85"/><polygon points="2,24 46,42 46,46 2,28" fill="#9FB8C2"/></svg>`;
const GALLINERO = `<svg width="104" height="88" viewBox="0 0 64 52"><polygon points="4,30 30,44 60,28 34,14" fill="#C9A060"/><polygon points="4,30 30,44 30,24 4,10" fill="#E8C98C"/><polygon points="30,44 60,28 60,10 30,24" fill="#D4B276"/>
  <path d="M8 14l18 9M8 20l18 9M8 26l18 9" stroke="#9C7A3E" stroke-width="1" opacity=".7"/><polygon points="0,12 30,28 34,0" fill="#9FA8AE"/><polygon points="30,28 64,10 34,0" fill="#7E878D"/><polygon points="38,34 46,30 46,40 38,44" fill="#5A3820"/></svg>`;
const ICO = {
  vender: `<svg viewBox="0 0 24 24"><path d="M3 9l2-5h14l2 5" fill="#E8D7A8" stroke="#C0392B" stroke-width="1.6"/><path d="M5 9v11h14V9" fill="#8A5A33"/><rect x="9" y="13" width="6" height="7" fill="#5A3820"/></svg>`,
  encargos: `<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="13" rx="2" fill="#B98A50" stroke="#6A4224" stroke-width="1.4"/><rect x="7" y="8" width="4" height="6" fill="#FBF8F1"/><rect x="13" y="8" width="4" height="6" fill="#FBF8F1"/><path d="M8 18v4M16 18v4" stroke="#7A5A2E" stroke-width="2"/></svg>`,
  construir: `<svg viewBox="0 0 24 24"><path d="M4 21l9-9" stroke="#C9A060" stroke-width="3.2" stroke-linecap="round"/><path d="M11 5l5-3 5 5-3 5-3-1-3 1-1-4z" fill="#AFB8BF" stroke="#5A646B" stroke-width="1.3"/></svg>`
};
const arte = k => A.arteDe(k);
/* Las cartas de la baraja sirven de respaldo para cultivos y plagas. */
const dibCultivo = c => arte("c_" + c) || A.dibujoCultivo(c);
const dibPlaga = c => arte("p_comun_" + c) || A.ilustracion({ k: "plaga", c, t: "comun" }, R.CULTIVO[c].hex);
const dibRemedio = c => arte("r_casero_" + c) || A.ilustracion({ k: "remedio", c, t: "casero" }, R.CULTIVO[c].hex);
const dibProducto = p => p === "huevos" ? (arte("pr_huevos") || `<span style="font-size:40px;line-height:1">🥚</span>`)
  : p === "cafe" && F.edificios.secadero ? (arte("pr_pergamino") || dibCultivo(p)) : dibCultivo(p);
/* Las ilustraciones conservan su forma (las matas son más altas que anchas);
   los dibujos de respaldo, cuadrados, se limitan para que no crezcan de más. */
const ancho = (html, w) => html.startsWith("<img")
  ? html.replace(/^<img\b/, `<img style="width:${w}px;height:auto"`)
  : html.replace(/^<(svg|span)\b/, `<$1 style="width:${w}px;height:auto;max-height:${Math.round(w * 1.25)}px"`);
const conMoneda = n => `<span class="precio">${MONEDA}${n}</span>`;
const plural = (n, [uno, varios]) => n + " " + (n === 1 ? uno : varios);
const mmss = ms => { const s = Math.ceil(ms / 1000); return s >= 60 ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") : s + " s"; };

/* ── El terreno ────────────────────────────────────────────── */
const W = 640, H = 420, OX = 320, OY = 150, AW = 80, AH = 40;
const centro = i => { const a = i % 3, b = Math.floor(i / 3); return [OX + (a - b) * AW, OY + (a + b) * AH]; };
const rombo = (x, y) => `${x},${y - AH} ${x + AW},${y} ${x},${y + AH} ${x - AW},${y}`;
const LUGARES = { casa: [124, 184], puesto: [520, 186], tablero: [606, 282], secadero: [88, 384], gallinero: [536, 414] };
function tierra() {
  let s = `<svg class="tierra" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path d="M304 300 C 290 350, 340 380, 300 ${H} L 360 ${H} C 380 380, 340 350, 340 300 Z" fill="#CDB27A" opacity=".9"/>`;
  for (let k = 0; k < 26; k++) { const x = (k * 97) % 620 + 10, y = (k * 53) % 400 + 10; s += `<circle cx="${x}" cy="${y}" r="3" fill="${["#FFE38A", "#F2A08A", "#FFFFFF"][k % 3]}" opacity=".8"/>`; }
  /* borde de tierra delante de los surcos */
  for (let k = 0; k < 3; k++) {
    let [x, y] = centro(2 + k * 3); s += `<polygon points="${x},${y + AH} ${x + AW},${y} ${x + AW},${y + 12} ${x},${y + AH + 12}" fill="#6B4424"/>`;
    [x, y] = centro(6 + k); s += `<polygon points="${x - AW},${y} ${x},${y + AH} ${x},${y + AH + 12} ${x - AW},${y + 12}" fill="#83552E"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const [x, y] = centro(i);
    s += `<polygon points="${rombo(x, y)}" fill="#8B5A2E" stroke="#6E4424" stroke-width="1.5"/>
      <path d="M${x - 46} ${y} L${x} ${y + 23} M${x - 23} ${y - 11.5} L${x + 23} ${y + 11.5} M${x} ${y - 23} L${x + 46} ${y}" stroke="#6A4120" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return s + `</svg>`;
}
function mataHTML(i) {
  const m = F.lotes[i], e = FI.estado(m, ahora());
  if (!e) return "";
  const [x, y] = centro(i);
  let dib, w;
  /* Tamaños en el terreno (cada surco mide 160 de ancho). La huerta es un
     cajón ancho y bajito; las demás, matas paradas. */
  const ancha = m.c === "huerta";
  if (e.muerta) { const d = arte("m_" + m.c + "_crece"); dib = d || SECA; w = d ? (ancha ? 124 : 74) : 60; }
  else if (e.etapa === 1) { dib = arte("m_semilla") || MONTICULO; w = arte("m_semilla") ? 72 : 56; }
  else if (e.etapa === 2) { dib = arte("m_brote") || BROTE; w = arte("m_brote") ? 76 : 58; }
  else if (e.etapa === 3) { const d = arte("m_" + m.c + "_crece"); dib = d || dibCultivo(m.c); w = d ? (ancha ? 124 : 80) : 62; }
  else { const d = arte("m_" + m.c + "_lista"); dib = d || dibCultivo(m.c); w = d ? (ancha ? 132 : 106) : 96; }
  const insignia = e.muerta ? "" : e.plagada ? `<span class="f-insignia plaga">${dibPlaga(m.c)}</span>`
    : e.etapa === 4 ? `<span class="f-insignia lista">✓</span>` : "";
  const reloj = e.muerta ? `<span class="f-reloj peligro">${e.muerta === "seca" ? "se secó" : "se marchitó"}</span>`
    : e.plagada ? `<span class="f-reloj peligro" data-muere="${e.muere}">${mmss(e.muere - ahora())}</span>`
    : e.etapa < 4 ? `<span class="f-reloj" data-lista="${m.t0 + m.dur}">${mmss(e.resta)}</span>` : "";
  return `<div class="f-mata ${e.muerta ? "seca" : e.plagada ? "plagada" : ""}" style="left:${x}px;top:${y + (arte("m_brote") ? 26 : 16)}px;z-index:${Math.round(y)}">
    ${reloj}<span class="dib" style="position:relative">${ancho(dib, w)}${insignia}</span></div>`;
}
/* La firma de lo que se ve: si no cambia, no se vuelve a pintar el terreno. */
const firma = () => F.lotes.map(m => { const e = FI.estado(m, ahora()); return e ? m.c + e.etapa + (e.plagada ? "p" : "") + (e.muerta || "") : "-"; }).join("|")
  + "|" + Object.keys(F.edificios).filter(k => F.edificios[k]).join() + "|" + FI.huevos(F, ahora());

function edificio(k, dib, w, extra) {
  const [x, y] = LUGARES[k], ilu = arte("b_" + k);
  return `<button class="f-obj toca" data-edificio="${k}" style="left:${x}px;top:${y}px;z-index:${y}" aria-label="${esc(k)}">
    <span style="position:relative">${ancho(ilu || dib, w)}${extra || ""}</span></button>`;
}
let ultimaFirma = "";
function pintarTerreno(forzar) {
  const f = firma();
  if (!forzar && f === ultimaFirma) return actualizarRelojes();
  ultimaFirma = f;
  const mundo = document.getElementById("mundo"); if (!mundo) return;
  const h = FI.huevos(F, ahora());
  mundo.innerHTML = tierra() +
    edificio("casa", CASA, arte("b_casa") ? 176 : 150) + edificio("puesto", PUESTO, arte("b_puesto") ? 128 : 118) + edificio("tablero", TABLERO, arte("b_tablero") ? 78 : 84) +
    (F.edificios.secadero ? edificio("secadero", SECADERO, arte("b_secadero") ? 140 : 118) : "") +
    (F.edificios.gallinero ? edificio("gallinero", GALLINERO, arte("b_gallinero") ? 118 : 104, h ? `<span class="f-insignia huevo">${arte("pr_huevos") ? ancho(arte("pr_huevos"), 30) : "🥚"}</span>` : "") : "") +
    F.lotes.map((_, i) => mataHTML(i)).join("") +
    F.lotes.map((_, i) => { const [x, y] = centro(i); return `<button class="f-lote" data-lote="${i}" style="left:${x}px;top:${y}px;z-index:1000" aria-label="Surco ${i + 1}"></button>`; }).join("");
  mundo.querySelectorAll("[data-lote]").forEach(b => b.onclick = () => tocarLote(+b.dataset.lote));
  mundo.querySelectorAll("[data-edificio]").forEach(b => b.onclick = () => tocarEdificio(b.dataset.edificio));
  pintarLado();
}
function actualizarRelojes() {
  const t = ahora();
  document.querySelectorAll("[data-lista]").forEach(r => { r.textContent = mmss(+r.dataset.lista - t); });
  document.querySelectorAll("[data-muere]").forEach(r => { r.textContent = mmss(+r.dataset.muere - t); });
}
function escalar() {
  const c = document.getElementById("campo"), m = document.getElementById("mundo"); if (!c || !m) return;
  const s = Math.min(c.clientWidth / W, c.clientHeight / H) * 0.98;
  m.style.transform = `translate(-50%,-50%) scale(${s})`;
}

/* ── La pantalla ───────────────────────────────────────────── */
function pintar() {
  app.innerHTML = `<div class="f-juego">
    <div class="f-lado" id="lado"></div>
    <div class="f-campo" id="campo"><div class="f-mundo" id="mundo"></div></div>
  </div>`;
  pintarTerreno(true);
  escalar();
}
function pintarLado() {
  const lado = document.getElementById("lado"); if (!lado) return;
  const n = FI.nivel(F), falta = FI.faltaXP(F), base = FI.NIVELES[n - 1], tope = FI.NIVELES[n];
  const pct = tope ? Math.round((F.xp - base) / (tope - base) * 100) : 100;
  const enBodega = Object.values(F.bodega).reduce((a, b) => a + b, 0);
  const listos = F.encargos.filter(e => FI.alcanza(F, e)).length;
  lado.innerHTML = `<div class="f-nivel"><span class="num">${n}</span><span class="txt"><span>Nivel ${n} de tu finca</span>
      <span class="xp"><i style="width:${pct}%"></i></span><small>${falta ? "Te faltan " + falta + " de experiencia" : "¡Nivel más alto por ahora!"}</small></span></div>
    <button class="f-acc" data-acc="vender">${ICO.vender}<span>Puesto</span>${enBodega ? `<span class="burbuja ok">${enBodega}</span>` : ""}</button>
    <button class="f-acc" data-acc="encargos">${ICO.encargos}<span>Encargos</span>${listos ? `<span class="burbuja">${listos}</span>` : ""}</button>
    <button class="f-acc" data-acc="construir">${ICO.construir}<span>Construir</span></button>`;
  lado.querySelector('[data-acc="vender"]').onclick = hojaVender;
  lado.querySelector('[data-acc="encargos"]').onclick = hojaEncargos;
  lado.querySelector('[data-acc="construir"]').onclick = hojaConstruir;
}

/* ── Hojas (ventanas de abajo) ─────────────────────────────── */
function cerrarHoja() { document.querySelectorAll(".f-hoja,.f-velo").forEach(x => x.remove()); }
function hoja(html) {
  cerrarHoja();
  const velo = document.createElement("div"); velo.className = "f-velo"; velo.onclick = cerrarHoja;
  const h = document.createElement("div"); h.className = "f-hoja"; h.setAttribute("role", "dialog");
  h.innerHTML = html + `<button class="boton f-cerrar" data-cerrar>Cerrar</button>`;
  h.querySelector("[data-cerrar]").onclick = cerrarHoja;
  document.body.append(velo, h);
  return h;
}
const hayHoja = () => !!document.querySelector(".f-hoja");

/* ── Monedas, avisos y efectos ─────────────────────────────── */
function cobrar(n) {
  if (V.gastar(n)) return true;
  V.efecto("error"); V.aviso("Te faltan monedas", "#FFB4A8");
  return false;
}
function flota(txt, el) {
  const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const f = document.createElement("div"); f.className = "f-flota"; f.textContent = txt;
  f.style.left = r.left + r.width / 2 + "px"; f.style.top = r.top + r.height / 3 + "px";
  document.body.appendChild(f); setTimeout(() => f.remove(), 1400);
}
const nodoLote = i => document.querySelector(`[data-lote="${i}"]`);
function subioNivel(n) {
  if (!n) return;
  V.efecto("victoria");
  const nuevos = FI.ORDEN.filter(c => FI.CULTIVOS[c].nivel === n).map(c => FI.CULTIVOS[c].nombre)
    .concat(Object.values(FI.EDIFICIOS).filter(b => b.nivel === n).map(b => b.nombre));
  V.premio({ titulo: "¡Nivel " + n + "!", cinta: "Mi finca", tono: "#4E8A2A",
    linea: nuevos.length ? "Se abrió: <b>" + nuevos.join(", ") + "</b>." : "Tu finca sigue creciendo.",
    arte: arte("b_casa") || CASA, botones: [["ok", "¡Bien!", true]] });
}

/* ── Toques ────────────────────────────────────────────────── */
function tocarLote(i) {
  const m = F.lotes[i], e = FI.estado(m, ahora());
  if (!e) return hojaSembrar(i);
  if (e.muerta) {
    FI.limpiar(F, i, ahora()); guardar(); V.efecto("descarte");
    V.aviso(e.muerta === "seca" ? "Arrancaste la mata seca" : "Arrancaste la mata marchita");
    return pintarTerreno(true);
  }
  if (e.plagada) return hojaPlaga(i);
  if (e.etapa === 4) {
    const r = FI.cosechar(F, i, ahora()); if (!r.ok) return;
    guardar(); V.efecto("certificar");
    flota("+" + plural(r.n, FI.CULTIVOS[r.c].cosa), nodoLote(i));
    pintarTerreno(true); subioNivel(r.subio);
    return;
  }
  V.aviso(FI.CULTIVOS[m.c].nombre + ": le falta " + mmss(e.resta));
}
function hojaSembrar(i) {
  const h = hoja(`<h3>¿Qué siembras?</h3><p>La semilla se paga con monedas. Crece aunque cierres el juego.</p>
    <div class="f-opciones">${FI.ORDEN.map(c => { const C = FI.CULTIVOS[c], abierto = FI.abierto(F, c);
      return `<button class="f-op" data-c="${c}" ${abierto ? "" : "disabled"}><span class="ilu">${dibCultivo(c)}</span><span><b>${C.nombre}</b>
        ${abierto ? `<small>${conMoneda(C.semilla)} · ${C.min} min</small><small>Da ${plural(C.da, C.cosa)}</small>` : `<small>🔒 Nivel ${C.nivel}</small>`}</span></button>`; }).join("")}</div>`);
  h.querySelectorAll("[data-c]").forEach(b => b.onclick = () => {
    const c = b.dataset.c, C = FI.CULTIVOS[c];
    if (V.granos() < C.semilla) { V.efecto("error"); V.aviso("Te faltan monedas", "#FFB4A8"); return; }
    const r = FI.sembrar(F, i, c, ahora());
    if (!r.ok) { V.aviso(r.motivo, "#FFB4A8"); return; }
    cobrar(r.costo); guardar(); cerrarHoja(); V.efecto("bajar");
    pintarTerreno(true);
  });
}
function hojaPlaga(i) {
  const m = F.lotes[i], C = FI.CULTIVOS[m.c], e = FI.estado(m, ahora());
  const h = hoja(`<h3>¡${esc(C.plaga)} en tu ${esc(C.nombre.toLowerCase())}!</h3>
    <p>Si no la curas, la mata se seca en <b data-muere="${e.muere}">${mmss(e.muere - ahora())}</b>.</p>
    <div class="f-opciones"><button class="f-op" data-curar><span class="ilu">${dibRemedio(m.c)}</span><span><b>Curar con ${esc(C.remedio)}</b>
      <small>${conMoneda(FI.REMEDIO)}</small></span></button></div>`);
  h.querySelector("[data-curar]").onclick = () => {
    if (V.granos() < FI.REMEDIO) { V.efecto("error"); V.aviso("Te faltan monedas", "#FFB4A8"); return; }
    const r = FI.curar(F, i, ahora()); if (!r.ok) { cerrarHoja(); return pintarTerreno(true); }
    cobrar(r.costo); guardar(); cerrarHoja(); V.efecto("curar"); V.aviso("¡Curada!", "#B6E07D");
    pintarTerreno(true);
  };
}
function hojaVender() {
  const prods = Object.keys(FI.PRODUCTOS).filter(p => F.bodega[p] > 0);
  const total = prods.reduce((a, p) => a + F.bodega[p] * FI.precio(F, p), 0);
  const h = hoja(`<h3>El puesto</h3><p>${prods.length ? "Lo que tienes en la bodega. En los encargos te pagan más." : "Tu bodega está vacía: cosecha algo y lo vendes aquí."}</p>
    <div class="f-opciones">${prods.map(p => { const P = FI.PRODUCTOS[p], n = F.bodega[p], pr = FI.precio(F, p);
      return `<button class="f-op" data-p="${p}"><span class="ilu">${dibProducto(p)}</span><span><b>${plural(n, P.cosa)}</b>
        <small>${conMoneda(pr)} c/u${p === "cafe" && F.edificios.secadero ? " · pergamino" : ""}</small><small>Vender: ${conMoneda(n * pr)}</small></span></button>`; }).join("")}</div>
    ${prods.length > 1 ? `<button class="jugar" data-todo style="margin-top:12px">Vender todo · ${total} monedas</button>` : ""}`);
  const vende = ps => { let g = 0; ps.forEach(p => { const r = FI.vender(F, p); if (r.ok) g += r.gana; });
    if (!g) return; V.sumar(g); guardar(); V.efecto("turno"); flota("+" + g + " monedas", document.getElementById("vCostal")); hojaVender(); pintarLado(); };
  h.querySelectorAll("[data-p]").forEach(b => b.onclick = () => vende([b.dataset.p]));
  const t = h.querySelector("[data-todo]"); if (t) t.onclick = () => vende(prods);
}
function hojaEncargos() {
  const t = ahora(), espera = Math.max(0, F.cambio + FI.CAMBIO_ENCARGO - t);
  const h = hoja(`<h3>Encargos de los vecinos</h3><p>Pagan más que el puesto y dan experiencia.</p>
    <div class="f-encargos">${F.encargos.map((e, k) => { const n = FI.cuenta(e.req), puede = FI.alcanza(F, e);
      return `<div class="f-encargo"><span class="ilu">${arte(e.clave) || dibCultivo(e.req[0])}</span>
        <span><b>${esc(e.nombre)}</b><br><small style="color:var(--tenue)">${esc(e.quien)} lo quiere</small></span>
        <span class="req">${Object.entries(n).map(([c, q]) => `<span class="${(F.bodega[c] || 0) >= q ? "" : "falta"}">${dibCultivo(c)}${F.bodega[c] || 0}/${q}</span>`).join("")}</span>
        <span class="bts"><button class="${puede ? "jugar" : "boton"}" data-entregar="${k}" ${puede ? "" : "disabled"} style="width:auto;padding:7px 14px;font-size:15px">Entregar · ${e.paga} monedas · +${e.xp}</button>
          <button class="boton" data-cambiar="${k}" ${espera ? "disabled" : ""} style="padding:6px 12px;font-size:13.5px">${espera ? "Cambiar en " + mmss(espera) : "Cambiar"}</button></span></div>`; }).join("")}</div>`);
  h.querySelectorAll("[data-entregar]").forEach(b => b.onclick = () => {
    const r = FI.entregar(F, +b.dataset.entregar); if (!r.ok) return;
    V.sumar(r.gana); guardar(); V.efecto("certificar"); flota("+" + r.gana + " monedas", document.getElementById("vCostal"));
    hojaEncargos(); pintarLado(); subioNivel(r.subio);
  });
  h.querySelectorAll("[data-cambiar]").forEach(b => b.onclick = () => {
    if (FI.cambiarEncargo(F, +b.dataset.cambiar, ahora()).ok) { guardar(); V.efecto("descarte"); hojaEncargos(); pintarLado(); }
  });
}
function hojaConstruir() {
  const n = FI.nivel(F);
  const h = hoja(`<h3>Construir</h3><p>Cada construcción le ayuda a tu finca.</p>
    <div class="f-opciones">${Object.entries(FI.EDIFICIOS).map(([k, B]) => { const ya = !!F.edificios[k], abierto = n >= B.nivel;
      return `<button class="f-op" data-b="${k}" ${ya || !abierto ? "disabled" : ""}><span class="ilu">${arte("b_" + k) || (k === "secadero" ? SECADERO : GALLINERO)}</span><span><b>${B.nombre}</b>
        <small>${esc(B.texto)}</small><small>${ya ? "✓ Ya lo tienes" : abierto ? conMoneda(B.costo) : "🔒 Nivel " + B.nivel}</small></span></button>`; }).join("")}</div>`);
  h.querySelectorAll("[data-b]").forEach(b => b.onclick = () => {
    const B = FI.EDIFICIOS[b.dataset.b];
    if (V.granos() < B.costo) { V.efecto("error"); V.aviso("Te faltan monedas", "#FFB4A8"); return; }
    const r = FI.construir(F, b.dataset.b, ahora()); if (!r.ok) { V.aviso(r.motivo, "#FFB4A8"); return; }
    cobrar(r.costo); guardar(); cerrarHoja(); V.efecto("cambio"); V.aviso("¡" + B.nombre + " listo!", "#F3D27A");
    pintarTerreno(true);
  });
}
function tocarEdificio(k) {
  if (k === "puesto") return hojaVender();
  if (k === "tablero") return hojaEncargos();
  if (k === "gallinero") {
    const r = FI.recoger(F, ahora());
    if (!r.ok) return V.aviso("Las gallinas están poniendo…");
    guardar(); V.efecto("bajar"); flota("+" + plural(r.n, ["huevo", "huevos"]), document.querySelector('[data-edificio="gallinero"]'));
    return pintarTerreno(true);
  }
  if (k === "secadero") return V.aviso("El café se vende como pergamino: vale más");
  if (k === "casa") return V.aviso("Tu casa · nivel " + FI.nivel(F));
}

/* ── Primera vez: la manito ────────────────────────────────── */
function guiar() {
  const $ = q => document.querySelector(q), L = 4;
  const estado = () => FI.estado(F.lotes[L], ahora());
  GUIA.iniciar([
    { objetivo: () => $("#vCostal"), texto: "¡Bienvenido a tu finca! Te regalamos " + REGALO + " monedas para empezar", ms: 3400 },
    { objetivo: () => nodoLote(L), texto: "Toca un surco para sembrar", hecho: () => hayHoja() || !!F.lotes[L] },
    { objetivo: () => $('[data-c="platano"]'), texto: "Siembra plátano", hecho: () => !!F.lotes[L] },
    { objetivo: () => nodoLote(L), texto: "Crece solo, aunque cierres el juego", ms: 3000 },
    { objetivo: () => nodoLote(L), texto: "Espera un momentico…", esperar: true, hecho: () => { const e = estado(); return !e || e.etapa === 4; } },
    { objetivo: () => nodoLote(L), texto: "¡Ya está! Tócalo para cosechar", hecho: () => F.cosechadas > 0 },
    { objetivo: () => $('[data-acc="encargos"]'), texto: "Los vecinos te hacen encargos", hecho: () => hayHoja() },
    { objetivo: () => $(".f-encargos"), texto: "Si tienes lo que piden, te pagan más que en el puesto", ms: 3400 },
    { alEmpezar: cerrarHoja, objetivo: () => $('[data-acc="vender"]'), texto: "O vende tu cosecha en el puesto", hecho: () => hayHoja() },
    { objetivo: () => $('[data-p="platano"]'), texto: "Vende tus plátanos", hecho: () => !F.bodega.platano },
    { alEmpezar: cerrarHoja, objetivo: () => $("#campo"), texto: "Ojo con las plagas: si no las curas a tiempo, la mata se seca", ms: 3800 }
  ], { alTerminar: () => GUIA.marcar("finca"), alSaltar: () => GUIA.marcar("finca") });
}

/* ── Arranque ──────────────────────────────────────────────── */
V.montar({ titulo: "Mi finca", volver: "vereda/index.html", escena: "mediodia" });
pintar();
V.cargarArte().then(() => pintarTerreno(true));
addEventListener("resize", escalar);
setInterval(() => pintarTerreno(false), 1000);
/* Si la cuenta trajo una finca de otro teléfono, se vuelve a leer. */
addEventListener("storage", ev => { if (ev.key === LLAVE) { F = cargar(); pintarTerreno(true); } });
if (window.GUIA && !GUIA.hecha("finca")) setTimeout(guiar, 500);
})();
