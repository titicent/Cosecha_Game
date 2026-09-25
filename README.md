# COSECHA

Juego de cartas de finca cafetera para 2 a 6 jugadores, con servidor propio. Cada quien
entra desde el navegador de su teléfono con un código de cuatro letras.

Siembras café, plátano, cacao y caña. Los vecinos te mandan plagas; tú las curas, proteges
tus matas y las certificas. Mientras tanto el clima golpea a todos por igual.

    node >= 18
    npm install
    npm start          → http://localhost:3000

## Cómo se juega

Cada turno tienes **dos jornales**. Sembrar, plagar o curar cuesta un jornal; una faena
cuesta dos. Así que en un turno puedes sembrar y curar, o gastar todo en una sola faena
grande. Cuando se acaban los jornales pasa el turno y robas hasta tener tres cartas.

Se gana de dos maneras:

- **Finca completa:** cuatro cultivos distintos y sanos (cinco en el mano a mano). Con la
  meta certificada activada, no basta con que estén sanos: hay que tenerlos certificados.
- **Por cosecha:** cuando la tierra se agota —el mazo se rebaraja por segunda vez— la
  partida termina y gana quien más puntos de cosecha tenga. Cada mata sana vale uno y cada
  certificada vale dos.

Esa segunda vía es la que evita las partidas eternas y premia a quien construyó bien aunque
no haya cerrado su finca.

**El clima** cae cada tres vueltas a la mesa y le pega a todo el mundo: la sequía borra los
remedios sencillos, el aguacero hace robar de más, la helada obliga a botar una carta, la
bonanza reparte puntos al que más cultivos sanos tenga, el ventarrón invierte el sentido de
los turnos y la feria refresca las manos.

## Los tres mazos y sus sellos

Cada carta lleva impreso en la esquina inferior derecha el sello de su mazo: **grano de café**
para Cosecha, **sol** para Bonanza y **luna** para Espantos. Sin esa marca no se pueden volver
a separar las barajas una vez mezcladas, que es justo lo que hace falta cuando alguien compra
solo una expansión o presta el juego.

    Cosecha    68 cartas   el juego completo por sí solo
    Bonanza    33 cartas   sube el techo del juego
    Espantos   12 cartas   el folclor del monte

Bonanza trae una copia extra de cada cultivo, así que en la baraja completa hay seis cafés:
cinco con sello de grano y uno con sello de sol. Se juegan igual; el sello solo dice de qué
caja salió. En el código, cada carta nace con su procedencia en el campo `m`, y `R.mazoDe(carta)`
la devuelve.

## Qué trae cada mazo

**Base.** Los cuatro cultivos, la huerta comodín, plagas y remedios de cada color, y cinco
faenas: trueque, mano larga, propagación, chaparrón y cambio de lindero.

**Bonanza.** El vivero, que crece bajo techo y no admite plagas ni remedios; plagas
resistentes que solo quita un bioinsumo o una erradicación; bioinsumos que certifican de un
golpe; y las faenas de jornal extra, consejo del mayordomo, malla de sombra y erradicación.

**Espantos.** El injerto silvestre y los espantos del monte: el Mohán se lleva un cultivo
aunque esté certificado, la Patasola cambia matas entre cualesquiera fincas, el Duende te
canjea una carta por el descarte, la Llorona actúa como plaga o como remedio según elijas,
el Sombrerón corre todas las fincas de dueño y la Madremonte maldice a alguien para que no
pueda cosechar hasta que cure una mata ajena y le pase la maldición.

## Cómo está armado

    server.js            servidor: mesas, websockets, autoridad de la partida
    public/reglas.js     motor de reglas (lo usan servidor y cliente)
    public/arte.js       ilustraciones en SVG y composición de las cartas
    public/sonido.js     efectos y ambiente, sintetizados con WebAudio
    public/index.html    interfaz
    public/cliente.js    conexión y pintado de la mesa
    pruebas-coherencia.js   que el cliente y el motor hablen igual (npm run test:coherencia)
    pruebas-navegador.js    partida jugada a clics en un navegador (npm run test:navegador)
    simular.js           300 partidas automáticas contra el motor
    prueba.js            partidas reales por websocket, con caídas de señal
    pruebas-bots.js      partidas en solitario contra vecinos de la máquina
    pruebas-clima.js     clima y victoria por cosecha
    pruebas-inactividad.js  expulsión tras 3 turnos sin jugar
    cartas.js            inventario del arte propio (npm run cartas)
    gen-hero.js          caras de carta en PNG grande (npm run hero)
    public/sucesos.js    el anuncio del centro de la mesa, igual para todo suceso
    gen-catalogo.js      catálogo de la baraja (npm run catalogo)
    gen-imprimible.js    pliego A4 para recortar (npm run imprimible)

