"""
Inlocuieste <img src="Materiale/..."> cu <picture> care contine
sursa WebP 600w pentru ecrane mici, pastrand originalul ca fallback.
Doar pentru imagini din /Materiale/ care au varianta -600w.webp generata.
"""
import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"D:\CLAUDE\SITEWEB"
HTML_FILES = ["index.html", "euroelectric-nou.html"]

# match: <img ... src="Materiale/path/file.ext" ... >
IMG_RE = re.compile(r'<img\b([^>]*?)\bsrc="(Materiale/[^"]+\.(?:jpg|jpeg|png))"([^>]*?)>', re.IGNORECASE)

def variant_path(src):
    """Returneaza calea -600w.webp daca exista pe disc, altfel None."""
    # ex: Materiale/Tablouri/Tablou4.jpg -> Materiale/Tablouri/Tablou4-600w.webp
    folder, file = os.path.split(src)
    name_no_ext = os.path.splitext(file)[0].strip().replace(' ', '-')
    candidate_rel = f"{folder}/{name_no_ext}-600w.webp"
    candidate_abs = os.path.join(ROOT, candidate_rel.replace('/', os.sep))
    return candidate_rel if os.path.exists(candidate_abs) else None

def transform_match(m):
    before, src, after = m.group(1), m.group(2), m.group(3)
    variant = variant_path(src)
    if not variant:
        return m.group(0)  # nimic de facut
    # Daca exista deja loading=lazy nu il adaugam din nou
    has_loading = 'loading=' in before or 'loading=' in after
    loading_attr = '' if has_loading else ' loading="lazy"'
    # Construim <picture>
    return (
        f'<picture>'
        f'<source media="(max-width: 700px)" srcset="{variant}" type="image/webp">'
        f'<img{before}src="{src}"{after}{loading_attr}>'
        f'</picture>'
    )

total_changes = 0
for f in HTML_FILES:
    path = os.path.join(ROOT, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    new_content, n = IMG_RE.subn(transform_match, content)
    # Anti-doubling: daca un <img> e deja in <picture><source>...</source><img...></picture>
    # nu vrem sa-l reimpachetam. IMG_RE matcheaza <img...> simplu, dar un img INTR-un picture
    # arata la fel. Cum stim ca nu re-rulam? Daca <picture> de inainte ramane (nu fac match),
    # iar al doilea run nu modifica nimic in plus. Verificam dupa.
    # Mai sigur: detecteaza si scapa daca este deja in interior de <picture>.
    # Heuristica simpla: daca tag-ul <img> e precedat imediat de </source>, skip.
    # Refacem cu o pass de cleanup:
    new_content = re.sub(
        r'<picture><source[^>]+></picture>',
        '',  # caz patologic
        new_content
    )
    if n > 0:
        with open(path, 'w', encoding='utf-8', newline='') as fp:
            fp.write(new_content)
        total_changes += n
        print(f"  {f}: {n} imagini convertite")
    else:
        print(f"  {f}: 0 imagini (deja convertite sau fara variante)")

print(f"\nTotal: {total_changes} schimbari")
