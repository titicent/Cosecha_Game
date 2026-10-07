/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — La Galería (la plaza del pueblo): la pantalla
   Cada uno en su teléfono ofrece en secreto; el servidor guarda las
   ofertas y las destapa todas a la vez. También se juega contra los
   vecinos de la máquina.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
const V = VEREDA, G = GALERIA, A = ARTE, esc = V.esc;
const app = document.getElementById("app");
const SERVIDOR = (window.COSECHA_SERVIDOR || "").replace(/\/+$/, "");
const direccionWs = () => SERVIDOR ? SERVIDOR.replace(/^http/, "ws") : (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host;
const LLAVE = "cosecha.galeria.sesion";
const leer = () => { try { return JSON.parse(localStorage.getItem(LLAVE) || "null"); } catch (e) { return null; } };
const escribir = v => { try { localStorage.setItem(LLAVE, JSON.stringify(v)); } catch (e) {} };

let ws = null, S = leer(), vista = null, pendiente = null, oferta = 0, pref = { vecinos: 3, nivel: "normal" };
let rondaVista = 0, premiado = false, limite = 0;
const codigoURL = (new URLSearchParams(location.search).get("sala") || "").toUpperCase();
const arteC = c => V.arteClave("c_" + c, { k: "cultivo", c });

/* ── Conexión ──────────────────────────────────────────────── */
function conectar() {
  ws = new WebSocket(direccionWs());
  ws.onopen = () => {
    if (pendiente) { ws.send(JSON.stringify(pendiente)); pendiente = null; }
    else if (S) ws.send(JSON.stringify({ juego: "galeria", t: "reconectar", codigo: S.codigo, token: S.token }));
  };
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.t === "g_sesion") { S = { codigo: m.codigo, token: m.token }; escribir(S); }
    if (m.t === "g_vista") recibir(m.v);
    if (m.t === "g_error") V.aviso(m.msg, "#FFB4A8");
    if (m.t === "g_perdida") { S = null; escribir(null); vista = null; pintar(); }
  };
  ws.onclose = () => setTimeout(conectar, 1500);
}
function mandar(m) {
  m.juego = "galeria";
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(m));
  else { pendiente = m; if (!ws || ws.readyState > 1) conectar(); }
}
setInterval(() => { if (ws && ws.readyState === 1) ws.send('{"t":"latido"}'); }, 25000);

function recibir(v) {
  const antes = vista; vista = v;
  limite = v.restante != null ? Date.now() + v.restante * 1000 : 0;
  if (!antes || antes.ronda !== v.ronda || antes.fase !== v.fase) {
    if (v.fase === "pujando" && (!antes || antes.ronda !== v.ronda)) { oferta = Math.min(1, v.jugadores[v.yo].monedas); V.efecto("turno"); }
    if (v.fase === "revelado") V.efecto(v.ultima && v.ultima.ganador === v.yo ? "certificar" : v.ultima && v.ultima.empate ? "segunda" : "descarte");
  }
  pintar();
}

/* ── Pantallas ─────────────────────────────────────────────── */
function pintar() {
  if (!vista) return portada();
  if (!vista.iniciada) return plaza();
  if (vista.fase === "fin") return final();
  subasta();
  revisarGuia();
}

/* La primera subasta, la manito acompaña el primer lote. */
let guiaEnCurso = false;
function revisarGuia() {
  if (guiaEnCurso || !window.GUIA || GUIA.hecha("galeria") || !vista || vista.fase !== "pujando" || vista.ronda !== 1) return;
  guiaEnCurso = true;
  const $ = q => document.querySelector(q), mi = () => vista.jugadores[vista.yo];
  GUIA.iniciar([
    { objetivo: () => $(".lotes"), texto: "Este es el lote que se subasta", ms: 2800 },
    { objetivo: () => $(".vale"), texto: "Esto te sumaría a ti si te lo llevas", ms: 2800 },
    { objetivo: () => $('.rapidas [data-k="3"]'), texto: "Escoge cuánto ofreces. Prueba con 3", hecho: () => oferta === 3 || mi().listo },
    { objetivo: () => $("#ofrecer"), texto: "Ofrécelo: nadie ve tu oferta", hecho: () => mi().listo || vista.fase !== "pujando" },
    { objetivo: () => $(".tabla-g"), texto: "Esperando a los demás…", esperar: true, hecho: () => vista.fase !== "pujando" || vista.ronda > 1 },
    { objetivo: () => $(".tabla-g"), texto: "Se destapan todas a la vez: la oferta más alta se lleva el lote", ms: 3400 },
    { objetivo: () => $(".nota"), texto: "Al final cuentan los cultivos que juntes y los pesos que te sobren", ms: 3600 }
  ], { alTerminar: () => GUIA.marcar("galeria"), alSaltar: () => GUIA.marcar("galeria") });
}

