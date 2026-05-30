"""
Aplica toate fix-urile de accesibilitate/SEO raportate de Lighthouse.
"""
import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"D:\CLAUDE\SITEWEB"
HTML_FILES = ["index.html", "euroelectric-nou.html"]

FIXES = [
    # 1. Social buttons: adauga aria-label
    (
        '<a href="https://www.facebook.com/EuroElectricHD/" target="_blank" rel="noopener" class="social-btn"><i class="fab fa-facebook-f"></i></a>',
        '<a href="https://www.facebook.com/EuroElectricHD/" target="_blank" rel="noopener" class="social-btn" aria-label="EUROELECTRIC pe Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>'
    ),
    (
        '<a href="https://www.linkedin.com/company/euroelectric-srl/posts/?feedView=all" target="_blank" rel="noopener" class="social-btn"><i class="fab fa-linkedin-in"></i></a>',
        '<a href="https://www.linkedin.com/company/euroelectric-srl/posts/?feedView=all" target="_blank" rel="noopener" class="social-btn" aria-label="EUROELECTRIC pe LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>'
    ),
    (
        '<a href="mailto:office@euroelectric.ro" class="social-btn"><i class="fas fa-envelope"></i></a>',
        '<a href="mailto:office@euroelectric.ro" class="social-btn" aria-label="Trimite email la office@euroelectric.ro"><i class="fas fa-envelope" aria-hidden="true"></i></a>'
    ),
    # 2. iframes: adauga title
    (
        '<iframe id="map-baru"\ndata-src="https://maps.google.com/maps?q=Baru,+Hunedoara,+Romania&z=14&ie=UTF8&output=embed"\nallowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">\n</iframe>',
        '<iframe id="map-baru" title="Harta Google: Sediu EUROELECTRIC Baru, Hunedoara"\ndata-src="https://maps.google.com/maps?q=Baru,+Hunedoara,+Romania&z=14&ie=UTF8&output=embed"\nallowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">\n</iframe>'
    ),
    (
        '<iframe id="map-petrosani"\ndata-src="https://maps.google.com/maps?q=Str.+Petru+Maior+14,+Petrosani,+Hunedoara,+Romania&z=15&ie=UTF8&output=embed"\nallowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"\nstyle="display:none;">\n</iframe>',
        '<iframe id="map-petrosani" title="Harta Google: Punct de lucru EUROELECTRIC Petrosani"\ndata-src="https://maps.google.com/maps?q=Str.+Petru+Maior+14,+Petrosani,+Hunedoara,+Romania&z=15&ie=UTF8&output=embed"\nallowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"\nstyle="display:none;">\n</iframe>'
    ),
    # 3. Logo: width/height explicite (CLS)
    (
        '<img src="Materiale/logo-euroelectric.png" alt="EUROELECTRIC S.R.L. — Profesionalism și Siguranță">',
        '<img src="Materiale/logo-euroelectric.png" alt="EUROELECTRIC S.R.L. — Profesionalism și Siguranță" width="272" height="48">'
    ),
    # 4. Select: adauga id si label
    (
        '<label data-i18n="form-service">Serviciu solicitat</label>\n<select name="service" data-i18n-select="form-select">',
        '<label for="service-select" data-i18n="form-service">Serviciu solicitat</label>\n<select id="service-select" name="service" data-i18n-select="form-select" aria-label="Selecteaza serviciul solicitat">'
    ),
    # 5. Back to top: aria-label explicit (poate exista deja, dar siguranta)
    (
        '<button class="back-to-top" id="backToTop" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">\n<i class="fas fa-chevron-up"></i>',
        '<button class="back-to-top" id="backToTop" aria-label="Inapoi sus" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">\n<i class="fas fa-chevron-up" aria-hidden="true"></i>'
    ),
]

# Footer logo (poate avea size diferit - 50px)
FOOTER_LOGO_FIX = (
    '<img src="Materiale/logo-euroelectric.png" alt="EUROELECTRIC S.R.L.">',
    '<img src="Materiale/logo-euroelectric.png" alt="EUROELECTRIC S.R.L." width="200" height="40">'
)

for f in HTML_FILES:
    path = os.path.join(ROOT, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    original = content
    n = 0
    for old, new in FIXES:
        if old in content:
            content = content.replace(old, new)
            n += 1
    # Footer logo
    if FOOTER_LOGO_FIX[0] in content:
        content = content.replace(FOOTER_LOGO_FIX[0], FOOTER_LOGO_FIX[1])
        n += 1
    if content != original:
        with open(path, 'w', encoding='utf-8', newline='') as fp:
            fp.write(content)
    print(f"  {f}: {n} fix-uri aplicate")
