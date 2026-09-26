/* Genera la guía de juego ilustrada: guia-cosecha.html

       npm run guia [-- carpeta-de-salida]

   Está escrita para que la entienda un niño de ocho años: frases cortas,
   ejemplos con nombres, y cada regla con su dibujo. Los números —cuántas
   cartas hay, cuánto cuesta cada una, cómo se llaman las plagas— salen del
   motor, así la guía no puede decir algo distinto de lo que hace el juego.

   Las imágenes se referencian como cartas/<clave>.png, igual que el catálogo.
*/
const fs = require("fs");
const path = require("path");
const R = require("./public/reglas.js");

const salida = process.argv[2] || __dirname;
fs.mkdirSync(salida, { recursive: true });

/* ── Datos del motor ─────────────────────────────────────────── */
const mazo = R.crearMazo(true, true);
const cuenta = f => mazo.filter(f).length;
const deMazo = m => mazo.filter(c => c.m === m);
const total = { base: deMazo("base").length, bonanza: deMazo("bonanza").length, espantos: deMazo("espantos").length };
const porTipo = (m, k) => deMazo(m).filter(c => c.k === k).length;
const copias = (tr) => cuenta(c => c.tr === tr);
const COL = ["cafe", "platano", "cacao", "cana"];
const LBL = c => R.CULTIVO[c].label;
const HEX = c => R.CULTIVO[c].hex;
const NP = R.NOMBRE_PROPIO;
const costo = c => R.cuesta(c);
const FAENA_HEX = "#3F6B4A", ESPANTO_HEX = "#6B4FA8";
const MZ = R.MAZOS;

/* ── Piezas ──────────────────────────────────────────────────── */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
/* El jornal se dibuja como un sombrerito: es la ficha de trabajo del turno. */
const SOMBRERO = `<svg viewBox="0 0 24 16" aria-hidden="true"><ellipse cx="12" cy="12" rx="11" ry="3.2" fill="currentColor"/><path d="M6.5 11.5c0-5 2.4-8.5 5.5-8.5s5.5 3.5 5.5 8.5z" fill="currentColor"/><rect x="6.6" y="8.6" width="10.8" height="1.9" fill="var(--papel)"/></svg>`;
const jornales = n => `<span class="jornales" title="${n} ${n === 1 ? "jornal" : "jornales"}">${SOMBRERO.repeat(n)}<b>${n}</b></span>`;
const img = (k, alt = "") => `<img src="cartas/${k}.png" alt="${esc(alt)}" loading="lazy" width="300" height="300">`;

/* Una carta de la guía: dibujo con el marco de su color, nombre y qué hace */
function carta({ k, nombre, clase, tono, precio, n, texto, extra = "" }) {
  return `<article class="carta" style="--tono:${tono}">
    <div class="dibujo">${img(k, nombre)}</div>
    <div class="ficha">
      <h4>${esc(nombre)}</h4>
      ${clase ? `<p class="clase">${esc(clase)}</p>` : ""}
      <p class="meta">${precio !== undefined ? jornales(precio) : ""}${n ? `<span class="copias">${n} ${n === 1 ? "carta" : "cartas"}</span>` : ""}</p>
      <p>${texto}</p>${extra}
    </div></article>`;
}
const recuadro = (rotulo, cuerpo, tipo = "") => `<aside class="recuadro ${tipo}"><p class="rotulo">${rotulo}</p>${cuerpo}</aside>`;
const ejemplo = (cuerpo) => `<aside class="ejemplo"><p class="rotulo">Ejemplo</p>${cuerpo}</aside>`;

/* Una mata dibujada en su estado: el cultivo y lo que tiene encima */
function mata(c, encima = [], estado, nota) {
  const capas = encima.map((k, i) => `<span class="encima e${i}">${img(k)}</span>`).join("");
  return `<figure class="mata ${estado}">
    <div class="pila">${c ? `<span class="base">${img("c_" + c)}</span>` : `<span class="vacio">al montón</span>`}${capas}</div>
    <figcaption><b>${esc(estado[0].toUpperCase() + estado.slice(1))}</b>${nota}</figcaption></figure>`;
}
const flecha = (t) => `<span class="flecha"><span>${t}</span></span>`;

/* ── Contenido ───────────────────────────────────────────────── */
const tablaColores = (tipoPlaga, tipoRemedio, nomP, nomR) => `
<div class="tabla-scroll"><table class="colores">
  <thead><tr><th>Cultivo</th><th>${nomP}</th><th>${nomR}</th></tr></thead>
  <tbody>
  ${[...COL, "huerta"].map(c => `<tr style="--tono:${HEX(c)}">
    <td><span class="punto"></span>${c === "huerta" ? "Huerta · sirve para todos" : LBL(c)}</td>
    <td><span class="mini">${img(`p_${tipoPlaga}_${c}`)}</span>${esc(NP[tipoPlaga][c])}</td>
    <td><span class="mini">${img(`r_${tipoRemedio}_${c}`)}</span>${esc(NP[tipoRemedio][c])}</td></tr>`).join("")}
  </tbody></table></div>`;

