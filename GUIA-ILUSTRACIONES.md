# Guía de ilustraciones · Cosecha

Esta guía es para generar con IA los PNG que faltan. Usa el mismo estilo, formato e
instrucciones de siempre, así las imágenes nuevas salen iguales a las que ya tienes.

**Lo que se pidió en esta tanda:**
- **7 ilustraciones** para el mini juego **El espantapájaros** de La Vereda (6 animales y la
  medalla del lugar en el mapa).
- **12 avatares nuevos**, que se suman a los 6 de siempre: 3 más de la región cafetera y 3 de
  cada región que se abre al subir de nivel (Caribe, Pacífico y Orinoquía).

---

## Estado (6 de octubre)

**Listas y procesadas: 19 de 19** (los 7 del espantapájaros y los 12 avatares). Quedaron sin
fondo en `public/cartas/` y los avatares ya salen en el selector del nombre.

`a_vueltiao.png` y `a_marimba.png` se repitieron con la camisa bien definida y ya quedaron.

---

## 1. Reglas de oro (las mismas de siempre)

1. **Una ilustración por imagen.** Nunca pidas varios animales juntos ni una hoja con todos.
2. **Solo el sujeto, sin marco ni texto.** El marco, el nombre y los puntos los pone el código.
   Si la IA dibuja letras o bordes, la imagen no encaja.
3. **Fija el estilo con la primera y repítelo.** Copia el bloque de estilo idéntico en cada
   imagen y cambia solo la línea del sujeto.
4. **Mismo encuadre siempre:** sujeto centrado, ocupando cerca del 80 % del cuadro, con aire
   alrededor.

## 2. Ficha técnica

- **Formato:** PNG cuadrado 1:1, fondo transparente. Si la IA no da transparencia, usa fondo
  blanco liso; `prepara-cartas.py` lo quita.
- **Tamaño:** 1024 × 1024 px.
- **Nombre:** el que aparece en la tabla de abajo, tal cual, con su `.png`
  (por ejemplo `n_ardilla.png`). Cópialo de ahí para no equivocarte con los guiones bajos.
- **Si la IA te lo entrega en JPG:** basta con guardarlo o renombrarlo con el nombre `.png` de la
  tabla. El script lo abre, le quita el fondo blanco y lo guarda como PNG de verdad, con
  transparencia. No hace falta convertirlo aparte.
- **Qué hacer cuando las tengas:** pásamelas en un zip y yo las proceso y las subo. Si lo haces tú:
  déjalas en una carpeta (por ejemplo `arte/nuevas/`) y corre
  `python3 prepara-cartas.py arte/nuevas` y luego `npm run cartas`. Quedan en `public/cartas/`.

## 3. Bloque de estilo (cópialo idéntico)

> Ilustración estilo juego de cartas, cartoon semi-realista con volumen. Colores saturados y
> cálidos de tierra cafetera. Iluminación suave desde arriba a la izquierda con un brillo
> especular nítido. Contorno de tinta oscuro y limpio alrededor de la figura, como en cómic.
> Sombreado con degradados suaves que dan relieve y superficie ligeramente húmeda. Un sujeto
> único, centrado, de frente, ocupando cerca del 80 % del cuadro. Fondo transparente, sin
> escenario, sin marco, sin borde, sin texto, sin letras, sin números, sin logotipos.
> Composición limpia tipo sticker. Cuadrado 1:1, alta resolución.

## 4. Instrucciones para tu proyecto de ChatGPT o tu Gem de Gemini

Si ya montaste el proyecto «Cartas de Cosecha» (ChatGPT) o el Gem «Ilustrador de Cosecha»
(Gemini), **no hace falta crear otro**. Agrega estas dos familias al bloque
«FAMILIAS Y SU CARÁCTER» de las instrucciones:

```
- Animales que molestan: animales comunes de una finca colombiana, de cuerpo entero, en
  pose de ir caminando o corriendo hacia un lado (vista de tres cuartos), con cara
  traviesa y glotona. Simpáticos, nunca agresivos ni feos: son vecinos pícaros, no
  monstruos.
- Animales amigos: los que ayudan a la finca. De cuerpo entero, en pose tranquila o en
  vuelo, con cara amable y ojos grandes y brillantes. Colores limpios y alegres.
```

Para los avatares, agrega esta otra familia:

