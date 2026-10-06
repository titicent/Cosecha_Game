/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — El espantapájaros (la huerta de la casa)
   Un minuto cuidando la huerta. Por las orillas entran animales que
   vienen por las matas: la ardilla por el cacao, la gallina por la huerta
   y el ternero por la caña. Se tocan para espantarlos.

   Pero no todo el que llega viene a hacer daño: la abeja, la mariquita y
   el pajarito ayudan a la finca y no se espantan. Es la misma idea de los
   bioinsumos del juego grande: hay bichos amigos que cuidan las matas.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

/* Las matas de la huerta, dónde están (en % del campo) y qué animal las busca. */
const MATAS = {
  cacao:  { x: 24, y: 64 },
  huerta: { x: 50, y: 74 },
  cana:   { x: 76, y: 64 }
};
const ANIMALES = {
  ardilla:  { nom: "la ardilla",  amigo: false, mata: "cacao",  carta: "n_ardilla",
    llega: "La ardilla se comió una mazorca de cacao." },
  gallina:  { nom: "la gallina",  amigo: false, mata: "huerta", carta: "n_gallina",
    llega: "La gallina escarbó la huerta." },
  ternero:  { nom: "el ternero",  amigo: false, mata: "cana",   carta: "n_ternero",
    llega: "El ternero se comió las hojas de la caña." },
  abeja:    { nom: "la abeja",    amigo: true, carta: "n_abeja",
    porque: "¡La abeja es amiga! Lleva el polen de flor en flor, y sin ella no hay frutos." },
  mariquita:{ nom: "la mariquita", amigo: true, carta: "n_mariquita",
    porque: "¡La mariquita es amiga! Se come los pulgones que dañan la huerta." },
  pajarito: { nom: "el pajarito", amigo: true, carta: "n_pajarito",
    porque: "¡El pajarito es amigo! Se come los gusanos y los bichos de las matas." }
};
const QUE_MOLESTAN = ["ardilla", "gallina", "ternero"], AMIGOS = ["abeja", "mariquita", "pajarito"];

const NIVELES = [
  null,
  { n: 1, nom: "Fácil",   nota: "Solo los que molestan, despacio", amigos: 0,   viaje: 4600, cada: 1300, grupo: 0,   mult: 1 },
  { n: 2, nom: "Medio",   nota: "Llegan los animales amigos",      amigos: .3,  viaje: 4000, cada: 1100, grupo: 0,   mult: 1.5, abre: 12 },
  { n: 3, nom: "Difícil", nota: "Más rápido y de a varios",        amigos: .33, viaje: 3300, cada: 950,  grupo: .35, mult: 2,   abre: 15 }
];
const DURACION = 60;

/* Qué entra ahora. avance va de 0 (empieza) a 1 (se acaba el minuto).
   Devuelve una lista: casi siempre un animal, en Difícil a veces dos. */
function oleada(nivel, avance, rnd) {
  const N = NIVELES[nivel], al = a => a[Math.floor(rnd() * a.length)];
  const uno = () => rnd() < N.amigos ? al(AMIGOS) : al(QUE_MOLESTAN);
  const out = [uno()];
  if (rnd() < N.grupo * (.5 + avance)) out.push(al(QUE_MOLESTAN));
  return out;
}
/* Cuánto se demora un animal en llegar a su mata: cada vez menos. */
const viaje = (nivel, avance) => Math.round(NIVELES[nivel].viaje * (1 - .3 * avance));
const espera = (nivel, avance) => Math.round(NIVELES[nivel].cada * (1 - .4 * avance));

const API = { MATAS, ANIMALES, QUE_MOLESTAN, AMIGOS, NIVELES, DURACION, oleada, viaje, espera };
raiz.ESPANTAPAJAROS = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;

