/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — El acertijo del mayordomo: motor de acertijos
   Arma una mesa de Cosecha a medio jugar, con tu finca, la de los
   vecinos y una mano, y la resuelve con el mismo motor del juego
   (REGLAS.jugadasLegales y REGLAS.aplicar). Solo se aceptan
   acertijos que tienen solución y en los que casi todas las jugadas
   que parecen buenas no sirven.

   El acertijo del día sale de una semilla con la fecha: todos los
   teléfonos del mundo reciben el mismo ese día.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const R = raiz.REGLAS || (typeof require === "function" ? require("../reglas.js") : null);

const CINCO = ["cafe", "platano", "cacao", "cana", "huerta"];
const VECINOS = ["Caturra", "Borbón", "Típica", "Castillo", "Tabi", "Geisha"];
const NIVELES = [null,
  { n: 1, nom: "Fácil", nota: "Tres cartas y un vecino", mano: 3, vecinos: 1, minimo: 2, salidas: 3, granos: 8 },
  { n: 2, nom: "Medio", nota: "Faenas, bioinsumos y plagas resistentes", mano: 4, vecinos: 1, minimo: 2, salidas: 2, granos: 15 },
  { n: 3, nom: "Difícil", nota: "Espantos, dos vecinos y a veces hay que frenar a uno", mano: 5, vecinos: 2, minimo: 2, salidas: 1, granos: 25 }
];

/* ── Estado ─────────────────────────────────────────────────── */
const clonar = E => JSON.parse(JSON.stringify(E));
const lista = (E, j) => R.lista(E, E.jugadores[j]);
function cumple(E, meta) {
  if (!lista(E, 0)) return false;
  if (meta.frenar) for (let j = 1; j < E.jugadores.length; j++) if (lista(E, j)) return false;
  return true;
}
const firma = E => E.jornales + "|" + E.jugadores.map(j =>
  (j.maldicion ? "M" : "") + j.finca.map(o => o.carta.c + ":" + o.remedios.map(x => (x.t || x.tr) + x.c).join(",") + ":" +
    o.plagas.map(x => (x.t || x.tr) + x.c).join(",")).sort().join(";") + "/" + j.mano.map(c => c.id).sort().join(",")).join("#");

/* Todas las jugadas posibles de quien juega (siempre el 0), con la carta por id. */
function jugadas(E) {
  const out = [];
  if (!(E.jornales > 0)) return out;
  E.jugadores[0].mano.forEach((c, idx) => R.jugadasLegales(E, 0, idx).forEach(j => out.push({ id: c.id, idx, jugada: j })));
  return out;
}
function aplicarPaso(E, paso) {
  const F = clonar(E);
  const idx = F.jugadores[0].mano.findIndex(c => c.id === paso.id);
  R.aplicar(F, 0, idx, paso.jugada, []);
  return F;
}

/* Busca la solución más corta (en número de cartas) con búsqueda en
   profundidad creciente. Devuelve {pasos} o null. */
function resolver(E, meta, tope) {
  if (cumple(E, meta)) return { pasos: [] };
  const maxD = tope || 5;
  for (let d = 1; d <= maxD; d++) {
    const malos = new Set();
    const r = dfs(E, meta, d, malos);
    if (r) return { pasos: r };
  }
  return null;
}
function dfs(E, meta, d, malos) {
  if (d === 0) return null;
  const k = d + "~" + firma(E);
  if (malos.has(k)) return null;
  for (const p of jugadas(E)) {
    const F = aplicarPaso(E, p);
    if (cumple(F, meta)) return [p];
    const r = dfs(F, meta, d - 1, malos);
    if (r) return [p, ...r];
  }
  malos.add(k);
  return null;
}
/* Cuántas combinaciones distintas de cartas ganan en d jugadas (el orden no
   cuenta: sembrar café y luego cacao es lo mismo que al revés). Entre menos,
   más acertijo. */
function salidas(E, meta, d) {
  const combos = new Set();
  (function ir(S, prof, usadas) {
    if (prof === 0) return;
    for (const p of jugadas(S)) {
      const F = aplicarPaso(S, p), u = usadas.concat(p.id + ":" + p.jugada.tipo);
      if (cumple(F, meta)) combos.add(u.slice().sort().join("|"));
      else ir(F, prof - 1, u);
    }
  })(E, d, []);
  return combos.size;
}

