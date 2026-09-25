/* ═══════════════════════════════════════════════════════════════
   COSECHA — servidor
   Es la autoridad de la partida: aquí viven el mazo y las manos.
   A cada jugador se le manda solo lo suyo; de los demás, cuántas
   cartas tienen. Así nadie puede espiar abriendo el navegador.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");
const R = require("./public/reglas.js");

const PUERTO = process.env.PORT || 3000;
const PUBLICO = path.join(__dirname, "public");
const SEGUNDOS_MALLA = 12;      // ventana para responder con la malla de sombra
const SEGUNDOS_AUSENTE = Number(process.env.SEG_AUSENTE || 40);  // tras esto, el turno de un desconectado se juega solo
const TURNOS_PASIVOS = 3;       // turnos seguidos sin hacer nada antes de quedar fuera
const PENSAR_BOT = Number(process.env.PENSAR_BOT || 900);  // lo que un bot "se demora" en jugar, en ms
const VIDA_SALA = 6 * 60 * 60 * 1000;

/* ── Servidor de archivos ───────────────────────────────────── */
const MIME = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",
  ".webmanifest":"application/manifest+json",".svg":"image/svg+xml"};
const servidor = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(PUBLICO, url === "/" ? "index.html" : url);
  if (!f.startsWith(PUBLICO)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (e, datos) => {
    if (e) { res.writeHead(404, {"Content-Type":"text/plain"}).end("No existe"); return; }
    /* Las ilustraciones pesan unos megas entre todas y no cambian de un día
       para otro: se dejan en el navegador para que la segunda partida abra
       de una. El código, en cambio, se revalida siempre —son unos pocos KB—
       porque un cliente.js nuevo con un reglas.js viejo en caché rompe el
       juego de formas difíciles de entender. */
    const ext = path.extname(f);
    const estatico = ext === ".png" || ext === ".jpg" || ext === ".webp" || ext === ".svg";
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": estatico ? "public, max-age=86400" : "no-cache"
    });
    res.end(datos);
  });
});

/* ── Salas ──────────────────────────────────────────────────── */
const salas = new Map();
function x_conectado(s, i) { return !!(s.jugadores[i] && s.jugadores[i].conectado); }
const codigo = () => {
  let c; const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  do { c = Array.from({length:4},()=>abc[crypto.randomInt(abc.length)]).join(""); }
  while (salas.has(c));
  return c;
};

function crearSala(nombre, ws) {
  const s = { codigo: codigo(), jugadores: [], opciones: {bonanza:true, duelo:false, aprendiz:false, espantos:false, metaCertificada:false, clima:true, segundosTurno:60, minutosJugador:0},
    iniciada:false, E:null, pendiente:null, reloj:null, relojAusente:null, creada:Date.now() };
  salas.set(s.codigo, s);
  sentar(s, nombre, ws);
  return s;
}
function sentar(s, nombre, ws) {
  const j = { id: s.jugadores.length, token: crypto.randomUUID(),
    nombre: (nombre||"").trim().slice(0,14) || "Jugador " + (s.jugadores.length+1), ws, conectado:true, bot:null };
  s.jugadores.push(j);
  return j;
}
/* variedades de café, para que los rivales de la máquina suenen a la casa */
const NOMBRES_BOT = ["Caturra", "Borbón", "Típica", "Castillo", "Tabi", "Geisha"];
function sentarBot(s, nivel) {
  const usados = new Set(s.jugadores.map(j => j.nombre));
  const nombre = NOMBRES_BOT.find(n => !usados.has(n)) || "Bot " + (s.jugadores.length+1);
  const j = { id: s.jugadores.length, token: crypto.randomUUID(), nombre, ws:null, conectado:true, bot:nivel };
  s.jugadores.push(j);
  return j;
}
/* Solo cuentan las personas: una sala con puros bots no tiene razón de existir. */
const vivos = s => s.jugadores.filter(j => j.conectado && !j.bot).length;

