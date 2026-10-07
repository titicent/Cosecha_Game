/* ═══════════════════════════════════════════════════════════════
   CUENTA — guardar el avance en la nube (opcional)
   Sin cuenta, todo se guarda en el teléfono, como siempre. Con cuenta
   (por ahora con Google), el avance se sube a Supabase y se recupera en
   cualquier otro teléfono o computador al entrar con la misma cuenta.

   Lo que se guarda son las mismas llaves de localStorage que ya usa el
   juego (CLAVES). Así ningún juego tiene que saber de cuentas: este archivo
   las lee, las sube y, al entrar en otro teléfono, las baja.

   Cómo se resuelven los choques:
     · Primera vez que alguien entra en un teléfono con avance sin cuenta:
       se juntan los dos (álbum unido, récords y granos, lo mayor).
     · Teléfono ya ligado a la cuenta: gana lo más nuevo. Si los dos lados
       cambiaron desde la última vez, se juntan.
   Al cerrar sesión se borra el avance del teléfono (queda en la cuenta),
   para que el siguiente que use el teléfono arranque limpio.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

const CLAVES = ["cosecha.nombre", "cosecha.cara", "cosecha.vereda", "cosecha.cfg.solo", "cosecha.cfg.privada",
  "cosecha.sinintro", "cosecha2.pref", "cosecha.fondo", "cosecha.efectos", "cosecha.guias"];
const SINC = "cosecha.cuenta";            /* {uid, remoto, huella}: con quién y cuándo se sincronizó */

/* ── Juntar dos avances (puro, se prueba sin navegador) ─────────── */
const leerJSON = t => { try { return t == null ? null : JSON.parse(t); } catch (e) { return null; } };
function juntarVereda(a, b) {
  if (!a) return b; if (!b) return a;
  const out = Object.assign({}, b, a);
  out.granos = Math.max(a.granos || 0, b.granos || 0);
  out.total = Math.max(a.total || 0, b.total || 0);
  out.laminas = Object.assign({}, b.laminas || {}, a.laminas || {});
  for (const k of Object.keys(b.laminas || {})) if (a.laminas && a.laminas[k]) out.laminas[k] = Math.min(a.laminas[k], b.laminas[k]);
  out.records = {};
  for (const j of new Set([...Object.keys(a.records || {}), ...Object.keys(b.records || {})])) {
    const ra = (a.records || {})[j] || {}, rb = (b.records || {})[j] || {};
    out.records[j] = {};
    for (const n of new Set([...Object.keys(ra), ...Object.keys(rb)])) out.records[j][n] = Math.max(ra[n] || 0, rb[n] || 0);
  }
  out.partidas = {};
  for (const j of new Set([...Object.keys(a.partidas || {}), ...Object.keys(b.partidas || {})]))
    out.partidas[j] = Math.max((a.partidas || {})[j] || 0, (b.partidas || {})[j] || 0);
  const aa = a.acertijo || {}, ab = b.acertijo || {};
  out.acertijo = { dias: Object.assign({}, ab.dias || {}, aa.dias || {}), racha: Math.max(aa.racha || 0, ab.racha || 0),
    ultimo: [aa.ultimo || "", ab.ultimo || ""].sort().pop() };
  return out;
}
/* local y remoto son {clave: texto}. preferido: de quién se toma lo que no se
   suma (nombre, cara, configuración) cuando los dos lo tienen. */
function juntar(local, remoto, preferido) {
  const out = {};
  for (const k of CLAVES) {
    const l = local[k], r = remoto[k];
    if (l == null && r == null) continue;
    if (l == null) { out[k] = r; continue; }
    if (r == null) { out[k] = l; continue; }
    if (k === "cosecha.vereda") out[k] = JSON.stringify(juntarVereda(leerJSON(l), leerJSON(r)));
    else out[k] = preferido === "local" ? l : r;
  }
  return out;
}
/* Qué hacer al encontrarse lo del teléfono con lo de la cuenta. */
function decidir({ local, remoto, remotoFecha, sinc, uid }) {
  const huellaLocal = huella(local);
  if (!remoto) return { accion: "subir", datos: local };
  if (!sinc || sinc.uid !== uid) {
    const vacio = !Object.keys(local).some(k => k !== "cosecha.efectos" && k !== "cosecha.fondo");
    return { accion: vacio ? "bajar" : "juntar", datos: vacio ? remoto : juntar(local, remoto, "remoto") };
  }
  const cambioLocal = huellaLocal !== sinc.huella;
  const cambioRemoto = remotoFecha && remotoFecha !== sinc.remoto;
  if (cambioLocal && cambioRemoto) return { accion: "juntar", datos: juntar(local, remoto, "local") };
  if (cambioRemoto) return { accion: "bajar", datos: remoto };
  if (cambioLocal) return { accion: "subir", datos: local };
  return { accion: "nada", datos: local };
}
function huella(o) {
  const t = CLAVES.map(k => k + "=" + (o[k] == null ? "" : o[k])).join("\u0001");
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + ":" + t.length;
}

const PURO = { CLAVES, juntar, juntarVereda, decidir, huella };
if (typeof module !== "undefined" && module.exports) { module.exports = PURO; return; }

/* ══ En el navegador ═════════════════════════════════════════════ */
const CFG = raiz.COSECHA_SUPABASE || {};
const disponible = !!(CFG.url && CFG.llave);
const ls = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
};
const leerLocal = () => { const o = {}; for (const k of CLAVES) { const v = ls.get(k); if (v != null) o[k] = v; } return o; };
function escribirLocal(o) { for (const k of CLAVES) ls.set(k, o[k] == null ? null : o[k]); }

