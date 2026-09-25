/* ═══════════════════════════════════════════════════════════════
   COSECHA — arte
   Ilustraciones propias dibujadas en SVG: nada de archivos externos
   y nada de arte ajeno. Todo escala sin pixelarse y viaja en pocos KB.
   Cada dibujo recibe en vivo volumen, contorno de tinta y una escena
   de fondo según la familia de la carta.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

const svg = (cuerpo, extra) =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" ${extra||""}>${cuerpo}</svg>`;

const hoja = (x,y,r,c) =>
  `<path d="M${x} ${y}c-5-1-8-5-8-9 4-1 9 1 11 4 1 2 0 4-3 5Z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`;

/* ── Cultivos ───────────────────────────────────────────────── */
const cafe = c => `
  <path d="M24 42V20" stroke="#6B4B2A" stroke-width="3.4" stroke-linecap="round"/>
  ${hoja(22,26,-18,"#3E7D3A")}${hoja(26,30,160,"#4C8F45")}
  <circle cx="17" cy="16" r="6.2" fill="${c}"/><circle cx="30" cy="14" r="6.2" fill="${c}"/>
  <circle cx="24" cy="25" r="6" fill="${c}"/>
  <path d="M17 11.2v9.6M30 9.2v9.6M24 20.2v9.6" stroke="rgba(90,20,15,.45)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="14.6" cy="13.6" r="1.8" fill="rgba(255,255,255,.55)"/>`;
const platano = c => `
  <path d="M10 11c8-2 14 1 17 6" fill="none" stroke="#4C8F45" stroke-width="4.6" stroke-linecap="round"/>
  <path d="M38 11c-8-2-14 1-17 6" fill="none" stroke="#3E7D3A" stroke-width="4.6" stroke-linecap="round"/>
  <path d="M24 16v4" stroke="#6E6031" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M14 22c0-1.6 1.4-2.8 3-2.4 1.6.4 2.4 2 3.6 6.4 1.2 4.4 1 8-.6 9.6-1.6 1.6-3.6.4-5-3.6S14 24.6 14 22Z" fill="${c}"/>
  <path d="M20 21c.2-1.8 1.8-2.8 3.4-2.4 1.8.4 2.6 2.2 3 7 .4 4.8-.2 8.4-2 9.6-1.8 1.2-3.6-.4-4.4-4.6S19.8 23.4 20 21Z" fill="${c}"/>
  <path d="M26.6 21.4c.6-1.8 2.2-2.6 3.8-1.8 1.6.8 2 2.6 1.6 7.2-.4 4.6-1.6 8-3.4 8.8-1.8.8-3.2-1-3.4-5.2s.8-7.2 1.4-9Z" fill="${c}"/>
  <path d="M16.5 24c.8 4 1.6 7 2.4 9M22.5 23.4c.4 4.4.4 7.6.2 9.8M29 23.6c0 4.4-.6 7.6-1.4 9.6"
    stroke="rgba(80,66,12,.4)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M15.4 22.6c-.3 1.5-.2 3 .1 4.4" stroke="rgba(255,255,255,.6)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
const cacao = c => `
  <path d="M30 40c-6-2-9-8-9-14" stroke="#5A4A2A" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${hoja(32,32,30,"#3E7D3A")}
  <path d="M24 5c6 0 10 7 10 16s-4 17-10 17-10-8-10-17S18 5 24 5Z" fill="${c}"/>
  <path d="M19 12c-1 6-1 14 0 22M24 9c-.6 7-.6 21 0 28M29 12c1 6 1 16 0 22"
    stroke="rgba(40,20,5,.4)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M17.5 12c-1.4 2.4-2 5-2.2 7.6" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const cana = c => `
  <path d="M14 43V13M24 43V8M34 43V13" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
  <path d="M14 36h0M14 29h0M14 22h0M24 34h0M24 27h0M24 20h0M24 13h0M34 36h0M34 29h0M34 22h0"
    stroke="rgba(90,70,10,.45)" stroke-width="5.6" stroke-linecap="round"/>
  <path d="M24 9c-4-3-7-3-10-1 3 3 6 4 10 1ZM24 9c4-3 7-3 10-1-3 3-6 4-10 1Z" fill="#4C8F45"/>
  <path d="M12.6 16v22" stroke="rgba(255,255,255,.35)" stroke-width="1.6" stroke-linecap="round"/>`;
const huerta = () => `
  <path d="M24 24 24 6a18 18 0 0 1 18 18Z" fill="#C0392B"/>
  <path d="M24 24h18a18 18 0 0 1-18 18Z" fill="#4A8B3B"/>
  <path d="M24 24v18A18 18 0 0 1 6 24Z" fill="#7B4B2A"/>
  <path d="M24 24H6A18 18 0 0 1 24 6Z" fill="#C9A227"/>
  <circle cx="24" cy="24" r="5" fill="#FBFAF7"/>`;
