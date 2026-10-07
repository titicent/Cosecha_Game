/* Pruebas de Mi finca (public/vereda/finca-reglas.js). Corren sin navegador:
   cada función recibe la hora, así que no hay que esperar a que crezca nada.

       node pruebas-finca.js */
const F = require("./public/vereda/finca-reglas.js");
const fs = require("fs"), path = require("path");
let fallos = 0;
const ok = (c, m) => { if (c) console.log("   ✓ " + m); else { fallos++; console.log("   ✗ " + m); } };
const MIN = F.MIN, T0 = 1e12;
const sin = () => 0.99;                 /* azar que nunca trae plaga */
const con = () => 0.1;                  /* azar que siempre la trae */

console.log("\nMi finca: sembrar y crecer");
{
  const f = F.nueva(T0, sin);
  ok(f.lotes.length === 9 && F.nivel(f) === 1 && f.encargos.length === 3, "empieza con 9 surcos, nivel 1 y 3 encargos");
  ok(!F.sembrar(f, 0, "cafe", T0, sin).ok, "el café no se puede sembrar en el nivel 1");
  const s = F.sembrar(f, 0, "platano", T0, sin);
  ok(s.ok && s.costo === 5 && f.lotes[0].dur === 20000 && !f.lotes[0].plaga, "el primer plátano cuesta 5, está en 20 s y no le cae plaga");
  F.sembrar(f, 1, "platano", T0, sin);
  ok(f.lotes[1].dur === 3 * MIN, "el segundo plátano ya tarda 3 minutos");
  ok(!F.sembrar(f, 1, "huerta", T0, sin).ok, "no se siembra en un surco ocupado");
  const etapas = [0, .3, .7, 1].map(x => F.estado(f.lotes[1], T0 + x * 3 * MIN).etapa).join();
  ok(etapas === "1,2,3,4", "pasa por semilla, brote, creciendo y lista (" + etapas + ")");
  ok(!F.cosechar(f, 1, T0 + MIN).ok, "no se cosecha antes de tiempo");
  const c = F.cosechar(f, 1, T0 + 3 * MIN);
  ok(c.ok && f.bodega.platano === 2 && f.xp === 2 && f.lotes[1] === null, "al cosechar van 2 racimos a la bodega y 2 de experiencia");
}

console.log("\nMi finca: plagas y muertes");
{
  const f = F.nueva(T0, sin); f.primera = false;
  F.sembrar(f, 0, "cafe", T0, sin);            /* aunque el nivel no da, se prueba con un cultivo abierto */
  F.sembrar(f, 0, "platano", T0, con);
  const m = f.lotes[0];
  ok(!!m.plaga && m.plaga.en > T0 && m.plaga.en < T0 + m.dur, "la plaga llega mientras crece");
  ok(!F.estado(m, m.plaga.en - 1).plagada && F.estado(m, m.plaga.en).plagada, "se ve desde el momento en que llega");
  ok(!F.cosechar(f, 0, T0 + m.dur).ok || F.estado(m, T0 + m.dur).muerta, "una mata plagada no se cosecha");
  const muere = m.plaga.en + F.ventanaPlaga(m);
  ok(!F.estado(m, muere - 1).muerta && F.estado(m, muere).muerta === "seca", "sin remedio se seca a tiempo (la mitad de su crecer, mínimo 1 min)");
  ok(!F.curar(f, 0, muere).ok, "una mata seca ya no se cura");
  ok(F.limpiar(f, 0, muere).ok && f.lotes[0] === null, "la mata seca se arranca y el surco queda libre");

  F.sembrar(f, 1, "platano", T0, con);
  const m2 = f.lotes[1], cu = F.curar(f, 1, m2.plaga.en + 1000);
  ok(cu.ok && cu.costo === 3 && !F.estado(m2, T0 + m2.dur).plagada, "con el remedio (3 monedas) se cura");
  const lista = T0 + m2.dur, fin = lista + F.ventanaLista(m2);
  ok(!F.estado(m2, fin - 1).muerta && F.estado(m2, fin).muerta === "marchita", "lista y sin cosechar, se marchita (doble de su tiempo + 5 min)");
  ok(F.ventanaLista({ dur: MIN }) === 7 * MIN && F.ventanaPlaga({ dur: MIN }) === MIN, "la huerta: 1 min para curarla y 7 min lista");

  let plagadas = 0; const g = F.nueva(T0); g.primera = false;
  for (let k = 0; k < 2000; k++) { g.lotes[0] = null; F.sembrar(g, 0, "huerta", T0); if (g.lotes[0].plaga) plagadas++; }
  ok(plagadas > 400 && plagadas < 600, "le llega plaga a una de cada cuatro, más o menos (" + Math.round(plagadas / 20) + " %)");
}