const html = `<title>Guía de Cosecha</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Karla:ital,wght@0,400;0,500;0,700;1,400&display=swap">
<style>
:root{
  color-scheme: light;
  --papel:#F4EFE2; --hondo:#EAE2D1; --caja:#FBF8EF; --tinta:#2A2114; --suave:#65573F;
  --linea:#D8CDB6; --cafe:#8C3A2B; --hoja:#4A6338; --grano:#9A7210; --morado:#5E4596;
  --cielo:#2F6283; --papel-texto:#F4EFE2;
  --base:${MZ.base.hex}; --bonanza:${MZ.bonanza.hex}; --espantos:${MZ.espantos.hex};
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  color-scheme: dark;
  --papel:#211A11; --hondo:#1A140D; --caja:#2A2217; --tinta:#F1E9D8; --suave:#B3A487;
  --linea:#403527; --cafe:#E07A62; --hoja:#98BA76; --grano:#E2B447; --morado:#AE93E4;
  --cielo:#86B6D6;
}}
:root[data-theme="dark"]{
  color-scheme: dark;
  --papel:#211A11; --hondo:#1A140D; --caja:#2A2217; --tinta:#F1E9D8; --suave:#B3A487;
  --linea:#403527; --cafe:#E07A62; --hoja:#98BA76; --grano:#E2B447; --morado:#AE93E4;
  --cielo:#86B6D6;
}
*{box-sizing:border-box}
body{margin:0;background:var(--papel);color:var(--tinta);padding:0 16px;
  font-family:Karla,ui-sans-serif,system-ui,sans-serif;font-size:17px;line-height:1.62}
.marco{max-width:780px;margin:0 auto;padding-block:30px 80px}
h1,h2,h3,h4{font-family:"Zilla Slab",Georgia,serif;text-wrap:balance;line-height:1.15}
p{margin:0 0 12px;max-width:64ch}
ul,ol{margin:0 0 14px;padding-left:22px;max-width:62ch}
li{margin-bottom:6px}
b,strong{font-weight:700}
a{color:inherit}
img{display:block;max-width:100%;height:auto}

/* portada */
.portada{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;
  border-bottom:3px double var(--linea);padding-bottom:22px}
.portada .sobre{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--cafe);margin:0 0 6px}
h1{font-size:clamp(40px,9vw,66px);margin:0 0 12px;letter-spacing:-.015em}
.portada .historia{font-size:18px;color:var(--suave);max-width:52ch;margin:0}
.abanico{display:flex;width:210px;height:150px;position:relative}
.abanico img{position:absolute;width:112px;height:112px;background:var(--caja);border:3px solid var(--tono);
  border-radius:12px;padding:6px;box-shadow:0 4px 12px rgba(40,25,10,.18)}
.abanico img:nth-child(1){left:0;top:26px;transform:rotate(-12deg)}
.abanico img:nth-child(2){left:50px;top:6px;z-index:2}
.abanico img:nth-child(3){left:100px;top:26px;transform:rotate(12deg)}
.datos{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;font-variant-numeric:tabular-nums}
.dato{background:var(--caja);border:1px solid var(--linea);border-radius:4px;padding:6px 12px;font-size:14px}
.dato b{font-family:"Zilla Slab",Georgia,serif;font-size:18px;color:var(--cafe);margin-right:4px}

/* índice */
nav.indice{margin:26px 0 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
nav.indice a{display:block;text-decoration:none;background:var(--caja);border:1px solid var(--linea);
  border-top:4px solid var(--tono,var(--linea));border-radius:4px;padding:9px 12px;font-size:14.5px}
nav.indice a b{display:block;font-family:"Zilla Slab",Georgia,serif;font-size:17px}
nav.indice a span{color:var(--suave);font-size:13.5px}
nav.indice a:hover{border-color:var(--tono,var(--cafe))}
nav.indice a:focus-visible{outline:3px solid var(--grano);outline-offset:2px}

/* partes: una pestaña de cuaderno por mazo */
.parte{margin-top:56px;scroll-margin-top:12px}
.pestana{background:var(--tono);color:#FFF8EA;border-radius:6px 6px 0 0;padding:16px 18px 14px;
  display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}
.pestana .num{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;opacity:.85;margin:0}
.pestana h2{font-size:clamp(28px,6vw,38px);margin:2px 0 2px;color:#FFF8EA}
.pestana p{margin:0;opacity:.92;max-width:52ch}
.pestana .cuantas{font-family:"Zilla Slab",Georgia,serif;text-align:center;line-height:1;
  background:rgba(0,0,0,.16);border-radius:6px;padding:9px 12px}
.pestana .cuantas b{display:block;font-size:30px}
.pestana .cuantas span{font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.contenido{border:1px solid var(--linea);border-top:0;border-radius:0 0 6px 6px;padding:6px 20px 20px;background:var(--papel)}
h3{font-size:25px;margin:34px 0 10px}
h3 .n{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;
  background:var(--tono);color:#FFF8EA;font-size:17px;margin-right:10px;vertical-align:3px}
h4{font-size:19px;margin:0 0 2px}

/* cartas */
.cartas{display:grid;gap:12px;margin:14px 0 18px}
.carta{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:start;
  background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:12px}
.carta .dibujo{border:3px solid var(--tono);border-radius:10px;background:var(--papel);padding:5px;aspect-ratio:1}
.carta p{font-size:16px;margin-bottom:6px}
.carta .clase{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--suave);margin:0 0 4px}
.meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:13.5px;color:var(--suave)}
.jornales{display:inline-flex;align-items:center;gap:2px;color:var(--grano)}
.jornales svg{width:22px;height:15px}
.jornales b{font-size:13px;margin-left:4px;color:var(--suave)}
.copias{font-variant-numeric:tabular-nums}
.carta .nota{font-size:14.5px;color:var(--suave);border-top:1px dashed var(--linea);padding-top:6px;margin-top:6px}

/* grilla de tipos de carta */
.tipos{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}
.tipo{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:10px;text-align:center}
.tipo img{width:86%;margin:0 auto 6px;border:3px solid var(--tono);border-radius:10px;background:var(--papel);padding:4px}
.tipo b{font-family:"Zilla Slab",Georgia,serif;font-size:18px;display:block}
.tipo span{font-size:13.5px;color:var(--suave)}

/* recuadros */
.recuadro{background:var(--caja);border:1px solid var(--linea);border-left:5px solid var(--grano);
  border-radius:4px;padding:14px 16px;margin:16px 0}
.recuadro.clave{border-left-color:var(--cafe);font-size:18px}
.recuadro.ojo{border-left-color:var(--cielo)}
.recuadro .rotulo,.ejemplo .rotulo{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;color:var(--suave)}
.recuadro p:last-child,.ejemplo p:last-child,.recuadro ul:last-child{margin-bottom:0}
.ejemplo{background:var(--hondo);border-radius:4px;padding:13px 16px;margin:14px 0;font-size:16px}

/* cómo se gana */
.meta-fila{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0}
.meta-fila img{width:74px;height:74px;border:3px solid var(--tono);border-radius:10px;background:var(--caja);padding:3px}
.meta-fila .mas{font-family:"Zilla Slab",Georgia,serif;font-size:26px;color:var(--suave)}
.meta-fila .igual{font-family:"Zilla Slab",Georgia,serif;font-size:19px;font-weight:700;color:var(--hoja);
  border:2px solid var(--hoja);border-radius:30px;padding:6px 14px}

/* pasos */
ol.pasos{list-style:none;padding:0;counter-reset:p;display:grid;gap:10px;max-width:none}
ol.pasos>li{counter-increment:p;display:grid;grid-template-columns:36px 1fr;gap:12px;margin:0}
ol.pasos>li::before{content:counter(p);display:grid;place-items:center;width:34px;height:34px;border-radius:50%;
  border:2px solid var(--tono);color:var(--tono);font-family:"Zilla Slab",Georgia,serif;font-weight:700;font-size:18px}
ol.pasos p{margin:4px 0 0}

/* tabla de jornales */
.precios{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0}
.precio{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:10px 12px}
.precio b{display:block;font-family:"Zilla Slab",Georgia,serif;font-size:18px}
.precio .jornales{margin-top:4px}
.precio small{display:block;font-size:13.5px;color:var(--suave);margin-top:2px}

/* matas */
.matas{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:16px 0}
.mata{margin:0;background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:10px 8px;text-align:center}
.pila{position:relative;height:104px;margin-bottom:8px}
.pila .base img{width:84px;height:84px;margin:0 auto;border:3px solid ${HEX("cafe")};border-radius:10px;background:var(--papel);padding:3px}
.pila .encima{position:absolute;width:44px;height:44px;border-radius:8px;background:var(--papel);
  border:2px solid var(--marca,#4A8B3B);padding:2px;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.pila .e0{right:4px;bottom:0}.pila .e1{left:4px;bottom:0}
.mata.plagada .pila .encima{--marca:${HEX("cafe")}}
.mata.arrasada .pila .encima{--marca:${HEX("cafe")}}
.pila .vacio{display:grid;place-items:center;width:84px;height:84px;margin:0 auto;border:2px dashed var(--linea);
  border-radius:10px;font-size:12px;color:var(--suave)}
.mata figcaption{font-size:14px;line-height:1.35;color:var(--suave)}
.mata figcaption b{display:block;font-family:"Zilla Slab",Georgia,serif;font-size:17px;color:var(--tinta)}
.mata.certificada{border-color:var(--grano);box-shadow:inset 0 0 0 1px var(--grano)}

/* caminos de una mata */
.caminos{display:grid;gap:8px;margin:12px 0 16px}
.camino{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:15.5px}
.camino .e{background:var(--caja);border:1px solid var(--linea);border-radius:30px;padding:3px 12px;font-weight:700}
.flecha{display:inline-flex;align-items:center;color:var(--suave);font-size:13.5px}
.flecha span::before{content:"— "}.flecha span::after{content:" →"}

/* tabla de colores */
.tabla-scroll{overflow-x:auto;margin:12px 0 16px}
table{border-collapse:collapse;width:100%;font-size:15.5px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--linea);vertical-align:middle}
th{font-family:"Zilla Slab",Georgia,serif;font-weight:600;background:var(--hondo)}
td .punto{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--tono);margin-right:8px;vertical-align:-1px}
td .mini{display:inline-block;width:40px;height:40px;vertical-align:middle;margin-right:8px;border:2px solid var(--tono);border-radius:7px;background:var(--papel);padding:2px}
td:first-child{font-weight:700;white-space:nowrap}

/* clima */
.climas{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.clima{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:12px;text-align:center}
.clima img{width:96px;height:96px;margin:0 auto 6px;border-radius:50%;border:4px solid var(--tono);background:var(--papel);padding:4px}
.clima b{font-family:"Zilla Slab",Georgia,serif;font-size:18px;display:block}
.clima p{font-size:15px;margin:4px 0 0}

/* preguntas */
.faq-grupo{margin-top:26px}
.faq-grupo h3{margin-top:0}
.faq-grupo .sello{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#FFF8EA;background:var(--tono);border-radius:3px;padding:2px 7px;margin-left:8px;vertical-align:4px;font-family:Karla,sans-serif}
dl.faq{margin:0;display:grid;gap:10px}
dl.faq>div{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:12px 15px}
dl.faq dt{font-weight:700;margin-bottom:4px}
dl.faq dd{margin:0;font-size:16px}
dl.faq dd .corta{font-weight:700;color:var(--cafe)}

/* resumen de bolsillo */
.bolsillo{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.bolsillo section{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:12px 15px}
.bolsillo h4{font-size:17px;margin-bottom:6px}
.bolsillo ul{margin:0;padding-left:18px;font-size:15.5px}
.bolsillo li{margin-bottom:3px}

.variantes{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:14px 0}
.variante{background:var(--caja);border:1px solid var(--linea);border-radius:6px;padding:12px 15px}
.variante b{font-family:"Zilla Slab",Georgia,serif;font-size:18px;display:block;margin-bottom:2px}
.variante p{font-size:15.5px;margin:0}

.pie{margin-top:48px;border-top:3px double var(--linea);padding-top:14px;font-size:14px;color:var(--suave)}

@media (max-width:640px){
  body{font-size:16.5px}
  .portada{grid-template-columns:1fr}
  .abanico{order:-1;margin:0 auto}
  .tipos{grid-template-columns:repeat(2,1fr)}
  .matas{grid-template-columns:repeat(2,1fr)}
  .climas{grid-template-columns:repeat(2,1fr)}
  .bolsillo,.variantes{grid-template-columns:1fr}
  .carta{grid-template-columns:84px 1fr;gap:11px}
  .contenido{padding:4px 14px 16px}
  .pestana{grid-template-columns:1fr}
  .pestana .cuantas{justify-self:start;display:flex;gap:8px;align-items:baseline}
  .pestana .cuantas b{font-size:24px}
}
@media (prefers-reduced-motion:no-preference){ nav.indice a{transition:border-color .15s} }
</style>

<div class="marco">

<header class="portada">
  <div>
    <p class="sobre">Guía de juego</p>
    <h1>Cosecha</h1>
    <p class="historia">Arriba en la montaña, donde las nubes pasan rozando los cafetales, cada
    familia tiene su finca. Se acerca la cosecha y todos quieren tener la suya lista primero.
    Hay que sembrar, cuidar las matas de las plagas y, de vez en cuando, hacerle alguna
    travesura al vecino. Pero cuidado: en la montaña también llueve, hiela y salen espantos.</p>
  </div>
  <div class="abanico" aria-hidden="true">
    <img src="cartas/c_cafe.png" alt="" style="--tono:${HEX("cafe")}">
    <img src="cartas/c_huerta.png" alt="" style="--tono:${HEX("huerta")}">
    <img src="cartas/p_comun_cafe.png" alt="" style="--tono:${HEX("cafe")}">
  </div>
</header>
<div class="datos">
  <span class="dato"><b>2 a 6</b>jugadores</span>
  <span class="dato"><b>8+</b>años</span>
  <span class="dato"><b>3</b>cartas en la mano</span>
  <span class="dato"><b>${mazo.length}</b>cartas en tres mazos</span>
</div>

<nav class="indice" aria-label="Partes de la guía">
  <a href="#cosecha" style="--tono:var(--base)"><b>1 · Cosecha</b><span>El juego base. Empieza aquí.</span></a>
  <a href="#bonanza" style="--tono:var(--bonanza)"><b>2 · Bonanza</b><span>Expansión: plagas duras y remedios de laboratorio.</span></a>
  <a href="#espantos" style="--tono:var(--espantos)"><b>3 · Espantos</b><span>Expansión: las leyendas del campo.</span></a>
  <a href="#clima" style="--tono:var(--cielo)"><b>El clima</b><span>Lo que cae sobre todos cada tres vueltas.</span></a>
  <a href="#variantes" style="--tono:var(--grano)"><b>Otras formas de jugar</b><span>Duelo, cosecha certificada y más.</span></a>
  <a href="#preguntas" style="--tono:var(--cafe)"><b>Preguntas frecuentes</b><span>Las dudas que salen en la mesa.</span></a>
</nav>

<!-- ═════════════════════ PARTE 1 · COSECHA ═════════════════════ -->
<section class="parte" id="cosecha" style="--tono:var(--base)">
<div class="pestana">
  <div><p class="num">Parte 1 · Juego base</p><h2>Cosecha</h2>
  <p>Todo lo que necesitas para jugar. Aprende esta parte primero: las expansiones solo le agregan cartas.</p></div>
  <div class="cuantas"><b>${total.base}</b><span>cartas</span></div>
</div>
<div class="contenido">

<h3><span class="n">1</span>Qué hay en el mazo</h3>
<p>Hay cuatro clases de cartas. El color del marco dice de qué cultivo es cada una.</p>
<div class="tipos">
  <div class="tipo" style="--tono:${HEX("cafe")}">${img("c_cafe", "Cultivo de café")}<b>Cultivos</b><span>${porTipo("base", "cultivo")} cartas. Lo que siembras.</span></div>
  <div class="tipo" style="--tono:${HEX("platano")}">${img("p_comun_platano", "Plaga")}<b>Plagas</b><span>${porTipo("base", "plaga")} cartas. Lo que le mandas al vecino.</span></div>
  <div class="tipo" style="--tono:${HEX("cacao")}">${img("r_casero_cacao", "Remedio")}<b>Remedios</b><span>${porTipo("base", "remedio")} cartas. Lo que cuida tu finca.</span></div>
  <div class="tipo" style="--tono:${FAENA_HEX}">${img("f_trueque", "Faena")}<b>Faenas</b><span>${porTipo("base", "faena")} cartas. Trucos especiales.</span></div>
</div>
<p>Los cultivos son cuatro: <b>café</b>, <b>plátano</b>, <b>cacao</b> y <b>caña</b>, con
${cuenta(c => c.m === "base" && c.k === "cultivo" && c.c === "cafe")} cartas de cada uno. Hay además una
<b>huerta</b>, que es el comodín. Ya la vas a conocer.</p>

<h3><span class="n">2</span>Cómo se gana</h3>
${recuadro("La meta", `<p>Siembra <b>cuatro cultivos distintos</b> en tu finca y mantenlos <b>sanos</b>.
Cuando lo logras, tu finca queda <b>lista</b>. Si todavía está lista cuando vuelve a ser tu turno,
<b>¡cosechas y ganas!</b></p>`, "clave")}
<div class="meta-fila" aria-label="Café, plátano, cacao y caña sanos forman una finca lista">
  <img src="cartas/c_cafe.png" alt="Café" style="--tono:${HEX("cafe")}"><span class="mas">+</span>
  <img src="cartas/c_platano.png" alt="Plátano" style="--tono:${HEX("platano")}"><span class="mas">+</span>
  <img src="cartas/c_cacao.png" alt="Cacao" style="--tono:${HEX("cacao")}"><span class="mas">+</span>
  <img src="cartas/c_cana.png" alt="Caña" style="--tono:${HEX("cana")}">
  <span class="igual">= finca lista</span>
</div>
<p>¿Por qué hay que esperar una vuelta? Para que los demás tengan una oportunidad de frenarte.
Cuando tu finca queda lista, todos lo ven, y cada vecino juega su turno tratando de dañarla.</p>
<p>Hay una segunda forma de ganar: si las cartas se acaban dos veces, <b>la tierra se agota</b> y
gana quien tenga más puntos de cosecha. Te lo contamos en el <a href="#tierra">punto 10</a>.</p>

<h3><span class="n">3</span>Preparar la partida</h3>
<ol class="pasos">
  <li><div><b>Baraja todas las cartas.</b></div></li>
  <li><div><b>Reparte tres cartas a cada jugador.</b><p>Cada uno mira las suyas sin mostrarlas.</p></div></li>
  <li><div><b>Pon el resto boca abajo en el centro.</b><p>Ese es el mazo. Al lado quedará el
  montón de descarte, boca arriba, donde van las cartas usadas.</p></div></li>
  <li><div><b>Deja espacio frente a ti.</b><p>Ahí va a estar tu finca: las cartas que siembres.
  Todos pueden ver la finca de todos.</p></div></li>
  <li><div><b>Empieza el jugador más joven.</b><p>En la app empieza quien armó la mesa. Después se sigue hacia la
  izquierda, como las agujas del reloj.</p></div></li>
</ol>

<h3><span class="n">4</span>Tu turno: dos jornales</h3>
<p>Un jornal es un día de trabajo en la finca. En cada turno tienes <b>dos jornales</b> para gastar,
y cada carta cuesta jornales:</p>
<div class="precios">
  <div class="precio"><b>Sembrar un cultivo</b>${jornales(1)}</div>
  <div class="precio"><b>Mandar una plaga</b>${jornales(1)}</div>
  <div class="precio"><b>Poner un remedio</b>${jornales(1)}</div>
  <div class="precio"><b>Hacer una faena</b>${jornales(2)}</div>
  <div class="precio"><b>Botar cartas</b>${jornales(1)}<small>De una a tres, las que no te sirvan.</small></div>
</div>
<p>Puedes gastar tus jornales en el orden que quieras. Por ejemplo:</p>
<ul>
  <li>Sembrar un cultivo <b>y</b> ponerle un remedio (1 + 1).</li>
  <li>Hacer una sola faena (2).</li>
  <li>Botar dos cartas malas <b>y</b> sembrar (1 + 1).</li>
</ul>
<p>Tu turno termina cuando se te acaban los jornales o cuando ya no tienes nada que jugar.
Entonces <b>robas del mazo hasta volver a tener tres cartas</b>, y le toca al siguiente.</p>
${recuadro("Ojo", `<p>No puedes pasar sin hacer nada si tienes alguna jugada. Pero si ya hiciste algo,
puedes cerrar tu turno aunque te quede un jornal. Y si de verdad no puedes jugar ninguna carta,
bota las que no te sirvan o pasa.</p>`, "ojo")}

<h3><span class="n">5</span>La vida de una mata</h3>
<p>Cada cultivo que siembras es una <b>mata</b> de tu finca. Según lo que tenga encima, una mata
puede estar de cinco maneras:</p>
<div class="matas">
  ${mata("cafe", [], "sana", "Recién sembrada. Cuenta para ganar.")}
  ${mata("cafe", ["r_casero_cafe"], "protegida", "Tiene un remedio encima.")}
  ${mata("cafe", ["r_casero_cafe", "r_casero_cafe"], "certificada", "Dos remedios. Ya nadie la toca.")}
  ${mata("cafe", ["p_comun_cafe"], "plagada", "Tiene una plaga. No cuenta para ganar.")}
  ${mata(null, [], "arrasada", "Le cayó otra plaga y se perdió.")}
</div>
<p>Y así pasa de una a otra:</p>
<div class="caminos">
  <div class="camino"><span class="e">Sana</span>${flecha("remedio")}<span class="e">Protegida</span>${flecha("remedio")}<span class="e">Certificada</span></div>
  <div class="camino"><span class="e">Sana</span>${flecha("plaga")}<span class="e">Plagada</span>${flecha("plaga")}<span class="e">Arrasada</span></div>
  <div class="camino"><span class="e">Plagada</span>${flecha("remedio")}<span class="e">Sana</span><span class="flecha">(el remedio cura y los dos se van al montón)</span></div>
  <div class="camino"><span class="e">Protegida</span>${flecha("plaga")}<span class="e">Sana</span><span class="flecha">(la plaga le lava el remedio y los dos se van al montón)</span></div>
</div>
${recuadro("La mata certificada", `<p>Una mata certificada vale doble y está a salvo: no se le puede meter una plaga,
nadie se la puede llevar y no se puede cambiar. Solo unas pocas cartas muy poderosas la mueven, y las
vas a reconocer porque lo dicen.</p>`)}

<h3><span class="n">6</span>El color manda</h3>
<p>Esta es la regla más importante. <b>Cada plaga y cada remedio es de un cultivo</b>, y solo le
sirve a ese cultivo. La broca es la plaga del café: no le hace nada al plátano. El caldo bordelés
es el remedio del café: no cura el cacao.</p>
${tablaColores("comun", "casero", "Plaga", "Remedio")}
<p><b>La huerta es el comodín.</b> Funciona de dos maneras:</p>
<ul>
  <li><b>La huerta como cultivo</b> es un canasto con de todo. Cuenta como una mata más para
  completar tu finca, pero a cambio le entra <b>cualquier</b> plaga y le sirve <b>cualquier</b> remedio.</li>
  <li><b>La plaga de huerta</b> (la langosta) le entra a cualquier mata, y <b>el remedio de huerta</b>
  (el jabón potásico) le sirve a cualquier mata tuya.</li>
</ul>

<h3><span class="n">7</span>¿En qué finca puedo jugar?</h3>
<ul>
  <li><b>Cultivos:</b> solo en tu finca. Y nunca dos iguales: si ya tienes café, no puedes sembrar otro.</li>
  <li><b>Remedios:</b> solo en tus matas.</li>
  <li><b>Plagas:</b> en cualquier finca, incluso en la tuya. A veces sirve, como verás con la Propagación.</li>
  <li><b>Faenas:</b> cada una dice a quién le toca.</li>
</ul>

<h3><span class="n">8</span>Las faenas</h3>
<p>Las faenas son trucos: no se quedan en la mesa, hacen lo suyo y se van al montón. Cuestan los
dos jornales del turno.</p>
<div class="cartas">
${carta({ k: "f_trueque", nombre: "Trueque", tono: FAENA_HEX, precio: 2, n: copias("trueque"),
  texto: "Cambias una mata tuya por una mata de un vecino, con todo lo que tengan encima.",
  extra: `<p class="nota">No vale con matas certificadas, ni si alguno quedaría con dos cultivos iguales.</p>` })}
${carta({ k: "f_saqueo", nombre: "Mano larga", tono: FAENA_HEX, precio: 2, n: copias("saqueo"),
  texto: "Te llevas a tu finca una mata de un vecino, con todo lo que tenga encima.",
  extra: `<p class="nota">No vale con una mata certificada, ni con un cultivo que ya tengas.</p>` })}
${carta({ k: "f_propagacion", nombre: "Propagación", tono: FAENA_HEX, precio: 2, n: copias("propagacion"),
  texto: "Las plagas de tus matas saltan a matas sanas de los vecinos. Tus matas quedan limpias.",
  extra: `<p class="nota">Cada plaga salta a una mata sana a la que le pueda entrar: de su mismo cultivo o una huerta (la langosta, a cualquiera). Las matas protegidas y las certificadas no la reciben.</p>` })}
${carta({ k: "f_chaparron", nombre: "Chaparrón", tono: FAENA_HEX, precio: 2, n: copias("chaparron"),
  texto: "Todos los demás botan todas sus cartas. En su siguiente turno solo alcanzan a recoger cartas nuevas: pierden ese turno.",
  extra: "" })}
${carta({ k: "f_lindero", nombre: "Cambio de lindero", tono: FAENA_HEX, precio: 2, n: copias("lindero"),
  texto: "Cambias tu finca entera por la de un vecino, con las matas certificadas incluidas.",
  extra: `<p class="nota">Es la carta del juego base que puede mover una mata certificada.</p>` })}
</div>

<h3><span class="n">9</span>¡Finca lista! Cantar la cosecha</h3>
<p>Cuando tienes cuatro cultivos distintos y sanos, dilo en voz alta: <b>«¡Finca lista!»</b>
En la app aparece un letrero sobre tu finca para que todos lo vean.</p>
<p>Desde ese momento, cada vecino juega su turno sabiendo que eres el que va a ganar. Pueden
meterte una plaga, llevarse una mata o cambiarte la finca. Si al empezar tu siguiente turno tu
finca sigue lista, <b>cosechas y ganas la partida</b>.</p>
${ejemplo(`<p>Ana tiene café, plátano, cacao y caña, todos sanos: su finca está lista. Tomás juega
después y le mete la broca a su café. Ahora el café de Ana está plagado y su finca ya no está lista.</p>
<p>Cuando vuelve el turno de Ana, no gana: primero tiene que curar el café. Si lo cura, su finca
queda lista otra vez, y tiene que aguantar otra vuelta.</p>`)}
<p>Un buen consejo: cuando tu finca esté lista, usa tus jornales para <b>proteger y certificar</b>
tus matas. Una finca con matas certificadas es muy difícil de frenar.</p>

<h3 id="tierra"><span class="n">10</span>Cuando se agota la tierra</h3>
<p>Cuando el mazo se acaba, se baraja el montón de descarte y se sigue jugando. Pero si se acaba
<b>por segunda vez</b>, la tierra se agotó y la partida termina. Gana quien tenga más
<b>puntos de cosecha</b>:</p>
<div class="precios">
  <div class="precio"><b>Mata sana o protegida</b><span>1 punto</span></div>
  <div class="precio"><b>Mata certificada</b><span>2 puntos</span></div>
  <div class="precio"><b>Mata plagada</b><span>0 puntos</span></div>
</div>
<p>Si hay empate, gana el que esté primero en el orden de la mesa, contando desde quien empezó.</p>

<h3><span class="n">11</span>Un turno de ejemplo</h3>
${ejemplo(`<p>En su finca, Ana ya tiene un <b>café</b> sano. En la mano tiene <b>cacao</b>,
<b>caldo bordelés</b> (el remedio del café) y una <b>Mano larga</b>.</p>
<ol>
  <li>Primer jornal: siembra el cacao. Ya tiene dos matas.</li>
  <li>Segundo jornal: le pone el caldo bordelés al café. Ahora el café está protegido.</li>
  <li>Se acabaron los jornales. Ana roba dos cartas del mazo para volver a tener tres.</li>