const vivero = c => `
  <path d="M7 40V20L24 7l17 13v20Z" fill="${c}"/>
  <path d="M7 20 24 7l17 13" fill="none" stroke="#FBFAF7" stroke-width="2.2" stroke-linejoin="round" opacity=".7"/>
  <path d="M24 9v31M14 17v23M34 17v23" stroke="#FBFAF7" stroke-width="1.6" opacity=".45"/>
  <path d="M24 36v-7" stroke="#2F6B2A" stroke-width="2.6" stroke-linecap="round"/>
  ${hoja(22,30,-20,"#4C8F45")}${hoja(26,32,160,"#3E7D3A")}`;
const injerto = c => `
  <path d="M24 43V22" stroke="#6B4B2A" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M24 30c-6 0-10-3-11-7 4-2 9-1 11 3 2-4 7-5 11-3-1 4-5 7-11 7Z" fill="${c}"/>
  <path d="M24 20c-4-1-6-4-5-7 3-1 6 1 7 3 1-2 4-4 7-3 1 3-1 6-5 7" fill="${c}" opacity=".85"/>
  <path d="M17 36c-3 1-5 3-5 6M31 36c3 1 5 3 5 6" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="21" cy="25.5" r="1.9" fill="#FBFAF7"/><circle cx="27" cy="25.5" r="1.9" fill="#FBFAF7"/>
  <circle cx="21.3" cy="25.8" r="1" fill="#3A2408"/><circle cx="27.3" cy="25.8" r="1" fill="#3A2408"/>
  <path d="M21.5 29.4c1.6 1.2 3.4 1.2 5 0" fill="none" stroke="#3A2408" stroke-width="1.5" stroke-linecap="round"/>`;

