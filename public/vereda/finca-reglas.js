/* ═══════════════════════════════════════════════════════════════
   MI FINCA — las reglas (diseño en MI-FINCA.md)
   Puro: no toca la pantalla ni el guardado, y cada función recibe la
   hora (`ahora`, en milisegundos) para que se pueda probar sin esperar.
   Las monedas no viven aquí: las funciones dicen cuánto cuesta o cuánto
   se gana, y la pantalla las cobra o las suma en el costal de La Vereda.

   Una mata se guarda como {c, t0, dur, plaga, muerta}:
     · t0 y dur: cuándo se sembró y cuánto tarda en estar lista;
     · plaga: {en, curada} si le va a llegar, null si no;
     · muerta: "seca" | "marchita" | null, que se calcula con la hora.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const MIN = 60000;

const CULTIVOS = {
  huerta:  { nombre: "Huerta",  nivel: 1, semilla: 2,  min: 1,  da: 2, cosa: ["canasto", "canastos"], precio: 2,  xp: 1, plaga: "Langosta",   remedio: "Jabón potásico" },
  platano: { nombre: "Plátano", nivel: 1, semilla: 5,  min: 3,  da: 2, cosa: ["racimo", "racimos"],   precio: 5,  xp: 2, plaga: "Sigatoka",   remedio: "Ceniza" },
  cafe:    { nombre: "Café",    nivel: 2, semilla: 15, min: 12, da: 3, cosa: ["bulto", "bultos"],     precio: 10, xp: 6, plaga: "Broca",      remedio: "Caldo bordelés" },
  cana:    { nombre: "Caña",    nivel: 3, semilla: 8,  min: 6,  da: 3, cosa: ["atado", "atados"],     precio: 5,  xp: 4, plaga: "Barrenador", remedio: "Melaza trampa" },
  cacao:   { nombre: "Cacao",   nivel: 4, semilla: 12, min: 20, da: 2, cosa: ["costal", "costales"],  precio: 13, xp: 6, plaga: "Monilia",    remedio: "Poda y sellado" }
};
const ORDEN = ["huerta", "platano", "cafe", "cana", "cacao"];
const PRODUCTOS = Object.assign({ huevos: { nombre: "Huevos", cosa: ["huevo", "huevos"], precio: 3 } },
  Object.fromEntries(ORDEN.map(c => [c, { nombre: CULTIVOS[c].nombre, cosa: CULTIVOS[c].cosa, precio: CULTIVOS[c].precio }])));
const EDIFICIOS = {
  secadero:  { nombre: "Secadero",  nivel: 2, costo: 50, texto: "El café se vende como café pergamino: vale la mitad más." },
  gallinero: { nombre: "Gallinero", nivel: 3, costo: 70, texto: "Cada 4 minutos deja 2 huevos.", cada: 4 * MIN, pone: 2, tope: 6 }
};
const NIVELES = [0, 15, 40, 80, 140];          /* experiencia para llegar a cada nivel */
const REMEDIO = 3, PROB_PLAGA = 0.25, LOTES = 9;
const PRIMER_PLATANO = 20000;                  /* el de la partida guiada */
/* Los encargos usan las comidas de Pedidos del pueblo, con sus ilustraciones. */
const ENCARGOS = [
  ["e_maduro", "Maduro", ["platano"]], ["e_guarapo", "Guarapo", ["cana"]], ["e_panela", "Panela", ["cana", "cana"]],
  ["e_patacones", "Patacones", ["platano", "platano"]], ["e_colada_platano", "Colada de plátano", ["platano", "cana"]],
  ["e_tinto_campesino", "Tinto campesino", ["cafe", "cafe"]], ["e_tinto_panela", "Tinto con panela", ["cafe", "cana"]],
  ["e_chocolatina", "Chocolatina", ["cacao", "cacao"]], ["e_chocolate_santafereno", "Chocolate santafereño", ["cacao", "cana"]],
  ["e_platano_chocolate", "Plátano con chocolate", ["platano", "cacao"]], ["e_cafe_chocolate", "Café con chocolate", ["cafe", "cacao"]],
  ["e_mercado_campesino", "Mercado campesino", ["cafe", "platano", "cana"]], ["e_desayuno_paisa", "Desayuno paisa", ["cafe", "platano", "cacao"]],
  ["e_canasta_completa", "Canasta completa", ["cafe", "platano", "cacao", "cana"]]
].map(([clave, nombre, req]) => ({ clave, nombre, req }));
/* Ilustraciones propias de la finca (GUIA-ILUSTRACIONES.md). Mientras no
   existan, la pantalla usa los dibujos de las cartas. */
