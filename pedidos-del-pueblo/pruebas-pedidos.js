/* Pedidos del pueblo — pruebas del motor: miles de partidas con vecinos de la máquina.
       npm test
   Revisa que no se pierdan cartas, que ninguna finca pase de 4 matas, que
   ninguna mata lleve un remedio que no le sirve, que toda partida termine,
   y mide el equilibrio por puesto. */
const R = require("./public/pedidos-reglas.js");
let fallos = 0;
const ok = (c, m) => { if (c) console.log("   ✓ " + m); else { fallos++; console.log("   ✗ " + m); } };

function total(E) {
  return E.mazo.length + E.descarte.length + E.pedidos.length + E.fila.filter(Boolean).length +
    E.climas.length + E.climasVistos.length + (E.bonanza ? 1 : 0) +
    E.jugadores.reduce((a, j) => a + j.mano.length + j.bodega.length + j.pedidos.length + j.bonanzas.length +
      j.finca.reduce((b, m) => b + 1 + (m.remedio ? 1 : 0), 0), 0);
}
function invariantes(E, esperado) {
  const t = total(E);
  if (t !== esperado) throw new Error("cartas perdidas: " + t + " de " + esperado);
  E.jugadores.forEach(j => {
    if (j.finca.length > R.PARCELAS) throw new Error("finca con " + j.finca.length + " matas");
    j.finca.forEach(m => { if (m.remedio && !R.afecta(m.remedio.c, m.carta.c)) throw new Error("remedio que no le sirve a la mata"); });
    if (j.mano.some(x => x.k === "nube")) throw new Error("nube en la mano");
  });
  if (E.jornales < 0) throw new Error("jornales negativos");
}
function partida(n, semilla, modo, nivel) {
  const E = R.nuevaPartida(R.NOMBRES_BOT.slice(0, n), { modo, semilla });
  const esperado = total(E);
  let s = semilla * 7 + 1; const azar = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  let pasos = 0;
  while (!E.terminada && pasos++ < 5000) {
    const ji = E.turno;
    const j = R.elegir(E, ji, nivel || "baquiano", azar);
    const v = R.validar(E, ji, j);
    if (!v) throw new Error("el bot propuso una jugada ilegal: " + JSON.stringify(j));
    R.aplicar(E, ji, v);
    invariantes(E, esperado);
  }
  if (!E.terminada) throw new Error("la partida no terminó");
  return E;
}

console.log("\nPartidas completas");
for (const modo of ["completo", "primera"]) {
  for (const n of [2, 3, 4, 5]) {
    const N = 1500, gana = Array(n).fill(0); let err = 0, turnos = 0, tierra = 0, primero;
    for (let k = 0; k < N; k++) {
      try {
        const E = partida(n, 1000 + k, modo);
        turnos += E.turnosJugados; tierra += E.finPor === "tierra";
        /* victoria por puesto relativo al que empezó; los empates reparten */
        E.ganadores.forEach(g => gana[(g - E.primero + n) % n] += 1 / E.ganadores.length);
      } catch (e) { if (err++ < 3) console.log("     " + e.message); }
    }
    const pc = gana.map(x => Math.round(100 * x / N));
    ok(err === 0, `${modo} ${n}j: ${N} partidas sin errores · puestos ${pc.join("/")} · ${(turnos / N / n).toFixed(1)} turnos c/u · tierra agotada ${Math.round(100 * tierra / N)}%`);
    ok(Math.max(...pc) - Math.min(...pc) <= 8, `${modo} ${n}j: brecha entre puestos ≤ 8`);
  }
}

console.log("\nReglas puntuales");
{
  const E = R.nuevaPartida(["A", "B"], { semilla: 5 });
  const yo = E.jugadores[E.turno];
  yo.mano = [{ id: "t1", k: "cultivo", c: "cafe" }, { id: "t2", k: "plaga", c: "cafe" }, { id: "t3", k: "remedio", c: "cacao" }, { id: "t4", k: "plaga", c: "huerta" }];
  const L = R.jugadas(E, E.turno);
  ok(L.some(x => x.tipo === "sembrar"), "se puede sembrar");
  ok(!L.some(x => x.tipo === "proteger"), "un remedio de cacao no protege nada si no hay cacao ni huerta");
  const s = R.validar(E, E.turno, { tipo: "sembrar", idx: 0 }); R.aplicar(E, E.turno, s);
  ok(yo.finca.length === 1 && !yo.finca[0].madura, "se siembra acostado (brote)");
  const pl = R.jugadas(E, E.turno).filter(x => x.tipo === "plagar");
  ok(pl.length === 2, "la broca y la langosta le entran al café propio");
  ok(R.validar(E, E.turno, { tipo: "cosechar", o: 0 }) === null, "un brote no se cosecha");
  ok(R.cubre([{ c: "cafe" }, { c: "huerta" }], ["cafe", "cafe"]) !== null, "la huerta reemplaza un ingrediente");
  ok(R.cubre([{ c: "huerta" }, { c: "huerta" }], ["cafe", "cafe"]) === null, "pero solo una huerta por pedido");
  ok(R.validar(E, E.turno, { tipo: "botar", idxs: [0, 1, 2] }) === null, "no se botan 3 cartas");
}
{
  const E = R.nuevaPartida(["A", "B", "C"], { semilla: 9 });
  const brotes = [0, 1, 2].map(k => E.jugadores[(E.primero + k) % 3]);
  ok(brotes[0].finca.length === 3 && brotes[0].finca.every(m => m.madura) && brotes[1].finca.length === 2 && brotes[2].finca.length === 1,
    "siembra de apertura 3-2-1, y al primero se le enderezan al empezar");
  ok(E.meta === 7, "meta de 3 jugadores: 7");
}
{
  const E = R.nuevaPartida(["A", "B"], { modo: "primera", semilla: 3 });
  ok(!E.mazo.concat(...E.jugadores.map(j => j.mano)).some(x => x.k === "faena"), "Primera cosecha: sin faenas");
  ok(R.crearMazo("completo").length === 86 && R.crearPedidos().length === 16 && R.crearClimas().length === 6, "86 + 16 + 6 = 108 cartas");
}

