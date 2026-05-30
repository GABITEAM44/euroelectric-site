"""
Generator imagini responsive: pentru fiecare imagine din lista,
creeaza variante -600w.webp, -1200w.webp (+ pastreaza originalul ca fallback).
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image

BASE = r"D:\CLAUDE\SITEWEB\Materiale"
WIDTHS = [600, 1200]
QUALITY_WEBP = 78

# lista relativa la BASE (din grep)
IMAGES = [
    "Foto-sediu-optimizat.jpg",
    "Fotovoltaice/Fotovoltaice1.jpg",
    "Fotovoltaice/Fotovoltaice2.jpg",
    "Fotovoltaice/Fotovoltaice3.jpg",
    "Fotovoltaice/Fotovoltaice4.jpg",
    "Instalatii/Instalatii2.jpeg",
    "Instalatii/Instalatii4.jpeg",
    "Instalatii/Instalatii5.jpeg",
    "Instalatii/MT 2.jpeg",
    "Instalatii/MT 5 .jpeg",
    "Instalatii/MT1 .jpeg",
    "Laborator PRAM/LABORATOR1.jpg",
    "Laborator PRAM/LABORATOR2.jpg",
    "Laborator PRAM/LABORATOR3.jpg",
    "StatiiIncarcare/StatiiEV1.jpg",
    "StatiiIncarcare/StatiiEV2.jpg",
    "Tablouri/Tablou1.jpg",
    "Tablouri/Tablou2.jpg",
    "Tablouri/Tablou3.jpg",
    "Tablouri/Tablou4.jpg",
    "Tablouri/Tablou5.jpg",
    "Tablouri/Tablou6.jpg",
    "VERIFICARI/VERIFICARI1.jpg",
    "VERIFICARI/VERIFICARI2.jpg",
    "VERIFICARI/VERIFICARI3.jpg",
]

total_orig = 0
total_new = 0
created = []
skipped = []

for rel in IMAGES:
    src = os.path.join(BASE, rel)
    if not os.path.exists(src):
        skipped.append((rel, "MISSING"))
        continue
    try:
        img = Image.open(src)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        orig_w, orig_h = img.size
        orig_size = os.path.getsize(src)
        total_orig += orig_size

        base_dir = os.path.dirname(src)
        name_no_ext = os.path.splitext(os.path.basename(rel))[0]
        # Normalizeaza spatiile dintr-un nume (ex: "MT 2" -> "MT-2")
        name_clean = name_no_ext.strip().replace(' ', '-')

        for w in WIDTHS:
            if orig_w <= w:
                # Nu mari niciodata
                continue
            new_h = round(orig_h * w / orig_w)
            resized = img.resize((w, new_h), Image.LANCZOS)
            out_name = f"{name_clean}-{w}w.webp"
            out_path = os.path.join(base_dir, out_name)
            resized.save(out_path, "WEBP", quality=QUALITY_WEBP, method=6)
            new_size = os.path.getsize(out_path)
            total_new += new_size
            created.append((rel, w, new_size))
        img.close()
    except Exception as e:
        skipped.append((rel, str(e)))

print(f"Generate: {len(created)} variante")
print(f"Original total: {total_orig/1024:.1f} KB")
print(f"Variante noi total: {total_new/1024:.1f} KB")
if skipped:
    print("\nSARITE:")
    for r, e in skipped:
        print(f"  {r}: {e}")
print("\nExemple primele 6:")
for c in created[:6]:
    print(f"  {c[0]} -> {c[1]}w = {c[2]/1024:.1f} KB")
