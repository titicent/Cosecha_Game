/* ═══════════════════════════════════════════════════════════════
   COSECHA — motor de reglas
   Juego de cartas de finca cafetera. Base + Bonanza + Espantos.
   Lo carga el servidor (require) y el navegador (<script>).
   El servidor es la autoridad: el cliente usa esto solo para pintar.

   Diferencias de fondo con los juegos de "colecciona y sabotea":
     · Jornales: cada turno tienes 2 jornales y cada carta cuesta
       distinto, así que juegas varias cartas por turno.
     · Clima: cada pocas rondas cae un evento que afecta a todos.
     · Doble victoria: por finca completa, o por puntos de cosecha
       cuando la tierra se agota.
     · El sentido del turno se puede invertir.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
"use strict";

const COLORES = ["cafe", "platano", "cacao", "cana"];
const CULTIVO = {
  cafe:    { label: "Café",    hex: "#C0392B" },
  platano: { label: "Plátano", hex: "#4A8B3B" },
  cacao:   { label: "Cacao",   hex: "#7B4B2A" },
  cana:    { label: "Caña",    hex: "#C9A227" },
  huerta:  { label: "Huerta",  hex: "#1E7D74" },   /* comodín: le entra de todo */
  vivero:  { label: "Vivero",  hex: "#6E7A88" },   /* bajo techo: nada lo toca */
  injerto: { label: "Injerto", hex: "#D97A16" }    /* Espantos: reemplaza un cultivo */
};
const FAENA = {
  trueque:"Trueque", saqueo:"Mano larga", propagacion:"Propagación",
  chaparron:"Chaparrón", lindero:"Cambio de lindero",
  /* Bonanza */
  jornalExtra:"Jornal extra", consejo:"Consejo del mayordomo",
  mallasombra:"Malla de sombra", erradicacion:"Erradicación",
  /* Espantos */
  mohan_cafe:"El Mohán: café", mohan_platano:"El Mohán: plátano",
  mohan_cacao:"El Mohán: cacao", mohan_cana:"El Mohán: caña",
  patasola:"La Patasola", duende:"El Duende",
  llorona:"La Llorona", madremonte:"La Madremonte", sombreron:"El Sombrerón"
};
const ESPANTOS = new Set(["mohan_cafe","mohan_platano","mohan_cacao","mohan_cana",
  "patasola","duende","llorona","madremonte","sombreron"]);

/* ── Jornales: lo que cuesta cada carta ─────────────────────── */
const JORNALES_TURNO = 2;
function cuesta(c){
  if(!c) return 0;
  if(c.k === "faena") return 2;
  return 1;                       /* cultivo, plaga y remedio valen un jornal */
}

/* ── Mazo ───────────────────────────────────────────────────── */
const MAZOS = {
  base:     {nombre:"Cosecha",  corto:"Base",     hex:"#4A6338"},
  bonanza:  {nombre:"Bonanza",  corto:"Bonanza",  hex:"#B8891B"},
  espantos: {nombre:"Espantos", corto:"Espantos", hex:"#6B4FA8"}
};
/* Cada carta lleva impreso de qué mazo viene: sin eso no se pueden volver a
   separar las barajas después de mezclarlas, que es justo lo que pasa cuando
   alguien presta el juego o compra solo una expansión. */
function crearMazo(bonanza, espantos){
  const m=[]; let n=0, de="base";
  const add=(c,veces)=>{for(let i=0;i<veces;i++)m.push(Object.assign({id:"k"+(n++),m:de},c))};
  add({k:"cultivo",c:"huerta"},1);              COLORES.forEach(c=>add({k:"cultivo",c},5));
  add({k:"plaga",c:"huerta",t:"comun"},1);      COLORES.forEach(c=>add({k:"plaga",c,t:"comun"},4));
  add({k:"remedio",c:"huerta",t:"casero"},4);   COLORES.forEach(c=>add({k:"remedio",c,t:"casero"},4));
  add({k:"faena",tr:"trueque"},2);     add({k:"faena",tr:"saqueo"},3);
  add({k:"faena",tr:"propagacion"},3); add({k:"faena",tr:"chaparron"},1);
  add({k:"faena",tr:"lindero"},1);
  if(bonanza){
    de="bonanza";
    add({k:"cultivo",c:"vivero"},1);              COLORES.forEach(c=>add({k:"cultivo",c},1));
    add({k:"plaga",c:"huerta",t:"resistente"},1); COLORES.forEach(c=>add({k:"plaga",c,t:"resistente"},2));
    add({k:"remedio",c:"huerta",t:"bioinsumo"},3);COLORES.forEach(c=>add({k:"remedio",c,t:"bioinsumo"},1));
    add({k:"faena",tr:"mallasombra"},4); add({k:"faena",tr:"jornalExtra"},2);
    add({k:"faena",tr:"consejo"},2);     add({k:"faena",tr:"erradicacion"},4);
  }
  if(espantos){
    de="espantos";
    add({k:"cultivo",c:"injerto"},1);
    COLORES.forEach(c=>add({k:"faena",tr:"mohan_"+c},1));
    add({k:"faena",tr:"patasola"},1);
    add({k:"faena",tr:"duende"},2);
    add({k:"faena",tr:"llorona"},2);
    add({k:"faena",tr:"madremonte"},1);
    add({k:"faena",tr:"sombreron"},1);
  }
  return m;
}

