/* ═══════════════════════════════════════════════════════════════
   GUÍA — la primera partida, paso a paso, con la manito
   Sirve para todos los juegos. Cada juego le pasa su lista de pasos:

     { objetivo: () => elemento,   lo que se señala (se ilumina; el resto se oscurece)
       texto: "Toca tu café",      etiqueta corta, lo que diría la voz
       hecho: () => true/false,    cuándo se cumplió el paso (se revisa todo el tiempo)
       ms: 2600,                   paso de «mirar»: sigue solo a los ms, o con un toque
       esperar: true }             paso de espera (juega el vecino): no oscurece ni deja tocar

   En un paso de acción solo se puede tocar lo señalado. La guía no sabe
   nada de cada juego: mira la pantalla y espera a que el juego cambie.
   Se recuerda qué guías ya se hicieron (cosecha.guias), y eso viaja con
   la cuenta si la persona entró con Google.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";
const CLAVE = "cosecha.guias";
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
const hecha = j => !!leer()[j];
function marcar(j) { const o = leer(); o[j] = 1; try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) {} }

const ESTILO = `
.guia-velo{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
.guia-foco{position:fixed;left:0;top:0;width:0;height:0;border-radius:14px;border:3px solid #E0B04A;
  box-shadow:0 0 0 200vmax rgba(4,9,3,.66);transition:left .35s cubic-bezier(.3,.7,.3,1),top .35s cubic-bezier(.3,.7,.3,1),width .35s,height .35s,opacity .25s;opacity:0}
.guia-foco.on{opacity:1;animation:guiaLate 1.4s ease-in-out infinite}
.guia-foco.suave{box-shadow:none}
@keyframes guiaLate{50%{border-color:#FFE7A3;box-shadow:0 0 0 200vmax rgba(4,9,3,.66),0 0 18px 4px rgba(255,214,110,.55)}}
.guia-foco.suave.on{animation:none}
.guia-mano{position:fixed;left:0;top:0;width:54px;height:64px;opacity:0;transition:left .35s cubic-bezier(.3,.7,.3,1),top .35s cubic-bezier(.3,.7,.3,1),opacity .2s;filter:drop-shadow(0 4px 4px rgba(0,0,0,.45))}
.guia-mano.on{opacity:1}
.guia-mano svg{display:block;transform-origin:33% 4%;animation:guiaToca 1.1s ease-in-out infinite}
@keyframes guiaToca{0%,100%{transform:translateY(8px)}45%{transform:translateY(0)}55%{transform:translateY(0) scale(.88)}}
.guia-globo{position:fixed;left:0;top:0;max-width:min(320px,calc(100vw - 24px));background:#FFF8E6;color:#2A1E0E;border-radius:16px;
  padding:9px 14px;font:600 17px/1.25 "Fredoka",ui-rounded,system-ui,sans-serif;box-shadow:0 8px 20px rgba(0,0,0,.4);opacity:0;
  transition:opacity .2s,transform .2s;transform:scale(.9);text-align:center}
.guia-globo.on{opacity:1;transform:none}
.guia-globo small{display:block;font-weight:500;font-size:12.5px;color:#7A6A4A;margin-top:3px}
.guia-saltar{position:fixed;right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));pointer-events:auto;
  font:500 13px "Fredoka",ui-rounded,system-ui,sans-serif;background:rgba(20,30,14,.85);color:#F6ECD4;border:1.5px solid rgba(224,176,74,.5);
  border-radius:20px;padding:6px 12px;cursor:pointer}
.guia-fin{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(4,9,3,.7)}
.guia-fin .caja{width:min(100%,380px);background:linear-gradient(#2E4620,#1B2913);border:2px solid #E0B04A;border-radius:22px;padding:20px 18px;
  text-align:center;color:#F6ECD4;font-family:"Fredoka",ui-rounded,system-ui,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.5);animation:guiaSale .45s cubic-bezier(.3,.7,.3,1.3)}
@keyframes guiaSale{from{transform:scale(.6);opacity:0}}
.guia-fin b{display:block;font-weight:600;font-size:28px;color:#E0B04A}
.guia-fin p{margin:8px 0 16px;font-size:16px;line-height:1.4}
.guia-fin .bts{display:flex;flex-direction:column;gap:8px}
.guia-fin button{font:600 18px "Fredoka",ui-rounded,system-ui,sans-serif;border-radius:30px;padding:10px 16px;cursor:pointer;border:1.5px solid #E0B04A;background:linear-gradient(#3A4A2C,#1F2B17);color:#F6ECD4}
.guia-fin button.primario{background:linear-gradient(#8CC152,#4E8A2A);border-color:#B6E07D;color:#10200A}
.guia-confeti{position:fixed;top:-20px;width:8px;height:12px;border-radius:2px;z-index:2147483002;pointer-events:none;animation:guiaCae linear forwards}
@keyframes guiaCae{to{transform:translate(var(--dx),110vh) rotate(var(--r))}}
@media (prefers-reduced-motion:reduce){.guia-mano svg,.guia-foco.on{animation:none}}`;
const MANO = `<svg width="54" height="64" viewBox="0 0 54 64" aria-hidden="true"><path d="M14 30V8a5 5 0 0 1 10 0v16l2-1a5 5 0 0 1 7 2l1 1a5 5 0 0 1 7 2l1 1a5 5 0 0 1 7 3v14c0 9-7 16-16 16h-4c-6 0-10-3-13-8L6 42a5 5 0 0 1 8-6z" fill="#FFE1BE" stroke="#5A3A1E" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 26v8M33 28v7M41 31v6" stroke="#5A3A1E" stroke-width="2" stroke-linecap="round"/></svg>`;

let A = null;          /* la guía activa */
function ponerEstilo() {
  if (document.getElementById("guia-estilo")) return;
  const s = document.createElement("style"); s.id = "guia-estilo"; s.textContent = ESTILO; document.head.appendChild(s);
}
const visible = el => { if (!el || !el.isConnected) return null; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? r : null; };