**El servidor es el único que sabe la partida completa.** El mazo y las manos viven ahí; a
cada jugador se le manda su mano y, de los demás, solo cuántas cartas tienen. El cliente no
decide nada: manda intenciones y el servidor verifica que la jugada esté en la lista de
legales antes de aplicarla.

## Lo que ya está resuelto

- **La malla de sombra** es la única carta que se juega fuera de tu turno. Cuando te atacan,
  el servidor congela la jugada y te abre una ventana de 12 segundos. Si la usas, el
  atacante debe buscar otro objetivo válido, y si no queda ninguno su carta se bota. La
  ventana solo se le abre a quien puede contestar: un desconectado no frena la mesa.
- **Ganar fuera de tu turno.** La comprobación corre después de cada cambio de estado,
  porque un cambio de lindero puede entregarte una finca completa.
- **Reconexión.** El estado vive en el servidor: si se te cae la señal vuelves a tu silla
  con tu mano intacta.
- **Fuera por inactividad.** A quien se le agote el tiempo de turno tres veces seguidas
  queda fuera; sus cartas y cultivos vuelven al descarte y la mesa sigue. Solo aplica con
  límite de tiempo por turno activado.
- **Jugar solo.** El anfitrión añade vecinos de la máquina en tres niveles. Ninguno ve las
  cartas ajenas: deciden con la misma información que tendría una persona. `PENSAR_BOT`
  (900 ms por defecto) marca cuánto se demoran en jugar.
- **Mesa en círculo.** Cada rival ocupa un borde con su avatar y sus cultivos en cuadrícula;
  la pila queda al centro y tu mano se despliega en abanico abajo a la izquierda, con tus
  propios cultivos a la derecha. El navegador entra en pantalla completa y, en móvil, pide
  girar a horizontal.

## Imprimirlo para jugar en mesa

    npm run imprimible          → mazo base + Bonanza
    npm run imprimible -- todo  → añade Espantos

Genera un HTML con la baraja en hojas A4: cartas de 63 × 88 mm —la medida estándar de
naipe— con marcas de corte, más una hoja de reversos por cada hoja de caras. Se abre en el
navegador y se manda a imprimir en escala 100%, sin ajustar al papel. En papel de 200 g y
con fundas de 63 × 88 mm queda un prototipo jugable.

`npm run catalogo` genera aparte una página con las 113 cartas, lo que hace cada una y el
nombre de archivo que espera el juego si quieres reemplazar el dibujo por una ilustración
propia.

## Caras de carta en grande

    npm run hero                     → una selección representativa
    npm run hero -- cafe comun:cacao → solo esas
    npm run hero -- todo             → las 29

Escribe en `hero/` cada cara como PNG de 1260 × 1760 px, más el reverso y un abanico de tres
cartas de colores distintos con fondo transparente. Sirven para subirlas a una IA de video
como imagen de partida —así la carta sale exacta en vez de inventada—, para una portada o
para la ficha de una tienda. Usa tus ilustraciones de `public/cartas/` si las hay.

Necesita un navegador sin ventana: `npm i -D playwright`. Sin él igual escribe `hero/hoja.html`
para capturarlo a mano.

## Arte y sonido

Las ilustraciones son originales, dibujadas en SVG dentro de `arte.js`: granos de café,
racimos de plátano, mazorcas de cacao, cañas, escarabajos, frascos de remedio y los espantos
del monte. Cada dibujo recibe en vivo volumen, contorno de tinta y una escena de fondo según
su familia. Los avatares son sombreros de finquero, uno por silla.

Si quieres arte pintado, deja archivos PNG cuadrados en `public/cartas/` con el nombre de la
clave de cada carta (`c_cafe.png`, `p_comun.png`, `f_trueque.png`…), corre `npm run cartas` y
el juego los usa en el marco, dibujando en SVG los que falten.

**El color de la carta manda.** Un remedio de café solo cura café, y por eso el color tiene que
verse de un vistazo. El dibujo en SVG se tiñe en vivo con el color de la carta, así que una sola
forma sirve para los cinco colores; un PNG no se puede teñir. Por eso en plagas y remedios el
juego busca primero un archivo por color y, si no está, usa el general:

    p_comun_cafe.png     si existe, es el que se usa en la plaga común de café
    p_comun.png          si no, este mismo dibujo para los cinco colores

Son 29 dibujos en el nivel sencillo y 45 en el fino. Se puede empezar por el sencillo y afinar
carta por carta sin tocar código: `npm run cartas` dice en qué punto va cada nivel. El pliego
imprimible usa las mismas imágenes con la misma preferencia.

Lo que **nunca** va dentro del PNG: el marco de color, el rótulo, el número de jornales y el
sello del mazo. Esos los compone el juego encima de la ilustración.

