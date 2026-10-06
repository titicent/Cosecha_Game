/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — La Recolecta (el cafetal)
   Un minuto en la rama del café: se cogen las cerezas rojas, se dejan
   las verdes y los granos brocados van al costal aparte, que es como se
   hace en la finca para que la broca no se riegue por el cafetal.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
const V = VEREDA, R = REGLAS, esc = V.esc;
const app = document.getElementById("app");
const DURACION = 60;
const LAMINAS = ["c_cafe", "p_comun_cafe", "r_bioinsumo_cafe", "f_jornalExtra", "p_resistente_cafe", "r_casero_cafe", "f_mallasombra"];

/* ── Dibujos ───────────────────────────────────────────────── */
const cereza = (color, brocada) => `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 4c2 3 2 6 0 9" stroke="#4E3A1E" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="24" cy="27" rx="17" ry="18" fill="${color}"/>
  <ellipse cx="24" cy="27" rx="17" ry="18" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
  <path d="M24 12c-3 7-3 22 0 32" stroke="rgba(0,0,0,.22)" stroke-width="2" fill="none"/>
  <ellipse cx="17" cy="19" rx="4.5" ry="6" fill="#fff" opacity=".4"/>
  ${brocada ? `<circle cx="29" cy="33" r="6" fill="#2A160C"/><circle cx="29" cy="33" r="6" fill="none" stroke="#6B2A18" stroke-width="1.5"/>
    <g transform="translate(29 33) rotate(-25)"><ellipse cx="0" cy="-2" rx="5.5" ry="3.8" fill="#1B120B"/>
      <path d="M-3 -5l-3-4M1 -5.5l1-4.5M-3 1l-3 4M1 1.5l1 4.5M4 -3l4-3M4 0l4 2" stroke="#1B120B" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="4" cy="-3" r="1.1" fill="#fff"/></g>` : ""}</svg>`;
const TIPOS = {
  madura:  { color: "#C0392B", brocada: false },
  verde:   { color: "#79AE45", brocada: false },
  brocada: { color: "#B8392B", brocada: true }
};
/* La rama: tres ramas de café con hojas, y los puntos donde brotan cerezas. */
const RAMA = `<svg viewBox="0 0 400 340" preserveAspectRatio="none" aria-hidden="true">
  <g fill="none" stroke="#5A4126" stroke-linecap="round">
    <path d="M-10 70 C 120 60, 260 90, 410 60" stroke-width="10"/>
    <path d="M-10 170 C 130 185, 270 150, 410 175" stroke-width="10"/>
    <path d="M-10 270 C 120 255, 270 290, 410 262" stroke-width="10"/></g>
  <g fill="#2F5E27" opacity=".95">
    ${[[40, 58, -30], [150, 60, 20], [250, 82, -20], [350, 60, 25], [70, 180, 25], [190, 172, -25], [300, 160, 20],
      [30, 262, -20], [140, 262, 30], [240, 280, -25], [360, 262, 20]].map(([x, y, a]) =>
      `<path d="M${x} ${y}c-18-4-30-18-28-32 16-2 30 8 34 20 1 5 0 9-6 12Z" transform="rotate(${a} ${x} ${y})"/>
       <path d="M${x} ${y}c18 4 30 18 28 32-16 2-30-8-34-20-1-5 0-9 6-12Z" transform="rotate(${a} ${x} ${y})" opacity=".8"/>`).join("")}
  </g></svg>`;
const PUNTOS = [[22, 26], [42, 25], [62, 27], [82, 23], [16, 55], [36, 55], [56, 51], [78, 52], [22, 83], [42, 80], [62, 85], [84, 80]];

/* ── Portada ───────────────────────────────────────────────── */
function portada() {
  const rec = V.recordDe("recolecta", 1);
  app.innerHTML = `<section class="marco v-portada"><div class="v-cuento">
    <h2>La Recolecta</h2>
    <p>Es época de cosecha y la rama está cargada. Tienes un minuto para llenar el canasto.</p>
    <div class="leyenda">
      <div>${cereza(TIPOS.madura.color)}<b>+1</b>Roja y madura: ¡a la canasta!</div>
      <div>${cereza(TIPOS.verde.color)}<b>−1</b>Verde: todavía no. Déjala crecer.</div>
      <div>${cereza(TIPOS.brocada.color, true)}<b>+2</b>Con broca: al costal aparte.</div>
    </div>
    </div><div class="v-elige">
    <p class="dato-real">En las fincas de verdad los granos brocados también se recogen, y los que se caen al suelo se repasan. Si se quedan en la mata, la broca sale de ahí y se riega por todo el cafetal. Un grano con broca que se te caiga te quita un punto.</p>
    <button class="jugar" id="ya">¡A coger café!</button>
    <p class="nota">${rec ? "Tu récord: " + rec + " puntos" : "Todavía no tienes récord."}</p>
    </div>
  </section>`;
  document.getElementById("ya").onclick = jugar;
}