/* ── Vista personalizada ────────────────────────────────────── */
function vista(s, yo) {
  const E = s.E;
  const base = { codigo: s.codigo, iniciada: s.iniciada, yo, anfitrion: yo === 0,
    opciones: s.opciones,
    jugadores: s.jugadores.map((j,i) => ({ nombre: j.nombre, conectado: j.conectado,
      finca: E ? E.jugadores[i].finca : [], cartas: E ? E.jugadores[i].mano.length : 0,
      fuera: E ? !!E.jugadores[i].fuera : false,
      bot: j.bot || null,
      maldicion: E ? !!E.jugadores[i].maldicion : false,
      certificados: E ? R.certificados(E.jugadores[i]) : 0,
      cosecha: E ? R.puntos(E.jugadores[i]) + (E.jugadores[i].bonos||0) : 0,
      sanos: E ? R.sanos(E.jugadores[i]) : 0,
      logro: E ? R.logrados(E, E.jugadores[i]) : 0 })) };
  if (!E) return base;
  const miTurno = E.turno === yo && E.ganador === null && !s.pendiente;
  const vv = Object.assign(base, {
    turno: E.turno, objetivo: E.objetivo, jornales: E.jornales, sentido: E.sentido,
    clima: E.clima, climaOn: E.climaOn,
    mano: E.jugadores[yo].mano, mazo: E.mazo.length, retiradas: E.retiradas.length,
    descarte: E.descarte.length ? E.descarte[E.descarte.length-1] : null,
    descartados: E.descarte.length,
    registro: E.registro.slice(-9), ganador: E.ganador, evento: E.evento,
    terminada: E.terminada, metaCertificada: E.metaCertificada,
    restante: E.vence ? Math.max(0, E.vence - Date.now()) : null,
    bancos: s.opciones.minutosJugador > 0 ? E.jugadores.map(x => x.banco) : null,
    jugadas: miTurno ? E.jugadores[yo].mano.map((_,i)=>R.jugadasLegales(E, yo, i)) : null,
    sugerencias: (miTurno && s.opciones.aprendiz) ? R.sugerencias(E, yo) : null
  });
  if (s.votacion) {
    const v = s.votacion;
    vv.votacion = { quien: s.jugadores[v.ji].nombre, mio: v.esperando.includes(yo),
      faltan: v.esperando.length, segundos: Math.max(0, Math.ceil((v.vence - Date.now())/1000)) };
  }
  if (s.pendiente) {
    const p = s.pendiente;
    vv.pendiente = { tipo: p.tipo, segundos: Math.max(0, Math.ceil((p.vence - Date.now())/1000)),
      quien: s.jugadores[p.ji].nombre, carta: p.carta, etiqueta: p.jugada ? p.jugada.etiqueta : "",
      mio: p.tipo === "malla" ? p.esperando.includes(yo) : p.ji === yo,
      opciones: (p.tipo === "reelegir" && p.ji === yo) ? p.opciones : null };
  }
  return vv;
}
function difundir(s) {
  s.jugadores.forEach((j,i) => enviar(j, {t:"vista", v: vista(s, i)}));
}
function enviar(j, msg) {
  if (j.ws && j.ws.readyState === 1) { try { j.ws.send(JSON.stringify(msg)); } catch(e){} }
}
const error = (ws, msg) => { try { ws.send(JSON.stringify({t:"error", msg})); } catch(e){} };

/* ── Arranque de partida ────────────────────────────────────── */
function empezar(s) {
  const E = {
    jugadores: s.jugadores.map(j => ({ nombre: j.nombre, mano: [], finca: [], bonos: 0,
      fuera: !j.conectado && !j.bot, pasivos: 0,
      banco: s.opciones.minutosJugador * 60000 })),
    mazo: R.barajar(R.crearMazo(s.opciones.bonanza, s.opciones.espantos)), descarte: [], retiradas: [],
    turno: crypto.randomInt(s.jugadores.length),
    jornales: R.JORNALES_TURNO, sentido: 1, rondaPaso: 0, rebarajadas: 0,
    climaOn: !!s.opciones.clima, clima: null, climaN: 0,
    objetivo: (s.opciones.duelo && s.jugadores.length === 2) ? 5 : 4,
    metaCertificada: !!s.opciones.metaCertificada,
    registro: ["Empieza la jornada"], ganador: null, terminada: null, eventoN: 0, evento: null
  };
  E.jugadores.forEach((_,i) => R.robar(E, i));
  s.E = E; s.iniciada = true; s.pendiente = null; s.votacion = null;
  E.registro.push("Arranca " + E.jugadores[E.turno].nombre);
  programarTurno(s);
}

