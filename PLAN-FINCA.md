# Mi finca · plan maestro de 0 a 100

Este es el mapa completo de la finca: a dónde vamos, en qué orden y con qué piezas. Lo de hoy es
más o menos el **7 %**. Cada fase deja algo jugable y suma un pedazo del camino.

- El **diseño de reglas** de la parte 1 sigue en `MI-FINCA.md`.
- Las **instrucciones para el Gem de Gemini**, para pintar todo con las mismas reglas, están en
  `GEM-FINCA.md`.
- Este archivo es la referencia: cuando algo cambie, se cambia aquí primero.

---

## 1. La meta: cómo se ve y se juega la finca al 100 %

Una finca cafetera colombiana viva, vista en diagonal, que el niño arma a su gusto y que crece
con él:

- **Siembra** quince cultivos, entre ellos frutales que dan cosecha varias veces.
- **Procesa:** del café en cereza al café pergamino, de la caña a la panela, de la leche al queso.
  Con eso cocina los pedidos de la vereda.
- **Cría animales:** gallinas, vacas, cerdos, abejas, la mula y el perro.
- **Acomoda todo como quiere:** mueve las construcciones, compra más tierra y la decora con cosas
  de su región y de las otras.
- **Vive el día, la noche y el clima**, que son los mismos climas de las cartas.
- **Va al pueblo:** la chiva lleva los pedidos y en la tienda hay herramientas.
- **Visita a sus amigos** y les ayuda con las plagas.

Todo encaja porque todo se pinta con una sola regla (sección 3).

**Lo que no hacemos nunca:**
- pagos con plata;
- energía que se acaba;
- avisos que molesten al teléfono.

---

## 2. Dónde estamos (7 %)

| Hecho | Falta pulir |
|---|---|
| Parcelas en una cuadrícula de casillas en diagonal, cámara que se arrastra | Las matas traen su propio montoncito de tierra y quedan como pegadas encima de la parcela (sección 3.6) |
| Cinco cultivos, plagas que secan la mata, marchitarse | La parcela pintada no es un rombo 2:1 exacto y su tierra es de otro color que la de las matas |
| Puesto, encargos, secadero, gallinero | Las construcciones no están pintadas al tamaño de su huella |
| Niveles 1 a 4, partida guiada, monedas compartidas con La Vereda | El monte de alrededor usa matas de la finca como provisionales |
| Vista pública para vecinos (sin pantalla todavía) | El suelo es de colores planos, sin textura de pasto |

---

## 3. La biblia de arte: la regla para que todo encaje

Esto es lo más importante del plan. Si cada pieza la cumple, todo encaja, hoy y cuando la finca
crezca. Va completo en las instrucciones del Gem.

### 3.1 Una sola manera de ver
- **Isométrica 2:1:** cámara desde arriba a unos 30°, todo girado 45°. La base de cualquier cosa
  es un rombo **dos veces más ancho que alto**.
- **Sin perspectiva:** nada se achica con la distancia. **Nunca** horizonte, cielo ni montañas al
  fondo.
- **Luz:** siempre desde **arriba a la izquierda**. La cara izquierda de los objetos va iluminada
  y la derecha en sombra.
- **Sin sombra proyectada en el piso.** El juego pone una sombra suave igual para todos.

### 3.2 Un solo trazo
Cartoon semi-realista con volumen y contorno de tinta café muy oscuro (`#2B1A0E`), del mismo grosor
en todas las piezas (más o menos 2 % del ancho). Sombreado con degradado suave y un brillo pequeño
arriba a la izquierda.

### 3.3 Una sola paleta
Los mismos colores en todas las piezas, para que no haya una tierra más roja que otra:

| Material | Claro | Medio | Sombra |
|---|---|---|---|
| Tierra arada | `#A8713E` | `#8A5A30` | `#5E3A1C` |
| Pasto | `#9CCB5E` | `#7CB54F` | `#4E8A30` |
| Hojas | `#8CC152` | `#4E9A34` | `#2F6A22` |
| Guadua y madera | `#E3C27A` | `#B98A50` | `#7A5A2E` |
| Teja de barro | `#D9774A` | `#B85A32` | `#7E3518` |
| Bahareque (paredes) | `#FBF6EA` | `#E8DCC4` | `#BFAE8E` |
| Zinc | `#C9D0D4` | `#9AA4AA` | `#6B757B` |
| Cereza roja del café | `#E04A3A` | `#B8302A` | `#7A1A16` |