/* ── Clima: mazo aparte que cae sobre todos a la vez ────────── */
const CLIMAS = [
  {id:"sequia",   nombre:"Sequía",          texto:"El sol raja la tierra: todo cultivo apenas protegido pierde su remedio."},
  {id:"aguacero", nombre:"Aguacero",        texto:"Llueve parejo: todos roban una carta de más en su próximo turno."},
  {id:"helada",   nombre:"Helada",          texto:"Cae la helada: cada quien descarta una carta de su mano."},
  {id:"bonanza",  nombre:"Bonanza",         texto:"Precio alto: quien más cultivos sanos tenga se anota dos puntos de cosecha."},
  {id:"ventarron",nombre:"Ventarrón",       texto:"El viento cambia: se invierte el sentido de los turnos."},
  {id:"feria",    nombre:"Feria del pueblo",texto:"Todos dejan una carta y roban otra: la mano se refresca."}
];
const RONDAS_POR_CLIMA = 3;

/* ── Nombres ────────────────────────────────────────────────── */
const etColor=c=>c==="huerta"?"de toda la huerta":CULTIVO[c].label.toLowerCase();
function nombreCarta(x){
  if(!x)return "—";
  if(x.k==="cultivo")return CULTIVO[x.c].label;
  if(x.k==="plaga")return (x.t==="resistente"?"Plaga resistente ":"Plaga ")+etColor(x.c);
  if(x.k==="remedio")return (x.t==="bioinsumo"?"Bioinsumo ":"Remedio ")+etColor(x.c);
  return FAENA[x.tr];
}
const mazoDe=x=>(x&&x.m)||"base";
const colorCarta=x=>!x?"#9aa3ab":(x.k==="faena"?(ESPANTOS.has(x.tr)?"#6B4FA8":"#3F6B4A"):CULTIVO[x.c].hex);
const esEspanto=x=>!!x && x.k==="faena" && ESPANTOS.has(x.tr);

/* ── Estado de una mata ─────────────────────────────────────── */
/* mata = {carta, remedios:[], plagas:[]} */
function estadoMata(o){
  if(o.plagas.length)return "plagado";
  if(o.remedios.length>=2)return "certificado";
  if(o.remedios.length===1)return o.remedios[0].t==="bioinsumo"?"certificado":"protegido";
  return "sano";
}
const esVivero=o=>o.carta.c==="vivero";
const esInjerto=o=>o.carta.c==="injerto";
const estaSano=o=>esVivero(o)||estadoMata(o)!=="plagado";
const sanos=j=>j.finca.filter(estaSano).length;
const certificado=o=>esVivero(o)||estadoMata(o)==="certificado";
const certificados=j=>j.finca.filter(certificado).length;
const logrados=(E,j)=>E.metaCertificada?certificados(j):sanos(j);
/* Puntos de cosecha, para la victoria por tierra agotada */
function puntos(j){
  return j.finca.reduce((a,o)=>a + (certificado(o)?2:(estaSano(o)?1:0)), 0);
}
/* El injerto es naranja: solo le entran cartas de huerta y faenas. */
function afectaColor(c,o){
  if(esVivero(o))return false;
  if(esInjerto(o))return c==="huerta";
  return c==="huerta"||o.carta.c==="huerta"||o.carta.c===c;
}
const tieneCultivo=(j,c)=>j.finca.some(o=>o.carta.c===c);
function descEstado(o){
  if(esVivero(o))return "bajo techo";
  const e=estadoMata(o);
  if(e==="plagado")return "plagado ("+(o.plagas[0].t==="resistente"?"resistente":"común")+")";
  return e;
}
const activo=j=>!j.fuera;

