/* Comprueba que el cliente y el motor hablen el mismo idioma.

       npm run test:coherencia

   Cosecha nació del código de otro juego, y al cambiar el tema quedaron
   comparaciones contra palabras que el motor ya no devuelve nunca: el cliente
   preguntaba si una mata estaba «inmunizada» cuando las reglas dicen
   «certificada». Eso no rompe nada ruidosamente —no hay error en consola, no
   se cae el servidor—, simplemente una rama del código deja de ejecutarse para
   siempre y un escudo no se dibuja.

   Esta prueba lee el código fuente del cliente y verifica, sin abrir navegador,
   que cada valor con el que compara exista de verdad del lado del motor.
*/
const fs = require("fs");
const path = require("path");
const R = require("./public/reglas.js");

const cliente = fs.readFileSync(path.join(__dirname, "public", "cliente.js"), "utf8");
let fallos = 0;
const ok  = m => console.log("   ✓ " + m);
const mal = m => { fallos++; console.log("   ✗ " + m); };

/* ── 1. Estados de mata ─────────────────────────────────────── */
/* Lo que estadoMata puede devolver: todos los textos literales de la función,
   incluidos los de un ternario, que es justo donde vive «protegido». */
const ESTADOS = new Set(
  (R.estadoMata.toString().match(/"([a-z]+)"/g) || []).map(s => s.slice(1, -1))
);
/* Con lo que el cliente compara. */
const comparados = new Set(
  [...cliente.matchAll(/\best(?:ado)?\s*===\s*"([a-zA-Z]+)"/g)].map(m => m[1])
);
const fantasma = [...comparados].filter(e => !ESTADOS.has(e));
fantasma.length
  ? mal("el cliente compara contra estados que el motor nunca devuelve: " +
        fantasma.join(", ") + "\n      (el motor devuelve: " + [...ESTADOS].join(", ") + ")")
  : ok("los estados de mata del cliente existen en el motor (" + [...ESTADOS].join(", ") + ")");

/* ── 2. Tipos de jugada ─────────────────────────────────────── */
/* Todos los tipos que el motor llega a generar, sacados de una tanda de
   partidas reales en vez de una lista escrita a mano que se desactualiza. */
const TIPOS = new Set();
(() => {
  for (let p = 0; p < 40; p++) {
    let E;
    try { E = arrancar(3 + (p % 3)); } catch (e) { return; }
    for (let t = 0; t < 120 && E; t++) {
      const ji = E.turno, j = E.jugadores[ji];
      if (!j) break;
      let alguna = false;
      (j.mano || []).forEach((c, i) => {
        (R.jugadasLegales(E, ji, i) || []).forEach(x => { TIPOS.add(x.tipo); alguna = true; });
      });
      if (!alguna) break;
      try { avanzar(E); } catch (e) { break; }
    }
  }
})();
function arrancar(n) {
  const mazo = R.crearMazo(true, true);
  const jugadores = [];
  for (let i = 0; i < n; i++) jugadores.push({ nombre: "J" + i, mano: mazo.splice(0, 3), finca: [] });
  return { jugadores, mazo, descarte: [], turno: 0, jornales: R.JORNALES_TURNO, rebarajadas: 0, ronda: 0 };
}
function avanzar(E) {
  const ji = E.turno, j = E.jugadores[ji];
  for (let i = 0; i < j.mano.length; i++) {
    const js = R.jugadasLegales(E, ji, i) || [];
    if (js.length) { R.aplicar(E, ji, i, js[0]); return; }
  }
  E.turno = (E.turno + 1) % E.jugadores.length;
  if (j.mano.length < 3 && E.mazo.length) j.mano.push(E.mazo.pop());
}

/* El cliente también compara tipos que no son jugadas: los avisos pendientes
   y los sucesos que manda el servidor. Todos valen, con tal de que alguien los
   emita de verdad en alguna parte. */
/* De cada `tipo:` se lee solo su valor, hasta la coma que lo cierra. Leer la
   línea entera barrería de más —hay líneas que deciden el tipo mirando el
   estado de una mata— y leer solo lo pegado a los dos puntos barrería de
   menos, porque el trueque y la Patasola salen de un ternario. */
function valoresDe(texto) {
  const out = [];
  const re = /\btipo\s*:/g;
  let m;
  while ((m = re.exec(texto))) {
    let i = m.index + m[0].length, hondo = 0, fin = i;
    for (; i < texto.length; i++) {
      const c = texto[i];
      if ("([{".includes(c)) hondo++;
      else if (")]}".includes(c)) { if (hondo === 0) break; hondo--; }
      else if (c === "," && hondo === 0) break;
      else if (c === "\n") break;
      fin = i + 1;
    }
    for (const q of texto.slice(m.index, fin).matchAll(/"([a-zA-Z_]+)"/g)) out.push(q[1]);
  }
  return out;
}
for (const f of ["server.js", "public/reglas.js"])
  for (const t of valoresDe(fs.readFileSync(path.join(__dirname, f), "utf8"))) TIPOS.add(t);