Se le sube a Gemini una imagen de esta paleta como referencia: `arte/referencias/ref_paleta.png`.

### 3.4 La casilla y las huellas
- **Una casilla** es un rombo de 124 × 62 en el juego.
- **Cada pieza ocupa casillas enteras**: su huella.
- **Nada se sale por los lados** de su rombo base. Puede crecer hacia arriba (un árbol, un techo),
  pero no hacia los lados. Así el juego la pone del tamaño justo sin adivinar.

| Huella | Ejemplos | Alto máximo |
|---|---|---|
| 1 × 1 | parcela, mata, arbusto, tablero, colmena, gallinero, adornos | 2 casillas de alto |
| 2 × 2 | casa, secadero, trapiche, corral, guamo, beneficiadero | 3 de alto |
| 3 × 3 | casa grande (nivel alto), plaza, galpón | 3 de alto |
| 1 × 2 | tramo de cerca largo, cama de flores, cerco de piedra | 1,5 de alto |

### 3.5 El lienzo
- **Formato:** cuadrado de 1024 × 1024.
- **Base:** el rombo de la huella abajo y centrado, ocupando el **90 % del ancho** del cuadro.
- **Fondo:** blanco liso (Photoroom lo quita) o transparente.
- **Recorte:** el script recorta y escala por la huella. Ya no hay que acomodar nada a mano.

### 3.6 El suelo y las matas (la causa de que «desentonen»)
Hoy cada mata viene con su propio montoncito de tierra, de otro color y otra forma que la
parcela. Por eso se ven dos suelos, uno encima del otro. La regla nueva:

- **El suelo es una cosa y la mata es otra.** La parcela trae la tierra; la mata **no trae
  tierra**, solo la planta saliendo del suelo, con un poquito de sombra en la raíz.
- La parcela tiene **tres estados**:
  - pasto sin arar, que es tierra comprable;
  - arada y seca;
  - arada y húmeda, cuando está recién sembrada.
- El pasto, el camino y el monte también se pintan como **casillas que encajan unas con otras**
  (sección 7, piezas `t_`). Si Gemini no logra que encajen sin que se note el borde, el juego los
  sigue dibujando, pero con los colores exactos de la paleta.

### 3.7 Las cuatro etapas de cada mata
Siempre las mismas cuatro, y la mata crece **dentro de la misma silueta**:

1. **Semilla:** tierra removida con semillas. Es común a todas y va pintada en la parcela.
2. **Brote:** dos hojitas. También es común a todas.
3. **Creciendo:** la mata a media altura, sin frutos.
4. **Lista:** la mata entera **con frutos bien visibles y de color fuerte**, que se distinga de la
   etapa 3 a simple vista.

Para la **mata seca** el juego oscurece la etapa 3, así que no hay que pintarla aparte. Los
**frutales** tienen además la etapa **«cosechado»**: el árbol sin frutos, que vuelve a cargar.

---

## 4. Las fases, de 0 a 100

Cada fase dice qué se juega, qué se programa y qué piezas pide. Las piezas, con su clave, están
en el catálogo (sección 7).

### Fase 1 · Base visual que encaja (7 → 15 %)
**Se juega igual, pero se ve como un solo juego.**
- **Arte:** la paleta y la ficha de huellas; la parcela en sus 3 estados; las matas de los 5
  cultivos sin tierra (crece y lista); semilla y brote; casillas de pasto, camino y monte; el monte
  (árboles, matas, piedras, flores, cerca).
- **Pantalla:**
  - botones, ventanas e íconos con el mismo estilo de madera y papel de la finca;
  - números que flotan;
  - una sombra igual para todas las piezas.
