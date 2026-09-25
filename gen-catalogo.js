/* Genera el catálogo de cartas como artifact HTML, usando el arte real del juego. */
const R = require("./public/reglas.js");
const A = require("./public/arte.js");
const fs = require("fs");

/* Cuántas copias de cada diseño trae cada mazo. Algunos cultivos aparecen en
   dos mazos a la vez, igual que en cualquier juego con expansiones, y por eso
   el desglose importa: en la mesa se separan por el sello, no por el dibujo. */
const porMazo = {};
R.crearMazo(true, true).forEach(x => {
  const k = A.claveCarta(x), m = R.mazoDe(x);
  porMazo[k] = porMazo[k] || {base:0, bonanza:0, espantos:0};
  porMazo[k][m]++;
});
const todo = {};
Object.entries(porMazo).forEach(([k,v]) => { todo[k] = v.base + v.bonanza + v.espantos; });
const mazoPrincipal = k => { const v = porMazo[k];
  return v.base ? "base" : (v.bonanza ? "bonanza" : "espantos"); };
const desglose = k => { const v = porMazo[k];
  return Object.entries(v).filter(([,n]) => n > 0)
    .map(([m,n]) => n + " en " + R.MAZOS[m].nombre).join(" + "); };

const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Plagas y remedios existen en cinco colores y el color decide la jugada: un
   remedio de café solo cura café. El dibujo en vector se tiñe solo, así que un
   diseño alcanza; un PNG pintado no se puede teñir, y ahí sí hace falta uno por
   color. El juego busca primero la versión con color y si no está usa la general. */
const porColor = {};
R.crearMazo(true, true).forEach(x => {
  const ks = A.clavesCarta(x);
  if (ks.length < 2) return;
  const g = ks[1], col = x.c;
  porColor[g] = porColor[g] || [];
  if (!porColor[g].includes(col)) porColor[g].push(col);
});
const nColores = Object.values(porColor).reduce((a, v) => a + v.length, 0);

/* una carta representativa por diseño */
const ejemplares = [];
const vistos = new Set();
R.crearMazo(true,true).forEach(x => {
  const k = A.claveCarta(x);
  if (vistos.has(k)) return;
  vistos.add(k); ejemplares.push({k, carta:x});
});

const FAMILIAS = [
  {id:"cultivo", titulo:"Cultivos", lead:"Lo que siembras. Reúne cuatro distintos y sanos para ganar; nunca puedes tener dos del mismo."},
  {id:"plaga",   titulo:"Plagas",   lead:"Lo que le mandas al vecino. Una plaga arruina una mata; la segunda la acaba."},
  {id:"remedio", titulo:"Remedios", lead:"Lo que protege tu finca. Curan, protegen y certifican."},
  {id:"faena",   titulo:"Faenas",   lead:"El trabajo grande. Cuestan dos jornales, pero mueven la mesa entera."}
];
const MAZOS = {base:"Base", bonanza:"Bonanza", espantos:"Espantos"};

function tarjeta(e){
  const {k, carta} = e;
  const n = todo[k];
  const tono = R.colorCarta(carta);
  const dib = A.dibujo(carta, tono);
  const nombre = R.nombreCarta(carta);
  const mazo = mazoPrincipal(k);
  const compartida = Object.values(porMazo[k]).filter(x => x > 0).length > 1;
  const costo = R.cuesta(carta);
  return `<article class="carta" id="${k}">
    <div class="lamina" style="--tono:${tono}">${dib}</div>
    <div class="ficha">
      <header>
        <h3>${esc(nombre)}</h3>
        <p class="meta">
          ${Object.entries(porMazo[k]).filter(([,c]) => c > 0)
            .map(([m]) => `<span class="sello ${m}">${R.MAZOS[m].nombre}</span>`).join("")}
          <span class="copias">${n} ${n===1?"copia":"copias"}</span>
          <span class="jornal">${costo} ${costo===1?"jornal":"jornales"}</span></p>
      </header>
      <p class="hace">${esc(R.queHace(carta))}</p>
      ${compartida ? `<p class="reparto">${esc(desglose(k))}</p>` : ""}
      <p class="clave"><code>${k}.png</code></p>
      ${porColor[k] ? `<p class="variantes">Un dibujo por color, si lo quieres fino:
        ${porColor[k].map(v => `<code>${k}_${v}.png</code>`).join(" ")}</p>` : ""}
    </div>
  </article>`;
}