/* ── Ciclo de turno ─────────────────────────────────────────── */
function cantar(E, g) { E.ganador = g; E.evento = { n: ++E.eventoN, tipo:"victoria", ji:g }; E.registro.push("🏆 " + E.jugadores[g].nombre + " completó su finca"); }
/* La tierra se agotó: gana quien más cosecha tenga. */
function cerrarPorCosecha(s) {
  const E = s.E, r = R.porPuntos(E);
  E.ganador = r.quien;
  E.evento = { n: ++E.eventoN, tipo:"victoria", ji:r.quien };
  E.registro.push("🌾 Se agotó la tierra. " +
    (r.empate ? "Empate en cabeza con " + r.puntos + " de cosecha; se la lleva "
              : "Más cosecha: ") + E.jugadores[r.quien].nombre + " con " + r.puntos + " puntos");
}
function cerrarTurno(s) {
  const E = s.E;
  let g = R.ganador(E);
  if (g !== null) { cantar(E, g); return; }
  /* mientras queden jornales y algo que hacer, sigue el mismo jugador */
  if (E.jornales > 0 && E.jugadores[E.turno].mano.length &&
      E.jugadores[E.turno].mano.some((_,i) => R.jugadasLegales(E, E.turno, i).length)) {
    programarTurno(s);                     /* hay que rearmar su reloj, y despertar al bot */
    return;
  }
  R.avanzarTurno(E);
  if (R.tocaClima(E)) {
    const reg = R.aplicarClima(E);
    E.registro.push(...reg);
    E.evento = { n: ++E.eventoN, tipo:"clima", ji:null, clima:E.clima };
  }
  g = R.ganador(E);
  if (g !== null) { cantar(E, g); return; }
  if (R.tierraAgotada(E)) { cerrarPorCosecha(s); return; }
  programarTurno(s);
}
/* Reloj del turno. Cubre tres casos con un solo temporizador:
   el límite por turno, el banco de tiempo del jugador y la ausencia
   de quien perdió la señal. Se pausa mientras hay una carta esperando
   respuesta, para que nadie pierda tiempo por culpa de otro. */
function consumir(s) {
  const E = s.E;
  if (!E || !E.turnoDesde) return;
  const usado = Date.now() - E.turnoDesde;
  E.turnoDesde = Date.now();
  const j = E.jugadores[E.turno];
  if (s.opciones.minutosJugador > 0) j.banco = Math.max(0, j.banco - usado);
}
function limiteTurno(s) {
  const E = s.E, j = E.jugadores[E.turno];
  let lim = Infinity;
  if (s.opciones.segundosTurno > 0) lim = s.opciones.segundosTurno * 1000;
  if (s.opciones.minutosJugador > 0) lim = Math.min(lim, Math.max(1500, j.banco));
  if (!s.jugadores[E.turno].conectado) lim = Math.min(lim, SEGUNDOS_AUSENTE * 1000);
  return lim;
}
function programarTurno(s) {
  clearTimeout(s.relojAusente);
  const E = s.E;
  if (!E || E.ganador !== null || E.terminada !== null) return;
  E.turnoDesde = Date.now();
  if (esBot(s, E.turno)) {                 /* el bot se toma un momento, para que se vea */
    E.vence = null;
    s.relojAusente = setTimeout(() => turnoBot(s), PENSAR_BOT + Math.random()*PENSAR_BOT*1.5);
    return;
  }
  const lim = limiteTurno(s);
  E.vence = lim === Infinity ? null : Date.now() + lim;
  if (lim === Infinity) return;
  s.relojAusente = setTimeout(() => jugarSolo(s), lim + 120);
}
function pausarTurno(s) { consumir(s); clearTimeout(s.relojAusente); s.E.vence = null; s.E.turnoDesde = null; }
/* Se acabó el tiempo: el servidor juega por quien no respondió, para que la mesa siga. */
function jugarSolo(s) {
  const E = s.E;
  if (!E || E.ganador !== null || E.terminada !== null || s.pendiente || s.votacion) return;
  const ji = E.turno;
  consumir(s);
  const ausente = !s.jugadores[ji].conectado;
  const j = E.jugadores[ji];
  j.pasivos = (j.pasivos || 0) + 1;
  const restan = TURNOS_PASIVOS - j.pasivos;
  E.registro.push(j.nombre + (ausente ? " está ausente" : " se quedó sin tiempo") +
    (restan > 0 ? " (queda" + (restan>1?"n ":" ") + restan + " turno" + (restan>1?"s":"") + " antes de quedar fuera)" : ""));
  if (j.pasivos >= TURNOS_PASIVOS) {
    E.registro.push(j.nombre + " lleva " + TURNOS_PASIVOS + " turnos sin jugar y queda fuera de la partida");
    retirar(s, ji);
    return difundir(s);
  }
  const sug = R.sugerencias(E, ji)[0];
  if (sug) return resolverJugada(s, ji, sug.idx, sug.jugada);
  if (j.mano.length && E.jornales >= R.JORNALES_TURNO)
    E.descarte.push(...j.mano.splice(0,1));
  E.jornales = 0;
  cerrarTurno(s); difundir(s);
}
/* Cualquier acción propia limpia el contador de inactividad. */
function despierta(s, ji) { if (s.E && s.E.jugadores[ji]) s.E.jugadores[ji].pasivos = 0; }

