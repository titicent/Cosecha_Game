# Mi finca · diseño del minijuego

Diseño validado por Ricardo el 7 de octubre. Las cinco decisiones que tomó:

1. **Tiempos más cortos** (tabla del punto 3).
2. **Las matas sí se mueren**: una plaga sin curar seca la mata, y una mata lista que nadie cosecha
   se marchita.
3. **Los granos pasan a llamarse monedas**, en todo el juego.
4. **El minijuego sirve para ganar monedas, pero no limita el avance en Cosecha.** Los niveles de la
   finca abren cosas de la finca y nada más; las caras de las regiones no dependen de la finca.
5. **Empezamos por la parte 1**, pero dejando lista la autopista para los vecinos (punto 9).

---

## 1. Qué es y qué no es

**Mi finca** es un minijuego de La Vereda: una finca propia, vista en diagonal, que sigue ahí
cuando vuelves. Siembras, pasa el tiempo de verdad, cosechas, vendes, construyes y la finca crece.

- **No reemplaza** a Cosecha ni a Pedidos del pueblo: esos siguen siendo el juego principal.
- **Es donde las monedas sirven para algo**: semillas, remedios y construcciones. Las monedas se
  ganan en todo el juego: partidas de Cosecha y de Pedidos del pueblo, los minijuegos y la finca.
- **Enseña lo mismo que las cartas**: cada cultivo tiene su plaga y su remedio (la broca es del
  café, la sigatoka del plátano).

En el mapa de La Vereda ocupa el lugar que dejó El espantapájaros.

## 2. Cómo se juega

```
 sembrar  →  esperar (tiempo real)  →  cosechar  →  vender en el puesto o entregar un encargo
    ↑                                                              │
    └──── comprar semillas · construir ←──── monedas y experiencia ┘
```

1. **Sembrar.** Tocas un surco vacío y eliges la semilla. La semilla cuesta monedas.
2. **Esperar.** La mata pasa por 4 etapas: semilla, brote, creciendo y lista. El tiempo corre aunque
   cierres el juego.
3. **Plagas.** A una de cada cuatro matas le llega su plaga mientras crece. Se cura con el remedio de
   su cultivo (3 monedas). **Si no se cura a tiempo, la mata se seca.**
4. **Cosechar.** Una mata lista espera un buen rato, pero **si nadie la cosecha, se marchita**.
5. **Limpiar.** Una mata seca o marchita se arranca con un toque, y el surco queda libre.
6. **Vender o entregar.** Lo cosechado va a la bodega. Se vende en el puesto, o se entrega en un
   **encargo** de los vecinos, que paga más y da experiencia.
7. **Crecer.** Con la experiencia subes de nivel y se abren cultivos y construcciones.

## 3. Cultivos

| Cultivo | Se abre en | Semilla | Crece en | Da | Se vende a | Experiencia |
|---|---|---|---|---|---|---|
| Huerta | Nivel 1 | 2 monedas | 1 min | 2 canastos | 2 c/u | 1 |
| Plátano | Nivel 1 | 5 | 3 min | 2 racimos | 5 c/u | 2 |
| Café | Nivel 2 | 15 | 12 min | 3 bultos | 10 c/u | 6 |
| Caña | Nivel 3 | 8 | 6 min | 3 atados | 5 c/u | 4 |
| Cacao | Nivel 4 | 12 | 20 min | 2 costales | 13 c/u | 6 |

**Cuándo se muere una mata:**
- **Plaga sin curar:** se seca cuando pasa la mitad de su tiempo de crecer (como mínimo 1 minuto).
  A la huerta hay que curarla en un minuto; al cacao, en diez.
- **Lista sin cosechar:** se marchita cuando pasa el doble de su tiempo de crecer, más 5 minutos.
  La huerta aguanta 7 minutos lista; el cacao, 45.

El primer plátano de la vida está listo en 20 segundos y no le cae plaga: es el de la partida
guiada.

## 4. Encargos de los vecinos

Un tablero con **3 encargos** a la vez, con las mismas comidas y la misma ilustración de los
pedidos de Pedidos del pueblo: *«Doña Rosa quiere un tinto campesino: 2 bultos de café»*.

- Pagan la mitad más de lo que darían en el puesto, y dan experiencia.
- Solo piden cultivos que ya tengas abiertos. Cuando entregas uno, sale otro.
- Un encargo que no te guste se cambia gratis, una vez cada 5 minutos.

## 5. Construcciones (parte 1)

| Construcción | Se abre en | Cuesta | Para qué sirve |
|---|---|---|---|
| Secadero | Nivel 2 | 50 monedas | El café se vende como café pergamino: vale la mitad más |
| Gallinero | Nivel 3 | 70 | Cada 4 minutos deja 2 huevos para vender (3 c/u) o para encargos |

La parte 2 trae trapiche, colmena, corral y adornos.

## 6. Niveles de la finca

