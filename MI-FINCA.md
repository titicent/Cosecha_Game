# Mi finca · diseño del minijuego

Propuesta para validar antes de programar. Lo que está en **negrita con ✔︎ / ✘** al final son las
decisiones que necesito que confirmes o cambies.

---

## 1. Qué es y qué no es

**Mi finca** es un minijuego de La Vereda: una finca propia, vista en diagonal, que sigue ahí
cuando vuelves. Siembras, pasa el tiempo de verdad, cosechas, vendes, construyes y la finca crece.

- **No reemplaza** a Cosecha ni a Pedidos del pueblo: esos siguen siendo el juego principal.
- **Es el lugar donde los granos sirven para algo.** Hoy los granos de La Vereda solo se acumulan
  en el costal. En Mi finca se gastan en semillas, remedios y construcciones. Así, ganar una partida
  de Cosecha o un minijuego se siente en la finca.
- **Enseña lo mismo que las cartas:** cada cultivo tiene su plaga y su remedio (la broca es del
  café, la sigatoka del plátano). Quien juega Mi finca aprende el «color manda» sin darse cuenta.

En el mapa de La Vereda ocupa el lugar que dejó El espantapájaros, al lado de la casa.

## 2. Cómo se juega (el ciclo)

```
 sembrar  →  esperar (tiempo real)  →  cosechar  →  vender en el puesto o entregar un encargo
    ↑                                                              │
    └──── comprar semillas · construir · ampliar ← granos y experiencia ┘
```

1. **Sembrar.** Tocas un surco vacío y eliges la semilla. La semilla cuesta granos.
2. **Esperar.** La mata pasa por 4 etapas: semilla, brote, creciendo y lista. El tiempo corre aunque
   cierres el juego.
3. **Plagas.** Mientras crece, a veces le llega su plaga (broca al café, sigatoka al plátano…). Se
   cura con el remedio de su cultivo. **Una mata nunca se muere:** si no la curas, al cosechar
   rinde la mitad.
4. **Cosechar.** Una mata lista espera todo lo que haga falta; no se daña por no entrar.
5. **Vender o entregar.** Lo cosechado va a la bodega. Se vende en el puesto por granos, o se
   entrega en un **encargo** de los vecinos, que paga más y da experiencia.
6. **Crecer.** Con la experiencia subes de nivel: se abren cultivos, construcciones, más terreno y
   las caras de las otras regiones.

## 3. Cultivos

Tiempos pensados para que haya algo que hacer en una sentada (huerta, plátano) y algo para volver
más tarde (cacao, café).

| Cultivo | Se abre en | Semilla | Tiempo | Da | Se vende a | Experiencia |
|---|---|---|---|---|---|---|
| Huerta | Nivel 1 | 2 granos | 3 min | 2 canastos | 2 c/u | 1 |
| Plátano | Nivel 1 | 5 | 15 min | 2 racimos | 5 c/u | 2 |
| Caña | Nivel 2 | 8 | 1 hora | 3 atados | 4 c/u | 4 |
| Cacao | Nivel 3 | 12 | 3 horas | 2 costales | 12 c/u | 6 |
| Café | Nivel 4 | 15 | 4 horas | 3 bultos | 10 c/u | 8 |

- Las plagas llegan a una de cada cuatro matas, más o menos. El remedio cuesta 3 granos, o sale
  gratis de los minijuegos (ver punto 7).
- El primer plátano de la vida está listo en 20 segundos, para la partida guiada.

## 4. Encargos de los vecinos

Un tablero con **3 encargos** a la vez, con las mismas comidas y la misma ilustración de los
pedidos de Pedidos del pueblo: *«Doña Rosa quiere un tinto campesino: 2 bultos de café»*.

- Pagan más que el puesto (más o menos 1,5 veces) y dan experiencia.
- Cuando entregas uno, sale otro. Si un encargo no te gusta, lo cambias (una vez cada tanto).
- Los encargos difíciles (Canasta completa, Desayuno paisa) salen en niveles altos.

## 5. Construcciones

