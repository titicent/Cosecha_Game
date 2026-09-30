/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — Parejas (la cocina de la abuela)
   Juego de memoria: las cartas están boca abajo y se voltean de a dos.
   Cada plaga tiene su remedio, como en el cuaderno de la abuela:
     · la plaga común se quita con el remedio casero de su color;
     · la plaga resistente solo con el bioinsumo de su color.
   Es la misma regla del juego grande, y el motor (REGLAS) pone los
   nombres, los colores y las ilustraciones.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const R = raiz.REGLAS;

const COLORES = ["cafe", "platano", "cacao", "cana", "huerta"];
const NIVELES = [
  null,
  { n: 1, nom: "Nieta", nota: "4 parejas, plagas comunes", pares: 4, resistentes: 0, mult: 1 },
  { n: 2, nom: "Cocinera", nota: "6 parejas, con una resistente", pares: 6, resistentes: 1, mult: 1.5 },
  { n: 3, nom: "Abuela", nota: "10 parejas: comunes y resistentes", pares: 10, resistentes: 5, mult: 2 }
];

const barajar = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* La pareja de una plaga es el remedio que la quita en Cosecha. */
const remedioDe = p => ({ k: "remedio", c: p.c, t: p.t === "resistente" ? "bioinsumo" : "casero" });
const esPareja = (a, b) => a.par === b.par && a.id !== b.id;

/* Arma el tablero: las plagas del nivel y sus remedios, barajados. */
function crear(nivel, r) {
  const N = NIVELES[nivel], rnd = r || Math.random;
  let plagas;
  if (N.resistentes >= 5) plagas = COLORES.flatMap(c => [{ k: "plaga", c, t: "comun" }, { k: "plaga", c, t: "resistente" }]);
  else {
    const comunes = barajar(COLORES.slice(), rnd).slice(0, N.pares - N.resistentes).map(c => ({ k: "plaga", c, t: "comun" }));
    /* la resistente es de un color que ya está en la mesa, para que haya que fijarse en el tipo */
    const res = barajar(comunes.map(p => p.c), rnd).slice(0, N.resistentes).map(c => ({ k: "plaga", c, t: "resistente" }));
    plagas = comunes.concat(res);
  }
  const cartas = [];
  plagas.forEach((p, i) => {
    cartas.push(Object.assign({ id: "p" + i, par: i }, p));
    cartas.push(Object.assign({ id: "r" + i, par: i }, remedioDe(p)));
  });
  return barajar(cartas, rnd);
}

/* Puntos: 10 por pareja, menos 2 por cada intento de más. Estrellas según los intentos. */
function puntos(nivel, intentos) {
  const n = NIVELES[nivel].pares;
  return Math.max(n * 2, n * 10 - Math.max(0, intentos - n) * 2);
}
function estrellas(nivel, intentos) {
  const n = NIVELES[nivel].pares;
  return intentos <= Math.ceil(n * 1.5) ? 3 : intentos <= n * 2 + 2 ? 2 : 1;
}

/* Por qué dos cartas no son pareja, en palabras de la abuela. */
function porQueNo(a, b) {
  const [p, x] = a.k === "plaga" ? [a, b] : [b, a];
  if (a.k === b.k) return a.k === "plaga" ? "Dos plagas no se curan entre ellas." : "Dos remedios juntos no curan nada: falta la plaga.";
  if (p.c !== x.c) return R.nombreCarta(x) + " es para " + R.CULTIVO[x.c].label.toLowerCase() + ", y " + R.nombreCarta(p) + " ataca " + R.CULTIVO[p.c].label.toLowerCase() + ".";
  if (p.t === "resistente") return R.nombreCarta(p) + " es resistente: el remedio casero no le hace nada, solo un bioinsumo.";
  return "El bioinsumo también cura " + R.nombreCarta(p) + ", pero en el cuaderno su pareja es el remedio casero: el bioinsumo se guarda para las resistentes.";
}

raiz.PAREJAS = { NIVELES, crear, esPareja, remedioDe, puntos, estrellas, porQueNo };
if (typeof module !== "undefined" && module.exports) { module.exports = raiz.PAREJAS; return; }

/* ── Pantalla ──────────────────────────────────────────────── */
const V = raiz.VEREDA, esc = V.esc;
const app = document.getElementById("app");
let nivel = Math.min(3, Math.max(1, +(V.datos().parejasNivel || 1)));
const abierto = n => n === 1 || V.recordDe("parejas", n - 1) > 0;

