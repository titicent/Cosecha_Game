/* Renderiza caras de carta sueltas, en grande y en PNG, tal como se ven en el
   juego: marco de color, cinta con el rótulo, costo en jornales, ilustración y
   sello del mazo. Sirven para subirlas a una IA de video como imagen de partida,
   o para una portada, un afiche o la tienda.

       npm run hero                      → una selección representativa
       npm run hero -- cafe mohan_cafe   → solo esas
       npm run hero -- todo              → las 29

   Siempre escribe hero/hoja.html, que se puede abrir y capturar a mano. Si
   playwright está instalado (npm i -D playwright), además exporta los PNG.

   Los nombres que entiende son las claves sin prefijo: cafe, platano, cacao,
   cana, huerta, vivero, injerto, comun, resistente, casero, bioinsumo, trueque,
   saqueo, propagacion, chaparron, lindero, jornalExtra, consejo, mallasombra,
   erradicacion, mohan_cafe, patasola, duende, llorona, madremonte, sombreron.
   A una plaga o un remedio se le puede pedir el color: comun:cacao
*/
const path = require("path");
const fs = require("fs");
const R = require("./public/reglas.js");
const A = require("./public/arte.js");

const salida = path.join(__dirname, "hero");
fs.mkdirSync(salida, { recursive: true });

/* ── Qué cartas ─────────────────────────────────────────────── */
const mazo = R.crearMazo(true, true);
const clave = c => A.claveCarta(c).replace(/^[cprf]_/, "");
const busca = (nombre, color) => mazo.find(c =>
  clave(c) === nombre && (!color || c.c === color));

const args = process.argv.slice(2).filter(a => a !== "todo");
const todas = process.argv.includes("todo");

let pedidas;
if (todas) {
  const vistos = new Set();
  pedidas = mazo.filter(c => { const k = A.claveCarta(c);
    if (vistos.has(k)) return false; vistos.add(k); return true; });
} else if (args.length) {
  pedidas = args.map(a => {
    const [n, col] = a.split(":");
    const c = busca(n, col);
    if (!c) console.warn("  no reconozco «" + a + "», la salto");
    return c;
  }).filter(Boolean);
} else {
  /* Una de cada familia, todas de café, para que el color se lea parejo */
  pedidas = [busca("cafe"), busca("comun","cafe"), busca("bioinsumo","cafe"),
             busca("mallasombra"), busca("mohan_cafe")].filter(Boolean);
}
if (!pedidas.length) { console.error("No quedó ninguna carta por renderizar."); process.exit(1); }

/* ── Arte propio, si lo hay ─────────────────────────────────── */
const dirArte = path.join(__dirname, "public", "cartas");
const propias = new Set(
  fs.existsSync(dirArte)
    ? fs.readdirSync(dirArte).filter(f => /\.png$/i.test(f)).map(f => f.replace(/\.png$/i, ""))
    : []
);
function obra(c, tono){
  const k = A.clavesCarta(c).find(x => propias.has(x));
  return k ? `<img src="../public/cartas/${k}.png" alt="">` : A.dibujo(c, tono);
}

