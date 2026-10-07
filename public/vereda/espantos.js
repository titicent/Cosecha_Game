/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — Espantos en la oscuridad (el río, de noche)
   Un juego de tentar la suerte. Cinco noches bajando por la orilla del
   río con el farol en la mano, recogiendo lo que la creciente dejó.
   Antes de cada paso, todos deciden a la vez: ¿sigo o me devuelvo?
     · Lo que aparece se reparte entre los que siguen en el camino.
     · Quien se devuelve guarda en su costal lo que lleva, y se reparte
       lo que sobró en el camino con los que se devuelven con él.
     · Si un espanto sale por segunda vez en la misma noche, todos los
       que siguen en el camino salen corriendo y pierden lo de esa noche.
   El farol alumbra la próxima carta antes de decidir; tiene aceite para
   tres alumbradas en todo el juego.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

/* ── Las cartas del río ─────────────────────────────────────── */
const ESPANTOS = {
  mohan:      { nom: "El Mohán",       arte: "f_mohan_cafe", susto: "salió del agua tocando el tiple" },
  patasola:   { nom: "La Patasola",    arte: "f_patasola",   susto: "se oyó saltando en una sola pata" },
  llorona:    { nom: "La Llorona",     arte: "f_llorona",    susto: "se oyó llorando en la quebrada" },
  duende:     { nom: "El Duende",      arte: "f_duende",     susto: "apagó los faroles de un soplido" },
  madremonte: { nom: "La Madremonte",  arte: "f_madremonte", susto: "sacudió el monte entero" },
  sombreron:  { nom: "El Sombrerón",   arte: "f_sombreron",  susto: "pasó a caballo con su sombrero gigante" }
};
const TIPOS = Object.keys(ESPANTOS);
/* Lo que la creciente dejó en la orilla: entre más valioso, mejor cultivo. */
const VALORES = [1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15, 17];
const cultivoDe = v => v <= 3 ? "huerta" : v <= 5 ? "platano" : v <= 9 ? "cana" : v <= 13 ? "cacao" : "cafe";
const COSA = { huerta: "Canasto de la huerta", platano: "Racimo de plátano", cana: "Atado de caña", cacao: "Costal de cacao", cafe: "Bulto de café" };
const COPIAS = 3, NOCHES = 5, ACEITE = 3;

