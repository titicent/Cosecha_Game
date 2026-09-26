/* ═══════════════════════════════════════════════════════════════
   COSECHA — sucesos
   Lo que aparece en el centro de la mesa cada vez que pasa algo.

   Es una sola pieza, hecha con el mismo lenguaje de las cartas: un medallón
   de papel crema con el aro del color de la carta, la ilustración al centro
   y debajo una cinta con la palabra, como el rótulo de una carta. Aparece
   como una carta que se planta en la mesa, y si el suceso cayó sobre una
   mata, se encoge y vuela hasta ella, para que se vea qué pasó y dónde.

   Antes eran dos animaciones al mismo tiempo —un disco plano con una silueta
   y la carta volando por encima— y hablaban dos idiomas distintos. Ahora
   todo suceso, sea jugada, clima o victoria, sale por el mismo molde.

   Cuando un suceso no tiene ilustración propia todavía (los climas, por
   ejemplo, mientras no se pinten), el centro del medallón lleva un sello: un
   disco de color con una figura clara encima. Es el mismo recurso del sello
   de mazo que llevan todas las cartas en la esquina, así que tampoco se sale
   del idioma.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

const svg = c => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
const T = "#FBF8F1";   /* la figura va en crema sobre el disco de color */

/* El nombre lo escribe otro jugador, así que no puede entrar crudo al HTML:
   bastaría llamarse con una etiqueta abierta para escribir en la pantalla de
   los demás. Es la misma precaución que toma el resto del cliente. */
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ── Figuras de respaldo ─────────────────────────────────────── */
const FIG = {
  brote: () => svg(`
    <path d="M32 54V30" stroke="${T}" stroke-width="5" stroke-linecap="round"/>
    <path d="M32 34c-9-1-14-7-14-14 8-1 14 3 15 8 .5 3-.3 5-1 6Z" fill="${T}"/>
    <path d="M32 40c8-1 13-6 13-13-7-1-13 3-14 7-.4 3 .4 5 1 6Z" fill="${T}" opacity=".78"/>
    <path d="M14 56h36" stroke="${T}" stroke-width="4.5" stroke-linecap="round" opacity=".62"/>`),

  sol: () => svg(`
    <circle cx="32" cy="32" r="12" fill="${T}"/>
    ${[0,1,2,3,4,5,6,7].map(i => {
      const a = i*Math.PI/4;
      return `<path d="M${(32+Math.cos(a)*18).toFixed(1)} ${(32+Math.sin(a)*18).toFixed(1)}
        L${(32+Math.cos(a)*27).toFixed(1)} ${(32+Math.sin(a)*27).toFixed(1)}"
        stroke="${T}" stroke-width="4.5" stroke-linecap="round"/>`;
    }).join("")}
    <path d="M18 56c4-3 8-3 12 0s8 3 12 0 8-3 12 0" stroke="${T}" stroke-width="3"
      fill="none" stroke-linecap="round" opacity=".6"/>`),

  nube: () => svg(`
    <path d="M16 36c-6 0-9-5-7-9 1-4 5-5 8-4 1-7 9-11 15-8 5-3 12 0 12 6 5 0 8 5 6 9-1 4-5 6-9 6Z"
      fill="${T}"/>
    <path d="M20 44l-4 10M31 44l-4 12M42 44l-4 10" stroke="${T}" stroke-width="4"
      stroke-linecap="round" opacity=".8"/>`),

  copo: () => svg(`
    ${[0,1,2].map(i => `<path d="M32 8v48" stroke="${T}" stroke-width="5" stroke-linecap="round"
      transform="rotate(${i*60} 32 32)"/>`).join("")}
    ${[0,1,2,3,4,5].map(i => `<path d="M26 14l6 6 6-6" stroke="${T}" stroke-width="3.6" fill="none"
      stroke-linecap="round" stroke-linejoin="round" transform="rotate(${i*60} 32 32)"/>`).join("")}`),

  moneda: () => svg(`
    <circle cx="32" cy="32" r="22" fill="${T}"/>
    <circle cx="32" cy="32" r="16" fill="none" stroke="rgba(0,0,0,.26)" stroke-width="2.6"/>
    <path d="M32 21v22M38 25c-2-2-10-3-11 1s11 4 11 9-9 5-12 2" stroke="rgba(0,0,0,.34)"
      stroke-width="3.4" fill="none" stroke-linecap="round"/>`),

  rueda: () => svg(`
    <path d="M32 10a22 22 0 1 1-20 13" fill="none" stroke="${T}" stroke-width="6.5"
      stroke-linecap="round"/>
    <path d="m32 2 9 8-9 8Z" fill="${T}"/>`),

  cartas: () => svg(`
    <rect x="10" y="20" width="20" height="28" rx="3" fill="${T}" opacity=".7"
      transform="rotate(-14 20 34)"/>
    <rect x="22" y="16" width="20" height="28" rx="3" fill="${T}"/>
    <rect x="34" y="20" width="20" height="28" rx="3" fill="${T}" opacity=".7"
      transform="rotate(14 44 34)"/>`)
};