/* ── Jugadas legales ────────────────────────────────────────── */
function jugadasLegales(E, ji, idx){
  const yo=E.jugadores[ji], carta=yo.mano[idx], out=[];
  if(!carta)return out;
  if(E.jornales !== undefined && cuesta(carta) > E.jornales) return out;   /* no alcanza el jornal */
  const nom=(j,o)=>(j===ji?"tu ":"el ")+CULTIVO[E.jugadores[j].finca[o].carta.c].label.toLowerCase()+
                   (j===ji?"":" de "+E.jugadores[j].nombre);

  if(carta.k==="cultivo"){
    if(carta.c==="injerto"){          /* obligatorio reemplazar una mata propia */
      if(tieneCultivo(yo,"injerto"))return out;
      yo.finca.forEach((o,oi)=>out.push({tipo:"injertar",o:oi,
        etiqueta:"Arrancar "+nom(ji,oi)+" y sembrar el injerto"}));
      return out;
    }
    if(!tieneCultivo(yo,carta.c))out.push({tipo:"sembrar",etiqueta:"Sembrar "+nombreCarta(carta)});
    return out;
  }

  if(carta.k==="plaga"){
    E.jugadores.forEach((jug,j)=>{
      jug.finca.forEach((o,oi)=>{
        if(!afectaColor(carta.c,o))return;
        const e=estadoMata(o);
        if(e==="certificado")return;
        if(e==="sano")out.push({tipo:"plagar",j,o:oi,etiqueta:"Plagar "+nom(j,oi)});
        else if(e==="protegido")out.push({tipo:"lavar",j,o:oi,etiqueta:"Lavar el remedio de "+nom(j,oi)});
        else out.push({tipo:"arrasar",j,o:oi,etiqueta:"Arrasar "+nom(j,oi)});
      });
    });
    return out;
  }

  if(carta.k==="remedio"){
    /* Con la Madremonte encima, curar a otro es justo cómo se pasa la maldición. */
    const fincas = yo.maldicion ? E.jugadores.map((_,j)=>j) : [ji];
    fincas.forEach(j=>{
      E.jugadores[j].finca.forEach((o,oi)=>{
        if(!afectaColor(carta.c,o))return;
        const e=estadoMata(o);
        if(e==="certificado")return;
        const extra=(j!==ji&&yo.maldicion)?" y pasarle la maldición":"";
        if(e==="plagado"){
          if(o.plagas[0].t==="resistente"&&carta.t!=="bioinsumo")return;
          out.push({tipo:"curar",j,o:oi,etiqueta:"Curar "+nom(j,oi)+extra});
        } else if(e==="protegido")out.push({tipo:"certificar",j,o:oi,etiqueta:"Certificar "+nom(j,oi)+extra});
        else out.push(carta.t==="bioinsumo"
          ?{tipo:"certificar_ya",j,o:oi,etiqueta:"Certificar de una "+nom(j,oi)+extra}
          :{tipo:"proteger",j,o:oi,etiqueta:"Proteger "+nom(j,oi)+extra});
      });
    });
    return out;
  }

  const tr=carta.tr;
  if(tr==="trueque"||tr==="patasola"){
    const libre = tr==="patasola";                 /* la Patasola se lleva hasta lo certificado */
    const origen = libre ? E.jugadores.map((_,j)=>j) : [ji];
    origen.forEach(ja=>{
      E.jugadores[ja].finca.forEach((a,ai)=>{
        if(!libre&&estadoMata(a)==="certificado")return;
        E.jugadores.forEach((otro,jb)=>{
          if(jb<=ja)return;
          otro.finca.forEach((b,bi)=>{
            if(!libre&&estadoMata(b)==="certificado")return;
            if(E.jugadores[ja].finca.some((x,k)=>k!==ai&&x.carta.c===b.carta.c))return;
            if(otro.finca.some((x,k)=>k!==bi&&x.carta.c===a.carta.c))return;
            out.push({tipo:libre?"patasola":"trueque", a:{j:ja,o:ai}, b:{j:jb,o:bi},
              etiqueta:"Cambiar "+nom(ja,ai)+" por "+nom(jb,bi)});
          });
        });
      });
    });
    return out.slice(0,120);
  }
  if(tr==="saqueo"){
    E.jugadores.forEach((otro,j)=>{
      if(j===ji)return;
      otro.finca.forEach((o,oi)=>{
        if(estadoMata(o)==="certificado")return;
        if(tieneCultivo(yo,o.carta.c))return;
        out.push({tipo:"saqueo",j,o:oi,etiqueta:"Llevarte "+nom(j,oi)});
      });
    });
    return out;
  }
  if(tr.startsWith("mohan_")){          /* el Mohán se lleva hasta lo certificado */
    const col=tr.split("_")[1];
    E.jugadores.forEach((otro,j)=>{
      if(j===ji)return;
      otro.finca.forEach((o,oi)=>{
        if(o.carta.c!==col&&o.carta.c!=="huerta")return;
        if(tieneCultivo(yo,o.carta.c))return;
        out.push({tipo:"mohan",j,o:oi,etiqueta:"Llevarte "+nom(j,oi)});
      });
    });
    return out;
  }
  if(tr==="propagacion"){
    if(repartoPropagacion(E,ji).length)out.push({tipo:"propagacion",etiqueta:"Pasar tus plagas a los vecinos"});
    return out;
  }
  if(tr==="chaparron"){
    if(E.jugadores.some((j,i)=>i!==ji&&j.mano.length))out.push({tipo:"chaparron",etiqueta:"Todos menos tú botan su mano"});
    return out;
  }
  if(tr==="lindero"){
    E.jugadores.forEach((otro,j)=>{ if(j!==ji&&activo(otro))
      out.push({tipo:"lindero",j,etiqueta:"Cambiar tu finca con la de "+otro.nombre}) });
    return out;
  }
  if(tr==="jornalExtra"){
    out.push({tipo:"jornalExtra",etiqueta:"Sumar dos jornales a este turno"});
    return out;
  }
  if(tr==="consejo"){
    E.jugadores.forEach((otro,j)=>{ if(j!==ji&&activo(otro))
      out.push({tipo:"consejo",j,etiqueta:"Cambiar tu mano con la de "+otro.nombre}) });
    return out;
  }
  if(tr==="erradicacion"){
    E.jugadores.forEach((jug,j)=>jug.finca.forEach((o,oi)=>{
      if(o.plagas.length)out.push({tipo:"erradicacion",j,o:oi,etiqueta:"Erradicar la plaga de "+nom(j,oi)});
    }));
    return out;
  }
  if(tr==="duende"){
    if(E.descarte.length)out.push({tipo:"duende",
      etiqueta:"Cambiarla por "+nombreCarta(E.descarte[E.descarte.length-1])+" del montón"});
    return out;
  }
  if(tr==="llorona"){
    E.jugadores.forEach((jug,j)=>jug.finca.forEach((o,oi)=>{
      if(esVivero(o))return;
      const e=estadoMata(o);
      if(e==="plagado"){
        out.push({tipo:"llorona_curar",j,o:oi,etiqueta:"Curar "+nom(j,oi)+" (llora de alivio)"});
        out.push({tipo:"llorona_arrasar",j,o:oi,etiqueta:"Arrasar "+nom(j,oi)+" (llora de pena)"});
      } else if(e==="protegido"){
        out.push({tipo:"llorona_lavar",j,o:oi,etiqueta:"Lavar el remedio de "+nom(j,oi)});
        out.push({tipo:"llorona_certificar",j,o:oi,etiqueta:"Certificar "+nom(j,oi)});
      }
    }));
    return out;
  }
  if(tr==="madremonte"){
    E.jugadores.forEach((otro,j)=>{ if(j!==ji&&activo(otro)&&!otro.maldicion)
      out.push({tipo:"madremonte",j,etiqueta:"Maldecir a "+otro.nombre+": no podrá cosechar"}) });
    return out;
  }
  if(tr==="sombreron"){
    const vivos = E.jugadores.filter(activo).length;
    if(vivos>1){
      out.push({tipo:"sombreron",sentido:1,etiqueta:"Correr todas las fincas hacia un lado"});
      if(vivos>2)out.push({tipo:"sombreron",sentido:-1,etiqueta:"Correrlas hacia el otro lado"});
    }
    return out;
  }
  return out; /* malla de sombra: solo se juega como respuesta */
}

