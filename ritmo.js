/* Mide el ritmo de la partida y compara reglas alternativas.

       npm run ritmo

   Juega cientos de partidas con jugadores que siempre eligen la mejor jugada
   según el motor —los mismos criterios de los vecinos de la máquina— y cuenta
   cuánto tardan en terminar y, sobre todo, cuántas se ganan sin que los demás
   hayan tenido tiempo de reaccionar.

   Cada variante se juega sobre las MISMAS barajas, así que las diferencias
   vienen de la regla y no de la suerte.

   Las variantes se emulan aquí, sin tocar el motor, para poder compararlas
   antes de decidir cuál adoptar:
     instantanea  la regla vieja: completar la finca gana en el acto
     una_siembra  como la actual, pero solo se siembra una vez por turno
     siembra_2    sembrar cuesta los dos jornales: es la jugada del turno
     anunciada    LA REGLA ACTUAL: la finca completa gana al empezar tu
                  siguiente turno, si sigue completa (una vuelta para frenarla)
     una+anunc    una siembra por turno y cosecha anunciada
*/
const R = require("./public/reglas.js");

const VARIANTES = {
  instantanea: { unaSiembra:false, siembraCara:false, sostenida:false },
  una_siembra: { unaSiembra:true,  siembraCara:false, sostenida:false },
  siembra_2:   { unaSiembra:false, siembraCara:true,  sostenida:false },
  anunciada:   { unaSiembra:false, siembraCara:false, sostenida:true  },
  "una+anunc": { unaSiembra:true,  siembraCara:false, sostenida:true  }
};
/* La regla vieja, para poder compararla: ganaba en el acto cualquiera con la
   finca completa. El motor ya no la usa (ver «Cosecha anunciada» en reglas.js). */
const ganaVieja = E => {
  const i = E.jugadores.findIndex(j => R.lista(E, j));
  return i < 0 ? null : i;
};
const ES_SIEMBRA = t => t === "sembrar" || t === "injertar";

function partida(n, semilla, v, casual) {
  let rnd = semilla;
  const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
  /* baraja determinista: la misma semilla da la misma baraja en toda variante */
  const mazo = R.crearMazo(true, false);
  for (let i = mazo.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [mazo[i], mazo[k]] = [mazo[k], mazo[i]]; }
  const E = {
    jugadores: Array.from({ length: n }, (_, i) => ({ nombre: "J" + i, mano: [], finca: [], bonos: 0 })),
    mazo, descarte: [], retiradas: [], turno: 0, jornales: R.JORNALES_TURNO, sentido: 1,
    rondaPaso: 0, rebarajadas: 0, objetivo: n === 2 ? 5 : 4, metaCertificada: false,
    climaOn: true, registro: []
  };
  E.jugadores.forEach((_, i) => R.robar(E, i));

  const turnosDe = Array(n).fill(0), alEmpezar = Array(n).fill(0);
  let turnos = 0, sembroEsteTurno = false, primerTurnoDelJugador = true;

  const ganaAhora = () => v.sostenida ? null : ganaVieja(E);

  while (turnos < 4000) {
    if (R.tierraAgotada(E)) return { fin: "puntos", turnos, rondas: turnos / n };
    const ji = E.turno, yo = E.jugadores[ji];

    /* Victoria sostenida: se comprueba al empezar el turno del propio jugador. */
    if (primerTurnoDelJugador) {
      turnosDe[ji]++;
      if (v.sostenida && !yo.maldicion && R.logrados(E, yo) >= E.objetivo)
        return { fin: "finca", turnos, rondas: turnos / n, turnosGanador: turnosDe[ji] - 1, sinAviso: false };
      alEmpezar[ji] = R.logrados(E, yo);
      primerTurnoDelJugador = false;
      turnos++;
    }

    let op = [];
    yo.mano.forEach((c, idx) => R.jugadasLegales(E, ji, idx).forEach(j => op.push({ idx, j, c })));
    if (v.unaSiembra && sembroEsteTurno) op = op.filter(o => !ES_SIEMBRA(o.j.tipo));
    if (v.siembraCara) op = op.filter(o => !ES_SIEMBRA(o.j.tipo) || E.jornales >= 2);

    let finTurno = true;
    if (op.length) {
      op.sort((a, b) => R.puntuar(E, ji, b.c, b.j) - R.puntuar(E, ji, a.c, a.j));
      const el = (casual && rand() < 0.45) ? op[Math.floor(rand() * op.length)] : op[0];
      const r = R.aplicar(E, ji, el.idx, el.j, []);
      if (ES_SIEMBRA(el.j.tipo)) { sembroEsteTurno = true; if (v.siembraCara) E.jornales = 0; }
      const g = ganaAhora();
      if (g !== null) return { fin: "finca", turnos, rondas: turnos / n, turnosGanador: turnosDe[g],
        sinAviso: g === ji && alEmpezar[g] <= E.objetivo - 2 };
      finTurno = r.fin || E.jornales === 0;
    } else {
      E.descarte.push(...yo.mano.splice(0));
    }
    if (finTurno) {
      R.avanzarTurno(E);
      sembroEsteTurno = false; primerTurnoDelJugador = true;
      if (R.tocaClima(E)) R.aplicarClima(E);
      const g = ganaAhora();
      if (g !== null) return { fin: "finca", turnos, rondas: turnos / n, turnosGanador: turnosDe[g] };
    }
  }
  return { fin: "tope", turnos };
}

const PARTIDAS = Number(process.argv[2] || 400);
const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "—";

for (const casual of [false, true]) {
 console.log("\n  ══ jugadores " + (casual ? "CASUALES (casi la mitad de las veces no juegan lo mejor)" : "EXPERTOS (siempre la mejor jugada)") + " ══");
 for (const n of [2, 3, 4]) {
  console.log(`\n  ${n} jugadores · ${PARTIDAS} partidas por variante · base + Bonanza + clima`);
  console.log("  variante       finca  puntos  rondas(med)  gana sin aviso  gana en ≤3 turnos");
  for (const [nombre, v] of Object.entries(VARIANTES)) {
    const res = [];
    for (let p = 0; p < PARTIDAS; p++) res.push(partida(n, 7919 * (p + 1) + n, v, casual));
    const fin = res.filter(r => r.fin === "finca"), pts = res.filter(r => r.fin === "puntos");
    const rondas = res.filter(r => r.fin !== "tope").map(r => r.rondas);
    const sin = fin.filter(r => r.sinAviso).length;
    const rapid3 = fin.filter(r => r.turnosGanador <= 3).length;
    console.log("  " + nombre.padEnd(13) + pct(fin.length, res.length).padStart(6) +
      pct(pts.length, res.length).padStart(8) + String(mediana(rondas).toFixed(1)).padStart(13) +
      pct(sin, fin.length).padStart(16) + pct(rapid3, fin.length).padStart(19));
  }
 }
}
console.log(`
  «gana sin aviso»: de las ganadas por finca completa, cuántas las ganó alguien
  que empezó ese turno a dos matas o más de ganar. Nadie lo vio venir: la mesa
  nunca lo tuvo a una mata de la victoria, así que no hubo cómo frenarlo.
`);
