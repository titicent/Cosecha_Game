/* Escribe public/config.js con la dirección del servidor del juego.

       COSECHA_SERVIDOR=cosecha.onrender.com node configurar-frente.js

   Lo usa el sitio estático de Render (ver render.yaml): la página se publica
   aparte, abre al instante y habla con el servidor por esa dirección. Acepta
   la dirección con o sin https://, que es como la entrega Render. */
const fs = require("fs"), path = require("path");
let s = (process.env.COSECHA_SERVIDOR || "").trim().replace(/\/+$/, "");
/* Render entrega el nombre del servicio sin dominio («cosecha-ehrm»): se le
   completa .onrender.com, que es su dirección pública. */
if (s && !/^https?:\/\//.test(s) && !s.includes(".") && !s.startsWith("localhost")) s += ".onrender.com";
if (s && !/^https?:\/\//.test(s)) s = "https://" + s;
fs.writeFileSync(path.join(__dirname, "public", "config.js"),
  `/* Generado por configurar-frente.js */\nwindow.COSECHA_SERVIDOR = window.COSECHA_SERVIDOR || ${JSON.stringify(s)};\n`);
console.log("  config.js → servidor: " + (s || "el mismo sitio de la página"));