</ol>
<p>La Mano larga se quedó en su mano porque cuesta dos jornales. La puede usar en otro turno.</p>`)}

</div></section>

<!-- ═════════════════════ PARTE 2 · BONANZA ═════════════════════ -->
<section class="parte" id="bonanza" style="--tono:#8A6510">
<div class="pestana">
  <div><p class="num">Parte 2 · Expansión</p><h2>Bonanza</h2>
  <p>Llegó la bonanza: el café se vende caro y en la finca hay más en juego. Plagas más duras,
  remedios de laboratorio y nuevas faenas. Se mezcla con el juego base.</p></div>
  <div class="cuantas"><b>${total.bonanza}</b><span>cartas</span></div>
</div>
<div class="contenido">

<h3><span class="n">1</span>Qué trae</h3>
<ul>
  <li><b>${porTipo("bonanza", "cultivo")} cultivos:</b> el vivero y una carta más de café, plátano, cacao y caña.</li>
  <li><b>${porTipo("bonanza", "plaga")} plagas resistentes.</b></li>
  <li><b>${porTipo("bonanza", "remedio")} bioinsumos.</b></li>
  <li><b>${porTipo("bonanza", "faena")} faenas:</b> malla de sombra, jornal extra, consejo del mayordomo y erradicación.</li>
</ul>

<h3><span class="n">2</span>El vivero</h3>
<div class="cartas">
${carta({ k: "c_vivero", nombre: "Vivero", clase: "Cultivo", tono: HEX("vivero"), precio: 1, n: 1,
  texto: "Crece bajo techo. Cuenta como una mata certificada desde que lo siembras y vale dos puntos. Ninguna plaga lo alcanza y tampoco necesita remedios.",
  extra: `<p class="nota">Lo que sí le puede pasar: que te lo cambien con un Trueque o te lo lleven con la Mano larga.</p>` })}
</div>

<h3><span class="n">3</span>Plagas resistentes</h3>
<p>Son plagas más duras. Funcionan igual que las plagas normales, con una diferencia:
<b>un remedio casero no las cura</b>. Solo se quitan con un bioinsumo o con una erradicación.</p>

<h3><span class="n">4</span>Bioinsumos</h3>
<p>Son remedios de laboratorio, más fuertes que los caseros. También obedecen al color. Un bioinsumo:</p>
<ul>
  <li>sobre una mata <b>sana</b>, la certifica de una vez;</li>
  <li>sobre una mata <b>protegida</b>, la certifica;</li>
  <li>sobre una mata <b>plagada</b>, la cura, aunque la plaga sea resistente.</li>
</ul>
${tablaColores("resistente", "bioinsumo", "Plaga resistente", "Bioinsumo")}

<h3><span class="n">5</span>Faenas nuevas</h3>
<div class="cartas">
${carta({ k: "f_mallasombra", nombre: "Malla de sombra", tono: FAENA_HEX, n: copias("mallasombra"),
  texto: "Guárdala en la mano. Cuando alguien juegue una carta contra ti, muéstrala: esa carta no te toca. No gasta jornales y se usa en el turno de otro.",
  extra: `<p class="nota">Quien jugó la carta tiene que buscarle otro destino, aunque sea su propia finca. Si no hay ninguno, su carta se pierde. En el Chaparrón, la Propagación o el Sombrerón, solo te salvas tú y los demás reciben la carta.</p>` })}
${carta({ k: "f_jornalExtra", nombre: "Jornal extra", tono: FAENA_HEX, precio: costo({ k: "faena", tr: "jornalExtra" }), n: copias("jornalExtra"),
  texto: "Cuesta un jornal y te da dos. Si la juegas primero, te quedan tres jornales para ese turno: alcanza para una faena y algo más." })}
${carta({ k: "f_consejo", nombre: "Consejo del mayordomo", tono: FAENA_HEX, precio: 2, n: copias("consejo"),
  texto: "Cambias todas las cartas de tu mano por las de un vecino. Te devuelve un jornal para que juegues una de tus cartas nuevas." })}
${carta({ k: "f_erradicacion", nombre: "Erradicación", tono: FAENA_HEX, precio: 2, n: copias("erradicacion"),
  texto: "Quita todas las plagas de una mata, comunes o resistentes. Esas plagas salen del juego y no vuelven al mazo." })}
</div>

</div></section>

<!-- ═════════════════════ PARTE 3 · ESPANTOS ═════════════════════ -->
<section class="parte" id="espantos" style="--tono:var(--espantos)">
<div class="pestana">
  <div><p class="num">Parte 3 · Expansión</p><h2>Espantos</h2>
  <p>Cuando cae la noche en la montaña salen los personajes de las leyendas del campo. Son
  traviesos y poderosos, y algunos mueven hasta las matas certificadas.</p></div>
  <div class="cuantas"><b>${total.espantos}</b><span>cartas</span></div>
</div>
<div class="contenido">

<p>Esta expansión trae un cultivo raro, el injerto, y once espantos. Los espantos son faenas:
cuestan dos jornales y, cuando terminan, se van al montón. La única que se queda en la mesa es la
Madremonte, que acompaña a quien la recibe.</p>

<h3><span class="n">1</span>El injerto</h3>
<div class="cartas">
${carta({ k: "c_injerto", nombre: "Injerto", clase: "Cultivo", tono: HEX("injerto"), precio: 1, n: 1,
  texto: "Una planta mutante y traviesa. Para sembrarla tienes que arrancar una mata de tu finca: esa mata se va al montón con todo lo que tenía, y el injerto ocupa su lugar.",
  extra: `<p class="nota">Cuenta como un cultivo más para ganar. Solo le entran las plagas y los remedios de huerta, y las faenas. Solo puedes tener un injerto.</p>` })}
</div>

<h3><span class="n">2</span>Los espantos</h3>
<div class="cartas">
${carta({ k: "f_mohan_cafe", nombre: "El Mohán", clase: `Hay cuatro: uno por cultivo`, tono: ESPANTO_HEX, precio: 2, n: COL.length,
  texto: "Sale del río y se lleva a tu finca una mata de un vecino: la del cultivo que carga en la carta, o una huerta. Se la lleva aunque esté certificada.",
  extra: `<p class="nota">No sirve si ya tienes ese cultivo en tu finca.</p>` })}
${carta({ k: "f_patasola", nombre: "La Patasola", tono: ESPANTO_HEX, precio: 2, n: copias("patasola"),
  texto: "Cambia dos matas entre dos fincas, aunque estén certificadas. Pueden ser una tuya y una de un vecino, o las de dos vecinos.",
  extra: `<p class="nota">Nadie puede quedar con dos cultivos iguales.</p>` })}
${carta({ k: "f_duende", nombre: "El Duende", tono: ESPANTO_HEX, precio: 2, n: copias("duende"),
  texto: "Cambias el Duende por la carta de encima del montón de descarte y te la quedas en la mano. Además te devuelve un jornal, así que puedes usar la carta que recuperaste." })}
${carta({ k: "f_llorona", nombre: "La Llorona", tono: ESPANTO_HEX, precio: 2, n: copias("llorona"),
  texto: "Se juega sobre cualquier mata, tuya o de otro, que esté plagada o protegida, sin importar el color. Tú decides cómo llora:",
  extra: `<ul style="font-size:15.5px;margin-top:4px"><li><b>De alivio:</b> cura la plagada (hasta de plagas resistentes) o certifica la protegida.</li><li><b>De pena:</b> arrasa la plagada o le lava el remedio a la protegida.</li></ul>` })}
${carta({ k: "f_madremonte", nombre: "La Madremonte", tono: ESPANTO_HEX, precio: 2, n: copias("madremonte"),
  texto: "Se la pones a un vecino y se queda con él. Mientras la tenga, no puede cantar cosecha, aunque su finca esté completa.",
  extra: `<p class="nota">Para quitársela, tiene que usar un remedio en una mata de <b>otro</b> jugador: curarla, protegerla o certificarla. La Madremonte se va con ese jugador. Mientras la tengas, tus remedios sirven en cualquier finca.</p>` })}
${carta({ k: "f_sombreron", nombre: "El Sombrerón", tono: ESPANTO_HEX, precio: 2, n: copias("sombreron"),
  texto: "Todas las fincas cambian de dueño a la vez: cada una pasa al vecino del lado que tú elijas. Tu finca también se va, y te llega la del vecino." })}
</div>

</div></section>

<!-- ═════════════════════ EL CLIMA ═════════════════════ -->
<section class="parte" id="clima" style="--tono:var(--cielo)">
<div class="pestana">
  <div><p class="num">Para todos los mazos</p><h2>El clima</h2>
  <p>Cada tres vueltas completas a la mesa, el tiempo cambia en la montaña. El clima le toca
  a todos a la vez y nadie lo puede evitar.</p></div>
  <div class="cuantas"><b>${R.CLIMAS.length}</b><span>climas</span></div>
</div>
<div class="contenido">
<p>En la app el clima sale solo, con su anuncio en el centro de la mesa. Se puede apagar al armar
la partida.</p>
<div class="climas">
${R.CLIMAS.map(c => {
  const tono = { sequia: "#C77A1E", aguacero: "#2F6283", helada: "#7FA7C4", bonanza: "#B8891B", ventarron: "#6B7680", feria: "#B23A3A" }[c.id];
  const txt = c.id === "bonanza" ? "Quien tenga más matas sanas se anota dos puntos de cosecha. Esos puntos solo cuentan si la tierra se agota." : c.texto;
  return `<div class="clima" style="--tono:${tono}">${img("k_" + c.id, c.nombre)}<b>${esc(c.nombre)}</b><p>${esc(txt)}</p></div>`;
}).join("")}
</div>
</div></section>

<!-- ═════════════════════ VARIANTES ═════════════════════ -->
<section class="parte" id="variantes" style="--tono:var(--grano)">
<div class="pestana">
  <div><p class="num">Cuando ya conozcas el juego</p><h2>Otras formas de jugar</h2>
  <p>Todas se eligen al armar la partida.</p></div>
</div>
<div class="contenido">
<h3>Qué mazos usar</h3>
<p>El juego base siempre va. Las expansiones se le agregan: puedes jugar solo con Cosecha, con
Cosecha y Bonanza, con Cosecha y Espantos, o con los tres mazos juntos. Para aprender, empieza
solo con Cosecha.</p>
<h3>Variantes</h3>
<div class="variantes">
  <div class="variante"><b>Duelo</b><p>Para dos jugadores. Se necesitan cinco cultivos distintos en vez de cuatro. La huerta, el vivero y el injerto ayudan a completarlos.</p></div>
  <div class="variante"><b>Cosecha certificada</b><p>Más larga. Para que tu finca esté lista, las cuatro matas tienen que estar certificadas. El vivero ya cuenta como certificado.</p></div>
  <div class="variante"><b>Sin clima</b><p>Se juega sin los cambios de tiempo. Es buena idea para las primeras partidas.</p></div>
  <div class="variante"><b>Modo aprendiz</b><p>En la app, en cada turno te sugiere tres buenas jugadas. Sirve para aprender mientras juegas.</p></div>
</div>
</div></section>

<!-- ═════════════════════ PREGUNTAS FRECUENTES ═════════════════════ -->
<section class="parte" id="preguntas" style="--tono:var(--cafe)">
<div class="pestana">
  <div><p class="num">Para resolver dudas</p><h2>Preguntas frecuentes</h2>
  <p>Las dudas que más salen en la mesa, con su respuesta corta primero.</p></div>
</div>
<div class="contenido">

<div class="faq-grupo" style="--tono:var(--base)">
<h3>Cultivos y finca<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>¿Puedo tener dos matas del mismo cultivo?</dt><dd><span class="corta">No.</span> En tu finca todas las matas son distintas. Ninguna carta te puede dejar con dos iguales.</dd></div>
  <div><dt>¿Puedo tener más de cuatro matas?</dt><dd><span class="corta">Sí.</span> Mientras sean distintas. Por ejemplo, café, plátano, cacao, caña y huerta.</dd></div>
  <div><dt>Si tengo cinco matas y una está plagada, ¿puedo ganar?</dt><dd><span class="corta">Sí.</span> Lo que cuenta es tener cuatro matas sanas. La quinta no importa.</dd></div>
  <div><dt>La huerta, ¿de qué cultivo cuenta?</dt><dd><span class="corta">De ninguno en especial.</span> Es una mata más, distinta de las otras. No tienes que elegirle un color, y ningún remedio o plaga se lo cambia.</dd></div>
  <div><dt>¿Puedo sembrar en la finca de otro?</dt><dd><span class="corta">No.</span> Los cultivos solo se siembran en tu finca.</dd></div>
  <div><dt>¿Qué pasa con las cartas que estaban sobre una mata arrasada?</dt><dd>Todo se va al montón de descarte: la mata, sus plagas y sus remedios.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--base)">
<h3>Plagas<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>¿Puedo ponerle una plaga a mi propia mata?</dt><dd><span class="corta">Sí.</span> Es raro, pero tiene su truco: plagas tu mata y después, con la Propagación, le pasas la plaga a un vecino y tu mata queda limpia. En la app te pedimos confirmar antes, por si fue sin querer.</dd></div>
  <div><dt>¿La plaga de huerta le entra a cualquier mata?</dt><dd><span class="corta">Sí.</span> A cualquier cultivo. Las únicas excepciones son el vivero, que no recibe plagas, y las matas certificadas.</dd></div>
  <div><dt>¿Qué hace una plaga sobre una mata protegida?</dt><dd>Le quita el remedio. La plaga y el remedio se van al montón, y la mata queda sana.</dd></div>
  <div><dt>¿Puedo plagar una mata certificada?</dt><dd><span class="corta">No.</span> Una mata certificada ya no recibe plagas.</dd></div>
  <div><dt>Si una mata ya tiene una plaga, ¿qué hace la segunda?</dt><dd>La arrasa: la mata se pierde. Da igual si la primera era común o resistente.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--base)">
<h3>Remedios<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>¿Puedo ponerle un remedio a la mata de un vecino?</dt><dd><span class="corta">No,</span> los remedios son solo para tus matas. La única excepción es la Madremonte, en la expansión Espantos.</dd></div>
  <div><dt>¿El remedio de huerta cura cualquier plaga?</dt><dd>Cura cualquier plaga común en cualquier mata tuya. Una plaga resistente, no: para esa necesitas un bioinsumo.</dd></div>
  <div><dt>¿Qué pasa si le pongo un tercer remedio a una mata certificada?</dt><dd>No se puede. Una mata certificada ya no recibe más cartas.</dd></div>
  <div><dt>¿Con qué remedio se cura una mata de huerta?</dt><dd>Con cualquiera. A la huerta le sirven los remedios de todos los cultivos. Si la plaga es resistente, necesitas un bioinsumo.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--base)">
<h3>Faenas<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>Con el Trueque, ¿puedo cambiar una mata plagada?</dt><dd><span class="corta">Sí.</span> La mata se va con todo lo que tenga encima, sea plaga o remedio. Lo único que no se puede cambiar es una mata certificada.</dd></div>
  <div><dt>¿Puedo llevarme con la Mano larga un cultivo que ya tengo?</dt><dd><span class="corta">No,</span> porque te quedarían dos iguales.</dd></div>
  <div><dt>¿Puedo jugar la Propagación si no tengo plagas?</dt><dd><span class="corta">No.</span> Necesitas al menos una mata plagada, y que algún vecino tenga una mata sana a la que le pueda entrar esa plaga.</dd></div>
  <div><dt>Con el Cambio de lindero, ¿me quedo con las certificadas del vecino?</dt><dd><span class="corta">Sí.</span> Se cambian las fincas enteras, tal como estén.</dd></div>
  <div><dt>Después del Chaparrón, ¿cuándo recuperan cartas los demás?</dt><dd>En su siguiente turno: roban tres cartas nuevas y ese turno lo pierden. Juegan otra vez en la vuelta que sigue.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--base)">
<h3>Cantar la cosecha y ganar<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>Si un vecino me completa la finca sin querer, por ejemplo con un Trueque, ¿cuenta?</dt><dd><span class="corta">Sí.</span> Lo que importa es cómo está tu finca cuando empieza tu turno. Si en ese momento está lista, cosechas.</dd></div>
  <div><dt>Me dañaron la finca lista y en mi turno la arreglé. ¿Gano ya?</dt><dd><span class="corta">Todavía no.</span> Tu finca vuelve a quedar lista y tienes que aguantar otra vuelta.</dd></div>
  <div><dt>¿Y si dos jugadores tienen la finca lista al mismo tiempo?</dt><dd>Gana el primero al que le llegue el turno con la finca todavía lista.</dd></div>
  <div><dt>¿Cuántas veces se puede barajar el montón?</dt><dd>Una. La segunda vez que se acaba el mazo, la tierra se agota y se cuentan los puntos.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--base)">
<h3>El turno<span class="sello">Cosecha</span></h3>
<dl class="faq">
  <div><dt>¿Puedo jugar dos cartas en un turno?</dt><dd><span class="corta">Sí,</span> si te alcanzan los jornales. Dos cartas de un jornal, o una faena de dos.</dd></div>
  <div><dt>¿Puedo botar cartas y también jugar?</dt><dd><span class="corta">Sí.</span> Botar cuesta un jornal, así que te queda otro para jugar una carta, en el orden que quieras.</dd></div>
  <div><dt>¿Cuándo robo cartas?</dt><dd>Al final de tu turno, hasta volver a tener tres. No robas en la mitad del turno.</dd></div>
  <div><dt>Me quedé sin cartas. ¿Qué hago?</dt><dd>En tu turno robas tres cartas y ese turno lo pierdes. En el siguiente juegas normal.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--bonanza)">
<h3>Bonanza<span class="sello">Expansión</span></h3>
<dl class="faq">
  <div><dt>¿Se puede jugar Bonanza sin el juego base?</dt><dd><span class="corta">No.</span> Bonanza se mezcla con el mazo de Cosecha.</dd></div>
  <div><dt>¿Me pueden quitar el vivero?</dt><dd>Ninguna plaga lo toca, pero sí te lo pueden cambiar con un Trueque o llevar con la Mano larga. Con el Cambio de lindero se va con toda la finca.</dd></div>
  <div><dt>¿Puedo ponerle remedios al vivero?</dt><dd><span class="corta">No</span> los necesita: ya cuenta como certificado.</dd></div>
  <div><dt>¿Un remedio casero cura una plaga resistente?</dt><dd><span class="corta">No.</span> Solo un bioinsumo o una erradicación. En Espantos, también la Llorona.</dd></div>
  <div><dt>¿La malla de sombra cuesta jornales?</dt><dd><span class="corta">No.</span> Se juega en el turno de otro, cuando te atacan, y no gasta jornales. Robas la carta que te falte al final de tu propio turno.</dd></div>
  <div><dt>¿Qué cartas cuentan como «contra mí» para la malla?</dt><dd>Todas las que te toquen sin que tú las pidas: plagarte, lavarte un remedio, arrasarte, llevarse tu mata, un Trueque, un Consejo o un Cambio de lindero contigo, el Chaparrón, la Propagación y los espantos que te hagan daño. Si un remedio o la Llorona te cura, no hace falta usarla.</dd></div>
  <div><dt>¿La malla sirve contra el clima?</dt><dd><span class="corta">No.</span> El clima le cae a todos y nadie lo puede evitar.</dd></div>
  <div><dt>¿La Erradicación sirve en la mata de un vecino?</dt><dd><span class="corta">Sí,</span> en cualquier mata plagada. Normalmente la usarás en las tuyas.</dd></div>
  <div><dt>¿El vivero cuenta para tener la finca lista?</dt><dd><span class="corta">Sí.</span> Cuenta como una mata sana y certificada, distinta de las demás.</dd></div>
  <div><dt>¿Puedo tener el vivero y la huerta a la vez?</dt><dd><span class="corta">Sí.</span> Son matas distintas. Las dos te ayudan a completar la finca.</dd></div>
  <div><dt>¿La plaga resistente de huerta le entra a cualquier mata?</dt><dd><span class="corta">Sí,</span> igual que la langosta: a cualquier cultivo que no esté certificado. Al vivero no.</dd></div>
  <div><dt>¿Puedo usar mi malla de sombra para proteger a otro jugador?</dt><dd><span class="corta">No.</span> La malla solo te cubre a ti, cuando la carta va contra ti.</dd></div>
  <div><dt>Me cubrí con la malla y la carta no tiene otro destino. ¿Qué pasa?</dt><dd>La carta se pierde: va al montón sin hacer nada, y quien la jugó ya gastó sus jornales.</dd></div>
  <div><dt>¿Con el Jornal extra puedo jugar dos faenas?</dt><dd><span class="corta">No.</span> Te quedan tres jornales: alcanzan para una faena y una carta de un jornal.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--espantos)">
<h3>Espantos<span class="sello">Expansión</span></h3>
<dl class="faq">
  <div><dt>¿Puedo sembrar el injerto si no tengo matas?</dt><dd><span class="corta">No.</span> El injerto siempre reemplaza una mata tuya. Primero siembra algo.</dd></div>
  <div><dt>¿Una plaga de café le hace algo al injerto?</dt><dd><span class="corta">No.</span> Al injerto solo le entran las plagas y los remedios de huerta, y las faenas.</dd></div>
  <div><dt>¿El Mohán de café se puede llevar una huerta?</dt><dd><span class="corta">Sí.</span> Cada Mohán se lleva su cultivo o una huerta, aunque estén certificados.</dd></div>
  <div><dt>¿La Llorona tiene que ser del mismo color que la mata?</dt><dd><span class="corta">No.</span> La Llorona sirve en cualquier mata plagada o protegida.</dd></div>
  <div><dt>¿Puedo usar el Duende si el montón está vacío?</dt><dd><span class="corta">No.</span> Necesita una carta en el montón para cambiarla.</dd></div>
  <div><dt>Tengo la Madremonte y mi finca completa. ¿Qué pasa?</dt><dd>Tu finca no cuenta como lista hasta que te quites la Madremonte. Apenas se la pases a otro, tu finca queda lista y empiezas a aguantar la vuelta.</dd></div>
  <div><dt>Si cambio de finca con el Lindero, ¿la Madremonte se va con la finca?</dt><dd><span class="corta">No.</span> La Madremonte se queda con la persona, no con la finca.</dd></div>
  <div><dt>Con la Madremonte, ¿puedo ganar cuando se agota la tierra?</dt><dd><span class="corta">Sí.</span> La Madremonte solo te impide cantar cosecha. Tus puntos cuentan igual.</dd></div>
  <div><dt>Si me pasan la Madremonte, ¿puedo devolverla enseguida?</dt><dd><span class="corta">Sí.</span> En tu turno, usa un remedio en una mata de otro jugador, el que sea, y la Madremonte se va con él.</dd></div>
  <div><dt>¿Cuántos jornales cuestan los espantos?</dt><dd>Dos, como toda faena. El Duende te devuelve uno después de jugarlo.</dd></div>
  <div><dt>¿La Patasola puede cambiar dos matas de mi propia finca?</dt><dd><span class="corta">No.</span> Siempre cambia matas entre dos fincas distintas.</dd></div>
  <div><dt>¿El Mohán se puede llevar un vivero?</dt><dd><span class="corta">No.</span> Solo se lleva el cultivo que carga en su carta o una huerta.</dd></div>
  <div><dt>¿Me pueden quitar el injerto?</dt><dd><span class="corta">Sí.</span> Es una mata como las otras: se puede cambiar con un Trueque o llevar con la Mano larga, si no está certificada.</dd></div>
  <div><dt>¿Cómo certifico el injerto?</dt><dd>Con remedios de huerta: dos remedios caseros de huerta o, si juegas con Bonanza, un bioinsumo de huerta de una vez.</dd></div>
  <div><dt>¿La Llorona puede certificar la mata de un vecino?</dt><dd><span class="corta">Sí.</span> Sirve en cualquier finca. Casi siempre la usarás en las tuyas, o para dañar las de otros.</dd></div>
  <div><dt>¿Qué hace el Sombrerón si somos solo dos?</dt><dd>Los dos jugadores cambian de finca.</dd></div>
  <div><dt>¿La malla de sombra sirve contra los espantos?</dt><dd><span class="corta">Sí,</span> si juegas también con Bonanza. Te cubre de cualquier espanto que te haga daño.</dd></div>
</dl></div>

<div class="faq-grupo" style="--tono:var(--cielo)">
<h3>El clima<span class="sello">Todos</span></h3>
<dl class="faq">
  <div><dt>¿La sequía le quita los remedios a las matas certificadas?</dt><dd><span class="corta">No.</span> Solo a las protegidas, que tienen un remedio. Las certificadas aguantan.</dd></div>
  <div><dt>¿Los puntos de la Bonanza sirven para cantar cosecha?</dt><dd><span class="corta">No.</span> Solo se suman si la tierra se agota y se cuentan los puntos.</dd></div>
  <div><dt>Después del Ventarrón, ¿para dónde se juega?</dt><dd>Al revés: el turno sigue hacia el otro lado, hasta que otro Ventarrón lo voltee de nuevo.</dd></div>
</dl></div>

</div></section>

<!-- ═════════════════════ RESUMEN ═════════════════════ -->
<section class="parte" id="resumen" style="--tono:var(--hoja)">
<div class="pestana">
  <div><p class="num">Para tener a mano</p><h2>El juego en una página</h2></div>
</div>
<div class="contenido">
<div class="bolsillo">
  <section><h4>Para ganar</h4><ul>
    <li>Cuatro cultivos distintos y sanos: finca lista.</li>
    <li>Si sigue lista al empezar tu turno, cosechas.</li>
    <li>O, si la tierra se agota, gana quien tenga más puntos.</li></ul></section>
  <section><h4>Tu turno</h4><ul>
    <li>Tienes dos jornales.</li>
    <li>Cultivo, plaga o remedio: un jornal.</li>
    <li>Faena: dos jornales.</li>
    <li>Botar de una a tres cartas: un jornal.</li>
    <li>Al final, roba hasta tener tres.</li></ul></section>
  <section><h4>Una mata</h4><ul>
    <li>Un remedio: protegida. Dos: certificada.</li>
    <li>Una plaga: plagada. Dos: arrasada.</li>
    <li>La certificada vale doble y nadie la toca.</li></ul></section>
  <section><h4>Nunca olvides</h4><ul>
    <li>El color manda: cada plaga y remedio es de su cultivo.</li>
    <li>La huerta es el comodín.</li>
    <li>Nunca dos cultivos iguales en tu finca.</li></ul></section>
</div>
</div></section>

<p class="pie">Cosecha es un juego original, con ilustraciones propias. Esta guía se genera desde las
mismas reglas que usa el juego en línea, así que siempre dicen lo mismo.</p>
</div>
`;