let cliente = null, sesion = null, ocupado = false, oyentes = [];
const estado = { disponible, conectado: false, nombre: "", correo: "", guardando: false, error: "" };
const avisar = () => oyentes.forEach(f => { try { f(estado); } catch (e) {} });

function cargarLibreria() {
  if (raiz.supabase && raiz.supabase.createClient) return Promise.resolve();
  return new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    s.onload = ok; s.onerror = () => mal(new Error("No se pudo cargar Supabase"));
    document.head.appendChild(s);
  });
}

async function sincronizar(alEntrar) {
  if (!sesion || ocupado) return;
  ocupado = true; estado.guardando = true; avisar();
  try {
    const uid = sesion.user.id;
    const { data, error } = await cliente.from("progreso").select("datos, actualizado").eq("user_id", uid).maybeSingle();
    if (error) throw error;
    const local = leerLocal(), sinc = leerJSON(ls.get(SINC));
    const d = decidir({ local, remoto: data ? data.datos : null, remotoFecha: data ? data.actualizado : null, sinc, uid });
    let fecha = data ? data.actualizado : null;
    const cambiaTelefono = huella(d.datos) !== huella(local);
    if (cambiaTelefono) escribirLocal(d.datos);
    if (d.accion === "subir" || d.accion === "juntar") {
      const r = await cliente.from("progreso").upsert({ user_id: uid, datos: d.datos }).select("actualizado").single();
      if (r.error) throw r.error;
      fecha = r.data.actualizado;
    }
    ls.set(SINC, JSON.stringify({ uid, remoto: fecha, huella: huella(d.datos) }));
    estado.error = "";
    /* Si cambió lo del teléfono, la página se recarga una vez para que cada
       juego lea el avance nuevo (varios lo leen solo al arrancar). */
    if (cambiaTelefono && !sessionStorage.getItem("cosecha.recargado")) {
      sessionStorage.setItem("cosecha.recargado", "1");
      location.reload(); return;
    }
    sessionStorage.removeItem("cosecha.recargado");
  } catch (e) {
    estado.error = "No se pudo guardar en la nube. Se intenta otra vez en un momento.";
  } finally {
    ocupado = false; estado.guardando = false; avisar();
  }
}

function aplicarSesion(s) {
  sesion = s;
  estado.conectado = !!s;
  const m = s ? (s.user.user_metadata || {}) : {};
  estado.nombre = s ? (m.full_name || m.name || "") : "";
  estado.correo = s ? (s.user.email || "") : "";
  /* Si todavía no tiene nombre en el juego, se le pone el primero de su cuenta. */
  if (s && !ls.get("cosecha.nombre") && estado.nombre) ls.set("cosecha.nombre", estado.nombre.split(" ")[0].slice(0, 14));
  avisar();
}

let listo = null;                         /* promesa: el cliente de Supabase ya está creado */
function arrancar() { listo = arrancarYa(); return listo; }
async function arrancarYa() {
  if (!disponible) return;
  try {
    await cargarLibreria();
    cliente = raiz.supabase.createClient(CFG.url, CFG.llave, {
      auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: "cosecha.auth" }
    });
    const err = new URLSearchParams(location.search).get("error_description");
    if (err) estado.error = "No se pudo entrar: " + err;
    const { data } = await cliente.auth.getSession();
    aplicarSesion(data.session);
    /* La dirección queda con ?code=… al volver de Google: se limpia. */
    if (/[?&](code|error)=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    cliente.auth.onAuthStateChange((evento, s) => {
      const antes = sesion && sesion.user.id;
      aplicarSesion(s);
      if (s && s.user.id !== antes) sincronizar(true);
    });
    if (sesion) await sincronizar(true);
    /* Mientras se juega: se sube cada 20 s si algo cambió, y al salir de la página. */
    setInterval(() => { if (sesion && huella(leerLocal()) !== (leerJSON(ls.get(SINC)) || {}).huella) sincronizar(); }, 20000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && sesion) sincronizar(); });
  } catch (e) {
    /* Sin internet o sin la librería: se esconde lo de la cuenta y se juega
       con lo del teléfono, como si no hubiera cuentas. */
    estado.disponible = false;
    avisar();
  }
}

async function entrar(proveedor) {
  if (listo) await listo;
  if (!cliente) return;
  const vuelta = location.origin + location.pathname;
  const { error } = await cliente.auth.signInWithOAuth({ provider: proveedor || "google", options: { redirectTo: vuelta } });
  if (error) { estado.error = "No se pudo abrir Google: " + error.message; avisar(); }
}
async function salir() {
  if (!cliente) return;
  await sincronizar();
  await cliente.auth.signOut();
  escribirLocal({}); ls.set(SINC, null);
  location.reload();
}
/* Borra la cuenta y todo su avance. El servidor del juego es quien puede
   borrar la cuenta en Supabase (necesita la llave de servicio, que no puede
   vivir en el teléfono). */
async function borrar() {
  if (!cliente || !sesion) return { ok: false };
  const base = (raiz.COSECHA_SERVIDOR || "").replace(/\/+$/, "") || location.origin;
  let ok = false;
  try {
    const r = await fetch(base + "/cuenta/borrar", { method: "POST", headers: { Authorization: "Bearer " + sesion.access_token } });
    ok = r.ok;
  } catch (e) {}
  if (!ok) { const r = await cliente.from("progreso").delete().eq("user_id", sesion.user.id); ok = !r.error; }
  await cliente.auth.signOut();
  escribirLocal({}); ls.set(SINC, null);
  return { ok };
}

raiz.CUENTA = Object.assign({ estado, entrar, salir, borrar, sincronizar: () => sincronizar(),
  alCambiar: f => { oyentes.push(f); f(estado); } }, PURO);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})(typeof self !== "undefined" ? self : globalThis);