| Nivel | Experiencia | Lo que se abre en la finca |
|---|---|---|
| 1 | 0 | Huerta y plátano, terreno de 3 × 3 |
| 2 | 15 | Café y secadero |
| 3 | 40 | Caña y gallinero |
| 4 | 80 | Cacao |
| 5 | 140 | (Parte 2: terreno más grande y más construcciones) |

Los niveles son solo de la finca: no abren nada en Cosecha ni en Pedidos del pueblo.

## 7. Cómo se conecta con el resto

- **Las monedas son una sola** para todo el juego. Ganar una partida de Cosecha o de Pedidos del
  pueblo da 20 monedas; jugarla y perderla, 5. Los minijuegos dan las suyas.
- **En el mapa de La Vereda se ve la finca**: *«3 matas listas»*, *«¡Una plaga!»*.
- **Guarda en la cuenta**: si la persona entró con Google, la finca viaja con ella a otro teléfono.

## 8. Lo que no copiamos de Farmville

Nada de pagos ni compras con plata, nada de energía que se acaba y sin avisos que molesten al
teléfono.

## 9. Por partes

| Parte | Qué trae |
|---|---|
| **1 · La finca básica** | Terreno de 3 × 3, los 5 cultivos, plagas que matan, marchitarse, puesto de venta, encargos, secadero y gallinero, niveles 1 a 4, partida guiada |
| **2 · La finca grande** | Terreno más grande, trapiche, colmena, corral, adornos, más niveles |
| **3 · Los vecinos** | Visitar la finca de tus amigos y ayudarles con una plaga: los dos ganan |

### La autopista para los vecinos (queda lista desde la parte 1)

- **Cada finca tiene una vista pública**: lo que un vecino puede ver (matas, etapas, plagas,
  construcciones), sin la bodega ni las monedas. La arma el motor (`vistaPublica`).
- **El motor ya sabe recibir ayuda**: `ayudar` cura la plaga de una mata desde la vista de otro y
  le paga al que ayudó. Las dos fincas se enteran con un registro de ayudas.
- **En Supabase** quedan las tablas `fincas` (la vista pública de cada quien, que cualquiera con
  cuenta puede leer y solo su dueño puede cambiar) y `ayudas` (quién ayudó a quién y en qué mata).
  Están en `supabase/esquema.sql`.
- **Al entrar con cuenta**, la finca sube sola su vista pública cada vez que cambia.

Lo que falta para la parte 3 es la pantalla: la lista de vecinos, entrar a una finca ajena y el
botón de ayudar.

## 10. Las reglas del mundo (para que todo encaje, hoy y cuando crezca)

1. **Una sola manera de ver.** Todo se dibuja en la misma diagonal (vista isométrica, rombo 2:1),
   con la misma luz desde arriba a la izquierda y el mismo trazo de tinta. Sin horizonte ni
   montañas: un fondo en perspectiva nunca encaja con piezas en diagonal.
2. **Una cuadrícula de casillas.** Cada casilla es un rombo de 124 × 62 en el mundo. Cada cosa
   ocupa casillas enteras, y su tamaño sale de ahí, no a ojo:

   | Pieza | Casillas |
   |---|---|
   | Parcela | 1 × 1 |
   | Casa, secadero (y luego trapiche, corral) | 2 × 2 |
   | Puesto, tablero, gallinero, colmena | 1 × 1 |
   | Árbol grande de sombrío | 2 × 2 |
   | Mata, arbusto, piedras, flores, tramo de cerca | 1 × 1 |

3. **El suelo lo dibuja el código**, casilla por casilla: pasto de la finca, monte alrededor y
   camino. Así la finca puede crecer sin pintar fondos nuevos.
4. **Lo alto va atrás.** Las construcciones grandes se ponen en el borde de atrás de la finca y
   alrededor de las parcelas queda un caminito libre, para que nada tape lo que se cosecha.
5. **La finca crece por anillos.** Hoy la tierra propia es de 8 × 8 casillas dentro de un mapa de
   14 × 14; al crecer se le suman casillas alrededor (10 × 10, 12 × 12) y el mapa se agranda.
   Lo de afuera es monte con árboles y matas.
6. **La cámara** encuadra la finca al entrar; se arrastra para mirar alrededor y en el computador
   la rueda acerca o aleja.

## 11. Detalles técnicos

- El motor es `public/vereda/finca-reglas.js` (puro, se prueba sin navegador con
  `pruebas-finca.js`); la pantalla, `public/vereda/finca.js`.
- Se guarda en el teléfono (`cosecha.finca`) y, con cuenta, en la nube con lo demás.
- Las monedas siguen guardadas con el nombre viejo («granos») para no perder lo que ya hay.
- El tiempo se mide con la hora del teléfono.
- El terreno (pasto, surcos, camino) lo dibuja el código; las ilustraciones son las matas, las
  construcciones y los productos (sección «Mi finca» de `GUIA-ILUSTRACIONES.md`). Mientras no
  lleguen, se usan los dibujos de las cartas.