/* ── Plagas ─────────────────────────────────────────────────── */
function patas(cx,cy,c,n,largo){
  let s="";
  for(let i=0;i<n;i++){
    const a=Math.PI*2*i/n+0.35;
    const x1=cx+Math.cos(a)*8, y1=cy+Math.sin(a)*8;
    const x2=cx+Math.cos(a)*(8+largo), y2=cy+Math.sin(a)*(8+largo);
    s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  return s;
}
const plagaComun = c => `
  ${patas(24,25,c,8,6)}
  <ellipse cx="24" cy="26" rx="10" ry="11.5" fill="${c}"/>
  <path d="M24 16v21" stroke="rgba(0,0,0,.35)" stroke-width="1.8"/>
  <ellipse cx="24" cy="15" rx="6.6" ry="5.4" fill="${c}"/>
  <path d="M20 10.5l-3-4M28 10.5l3-4" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="21" cy="14.5" rx="2" ry="2.4" fill="#FBFAF7"/><ellipse cx="27" cy="14.5" rx="2" ry="2.4" fill="#FBFAF7"/>
  <circle cx="21.4" cy="15" r="1.1" fill="#3A1A10"/><circle cx="27.4" cy="15" r="1.1" fill="#3A1A10"/>
  <path d="M17.5 11l3.4 1.6M30.5 11l-3.4 1.6" stroke="#3A1A10" stroke-width="1.5" stroke-linecap="round"/>`;
const plagaResistente = c => `
  ${patas(24,25,c,10,7)}
  <ellipse cx="24" cy="26" rx="11.5" ry="12.5" fill="${c}"/>
  <ellipse cx="24" cy="26" rx="11.5" ry="12.5" fill="none" stroke="#2A1408" stroke-width="1.6" opacity=".5"/>
  <path d="M24 15v22M17 21c2.4 1 5 1 7 0M31 21c-2.4 1-5 1-7 0" stroke="rgba(0,0,0,.35)" stroke-width="1.8" fill="none"/>
  <ellipse cx="24" cy="14" rx="7.2" ry="5.8" fill="${c}"/>
  <path d="M19.5 9.5l-4-4.5M28.5 9.5l4-4.5" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>
  <ellipse cx="20.6" cy="13.6" rx="2.2" ry="2.6" fill="#FBFAF7"/><ellipse cx="27.4" cy="13.6" rx="2.2" ry="2.6" fill="#FBFAF7"/>
  <circle cx="21" cy="14.2" r="1.2" fill="#8C1D12"/><circle cx="27.8" cy="14.2" r="1.2" fill="#8C1D12"/>
  <path d="M16.6 9.6l4 2M31.4 9.6l-4 2" stroke="#2A1408" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M20 18.6c1.4 1.4 2.6 1.4 4 0 1.4 1.4 2.6 1.4 4 0" fill="none" stroke="#2A1408" stroke-width="1.5" stroke-linecap="round"/>`;

/* ── Remedios ───────────────────────────────────────────────── */
const remedioCasero = c => `
  <rect x="19" y="5" width="10" height="6" rx="1.6" fill="${c}"/>
  <path d="M18 11h12v3.6c3.6 1.5 6 5 6 9.1V38c0 2.2-1.8 4-4 4H16c-2.2 0-4-1.8-4-4V23.7c0-4.1 2.4-7.6 6-9.1Z" fill="${c}"/>
  <rect x="15" y="21" width="18" height="15" rx="2.5" fill="#FBFAF7"/>
  <path d="M24 24c3 3.4 4.6 6 4.6 8A4.6 4.6 0 0 1 24 36.6 4.6 4.6 0 0 1 19.4 32c0-2 1.6-4.6 4.6-8Z" fill="${c}"/>
  <path d="M15.5 17.5c-.9 1.1-1.4 2.4-1.6 3.6" stroke="rgba(255,255,255,.7)" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
const bioinsumo = c => `
  <path d="M19 6h10v10l7.8 15.6c1.5 3-.7 6.4-4 6.4H15.2c-3.3 0-5.5-3.4-4-6.4L19 16Z"
    fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M14.6 25h18.8l3.2 6.6c1 2.2-.5 4.4-2.8 4.4H14.2c-2.3 0-3.8-2.2-2.8-4.4Z" fill="${c}"/>
  <path d="M17 6h14" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  ${hoja(24,20,-30,"#4C8F45")}
  <circle cx="20" cy="31" r="2.2" fill="#FBFAF7"/><circle cx="27" cy="32.5" r="1.6" fill="#FBFAF7"/>`;

/* ── Faenas ─────────────────────────────────────────────────── */
const F = "#3F6B4A";
const manita = (x,y,c,vuelta) => `<g transform="translate(${x} ${y}) scale(${vuelta?-1:1} 1)">
  <rect x="0" y="6" width="12" height="12" rx="4" fill="${c}"/>
  <rect x="10" y="6.6" width="7" height="2.5" rx="1.25" fill="${c}"/><rect x="10" y="9.6" width="8" height="2.5" rx="1.25" fill="${c}"/>
  <rect x="10" y="12.6" width="7.5" height="2.5" rx="1.25" fill="${c}"/><rect x="10" y="15.5" width="6" height="2.5" rx="1.25" fill="${c}"/>
  <rect x="4" y="0" width="2.8" height="8" rx="1.4" fill="${c}"/></g>`;
const matica = (x,y,c) => `<g transform="translate(${x} ${y})">
  <path d="M0 8V2" stroke="#6B4B2A" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M0 3c-3-1-5-3-5-6 3-.6 6 1 6.4 3 .4-2 3.4-3.6 6.4-3 0 3-2 5-5 6" fill="${c}"/></g>`;

const trueque = () => `
  ${manita(3,24,"#C0392B",false)} ${manita(45,10,"#4A8B3B",true)}
  ${matica(24,26,"#C0392B")}
  <path d="M13 12c3-3 8-3 12-1" fill="none" stroke="${F}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 2.5"/>
  <path d="M24 9l2.6 2-2.2 2.2" fill="none" stroke="${F}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M35 38c-3 3-8 3-12 1" fill="none" stroke="${F}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 2.5"/>
  <path d="M24 40l-2.6-2 2.2-2.2" fill="none" stroke="${F}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
const saqueo = () => `
  ${matica(30,14,"#C0392B")}
  <path d="M19 23 13 29" stroke="${F}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-dasharray="3 3"/>
  ${manita(5,24,F,false)}
  <path d="M38 8c2 1.4 3 3 3.4 5" fill="none" stroke="${F}" stroke-width="2.2" stroke-linecap="round"/>`;
const propagacion = () => {
  let r = `<ellipse cx="24" cy="24" rx="6" ry="7" fill="${F}"/><ellipse cx="24" cy="17" rx="4" ry="3.2" fill="${F}"/>`;
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4;
    const x=24+Math.cos(a)*16, y=24+Math.sin(a)*16;
    r += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="4.2" fill="${F}" opacity=".75"/>
      <line x1="${(24+Math.cos(a)*9).toFixed(1)}" y1="${(24+Math.sin(a)*9).toFixed(1)}"
        x2="${(24+Math.cos(a)*12.5).toFixed(1)}" y2="${(24+Math.sin(a)*12.5).toFixed(1)}"
        stroke="${F}" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 2.4"/>`; }
  return r;
};
const chaparron = () => `
  <path d="M10 22c-3.4 0-6-2.6-6-5.8 0-3 2.4-5.6 5.4-5.8C10.6 6 14.4 3 19 3c5 0 9 3.6 9.7 8.4 4 .3 7.3 3.4 7.3 7.3 0 4-3.4 7.3-7.6 7.3H10Z"
    fill="${F}"/>
  <path d="M13 30l-3 8M21 30l-3 8M29 30l-3 8M37 30l-3 8" stroke="${F}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
const lindero = () => `
  <rect x="3" y="14" width="17" height="20" rx="3" fill="${F}"/>
  <rect x="28" y="14" width="17" height="20" rx="3" fill="${F}" opacity=".55"/>
  <path d="M24 8v34" stroke="${F}" stroke-width="2.2" stroke-dasharray="4 3"/>
  <path d="M8 22h7M8 27h7M33 22h7M33 27h7" stroke="#FBFAF7" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>
  <path d="M19 10c4-3 6-3 10 0" fill="none" stroke="${F}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M27 6.5l3 3.4-3.4 2.6" fill="none" stroke="${F}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M29 40c-4 3-6 3-10 0" fill="none" stroke="${F}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M21 43.5l-3-3.4 3.4-2.6" fill="none" stroke="${F}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
