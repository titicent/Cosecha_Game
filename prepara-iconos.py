"""Prepara los íconos de tipo para las cartas de impresión.

    python3 prepara-iconos.py <carpeta-con-los-png>

Los íconos llegan de Gemini o Meta AI como silueta negra sobre fondo blanco
(esos programas no entregan fondo transparente). La carta los necesita al
revés: blancos sobre transparente, para ponerlos dentro del círculo de color.

Este script convierte cada PNG así: lo oscuro se vuelve blanco opaco y lo
claro transparente, con los bordes suaves conservados. Después recorta al
dibujo, lo centra en un cuadrado con un margen parejo y lo guarda en
public/cartas/iconos/ con el mismo nombre. Solo toma los nombres que el juego
conoce: t_cultivo, t_plaga, t_resistente, t_remedio, t_bioinsumo, t_faena,
t_espanto.
"""
import os, sys
import numpy as np
from PIL import Image

ORIGEN = sys.argv[1]
DESTINO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "cartas", "iconos")
CONOCIDOS = {"t_cultivo", "t_plaga", "t_resistente", "t_remedio", "t_bioinsumo", "t_faena", "t_espanto"}
LADO, MARGEN = 256, 0.06

os.makedirs(DESTINO, exist_ok=True)
hechos, ignorados = [], []
for f in sorted(os.listdir(ORIGEN)):
    nombre, ext = os.path.splitext(f)
    if ext.lower() != ".png":
        continue
    if nombre not in CONOCIDOS:
        ignorados.append(f)
        continue
    im = Image.open(os.path.join(ORIGEN, f)).convert("RGBA")
    a = np.asarray(im).astype(float)
    luz = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]) / 255
    # oscuro → opaco; se estira el contraste para que el gris del antialias no ensucie
    alfa = np.clip((0.85 - luz) / 0.6, 0, 1) * (a[..., 3] / 255)
    salida = np.zeros_like(a)
    salida[..., :3] = 255
    salida[..., 3] = alfa * 255
    ico = Image.fromarray(salida.astype(np.uint8), "RGBA")
    caja = ico.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
    if caja:
        ico = ico.crop(caja)
    w, h = ico.size
    lado = int(max(w, h) / (1 - 2 * MARGEN))
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(ico, ((lado - w) // 2, (lado - h) // 2))
    lienzo.resize((LADO, LADO), Image.LANCZOS).save(os.path.join(DESTINO, nombre + ".png"), optimize=True)
    hechos.append(nombre)

print(f"  {len(hechos)} íconos listos en public/cartas/iconos/: {', '.join(hechos) or 'ninguno'}")
faltan = sorted(CONOCIDOS - set(hechos) - {os.path.splitext(f)[0] for f in os.listdir(DESTINO)})
if faltan:
    print(f"  Siguen provisionales: {', '.join(faltan)}")
if ignorados:
    print(f"  No reconocidos (revisa el nombre): {', '.join(ignorados)}")
