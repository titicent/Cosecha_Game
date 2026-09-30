/* Mide La Galería: node simular-galeria.js [partidas] */
const G = require("./public/vereda/galeria-reglas.js");
const N = +process.argv[2] || 3000;
function azar(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const PERSONA = {
  "nunca ofrece": () => 0,
  "ofrece 1 siempre": (E, i) => Math.min(1, E.jugadores[i].monedas),
  "ofrece 3 siempre": (E, i) => Math.min(3, E.jugadores[i].monedas),
  "todo al primero": (E, i) => E.jugadores[i].monedas,
  "como un vecino": null,
  "vecino baquiano": "b"
};
for (const n of [3, 4, 6]) {
  console.log(`\n${n} jugadores`);
  for (const [nom, f] of Object.entries(PERSONA)) {
    let gana = 0, pts = 0, empates = 0, rondas = 0, sinDueno = 0, pago = 0, comp = 0;
    for (let k = 0; k < N; k++) {
      const r = azar(k * 11 + n), E = G.nueva(Array.from({ length: n }, (_, i) => "J" + i), r);
      while (E.fase !== "fin") {
        E.jugadores.forEach((j, i) => G.pujar(E, i, i === 0 && f && f !== "b" ? f(E, i) : G.pujaBot(E, i, i === 0 && f === "b" ? "baquiano" : "normal")));
        const u = G.destapar(E); rondas++; if (u.empate) empates++; if (u.ganador === null && !u.empate) sinDueno++;
        if (u.ganador !== null) { pago += u.max; comp++; }
        G.siguiente(E);
      }
      if (E.ganadores.includes(0)) gana += 1 / E.ganadores.length;
      pts += G.puntos(E.jugadores[0]).total;
    }
    console.log(`  ${nom.padEnd(18)} gana ${Math.round(100 * gana / N)}% (parejo ${Math.round(100 / n)}%) · puntos ${(pts / N).toFixed(1)} · empates ${Math.round(100 * empates / rondas)}% · sin dueño ${Math.round(100 * sinDueno / rondas)}% · precio medio ${(pago / comp).toFixed(1)}`);
  }
}
