/* Compara Cosecha clásico con 2 jornales por turno (la regla actual) contra
   variantes de 1 jornal, sobre las MISMAS barajas.

       node ritmo-jornal.js [partidas]

   Variantes (se emulan aquí, sin tocar el motor):
     dos          la regla actual: 2 jornales; faena = 2, Jornal extra = 1 y da 2
     uno          1 jornal; toda carta cuesta 1, también las faenas.
                  Jornal extra da 2 (dos jugadas más); Consejo y Duende dejan 1.
     uno_je1      igual que «uno», pero el Jornal extra da 1 (una jugada más)
     uno_sinfaena 1 jornal y las faenas siguen costando 2: no se pueden jugar
                  (salvo el Jornal extra). Muestra por qué hay que bajarlas.
*/
const R = require("./public/reglas.js");

const VARIANTES = {
  dos:          { jornales: 2 },
  uno:          { jornales: 1, faenaUno: true, extra: 2 },
  uno_je1:      { jornales: 1, faenaUno: true, extra: 1 },
  uno_sinfaena: { jornales: 1, faenaUno: false, extra: 2 }
};

function partida(n, semilla, v, casual) {
  let rnd = semilla;
  const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
  const mazo = R.crearMazo(true, false);
  for (let i = mazo.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [mazo[i], mazo[k]] = [mazo[k], mazo[i]]; }
  const E = {
    jugadores: Array.from({ length: n }, (_, i) => ({ nombre: "J" + i, mano: [], finca: [], bonos: 0 })),
    mazo, descarte: [], retiradas: [], turno: 0, jornales: v.jornales, sentido: 1,
    rondaPaso: 0, rebarajadas: 0, objetivo: n === 2 ? 5 : 4, metaCertificada: false,
    climaOn: true, registro: []
  };
  E.jugadores.forEach((_, i) => R.robar(E, i));
  let turnos = 0, acciones = 0, faenas = 0, botadas = 0;

  /* Jugadas posibles: con la variante «faenaUno», una faena se puede jugar
     con el único jornal del turno. */
  const opciones = ji => {
    const yo = E.jugadores[ji], op = [];
    yo.mano.forEach((c, idx) => {
      const guarda = E.jornales;
      if (v.faenaUno && c.k === "faena" && E.jornales >= 1) E.jornales = Math.max(E.jornales, R.cuesta(c));
      R.jugadasLegales(E, ji, idx).forEach(j => op.push({ idx, j, c }));
      E.jornales = guarda;
    });
    return op;
  };

  while (turnos < 3000) {
    if (R.tierraAgotada(E)) {
      const p = R.porPuntos(E);
      return { fin: "puntos", turnos, rondas: turnos / n, ganador: p.empate ? -1 : p.quien, acciones, faenas, botadas };
    }
    const ji = E.turno, yo = E.jugadores[ji];
    turnos++;
    let sigue = true, enTurno = 0;
    while (sigue && enTurno < 8) {
      const op = opciones(ji);
      if (!op.length) {                   /* sin jugada: bota una carta (un jornal) y cierra */
        if (yo.mano.length) { E.descarte.push(yo.mano.shift()); botadas++; }
        break;
      }
      op.sort((a, b) => R.puntuar(E, ji, b.c, b.j) - R.puntuar(E, ji, a.c, a.j));
      const el = (casual && rand() < 0.45) ? op[Math.floor(rand() * op.length)] : op[0];
      const antes = E.jornales;
      if (v.faenaUno && el.c.k === "faena" && E.jornales < R.cuesta(el.c)) E.jornales = R.cuesta(el.c);
      const esExtra = el.c.k === "faena" && el.c.tr === "jornalExtra";
      const r = R.aplicar(E, ji, el.idx, el.j, []);
      if (esExtra && v.extra === 1) E.jornales -= 1;                  /* da uno en vez de dos */
      if (el.c.k === "faena") faenas++;
      acciones++; enTurno++;
      sigue = !r.fin && E.jornales > 0 && yo.mano.length > 0;
      void antes;
    }
    R.avanzarTurno(E);
    E.jornales = v.jornales;
    if (R.tocaClima(E)) R.aplicarClima(E);
    const g = R.ganador(E);
    if (g !== null) return { fin: "finca", turnos, rondas: turnos / n, ganador: g, acciones, faenas, botadas };
  }
  return { fin: "tope", turnos };
}

const PARTIDAS = Number(process.argv[2] || 600);
const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const filas = [];
for (const casual of [false, true]) {
  for (const n of [2, 3, 4]) {
    for (const [nombre, v] of Object.entries(VARIANTES)) {
      const res = [];
      for (let p = 0; p < PARTIDAS; p++) res.push(partida(n, 7919 * (p + 1) + n, v, casual));
      const ok = res.filter(r => r.fin !== "tope");
      const gana = Array(n).fill(0);
      ok.forEach(r => { if (r.ganador >= 0) gana[r.ganador]++; });
      filas.push({
        jugadores: casual ? "casuales" : "expertos", n, variante: nombre,
        finca: pct(ok.filter(r => r.fin === "finca").length, ok.length),
        rondas: +mediana(ok.map(r => r.rondas)).toFixed(1),
        accTurno: +(ok.reduce((a, r) => a + r.acciones, 0) / ok.reduce((a, r) => a + r.turnos, 0)).toFixed(2),
        accPartida: Math.round(mediana(ok.map(r => r.acciones))),
        faenas: +(ok.reduce((a, r) => a + r.faenas, 0) / ok.length).toFixed(1),
        botadasTurno: +(ok.reduce((a, r) => a + r.botadas, 0) / ok.reduce((a, r) => a + r.turnos, 0)).toFixed(2),
        puestos: gana.map(g => pct(g, ok.length)).join("/"),
        tope: res.length - ok.length
      });
    }
  }
}
console.table(filas);
require("fs").writeFileSync(process.argv[3] || "ritmo-jornal.json", JSON.stringify(filas, null, 1));