```
- Avatares: retrato de busto (cabeza, cuello y hombros) de una persona del campo
  colombiano, de frente y sonriendo, con una sola prenda u objeto que la identifique
  (sombrero, pañoleta, instrumento, herramienta). Rasgos reales, diversos y dignos, como
  los de un vecino querido: nunca caricatura ni disfraz. La cara queda en el centro del
  cuadro y el sombrero o el peinado caben enteros, porque el juego la recorta en círculo.
```

Y agrega estas reglas al final:

```
- Los animales se dibujan solos: sin cultivos, sin comida en la boca y sin escenario.
- En los avatares, la ropa y los objetos de cada región se dibujan con respeto y con
  detalle real; nada de estereotipos ni de exageraciones.
```

Con eso, a partir de ahí escribes solo el nombre de la imagen y la línea del sujeto.

---

## 5. Lo que hay que pintar: 7 ilustraciones

### Animales que molestan (3)

Van rumbo a una mata y hay que espantarlos. En la pantalla se ven pequeños (unos 60 px), así
que la silueta tiene que leerse de un vistazo.

| Clave | Animal | Sujeto para el prompt |
|---|---|---|
| `n_ardilla.png` | Ardilla | Una ardilla de cola esponjada, color café rojizo, corriendo de lado en vista de tres cuartos, con los cachetes inflados y cara de pícara glotona. |
| `n_gallina.png` | Gallina | Una gallina criolla colorada con cresta roja grande, caminando apurada de lado en vista de tres cuartos, con el pico abierto y cara de antojada. |
| `n_ternero.png` | Ternero | Un ternero joven blanco con manchas café, trotando de lado en vista de tres cuartos, con la lengua afuera y cara de travieso. |

### Animales amigos (3)

Ayudan a la finca y **no** se espantan. Tienen que verse distintos a los que molestan:
más pequeños, más brillantes y con cara amable.

| Clave | Animal | Sujeto para el prompt |
|---|---|---|
| `n_abeja.png` | Abeja | Una abeja redondita, amarilla con rayas negras, en vuelo con alas transparentes brillantes, cargando polen amarillo en las patas, con cara sonriente. |
| `n_mariquita.png` | Mariquita | Una mariquita roja brillante con siete puntos negros, vista de tres cuartos desde arriba, con antenas cortas y cara amable. |
| `n_pajarito.png` | Pajarito | Un pajarito pequeño color café claro con pecho crema, posado de lado en vista de tres cuartos, con la cola levantada y cara alegre, como un cucarachero de finca. |

### Medalla del lugar en el mapa (1)

Es el círculo que identifica el juego en el mapa de La Vereda.

| Clave | Imagen | Sujeto para el prompt |
|---|---|---|
| `n_espantapajaros.png` | El espantapájaros | Un espantapájaros simpático de finca cafetera, con sombrero aguadeño, ruana de colores y brazos de palo abiertos, de cuerpo entero y de frente, con cara de costal sonriente. |

> Mientras no estén, el juego arranca con dibujos provisionales en vector, así que no bloquean.

### Avatares (12)

Son la cara de cada jugador en la mesa. Deben verse como los 6 que ya tienes
(`a_aguadeno.png`, `a_carriel.png`, `a_poncho.png`, `a_ruana.png`, `a_mochila.png`,
`a_machete.png`): **busto de frente, sonriendo**, con una prenda u objeto que le da el nombre.

Antes de pedir el primero, súbele a la IA uno de los avatares que ya tienes como **referencia de
estilo** (no de persona) y dile que use el mismo trazo, la misma luz y el mismo encuadre.

**Ojo con el encuadre:** el juego los muestra recortados en círculo y pequeños (de 30 a 60 px).
La cara tiene que quedar en el centro y el sombrero entero, sin cortarse arriba.

**Ojo con la ropa blanca:** si la camisa es blanca y el fondo también, pide el contorno de tinta
cerrado alrededor de todo el busto, también abajo. Si no, al quitar el fondo se va con él un
pedazo de la camisa.

El nombre que sale en la sala es el de la prenda u objeto (como «Aguadeño» o «Ruana»), por eso
la clave lleva ese nombre.

#### Región cafetera (3) · disponibles desde el principio

Equilibran el grupo: hoy hay 4 hombres y 2 mujeres, y nadie de la niñez ni de la abuela.

