/* Simula partidas completas con jugadores aleatorios para cazar
   estados imposibles: cultivos repetidos, cartas perdidas, bucles.
   Ejercita también jornales, clima y las dos vías de victoria. */
const R = require("./public/reglas.js");

function nuevaPartida(n, bonanza, espantos, metaCertificada, clima){
  const E = {
    jugadores: Array.from({length:n},(_,i)=>({nombre:"J"+i,mano:[],finca:[],bonos:0})),
    mazo: R.barajar(R.crearMazo(bonanza, espantos)), descarte:[], retiradas:[],
    turno:0, jornales:R.JORNALES_TURNO, sentido:1, rondaPaso:0, rebarajadas:0,
    objetivo:4, metaCertificada:!!metaCertificada, climaOn:!!clima, registro:[]
  };
  E.jugadores.forEach((_,i)=>R.robar(E,i));
  return E;
}
function total(E){
  return E.mazo.length + E.descarte.length + E.retiradas.length +
    E.jugadores.reduce((a,j)=>a+j.mano.length+(j.maldicion?1:0)+j.finca.reduce(
      (b,o)=>b+1+o.remedios.length+o.plagas.length,0),0);
}
function invariantes(E,esperado,ctx){
  const t=total(E);
  if(t!==esperado)throw new Error(`cartas perdidas: ${t} de ${esperado} (${ctx})`);
  E.jugadores.forEach(j=>{
    const c=j.finca.map(o=>o.carta.c);
    if(new Set(c).size!==c.length)throw new Error(j.nombre+" tiene cultivos repetidos: "+c);
    if(j.mano.length>4)throw new Error(j.nombre+" tiene "+j.mano.length+" cartas");
    j.finca.forEach(o=>{
      if(o.plagas.length&&o.remedios.length)throw new Error("mata con plaga y remedio a la vez");
      if(o.plagas.length>1)throw new Error("mata con dos plagas vivas");
      if(o.remedios.length>2)throw new Error("mata con tres remedios");
      if(R.esVivero(o)&&(o.plagas.length||o.remedios.length))throw new Error("vivero tocado");
      if(R.esInjerto(o)&&o.plagas.concat(o.remedios).some(c=>c.k!=="faena"&&c.c!=="huerta"))
        throw new Error("al injerto le entró una carta de color");
    });
    if(j.maldicion&&R.logrados(E,j)>=E.objetivo&&R.ganador(E)===E.jugadores.indexOf(j))
      throw new Error("un maldito ganó la partida");
  });
  if(E.jornales<0)throw new Error("jornales en negativo");
}

function jugarPartida(n, bonanza, semilla, espantos, metaCertificada, clima){
  let rnd = semilla;
  const rand = () => (rnd = (rnd*1103515245+12345) % 2147483648) / 2147483648;
  const E = nuevaPartida(n, bonanza, espantos, metaCertificada, clima);
  const esperado = total(E);
  let turnos = 0, porPuntos = false;
  const usos = {};
  while (R.ganador(E)===null && turnos < 6000) {
    if (R.tierraAgotada(E)) { porPuntos = true; break; }
    turnos++;
    const ji = E.turno;
    const opciones = [];
    E.jugadores[ji].mano.forEach((c,idx)=>
      R.jugadasLegales(E,ji,idx).forEach(j=>opciones.push({idx,j,carta:c})));
    if (opciones.length && rand() > 0.12) {
      opciones.sort((a,b)=>R.puntuar(E,ji,b.carta,b.j)-R.puntuar(E,ji,a.carta,a.j));
      const el = opciones[rand()<0.75?0:Math.floor(rand()*opciones.length)];
      usos[el.j.tipo]=(usos[el.j.tipo]||0)+1;
      const prot = R.atacados(E,ji,el.j).filter(k=>{
        const t=E.jugadores[k].mano.findIndex(c=>c.tr==="mallasombra");
        if(t<0||rand()<0.3)return false;
        E.descarte.push(E.jugadores[k].mano.splice(t,1)[0]);
        return true;
      });
      const bloqueado = prot.length && !R.multiObjetivo(el.j.tipo);
      if (bloqueado) { E.descarte.push(E.jugadores[ji].mano.splice(el.idx,1)[0]); usos.bloqueada=(usos.bloqueada||0)+1; }
      else {
        const r=R.aplicar(E,ji,el.idx,el.j,prot);
        invariantes(E,esperado,"jugada "+el.j.tipo);
        if(!r.fin) continue;              /* le quedan jornales: sigue el mismo jugador */
      }
    } else {
      const k = 1+Math.floor(rand()*E.jugadores[ji].mano.length);
      E.descarte.push(...E.jugadores[ji].mano.splice(0,k));
      usos.descarte=(usos.descarte||0)+1;
    }
    invariantes(E,esperado,"turno "+turnos);
    R.avanzarTurno(E);
    if (R.tocaClima(E)) { R.aplicarClima(E); usos.clima=(usos.clima||0)+1;
      invariantes(E,esperado,"clima"); }
    invariantes(E,esperado,"tras avanzar "+turnos);
  }
  return {turnos, ganador:R.ganador(E), porPuntos, usos, esperado,
          puntos: porPuntos ? R.porPuntos(E) : null};
}

let fallos=0, tipos={}, certGanadas=0, porPuntosN=0, climas=0;
for (let s=1; s<=300; s++){
  const n = 2+(s%5), bon = s%3!==0, esp = s%2===0, cert = s%4===0, clima = s%2===1;
  try{
    const r = jugarPartida(n, bon, s*7919, esp, cert, clima);
    if(r.ganador===null && !r.porPuntos && !cert)
      console.log("⚠ partida sin desenlace tras",r.turnos,"turnos (semilla",s+")");
    if(cert && r.ganador!==null) certGanadas++;
    if(r.porPuntos) porPuntosN++;
    climas += (r.usos.clima||0);
    Object.entries(r.usos).forEach(([k,v])=>tipos[k]=(tipos[k]||0)+v);
    if(s===1)console.log("mazo base + Bonanza:",r.esperado,"cartas");
    if(s===2)console.log("mazo con Espantos: ",r.esperado,"cartas");
  }catch(e){ fallos++; if(fallos<4)console.log("✗ semilla",s,"·",e.message); }
}
console.log("\npartidas simuladas: 300 · fallos:",fallos);
console.log("desenlaces → finca completa en modo certificado:",certGanadas,
            "· por puntos al agotarse la tierra:",porPuntosN,"· climas caídos:",climas);
console.log("jugadas ejercitadas:",Object.entries(tipos).sort((a,b)=>b[1]-a[1])
  .map(([k,v])=>k+":"+v).join(" · "));