function repartoPropagacion(E,ji){
  const mov=[], ocupados=new Set();
  E.jugadores[ji].finca.forEach((mio,mi)=>{
    if(!mio.plagas.length)return;
    for(let j=0;j<E.jugadores.length;j++){
      if(j===ji||!activo(E.jugadores[j]))continue;
      const cu=E.jugadores[j].finca;
      for(let oi=0;oi<cu.length;oi++){
        const clave=j+"."+oi;
        if(ocupados.has(clave))continue;
        if(estadoMata(cu[oi])!=="sano"||esVivero(cu[oi]))continue;
        if(!afectaColor(mio.plagas[0].c,cu[oi]))continue;
        ocupados.add(clave); mov.push({de:mi,j,o:oi}); return;
      }
    }
  });
  return mov;
}

/* ── A quién golpea una jugada (para la malla de sombra) ────── */
function atacados(E,ji,jugada){
  const t=jugada.tipo;
  if(["plagar","lavar","arrasar","saqueo","mohan","llorona_curar","llorona_arrasar",
      "llorona_lavar","llorona_certificar","curar","proteger","certificar","certificar_ya",
      "erradicacion"].includes(t)){
    const daña = ["plagar","lavar","arrasar","saqueo","mohan","llorona_arrasar","llorona_lavar"].includes(t);
    return (daña && jugada.j !== ji) ? [jugada.j] : [];
  }
  if(t==="trueque"||t==="patasola")return [jugada.a.j,jugada.b.j].filter(j=>j!==ji);
  if(t==="lindero"||t==="consejo"||t==="madremonte")return [jugada.j];
  if(t==="chaparron")return E.jugadores.map((_,i)=>i).filter(i=>i!==ji&&E.jugadores[i].mano.length);
  if(t==="sombreron")return E.jugadores.map((_,i)=>i).filter(i=>i!==ji&&activo(E.jugadores[i]));
  if(t==="propagacion")return [...new Set(repartoPropagacion(E,ji).map(m=>m.j))];
  return [];
}
const multiObjetivo=t=>t==="chaparron"||t==="propagacion"||t==="sombreron";