const jornalExtra = () => `
  <circle cx="20" cy="22" r="13" fill="none" stroke="${F}" stroke-width="3.4"/>
  <path d="M20 13v9l6 4" stroke="${F}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M37 28v11M31.5 33.5h11" stroke="${F}" stroke-width="3.6" stroke-linecap="round"/>`;
const consejo = () => `
  <path d="M6 20c0-2 3-4 8-4h20c5 0 8 2 8 4 0 1.6-2.6 3-8 3H14c-5.4 0-8-1.4-8-3Z" fill="${F}"/>
  <path d="M14 17c0-5 4-9 10-9s10 4 10 9" fill="${F}"/>
  <path d="M14 17h20" stroke="#FBFAF7" stroke-width="1.8" opacity=".5"/>
  <rect x="9" y="27" width="13" height="16" rx="2.6" fill="${F}" transform="rotate(-8 15 35)"/>
  <rect x="26" y="27" width="13" height="16" rx="2.6" fill="${F}" opacity=".55" transform="rotate(8 33 35)"/>`;
const mallasombra = () => {
  let r = `<path d="M5 12h38" stroke="${F}" stroke-width="3" stroke-linecap="round"/>
    <path d="M7 12v28M41 12v28" stroke="${F}" stroke-width="3" stroke-linecap="round"/>`;
  for(let i=0;i<7;i++){ const x=8+i*5.3;
    r += `<line x1="${x}" y1="13" x2="${x}" y2="25" stroke="${F}" stroke-width="1.4" opacity=".6"/>`; }
  for(let i=0;i<3;i++){ const y=16+i*4;
    r += `<line x1="8" y1="${y}" x2="40" y2="${y}" stroke="${F}" stroke-width="1.4" opacity=".6"/>`; }
  r += matica(24,40,"#4A8B3B");
  return r;
};
const erradicacion = () => `
  <path d="M13 17h22v20a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5Z" fill="none" stroke="${F}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M10 17h28" stroke="${F}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M18 17V9h12v8" fill="none" stroke="${F}" stroke-width="3.2" stroke-linejoin="round"/>
  <ellipse cx="24" cy="30" rx="5.4" ry="6.4" fill="${F}"/>
  ${patas(24,30,F,6,3.2)}`;

/* ── Espantos ───────────────────────────────────────────────── */
const E = "#6B4FA8";
const mohan = c => `
  <path d="M24 12c-7 0-12 5-12 12 0 7 5 12 12 12s12-5 12-12c0-7-5-12-12-12Z" fill="${E}"/>
  <path d="M10 16c4-6 24-6 28 0-2-2.6-5-4-8-4.6C28 8 20 8 18 11.4c-3 .6-6 2-8 4.6Z" fill="${E}"/>
  <path d="M8 15h32" stroke="${E}" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="20" cy="23" r="2.4" fill="#F2D24A"/><circle cx="28" cy="23" r="2.4" fill="#F2D24A"/>
  <path d="M19 30c3 2.4 7 2.4 10 0" fill="none" stroke="#2A1840" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 40c5-3 10-3 15 0 5 3 10 3 15-3" fill="none" stroke="${E}" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>
  ${matica(38,34,c||"#C0392B")}`;