/* ── Jugar una carta, con la ventana de la malla de sombra ── */
function resolverJugada(s, ji, idx, jugada) {
  const E = s.E;
  const carta = E.jugadores[ji].mano[idx];
  /* Solo se le abre la ventana a quien puede contestar: un desconectado no
     reacciona, y dejarlo en la lista congelaba la mesa doce segundos. */
  const blancos = R.atacados(E, ji, jugada)
    .filter(k => E.jugadores[k].mano.some(c => c.tr === "mallasombra"))
    .filter(k => s.jugadores[k].conectado || esBot(s, k));
  if (blancos.length) {
    pausarTurno(s);
    s.pendiente = { tipo:"malla", ji, idx, jugada, carta,
      esperando: blancos, usados: [], vence: Date.now() + SEGUNDOS_MALLA*1000 };
    clearTimeout(s.reloj);
    s.reloj = setTimeout(() => cerrarPendiente(s), SEGUNDOS_MALLA*1000);
    difundir(s);
    botsResponden(s);
    return;
  }
  ejecutar(s, ji, idx, jugada, []);
}
/* Dónde aterriza la carta, para que el cliente la pueda volar hasta ahí */
function destinoDe(jugada) {
  if (jugada.o !== undefined) return { j: jugada.j, o: jugada.o };
  if (jugada.a) return { j: jugada.b.j, o: jugada.b.o };
  if (jugada.j !== undefined) return { j: jugada.j };
  return null;
}
function ejecutar(s, ji, idx, jugada, protegidos) {
  const E = s.E;
  consumir(s);
  const carta = E.jugadores[ji].mano[idx];
  const r = R.aplicar(E, ji, idx, jugada, protegidos);
  E.registro.push(...r.registro);
  E.evento = { n: ++E.eventoN, tipo: r.sonido, ji, carta,
    texto: r.registro[0] || "", destino: destinoDe(jugada) };
  if (r.fin) cerrarTurno(s);
  else { const g = R.ganador(E); if (g !== null) cantar(E, g); else programarTurno(s); }
  difundir(s);
}
function cerrarPendiente(s) {
  clearTimeout(s.reloj);
  const p = s.pendiente, E = s.E;
  if (!p) return;
  s.pendiente = null;

  if (p.tipo === "reelegir") {
    const j = p.opciones[0];
    if (j) ejecutar(s, p.ji, p.idx, j, []);
    else { E.descarte.push(...E.jugadores[p.ji].mano.splice(p.idx,1));
      E.registro.push("La carta se descarta sin efecto"); cerrarTurno(s); difundir(s); }
    return;
  }

  /* malla de sombra */
  if (!p.usados.length) { ejecutar(s, p.ji, p.idx, p.jugada, []); return; }
  p.usados.forEach(k => E.registro.push(E.jugadores[k].nombre + " se cubrió con la malla de sombra"));

  if (R.multiObjetivo(p.jugada.tipo)) { ejecutar(s, p.ji, p.idx, p.jugada, p.usados); return; }

  /* la carta debe buscar otro objetivo válido, incluida la finca propia */
  const otras = R.jugadasLegales(E, p.ji, p.idx)
    .filter(j => !R.atacados(E, p.ji, j).some(k => p.usados.includes(k)));
  if (!otras.length) {
    E.descarte.push(...E.jugadores[p.ji].mano.splice(p.idx,1));
    E.registro.push("Sin otro objetivo válido: la carta se descarta");
    cerrarTurno(s); difundir(s); return;
  }
  otras.sort((a,b) => R.puntuar(E,p.ji,p.carta,b) - R.puntuar(E,p.ji,p.carta,a));
  s.pendiente = { tipo:"reelegir", ji:p.ji, idx:p.idx, carta:p.carta, opciones:otras,
    vence: Date.now() + SEGUNDOS_MALLA*1000 };
  s.reloj = setTimeout(() => cerrarPendiente(s), SEGUNDOS_MALLA*1000);
  difundir(s);
  botsResponden(s);
}