| Construcción | Se abre en | Cuesta | Para qué sirve |
|---|---|---|---|
| Secadero | Nivel 2 | 60 granos | El café se vende como café pergamino: vale la mitad más |
| Gallinero | Nivel 2 | 80 | Cada 30 min deja 2 huevos para vender o para encargos |
| Trapiche | Nivel 3 | 120 | Con 2 atados de caña haces panela, que vale más y abre encargos |
| Colmena | Nivel 4 | 100 | Las matas de alrededor crecen un poco más rápido, y da miel |
| Corral | Nivel 5 | 200 | El ternero da leche cada hora |

Y adornos que no hacen nada más que verse bonitos: cerca de guadua, flores, árboles de sombrío,
el espantapájaros.

## 6. Niveles y regiones

| Nivel | Experiencia | Lo que se abre |
|---|---|---|
| 1 | 0 | Huerta, plátano, terreno de 3 × 3 |
| 2 | 20 | Caña, secadero, gallinero |
| 3 | 60 | Cacao, trapiche, terreno de 4 × 4 · **región Caribe** (caras Palenquera y Acordeón) |
| 4 | 120 | Café, colmena |
| 5 | 200 | Corral · **región Pacífico** (Marimba y Atarraya) |
| 6 | 320 | Terreno de 5 × 5 |
| 7 | 480 | **Región Orinoquía** (Cuatro y Soga) |
| 8 a 10 | 700 · 1000 · 1400 | Encargos grandes y adornos de las regiones |

Esto resuelve la fase 3 que teníamos pendiente: las caras con candado se abren con la finca.

## 7. Cómo se conecta con el resto del juego

- **Los granos son una sola moneda** para toda La Vereda: los que ganas en Cosecha, Pedidos y los
  minijuegos son los mismos que gastas en la finca.
- **Los minijuegos regalan cosas útiles**: por ejemplo, Parejas regala remedios y La Recolecta
  regala semillas de café.
- **En el menú se ve la finca**: *«Mi finca · 3 matas listas»*, para invitar a volver.
- **Guarda en la cuenta**: si la persona entró con Google, la finca viaja con ella a otro
  teléfono.

## 8. Lo que **no** vamos a copiar de Farmville

Para un juego de niños de 8 años:

- Nada de pagos ni compras con plata.
- Nada de energía que se acaba ni de esperas largas que obliguen a volver.
- Nada se muere ni se pierde por no entrar.
- Sin avisos que molesten al teléfono.

## 9. Por partes

| Parte | Qué trae |
|---|---|
| **1 · La finca básica** | Terreno de 3 × 3, los 5 cultivos, plagas y remedios, puesto de venta, encargos, secadero y gallinero, niveles 1 a 5 con las regiones, partida guiada, sonido de ambiente, guarda en la cuenta |
| **2 · La finca grande** | Ampliar el terreno, trapiche, colmena, corral, adornos, niveles hasta 10 |
| **3 · Los vecinos** | Visitar la finca de tus amigos y ayudarles con una plaga: los dos ganan |

La parte 1 se puede empezar con dibujos provisionales, como en la muestra, mientras llegan las
ilustraciones (ver la sección «Mi finca» de `GUIA-ILUSTRACIONES.md`).

## 10. Detalles técnicos

- Se guarda en el teléfono (`cosecha.finca`) y, con cuenta, en la nube con lo demás.
- El tiempo se mide con la hora del teléfono. Quien adelante el reloj puede hacer trampa; para un
  juego de niños no vale la pena complicarlo. Con cuenta se puede usar la hora del servidor más
  adelante.
- El terreno (pasto, surcos, camino) lo dibuja el código; las ilustraciones son solo las matas,
  las construcciones y los productos.

---

## Decisiones para validar

1. **Tiempos reales** de 3 minutos a 4 horas (tabla del punto 3). ✔︎ / ✘ (¿más cortos?)
2. **Las matas no se mueren**; la plaga sin curar deja la mitad de la cosecha. ✔︎ / ✘
3. **Una sola moneda**: los granos de toda La Vereda. ✔︎ / ✘
4. **Las regiones de caras se abren con el nivel de la finca** (3, 5 y 7). ✔︎ / ✘
5. **Empezamos por la parte 1**, sin vecinos. ✔︎ / ✘