/* ── Tres guías separadas ─────────────────────────────────────
   La guía se escribió de una pieza; aquí se corta en tres páginas: el juego
   base con el clima, las variantes y sus preguntas, y una por expansión con
   las suyas. Cada expansión abre diciendo que necesita el mazo base.
   Los enlaces entre guías se leen de guia-enlaces.json (claves cosecha,
   bonanza, espantos) cuando existe, porque la dirección de cada página solo
   se conoce después de publicarla. */
const trozo = (desde, hasta) => {
  const a = html.indexOf(desde), b = hasta ? html.indexOf(hasta, a + 1) : html.length;
  if (a < 0 || b < 0) throw new Error("No encontré el trozo " + desde);
  return html.slice(a, b);
};
const M = t => "<!-- ═════════════════════ " + t;
const cabeza = html.slice(0, html.indexOf('<div class="marco">'));
const parte = {
  cosecha: trozo(M("PARTE 1"), M("PARTE 2")),
  bonanza: trozo(M("PARTE 2"), M("PARTE 3")),
  espantos: trozo(M("PARTE 3"), M("EL CLIMA")),
  clima: trozo(M("EL CLIMA"), M("VARIANTES")),
  variantes: trozo(M("VARIANTES"), M("PREGUNTAS")),
  resumen: trozo(M("RESUMEN"), '<p class="pie">')
};
/* Las preguntas, repartidas según el mazo al que pertenecen */
const preguntas = trozo(M("PREGUNTAS"), M("RESUMEN"));
const grupos = preguntas.split('<div class="faq-grupo"').slice(1).map(g => '<div class="faq-grupo"' + g.replace(/<\/div><\/section>\s*$/, ""));
const deMazoFaq = tono => grupos.filter(g => g.includes(`--tono:var(--${tono})`)).join("\n");
const faq = (grupos, nota) => `<section class="parte" id="preguntas" style="--tono:var(--cafe)">
<div class="pestana">
  <div><p class="num">Para resolver dudas</p><h2>Preguntas frecuentes</h2>
  <p>${nota}</p></div>
</div>
<div class="contenido">
${grupos}
</div></section>`;