| Clave | Nombre en el juego | Sujeto para el prompt |
|---|---|---|
| `a_tapapinche.png` | Tapapinche | Una niña recolectora de unos 10 años, con trenzas y un delantal de lona tapapinche amarrado a la cintura, sonriendo con orgullo. |
| `a_panolon.png` | Pañolón | Una abuela campesina de pelo blanco recogido, con un pañolón tejido de flecos sobre los hombros y mirada tierna. |
| `a_tinto.png` | Tinto | Una mujer campesina de unos 40 años, con delantal y un pocillo de peltre humeante en la mano a la altura del pecho. |

#### Caribe (3)

| Clave | Nombre en el juego | Sujeto para el prompt |
|---|---|---|
| `a_vueltiao.png` | Vueltiao | Un hombre costeño de piel morena, con sombrero vueltiao de franjas negras y crema y guayabera blanca. |
| `a_palenquera.png` | Palenquera | Una mujer afrocolombiana de San Basilio de Palenque, con pañoleta de colores vivos en la cabeza y vestido de vuelos amarillo, rojo y azul. |
| `a_acordeon.png` | Acordeón | Un joven costeño con camisa de colores y un acordeón pequeño colgado al hombro, asomando a un lado. |

#### Pacífico (3)

| Clave | Nombre en el juego | Sujeto para el prompt |
|---|---|---|
| `a_turbante.png` | Turbante | Una mujer afrocolombiana del Pacífico, con turbante alto de telas estampadas en naranja, verde y morado, y aretes grandes de semillas. |
| `a_marimba.png` | Marimba | Un hombre afrocolombiano mayor, de barba canosa, con camisa blanca y dos baquetas de marimba de chonta cruzadas a la altura del pecho. |
| `a_atarraya.png` | Atarraya | Un joven pescador afrocolombiano, con camiseta sin mangas y una atarraya de pesca recogida sobre el hombro. |

#### Orinoquía (3)

| Clave | Nombre en el juego | Sujeto para el prompt |
|---|---|---|
| `a_llanero.png` | Llanero | Un llanero de piel curtida por el sol, con sombrero pelo e' guama de ala ancha y bigote, con un pañuelo rojo al cuello. |
| `a_cuatro.png` | Cuatro | Una mujer llanera joven, con una flor roja en el pelo suelto y un cuatro (guitarra pequeña llanera) apoyado en el hombro. |
| `a_soga.png` | Soga | Un joven llanero sonriente, con sombrero de paja, camisa a cuadros y una soga de cabestro enrollada sobre el hombro. |

#### Cuáles se ven de entrada

Propuesta para que haya más caras desde el principio sin quitarle gracia a abrir una región:

- **Disponibles desde el principio: 12.** Los 6 de siempre, los 3 cafeteros nuevos y uno de cada
  región como adelanto (`a_vueltiao.png`, `a_turbante.png` y `a_llanero.png`).
- **Se abren con su región: 6.** Los otros dos de cada región, cuando se suba de nivel y se abra
  esa región (fase 3 de la hoja de ruta). Mientras tanto salen en el selector con candado.

---

## 6. Orden sugerido

1. **`n_ardilla.png`**, para fijar el estilo de los animales.
2. **`n_abeja.png`**, para fijar el de los amigos y comprobar que se distinguen.
3. **El resto de los animales.**
4. **`n_espantapajaros.png`.**
5. **`a_tapapinche.png`**, con un avatar viejo de referencia, para fijar el estilo de los avatares.
6. **Los que se ven de entrada:** `a_panolon.png`, `a_tinto.png`, `a_vueltiao.png`,
   `a_turbante.png` y `a_llanero.png`.
7. **Los 6 que se abren con las regiones.** Estos no tienen afán.

## 7. Cómo quedaron los avatares en el juego

- El selector del nombre muestra las 18 caras; las 6 de las regiones salen grises y con candado.
- El servidor reparte entre los jugadores solo las abiertas, sin repetir.
- Cada cara tiene su color de silla y su nombre en `public/arte.js` (lista `SILLAS`). Para abrir
  una región basta con cambiar `abierta: false` por `true` en sus caras.
- Para agregar más caras después: pinta el PNG con la clave `a_<nombre>.png` y agrega una línea al
  final de esa lista, con su nombre, color, región y si está abierta. El orden de las que ya existen
  no se cambia, porque el número de cara se guarda en el teléfono de cada jugador.