/* ── Aplicar una jugada ─────────────────────────────────────── */
function aplicar(E, ji, idx, jugada, protegidos){
  const prot=protegidos||[];
  const yo=E.jugadores[ji];
  const carta=yo.mano.splice(idx,1)[0];
  const reg=[]; let sonido=jugada.tipo;
  if(E.jornales !== undefined) E.jornales = Math.max(0, E.jornales - cuesta(carta));
  const mata=(j,o)=>E.jugadores[j].finca[o];
  const nom=(j,o)=>CULTIVO[mata(j,o).carta.c].label.toLowerCase()+" de "+E.jugadores[j].nombre;
  const pasarMaldicion=(destino)=>{
    if(destino===ji||!yo.maldicion)return;
    E.jugadores[destino].maldicion=yo.maldicion; yo.maldicion=null;
    reg.push("La Madremonte se fue con "+E.jugadores[destino].nombre);
  };

  switch(jugada.tipo){
    case "sembrar":
      yo.finca.push({carta,remedios:[],plagas:[]});
      reg.push(yo.nombre+" sembró "+CULTIVO[carta.c].label.toLowerCase());
      break;
    case "injertar":{
      const viejo=yo.finca[jugada.o];
      E.descarte.push(viejo.carta,...viejo.plagas,...viejo.remedios);
      yo.finca[jugada.o]={carta,remedios:[],plagas:[]};
      reg.push(yo.nombre+" arrancó su "+CULTIVO[viejo.carta.c].label.toLowerCase()+" y sembró el injerto");
      break;}
    case "plagar":
      mata(jugada.j,jugada.o).plagas.push(carta);
      reg.push(yo.nombre+" plagó el "+nom(jugada.j,jugada.o));
      break;
    case "lavar":
    case "llorona_lavar":{
      const o=mata(jugada.j,jugada.o);
      E.descarte.push(carta,...o.remedios.splice(0));
      reg.push(yo.nombre+" le lavó el remedio al "+nom(jugada.j,jugada.o));
      sonido="lavar"; break;}
    case "arrasar":
    case "llorona_arrasar":{
      const o=mata(jugada.j,jugada.o);
      reg.push(yo.nombre+" arrasó el "+nom(jugada.j,jugada.o));
      E.descarte.push(carta,o.carta,...o.plagas,...o.remedios);
      E.jugadores[jugada.j].finca.splice(jugada.o,1);
      sonido="arrasar"; break;}
    case "curar":
    case "llorona_curar":{
      const o=mata(jugada.j,jugada.o);
      E.descarte.push(carta,...o.plagas.splice(0));
      reg.push(yo.nombre+" curó el "+nom(jugada.j,jugada.o));
      pasarMaldicion(jugada.j);
      sonido="curar"; break;}
    case "proteger":
      mata(jugada.j,jugada.o).remedios.push(carta);
      reg.push(yo.nombre+" protegió el "+nom(jugada.j,jugada.o));
      pasarMaldicion(jugada.j);
      break;
    case "certificar":
    case "certificar_ya":
    case "llorona_certificar":
      mata(jugada.j,jugada.o).remedios.push(carta);
      reg.push(yo.nombre+" certificó el "+nom(jugada.j,jugada.o));
      pasarMaldicion(jugada.j);
      sonido="certificar"; break;
    case "trueque":
    case "patasola":{
      E.descarte.push(carta);
      const a=E.jugadores[jugada.a.j], b=E.jugadores[jugada.b.j];
      const x=a.finca[jugada.a.o], y=b.finca[jugada.b.o];
      a.finca[jugada.a.o]=y; b.finca[jugada.b.o]=x;
      reg.push(yo.nombre+(jugada.tipo==="patasola"?" llamó a la Patasola entre ":" hizo un trueque entre ")+
        a.nombre+" y "+b.nombre);
      sonido="trueque"; break;}
    case "saqueo":
    case "mohan":{
      E.descarte.push(carta);
      const o=E.jugadores[jugada.j].finca.splice(jugada.o,1)[0];
      yo.finca.push(o);
      reg.push(yo.nombre+" se llevó el "+CULTIVO[o.carta.c].label.toLowerCase()+" de "+E.jugadores[jugada.j].nombre);
      sonido="saqueo"; break;}
    case "propagacion":{
      E.descarte.push(carta);
      let n=0;
      repartoPropagacion(E,ji).forEach(m=>{
        if(prot.includes(m.j))return;
        const v=yo.finca[m.de].plagas.pop();
        if(v){mata(m.j,m.o).plagas.push(v);n++;}
      });
      reg.push(yo.nombre+" propagó "+n+" plaga"+(n===1?"":"s"));
      break;}
    case "chaparron":{
      E.descarte.push(carta);
      E.jugadores.forEach((j,i)=>{
        if(i===ji||prot.includes(i))return;
        E.descarte.push(...j.mano.splice(0));
      });
      reg.push(yo.nombre+" soltó el chaparrón: los demás botan su mano");
      break;}
    case "lindero":{
      E.descarte.push(carta);
      const otro=E.jugadores[jugada.j];
      const tmp=yo.finca; yo.finca=otro.finca; otro.finca=tmp;
      reg.push(yo.nombre+" corrió el lindero con "+otro.nombre+": cambiaron de finca");
      break;}
    case "sombreron":{
      E.descarte.push(carta);
      const parte=E.jugadores.map((_,i)=>i).filter(i=>!prot.includes(i)&&activo(E.jugadores[i]));
      if(parte.length>1){
        const fincas=parte.map(i=>E.jugadores[i].finca);
        parte.forEach((i,k)=>{
          const desde=(k-jugada.sentido+parte.length*2)%parte.length;
          E.jugadores[i].finca=fincas[desde];
        });
      }
      reg.push(yo.nombre+" llamó al Sombrerón: las fincas cambiaron de dueño");
      break;}
    case "jornalExtra":{
      E.descarte.push(carta);
      if(E.jornales !== undefined) E.jornales += 2;
      reg.push(yo.nombre+" consiguió jornal extra: dos jornales más");
      break;}
    case "consejo":{
      E.descarte.push(carta);
      const otro=E.jugadores[jugada.j];
      const tmp=yo.mano; yo.mano=otro.mano; otro.mano=tmp;
      if(E.jornales !== undefined) E.jornales += 1;
      reg.push(yo.nombre+" cambió su mano con "+otro.nombre);
      break;}
    case "duende":{
      const rescatada=E.descarte.pop();
      E.descarte.push(carta);
      yo.mano.push(rescatada);
      if(E.jornales !== undefined) E.jornales += 1;
      reg.push(yo.nombre+" le sacó "+nombreCarta(rescatada)+" al Duende");
      break;}
    case "madremonte":{
      E.jugadores[jugada.j].maldicion=carta;
      reg.push("🌿 La Madremonte se le metió a "+E.jugadores[jugada.j].nombre+": no puede cosechar");
      break;}
    case "erradicacion":{
      E.descarte.push(carta);
      const o=mata(jugada.j,jugada.o);
      E.retiradas.push(...o.plagas.splice(0));
      reg.push(yo.nombre+" erradicó la plaga del "+nom(jugada.j,jugada.o));
      break;}
  }
  /* El turno se acaba cuando se agotan los jornales */
  const fin = E.jornales === undefined ? true : E.jornales <= 0;
  return {registro:reg, fin, sonido};
}