const enlacesArch = path.join(salida, "guia-enlaces.json");
const enlaces = fs.existsSync(enlacesArch) ? JSON.parse(fs.readFileSync(enlacesArch, "utf8")) : {};
const a = (k, texto) => enlaces[k] ? `<a href="${enlaces[k]}">${texto}</a>` : texto;
const GUIAS = {
  cosecha: { nombre: "Cosecha", tono: "var(--base)", lema: "Empieza aquí." },
  bonanza: { nombre: "Bonanza", tono: "#8A6510", lema: "Plagas duras y remedios de laboratorio." },
  espantos: { nombre: "Espantos", tono: "var(--espantos)", lema: "Las leyendas del campo." }
};
/* Tira de las tres guías, arriba de cada una: la propia va marcada */
const tira = actual => `<nav class="guias" aria-label="Las tres guías">
${Object.entries(GUIAS).map(([k, g], i) => {
  const cuerpoTira = `<b>${i + 1} · ${g.nombre}</b><span>${k === "cosecha" ? "Juego base" : "Expansión"} · ${g.lema}</span>`;
  if (k === actual) return `<span class="guia actual" style="--tono:${g.tono}" aria-current="page">${cuerpoTira}</span>`;
  return enlaces[k] ? `<a class="guia" href="${enlaces[k]}" style="--tono:${g.tono}">${cuerpoTira}</a>`
                    : `<span class="guia" style="--tono:${g.tono}">${cuerpoTira}</span>`;
}).join("\n")}
</nav>`;
const estiloTira = `<style>
nav.guias{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 22px}
nav.guias .guia{display:block;text-decoration:none;color:inherit;background:var(--caja);border:1px solid var(--linea);
  border-radius:4px;padding:8px 11px;font-size:13.5px;border-top:4px solid var(--tono)}
nav.guias .guia b{display:block;font-family:"Zilla Slab",Georgia,serif;font-size:16px}
nav.guias .guia span{color:var(--suave)}
nav.guias .actual{background:var(--tono);color:#FFF8EA;border-color:var(--tono)}
nav.guias .actual span{color:#FFF8EA;opacity:.9}
nav.guias a.guia:hover{border-color:var(--tono)}
nav.guias a.guia:focus-visible{outline:3px solid var(--grano);outline-offset:2px}
@media (max-width:640px){ nav.guias{grid-template-columns:1fr} }
</style>`;
const pie = `<p class="pie">Cosecha es un juego original, con ilustraciones propias. Esta guía se genera desde las
mismas reglas que usa el juego en línea, así que siempre dicen lo mismo.</p>`;
const pagina = (titulo, actual, cuerpo) =>
  cabeza.replace("<title>Guía de Cosecha</title>", `<title>${titulo}</title>`) + estiloTira +
  `<div class="marco">\n${tira(actual)}\n${cuerpo}\n${pie}\n</div>\n`;