/* ══ Pantalla ═══════════════════════════════════════════════════ */
if (typeof document === "undefined" || !raiz.VEREDA) return;
const V = raiz.VEREDA, R = raiz.REGLAS, A = raiz.ARTE, esc = V.esc;
const app = document.getElementById("app");
const LAMINAS = ["c_huerta", "c_cacao", "c_cana", "r_bioinsumo_cana", "r_bioinsumo_huerta", "f_mallasombra", "r_casero_huerta"];
const CLAVE = "espantapajaros";
let nivel = 1;
const abierto = n => n === 1 || V.recordDe(CLAVE, n - 1) >= NIVELES[n].abre;

/* La ilustración del animal; si todavía no hay PNG, un círculo con su inicial. */
const dibujo = k => A.arteDe(ANIMALES[k].carta) ||
  `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="${ANIMALES[k].amigo ? "#E0B04A" : "#A34A2B"}"/>
   <text x="24" y="31" text-anchor="middle" font-size="20" fill="#fff" font-family="sans-serif">${k[0].toUpperCase()}</text></svg>`;
const mataDibujo = c => V.arteClave("c_" + c, { k: "cultivo", c });

/* ── Portada ───────────────────────────────────────────────── */
function portada() {
  if (!abierto(nivel)) nivel = 1;
  const fila = k => `<li><span class="p">${dibujo(k)}</span><span>${k === "ardilla" ? "La <b>ardilla</b> va por el cacao"
    : k === "gallina" ? "La <b>gallina</b> va por la huerta" : "El <b>ternero</b> va por la caña"}.</span></li>`;
  app.innerHTML = `<section class="marco v-portada"><div class="v-cuento">
    <h2>El espantapájaros</h2>
    <p>Hoy cuidas la huerta de la casa. Por las orillas entran animales que vienen por las matas: tócalos para espantarlos antes de que lleguen.</p>
    <ul class="reglas-esp">${QUE_MOLESTAN.map(fila).join("")}</ul>
    <p class="amigos"><span class="ps">${AMIGOS.map(k => `<span class="p">${dibujo(k)}</span>`).join("")}</span>
      <span>Desde el nivel Medio llegan <b>animales amigos</b>: la abeja, la mariquita y el pajarito. Esos ayudan a la finca: <b>no los espantes</b>.</span></p>
    </div><div class="v-elige">
    <div class="niveles">${[1, 2, 3].map(n => {
      const ok = abierto(n), rec = V.recordDe(CLAVE, n);
      return `<button class="nivel" data-n="${n}" aria-pressed="${n === nivel}" ${ok ? "" : "disabled"}>
        <b>${NIVELES[n].nom}</b><small>${NIVELES[n].nota}</small>
        ${ok ? `<small>${rec ? "Récord " + rec : "Sin jugar"}</small>` : `<span class="candado">🔒 ${NIVELES[n].abre} puntos en ${NIVELES[n - 1].nom}</span>`}</button>`; }).join("")}</div>
    <button class="jugar" id="ya">¡A cuidar la huerta!</button>
    <p class="nota">Espantar uno que molesta: +1. Si llega a la mata: −1. Espantar a un amigo: −2.</p>
    </div>
  </section>`;
  app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { nivel = +b.dataset.n; portada(); });
  document.getElementById("ya").onclick = jugar;
}