function portada() {
  app.innerHTML = `<section class="marco v-portada"><div class="v-cuento">
    <h2>La Galería</h2>
    <p>Es día de mercado en la plaza del pueblo. Salen lotes de cosecha y cada uno ofrece en secreto, desde su teléfono, cuántos pesos da.</p>
    <ol class="pasos">
      <li>Todos empiezan con <b>${G.MONEDAS} pesos</b>. Hay 12 lotes.</li>
      <li>Se destapan las ofertas a la vez: <b>la más alta se lleva el lote</b> y paga lo que ofreció.</li>
      <li>Si empatan, se lo lleva quien tenga menos cosecha. Si siguen empatados, nadie lo compra y se junta con el lote siguiente.</li>
      <li>Al final, cada cultivo da más puntos entre más juntes: <b>1, 3, 6, 10…</b> Y cada ${G.POR_MONEDA} pesos que te sobren valen 1 punto.</li>
    </ol>
    </div><div class="v-elige">
    <div class="dos">
      <div><div class="rot">Contra los vecinos</div>
        <div class="seg" data-g="vecinos">${[1, 2, 3, 4, 5].map(n => `<button aria-pressed="${n === pref.vecinos}" data-v="${n}">${n}</button>`).join("")}</div>
        <div class="seg" data-g="nivel">${[["novato", "Novatos"], ["normal", "Normales"], ["baquiano", "Baquianos"]].map(([k, t]) => `<button aria-pressed="${k === pref.nivel}" data-v="${k}">${t}</button>`).join("")}</div>
        <button class="jugar" id="solo">¡A la plaza!</button></div>
      <div><div class="rot">Con amigos, cada uno en su teléfono</div>
        <input class="campo" id="nombre" maxlength="14" placeholder="Tu nombre" value="${esc(V.nombre())}">
        <button class="boton ancho" id="abrir">Abrir una plaza</button>
        <div class="fila"><input class="campo codigo" id="codigo" maxlength="4" placeholder="ABCD" value="${esc(codigoURL)}"><button class="boton" id="entrar">Entrar</button></div></div>
    </div>
    <p class="nota">${V.recordDe("galeria", 1) ? "Tu mejor subasta: " + V.recordDe("galeria", 1) + " puntos" : ""}</p>
    </div>
  </section>`;
  app.querySelectorAll(".seg").forEach(g => g.querySelectorAll("button").forEach(b => b.onclick = () => {
    pref[g.dataset.g] = g.dataset.g === "vecinos" ? +b.dataset.v : b.dataset.v; portada(); }));
  const nom = () => { const n = document.getElementById("nombre").value.trim() || V.nombre() || "Tú";
    try { localStorage.setItem("cosecha.nombre", n); } catch (e) {} return n; };
  document.getElementById("solo").onclick = () => mandar({ t: "crear", nombre: nom(), bots: Array(pref.vecinos).fill(pref.nivel), empezar: true, cara: A.miCara() });
  document.getElementById("abrir").onclick = () => mandar({ t: "crear", nombre: nom(), cara: A.miCara() });
  document.getElementById("entrar").onclick = () => { const c = document.getElementById("codigo").value.trim().toUpperCase();
    if (c.length !== 4) return V.aviso("El código tiene 4 letras", "#FFB4A8"); mandar({ t: "unir", codigo: c, nombre: nom(), cara: A.miCara() }); };
}