const portadaExp = ({ sobre, nombre, historia, dibujos, datos, indice }) => `
<header class="portada">
  <div><p class="sobre">${sobre}</p><h1>${nombre}</h1><p class="historia">${historia}</p></div>
  <div class="abanico" aria-hidden="true">${dibujos.map(([k, t]) => `<img src="cartas/${k}.png" alt="" style="--tono:${t}">`).join("")}</div>
</header>
<div class="datos">${datos.map(([n, t]) => `<span class="dato"><b>${n}</b>${t}</span>`).join("")}</div>
<nav class="indice" aria-label="Contenido">${indice.map(([h, t, b, s]) => `<a href="#${h}" style="--tono:${t}"><b>${b}</b><span>${s}</span></a>`).join("")}</nav>`;
const antes = (mazoNombre, n) => recuadro("Antes de empezar", `<p>Esta es una expansión: <b>necesitas el juego
base</b> para jugarla. Baraja sus ${n} cartas junto con las ${total.base} de Cosecha y juega con las reglas de
siempre. Aquí solo está lo que ${mazoNombre} agrega. Si todavía no conoces el juego, lee primero la
${a("cosecha", "guía de Cosecha")}.</p>`, "clave");

/* 1 · Cosecha: juego base, clima, variantes, sus preguntas y el resumen */
const indiceBase = `<nav class="indice" aria-label="Contenido">
  <a href="#cosecha" style="--tono:var(--base)"><b>Cómo se juega</b><span>Las reglas, paso a paso.</span></a>
  <a href="#clima" style="--tono:var(--cielo)"><b>El clima</b><span>Lo que cae sobre todos cada tres vueltas.</span></a>
  <a href="#variantes" style="--tono:var(--grano)"><b>Otras formas de jugar</b><span>Duelo, cosecha certificada y más.</span></a>
  <a href="#preguntas" style="--tono:var(--cafe)"><b>Preguntas frecuentes</b><span>Las dudas que salen en la mesa.</span></a>
  <a href="#resumen" style="--tono:var(--hoja)"><b>El juego en una página</b><span>Para tener a mano.</span></a>
</nav>`;
const portadaBase = trozo('<header class="portada">', '<nav class="indice"')
  .replace(`<b>${mazo.length}</b>cartas en tres mazos`, `<b>${total.base}</b>cartas`);
