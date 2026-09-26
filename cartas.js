/* Revisa las ilustraciones propias que haya en public/cartas/ y escribe
   public/cartas/lista.json, que es lo que el juego lee al arrancar para
   saber qué dibujo en SVG reemplazar por un PNG pintado.

       npm run cartas

   Imprime además qué falta, para ir viendo el avance de la baraja.

   Dos niveles de detalle conviven sin problema:

     p_comun.png          una sola plaga común para los cinco colores
     p_comun_cafe.png     la plaga común de café, pintada aparte

   El juego prefiere siempre la versión por color y, si no la encuentra,
   usa la general. Así se puede empezar con 29 dibujos y refinar después
   a 45 sin cambiar una línea de código.
*/
const path = require("path");
const fs = require("fs");
const R = require("./public/reglas.js");
const A = require("./public/arte.js");

const dir = path.join(__dirname, "public", "cartas");
fs.mkdirSync(dir, { recursive: true });

/* Todas las claves que el juego sabe usar, en los dos niveles */
const generales = new Map();   // clave general → carta de muestra
const porColor = new Map();    // clave con color → carta de muestra
for (const c of R.crearMazo(true, true)) {
  const ks = A.clavesCarta(c);
  if (ks.length === 2) { porColor.set(ks[0], c); generales.set(ks[1], c); }
  else generales.set(ks[0], c);
}

/* Ilustraciones de ambiente: no son cartas, pero salen en pantalla y tienen
   que hablar el mismo idioma. Los climas se ven en el anuncio del centro
   cuando cambia el tiempo; los avatares, junto al nombre de cada jugador.
   Mientras no existan, el juego usa su figura de respaldo. */
const ambiente = new Map();    // clave → descripción
for (const c of R.CLIMAS) ambiente.set("k_" + c.id, "clima: " + c.nombre.toLowerCase());
A.SILLAS.forEach((s, i) => ambiente.set(A.claveSilla(i), "avatar: " + s.nombre.toLowerCase()));

const hay = new Set(
  fs.readdirSync(dir)
    .filter(f => /\.png$/i.test(f))
    .map(f => f.replace(/\.png$/i, ""))
);

/* El orden importa: la clave con color va primero en lista.json para que
   se lea igual que la busca el juego. */
const conocidas = [...porColor.keys(), ...generales.keys(), ...ambiente.keys()];
const usables = conocidas.filter(k => hay.has(k));
const sobran = [...hay].filter(k => !conocidas.includes(k));

fs.writeFileSync(path.join(dir, "lista.json"), JSON.stringify(usables, null, 0) + "\n");

/* ── Informe ─────────────────────────────────────────────────── */
const nom = k => {
  const conColor = porColor.has(k);
  const c = porColor.get(k) || generales.get(k);
  const r = A.rotulos(c);
  if (c.k === "plaga" || c.k === "remedio") {
    const fam = c.k === "plaga" ? (c.t === "resistente" ? "plaga resistente" : "plaga común")
              : (c.t === "bioinsumo" ? "bioinsumo" : "remedio casero");
    return conColor ? fam + " de " + R.CULTIVO[c.c].label.toLowerCase()
                    : fam + " (sirve para los cinco colores)";
  }
  return r.titulo.toLowerCase() + " de " + r.sub.toLowerCase();
};
/* Provisionales: versiones sacadas de otro dibujo (recolorea.py) mientras se
   pinta la definitiva. Se reconocen por su huella; si el archivo se reemplaza
   por el pintado, la huella deja de coincidir y cuenta como definitivo. */
const crypto = require("crypto");
const regProv = path.join(dir, "provisionales.json");
const huellas = fs.existsSync(regProv) ? JSON.parse(fs.readFileSync(regProv, "utf8")) : {};
const esProvisional = k => huellas[k] && hay.has(k) &&
  crypto.createHash("sha1").update(fs.readFileSync(path.join(dir, k + ".png"))).digest("hex") === huellas[k];
const faltanGen = [...generales.keys()].filter(k => !hay.has(k));
const cubiertas = [...generales.keys()].filter(k => hay.has(k));
const finas = [...porColor.keys()].filter(k => hay.has(k));

console.log("");
console.log("  public/cartas/lista.json · " + usables.length + " ilustraciones propias");
console.log("");
console.log("  Baraja básica    " + cubiertas.length + " de " + generales.size +
  " dibujos generales" + (faltanGen.length ? "" : "  ✓ completa"));
const provis = finas.filter(esProvisional);
console.log("  Detalle por color " + finas.length + " de " + porColor.size +
  " (opcional; el color de la plaga y del remedio decide la jugada)" +
  (provis.length ? "\n                    de ellas " + provis.length + " provisionales, recoloreadas de otro dibujo" : ""));
const ambHay = [...ambiente.keys()].filter(k => hay.has(k));
console.log("  Ambiente          " + ambHay.length + " de " + ambiente.size +
  " (climas y avatares, para que todo hable el mismo idioma)");
console.log("");

const ambFalta = [...ambiente.keys()].filter(k => !hay.has(k));
if (ambFalta.length) {
  console.log("  Ambiente por pintar:");
  for (const k of ambFalta) console.log("    " + (k + ".png").padEnd(22) + ambiente.get(k));
  console.log("");
  console.log("  Mientras tanto, el clima sale con su sello de color y los avatares con");
  console.log("  el sombrero en vector.");
  console.log("");
}

if (faltanGen.length) {
  console.log("  Faltan por pintar:");
  for (const k of faltanGen) console.log("    " + (k + ".png").padEnd(22) + nom(k));
  console.log("");
  console.log("  Mientras tanto el juego dibuja esas en SVG, así que se puede jugar igual.");
  console.log("");
}
if (porColor.size && finas.length < porColor.size) {
  const ejemplo = [...porColor.keys()].find(k => !hay.has(k));
  console.log("  Para afinar una plaga o un remedio a un solo color, deja por ejemplo");
  console.log("    " + ejemplo + ".png   (" + nom(ejemplo) + ")");
  console.log("  y esa carta dejará de usar el dibujo general.");
  console.log("");
}
if (provis.length) {
  console.log("  Provisionales (se usan, pero conviene pintarlas):");
  for (const k of provis) console.log("    " + (k + ".png").padEnd(26) + nom(k));
  console.log("  Cuando dejes la pintada con el mismo nombre, deja de contar como provisional.");
  console.log("");
}
if (sobran.length) {
  console.log("  Archivos que el juego no reconoce (revisa el nombre):");
  for (const k of sobran) console.log("    " + k + ".png");
  console.log("");
}
console.log("  Cada PNG va cuadrado, con fondo transparente, 1024×1024 o más.");
console.log("  El marco, el rótulo, el costo en jornales y el sello del mazo los pone");
console.log("  el juego encima: no los pintes dentro de la imagen.");
console.log("");