const patasola = () => `
  <circle cx="24" cy="12" r="7" fill="${E}"/>
  <path d="M12 12c2-7 8-9 12-9s10 2 12 9c-4-3-8-4-12-4s-8 1-12 4Z" fill="${E}"/>
  <path d="M16 22c0-3.4 3.6-6 8-6s8 2.6 8 6v6H16Z" fill="${E}"/>
  <path d="M24 28v14" stroke="${E}" stroke-width="5" stroke-linecap="round"/>
  <path d="M19 42h10" stroke="${E}" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="21" cy="11.5" r="1.8" fill="#F2D24A"/><circle cx="27" cy="11.5" r="1.8" fill="#F2D24A"/>
  <path d="M33 30c3 2 4 5 3 8" fill="none" stroke="${E}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
const duende = () => `
  <path d="M24 6c-1 5-6 8-11 9 3 1 5 3 5 6h12c0-3 2-5 5-6-5-1-10-4-11-9Z" fill="${E}"/>
  <path d="M16 21h16v10c0 4.4-3.6 8-8 8s-8-3.6-8-8Z" fill="${E}"/>
  <circle cx="20" cy="27" r="2.2" fill="#FBFAF7"/><circle cx="28" cy="27" r="2.2" fill="#FBFAF7"/>
  <circle cx="20.5" cy="27.4" r="1.1" fill="#2A1840"/><circle cx="28.5" cy="27.4" r="1.1" fill="#2A1840"/>
  <path d="M21 33c2 1.6 4 1.6 6 0" fill="none" stroke="#2A1840" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 39c3 3 6 4 12 4s9-1 12-4" fill="none" stroke="${E}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>`;
const llorona = () => `
  <path d="M24 4c-7 0-12.5 5.6-12.5 12.6V42l4.2-3.6 4.1 3.6 4.2-3.6 4.2 3.6 4.1-3.6 4.2 3.6V16.6C36.5 9.6 31 4 24 4Z" fill="${E}"/>
  <circle cx="19" cy="17" r="2.6" fill="#FBFAF7"/><circle cx="29" cy="17" r="2.6" fill="#FBFAF7"/>
  <path d="M19 20.5c-.6 3-.6 5 0 7M29 20.5c.6 3 .6 5 0 7" stroke="#8FD3E8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="24" cy="28" rx="3" ry="4.2" fill="#2A1840" opacity=".8"/>`;
const madremonte = () => `
  <path d="M24 8c-6 0-10 4-10 9v6c0 7 4 13 10 17 6-4 10-10 10-17v-6c0-5-4-9-10-9Z" fill="${E}"/>
  ${hoja(13,16,-40,"#3E7D3A")}${hoja(35,16,220,"#4C8F45")}
  ${hoja(11,27,-15,"#4C8F45")}${hoja(37,27,195,"#3E7D3A")}
  <path d="M24 5c-2 2-5 3-8 3 2 2 3 4 3 6h10c0-2 1-4 3-6-3 0-6-1-8-3Z" fill="#3E7D3A"/>
  <circle cx="20" cy="21" r="2.2" fill="#F2D24A"/><circle cx="28" cy="21" r="2.2" fill="#F2D24A"/>
  <path d="M20 28c2.4 1.8 5.6 1.8 8 0" fill="none" stroke="#2A1840" stroke-width="1.8" stroke-linecap="round"/>`;
const sombreron = () => `
  <path d="M3 21c0-2.6 4-5 11-5h20c7 0 11 2.4 11 5 0 2-3.4 3.6-11 3.6H14C6.4 24.6 3 23 3 21Z" fill="${E}"/>
  <path d="M13 17C13 9 18 4 24 4s11 5 11 13" fill="${E}"/>
  <path d="M13 17h22" stroke="#2A1840" stroke-width="2" opacity=".6"/>
  <path d="M16 26c0 7 3.6 12 8 12s8-5 8-12Z" fill="${E}" opacity=".85"/>
  <circle cx="20.5" cy="29" r="1.8" fill="#F2D24A"/><circle cx="27.5" cy="29" r="1.8" fill="#F2D24A"/>
  <path d="M10 42c5-2.6 9-2.6 14 0 5-2.6 9-2.6 14 0" fill="none" stroke="${E}" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>`;

const ICONOS = {
  c_cafe:cafe, c_platano:platano, c_cacao:cacao, c_cana:cana,
  c_huerta:huerta, c_vivero:vivero, c_injerto:injerto,
  p_comun:plagaComun, p_resistente:plagaResistente,
  r_casero:remedioCasero, r_bioinsumo:bioinsumo,
  f_trueque:trueque, f_saqueo:saqueo, f_propagacion:propagacion, f_chaparron:chaparron,
  f_lindero:lindero, f_jornalExtra:jornalExtra, f_consejo:consejo,
  f_mallasombra:mallasombra, f_erradicacion:erradicacion,
  f_patasola:patasola, f_duende:duende, f_llorona:llorona,
  f_madremonte:madremonte, f_sombreron:sombreron,
  f_mohan_cafe:()=>mohan("#C0392B"), f_mohan_platano:()=>mohan("#4A8B3B"),
  f_mohan_cacao:()=>mohan("#7B4B2A"), f_mohan_cana:()=>mohan("#C9A227")
};