const ARTE = ["m_semilla", "m_brote", ...ORDEN.flatMap(c => ["m_" + c + "_crece", "m_" + c + "_lista"]),
  "b_casa", "b_puesto", "b_tablero", "b_secadero", "b_gallinero", "pr_huevos", "pr_pergamino",
  "t_surco",      /* el surco pintado reemplaza al dibujado */
  "d_guamo", "d_platanera", "d_cafetal", "d_arbusto", "d_piedras", "d_flores", "d_cerca_a", "d_cerca_b", "d_letrero"];
const VECINOS = ["Doña Rosa", "Don Aurelio", "La señora Inés", "Don Chepe", "Doña Marina", "El profe Julián"];
const CAMBIO_ENCARGO = 5 * MIN;

/* ── Estado ────────────────────────────────────────────────── */
function nueva(ahora, rnd) {
  const r = rnd || Math.random;
  const F = { v: 1, id: Math.floor(r() * 1e12).toString(36) + (ahora || 0).toString(36), creada: ahora, xp: 0,
    lotes: Array(LOTES).fill(null), bodega: Object.fromEntries(Object.keys(PRODUCTOS).map(k => [k, 0])),
    edificios: { secadero: null, gallinero: null }, encargos: [], cambio: 0, primera: true,
    cosechadas: 0, ayudas: [] };
  llenarEncargos(F, r);
  return F;
}
const nivelDe = xp => NIVELES.reduce((n, umbral, i) => xp >= umbral ? i + 1 : n, 1);
const nivel = F => nivelDe(F.xp);
const faltaXP = F => { const n = nivel(F); return n >= NIVELES.length ? null : NIVELES[n] - F.xp; };
const abierto = (F, c) => nivel(F) >= CULTIVOS[c].nivel;

/* Cuánto aguanta una mata plagada antes de secarse, y una lista antes de marchitarse. */
const ventanaPlaga = m => Math.max(MIN, m.dur / 2);
const ventanaLista = m => m.dur * 2 + 5 * MIN;

/* Cómo está una mata a esta hora. etapa: 1 semilla, 2 brote, 3 creciendo, 4 lista. */
function estado(m, ahora) {
  if (!m) return null;
  const crecido = Math.min(1, (ahora - m.t0) / m.dur);
  const etapa = crecido >= 1 ? 4 : crecido >= .6 ? 3 : crecido >= .25 ? 2 : 1;
  const plagada = !!(m.plaga && !m.plaga.curada && ahora >= m.plaga.en);
  let muerta = m.muerta || null, muere = null;
  if (!muerta && plagada) { muere = m.plaga.en + ventanaPlaga(m); if (ahora >= muere) muerta = "seca"; }
  if (!muerta && !plagada) { const fin = m.t0 + m.dur + ventanaLista(m); if (etapa === 4) muere = fin; if (ahora >= fin) muerta = "marchita"; }
  return { etapa, crecido, plagada, muerta, resta: Math.max(0, m.t0 + m.dur - ahora), muere: muerta ? null : muere };
}