/* ── La palabra de cada suceso ──────────────────────────────── */
/* El color no va aquí: en una jugada lo pone la carta, como en su marco.
   Así el aro del medallón dice lo mismo que el borde de la carta que se jugó. */
const PALABRA = {
  sembrar:"¡Sembró!", injertar:"¡Injertó!", plagar:"¡Plaga!", propagacion:"¡Se propagó!",
  arrasar:"¡Arrasó!", lavar:"¡Lavó el remedio!", curar:"¡Curó!", proteger:"¡Protegió!",
  certificar:"¡Certificó!", certificar_ya:"¡Certificó de una!",
  llorona_curar:"¡La Llorona alivia!", llorona_certificar:"¡La Llorona bendice!",
  llorona_arrasar:"¡La Llorona arrasa!", llorona_lavar:"¡La Llorona lava!",
  saqueo:"¡Mano larga!", mohan:"¡El Mohán se la llevó!", trueque:"¡Trueque!",
  patasola:"¡La Patasola cambió matas!", lindero:"¡Cambio de lindero!",
  sombreron:"¡El Sombrerón corrió las fincas!", chaparron:"¡Chaparrón!",
  erradicacion:"¡Erradicó la plaga!", jornalExtra:"¡Jornal extra!",
  consejo:"¡Consejo del mayordomo!", duende:"¡El Duende cambió la carta!",
  madremonte:"¡Madremonte maldijo!",
  descarte:"Botó cartas", victoria:"¡Cosechó!", finpartida:"Se acabó la partida",
  anuncio:"¡Cosecha lista!",
  clima:"Cambió el clima"
};

/* Los sucesos sin carta dicen de dónde sacan su imagen y su color. */
const VERDE = "#4A6338", ORO = "#B8891B", AMBAR = "#D97A16";
const SIN_CARTA = {
  victoria:   { arte: () => ilustra({k:"cultivo", c:"huerta"}, ORO), color: ORO },
  /* la finca completa que todavía tiene que aguantar una vuelta */
  anuncio:    { arte: () => ilustra({k:"cultivo", c:"huerta"}, AMBAR), color: AMBAR,
                linea: quien => quien
                  ? "Tiene una vuelta. Si nadie la frena, cosecha al empezar su turno."
                  : "Aguanta la vuelta: si tu finca sigue completa cuando vuelva tu turno, ganas." },
  descarte:   { arte: () => dorso(), color: VERDE },
  finpartida: { arte: () => dorso(), color: VERDE }
};

/* Cada clima con su color y su figura de respaldo. Si existe cartas/k_<id>.png,
   la ilustración reemplaza a la figura sin tocar nada más. */
const CLIMA = {
  sequia:    { color:"#C9821A", fig:"sol"    },
  aguacero:  { color:"#3E6FA8", fig:"nube"   },
  helada:    { color:"#5F8FB0", fig:"copo"   },
  bonanza:   { color:"#B8891B", fig:"moneda" },
  ventarron: { color:"#5A6B72", fig:"rueda"  },
  feria:     { color:"#B4402F", fig:"cartas" }
};

/* ── Piezas ─────────────────────────────────────────────────── */
const A = () => raiz.ARTE;

function ilustra(carta, tono) {
  const a = A();
  return a && a.ilustracion ? a.ilustracion(carta, tono) : "";
}

/* El reverso de una carta de Cosecha, en pequeño: verde oliva a rayas, con el
   marco claro por dentro. Es el mismo reverso del pliego imprimible. */
function dorso() {
  return `<span class="mdorso"><span class="mdorsoin"><b>COSECHA</b></span></span>`;
}

/* El sello: disco de color con figura crema, como el sello de mazo. */
function sello(fig, color) {
  return `<span class="msello" style="background:${color}">${(FIG[fig] || FIG.cartas)()}</span>`;
}

/* ── El suceso ──────────────────────────────────────────────── */
/* Qué mostrar: la ilustración, el color del aro, la palabra y, si hay, una
   línea de explicación (el clima la necesita; una jugada no, porque su
   palabra ya lo dice y el diario lleva el detalle). */
