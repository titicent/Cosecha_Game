/* Pruebas de La Vereda (los mini juegos). Corren sin navegador:

       npm run test:vereda

   · El color manda: la respuesta sale del motor y la explicación coincide.
   · El acertijo: todo acertijo que se genera tiene solución, y el del día
     es el mismo en todos los teléfonos.
   · El álbum: las 45 láminas existen y cada una trae su dato real.
   · Nada de vocabulario de otros juegos en los textos de la vereda. */
const fs = require("fs"), path = require("path");
globalThis.REGLAS = require("./public/reglas.js");
globalThis.ARTE = require("./public/arte.js");
require("./public/vereda/nucleo.js");
const R = globalThis.REGLAS, V = globalThis.VEREDA;
const C = require("./public/vereda/colores.js");
const Q = require("./public/vereda/acertijos.js");

let fallos = 0;
const ok = (c, m) => { if (c) console.log("   ✓ " + m); else { fallos++; console.log("   ✗ " + m); } };

console.log("\nEl color manda");
for (const n of [1, 2, 3]) {
  let malas = 0, si = 0;
  for (let i = 0; i < 3000; i++) {
    const q = C.pregunta(n, Math.random);
    if (q.si) si++;
    /* Coherencia con la regla del color: si el color no afecta, nunca es «sí». */
    if (q.si && !R.afectaColor(q.x.c, q.o)) malas++;
    if (q.si !== q.porque.startsWith("Sí")) malas++;
  }
  ok(malas === 0, `nivel ${n}: respuestas y explicaciones coinciden con el motor`);
  ok(si > 1100 && si < 1900, `nivel ${n}: sí y no salen parejo (${Math.round(si / 30)} % sí)`);
}

console.log("\nEl acertijo del mayordomo");
for (const n of [1, 2, 3]) {
  let buenos = 0;
  const t0 = Date.now();
  for (let k = 0; k < 12; k++) {
    const p = Q.crear(n, V.semilla("prueba-" + n + "-" + k));
    if (!p) continue;
    /* Jugar la solución con el motor y comprobar que deja la finca lista. */
    let E = Q.clonar(p.E);
    for (const paso of p.solucion) E = Q.aplicarPaso(E, paso);
    if (Q.cumple(E, p.meta) && !Q.cumple(p.E, p.meta)) buenos++;
  }
  ok(buenos === 12, `nivel ${n}: 12 de 12 acertijos con solución comprobada (${Math.round((Date.now() - t0) / 12)} ms cada uno)`);
}
const a = Q.crear(2, V.semilla("acertijo-2026-09-29")), b = Q.crear(2, V.semilla("acertijo-2026-09-29"));
ok(Q.firma(a.E) === Q.firma(b.E), "el acertijo del día es el mismo con la misma fecha");
const c = Q.crear(2, V.semilla("acertijo-2026-09-30"));
ok(Q.firma(a.E) !== Q.firma(c.E), "y cambia al otro día");

console.log("\nÁlbum de la finca");
const L = V.LAMINAS();
ok(L.length === 45, `hay ${L.length} láminas (deben ser 45)`);
ok(L.every(l => l.dato && l.dato.length > 30), "todas traen su dato real");
ok(new Set(L.map(l => l.clave)).size === L.length, "no hay láminas repetidas");
const lista = JSON.parse(fs.readFileSync(path.join(__dirname, "public/cartas/lista.json"), "utf8"));
ok(L.every(l => lista.includes(l.clave)), "todas tienen ilustración en public/cartas/");

console.log("\nParejas");
const P = require("./public/vereda/parejas.js");
for (const n of [1, 2, 3]) {
  let bien = 0;
  for (let k = 0; k < 300; k++) {
    const t = P.crear(n, V.semilla("parejas-" + n + "-" + k));
    const N = P.NIVELES[n].pares;
    /* cada plaga tiene exactamente una pareja, y es el remedio que la quita en Cosecha */
    const ok1 = t.length === N * 2 && t.filter(x => x.k === "plaga").every(p => {
      const par = t.filter(x => P.esPareja(p, x));
      return par.length === 1 && par[0].k === "remedio" && par[0].c === p.c && par[0].t === (p.t === "resistente" ? "bioinsumo" : "casero");
    });
    const ok2 = t.filter(x => x.k === "plaga" && x.t === "resistente").length === P.NIVELES[n].resistentes;
    if (ok1 && ok2) bien++;
  }
  ok(bien === 300, `nivel ${n}: 300 tableros, cada plaga con su único remedio`);
}
ok(P.estrellas(1, 4) === 3 && P.estrellas(1, 20) === 1 && P.puntos(1, 4) === 40, "estrellas y puntos por intentos");

