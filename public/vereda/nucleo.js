/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — núcleo compartido de los mini juegos
   Lo que todos los juegos comparten: el costal de granos, el álbum
   de la finca, los récords, el paisaje, la barra de arriba y la
   ventana de premio. Todo se guarda en el teléfono (localStorage).

   Depende de reglas.js (REGLAS), arte.js (ARTE) y sonido.js (SONIDO).
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const R = raiz.REGLAS, A = raiz.ARTE, S = raiz.SONIDO;

/* ── Guardado ──────────────────────────────────────────────── */
const LLAVE = "cosecha.vereda";
const VACIO = () => ({ v: 1, granos: 0, total: 0, laminas: {}, records: {}, acertijo: { dias: {}, racha: 0, ultimo: "" }, partidas: {} });
let D = null;
function datos() {
  if (D) return D;
  try { D = Object.assign(VACIO(), JSON.parse(localStorage.getItem(LLAVE) || "{}")); } catch (e) { D = VACIO(); }
  return D;
}
function guardar() { try { localStorage.setItem(LLAVE, JSON.stringify(datos())); } catch (e) {} }
const nombre = () => { try { return localStorage.getItem("cosecha.nombre") || ""; } catch (e) { return ""; } };

/* ── Granos ────────────────────────────────────────────────── */
function granos() { return datos().granos; }
function sumar(n) {
  n = Math.max(0, Math.round(n)); if (!n) return 0;
  const d = datos(); d.granos += n; d.total += n; guardar(); pintarCostal(true); return n;
}
function gastar(n) {
  const d = datos(); if (d.granos < n) return false;
  d.granos -= n; guardar(); pintarCostal(); return true;
}
/* Récord por juego y nivel; devuelve true si es nuevo. */
function record(juego, nivel, puntos) {
  const d = datos(); d.records[juego] = d.records[juego] || {};
  const k = String(nivel), antes = d.records[juego][k] || 0;
  d.partidas[juego] = (d.partidas[juego] || 0) + 1;
  if (puntos > antes) { d.records[juego][k] = puntos; guardar(); return true; }
  guardar(); return false;
}
const recordDe = (juego, nivel) => ((datos().records[juego] || {})[String(nivel)] || 0);