const variantes = parte.variantes.replace(
  /<p>El juego base siempre va\.[\s\S]*?<\/p>/,
  `<p>El juego base siempre va. Las expansiones se le agregan: puedes jugar solo con Cosecha, con
Cosecha y ${a("bonanza", "Bonanza")}, con Cosecha y ${a("espantos", "Espantos")}, o con los tres mazos juntos.
Para aprender, empieza solo con Cosecha. Cada expansión tiene su propia guía.</p>`)
  .replace("La huerta, el vivero y el injerto ayudan a completarlos.",
           "La huerta ayuda a completarlos, y con las expansiones también el vivero y el injerto.")
  .replace("El vivero ya cuenta como certificado.", "Con Bonanza, el vivero ya cuenta como certificado.");
const guiaCosecha = pagina("Guía de Cosecha", "cosecha",
  portadaBase + indiceBase + parte.cosecha + parte.clima + variantes +
  faq(deMazoFaq("base") + "\n" + deMazoFaq("cielo"), "Las dudas que más salen en la mesa, con su respuesta corta primero.") +
  parte.resumen);

/* 2 · Bonanza */
const guiaBonanza = pagina("Guía de Bonanza", "bonanza",
  portadaExp({ sobre: "Guía de juego · Expansión", nombre: "Bonanza",
    historia: "Llegó la bonanza: el café se vende caro y en la finca hay más en juego. Las plagas se volvieron más duras, llegaron los remedios de laboratorio y el mayordomo tiene nuevos trucos.",
    dibujos: [["c_vivero", HEX("vivero")], ["r_bioinsumo_cafe", HEX("cafe")], ["p_resistente_platano", HEX("platano")]],
    datos: [[total.bonanza, "cartas nuevas"], ["Cosecha", "necesaria para jugar"], ["2 a 6", "jugadores"], ["8+", "años"]],
    indice: [["bonanza", "var(--bonanza)", "Lo que trae", "Vivero, plagas resistentes, bioinsumos y faenas."],
             ["preguntas", "var(--cafe)", "Preguntas frecuentes", "Las dudas de Bonanza."]] }) +
  antes("Bonanza", total.bonanza) +
  parte.bonanza.replace(" Se mezcla con el juego base.", "") +
  faq(deMazoFaq("bonanza"), "Las dudas de Bonanza, con su respuesta corta primero."));

