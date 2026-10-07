/* Pruebas de las cuentas (public/cuenta.js): cómo se juntan el avance del
   teléfono y el de la nube. Corren sin navegador ni Supabase.

       node pruebas-cuenta.js */
const C = require("./public/cuenta.js");
let fallos = 0;
const ok = (c, m) => { if (c) console.log("   ✓ " + m); else { fallos++; console.log("   ✗ " + m); } };
const V = o => JSON.stringify(Object.assign({ v: 1, granos: 0, total: 0, laminas: {}, records: {}, acertijo: { dias: {}, racha: 0, ultimo: "" }, partidas: {} }, o));
const P = t => JSON.parse(t);

console.log("\nCuentas: juntar el avance");
{
  const tel = { "cosecha.nombre": "Lucía", "cosecha.cara": "4",
    "cosecha.vereda": V({ granos: 30, total: 50, laminas: { c_cafe: 5, c_cacao: 9 }, records: { colores: { "1": 12 } }, partidas: { colores: 3 } }) };
  const nube = { "cosecha.nombre": "Lucía M", "cosecha.cara": "7",
    "cosecha.vereda": V({ granos: 20, total: 80, laminas: { c_cafe: 2, f_trueque: 4 }, records: { colores: { "1": 9, "2": 14 }, parejas: { "1": 30 } }, partidas: { colores: 5 } }) };
  const j = C.juntar(tel, nube, "remoto"), v = P(j["cosecha.vereda"]);
  ok(Object.keys(v.laminas).sort().join() === "c_cacao,c_cafe,f_trueque" && v.laminas.c_cafe === 2, "el álbum se une sin perder láminas (y queda la fecha más vieja)");
  ok(v.records.colores["1"] === 12 && v.records.colores["2"] === 14 && v.records.parejas["1"] === 30, "de cada récord queda el mayor");
  ok(v.granos === 30 && v.total === 80 && v.partidas.colores === 5, "granos y partidas: el mayor");
  ok(j["cosecha.nombre"] === "Lucía M" && j["cosecha.cara"] === "7", "al entrar por primera vez, nombre y avatar vienen de la cuenta");
  ok(C.juntar(tel, nube, "local")["cosecha.cara"] === "4", "si el teléfono ya era de la cuenta, gana lo del teléfono");
}

{
  const fin = xp => JSON.stringify({ v: 1, xp, lotes: [] });
  const j1 = C.juntar({ "cosecha.finca": fin(40) }, { "cosecha.finca": fin(12) }, "remoto");
  const j2 = C.juntar({ "cosecha.finca": fin(3) }, { "cosecha.finca": fin(90) }, "local");
  ok(JSON.parse(j1["cosecha.finca"]).xp === 40 && JSON.parse(j2["cosecha.finca"]).xp === 90, "de dos fincas queda la que más ha crecido, sin mezclarlas");
}

console.log("\nCuentas: qué hacer al encontrarse");
{
  const uid = "u1", loc = { "cosecha.nombre": "Ana", "cosecha.vereda": V({ granos: 5 }) }, rem = { "cosecha.nombre": "Ana", "cosecha.vereda": V({ granos: 40 }) };
  ok(C.decidir({ local: loc, remoto: null, uid }).accion === "subir", "cuenta nueva: se sube lo del teléfono");
  ok(C.decidir({ local: { "cosecha.efectos": "1" }, remoto: rem, remotoFecha: "t1", uid }).accion === "bajar", "teléfono vacío: se baja lo de la cuenta");
  ok(C.decidir({ local: loc, remoto: rem, remotoFecha: "t1", uid }).accion === "juntar", "teléfono con avance sin cuenta: se juntan");
  const sinc = { uid, remoto: "t1", huella: C.huella(loc) };
  ok(C.decidir({ local: loc, remoto: rem, remotoFecha: "t1", sinc, uid }).accion === "nada", "nada cambió: no se hace nada");
  ok(C.decidir({ local: loc, remoto: rem, remotoFecha: "t2", sinc, uid }).accion === "bajar", "cambió solo la nube (otro teléfono): se baja");
  const gasto = { ...loc, "cosecha.vereda": V({ granos: 1 }) };
  const d = C.decidir({ local: gasto, remoto: loc, remotoFecha: "t1", sinc, uid });
  ok(d.accion === "subir" && P(d.datos["cosecha.vereda"]).granos === 1, "gastó granos en este teléfono: se sube tal cual (no vuelven los granos gastados)");
  ok(C.decidir({ local: gasto, remoto: rem, remotoFecha: "t2", sinc, uid }).accion === "juntar", "cambiaron los dos lados: se juntan");
  ok(C.decidir({ local: loc, remoto: rem, remotoFecha: "t1", sinc: { ...sinc, uid: "otro" }, uid }).accion === "juntar", "el teléfono era de otra cuenta: se trata como avance sin cuenta");
}
console.log(fallos ? "\n" + fallos + " prueba(s) fallaron" : "\nLas cuentas están en orden");
process.exit(fallos ? 1 : 0);