const secciones = FAMILIAS.map(f => {
  const items = ejemplares.filter(e => e.carta.k === f.id);
  return `<section class="familia" id="fam-${f.id}">
    <div class="encabeza">
      <h2>${f.titulo}</h2>
      <p>${f.lead}</p>
      <p class="cuenta">${items.length} diseños distintos · ${items.reduce((a,e)=>a+todo[e.k],0)} cartas en el mazo</p>
    </div>
    <div class="rejilla">${items.map(tarjeta).join("\n")}</div>
  </section>`;
}).join("\n");

const totalDisenos = ejemplares.length;
const totalCartas = Object.values(todo).reduce((a,b)=>a+b,0);
const nBase = Object.values(porMazo).reduce((a,v)=>a+v.base,0);
const nBon  = Object.values(porMazo).reduce((a,v)=>a+v.bonanza,0);
const nEsp  = Object.values(porMazo).reduce((a,v)=>a+v.espantos,0);

const html = `<title>La baraja de Cosecha</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Karla:wght@400;500;700&display=swap">
<style>
:root{
  color-scheme: light;
  --papel:#F4EFE2; --papel-hondo:#EAE2D1; --tinta:#2A2114; --tinta-suave:#6B5C45;
  --cafe:#8C3A2B; --hoja:#4A6338; --grano:#B8891B; --linea:#D6CBB4;
  --caja:#FBF7EC;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  color-scheme: dark;
  --papel:#231B12; --papel-hondo:#1B150E; --tinta:#F0E8D8; --tinta-suave:#A8997E;
  --cafe:#D8705C; --hoja:#8FB06E; --grano:#E0AE3C; --linea:#3E3325;
  --caja:#2C2317;
}}
:root[data-theme="dark"]{
  color-scheme: dark;
  --papel:#231B12; --papel-hondo:#1B150E; --tinta:#F0E8D8; --tinta-suave:#A8997E;
  --cafe:#D8705C; --hoja:#8FB06E; --grano:#E0AE3C; --linea:#3E3325;
  --caja:#2C2317;
}
*{box-sizing:border-box}
body{margin:0;background:var(--papel);color:var(--tinta);
  font-family:Karla,ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;
  padding:0 16px}
.marco{max-width:1120px;margin:0 auto;padding-block:28px 64px}

/* portada */
.portada{border-bottom:3px double var(--linea);padding-bottom:22px;margin-bottom:8px}
.sobrenombre{font-family:Karla;font-size:11.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--cafe);margin:0 0 6px}
h1{font-family:"Zilla Slab",Georgia,serif;font-weight:700;font-size:clamp(34px,7vw,52px);
  line-height:1.05;margin:0 0 10px;text-wrap:balance;letter-spacing:-.01em}
.bajada{margin:0;max-width:62ch;color:var(--tinta-suave);font-size:16px}
.cifras{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;font-variant-numeric:tabular-nums}
.cifra{background:var(--caja);border:1px solid var(--linea);border-radius:3px;padding:7px 12px;
  font-size:13px}
.cifra b{font-family:"Zilla Slab",Georgia,serif;font-size:17px;margin-right:5px;color:var(--cafe)}

/* índice */
nav.indice{display:flex;flex-wrap:wrap;gap:6px;margin:22px 0 34px}
nav.indice a{font-size:13px;font-weight:700;text-decoration:none;color:var(--tinta);
  border:1px solid var(--linea);background:var(--caja);border-radius:3px;padding:6px 12px}
nav.indice a:hover{border-color:var(--cafe);color:var(--cafe)}

/* familias */
.familia{margin-bottom:46px;scroll-margin-top:16px}
.encabeza{border-left:4px solid var(--hoja);padding-left:14px;margin-bottom:20px}
.encabeza h2{font-family:"Zilla Slab",Georgia,serif;font-size:27px;font-weight:600;margin:0 0 4px}
.encabeza p{margin:0;max-width:60ch;color:var(--tinta-suave)}
.cuenta{font-size:12.5px !important;font-weight:700;color:var(--grano) !important;
  margin-top:6px !important;font-variant-numeric:tabular-nums}

.rejilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.carta{display:flex;gap:13px;background:var(--caja);border:1px solid var(--linea);
  border-radius:4px;padding:13px;scroll-margin-top:16px}
.lamina{flex:none;width:78px;height:78px;border-radius:3px;padding:6px;
  background:color-mix(in srgb, var(--tono) 12%, transparent);
  border:1px solid color-mix(in srgb, var(--tono) 34%, transparent)}
.lamina svg{width:100%;height:100%;display:block}
.ficha{min-width:0;flex:1}
.ficha h3{font-family:"Zilla Slab",Georgia,serif;font-size:16.5px;font-weight:600;margin:0 0 5px;
  line-height:1.2}
.meta{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px;align-items:center}
.sello{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  padding:2px 7px;border-radius:2px;color:#fff}
.sello.base{background:var(--hoja)} .sello.bonanza{background:var(--grano);color:#2A2114}
.sello.espantos{background:#6B4FA8}
.reparto{margin:0 0 8px;font-size:12px;color:var(--tinta-suave);font-variant-numeric:tabular-nums}
.reparto::before{content:"Reparto: ";font-weight:700}
.mazos{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:18px 0 8px}
.mz{background:var(--caja);border:1px solid var(--linea);border-radius:4px;padding:13px 15px;
  border-top:4px solid var(--mzc)}
.mz h3{font-family:"Zilla Slab",Georgia,serif;font-size:17px;margin:0 0 2px;font-weight:600;
  display:flex;align-items:center;gap:8px}
.mz .disco{width:21px;height:21px;border-radius:50%;background:var(--mzc);padding:3.5px;flex:none}
.mz .disco svg{width:100%;height:100%;display:block}
.mz .cuantas{font-size:12.5px;font-weight:700;color:var(--mzc);margin:0 0 6px;
  font-variant-numeric:tabular-nums}
.mz p{margin:0;font-size:13px;line-height:1.5;color:var(--tinta-suave)}
.copias,.jornal{font-size:11.5px;color:var(--tinta-suave);font-variant-numeric:tabular-nums}
.jornal::before{content:"·";margin-right:5px}
.hace{margin:0 0 9px;font-size:13.5px;line-height:1.5}
.clave{margin:0}
.clave code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;
  background:var(--papel-hondo);border:1px solid var(--linea);border-radius:2px;padding:2px 6px;
  color:var(--tinta-suave)}

/* taller de arte */
.taller{border-top:3px double var(--linea);padding-top:30px;margin-top:10px}
.taller h2{font-family:"Zilla Slab",Georgia,serif;font-size:30px;font-weight:700;margin:0 0 8px}
.taller h3{font-family:"Zilla Slab",Georgia,serif;font-size:19px;font-weight:600;
  margin:30px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--linea)}
.taller p, .taller li{max-width:68ch}
.taller ol, .taller ul{padding-left:20px}
.taller li{margin-bottom:7px}
.herramientas{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;
  margin:16px 0 8px}
.herr{background:var(--caja);border:1px solid var(--linea);border-radius:4px;padding:13px}
.herr h4{font-family:"Zilla Slab",Georgia,serif;font-size:16px;margin:0 0 3px;font-weight:600}
.herr .para{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:var(--cafe);margin:0 0 6px}
.herr p{margin:0;font-size:13px;line-height:1.5;color:var(--tinta-suave)}
.receta{background:var(--papel-hondo);border:1px solid var(--linea);border-left:4px solid var(--grano);
  border-radius:3px;padding:14px 16px;margin:14px 0;font-size:13.5px;line-height:1.65}
.receta strong{display:block;font-family:"Zilla Slab",Georgia,serif;font-size:15px;margin-bottom:6px}
pre{background:var(--papel-hondo);border:1px solid var(--linea);border-radius:3px;
  padding:12px 14px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:12.5px;line-height:1.6;margin:10px 0}
.nota{font-size:13px;color:var(--tinta-suave);border-left:3px solid var(--hoja);padding-left:12px;
  margin:16px 0}
footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--linea);
  font-size:12.5px;color:var(--tinta-suave)}
.variantes{margin:6px 0 0;font-size:12.5px;line-height:1.9;color:var(--tinta-suave)}
.variantes code{font-size:11.5px;background:rgba(74,99,56,.09);padding:1px 5px;border-radius:3px}
@media (max-width:560px){
  .carta{flex-direction:column}
  .lamina{width:92px;height:92px}
}
</style>

<div class="marco">
  <header class="portada">
    <p class="sobrenombre">Cosecha · baraja completa</p>
    <h1>La baraja de Cosecha</h1>
    <p class="bajada">Las ${totalCartas} cartas del juego, con lo que hace cada una y el nombre
      de archivo que el juego espera si quieres reemplazar el dibujo por una ilustración propia.</p>
    <div class="cifras">
      <span class="cifra"><b>${totalDisenos}</b>diseños distintos</span>
      <span class="cifra"><b>${nBase}</b>de Cosecha</span>
      <span class="cifra"><b>${nBon}</b>de Bonanza</span>
      <span class="cifra"><b>${nEsp}</b>de Espantos</span>
    </div>
  </header>

  <section id="mazos">
    <h2 style="font-family:'Zilla Slab',Georgia,serif;font-size:25px;font-weight:600;margin:30px 0 6px">
      Los tres mazos</h2>
    <p style="margin:0;color:var(--tinta-suave);max-width:62ch">Cada carta lleva impreso abajo a
      la derecha el sello de su mazo. Es lo que permite volver a separar las barajas cuando ya
      están mezcladas, y por eso algunos cultivos aparecen dos veces: la misma mata, pero con
      sello distinto según de dónde venga.</p>
    <div class="mazos">
      <div class="mz" style="--mzc:${R.MAZOS.base.hex}">
        <h3><span class="disco">${A.sello("base","#FFFFFF")}</span>Cosecha</h3>
        <p class="cuantas">${Object.values(porMazo).reduce((a,v)=>a+v.base,0)} cartas · grano de café</p>
        <p>El juego completo por sí solo: los cuatro cultivos, la huerta, plagas y remedios
          sencillos, y las cinco faenas de siempre.</p>
      </div>
      <div class="mz" style="--mzc:${R.MAZOS.bonanza.hex}">
        <h3><span class="disco">${A.sello("bonanza","#FFFFFF")}</span>Bonanza</h3>
        <p class="cuantas">${Object.values(porMazo).reduce((a,v)=>a+v.bonanza,0)} cartas · sol</p>
        <p>Sube el techo del juego: el vivero, plagas resistentes, bioinsumos, cuatro faenas más
          y una copia extra de cada cultivo.</p>
      </div>
      <div class="mz" style="--mzc:${R.MAZOS.espantos.hex}">
        <h3><span class="disco">${A.sello("espantos","#FFFFFF")}</span>Espantos</h3>
        <p class="cuantas">${Object.values(porMazo).reduce((a,v)=>a+v.espantos,0)} cartas · luna</p>
        <p>El folclor del monte: el injerto silvestre y los seis espantos que enredan la mesa.</p>
      </div>
    </div>
  </section>

  <nav class="indice">
    <a href="#mazos">Los tres mazos</a>
    ${FAMILIAS.map(f=>`<a href="#fam-${f.id}">${f.titulo}</a>`).join("")}
    <a href="#taller">Cómo ilustrarlas</a>
  </nav>

  ${secciones}

  <section class="taller" id="taller">
    <h2>Cómo ilustrar la baraja</h2>
    <p>Los dibujos que ves arriba son los que trae el juego: vectores hechos en código, que
      escalan sin pixelarse y pesan poco. Sirven perfectamente para jugar, pero si quieres una
      baraja pintada de verdad, el juego está preparado para recibirla sin tocar una línea de
      código.</p>

    <h3>Qué herramienta usar</h3>
    <div class="herramientas">
      <div class="herr">
        <p class="para">La más parecida a una baraja real</p>
        <h4>Midjourney</h4>
        <p>La mejor para ilustración de juego con volumen y tinta. Su parámetro <code>--sref</code>
          clona el estilo de una imagen entre cartas, que es justo lo que necesitas para que las
          ${totalDisenos} se parezcan. De pago, unos 10 USD al mes.</p>
      </div>
      <div class="herr">
        <p class="para">La más fácil, y en español</p>
        <h4>Gemini o ChatGPT</h4>
        <p>Describes en español y corriges conversando: «más oscuro», «quítale el fondo».
          Gemini mantiene bien un mismo personaje entre imágenes. Ideal para empezar sin curva
          de aprendizaje.</p>
      </div>
      <div class="herr">
        <p class="para">Si quieres editar después</p>
        <h4>Recraft</h4>
        <p>Tiene modo de estilo consistente y exporta a SVG, así que puedes retocar el trazo.
          Útil si piensas imprimir la baraja en grande.</p>
      </div>
    </div>

    <h3>Las tres reglas que evitan perder el día</h3>
    <ol>
      <li><strong>Una carta por imagen.</strong> Nunca pidas «las ${totalDisenos} cartas» ni una
        lámina con varias: los generadores pierden el hilo y ninguna queda usable.</li>
      <li><strong>Solo el dibujo, sin marco ni letras.</strong> El marco de color, los rótulos, el
        costo en jornales y el icono de esquina los pone el juego. Si la IA dibuja texto, la
        imagen no encaja.</li>
      <li><strong>Fija el estilo con la primera y repítelo.</strong> Genera primero el café. Cuando
        te guste, copia el bloque de estilo palabra por palabra en todas las demás y cambia solo
        la línea del sujeto.</li>
    </ol>

    <div class="receta">
      <strong>Bloque de estilo (cópialo igual en cada carta)</strong>
      Ilustración estilo juego de cartas, cartoon semi-realista con volumen. Colores saturados y
      cálidos de tierra cafetera. Iluminación suave desde arriba a la izquierda con un brillo
      nítido. Contorno de tinta oscuro y limpio alrededor de la figura, como en cómic. Sombreado
      con degradados suaves que dan relieve. Un sujeto único, centrado, de frente, ocupando cerca
      del 80% del cuadro. Fondo transparente, sin escenario, sin marco, sin borde, sin texto, sin
      letras, sin números, sin logotipos. Composición limpia tipo sticker. Cuadrado 1:1, alta
      resolución.
    </div>

    <p>Después de ese bloque, añade una línea con el sujeto. Para el café sería «una rama de café
      con cerezas rojas maduras y hojas verdes brillantes»; para la plaga resistente, «un
      escarabajo barrenador grande de caparazón duro, cara furiosa con cejas fruncidas y
      mandíbulas, aspecto amenazante». El nombre de cada carta y lo que hace, que están arriba,
      son la mejor guía para escribir esa línea.</p>

    <h3>Qué hacer cuando las tengas</h3>
    <ol>
      <li>Guarda cada imagen como <strong>PNG cuadrado con fondo transparente</strong>. 1024×1024
        sobra. Si tu herramienta no exporta transparencia, usa fondo blanco liso y quítalo después
        con remove.bg o Photopea, ambos gratis.</li>
      <li>Renómbrala con la clave que aparece bajo cada carta arriba: <code>c_cafe.png</code>,
        <code>p_resistente.png</code>, <code>f_madremonte.png</code>…</li>
      <li>En plagas y remedios puedes quedarte con el dibujo único o pintar uno por color
        (<code>p_comun_cafe.png</code>, <code>p_comun_cacao.png</code>…). Lee antes
        «El color manda» aquí abajo.</li>
      <li>Déjalas todas en la carpeta <code>public/cartas/</code> del proyecto.</li>
      <li>Corre el comando que arma la lista y vuelve a subir el proyecto:</li>
    </ol>
    <pre>npm run cartas
# imprime cuántas encontró y cuáles seguirán dibujadas en vector</pre>
    <p>El juego usa tus imágenes dentro del marco y sigue dibujando en vector las que falten, así
      que puedes reemplazar la baraja de a poco. No hay que tocar código en ningún momento.</p>

    <h3>El color manda: los dos niveles de detalle</h3>
    <p>En Cosecha el color no es adorno, es la regla. Un remedio de café solo cura una mata de
      café, una plaga de cacao solo entra en cacao, y la huerta es el comodín que sirve en
      cualquier dirección. Quien mira una carta tiene que saber de qué color es de un vistazo.</p>
    <p>El dibujo en vector resuelve eso solo: es una sola forma que el juego <strong>tiñe en
      vivo</strong> con el color de la carta, así que el mismo escarabajo sale rojo en la plaga
      de café y café oscuro en la de cacao. Una imagen pintada no se puede teñir. Si dejas un
      único <code>p_comun.png</code>, las cinco plagas comunes quedarán idénticas y el color
      solo vivirá en el marco y el rótulo.</p>
    <p>Por eso hay dos niveles, y los dos funcionan:</p>
    <ul>
      <li><strong>Baraja de ${totalDisenos} dibujos.</strong> Un solo dibujo para cada plaga y
        cada remedio. El marco de color, el rótulo y el borde siguen diciendo de qué color es.
        Se juega perfecto y es por donde conviene empezar.</li>
      <li><strong>Baraja fina de ${totalDisenos - Object.keys(porColor).length + nColores}
        dibujos.</strong> Un dibujo por color en plagas y remedios: la broca para el café, la
        sigatoka para el plátano, la monilia para el cacao… Son ${nColores} archivos en lugar de
        ${Object.keys(porColor).length}, y es lo que tendría una baraja impresa de verdad.</li>
    </ul>
    <p>No hay que elegir de entrada. El juego busca primero el archivo con color y, si no lo
      encuentra, usa el general. Así puedes tener <code>p_comun_cafe.png</code> pintado y que las
      otras cuatro plagas comunes sigan saliendo con <code>p_comun.png</code>, sin que se rompa
      nada. <code>npm run cartas</code> te dice en qué punto vas de cada nivel.</p>

    <div class="nota">Empieza por una carta de cada familia —un cultivo, una plaga, un remedio y
      una faena— y míralas dentro del juego antes de generar las ${totalDisenos}. Si esas cuatro
      funcionan juntas, el resto sale parejo. Si no, ajustas el bloque de estilo una sola vez.</div>

    <h3>Sobre la originalidad</h3>
    <p>Genera ilustraciones propias: no le pidas a la IA el estilo de ningún juego publicado ni le
      subas fotos de cartas ajenas como referencia. El arte propio es justo lo que te permitiría
      imprimir, vender o registrar esta baraja algún día sin depender de nadie.</p>
  </section>

  <footer>Generado desde el propio motor del juego, así que las cantidades y los textos son los
    que rigen en la mesa. Si cambias una regla en el código, vuelve a generar este catálogo.</footer>
</div>`;

fs.writeFileSync("catalogo-cosecha.html", html);
console.log("catalogo-cosecha.html ·", totalDisenos, "diseños ·", totalCartas, "cartas ·",
  Math.round(html.length/1024), "KB");