/* ── Sello de mazo ──────────────────────────────────────────
   Va en la esquina de cada carta, del tamaño de una lenteja, para poder
   separar las barajas a mano cuando se mezclan. */
const SELLOS = {
  base: c => `<ellipse cx="24" cy="24" rx="13" ry="17" fill="${c}"/>
    <path d="M24 9c-3.5 5-3.5 25 0 30" fill="none" stroke="#FBFAF7" stroke-width="3.4" stroke-linecap="round"/>`,
  bonanza: c => `<circle cx="24" cy="24" r="9.5" fill="${c}"/>
    <g stroke="${c}" stroke-width="3.2" stroke-linecap="round">
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4.2 4.2M33.8 33.8L38 38M38 10l-4.2 4.2M14.2 33.8L10 38"/></g>`,
  espantos: c => `<path d="M30 6a18 18 0 1 0 0 36 22 22 0 0 1 0-36Z" fill="${c}"/>
    <circle cx="36" cy="14" r="2.4" fill="${c}"/><circle cx="40" cy="22" r="1.6" fill="${c}"/>`
};
function sello(mazo, color, tam){
  const f = SELLOS[mazo] || SELLOS.base;
  return svg(f(color || "#FBFAF7"), tam ? `width="${tam}" height="${tam}"` : "");
}

function claveCarta(c){
  if(!c)return null;
  if(c.k==="cultivo")return "c_"+c.c;
  if(c.k==="plaga")return "p_"+c.t;
  if(c.k==="remedio")return "r_"+c.t;
  return "f_"+c.tr;
}
/* Claves de ilustración, de la más precisa a la más general.
   El dibujo en SVG se tiñe en vivo con el color del cultivo, así que a
   una sola forma le bastan los cinco colores. Un PNG pintado no se puede
   teñir: si el color importa para jugar —y en plagas y remedios importa,
   porque un remedio de café solo sirve en café— hace falta un archivo por
   color. Por eso se busca primero `p_comun_cafe.png` y, si no está, se
   usa `p_comun.png`. Quien quiera empezar con 29 dibujos puede; quien
   quiera la baraja fina pinta los 45 y el juego los toma sin tocar nada. */
function clavesCarta(c){
  const k = claveCarta(c);
  if(!k) return [];
  if((c.k==="plaga"||c.k==="remedio") && c.c) return [k+"_"+c.c, k];
  return [k];
}