/* ── Bots ───────────────────────────────────────────────────── */
const esBot = (s, i) => !!(s.jugadores[i] && s.jugadores[i].bot);
const RUIDO = { novato: .35, normal: .75, experto: 1 };
/* Jugadas que se disparan al propio pie: un bot no las elige salvo que no haya otra. */
const AUTOGOL = ["plagar","arrasar","lavar","llorona_arrasar","llorona_lavar"];

function eligeBot(E, ji, nivel) {
  const todas = [];
  E.jugadores[ji].mano.forEach((c, idx) =>
    R.jugadasLegales(E, ji, idx).forEach(j =>
      todas.push({ idx, j, score: R.puntuar(E, ji, c, j) })));
  if (!todas.length) return null;
  const sanas = todas.filter(x => !(x.j.j === ji && AUTOGOL.includes(x.j.tipo)));
  const pozo = sanas.length ? sanas : todas;
  pozo.sort((a, b) => b.score - a.score);
  const tino = RUIDO[nivel] || .75;
  if (Math.random() < tino) return pozo[0];
  return pozo[Math.floor(Math.random() * pozo.length)];
}
function turnoBot(s) {
  const E = s.E;
  if (!E || E.ganador !== null || E.terminada !== null || s.pendiente || s.votacion) return;
  const ji = E.turno;
  if (!esBot(s, ji) || E.jugadores[ji].fuera) return;
  consumir(s);
  const el = eligeBot(E, ji, s.jugadores[ji].bot);
  if (el) return resolverJugada(s, ji, el.idx, el.j);
  const mano = E.jugadores[ji].mano;
  if (mano.length && E.jornales >= R.JORNALES_TURNO) {   /* no jugó nada: bota una y cierra */
    E.descarte.push(mano.splice(0, 1)[0]);
    E.registro.push(E.jugadores[ji].nombre + " botó 1 carta");
    E.evento = { n: ++E.eventoN, tipo:"descarte", ji };
  } else E.registro.push(E.jugadores[ji].nombre + " cerró su turno");
  E.jornales = 0;
  cerrarTurno(s); difundir(s);
}
/* Los bots también responden a la malla de sombra y a la reelección de objetivo. */
function botsResponden(s) {
  const p = s.pendiente;
  if (!p) return;
  if (p.tipo === "malla") {
    p.esperando.filter(k => esBot(s, k)).forEach(k => {
      p.esperando = p.esperando.filter(x => x !== k);
      const nivel = s.jugadores[k].bot;
      const usa = Math.random() < (nivel === "experto" ? .85 : nivel === "normal" ? .6 : .3);
      if (usa) {
        const t = s.E.jugadores[k].mano.findIndex(c => c.tr === "mallasombra");
        if (t >= 0) { s.E.descarte.push(s.E.jugadores[k].mano.splice(t,1)[0]); p.usados.push(k); }
      }
    });
    if (!p.esperando.length) setTimeout(() => cerrarPendiente(s), PENSAR_BOT * .6);
    return;
  }
  if (p.tipo === "reelegir" && esBot(s, p.ji))
    setTimeout(() => { if (s.pendiente === p) cerrarPendiente(s); }, PENSAR_BOT);
}

/* ── Salir de la partida y terminarla sin ganador ───────────── */
function acabar(s, motivo) {
  const E = s.E;
  if (!E) return;
  clearTimeout(s.relojAusente); clearTimeout(s.reloj);
  s.pendiente = null; s.votacion = null;
  E.terminada = motivo; E.vence = null; E.turnoDesde = null;
  E.registro.push(motivo);
  E.evento = { n: ++E.eventoN, tipo: "finpartida", ji: null };
}
/* Al retirarse, sus cartas vuelven al descarte: el mazo tiene que seguir cuadrando. */
function retirar(s, ji) {
  const E = s.E, j = E.jugadores[ji];
  if (!E || j.fuera) return;
  j.fuera = true;
  E.descarte.push(...j.mano.splice(0));
  j.finca.forEach(o => E.descarte.push(o.carta, ...o.plagas, ...o.remedios));
  j.finca = [];
  if (j.maldicion) { E.descarte.push(j.maldicion); j.maldicion = null; }
  E.registro.push(j.nombre + " se retiró de la partida");
  if (s.votacion) {
    s.votacion.esperando = s.votacion.esperando.filter(k => k !== ji);
    if (!s.votacion.esperando.length) return cerrarVotacion(s, true);
  }
  const quedan = E.jugadores.filter(R.activo).length;
  if (quedan < 2) return acabar(s, "La partida terminó sin ganador: ya no hay rivales");
  if (E.ganador === null && E.terminada === null) {
    if (E.turno === ji) { R.avanzarTurno(E); const g = R.ganador(E); if (g !== null) cantar(E, g); }
    programarTurno(s);
  }
}
function cerrarVotacion(s, aceptada) {
  clearTimeout(s.relojVoto);
  if (!s.votacion) return;
  const quien = s.jugadores[s.votacion.ji].nombre;
  s.votacion = null;
  if (aceptada) acabar(s, "La mesa acordó terminar la partida sin ganador");
  else { s.E.registro.push("No hubo acuerdo para terminar la partida"); programarTurno(s); }
  difundir(s);
}