function iniciar(pasos, opc) {
  detener();
  ponerEstilo();
  opc = opc || {};
  const velo = document.createElement("div"); velo.className = "guia-velo";
  velo.innerHTML = `<div class="guia-foco"></div><div class="guia-mano">${MANO}</div><div class="guia-globo" role="status" aria-live="polite"></div>
    ${opc.saltar === false ? "" : `<button class="guia-saltar" type="button">Saltar guía</button>`}`;
  document.body.appendChild(velo);
  A = { pasos, i: -1, opc, velo, foco: velo.querySelector(".guia-foco"), mano: velo.querySelector(".guia-mano"), globo: velo.querySelector(".guia-globo"),
    desde: 0, enfocado: null, texto: null };
  const s = velo.querySelector(".guia-saltar");
  if (s) s.onclick = ev => { ev.stopPropagation(); const f = A.opc.alSaltar; detener(); f && f(); };
  document.addEventListener("click", filtro, true);
  document.addEventListener("pointerdown", filtroToque, true);
  A.reloj = setInterval(paso, 120);
  siguiente();
}
function detener() {
  if (!A) return;
  clearInterval(A.reloj);
  document.removeEventListener("click", filtro, true);
  document.removeEventListener("pointerdown", filtroToque, true);
  A.velo.remove();
  A = null;
}
function siguiente() {
  A.i++; A.desde = Date.now(); A.enfocado = null; A.texto = null;
  A.globo.classList.remove("on");
  const p = A.pasos[A.i];
  if (!p) { const f = A.opc.alTerminar; detener(); f && f(); return; }
  if (p.alEmpezar) try { p.alEmpezar(); } catch (e) {}
  paso();
}
/* Cada 120 ms: ¿ya se cumplió el paso? Si no, se acomodan foco, manito y etiqueta
   sobre el elemento (la pantalla del juego se vuelve a pintar a cada rato). */