/* ── Una carta ──────────────────────────────────────────────── */
const esc = s => String(s).replace(/[&<>"]/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));
function cara(c, id){
  const tono = R.colorCarta(c);
  const r = A.rotulos(c);
  const mz = R.mazoDe(c);
  return `<div class="carta" id="${id||""}" style="--tono:${tono};--sello:${R.MAZOS[mz].hex}">
    <div class="cinta">
      <span class="ins">${A.dibujo(c, "#FFFFFF", true)}</span>
      <span class="tit">${esc(r.titulo)} <b>/ ${esc(r.sub)}</b></span>
      <span class="costo">${R.cuesta(c)}</span>
    </div>
    <div class="obra">${obra(c, tono)}</div>
    <div class="texto">${esc(R.queHace(c))}</div>
    <div class="alpie"><span>${esc(r.titulo)} / ${esc(r.sub)}</span>
      <span class="sello">${A.sello(mz, "#FFFFFF")}</span></div>
  </div>`;
}
const dorso = id => `<div class="carta dorso" id="${id||""}">
  <div class="dorsoArte"><div class="dorsoMarca">COSECHA</div>
    <div class="dorsoSub">juego de finca</div></div></div>`;

/* Abanico de tres, como una mano sobre la mesa. Se eligen de colores
   distintos a propósito: el abanico es donde mejor se lee que el color
   del marco es lo que manda en el juego. */
const trio = (() => {
  const vistos = new Set(), r = [];
  for (const c of [...pedidas, ...mazo]) {
    const col = R.colorCarta(c);
    if (vistos.has(col)) continue;
    vistos.add(col); r.push(c);
    if (r.length === 3) break;
  }
  return r;
})();
const abanico = `<div class="abanico" id="abanico">
  ${trio.map((c,i) => `<div class="enAbanico" style="--g:${(i-1)*13}deg;--y:${Math.abs(i-1)*16}px">
    ${cara(c)}</div>`).join("")}</div>`;

const fichas = pedidas.map((c,i) => cara(c, "k" + i)).join("\n");

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Cosecha · caras de carta en grande</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:transparent;font-family:ui-sans-serif,system-ui,sans-serif;
    display:flex;flex-wrap:wrap;gap:40px;padding:40px;align-items:flex-start}
  .carta{width:630px;height:880px;background:#FBF8F1;border-radius:26px;
    display:flex;flex-direction:column;overflow:hidden;position:relative;
    box-shadow:inset 0 0 0 11px var(--tono), 0 24px 60px rgba(0,0,0,.35)}
  .cinta{display:flex;align-items:center;gap:12px;padding:16px 20px;min-width:0}
  .ins{width:46px;height:46px;flex:none;border-radius:50%;background:var(--tono);padding:7px}
  .ins svg{width:100%;height:100%;display:block}
  .tit{font-size:25px;font-weight:800;color:var(--tono);letter-spacing:.01em;line-height:1.25;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
  .tit b{font-weight:600;opacity:.8}
  .costo{flex:none;font-size:26px;font-weight:800;color:#fff;background:var(--tono);
    border-radius:40px;padding:3px 18px}
  .obra{flex:none;height:390px;padding:10px 46px 0}
  .obra svg,.obra img{width:100%;height:100%;display:block;object-fit:contain}
  .texto{flex:1;padding:20px 36px 10px;font-size:26px;line-height:1.4;color:#2A2114;
    display:flex;align-items:center}
  .alpie{font-size:21px;font-weight:800;color:var(--tono);opacity:.85;padding:0 34px 20px;
    display:flex;align-items:center;gap:14px;min-width:0}
  .alpie span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sello{flex:none;width:34px;height:34px;border-radius:50%;background:var(--sello);padding:5px;
    margin-left:auto}
  .sello svg{width:100%;height:100%;display:block}
  .dorso{box-shadow:inset 0 0 0 11px #4A6338, 0 24px 60px rgba(0,0,0,.35);background:#4A6338}
  .dorsoArte{flex:1;margin:26px;border:5px solid rgba(255,255,255,.4);border-radius:16px;
    background:repeating-linear-gradient(45deg,#4A6338 0 30px,#41592F 30px 60px);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
  .dorsoMarca{color:#F4EFE2;font-size:62px;font-weight:800;letter-spacing:.12em}
  .dorsoSub{color:#C9D8B5;font-size:26px;letter-spacing:.2em;text-transform:uppercase}
  .abanico{position:relative;width:1240px;height:1080px;display:flex;justify-content:center;
    align-items:flex-end;padding-bottom:60px}
  .enAbanico{position:absolute;bottom:60px;transform:rotate(var(--g)) translateY(var(--y));
    transform-origin:bottom center}
  .enAbanico:nth-child(1){margin-right:300px}
  .enAbanico:nth-child(3){margin-left:300px}
</style></head><body>
${fichas}
${dorso("dorso")}
${abanico}
</body></html>`;

fs.writeFileSync(path.join(salida, "hoja.html"), html);

/* ── PNG, si hay navegador ──────────────────────────────────── */
(async () => {
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) {
    console.log("\n  hero/hoja.html · " + pedidas.length + " cartas");
    console.log("  Ábrelo en el navegador y captura cada carta a mano.");
    console.log("  Para exportar los PNG solo: npm i -D playwright\n");
    return;
  }
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ deviceScaleFactor: 2 });
  await pagina.goto("file://" + path.join(salida, "hoja.html"));
  await pagina.waitForTimeout(400);

  const hechos = [];
  for (let i = 0; i < pedidas.length; i++) {
    const nombre = A.claveCarta(pedidas[i]) +
      (A.clavesCarta(pedidas[i]).length > 1 ? "_" + pedidas[i].c : "") + ".png";
    await pagina.locator("#k" + i).screenshot({ path: path.join(salida, nombre) });
    hechos.push(nombre);
  }
  await pagina.locator("#dorso").screenshot({ path: path.join(salida, "dorso.png") });
  hechos.push("dorso.png");
  await pagina.locator("#abanico").screenshot({
    path: path.join(salida, "abanico.png"), omitBackground: true });
  hechos.push("abanico.png");
  await navegador.close();

  console.log("\n  hero/ · " + hechos.length + " imágenes a 1260 × 1760 px");
  for (const h of hechos) console.log("    " + h);
  console.log("\n  Súbelas a la IA de video como imagen de partida: así la cara de la");
  console.log("  carta sale exacta en vez de inventada.");
  console.log(propias.size
    ? "  Usando tus " + propias.size + " ilustraciones de public/cartas/.\n"
    : "  Usando el dibujo en vector. Deja tus PNG en public/cartas/ para verlos aquí.\n");
})();
