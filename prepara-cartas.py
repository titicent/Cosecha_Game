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
    if f.startswith("a_"):
        im = im.convert("RGBA"); quitado = 0.0
        if im.size[0] != im.size[1]: im = encuadrar(im)
    else:
        im, quitado = quitar_fondo(im)
        im = encuadrar(im)
    ruta = os.path.join(DESTINO, f)
    guardar(im, ruta)
    print(f"  {f:28s} fondo quitado {quitado*100:5.1f}%   {os.path.getsize(ruta)//1024:4d} KB")
