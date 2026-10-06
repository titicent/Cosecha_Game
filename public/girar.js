/* ═══════════════════════════════════════════════════════════════
   GIRAR — en el teléfono, todo Cosecha se juega acostado
   Lo cargan todas las páginas del ecosistema (menú, mesas, La Vereda).

   La web no puede obligar a girar la pantalla: solo Android lo permite y
   únicamente en pantalla completa. Así que se hacen dos cosas:
     1. Si el teléfono está derecho, una cortina tapa la página y pide
        girarlo. Con un botón se pasa a pantalla completa y, donde se pueda,
        se bloquea en horizontal (Android). En iPhone basta con girarlo.
     2. Acostado, nada cambia: la página se ve normal.
   En computador y en tableta no hace nada: allí cabe todo de cualquier forma.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const toque = matchMedia("(pointer:coarse)").matches;
  const lado = Math.min(screen.width, screen.height);
  if (!toque || lado > 540) return;                       /* computador o tableta */
  document.documentElement.classList.add("es-telefono");

  const css = `
#girar{display:none}
@media (orientation:portrait){
  html.es-telefono #girar{display:flex;position:fixed;inset:0;z-index:2147483000;flex-direction:column;align-items:center;justify-content:center;gap:18px;
    padding:24px;text-align:center;background:radial-gradient(circle at 50% 35%,#35512C,#16220F 75%);color:#F4EFE2;font-family:"Fredoka",ui-rounded,system-ui,sans-serif}
  html.es-telefono body{overflow:hidden}
}
#girar .tel{width:84px;height:140px;border:5px solid #E0B04A;border-radius:16px;position:relative;animation:girarTel 2.4s ease-in-out infinite}
#girar .tel::after{content:"";position:absolute;left:50%;bottom:7px;width:18px;height:4px;margin-left:-9px;border-radius:2px;background:#E0B04A}
#girar .tel i{position:absolute;inset:14px 8px 20px;border-radius:6px;background:radial-gradient(circle at 50% 45%,#C0392B 0 18%,transparent 19%),#F4EFE2}
@keyframes girarTel{0%,20%{transform:rotate(0)}55%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
#girar h2{margin:0;font-size:26px;font-weight:600}
#girar p{margin:0;max-width:300px;font-size:16px;line-height:1.4;color:#D9D2BC}
#girar button{border:2px solid #E0B04A;background:rgba(224,176,74,.18);color:#F4EFE2;font:inherit;font-size:17px;font-weight:600;padding:12px 22px;border-radius:999px}
@media (prefers-reduced-motion:reduce){#girar .tel{animation:none;transform:rotate(-90deg)}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const puedeCompleta = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  const pon = () => {
    if (document.getElementById("girar")) return;
    const d = document.createElement("div"); d.id = "girar"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Gira tu teléfono");
    d.innerHTML = `<div class="tel" aria-hidden="true"><i></i></div><h2>Gira tu teléfono</h2>
      <p>Cosecha se juega con el teléfono acostado: así caben la mesa, tu finca y tu mano.</p>
      ${puedeCompleta ? `<button type="button">Jugar en pantalla completa</button>` : ""}`;
    const b = d.querySelector("button");
    if (b) b.onclick = () => window.COSECHA_GIRAR();
    document.body.appendChild(d);
  };
  /* Pantalla completa + bloqueo en horizontal. Solo funciona tras un toque
     de la persona; si el navegador no lo permite (iPhone), no pasa nada. */
  window.COSECHA_GIRAR = async function () {
    const el = document.documentElement;
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      }
    } catch (e) {}
    try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape"); } catch (e) {}
  };
  if (document.body) pon(); else document.addEventListener("DOMContentLoaded", pon);
})();
