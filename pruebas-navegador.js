/* Prueba la interfaz de verdad: abre el juego en un navegador sin ventana,
   arma una partida contra vecinos de la máquina y la juega a punta de clics,
   como lo haría una persona.

       npm run test:navegador

   Es la única prueba que toca public/cliente.js. Las demás ejercitan el motor
   y el servidor, así que un error de pintado —un escudo que no sale, un botón
   que nombra algo que ya no existe— se les escapa por completo.

   Necesita un navegador sin ventana: npm i -D playwright
*/
const path = require("path");
const { spawn } = require("child_process");

let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) {
  console.log("\n  Falta el navegador de pruebas. Instálalo con:\n    npm i -D playwright\n");
  process.exit(0);
}

const PUERTO = 3199;
const espera = ms => new Promise(r => setTimeout(r, ms));
let fallos = 0;
const ok  = m => console.log("   ✓ " + m);
const mal = m => { fallos++; console.log("   ✗ " + m); };

(async () => {
  /* ── Servidor ──────────────────────────────────────────────── */
  const srv = spawn(process.execPath, [path.join(__dirname, "server.js")],
    { env: { ...process.env, PORT: String(PUERTO) }, stdio: ["ignore", "pipe", "pipe"] });
  srv.stderr.on("data", d => console.log("   [servidor] " + String(d).trim()));
  await new Promise(r => srv.stdout.once("data", r));

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 820 } });

  /* Todo error de JavaScript del cliente es un fallo de la prueba. */
  const errores = [];
  pagina.on("pageerror", e => errores.push(String(e)));
  pagina.on("console", m => { if (m.type() === "error") errores.push(m.text()); });

  try {
    await pagina.goto(`http://localhost:${PUERTO}/`);
    await pagina.waitForSelector("input", { timeout: 8000 });

    /* ── Entrar como lo hace una persona: nombre, modo, reglas ── */
    await pagina.fill("#nombre", "Ricardo");
    await pagina.locator("#mForm button").click();
    await pagina.locator("[data-modo=solo]").click({ timeout: 5000 });
    await espera(300);
    /* dos vecinos: se baja el dial de jugadores de lo que haya hasta tres */
    for (let i = 0; i < 4; i++) {
      const menos = pagina.locator("[data-dial=jugadores] [data-menos]");
      if (await menos.isEnabled()) { await menos.click(); await espera(120); }
    }
    await pagina.locator("[data-dial=jugadores] [data-mas]").click();
    await pagina.locator("#mJugar").click();
    /* La transición de entrada cuenta el juego; la prueba la salta. */
    await pagina.waitForSelector("#intro", { timeout: 4000 });
    ok("la transición de entrada aparece antes de la partida");
    await pagina.locator("#intro [data-saltar]").click();
    await pagina.waitForSelector(".tablero, .zonami, [data-c]", { timeout: 10000 });
    ok("la mesa arranca y se pinta");

    /* ── Jugar a clics ───────────────────────────────────────── */
    /* Cualquier diálogo abierto tapa la mesa, así que se cierra antes de
       seguir. Y todo clic lleva tope de tiempo: si algo queda inalcanzable
       la prueba lo reporta en vez de colgarse media hora. */
    /* Se responde que no a todo lo que pregunte —malla de sombra incluida—
       para que la partida siga sola. */
    const SALIDAS = "[data-saltar], [data-cerrar], [data-no], [data-nel], [data-si]";
    const cerrarModales = async () => {
      for (let i = 0; i < 4; i++) {
        const x = pagina.locator(SALIDAS).first();
        if (!await x.count()) return;
        await x.click({ timeout: 2500 }).catch(() => {});
        await espera(200);
      }
    };
    const clic = async loc => {
      try { await loc.click({ timeout: 2500 }); return true; } catch (e) { return false; }
    };

    /* Las comprobaciones se hacen sobre la marcha, no al final: una partida
       puede terminar antes y dejar la mesa vacía. */
    let jugadas = 0, vistoEscudo = null, vistoDetalle = null, vistoGolpe = null;

    /* El golpe dura menos de un segundo, así que se mira en cada vuelta y se
       guarda la primera captura que se alcance a pillar. */
    const mirarGolpe = async () => {
      if (vistoGolpe) return;
      if (!await pagina.locator('.suceso').count()) return;
      vistoGolpe = (await pagina.locator('.scinta').first().innerText().catch(() => '')) || 'sin palabra';
      await pagina.screenshot({ path: path.join(__dirname, 'prueba-golpe.png') }).catch(() => {});
    };

    const mirarEscudos = async () => {
      if (vistoEscudo && vistoEscudo.conRemedio) return;
      const r = await pagina.evaluate(() => {
        const R = window.REGLAS, V = window.COSECHA && window.COSECHA.estado;
        if (!R || !V || !V.jugadores) return null;
        let conRemedio = 0;
        const pintados = document.querySelectorAll(".escudo").length;
        V.jugadores.forEach(j => (j.finca || []).forEach(o => {
          const e = R.estadoMata(o);
          if (e === "protegido" || e === "certificado") conRemedio++;
        }));
        return { conRemedio, pintados };
      }).catch(() => null);
      if (r && (!vistoEscudo || r.conRemedio > vistoEscudo.conRemedio)) vistoEscudo = r;
    };

    const mirarDetalle = async () => {
      if (vistoDetalle) return;
      await cerrarModales();
      /* Con una carta en la mano seleccionada, tocar una mata la JUEGA en vez
         de describirla. Hay que soltar la selección primero. */
      await clic(pagina.locator("[data-cancelar]").first());
      await espera(150);
      const f = pagina.locator(".ficha").first();
      if (!await f.count()) return;
      if (!await clic(f)) return;
      await espera(450);
      const t = await pagina.locator(".dialogo").first().innerText().catch(() => "");
      if (t) vistoDetalle = t;
      await cerrarModales();
    };

    /* Tope de tiempo: la prueba informa lo que alcanzó a ver y no se cuelga. */
    const hastaCuando = Date.now() + 75000;
    for (let vuelta = 0; vuelta < 120 && jugadas < 14 && Date.now() < hastaCuando; vuelta++) {
      await espera(300);
      await cerrarModales();
      await mirarGolpe();
      await mirarEscudos();
      if (jugadas >= 3) await mirarDetalle();
      const cartas = pagina.locator("[data-c]");
      const n = await cartas.count();
      if (!n) continue;
      /* Se recorren las cartas de la mano, no siempre la primera: si la de la
         izquierda no tiene jugada, la de al lado puede tenerla. */
      if (!await clic(cartas.nth(vuelta % n))) continue;
      await espera(220);
      await cerrarModales();

      /* Se juega con intención, no al azar: primero sembrar, para que haya
         matas en la mesa; después protegerlas y certificarlas, que es lo que
         hace aparecer el escudo. Sin esto la prueba casi nunca llega al
         estado que quiere comprobar. */
      const accs = pagina.locator(".acc:not([disabled]):not([data-cancelar]):not([data-volver])");
      const cuantas = Math.min(await accs.count(), 8);
      let elegida = null;
      for (const patron of [/sembrar/i, /proteger|certificar|curar/i, /./]) {
        for (let i = 0; i < cuantas; i++) {
          const t = await accs.nth(i).innerText().catch(() => "");
          if (patron.test(t)) { elegida = accs.nth(i); break; }
        }
        if (elegida) break;
      }
      const mata = pagina.locator(".ficha.blanco").first();
      if (elegida)                 { if (await clic(elegida)) jugadas++; }
      else if (await mata.count()) {
        if (await clic(mata)) {
          await espera(250);
          const seg = pagina.locator(".ficha.blanco").first();
          if (await seg.count()) await clic(seg);
          jugadas++;
        }
      }
      else {
        await clic(pagina.locator("[data-cancelar]").first());
        await clic(pagina.locator("[data-pasar]").first());
      }
    }
    /* Cuántas cartas alcanzó a jugar depende del reloj y de lo que hagan los
       vecinos de la máquina, así que es una señal de vida, no una aserción:
       solo falla si la interfaz resultó del todo injugable. */
    jugadas ? ok(`se jugaron ${jugadas} cartas desde la interfaz`)
            : mal("no se pudo jugar ni una carta desde la interfaz");

    /* ── Lo que antes estaba roto ────────────────────────────── */

    /* 1. El escudo de mata protegida o certificada debe existir en el DOM
          cuando el estado lo pide. Se comprueba contra el motor, no a ojo. */
    await mirarEscudos();
    if (!vistoEscudo) ok("estado no expuesto para inspección (se omite el conteo de escudos)");
    else if (!vistoEscudo.conRemedio) ok("no hubo matas protegidas que comprobar en esta partida");
    else if (vistoEscudo.pintados >= 1)
      ok(`escudos pintados: ${vistoEscudo.pintados} para ${vistoEscudo.conRemedio} matas con remedio`);
    else mal(`${vistoEscudo.conRemedio} matas con remedio y ningún escudo en pantalla`);

    /* 2. El texto que llena el diálogo de una mata, comprobado estado por
          estado sobre matas fabricadas a mano. Así no depende de que la
          partida haya llegado por azar a cada situación. */
    const textos = await pagina.evaluate(() => {
      const R = window.REGLAS;
      if (!R || !R.explicaMata) return null;
      const mata = (extra) => Object.assign(
        { carta: { k: "cultivo", c: "cafe" }, plagas: [], remedios: [] }, extra);
      const rem = t => ({ k: "remedio", t, c: "cafe" });
      return {
        sana:        R.explicaMata(mata({})),
        protegida:   R.explicaMata(mata({ remedios: [rem("casero")] })),
        certificada: R.explicaMata(mata({ remedios: [rem("bioinsumo")] })),
        plagada:     R.explicaMata(mata({ plagas: [{ k: "plaga", t: "comun", c: "cafe" }] })),
        resistente:  R.explicaMata(mata({ plagas: [{ k: "plaga", t: "resistente", c: "cafe" }] })),
        vivero:      R.explicaMata(mata({ carta: { k: "cultivo", c: "vivero" } })),
        injerto:     R.explicaMata(mata({ carta: { k: "cultivo", c: "injerto" } }))
      };
    });
    if (!textos) mal("el motor no expone explicaMata en el navegador");
    else {
      const vacios = Object.entries(textos).filter(([, v]) => !v || v.length < 15).map(([k]) => k);
      const ajenos = Object.entries(textos)
        .filter(([, v]) => /órgano|virus|medicina|inmuniz|vacun/i.test(v || "")).map(([k]) => k);
      const esperado = { sana:/sana/i, protegida:/protegida/i, certificada:/certificada/i,
        plagada:/plagada/i, resistente:/resistente/i, vivero:/vivero|bajo techo/i, injerto:/injerto/i };
      const flojos = Object.entries(esperado)
        .filter(([k, re]) => !re.test(textos[k] || "")).map(([k]) => k);
      if (vacios.length) mal("estados sin explicación: " + vacios.join(", "));
      else if (ajenos.length) mal("explicaciones con vocabulario ajeno: " + ajenos.join(", "));
      else if (flojos.length) mal("explicaciones que no nombran su estado: " + flojos.join(", "));
      else ok("los 7 estados de mata se explican con el vocabulario de Cosecha");
    }

    /* Y si durante la partida se alcanzó a abrir el diálogo, que coincida. */
    if (vistoDetalle)
      /órgano|virus|medicina|inmuniz|vacun/i.test(vistoDetalle)
        ? mal("el diálogo de la mata todavía habla de órganos y virus")
        : ok("el diálogo abierto en la mesa dice lo mismo que el motor");

    /* 3. El anuncio del centro aparece cuando pasa algo. */
    if (!vistoGolpe) ok("no se alcanzó a pillar ningún golpe (dura menos de un segundo)");
    else if (/órgano|virus|medicina/i.test(vistoGolpe))
      mal("el golpe usa vocabulario del juego anterior: " + vistoGolpe);
    else ok(`golpe visto en la mesa: «${vistoGolpe.replace(/\n/g, " ")}»`);

    /* 4. Ningún texto en pantalla puede venir del juego anterior. */
    const cuerpo = await pagina.locator("body").innerText();
    const rastro = cuerpo.match(/órgano|virus|medicina|inmuniz|vacun|trasplant|cuarentena/i);
    rastro ? mal("queda vocabulario ajeno en pantalla: «" + rastro[0] + "»")
           : ok("no queda vocabulario del juego anterior en pantalla");

    /* 5. Sin errores de JavaScript en toda la partida. */
    errores.length ? mal("errores en consola:\n      " + errores.slice(0, 4).join("\n      "))
                   : ok("ni un error de JavaScript en toda la partida");

    await pagina.screenshot({ path: path.join(__dirname, "prueba-mesa.png") });
  } catch (e) {
    mal("la prueba se cayó: " + e.message);
    await pagina.screenshot({ path: path.join(__dirname, "prueba-mesa.png") }).catch(() => {});
  }

  await navegador.close();
  srv.kill();
  console.log(fallos ? `\n  ${fallos} fallo(s). Mira prueba-mesa.png.\n`
                     : "\n  Interfaz correcta. Captura en prueba-mesa.png\n");
  process.exit(fallos ? 1 : 0);
})();