/* ── Álbum de la finca: las 45 cartas distintas, con un dato real ── */
const DATO = {
  c_cafe: "Colombia es famosa en el mundo por su café suave. Las matas crecen en la montaña, entre 1.200 y 2.000 metros de altura, y el grano maduro es rojo como una cereza.",
  c_platano: "El plátano acompaña casi todo en la mesa colombiana: patacón, tajada, sancocho. En los cafetales se siembra para darle sombra al café.",
  c_cacao: "Del cacao sale el chocolate. La mazorca crece pegada al tronco y adentro trae semillas envueltas en una pulpa dulce.",
  c_cana: "De la caña de azúcar se hace la panela, en trapiches que muelen la caña y cocinan el jugo hasta que se endurece.",
  c_huerta: "La huerta de la casa tiene de todo un poquito: cebolla, cilantro, tomate, yuca. Por eso le entra cualquier plaga y le sirve cualquier remedio.",
  c_vivero: "En el vivero las maticas nacen bajo techo, protegidas del sol fuerte y de la lluvia, hasta que están listas para sembrarlas.",
  c_injerto: "Injertar es unir un pedacito de una planta con otra para que crezca más fuerte. Se hace mucho con frutales como el aguacate.",
  p_comun_cafe: "La broca es un cucarroncito más pequeño que un grano de arroz. Se mete en la cereza del café y se come la semilla.",
  p_comun_platano: "La sigatoka negra es un hongo que le pinta rayas oscuras a las hojas del plátano y las va secando.",
  p_comun_cacao: "La monilia es un hongo que pudre la mazorca de cacao por dentro y la cubre de un polvito blanco.",
  p_comun_cana: "El barrenador es la larva de una mariposa nocturna: abre huecos y túneles dentro del tallo de la caña.",
  p_comun_huerta: "Las langostas son saltamontes que, cuando se juntan en manada, pueden dejar un cultivo pelado en poco tiempo.",
  p_resistente_cafe: "La roya es un hongo que deja manchas anaranjadas como polvo debajo de las hojas del café. Los científicos crearon variedades de café que la resisten.",
  p_resistente_platano: "El picudo es un cucarrón negro con trompa larga. Sus larvas se comen la base de la mata de plátano.",
  p_resistente_cacao: "La escoba de bruja es un hongo que hace brotar ramitas secas y enredadas, como una escoba vieja.",
  p_resistente_cana: "Diatraea es el nombre científico de los gusanos barrenadores de la caña. Hay varias especies y todas perforan el tallo.",
  p_resistente_huerta: "La hormiga arriera corta pedacitos de hoja y se los lleva al hormiguero. No se los come: con ellos cultiva un hongo que es su comida.",
  r_casero_cafe: "El caldo bordelés se prepara con sulfato de cobre y cal. Es una receta muy antigua para proteger las hojas de los hongos.",
  r_casero_platano: "Muchos campesinos riegan ceniza del fogón alrededor de sus matas: ayuda a espantar algunos bichos y le da minerales a la tierra.",
  r_casero_cacao: "Podar es cortar las ramas de más. En el cacao se sacan las mazorcas enfermas para que el hongo no pase a las sanas.",
  r_casero_cana: "Una trampa de melaza atrae a los insectos con su olor dulce, y ahí se quedan pegados.",
  r_casero_huerta: "El jabón potásico es un jabón suave que se mezcla con agua para quitar pulgones y otros bichos blanditos de las hojas.",
  r_bioinsumo_cafe: "Beauveria es un hongo amigo: ataca a la broca sin hacerle daño al café. Se usa mucho en los cafetales de Colombia.",
  r_bioinsumo_platano: "Trichoderma es un hongo bueno que vive en la tierra y protege las raíces de los hongos malos.",
  r_bioinsumo_cacao: "El bioabono se hace con restos de cosecha, hojas y estiércol que se descomponen. Alimenta la tierra sin químicos.",
  r_bioinsumo_cana: "Trichogramma es una avispita diminuta que pone sus huevos dentro de los huevos del barrenador. Así lo controla sin venenos.",
  r_bioinsumo_huerta: "Los microorganismos eficientes son bichitos invisibles, como levaduras y bacterias buenas, que ayudan a que la tierra esté sana.",
  f_trueque: "En las veredas se sigue haciendo trueque: cambiar lo que te sobra por lo que te hace falta, sin plata de por medio.",
  f_saqueo: "«Mano larga» le dicen en Colombia a quien coge lo que no es suyo. En el juego es una travesura; en la vida real, ¡no se hace!",
  f_propagacion: "Las plagas saltan de una mata a otra con el viento, el agua o las herramientas. Por eso se limpian los machetes al pasar de un lote a otro.",
  f_chaparron: "Un chaparrón es un aguacero fuerte y repentino. En la montaña puede caer de un momento a otro.",
  f_lindero: "El lindero es la línea que separa una finca de otra. Muchas veces lo marca una cerca viva de árboles.",
  f_mallasombra: "La polisombra es una malla que tapa parte del sol. Se usa en viveros y huertas para que las maticas no se quemen.",
  f_jornalExtra: "Un jornal es el pago de un día de trabajo en el campo. En cosecha se necesitan muchos recolectores para alcanzar a coger todo el café.",
  f_consejo: "El mayordomo es quien cuida y organiza la finca. Casi siempre sabe más que nadie de las matas y del clima.",
  f_erradicacion: "Erradicar es sacar de raíz. Cuando una mata está muy enferma, a veces toca arrancarla para salvar a las demás.",
  f_mohan_cafe: "El Mohán es un espanto del río Magdalena. Dicen que es peludo y barbudo, que toca el tiple y que les hace travesuras a los pescadores.",
  f_mohan_platano: "Cuentan en el Tolima y el Huila que el Mohán vive en cuevas junto al río y se esconde para asustar a quien anda solo de noche.",
  f_mohan_cacao: "Dicen que el Mohán enreda las atarrayas de los pescadores y se roba el tabaco que dejan en la orilla.",
  f_mohan_cana: "La leyenda cuenta que el Mohán se transforma en pez, en caimán o en piedra para que nadie lo encuentre.",
  f_patasola: "La Patasola es una mujer de una sola pata que anda por el monte. Los abuelos la nombran para que nadie se meta solo en la selva de noche.",
  f_duende: "El Duende es un espanto travieso que esconde las cosas de la casa y les hace trenzas a las crines de los caballos.",
  f_llorona: "La Llorona es un espanto que llora a orillas de los ríos y quebradas buscando a sus hijos.",
  f_madremonte: "La Madremonte cuida el bosque. Se enoja con quienes tumban árboles o ensucian las quebradas, y los extravía en el monte.",
  f_sombreron: "El Sombrerón es un jinete de sombrero gigante que sale de noche en su caballo negro. Es una leyenda de Antioquia."
};
const GRUPOS = [
  ["cultivos", "Cultivos"], ["plagas", "Plagas"], ["remedios", "Remedios"], ["faenas", "Faenas"], ["espantos", "Espantos"]
];
/* Arma las 45 láminas a partir del motor, para que coincidan con las cartas. */
function armarLaminas() {
  const out = [], visto = new Set();
  const add = (carta, grupo) => {
    const k = A.clavesCarta(carta)[0];
    if (visto.has(k)) return; visto.add(k);
    out.push({ clave: k, carta, grupo, nombre: R.nombreCarta(carta),
      clase: R.claseCarta(carta), tono: R.colorCarta(carta), dato: DATO[k] || "" });
  };
  ["cafe", "platano", "cacao", "cana", "huerta", "vivero", "injerto"].forEach(c => add({ k: "cultivo", c }, "cultivos"));
  ["comun", "resistente"].forEach(t => ["cafe", "platano", "cacao", "cana", "huerta"].forEach(c => add({ k: "plaga", c, t }, "plagas")));
  ["casero", "bioinsumo"].forEach(t => ["cafe", "platano", "cacao", "cana", "huerta"].forEach(c => add({ k: "remedio", c, t }, "remedios")));
  Object.keys(R.FAENA).forEach(tr => add({ k: "faena", tr }, R.ESPANTOS.has(tr) ? "espantos" : "faenas"));
  return out;
}
let _lam = null;
const LAMINAS = () => _lam || (_lam = armarLaminas());
const lamina = k => LAMINAS().find(l => l.clave === k);
const tiene = k => !!datos().laminas[k];
const cuantasLaminas = () => Object.keys(datos().laminas).filter(k => lamina(k)).length;
/* Gana una lámina que no tengas, de las claves que se pasen (o de todas). */
function ganarLamina(claves, rnd) {
  const r = rnd || Math.random;
  const pool = (claves || LAMINAS().map(l => l.clave)).filter(k => lamina(k) && !tiene(k));
  if (!pool.length) return null;
  const k = pool[Math.floor(r() * pool.length)];
  datos().laminas[k] = Date.now(); guardar();
  return lamina(k);
}
const PRECIO_SOBRE = 25;
function abrirSobre() {
  if (cuantasLaminas() >= LAMINAS().length) return null;
  if (!gastar(PRECIO_SOBRE)) return null;
  return ganarLamina();
}