console.log("\nMi finca: niveles, venta y construcciones");
{
  const f = F.nueva(T0, sin);
  ok(F.nivelDe(14) === 1 && F.nivelDe(15) === 2 && F.nivelDe(40) === 3 && F.nivelDe(80) === 4, "niveles a 15, 40 y 80 de experiencia");
  ok(!F.construir(f, "secadero", T0).ok, "el secadero no se construye en el nivel 1");
  f.xp = 15;
  ok(F.abierto(f, "cafe") && !F.abierto(f, "cana"), "en el nivel 2 se abre el café y todavía no la caña");
  f.bodega.cafe = 3;
  ok(F.precio(f, "cafe") === 10, "sin secadero el café vale 10");
  const b = F.construir(f, "secadero", T0);
  ok(b.ok && b.costo === 50 && F.precio(f, "cafe") === 15, "con secadero (50 monedas) vale 15");
  const v = F.vender(f, "cafe");
  ok(v.ok && v.gana === 45 && f.bodega.cafe === 0, "vender toda la bodega de café da 45");
  f.xp = 40; F.construir(f, "gallinero", T0);
  ok(F.huevos(f, T0 + 3 * MIN) === 0 && F.huevos(f, T0 + 4 * MIN) === 2 && F.huevos(f, T0 + 60 * MIN) === 6, "el gallinero pone 2 huevos cada 4 min, hasta 6");
  const r = F.recoger(f, T0 + 9 * MIN);
  ok(r.n === 4 && f.bodega.huevos === 4 && F.huevos(f, T0 + 10 * MIN) === 0 && F.huevos(f, T0 + 12 * MIN) === 2, "al recoger se guarda lo que iba corriendo");
}

console.log("\nMi finca: encargos");
{
  const f = F.nueva(T0, Math.random);
  ok(f.encargos.every(e => e.req.every(c => F.abierto(f, c))), "de entrada solo piden cultivos abiertos");
  f.xp = 80;
  for (let k = 0; k < 30; k++) { f.encargos = []; F.llenarEncargos(f); }
  ok(new Set(f.encargos.map(e => e.clave)).size === 3, "no se repite un encargo en el tablero");
  const e = f.encargos[0];
  ok(!F.entregar(f, 0).ok, "sin la cosecha no se entrega");
  e.req.forEach(c => { f.bodega[c]++; });
  const r = F.entregar(f, 0);
  const puesto = e.req.reduce((a, c) => a + F.precio(f, c), 0);
  ok(r.ok && r.gana > puesto && f.encargos.length === 3, "el encargo paga más que el puesto (" + r.gana + " contra " + puesto + ") y sale otro");
  ok(F.cambiarEncargo(f, 0, T0 + 10 * MIN).ok && !F.cambiarEncargo(f, 0, T0 + 11 * MIN).ok, "un encargo se cambia una vez cada 5 minutos");
  const lista = JSON.parse(fs.readFileSync(path.join(__dirname, "public/cartas/lista.json"), "utf8"));
  ok(F.ENCARGOS.every(x => lista.includes(x.clave)), "todos los encargos tienen ilustración");
}

console.log("\nMi finca: la autopista para los vecinos");
{
  const f = F.nueva(T0, sin); f.primera = false; f.bodega.platano = 9;
  F.sembrar(f, 0, "platano", T0, con);
  const en = f.lotes[0].plaga.en + 1000, p = F.vistaPublica(f, en, { nombre: "Ana", cara: 3 });
  ok(p.lotes[0].plagada && p.nombre === "Ana" && !("bodega" in p) && !JSON.stringify(p).includes("xp"), "la vista pública muestra matas y plagas, no la bodega");
  const a = F.ayudar(f, 0, "Lucía", en);
  ok(a.ok && a.premio === F.PREMIO_AYUDA && !F.estado(f.lotes[0], en).plagada && f.ayudas[0].quien === "Lucía", "un vecino cura la plaga, gana monedas y queda anotado");
  ok(!F.ayudar(f, 0, "Lucía", en).ok, "no se puede ayudar dos veces la misma mata");
  ok(JSON.stringify(JSON.parse(JSON.stringify(f))) === JSON.stringify(f), "la finca se guarda como texto sin perder nada");
}

console.log(fallos ? "\n" + fallos + " pruebas fallaron" : "\nMi finca está en orden");
process.exit(fallos ? 1 : 0);