function barajar(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ── Partida ────────────────────────────────────────────────── */
function nueva(nombres, op) {
  op = op || {};
  const E = { r: op.rnd || Math.random, noche: 0, noches: op.noches || NOCHES, quitados: [], mazo: [], camino: [],
    jugadores: nombres.map((nombre, i) => ({ nombre, costal: 0, lleva: 0, enCamino: false, aceite: op.aceite ?? ACEITE, bot: i > 0 || !!op.todosBots })),
    vistos: {}, fin: false, bitacora: [], sucesos: [] };
  nuevaNoche(E);
  return E;
}
function mazoBase(quitados) {
  const m = VALORES.map((v, i) => ({ k: "h", v, c: cultivoDe(v), id: "h" + i }));
  TIPOS.forEach(t => { const n = COPIAS - quitados.filter(q => q === t).length; for (let i = 0; i < n; i++) m.push({ k: "e", t, id: t + i }); });
  return m;
}
function nuevaNoche(E) {
  E.noche++;
  E.mazo = barajar(mazoBase(E.quitados), E.r);
  E.camino = []; E.vistos = {};
  E.jugadores.forEach(j => { j.enCamino = true; j.lleva = 0; });
  E.sucesos.push({ t: "noche", noche: E.noche });
  revelar(E);
}
const caminantes = E => E.jugadores.filter(j => j.enCamino);
function revelar(E) {
  const x = E.mazo.pop();
  if (!x) return cerrarNoche(E, "vacio");
  E.camino.push(x);
  const w = caminantes(E);
  if (x.k === "h") {
    const parte = Math.floor(x.v / w.length);
    w.forEach(j => { j.lleva += parte; });
    x.resto = x.v - parte * w.length;
    E.sucesos.push({ t: "hallazgo", carta: x, parte });
  } else {
    E.vistos[x.t] = (E.vistos[x.t] || 0) + 1;
    if (E.vistos[x.t] >= 2) {
      const perdieron = w.map(j => ({ i: E.jugadores.indexOf(j), nombre: j.nombre, lleva: j.lleva }));
      w.forEach(j => { j.lleva = 0; j.enCamino = false; });
      E.quitados.push(x.t);
      E.sucesos.push({ t: "espantados", carta: x, perdieron });
      return cerrarNoche(E, "espanto");
    }
    E.sucesos.push({ t: "espanto", carta: x });
  }
}
/* Lo que sobró en el camino (los restos que no se pudieron repartir). */
const sobrante = E => E.camino.reduce((a, x) => a + (x.k === "h" ? x.resto : 0), 0);

/* Todos deciden a la vez: decisiones[i] = "seguir" | "volver" para los que están en el camino. */
function decidir(E, decisiones) {
  if (E.fin) return;
  const w = E.jugadores.map((j, i) => i).filter(i => E.jugadores[i].enCamino);
  const vuelven = w.filter(i => decisiones[i] === "volver");
  if (vuelven.length) {
    const total = sobrante(E), parte = Math.floor(total / vuelven.length);
    let queda = total - parte * vuelven.length;
    E.camino.forEach(x => { if (x.k === "h") x.resto = 0; });
    const ult = [...E.camino].reverse().find(x => x.k === "h"); if (ult) ult.resto = queda;
    vuelven.forEach(i => { const j = E.jugadores[i]; j.costal += j.lleva + parte; E.sucesos.push({ t: "volvio", i, guarda: j.lleva + parte, sobrante: parte });
      j.lleva = 0; j.enCamino = false; });
  }
  if (!caminantes(E).length) return cerrarNoche(E, "todos");
  revelar(E);
}
function cerrarNoche(E, por) {
  /* si se acabó el camino, los que seguían guardan lo que llevan */
  if (por === "vacio") caminantes(E).forEach(j => { j.costal += j.lleva; j.lleva = 0; j.enCamino = false; });
  E.sucesos.push({ t: "finNoche", noche: E.noche, por });
  if (E.noche >= E.noches) {
    E.fin = true;
    const max = Math.max(...E.jugadores.map(j => j.costal));
    E.ganadores = E.jugadores.map((j, i) => i).filter(i => E.jugadores[i].costal === max);
    E.sucesos.push({ t: "fin", ganadores: E.ganadores });
    return;
  }
  E.esperaNoche = true;          /* la pantalla muestra el resumen y luego llama a seguirNoche */
}
function seguirNoche(E) { if (E.esperaNoche && !E.fin) { E.esperaNoche = false; nuevaNoche(E); } }

/* El farol: la próxima carta, solo para quien alumbra. */
function alumbrar(E, i) {
  const j = E.jugadores[i];
  if (!j.enCamino || j.aceite <= 0 || !E.mazo.length) return null;
  j.aceite--;
  return E.mazo[E.mazo.length - 1];
}

/* ── Riesgo y vecinos de la máquina ─────────────────────────── */
/* Probabilidad de que la próxima carta espante a todos. */
function riesgo(E) {
  if (!E.mazo.length) return 0;
  const malas = E.mazo.filter(x => x.k === "e" && E.vistos[x.t] === 1).length;
  return malas / E.mazo.length;
}
/* Cada vecino tiene su temperamento: el umbral de lo que se atreve a arriesgar. */
const TEMPERAMENTOS = [
  { nom: "prudente", umbral: 7,  ruido: 0.05 },
  { nom: "echado pa'lante", umbral: 16, ruido: 0.12 },
  { nom: "calculador", umbral: 11, ruido: 0.03 },
  { nom: "atrevido", umbral: 22, ruido: 0.15 }
];
function decideBot(E, i, temp, conFarol) {
  const j = E.jugadores[i], r = E.r, p = riesgo(E);
  const w = caminantes(E).length;
  const hRest = E.mazo.filter(x => x.k === "h"), prom = hRest.length ? hRest.reduce((a, x) => a + x.v, 0) / hRest.length : 0;
  const gana = (1 - p) * (hRest.length / Math.max(1, E.mazo.length)) * prom / w;
  const pierde = p * j.lleva;
  const sobra = sobrante(E);
  /* el farol se usa cuando la cosa está peluda y hay algo que perder */
  if (conFarol && j.aceite > 0 && p >= 0.12 && j.lleva >= 5) {
    const x = alumbrar(E, i);
    if (x) return x.k === "e" && E.vistos[x.t] === 1 ? "volver" : "seguir";
  }
  if (j.lleva + sobra / Math.max(1, w) >= temp.umbral * (1 + (r() - .5) * temp.ruido * 4)) return "volver";
  if (pierde > gana * (1.4 + r() * temp.ruido * 6)) return "volver";
  if (E.noche === E.noches && j.lleva > 0 && p > 0.25) return "volver";
  return "seguir";
}

const API = { ESPANTOS, TIPOS, VALORES, COSA, cultivoDe, NOCHES, ACEITE, COPIAS, TEMPERAMENTOS,
  nueva, decidir, seguirNoche, alumbrar, riesgo, sobrante, caminantes, decideBot, mazoBase };
raiz.ESPANTOS_RIO = API;
if (typeof module !== "undefined" && module.exports) { module.exports = API; return; }

/* ── Pantalla ──────────────────────────────────────────────── */
const V = raiz.VEREDA, R = raiz.REGLAS, A = raiz.ARTE, esc = V.esc;
const app = document.getElementById("app");
const VECINOS = ["Caturra", "Borbón", "Típica", "Castillo"];
let cuantos = Math.min(5, Math.max(3, +(V.datos().espantosJug || 4)));
const arteE = t => V.arteClave(ESPANTOS[t].arte, { k: "faena", tr: ESPANTOS[t].arte.slice(2) });
const arteH = c => V.arteClave("c_" + c, { k: "cultivo", c });
const mayus = t => t.charAt(0).toUpperCase() + t.slice(1);
const ESPERA = ms => new Promise(res => setTimeout(res, ms));

function portada() {
  const rec = V.recordDe("espantos", 1);
  app.innerHTML = `<section class="marco v-portada"><div class="v-cuento">
    <h2>Espantos en la oscuridad</h2>
    <p>La creciente del río dejó cosecha regada por la orilla. Cinco noches vas a bajar con el farol a recogerla… pero de noche en el río salen espantos.</p>
    <ol class="pasos">
      <li><b>Antes de cada paso</b>, todos deciden a la vez: <b>sigo</b> o <b>me devuelvo</b>.</li>
      <li>Lo que aparece se reparte entre los que siguen en el camino. Lo que no alcanza a repartirse queda en el suelo.</li>
      <li>Quien se devuelve guarda en su costal lo que lleva, y se reparte lo del suelo con los que se devuelven con él.</li>
      <li>Si un espanto sale <b>por segunda vez</b> en la misma noche, los que siguen en el camino salen corriendo y <b>pierden lo de esa noche</b>.</li>
      <li>Tu <b>farol</b> alumbra la próxima carta antes de decidir. Tiene aceite para tres alumbradas en todo el juego.</li>
    </ol>
    </div><div class="v-elige">
    <div class="galeria-esp">${TIPOS.map(t => `<span title="${esc(ESPANTOS[t].nom)}">${arteE(t)}</span>`).join("")}</div>
    <div class="rot">¿Cuántos bajan al río?</div>
    <div class="niveles">${[3, 4, 5].map(n => `<button class="nivel" data-n="${n}" aria-pressed="${n === cuantos}"><b>${n}</b><small>tú y ${n - 1} vecinos</small></button>`).join("")}</div>
    <button class="jugar" id="ya">Prender el farol</button>
    <p class="nota">${rec ? "Tu costal más lleno: " + rec + " granos" : "Todavía no tienes récord."}</p>
    </div>
  </section>`;
  app.querySelectorAll(".nivel").forEach(b => b.onclick = () => { cuantos = +b.dataset.n; V.datos().espantosJug = cuantos; V.guardar(); portada(); });
  document.getElementById("ya").onclick = jugar;
}

function jugar() {
  const yo = V.nombre() || "Tú";
  const E = nueva([yo].concat(VECINOS.slice(0, cuantos - 1)));
  const caras = A.carasMesa(cuantos);   /* tú con tu cara; los vecinos, las que quedan */
  const temps = E.jugadores.map((_, i) => TEMPERAMENTOS[(i + Math.floor(Math.random() * 4)) % 4]);
  let vistoSuc = 0, alumbrado = null, ocupado = false, decis = {};
  const guiada = !!(window.GUIA && !GUIA.hecha("espantos"));
  if (guiada) {
    /* La primera noche viene arreglada: un hallazgo, el Mohán, otro hallazgo
       y, si sigues, el Mohán otra vez. El farol te deja verlo venir. */
    const todo = E.mazo.concat(E.camino);
    const toma = f => todo.splice(todo.findIndex(f), 1)[0];
    const arriba = [toma(x => x.k === "h" && x.v === 7), toma(x => x.k === "e" && x.t === "mohan"), toma(x => x.k === "h" && x.v === 5), toma(x => x.k === "e" && x.t === "mohan")];
    E.camino = []; E.vistos = {}; E.jugadores.forEach(j => { j.lleva = 0; });
    E.sucesos = E.sucesos.filter(x => x.t === "noche");
    E.mazo = todo.concat(arriba.reverse());
    revelar(E);
  }

  function pintar() {
    const mi = E.jugadores[0], p = riesgo(E);
    const vistos = TIPOS.filter(t => E.vistos[t] === 1);
    const sobra = sobrante(E);
    app.innerHTML = `
      <div class="hud"><div class="dato"><b>${E.noche}/${E.noches}</b><small>Noche</small></div>
        <div class="dato"><b>${mi.lleva}</b><small>Llevas</small></div>
        <div class="dato"><b>${mi.costal}</b><small>Costal</small></div>
        <div class="dato farol-hud"><b>${mi.aceite}</b><small>Aceite</small></div></div>
      <section class="rio">
        <div class="camino-rio" id="camino">${E.camino.map((x, k) => cartaRio(x, k === E.camino.length - 1)).join("")}
          ${alumbrado ? `<div class="carta-rio alumbrada">${x2(alumbrado)}<small>Lo que viene</small></div>` : ""}</div>
        <div class="suelo">${sobra ? `En el suelo quedaron <b>${sobra}</b> para los que se devuelvan.` : "No quedó nada en el suelo."}
          · Quedan ${E.mazo.length} cartas en el camino.</div>
      </section>
      <section class="alerta ${vistos.length ? "si" : ""}">
        ${vistos.length ? `<b>Ya salieron esta noche:</b><span class="vistos">${vistos.map(t => `<span title="${esc(ESPANTOS[t].nom)}">${arteE(t)}</span>`).join("")}</span>
          <small>Si vuelve a salir uno de estos, ¡todos corren! Hoy la probabilidad es de ${Math.round(p * 100)} %.</small>`
          : `<b>La noche está tranquila.</b><small>Todavía no ha salido ningún espanto.</small>`}
      </section>
      <section class="gente">${E.jugadores.map((j, i) => `<div class="persona ${j.enCamino ? "camina" : "casa"} ${i === 0 ? "yo" : ""}">
          ${A.avatar(caras[i], 40)}<span class="nom">${esc(j.nombre)}${i === 0 && j.nombre !== "Tú" ? " (tú)" : ""}<small>${j.enCamino ? "en el camino" : "en la casa"}${decis[i] ? " · " + (decis[i] === "volver" ? "se devuelve" : "sigue") : ""}</small></span>
          <span class="lleva" title="lo que lleva esta noche">${j.lleva}</span><span class="costal-p" title="costal">${j.costal}</span></div>`).join("")}
        <div class="leyenda-p"><span>lleva esta noche</span><span>costal</span></div></section>
      <div class="decide">${mi.enCamino && !E.fin && !E.esperaNoche
        ? `<button class="boton" id="farol" ${mi.aceite && !alumbrado ? "" : "disabled"}>Alumbrar con el farol${mi.aceite ? " (" + mi.aceite + ")" : ""}</button>
           <button class="jugar sigo" id="sigo">Sigo</button><button class="jugar vuelvo" id="vuelvo">Me devuelvo</button>`
        : `<span class="espera">${E.fin ? "Se acabó el juego." : mi.enCamino ? "" : "Estás en la casa: mira cómo les va a los demás…"}</span>`}</div>`;
    const $ = id => document.getElementById(id);
    const c = $("camino"); c.scrollLeft = c.scrollWidth;
    if ($("sigo")) { $("sigo").onclick = () => turno("seguir"); $("vuelvo").onclick = () => turno("volver"); }
    if ($("farol")) $("farol").onclick = () => { alumbrado = alumbrar(E, 0); V.efecto("aparicion"); pintar(); };
  }
  function x2(x) { return x.k === "h" ? `<span class="ilu">${arteH(x.c)}</span><b class="v">${x.v}</b><span class="n">${esc(COSA[x.c])}</span>`
    : `<span class="ilu">${arteE(x.t)}</span><span class="n">${esc(ESPANTOS[x.t].nom)}</span>`; }
  function cartaRio(x, nueva) {
    return `<div class="carta-rio ${x.k === "e" ? "espanto" : ""} ${nueva ? "nueva" : ""}" style="--t:${x.k === "h" ? R.CULTIVO[x.c].hex : "#6B4FA8"}">${x2(x)}
      ${x.k === "h" && x.resto ? `<span class="resto" title="quedó en el suelo">${x.resto}</span>` : ""}</div>`;
  }

  /* Lo que va pasando, uno por uno, con su aviso. */
  async function contar() {
    const nuevos = E.sucesos.slice(vistoSuc); vistoSuc = E.sucesos.length;
    for (const s of nuevos) {
      if (s.t === "hallazgo") { V.efecto("bajar"); V.aviso("+" + s.parte + " para cada uno", "#F3D27A"); }
      if (s.t === "espanto") { V.efecto("aparicion"); V.aviso(ESPANTOS[s.carta.t].nom + "…", "#D9C8FF"); }
      if (s.t === "espantados") { V.efecto("truco"); await ESPERA(200); }
      if (s.t === "volvio" && s.i === 0) V.efecto("proteger");
    }
    return nuevos;
  }
  async function turno(mia) {
    if (ocupado) return; ocupado = true;
    decis = {};
    E.jugadores.forEach((j, i) => { if (j.enCamino) decis[i] = i === 0 ? mia : decideBot(E, i, temps[i], true); });
    alumbrado = null;
    pintar(); await ESPERA(700);                          /* todos muestran su decisión a la vez */
    decidir(E, decis); decis = {};
    const nuevos = await contar();
    pintar();
    const fin = nuevos.find(s => s.t === "finNoche");
    if (fin) { await ESPERA(900); return resumenNoche(nuevos); }
    ocupado = false;
    if (!E.jugadores[0].enCamino) { await ESPERA(900); turno(null); }       /* los vecinos siguen solos */
  }
  async function resumenNoche(nuevos) {
    const esp = nuevos.find(s => s.t === "espantados"), vueltas = nuevos.filter(s => s.t === "volvio");
    const tono = esp ? "#6B4FA8" : "#4A6338";
    const linea = esp ? `${ESPANTOS[esp.carta.t].nom} ${ESPANTOS[esp.carta.t].susto}. ` +
        (esp.perdieron.length ? mayus(esp.perdieron.map(p => p.i === 0 ? (p.lleva ? "tú soltaste " + p.lleva : "tú saliste corriendo") : esc(p.nombre) + (p.lleva ? " soltó " + p.lleva : " salió corriendo")).join(", ")) + "." : "Menos mal ya todos estaban en la casa.")
      : "Todos volvieron a salvo a la casa.";
    if (E.fin) return final(linea);
    const v = document.createElement("div"); v.className = "velo-modal";
    v.innerHTML = `<div class="modal" style="--t:${tono}"><div class="medalla">${esp ? arteE(esp.carta.t) : arteH("cafe")}</div>
      <span class="cinta">Noche ${E.noche}</span><h2>${esp ? "¡Espantados!" : "Noche tranquila"}</h2><p>${linea}</p>
      ${esp ? `<p class="nota">Una carta de ${esc(ESPANTOS[esp.carta.t].nom)} se queda en la casa: las próximas noches sale menos.</p>` : ""}
      <div class="tabla">${E.jugadores.map((j, i) => `<div>${A.avatar(caras[i], 30)}<span>${esc(j.nombre)}</span><b>${j.costal}</b></div>`).join("")}</div>
      <div class="fila"><button class="jugar" id="sig">Noche ${E.noche + 1}</button></div></div>`;
    document.body.appendChild(v);
    v.querySelector("#sig").onclick = async () => { v.remove(); seguirNoche(E); await contar(); ocupado = false; pintar(); };
  }
  function final(linea) {
    const orden = E.jugadores.map((j, i) => ({ j, i })).sort((a, b) => b.j.costal - a.j.costal);
    const gano = E.ganadores.includes(0), mi = E.jugadores[0];
    const nuevo = V.record("espantos", 1, mi.costal);
    const ganados = V.sumar(mi.costal / 3 + (gano ? 10 : 0));
    const lam = gano ? V.ganarLamina(["f_mohan_cafe", "f_mohan_platano", "f_mohan_cacao", "f_mohan_cana", "f_patasola", "f_duende", "f_llorona", "f_madremonte", "f_sombreron"]) : null;
    V.efecto(gano ? "victoria" : "derrota");
    V.premio({
      titulo: gano ? (E.ganadores.length > 1 ? "¡Empate en el río!" : "¡El costal más lleno!") : E.jugadores[E.ganadores[0]].nombre + " ganó",
      linea: linea + "<br><br>" + orden.map(({ j, i }) => (i === 0 ? "<b>" : "") + esc(j.nombre) + ": " + j.costal + (i === 0 ? "</b>" : "")).join(" · ") +
        (nuevo && mi.costal ? "<br>¡Récord nuevo!" : ""),
      arte: arteE("mohan"), tono: "#6B4FA8", cinta: "Espantos en la oscuridad", ganados, lam
    }).then(b => b === "salir" ? (location.href = "vereda/index.html") : portada());
  }
  contar().then(() => { pintar(); if (guiada) guiar(); });

  function guiar() {
    const $ = q => document.querySelector(q);
    const quieto = n => () => E.camino.length >= n && !ocupado;
    GUIA.iniciar([
      { objetivo: () => $(".camino-rio"), texto: "Esto dejó la creciente. Se reparte entre los que siguen en el camino", ms: 3400 },
      { objetivo: () => $(".gente"), texto: "Antes de cada paso, todos deciden a la vez: seguir o devolverse", ms: 3200 },
      { objetivo: () => $("#sigo"), texto: "Toca Sigo para dar otro paso", hecho: quieto(2) },
      { objetivo: () => $(".alerta"), texto: "¡Salió el Mohán! Si sale otra vez esta noche, todos los que sigan salen corriendo", ms: 3800 },
      { objetivo: () => $("#sigo"), texto: "Arriésgate un paso más", hecho: quieto(3) },
      { objetivo: () => $("#farol"), texto: "Usa el farol para ver lo que viene", hecho: () => !!alumbrado },
      { objetivo: () => $(".alumbrada"), texto: "¡El Mohán otra vez! Mejor devuélvete", ms: 3000 },
      { objetivo: () => $("#vuelvo"), texto: "Toca Me devuelvo", hecho: () => !E.jugadores[0].enCamino },
      { objetivo: () => $(".hud .dato:nth-child(3)"), texto: "Lo que llevabas quedó en tu costal. En 5 noches gana el costal más lleno", ms: 3800 }
    ], { alTerminar: () => GUIA.marcar("espantos"), alSaltar: () => GUIA.marcar("espantos") });
  }
}

V.montar({ titulo: "Espantos en la oscuridad", volver: "vereda/index.html", escena: "noche" });
portada();
V.cargarArte();
})(typeof self !== "undefined" ? self : globalThis);
