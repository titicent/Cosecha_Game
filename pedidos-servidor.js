/* ═══════════════════════════════════════════════════════════════
   PEDIDOS DEL PUEBLO — salas del modo alterno, en el mismo servidor
   Van aparte de las mesas de Cosecha clásico, igual que La Galería:
   su propio mapa de salas y sus propios mensajes (todos llegan con
   juego: "pedidos"). El motor es public/pedidos-reglas.js; el
   reglamento, PEDIDOS-DEL-PUEBLO.md.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
const crypto = require("crypto");
const R = require("./public/pedidos-reglas.js");

const PENSAR_BOT = Number(process.env.PENSAR_BOT || 900);
const SEG_TURNO = Number(process.env.SEG_TURNO_PEDIDOS || 90);   /* reloj por turno para las personas */
const SEG_DESCONECTADO = 25;                                     /* si se cayó la conexión, se le espera menos */
const VIDA_SALA = 6 * 60 * 60 * 1000;
const NIVELES = ["novato", "normal", "baquiano"];
const limpiaOpciones = o => ({ juego: "pedidos", modo: o && o.modo === "primera" ? "primera" : "completo" });

const salas = new Map();
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function nuevoCodigo() {
  let c; do { c = Array.from({ length: 4 }, () => LETRAS[crypto.randomInt(LETRAS.length)]).join(""); } while (salas.has(c));
  return c;
}
const limpiaNombre = n => String(n || "").replace(/[<>]/g, "").trim().slice(0, 14) || "Finquero";
function nombreLibre(sala, base) {
  const usados = new Set(sala.sillas.map(s => s.nombre));
  if (!usados.has(base)) return base;
  for (let i = 2; ; i++) if (!usados.has(base + " " + i)) return base + " " + i;
}
function crearSala(opciones) {
  const sala = { codigo: nuevoCodigo(), sillas: [], opciones: limpiaOpciones(opciones),
    E: null, reloj: null, limite: 0, botTimer: null, actividad: Date.now() };
  salas.set(sala.codigo, sala);
  return sala;
}
function sentar(sala, nombre, bot) {
  if (sala.E) throw new Error("La partida ya empezó");
  if (sala.sillas.length >= R.MAX_JUG) throw new Error("La mesa está llena (máximo " + R.MAX_JUG + ")");
  const base = bot ? R.NOMBRES_BOT.find(n => !sala.sillas.some(s => s.nombre === n)) || "Vecino" : limpiaNombre(nombre);
  const silla = { nombre: nombreLibre(sala, base), token: crypto.randomBytes(12).toString("hex"),
    ws: null, bot: bot || null, conectado: !!bot, ausencias: 0 };
  sala.sillas.push(silla);
  return silla;
}

