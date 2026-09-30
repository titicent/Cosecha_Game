/* ═══════════════════════════════════════════════════════════════
   LA GALERÍA — salas de la subasta, en el mismo servidor de Cosecha
   Van aparte de las mesas de Cosecha: su propio mapa de salas y sus
   propios mensajes (todos llegan con juego: "galeria"). El servidor
   guarda las ofertas y no las cuenta a nadie hasta que se destapan.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
const crypto = require("crypto");
const G = require("./public/vereda/galeria-reglas.js");

const SEG_PUJA = Number(process.env.SEG_PUJA || 30);     /* para ofrecer en cada ronda */
const MS_VER = Number(process.env.MS_VER_PUJAS || 4200);  /* lo que se ven las ofertas destapadas */
const PIENSA = Number(process.env.PENSAR_BOT || 900);
const VIDA = 3 * 60 * 60 * 1000;
const VECINOS = ["Caturra", "Borbón", "Típica", "Castillo", "Tabi", "Geisha"];
const NIVELES = ["novato", "normal", "baquiano"];

const salas = new Map();
const codigo = () => {
  let c; const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  do { c = Array.from({ length: 4 }, () => abc[crypto.randomInt(abc.length)]).join(""); } while (salas.has(c));
  return c;
};
const limpia = n => String(n || "").replace(/[<>]/g, "").trim().slice(0, 14) || "Vecino";
const manda = (ws, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
const error = (ws, msg) => manda(ws, { t: "g_error", msg });

function sentar(s, nombre, bot) {
  if (s.jugadores.length >= G.MAX_JUG) throw new Error("La plaza está llena (máximo " + G.MAX_JUG + ")");
  const usados = new Set(s.jugadores.map(j => j.nombre));
  let n = bot ? (VECINOS.find(v => !usados.has(v)) || "Vecino") : limpia(nombre);
  for (let k = 2; usados.has(n); k++) n = limpia(nombre) + " " + k;
  const j = { nombre: n, token: crypto.randomBytes(12).toString("hex"), ws: null, bot: bot || null, conectado: !!bot };
  s.jugadores.push(j);
  return j;
}
function unirWs(s, i, ws) {
  const j = s.jugadores[i];
  if (j.ws && j.ws !== ws) try { j.ws.close(); } catch (e) {}
  j.ws = ws; j.conectado = true; ws.gSala = s.codigo; ws.gYo = i;
  manda(ws, { t: "g_sesion", codigo: s.codigo, token: j.token, yo: i });
}
const reindexar = s => s.jugadores.forEach((j, i) => { if (j.ws) j.ws.gYo = i; });

function vista(s, yo) {
  const E = s.E, rev = E && E.fase !== "pujando";
  return {
    codigo: s.codigo, yo, anfitrion: s.jugadores.findIndex(j => !j.bot), iniciada: !!E,
    fase: E ? E.fase : "espera", ronda: E ? E.ronda : 0, rondas: 12, quedan: E ? E.lotes.length : 0,
    mesa: E ? E.mesa : [], ultima: E && rev ? E.ultima : null, ganadores: E ? E.ganadores : null,
    restante: E && E.fase === "pujando" ? Math.max(0, Math.round((s.limite - Date.now()) / 1000)) : null,
    jugadores: s.jugadores.map((j, i) => {
      const x = E ? E.jugadores[i] : null;
      return { nombre: j.nombre, bot: j.bot, conectado: j.conectado,
        monedas: x ? x.monedas : G.MONEDAS, bodega: x ? x.bodega : null, puntos: x ? G.puntos(x) : null,
        listo: !!x && x.puja !== null, puja: x && (rev || i === yo) ? x.puja : null };
    })
  };
}
function difundir(s) { s.actividad = Date.now(); s.jugadores.forEach((j, i) => { if (j.ws) manda(j.ws, { t: "g_vista", v: vista(s, i) }); }); }

/* ── Rondas ─────────────────────────────────────────────────── */
function programar(s) {
  clearTimeout(s.reloj); (s.bots || []).forEach(clearTimeout); s.bots = [];
  const E = s.E; if (!E || E.fase !== "pujando") return;
  s.limite = Date.now() + SEG_PUJA * 1000;
  s.reloj = setTimeout(() => destapar(s), SEG_PUJA * 1000);
  s.jugadores.forEach((j, i) => {
    if (!j.bot) return;
    const ronda = E.ronda;
    s.bots.push(setTimeout(() => {
      if (!s.E || s.E.ronda !== ronda || s.E.fase !== "pujando") return;
      G.pujar(s.E, i, G.pujaBot(s.E, i, j.bot)); revisar(s);
    }, PIENSA * (0.6 + Math.random() * 1.4)));
  });
}
function revisar(s) {
  if (s.E && s.E.fase === "pujando" && G.faltan(s.E) === 0) return destapar(s);
  difundir(s);
}
function destapar(s) {
  clearTimeout(s.reloj);
  if (!s.E || s.E.fase !== "pujando") return;
  G.destapar(s.E);
  difundir(s);
  s.reloj = setTimeout(() => { G.siguiente(s.E); difundir(s); programar(s); }, MS_VER);
}
function empezar(s) {
  if (s.jugadores.length < G.MIN_JUG) throw new Error("Hacen falta al menos " + G.MIN_JUG + " en la plaza");
  s.E = G.nueva(s.jugadores.map(j => j.nombre));
  difundir(s); programar(s);
}

/* ── Mensajes ───────────────────────────────────────────────── */
function atender(ws, m) {
  try { atender2(ws, m); } catch (e) { error(ws, e.message || "Algo salió mal"); }
}
function atender2(ws, m) {
  if (m.t === "crear") {
    const s = { codigo: codigo(), jugadores: [], E: null, reloj: null, bots: [], creada: Date.now(), actividad: Date.now() };
    salas.set(s.codigo, s);
    sentar(s, m.nombre); unirWs(s, 0, ws);
    (Array.isArray(m.bots) ? m.bots : []).slice(0, G.MAX_JUG - 1).forEach(n => sentar(s, null, NIVELES.includes(n) ? n : "normal"));
    if (m.empezar) return empezar(s);
    return difundir(s);
  }
  if (m.t === "unir") {
    const s = salas.get(String(m.codigo || "").toUpperCase().trim());
    if (!s) throw new Error("No hay ninguna plaza con ese código");
    if (s.E) throw new Error("Esa subasta ya empezó");
    sentar(s, m.nombre); unirWs(s, s.jugadores.length - 1, ws);
    return difundir(s);
  }
  if (m.t === "reconectar") {
    const s = salas.get(String(m.codigo || "").toUpperCase());
    const i = s ? s.jugadores.findIndex(j => j.token === m.token) : -1;
    if (i < 0) return manda(ws, { t: "g_perdida" });
    unirWs(s, i, ws); return difundir(s);
  }
  const s = ws.gSala && salas.get(ws.gSala);
  if (!s) throw new Error("No estás en ninguna plaza");
  const yo = ws.gYo, anf = s.jugadores.findIndex(j => !j.bot) === yo;
  switch (m.t) {
    case "bot":
      if (!anf || s.E) return;
      sentar(s, null, NIVELES.includes(m.nivel) ? m.nivel : "normal"); return difundir(s);
    case "quitarbot": {
      if (!anf || s.E) return;
      const i = s.jugadores.map(j => !!j.bot).lastIndexOf(true);
      if (i >= 0) { s.jugadores.splice(i, 1); reindexar(s); }
      return difundir(s); }
    case "empezar":
      if (!anf) throw new Error("Solo quien abrió la plaza puede empezar");
      if (s.E) return;
      return empezar(s);
    case "pujar":
      if (!s.E) return;
      if (!G.pujar(s.E, yo, m.monto)) throw new Error("Esa oferta no vale");
      return revisar(s);
    case "revancha":
      if (!anf || !s.E || s.E.fase !== "fin") return;
      s.jugadores = s.jugadores.filter(j => j.bot || j.conectado); reindexar(s);
      s.jugadores.forEach((j, i) => { if (j.ws) manda(j.ws, { t: "g_sesion", codigo: s.codigo, token: j.token, yo: i }); });
      return empezar(s);
    case "salir": {
      const j = s.jugadores[yo]; if (!j) return;
      j.ws = null; j.conectado = false; ws.gSala = null; ws.gYo = null;
      if (!s.E) { s.jugadores.splice(yo, 1); reindexar(s); }
      else if (s.E.fase === "pujando") { j.bot = "normal"; programarBotSuelto(s, yo); }   /* un vecino sigue por él */
      if (!s.jugadores.some(x => !x.bot && x.conectado)) { cerrarSala(s); return; }
      return difundir(s); }
  }
}
function programarBotSuelto(s, i) {
  const E = s.E; if (!E || E.fase !== "pujando" || E.jugadores[i].puja !== null) return;
  setTimeout(() => { if (s.E === E && E.fase === "pujando" && E.jugadores[i].puja === null) { G.pujar(E, i, G.pujaBot(E, i, "normal")); revisar(s); } }, PIENSA);
}
function cerrarSala(s) { clearTimeout(s.reloj); (s.bots || []).forEach(clearTimeout); salas.delete(s.codigo); }
function cerrar(ws) {
  const s = ws.gSala && salas.get(ws.gSala); if (!s) return;
  const j = s.jugadores[ws.gYo]; if (!j || j.ws !== ws) return;
  j.ws = null; j.conectado = false;
  if (!s.E) { s.jugadores.splice(ws.gYo, 1); reindexar(s); if (!s.jugadores.some(x => !x.bot)) return cerrarSala(s); }
  difundir(s);
}
setInterval(() => {
  const ahora = Date.now();
  for (const s of salas.values()) if (ahora - s.actividad > VIDA || (!s.jugadores.some(j => j.conectado && !j.bot) && ahora - s.actividad > 10 * 60 * 1000)) cerrarSala(s);
}, 5 * 60 * 1000).unref();

module.exports = { atender, cerrar, salas };
