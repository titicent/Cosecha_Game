"""Prepara las ilustraciones pintadas para el juego.

    python3 prepara-cartas.py <carpeta-con-los-png> [public/cartas]

Los generadores de imágenes entregan tres clases de fondo: transparente de
verdad, blanco liso, y un cuadriculado gris y blanco pintado dentro de la
imagen que solo imita la transparencia. Este script quita los dos últimos
avanzando desde el borde: se come lo claro y sin color que toca el borde y
se detiene en el contorno de tinta, así los blancos de adentro (el brillo de
un frasco, la espuma del jabón) se quedan.

Después recorta al dibujo, lo centra en un cuadrado con el mismo margen para
todas —así se ven del mismo tamaño en la mesa— y lo guarda en paleta de 256
colores, que pesa una décima parte y en carta no se nota.

Los avatares (a_*) no se recortan: son bustos y el encuadre ya es el retrato.

Las piezas de Mi finca (m_* matas, b_* construcciones) se recortan justo al
dibujo, sin cuadrado ni margen: van paradas sobre el terreno y la base del
dibujo tiene que quedar en el borde de abajo. Se guardan a 512 px.
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ORIGEN = sys.argv[1]
DESTINO = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "public", "cartas")
LADO = 1024          # tamaño final
MARGEN = 0.04        # aire alrededor del dibujo, por lado

def quitar_fondo(im):
    a = np.asarray(im.convert("RGBA")).astype(np.int16)
    rgb, al = a[..., :3], a[..., 3]
    claro = rgb.min(axis=2) >= 168                         # blanco y gris del cuadriculado
    neutro = (rgb.max(axis=2) - rgb.min(axis=2)) <= 22     # sin color
    candidato = (claro & neutro) | (al < 16)
    etiquetas, _ = ndimage.label(candidato)
    borde = np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]]))
    fondo = np.isin(etiquetas, borde[borde > 0])
    # un píxel más para no dejar el halo claro del antialias pegado a la tinta
    halo = ndimage.binary_dilation(fondo, iterations=1) & claro & neutro
    fondo |= halo
    nuevo = a.copy()
    nuevo[..., 3] = np.where(fondo, 0, al)
    return Image.fromarray(nuevo.astype(np.uint8), "RGBA"), fondo.mean()

def quitar_fondo_retrato(im, cierre=4):
    """Como quitar_fondo, pero para retratos con camisa blanca: el fondo no
    puede colarse por los huecos finos del contorno. Se busca el fondo con el
    blanco «adelgazado» (así un hueco de pocos píxeles no conecta la camisa con
    el borde) y después se le devuelve su grosor sin pasar del contorno."""
    a = np.asarray(im.convert("RGBA")).astype(np.int16)
    rgb, al = a[..., :3], a[..., 3]
    claro = rgb.min(axis=2) >= 168
    neutro = (rgb.max(axis=2) - rgb.min(axis=2)) <= 22
    candidato = (claro & neutro) | (al < 16)
    flaco = ndimage.binary_erosion(candidato, iterations=cierre, border_value=1)
    etiquetas, _ = ndimage.label(flaco)
    borde = np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]]))
    fondo = np.isin(etiquetas, borde[borde > 0])
    fondo = ndimage.binary_dilation(fondo, iterations=cierre + 1, mask=candidato)
    # La camisa blanca que llega al borde de abajo no tiene contorno que la
    # separe del fondo, y el fondo se le mete por ahí. Si pasó (hay fondo en el
    # centro de abajo, donde va el pecho), se vuelve a buscar el fondo sin
    # dejarlo entrar por la franja de abajo, y en esa franja solo es fondo lo
    # que queda por fuera del cuerpo, fila por fila.
    alto, ancho = fondo.shape
    if fondo[int(alto * .82):, int(ancho * .38):int(ancho * .62)].mean() > .15:
        corte = int(alto * .8)
        arriba = candidato.copy(); arriba[corte:] = False
        flaco = ndimage.binary_erosion(arriba, iterations=cierre, border_value=1)
        flaco[corte - cierre - 1:] = False
        etiquetas, _ = ndimage.label(flaco)
        borde = np.unique(np.concatenate([etiquetas[0], etiquetas[:, 0], etiquetas[:, -1]]))
        fondo = np.isin(etiquetas, borde[borde > 0])
        fondo = ndimage.binary_dilation(fondo, iterations=cierre + 1, mask=arriba)
        for y in range(corte, alto):
            cuerpo = np.flatnonzero(~candidato[y])
            if cuerpo.size < 2: fondo[y] = candidato[y]; continue
            fondo[y, :cuerpo[0]] = candidato[y, :cuerpo[0]]
            fondo[y, cuerpo[-1] + 1:] = candidato[y, cuerpo[-1] + 1:]
    halo = ndimage.binary_dilation(fondo, iterations=1) & claro & neutro
    fondo |= halo
    nuevo = a.copy()
    nuevo[..., 3] = np.where(fondo, 0, al)
    return Image.fromarray(nuevo.astype(np.uint8), "RGBA"), fondo.mean()

def encuadrar(im):
    caja = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    if caja: im = im.crop(caja)
    w, h = im.size
    lado = int(max(w, h) / (1 - 2 * MARGEN))
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(im, ((lado - w) // 2, (lado - h) // 2))
    return lienzo

def guardar(im, ruta):
    im = im.resize((LADO, LADO), Image.LANCZOS)
    im.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(ruta, optimize=True)

os.makedirs(DESTINO, exist_ok=True)
for f in sorted(os.listdir(ORIGEN)):
    if not f.lower().endswith(".png"): continue
    im = Image.open(os.path.join(ORIGEN, f))
    if f.startswith(("m_", "b_")):
        im, quitado = quitar_fondo(im)
        a = np.asarray(im).copy(); a[..., 3] = np.where(a[..., 3] < 24, 0, a[..., 3])   # el halo tenue del recorte
        im = Image.fromarray(a, "RGBA")
        caja = im.getchannel("A").getbbox()
        if caja: im = im.crop(caja)
        k = 512 / max(im.size)
        im = im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.LANCZOS)
        ruta = os.path.join(DESTINO, f)
        im.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(ruta, optimize=True)
        print(f"  {f:28s} pieza de la finca {im.size[0]}×{im.size[1]}   {os.path.getsize(ruta)//1024:4d} KB")
        continue
    if f.startswith("a_"):
        # Avatares: se respeta el encuadre del retrato (el juego lo recorta en
        # círculo). Solo se quita el fondo si viene en blanco liso, como pasa
        # cuando la IA los entrega en JPG.
        im = im.convert("RGBA"); quitado = 0.0
        esquinas = [im.getpixel(p) for p in [(0, 0), (im.size[0] - 1, 0), (0, im.size[1] - 1), (im.size[0] - 1, im.size[1] - 1)]]
        if all(c[3] > 200 and min(c[:3]) >= 235 for c in esquinas):
            im, quitado = quitar_fondo_retrato(im)
        if im.size[0] != im.size[1]: im = encuadrar(im)
    else:
        im, quitado = quitar_fondo(im)
        im = encuadrar(im)
    ruta = os.path.join(DESTINO, f)
    guardar(im, ruta)
    print(f"  {f:28s} fondo quitado {quitado*100:5.1f}%   {os.path.getsize(ruta)//1024:4d} KB")