/* ── Envío de vistas: cada uno ve solo lo suyo ─────────────── */
const manda = (ws, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
function vistaSala(sala, i) {
  const base = sala.E ? R.vista(sala.E, i) : {};
  return Object.assign(base, {
    juego: "pedidos", codigo: sala.codigo, iniciada: !!sala.E, yo: i, anfitrion: sala.sillas.findIndex(s => !s.bot),
    opciones: sala.opciones, restante: sala.E && !sala.E.terminada ? Math.max(0, Math.round((sala.limite - Date.now()) / 1000)) : null,
    sillas: sala.sillas.map(s => ({ nombre: s.nombre, bot: s.bot, conectado: s.conectado }))
  });
}
function difundir(sala) {
  sala.actividad = Date.now();
  sala.sillas.forEach((s, i) => { if (s.ws) manda(s.ws, { t: "vista", v: vistaSala(sala, i) }); });
}

/* ── Turnos: reloj y vecinos de la máquina ──────────────────── */
function programar(sala) {
  clearTimeout(sala.reloj); clearTimeout(sala.botTimer);
  const E = sala.E;
  if (!E || E.terminada) return;
  const s = sala.sillas[E.turno];
  if (s.bot) { sala.limite = Date.now() + PENSAR_BOT; sala.botTimer = setTimeout(() => jugarBot(sala), PENSAR_BOT); return; }
  const seg = s.conectado ? SEG_TURNO : SEG_DESCONECTADO;
  if (!seg) { sala.limite = 0; return; }
  const turnoDe = E.turno, marca = E.turnosJugados;
  sala.limite = Date.now() + seg * 1000;
  sala.reloj = setTimeout(() => tiempoAgotado(sala, turnoDe, marca), seg * 1000);
}
function jugarBot(sala) {
  const E = sala.E; if (!E || E.terminada) return;
  const s = sala.sillas[E.turno];
  const j = R.validar(E, E.turno, R.elegir(E, E.turno, s.bot || "normal"));
  R.aplicar(E, E.turno, j || { tipo: "terminar", costo: 0 });
  difundir(sala); programar(sala);
}
/* Si alguien no juega a tiempo, su turno se cierra. A la tercera vez seguida,
   un vecino de la máquina se sienta en su puesto para que la mesa no se trabe. */
function tiempoAgotado(sala, turnoDe, marca) {
  const E = sala.E; if (!E || E.terminada || E.turno !== turnoDe || E.turnosJugados !== marca) return;
  const s = sala.sillas[turnoDe];
  s.ausencias++;
  R.aplicar(E, turnoDe, { tipo: "terminar", costo: 0 });
  E.registro.push("⏱ Se le acabó el tiempo a " + s.nombre + ".");
  if (s.ausencias >= 3) { s.bot = "normal"; E.registro.push(s.nombre + " no volvió: juega por él un vecino de la máquina."); }
  difundir(sala); programar(sala);
}
function empezar(sala) {
  if (sala.sillas.length < R.MIN_JUG) throw new Error("Hacen falta al menos " + R.MIN_JUG + " jugadores");
  if (sala.sillas.length > R.MAX_JUG) throw new Error("Pedidos del pueblo es hasta de " + R.MAX_JUG + " jugadores");
  sala.E = R.nuevaPartida(sala.sillas.map(s => s.nombre), { modo: sala.opciones.modo, semilla: crypto.randomInt(2 ** 31) });
  sala.sillas.forEach(s => { s.ausencias = 0; });
  difundir(sala); programar(sala);
}
function borrar(sala) { clearTimeout(sala.reloj); clearTimeout(sala.botTimer); salas.delete(sala.codigo); }

/* ── Mensajes ───────────────────────────────────────────────── */
function unirWs(ws, sala, i) {
  const s = sala.sillas[i];
  if (s.ws && s.ws !== ws) { try { s.ws.close(); } catch (e) {} }
  s.ws = ws; s.conectado = true; s.ausencias = 0;
  ws.pSala = sala.codigo; ws.pSilla = i;
  manda(ws, { t: "sesion", codigo: sala.codigo, token: s.token, yo: i });
}
function atender(ws, m) {
  try { procesar(ws, m); }
  catch (e) { manda(ws, { t: "error", msg: e.message || "Algo salió mal" }); }
}
function procesar(ws, m) {
  if (m.t === "latido") return;
  if (m.t === "crear") {
    const sala = crearSala(m.opciones);
    sentar(sala, m.nombre);
    unirWs(ws, sala, 0);
    (Array.isArray(m.bots) ? m.bots : []).slice(0, R.MAX_JUG - 1).forEach(n => sentar(sala, null, NIVELES.includes(n) ? n : "normal"));
    if (m.empezar) return empezar(sala);
    return difundir(sala);
  }
  if (m.t === "unir") {
    const sala = salas.get(String(m.codigo || "").toUpperCase().trim());
    if (!sala) throw new Error("No hay ninguna sala de Pedidos con ese código");
    sentar(sala, m.nombre);
    unirWs(ws, sala, sala.sillas.length - 1);
    return difundir(sala);
  }
  if (m.t === "reconectar") {
    const sala = salas.get(String(m.codigo || "").toUpperCase());
    const i = sala ? sala.sillas.findIndex(s => s.token === m.token) : -1;
    if (i < 0) return manda(ws, { t: "perdida" });
    if (sala.sillas[i].bot && sala.E) sala.sillas[i].bot = null;     /* vuelve a su puesto */
    unirWs(ws, sala, i);
    if (sala.E && sala.E.turno === i) programar(sala);
    return difundir(sala);
  }
  const sala = ws.pSala && salas.get(ws.pSala);
  if (!sala) throw new Error("No estás en ninguna sala");
  const yo = ws.pSilla, esAnfitrion = sala.sillas.findIndex(s => !s.bot) === yo;
  switch (m.t) {
    case "bot":
      if (!esAnfitrion) throw new Error("Solo quien armó la mesa puede sentar vecinos");
      sentar(sala, null, NIVELES.includes(m.nivel) ? m.nivel : "normal"); return difundir(sala);
    case "quitarbot": {
      if (!esAnfitrion || sala.E) return;
      const i = sala.sillas.map(s => !!s.bot).lastIndexOf(true);
      if (i >= 0) sala.sillas.splice(i, 1);
      sala.sillas.forEach((x, k) => { if (x.ws) x.ws.pSilla = k; });
      return difundir(sala); }
    case "opciones":
      if (!esAnfitrion || sala.E) return;
      sala.opciones = limpiaOpciones(m.opciones);
      return difundir(sala);
    case "empezar":
      if (!esAnfitrion) throw new Error("Solo quien armó la mesa puede empezar");
      if (sala.E) throw new Error("La partida ya empezó");
      return empezar(sala);
    case "jugar": {
      const E = sala.E; if (!E) throw new Error("La partida no ha empezado");
      if (E.turno !== yo) throw new Error("Todavía no es tu turno");
      const j = R.validar(E, yo, m.jugada);
      if (!j) throw new Error("Esa jugada no se puede hacer ahora");
      sala.sillas[yo].ausencias = 0;
      R.aplicar(E, yo, j);
      difundir(sala); programar(sala); return; }
    case "revancha":
      if (!esAnfitrion) throw new Error("Solo quien armó la mesa puede pedir la revancha");
      if (!sala.E || !sala.E.terminada) return;
      sala.sillas = sala.sillas.filter(s => s.bot || s.conectado);      /* los que se fueron salen de la mesa */
      sala.sillas.forEach((x, k) => { if (x.ws) { x.ws.pSilla = k; manda(x.ws, { t: "sesion", codigo: sala.codigo, token: x.token, yo: k }); } });
      if (sala.sillas.length < R.MIN_JUG) { sala.E = null; return difundir(sala); }
      return empezar(sala);
    case "salir": {
      const E = sala.E;
      if (E && !E.terminada) { R.retirar(E, yo); sala.sillas[yo].bot = null; }
      const s = sala.sillas[yo]; s.ws = null; s.conectado = false;
      ws.pSala = null; ws.pSilla = -1;
      if (!sala.E) { sala.sillas.splice(yo, 1); sala.sillas.forEach((x, k) => { if (x.ws) x.ws.pSilla = k; }); }
      if (!sala.sillas.some(x => x.conectado && !x.bot)) return borrar(sala);
      difundir(sala); programar(sala); return; }
  }
}

/* Se llama cuando se cierra cualquier conexión del servidor. */
function cerrar(ws) {
  const sala = ws.pSala && salas.get(ws.pSala); if (!sala) return;
  const s = sala.sillas[ws.pSilla]; if (!s || s.ws !== ws) return;
  s.ws = null; s.conectado = false;
  if (!sala.E) {                       /* antes de empezar, la silla se libera */
    sala.sillas.splice(ws.pSilla, 1);
    sala.sillas.forEach((x, i) => { if (x.ws) x.ws.pSilla = i; });
    if (!sala.sillas.some(x => !x.bot)) return borrar(sala);
  } else if (sala.E.turno === ws.pSilla && !sala.E.terminada) programar(sala);
  difundir(sala);
}

/* Salas viejas sin nadie conectado */
setInterval(() => {
  const ahora = Date.now();
  for (const sala of [...salas.values()])
    if (ahora - sala.actividad > VIDA_SALA && !sala.sillas.some(s => s.conectado && !s.bot)) borrar(sala);
}, 10 * 60 * 1000).unref();

module.exports = { atender, cerrar, salas };
