"""
Pentru fiecare <picture> existent (creat de apply_srcset.py), adauga
un <source srcset="<original>.webp" type="image/webp"> pentru desktop.
Pentru <img> ramase neambalate, le ambaleaza in <picture> simplu cu
sursa WebP desktop.
"""
import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"D:\CLAUDE\SITEWEB"
HTML_FILES = ["index.html", "euroelectric-nou.html"]

# Pattern pentru <picture><source media="(max-width: 700px)"...><img src="...jpg/jpeg/png"...></picture>
# Vrem sa adaugam <source srcset="<img-src>.webp" type="image/webp"> intre source mobile si img
PIC_RE = re.compile(
    r'(<picture>)(<source media="\(max-width: 700px\)" srcset="[^"]+" type="image/webp">)(<img\b[^>]*?\bsrc="(Materiale/[^"]+\.(?:jpg|jpeg))"[^>]*?>)(</picture>)',
    re.IGNORECASE
)

# Pentru <img> care NU sunt in <picture> dar au .jpg/.jpeg/.png
LONE_IMG_RE = re.compile(
    r'(?<!<source[^>]>)<img\b([^>]*?)\bsrc="(Materiale/[^"]+\.(?:jpg|jpeg))"([^>]*?)>',
    re.IGNORECASE
)

def webp_path(src):
    """Returneaza calea .webp echivalenta (pastreaza dir, nume normalizat fara spatii)."""
    folder, file = os.path.split(src)
    name_no_ext = os.path.splitext(file)[0].strip().replace(' ', '-')
    candidate_rel = f"{folder}/{name_no_ext}.webp"
    candidate_abs = os.path.join(ROOT, candidate_rel.replace('/', os.sep))
    return candidate_rel if os.path.exists(candidate_abs) else None

def transform_picture(m):
    open_tag, mobile_source, img_tag, src, close_tag = m.groups()
    wp = webp_path(src)
    if not wp:
        return m.group(0)
    desktop_source = f'<source srcset="{wp}" type="image/webp">'
    return f'{open_tag}{mobile_source}{desktop_source}{img_tag}{close_tag}'

def transform_lone(m):
    before, src, after = m.group(1), m.group(2), m.group(3)
    # Skip daca acest <img> e deja in interior de <picture>
    # (handler-ul ar trebui sa-l fi excludu, dar sa fim siguri verificam contextul)
    wp = webp_path(src)
    if not wp:
        return m.group(0)
    has_loading = 'loading=' in before or 'loading=' in after
    loading_attr = '' if has_loading else ' loading="lazy"'
    return (
        f'<picture>'
        f'<source srcset="{wp}" type="image/webp">'
        f'<img{before}src="{src}"{after}{loading_attr}>'
        f'</picture>'
    )

total_pic = 0
total_lone = 0
for f in HTML_FILES:
    path = os.path.join(ROOT, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    # Pas 1: actualizeaza picture existent
    new_content, n1 = PIC_RE.subn(transform_picture, content)
    # Pas 2: ambaleaza imaginile ramase ca <img> simple
    # IMPORTANT: regex-ul nu poate distinge daca img e deja in <picture>; pentru asta,
    # facem inlocuirea pe content unde <picture>...</picture> sunt deja procesate.
    # O abordare mai sigura: extragem toate <picture>...</picture>, le scoatem temporar,
    # apoi ambalam <img> ramasi, apoi le punem inapoi.
    placeholders = []
    def stash(m):
        placeholders.append(m.group(0))
        return f"__PIC_PLACEHOLDER_{len(placeholders)-1}__"
    stripped = re.sub(r'<picture>.*?</picture>', stash, new_content, flags=re.S)
    stripped, n2 = LONE_IMG_RE.subn(transform_lone, stripped)
    # Restore placeholders
    def unstash(m):
        return placeholders[int(m.group(1))]
    new_content = re.sub(r'__PIC_PLACEHOLDER_(\d+)__', unstash, stripped)
    with open(path, 'w', encoding='utf-8', newline='') as fp:
        fp.write(new_content)
    total_pic += n1
    total_lone += n2
    print(f"  {f}: {n1} picture actualizate + {n2} <img> ambalate")

print(f"\nTotal: {total_pic} <picture> actualizate, {total_lone} <img> noi ambalate")
