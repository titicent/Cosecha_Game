/* ═══════════════════════════════════════════════════════════════
   COSECHA — menú de juego
   Todo lo que pasa antes de sentarse a la mesa:
     1. Ingreso: una sola pantalla para el nombre.
     2. Modos: solo contra la máquina, o sala privada con amigos.
     3. Configuración de cada modo con diales grandes, barajas y reglas.
     4. Transición de entrada, que cuenta el juego antes de la sala.
     5. Sala de espera de la sala privada.
   Usa lo que define cliente.js (mandar, alerta, V, sesion, A, R, S, esc),
   que se carga después: por eso todo se consulta al llamar, no al cargar.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
const MENU = (() => {
  const guardado = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const guarda = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const nombre = () => { try { return localStorage.getItem("cosecha.nombre") || ""; } catch (e) { return ""; } };
  const ponNombre = n => { try { localStorage.setItem("cosecha.nombre", n); } catch (e) {} };

  let vista = null;                 /* "nombre" | "modos" | "solo" | "privada" */
  let pestana = "armar";            /* en sala privada: "armar" | "codigo" */
  let introPendiente = false;       /* la transición espera a que llegue la sala */

  const TIEMPOS = [0, 15, 30, 45, 60, 90, 120], BANCOS = [0, 5, 10, 15, 20];
  const NIVELES = ["novato", "normal", "experto"];
  const NIVEL = { novato: ["Novato", "improvisa y se equivoca"], normal: ["Normal", "juega bien casi siempre"],
    experto: ["Baquiano", "siempre elige lo mejor"] };
  const BASE = { bonanza: true, espantos: false, clima: true, metaCertificada: false, duelo: false, aprendiz: false,
    segundosTurno: 60, minutosJugador: 0 };
  let solo = Object.assign({}, BASE, { jugadores: 4, nivel: "normal" }, guardado("cosecha.cfg.solo", {}));
  let priv = Object.assign({}, BASE, guardado("cosecha.cfg.privada", {}));

  /* ── piezas ─────────────────────────────────────────────────── */
  const arte = (k, carta) => A.arteDe(k) || (carta ? A.dibujo(carta, R.colorCarta(carta)) : "");
  const foto = (k, clase, silla) => A.arteDe(k)
    ? `<img class="${clase}" src="cartas/${k}.png" alt="" draggable="false">`
    : `<span class="${clase}">${A.avatar(silla || 0, 46)}</span>`;
  const HEX = c => R.CULTIVO[c].hex;
  let _cuantas = null;              /* cuántas cartas trae cada baraja, contado del motor */
  const cuantas = () => _cuantas || (_cuantas = R.crearMazo(true, true).reduce((n, c) => (n[c.m] = (n[c.m] || 0) + 1, n), {}));
  const tiempo = s => s === 0 ? ["∞", ""] : s < 60 ? [String(s), "s"] : [Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"), "min"];
  const tiempoNota = s => s === 0 ? "sin afán: piensa lo que quieras" : s < 60 ? "rápido: a pensar ligero" : s === 60 ? "ritmo normal" : "con calma";

  const dial = (id, nom, valor, unidad, nota, puedeMenos, puedeMas, extra = "", palabra = false) => `
    <div class="dial" data-dial="${id}">
      <div class="valor"><b class="${palabra ? "palabra" : ""}">${valor}</b>${unidad ? `<small>${unidad}</small>` : ""}</div>
      <div class="regla"></div>
      <div class="nom">${nom}</div>
      <div class="nota">${nota}</div>
      <div class="sillas">${extra}</div>
      <div class="ctl"><button data-menos aria-label="Menos ${nom}" ${puedeMenos ? "" : "disabled"}>−</button><button data-mas aria-label="Más ${nom}" ${puedeMas ? "" : "disabled"}>+</button></div>
    </div>`;

  const barajas = cfg => `
    <div class="m-seccion"><h3>Barajas</h3><div class="m-barajas">
      ${[["base", "Cosecha", "c_cafe", { k: "cultivo", c: "cafe" }, HEX("cafe"), "siempre va"],
         ["bonanza", "Bonanza", "c_vivero", { k: "cultivo", c: "vivero" }, HEX("vivero"), cuantas().bonanza + " cartas"],
         ["espantos", "Espantos", "f_mohan_cafe", { k: "faena", tr: "mohan_cafe" }, "#6B4FA8", cuantas().espantos + " cartas"]]
        .map(([id, n, k, c, t, sub]) => `<button class="baraja ${id === "base" ? "fija" : ""}" data-baraja="${id}"
          aria-pressed="${id === "base" ? true : !!cfg[id]}" style="--t:${t};--s:${R.MAZOS[id].hex}" ${id === "base" ? 'tabindex="-1"' : ""}>
          <span class="marca-ok"></span><span class="bsello">${A.sello(id, "#FFFFFF")}</span>
          <span class="bimg">${arte(k, c)}</span><b>${n}</b><small>${sub}</small></button>`).join("")}
    </div></div>`;

  const REGLAS_EXTRA = [
    ["clima", "Clima", "Cada tres vueltas cambia el tiempo", "k_aguacero"],
    ["metaCertificada", "Meta certificada", "Para ganar, las cuatro certificadas", "r_bioinsumo_huerta"],
    ["duelo", "Mano a mano", "Solo con dos: se gana con cinco", "c_huerta"],
    ["aprendiz", "Modo aprendiz", "El mayordomo sugiere jugadas", "f_consejo"]
  ];
  const reglas = (cfg, dos) => `
    <div class="m-seccion"><h3>Reglas</h3><div class="m-reglas">
      ${REGLAS_EXTRA.map(([id, n, d, k]) => {
        const off = id === "duelo" && !dos;
        return `<button class="reglaT" data-regla="${id}" aria-pressed="${!off && !!cfg[id]}" ${off ? "disabled" : ""}>
          <span class="ico">${A.arteDe(k) || ""}</span><span><b>${n}</b><small>${off ? "Solo cuando juegan dos" : d}</small></span>
          <span class="interruptor"></span></button>`; }).join("")}
    </div></div>`;

  const volver = destino => `<button class="m-volver" data-volver="${destino}" aria-label="Volver">‹</button>`;
  const ayuda = `<button class="m-ayuda" data-comojuega><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>Cómo se juega</button>`;

  /* ── 1 · Ingreso ────────────────────────────────────────────── */
  function pNombre() {
    $app.innerHTML = `<section class="m">
      <div class="m-abanico" aria-hidden="true">
        <img src="cartas/c_cafe.png" alt="" style="--t:${HEX("cafe")}" onerror="this.remove()">
        <img src="cartas/c_huerta.png" alt="" style="--t:${HEX("huerta")}" onerror="this.remove()">
        <img src="cartas/p_comun_cafe.png" alt="" style="--t:${HEX("cafe")}" onerror="this.remove()">
      </div>
      <div class="m-logo"><span class="antes">El juego de la finca</span><span class="palabra">Cosecha</span></div>
      <div class="m-marco">
        <p class="m-pide">¿Cómo te llaman en la vereda?</p>
        <form class="m-barra" id="mForm">
          <input id="nombre" maxlength="14" placeholder="Escribe tu nombre…" autocomplete="nickname" value="${esc(nombre())}">
          <button class="m-boton" type="submit">Continuar</button>
        </form>
      </div>
      <p class="m-nota">Así te verán los demás en la mesa.</p>
    </section>`;
    const inp = document.getElementById("nombre");
    setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
    document.getElementById("mForm").onsubmit = ev => {
      ev.preventDefault();
      const n = inp.value.trim();
      if (!n) { alerta("Escribe cómo te llaman"); return inp.focus(); }
      ponNombre(n);
      try { S.arrancar(); } catch (e) {}
      ir("modos");
    };
  }

  /* ── 2 · Modos ──────────────────────────────────────────────── */
  function pModos() {
    $app.innerHTML = `<section class="m">
      <button class="m-jugador" data-cambianombre title="Cambiar el nombre">${foto("a_aguadeno", "", 0)}<span>${esc(nombre())}</span><span class="lapiz">✎</span></button>
      <h2 class="m-titulo">¿Cómo quieres jugar?</h2>
      ${sesion ? `<div class="m-seguir"><span>Tienes una partida en la sala <b>${esc(sesion.codigo)}</b>.</span>
        <button class="m-boton" data-volvermesa>Volver</button></div>` : ""}
      <div class="m-modos">
        <button class="m-modo solo" data-modo="solo">
          <span class="m-escena"><span class="esc-solo">
            <span class="cartita c1" style="--t:${HEX("platano")}">${arte("c_platano", { k: "cultivo", c: "platano" })}</span>
            <span class="cartita c2" style="--t:${HEX("cafe")}">${arte("c_cafe", { k: "cultivo", c: "cafe" })}</span>
            <span class="cartita c3" style="--t:${HEX("cacao")}">${arte("p_comun_cacao", { k: "plaga", c: "cacao", t: "comun" })}</span>
            ${foto("a_carriel", "bot b1", 1)}${foto("a_ruana", "bot b2", 3)}
            <span class="chipbot">máquina</span></span></span>
          <span class="rotulo"><b>Contra la máquina</b><span>Tú y hasta cinco vecinos que juegan solos</span></span>
        </button>
        <button class="m-modo privada" data-modo="privada">
          <span class="m-escena"><span class="esc-priv">
            ${foto("a_aguadeno", "p1", 0)}${foto("a_poncho", "p2", 2)}
            <span class="clave"><i>F</i><i>I</i><i>N</i><i>C</i></span></span></span>
          <span class="rotulo"><b>Sala privada</b><span>Con tus amigos, cada uno en su teléfono</span></span>
        </button>
      </div>
      ${ayuda}
    </section>`;
    $app.querySelector("[data-cambianombre]").onclick = () => ir("nombre");
    $app.querySelectorAll("[data-modo]").forEach(b => b.onclick = () => ir(b.dataset.modo));
    const vm = $app.querySelector("[data-volvermesa]");
    if (vm) vm.onclick = () => mandar({ t: "reconectar", codigo: sesion.codigo, token: sesion.token });
  }

  /* ── 3a · Solo contra la máquina ────────────────────────────── */
  function pSolo() {
    const c = solo, n = c.jugadores, ti = TIEMPOS.indexOf(c.segundosTurno), ni = NIVELES.indexOf(c.nivel);
    const [tv, tu] = tiempo(c.segundosTurno);
    const sillas = Array.from({ length: n }, (_, i) =>
      A.arteDe(A.claveSilla(i)) ? `<img src="cartas/${A.claveSilla(i)}.png" alt="">` : A.avatar(i, 20)).join("");
    $app.innerHTML = `<section class="m">
      <h2 class="m-titulo">Contra la máquina</h2>
      <p class="m-sub">Arma tu mesa: cuántos juegan, cuánto tiempo hay y qué tan duros son los vecinos.</p>
      <div class="m-marco ancho">
        <div class="m-diales" style="--n:3">
          ${dial("jugadores", "Jugadores", n, "", `tú y ${n - 1} ${n - 1 === 1 ? "vecino" : "vecinos"}`, n > 2, n < 6, sillas)}
          ${dial("tiempo", "Tiempo por turno", tv, tu, tiempoNota(c.segundosTurno), ti > 0, ti < TIEMPOS.length - 1)}
          ${dial("nivel", "Vecinos", NIVEL[c.nivel][0], "", NIVEL[c.nivel][1], ni > 0, ni < NIVELES.length - 1, "", true)}
        </div>
        ${barajas(c)}
        ${reglas(c, n === 2)}
      </div>
      <button class="m-jugar" id="mJugar">¡A sembrar!</button>
      ${volver("modos")}
    </section>`;
    enganchar(c, "solo", pintarMenu);
    document.getElementById("mJugar").onclick = () => {
      const opciones = opcionesDe(c, n === 2);
      introAntes(opciones, () => {
        pantallaJuego();
        mandar({ t: "crear", nombre: nombre(), opciones, bots: Array(n - 1).fill(c.nivel), empezar: true });
      });
    };
  }

  /* ── 3b · Sala privada ──────────────────────────────────────── */
  function pPrivada() {
    const c = priv, ti = TIEMPOS.indexOf(c.segundosTurno), bi = BANCOS.indexOf(c.minutosJugador);
    const [tv, tu] = tiempo(c.segundosTurno);
    $app.innerHTML = `<section class="m">
      <h2 class="m-titulo">Sala privada</h2>
      <div class="m-pestanas" role="tablist">
        <button role="tab" data-pest="armar" aria-selected="${pestana === "armar"}">Armar la mesa</button>
        <button role="tab" data-pest="codigo" aria-selected="${pestana === "codigo"}">Tengo un código</button>
      </div>
      ${pestana === "armar" ? `
      <p class="m-sub">Tú pones las reglas. Al armar la mesa te damos un código para que tus amigos entren.</p>
      <div class="m-marco ancho">
        <div class="m-diales" style="--n:2">
          ${dial("tiempo", "Tiempo por turno", tv, tu, tiempoNota(c.segundosTurno), ti > 0, ti < TIEMPOS.length - 1)}
          ${dial("banco", "Banco de tiempo", c.minutosJugador ? c.minutosJugador : "—", c.minutosJugador ? "min" : "",
            c.minutosJugador ? "para cada jugador, toda la partida" : "sin banco: solo cuenta el turno", bi > 0, bi < BANCOS.length - 1)}
        </div>
        ${barajas(c)}
        ${reglas(c, true)}
      </div>
      <button class="m-jugar" id="mArmar">Armar la mesa</button>` : `
      <p class="m-sub">Escribe las cuatro letras que te pasó quien armó la mesa.</p>
      <div class="m-marco">
        <div class="m-codigo"><input id="codigo" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off" spellcheck="false"></div>
        <p class="m-nota">Entrarás con el nombre <b>${esc(nombre())}</b>.</p>
      </div>
      <button class="m-jugar" id="mEntrar">Entrar a la mesa</button>`}
      ${volver("modos")}
    </section>`;
    $app.querySelectorAll("[data-pest]").forEach(b => b.onclick = () => { pestana = b.dataset.pest; pintarMenu(); });
    if (pestana === "armar") {
      enganchar(c, "privada", pintarMenu);
      document.getElementById("mArmar").onclick = () => {
        introPendiente = true;
        mandar({ t: "crear", nombre: nombre(), opciones: opcionesDe(c, true) });
      };
    } else {
      const inp = document.getElementById("codigo");
      setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
      const entrar = () => {
        const k = inp.value.trim().toUpperCase();
        if (k.length !== 4) return alerta("El código tiene cuatro letras");
        introPendiente = true;
        mandar({ t: "unir", codigo: k, nombre: nombre() });
      };
      inp.onkeydown = ev => { if (ev.key === "Enter") entrar(); };
      document.getElementById("mEntrar").onclick = entrar;
    }
  }

  /* Diales, barajas y reglas modifican la configuración y repintan. */
  function enganchar(c, clave, repinta, alCambiar) {
    const listo = () => { guarda("cosecha.cfg." + clave, c); if (alCambiar) alCambiar(); else repinta(); };
    const paso = (lista, v, d) => lista[Math.max(0, Math.min(lista.length - 1, lista.indexOf(v) + d))];
    $app.querySelectorAll("[data-dial]").forEach(el => {
      const mover = d => {
        const id = el.dataset.dial;
        if (id === "jugadores") c.jugadores = Math.max(2, Math.min(6, c.jugadores + d));
        if (id === "tiempo") c.segundosTurno = paso(TIEMPOS, c.segundosTurno, d);
        if (id === "banco") c.minutosJugador = paso(BANCOS, c.minutosJugador, d);
        if (id === "nivel") c.nivel = paso(NIVELES, c.nivel, d);
        try { S.efecto("tic"); } catch (e) {}
        listo();
      };
      el.querySelector("[data-menos]").onclick = () => mover(-1);
      el.querySelector("[data-mas]").onclick = () => mover(1);
    });
    $app.querySelectorAll("[data-baraja]").forEach(b => { if (b.dataset.baraja !== "base")
      b.onclick = () => { c[b.dataset.baraja] = !c[b.dataset.baraja]; listo(); }; });
    $app.querySelectorAll("[data-regla]").forEach(b => b.onclick = () => { c[b.dataset.regla] = !c[b.dataset.regla]; listo(); });
  }
  const opcionesDe = (c, dos) => ({ bonanza: !!c.bonanza, espantos: !!c.espantos, clima: !!c.clima,
    metaCertificada: !!c.metaCertificada, duelo: !!(c.duelo && dos), aprendiz: !!c.aprendiz,
    segundosTurno: c.segundosTurno, minutosJugador: c.minutosJugador || 0 });

  /* ── 4 · Transición de entrada ──────────────────────────────────
     Cuenta el juego en pocos cuadros antes de sentarse. Se adapta a lo que se
     va a jugar: si hay clima, Bonanza o Espantos, lo anuncia. Avanza sola, se
     adelanta tocando la pantalla y se puede saltar. Usa la misma medalla de
     los sucesos de la mesa, para que todo hable el mismo idioma. */
  function pasosDe(o) {
    const p = [
      { k: "c_cafe", t: HEX("cafe"), titulo: "Siembra tu finca",
        texto: "Junta <b>cuatro cultivos distintos</b>: café, plátano, cacao y caña. La huerta es el comodín." },
      { k: "p_comun_cafe", t: "#8C3A2B", titulo: "Cuida tus matas",
        texto: "Las plagas arruinan las matas y los remedios las curan. <b>El color manda</b>: la broca solo le entra al café." },
      { k: "f_jornalExtra", t: "#3F6B4A", titulo: "Dos jornales por turno",
        texto: "Sembrar, plagar o curar cuesta un jornal. Una faena, los dos." },
      { k: "c_huerta", t: "#C9A227", titulo: "¡Finca lista!",
        texto: "Cuando la completes, todos lo verán. Si aguanta <b>una vuelta de la mesa</b>, cosechas y ganas." }
    ];
    if (!o || o.clima) p.push({ k: "k_aguacero", t: "#2F6283", titulo: "El clima no pregunta",
      texto: "Cada tres vueltas cambia el tiempo en la montaña, y le toca a todos." });
    if (!o || o.bonanza) p.push({ k: "c_vivero", t: "#B8891B", titulo: "Llegó la bonanza",
      texto: "Plagas resistentes, bioinsumos, el vivero bajo techo y cuatro faenas nuevas." });
    if (!o || o.espantos) p.push({ k: "f_mohan_cafe", t: "#6B4FA8", titulo: "Salen los espantos",
      texto: "El Mohán, la Patasola, la Llorona y la Madremonte: traviesos y poderosos." });
    return p;
  }
  const SEG = 3800;
  function intro(opciones, alTerminar, manual) {
    const pasos = pasosDe(opciones);
    let i = 0, reloj = null;
    document.getElementById("intro")?.remove();
    const el = document.createElement("div");
    el.id = "intro"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "De qué se trata Cosecha");
    document.body.appendChild(el);
    const cerrar = () => {
      clearTimeout(reloj); document.removeEventListener("keydown", tecla);
      el.classList.add("sale"); setTimeout(() => el.remove(), 430);
      if (alTerminar) alTerminar();
    };
    const pinta = () => {
      const p = pasos[i], ultimo = i === pasos.length - 1;
      el.innerHTML = `
        <div class="barras">${pasos.map((_, k) => `<i class="${k < i ? "hecha" : k === i ? "ahora" : ""}" style="--dur:${SEG}ms"><b></b></i>`).join("")}</div>
        <button class="saltar" data-saltar>${manual ? "Cerrar" : "Saltar"} ›</button>
        <div class="paso" style="--t:${p.t}">
          <div class="medalla">${A.arteDe(p.k) || ""}</div>
          <div class="cinta">${p.titulo}</div>
          <p>${p.texto}</p>
        </div>
        <div class="abajo">
          ${ultimo ? `<button class="m-jugar" data-listo style="width:min(88vw,360px)">${manual ? "Entendido" : "¡A la mesa!"}</button>`
                   : `<span class="toca">Toca para seguir</span>`}
          ${manual ? "" : `<label><input type="checkbox" data-nomas> No mostrar antes de cada partida</label>`}
        </div>`;
      clearTimeout(reloj);
      if (!ultimo) reloj = setTimeout(sigue, SEG);
    };
    const sigue = () => { if (i < pasos.length - 1) { i++; pinta(); } else cerrar(); };
    const tecla = ev => { if (ev.key === "Escape") cerrar(); if (ev.key === "ArrowRight" || ev.key === " ") sigue();
      if (ev.key === "ArrowLeft" && i > 0) { i--; pinta(); } };
    document.addEventListener("keydown", tecla);
    el.addEventListener("click", ev => {
      if (ev.target.closest("[data-saltar]") || ev.target.closest("[data-listo]")) return cerrar();
      if (ev.target.closest("label")) {
        const cb = el.querySelector("[data-nomas]");
        if (ev.target === cb) guarda("cosecha.sinintro", cb.checked);
        return;
      }
      sigue();
    });
    pinta();
  }
  const introAntes = (o, luego) => guardado("cosecha.sinintro", false) ? luego() : intro(o, luego);

  /* ── 5 · Sala de espera ─────────────────────────────────────── */
  function sala() {
    if (introPendiente) { introPendiente = false; if (!guardado("cosecha.sinintro", false)) intro(V.opciones); }
    const o = V.opciones, anf = V.anfitrion, n = V.jugadores.length;
    const [tv, tu] = tiempo(o.segundosTurno);
    const res = [["Cosecha", true], ["Bonanza", o.bonanza], ["Espantos", o.espantos], ["Clima", o.clima],
      ["Meta certificada", o.metaCertificada], ["Mano a mano", o.duelo], ["Aprendiz", o.aprendiz]]
      .filter(([, v]) => v).map(([t]) => `<span class="on">${t}</span>`).join("") +
      `<span>Turno: ${o.segundosTurno ? tv + " " + tu : "sin límite"}</span>` +
      (o.minutosJugador ? `<span>Banco: ${o.minutosJugador} min</span>` : "");
    $app.innerHTML = `<section class="m">
      <h2 class="m-titulo">Sala privada</h2>
      <div class="m-marco" style="text-align:center">
        <p class="m-nota" style="margin-bottom:4px">Código de la sala</p>
        <div class="m-clave" aria-label="Código ${esc(V.codigo)}">${[...V.codigo].map(l => `<i>${esc(l)}</i>`).join("")}</div>
        <p class="m-nota">Compártelo: cada quien entra desde su teléfono en <b>Sala privada › Tengo un código</b>.</p>
      </div>
      <div class="m-marco ancho">
        <div class="m-sillas">${Array.from({ length: 6 }, (_, i) => {
          const j = V.jugadores[i];
          if (!j) return `<div class="m-silla libre"><span class="hueco">+</span><small>Silla libre</small></div>`;
          return `<div class="m-silla ${i === V.yo ? "mia" : ""}">${A.avatar(i, 58)}<b>${esc(j.nombre)}</b>
            <small>${j.bot ? "vecino " + (j.bot === "experto" ? "baquiano" : j.bot) : !j.conectado ? "sin señal" : A.SILLAS[i % 6].nombre}</small>
            ${i === 0 ? `<span class="etq">anfitrión</span>` : i === V.yo ? `<span class="etq">tú</span>` : ""}</div>`; }).join("")}
        </div>
        ${anf ? `<div class="m-seccion"><h3>Vecinos de la máquina</h3><div class="m-vecinos">
          <button data-bot="novato" ${n >= 6 ? "disabled" : ""}>+ Vecino novato</button>
          <button data-bot="normal" ${n >= 6 ? "disabled" : ""}>+ Vecino normal</button>
          <button data-bot="experto" ${n >= 6 ? "disabled" : ""}>+ Vecino baquiano</button>
          ${V.jugadores.some(j => j.bot) ? `<button data-quitabot>− Quitar vecino</button>` : ""}</div></div>` : ""}
        <div class="m-seccion"><h3>Reglas de esta mesa</h3><div class="m-resumen">${res}</div>
          ${anf ? `<div style="display:flex;justify-content:center;margin-top:12px"><button class="m-boton" data-cambiarreglas>Cambiar reglas</button></div>` : ""}</div>
      </div>
      ${anf ? `<button class="m-jugar" id="bEmpezar" ${n < 2 ? "disabled" : ""}>${n < 2 ? "Falta al menos un jugador" : "Empezar la partida"}</button>`
            : `<p class="m-sub" style="margin:0">Esperando a que ${esc(V.jugadores[0].nombre)} empiece la partida…</p>`}
      <button class="m-volver" data-salirsala aria-label="Salir de la sala">‹</button>
      ${ayuda}
    </section>`;
    comunes();
    $app.querySelector("[data-salirsala]").onclick = () => salirDeLaSala();
    if (!anf) return;
    $app.querySelectorAll("[data-bot]").forEach(b => b.onclick = () => mandar({ t: "bot", nivel: b.dataset.bot }));
    const qb = $app.querySelector("[data-quitabot]"); if (qb) qb.onclick = () => mandar({ t: "quitarbot" });
    const e = document.getElementById("bEmpezar"); if (e) e.onclick = () => { pantallaJuego(); mandar({ t: "empezar" }); };
    $app.querySelector("[data-cambiarreglas]").onclick = () => hojaReglas();
  }

  /* El anfitrión cambia las reglas desde la sala con los mismos controles. */
  function hojaReglas() {
    const c = Object.assign({}, BASE, V.opciones);
    const hoja = document.createElement("div"); hoja.className = "m-hoja";
    /* La hoja flota fuera de $app, así que se engancha aparte. */
    const engancharHoja = () => {
      const paso = (lista, v, d) => lista[Math.max(0, Math.min(lista.length - 1, lista.indexOf(v) + d))];
      hoja.querySelectorAll("[data-dial]").forEach(el => {
        const mover = d => { const id = el.dataset.dial;
          if (id === "tiempo") c.segundosTurno = paso(TIEMPOS, c.segundosTurno, d);
          if (id === "banco") c.minutosJugador = paso(BANCOS, c.minutosJugador, d);
          dibuja(); };
        el.querySelector("[data-menos]").onclick = () => mover(-1);
        el.querySelector("[data-mas]").onclick = () => mover(1);
      });
      hoja.querySelectorAll("[data-baraja]").forEach(b => { if (b.dataset.baraja !== "base")
        b.onclick = () => { c[b.dataset.baraja] = !c[b.dataset.baraja]; dibuja(); }; });
      hoja.querySelectorAll("[data-regla]").forEach(b => b.onclick = () => { c[b.dataset.regla] = !c[b.dataset.regla]; dibuja(); });
      hoja.querySelector("[data-listas]").onclick = () => {
        mandar({ t: "opciones", opciones: opcionesDe(c, V.jugadores.length === 2) });
        guarda("cosecha.cfg.privada", Object.assign({}, priv, opcionesDe(c, true)));
        hoja.remove();
      };
    };
    const dibuja = () => {
      const ti = TIEMPOS.indexOf(c.segundosTurno), bi = BANCOS.indexOf(c.minutosJugador), [tv, tu] = tiempo(c.segundosTurno);
      hoja.innerHTML = `<div class="m" style="min-height:0;padding:0;width:100%"><h2 class="m-titulo">Reglas de esta mesa</h2>
        <div class="m-marco ancho"><div class="m-diales" style="--n:2">
          ${dial("tiempo", "Tiempo por turno", tv, tu, tiempoNota(c.segundosTurno), ti > 0, ti < TIEMPOS.length - 1)}
          ${dial("banco", "Banco de tiempo", c.minutosJugador || "—", c.minutosJugador ? "min" : "",
            c.minutosJugador ? "para cada jugador" : "sin banco", bi > 0, bi < BANCOS.length - 1)}</div>
          ${barajas(c)}${reglas(c, V.jugadores.length === 2)}</div>
        <button class="m-jugar" data-listas>Listo</button></div>`;
      engancharHoja();
    };
    hoja.addEventListener("click", ev => { if (ev.target === hoja) hoja.remove(); });
    document.body.appendChild(hoja);
    dibuja();
  }

  /* Botones que aparecen en varias pantallas */
  function comunes() {
    $app.querySelectorAll("[data-volver]").forEach(b => b.onclick = () => ir(b.dataset.volver));
    $app.querySelectorAll("[data-comojuega]").forEach(b => b.onclick = () => intro(V ? V.opciones : null, null, true));
  }

  /* ── Enrutado del menú ──────────────────────────────────────── */
  function ir(v) { vista = v; pintarMenu(); window.scrollTo(0, 0); }
  function pintarMenu() {
    $atril.innerHTML = "";
    if (!nombre()) vista = "nombre";
    if (!vista) vista = "modos";
    ({ nombre: pNombre, modos: pModos, solo: pSolo, privada: pPrivada }[vista] || pModos)();
    comunes();
  }
  /* Si el servidor rechaza el código o algo falla, la transición no espera. */
  const errorDeEntrada = () => { introPendiente = false; };

  /* ── Despertando la finca ────────────────────────────────────
     Sale solo cuando la página vive aparte y el servidor gratuito estaba
     dormido. Cuenta los segundos, cambia de frase y, cuando el servidor
     responde, da los buenos días y se va. Devuelve una promesa al cerrarse
     para que la conexión no arranque mientras todavía se ve. */
  const FRASES = ["Despertando la finca…", "Cantan los gallos…", "Prendiendo el fogón para el tinto…",
    "Afilando los machetes…", "Revisando que no haya broca…", "Contando los jornales…", "Espantando al Mohán del río…"];
  let despierta = null;
  function despertando(on) {
    if (on) {
      if (despierta) return;
      const el = document.createElement("div"); el.id = "despierta"; el.setAttribute("role", "status");
      el.innerHTML = `<div class="d-sol" aria-hidden="true"></div>
        <svg class="d-mata" viewBox="0 0 120 120" aria-hidden="true">
          <path class="tierra" d="M18 104c12-10 28-14 42-14s30 4 42 14Z"/>
          <path class="tallo" d="M60 92V48"/>
          <path class="hoja h1" d="M60 64c-2-14-12-22-28-22 1 15 11 23 28 22Z"/>
          <path class="hoja h2" d="M60 54c2-16 13-25 30-25-1 17-12 26-30 25Z"/>
          <circle class="grano g1" cx="52" cy="40" r="5"/><circle class="grano g2" cx="66" cy="34" r="5"/>
        </svg>
        <div class="d-palabra">Cosecha</div>
        <p class="d-frase">${FRASES[0]}</p>
        <div class="d-barra"><i></i></div>
        <p class="d-nota">Cuando nadie juega, el servidor se duerme para ahorrar.<br>Despertarlo toma menos de un minuto · <b class="d-seg">0 s</b></p>`;
      document.body.appendChild(el);
      const t0 = Date.now(); let k = 0;
      const f = el.querySelector(".d-frase"), sg = el.querySelector(".d-seg");
      el._reloj = setInterval(() => { sg.textContent = Math.round((Date.now() - t0) / 1000) + " s"; }, 1000);
      el._frases = setInterval(() => { k = (k + 1) % FRASES.length; f.classList.remove("cambia"); void f.offsetWidth;
        f.textContent = FRASES[k]; f.classList.add("cambia"); }, 2800);
      despierta = el;
      return;
    }
    const el = despierta; despierta = null;
    if (!el) return Promise.resolve();
    clearInterval(el._reloj); clearInterval(el._frases);
    el.querySelector(".d-frase").textContent = "¡Buenos días! La finca está lista.";
    el.classList.add("lista");
    return new Promise(r => setTimeout(() => { el.classList.add("sale"); setTimeout(() => { el.remove(); r(); }, 450); }, 900));
  }

  const alInicio = () => { vista = "modos"; introPendiente = false; };
  return { pintar: pintarMenu, sala, intro, errorDeEntrada, alInicio, despertando, get vista() { return vista; } };
})();