/* ── Azar con semilla (acertijo del día) ───────────────────── */
function semilla(texto) {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) { h = Math.imul(h ^ texto.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  let a = h >>> 0;
  return function () {                           /* mulberry32 */
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hoy() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* ── Piezas de pantalla ─────────────────────────────────────── */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const GRANO = `<svg class="grano" viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="15" ry="19" fill="#7B4B2A"/>
  <ellipse cx="24" cy="24" rx="15" ry="19" fill="none" stroke="#3E2413" stroke-width="2.4"/>
  <path d="M24 7c-5 6-5 28 0 34" fill="none" stroke="#3E2413" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="17" cy="16" rx="3.5" ry="5" fill="#fff" opacity=".28"/></svg>`;

/* La ilustración de una carta: el PNG si existe, si no el dibujo vectorial. */
const ilustra = carta => A.ilustracion(carta, R.colorCarta(carta));
const arteClave = (k, carta) => A.arteDe(k) || (carta ? ilustra(carta) : "");

function cartica(carta, extra) {
  const x = extra || {};
  return `<button class="cartica ${x.clase || ""}" style="--t:${R.colorCarta(carta)}" ${x.attrs || ""}>
    ${x.costo === false ? "" : `<span class="cost" title="jornales">${R.cuesta(carta)}</span>`}
    <span class="ilu">${ilustra(carta)}</span>
    <span class="n">${esc(R.nombreCarta(carta))}</span>
    <span class="cl">${esc(R.claseCarta(carta))}</span></button>`;
}
const ETIQ = { sano: "Sana", protegido: "Protegida", certificado: "Certificada", plagado: "Plagada" };
function mata(o, attrs) {
  const e = R.esVivero(o) ? "certificado" : R.estadoMata(o);
  const enc = [...o.remedios, ...o.plagas].map(c =>
    `<span style="--t:${R.colorCarta(c)}" title="${esc(R.nombreCarta(c))}">${ilustra(c)}</span>`).join("");
  const txt = R.esVivero(o) ? "Bajo techo" : e === "plagado" ? R.nombreCarta(o.plagas[0]) : ETIQ[e];
  return `<button class="mata ${e}" style="--t:${R.CULTIVO[o.carta.c].hex}" ${attrs || ""}>
    <span class="disco">${A.dibujoCultivo(o.carta.c)}</span>
    ${enc ? `<span class="enc">${enc}</span>` : ""}
    <span class="est">${esc(txt)}</span></button>`;
}

const PAISAJE = `<div id="paisaje" aria-hidden="true"><svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs>
<linearGradient id="vcielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA9B8"/><stop offset=".38" stop-color="#A7C08E"/><stop offset=".62" stop-color="#6E8C4E"/><stop offset="1" stop-color="#33452A"/></linearGradient>
<linearGradient id="vlejos" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E7F86"/><stop offset="1" stop-color="#47656A"/></linearGradient>
<linearGradient id="vmedio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A6B43"/><stop offset="1" stop-color="#3B5636"/></linearGradient>
<linearGradient id="vcerca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33492B"/><stop offset="1" stop-color="#26351E"/></linearGradient>
<radialGradient id="vsol" cx="76%" cy="17%" r="26%"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9B0" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="800" fill="url(#vcielo)"/><circle cx="912" cy="136" r="34" fill="#FFF0C4" opacity=".7"/><rect width="1200" height="800" fill="url(#vsol)"/>
<path d="M0 330 L120 268 L210 306 L330 232 L452 300 L560 254 L660 302 L790 240 L900 296 L1020 250 L1130 300 L1200 268 L1200 800 L0 800Z" fill="url(#vlejos)" opacity=".62"/>
<path d="M0 404 L140 350 L280 396 L420 336 L580 398 L720 348 L860 398 L1000 344 L1140 396 L1200 370 L1200 800 L0 800Z" fill="url(#vmedio)"/>
<g opacity=".22" fill="#20301A"><circle cx="180" cy="392" r="7"/><circle cx="214" cy="400" r="6"/><circle cx="252" cy="392" r="7"/><circle cx="470" cy="380" r="7"/><circle cx="508" cy="390" r="6"/><circle cx="546" cy="382" r="7"/><circle cx="770" cy="382" r="7"/><circle cx="808" cy="392" r="6"/><circle cx="846" cy="384" r="7"/><circle cx="1040" cy="380" r="7"/><circle cx="1078" cy="390" r="6"/></g>
<path d="M0 520 L180 466 L360 514 L540 460 L720 512 L900 458 L1080 510 L1200 478 L1200 800 L0 800Z" fill="url(#vcerca)"/>
<g stroke="#1E2A17" stroke-width="16" stroke-linecap="round" opacity=".38" fill="none"><path d="M-40 620 Q 300 578 640 626 T 1260 610"/><path d="M-40 690 Q 300 646 640 696 T 1260 678"/><path d="M-40 766 Q 300 720 640 772 T 1260 752"/></g>
<g fill="#243318" opacity=".5"><circle cx="90" cy="612" r="13"/><circle cx="300" cy="592" r="12"/><circle cx="520" cy="612" r="13"/><circle cx="760" cy="620" r="12"/><circle cx="980" cy="604" r="13"/><circle cx="1150" cy="612" r="12"/><circle cx="180" cy="686" r="15"/><circle cx="430" cy="668" r="14"/><circle cx="700" cy="692" r="15"/><circle cx="960" cy="678" r="14"/><circle cx="1180" cy="688" r="15"/></g>
</svg><span class="neblina n1"></span><span class="neblina n2"></span><span class="tinte"></span><span class="velo"></span>
<span class="luces"><i style="left:12%;top:58%"></i><i style="left:37%;top:63%;animation-delay:2.3s"></i><i style="left:61%;top:60%;animation-delay:1.8s"></i><i style="left:86%;top:64%;animation-delay:2.7s"></i></span></div>`;

const ICO_SON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V9a6 6 0 0 0-6-6Z"/><path d="M10 19a2 2 0 0 0 4 0Z"/></svg>`;

/* Monta el paisaje y la barra de arriba. volver: a dónde lleva la flecha. */
function montar({ titulo, volver, escena }) {
  document.body.dataset.escena = escena || "portada";
  document.body.insertAdjacentHTML("afterbegin", PAISAJE + `
    <header class="vbarra">
      <a class="atras" href="${esc(volver || "index.html")}" aria-label="Volver">‹</a>
      <span class="titulo">${esc(titulo || "La Vereda")}</span>
      <button class="son" id="vSon" aria-label="Efectos de sonido" aria-pressed="${S ? S.estado.efectos : false}">${ICO_SON}</button>
      <span class="costal" id="vCostal" title="Granos de tu costal">${GRANO}<b>${granos()}</b></span>
    </header>`);
  const b = document.getElementById("vSon");
  b.onclick = () => { if (!S) return; b.setAttribute("aria-pressed", S.alternar("efectos")); };
  /* Los navegadores piden un toque antes de sonar. */
  const arranca = () => { try { S && S.arrancar(); } catch (e) {} window.removeEventListener("pointerdown", arranca); };
  window.addEventListener("pointerdown", arranca);
}
function pintarCostal(sube) {
  const c = document.getElementById("vCostal"); if (!c) return;
  c.querySelector("b").textContent = granos();
  if (sube) { c.classList.remove("sube"); void c.offsetWidth; c.classList.add("sube"); }
}
function efecto(t) { try { S && S.efecto(t); } catch (e) {} }

/* Carga la lista de ilustraciones PNG. Si falla, todo sigue con los dibujos. */
const cargarArte = () => fetch("cartas/lista.json").then(r => r.ok ? r.json() : []).catch(() => [])
  .then(l => { A.usarExternas(l); return true; });

/* Aviso que flota en el centro: «¡Bien!», «−3 s»… */
function aviso(txt, color) {
  const n = document.createElement("div");
  n.className = "aviso"; n.textContent = txt; if (color) n.style.color = color;
  document.body.appendChild(n); setTimeout(() => n.remove(), 950);
}

/* Ventana de premio al terminar un juego. Devuelve una promesa que se
   resuelve con el botón elegido ("otra" | "salir" | lo que se pase). */
function premio({ titulo, linea, arte, tono, cinta, ganados, lam, botones }) {
  return new Promise(res => {
    const v = document.createElement("div"); v.className = "velo-modal";
    const bots = botones || [["otra", "Otra vez", true], ["salir", "Volver a la vereda"]];
    v.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="--t:${tono || "#4A6338"}">
      <div class="medalla">${arte || GRANO}</div>${cinta ? `<span class="cinta">${esc(cinta)}</span>` : ""}
      <h2>${esc(titulo)}</h2>${linea ? `<p>${linea}</p>` : ""}
      <div class="premios">
        ${ganados ? `<span class="premio">${GRANO}<span>+${ganados} granos</span></span>` : ""}
        ${lam ? `<span class="premio lam"><span class="cartica" style="--t:${lam.tono};width:90px"><span class="ilu">${ilustra(lam.carta)}</span>
          <span class="n">${esc(lam.nombre)}</span></span><span>¡Lámina nueva para el álbum!</span></span>` : ""}
      </div>
      <div class="fila">${bots.map(([id, t, prin]) => `<button class="${prin ? "jugar" : "boton"}" data-b="${id}" style="${prin ? "" : ""}">${esc(t)}</button>`).join("")}</div>
    </div>`;
    document.body.appendChild(v);
    v.querySelectorAll("[data-b]").forEach(b => b.onclick = () => { v.remove(); res(b.dataset.b); });
  });
}
function ventana(html, tono) {
  const v = document.createElement("div"); v.className = "velo-modal";
  v.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="--t:${tono || "#4A6338"}">${html}
    <div class="fila" style="margin-top:14px"><button class="boton" data-cerrar>Cerrar</button></div></div>`;
  v.onclick = e => { if (e.target === v || e.target.closest("[data-cerrar]")) v.remove(); };
  document.body.appendChild(v);
  return v;
}

raiz.VEREDA = { datos, guardar, nombre, granos, sumar, gastar, record, recordDe, LAMINAS, lamina, tiene,
  cuantasLaminas, ganarLamina, abrirSobre, PRECIO_SOBRE, GRUPOS, semilla, hoy, esc, GRANO, ilustra, arteClave,
  cartica, mata, montar, pintarCostal, efecto, cargarArte, aviso, premio, ventana };
})(typeof self !== "undefined" ? self : globalThis);