- **Sonido:** ambiente de finca (pájaros, quebrada, gallinas) y efectos al sembrar, cosechar y
  vender. Va en la guía de sonidos, que es aparte.
- **Programa:** el suelo con casillas pintadas, las matas sin base sobre la parcela y la sombra
  común.

### Fase 2 · Arma tu finca (15 → 25 %)
**El corazón de los juegos de granja: acomodar.**
- **Modo construir:** mover, guardar e intercambiar de sitio las construcciones y las parcelas.
  Una cuadrícula de ayuda dice dónde cabe cada cosa.
- **Más parcelas:**
  - se compran de una en una, hasta 24;
  - se aran con el azadón;
  - las que nadie usa se vuelven pasto.
- **Bodega con capacidad**, que se puede ampliar.
- **Arte:** íconos del modo construir (mover, guardar, girar) y la bodega (2 × 2).

### Fase 3 · Más tierra (25 → 33 %)
- **La finca crece por anillos:** de 8 × 8 a 10 × 10, 12 × 12, 14 × 14 y 16 × 16 casillas. Cada
  anillo cuesta monedas y pide nivel.
- **Letreros de «se vende»** en la tierra del borde, y monte que se limpia: arrancar rastrojo da
  monedas y experiencia.
- **El mapa crece de 14 a 22 casillas por lado.** El camino real llega hasta la portada de la
  finca.
- **Arte:** letrero, rastrojo, tronco caído, piedra grande y portada de la finca (2 × 1).

### Fase 4 · Procesar y cocinar (33 → 48 %)
De lo cosechado salen productos que valen más y que piden los encargos grandes.

| Construcción | Huella | Entra | Sale | Tiempo |
|---|---|---|---|---|
| Beneficiadero | 2 × 2 | café en cereza | café lavado | 5 min |
| Secadero (ya existe) | 2 × 2 | café lavado | café pergamino | 10 min |
| Trapiche | 2 × 2 | 3 atados de caña | panela | 6 min |
| Tostadora de cacao | 1 × 1 | cacao | cacao tostado | 8 min |
| Fogón de leña (cocina) | 2 × 2 | recetas | tinto, chocolate, arepas, aguapanela… | 3 a 15 min |

- **Recetas:** los pedidos de Pedidos del pueblo se cocinan de verdad. Por ejemplo, el tinto
  campesino lleva café pergamino y panela.
- **Cola de producción:** hasta 3 tandas por máquina; se mejora a 5.
- **Arte:** 4 construcciones, 10 productos y la animación simple del humo y la rueda del trapiche.

### Fase 5 · Animales (48 → 58 %)

| Animal y casa | Huella | Come | Da |
|---|---|---|---|
| Gallinas · gallinero (ya existe) | 1 × 1 | maíz | huevos |
| Vacas · corral | 2 × 2 | pasto de corte | leche → queso y kumis en la cocina |
| Cerdos · marranera | 2 × 1 | cáscaras y plátano | abono, que hace crecer más rápido |
| Abejas · colmenas | 1 × 1 | (flores cerca) | miel; las matas de al lado crecen más rápido |
| Mula | 1 × 1 | panela | la chiva carga más pedidos |
| Perro | 1 × 1 | — | espanta a los animales que dañan matas (los de El espantapájaros vuelven aquí) |

- **Cultivos nuevos para alimentarlos:** maíz y pasto de corte.
- **Los animales caminan** un poco dentro de su corral: una animación simple de dos cuadros.
- **Arte:**
  - 4 casas de animales;
  - 6 animales en 2 poses cada uno;
  - 6 productos;
  - 2 cultivos con sus etapas.

### Fase 6 · Frutales y cultivos nuevos (58 → 66 %)
- **Frutales que se cosechan varias veces:**
  - naranjo, aguacate, mango y guanábana, de 2 × 2;
  - lulo, mora, tomate de árbol y maracuyá, de 1 × 1.
- **Cultivos de ciclo:** maíz, fríjol, yuca, papa y cebolla. Con la huerta, el plátano, el café, la
  caña y el cacao son quince en total.
- **Cada uno con su plaga y su remedio reales**, y con su lámina para el álbum.
- **Arte:** 13 cultivos con 3 etapas cada uno, más la etapa «cosechado» de los frutales, y sus
  productos.

