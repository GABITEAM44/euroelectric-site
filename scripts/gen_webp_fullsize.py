"""
Genereaza .webp full-size pentru fiecare JPG/JPEG din Materiale.
Pastreaza dimensiunile originale. Calitate 82 (echilibrul standard).
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image

BASE = r"D:\CLAUDE\SITEWEB\Materiale"
QUALITY = 82

total_orig = 0
total_webp = 0
created = []
skipped = []

for root, dirs, files in os.walk(BASE):
    for f in files:
        ext = f.lower().split('.')[-1]
        if ext not in ('jpg', 'jpeg'):
            continue
        src = os.path.join(root, f)
        rel = os.path.relpath(src, BASE)
        # Output WebP — pastreaza numele exact dar cu -fs.webp NU, vrem nume normalizat
        name_no_ext = os.path.splitext(f)[0].strip().replace(' ', '-')
        out_name = f"{name_no_ext}.webp"
        out_path = os.path.join(root, out_name)
        # Skip daca exista deja un .webp cu acel nume si NU e -600w
        if os.path.exists(out_path):
            skipped.append((rel, "exista deja"))
            continue
        try:
            img = Image.open(src)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            orig_size = os.path.getsize(src)
            img.save(out_path, "WEBP", quality=QUALITY, method=6)
            new_size = os.path.getsize(out_path)
            total_orig += orig_size
            total_webp += new_size
            created.append((rel, orig_size, new_size))
            img.close()
        except Exception as e:
            skipped.append((rel, str(e)))

print(f"Convertit: {len(created)} imagini")
print(f"Original JPG total: {total_orig/1024:.1f} KB")
print(f"WebP total: {total_webp/1024:.1f} KB")
if total_orig > 0:
    print(f"Reducere: {(1 - total_webp/total_orig)*100:.1f}%")
if skipped:
    print(f"\nSkipped: {len(skipped)}")
    for r, e in skipped[:5]:
        print(f"  {r}: {e}")
