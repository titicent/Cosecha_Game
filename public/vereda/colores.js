/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — El color manda (el beneficiadero)
   Sale una carta y una mata tuya. ¿Se puede jugar esa carta sobre esa
   mata? Sí o no, contra reloj.

   La respuesta no la decide este archivo: se la pregunta al motor de
   Cosecha (REGLAS.jugadasLegales). Así el juego enseña exactamente las
   reglas del juego grande, y si algún día cambian, cambia solo.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const R = raiz.REGLAS;

const CINCO = ["cafe", "platano", "cacao", "cana", "huerta"];
const NIVELES = [
  null,
  { n: 1, nom: "Semillero", nota: "Solo colores", mult: 1 },
  { n: 2, nom: "Jornalero", nota: "Matas protegidas, certificadas y plagadas", mult: 1.5, abre: 12 },
  { n: 3, nom: "Baquiano", nota: "Resistentes, bioinsumos, vivero e injerto", mult: 2, abre: 12 }
];
const DURACION = 60;

const al = (r, a) => a[Math.floor(r() * a.length)];
const carta = (k, c, t) => ({ id: "x" + Math.random().toString(36).slice(2, 7), k, c, t });

/* Un color que sí le entre a la mata (su propio color o la huerta). */
function colorQueEntra(o, r) {
  if (o.carta.c === "injerto") return "huerta";
  return r() < .7 ? (o.carta.c === "huerta" ? al(r, CINCO) : o.carta.c) : "huerta";
}

function mataAlAzar(nivel, r) {
  const c = nivel >= 3 && r() < .18 ? al(r, ["vivero", "injerto"]) : al(r, CINCO);
  const o = { carta: carta("cultivo", c), remedios: [], plagas: [] };
  if (nivel === 1 || c === "vivero") return o;
  const e = al(r, ["sano", "protegido", "certificado", "plagado", "plagado"]);
  if (e === "protegido") o.remedios.push(carta("remedio", colorQueEntra(o, r), "casero"));
  if (e === "certificado") {
    if (nivel >= 3 && r() < .5) o.remedios.push(carta("remedio", colorQueEntra(o, r), "bioinsumo"));
    else o.remedios.push(carta("remedio", colorQueEntra(o, r), "casero"), carta("remedio", colorQueEntra(o, r), "casero"));
  }
  if (e === "plagado") o.plagas.push(carta("plaga", colorQueEntra(o, r), nivel >= 3 && r() < .45 ? "resistente" : "comun"));
  return o;
}
function cartaAlAzar(nivel, o, r) {
  const k = r() < .5 ? "plaga" : "remedio";
  /* La mitad de las veces el color le entra; la otra mitad, al azar. */
  const c = r() < .45 && o.carta.c !== "vivero" ? colorQueEntra(o, r) : al(r, CINCO);
  const t = k === "plaga" ? (nivel >= 3 && r() < .35 ? "resistente" : "comun")
                          : (nivel >= 3 && r() < .4 ? "bioinsumo" : "casero");
  return carta(k, c, t);
}

/* Qué pasaría: la jugada legal del motor sobre esa mata, o null. */
function resolver(o, x) {
  const E = { jugadores: [{ nombre: "Tú", mano: [x], finca: [o], bonos: 0 }], descarte: [], mazo: [], retiradas: [],
    turno: 0, objetivo: 4, metaCertificada: false, registro: [] };
  return R.jugadasLegales(E, 0, 0).find(j => j.o === 0 && (j.j === undefined || j.j === 0)) || null;
}

const lbl = c => R.CULTIVO[c].label.toLowerCase();
const QUE = {
  plagar: "le entra y la deja plagada.",
  lavar: "le lava el remedio: queda sana otra vez.",
  arrasar: "la arrasa, porque la mata ya estaba plagada.",
  proteger: "la protege.",
  certificar: "la certifica, porque la mata ya estaba protegida.",
  certificar_ya: "la certifica de una: es un bioinsumo.",
  curar: "le quita la plaga y la deja sana."
};
/* Por qué sí o por qué no, en palabras de finca. */
function porque(o, x, jug) {
  const n = R.nombreCarta(x);
  if (jug) return "Sí: " + n + " " + (QUE[jug.tipo] || "se puede jugar.");
  if (R.esVivero(o)) return "No: el vivero está bajo techo. No le entra ninguna plaga ni ningún remedio.";
  if (R.esInjerto(o) && x.c !== "huerta") return "No: al injerto solo le entran cartas de huerta.";
  if (!R.afectaColor(x.c, o)) return "No: " + n + " es " + (x.k === "plaga" ? "plaga " : "remedio ") +
    (x.c === "huerta" ? "de huerta" : (x.c === "cana" ? "de la " : "del ") + lbl(x.c)) +
    ", y esta mata es " + lbl(o.carta.c) + ". ¡El color manda!";
  const e = R.estadoMata(o);
  if (e === "certificado") return "No: la mata está certificada. Ya nadie la toca.";
  if (e === "plagado" && x.k === "remedio" && o.plagas[0].t === "resistente")
    return "No: " + R.nombreCarta(o.plagas[0]) + " es resistente. Un remedio casero no la quita: toca un bioinsumo.";
  return "No se puede jugar ahí.";
}