/* ── Jugadas ───────────────────────────────────────────────── */
function sembrar(F, i, c, ahora, rnd) {
  const r = rnd || Math.random, C = CULTIVOS[c];
  if (!C || F.lotes[i] || i < 0 || i >= F.lotes.length) return { ok: false, motivo: "Ese surco no está libre" };
  if (!abierto(F, c)) return { ok: false, motivo: C.nombre + " se abre en el nivel " + C.nivel };
  const m = { c, t0: ahora, dur: C.min * MIN, plaga: null, muerta: null };
  if (F.primera && c === "platano") { m.dur = PRIMER_PLATANO; F.primera = false; }
  else if (r() < PROB_PLAGA) m.plaga = { en: ahora + m.dur * (0.2 + r() * 0.5), curada: false };
  F.lotes[i] = m;
  return { ok: true, costo: C.semilla };
}
function curar(F, i, ahora) {
  const m = F.lotes[i], e = estado(m, ahora);
  if (!e || e.muerta || !e.plagada) return { ok: false, motivo: "Esa mata no tiene plaga" };
  m.plaga.curada = true;
  return { ok: true, costo: REMEDIO };
}
function cosechar(F, i, ahora) {
  const m = F.lotes[i], e = estado(m, ahora);
  if (!e || e.muerta) return { ok: false, motivo: "No hay nada que cosechar" };
  if (e.plagada) return { ok: false, motivo: "Primero cúrala" };
  if (e.etapa < 4) return { ok: false, motivo: "Todavía no está lista" };
  const C = CULTIVOS[m.c], antes = nivel(F);
  F.lotes[i] = null; F.bodega[m.c] += C.da; F.xp += C.xp; F.cosechadas++;
  return { ok: true, c: m.c, n: C.da, xp: C.xp, subio: nivel(F) > antes ? nivel(F) : null };
}
function limpiar(F, i, ahora) {
  const e = estado(F.lotes[i], ahora);
  if (!e || !e.muerta) return { ok: false };
  F.lotes[i] = null;
  return { ok: true };
}
const precio = (F, p) => p === "cafe" && F.edificios.secadero ? Math.round(PRODUCTOS.cafe.precio * 1.5) : PRODUCTOS[p].precio;
function vender(F, p, n) {
  n = Math.min(n == null ? F.bodega[p] : n, F.bodega[p] || 0);
  if (!PRODUCTOS[p] || n <= 0) return { ok: false };
  F.bodega[p] -= n;
  return { ok: true, gana: n * precio(F, p) };
}
function construir(F, k, ahora) {
  const B = EDIFICIOS[k];
  if (!B || F.edificios[k]) return { ok: false, motivo: "Ya lo tienes" };
  if (nivel(F) < B.nivel) return { ok: false, motivo: B.nombre + " se abre en el nivel " + B.nivel };
  F.edificios[k] = { desde: ahora };
  return { ok: true, costo: B.costo };
}
/* Huevos listos en el gallinero, y recogerlos. */
function huevos(F, ahora) {
  const g = F.edificios.gallinero, B = EDIFICIOS.gallinero;
  return g ? Math.min(B.tope, Math.floor((ahora - g.desde) / B.cada) * B.pone) : 0;
}
function recoger(F, ahora) {
  const n = huevos(F, ahora), g = F.edificios.gallinero, B = EDIFICIOS.gallinero;
  if (!n) return { ok: false };
  g.desde = n >= B.tope ? ahora : g.desde + (n / B.pone) * B.cada;
  F.bodega.huevos += n;
  return { ok: true, n };
}

