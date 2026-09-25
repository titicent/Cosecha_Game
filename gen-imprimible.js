/* Genera un pliego imprimible con la baraja completa (print & play).
   Cartas de 63×88 mm, el tamaño estándar de naipe, nueve por hoja A4 con
   marcas de corte. Se abre en el navegador y se manda a imprimir desde ahí.
       npm run imprimible        → todas las cartas del mazo base + Bonanza
       npm run imprimible -- todo → añade también Espantos
*/
const R = require("./public/reglas.js");
const A = require("./public/arte.js");
const fs = require("fs");
const path = require("path");

/* Si hay ilustraciones propias en public/cartas/, el pliego las usa igual
   que el juego: primero la versión por color, si no la general. */
const dirArte = path.join(__dirname, "public", "cartas");
const propias = new Set(
  fs.existsSync(dirArte)
    ? fs.readdirSync(dirArte).filter(f => /\.png$/i.test(f)).map(f => f.replace(/\.png$/i, ""))
    : []
);
function obra(c, tono){
  const k = A.clavesCarta(c).find(x => propias.has(x));
  return k ? `<img src="public/cartas/${k}.png" alt="">` : A.dibujo(c, tono);
}

const conEspantos = process.argv.includes("todo");
const mazo = R.crearMazo(true, conEspantos);

/* una entrada por copia, para que el pliego traiga la baraja lista */
const cartas = mazo.slice();
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function cara(c){
  const tono = R.colorCarta(c);
  const r = A.rotulos(c);
  const costo = R.cuesta(c);
  const mz = R.mazoDe(c);
  return `<div class="carta" style="--tono:${tono};--sello:${R.MAZOS[mz].hex}">
    <div class="cinta">
      <span class="ins">${A.dibujo(c, "#FFFFFF", true)}</span>
      <span class="tit">${esc(r.titulo)} <b>/ ${esc(r.sub)}</b></span>
      <span class="costo">${costo}</span>
    </div>
    <div class="obra">${obra(c, tono)}</div>
    <div class="texto">${esc(R.queHace(c))}</div>
    <div class="alpie">${esc(r.titulo)} / ${esc(r.sub)}
      <span class="sello" title="Mazo ${R.MAZOS[mz].nombre}">${A.sello(mz, "#FFFFFF")}</span></div>
  </div>`;
}

const POR_HOJA = 9;
const hojas = [];
for (let i = 0; i < cartas.length; i += POR_HOJA) {
  const grupo = cartas.slice(i, i + POR_HOJA);
  hojas.push(`<section class="hoja">${grupo.map(cara).join("")}</section>`);
}
/* una hoja de reversos por cada hoja de caras, para imprimir a doble cara */
const reverso = `<div class="carta dorso">
  <div class="dorsoArte">
    <div class="dorsoMarca">COSECHA</div>
    <div class="dorsoSub">juego de finca</div>
  </div></div>`;