/* ── Generador ──────────────────────────────────────────────── */
function generar(nivel, r) {
  const N = NIVELES[nivel];
  const al = a => a[Math.floor(r() * a.length)];
  const mezcla = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  let serie = 0;
  const C = (k, c, t, tr) => { const x = { id: "a" + (serie++), m: "base", k }; if (c) x.c = c; if (t) x.t = t; if (tr) x.tr = tr; return x; };
  const entra = o => o.carta.c === "injerto" ? "huerta" : r() < .72 ? (o.carta.c === "huerta" ? al(CINCO) : o.carta.c) : "huerta";

  function mata(c, estados) {
    const o = { carta: C("cultivo", c), remedios: [], plagas: [] };
    if (c === "vivero") return o;
    const e = al(estados);
    if (e === "protegido") o.remedios.push(C("remedio", entra(o), "casero"));
    if (e === "certificado") { o.remedios.push(C("remedio", entra(o), "casero")); o.remedios.push(C("remedio", entra(o), "casero")); }
    if (e === "plagado") o.plagas.push(C("plaga", entra(o), nivel >= 2 && r() < .35 ? "resistente" : "comun"));
    return o;
  }
  const cultivosPosibles = nivel >= 2 ? [...CINCO, "vivero"] : CINCO;
  function finca(n, estados) { return mezcla(cultivosPosibles).slice(0, n).map(c => mata(c, estados)); }

  const yo = { nombre: "Tú", mano: [], finca: finca(2 + Math.floor(r() * 3), ["sano", "sano", "protegido", "plagado", "plagado", "certificado"]), bonos: 0 };
  const vecinos = mezcla(VECINOS).slice(0, N.vecinos).map(nom => ({ nombre: nom, mano: [], bonos: 0,
    finca: finca(2 + Math.floor(r() * 3), ["sano", "sano", "protegido", "plagado", "certificado"]) }));
  const meta = { frenar: false };
  /* En el difícil, a veces un vecino ya tiene la finca lista y hay que frenarlo. */
  if (nivel === 3 && r() < .45) {
    meta.frenar = true;
    const v = vecinos[0];
    v.finca = mezcla(CINCO).slice(0, 4).map(c => mata(c, ["sano", "sano", "protegido", "certificado"]));
    if (v.finca.every(o => R.certificado(o))) v.finca[0].remedios = [];
  }
  if (nivel === 3 && r() < .2) yo.maldicion = C("faena", null, null, "madremonte");

  /* La mano: sobre todo cartas que parecen útiles, con alguna trampa. */
  const tipos = ["cultivo", "cultivo", "plaga", "remedio", "remedio"];
  if (nivel >= 2) tipos.push("faena", "faena");
  if (nivel >= 3) tipos.push("espanto", "espanto");
  const FAENAS2 = ["saqueo", "trueque", "erradicacion", "jornalExtra", "propagacion"];
  const FAENAS3 = [...FAENAS2, "lindero", "patasola", "llorona", "mohan_cafe", "mohan_platano", "mohan_cacao", "mohan_cana"];
  const colorCerca = () => r() < .65 ? (() => { const todas = [...yo.finca, ...vecinos.flatMap(v => v.finca)].filter(o => o.carta.c !== "vivero");
    return todas.length ? entra(al(todas)) : al(CINCO); })() : al(CINCO);
  for (let i = 0; i < N.mano; i++) {
    const t = al(tipos);
    if (t === "cultivo") yo.mano.push(C("cultivo", nivel >= 3 && r() < .1 ? "injerto" : al(nivel >= 2 && r() < .12 ? ["vivero"] : CINCO)));
    else if (t === "plaga") yo.mano.push(C("plaga", colorCerca(), nivel >= 2 && r() < .3 ? "resistente" : "comun"));
    else if (t === "remedio") yo.mano.push(C("remedio", colorCerca(), nivel >= 2 && r() < .35 ? "bioinsumo" : "casero"));
    else if (t === "faena") yo.mano.push(C("faena", null, null, al(FAENAS2)));
    else yo.mano.push(C("faena", null, null, al(FAENAS3)));
  }
  const E = { jugadores: [yo, ...vecinos], mazo: [], descarte: [], retiradas: [], turno: 0, jornales: 2, sentido: 1,
    rondaPaso: 0, rebarajadas: 0, climaOn: false, objetivo: 4, metaCertificada: false, registro: [] };
  return { E, meta };
}

/* Genera hasta dar con un acertijo que valga la pena. */
function crear(nivel, r, intentos) {
  const N = NIVELES[nivel];
  let mejor = null;
  for (let i = 0; i < (intentos || 2500); i++) {
    const { E, meta } = generar(nivel, r);
    if (cumple(E, meta)) continue;
    const sol = resolver(E, meta, 4);
    if (!sol || sol.pasos.length < N.minimo) continue;
    const total = jugadas(E).length;
    if (total < 4) continue;
    /* Que no sea solo sembrar: del medio en adelante, algo más tiene que pasar. */
    const tipos = sol.pasos.map(p => p.jugada.tipo);
    if (nivel >= 2 && tipos.every(t => t === "sembrar")) continue;
    if (nivel === 3 && !meta.frenar && !E.jugadores[0].maldicion &&
        !sol.pasos.some(p => E.jugadores[0].mano.find(c => c.id === p.id).k === "faena")) continue;
    const s = salidas(E, meta, sol.pasos.length);
    const cand = { E, meta, solucion: sol.pasos, salidas: s, opciones: total, nivel };
    if (s <= N.salidas) return cand;
    if (!mejor || s < mejor.salidas) mejor = cand;
  }
  return mejor;
}

const API = { NIVELES, VECINOS, crear, generar, resolver, salidas, cumple, jugadas, aplicarPaso, clonar, lista, firma };
raiz.ACERTIJOS = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof self !== "undefined" ? self : globalThis);
