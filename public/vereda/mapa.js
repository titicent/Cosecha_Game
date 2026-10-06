/* ═══════════════════════════════════════════════════════════════
   LA VEREDA — el mapa
   Cada lugar de la vereda es un juego. Los que todavía no existen
   salen como «muy pronto», para que se vea para dónde va la cosa.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
const V = VEREDA, R = REGLAS, esc = V.esc;

/* Los lugares, en el orden del camino. `ense` dice qué se aprende de
   Cosecha jugando ahí: la vereda también es la escuela del juego grande. */
const LUGARES = [
  { id: "finca", sitio: "La finca", nom: "Cosecha", ense: "El juego grande: siembra, cuida y canta cosecha con tus vecinos.",
    href: "index.html", arte: ["c_cafe", { k: "cultivo", c: "cafe" }], t: "#4A6338", finca: true },
  { id: "recolecta", sitio: "El cafetal", nom: "La Recolecta", ense: "Coge el café maduro y saca los granos con broca antes de que se riegue.",
    href: "vereda/recolecta.html", arte: ["c_cafe", { k: "cultivo", c: "cafe" }], t: R.CULTIVO.cafe.hex,
    rec: () => V.recordDe("recolecta", 1) ? "Récord: " + V.recordDe("recolecta", 1) + " cerezas" : "" },
  { id: "espantapajaros", sitio: "La huerta de la casa", nom: "El espantapájaros", ense: "Espanta a los animales que vienen por las matas, pero no a los que ayudan.",
    href: "vereda/espantapajaros.html", arte: ["n_espantapajaros", { k: "cultivo", c: "huerta" }], t: "#7A5A2E",
    rec: () => { const m = Math.max(V.recordDe("espantapajaros", 1), V.recordDe("espantapajaros", 2), V.recordDe("espantapajaros", 3));
      return m ? "Récord: " + m + " puntos" : ""; } },
  { id: "colores", sitio: "El beneficiadero", nom: "El color manda", ense: "¿Le entra o no le entra? Aprende a qué mata le sirve cada carta.",
    href: "vereda/colores.html", arte: ["p_comun_platano", { k: "plaga", c: "platano", t: "comun" }], t: R.CULTIVO.platano.hex,
    rec: () => { const m = Math.max(V.recordDe("colores", 1), V.recordDe("colores", 2), V.recordDe("colores", 3));
      return m ? "Récord: " + m + " aciertos" : ""; } },
  { id: "acertijo", sitio: "La casa del mayordomo", nom: "El acertijo del mayordomo", ense: "Con las cartas justas y tus jornales, deja la finca lista.",
    href: "vereda/acertijo.html", arte: ["f_consejo", { k: "faena", tr: "consejo" }], t: "#3F6B4A",
    rec: () => { const a = V.datos().acertijo; const hecho = a.dias[V.hoy()];
      return (hecho ? "✓ El de hoy ya está resuelto" : "Hay acertijo nuevo hoy") + (a.racha > 1 ? " · racha de " + a.racha + " días" : ""); },
    etq: () => V.datos().acertijo.dias[V.hoy()] ? "" : "Nuevo hoy" },
  { id: "parejas", sitio: "La cocina de la abuela", nom: "Parejas", ense: "Cada plaga con su remedio, como en el cuaderno de la abuela.",
    href: "vereda/parejas.html", arte: ["r_casero_cafe", { k: "remedio", c: "cafe", t: "casero" }], t: R.CULTIVO.cacao.hex,
    rec: () => { const m = Math.max(V.recordDe("parejas", 1), V.recordDe("parejas", 2), V.recordDe("parejas", 3));
      return m ? "Récord: " + m + " puntos" : ""; } },
  { id: "galeria", sitio: "La plaza del pueblo", nom: "La Galería", ense: "Subasta de cosecha con tus amigos, cada uno en su teléfono.",
    href: "vereda/galeria.html", arte: ["k_feria", null], t: "#B23A3A",
    rec: () => V.recordDe("galeria", 1) ? "Mejor subasta: " + V.recordDe("galeria", 1) + " puntos" : "" },
  { id: "rio", sitio: "El río, de noche", nom: "Espantos en la oscuridad", ense: "Con el farol en la mano, descubre qué espanto anda por ahí.",
    href: "vereda/espantos.html", arte: ["f_mohan_cafe", { k: "faena", tr: "mohan_cafe" }], t: "#6B4FA8",
    rec: () => V.recordDe("espantos", 1) ? "Costal más lleno: " + V.recordDe("espantos", 1) + " granos" : "" }
];

/* El camino de tierra que une los lugares, detrás de las tarjetas. */
const CAMINO = `<svg class="camino" viewBox="0 0 120 1000" preserveAspectRatio="none" aria-hidden="true">
  <path d="M60 0 C 10 120, 110 220, 60 340 S 10 560, 60 680 S 110 880, 60 1000" fill="none" stroke="#8A6A42" stroke-width="30" stroke-linecap="round" opacity=".55"/>
  <path d="M60 0 C 10 120, 110 220, 60 340 S 10 560, 60 680 S 110 880, 60 1000" fill="none" stroke="#C9A870" stroke-width="3" stroke-dasharray="2 16" stroke-linecap="round" opacity=".6"/></svg>`;

function pintar() {
  const app = document.getElementById("app");
  const n = V.nombre();
  const lam = V.cuantasLaminas(), total = V.LAMINAS().length;
  app.innerHTML = `
    <div class="v-cabeza"><span class="antes">Cosecha</span><span class="palabra">La Vereda</span>
      <span class="quien">${n ? "Bienvenido, " + esc(n) + ". ¿Para dónde cogemos hoy?" : "¿Para dónde cogemos hoy?"}</span></div>
    <nav class="mapa">${CAMINO}
      ${LUGARES.map(l => {
        const etq = l.pronto ? "Muy pronto" : (l.etq ? l.etq() : "");
        const rec = l.rec ? l.rec() : "";
        const tag = l.pronto ? "div" : "a";
        return `<${tag} class="lugar ${l.finca ? "finca" : ""} ${l.pronto ? "pronto" : ""}" ${l.pronto ? 'aria-disabled="true"' : `href="${l.href}"`} style="--t:${l.t}">
          ${etq ? `<span class="etq">${esc(etq)}</span>` : ""}
          <span class="med">${V.arteClave(l.arte[0], l.arte[1])}</span>
          <span class="txt"><span class="sitio">${esc(l.sitio)}</span><span class="nom">${esc(l.nom)}</span>
            <span class="ense">${esc(l.ense)}</span>${rec ? `<span class="rec">${esc(rec)}</span>` : ""}</span>
        </${tag}>`; }).join("")}
    </nav>
    <div class="acciones">
      <a class="accion" href="vereda/album.html"><span class="ico">${V.arteClave("r_bioinsumo_cafe", { k: "remedio", c: "cafe", t: "bioinsumo" })}</span>
        <span>Álbum de la finca<small>${lam} de ${total} láminas</small></span></a>
      <div class="accion"><span class="ico">${V.GRANO}</span>
        <span>${V.granos()} granos en el costal<small>Los ganas jugando. Con ${V.PRECIO_SOBRE} abres un sobre de láminas.</small></span></div>
    </div>`;
}

V.montar({ titulo: "La Vereda", volver: "index.html", escena: "mediodia" });
pintar();
V.cargarArte().then(pintar);
})();