function paso() {
  if (!A) return;
  const p = A.pasos[A.i]; if (!p) return;
  let ok = false; try { ok = p.hecho ? !!p.hecho() : false; } catch (e) {}
  if (ok || (p.ms && !p.hecho && Date.now() - A.desde >= p.ms)) return siguiente();
  let el = null; try { el = p.objetivo ? p.objetivo() : null; } catch (e) {}
  const r = visible(el);
  const accion = !p.ms && !p.esperar;
  if (r && el !== A.enfocado) {
    A.enfocado = el;
    if (r.top < 0 || r.bottom > innerHeight) { el.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }
  /* Foco */
  if (r) {
    const pad = p.pad != null ? p.pad : 6;
    Object.assign(A.foco.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
    A.foco.classList.add("on"); A.foco.classList.toggle("suave", !!p.esperar);
  } else A.foco.classList.remove("on");
  /* Manito: solo en los pasos donde hay que tocar */
  if (r && accion) {
    const x = r.left + r.width / 2, y = r.top + Math.min(r.height * .62, r.height - 8);
    Object.assign(A.mano.style, { left: x - 18 + "px", top: y - 2 + "px" });
    A.mano.classList.add("on");
  } else A.mano.classList.remove("on");
  /* Etiqueta */
  const texto = p.texto ? p.texto + (p.ms && !p.hecho ? `<small>Toca para seguir</small>` : "") : "";
  if (texto !== A.texto) { A.texto = texto; A.globo.innerHTML = texto; A.globo.classList.toggle("on", !!texto); }
  if (texto) {
    const g = A.globo, gw = g.offsetWidth, gh = g.offsetHeight;
    let x, y;
    if (r) {
      x = r.left + r.width / 2 - gw / 2;
      const arriba = r.top - gh - 14, abajo = r.bottom + (accion ? 66 : 14);
      y = (p.lado === "abajo" || arriba < 8) && abajo + gh < innerHeight - 8 ? abajo : Math.max(8, arriba);
    } else { x = innerWidth / 2 - gw / 2; y = innerHeight * .4; }
    x = Math.max(12, Math.min(innerWidth - gw - 12, x));
    Object.assign(g.style, { left: x + "px", top: y + "px" });
  }
}
/* Solo pasa el toque que cae dentro de lo señalado. En los pasos de «mirar»
   cualquier toque adelanta; en los de esperar no se puede tocar nada. */
function permitido(ev) {
  if (!A) return true;
  if (ev.target.closest && ev.target.closest(".guia-saltar,.guia-fin")) return true;
  const p = A.pasos[A.i]; if (!p) return true;
  if (p.esperar) return false;
  if (p.ms) return false;
  const el = A.enfocado;
  return !!(el && el.isConnected && el.contains(ev.target));
}
function filtro(ev) {
  if (permitido(ev)) return;
  ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
  const p = A && A.pasos[A.i];
  if (p && p.ms && !p.hecho && Date.now() - A.desde > 500) siguiente();
}
function filtroToque(ev) { if (!permitido(ev)) { ev.preventDefault(); ev.stopPropagation(); } }

/* Ventana del final, con confeti. */
function final({ titulo, texto, botones }) {
  ponerEstilo();
  const v = document.createElement("div"); v.className = "guia-fin";
  v.innerHTML = `<div class="caja" role="dialog" aria-label="${titulo}"><b>${titulo}</b><p>${texto}</p><div class="bts">${botones.map((b, k) =>
    `<button type="button" data-k="${k}" class="${b.primario ? "primario" : ""}">${b.texto}</button>`).join("")}</div></div>`;
  v.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { v.remove(); const f = botones[+b.dataset.k].fn; f && f(); });
  document.body.appendChild(v);
  const cs = ["#E0B04A", "#C0392B", "#4A8B3B", "#2C7DA0", "#F6ECD4"];
  for (let k = 0; k < 36; k++) {
    const c = document.createElement("i"); c.className = "guia-confeti";
    c.style.cssText = `left:${Math.random() * 100}vw;background:${cs[k % 5]};--dx:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720}deg;animation-duration:${2.2 + Math.random() * 1.6}s;animation-delay:${Math.random() * .6}s`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 4600);
  }
  return v;
}

raiz.GUIA = { iniciar, detener, final, hecha, marcar, get activa() { return !!A; } };
})(typeof self !== "undefined" ? self : globalThis);
