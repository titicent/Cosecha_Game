# Guía de ilustraciones · Cosecha

Esta guía es para generar con IA los PNG que faltan. Usa el mismo estilo, formato e
instrucciones de siempre, así las imágenes nuevas salen iguales a las que ya tienes.

**Lo que se pide en esta tanda: 19 ilustraciones para Mi finca, parte 1** (ver `MI-FINCA.md`):
12 matas en sus etapas, 5 construcciones y 2 productos. Son de un tipo nuevo: **objetos vistos en
diagonal**, como en los juegos de granja, para ponerlos sobre el terreno.

> No bloquean: el juego arranca con dibujos provisionales y los cambia solos cuando llegan.

---

## Estado (7 de octubre)

- **Mi finca: 19 de 19, listas y en el juego** (7 de octubre). Quedaron en `public/cartas/`,
  recortadas al dibujo para que se paren sobre el terreno.
- **El terreno y el fondo** (`t_surco.png` y `f_finca.png`) llegaron el 7 de octubre y ya están en
  la finca. Si algún día repites el fondo, pídelo más grande (1920 de ancho): el de ahora tiene 1024
  y en pantallas grandes se ve un poco suave.
- **Llegaron también** `c_huerta.png` y `e_mercado_campesino.png` nuevas, y ya reemplazaron a las
  anteriores.
- **Para repetir si quieres** (no bloquean):
  - `m_huerta_lista.png` se ve casi igual a `m_huerta_crece.png`. La lista debería verse frondosa,
    con tomates rojos grandes, cebollas largas y lechugas abiertas, para que se note que ya se puede
    cosechar.
  - `c_huerta.png` quedó casi igual a `e_mercado_campesino.png` (los dos son un canasto con café,
    plátano y caña). En Pedidos del pueblo salen juntos y se confunden. La huerta debería mostrar
    lo de la huerta: cebolla larga, tomate, cilantro, lechuga.
- **Hechas antes:** los 18 avatares y los 7 dibujos del espantapájaros. Ese minijuego salió del
  mapa, pero la gallina, el ternero, la abeja y los demás animales se usarán en Mi finca.

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
  (por ejemplo `m_cafe_lista.png`). Cópialo de ahí para no equivocarte con los guiones bajos.
- **Si la IA te lo entrega en JPG:** basta con guardarlo o renombrarlo con el nombre `.png` de la
  tabla. El script lo abre, le quita el fondo blanco y lo guarda como PNG de verdad, con
  transparencia. No hace falta convertirlo aparte.
- **Qué hacer cuando las tengas:** pásamelas en un zip y yo las proceso y las subo. Si lo haces tú:
  déjalas en una carpeta (por ejemplo `arte/nuevas/`) y corre
  `python3 prepara-cartas.py arte/nuevas` y luego `npm run cartas`. Quedan en `public/cartas/`.

## 3. Bloques de estilo (cópialos idénticos)

### 3a. Cartas y avatares (el de siempre)

> Ilustración estilo juego de cartas, cartoon semi-realista con volumen. Colores saturados y
> cálidos de tierra cafetera. Iluminación suave desde arriba a la izquierda con un brillo
> especular nítido. Contorno de tinta oscuro y limpio alrededor de la figura, como en cómic.
> Sombreado con degradados suaves que dan relieve y superficie ligeramente húmeda. Un sujeto
> único, centrado, de frente, ocupando cerca del 80 % del cuadro. Fondo transparente, sin
> escenario, sin marco, sin borde, sin texto, sin letras, sin números, sin logotipos.
> Composición limpia tipo sticker. Cuadrado 1:1, alta resolución.

### 3b. Mi finca: objetos en diagonal (nuevo)

Todo lo de la finca va sobre un terreno de rombos visto en diagonal. Para que encaje, **todas** las
imágenes tienen que tener exactamente el mismo ángulo de cámara.

> Ilustración para juego de granja en vista isométrica: cámara desde arriba a 30 grados, el
> objeto girado 45 grados, de modo que su base forma un rombo dos veces más ancho que alto.
> Cartoon semi-realista con volumen, colores saturados y cálidos de tierra cafetera, contorno de
> tinta oscuro y limpio, iluminación suave desde arriba a la izquierda con sombra propia suave.
> Un solo objeto, centrado, apoyado en la parte de abajo del cuadro, con aire alrededor. Sin
> sombra proyectada en el piso, sin terreno, sin pasto alrededor, sin escenario, sin texto, sin
> letras, sin marco. Fondo transparente. Cuadrado 1:1, alta resolución.