function plaza() {
  const soy = vista.yo === vista.anfitrion, n = vista.jugadores.length;
  const enlace = location.origin + location.pathname + "?sala=" + vista.codigo;
  app.innerHTML = `<section class="marco plaza-sala" style="text-align:center"><div class="plaza-cod">
    <h2>La plaza está abierta</h2><p>Comparte este código con los que van a ofrecer:</p>
    <div class="clave">${[...vista.codigo].map(l => `<i>${l}</i>`).join("")}</div>
    <button class="boton" id="copiar">Copiar enlace</button></div><div class="plaza-gente">
    <div class="gente-g">${vista.jugadores.map((j, i) => `<div>${A.avatar(A.caraDe(j, i), 36)}<span>${esc(j.nombre)}${i === vista.yo ? " (tú)" : ""}<small>${j.bot ? "vecino · " + j.bot : i === vista.anfitrion ? "abrió la plaza" : "listo"}</small></span></div>`).join("")}</div>
    ${soy ? `<div class="fila centro"><button class="boton" id="mas" ${n >= G.MAX_JUG ? "disabled" : ""}>+ Vecino</button><button class="boton" id="menos" ${vista.jugadores.some(j => j.bot) ? "" : "disabled"}>− Vecino</button></div>
      <button class="jugar" id="empezar" ${n < G.MIN_JUG ? "disabled" : ""}>Empezar la subasta</button>`
      : `<p>Esperando a que ${esc(vista.jugadores[vista.anfitrion].nombre)} empiece…</p>`}
    <p class="nota"><button class="boton" id="salir">Salir</button></p></div></section>`;
  const on = (id, f) => { const e = document.getElementById(id); if (e) e.onclick = f; };
  on("copiar", () => navigator.clipboard ? navigator.clipboard.writeText(enlace).then(() => V.aviso("Enlace copiado")) : prompt("Copia el enlace:", enlace));
  on("mas", () => mandar({ t: "bot", nivel: pref.nivel }));
  on("menos", () => mandar({ t: "quitarbot" }));
  on("empezar", () => mandar({ t: "empezar" }));
  on("salir", salir);
}
function salir() { mandar({ t: "salir" }); S = null; escribir(null); vista = null; history.replaceState(null, "", location.pathname); pintar(); }

function loteHTML(x) {
  return `<div class="lote" style="--t:${G.COLOR[x.c]}"><span class="ilu">${arteC(x.c)}${x.n > 1 ? `<span class="ilu dos">${arteC(x.c)}</span>` : ""}</span>
    <b>${esc(G.nombreLote(x))}</b>${x.n > 1 ? `<span class="x2">×2</span>` : ""}</div>`;
}
function bodegaHTML(b) {
  return G.CULTIVOS.map(c => `<span class="cul ${b && b[c] ? "" : "vacio"}" style="--t:${G.COLOR[c]}" title="${G.NOMBRE[c]}">${arteC(c)}<b>${b ? b[c] : 0}</b></span>`).join("");
}
function subasta() {
  const v = vista, yo = v.yo, mi = v.jugadores[yo], pujando = v.fase === "pujando";
  const vale = G.suma({ bodega: mi.bodega }, v.mesa);
  const u = v.ultima;
  let cab = "";
  if (!pujando && u) {
    const g = u.ganador !== null ? v.jugadores[u.ganador] : null;
    cab = `<div class="resultado ${u.ganador === yo ? "mio" : ""}">${g ? `<b>${u.ganador === yo ? "¡Te lo llevaste!" : esc(g.nombre) + " se lo lleva"}</b> por ${u.max} ${u.max === 1 ? "peso" : "pesos"}`
      : u.empate ? `<b>¡Empate en ${u.max}!</b> Nadie lo compra: se junta con el lote que sigue.` : v.quedan ? "<b>Nadie ofreció.</b> El lote se fue sin dueño." : "<b>Sin dueño.</b>"}</div>`;
  }
  const lotes = pujando ? v.mesa : (u ? u.lotes : []);
  app.innerHTML = `
    <div class="hud"><div class="dato"><b>${Math.min(v.ronda, v.rondas)}/${v.rondas}</b><small>Lote</small></div>
      <div class="dato"><b>${mi.monedas}</b><small>Pesos</small></div>
      <div class="dato"><b>${mi.puntos ? mi.puntos.total : 0}</b><small>Puntos</small></div>
      <div class="dato"><b id="reloj">${v.restante != null ? v.restante : "—"}</b><small>Segundos</small></div></div>
    <section class="mostrador">
      <div class="lotes">${lotes.map(loteHTML).join("")}</div>
      ${pujando && v.mesa.length > 1 ? `<p class="junto">¡Se juntaron ${v.mesa.length} lotes por el empate!</p>` : ""}
      ${pujando ? `<p class="vale">${vale ? `A ti te sumaría <b>+${vale} ${vale === 1 ? "punto" : "puntos"}</b>.` : "A ti no te suma puntos, pero puedes quitárselo a otro."}</p>` : cab}
    </section>
    ${pujando ? (mi.listo ? `<section class="oferta hecha">Ofreciste <b>${mi.puja}</b>. Esperando a los demás…</section>`
      : `<section class="oferta">
        <div class="monto"><button class="boton redondo" id="menos" aria-label="Menos">−</button><b id="cuanto">${oferta}</b><button class="boton redondo" id="mas" aria-label="Más">+</button></div>
        <div class="rapidas">${[0, 1, 2, 3, 5, 8].filter(k => k <= mi.monedas).map(k => `<button class="boton chico" data-k="${k}">${k}</button>`).join("")}</div>
        <button class="jugar" id="ofrecer">Ofrecer ${oferta} ${oferta === 1 ? "peso" : "pesos"}</button></section>`) : ""}
    <section class="gente-g tabla-g">${v.jugadores.map((j, i) => `<div class="${u && !pujando && u.ganador === i ? "gana" : ""} ${i === yo ? "yo" : ""}">
        ${A.avatar(A.caraDe(j, i), 34)}<span class="nm">${esc(j.nombre)}${i === yo ? " (tú)" : ""}<small>${j.monedas} pesos${!j.conectado && !j.bot ? " · sin conexión" : ""}</small></span>
        <span class="bod">${bodegaHTML(j.bodega)}</span>
        <span class="of ${pujando ? (j.listo ? "listo" : "") : "abierta"}">${pujando ? (j.listo ? (i === yo ? j.puja : "✓") : "…") : (u ? u.pujas[i] : "")}</span></div>`).join("")}</section>
    <p class="nota">Puntos por cultivo según cuántos juntes: ${G.TABLA.slice(1, 6).map((p, k) => (k + 1) + "→" + p).join(" · ")}. Cada ${G.POR_MONEDA} pesos que sobren, 1 punto.</p>`;
  const $ = id => document.getElementById(id);
  const fija = k => { oferta = Math.max(0, Math.min(mi.monedas, k)); subasta(); };
  if ($("menos")) { $("menos").onclick = () => fija(oferta - 1); $("mas").onclick = () => fija(oferta + 1);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => fija(+b.dataset.k));
    $("ofrecer").onclick = () => mandar({ t: "pujar", monto: oferta }); }
}