/* ── Encargos ──────────────────────────────────────────────── */
function encargoNuevo(F, r) {
  const ya = new Set(F.encargos.map(e => e.clave));
  const posibles = ENCARGOS.filter(e => e.req.every(c => abierto(F, c)));
  const nuevos = posibles.filter(e => !ya.has(e.clave));
  /* Al principio hay pocos encargos posibles: entonces se repiten, con otro vecino. */
  const pool = nuevos.length ? nuevos : posibles.length ? posibles : ENCARGOS.slice(0, 1);
  const base = pool[Math.floor(r() * pool.length)];
  const valor = base.req.reduce((a, c) => a + precio(F, c), 0);
  return { clave: base.clave, nombre: base.nombre, req: base.req.slice(), quien: VECINOS[Math.floor(r() * VECINOS.length)],
    paga: Math.round(valor * 1.5) + 2, xp: base.req.length * 3 };
}
function llenarEncargos(F, rnd) {
  const r = rnd || Math.random;
  while (F.encargos.length < 3) F.encargos.push(encargoNuevo(F, r));
}
function cuenta(req) { const n = {}; req.forEach(c => { n[c] = (n[c] || 0) + 1; }); return n; }
const alcanza = (F, e) => Object.entries(cuenta(e.req)).every(([c, n]) => (F.bodega[c] || 0) >= n);
function entregar(F, k, rnd) {
  const e = F.encargos[k];
  if (!e || !alcanza(F, e)) return { ok: false, motivo: "Te falta cosecha para este encargo" };
  const antes = nivel(F);
  e.req.forEach(c => { F.bodega[c]--; });
  F.xp += e.xp;
  F.encargos.splice(k, 1); llenarEncargos(F, rnd);
  return { ok: true, gana: e.paga, xp: e.xp, subio: nivel(F) > antes ? nivel(F) : null };
}
function cambiarEncargo(F, k, ahora, rnd) {
  if (ahora - F.cambio < CAMBIO_ENCARGO || !F.encargos[k]) return { ok: false, espera: Math.max(0, F.cambio + CAMBIO_ENCARGO - ahora) };
  F.cambio = ahora;
  F.encargos.splice(k, 1); llenarEncargos(F, rnd);
  return { ok: true };
}

/* Resumen para el mapa de La Vereda y el menú. */
function avisos(F, ahora) {
  const out = { listas: 0, plagas: 0, muertas: 0, creciendo: 0, huevos: huevos(F, ahora) };
  F.lotes.forEach(m => { const e = estado(m, ahora); if (!e) return;
    if (e.muerta) out.muertas++; else if (e.plagada) out.plagas++; else if (e.etapa === 4) out.listas++; else out.creciendo++; });
  return out;
}

/* ── La autopista para los vecinos (parte 3) ───────────────── */
/* Lo que un vecino ve de tu finca: matas y construcciones; ni bodega ni monedas. */
function vistaPublica(F, ahora, quien) {
  return { v: 1, id: F.id, nombre: quien && quien.nombre || "", cara: quien && quien.cara, nivel: nivel(F),
    lotes: F.lotes.map(m => { const e = estado(m, ahora); return e ? { c: m.c, etapa: e.etapa, plagada: e.plagada && !e.muerta, muerta: e.muerta } : null; }),
    edificios: Object.keys(EDIFICIOS).filter(k => F.edificios[k]), hora: ahora };
}
/* Un vecino cura una plaga de tu finca: no te cuesta nada y él gana monedas. */
const PREMIO_AYUDA = 3;
function ayudar(F, i, quien, ahora) {
  const m = F.lotes[i], e = estado(m, ahora);
  if (!e || e.muerta || !e.plagada) return { ok: false };
  m.plaga.curada = true;
  F.ayudas.push({ quien: String(quien || "Un vecino").slice(0, 30), i, c: m.c, t: ahora });
  if (F.ayudas.length > 20) F.ayudas.shift();
  return { ok: true, premio: PREMIO_AYUDA };
}

const API = { MIN, ARTE, CULTIVOS, ORDEN, PRODUCTOS, EDIFICIOS, NIVELES, REMEDIO, PROB_PLAGA, LOTES, ENCARGOS, CAMBIO_ENCARGO, PREMIO_AYUDA,
  nueva, nivel, nivelDe, faltaXP, abierto, estado, ventanaPlaga, ventanaLista, sembrar, curar, cosechar, limpiar, precio, vender,
  construir, huevos, recoger, llenarEncargos, alcanza, cuenta, entregar, cambiarEncargo, avisos, vistaPublica, ayudar };
raiz.FINCA = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof self !== "undefined" ? self : globalThis);
