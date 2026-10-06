/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — El acertijo del mayordomo (pantalla)
   Una mesa de Cosecha a medio jugar: tus cartas, tus jornales y una
   meta. Se juega con las mismas reglas del juego grande.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
const V = VEREDA, R = REGLAS, A = ARTE, Q = ACERTIJOS, esc = V.esc;
const app = document.getElementById("app");
const PRECIO_PISTA = 5, BONO_DIA = 10, BONO_LIMPIO = 5;

let P = null;          /* el acertijo: {E, meta, solucion, nivel, delDia} */
let E = null;          /* la mesa como va */
let pila = [];         /* para deshacer */
let sel = null;        /* id de la carta tocada */
let pistas = 0, diario = "", pistaId = null;
let nivelPractica = Math.max(1, Math.min(3, (V.datos().acertijoNivel || 1)));

/* ── Portada ───────────────────────────────────────────────── */
function portada() {
  const a = V.datos().acertijo, hecho = !!a.dias[V.hoy()];
  app.innerHTML = `<section class="marco">
    <h2>El acertijo del mayordomo</h2>
    <p>El mayordomo te deja la mesa armada: tu finca, la de los vecinos y unas cartas en la mano. Hoy te presta <b>dos jornales</b>: con ellos tienes que dejar la finca <b>lista</b>. No todas las cartas sirven: piénsalo antes de jugar.</p>
    <div class="dia"><span class="med">${V.arteClave("f_consejo", { k: "faena", tr: "consejo" })}</span>
      <div class="txt"><h3>El acertijo de hoy</h3>
        <p>${hecho ? "¡Ya lo resolviste! Vuelve mañana por otro." : "Uno nuevo cada día, el mismo para todo el mundo. Vale " + (Q.NIVELES[2].granos + BONO_DIA) + " granos."}
          ${a.racha > 0 ? `<br>Racha: <b>${a.racha} ${a.racha === 1 ? "día" : "días"}</b>` : ""}</p>
        <button class="boton" id="dia">${hecho ? "Jugarlo otra vez" : "Resolver el de hoy"}</button></div></div>
    <h2 style="font-size:18px">Para practicar</h2>
    <div class="niveles">${[1, 2, 3].map(n => `<button class="nivel" data-n="${n}" aria-pressed="${n === nivelPractica}">
      <b>${Q.NIVELES[n].nom}</b><small>${Q.NIVELES[n].nota}</small><small>${Q.NIVELES[n].granos} granos</small></button>`).join("")}</div>
    <button class="jugar" id="practica">Otro acertijo</button>
    <p class="nota">Pista del mayordomo: ${PRECIO_PISTA} granos. Resolverlo sin pistas da ${BONO_LIMPIO} de más.</p>
  </section>`;
  app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => {
    nivelPractica = +b.dataset.n; V.datos().acertijoNivel = nivelPractica; V.guardar(); portada(); });
  document.getElementById("dia").onclick = () => empezar(2, V.semilla("acertijo-" + V.hoy()), true);
  document.getElementById("practica").onclick = () => empezar(nivelPractica, Math.random, false);
}

function empezar(nivel, rnd, delDia) {
  app.innerHTML = `<div class="marco cargando">El mayordomo está armando la mesa…</div>`;
  setTimeout(() => {
    const p = Q.crear(nivel, rnd);
    if (!p) { app.innerHTML = `<div class="marco cargando">No salió acertijo. Intenta otra vez.</div>`; return; }
    P = Object.assign(p, { delDia });
    P.E.jugadores[0].nombre = V.nombre() || "Tú";
    E = Q.clonar(P.E); pila = []; sel = null; pistas = 0; pistaId = null;
    diario = "Tienes " + E.jornales + " jornales. ¿Por dónde empiezas?";
    pintar();
  }, 30);
}

/* ── La mesa ───────────────────────────────────────────────── */
const yo = () => E.jugadores[0];
function legales(id) {
  const idx = yo().mano.findIndex(c => c.id === id);
  return idx < 0 ? [] : R.jugadasLegales(E, 0, idx);
}
const blancos = j => j.a ? [j.a.j + "." + j.a.o, j.b.j + "." + j.b.o] : (j.o !== undefined && j.j !== undefined) ? [j.j + "." + j.o]
  : j.o !== undefined ? ["0." + j.o] : [];

function textoMeta() {
  const v = P.meta.frenar ? E.jugadores.find((j, i) => i > 0 && Q.lista(P.E, i)) : null;
  return `Deja tu finca <b>lista</b>: ${E.objetivo} matas distintas y sanas.` +
    (P.meta.frenar ? ` Y ojo: <b>${esc(v ? v.nombre : "el vecino")}</b> tiene la finca lista. Frénalo en el mismo turno.` : "");
}

