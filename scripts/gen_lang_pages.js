// Genereaza pagini statice /en/ si /de/ pre-randate cu traducerile existente,
// pentru indexare corecta de catre Google (rezolva S2.1 din audit).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'index.html');
const html = fs.readFileSync(SRC, 'utf-8');

// CSS si JS sunt externalizate; le citim ca sa le inline-am in paginile statice
// (paginile en/de raman self-contained si independente de caile relative)
const cssContent = fs.readFileSync(path.join(ROOT, 'euroelectric.css'), 'utf-8');
const jsContent = fs.readFileSync(path.join(ROOT, 'euroelectric.js'), 'utf-8');

// translations se afla acum in euroelectric.js, nu in HTML
const m = jsContent.match(/const translations\s*=\s*(\{[\s\S]*?\n\});/);
if (!m) throw new Error('translations object not found in euroelectric.js');
const translations = eval('(' + m[1] + ')');

const SITE_BASE = 'https://euroelectric.ro';
const META = {
  en: {
    title: 'Electrical Switchboards & Installations Hunedoara | EUROELECTRIC S.R.L.',
    description: 'Electrical switchboards, electrical installations and photovoltaic systems in Hunedoara, Petroșani, Deva and Valea Jiului. EUROELECTRIC S.R.L. — 20+ years of experience, ANRE authorized, ISO 9001/14001/45001 certified. Request a free quote!'
  },
  de: {
    title: 'Schaltschränke & Elektroinstallationen Hunedoara | EUROELECTRIC S.R.L.',
    description: 'Schaltschränke, Elektroinstallationen und Photovoltaikanlagen in Hunedoara, Petroșani, Deva und Valea Jiului. EUROELECTRIC S.R.L. — über 20 Jahre Erfahrung, ANRE-zugelassen, ISO 9001/14001/45001 zertifiziert. Fordern Sie ein kostenloses Angebot an!'
  }
};

function buildLangPage(lang) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const dict = translations[lang];
  if (!dict) throw new Error('no translations for ' + lang);

  doc.documentElement.setAttribute('lang', lang);

  doc.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  doc.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  doc.querySelectorAll('[data-i18n-select]').forEach(el => {
    const key = el.getAttribute('data-i18n-select');
    if (dict[key]) {
      const opts = dict[key].split('|');
      Array.from(el.options).forEach((opt, i) => { if (opts[i]) opt.text = opts[i]; });
    }
  });

  // Title + meta description / Open Graph / Twitter — traduse pentru SEO
  const meta = META[lang];
  doc.title = meta.title;
  const setMeta = (selector, attr, value) => {
    const el = doc.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  setMeta('meta[name="description"]', 'content', meta.description);
  setMeta('meta[property="og:title"]', 'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.description);
  setMeta('meta[name="twitter:title"]', 'content', meta.title);
  setMeta('meta[name="twitter:description"]', 'content', meta.description);
  setMeta('meta[property="og:locale"]', 'content', lang === 'en' ? 'en_US' : 'de_DE');

  // Canonical + hreflang — fiecare versiune isi pointeaza propriul URL
  const pageUrl = `${SITE_BASE}/${lang}/`;
  setMeta('link[rel="canonical"]', 'href', pageUrl);
  setMeta('meta[property="og:url"]', 'content', pageUrl);
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => {
    const hl = el.getAttribute('hreflang');
    if (hl === 'ro') el.setAttribute('href', `${SITE_BASE}/`);
    else if (hl === 'en') el.setAttribute('href', `${SITE_BASE}/en/`);
    else if (hl === 'de') el.setAttribute('href', `${SITE_BASE}/de/`);
    else if (hl === 'x-default') el.setAttribute('href', `${SITE_BASE}/`);
  });

  // Comutatorul de limba devine link real catre pagina statica corespunzatoare
  // (evita flicker RO->lang si ofera Google linkuri crawlabile intre versiuni)
  const langHrefs = { ro: '../', en: './', de: '../de/' };
  doc.querySelectorAll('.lang-btn').forEach(btn => {
    const target = btn.getAttribute('data-lang');
    const a = doc.createElement('a');
    a.className = btn.className.replace('active', '').trim() + (target === lang ? ' active' : '');
    a.setAttribute('href', target === lang ? '#' : langHrefs[target]);
    a.textContent = btn.textContent;
    btn.replaceWith(a);
  });

  // Inline CSS extern -> <style> (pagina self-contained, independenta de cai relative)
  doc.querySelectorAll('link[rel="stylesheet"][href*="euroelectric.css"]').forEach(link => {
    const style = doc.createElement('style');
    style.textContent = cssContent;
    link.replaceWith(style);
  });

  // Inline JS extern -> <script>, cu auto-restaurarea localStorage neutralizata
  // (altfel setLang(localStorage||'ro') ar suprascrie traducerea pre-randata)
  const jsInlined = jsContent.replace(
    /\(function\(\)\{ setLang\(localStorage\.getItem\('lang'\) \|\| 'ro'\); \}\)\(\);/,
    `/* lang fixat la generare: ${lang} */`
  );
  doc.querySelectorAll('script[src*="euroelectric.js"]').forEach(s => {
    const script = doc.createElement('script');
    script.textContent = jsInlined;
    s.replaceWith(script);
  });

  // Caile relative catre Materiale/ trebuie ajustate pentru subdirector (../)
  doc.querySelectorAll('img[src^="Materiale/"], a[href^="Materiale/"], source[srcset^="Materiale/"]')
    .forEach(el => {
      ['src', 'href', 'srcset'].forEach(attr => {
        if (el.hasAttribute(attr) && el.getAttribute(attr).startsWith('Materiale/')) {
          el.setAttribute(attr, '../' + el.getAttribute(attr));
        }
      });
    });

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

['en', 'de'].forEach(lang => {
  const dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  const out = buildLangPage(lang);
  fs.writeFileSync(path.join(dir, 'index.html'), out, 'utf-8');
  console.log(`Generated ${lang}/index.html (${(out.length / 1024).toFixed(0)} KB)`);
});