**Truco para que salgan parejas:** pide primero `b_casa.png`. Cuando te guste, súbesela a la IA
en cada pedido siguiente como **referencia de ángulo y estilo** («mismo ángulo, misma luz y mismo
trazo que esta imagen»).

## 4. Instrucciones para tu proyecto de ChatGPT o tu Gem de Gemini

Si ya montaste el proyecto «Cartas de Cosecha» (ChatGPT) o el Gem «Ilustrador de Cosecha»
(Gemini), **no hace falta crear otro**. Agrega esta familia al bloque «FAMILIAS Y SU CARÁCTER»:

```
- Mi finca: matas, construcciones y productos de una finca cafetera colombiana, vistos en
  diagonal (vista isométrica, base en rombo 2:1), como piezas de un juego de granja. Usa
  siempre el bloque de estilo 3b y el mismo ángulo de la imagen de referencia. Materiales
  reales del campo: guadua, bahareque, teja de barro, lona, fique, zinc.
```

Y estas reglas al final:

```
- En Mi finca, nunca dibujes el terreno, el pasto ni la sombra en el piso: solo el objeto.
- Las matas de un mismo cultivo, en sus distintas etapas, se ven como la misma planta
  creciendo: mismo tipo de hoja, mismo color, solo cambia el tamaño y los frutos.
```

---

## 5. Lo que hay que pintar: Mi finca, parte 1 (19)

### Matas: etapas comunes (2)

Sirven para todos los cultivos al principio.

| Clave | Etapa | Sujeto para el prompt |
|---|---|---|
| `m_semilla.png` | Recién sembrada | Un montoncito de tierra oscura y húmeda recién removida, con dos o tres semillas asomando encima. |
| `m_brote.png` | Brote | Un brote pequeño de dos hojas verdes y tiernas saliendo de un montoncito de tierra oscura. |

### Matas: cada cultivo creciendo y listo (10)

En la pantalla se ven pequeñas (de 50 a 90 px), así que la silueta tiene que leerse de un vistazo.
La de «lista» lleva los frutos bien visibles: es la que dice «cosécheme».

| Clave | Etapa | Sujeto para el prompt |
|---|---|---|
| `m_huerta_crece.png` | Huerta creciendo | Un pequeño cuadro de huerta con matas jóvenes de cebolla larga, cilantro y lechuga, todavía bajitas. |
| `m_huerta_lista.png` | Huerta lista | El mismo cuadro de huerta, frondoso, con tomates rojos, cebollas largas grandes y lechugas abiertas. |
| `m_platano_crece.png` | Plátano creciendo | Una mata de plátano joven de tronco delgado y hojas largas, sin racimo todavía. |
| `m_platano_lista.png` | Plátano listo | La misma mata de plátano, alta y frondosa, con un racimo grande de plátanos verdes amarillentos colgando. |
| `m_cana_crece.png` | Caña creciendo | Un grupo de tallos de caña de azúcar jóvenes, verdes y delgados, a media altura. |
| `m_cana_lista.png` | Caña lista | El mismo grupo de cañas, altas y gruesas, de tallos verde amarillento con nudos marcados y hojas largas arriba. |
| `m_cacao_crece.png` | Cacao creciendo | Un arbolito de cacao joven de hojas grandes y brillantes, sin mazorcas todavía. |
| `m_cacao_lista.png` | Cacao listo | El mismo árbol de cacao, más grande, con mazorcas amarillas y rojizas pegadas al tronco y a las ramas gruesas. |
| `m_cafe_crece.png` | Café creciendo | Un arbusto de café joven, de hojas verde oscuro brillantes, con cerezas pequeñas y verdes. |
| `m_cafe_lista.png` | Café listo | El mismo arbusto de café, más tupido, cargado de cerezas rojas maduras a lo largo de las ramas. |

### Construcciones (5)

| Clave | Construcción | Sujeto para el prompt |
|---|---|---|
| `b_casa.png` | La casa de la finca | Una casa campesina paisa de bahareque blanco, techo de teja de barro, corredor con barandas y puertas pintadas de colores vivos, y matas de flores en tarros colgando del corredor. **Pídela primero: es la referencia de ángulo para todo lo demás.** |
| `b_puesto.png` | Puesto de venta | Un puesto de mercado campesino de guadua con toldo de lona a rayas, mesa de madera con canastos de fique y una balanza vieja. |
| `b_tablero.png` | Tablero de encargos | Un tablero de madera sobre dos patas de guadua, con tres papelitos clavados con puntillas y un techito de zinc encima. |
| `b_secadero.png` | Secadero | Una marquesina de secado de café: una plataforma de madera elevada con granos de café extendidos y un techo corredizo de plástico transparente sobre estructura de guadua. |
| `b_gallinero.png` | Gallinero | Un gallinero pequeño de guadua y malla, con techo de zinc, una rampita de madera y nidos con paja. |