/* ── El juego ──────────────────────────────────────────────── */
function jugar() {
  let resta = DURACION, puntos = 0, cogidas = 0, brocas = 0, verdes = 0, caidas = 0, racha = 0, vivo = true;
  const ocupados = new Map();
  app.innerHTML = `
    <div class="hud"><div class="dato"><b id="hP">0</b><small>Puntos</small></div>
      <div class="dato"><b id="hC">0</b><small>Canasta</small></div>
      <div class="dato"><b id="hB">0</b><small>Broca</small></div>
      <div class="dato"><b id="hT">${DURACION}</b><small>Segundos</small></div></div>
    <div class="reloj" id="reloj"><i></i></div>
    <div class="rama" id="rama">${RAMA}</div>`;
  const $ = id => document.getElementById(id), rama = $("rama");
  const hud = () => { $("hP").textContent = puntos; $("hC").textContent = cogidas; $("hB").textContent = brocas; };

  function brotar() {
    if (!vivo) return;
    const libres = PUNTOS.map((_, i) => i).filter(i => !ocupados.has(i));
    if (!libres.length) return;
    const i = libres[Math.floor(Math.random() * libres.length)];
    const avance = 1 - resta / DURACION;                        /* 0 al empezar, 1 al final */
    const x = Math.random(), tipo = x < .62 ? "madura" : x < .84 ? "verde" : "brocada";
    const b = document.createElement("button");
    b.className = "cereza"; b.dataset.tipo = tipo;
    b.setAttribute("aria-label", tipo === "madura" ? "Cereza madura" : tipo === "verde" ? "Cereza verde" : "Cereza con broca");
    b.style.left = PUNTOS[i][0] + "%"; b.style.top = PUNTOS[i][1] + "%";
    b.innerHTML = cereza(TIPOS[tipo].color, TIPOS[tipo].brocada);
    const vida = 1700 - avance * 750 + (tipo === "verde" ? 300 : 0);
    const t = setTimeout(() => quitar(i, b, false), vida);
    ocupados.set(i, { b, t });
    b.addEventListener("pointerdown", e => { e.preventDefault(); tocar(i, b); });
    rama.appendChild(b);
  }
  function quitar(i, b, cogida) {
    const o = ocupados.get(i); if (!o || o.b !== b) return;
    clearTimeout(o.t); ocupados.delete(i);
    b.classList.add(cogida ? "cogida" : "sale"); b.style.pointerEvents = "none";
    setTimeout(() => b.remove(), 360);
    if (!cogida && vivo && b.dataset.tipo === "brocada") {
      caidas++; puntos = Math.max(0, puntos - 1); racha = 0; hud();
      V.aviso("Se cayó un grano con broca", "#FFB4A8");
    }
  }
  function tocar(i, b) {
    if (!vivo || !ocupados.has(i) || ocupados.get(i).b !== b) return;
    const tipo = b.dataset.tipo;
    if (tipo === "madura") {
      cogidas++; racha++; puntos += 1 + (racha % 10 === 0 ? 3 : 0);
      if (racha % 10 === 0) V.aviso("¡" + racha + " seguidas! +3", "#F3D27A");
      V.efecto("bajar");
    } else if (tipo === "brocada") {
      brocas++; puntos += 2; V.efecto("frasco"); V.aviso("¡Broca afuera!", "#F3D27A");
    } else {
      verdes++; racha = 0; puntos = Math.max(0, puntos - 1); V.efecto("error"); V.aviso("¡Todavía está verde!", "#FFB4A8");
    }
    hud(); quitar(i, b, tipo !== "verde");
  }

  let proxima = 0;
  const paso = 100;
  const tic = setInterval(() => {
    resta = Math.max(0, resta - paso / 1000);
    proxima -= paso;
    if (proxima <= 0) { brotar(); if (resta < DURACION * .6) brotar(); proxima = 760 - (1 - resta / DURACION) * 360; }
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
    ocupados.forEach(o => { clearTimeout(o.t); o.b.remove(); }); ocupados.clear();
    const nuevo = V.record("recolecta", 1, puntos);
    const ganados = V.sumar(puntos / 3);
    const lam = puntos >= 20 ? V.ganarLamina(LAMINAS) : null;
    V.efecto(puntos >= 20 ? "victoria" : "derrota");
    V.premio({
      titulo: puntos + (puntos === 1 ? " punto" : " puntos"),
      linea: (nuevo && puntos ? "¡Récord nuevo! " : "") + `${cogidas} cerezas maduras, ${brocas} con broca al costal aparte` +
        (verdes ? `, ${verdes} verdes arrancadas` : "") + (caidas ? ` y ${caidas} brocadas en el suelo` : "") + ".",
      arte: V.arteClave("c_cafe", { k: "cultivo", c: "cafe" }), tono: R.CULTIVO.cafe.hex, cinta: "La Recolecta", ganados, lam
    }).then(b => b === "salir" ? (location.href = "vereda/index.html") : portada());
  }
  hud();
}

V.montar({ titulo: "La Recolecta", volver: "vereda/index.html", escena: "mediodia" });
portada();
V.cargarArte();
})();
