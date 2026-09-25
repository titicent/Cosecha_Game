/* Clima y doble victoria: el evento debe caer sobre toda la mesa cada tres
   vueltas, y la partida debe poder cerrarse por cosecha al agotarse la tierra. */
const { spawn } = require("child_process");
const WebSocket = require("ws");
const P = Number(process.env.PORT_TEST || 4340);
const srv = spawn("node",["server.js"],{cwd:__dirname,
  env:{...process.env,PORT:P,PENSAR_BOT:"8"},stdio:["ignore","ignore","pipe"]});
srv.stderr.on("data",x=>console.log("⚠ SERVIDOR:",x.toString().trim().split("\n")[0]));
const espera=ms=>new Promise(r=>setTimeout(r,ms));
const abrir=()=>new Promise(res=>{const w=new WebSocket("ws://localhost:"+P);w.on("open",()=>res(w));});
class J{ constructor(){this.V=null;this.log=[];}
  async abrir(){this.ws=await abrir();
    this.ws.on("message",d=>{const m=JSON.parse(d);
      if(m.t==="sesion"){this.cod=m.codigo;this.yo=m.yo;}
      if(m.t==="vista"){this.V=m.v;(m.v.registro||[]).forEach(r=>{if(!this.log.includes(r))this.log.push(r)});this.auto();}});}
  env(m){this.ws.send(JSON.stringify(m));}
  auto(){const V=this.V;if(!V||!V.iniciada||V.ganador!==null||V.terminada)return;
    if(V.pendiente&&V.pendiente.mio){this.env({t:"malla",usar:false});return;}
    if(V.turno!==V.yo||V.pendiente)return;
    setTimeout(()=>{const W=this.V;if(!W||W.turno!==W.yo||W.ganador!==null||W.terminada||W.pendiente)return;
      const ops=[];(W.jugadas||[]).forEach((js,i)=>js.forEach(j=>ops.push({i,j})));
      if(ops.length)this.env({t:"jugar",idx:ops[0].i,jugada:ops[0].j});
      else if(W.mano.length&&W.jornales>=2)this.env({t:"descartar",idxs:[0]});
      else this.env({t:"pasar"});},6);}}
(async()=>{
  await espera(600);
  /* 1) el clima cae y se anuncia a todos */
  const yo=new J(); await yo.abrir();
  yo.env({t:"crear",nombre:"Ricardo"}); await espera(150);
  for(const n of ["experto","normal","novato"]){ yo.env({t:"bot",nivel:n}); await espera(70); }
  yo.env({t:"opciones",opciones:{bonanza:true,espantos:true,clima:true,duelo:false,aprendiz:false,metaCertificada:false,segundosTurno:0,minutosJugador:0}});
  await espera(120); yo.env({t:"empezar"}); await espera(400);
  const t=Date.now();
  while(Date.now()-t<14000 && yo.V.iniciada && yo.V.ganador===null && !yo.V.terminada) await espera(120);
  const climas = yo.log.filter(r=>/^🌦/.test(r));
  console.log("1) clima → eventos caídos:", climas.length);
  climas.slice(0,3).forEach(c=>console.log("   ·", c.slice(0,78)));
  console.log("   clima vigente que ve el cliente:", yo.V.clima ? yo.V.clima.nombre : "ninguno");
  const g=yo.V.ganador;
  console.log("   desenlace:", g!==null&&g!==undefined ? "ganó "+yo.V.jugadores[g].nombre : "en curso");
  console.log("   cosecha de cada uno:", yo.V.jugadores.map(j=>j.nombre+" "+j.cosecha).join(" · "));
  yo.ws.close(); await espera(200);

  /* 2) victoria por cosecha al agotarse la tierra: meta imposible de completar */
  const b=new J(); await b.abrir();
  b.env({t:"crear",nombre:"Ricardo"}); await espera(150);
  for(const n of ["novato","novato","novato"]){ b.env({t:"bot",nivel:n}); await espera(70); }
  b.env({t:"opciones",opciones:{bonanza:true,espantos:true,clima:true,duelo:false,aprendiz:false,metaCertificada:true,segundosTurno:0,minutosJugador:0}});
  await espera(120); b.env({t:"empezar"}); await espera(400);
  const t2=Date.now();
  while(Date.now()-t2<26000 && b.V.iniciada && b.V.ganador===null && !b.V.terminada) await espera(150);
  const porCosecha = b.log.find(r=>/Se agotó la tierra/.test(r));
  console.log("\n2) meta certificada + tierra agotada →",
    porCosecha ? "«"+porCosecha+"»" : (b.V.ganador!==null&&b.V.ganador!==undefined
      ? "ganó por finca certificada: "+b.V.jugadores[b.V.ganador].nombre : "seguía en curso"));
  srv.kill(); process.exit(0);
})();