function pintar() {
  const Ls = sel ? legales(sel) : [];
  const marcadas = new Set(Ls.flatMap(blancos));
  const matas = (j) => E.jugadores[j].finca.map((o, oi) => V.mata(o, `data-mata="${j}.${oi}"`)
    .replace('class="mata ', `class="mata ${marcadas.has(j + "." + oi) ? "blanco " : ""}`)).join("");
  const logr = R.logrados(E, yo());
  const gano = Q.cumple(E, P.meta);
  const sinSalida = !gano && Q.jugadas(E).length === 0;

  app.innerHTML = `
    <section class="marco">
      <div class="meta"><span class="ico">${V.arteClave("f_consejo", { k: "faena", tr: "consejo" })}</span>
        <span>${textoMeta()}${P.delDia ? " <small style='color:var(--oro)'>· acertijo de hoy</small>" : ""}</span></div>
      ${E.jugadores.slice(1).map((v, k) => `<div class="vecino"><div class="quien"><span class="av">${A.avatar(k + 1, 30)}</span>
        <span>${esc(v.nombre)}</span>${Q.lista(E, k + 1) ? `<span class="badge">¡Finca lista!</span>` : ""}
        ${v.maldicion ? `<span class="badge" style="background:#6B4FA8">Madremonte</span>` : ""}</div>
        <div class="finca">${matas(k + 1) || `<span class="nota">Sin matas</span>`}</div></div>`).join("")}
    </section>
    <section class="marco tuya">
      <div class="cab"><h3>Tu finca</h3><span class="cuenta ${logr >= E.objetivo ? "ok" : ""}">${logr} de ${E.objetivo} sanas</span></div>
      ${yo().maldicion ? `<div class="maldito">La <b>Madremonte</b> anda contigo: no puedes cosechar. Para pasársela a otro, usa un remedio en una mata de un vecino.</div>` : ""}
      <div class="finca">${matas(0) || `<span class="nota">Todavía no has sembrado nada.</span>`}</div>
      <div class="jornales">Jornales: ${E.jornales > 0 ? Array.from({ length: E.jornales }, () => "<i></i>").join("") : "<i class='gastado'></i>"}
        <b>${E.jornales}</b></div>
      <div class="mano">${yo().mano.map(c => {
        const puede = R.cuesta(c) <= E.jornales && legales(c.id).length > 0;
        return V.cartica(c, { clase: (c.id === sel ? "sel " : "") + (puede ? "" : "no") + (c.id === pistaId ? " sel" : ""),
          attrs: `data-carta="${c.id}"` }); }).join("") || `<span class="nota">Ya no te quedan cartas.</span>`}</div>
      <div class="opciones" id="ops">${sel ? (Ls.length ? Ls.map((j, i) =>
        `<button class="op ${R.dañina(j.tipo) && (j.j === 0 || (j.a && (j.a.j === 0 && j.b.j === 0))) ? "dano" : ""}" data-op="${i}">${esc(j.etiqueta)}</button>`).join("")
        : `<p class="nota">${R.cuesta(yo().mano.find(c => c.id === sel)) > E.jornales ? "No te alcanzan los jornales para esta carta." : "Esta carta no tiene dónde jugarse ahora."}</p>`) : ""}</div>
      ${sinSalida ? `<div class="fallo">${E.jornales <= 0 ? "Se acabaron los jornales" : "No te queda nada que jugar"} y la finca no quedó lista. Deshaz o empieza de nuevo.</div>` : ""}
      <p class="diario">${esc(diario)}</p>
      <div class="herr"><button class="boton" id="deshacer" ${pila.length ? "" : "disabled"}>↶ Deshacer</button>
        <button class="boton" id="reiniciar" ${pila.length ? "" : "disabled"}>Empezar de nuevo</button>
        <button class="boton" id="pista" ${gano ? "disabled" : ""}>Pista · ${PRECIO_PISTA}</button></div>
    </section>`;

  app.querySelectorAll("[data-carta]").forEach(b => b.onclick = () => {
    sel = sel === b.dataset.carta ? null : b.dataset.carta; pistaId = null; pintar();
    const ops = document.getElementById("ops"); if (ops && sel) ops.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  app.querySelectorAll("[data-op]").forEach(b => b.onclick = () => jugar(sel, Ls[+b.dataset.op]));
  app.querySelectorAll("[data-mata]").forEach(b => b.onclick = () => {
    const k = b.dataset.mata;
    if (sel) {
      const aqui = Ls.filter(j => blancos(j).includes(k));
      if (aqui.length === 1) return jugar(sel, aqui[0]);
    }
    const [j, o] = k.split(".").map(Number), m = E.jugadores[j].finca[o];
    V.ventana(`<div class="medalla" style="--t:${R.CULTIVO[m.carta.c].hex}">${A.dibujoCultivo(m.carta.c)}</div>
      <span class="cinta" style="--t:${R.CULTIVO[m.carta.c].hex}">${esc(R.CULTIVO[m.carta.c].label)}</span>
      <p style="margin-top:12px">${esc(R.explicaMata(m))}</p>`, R.CULTIVO[m.carta.c].hex);
  });
  document.getElementById("deshacer").onclick = () => { E = pila.pop(); sel = null; diario = "Deshiciste la última jugada."; pintar(); };
  document.getElementById("reiniciar").onclick = () => { E = Q.clonar(P.E); pila = []; sel = null; diario = "La mesa quedó como al principio."; pintar(); };
  document.getElementById("pista").onclick = pista;
}

function jugar(id, jugada) {
  if (!jugada) return;
  pila.push(Q.clonar(E));
  const idx = yo().mano.findIndex(c => c.id === id);
  const res = R.aplicar(E, 0, idx, jugada, []);
  diario = (res.registro || []).join(". ") || jugada.etiqueta;
  V.efecto(res.sonido || jugada.tipo);
  sel = null; pistaId = null;
  pintar();
  const b = blancos(jugada)[0];
  const n = b && app.querySelector(`[data-mata="${b}"]`);
  if (n) { n.classList.add("tocada"); setTimeout(() => n.classList.remove("tocada"), 650); }
  if (Q.cumple(E, P.meta)) setTimeout(ganar, 650);
}

function pista() {
  if (V.granos() < PRECIO_PISTA) { V.aviso("Te faltan granos", "#FFB4A8"); return; }
  const s = Q.resolver(E, P.meta, 4);
  if (!s || !s.pasos.length) { diario = "El mayordomo dice: por aquí ya no sale. Deshaz una jugada."; pintar(); return; }
  V.gastar(PRECIO_PISTA); pistas++;
  const p = s.pasos[0], c = yo().mano.find(x => x.id === p.id);
  pistaId = c.id; sel = null;
  diario = "El mayordomo dice: empieza con " + R.nombreCarta(c) + " (" + p.jugada.etiqueta.toLowerCase() + ").";
  pintar();
}

function ganar() {
  const N = Q.NIVELES[P.nivel], d = V.datos();
  let granos = N.granos + (pistas ? 0 : BONO_LIMPIO), extra = [];
  if (!pistas) extra.push("sin pistas");
  if (P.delDia && !d.acertijo.dias[V.hoy()]) {
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    const kAyer = ayer.getFullYear() + "-" + String(ayer.getMonth() + 1).padStart(2, "0") + "-" + String(ayer.getDate()).padStart(2, "0");
    d.acertijo.racha = d.acertijo.dias[kAyer] ? (d.acertijo.racha || 0) + 1 : 1;
    d.acertijo.dias[V.hoy()] = pistas ? "pista" : "limpio";
    granos += BONO_DIA; extra.push("acertijo del día");
    V.guardar();
  }
  const resueltos = (d.acertijoResueltos || 0) + 1; d.acertijoResueltos = resueltos; V.guardar();
  V.record("acertijo", P.nivel, resueltos);
  const ganados = V.sumar(granos);
  const usadas = P.E.jugadores[0].mano.filter(c => !yo().mano.some(x => x.id === c.id)).map(c => A.clavesCarta(c)[0]);
  const lam = V.ganarLamina(usadas.concat(yo().finca.map(o => "c_" + o.carta.c)));
  V.efecto("victoria");
  V.premio({ titulo: "¡Finca lista!", cinta: N.nom + (P.delDia ? " · de hoy" : ""),
    linea: "Lo resolviste en " + pila.length + (pila.length === 1 ? " jugada" : " jugadas") + (extra.length ? ", " + extra.join(" y ") : "") + "." +
      (P.delDia && d.acertijo.racha > 1 ? " Llevas " + d.acertijo.racha + " días seguidos." : ""),
    arte: V.arteClave("f_consejo", { k: "faena", tr: "consejo" }), tono: "#3F6B4A", ganados, lam,
    botones: [["otra", "Otro acertijo", true], ["salir", "Volver a la vereda"]]
  }).then(b => b === "salir" ? (location.href = "vereda/index.html") : empezar(nivelPractica, Math.random, false));
}

V.montar({ titulo: "El acertijo del mayordomo", volver: "vereda/index.html", escena: "juego" });
portada();
V.cargarArte().then(() => P ? pintar() : portada());
})();