function final() {
  const v = vista, yo = v.yo;
  const orden = v.jugadores.map((j, i) => ({ j, i })).sort((a, b) => b.j.puntos.total - a.j.puntos.total || b.j.monedas - a.j.monedas);
  const gano = v.ganadores.includes(yo), mi = v.jugadores[yo];
  app.innerHTML = `<section class="marco plaza-fin" style="text-align:center"><h2>Se cerró la plaza</h2>
    <div class="gente-g tabla-g final">${orden.map(({ j, i }) => `<div class="${v.ganadores.includes(i) ? "gana" : ""} ${i === yo ? "yo" : ""}">
      ${A.avatar(A.caraDe(j, i), 34)}<span class="nm">${esc(j.nombre)}${i === yo ? " (tú)" : ""}<small>${j.puntos.cosecha} de cosecha + ${j.puntos.monedas} de pesos</small></span>
      <span class="bod">${bodegaHTML(j.bodega)}</span><span class="of abierta">${j.puntos.total}</span></div>`).join("")}</div>
    <div class="fila centro">${yo === v.anfitrion ? `<button class="jugar" id="otra">Otra subasta</button>` : `<p class="nota">Quien abrió la plaza puede pedir otra.</p>`}
      <button class="boton" id="salir2">Volver a la vereda</button></div></section>`;
  const o = document.getElementById("otra"); if (o) o.onclick = () => { premiado = false; mandar({ t: "revancha" }); };
  document.getElementById("salir2").onclick = () => { salir(); location.href = "vereda/index.html"; };
  if (premiado) return;
  premiado = true;
  const pts = mi.puntos.total;
  const nuevo = V.record("galeria", 1, pts);
  const ganados = V.sumar(pts * 1.5 + (gano ? 8 : 0));
  const lam = gano ? V.ganarLamina(["c_cafe", "c_platano", "c_cacao", "c_cana", "c_huerta", "f_trueque", "f_jornalExtra"]) : null;
  V.efecto(gano ? "victoria" : "derrota");
  V.premio({
    titulo: gano ? (v.ganadores.length > 1 ? "¡Empate en la plaza!" : "¡El mejor negocio!") : v.jugadores[v.ganadores[0]].nombre + " hizo el mejor negocio",
    linea: `Hiciste ${pts} ${pts === 1 ? "punto" : "puntos"}: ${mi.puntos.cosecha} de cosecha y ${mi.puntos.monedas} de los pesos que guardaste.` + (nuevo && pts ? " ¡Récord nuevo!" : ""),
    arte: V.arteClave("k_feria", null) || arteC("cafe"), tono: "#B23A3A", cinta: "La Galería", ganados, lam,
    botones: [["ver", "Ver la tabla", true]]
  });
}

/* reloj de la ronda */
setInterval(() => { const r = document.getElementById("reloj"); if (r && limite) r.textContent = Math.max(0, Math.round((limite - Date.now()) / 1000)); }, 500);

V.montar({ titulo: "La Galería", volver: "vereda/index.html", escena: "mediodia" });
pintar();
V.cargarArte();
conectar();
})();