/* ── Acabado: volumen, tinta y escena ───────────────────────── */
function hex2rgb(h){ const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
function mezcla(h, con, t){
  const a=hex2rgb(h), b=hex2rgb(con);
  return "#"+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,"0")).join("");
}
let serie = 0;
function escena(carta, tono, id){
  if(!carta) return "";
  if(carta.k==="plaga") return `
    <path d="M6 20c-2-5 3-9 7-7 1-5 8-7 12-4 4-2 10 0 10 5 4 0 6 4 4 7-1 3-5 4-8 3-5 2-11 2-15 0-4 2-9-1-10-4Z"
      fill="#9BA7B4" opacity=".8"/>
    <path d="M9 19c-1-3 2-6 5-5 1-3 6-5 9-2 3-2 8 0 8 4" fill="none" stroke="#C9D2DB" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
    <path d="M8 40l2-5M40 41l-2-5M24 44l0-4" stroke="#8FA0AC" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
  if(carta.k==="cultivo") return `
    <circle cx="24" cy="24" r="17" fill="url(#h${id})"/>
    <path d="M4 40c6-2 12-2 20 0s14 2 20 0v6H4Z" fill="#6B4B2A" opacity=".2"/>
    <circle cx="38" cy="10" r="4.6" fill="#F2C94C" opacity=".5"/>
    <path d="M8 13l1 2.2 2.2 1-2.2 1L8 19.4 7 17.2l-2.2-1 2.2-1Z" fill="#fff" opacity=".8"/>`;
  if(carta.k==="remedio") return `
    <circle cx="24" cy="24" r="18" fill="url(#h${id})"/>
    <circle cx="24" cy="24" r="12" fill="none" stroke="${tono}" stroke-width="1" opacity=".25"/>
    <circle cx="24" cy="24" r="16" fill="none" stroke="${tono}" stroke-width=".8" opacity=".15"/>`;
  let r = "";
  for(let i=0;i<14;i++){ const a=i*Math.PI*2/14;
    const x1=24+Math.cos(a)*9, y1=24+Math.sin(a)*9, x2=24+Math.cos(a)*23, y2=24+Math.sin(a)*23;
    r += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${tono}" stroke-width="${i%2?1.2:2}" opacity=".18" stroke-linecap="round"/>`; }
  return `<circle cx="24" cy="24" r="17" fill="url(#h${id})"/>${r}`;
}
function dibujo(carta, color, plano, sinEscena){
  const k = claveCarta(carta);
  if(!k||!ICONOS[k])return "";
  const tono = color||"#3F6B4A";
  if(plano) return svg(ICONOS[k](tono));
  const id = "a"+(serie++).toString(36);
  const claro = mezcla(tono,"#FFFFFF",.38), oscuro = mezcla(tono,"#000000",.32), tinta = mezcla(tono,"#101418",.62);
  return svg(`<defs>
    <radialGradient id="g${id}" cx="34%" cy="28%" r="78%">
      <stop offset="0" stop-color="${claro}"/><stop offset=".55" stop-color="${tono}"/><stop offset="1" stop-color="${oscuro}"/></radialGradient>
    <radialGradient id="h${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${tono}" stop-opacity=".28"/><stop offset=".7" stop-color="${tono}" stop-opacity=".08"/>
      <stop offset="1" stop-color="${tono}" stop-opacity="0"/></radialGradient>
    <filter id="f${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius=".9" result="d"/>
      <feFlood flood-color="${tinta}" result="c"/><feComposite in="c" in2="d" operator="in" result="borde"/>
      <feDropShadow dx="0" dy="1.2" stdDeviation="1" flood-color="#000" flood-opacity=".35" in="borde" result="sombra"/>
      <feMerge><feMergeNode in="sombra"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="b${id}" cx="30%" cy="22%" r="45%">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  ${sinEscena ? "" : escena(carta, tono, id)}
  <g filter="url(#f${id})">${ICONOS[k]("url(#g"+id+")")}</g>
  <g style="mix-blend-mode:screen;pointer-events:none"><circle cx="24" cy="24" r="16" fill="url(#b${id})"/></g>`);
}
/* La ficha de mata sobre la mesa usa la misma ilustración que la carta. Si no
   fuera así, el café de tu mano y el café sembrado en tu finca serían dos
   dibujos distintos, y la mesa se vería remendada. */
function dibujoCultivo(clave){
  const hex = {cafe:"#C0392B",platano:"#4A8B3B",cacao:"#7B4B2A",cana:"#C9A227",
               huerta:"#1E7D74",vivero:"#6E7A88",injerto:"#D97A16"}[clave];
  const k = "c_" + clave;
  if (EXTERNAS.has(k)) return `<img src="cartas/${k}.png" alt="" draggable="false">`;
  return dibujo({k:"cultivo",c:clave}, hex, false, true);
}

/* ── Avatares: sombreros de finquero, uno por silla ─────────── */
const SILLAS = [
  {nombre:"Aguadeño", hex:"#C9A227"}, {nombre:"Carriel",  hex:"#A34A2B"},
  {nombre:"Poncho",   hex:"#2F8F72"}, {nombre:"Ruana",    hex:"#3B5BC4"},
  {nombre:"Mochila",  hex:"#7B4FB5"}, {nombre:"Machete",  hex:"#6E7A3A"}
];
/* Clave de archivo de cada silla: «Aguadeño» → a_aguadeno.png */
const claveSilla = i => "a_" + SILLAS[i % 6].nombre.toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "");