/* ── Robo, turno y victoria ─────────────────────────────────── */
function robar(E,ji){
  const j=E.jugadores[ji];
  if(j.fuera)return;
  const tope = 3 + (j.extraRobo||0);
  while(j.mano.length<tope){
    if(!E.mazo.length){
      if(!E.descarte.length)break;
      E.mazo=barajar(E.descarte.splice(0));
      E.rebarajadas=(E.rebarajadas||0)+1;
    }
    j.mano.push(E.mazo.pop());
  }
  j.extraRobo=0;
}
function barajar(a,rnd){
  const r=rnd||Math.random;
  for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function ganador(E){
  const i=E.jugadores.findIndex(j=>activo(j)&&!j.maldicion&&logrados(E,j)>=E.objetivo);
  return i<0?null:i;
}
/* Cuando la tierra se agota (segunda rebarajada) gana quien más cosecha tenga. */
function tierraAgotada(E){ return (E.rebarajadas||0) >= 2; }
function porPuntos(E){
  let mejor=-1, quien=null, empate=false;
  E.jugadores.forEach((j,i)=>{
    if(!activo(j))return;
    const p=puntos(j) + (j.bonos||0);
    if(p>mejor){mejor=p;quien=i;empate=false;} else if(p===mejor)empate=true;
  });
  return {quien, puntos:mejor, empate};
}
function avanzarTurno(E){
  robar(E,E.turno);
  E.jornales=JORNALES_TURNO;
  E.rondaPaso=(E.rondaPaso||0)+1;
  let vueltas=0;
  const n=E.jugadores.length, paso=E.sentido||1;
  do{
    E.turno=(E.turno+paso+n)%n;
    vueltas++;
    if(!activo(E.jugadores[E.turno])&&vueltas<=n*2)continue;
    if(E.jugadores[E.turno].mano.length===0&&vueltas<=n){
      robar(E,E.turno);
      E.registro.push(E.jugadores[E.turno].nombre+" perdió el turno buscando semilla");
      continue;
    }
    break;
  }while(vueltas<=n*2);
}
/* ¿Toca clima? Cada RONDAS_POR_CLIMA vueltas completas a la mesa. */
function tocaClima(E){
  const vivos=E.jugadores.filter(activo).length || 1;
  return E.climaOn && E.rondaPaso>0 && E.rondaPaso % (vivos*RONDAS_POR_CLIMA) === 0;
}
function aplicarClima(E){
  const c = CLIMAS[Math.floor(Math.random()*CLIMAS.length)];
  const reg=["🌦 "+c.nombre+": "+c.texto];
  switch(c.id){
    case "sequia":
      E.jugadores.forEach(j=>{ if(!activo(j))return;
        j.finca.forEach(o=>{ if(estadoMata(o)==="protegido") E.descarte.push(...o.remedios.splice(0)); }); });
      break;
    case "aguacero":
      E.jugadores.forEach(j=>{ if(activo(j)) j.extraRobo=1; });
      break;
    case "helada":
      E.jugadores.forEach(j=>{ if(activo(j)&&j.mano.length) E.descarte.push(j.mano.pop()); });
      break;
    case "bonanza":{
      let mejor=-1, quien=[];
      E.jugadores.forEach((j,i)=>{ if(!activo(j))return;
        const s=sanos(j); if(s>mejor){mejor=s;quien=[i];} else if(s===mejor)quien.push(i); });
      quien.forEach(i=>{ E.jugadores[i].bonos=(E.jugadores[i].bonos||0)+2; });
      if(quien.length) reg.push("Se anotan dos puntos: "+quien.map(i=>E.jugadores[i].nombre).join(", "));
      break;}
    case "ventarron":
      E.sentido=-(E.sentido||1);
      reg.push("Ahora se juega al contrario");
      break;
    case "feria":
      E.jugadores.forEach((j,i)=>{ if(!activo(j)||!j.mano.length)return;
        E.descarte.push(j.mano.shift()); robar(E,i); });
      break;
  }
  E.clima={id:c.id, nombre:c.nombre, texto:c.texto, n:(E.climaN||0)+1};
  E.climaN=E.clima.n;
  return reg;
}

/* ── Sugerencias (modo aprendiz) ────────────────────────────── */
function puntuar(E,ji,carta,jug){
  const yo=E.jugadores[ji];
  const rivales=E.jugadores.filter((_,i)=>i!==ji);
  const meta=E.metaCertificada;
  const mide=x=>meta?certificados(x):sanos(x);
  const misM=mide(yo);
  const lider=rivales.reduce((a,r)=>Math.max(a,r.maldicion?0:mide(r)),0);
  const urg=lider>=E.objetivo-1?22:(lider>=E.objetivo-2?8:0);
  const propio=jug.j===ji;
  const rival=jug.j!==undefined&&!propio&&E.jugadores[jug.j];
  const cerca=rival&&mide(rival)>=E.objetivo-1;
  const gano=n=>!yo.maldicion&&misM+n>=E.objetivo;
  switch(jug.tipo){
    case "sembrar":       return meta?46:(gano(1)?100:58+Math.min(20,sanos(yo)*6));
    case "injertar":      return 40;
    case "curar":
    case "llorona_curar": return propio?(meta?58:(gano(1)?100:64+urg/2)):(yo.maldicion?70:10);
    case "certificar_ya": return propio?(meta?(gano(1)?100:90):80)+urg/2:(yo.maldicion?68:8);
    case "certificar":
    case "llorona_certificar": return propio?(meta?(gano(1)?100:88):72)+urg/2:(yo.maldicion?66:8);
    case "proteger":      return propio?52:(yo.maldicion?64:8);
    case "plagar":        return propio?6:65+(cerca?urg+12:0);
    case "arrasar":
    case "llorona_arrasar": return propio?3:59+(cerca?urg:0);
    case "lavar":
    case "llorona_lavar": return propio?3:47+(cerca?urg:0);
    case "saqueo":
    case "mohan":         return (estaSano(E.jugadores[jug.j].finca[jug.o])?(gano(1)?100:76):50)+(cerca?urg:0);
    case "trueque":       return 50+(cerca?urg:0);
    case "patasola":      return 54+(cerca?urg:0);
    case "propagacion":   return 58+repartoPropagacion(E,ji).length*12+urg;
    case "chaparron":     return 36+(urg?24:0);
    case "lindero":       return sanos(E.jugadores[jug.j])>sanos(yo)
                                 ?60+(sanos(E.jugadores[jug.j])-sanos(yo))*14:20;
    case "sombreron":     return sanos(yo)<=1?55:25;
    case "madremonte":    return cerca?92:44;
    case "duende":        return 45;
    case "jornalExtra":   return 66;
    case "consejo":       return 30;
    case "erradicacion":  return propio?(yo.finca[jug.o]&&yo.finca[jug.o].plagas[0]&&
                                 yo.finca[jug.o].plagas[0].t==="resistente"?84:62):15;
    default:              return 20;
  }
}
function sugerencias(E,ji){
  const yo=E.jugadores[ji], todas=[];
  yo.mano.forEach((c,idx)=>jugadasLegales(E,ji,idx).forEach(j=>
    todas.push({idx,carta:c,jugada:j,score:Math.round(puntuar(E,ji,c,j)),etiqueta:j.etiqueta})));
  todas.sort((a,b)=>b.score-a.score);
  return todas.slice(0,3);
}

/* ── Qué hace cada carta, en una frase ──────────────────────── */
function queHace(x){
  if(!x)return "";
  if(x.k==="cultivo"){
    if(x.c==="vivero")return "Vivero: crece bajo techo, así que siempre cuenta como sano. Ninguna plaga lo alcanza y no admite remedios, pero sí te lo pueden cambiar o llevar.";
    if(x.c==="huerta")return "Huerta: vale como una mata más de cualquier tipo para completar tu finca. A cambio le entra cualquier plaga o remedio.";
    if(x.c==="injerto")return "Injerto: arranca una mata tuya y ocupa su lugar. Solo le entran cartas de huerta y faenas.";
    return CULTIVO[x.c].label+": siémbralo en tu finca. Reúne cuatro cultivos distintos y sanos para ganar. No puedes tener dos del mismo.";
  }
  if(x.k==="plaga"){
    const r=x.t==="resistente";
    return "Plaga"+(r?" resistente":"")+": arruina una mata del vecino; una segunda plaga la acaba. Sobre una mata protegida, le lava el remedio."+
      (r?" Solo la quita un bioinsumo o una erradicación.":"");
  }
  if(x.k==="remedio"){
    const b=x.t==="bioinsumo";
    return (b?"Bioinsumo":"Remedio")+": sobre una mata tuya sana la "+(b?"certifica de una":"protege")+
      "; sobre una protegida la certifica para siempre; sobre una plagada la cura"+(b?", hasta de plagas resistentes":"")+".";
  }
  const D={
    trueque:"Cambias una mata tuya por una del vecino. No vale si a alguno le quedan dos iguales o si está certificada.",
    saqueo:"Te llevas una mata del vecino a tu finca, siempre que no repitas cultivo. Las certificadas no se tocan.",
    propagacion:"Pasas tus plagas a matas sanas de los vecinos, tantas como quepan, en una sola jugada.",
    chaparron:"Todos los demás botan su mano y pierden el turno siguiente buscando semilla.",
    lindero:"Cambias tu finca entera con la de un vecino, certificadas incluidas. La única carta que mueve lo blindado.",
    jornalExtra:"Suma dos jornales a este turno: alcanza para jugar más cartas.",
    consejo:"Cambias tu mano con la de un vecino y te queda un jornal para usarla.",
    mallasombra:"Guárdala: se juega cuando te atacan, para que la carta no te toque. No robas después de usarla.",
    erradicacion:"Saca del juego una plaga, común o resistente, hasta que termine la partida.",
    mohan_cafe:"El Mohán se lleva un café del vecino, aunque esté certificado.",
    mohan_platano:"El Mohán se lleva un plátano del vecino, aunque esté certificado.",
    mohan_cacao:"El Mohán se lleva un cacao del vecino, aunque esté certificado.",
    mohan_cana:"El Mohán se lleva una caña del vecino, aunque esté certificada.",
    patasola:"La Patasola cambia dos matas entre cualesquiera fincas, sin importar si están certificadas.",
    duende:"El Duende te cambia esta carta por la última del montón de descarte, y te deja un jornal.",
    llorona:"Al jugarla eliges si llora de alivio (cura, certifica) o de pena (arrasa, lava el remedio).",
    madremonte:"Maldice a un vecino: no podrá ganar hasta que cure, proteja o certifique una mata ajena y le pase la maldición.",
    sombreron:"Todas las fincas de la mesa cambian de dueño, corriéndose hacia el lado que elijas."
  };
  return D[x.tr]||"";
}

const API={COLORES,CULTIVO,FAENA,ESPANTOS,CLIMAS,MAZOS,mazoDe,JORNALES_TURNO,RONDAS_POR_CLIMA,
  crearMazo,barajar,nombreCarta,colorCarta,etColor,esEspanto,cuesta,queHace,
  estadoMata,esVivero,esInjerto,estaSano,sanos,certificado,certificados,logrados,puntos,
  afectaColor,tieneCultivo,descEstado,activo,
  jugadasLegales,repartoPropagacion,atacados,multiObjetivo,aplicar,robar,ganador,
  tierraAgotada,porPuntos,avanzarTurno,tocaClima,aplicarClima,puntuar,sugerencias};
if(typeof module!=="undefined"&&module.exports)module.exports=API; else raiz.REGLAS=API;
})(typeof self!=="undefined"?self:globalThis);