/* ── Madura y cosecha ─────────────────────────────────────── */

/* ── En línea: el servidor de Cosecha atiende las salas de Pedidos ── */
console.log("\nEn línea");
const { spawn } = require("child_process");
const WebSocket = require("ws");
const PUERTO = 3917;
const srv = spawn(process.execPath, ["server.js"], { cwd: __dirname, env: Object.assign({}, process.env, { PORT: PUERTO, PENSAR_BOT: 5 }), stdio: "ignore" });
const espera = ms => new Promise(r => setTimeout(r, ms));
function cliente() {
  return new Promise((ok, mal) => {
    const ws = new WebSocket("ws://localhost:" + PUERTO);
    ws.ultima = null; ws.errores = []; ws.sesion = null;
    ws.on("message", d => { const m = JSON.parse(d);
      if (m.t === "vista") { ws.ultima = m.v; ws.nv = (ws.nv || 0) + 1; } if (m.t === "error") ws.errores.push(m.msg); if (m.t === "sesion") ws.sesion = m; });
    ws.on("open", () => ok(ws)); ws.on("error", mal);
  });
}
const manda = (ws, m) => ws.send(JSON.stringify(Object.assign({ juego: "pedidos" }, m)));
(async () => {
  let c; for (let k = 0; k < 40; k++) { try { c = await cliente(); break; } catch (e) { await espera(150); } }
  try {
    /* 1 · contra la máquina, jugando hasta el final */
    manda(c, { t: "crear", nombre: "Ricardo", opciones: { modo: "completo" }, bots: ["normal", "baquiano"], empezar: true });
    await espera(300);
    ok(c.ultima && c.ultima.iniciada && c.ultima.juego === "pedidos" && c.ultima.jugadores.length === 3, "crea la mesa de Pedidos con dos vecinos y empieza");
    ok(c.ultima.fila && c.ultima.fila.length === 3, "hay 3 pedidos en la fila");
    const otros = c.ultima.jugadores.filter((_, i) => i !== c.ultima.yo);
    ok(otros.every(j => !Array.isArray(j.mano)), "no se ven las manos ajenas");
    let vista = -1;
    for (let paso = 0; paso < 8000 && !c.ultima.terminada; paso++) {
      const v = c.ultima;
      if (c.nv !== vista && v.turno === v.yo && v.jugadas && v.jugadas.length) {
        vista = c.nv;
        const pref = ["entregar", "cosechar", "sembrar", "proteger", "terminar"];
        let j = null; for (const t of pref) { j = v.jugadas.find(x => x.tipo === t); if (j) break; }
        if (!j) j = Object.assign({}, v.jugadas[0], v.jugadas[0].tipo === "botar" ? { idxs: [0] } : {});
        manda(c, { t: "jugar", jugada: j });
      }
      await espera(15);
    }
    ok(c.ultima.terminada && Array.isArray(c.ultima.ganadores), "la partida en línea termina con ganador(es)");
    ok(!c.errores.length, "sin errores del servidor" + (c.errores.length ? ": " + c.errores[0] : ""));
    /* 2 · sala privada con código */
    const a = await cliente(), b = await cliente();
    manda(a, { t: "crear", nombre: "Ana" }); await espera(150);
    const cod = a.ultima.codigo;
    manda(b, { t: "unir", codigo: cod, nombre: "Beto" }); await espera(150);
    ok(a.ultima.sillas.length === 2 && b.ultima.sillas[1].nombre === "Beto", "sala privada: el segundo entra con el código " + cod);
    manda(b, { t: "empezar" }); await espera(100);
    ok(b.errores.some(e => /Solo quien/.test(e)), "solo el anfitrión empieza");
    manda(a, { t: "empezar" }); await espera(150);
    ok(a.ultima.iniciada && b.ultima.iniciada, "la mesa privada arranca");
    /* 3 · el juego clásico sigue en su sitio */
    const k = await cliente(); let clasica = null;
    k.on("message", d => { const m = JSON.parse(d); if (m.t === "estado" || m.t === "sala" || m.sala || m.codigo) clasica = m; });
    k.send(JSON.stringify({ t: "crear", nombre: "Clásico" })); await espera(200);
    ok(clasica !== null && !k.errores.length, "una sala de Cosecha clásico se sigue creando igual");
    /* 4 · reconexión */
    const tok = a.sesion; a.close(); await espera(100);
    const a2 = await cliente(); manda(a2, { t: "reconectar", codigo: tok.codigo, token: tok.token }); await espera(150);
    ok(a2.ultima && a2.ultima.yo === tok.yo && a2.ultima.iniciada, "al volver, recupera su puesto");
  } catch (e) { ok(false, "en línea: " + e.message); }
  srv.kill();
  console.log(fallos ? `\n${fallos} prueba(s) fallaron\n` : "\nTodo en orden\n");
  process.exit(fallos ? 1 : 0);
})();
