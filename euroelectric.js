// Navbar scroll effect
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
navbar.classList.toggle("scrolled", window.scrollY > 50);
backToTop.classList.toggle("visible", window.scrollY > 400);
});
// Scrollspy - evidentiaza sectiunea activa in navbar
(function() {
const sections = document.querySelectorAll('section[id], div[id="acasa"]');
const navLinks = document.querySelectorAll('.nav-menu a');
window.addEventListener('scroll', function() {
let current = '';
sections.forEach(sec => {
if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
});
navLinks.forEach(link => {
link.classList.remove('nav-active');
if (link.getAttribute('href') === '#' + current) link.classList.add('nav-active');
});
});
})();
// Mobile menu
function toggleMenu() {
var menu = document.getElementById("navMenu");
var hamburger = document.getElementById("hamburger");
var isOpen = menu.classList.toggle("open");
hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
hamburger.setAttribute("aria-label", isOpen ? "Închide meniul de navigare" : "Deschide meniul de navigare");
}
document.querySelectorAll(".nav-menu a").forEach(link => {
link.addEventListener("click", () => {
document.getElementById("navMenu").classList.remove("open");
document.getElementById("hamburger").setAttribute("aria-expanded", "false");
document.getElementById("hamburger").setAttribute("aria-label", "Deschide meniul de navigare");
});
});
// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
btn.addEventListener("click", () => {
document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
btn.classList.add("active");
const filter = btn.getAttribute("data-filter");
document.querySelectorAll(".project-card").forEach(card => {
if (filter === "all" || card.getAttribute("data-category") === filter) {
card.style.display = "";
} else {
card.style.display = "none";
}
});
});
});
// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
// Counter animation (eased, rAF-based)
function animateCounter(el, target, suffix, duration) {
var start = null;
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function step(ts) {
if (!start) start = ts;
var progress = Math.min((ts - start) / duration, 1);
el.textContent = Math.floor(easeOut(progress) * target) + suffix;
if (progress < 1) requestAnimationFrame(step);
else el.textContent = target + suffix;
}
requestAnimationFrame(step);
}
function animateCounters() {
document.querySelectorAll(".stat-number[data-target]").forEach(function(el) {
var target = parseInt(el.dataset.target);
var suffix = target > 10 ? "+" : "";
var duration = target <= 5 ? 1200 : target <= 30 ? 1400 : 1800;
animateCounter(el, target, suffix, duration);
});
}
var statsAnimated = false;
var statsObs = new IntersectionObserver(function(entries) {
if (entries[0].isIntersecting && !statsAnimated) {
statsAnimated = true;
animateCounters();
statsObs.disconnect();
}
}, { threshold: 0.3 });
var statsEl = document.querySelector("#de-ce-noi .why-visual");
if (statsEl) statsObs.observe(statsEl);
// Hero stat animation on load
window.addEventListener("load", function() {
document.querySelectorAll(".hero-stat-num").forEach(function(el) {
var text = el.textContent;
var num = parseInt(text);
var suffix = text.replace(num.toString(), "");
if (isNaN(num)) return;
animateCounter(el, num, suffix, 1600);
});
});
// Form submit
// ===== VALIDARE INLINE FORMULAR =====
const FORM_VALIDATORS = {
  name: function(v) { return v.trim().length >= 2; },
  phone: function(v) {
    var digits = v.replace(/[\s\-\.\(\)]/g, '');
    return /^(\+40|0)7\d{8}$/.test(digits);
  },
  email: function(v) {
    if (!v.trim()) return true;
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v.trim());
  },
  message: function(v) { return v.trim().length >= 10; },
  gdpr: function(_, el) { return el.checked; }
};
function validateField(input) {
  var key = input.getAttribute('data-validate');
  if (!key || !FORM_VALIDATORS[key]) return true;
  var ok = FORM_VALIDATORS[key](input.value, input);
  if (key === 'gdpr') {
    var errEl = document.querySelector('[data-error-for="gdpr"]');
    if (errEl) errEl.style.display = ok ? 'none' : 'block';
    return ok;
  }
  var group = input.closest('.form-group');
  if (!group) return ok;
  group.classList.toggle('has-error', !ok);
  group.classList.toggle('is-valid', ok && input.value.trim() !== '');
  return ok;
}
(function initFormValidation() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.querySelectorAll('[data-validate]').forEach(function(input) {
    var ev = (input.type === 'checkbox') ? 'change' : 'blur';
    input.addEventListener(ev, function() { validateField(input); });
    input.addEventListener('input', function() {
      var group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) validateField(input);
    });
  });
})();
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector(".btn-submit");
  const feedback = document.getElementById('formFeedback');
  if (feedback) { feedback.className = 'form-feedback'; feedback.textContent = ''; }
  var allValid = true;
  var firstInvalid = null;
  form.querySelectorAll('[data-validate]').forEach(function(input) {
    var ok = validateField(input);
    if (!ok) { allValid = false; if (!firstInvalid) firstInvalid = input; }
  });
  if (!allValid) {
    if (feedback) {
      var lang = document.documentElement.lang || 'ro';
      var msg = (window.translations && translations[lang] && translations[lang]['form-err-summary']) || 'Verificați câmpurile marcate cu roșu.';
      feedback.className = 'form-feedback show error';
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + msg;
    }
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';
  btn.disabled = true;
  try {
    const res = await fetch("https://formspree.io/f/maqvglgv", {
      method: "POST", body: new FormData(form),
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      btn.innerHTML = '<i class="fas fa-check"></i> Solicitare trimisă!';
      btn.style.background = "#2E8B2E";
      if (feedback) {
        var lang2 = document.documentElement.lang || 'ro';
        var okMsg = (window.translations && translations[lang2] && translations[lang2]['form-ok-summary']) || 'Mesajul a fost trimis cu succes. Vă vom contacta în cel mai scurt timp.';
        feedback.className = 'form-feedback show success';
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> ' + okMsg;
      }
      form.reset();
      form.querySelectorAll('.form-group').forEach(function(g) { g.classList.remove('has-error','is-valid'); });
      var gdprErr = document.querySelector('[data-error-for="gdpr"]');
      if (gdprErr) gdprErr.style.display = 'none';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Solicitarea';
        btn.style.background = ""; btn.disabled = false;
      }, 4000);
    } else { throw new Error(); }
  } catch {
    btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Eroare — reîncercați';
    btn.style.background = "#c0392b";
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Trimite Solicitarea';
      btn.style.background = ""; btn.disabled = false;
    }, 3500);
  }
}
// ===== BILINGUAL SYSTEM =====
const translations = {
ro: {
'nav-acasa':'Acasă','nav-de-ce-noi':'De ce noi?','nav-servicii':'Servicii',
'nav-proiecte':'Proiecte','nav-contact':'Contact',
'hero-badge':'<i class="fas fa-bolt"></i> Soluții Electrice Premium',
'hero-title':'PROFESIONALISM <span class="highlight">ȘI SIGURANȚĂ</span>',
'hero-desc':'Euroelectric este o firmă cu capital privat românesc înființată în anul 2003. În peste 20 de ani de activitate, am construit o echipă dinamică de ingineri și specialiști în instalații electrice, tablouri electrice, verificări echipamente și dezvoltare de produse pentru vehicule electrice și energii verzi.',
'cert-label':'Certificări &amp; Autorizații',
'why-tag':'De ce să ne alegeți',
'why-title':'Expertiză, <span>Calitate</span> și Siguranță',
'why-desc':'Nu suntem doar executanți, suntem consultanții tăi tehnici. Combinăm dotările de ultimă oră (precum autolaboratorul Centrix 1) cu precizia software-ului Eplan pentru a oferi siguranță totală instalației tale electrice.',
'why-f1-title':'Experiență și Profesionalism','why-f1-desc':'Peste 20 de ani de activitate în instalații electrice comerciale, industriale și rezidențiale de înaltă performanță.',
'why-f2-title':'Certificări ISO','why-f2-desc':'Certificați ISO 9001, ISO 14001 și ISO 45001 — garanția calității, responsabilității ecologice și siguranței muncii.',
'why-f3-title':'Autorizat ANRE &amp; IGSU','why-f3-desc':'Autorizație completă pentru proiectare, execuție și verificare instalații electrice la toate tensiunile.',
'why-f4-title':'Suport și Garanție','why-f4-desc':'Asistență tehnică post-instalare și garanție extinsă pentru toate lucrările realizate.',
'stats-title':'EUROELECTRIC în cifre',
'stat1':'Ani de experiență în domeniu','stat2':'Proiecte finalizate cu succes',
'stat3':'Certificări ISO internaționale','stat4':'Puncte de lucru în Hunedoara',
'srv-tag':'Ce oferim','srv-title':'Serviciile <span>Noastre</span>',
'srv-desc':'Soluții electrice complete pentru sectorul rezidențial, comercial și industrial — de la proiectare la punerea în funcțiune.',
'srv-more':'Află mai multe <i class="fas fa-arrow-right"></i>',
's1-title':'Tablouri Electrice','s1-desc':'Proiectare și asamblare tablouri electrice principale și secundare conform normelor europene. Soluții personalizate pentru orice tip de instalație.',
's2-title':'Instalații Electrice','s2-desc':'Proiectare și execuție instalații electrice pentru clădiri rezidențiale, comerciale și industriale. Lucrări certificate și garantate.',
's3-title':'Verificări Instalații Electrice','s3-desc':'Siguranța rețelei tale electrice începe cu o diagnoză corectă. Prin autolaboratorul performant SEBAKMT – Centrix 1, asigurăm localizarea defectelor, testarea izolației, verificarea prizelor de pământ și inspecție termografică pentru instalații fără surprize.',
's4-title':'Sisteme Fotovoltaice','s4-desc':'Instalare panouri solare și sisteme de stocare energie pentru independență energetică. Proiecte rezidențiale și industriale cu randament maxim.',
's5-title':'Stații Încărcare Vehicule Electrice','s5-desc':'Proiectare, instalare și punere în funcțiune a stațiilor de încărcare pentru vehicule electrice. Soluții pentru uz rezidențial, comercial și industrial.',
's6-title':'Instalații Curenți Slabi','s6-desc':'Infrastructuri de rețea structurată, fibră optică și sisteme wireless profesionale. Soluții complete pentru date și telecomunicații.',
'prj-tag':'Portofoliu','prj-title':'Proiecte <span>Realizate</span>',
'prj-desc':'O selecție din lucrările noastre — de la instalații rezidențiale la proiecte industriale de amploare.',
'prj-f0':'Toate','prj-f1':'Tablouri Electrice','prj-f2':'Instalații','prj-f3':'Fotovoltaice','prj-f4':'Stații EV',
'cta-title':'Ai nevoie de o <span>ofertă personalizată</span>?',
'cta-desc':'Contactați-ne astăzi pentru o consultanță gratuită. Echipa noastră de specialiști vă va oferi soluția electrică potrivită nevoilor dvs.',
'cta-btn':'<i class="fas fa-paper-plane"></i> Trimite o cerere',
'blog-tag':'Noutăți &amp; Resurse',
'blog-desc':'Articole, ghiduri și noutăți din domeniul instalațiilor electrice și energiei regenerabile.',
'blog-read':'Citește mai mult <i class="fas fa-arrow-right"></i>',
'blog-rittal-tag':'Video','blog-rittal-title':'Soluții Rittal &amp; Eplan pentru tablouri electrice profesionale','blog-rittal-desc':'Descoperă cum EUROELECTRIC integrează tehnologiile Rittal și Eplan în proiectarea și execuția tablourilor electrice de înaltă calitate.','blog-rittal-link':'Vizionează pe LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-siemens-tag':'Partener','blog-siemens-title':'Siemens Digital Industries — Soluții pentru automatizare și eficiență energetică','blog-siemens-desc':'EUROELECTRIC colaborează cu Siemens Romania pentru integrarea celor mai avansate soluții de automatizare industrială și echipamente electrice.','blog-siemens-link':'Vezi pe LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-euro-video-tag':'Video','blog-euro-video-title':'EUROELECTRIC — Lucrări și instalații electrice industriale','blog-euro-video-desc':'Descoperă cele mai recente proiecte și realizări EUROELECTRIC SRL — instalații electrice, tablouri și echipamente pentru sectorul industrial.','blog-euro-video-link':'Vizionează pe LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-surlea-video-tag':'Video','blog-surlea-video-title':'EUROELECTRIC — Execuție instalații electrice industriale','blog-surlea-video-desc':'Urmărește echipa EUROELECTRIC în acțiune — execuție profesională de instalații electrice pentru sectorul industrial și comercial.','blog-surlea-video-link':'Vizionează pe LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-ind40-video-tag':'Video','blog-ind40-video-title':'EUROELECTRIC — Industrie 4.0 în proiectarea instalațiilor electrice','blog-ind40-video-desc':'Cum integrează EUROELECTRIC tehnologiile Industrie 4.0 în proiectarea și execuția instalațiilor electrice moderne.','blog-ind40-video-link':'Vizionează pe LinkedIn <i class="fas fa-arrow-right"></i>',
'con-tag':'Luați legătura cu noi','con-title':'Contact <span>&amp;</span> Locații',
'con-desc':'Suntem la dispoziția dvs. pentru orice întrebare sau solicitare de ofertă.',
'con-info-title':'Datele noastre de contact',
'form-title':'Trimite o solicitare','form-name':'Nume *','form-phone':'Telefon *',
'form-email':'Email','form-service':'Serviciu solicitat','form-message':'Mesaj *',
'form-name-ph':'Numele dvs.','form-email-ph':'email@exemplu.ro',
'form-msg-ph':'Descrieți pe scurt proiectul sau solicitarea dvs...',
'form-select':'— Selectați serviciul —|Tablouri Electrice|Instalații Electrice|Panouri Fotovoltaice|Stații Încărcare Vehicule Electrice|Altele / General',
'form-gdpr':'Sunt de acord cu prelucrarea datelor cu caracter personal conform <a href="politica-confidentialitate.html" target="_blank" style="color:var(--cyan);font-weight:600;">Politicii de Confidențialitate</a>. *',
'form-submit':'<i class="fas fa-paper-plane"></i> Trimite Solicitarea',
'err-name':'Introduceți numele (minim 2 caractere).',
'err-phone':'Număr de telefon invalid. Format: 07XX XXX XXX sau +40 7XX XXX XXX.',
'err-email':'Adresă email invalidă (ex: nume@domeniu.ro).',
'err-message':'Mesajul trebuie să aibă minim 10 caractere.',
'err-gdpr':'Trebuie să acceptați Politica de Confidențialitate.',
'form-err-summary':'Verificați câmpurile marcate cu roșu.',
'form-ok-summary':'Mesajul a fost trimis cu succes. Vă vom contacta în cel mai scurt timp.',
'mcb-cta':'SUNĂ ACUM',
'footer-brand':'Soluții electrice complete pentru sectorul rezidențial, comercial și industrial. Profesionalism și Siguranță — din 2003.',
'footer-nav':'Navigare',
'footer-copy':'© 2026 S.C. EUROELECTRIC S.R.L. — Toate drepturile rezervate',
'footer-srv':'Servicii','footer-contact-title':'Contact','footer-privacy':'Confidențialitate','footer-cookies':'Cookie-uri',
'te-tag':'Serviciu Detaliat','te-title':'Tablouri Electrice <span>Joasă Tensiune</span>',
'te-desc':'Panouri de distribuție și control pentru instalații până la 2500A. Soluții industriale, comerciale și publice — de la proiectare la punerea în funcțiune.',
'te-apps-title':'Aplicații Principale',
'te-app1':'Industrie și Manufacturing','te-app2':'Centre Comerciale (Auchan, Lidl, Hornbach)',
'te-app3':'Spitale și Instituții Publice','te-app4':'Energie Regenerabilă (Solar, Eolian)',
'te-app5':'Telecomunicații și Centre de Date','te-app6':'Stații de Încărcare Vehicule Electrice',
'te-srv-title':'Servicii Complete',
'te-srv1-title':'Proiectare','te-srv1-desc':'Soluții personalizate, calcule, scheme electrice, documentație',
'te-srv2-title':'Fabricație','te-srv2-desc':'Prelucrare CNC, asamblare, cablare, protecție anticorozivă',
'te-srv3-title':'Montaj','te-srv3-desc':'Echipă experimentată, instalare la fața locului, suport continuu',
'te-srv4-title':'Testare','te-srv4-desc':'Teste izolație, verificare funcționalitate, rapoarte conformitate',
'te-std-title':'Standarde și Conformitate',
'te-std1-title':'Europene','te-std1-desc':'EN 61439-1, EN 61439-2, EN 60950-1, EN 61010-1',
'te-std2-title':'Naționale','te-std2-desc':'SR EN 60364, NTE 006, NTPA, Legea 123/2012',
'te-std3-title':'Certificări','te-std3-desc':'Marcaj CE, Declarație de Conformitate, Asigurare Răspundere Civilă',
's1-desc':'Proiectare și asamblare tablouri electrice joasă tensiune până la 1000V. Soluții industriale, comerciale și publice conform normelor europene.',
'ie-tag':'Serviciu Detaliat','ie-title':'Instalații Electrice <span>Certificate și Garantate</span>',
'ie-desc':'Proiectare și execuție instalații electrice pentru orice tip de clădire — rezidențial, comercial și industrial. Lucrări executate conform normelor în vigoare, cu garanție și suport 24/7.',
'ie-types-title':'Tipuri de Instalații',
'ie-type1':'Instalații Rezidențiale','ie-type2':'Instalații Comerciale',
'ie-type3':'Instalații Industriale','ie-type4':'Sisteme de Iluminat',
'ie-type5':'Sisteme de Siguranță','ie-type6':'Instalații Speciale',
'ie-apps-title':'Aplicații Principale',
'ie-app1':'Apartamente și Case','ie-app2':'Centre Comerciale (Auchan, Lidl, Hornbach)',
'ie-app3':'Spitale și Instituții Medicale','ie-app4':'Fabrici și Ateliere',
'ie-app5':'Iluminat Stradal și Public','ie-app6':'Stații de Încărcare Vehicule Electrice',
'ie-srv-title':'Servicii Complete',
'ie-srv1-title':'Proiectare','ie-srv1-desc':'Soluții adaptate, calcule sarcini, planuri, dimensionare siguranțe',
'ie-srv2-title':'Execuție','ie-srv2-desc':'Montaj conform normelor, trasare rute, suduri și îmbinări, finisare',
'ie-srv3-title':'Testare','ie-srv3-desc':'Măsurări rezistență, probe sub sarcină, rapoarte conformitate',
'ie-srv4-title':'Suport','ie-srv4-desc':'Garanție, asigurare răspundere civilă, service 24/7',
'ie-std-title':'Standarde și Certificări',
'ie-std1-title':'Europene','ie-std1-desc':'EN 60364, EN 50160, EN 61000, IEC 60950',
'ie-std2-title':'Naționale','ie-std2-desc':'NTE 006-2002, NTPA, SR EN 50083, Legea 123/2012',
'ie-std3-title':'Certificări','ie-std3-desc':'Marcaj CE, Declarație de Conformitate, Inspecție ANRE',
'vi-tag':'Serviciu Detaliat','vi-title':'Verificări Instalații <span>Electrice</span>',
'vi-desc':'Măsurători și verificări complete ale instalațiilor electrice cu echipamente calibrate. Rapoarte tehnice detaliate, certificate de conformitate și recomandări de remediere.',
'vi-types-title':'Tipuri de Verificări',
'vi-type1':'Măsurări Rezistență Izolație','vi-type2':'Măsurări Rezistență Pământ',
'vi-type3':'Probe Sub Sarcină','vi-type4':'Defectoscopie Instalații',
'vi-type5':'Măsurări Continuitate','vi-type6':'Inspecție și Certificare',
'vi-apps-title':'Domenii de Aplicare',
'vi-app1':'Instalații Rezidențiale','vi-app2':'Instalații Comerciale și Industriale',
'vi-app3':'Centre de Date și Telecomunicații','vi-app4':'Sisteme de Iluminat',
'vi-app5':'Sisteme de Siguranță','vi-app6':'Controlul Calității și Conformității',
'vi-srv-title':'Servicii Verificare',
'vi-srv1-title':'Măsurări','vi-srv1-desc':'Echipamente calibrate, măsurări precise, date documentate',
'vi-srv2-title':'Analiză','vi-srv2-desc':'Evaluare conform standarde, identificare defecte, diagnostice',
'vi-srv3-title':'Rapoarte','vi-srv3-desc':'Documentație detaliată, recomandări, certificări de conformitate',
'vi-srv4-title':'Follow-up','vi-srv4-desc':'Remediere defecte, re-verificări, asigurare calitate',
'vi-std-title':'Echipamente și Standarde',
'vi-std1-title':'Aparate','vi-std1-desc':'Megohmmetru, Terrameter, Multimetru, Ampermetru — toate calibrate',
'vi-std2-title':'Standarde','vi-std2-desc':'EN 60364, EN 61557, SR EN 60309, IEC 61010-1',
'vi-std3-title':'Certificări','vi-std3-desc':'Acreditare ANRE, Certificate de Conformitate, Rapoarte Inspecție',
'fv-tag':'Serviciu Detaliat','fv-title':'Sisteme Fotovoltaice <span>Solar</span>',
'fv-desc':'Proiectare și instalare sisteme solare complete — On-Grid, Off-Grid și Hibride. Energie curată, independență energetică și recuperarea investiției în 5–8 ani.',
'fv-types-title':'Tipuri de Sisteme',
'fv-type1':'On-Grid (conectate la rețea)','fv-type2':'Off-Grid (sisteme izolate)',
'fv-type3':'Hibride (cu baterii)','fv-type4':'Rezidențiale',
'fv-type5':'Comerciale și Industriale','fv-type6':'Instalații la Scară Mare',
'fv-ben-title':'Beneficii și Aplicații',
'fv-ben1':'Energie curată și regenerabilă','fv-ben2':'Reducerea costurilor de energie',
'fv-ben3':'Deduceri fiscale și subvenții','fv-ben4':'Durabilitate și protecția mediului',
'fv-ben5':'Independență energetică','fv-ben6':'ROI în 5–8 ani',
'fv-srv-title':'Servicii Complete',
'fv-srv1-title':'Proiectare','fv-srv1-desc':'Studiu insolație, calcul putere, schiță instalare, costuri',
'fv-srv2-title':'Instalare','fv-srv2-desc':'Montaj panouri, invertoare, cablare, conectare la rețea',
'fv-srv3-title':'Testare','fv-srv3-desc':'Probe funcționalitate, măsurări, rapoarte de conformitate',
'fv-srv4-title':'Mentenanță','fv-srv4-desc':'Curățare panouri, monitorizare, reparații, garanție',
'fv-std-title':'Componente și Standarde',
'fv-std1-title':'Componente','fv-std1-desc':'Panouri de înaltă eficiență, invertoare, structuri montare, cabluri',
'fv-std2-title':'Standarde','fv-std2-desc':'IEC 61215, IEC 61730, EN 50160, SR EN 60364',
'fv-std3-title':'Certificări','fv-std3-desc':'CE Marking, Garanție 25 ani, Certificat conectare ANRE',
'ai-tag':'Serviciu Detaliat','ai-title':'Automatizări <span>Industriale</span>',
'ai-desc':'Soluții complete de automatizare și control pentru fabrici și hale industriale — PLC, SCADA, HMI și convertizoare de frecvență. Productivitate crescută, erori reduse, siguranța operatorilor.',
'ai-types-title':'Sisteme Automatizare',
'ai-type1':'PLC și Controlere','ai-type2':'Sisteme SCADA',
'ai-type3':'Convertizoare de Frecvență','ai-type4':'Sisteme de Monitorizare',
'ai-type5':'Interfețe HMI','ai-type6':'Robotică și Mecanizare',
'ai-apps-title':'Domenii de Aplicare',
'ai-app1':'Fabrici și Ateliere','ai-app2':'Linii de Producție',
'ai-app3':'Sisteme de Distribuție','ai-app4':'Instalații de Apă și Gaze',
'ai-app5':'Centre de Tratare Deșeuri','ai-app6':'Controlul Proceselor',
'ai-srv-title':'Servicii Complete',
'ai-srv1-title':'Proiectare','ai-srv1-desc':'Analiza necesități, schiță sistem, selecție echipamente',
'ai-srv2-title':'Programare','ai-srv2-desc':'Dezvoltare programe PLC, SCADA, teste logică',
'ai-srv3-title':'Instalare','ai-srv3-desc':'Montaj componente, cablare, configurare hardware',
'ai-srv4-title':'Mentenanță','ai-srv4-desc':'Suport tehnic, upgrade, training operatori, garanție',
'ai-std-title':'Beneficii și Standarde',
'ai-std1-title':'Beneficii','ai-std1-desc':'Creșterea productivității, reducerea erorilor, siguranța operatorilor',
'ai-std2-title':'Standarde','ai-std2-desc':'EN 61131-3, EN 60204-1, EN 61508, IEC 61010-1',
'ai-std3-title':'Certificări','ai-std3-desc':'CE Marking, Documente conformitate, Manuale de operare',
'cs-tag':'Serviciu Detaliat','cs-title':'Instalații <span>Curenți Slabi</span>',
'cs-desc':'Infrastructuri complete de telecomunicații, date și siguranță — CCTV, alarme, control acces, rețele LAN/WiFi și fibră optică. Conectivitate și siguranță pentru orice tip de clădire.',
'cs-types-title':'Tipuri de Instalații',
'cs-type1':'Telecomunicații și Date','cs-type2':'Sisteme de Siguranță (CCTV)',
'cs-type3':'Sisteme de Alarme','cs-type4':'Sonorizare și Multimedia',
'cs-type5':'Sisteme de Control Acces','cs-type6':'Rețele LAN/WiFi/Fibră Optică',
'cs-apps-title':'Domenii de Aplicare',
'cs-app1':'Clădiri de Birouri','cs-app2':'Centre Comerciale și Magazine',
'cs-app3':'Spitale și Centre Medicale','cs-app4':'Fabrici și Ateliere',
'cs-app5':'Centre de Date','cs-app6':'Bănci și Instituții Financiare',
'cs-srv-title':'Servicii Complete',
'cs-srv1-title':'Proiectare','cs-srv1-desc':'Studiu necesități, schiță rute, dimensionare cabluri și canale',
'cs-srv2-title':'Instalare','cs-srv2-desc':'Trasare rute, montaj dulii, instalare fire și conectori',
'cs-srv3-title':'Testare','cs-srv3-desc':'Verificări continuitate, teste transmisie, certificări',
'cs-srv4-title':'Mentenanță','cs-srv4-desc':'Suport 24/7, update sisteme, training utilizatori',
'cs-std-title':'Echipamente și Standarde',
'cs-std1-title':'Materiale','cs-std1-desc':'Cabluri Cat5e/Cat6/Cat6A, Fibră optică, Conectori, Panouri',
'cs-std2-title':'Standarde','cs-std2-desc':'EN 50173, EN 50174, EN 60364-5-56, IEC 61076-2-109',
'cs-std3-title':'Certificări','cs-std3-desc':'Teste de Transmisie, Documente Conformitate, Manuale'
},
en: {
'nav-acasa':'Home','nav-de-ce-noi':'Why us?','nav-servicii':'Services',
'nav-proiecte':'Projects','nav-contact':'Contact',
'hero-badge':'<i class="fas fa-bolt"></i> Premium Electrical Solutions',
'hero-title':'PROFESSIONALISM <span class="highlight">AND SAFETY</span>',
'hero-desc':'Euroelectric is a privately-owned Romanian company founded in 2003. Over more than 20 years of activity, we have built a dynamic team of engineers and specialists in electrical installations, switchboards, equipment testing and development of products for electric vehicles and green energy.',
'cert-label':'Certifications &amp; Authorizations',
'why-tag':'Why choose us','why-title':'Expertise, <span>Quality</span> and Safety',
'why-desc':'We are not just contractors — we are your technical consultants. We combine state-of-the-art equipment (such as the Centrix 1 mobile laboratory) with the precision of Eplan software to deliver complete safety for your electrical installation.',
'why-f1-title':'Experience and Professionalism','why-f1-desc':'Over 20 years of activity in high-performance commercial, industrial and residential electrical installations.',
'why-f2-title':'ISO Certifications','why-f2-desc':'ISO 9001, ISO 14001 and ISO 45001 certified — the guarantee of quality, environmental responsibility and workplace safety.',
'why-f3-title':'Authorized ANRE &amp; IGSU','why-f3-desc':'Full authorization for design, execution and verification of electrical installations at all voltage levels.',
'why-f4-title':'Support and Warranty','why-f4-desc':'Post-installation technical assistance and extended warranty for all completed works.',
'stats-title':'EUROELECTRIC in numbers',
'stat1':'Years of experience','stat2':'Successfully completed projects',
'stat3':'International ISO certifications','stat4':'Work points in Hunedoara County',
'srv-tag':'What we offer','srv-title':'Our <span>Services</span>',
'srv-desc':'Complete electrical solutions for the residential, commercial and industrial sector — from design to commissioning.',
'srv-more':'Learn more <i class="fas fa-arrow-right"></i>',
's1-title':'Electrical Panels','s1-desc':'Design and assembly of main and secondary electrical panels according to European standards. Customized solutions for any type of installation.',
's2-title':'Electrical Installations','s2-desc':'Design and execution of electrical installations for residential, commercial and industrial buildings. Certified and guaranteed work.',
's3-title':'Electrical Inspection','s3-desc':'Verification and measurement of electrical installations according to current regulations. Technical reports and authorizations for the safety of your installations.',
's4-title':'Photovoltaic Systems','s4-desc':'Installation of solar panels and energy storage systems for energy independence. Residential and industrial projects with maximum efficiency.',
's5-title':'EV Charging Stations','s5-desc':'Design, installation and commissioning of electric vehicle charging stations. Solutions for residential, commercial and industrial use.',
's6-title':'Low Current Installations','s6-desc':'Structured network infrastructure, fiber optics and professional wireless systems. Complete solutions for data and telecommunications.',
'prj-tag':'Portfolio','prj-title':'Completed <span>Projects</span>',
'prj-desc':'A selection of our work — from residential installations to large-scale industrial projects.',
'prj-f0':'All','prj-f1':'Electrical Panels','prj-f2':'Installations','prj-f3':'Photovoltaic','prj-f4':'EV Stations',
'cta-title':'Do you need a <span>customized offer</span>?',
'cta-desc':'Contact us today for a free consultation. Our team of specialists will provide the right electrical solution for your needs.',
'cta-btn':'<i class="fas fa-paper-plane"></i> Send a request',
'blog-tag':'News &amp; Resources','blog-desc':'Articles, guides and news from the field of electrical installations and renewable energy.',
'blog-read':'Read more <i class="fas fa-arrow-right"></i>',
'con-tag':'Get in touch','con-title':'Contact <span>&amp;</span> Locations',
'con-desc':'We are at your disposal for any question or offer request.',
'con-info-title':'Our contact details',
'form-title':'Send a request','form-name':'Name *','form-phone':'Phone *',
'form-email':'Email','form-service':'Service requested','form-message':'Message *',
'form-name-ph':'Your name','form-email-ph':'email@example.com',
'form-msg-ph':'Briefly describe your project or request...',
'form-select':'— Select service —|Electrical Panels|Electrical Installations|Photovoltaic Panels|EV Charging Stations|Other / General',
'form-gdpr':'I agree to the processing of personal data in accordance with the <a href="politica-confidentialitate.html" target="_blank" style="color:var(--cyan);font-weight:600;">Privacy Policy</a>. *',
'form-submit':'<i class="fas fa-paper-plane"></i> Send Request',
'err-name':'Please enter your name (minimum 2 characters).',
'err-phone':'Invalid phone number. Format: 07XX XXX XXX or +40 7XX XXX XXX.',
'err-email':'Invalid email address (e.g., name@domain.com).',
'err-message':'Message must be at least 10 characters long.',
'err-gdpr':'You must accept the Privacy Policy.',
'form-err-summary':'Please check the fields marked in red.',
'form-ok-summary':'Your message was sent successfully. We will contact you shortly.',
'mcb-cta':'CALL NOW',
'blog-rittal-tag':'Video','blog-rittal-title':'Rittal &amp; Eplan Solutions for Professional Electrical Panels','blog-rittal-desc':'Discover how EUROELECTRIC integrates Rittal and Eplan technologies in the design and assembly of high-quality electrical panels.','blog-rittal-link':'Watch on LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-siemens-tag':'Partner','blog-siemens-title':'Siemens Digital Industries — Automation &amp; Energy Efficiency Solutions','blog-siemens-desc':'EUROELECTRIC collaborates with Siemens Romania to integrate the most advanced industrial automation and electrical equipment solutions.','blog-siemens-link':'View on LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-euro-video-tag':'Video','blog-euro-video-title':'EUROELECTRIC — Industrial Electrical Installations & Projects','blog-euro-video-desc':'Discover the latest projects and achievements of EUROELECTRIC SRL — electrical installations, panels and equipment for the industrial sector.','blog-euro-video-link':'Watch on LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-surlea-video-tag':'Video','blog-surlea-video-title':'EUROELECTRIC — Industrial Electrical Installation Work','blog-surlea-video-desc':'Watch the EUROELECTRIC team in action — professional execution of electrical installations for industrial and commercial sectors.','blog-surlea-video-link':'Watch on LinkedIn <i class="fas fa-arrow-right"></i>',
'blog-ind40-video-tag':'Video','blog-ind40-video-title':'EUROELECTRIC — Industry 4.0 in Electrical Installation Design','blog-ind40-video-desc':'How EUROELECTRIC integrates Industry 4.0 technologies in the design and execution of modern electrical installations.','blog-ind40-video-link':'Watch on LinkedIn <i class="fas fa-arrow-right"></i>',
'form-title':'Send a request','form-name':'Name *','form-phone':'Phone *',
'form-email':'Email','form-service':'Service requested','form-message':'Message *',
'form-name-ph':'Your name','form-email-ph':'email@example.com',
'form-msg-ph':'Briefly describe your project or request...',
'form-select':'— Select service —|Electrical Panels|Electrical Installations|Photovoltaic Panels|EV Charging Stations|Other / General',
'form-gdpr':'I agree to the processing of personal data in accordance with the <a href="politica-confidentialitate.html" target="_blank" style="color:var(--cyan);font-weight:600;">Privacy Policy</a>. *',
'form-submit':'<i class="fas fa-paper-plane"></i> Send Request',
'footer-brand':'Complete electrical solutions for the residential, commercial and industrial sector. Professionalism and Safety — since 2003.',
'footer-nav':'Navigation','footer-copy':'© 2026 S.C. EUROELECTRIC S.R.L. — All rights reserved',
'footer-srv':'Services','footer-contact-title':'Contact','footer-privacy':'Privacy Policy','footer-cookies':'Cookies',
'te-tag':'Featured Service','te-title':'Low Voltage <span>Electrical Panels</span>',
'te-desc':'Distribution and control panels for installations up to 1000V. Industrial, commercial and public solutions — from design to commissioning.',
'te-apps-title':'Main Applications',
'te-app1':'Industry & Manufacturing','te-app2':'Shopping Centers (Auchan, Lidl, Hornbach)',
'te-app3':'Hospitals & Public Institutions','te-app4':'Renewable Energy (Solar, Wind)',
'te-app5':'Telecommunications & Data Centers','te-app6':'Electric Vehicle Charging Stations',
'te-srv-title':'Complete Services',
'te-srv1-title':'Design','te-srv1-desc':'Custom solutions, calculations, electrical diagrams, documentation',
'te-srv2-title':'Manufacturing','te-srv2-desc':'CNC machining, assembly, wiring, anti-corrosion protection',
'te-srv3-title':'Installation','te-srv3-desc':'Experienced team, on-site installation, ongoing support',
'te-srv4-title':'Testing','te-srv4-desc':'Insulation tests, functionality checks, compliance reports',
'te-std-title':'Standards & Compliance',
'te-std1-title':'European','te-std1-desc':'EN 61439-1, EN 61439-2, EN 60950-1, EN 61010-1',
'te-std2-title':'National','te-std2-desc':'SR EN 60364, NTE 006, NTPA, Law 123/2012',
'te-std3-title':'Certifications','te-std3-desc':'CE Marking, Declaration of Conformity, Civil Liability Insurance',
's1-desc':'Design and assembly of low-voltage electrical panels up to 1000V. Industrial, commercial and public solutions in accordance with European standards.',
'ie-tag':'Featured Service','ie-title':'Electrical Installations <span>Certified & Guaranteed</span>',
'ie-desc':'Design and execution of electrical installations for any type of building — residential, commercial and industrial. Work carried out in accordance with current standards, with warranty and 24/7 support.',
'ie-types-title':'Types of Installations',
'ie-type1':'Residential Installations','ie-type2':'Commercial Installations',
'ie-type3':'Industrial Installations','ie-type4':'Lighting Systems',
'ie-type5':'Safety Systems','ie-type6':'Special Installations',
'ie-apps-title':'Main Applications',
'ie-app1':'Apartments & Houses','ie-app2':'Shopping Centers (Auchan, Lidl, Hornbach)',
'ie-app3':'Hospitals & Medical Institutions','ie-app4':'Factories & Workshops',
'ie-app5':'Street & Public Lighting','ie-app6':'Electric Vehicle Charging Stations',
'ie-srv-title':'Complete Services',
'ie-srv1-title':'Design','ie-srv1-desc':'Custom solutions, load calculations, plans, circuit breaker sizing',
'ie-srv2-title':'Execution','ie-srv2-desc':'Installation per standards, cable routing, joints and connections, finishing',
'ie-srv3-title':'Testing','ie-srv3-desc':'Resistance measurements, load tests, compliance reports',
'ie-srv4-title':'Support','ie-srv4-desc':'Warranty, civil liability insurance, 24/7 service',
'ie-std-title':'Standards & Certifications',
'ie-std1-title':'European','ie-std1-desc':'EN 60364, EN 50160, EN 61000, IEC 60950',
'ie-std2-title':'National','ie-std2-desc':'NTE 006-2002, NTPA, SR EN 50083, Law 123/2012',
'ie-std3-title':'Certifications','ie-std3-desc':'CE Marking, Declaration of Conformity, ANRE Inspection',
'vi-tag':'Featured Service','vi-title':'Electrical Installation <span>Inspections</span>',
'vi-desc':'Complete measurements and inspections of electrical installations using calibrated equipment. Detailed technical reports, compliance certificates and remediation recommendations.',
'vi-types-title':'Types of Inspections',
'vi-type1':'Insulation Resistance Measurements','vi-type2':'Earth Resistance Measurements',
'vi-type3':'Load Tests','vi-type4':'Installation Fault Detection',
'vi-type5':'Continuity Measurements','vi-type6':'Inspection & Certification',
'vi-apps-title':'Fields of Application',
'vi-app1':'Residential Installations','vi-app2':'Commercial & Industrial Installations',
'vi-app3':'Data Centers & Telecommunications','vi-app4':'Lighting Systems',
'vi-app5':'Safety Systems','vi-app6':'Quality & Compliance Control',
'vi-srv-title':'Inspection Services',
'vi-srv1-title':'Measurements','vi-srv1-desc':'Calibrated equipment, precise measurements, documented data',
'vi-srv2-title':'Analysis','vi-srv2-desc':'Standards evaluation, fault identification, diagnostics',
'vi-srv3-title':'Reports','vi-srv3-desc':'Detailed documentation, recommendations, compliance certificates',
'vi-srv4-title':'Follow-up','vi-srv4-desc':'Fault remediation, re-inspections, quality assurance',
'vi-std-title':'Equipment & Standards',
'vi-std1-title':'Equipment','vi-std1-desc':'Megohmmeter, Terrameter, Multimeter, Ammeter — all calibrated',
'vi-std2-title':'Standards','vi-std2-desc':'EN 60364, EN 61557, SR EN 60309, IEC 61010-1',
'vi-std3-title':'Certifications','vi-std3-desc':'ANRE Accreditation, Compliance Certificates, Inspection Reports',
'fv-tag':'Featured Service','fv-title':'Photovoltaic Systems <span>Solar</span>',
'fv-desc':'Design and installation of complete solar systems — On-Grid, Off-Grid and Hybrid. Clean energy, energy independence and return on investment in 5–8 years.',
'fv-types-title':'Types of Systems',
'fv-type1':'On-Grid (grid-connected)','fv-type2':'Off-Grid (standalone systems)',
'fv-type3':'Hybrid (with batteries)','fv-type4':'Residential',
'fv-type5':'Commercial & Industrial','fv-type6':'Large-Scale Installations',
'fv-ben-title':'Benefits & Applications',
'fv-ben1':'Clean and renewable energy','fv-ben2':'Reduced energy costs',
'fv-ben3':'Tax deductions and subsidies','fv-ben4':'Sustainability and environmental protection',
'fv-ben5':'Energy independence','fv-ben6':'ROI in 5–8 years',
'fv-srv-title':'Complete Services',
'fv-srv1-title':'Design','fv-srv1-desc':'Insolation study, power calculation, installation layout, costs',
'fv-srv2-title':'Installation','fv-srv2-desc':'Panel mounting, inverters, wiring, grid connection',
'fv-srv3-title':'Testing','fv-srv3-desc':'Functionality tests, measurements, compliance reports',
'fv-srv4-title':'Maintenance','fv-srv4-desc':'Panel cleaning, monitoring, repairs, warranty',
'fv-std-title':'Components & Standards',
'fv-std1-title':'Components','fv-std1-desc':'High-efficiency panels, inverters, mounting structures, cables',
'fv-std2-title':'Standards','fv-std2-desc':'IEC 61215, IEC 61730, EN 50160, SR EN 60364',
'fv-std3-title':'Certifications','fv-std3-desc':'CE Marking, 25-year Warranty, ANRE Grid Connection Certificate',
'ai-tag':'Featured Service','ai-title':'Industrial <span>Automation</span>',
'ai-desc':'Complete automation and control solutions for factories and industrial facilities — PLC, SCADA, HMI and frequency converters. Increased productivity, reduced errors, operator safety.',
'ai-types-title':'Automation Systems',
'ai-type1':'PLC & Controllers','ai-type2':'SCADA Systems',
'ai-type3':'Frequency Converters','ai-type4':'Monitoring Systems',
'ai-type5':'HMI Interfaces','ai-type6':'Robotics & Mechanization',
'ai-apps-title':'Fields of Application',
'ai-app1':'Factories & Workshops','ai-app2':'Production Lines',
'ai-app3':'Distribution Systems','ai-app4':'Water & Gas Installations',
'ai-app5':'Waste Treatment Centers','ai-app6':'Process Control',
'ai-srv-title':'Complete Services',
'ai-srv1-title':'Design','ai-srv1-desc':'Needs analysis, system layout, equipment selection',
'ai-srv2-title':'Programming','ai-srv2-desc':'PLC & SCADA program development, logic testing',
'ai-srv3-title':'Installation','ai-srv3-desc':'Component mounting, wiring, hardware configuration',
'ai-srv4-title':'Maintenance','ai-srv4-desc':'Technical support, upgrades, operator training, warranty',
'ai-std-title':'Benefits & Standards',
'ai-std1-title':'Benefits','ai-std1-desc':'Increased productivity, reduced errors, operator safety',
'ai-std2-title':'Standards','ai-std2-desc':'EN 61131-3, EN 60204-1, EN 61508, IEC 61010-1',
'ai-std3-title':'Certifications','ai-std3-desc':'CE Marking, Compliance Documents, Operation Manuals',
'cs-tag':'Featured Service','cs-title':'Low Current <span>Installations</span>',
'cs-desc':'Complete telecommunications, data and security infrastructure — CCTV, alarms, access control, LAN/WiFi networks and fiber optics. Connectivity and security for any type of building.',
'cs-types-title':'Types of Installations',
'cs-type1':'Telecommunications & Data','cs-type2':'Security Systems (CCTV)',
'cs-type3':'Alarm Systems','cs-type4':'Sound & Multimedia',
'cs-type5':'Access Control Systems','cs-type6':'LAN/WiFi/Fiber Optic Networks',
'cs-apps-title':'Fields of Application',
'cs-app1':'Office Buildings','cs-app2':'Shopping Centers & Stores',
'cs-app3':'Hospitals & Medical Centers','cs-app4':'Factories & Workshops',
'cs-app5':'Data Centers','cs-app6':'Banks & Financial Institutions',
'cs-srv-title':'Complete Services',
'cs-srv1-title':'Design','cs-srv1-desc':'Needs study, route layout, cable and conduit sizing',
'cs-srv2-title':'Installation','cs-srv2-desc':'Route tracing, outlet mounting, wire and connector installation',
'cs-srv3-title':'Testing','cs-srv3-desc':'Continuity checks, transmission tests, certifications',
'cs-srv4-title':'Maintenance','cs-srv4-desc':'24/7 support, system updates, user training',
'cs-std-title':'Equipment & Standards',
'cs-std1-title':'Materials','cs-std1-desc':'Cat5e/Cat6/Cat6A cables, Fiber optic, Connectors, Panels',
'cs-std2-title':'Standards','cs-std2-desc':'EN 50173, EN 50174, EN 60364-5-56, IEC 61076-2-109',
'cs-std3-title':'Certifications','cs-std3-desc':'Transmission Tests, Compliance Documents, Manuals'
},
de: {
'nav-acasa':'Startseite','nav-de-ce-noi':'Warum wir?','nav-servicii':'Leistungen',
'nav-proiecte':'Projekte','nav-contact':'Kontakt',
'hero-badge':'<i class="fas fa-bolt"></i> Premium Elektrolösungen',
'hero-title':'PROFESSIONALITÄT <span class="highlight">UND SICHERHEIT</span>',
'hero-desc':'Euroelectric ist ein rumänisches Privatunternehmen, das 2003 gegründet wurde. In über 20 Jahren Tätigkeit haben wir ein dynamisches Team aus Ingenieuren und Fachleuten für Elektroinstallationen, Schaltschränke, Geräteprüfungen und Produktentwicklung für Elektrofahrzeuge und erneuerbare Energien aufgebaut.',
'cert-label':'Zertifizierungen &amp; Zulassungen',
'why-tag':'Warum uns wählen','why-title':'Expertise, <span>Qualität</span> und Sicherheit',
'why-desc':'Wir sind nicht nur Auftragnehmer – wir sind Ihre technischen Berater. Wir kombinieren modernste Ausrüstung (wie das Centrix 1 Fahrzeuglabor) mit der Präzision der Eplan-Software, um vollständige Sicherheit für Ihre Elektroinstallation zu gewährleisten.',
'why-f1-title':'Erfahrung und Professionalität','why-f1-desc':'Über 20 Jahre Tätigkeit in hochwertigen gewerblichen, industriellen und privaten Elektroinstallationen.',
'why-f2-title':'ISO-Zertifizierungen','why-f2-desc':'Zertifiziert nach ISO 9001, ISO 14001 und ISO 45001 – die Garantie für Qualität, ökologische Verantwortung und Arbeitssicherheit.',
'why-f3-title':'Autorisiert ANRE &amp; IGSU','why-f3-desc':'Vollständige Zulassung für Planung, Ausführung und Überprüfung von Elektroinstallationen bei allen Spannungsebenen.',
'why-f4-title':'Support und Garantie','why-f4-desc':'Technische Unterstützung nach der Installation und erweiterte Garantie für alle ausgeführten Arbeiten.',
'stats-title':'EUROELECTRIC in Zahlen',
'stat1':'Jahre Erfahrung in der Branche','stat2':'Erfolgreich abgeschlossene Projekte',
'stat3':'Internationale ISO-Zertifizierungen','stat4':'Standorte im Kreis Hunedoara',
'srv-tag':'Was wir anbieten','srv-title':'Unsere <span>Leistungen</span>',
'srv-desc':'Komplette Elektrolösungen für Wohn-, Gewerbe- und Industriebereich – von der Planung bis zur Inbetriebnahme.',
'srv-more':'Mehr erfahren <i class="fas fa-arrow-right"></i>',
's1-title':'Elektrische Schaltschränke','s1-desc':'Planung und Montage von Niederspannungs-Schaltschränken bis 1000V. Industrie-, Gewerbe- und öffentliche Lösungen nach europäischen Normen.',
's2-title':'Elektroinstallationen','s2-desc':'Planung und Ausführung von Elektroinstallationen für Wohn-, Gewerbe- und Industriegebäude. Zertifizierte und garantierte Arbeiten.',
's3-title':'Prüfung elektrischer Installationen','s3-desc':'Überprüfung und Messung von Elektroinstallationen mit hochmoderner Ausrüstung. Technische Berichte und Zertifizierungen für die Sicherheit Ihrer Installationen.',
's4-title':'Photovoltaiksysteme','s4-desc':'Installation von Solarmodulen und Energiespeichersystemen für Energieunabhängigkeit. Wohn- und Industrieprojekte mit maximaler Effizienz.',
's5-title':'EV-Ladestationen','s5-desc':'Planung, Installation und Inbetriebnahme von Ladestationen für Elektrofahrzeuge. Lösungen für Wohn-, Gewerbe- und Industrienutzung.',
's6-title':'Schwachstromanlagen','s6-desc':'Strukturierte Netzwerkinfrastruktur, Glasfaser und professionelle Funksysteme. Komplette Lösungen für Daten und Telekommunikation.',
'prj-tag':'Portfolio','prj-title':'Realisierte <span>Projekte</span>',
'prj-desc':'Eine Auswahl unserer Arbeiten – von privaten Installationen bis hin zu großen Industrieprojekten.',
'prj-f0':'Alle','prj-f1':'Schaltschränke','prj-f2':'Installationen','prj-f3':'Photovoltaik','prj-f4':'EV-Stationen','prj-f5':'Installationsprüfungen',
'cta-title':'Benötigen Sie ein <span>individuelles Angebot</span>?',
'cta-desc':'Kontaktieren Sie uns noch heute für eine kostenlose Beratung. Unser Spezialistenteam bietet Ihnen die passende Elektrolösung für Ihre Bedürfnisse.',
'cta-btn':'<i class="fas fa-paper-plane"></i> Anfrage senden',
'blog-tag':'Neuigkeiten &amp; Ressourcen','blog-desc':'Artikel, Leitfäden und Neuigkeiten aus dem Bereich Elektroinstallationen und erneuerbare Energien.',
'blog-read':'Mehr lesen <i class="fas fa-arrow-right"></i>',
'blog-rittal-tag':'Video','blog-rittal-title':'Rittal &amp; Eplan Lösungen für professionelle Schaltschränke','blog-rittal-desc':'Entdecken Sie, wie EUROELECTRIC Rittal- und Eplan-Technologien in der Planung und Montage hochwertiger Schaltschränke integriert.','blog-rittal-link':'Auf LinkedIn ansehen <i class="fas fa-arrow-right"></i>',
'blog-siemens-tag':'Partner','blog-siemens-title':'Siemens Digital Industries — Automatisierungs- und Energieeffizienzlösungen','blog-siemens-desc':'EUROELECTRIC arbeitet mit Siemens Romania zusammen, um modernste industrielle Automatisierungs- und Elektroanlagenlösungen zu integrieren.','blog-siemens-link':'Auf LinkedIn ansehen <i class="fas fa-arrow-right"></i>',
'blog-euro-video-tag':'Video','blog-euro-video-title':'EUROELECTRIC — Industrielle Elektroinstallationen &amp; Projekte','blog-euro-video-desc':'Entdecken Sie die neuesten Projekte und Leistungen von EUROELECTRIC SRL – Elektroinstallationen, Schaltschränke und Geräte für den Industriesektor.','blog-euro-video-link':'Auf LinkedIn ansehen <i class="fas fa-arrow-right"></i>',
'blog-surlea-video-tag':'Video','blog-surlea-video-title':'EUROELECTRIC — Industrielle Elektroinstallationsarbeiten','blog-surlea-video-desc':'Beobachten Sie das EUROELECTRIC-Team bei der Arbeit – professionelle Ausführung von Elektroinstallationen für Industrie- und Gewerbebereich.','blog-surlea-video-link':'Auf LinkedIn ansehen <i class="fas fa-arrow-right"></i>',
'blog-ind40-video-tag':'Video','blog-ind40-video-title':'EUROELECTRIC — Industrie 4.0 in der Elektroinstallationsplanung','blog-ind40-video-desc':'Wie EUROELECTRIC Industrie 4.0 Technologien in die Planung und Ausführung moderner Elektroinstallationen integriert.','blog-ind40-video-link':'Auf LinkedIn ansehen <i class="fas fa-arrow-right"></i>',
'con-tag':'Kontaktieren Sie uns','con-title':'Kontakt <span>&amp;</span> Standorte',
'con-desc':'Wir stehen Ihnen für jede Frage oder Angebotsanfrage zur Verfügung.',
'con-info-title':'Unsere Kontaktdaten',
'form-title':'Anfrage senden','form-name':'Name *','form-phone':'Telefon *',
'form-email':'E-Mail','form-service':'Gewünschte Leistung','form-message':'Nachricht *',
'form-name-ph':'Ihr Name','form-email-ph':'email@beispiel.de',
'form-msg-ph':'Beschreiben Sie kurz Ihr Projekt oder Ihre Anfrage...',
'form-select':'— Leistung auswählen —|Schaltschränke|Elektroinstallationen|Photovoltaikanlagen|EV-Ladestationen|Sonstiges / Allgemein',
'form-gdpr':'Ich stimme der Verarbeitung personenbezogener Daten gemäß der <a href="politica-confidentialitate.html" target="_blank" style="color:var(--cyan);font-weight:600;">Datenschutzrichtlinie</a> zu. *',
'form-submit':'<i class="fas fa-paper-plane"></i> Anfrage absenden',
'err-name':'Bitte geben Sie Ihren Namen ein (mindestens 2 Zeichen).',
'err-phone':'Ungültige Telefonnummer. Format: 07XX XXX XXX oder +40 7XX XXX XXX.',
'err-email':'Ungültige E-Mail-Adresse (z. B. name@domain.de).',
'err-message':'Die Nachricht muss mindestens 10 Zeichen lang sein.',
'err-gdpr':'Sie müssen die Datenschutzrichtlinie akzeptieren.',
'form-err-summary':'Bitte überprüfen Sie die rot markierten Felder.',
'form-ok-summary':'Ihre Nachricht wurde erfolgreich gesendet. Wir werden Sie in Kürze kontaktieren.',
'mcb-cta':'JETZT ANRUFEN',
'footer-brand':'Komplette Elektrolösungen für Wohn-, Gewerbe- und Industriebereich. Professionalität und Sicherheit – seit 2003.',
'footer-nav':'Navigation','footer-copy':'© 2026 S.C. EUROELECTRIC S.R.L. — Alle Rechte vorbehalten',
'footer-srv':'Leistungen','footer-contact-title':'Kontakt','footer-privacy':'Datenschutz','footer-cookies':'Cookie-Richtlinie',
'te-tag':'Detaillierte Leistung','te-title':'Niederspannungs-<span>Schaltschränke</span>',
'te-desc':'Verteilungs- und Steuerschränke für Installationen bis 2500A. Industrie-, Gewerbe- und öffentliche Lösungen – von der Planung bis zur Inbetriebnahme.',
'te-apps-title':'Hauptanwendungen',
'te-app1':'Industrie &amp; Fertigung','te-app2':'Einkaufszentren (Auchan, Lidl, Hornbach)',
'te-app3':'Krankenhäuser &amp; Öffentliche Einrichtungen','te-app4':'Erneuerbare Energien (Solar, Wind)',
'te-app5':'Telekommunikation &amp; Rechenzentren','te-app6':'EV-Ladestationen',
'te-srv-title':'Komplette Leistungen',
'te-srv1-title':'Planung','te-srv1-desc':'Individuelle Lösungen, Berechnungen, Elektroschemas, Dokumentation',
'te-srv2-title':'Fertigung','te-srv2-desc':'CNC-Bearbeitung, Montage, Verkabelung, Korrosionsschutz',
'te-srv3-title':'Montage','te-srv3-desc':'Erfahrenes Team, Vor-Ort-Installation, laufende Unterstützung',
'te-srv4-title':'Prüfung','te-srv4-desc':'Isolationsprüfungen, Funktionsprüfungen, Konformitätsberichte',
'te-std-title':'Normen &amp; Konformität',
'te-std1-title':'Europäisch','te-std1-desc':'EN 61439-1, EN 61439-2, EN 60950-1, EN 61010-1',
'te-std2-title':'National','te-std2-desc':'SR EN 60364, NTE 006, NTPA, Gesetz 123/2012',
'te-std3-title':'Zertifizierungen','te-std3-desc':'CE-Kennzeichnung, Konformitätserklärung, Haftpflichtversicherung',
'ie-tag':'Detaillierte Leistung','ie-title':'Elektroinstallationen <span>Zertifiziert &amp; Garantiert</span>',
'ie-desc':'Planung und Ausführung von Elektroinstallationen für jeden Gebäudetyp – Wohn-, Gewerbe- und Industriebereich. Arbeiten nach geltenden Normen mit Garantie und 24/7-Support.',
'ie-types-title':'Installationstypen',
'ie-type1':'Private Installationen','ie-type2':'Gewerbliche Installationen',
'ie-type3':'Industrielle Installationen','ie-type4':'Beleuchtungssysteme',
'ie-type5':'Sicherheitssysteme','ie-type6':'Spezialinstallationen',
'ie-apps-title':'Hauptanwendungen',
'ie-app1':'Wohnungen &amp; Häuser','ie-app2':'Einkaufszentren (Auchan, Lidl, Hornbach)',
'ie-app3':'Krankenhäuser &amp; Medizinische Einrichtungen','ie-app4':'Fabriken &amp; Werkstätten',
'ie-app5':'Straßen- &amp; Öffentliche Beleuchtung','ie-app6':'EV-Ladestationen',
'ie-srv-title':'Komplette Leistungen',
'ie-srv1-title':'Planung','ie-srv1-desc':'Maßgeschneiderte Lösungen, Lastberechnungen, Pläne, Sicherungsdimensionierung',
'ie-srv2-title':'Ausführung','ie-srv2-desc':'Normgerechte Montage, Kabelführung, Verbindungen, Fertigstellung',
'ie-srv3-title':'Prüfung','ie-srv3-desc':'Widerstandsmessungen, Lasttests, Konformitätsberichte',
'ie-srv4-title':'Support','ie-srv4-desc':'Garantie, Haftpflichtversicherung, 24/7-Service',
'ie-std-title':'Normen &amp; Zertifizierungen',
'ie-std1-title':'Europäisch','ie-std1-desc':'EN 60364, EN 50160, EN 61000, IEC 60950',
'ie-std2-title':'National','ie-std2-desc':'NTE 006-2002, NTPA, SR EN 50083, Gesetz 123/2012',
'ie-std3-title':'Zertifizierungen','ie-std3-desc':'CE-Kennzeichnung, Konformitätserklärung, ANRE-Inspektion',
'vi-tag':'Detaillierte Leistung','vi-title':'Prüfung elektrischer <span>Installationen</span>',
'vi-desc':'Vollständige Messungen und Prüfungen von Elektroinstallationen mit kalibrierten Geräten. Detaillierte technische Berichte, Konformitätsbescheinigungen und Sanierungsempfehlungen.',
'vi-types-title':'Prüfungsarten',
'vi-type1':'Isolationswiderstandsmessungen','vi-type2':'Erdungswiderstandsmessungen',
'vi-type3':'Lasttests','vi-type4':'Fehlererkennung in Installationen',
'vi-type5':'Kontinuitätsmessungen','vi-type6':'Inspektion &amp; Zertifizierung',
'vi-apps-title':'Anwendungsbereiche',
'vi-app1':'Private Installationen','vi-app2':'Gewerbe- &amp; Industrieinstallationen',
'vi-app3':'Rechenzentren &amp; Telekommunikation','vi-app4':'Beleuchtungssysteme',
'vi-app5':'Sicherheitssysteme','vi-app6':'Qualitäts- &amp; Konformitätskontrolle',
'vi-srv-title':'Prüfungsleistungen',
'vi-srv1-title':'Messungen','vi-srv1-desc':'Kalibrierte Geräte, präzise Messungen, dokumentierte Daten',
'vi-srv2-title':'Analyse','vi-srv2-desc':'Normenbewertung, Fehlererkennung, Diagnose',
'vi-srv3-title':'Berichte','vi-srv3-desc':'Detaillierte Dokumentation, Empfehlungen, Konformitätsbescheinigungen',
'vi-srv4-title':'Nachverfolgung','vi-srv4-desc':'Fehlerbehebung, Nachprüfungen, Qualitätssicherung',
'vi-std-title':'Geräte &amp; Normen',
'vi-std1-title':'Geräte','vi-std1-desc':'Megaohmmeter, Terrameter, Multimeter, Amperemeter – alle kalibriert',
'vi-std2-title':'Normen','vi-std2-desc':'EN 60364, EN 61557, SR EN 60309, IEC 61010-1',
'vi-std3-title':'Zertifizierungen','vi-std3-desc':'ANRE-Akkreditierung, Konformitätsbescheinigungen, Prüfberichte',
'fv-tag':'Detaillierte Leistung','fv-title':'Photovoltaiksysteme <span>Solar</span>',
'fv-desc':'Planung und Installation kompletter Solaranlagen – On-Grid, Off-Grid und Hybrid. Saubere Energie, Energieunabhängigkeit und Amortisation in 5–8 Jahren.',
'fv-types-title':'Systemtypen',
'fv-type1':'On-Grid (netzgekoppelt)','fv-type2':'Off-Grid (Inselanlagen)',
'fv-type3':'Hybrid (mit Batterien)','fv-type4':'Privat',
'fv-type5':'Gewerbe &amp; Industrie','fv-type6':'Großanlagen',
'fv-ben-title':'Vorteile &amp; Anwendungen',
'fv-ben1':'Saubere und erneuerbare Energie','fv-ben2':'Reduzierte Energiekosten',
'fv-ben3':'Steuervorteile und Förderungen','fv-ben4':'Nachhaltigkeit und Umweltschutz',
'fv-ben5':'Energieunabhängigkeit','fv-ben6':'ROI in 5–8 Jahren',
'fv-srv-title':'Komplette Leistungen',
'fv-srv1-title':'Planung','fv-srv1-desc':'Einstrahlungsstudie, Leistungsberechnung, Installationsplan, Kosten',
'fv-srv2-title':'Installation','fv-srv2-desc':'Modulmontage, Wechselrichter, Verkabelung, Netzanschluss',
'fv-srv3-title':'Prüfung','fv-srv3-desc':'Funktionstests, Messungen, Konformitätsberichte',
'fv-srv4-title':'Wartung','fv-srv4-desc':'Modulreinigung, Überwachung, Reparaturen, Garantie',
'fv-std-title':'Komponenten &amp; Normen',
'fv-std1-title':'Komponenten','fv-std1-desc':'Hocheffiziente Module, Wechselrichter, Montagestrukturen, Kabel',
'fv-std2-title':'Normen','fv-std2-desc':'IEC 61215, IEC 61730, EN 50160, SR EN 60364',
'fv-std3-title':'Zertifizierungen','fv-std3-desc':'CE-Kennzeichnung, 25 Jahre Garantie, ANRE-Netzanschluss-Zertifikat',
'ai-tag':'Detaillierte Leistung','ai-title':'Industrielle <span>Automatisierung</span>',
'ai-desc':'Komplette Automatisierungs- und Steuerlösungen für Fabriken und Industrieanlagen – SPS, SCADA, HMI und Frequenzumrichter. Höhere Produktivität, weniger Fehler, Bediensicherheit.',
'ai-types-title':'Automatisierungssysteme',
'ai-type1':'SPS &amp; Steuerungen','ai-type2':'SCADA-Systeme',
'ai-type3':'Frequenzumrichter','ai-type4':'Überwachungssysteme',
'ai-type5':'HMI-Schnittstellen','ai-type6':'Robotik &amp; Mechanisierung',
'ai-apps-title':'Anwendungsbereiche',
'ai-app1':'Fabriken &amp; Werkstätten','ai-app2':'Produktionslinien',
'ai-app3':'Verteilungssysteme','ai-app4':'Wasser- &amp; Gasanlagen',
'ai-app5':'Abfallbehandlungszentren','ai-app6':'Prozesssteuerung',
'ai-srv-title':'Komplette Leistungen',
'ai-srv1-title':'Planung','ai-srv1-desc':'Bedarfsanalyse, Systemkonzept, Geräteauswahl',
'ai-srv2-title':'Programmierung','ai-srv2-desc':'SPS- &amp; SCADA-Programmentwicklung, Logiktests',
'ai-srv3-title':'Installation','ai-srv3-desc':'Komponentenmontage, Verkabelung, Hardware-Konfiguration',
'ai-srv4-title':'Wartung','ai-srv4-desc':'Technischer Support, Upgrades, Bedienerschulung, Garantie',
'ai-std-title':'Vorteile &amp; Normen',
'ai-std1-title':'Vorteile','ai-std1-desc':'Höhere Produktivität, weniger Fehler, Bediensicherheit',
'ai-std2-title':'Normen','ai-std2-desc':'EN 61131-3, EN 60204-1, EN 61508, IEC 61010-1',
'ai-std3-title':'Zertifizierungen','ai-std3-desc':'CE-Kennzeichnung, Konformitätsdokumente, Bedienungsanleitungen',
'cs-tag':'Detaillierte Leistung','cs-title':'<span>Schwachstrom</span>installationen',
'cs-desc':'Komplette Telekommunikations-, Daten- und Sicherheitsinfrastruktur – CCTV, Alarmanlagen, Zutrittskontrolle, LAN/WLAN-Netzwerke und Glasfaser. Konnektivität und Sicherheit für jeden Gebäudetyp.',
'cs-types-title':'Installationstypen',
'cs-type1':'Telekommunikation &amp; Daten','cs-type2':'Sicherheitssysteme (CCTV)',
'cs-type3':'Alarmsysteme','cs-type4':'Beschallung &amp; Multimedia',
'cs-type5':'Zutrittskontrollsysteme','cs-type6':'LAN/WLAN/Glasfaser-Netzwerke',
'cs-apps-title':'Anwendungsbereiche',
'cs-app1':'Bürogebäude','cs-app2':'Einkaufszentren &amp; Geschäfte',
'cs-app3':'Krankenhäuser &amp; Medizinische Zentren','cs-app4':'Fabriken &amp; Werkstätten',
'cs-app5':'Rechenzentren','cs-app6':'Banken &amp; Finanzinstitutionen',
'cs-srv-title':'Komplette Leistungen',
'cs-srv1-title':'Planung','cs-srv1-desc':'Bedarfsanalyse, Wegeplanung, Kabel- und Kanaldimensionierung',
'cs-srv2-title':'Installation','cs-srv2-desc':'Kabelführung, Dosenmontage, Kabel- und Steckerinstallation',
'cs-srv3-title':'Prüfung','cs-srv3-desc':'Kontinuitätsprüfungen, Übertragungstests, Zertifizierungen',
'cs-srv4-title':'Wartung','cs-srv4-desc':'24/7-Support, Systemaktualisierungen, Benutzerschulung',
'cs-std-title':'Geräte &amp; Normen',
'cs-std1-title':'Materialien','cs-std1-desc':'Cat5e/Cat6/Cat6A-Kabel, Glasfaser, Steckverbinder, Panels',
'cs-std2-title':'Normen','cs-std2-desc':'EN 50173, EN 50174, EN 60364-5-56, IEC 61076-2-109',
'cs-std3-title':'Zertifizierungen','cs-std3-desc':'Übertragungstests, Konformitätsdokumente, Handbücher'
}
};
function setLang(lang) {
document.querySelectorAll('[data-i18n]').forEach(el => {
const key = el.getAttribute('data-i18n');
if (translations[lang] && translations[lang][key] !== undefined) el.innerHTML = translations[lang][key];
});
document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
const key = el.getAttribute('data-i18n-placeholder');
if (translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
});
document.querySelectorAll('[data-i18n-select]').forEach(el => {
const key = el.getAttribute('data-i18n-select');
if (translations[lang] && translations[lang][key]) {
const opts = translations[lang][key].split('|');
Array.from(el.options).forEach((opt, i) => { if (opts[i]) opt.text = opts[i]; });
}
});
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
});
document.documentElement.lang = lang;
localStorage.setItem('lang', lang);
}
(function(){ setLang(localStorage.getItem('lang') || 'ro'); })();
// Active nav highlight
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
let current = "";
sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
document.querySelectorAll(".nav-menu a").forEach(a => {
a.style.color = a.getAttribute("href") === "#" + current ? "var(--cyan)" : "";
});
});
// Slideshow autoplay
(function() {
var slides = document.querySelectorAll('#slideshow-tablou img');
if (!slides.length) return;
var idx = 0;
slides[0].classList.add('slide-active');
setInterval(function() {
slides[idx].classList.remove('slide-active');
idx = (idx + 1) % slides.length;
slides[idx].classList.add('slide-active');
}, 3000);
})();
(function() {
var slides = document.querySelectorAll('#slideshow-instalatii img');
if (!slides.length) return;
var idx = 0;
slides[0].classList.add('slide-active');
setInterval(function() {
slides[idx].classList.remove('slide-active');
idx = (idx + 1) % slides.length;
slides[idx].classList.add('slide-active');
}, 3000);
})();
(function() {
var slides = document.querySelectorAll('#slideshow-statii img');
if (!slides.length) return;
var idx = 0;
slides[0].classList.add('slide-active');
setInterval(function() {
slides[idx].classList.remove('slide-active');
idx = (idx + 1) % slides.length;
slides[idx].classList.add('slide-active');
}, 3000);
})();
(function() {
var slides = document.querySelectorAll('#slideshow-fotovoltaice img');
if (!slides.length) return;
var idx = 0;
slides[0].classList.add('slide-active');
setInterval(function() {
slides[idx].classList.remove('slide-active');
idx = (idx + 1) % slides.length;
slides[idx].classList.add('slide-active');
}, 3000);
})();
(function() {
var slides = document.querySelectorAll('#slideshow-verificari img');
if (!slides.length) return;
var idx = 0;
slides[0].classList.add('slide-active');
setInterval(function() {
slides[idx].classList.remove('slide-active');
idx = (idx + 1) % slides.length;
slides[idx].classList.add('slide-active');
}, 3500);
})();
// Cookie banner
function loadMaps() {
var block = document.getElementById('map-cookie-block');
var baru = document.getElementById('map-baru');
var petro = document.getElementById('map-petrosani');
if (!baru) return;
if (block) block.style.display = 'none';
if (!baru.src || baru.src === window.location.href) baru.src = baru.getAttribute('data-src');
if (!petro.src || petro.src === window.location.href) petro.src = petro.getAttribute('data-src');
}
function showMapBlock() {
var block = document.getElementById('map-cookie-block');
if (block) block.style.display = 'flex';
}
(function() {
var consent = localStorage.getItem('euro_cookie_consent');
if (!consent) {
document.getElementById('cookieBanner').style.display = 'block';
showMapBlock();
} else if (localStorage.getItem('euro_cookie_functional') === '1') {
loadMaps();
} else {
showMapBlock();
}
})();
function cookieChoice(type) {
localStorage.setItem('euro_cookie_consent', type);
localStorage.setItem('euro_cookie_functional', type === 'all' ? '1' : '0');
var b = document.getElementById('cookieBanner');
if (b && b.style.display !== 'none') {
b.style.transition = 'transform 0.4s ease';
b.style.transform = 'translateY(100%)';
setTimeout(function() { b.style.display = 'none'; }, 400);
}
if (type === 'all') { loadMaps(); } else { showMapBlock(); }
}
var CERT_ANRE = [
{src:'docs/Atestat-C2A.pdf', title:'Atestat ANRE — Tip C2A'},
{src:'docs/Atestat-tipA.pdf', title:'Atestat ANRE — Tip A'},
{src:'docs/Atestat-tipBp.pdf', title:'Atestat ANRE — Tip Bp'}
];
var CERT_IGSU = [
{src:'docs/Autorizatie-ISU-Executie.jpg', title:'Autorizație ISU — Execuție (Seria A Nr. 3307)'},
{src:'docs/Autorizatie-ISU-Proiectare.pdf', title:'Autorizație ISU — Proiectare (Seria A Nr. 9861)'}
];
var _certDocs = [], _certIdx = 0;
function openCertSet(docs) {
_certDocs = docs; _certIdx = 0;
_renderCertDoc();
document.getElementById("certModal").classList.add("active");
document.body.style.overflow = "hidden";
}
function openCertModal(src, title) { openCertSet([{src:src, title:title}]); }
function _renderCertDoc() {
var doc = _certDocs[_certIdx];
document.getElementById("certModalTitle").textContent = doc.title;
var nav = document.getElementById("certModalNav");
if (_certDocs.length > 1) {
nav.style.display = "flex";
document.getElementById("certModalCounter").textContent = (_certIdx+1) + " / " + _certDocs.length;
document.getElementById("certNavPrev").disabled = _certIdx === 0;
document.getElementById("certNavNext").disabled = _certIdx === _certDocs.length - 1;
} else { nav.style.display = "none"; }
var iframe = document.getElementById("certModalIframe");
var img = document.getElementById("certModalImg");
if (/\.(jpg|jpeg|png|gif|webp)$/i.test(doc.src)) {
iframe.style.display = "none"; iframe.src = "";
img.src = doc.src; img.style.display = "block";
} else {
img.style.display = "none"; img.src = "";
iframe.src = doc.src + "#view=Fit&toolbar=1"; iframe.style.display = "block";
}
}
function certNavStep(dir) {
var next = _certIdx + dir;
if (next >= 0 && next < _certDocs.length) { _certIdx = next; _renderCertDoc(); }
}
function closeCertModal(e) {
if (e && e.target !== document.getElementById("certModal")) return;
document.getElementById("certModal").classList.remove("active");
document.getElementById("certModalIframe").src = "";
document.getElementById("certModalIframe").style.display = "none";
document.getElementById("certModalImg").src = "";
document.getElementById("certModalImg").style.display = "none";
document.body.style.overflow = "";
}
function openBlogModal4() {
document.getElementById("blogModal4").classList.add("active");
document.body.style.overflow = "hidden";
}
function closeBlogModal4(e) {
if (e && e.target !== document.getElementById("blogModal4")) return;
document.getElementById("blogModal4").classList.remove("active");
document.body.style.overflow = "";
}
function toggleBlogExtra() {
var card = document.getElementById("blog-card-extra");
var btn  = document.getElementById("blog-more-btn");
var icon = document.getElementById("blog-more-icon");
var text = document.getElementById("blog-more-text");
if (card.style.display === "none") {
  card.style.cssText = "display:flex;opacity:1;transform:none;";
  icon.className = "fas fa-minus-circle";
  text.textContent = "Mai puține";
  btn.style.background = "#00AEEF";
} else {
  card.style.display = "none";
  icon.className = "fas fa-plus-circle";
  text.textContent = "Mai multe";
  btn.style.background = "#003B7A";
}
}
function openBlogModal5() {
document.getElementById("blogModal5").classList.add("active");
document.body.style.overflow = "hidden";
}
function closeBlogModal5(e) {
if (e && e.target !== document.getElementById("blogModal5")) return;
document.getElementById("blogModal5").classList.remove("active");
document.body.style.overflow = "";
}
// Floating contact button
(function() {
var btn = document.getElementById("floatBtn");
var wrap = document.getElementById("floatContact");
btn.addEventListener("click", function(e) {
e.stopPropagation();
wrap.classList.toggle("open");
});
document.addEventListener("click", function(e) {
if (!wrap.contains(e.target)) wrap.classList.remove("open");
});
})();
// Map tabs
function switchMap(loc, btn) {
document.querySelectorAll(".map-tab-btn").forEach(function(b){ b.classList.remove("active"); });
btn.classList.add("active");
var baru = document.getElementById("map-baru");
var petro = document.getElementById("map-petrosani");
var link = document.getElementById("map-open-link");
if (loc === "baru") {
baru.style.display = "block"; petro.style.display = "none";
link.href = "https://www.google.com/maps/search/Baru,+Hunedoara,+Romania";
} else {
baru.style.display = "none"; petro.style.display = "block";
link.href = "https://www.google.com/maps/search/Str.+Petru+Maior+14,+Petrosani,+Hunedoara";
}
}
// Lightbox
function openLightbox(src, alt) {
document.getElementById("lightboxImg").src = src;
document.getElementById("lightboxImg").alt = alt || "";
document.getElementById("lightbox").classList.add("active");
document.body.style.overflow = "hidden";
}
function closeLightbox(e) {
if (e && e.target === document.getElementById("lightboxImg")) return;
document.getElementById("lightbox").classList.remove("active");
document.getElementById("lightboxImg").src = "";
document.body.style.overflow = "";
}
document.querySelectorAll(".project-slideshow img").forEach(function(img) {
img.addEventListener("click", function() { openLightbox(this.src, this.alt); });
});
document.addEventListener("keydown", function(e) {
if (e.key === "Escape") { closeCertModal(); closeBlogModal4(); closeBlogModal5(); closeLightbox(); }
if (e.key === "ArrowLeft") certNavStep(-1);
if (e.key === "ArrowRight") certNavStep(1);
});