console.log("\nEspantos en la oscuridad");
const Es = require("./public/vereda/espantos.js");
{
  let malas = 0, espantadas = 0, noches = 0;
  for (let k = 0; k < 1500; k++) {
    const r = V.semilla("rio-" + k), n = 3 + k % 3;
    const E = Es.nueva(Array.from({ length: n }, (_, i) => "J" + i), { rnd: r, todosBots: true });
    const temps = E.jugadores.map((_, i) => Es.TEMPERAMENTOS[i % 4]);
    let pasos = 0;
    while (!E.fin && pasos++ < 400) {
      if (E.esperaNoche) { Es.seguirNoche(E); continue; }
      const d = {}; E.jugadores.forEach((j, i) => { if (j.enCamino) d[i] = Es.decideBot(E, i, temps[i], true); });
      Es.decidir(E, d);
      /* lo repartido nunca supera lo que salió en el camino */
      const salio = E.camino.reduce((a, x) => a + (x.k === "h" ? x.v : 0), 0);
      const lleva = E.jugadores.reduce((a, j) => a + j.lleva, 0);
      if (lleva > salio) malas++;
    }
    if (!E.fin || E.noche !== 5) malas++;
    noches += E.noche; espantadas += E.quitados.length;
  }
  ok(malas === 0, "1.500 partidas de 3 a 5 jugadores terminan en 5 noches y no se inventan granos");
  ok(espantadas / noches > .3 && espantadas / noches < .8, `entre 30 % y 80 % de las noches las acaba un espanto (${Math.round(100 * espantadas / noches)} %)`);
}

console.log("\nLa Galería");
const Ga = require("./public/vereda/galeria-reglas.js");
{
  let malas = 0;
  for (let k = 0; k < 1500; k++) {
    const r = V.semilla("plaza-" + k), n = 2 + k % 5;
    const E = Ga.nueva(Array.from({ length: n }, (_, i) => "J" + i), r);
    let rondas = 0;
    while (E.fase !== "fin" && rondas++ < 60) {
      E.jugadores.forEach((j, i) => { if (!Ga.pujar(E, i, Ga.pujaBot(E, i, "normal"))) malas++; });
      Ga.destapar(E); Ga.siguiente(E);
    }
    const unidades = E.jugadores.reduce((a, j) => a + Ga.CULTIVOS.reduce((b, c) => b + j.bodega[c], 0), 0);
    if (E.fase !== "fin" || unidades > 16 || E.jugadores.some(j => j.monedas < 0)) malas++;
  }
  ok(malas === 0, "1.500 subastas de 2 a 6 jugadores: ofertas válidas, nadie queda debiendo y siempre terminan");
  const E = Ga.nueva(["A", "B"], () => .5);
  Ga.pujar(E, 0, 3); Ga.pujar(E, 1, 3); const u = Ga.destapar(E);
  ok(u.empate && u.ganador === null && E.mesa.length === 1, "empate sin desempate: el lote se queda en la mesa");
  ok(!Ga.pujar(Ga.nueva(["A", "B"]), 0, 99), "no se puede ofrecer más de lo que se tiene");
}

console.log("\nVocabulario");
const PROHIBIDAS = /\b(virus|órgano|organo|medicina|vacuna|tratamiento)s?\b/i;
const dir = path.join(__dirname, "public/vereda");
const sucias = fs.readdirSync(dir).filter(f => PROHIBIDAS.test(fs.readFileSync(path.join(dir, f), "utf8")));
ok(!sucias.length, "ningún texto de la vereda usa vocabulario de otros juegos" + (sucias.length ? ": " + sucias.join(", ") : ""));

console.log(fallos ? `\n${fallos} prueba(s) fallaron\n` : "\nLa Vereda está en orden\n");
process.exit(fallos ? 1 : 0);