function avatar(silla, tam){
  /* Si hay ilustración propia para esta silla, va esa, recortada en círculo
     sobre el color de la silla, igual que el sombrero vectorial. */
  const k = claveSilla(silla);
  if (EXTERNAS.has(k)) {
    const t = tam || 36;
    return `<span class="av avimg" style="width:${t}px;height:${t}px;--silla:${SILLAS[silla % 6].hex}">
      <img src="cartas/${k}.png" alt="" draggable="false"></span>`;
  }
  const s = SILLAS[silla % 6];
  const ojos = silla % 3;
  const cara = ojos===0
    ? `<circle cx="20" cy="27" r="2.2" fill="#3A2A18"/><circle cx="28" cy="27" r="2.2" fill="#3A2A18"/>
       <path d="M20 33c2.4 2 5.6 2 8 0" stroke="#3A2A18" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : ojos===1
    ? `<path d="M17.6 26.4l4 2.2-4 2.2M30.4 26.4l-4 2.2 4 2.2" stroke="#3A2A18" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="24" cy="34" r="2" fill="#3A2A18"/>`
    : `<circle cx="19.5" cy="27" r="2.8" fill="#FBFAF7"/><circle cx="19.8" cy="27.3" r="1.3" fill="#3A2A18"/>
       <circle cx="28.5" cy="27" r="2.8" fill="#FBFAF7"/><circle cx="28.8" cy="27.3" r="1.3" fill="#3A2A18"/>
       <path d="M20.5 34h7" stroke="#3A2A18" stroke-width="2" stroke-linecap="round"/>`;
  return svg(`
    <circle cx="24" cy="29" r="13" fill="#E8C79A"/>
    ${cara}
    <path d="M4 19c0-2.4 4-4.6 11-4.6h18c7 0 11 2.2 11 4.6 0 1.9-3.4 3.4-11 3.4H15C7.4 22.4 4 20.9 4 19Z" fill="${s.hex}"/>
    <path d="M13 15.4C13 8.4 18 4 24 4s11 4.4 11 11.4" fill="${s.hex}"/>
    <path d="M13 15.6h22" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
    <circle cx="24" cy="29" r="13" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/>`,
    `width="${tam||36}" height="${tam||36}" class="av"`);
}
const colorSilla = i => SILLAS[i % 6].hex;

/* ── Cara de carta ──────────────────────────────────────────── */
let EXTERNAS = new Set();
function usarExternas(lista){ EXTERNAS = new Set(lista||[]); }
function ilustracion(carta, tono){
  const k = clavesCarta(carta).find(x => EXTERNAS.has(x));
  if(k) return `<img src="cartas/${k}.png" alt="" draggable="false">`;
  return dibujo(carta, tono);
}
/* En el navegador el motor es global; fuera de él (los generadores de
   catálogo y pliego) hay que pedirlo, o los rótulos salen sin tildes. */
let _reglas = null;
function motor(){
  if(_reglas) return _reglas;
  if(raiz.REGLAS) return (_reglas = raiz.REGLAS);
  if(typeof require === "function"){ try { _reglas = require("./reglas.js"); } catch(e){} }
  return _reglas;
}
function rotulos(carta){
  if(!carta) return {titulo:"", sub:"", nombre:""};
  const M = motor();
  const C = M ? M.CULTIVO : null;
  const lbl = c => C ? C[c].label : c;
  if(carta.k==="cultivo") return {titulo:"CULTIVO", sub:lbl(carta.c).toUpperCase(), nombre:lbl(carta.c)};
  if(carta.k==="plaga") return {titulo:"PLAGA",
    sub:(carta.t==="resistente"?"RESISTENTE / ":"")+lbl(carta.c).toUpperCase(),
    nombre:carta.t==="resistente"?"Plaga resistente":"Plaga"};
  if(carta.k==="remedio") return {titulo:carta.t==="bioinsumo"?"BIOINSUMO":"REMEDIO",
    sub:lbl(carta.c).toUpperCase(), nombre:carta.t==="bioinsumo"?"Bioinsumo":"Remedio"};
  const N = M ? M.FAENA[carta.tr] : carta.tr;
  return {titulo:"FAENA", sub:N.toUpperCase(), nombre:N};
}
function caraCarta(carta, tono, grande){
  const r = rotulos(carta);
  const rot = `${r.titulo} / ${r.sub}`;
  const M = motor();
  const mz = M ? M.mazoDe(carta) : "base";
  const costo = motor() ? motor().cuesta(carta) : 1;
  return `<span class="cara ${grande?"gr":""}" style="--tono:${tono}">
    <span class="papel"></span>
    <span class="cinta"><span class="ins">${dibujo(carta, "#FFFFFF", true)}</span>
      <span class="tit">${(carta.k==="faena"&&!grande) ? r.sub : `${r.titulo} <b>/ ${r.sub}</b>`}</span>
      <span class="costo" title="jornales">${costo}</span></span>
    <span class="lado izq">${rot}</span><span class="lado der">${rot}</span>
    <span class="ilustra"><span class="obra">${ilustracion(carta, tono)}</span></span>
    <span class="alpie">${rot}</span>
    <span class="esq ${mz}" title="Mazo ${M ? M.MAZOS[mz].nombre : mz}">${sello(mz, "#FFFFFF")}</span></span>`;
}

/* Ilustración propia por clave, o nada. La usan los sucesos y el clima para
   decidir si tienen imagen o deben usar su figura de respaldo. */
const arteDe = k => EXTERNAS.has(k) ? `<img src="cartas/${k}.png" alt="" draggable="false">` : null;

const API = {dibujo, dibujoCultivo, avatar, colorSilla, SILLAS, claveSilla, claveCarta, clavesCarta,
  caraCarta, rotulos, usarExternas, sello, SELLOS, ilustracion, arteDe};
if (typeof module !== "undefined" && module.exports) module.exports = API; else raiz.ARTE = API;
})(typeof self !== "undefined" ? self : globalThis);