if (!TIPOS.size) ok("no se pudo simular para listar los tipos de jugada (se omite)");
else {
  const citados = new Set(
    [...cliente.matchAll(/tipo\s*[!=]==\s*"([a-zA-Z_]+)"/g)].map(m => m[1])
  );
  const inventados = [...citados].filter(t => !TIPOS.has(t));
  inventados.length
    ? mal("el cliente nombra tipos de jugada que el motor nunca genera: " + inventados.join(", "))
    : ok("los tipos de jugada que nombra el cliente existen en el motor (" + TIPOS.size + " tipos vistos)");
}

/* ── 3. Sucesos: que ninguno se quede mudo ──────────────────── */
/* El anuncio del centro es lo único que le cuenta a un jugador qué acaba de
   pasar cuando la mesa está llena. Una jugada nueva sin su palabra pasa
   inadvertida: no falla nada, simplemente no se anuncia. Lo mismo un clima
   nuevo sin color ni figura. */
if (TIPOS.size) {
  const SU = require("./public/sucesos.js");
  const MUDOS = new Set(["reelegir", "malla"]);   /* son avisos, no jugadas */
  const sinPalabra = [...TIPOS].filter(t => !SU.PALABRA[t] && !MUDOS.has(t));
  /* Sucesos que nacen en el cliente, no en el servidor: el anuncio de cosecha
     se detecta al ver que una finca pasó a estar lista. */
  const DEL_CLIENTE = new Set(["anuncio"]);
  const inventados = Object.keys(SU.PALABRA).filter(t => !TIPOS.has(t) && !DEL_CLIENTE.has(t));
  const climasSin = R.CLIMAS.map(c => c.id).filter(id => !SU.CLIMA[id]);
  const figFalsa = Object.entries(SU.CLIMA).filter(([, v]) => !SU.FIG[v.fig]).map(([k]) => k);

  if (sinPalabra.length) mal("sucesos sin anuncio en el centro: " + sinPalabra.join(", "));
  else if (inventados.length) mal("anuncios para sucesos que no existen: " + inventados.join(", "));
  else if (climasSin.length) mal("climas sin color ni figura: " + climasSin.join(", "));
  else if (figFalsa.length) mal("climas que piden una figura inexistente: " + figFalsa.join(", "));
  else ok("los " + Object.keys(SU.PALABRA).length + " anuncios y los " +
          R.CLIMAS.length + " climas cubren todos los sucesos");
}

/* ── 4. Opciones de la partida ──────────────────────────────── */
/* Preguntar por una opción con otro nombre no da error: da `undefined`, que
   es falso, y la opción simplemente no se enciende nunca. Así estuvo el modo
   aprendiz, apagado sin que nada lo dijera. */
{
  const srvTxt = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");
  const decl = srvTxt.match(/opciones\s*:\s*\{([^}]*)\}/);
  if (!decl) ok("no se encontró la lista de opciones (se omite)");
  else {
    const declaradas = new Set([...decl[1].matchAll(/([a-zA-Z]+)\s*:/g)].map(m => m[1]));
    const leidas = new Set();
    for (const f of ["server.js", "public/cliente.js"])
      for (const m of fs.readFileSync(path.join(__dirname, f), "utf8")
            .matchAll(/opciones\.([a-zA-Z]+)/g)) leidas.add(m[1]);
    const huerfanas = [...leidas].filter(k => !declaradas.has(k));
    huerfanas.length
      ? mal("se leen opciones que nadie declara: " + huerfanas.join(", ") +
            "\n      (las declaradas son: " + [...declaradas].join(", ") + ")")
      : ok("las opciones que se leen son las que existen (" + declaradas.size + ")");
  }
}

/* ── 5. Clases de carta y faenas ────────────────────────────── */
const KS = new Set(["cultivo", "plaga", "remedio", "faena"]);
const ksCitadas = new Set([...cliente.matchAll(/\.k\s*===\s*"([a-zA-Z]+)"/g)].map(m => m[1]));
const ksMalas = [...ksCitadas].filter(k => !KS.has(k));
ksMalas.length
  ? mal("el cliente compara clases de carta inexistentes: " + ksMalas.join(", ") +
        " (las reales son: " + [...KS].join(", ") + ")")
  : ok("las clases de carta del cliente son las del motor");

const trCitadas = new Set([...cliente.matchAll(/\.tr\s*===\s*"([a-zA-Z_]+)"/g)].map(m => m[1]));
const trMalas = [...trCitadas].filter(t => !R.FAENA[t]);
trMalas.length
  ? mal("el cliente nombra faenas que no existen: " + trMalas.join(", "))
  : ok("las faenas que nombra el cliente existen en el motor");

/* ── 6. Vocabulario del juego anterior ──────────────────────── */
const PROHIBIDAS = /\b(virus|órgano|organo|medicina|inmuniz\w*|vacun\w*|trasplant\w*|cuarentena|biónico|bionico|extirpar|traje de protección)\b/i;
const archivos = ["server.js", "public/cliente.js", "public/reglas.js",
                  "public/arte.js", "public/sonido.js", "public/index.html"];
const sucios = archivos.filter(f => PROHIBIDAS.test(fs.readFileSync(path.join(__dirname, f), "utf8")));
sucios.length
  ? mal("queda vocabulario del juego anterior en: " + sucios.join(", "))
  : ok("ni un rastro del juego anterior en el código");

console.log(fallos ? `\n  ${fallos} fallo(s) de coherencia.\n`
                   : "\n  Cliente y motor hablan el mismo idioma.\n");
process.exit(fallos ? 1 : 0);