### Fase 7 · Día, noche y clima (66 → 74 %)
- **Ciclo de día y noche** según la hora real. De noche salen luciérnagas y, a veces, un espanto
  que hay que ahuyentar con el farol (el mismo de Espantos en la oscuridad).
- **El clima de las cartas en la finca:**
  - el aguacero riega y adelanta las matas;
  - la sequía obliga a regar;
  - la helada daña lo que no está protegido;
  - la bonanza sube los precios del puesto.
- **Las cosechas del año:** la traviesa y la principal, con encargos especiales.
- **Arte:** el filtro de noche lo hace el código; se pintan el farol, el pozo, el tanque y la
  manguera, y la lluvia la hace el código.

### Fase 8 · El pueblo (74 → 84 %)
- **La chiva:** lleva los encargos al pueblo y vuelve con monedas en un rato. Con la mula carga
  más.
- **El mercado:** los precios suben y bajan cada día; conviene vender lo que está caro.
- **La tienda:**
  - herramientas que mejoran la finca: azadón, regadera, machete, carretilla;
  - abono y remedios por paquetes.
- **Recolectores:** se contrata un vecino de la máquina que cosecha solo por un rato.
- **Arte:**
  - la chiva (2 × 1) y la parada de la chiva;
  - 6 herramientas en ícono;
  - el recolector, con 2 poses.

### Fase 9 · Los vecinos (84 → 92 %)
La autopista ya está hecha (`vistaPublica`, `ayudar`, tablas `fincas` y `ayudas`). Falta:
- **Lista de vecinos** con su cara y su nivel. Entrar a su finca, solo para mirar.
- **Ayudar:** curar una plaga ajena (los dos ganan), regar y dejar un regalo.
- **Regalos e intercambio** de semillas entre amigos.
- **La cooperativa:** una meta común entre amigos para la semana, por ejemplo «entre todos,
  200 bultos de café». Si se cumple, todos ganan.
- **Arte:** buzón (1 × 1), cajita de regalo e íconos de ayuda.

### Fase 10 · Tu finca, a tu gusto (92 → 100 %)
- **Adornos por región:**
  - región cafetera: chiva de adorno, jeep Willys, carriel gigante;
  - Caribe: hamaca, palmera, sombrero vueltiao;
  - Pacífico: marimba, canoa, palafito pequeño;
  - Orinoquía: arpa, caballo, palma de moriche.
- **La casa crece:** de 2 × 2 a 3 × 3, en tres versiones.
- **Tu avatar camina por la finca** y saluda.
- **Logros y temporadas**, con adornos de premio.
- **Arte:** unos 30 adornos, 2 casas más y el avatar caminando (4 direcciones × 2 cuadros, de una
  cara base).

---

## 5. Niveles de la finca (1 a 30)

La experiencia que pide cada nivel sube poco a poco (más o menos +25 % por nivel). Lo que se abre:

| Nivel | Se abre |
|---|---|
| 1–4 | Huerta, plátano, café, caña, cacao; secadero, gallinero (hecho) |
| 5 | Modo construir, comprar parcelas |
| 6 | Primer anillo de tierra (10 × 10), bodega |
| 7 | Beneficiadero, maíz |
| 8 | Trapiche, fríjol |
| 9 | Fogón de leña: primeras recetas |
| 10 | Corral y vacas, pasto de corte |
| 11 | Colmenas, flores |
| 12 | Segundo anillo (12 × 12), naranjo |
| 13 | Tostadora de cacao, lulo, mora |
| 14 | Marranera, yuca |
| 15 | La chiva y el pueblo |
| 16 | Aguacate, papa |
| 17 | Mula, tomate de árbol |
| 18 | Tercer anillo (14 × 14), mercado de precios |
| 19 | Mango, cebolla |
| 20 | Perro, recolectores |
| 21–24 | Guanábana, maracuyá, tienda completa, cuarto anillo (16 × 16) |
| 25–30 | Casa grande, adornos de premio, temporadas |