/* ── Conexiones ─────────────────────────────────────────────── */
const wss = new WebSocketServer({ server: servidor });
wss.on("connection", ws => {
  ws.sala = null; ws.jugador = null;

  ws.on("message", datos => {
    let m; try { m = JSON.parse(datos); } catch(e) { return; }
    if (m.t === "latido") return;
    const s = ws.sala ? salas.get(ws.sala) : null;
    const j = s && ws.jugador !== null ? s.jugadores[ws.jugador] : null;

    if (m.t === "crear") {
      const nueva = crearSala(m.nombre, ws);
      ws.sala = nueva.codigo; ws.jugador = 0;
      enviar(nueva.jugadores[0], {t:"sesion", codigo:nueva.codigo, token:nueva.jugadores[0].token, yo:0});
      difundir(nueva); return;
    }
    if (m.t === "unir") {
      const sa = salas.get((m.codigo||"").toUpperCase());
      if (!sa) return error(ws, "No existe esa sala");
      if (sa.iniciada) return error(ws, "Esa partida ya empezó");
      if (sa.jugadores.length >= 6) return error(ws, "La mesa está llena");
      const nj = sentar(sa, m.nombre, ws);
      ws.sala = sa.codigo; ws.jugador = nj.id;
      enviar(nj, {t:"sesion", codigo:sa.codigo, token:nj.token, yo:nj.id});
      difundir(sa); return;
    }
    if (m.t === "reconectar") {
      const sa = salas.get((m.codigo||"").toUpperCase());
      if (!sa) return error(ws, "Esa sala ya no existe");
      const q = sa.jugadores.find(x => x.token === m.token);
      if (!q) return error(ws, "No estabas en esa sala");
      if (q.ws && q.ws !== ws && q.ws.readyState === 1) try { q.ws.close(); } catch(e){}
      q.ws = ws; q.conectado = true;
      ws.sala = sa.codigo; ws.jugador = q.id;
      enviar(q, {t:"sesion", codigo:sa.codigo, token:q.token, yo:q.id});
      if (sa.E) sa.E.registro.push(q.nombre + " volvió a la mesa");
      programarTurno(sa); difundir(sa); return;
    }
    if (!s || !j) return;

    if (m.t === "opciones" && ws.jugador === 0 && !s.iniciada) {
      const seg = [0,15,30,45,60,90,120], min = [0,5,10,15,20];
      Object.assign(s.opciones, {
        bonanza: !!m.opciones.bonanza, duelo: !!m.opciones.duelo,
        aprendiz: !!m.opciones.aprendiz, espantos: !!m.opciones.espantos,
        metaCertificada: !!m.opciones.metaCertificada, clima: !!m.opciones.clima,
        segundosTurno: seg.includes(+m.opciones.segundosTurno) ? +m.opciones.segundosTurno : 60,
        minutosJugador: min.includes(+m.opciones.minutosJugador) ? +m.opciones.minutosJugador : 0 });
      return difundir(s);
    }
    if (m.t === "bot" && ws.jugador === 0 && !s.iniciada) {
      if (s.jugadores.length >= 6) return error(ws, "La mesa está llena");
      const nivel = ["novato","normal","experto"].includes(m.nivel) ? m.nivel : "normal";
      sentarBot(s, nivel);
      return difundir(s);
    }
    if (m.t === "quitarbot" && ws.jugador === 0 && !s.iniciada) {
      const i = s.jugadores.map((x,k)=>k).reverse().find(k => s.jugadores[k].bot);
      if (i === undefined) return;
      s.jugadores.splice(i, 1);
      s.jugadores.forEach((x,k) => { x.id = k; if (x.ws) x.ws.jugador = k; });
      return difundir(s);
    }
    if (m.t === "empezar" && ws.jugador === 0 && !s.iniciada) {
      if (s.jugadores.length < 2) return error(ws, "Se necesitan al menos dos jugadores");
      empezar(s); return difundir(s);
    }
    if (m.t === "salir") {
      if (s.iniciada && s.E && s.E.ganador === null && s.E.terminada === null) retirar(s, ws.jugador);
      j.conectado = false; j.ws = null; ws.sala = null;
      const anterior = ws.jugador; ws.jugador = null;
      if (!s.iniciada) {
        s.jugadores = s.jugadores.filter((_,i) => i !== anterior);
        s.jugadores.forEach((x,i) => { x.id = i; if (x.ws) x.ws.jugador = i; });
        if (!s.jugadores.length) salas.delete(s.codigo);
      }
      return difundir(s);
    }
    if (m.t === "terminar" && s.iniciada && s.E.ganador === null && s.E.terminada === null) {
      if (s.votacion || s.pendiente) return error(ws, "Espera a que se resuelva lo que hay en curso");
      const otros = s.jugadores.map((x,i) => i)
        .filter(i => i !== ws.jugador && x_conectado(s, i) && !esBot(s, i) && R.activo(s.E.jugadores[i]));
      if (!otros.length) return acabar(s, "La partida terminó sin ganador"), difundir(s);
      pausarTurno(s);
      s.votacion = { ji: ws.jugador, esperando: otros, vence: Date.now() + 30000 };
      clearTimeout(s.relojVoto);
      s.relojVoto = setTimeout(() => cerrarVotacion(s, false), 30000);
      return difundir(s);
    }
    if (m.t === "voto" && s.votacion && s.votacion.esperando.includes(ws.jugador)) {
      if (!m.si) return cerrarVotacion(s, false);
      s.votacion.esperando = s.votacion.esperando.filter(k => k !== ws.jugador);
      if (!s.votacion.esperando.length) return cerrarVotacion(s, true);
      return difundir(s);
    }
    if (m.t === "revancha" && s.iniciada && (s.E.ganador !== null || s.E.terminada !== null)) {
      empezar(s); return difundir(s);
    }

    /* respuesta a la malla de sombra */
    if (m.t === "malla" && s.pendiente && s.pendiente.tipo === "malla") {
      const p = s.pendiente;
      if (!p.esperando.includes(ws.jugador)) return;
      despierta(s, ws.jugador);
      p.esperando = p.esperando.filter(k => k !== ws.jugador);
      if (m.usar) {
        const k = s.E.jugadores[ws.jugador].mano.findIndex(c => c.tr === "mallasombra");
        if (k >= 0) { s.E.descarte.push(s.E.jugadores[ws.jugador].mano.splice(k,1)[0]); p.usados.push(ws.jugador); }
      }
      if (!p.esperando.length) cerrarPendiente(s); else difundir(s);
      return;
    }
    if (m.t === "reelegir" && s.pendiente && s.pendiente.tipo === "reelegir" && s.pendiente.ji === ws.jugador) {
      const p = s.pendiente, el = p.opciones[m.i];
      if (!el) return;
      clearTimeout(s.reloj); s.pendiente = null;
      return ejecutar(s, p.ji, p.idx, el, []);
    }

    if (!s.iniciada || !s.E || s.E.ganador !== null || s.E.terminada !== null || s.pendiente || s.votacion) return;
    if (s.E.turno !== ws.jugador) return error(ws, "No es tu turno");

    if (m.t === "jugar") {
      despierta(s, ws.jugador);
      const legales = R.jugadasLegales(s.E, ws.jugador, m.idx);
      const el = legales.find(x => JSON.stringify(x) === JSON.stringify(m.jugada));
      if (!el) return error(ws, "Esa jugada no es legal");
      return resolverJugada(s, ws.jugador, m.idx, el);
    }
    if (m.t === "pasar") {
      despierta(s, ws.jugador);
      const hay = s.E.jugadores[ws.jugador].mano.some((_,i)=>R.jugadasLegales(s.E, ws.jugador, i).length);
      const yaTrabajo = s.E.jornales < R.JORNALES_TURNO;
      if (hay && !yaTrabajo) return error(ws, "Todavía tienes jugadas posibles con tus dos jornales");
      s.E.registro.push(j.nombre + (yaTrabajo ? " cerró su turno" : " no tenía jugada y pasó"));
      s.E.jornales = 0;
      consumir(s); cerrarTurno(s); return difundir(s);
    }
    if (m.t === "descartar") {
      despierta(s, ws.jugador);
      if (s.E.jornales < R.JORNALES_TURNO)
        return error(ws, "Ya empezaste a trabajar este turno: descartar es para cuando no juegas nada");
      const idxs = [...new Set(m.idxs)].filter(i => i>=0 && i<s.E.jugadores[ws.jugador].mano.length);
      if (!idxs.length) return error(ws, "Elige al menos una carta");
      idxs.sort((a,b)=>b-a).forEach(i => s.E.descarte.push(s.E.jugadores[ws.jugador].mano.splice(i,1)[0]));
      s.E.registro.push(j.nombre + " botó " + idxs.length + (idxs.length>1?" cartas":" carta"));
      s.E.jornales = 0;
      s.E.evento = { n: ++s.E.eventoN, tipo:"descarte", ji: ws.jugador };
      consumir(s); cerrarTurno(s); return difundir(s);
    }
  });

  ws.on("close", () => {
    const s = ws.sala ? salas.get(ws.sala) : null;
    if (!s || ws.jugador === null) return;
    const j = s.jugadores[ws.jugador];
    if (j.ws === ws) { j.conectado = false; j.ws = null; }
    if (!s.iniciada) {          /* en la sala de espera, el que se va libera la silla */
      s.jugadores = s.jugadores.filter(x => x !== j);
      s.jugadores.forEach((x,i) => { x.id = i; if (x.ws) x.ws.jugador = i; });
    }
    if (!vivos(s) && !s.iniciada) salas.delete(s.codigo);
    else { programarTurno(s); difundir(s); }
  });
});

