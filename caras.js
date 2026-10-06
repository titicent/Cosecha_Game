/* Caras (avatares) de los jugadores en el servidor.
   Hay seis caras, las mismas seis sillas de arte.js (a_aguadeno … a_machete).
   Cada persona trae la que eligió en el menú; si ya la tiene otra persona,
   le toca la primera libre. Los vecinos de la máquina nunca le quitan la cara
   a una persona: si un vecino tiene la que alguien pidió, el vecino se cambia. */
"use strict";
const N = 6;

const valida = c => Number.isInteger(c) && c >= 0 && c < N ? c : null;

function libre(lista, sin) {
  const usadas = new Set(lista.filter(j => j !== sin).map(j => j.cara));
  for (let k = 0; k < N; k++) if (!usadas.has(k)) return k;
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