/* Una pregunta, buscando que sí y no salgan más o menos parejo. */
function pregunta(nivel, r) {
  const quiero = r() < .5;
  let q = null;
  for (let i = 0; i < 40; i++) {
    const o = mataAlAzar(nivel, r), x = cartaAlAzar(nivel, o, r), jug = resolver(o, x);
    q = { o, x, jug, si: !!jug };
    if (q.si === quiero) break;
  }
  q.porque = porque(q.o, q.x, q.jug);
  return q;
}

const API = { NIVELES, DURACION, pregunta, resolver, porque };
raiz.COLORMANDA = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;

/* ══ Pantalla ═══════════════════════════════════════════════════ */
if (typeof document === "undefined" || !raiz.VEREDA) return;
const V = raiz.VEREDA, esc = V.esc;
const app = document.getElementById("app");
let nivel = Math.max(1, Math.min(3, (V.datos().colores || {}).nivel || 1));

const abierto = n => n === 1 || V.recordDe("colores", n - 1) >= NIVELES[n].abre;

function portada() {
  if (!abierto(nivel)) nivel = 1;
  const ej = (k, carta) => `<span class="p">${V.arteClave(k, carta)}</span>`;
  app.innerHTML = `<section class="marco v-portada"><div class="v-cuento">
    <h2>El color manda</h2>
    <p>En el beneficiadero sale una carta y una mata de tu finca. ¿Se puede jugar esa carta ahí? Responde <b>sí</b> o <b>no</b> antes de que se acabe el tiempo.</p>
    <ul class="reglas-mini">
      <li>${ej("p_comun_cafe", { k: "plaga", c: "cafe", t: "comun" })}<span>Cada plaga y cada remedio es de un cultivo: <b>la broca es del café</b>.</span></li>
      <li>${ej("c_huerta", { k: "cultivo", c: "huerta" })}<span>A la <b>huerta</b> le entra todo, y las cartas de huerta le sirven a cualquier mata.</span></li>
      ${nivel >= 2 ? `<li>${ej("r_bioinsumo_huerta", { k: "remedio", c: "huerta", t: "bioinsumo" })}<span>Una mata <b>certificada</b> ya no la toca nadie.</span></li>` : ""}
    </ul>
    </div><div class="v-elige">
    <div class="niveles">${[1, 2, 3].map(n => {
      const ok = abierto(n), rec = V.recordDe("colores", n);
      return `<button class="nivel" data-n="${n}" aria-pressed="${n === nivel}" ${ok ? "" : "disabled"}>
        <b>${NIVELES[n].nom}</b><small>${NIVELES[n].nota}</small>
        ${ok ? `<small>${rec ? "Récord " + rec : "Sin jugar"}</small>` : `<span class="candado">🔒 ${NIVELES[n].abre} aciertos en ${NIVELES[n - 1].nom}</span>`}</button>`; }).join("")}</div>
    <button class="jugar" id="ya">¡A jugar!</button>
    <p class="nota">Cada error te quita 3 segundos. Cada 5 seguidos te dan 3 de vuelta.</p>
    </div>
  </section>`;
  app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => {
    nivel = +b.dataset.n; const d = V.datos(); d.colores = { nivel }; V.guardar(); portada(); });
  document.getElementById("ya").onclick = jugar;
}