/* limpieza de salas viejas */
setInterval(() => {
  const ahora = Date.now();
  salas.forEach((s,c) => { if (!vivos(s) && ahora - s.creada > VIDA_SALA) salas.delete(c); });
}, 10*60*1000);

/* Se escucha en 0.0.0.0 a propósito. Sin indicar interfaz, Node se ata a «::»
   y en un contenedor con IPv6 restringido queda oyendo solo por IPv6: el
   servidor arranca, imprime que todo va bien, y el proveedor nunca logra
   alcanzarlo por IPv4, así que el despliegue se queda «en progreso» para
   siempre sin un solo error en el registro. Una palabra evita esa noche. */
const CASA = process.env.HOST || "0.0.0.0";

/* ── Revisión de arranque ───────────────────────────────────────
   Si al subir el proyecto se queda por fuera algún archivo de public/, el
   servidor arranca igual y dice que todo va bien: el fallo solo aparece
   cuando alguien pide la página. Y como el proveedor comprueba la salud
   pidiendo «/», un index.html ausente deja el despliegue «en progreso»
   para siempre, sin una sola línea de error. Más vale mirar y avisar. */
const IMPRESCINDIBLES = ["index.html", "reglas.js", "arte.js", "sonido.js", "cliente.js"];
const faltantes = IMPRESCINDIBLES.filter(f => !fs.existsSync(path.join(PUBLICO, f)));
if (faltantes.length) {
  console.error("\n  ✗ Faltan archivos dentro de public/: " + faltantes.join(", "));
  console.error("    Se esperaban en " + PUBLICO);
  console.error("    Encontrados:    " +
    (fs.existsSync(PUBLICO) ? (fs.readdirSync(PUBLICO).join(", ") || "la carpeta está vacía")
                            : "la carpeta public/ no existe"));
  console.error("\n    Casi siempre es que al subir el proyecto se aplanó la estructura y los");
  console.error("    archivos de public/ quedaron sueltos en la raíz. En el repositorio tiene");
  console.error("    que existir public/index.html, con esa ruta exacta.");
  console.error("\n    Sin esos archivos la página no carga y el despliegue nunca termina,");
  console.error("    así que el servidor se detiene aquí en vez de fingir que está bien.\n");
  process.exit(1);
}

servidor.listen(PUERTO, CASA, () => {
  /* En la nube, «localhost» es la dirección del contenedor y no le sirve a
     nadie; se imprime la pública cuando el proveedor la da a conocer. */
  const publica = process.env.RENDER_EXTERNAL_URL;
  console.log(publica
    ? "Cosecha lista en " + publica + "  (escuchando en " + CASA + ":" + PUERTO + ")"
    : "Cosecha escuchando en http://localhost:" + PUERTO);
});