function componer(ev, quienDe) {
  const tipo = ev.tipo;
  const R = raiz.REGLAS;

  if (tipo === "clima" && ev.clima) {
    const c = CLIMA[ev.clima.id] || { color:"#5A6B72", fig:"nube" };
    const a = A() && A().arteDe("k_" + ev.clima.id);
    return { arte: a || sello(c.fig, c.color), color: c.color,
             palabra: ev.clima.nombre, linea: ev.clima.texto, largo: true };
  }
  if (SIN_CARTA[tipo]) {
    const s = SIN_CARTA[tipo];
    return { arte: s.arte(), color: s.color, palabra: PALABRA[tipo],
             linea: s.linea ? s.linea(quienDe) : null,
             largo: tipo === "victoria" || tipo === "anuncio" };
  }
  if (ev.carta && R) {
    const tono = R.colorCarta(ev.carta);
    return { arte: ilustra(ev.carta, tono), color: tono, palabra: PALABRA[tipo] || "" };
  }
  return null;                          /* suceso sin nada que mostrar: mejor callado */
}

let actual = null, cola = [];

function suceso(ev, quien, op) {
  if (!ev) return;
  const m = componer(ev, quien);
  if (!m || !m.palabra) return;

  /* Una jugada que llega mientras se muestra otra la reemplaza: si no, en una
     mesa de seis el centro iría atrasado. Pero el clima, la victoria y el
     anuncio de cosecha se leen, y lo que llegue mientras tanto espera su
     turno. Quien pide esperar (el anuncio, que viene detrás de la jugada que
     lo provocó) también se pone en la cola. */
  if (actual) {
    if (actual.largo || (op && op.esperar)) { cola.push([ev, quien, op]); return; }
    actual.nodo.remove(); clearTimeout(actual.t1); clearTimeout(actual.t2); actual = null;
  }

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodo = document.createElement("div");
  nodo.className = "suceso" + (quieto ? " quieto" : "") + (m.largo ? " largo" : "");
  nodo.style.setProperty("--s", m.color);
  nodo.innerHTML =
    `<span class="sonda"></span>
     <span class="smedalla"><span class="spapel"></span><span class="sarte">${m.arte}</span></span>
     <span class="scinta">${esc(m.palabra)}${quien ? ` <b>${esc(quien)}</b>` : ""}</span>
     ${m.linea ? `<span class="slinea">${esc(m.linea)}</span>` : ""}`;
  document.body.appendChild(nodo);

  /* Hacia dónde se va: la mata afectada, o la silla del jugador. */
  const d = ev.destino;
  const blanco = d && !quieto
    ? (document.querySelector(`[data-mata="${d.j}.${d.o}"]`) || document.querySelector(`[data-silla="${d.j}"]`))
    : null;

  const vida = m.largo ? 2600 : 900;
  const yo = { nodo, largo: !!m.largo };
  yo.t1 = setTimeout(() => {
    if (blanco) {
      const a = nodo.querySelector(".smedalla").getBoundingClientRect();
      const b = blanco.getBoundingClientRect();
      nodo.style.setProperty("--dx", (b.left + b.width/2 - (a.left + a.width/2)) + "px");
      nodo.style.setProperty("--dy", (b.top + b.height/2 - (a.top + a.height/2)) + "px");
      nodo.classList.add("vuela");
      /* Al llegar, la mata acusa el golpe con un latido del mismo color. */
      setTimeout(() => {
        blanco.style.setProperty("--s", m.color);
        blanco.classList.remove("tocada"); void blanco.offsetWidth; blanco.classList.add("tocada");
        setTimeout(() => blanco.classList.remove("tocada"), 650);
      }, 440);
    } else nodo.classList.add("ido");
    yo.t2 = setTimeout(() => {
      nodo.remove();
      if (actual === yo) actual = null;
      const sig = cola.shift();
      if (sig) suceso(sig[0], sig[1], sig[2]);
    }, 620);                            /* lo que dura el vuelo, con su apagado final */
  }, vida);
  actual = yo;
}

/* Lo que se exporta. PALABRA y CLIMA los revisa la prueba de coherencia,
   para que ninguna jugada nueva se quede sin anunciar. */
const API = { suceso, PALABRA, CLIMA, FIG, SIN_CARTA };
if (typeof module !== "undefined" && module.exports) module.exports = API; else raiz.SUCESOS = API;
})(typeof self !== "undefined" ? self : globalThis);