El sonido también es sintético, generado con WebAudio: no hay ni un archivo de audio. Hay un
efecto por suceso y un ambiente de fondo que se vuelve más siniestro cuando la partida usa
Espantos.

## Publicar en GitHub y Render

Son dos pasos y no hay nada que configurar a mano: el `render.yaml` incluido le dice a Render
qué hacer.

**1. Subir a GitHub.** Crea un repositorio nuevo, por ejemplo `cosecha`, y sube ahí **el
contenido de esta carpeta, no la carpeta**: `server.js`, `package.json` y `render.yaml` tienen
que quedar en la raíz del repositorio, y `public/` como carpeta con sus archivos adentro. Desde
el navegador es *Add file → Upload files* y arrastrar. No subas `node_modules`: el `.gitignore`
ya lo excluye y Render lo instala solo.

Después de subir, comprueba en GitHub que exista `public/index.html`, con esa ruta exacta. Si el
navegador aplanó la estructura y los archivos de `public` quedaron sueltos en la raíz, la página
no carga —y, peor, el despliegue no falla: se queda «en progreso» para siempre. Pasa porque
Render comprueba la salud del servicio pidiendo `/`, que responde 404 cuando falta el
`index.html`, mientras el servidor sigue arrancando y diciendo que todo va bien.

Para que eso no vuelva a costar una noche, el servidor revisa los archivos de `public/` al
arrancar y se detiene con un mensaje claro si falta alguno, en vez de quedarse fingiendo.

**2. Desplegar en Render.** Entra a render.com, *New → Blueprint*, elige el repositorio y dale
a *Deploy Blueprint*. Render lee el `render.yaml`, detecta que es un servicio Node en plan
gratuito y no pregunta nada más. En un par de minutos queda en
`https://cosecha.onrender.com` o con un sufijo si ese nombre ya está tomado. Esa es la
dirección que se comparte: el primero que entre arma la mesa y pasa el código de cuatro letras.

No hay que definir variables de entorno. Render inyecta el puerto y el servidor lo lee de
`process.env.PORT`; el cliente detecta que hay https y cambia solo a `wss://`.

**Sobre `localhost` en el registro.** Al arrancar en la nube, el servidor imprime la dirección
pública que le pasa Render. En tu máquina imprime `http://localhost:3000`, que ahí sí es la
buena. Lo que nunca es la dirección para compartir es el `localhost` de un contenedor: se
refiere al contenedor mismo.

El servidor escucha en `0.0.0.0` a propósito. Sin indicar interfaz, Node se ata a `::`, y en un
contenedor con IPv6 restringido queda oyendo solo por IPv6: arranca, dice que todo va bien, y
el proveedor nunca lo alcanza por IPv4, así que el despliegue se queda «en progreso» sin un
solo error en el registro.

**Del plan gratuito conviene saber dos cosas.** El servicio se duerme tras quince minutos sin
tráfico y despertar toma cerca de un minuto, así que el primero en entrar después de un rato se
come esa espera; el latido que manda el cliente cada dos minutos evita que se duerma en mitad de
una partida. Y las horas gratuitas son por cuenta, no por servicio: si tienes otro juego
desplegado, los dos comparten la misma bolsa mensual.

## Las pruebas

    npm test                 → motor, servidor, bots, clima, inactividad y coherencia
    npm run test:navegador   → una partida jugada a clics (necesita npm i -D playwright)

Dos de ellas existen por una razón concreta. **`test:coherencia`** compara el código del
cliente contra el motor y avisa si el cliente pregunta por algo que las reglas ya no dicen
—por ejemplo si una mata está «inmunizada» cuando el motor devuelve «certificada»—. Ese error
no hace ruido: no rompe nada, no sale en la consola, simplemente una rama del código deja de
ejecutarse para siempre y un escudo no se dibuja. **`test:navegador`** abre el juego de verdad
y lo juega a clics, que es la única forma de tocar `public/cliente.js`: las demás pruebas
ejercitan el motor y el servidor, así que un fallo de pintado se les escapa entero.

## Límites conocidos

- Las mesas viven en memoria: si reinicias el servidor se pierden las partidas en curso.
- Un solo proceso. Aguanta decenas de mesas a la vez, pero no escala a varias máquinas sin
  sacar el estado del proceso.
- Sin cuentas ni historial: la identidad es un token guardado en el navegador.

## Sobre la originalidad

Cosecha es un juego propio. Comparte con otros juegos de cartas la idea general de reunir un
conjunto mientras los demás te lo sabotean —una mecánica que nadie posee—, pero su tema, sus
cartas, sus textos, su arte y sus reglas propias son de esta casa: los jornales como recurso
por turno, el clima compartido, la doble vía de victoria y el sentido de turno reversible no
vienen de ningún otro juego. Nada del material aquí incluido procede de un tercero.