### Productos (2)

Estos sí van **de frente**, con el bloque de estilo 3a, porque salen en la bodega y en los
encargos, al lado de las cartas.

| Clave | Producto | Sujeto para el prompt |
|---|---|---|
| `pr_huevos.png` | Huevos | Tres huevos criollos color crema en un nidito de paja. |
| `pr_pergamino.png` | Café pergamino | Un costal de fique abierto, lleno de granos de café pergamino color crema pálido. |

> Lo demás ya existe: los productos de cultivo usan las cartas `c_*`, las plagas sus cartas
> `p_comun_*`, los encargos los dibujos de los pedidos `e_*` y los animales los `n_*`.

---

### El terreno y el fondo (2) · nuevos

El terreno y el fondo los dibuja el código, y al lado de las ilustraciones se ven planos. Con estas
dos imágenes el juego los cambia solo.

| Clave | Imagen | Sujeto para el prompt |
|---|---|---|
| `t_surco.png` | La parcela | Con el bloque 3b. Una sola parcela de tierra arada, levantada como un bancal bajito. La cara de arriba es un rombo exacto, dos veces más ancho que alto. Tierra café oscura y húmeda con cuatro surcos rectos paralelos a uno de los lados del rombo, con brillo en el lomo de cada surco. Se ven los dos costados del frente, bajitos, de tierra más oscura con alguna piedrita y raicitas. Sin plantas, sin pasto alrededor, sin cerca. |
| `f_finca.png` | El fondo de la finca | Con el bloque 3c (abajo). Es la única imagen **con fondo**: no le quites el fondo en Photoroom. |

**3c. Bloque para el fondo (cópialo idéntico):**

> Fondo para juego de granja en vista isométrica, cámara desde arriba a 30 grados, mismo estilo
> cartoon semi-realista con volumen y contorno de tinta oscuro y limpio, colores saturados y
> cálidos de tierra cafetera, luz cálida de mañana desde arriba a la izquierda. Un prado amplio de
> pasto verde ondulado, con matojos, tréboles y florecitas silvestres. El centro de la imagen, un
> rombo grande que ocupa la mitad del ancho, queda vacío: solo pasto parejo, porque ahí van las
> parcelas y la casa. Alrededor, en los bordes: matas de café y de plátano, un guamo grande dando
> sombra en una esquina de arriba, una cerca de guadua al fondo, una quebradita con piedras en una
> esquina de abajo y un camino de tierra que entra desde el borde de abajo hacia el centro. Arriba,
> al fondo, montañas de la zona cafetera con cafetales en surcos y un poco de neblina, cielo claro.
> Sin casas, sin construcciones, sin personas, sin animales, sin texto. Imagen apaisada 16:9, alta
> resolución.

Para las dos, súbele a Gemini `b_casa.png` como referencia de ángulo, luz y trazo.

## 6. Orden sugerido

1. **`b_casa.png`**, hasta que el ángulo y el estilo te gusten. Es la referencia de todo lo demás.
2. **`m_cafe_lista.png`**, con la casa de referencia, para comprobar que una mata encaja al lado.
3. **El resto de las matas**, de a cultivo: primero la de «creciendo» y enseguida la de «lista».
4. **`m_semilla.png` y `m_brote.png`.**
5. **Las otras 4 construcciones.**
6. **Los 2 productos**, con el estilo de siempre (3a).

Cuando las tengas, pásamelas en un zip y yo las proceso y las subo.

---

## 7. Avatares: cómo agregar más caras

- El selector del nombre muestra las 18 caras; las 6 de las regiones salen grises y con candado.
- El servidor reparte entre los jugadores solo las abiertas, sin repetir.
- Cada cara tiene su color de silla y su nombre en `public/arte.js` (lista `SILLAS`). Para abrir
  una región basta con cambiar `abierta: false` por `true` en sus caras.
- Para agregar más caras después: pinta el PNG con la clave `a_<nombre>.png` y agrega una línea al
  final de esa lista, con su nombre, color, región y si está abierta. El orden de las que ya existen
  no se cambia, porque el número de cara se guarda en el teléfono de cada jugador.