function jugar() {
  const r = Math.random;
  let resta = DURACION, aciertos = 0, errores = 0, racha = 0, q = null, esperando = false;
  const vistas = new Set();
  app.innerHTML = `
    <div class="hud"><div class="dato"><b id="hA">0</b><small>Aciertos</small></div>
      <div class="dato"><b id="hR">0</b><small>Seguidos</small></div>
      <div class="dato"><b id="hT">${DURACION}</b><small>Segundos</small></div></div>
    <div class="reloj" id="reloj"><i></i></div>
    <section class="marco">
      <div class="duelo" id="duelo"></div>
      <p class="pregunta" id="preg"></p>
      <div class="respuestas"><button class="resp si" data-r="1">¡Sí!<small>se puede</small></button>
        <button class="resp no" data-r="0">¡No!<small>no se puede</small></button></div>
      <div class="explica" id="exp"></div>
    </section>`;
  const $ = id => document.getElementById(id);
  const botones = app.querySelectorAll("[data-r]");

  function nueva() {
    q = pregunta(nivel, r);
    $("duelo").innerHTML = V.cartica(q.x, { costo: false }) + `<span class="flecha">➜</span>` +
      V.mata(q.o).replace("</button>", `<span class="tu">tu ${esc(R.CULTIVO[q.o.carta.c].label.toLowerCase())}</span></button>`);
    $("preg").textContent = q.x.k === "plaga" ? "¿Le entra esta plaga?" : "¿Le sirve este remedio?";
    $("exp").textContent = ""; $("exp").className = "explica";
    botones.forEach(b => b.disabled = false);
    esperando = false;
  }
  function responder(dijo) {
    if (esperando || resta <= 0) return;
    esperando = true; botones.forEach(b => b.disabled = true);
    const bien = dijo === q.si;
    if (bien) {
      aciertos++; racha++;
      vistas.add(ARTE.clavesCarta(q.x)[0]); vistas.add("c_" + q.o.carta.c);
      V.efecto(q.si ? "proteger" : "descarte");
      if (racha % 5 === 0) { resta = Math.min(DURACION, resta + 3); V.aviso("+3 s", "#F3D27A"); }
    } else {
      errores++; racha = 0; resta = Math.max(0, resta - 3);
      V.efecto("error"); V.aviso("−3 s", "#FFB4A8");
    }
    $("hA").textContent = aciertos; $("hR").textContent = racha;
    $("exp").textContent = bien ? "¡Eso! " + q.porque
      : "¡Uy! " + q.porque.replace(/^Sí:/, "Sí se podía:").replace(/^No:/, "No se podía:");
    $("exp").className = "explica " + (bien ? "bien" : "mal");
    pintarReloj();
    setTimeout(() => { if (resta > 0) nueva(); }, bien ? 1100 : 2300);
  }
  botones.forEach(b => b.onclick = () => responder(b.dataset.r === "1"));
  const teclas = e => { if (e.key === "ArrowLeft" || e.key === "s") responder(true); if (e.key === "ArrowRight" || e.key === "n") responder(false); };
  document.addEventListener("keydown", teclas);

  function pintarReloj() {
    $("hT").textContent = Math.ceil(resta);
    $("reloj").querySelector("i").style.transform = `scaleX(${resta / DURACION})`;
    $("reloj").classList.toggle("poco", resta <= 10);
  }
  /* El reloj solo corre mientras hay pregunta: leer la explicación no cuesta. */
  const tic = setInterval(() => {
    if (esperando) return;
    resta = Math.max(0, resta - .25);
    if (resta <= 5 && Math.abs(resta - Math.round(resta)) < .01 && resta > 0) V.efecto("tic");
    pintarReloj();
    if (resta <= 0) fin();
  }, 250);

  function fin() {
    clearInterval(tic); document.removeEventListener("keydown", teclas);
    botones.forEach(b => b.disabled = true);
    const nuevo = V.record("colores", nivel, aciertos);
    const ganados = V.sumar(aciertos * NIVELES[nivel].mult / 2);
    const lam = aciertos >= 10 ? V.ganarLamina([...vistas].filter(Boolean)) : null;
    V.efecto(aciertos >= 10 ? "victoria" : "derrota");
    const siguiente = NIVELES[nivel + 1];
    V.premio({
      titulo: aciertos + (aciertos === 1 ? " acierto" : " aciertos"),
      linea: (nuevo && aciertos ? "¡Récord nuevo en " + NIVELES[nivel].nom + "! " : "") +
        (siguiente && aciertos >= siguiente.abre ? "Ya puedes jugar el nivel <b>" + siguiente.nom + "</b>. " : "") +
        (errores ? errores + (errores === 1 ? " error" : " errores") + ". " : "Sin un solo error. "),
      arte: V.arteClave("p_comun_platano", { k: "plaga", c: "platano", t: "comun" }), tono: R.CULTIVO.platano.hex,
      cinta: NIVELES[nivel].nom, ganados, lam
    }).then(b => {
      if (b === "salir") location.href = "vereda/index.html";
      else { if (siguiente && abierto(nivel + 1) && aciertos >= siguiente.abre) nivel++; portada(); }
    });
  }
  nueva(); pintarReloj();
}

V.montar({ titulo: "El color manda", volver: "vereda/index.html", escena: "juego" });
portada();
V.cargarArte().then(() => { if (!app.querySelector("#duelo")) portada(); });
})(typeof self !== "undefined" ? self : globalThis);