const hojasDorso = hojas.map((_, k) => {
  const n = Math.min(POR_HOJA, cartas.length - k*POR_HOJA);
  return `<section class="hoja dorsos">${reverso.repeat(n)}</section>`;
});

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Cosecha · pliego para imprimir</title>
<style>
  @page { size: A4; margin: 8mm; }
  *{box-sizing:border-box}
  body{margin:0;background:#E8E3D6;font-family:ui-sans-serif,system-ui,sans-serif;color:#1F2415}
  .aviso{max-width:190mm;margin:14px auto;padding:14px 18px;background:#FBF7EC;
    border:1px solid #D6CBB4;border-radius:4px;font-size:13.5px;line-height:1.6}
  .aviso h1{font-size:19px;margin:0 0 6px}
  .aviso ol{margin:8px 0 0;padding-left:20px}
  .hoja{width:194mm;min-height:281mm;margin:10px auto;background:#fff;
    display:grid;grid-template-columns:repeat(3,63mm);grid-auto-rows:88mm;
    justify-content:center;align-content:start;gap:0;padding:6mm 0}
  .carta{width:63mm;height:88mm;border:.2mm dashed #B9B2A0;background:#FBF8F1;
    display:flex;flex-direction:column;overflow:hidden;position:relative;
    box-shadow:inset 0 0 0 1.1mm var(--tono)}
  .cinta{display:flex;align-items:center;gap:1.2mm;padding:1.4mm 1.8mm;min-width:0}
  .ins{width:4.6mm;height:4.6mm;flex:none;border-radius:50%;background:var(--tono);padding:.6mm}
  .ins svg{width:100%;height:100%;display:block}
  .tit{font-size:2.5mm;font-weight:800;color:var(--tono);letter-spacing:.02em;line-height:1.3;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
  .tit b{font-weight:600;opacity:.8}
  .costo{flex:none;font-size:2.6mm;font-weight:800;color:#fff;background:var(--tono);
    border-radius:4mm;padding:.3mm 1.6mm}
  .obra{flex:none;height:38mm;padding:1mm 4mm 0}
  .obra svg,.obra img{width:100%;height:100%;display:block;object-fit:contain}
  .texto{flex:1;padding:1.5mm 3.2mm;font-size:2.55mm;line-height:1.38;color:#2A2114}
  .alpie{font-size:2.1mm;font-weight:800;color:var(--tono);opacity:.85;padding:0 3.2mm 1.6mm;
    display:flex;align-items:center;gap:1.4mm;min-width:0}
  .alpie span:first-child,.alpie{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sello{flex:none;width:3.4mm;height:3.4mm;border-radius:50%;background:var(--sello);padding:.5mm;
    margin-left:auto}
  .sello svg{width:100%;height:100%;display:block}
  .dorso{box-shadow:inset 0 0 0 1.1mm #4A6338;background:#4A6338}
  .dorsoArte{flex:1;margin:2.4mm;border:.5mm solid rgba(255,255,255,.4);border-radius:1.5mm;
    background:repeating-linear-gradient(45deg,#4A6338 0 3mm,#41592F 3mm 6mm);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm}
  .dorsoMarca{color:#F4EFE2;font-size:6mm;font-weight:800;letter-spacing:.12em}
  .dorsoSub{color:#C9D8B5;font-size:2.6mm;letter-spacing:.2em;text-transform:uppercase}
  @media print{
    body{background:#fff}
    .aviso{display:none}
    .hoja{margin:0;page-break-after:always;box-shadow:none}
  }
</style></head><body>
<div class="aviso">
  <h1>Cosecha · ${cartas.length} cartas para imprimir</h1>
  <p>Manda esta página a imprimir desde el navegador, en A4, <b>sin ajustar al papel</b>
    (escala 100% o «tamaño real»), para que las cartas queden de 63 × 88 mm, la medida de un
    naipe corriente.</p>
  <ol>
    <li>Imprime en papel de 200 g o más, o pega las hojas sobre cartulina.</li>
    <li>Las hojas verdes son los reversos: si tu impresora hace doble cara, imprímelas
      intercaladas; si no, imprímelas aparte y pégalas por detrás.</li>
    <li>Recorta por la línea punteada. Con una guillotina va rapidísimo.</li>
    <li>Si vas a jugar mucho, mételas en fundas de 63 × 88 mm y quedan como compradas.</li>
    <li>Cada carta lleva abajo a la derecha el <b>sello de su mazo</b>: grano verde para Cosecha,
      sol ámbar para Bonanza, luna morada para Espantos. Sirve para volver a separar las barajas
      cuando ya están mezcladas.</li>
  </ol>
  <p style="margin-bottom:0"><b>${conEspantos ? "Incluye Espantos." : "Mazo base y Bonanza."}
    </b> Para añadir los espantos del monte, corre <code>npm run imprimible -- todo</code>.</p>
</div>
${hojas.map((h,i)=>h + hojasDorso[i]).join("\n")}
</body></html>`;

const salida = conEspantos ? "cosecha-imprimible-completo.html" : "cosecha-imprimible.html";
fs.writeFileSync(salida, html);
console.log(salida + " · " + cartas.length + " cartas · " + hojas.length +
  " hojas de caras + " + hojas.length + " de reversos · " + Math.round(html.length/1024) + " KB");