/* ── El juego ──────────────────────────────────────────────── */
function jugar() {
  const N = NIVELES[nivel];
  let resta = DURACION, puntos = 0, espantados = 0, llegaron = 0, amigosMal = 0, racha = 0, vivo = true;
  const vivos = new Set();
  app.innerHTML = `
    <div class="hud"><div class="dato"><b id="hP">0</b><small>Puntos</small></div>
      <div class="dato"><b id="hE">0</b><small>Espantados</small></div>
      <div class="dato"><b id="hL">0</b><small>Llegaron</small></div>
      <div class="dato"><b id="hT">${DURACION}</b><small>Segundos</small></div></div>
    <div class="reloj" id="reloj"><i></i></div>
    <div class="campo" id="campo">
      <span class="espanta">${A.arteDe("n_espantapajaros") ? `<img src="cartas/n_espantapajaros.png" alt="">` : ""}</span>
      ${Object.entries(MATAS).map(([c, p]) => `<span class="mata-h" data-mata="${c}" style="left:${p.x}%;top:${p.y}%">${mataDibujo(c)}</span>`).join("")}
    </div>`;
  const $ = id => document.getElementById(id), campo = $("campo");
  const hud = () => { $("hP").textContent = puntos; $("hE").textContent = espantados; $("hL").textContent = llegaron; };

  /* De dónde sale: de un lado o de arriba, lejos de su mata. */
  function salida() {
    const lado = Math.random();
    if (lado < .38) return { x: -8, y: 20 + Math.random() * 55 };
    if (lado < .76) return { x: 108, y: 20 + Math.random() * 55 };
    return { x: 10 + Math.random() * 80, y: -10 };
  }
  function soltar(k) {
    const a = ANIMALES[k], avance = 1 - resta / DURACION;
    const b = document.createElement("button");
    b.className = "animal " + (a.amigo ? "amigo " : "") + k;
    b.setAttribute("aria-label", a.nom[0].toUpperCase() + a.nom.slice(1));
    b.innerHTML = `<span class="cuerpo">${dibujo(k)}</span>`;
    const de = salida();
    let hacia, frames, dur;
    if (a.amigo) {
      /* Los amigos pasan de lado a lado, dando vueltas por encima de las matas. */
      const izq = Math.random() < .5, y0 = 18 + Math.random() * 40;
      const x0 = izq ? -8 : 108, x1 = izq ? 108 : -8;
      hacia = { x: x1 };
      frames = [0, .25, .5, .75, 1].map((t, i) => ({ left: (x0 + (x1 - x0) * t) + "%", top: (y0 + (i % 2 ? -8 : 8) * (k === "pajarito" ? .4 : 1)) + "%" }));
      dur = 5200 - avance * 1200;
    } else {
      const m = MATAS[a.mata];
      hacia = { x: m.x };
      frames = [{ left: de.x + "%", top: de.y + "%" }, { left: m.x + "%", top: (m.y - 6) + "%" }];
      dur = viaje(nivel, avance);
    }
    if (hacia.x < (a.amigo ? 50 : de.x)) b.classList.add("izq");    /* mira hacia donde camina */
    campo.appendChild(b);
    const anim = b.animate(frames, { duration: dur, easing: a.amigo ? "linear" : "cubic-bezier(.4,.1,.8,.9)", fill: "forwards" });
    const ser = { b, k, anim, fuera: false };
    vivos.add(ser);
    anim.onfinish = () => { if (!ser.fuera) a.amigo ? irse(ser) : llega(ser); };
    b.addEventListener("pointerdown", e => { e.preventDefault(); tocar(ser); });
  }
  function irse(ser) { ser.fuera = true; vivos.delete(ser); ser.b.remove(); }
  function llega(ser) {
    if (!vivo) return irse(ser);
    const a = ANIMALES[ser.k];
    llegaron++; racha = 0; puntos = Math.max(0, puntos - 1); hud();
    V.efecto("error"); V.aviso(a.llega, "#FFB4A8");
    const m = campo.querySelector(`[data-mata="${a.mata}"]`);
    if (m) { m.classList.remove("mordida"); void m.offsetWidth; m.classList.add("mordida"); }
    ser.fuera = true; vivos.delete(ser);
    ser.b.classList.add("come"); setTimeout(() => ser.b.remove(), 450);
  }
  function tocar(ser) {
    if (!vivo || ser.fuera) return;
    const a = ANIMALES[ser.k];
    ser.fuera = true; vivos.delete(ser);
    ser.anim.pause();
    if (a.amigo) {
      amigosMal++; racha = 0; puntos = Math.max(0, puntos - 2); hud();
      V.efecto("error"); avisoLargo(a.porque);
      ser.b.classList.add("asustado"); setTimeout(() => ser.b.remove(), 500);
      return;
    }
    espantados++; racha++; puntos += 1;
    if (racha % 8 === 0) { puntos += 2; V.aviso("¡" + racha + " seguidos! +2", "#F3D27A"); }
    hud(); V.efecto("bajar");
    /* sale corriendo para el lado contrario de donde iba */
    const r = ser.b.getBoundingClientRect(), c = campo.getBoundingClientRect();
    const x = (r.left + r.width / 2 - c.left) / c.width * 100, y = (r.top + r.height / 2 - c.top) / c.height * 100;
    const huye = x < 50 ? -15 : 115;
    ser.b.classList.toggle("izq", huye < 50); ser.b.classList.add("huye");
    ser.b.animate([{ left: x + "%", top: y + "%" }, { left: huye + "%", top: (y - 10) + "%" }], { duration: 450, easing: "ease-in", fill: "forwards" })
      .onfinish = () => ser.b.remove();
  }
  /* El aviso de por qué un amigo no se espanta dura más que los demás. */
  function avisoLargo(txt) {
    const n = document.createElement("div"); n.className = "porque-amigo"; n.textContent = txt;
    campo.appendChild(n); setTimeout(() => n.remove(), 2600);
  }

  let proxima = 600;
  const paso = 100;
  const tic = setInterval(() => {
    resta = Math.max(0, resta - paso / 1000);
    proxima -= paso;
    const avance = 1 - resta / DURACION;
    if (proxima <= 0 && resta > 1.5) { oleada(nivel, avance, Math.random).forEach((k, i) => setTimeout(() => vivo && soltar(k), i * 220)); proxima = espera(nivel, avance); }
    if (resta <= 5 && Math.abs(resta - Math.round(resta)) < .05 && resta > 0) V.efecto("tic");
    $("hT").textContent = Math.ceil(resta);
    const barra = $("reloj").querySelector("i");
    barra.style.transform = `scaleX(${resta / DURACION})`;
    barra.style.setProperty("--resta", resta / DURACION);
    $("reloj").classList.toggle("poco", resta <= 10);
    if (resta <= 0) fin();
  }, paso);

  function fin() {
    vivo = false; clearInterval(tic);
    vivos.forEach(s => { s.anim.cancel(); s.b.remove(); }); vivos.clear();
    const nuevo = V.record(CLAVE, nivel, puntos);
    const ganados = V.sumar(puntos * N.mult / 3);
    const lam = puntos >= 15 ? V.ganarLamina(LAMINAS) : null;
    const siguiente = NIVELES[nivel + 1];
    V.efecto(puntos >= 15 ? "victoria" : "derrota");
    V.premio({
      titulo: puntos + (puntos === 1 ? " punto" : " puntos"),
      linea: (nuevo && puntos ? "¡Récord nuevo en " + N.nom + "! " : "") +
        (siguiente && puntos >= siguiente.abre ? "Ya puedes jugar el nivel <b>" + siguiente.nom + "</b>. " : "") +
        `Espantaste ${espantados} ${espantados === 1 ? "animal" : "animales"}` + (llegaron ? `, ${llegaron} ${llegaron === 1 ? "llegó" : "llegaron"} a las matas` : " y ninguno llegó a las matas") +
        (amigosMal ? ` y asustaste ${amigosMal} ${amigosMal === 1 ? "amigo" : "amigos"} de la finca.` : "."),
      arte: A.arteDe("n_espantapajaros") || mataDibujo("huerta"), tono: "#7A5A2E", cinta: "El espantapájaros", ganados, lam
    }).then(b => {
      if (b === "salir") location.href = "vereda/index.html";
      else { if (siguiente && abierto(nivel + 1) && puntos >= siguiente.abre) nivel++; portada(); }
    });
  }
  hud();
}

V.montar({ titulo: "El espantapájaros", volver: "vereda/index.html", escena: "mediodia" });
portada();
V.cargarArte().then(() => { if (!app.querySelector(".campo")) portada(); });
})(typeof self !== "undefined" ? self : globalThis);
