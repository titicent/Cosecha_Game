/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — La Galería (la plaza del pueblo): las reglas
   Subasta a sobre cerrado. En cada ronda sale un lote de cosecha y
   cada uno, en su teléfono, ofrece en secreto cuántas monedas da.
   Se destapan todas a la vez: la oferta más alta se lleva el lote y
   paga lo que ofreció. Si hay empate arriba, nadie lo compra y el lote
   se queda en la mesa para la ronda siguiente, junto con el nuevo.

   Al final, cada cultivo da puntos según cuántos juntes (entre más del
   mismo, mejor) y las monedas que sobren también cuentan.

   Lo usan el servidor (require) y el navegador (window.GALERIA).
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const CULTIVOS = ["cafe", "platano", "cacao", "cana"];
const NOMBRE = { cafe: "Café", platano: "Plátano", cacao: "Cacao", cana: "Caña" };
const COLOR = { cafe: "#C0392B", platano: "#4A8B3B", cacao: "#7B4B2A", cana: "#C9A227" };
const COSA = { cafe: ["Bulto de café", "Dos bultos de café"], platano: ["Racimo de plátano", "Dos racimos de plátano"],
  cacao: ["Costal de cacao", "Dos costales de cacao"], cana: ["Atado de caña", "Dos atados de caña"] };
/* Puntos por cultivo según cuántas unidades juntes: 1, 3, 6, 10, 15… */
const TABLA = [0, 1, 3, 6, 10, 15, 21, 28, 36];
const MONEDAS = 20, POR_MONEDA = 5;            /* cada 5 monedas que sobren, 1 punto */
const MIN_JUG = 2, MAX_JUG = 6;

function rnd0() { return Math.random(); }
function barajar(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* 16 lotes: de cada cultivo, tres sencillos y uno doble. Se juegan 12. */
function crearLotes(r) {
  const l = [];
  CULTIVOS.forEach(c => [1, 1, 1, 2].forEach((n, k) => l.push({ c, n, id: c + k })));
  return barajar(l, r || rnd0).slice(0, 12);
}
const nombreLote = x => COSA[x.c][x.n - 1];
const puntosCultivo = u => TABLA[Math.min(u, TABLA.length - 1)];
function puntos(j) {
  const cosecha = CULTIVOS.reduce((a, c) => a + puntosCultivo(j.bodega[c]), 0);
  return { cosecha, monedas: Math.floor(j.monedas / POR_MONEDA), total: cosecha + Math.floor(j.monedas / POR_MONEDA) };
}

function nueva(nombres, r) {
  const E = { r: r || rnd0, lotes: crearLotes(r), mesa: [], ronda: 0, fase: "pujando", historia: [],
    jugadores: nombres.map(nombre => ({ nombre, monedas: MONEDAS, bodega: { cafe: 0, platano: 0, cacao: 0, cana: 0 }, puja: null, fuera: false })),
    ultima: null, ganadores: null };
  sacar(E);
  return E;
}
function sacar(E) {
  const x = E.lotes.shift();
  if (x) E.mesa.push(x);
  E.ronda++;
  E.fase = E.mesa.length ? "pujando" : "fin";
  E.jugadores.forEach(j => { j.puja = null; });
  if (E.fase === "fin") terminar(E);
}
const faltan = E => E.jugadores.filter(j => !j.fuera && j.puja === null).length;
function pujar(E, i, monto) {
  const j = E.jugadores[i];
  if (E.fase !== "pujando" || !j || j.fuera || j.puja !== null) return false;
  monto = Math.floor(Number(monto));
  if (!Number.isFinite(monto) || monto < 0 || monto > j.monedas) return false;
  j.puja = monto;
  return true;
}
/* Destapa las ofertas. Los que no ofrecieron a tiempo ofrecen 0. */
function destapar(E) {
  if (E.fase !== "pujando") return null;
  E.jugadores.forEach(j => { if (j.puja === null) j.puja = 0; });
  const vivos = E.jugadores.map((j, i) => i).filter(i => !E.jugadores[i].fuera);
  const max = Math.max(...vivos.map(i => E.jugadores[i].puja));
  let arriba = vivos.filter(i => E.jugadores[i].puja === max);
  /* empate: se lo lleva quien tenga menos cosecha en la bodega */
  if (max > 0 && arriba.length > 1) {
    const u = i => CULTIVOS.reduce((a, c) => a + E.jugadores[i].bodega[c], 0);
    const min = Math.min(...arriba.map(u));
    arriba = arriba.filter(i => u(i) === min);
  }
  const lotes = E.mesa.slice();
  let ganador = null;
  if (max > 0 && arriba.length === 1) {
    ganador = arriba[0];
    const g = E.jugadores[ganador];
    g.monedas -= max;
    lotes.forEach(x => { g.bodega[x.c] += x.n; });
    E.mesa = [];
  } else if ((max === 0 && arriba.length === vivos.length) || !E.lotes.length) {
    /* nadie ofreció nada, o el empate fue en la última ronda: el lote se queda sin dueño */
    E.mesa = [];
  }
  E.ultima = { ronda: E.ronda, lotes, pujas: E.jugadores.map(j => j.puja), ganador, empate: max > 0 && arriba.length > 1, max };
  E.historia.push(E.ultima);
  E.fase = "revelado";
  return E.ultima;
}
function siguiente(E) { if (E.fase === "revelado") sacar(E); }
function terminar(E) {
  const tot = E.jugadores.map(j => (j.fuera ? -1 : puntos(j).total));
  const max = Math.max(...tot);
  let g = E.jugadores.map((_, i) => i).filter(i => tot[i] === max);
  if (g.length > 1) { const m = Math.max(...g.map(i => E.jugadores[i].monedas)); g = g.filter(i => E.jugadores[i].monedas === m); }
  E.ganadores = g;
}

/* ── Vecinos de la máquina ──────────────────────────────────── */
/* Lo que vale el lote para alguien: los puntos que le suma. */
function suma(j, lotes) {
  const b = Object.assign({}, j.bodega);
  lotes.forEach(x => { b[x.c] += x.n; });
  return CULTIVOS.reduce((a, c) => a + puntosCultivo(b[c]) - puntosCultivo(j.bodega[c]), 0);
}
function pujaBot(E, i, nivel) {
  const j = E.jugadores[i], r = E.r;
  const propio = suma(j, E.mesa);
  const otros = E.jugadores.filter((o, k) => k !== i && !o.fuera).map(o => suma(o, E.mesa));
  const quitar = otros.length ? Math.max(...otros) : 0;
  const quedan = E.lotes.length + 1;
  /* cuánto vale una moneda: si sobran monedas y quedan pocas rondas, casi nada */
  const precio = Math.max(0.6, Math.min(2.2, j.monedas / (quedan * 1.6)));
  const astucia = nivel === "novato" ? 0.2 : nivel === "baquiano" ? 0.55 : 0.4;
  let v = (propio + astucia * quitar) * precio;
  v *= 0.6 + r() * 0.8;
  let b = Math.round(v);
  if (quedan <= 1) b = Math.max(b, Math.min(j.monedas, Math.round(propio * 1.5)));
  return Math.max(0, Math.min(j.monedas, b));
}

const API = { CULTIVOS, NOMBRE, COLOR, COSA, TABLA, MONEDAS, POR_MONEDA, MIN_JUG, MAX_JUG,
  crearLotes, nombreLote, puntos, puntosCultivo, nueva, pujar, faltan, destapar, siguiente, suma, pujaBot };
raiz.GALERIA = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof self !== "undefined" ? self : globalThis);
