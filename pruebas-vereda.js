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

console.log("\nVocabulario");
const PROHIBIDAS = /\b(virus|órgano|organo|medicina|vacuna|tratamiento)s?\b/i;
const dir = path.join(__dirname, "public/vereda");
const sucias = fs.readdirSync(dir).filter(f => PROHIBIDAS.test(fs.readFileSync(path.join(dir, f), "utf8")));
ok(!sucias.length, "ningún texto de la vereda usa vocabulario de otros juegos" + (sucias.length ? ": " + sucias.join(", ") : ""));

console.log(fallos ? `\n${fallos} prueba(s) fallaron\n` : "\nLa Vereda está en orden\n");
process.exit(fallos ? 1 : 0);