const DORSO = `<svg viewBox="0 0 60 80" aria-hidden="true"><rect x="3" y="3" width="54" height="74" rx="7" fill="#7B4B2A"/>
  <rect x="7" y="7" width="46" height="66" rx="5" fill="none" stroke="#E0B04A" stroke-width="1.6" stroke-dasharray="3 3"/>
  <g transform="translate(30 40)"><ellipse rx="10" ry="13" fill="#F4EFE2"/><path d="M0 -10c-3 5-3 15 0 20" stroke="#7B4B2A" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
  ${[[14, 16], [46, 16], [14, 64], [46, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#E0B04A"/>`).join("")}</svg>`;

function portada() {
  app.innerHTML = `<section class="marco">
    <h2>Parejas</h2>
    <p>En la cocina de la abuela está el cuaderno de remedios, pero se regaron las hojas. Voltea de a dos cartas y junta cada plaga con el remedio que la quita.</p>
    <ul class="reglas-par">
      <li><span class="p">${V.ilustra({ k: "plaga", c: "cafe", t: "comun" })}</span><b>+</b><span class="p">${V.ilustra({ k: "remedio", c: "cafe", t: "casero" })}</span><span>La plaga común se quita con el <b>remedio casero</b> de su color.</span></li>
      <li><span class="p">${V.ilustra({ k: "plaga", c: "cafe", t: "resistente" })}</span><b>+</b><span class="p">${V.ilustra({ k: "remedio", c: "cafe", t: "bioinsumo" })}</span><span>La plaga resistente, solo con el <b>bioinsumo</b> de su color.</span></li>
    </ul>
    <div class="niveles">${NIVELES.slice(1).map(N => { const ok = abierto(N.n), rec = V.recordDe("parejas", N.n);
      return `<button class="nivel" data-n="${N.n}" aria-pressed="${N.n === nivel}" ${ok ? "" : "disabled"}>
        <b>${N.nom}</b><small>${N.nota}</small>${ok ? (rec ? `<small class="candado">Récord: ${rec}</small>` : "") : `<small class="candado">Termina el anterior</small>`}</button>`; }).join("")}</div>
    <button class="jugar" id="ya">¡A la cocina!</button>
  </section>`;
  app.querySelectorAll(".nivel").forEach(b => b.onclick = () => { nivel = +b.dataset.n; V.datos().parejasNivel = nivel; V.guardar(); portada(); });
  document.getElementById("ya").onclick = jugar;
}

function jugar() {
  const N = NIVELES[nivel], cartas = crear(nivel);
  let abiertas = [], halladas = new Set(), intentos = 0, ocupado = false;
  const t0 = Date.now();
  app.innerHTML = `
    <div class="hud"><div class="dato"><b id="hP">0/${N.pares}</b><small>Parejas</small></div>
      <div class="dato"><b id="hI">0</b><small>Intentos</small></div>
      <div class="dato"><b id="hE">${"★".repeat(3)}</b><small>Estrellas</small></div></div>
    <div class="tablero n${cartas.length}" id="tab">${cartas.map((x, i) => `
      <button class="naipe" data-i="${i}" aria-label="Carta boca abajo" style="--t:${R.colorCarta(x)}">
        <span class="gira"><span class="dorso">${DORSO}</span>
        <span class="cara"><span class="ilu">${V.ilustra(x)}</span><span class="n">${esc(R.nombreCarta(x))}</span></span></span></button>`).join("")}</div>
    <div class="cuaderno" id="cuaderno"><b>El cuaderno de la abuela</b><span>Voltea dos cartas. Si son plaga y remedio que se entienden, se quedan boca arriba.</span></div>`;
  const $ = id => document.getElementById(id);
  const naipes = [...app.querySelectorAll(".naipe")];
  const hud = () => { $("hP").textContent = halladas.size / 2 + "/" + N.pares; $("hI").textContent = intentos;
    $("hE").textContent = "★".repeat(estrellas(nivel, Math.max(intentos, halladas.size / 2))) + "☆".repeat(3 - estrellas(nivel, Math.max(intentos, halladas.size / 2))); };
  const nota = (titulo, txt, clase) => { const c = $("cuaderno"); c.className = "cuaderno " + (clase || ""); c.innerHTML = `<b>${esc(titulo)}</b><span>${esc(txt)}</span>`; };

  naipes.forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (ocupado || halladas.has(i) || abiertas.includes(i)) return;
    b.classList.add("abierta"); b.setAttribute("aria-label", R.nombreCarta(cartas[i]));
    V.efecto("descarte");
    abiertas.push(i);
    if (abiertas.length < 2) return;
    intentos++;
    const [a, c] = abiertas.map(k => cartas[k]);
    if (esPareja(a, c)) {
      abiertas.forEach(k => { halladas.add(k); naipes[k].classList.add("hallada"); });
      const [p, x] = a.k === "plaga" ? [a, c] : [c, a];
      const lam = V.lamina(raiz.ARTE.clavesCarta(x)[0]);
      nota(R.nombreCarta(p) + " + " + R.nombreCarta(x), lam ? lam.dato : "", "bien");
      V.efecto(p.t === "resistente" ? "certificar" : "curar");
      abiertas = []; hud();
      if (halladas.size === cartas.length) setTimeout(fin, 900);
    } else {
      ocupado = true;
      nota("No se entienden", porQueNo(a, c), "mal");
      V.efecto("error");
      setTimeout(() => { abiertas.forEach(k => { naipes[k].classList.remove("abierta"); naipes[k].setAttribute("aria-label", "Carta boca abajo"); });
        abiertas = []; ocupado = false; hud(); }, 1100);
    }
    hud();
  });

  function fin() {
    const pts = puntos(nivel, intentos), est = estrellas(nivel, intentos);
    const nuevo = V.record("parejas", nivel, pts);
    const ganados = V.sumar(pts / 5 * N.mult);
    const pool = cartas.map(x => raiz.ARTE.clavesCarta(x)[0]);
    const lam = est >= 2 ? V.ganarLamina(pool) : null;
    V.efecto(est >= 2 ? "victoria" : "derrota");
    const seg = Math.round((Date.now() - t0) / 1000);
    V.premio({
      titulo: "★".repeat(est) + "☆".repeat(3 - est),
      linea: (nuevo ? "¡Récord nuevo! " : "") + `${N.pares} parejas en ${intentos} intentos y ${seg} segundos: ${pts} puntos.` +
        (est < 3 ? ` Con ${Math.ceil(N.pares * 1.5)} intentos o menos son tres estrellas.` : ""),
      arte: V.ilustra({ k: "remedio", c: "cafe", t: "casero" }), tono: R.CULTIVO.cacao.hex, cinta: "Parejas", ganados, lam
    }).then(b => b === "salir" ? (location.href = "vereda/index.html") : portada());
  }
  hud();
}

V.montar({ titulo: "Parejas", volver: "vereda/index.html", escena: "juego" });
portada();
V.cargarArte();
})(typeof self !== "undefined" ? self : globalThis);
