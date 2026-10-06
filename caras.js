/* Caras (avatares) de los jugadores en el servidor.
   Las caras son las sillas de arte.js (a_aguadeno, a_carriel…). Solo se dan
   las abiertas; las de las regiones con candado aún no se pueden usar.
   Cada persona trae la que eligió en el menú; si ya la tiene otra persona,
   le toca la primera libre. Los vecinos de la máquina nunca le quitan la cara
   a una persona: si un vecino tiene la que alguien pidió, el vecino se cambia. */
"use strict";
const { SILLAS } = require("./public/arte.js");
const N = SILLAS.length;
const ABIERTAS = SILLAS.map((s, k) => s.abierta ? k : -1).filter(k => k >= 0);

const valida = c => Number.isInteger(c) && c >= 0 && c < N && SILLAS[c].abierta ? c : null;

function libre(lista, sin) {
  const usadas = new Set(lista.filter(j => j !== sin).map(j => j.cara));
  for (const k of ABIERTAS) if (!usadas.has(k)) return k;
  return 0;
}

/* Le pone cara a `nuevo`, que ya está en `lista`. */
function asignar(lista, nuevo, pedida) {
  const p = valida(pedida);
  if (p !== null && !nuevo.bot) {
    const otro = lista.find(j => j !== nuevo && j.cara === p);
    if (!otro) { nuevo.cara = p; return p; }
    if (otro.bot) { nuevo.cara = p; otro.cara = libre(lista, otro); return p; }
  }
  nuevo.cara = libre(lista, nuevo);
  return nuevo.cara;
}

module.exports = { asignar, N };
