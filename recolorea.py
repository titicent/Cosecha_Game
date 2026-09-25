"""Versiones provisionales por color de los remedios, sacadas de tu propio arte.

El remedio y el bioinsumo que pintaste traen el líquido de un solo color —el
frasco verde, el matraz rojo— y ese mismo dibujo sale en las cartas de los
cinco cultivos. En una carta de café, un remedio verde contradice la regla que
más importa en el juego: el color manda.

Mientras se pintan las definitivas (están en el Taller de cartas, «nivel
fino»), esto le cambia el color SOLO al líquido: se toman los píxeles cuyo
tono cae en el rango del líquido y se llevan al tono del cultivo, conservando
luces, sombras y degradados. La etiqueta, el vidrio, la tapa y la hoja no se
tocan porque su tono está fuera del rango.

    python3 recolorea.py

Escribe r_casero_<color>.png y r_bioinsumo_<color>.png en public/cartas/, pero
NUNCA encima de uno que ya exista: si pintaste la definitiva, esa manda.
"""
import os
import json
import hashlib
import numpy as np
from PIL import Image
from matplotlib.colors import rgb_to_hsv, hsv_to_rgb

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "cartas")

# tono destino (grados), y cuánto oscurecer/saturar para que se parezca al marco
DESTINO = {
    "cafe":    (4,   1.00, 0.95),
    "platano": (105, 1.00, 0.95),
    "cacao":   (24,  0.85, 0.62),
    "cana":    (46,  1.00, 1.00),
    "huerta":  (175, 0.95, 0.80),
}
# rango de tono del líquido en cada dibujo original: (centro, ancho a cada lado)
LIQUIDO = {
    "r_casero":    (95, 42),     # verde
    "r_bioinsumo": (18, 34),     # rojo anaranjado, cruzando el 0°
}


def recolorear(base, color):
    im = np.asarray(Image.open(os.path.join(DIR, base + ".png")).convert("RGBA")).astype(float) / 255
    rgb, alfa = im[..., :3], im[..., 3:]
    hsv = rgb_to_hsv(rgb)
    h = hsv[..., 0] * 360

    centro, ancho = LIQUIDO[base]
    dist = np.abs(((h - centro + 180) % 360) - 180)            # distancia angular al centro
    # peso suave: 1 en el líquido, 0 fuera, con transición para no dejar bordes
    peso = np.clip((ancho + 8 - dist) / 16, 0, 1) * np.clip((hsv[..., 1] - 0.18) / 0.15, 0, 1)

    th, fs, fv = DESTINO[color]
    nuevo = hsv.copy()
    # se conserva la variación de tono del original, a la mitad, para no aplanar
    nuevo[..., 0] = ((th + (((h - centro + 180) % 360) - 180) * 0.35) % 360) / 360
    nuevo[..., 1] = np.clip(hsv[..., 1] * fs, 0, 1)
    nuevo[..., 2] = np.clip(hsv[..., 2] * fv, 0, 1)
    mezcla = hsv_to_rgb(nuevo) * peso[..., None] + rgb * (1 - peso[..., None])
    return Image.fromarray((np.concatenate([mezcla, alfa], axis=2) * 255).round().astype(np.uint8), "RGBA")


if __name__ == "__main__":
    hechos, respetados = [], []
    for base in LIQUIDO:
        for color in DESTINO:
            destino = os.path.join(DIR, f"{base}_{color}.png")
            if os.path.exists(destino):
                respetados.append(os.path.basename(destino))
                continue
            im = recolorear(base, color)
            im.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(destino, optimize=True)
            hechos.append(os.path.basename(destino))
    # Huella de cada provisional: si más adelante se reemplaza por la pintada,
    # la huella deja de coincidir y `npm run cartas` la cuenta como definitiva.
    reg = os.path.join(DIR, "provisionales.json")
    huellas = json.load(open(reg)) if os.path.exists(reg) else {}
    for h in hechos:
        huellas[h[:-4]] = hashlib.sha1(open(os.path.join(DIR, h), "rb").read()).hexdigest()
    json.dump(huellas, open(reg, "w"), indent=1)
    print(f"  provisionales creadas: {len(hechos)}")
    for h in hechos: print("    " + h)
    if respetados:
        print(f"  ya existían y no se tocaron: {', '.join(respetados)}")