/* 3 · Espantos */
const guiaEspantos = pagina("Guía de Espantos", "espantos",
  portadaExp({ sobre: "Guía de juego · Expansión", nombre: "Espantos",
    historia: "Cuando cae la noche en la montaña salen los personajes de las leyendas del campo: el Mohán desde el río, la Patasola entre el monte, el Duende y sus travesuras. No dan miedo, pero sí dan trabajo.",
    dibujos: [["f_mohan_cafe", ESPANTO_HEX], ["f_duende", ESPANTO_HEX], ["c_injerto", HEX("injerto")]],
    datos: [[total.espantos, "cartas nuevas"], ["Cosecha", "necesaria para jugar"], ["2 a 6", "jugadores"], ["8+", "años"]],
    indice: [["espantos", "var(--espantos)", "Lo que trae", "El injerto y once espantos."],
             ["preguntas", "var(--cafe)", "Preguntas frecuentes", "Las dudas de Espantos."]] }) +
  antes("Espantos", total.espantos) +
  parte.espantos +
  faq(deMazoFaq("espantos"), "Las dudas de Espantos, con su respuesta corta primero."));

const salidas = { cosecha: guiaCosecha, bonanza: guiaBonanza, espantos: guiaEspantos };
for (const [k, pag] of Object.entries(salidas)) {
  const dir = path.join(salida, k);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `guia-${k}.html`), pag);
  /* imágenes que usa cada guía, para publicarlas junto a su página */
  const usadas = [...new Set([...pag.matchAll(/cartas\/([a-zA-Z_]+)\.png/g)].map(m => m[1]))].sort();
  fs.writeFileSync(path.join(dir, "imagenes.json"), JSON.stringify(usadas));
  console.log(`  guia-${k}.html · ${usadas.length} ilustraciones · ${Math.round(pag.length / 1024)} KB`);
}
