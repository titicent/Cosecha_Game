# Guía de ilustraciones · Cosecha

Esta guía es para generar con IA los PNG que faltan. Usa el mismo estilo, formato e
instrucciones de siempre, así las imágenes nuevas salen iguales a las que ya tienes.

**Lo que falta hoy:** 7 ilustraciones para el mini juego **El espantapájaros** de La Vereda
(6 animales y la medalla del lugar en el mapa).

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

Y agrega esta regla al final:

```
- Los animales se dibujan solos: sin cultivos, sin comida en la boca y sin escenario.
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

---

## 6. Orden sugerido

1. **`n_ardilla.png`**, para fijar el estilo de los animales.
2. **`n_abeja.png`**, para fijar el de los amigos y comprobar que se distinguen.
3. **El resto de los animales.**
4. **`n_espantapajaros.png`.**