Como decidiste, **los niveles de la finca no limitan nada de Cosecha ni de Pedidos**.

---

## 6. Economía

- **Una sola moneda:** las monedas de todo el juego, y la experiencia para subir de nivel.
- **De dónde salen:**
  - partidas de Cosecha y de Pedidos;
  - minijuegos;
  - el puesto y los encargos;
  - la chiva;
  - limpiar monte;
  - ayudar a vecinos.
- **En qué se van:**
  - semillas y remedios;
  - construcciones y mejoras;
  - tierra y parcelas;
  - adornos;
  - recolectores.
- **Regla de equilibrio:** en una sesión de 10 minutos, un niño de nivel medio debe poder comprar
  algo nuevo o acercarse a algo, sin tener que jugar cartas. Las cartas aceleran, pero no son
  obligatorias.
- Cada fase trae su tabla de precios y tiempos en `MI-FINCA.md` antes de programarse, para
  validarla.

---

## 7. Catálogo de piezas

**Estado:** ✔︎ hecha · ↻ rehacer con la regla nueva · ○ falta.

**Prefijos:**
- `t_`: suelo
- `m_`: mata
- `a_`: árbol frutal
- `b_`: construcción
- `n_`: animal
- `pr_`: producto
- `d_`: adorno
- `h_`: herramienta
- `ui_`: pantalla

En total son **unas 230 piezas**. Al ritmo de 10 a 15 por sesión de Gemini, son entre 15 y 20
sesiones.

### 7.1 Fase 1 · Base visual (43)

| Clave | Pieza | Huella | Estado |
|---|---|---|---|
| `ref_paleta` | Paleta y ficha de huellas (referencia, no va al juego) | — | ✔︎ en `arte/referencias/` |
| `t_pasto_1`, `t_pasto_2`, `t_pasto_3` | Casilla de pasto (tres variantes que encajan) | 1 × 1 | ○ |
| `t_camino_1`, `t_camino_2` | Casilla de camino de tierra | 1 × 1 | ○ |
| `t_monte_1`, `t_monte_2` | Casilla de monte, con pasto más alto y oscuro | 1 × 1 | ○ |
| `t_parcela_pasto` | Parcela sin arar (pasto con borde marcado) | 1 × 1 | ○ |
| `t_parcela_seca` | Parcela arada y seca | 1 × 1 | ↻ (hoy `t_surco`) |
| `t_parcela_humeda` | Parcela arada y húmeda | 1 × 1 | ○ |
| `m_semilla`, `m_brote` | Semillas en la tierra, brote de dos hojas (sin montoncito) | 1 × 1 | ↻ |
| `m_<cultivo>_crece`, `m_<cultivo>_lista` | Huerta, plátano, café, caña, cacao (10, sin tierra) | 1 × 1 | ↻ |
| `d_guamo` | Árbol de sombrío | 2 × 2 | ○ |
| `d_platanera`, `d_cafetal`, `d_arbusto`, `d_piedras`, `d_flores` | Monte | 1 × 1 | ○ |
| `d_cerca_a`, `d_cerca_b`, `d_cerca_esquina`, `d_portada` | Cerca de guadua y portada | 1 × 1 / 2 × 1 | ○ |
| `d_letrero` | Letrero de «se vende» | 1 × 1 | ○ |
| `ui_boton`, `ui_ventana`, `ui_pergamino` | Madera y papel para botones y ventanas | — | ○ |
| `ui_semilla`, `ui_regadera`, `ui_mano`, `ui_moneda`, `ui_estrella` | Íconos | — | ○ |

### 7.2 Construcciones (todas las fases)

