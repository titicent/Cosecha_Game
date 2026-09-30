/* Mide Espantos en la oscuridad: node simular-espantos.js [partidas] */
const S = require("./public/vereda/espantos.js");
const N = +process.argv[2] || 4000;
function azar(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* estrategias sencillas de una persona */
const PERSONA = {
  "se devuelve con 6": (E, i) => E.jugadores[i].lleva >= 6 ? "volver" : "seguir",
  "se devuelve con 12": (E, i) => E.jugadores[i].lleva >= 12 ? "volver" : "seguir",
  "se devuelve con 20": (E, i) => E.jugadores[i].lleva >= 20 ? "volver" : "seguir",
  "al 2.º espanto visto": (E, i) => Object.values(E.vistos).filter(v => v === 1).length >= 2 && E.jugadores[i].lleva > 0 ? "volver" : "seguir",
  "como un vecino": null
};
for (const nj of [3, 4, 5]) {
  console.log(`\n${nj} jugadores (tú + ${nj - 1} vecinos)`);
  for (const [nom, f] of Object.entries(PERSONA)) {
    let gana = 0, pasos = 0, noches = 0, espantadas = 0, puntos = 0, ganaBot = Array(4).fill(0), usos = Array(4).fill(0);
    for (let k = 0; k < N; k++) {
      const r = azar(k * 7 + nj);
      const E = S.nueva(Array.from({ length: nj }, (_, i) => "J" + i), { rnd: r });
      const temps = Array.from({ length: nj }, (_, i) => S.TEMPERAMENTOS[(i + k) % 4]);
      let guard = 0;
      while (!E.fin && guard++ < 500) {
        if (E.esperaNoche) { noches++; S.seguirNoche(E); continue; }
        const d = {};
        E.jugadores.forEach((j, i) => { if (!j.enCamino) return;
          d[i] = i === 0 && f ? f(E, i) : S.decideBot(E, i, temps[i], true); });
        pasos++;
        S.decidir(E, d);
      }
      noches++;
      espantadas += E.quitados.length;
      if (E.ganadores.includes(0)) gana += 1 / E.ganadores.length;
      E.ganadores.forEach(g => { if (g) ganaBot[S.TEMPERAMENTOS.indexOf(temps[g])] += 1 / E.ganadores.length; });
      puntos += E.jugadores[0].costal;
    }
    console.log(`  ${nom.padEnd(22)} gana ${Math.round(100 * gana / N)}% (parejo sería ${Math.round(100 / nj)}%) · ${(pasos / noches).toFixed(1)} decisiones por noche · ${Math.round(100 * espantadas / noches)}% noches espantadas · costal ${Math.round(puntos / N)}`
      + ` · vecinos que ganan: ${S.TEMPERAMENTOS.map((t, q) => t.nom + " " + Math.round(100 * ganaBot[q] / N) + "%").join(", ")}`);
  }
}