| Clave | Huella | Fase | Estado |
|---|---|---|---|
| `b_casa` | 2 × 2 | 1 | ↻ al tamaño de la huella |
| `b_puesto`, `b_tablero` | 1 × 1 | 1 | ↻ al tamaño de la huella |
| `b_secadero` | 2 × 2 | 1 | ↻ al tamaño de la huella |
| `b_gallinero` | 1 × 1 | 1 | ↻ al tamaño de la huella |
| `b_bodega` | 2 × 2 | 2 | ○ |
| `b_beneficiadero`, `b_trapiche`, `b_fogon` | 2 × 2 | 4 | ○ |
| `b_tostadora` | 1 × 1 | 4 | ○ |
| `b_corral` | 2 × 2 | 5 | ○ |
| `b_marranera` | 2 × 1 | 5 | ○ |
| `b_colmena` | 1 × 1 | 5 | ○ |
| `b_pozo`, `b_tanque` | 1 × 1 | 7 | ○ |
| `b_parada_chiva` | 2 × 1 | 8 | ○ |
| `b_buzon` | 1 × 1 | 9 | ○ |
| `b_casa_2`, `b_casa_3` | 3 × 3 | 10 | ○ |

### 7.3 Cultivos y frutales nuevos (fases 5 y 6)
- **Cultivos de ciclo** (`crece` y `lista`): maíz, pasto de corte, fríjol, yuca, papa y cebolla.
  Son 12 piezas.
- **Frutales** (`crece`, `lista` y `cosechado`):
  - de 2 × 2: naranjo, aguacate, mango y guanábana;
  - de 1 × 1: lulo, mora, tomate de árbol y maracuyá.

  Son 24 piezas.

### 7.4 Animales (fase 5)
`n_gallina` (hecha) y `n_ternero` (hecho; servirá de vaca joven), más vaca, cerdo, abeja, mula y
perro. Cada uno en 2 poses (quieto y caminando). Son unas 12 piezas.

### 7.5 Productos
Hechos: `pr_huevos` y `pr_pergamino`.

Faltan, de frente y con el estilo de las cartas: café cereza, café lavado, panela, cacao tostado,
leche, queso, kumis, miel, abono, maíz, fríjol, yuca, papa, cebolla, las ocho frutas y las recetas
de la cocina. Para las recetas se reusan los dibujos `e_*` de Pedidos. Son unos 30.

### 7.6 Pueblo, herramientas y adornos (fases 8 a 10)
- **Pueblo:** la chiva y el recolector.
- **Herramientas:** 6 íconos (`h_azadon`, `h_regadera`, `h_machete`, `h_carretilla`, `h_abono`,
  `h_farol`).
- **Adornos:** 30, por región.
- **Avatar caminando:** 8 cuadros.

---

## 8. Cómo se trabaja, de punta a punta

1. **Se monta el Gem** «Ilustrador de Mi finca» con `GEM-FINCA.md`, y se le suben las imágenes de
   referencia que dice ahí.
2. **Se pide por lotes**, en el orden del catálogo. A cada pieza se le da su clave, su huella y su
   sujeto; el Gem ya sabe el resto.
3. **Photoroom** solo si el fondo no sale blanco liso.
4. **Me pasas el zip.** Yo proceso, reviso que cumpla la regla (huella, paleta, ángulo), lo meto en
   el juego y te digo cuáles repetir y por qué.
5. **El juego nunca se frena por arte:** mientras una pieza no llega, se usa una provisional. Así
   programación y dibujo avanzan a la vez.

### El orden recomendado
1. **Lote 1, la prueba de la regla:** `t_parcela_seca`, `t_pasto_1`, `m_cafe_lista` y
   `m_cafe_crece`. Con estos cuatro comprobamos que mata y suelo encajan. Si encajan, el resto sale
   igual.
2. **Lote 2:** el resto del suelo y las matas de la fase 1.
3. **Lote 3:** el monte y la cerca.
4. **Lote 4:** las construcciones de hoy, otra vez, al tamaño de su huella.
5. **Lote 5:** pantalla e íconos.
6. **Desde aquí, lote a lote con las fases:** primero se programa la fase con provisionales, y luego
   llegan sus piezas.

---

## 9. Decisiones que quedan abiertas (para validar cuando lleguemos)

1. Si el suelo va pintado en casillas o dibujado por el juego (depende del lote 1).
2. Precios y tiempos de cada fase, con su tabla, antes de programarla.
3. Si el avatar camina por la finca (fase 10) o solo se ve en la casa.
4. Qué espantos de noche van a la finca y cómo se ahuyentan.
