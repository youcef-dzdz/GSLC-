import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

/* ── TRANSLATIONS ─────────────────────────────────────────── */
const T: Record<string, any> = {
  FR: {
    dir: "ltr",
    nav: ["Accueil", "À Propos", "Services", "Conteneurs", "Agences", "Contact"],
    login: "Connexion", register: "S'inscrire",
    hero_tag: "EPE NASHCO SPA — Filiale du Groupe G.A.T.MA",
    hero_h1: "Votre partenaire logistique d'excellence en Algérie",
    hero_p: "Solutions intelligentes de consignation, de manutention et de suivi de conteneurs pour optimiser vos opérations d'import-export.",
    hero_cta1: "Nous Contacter", hero_cta2: "Créer un compte",
    about_tag: "Notre Mission",
    about_h2: "Qui est NASHCO DZ ?",
    about_def_t: "Définition", about_def_p: "Automatisation intelligente et optimisation du suivi des conteneurs d'importation grâce à l'analyse prédictive et à l'intégration multi-sources. NASHCO offre des avantages concrets aux importateurs et aux lignes maritimes.",
    about_hist_t: "Historique", about_hist_p: "Fondée en 1991, NASHCO DZ est un acteur certifié dans le domaine de la logistique portuaire en Algérie, accompagnant armateurs et opérateurs économiques à travers l'ensemble des ports commerciaux algériens.",
    svc_tag: "Notre Expertise", svc_h2: "Nos Services de Logistique",
    svcs: ["Consignation Maritime", "Services Conteneurs", "Douane & Transit", "Approvisionnement Naval"],
    svc_items: [
      ["Gestion des escales", "Suivi opérationnel", "Services aux armateurs"],
      ["Entretien et réparation", "Nettoyage et stockage", "Logistique de terminaux"],
      ["Formalités douanières", "Accompagnement administratif", "Transit import/export"],
      ["Vivres & soutes", "Assistance technique", "Fournitures navires"],
    ],
    gallery_tag: "Nos Installations", gallery_h2: "Aperçu de nos Opérations",
    cat_tag: "Notre Flotte", cat_h2: "Catalogue de Conteneurs",
    stats: ["Années d'expérience", "Conteneurs traités/an", "Clients importateurs", "Ports couverts"],
    contact_h2: "Nous Contacter",
    contact_addr: "Siège Social", contact_ports: "Agences Portuaires",
    form_name: "Nom complet", form_company: "Entreprise", form_email: "E-mail",
    form_subject: "Objet de votre demande", form_msg: "Votre message",
    form_send: "Envoyer le message →", form_sending: "Envoi...",
    form_ok: "✅ Message envoyé — nous vous répondrons rapidement.",
    form_opts: ["Location Conteneurs", "Consignation Maritime", "Transit & Douane", "Approvisionnement Naval", "Support Technique"],
    footer_desc: "Leader de la consignation et de la manutention portuaire en Algérie. Une expertise de plus de 30 ans au service du commerce international.",
    footer_nav: "Liens Rapides", footer_svc: "Services", footer_contact: "Contact",
    footer_newsletter: "Newsletter", footer_newsletter_p: "Abonnez-vous pour recevoir les dernières actualités du secteur maritime algérien.",
    footer_newsletter_ph: "Votre adresse e-mail", footer_newsletter_btn: "S'abonner",
    footer_addr_label: "Adresse", footer_addr: "Coopérative Colonel Amirouche N° B 01, Mostaganem",
    phone_email_label: "Téléphone & Email",
    footer_phone_label: "Téléphone", footer_phone: "+213 (0)45 41 78 76",
    footer_email_label: "E-mail", footer_email_val: "direc-mos@nashco.com.dz",
    footer_hours_label: "Horaires", footer_hours: "Lun–Jeu : 08h–17h\nDim : 08h–13h",
    footer_copy: "© 2026 EPE NASHCO Spa. Tous droits réservés.",
    footer_legal: ["Confidentialité", "Mentions Légales", "Cookies"],
    port_marker: "Réseau portuaire national",
    modal_dims: "Dimensions Intérieures", modal_vol: "Volume", modal_payload: "Poids Max", modal_tare: "Tare", modal_close: "Fermer",
    containers: [
      { id: "dry20", label: "20' DC", sub: "Dry Cargo Standard", img: "/images/cont-dry-20_40.png", dims: "5,89×2,35×2,39m", vol: "33,2 m³", payload: "23 000 kg", tare: "2 200 kg", desc: "Conteneur standard entièrement fermé, idéal pour la majorité des marchandises sèches." },
      { id: "dry40", label: "40' DC", sub: "Dry Cargo Standard", img: "/images/cont-dry-20_40.png", dims: "12,03×2,35×2,39m", vol: "67,7 m³", payload: "25 000 kg", tare: "3 750 kg", desc: "Double volume du 20', parfait pour les grands lots de marchandises." },
      { id: "hc40", label: "40' HC", sub: "High Cube", img: "/images/cont-dry-20_40.png", dims: "12,03×2,35×2,70m", vol: "76,4 m³", payload: "28 600 kg", tare: "3 900 kg", desc: "30 cm suppl. en hauteur pour marchandises volumineuses." },
      { id: "reefer", label: "Reefer (RF)", sub: "Température contrôlée", img: "/images/cont-reefer-20_40.png", highlight: true, badge: "Réfrigéré", dims: "11,59×2,29×2,25m", vol: "59,8 m³", payload: "27 700 kg", tare: "3 080 kg", temp: "−35°C à +20°C", desc: "Conteneur frigorifique pour produits frais, surgelés." },
      { id: "opentop", label: "Open Top (OT)", sub: "Chargement vertical", img: "/images/cont-opentop-20_40.png", dims: "5,89×2,35×2,35m", vol: "32,6 m³", payload: "28 130 kg", tare: "2 350 kg", desc: "Toit ouvert pour chargement grue." },
      { id: "flat", label: "Flat Rack (FR)", sub: "Hors gabarit", img: "/images/flatracks-20_40-300x217.png", dims: "12,13×2,40×2,00m", vol: "Variable", payload: "39 000 kg", tare: "5 000 kg", desc: "Sans parois pour machines industrielles." },
      { id: "tank", label: "ISO Tank", sub: "Transport de liquides", img: "/images/citernes-300x297.png", dims: "Cadre ISO 20'", vol: "20 000–26 000 L", payload: "~25 000 kg", tare: "~3 000 kg", desc: "Citerne ISO pour liquides certifiés." }
    ]
  },
  AR: {
    dir: "rtl",
    nav: ["الرئيسية", "من نحن", "خدماتنا", "الحاويات", "وكالاتنا", "اتصل بنا"],
    login: "تسجيل الدخول", register: "إنشاء حساب",
    hero_tag: "ناشكو — فرع مجموعة غاتما للنقل البحري",
    hero_h1: "شريككم الموثوق في اللوجستيات والشحن البحري بالجزائر",
    hero_p: "نقدّم حلولاً متكاملة لوكالة الشحن البحري، مناولة الحاويات وتتبّعها في الوقت الفعلي، بما يُعزّز كفاءة عمليات الاستيراد والتصدير لعملائنا.",
    hero_cta1: "تواصل معنا", hero_cta2: "افتح حساباً",
    about_tag: "رسالتنا",
    about_h2: "من هي شركة ناشكو؟",
    about_def_t: "نبذة عن الشركة", about_def_p: "ناشكو شركة عمومية جزائرية متخصصة في أتمتة وتحسين تتبّع حاويات الاستيراد، مستعينةً بأدوات التحليل الاستباقي والربط الشامل بين المنصات. نتيح للمستوردين وشركات الملاحة البحرية مزايا تشغيلية حقيقية وقيمة مضافة ملموسة.",
    about_hist_t: "مسيرتنا", about_hist_p: "تأسست عام 1991، وتعمل ناشكو كجهة معتمدة في قطاع اللوجستيات الميناءية بالجزائر. على مدى أكثر من ثلاثة عقود، رافقت أصحاب السفن والمتعاملين الاقتصاديين في جميع الموانئ التجارية الجزائرية، مقدّمةً خدمات متميزة تواكب متطلبات التجارة الدولية.",
    svc_tag: "مجالات خبرتنا", svc_h2: "خدماتنا اللوجستية المتكاملة",
    svcs: ["الوكالة البحرية", "خدمات الحاويات", "الجمارك والعبور", "التزوّد البحري"],
    svc_items: [
      ["إدارة توقفات السفن", "المتابعة التشغيلية الميدانية", "خدمات أصحاب السفن"],
      ["الصيانة والإصلاح", "التنظيف والتخزين", "إدارة محطات الحاويات"],
      ["إنجاز الإجراءات الجمركية", "المرافقة الإدارية للملفات", "عمليات العبور استيراداً وتصديراً"],
      ["توفير الأغذية والوقود", "الدعم الفني للسفن", "توريد لوازم الرحلات البحرية"],
    ],
    gallery_tag: "منشآتنا وعملياتنا", gallery_h2: "لمحة من واقع أعمالنا الميناءية",
    cat_tag: "أسطولنا من الحاويات", cat_h2: "دليل أنواع الحاويات البحرية",
    stats: ["سنة من الخبرة", "حاوية تُعالج سنوياً", "مستورد يثق بنا", "ميناء تجاري مُغطّى"],
    contact_h2: "نحن في خدمتكم",
    contact_addr: "المقر الرئيسي", contact_ports: "وكالاتنا الميناءية",
    form_name: "الاسم الكامل", form_company: "اسم الشركة", form_email: "البريد الإلكتروني",
    form_subject: "موضوع الطلب", form_msg: "تفاصيل رسالتك",
    form_send: "إرسال الرسالة ←", form_sending: "جارٍ الإرسال...",
    form_ok: "✅ وصلتنا رسالتك بنجاح — سنتواصل معك في أقرب وقت.",
    form_opts: ["استئجار حاويات", "الوكالة البحرية", "الجمارك والعبور", "التزوّد البحري", "الدعم الفني"],
    footer_desc: "ناشكو — رائدة في وكالة الشحن البحري والمناولة الميناءية بالجزائر. خبرة تمتد لأكثر من ثلاثة عقود في خدمة التجارة الدولية.",
    footer_nav: "روابط سريعة", footer_svc: "خدماتنا", footer_contact: "معلومات التواصل",
    footer_newsletter: "النشرة الإخبارية", footer_newsletter_p: "اشترك لتصلك آخر أخبار قطاع الشحن والملاحة البحرية في الجزائر.",
    footer_newsletter_ph: "بريدك الإلكتروني", footer_newsletter_btn: "اشتراك",
    footer_addr_label: "العنوان", footer_addr: "عمارة العقيد عميروش رقم B 01، مستغانم",
    phone_email_label: "الهاتف والبريد الإلكتروني",
    footer_phone_label: "الهاتف", footer_phone: "+213 (0)45 41 78 76",
    footer_email_label: "البريد", footer_email_val: "direc-mos@nashco.com.dz",
    footer_hours_label: "أوقات العمل", footer_hours: "الإثنين – الخميس: 08:00 – 17:00\nالأحد: 08:00 – 13:00",
    footer_copy: "© 2026 مؤسسة ناشكو — جميع الحقوق محفوظة.",
    footer_legal: ["سياسة الخصوصية", "الشروط القانونية", "ملفات تعريف الارتباط"],
    port_marker: "الشبكة الميناءية الوطنية",
    modal_dims: "الأبعاد الداخلية", modal_vol: "الحجم", modal_payload: "أقصى حمولة", modal_tare: "الوزن الصافي", modal_close: "إغلاق",
    containers: [
      { id: "dry20", label: "20' DC", sub: "شحن جاف معياري", img: "/images/cont-dry-20_40.png", dims: "5,89×2,35×2,39م", vol: "33,2 م³", payload: "23 000 كغ", tare: "2 200 كغ", desc: "حاوية معيارية مغلقة بالكامل، مثالية لمعظم البضائع الجافة." },
      { id: "dry40", label: "40' DC", sub: "شحن جاف معياري", img: "/images/cont-dry-20_40.png", dims: "12,03×2,35×2,39م", vol: "67,7 م³", payload: "25 000 كغ", tare: "3 750 كغ", desc: "ضعف حجم 20 قدم للماركات الكبيرة." },
      { id: "hc40", label: "40' HC", sub: "حاوية مرتفعة", img: "/images/cont-dry-20_40.png", dims: "12,03×2,35×2,70م", vol: "76,4 م³", payload: "28 600 كغ", tare: "3 900 كغ", desc: "ارتفاع إضافي 30 سم للبضائع الضخمة." },
      { id: "reefer", label: "Reefer (RF)", sub: "مُتحكم بدرجة حرارتها", img: "/images/cont-reefer-20_40.png", highlight: true, badge: "مُبرّد", dims: "11,59×2,29×2,25م", vol: "59,8 م³", payload: "27 700 كغ", tare: "3 080 كغ", desc: "حاوية مبردة للمنتجات الطازجة والمجمدة." },
      { id: "opentop", label: "Open Top (OT)", sub: "شحن عمودي", img: "/images/cont-opentop-20_40.png", dims: "5,89×2,35×2,35م", vol: "32,6 م³", payload: "28 130 كغ", tare: "2 350 كغ", desc: "سقف مفتوح للشحن بالرافعات." },
      { id: "flat", label: "Flat Rack (FR)", sub: "خارج الحجم القياسي", img: "/images/flatracks-20_40-300x217.png", dims: "12,13×2,40×2,00م", vol: "متغير", payload: "39 000 كغ", tare: "5 000 كغ", desc: "دون جدران جانبية للآليات الصناعية والثقيلة." },
      { id: "tank", label: "ISO Tank", sub: "نقل السوائل", img: "/images/citernes-300x297.png", dims: "إطار 20'", vol: "20 000–26 000 لتر", payload: "~25 000 كغ", tare: "~3 000 كغ", desc: "خزان إيزو لنقل السوائل المعتمدة." }
    ]
  },
  EN: {
    dir: "ltr",
    nav: ["Home", "About", "Services", "Containers", "Agencies", "Contact"],
    login: "Login", register: "Sign Up",
    hero_tag: "EPE NASHCO SPA — Subsidiary of G.A.T.MA Group",
    hero_h1: "Algeria's Premier Logistics & Maritime Partner",
    hero_p: "Smart consignment, container handling and tracking solutions to optimize your import-export operations across Algerian ports.",
    hero_cta1: "Contact Us", hero_cta2: "Create Account",
    about_tag: "Our Mission",
    about_h2: "Who is NASHCO DZ?",
    about_def_t: "Overview", about_def_p: "Intelligent automation and optimization of import container tracking through predictive analytics and multi-source integration. NASHCO delivers measurable advantages to importers and maritime shipping lines.",
    about_hist_t: "History", about_hist_p: "Founded in 1991, NASHCO DZ is a certified player in Algerian port logistics, supporting shipowners and economic operators across all Algerian commercial ports.",
    svc_tag: "Our Expertise", svc_h2: "Our Logistics Services",
    svcs: ["Maritime Consignment", "Container Services", "Customs & Transit", "Naval Supply"],
    svc_items: [
      ["Port call management", "Operational tracking", "Shipowner services"],
      ["Maintenance & repair", "Cleaning & storage", "Terminal logistics"],
      ["Customs procedures", "Administrative support", "Import/export transit"],
      ["Provisions & bunkers", "Technical assistance", "Ship supplies"],
    ],
    gallery_tag: "Our Facilities", gallery_h2: "Operations Overview",
    cat_tag: "Our Fleet", cat_h2: "Container Catalogue",
    stats: ["Years of experience", "Containers/year", "Importer clients", "Ports covered"],
    contact_h2: "Get In Touch",
    contact_addr: "Head Office", contact_ports: "Port Agencies",
    form_name: "Full name", form_company: "Company", form_email: "Email address",
    form_subject: "Subject", form_msg: "Your message",
    form_send: "Send Message →", form_sending: "Sending...",
    form_ok: "✅ Message sent — we'll get back to you shortly.",
    form_opts: ["Container Rental", "Maritime Consignment", "Customs & Transit", "Naval Supply", "Technical Support"],
    footer_desc: "Algeria's leading port consignment and container handling company. Over 30 years of expertise serving international trade.",
    footer_nav: "Quick Links", footer_svc: "Services", footer_contact: "Contact",
    footer_newsletter: "Newsletter", footer_newsletter_p: "Subscribe to receive the latest news from Algeria's maritime and logistics sector.",
    footer_newsletter_ph: "Your email address", footer_newsletter_btn: "Subscribe",
    footer_addr_label: "Address", footer_addr: "02 Rue de Béjaïa, Port of Algiers",
    phone_email_label: "Phone & Email",
    footer_phone_label: "Phone", footer_phone: "+213 (0)21 43 XX XX",
    footer_email_label: "Email", footer_email_val: "contact@nashco-dz.com",
    footer_hours_label: "Office Hours", footer_hours: "Mon–Thu: 08:00–17:00\nSun: 08:00–13:00",
    footer_copy: "© 2026 EPE NASHCO Spa. All rights reserved.",
    footer_legal: ["Privacy Policy", "Terms of Use", "Cookies"],
    port_marker: "National port network",
    modal_dims: "Interior Dimensions", modal_vol: "Volume", modal_payload: "Max Payload", modal_tare: "Tare Weight", modal_close: "Close",
    containers: [
      { id: "dry20", label: "20' DC", sub: "Dry Cargo Standard", img: "/images/cont-dry-20_40.png", dims: "5.89×2.35×2.39m", vol: "33.2 m³", payload: "23,000 kg", tare: "2,200 kg", desc: "Fully enclosed standard container, ideal for major dry goods." },
      { id: "dry40", label: "40' DC", sub: "Dry Cargo Standard", img: "/images/cont-dry-20_40.png", dims: "12.03×2.35×2.39m", vol: "67.7 m³", payload: "25,000 kg", tare: "3,750 kg", desc: "Double the 20' volume, perfect for large batch goods." },
      { id: "hc40", label: "40' HC", sub: "High Cube", img: "/images/cont-dry-20_40.png", dims: "12.03×2.35×2.70m", vol: "76.4 m³", payload: "28,600 kg", tare: "3,900 kg", desc: "Extra 30cm height for voluminous cargo." },
      { id: "reefer", label: "Reefer (RF)", sub: "Temperature Controlled", img: "/images/cont-reefer-20_40.png", highlight: true, badge: "Refrigerated", dims: "11.59×2.29×2.25m", vol: "59.8 m³", payload: "27,700 kg", tare: "3,080 kg", desc: "Refrigerated container for fresh and frozen products." },
      { id: "opentop", label: "Open Top (OT)", sub: "Vertical Loading", img: "/images/cont-opentop-20_40.png", dims: "5.89×2.35×2.35m", vol: "32.6 m³", payload: "28,130 kg", tare: "2,350 kg", desc: "Open roof for crane loaded goods." },
      { id: "flat", label: "Flat Rack (FR)", sub: "Out of Gauge", img: "/images/flatracks-20_40-300x217.png", dims: "12.13×2.40×2.00m", vol: "Variable", payload: "39,000 kg", tare: "5,000 kg", desc: "No side walls for industrial machinery." },
      { id: "tank", label: "ISO Tank", sub: "Liquid Transport", img: "/images/citernes-300x297.png", dims: "20' ISO Frame", vol: "20,000–26,000 L", payload: "~25,000 kg", tare: "~3,000 kg", desc: "ISO Tank for certified liquid transport." }
    ]
  },
};

/* ── IMAGE MAP ─────────────────────────────────────────────── */
const IMG = {
  logo: "/images/nashco_logo%20Company.jpg",
  hero1: "/images/hero2.jpg",
  hero2: "/images/hero3.jpg",
  hero3: "/images/hero4.jpg",
  hero4: "/images/Consignation%20Maritime.jpeg",
  about: "/images/Consignation%20Maritime.jpeg",
  about2: "/images/Logistique%20%26%20Conteneurs.jpg",
  svc1: "/images/OIP%2010.webp",
  svc2: "/images/Logistique%20%26%20Conteneurs.jpg",
  svc3: "/images/Transit%20%26%20Douane.webp",
  svc4: "/images/Approvisionnement.jpg",
  cnt_dry: "/images/cont-dry-20_40.png",
  cnt_opentop: "/images/cont-opentop-20_40.png",
  cnt_reefer: "/images/cont-reefer-20_40.png",
  cnt_flat: "/images/flatracks-20_40-300x217.png",
  cnt_tank: "/images/citernes-300x297.png",
  g: [
    "/images/OIP%202.webp", "/images/OIP%203.webp", "/images/OIP%204.webp",
    "/images/OIP%205.webp", "/images/OIP%206.webp", "/images/OIP%207.webp",
    "/images/OIP%208.webp", "/images/OIP%209.webp", "/images/OIP%2010.webp",
    "/images/OIP%201.webp",
  ],
};

/* ── DATA ──────────────────────────────────────────────────── */
// Containers injected directly inside translations for i18next support

const STATS = [
  { value: 35, suffix: "+", bg: "#eef2ff" },
  { value: 4500, suffix: "+", bg: "#fff7ed" },
  { value: 320, suffix: "+", bg: "#f0fdf4" },
  { value: 10, suffix: "+", bg: "#fffbeb" },
];

const PORTS = ["alger", "oran", "annaba", "skikda", "bejaia", "mostaganem", "jijel_djen", "ghazaouet", "arzew", "tenes"];

// Color + type metadata for each container (independent of language)
const CONTAINER_META: Record<string, { color: string; type: string }> = {
  dry20:   { color: '#C8382A', type: 'dry' },     // shipping red
  dry40:   { color: '#1E6FBE', type: 'dry' },     // ocean blue
  hc40:    { color: '#0891B2', type: 'dry' },     // deep cyan
  reefer:  { color: '#94A3B8', type: 'reefer' },  // silver (refrigerated)
  opentop: { color: '#16A34A', type: 'opentop' }, // green
  flat:    { color: '#CA8A04', type: 'flat' },    // amber/brown
  tank:    { color: '#6366F1', type: 'tank' },    // indigo
};

// Port positions on the Algeria SVG map (viewBox 0 0 600 250)
// Calculated from real lat/lon: x=(lon+2.2)*55, y=(38-lat)*70
const MAP_PORTS: { name: string; x: number; y: number; main?: boolean; lx?: number; ly?: number }[] = [
  { name: 'ghazaouet',  x: 19,  y: 188, lx: 19,  ly: 176 },
  { name: 'oran',       x: 86,  y: 152, lx: 86,  ly: 140, main: true },
  { name: 'arzew',      x: 104, y: 145 },
  { name: 'mostaganem', x: 126, y: 137, lx: 118, ly: 150 },
  { name: 'tenes',      x: 193, y: 97,  lx: 193, ly: 85  },
  { name: 'alger',      x: 289, y: 79,  lx: 289, ly: 67,  main: true },
  { name: 'bejaia',     x: 401, y: 79,  lx: 401, ly: 67,  main: true },
  { name: 'jijel',      x: 438, y: 74  },
  { name: 'skikda',     x: 501, y: 69,  lx: 501, ly: 57,  main: true },
  { name: 'annaba',     x: 548, y: 67,  lx: 548, ly: 80,  main: true },
];

/* ── HOOKS ─────────────────────────────────────────────────── */
function useCountUp(target: number, active: boolean, duration = 2000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0; const step = target / (duration / 16);
    const ti = setInterval(() => { cur += step; if (cur >= target) { setN(target); clearInterval(ti); } else setN(Math.floor(cur)); }, 16);
    return () => clearInterval(ti);
  }, [active, target]);
  return n;
}

function useInView(ref: React.RefObject<Element | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [ref]);
  return v;
}

/* ── CONTAINER SVG ──────────────────────────────────────────── */
// Renders a stylized shipping container in any color.
// Each type (dry, reefer, opentop, flat, tank) has a slightly different shape.
function ContainerSVG({ color, type = 'dry', highlight = false }: { color: string; type?: string; highlight?: boolean }) {
  const dark  = 'rgba(0,0,0,0.22)';
  const light = 'rgba(255,255,255,0.18)';
  const shadow = 'rgba(0,0,0,0.13)';
  // Corrugation x positions (vertical lines on the body)
  const corrugations = [15, 27, 39, 51, 63, 75, 87, 99, 111];

  if (type === 'tank') return (
    <svg viewBox="0 0 130 66" style={{ width: '100%', maxWidth: 110, display: 'block', margin: '0 auto' }}>
      <ellipse cx="65" cy="63" rx="44" ry="4" fill={shadow}/>
      {/* Cylindrical tank body */}
      <rect x="18" y="18" width="94" height="28" fill={color}/>
      <ellipse cx="18" cy="32" rx="10" ry="14" fill={color}/>
      <ellipse cx="112" cy="32" rx="10" ry="14" fill={color}/>
      {/* Highlight on top curved surface */}
      <ellipse cx="65" cy="18" rx="47" ry="4" fill={light}/>
      {/* Support frame */}
      <rect x="6"  y="43" width="118" height="5" rx="2" fill={dark}/>
      <rect x="6"  y="14" width="118" height="4" rx="1" fill={dark} opacity="0.5"/>
      {/* Band straps */}
      <line x1="42" y1="14" x2="42" y2="46" stroke={dark} strokeWidth="2.5" opacity="0.4"/>
      <line x1="88" y1="14" x2="88" y2="46" stroke={dark} strokeWidth="2.5" opacity="0.4"/>
    </svg>
  );

  if (type === 'flat') return (
    <svg viewBox="0 0 130 66" style={{ width: '100%', maxWidth: 110, display: 'block', margin: '0 auto' }}>
      <ellipse cx="65" cy="63" rx="44" ry="4" fill={shadow}/>
      {/* Platform base */}
      <rect x="4" y="44" width="122" height="8" rx="2" fill={color}/>
      {/* End walls (left + right posts) */}
      <rect x="4"  y="16" width="8"  height="30" rx="1" fill={color}/>
      <rect x="118" y="16" width="8" height="30" rx="1" fill={color}/>
      {/* Horizontal crossbeam on end walls */}
      <rect x="4" y="16" width="8" height="5" rx="1" fill={dark} opacity="0.7"/>
      <rect x="118" y="16" width="8" height="5" rx="1" fill={dark} opacity="0.7"/>
      {/* Corner castings */}
      {[[4,44],[118,44],[4,16],[118,16]].map(([cx,cy],i)=>(
        <rect key={i} x={cx} y={cy} width="8" height="8" rx="1" fill={dark} opacity="0.5"/>
      ))}
      {/* Load-bed crossbeams */}
      {[20,36,52,68,84,100].map(x=>(
        <line key={x} x1={x} y1="44" x2={x} y2="52" stroke={dark} strokeWidth="2" opacity="0.3"/>
      ))}
    </svg>
  );

  // Standard container (dry, reefer, opentop)
  return (
    <svg viewBox="0 0 130 66" style={{ width: '100%', maxWidth: 110, display: 'block', margin: '0 auto' }}>
      <ellipse cx="65" cy="63" rx="44" ry="4" fill={shadow}/>
      {/* Main body */}
      <rect x="3" y="10" width="124" height="48" rx="2" fill={color}/>
      {/* Top rail */}
      <rect x="3" y="10" width="124" height="5" rx="1" fill={dark}/>
      {/* Bottom rail */}
      <rect x="3" y="53" width="124" height="5" rx="1" fill={dark}/>
      {/* Corrugation lines */}
      {corrugations.map(x=>(
        <line key={x} x1={x} y1="15" x2={x} y2="53" stroke={dark} strokeWidth="1.2" opacity="0.45"/>
      ))}
      {/* Corner castings */}
      {[[3,10],[117,10],[3,53],[117,53]].map(([cx,cy],i)=>(
        <rect key={i} x={cx} y={cy} width="9" height="7" rx="1" fill={dark} opacity="0.7"/>
      ))}
      {/* Door panel (right two-thirds) */}
      <rect x="68" y="15" width="53" height="38" fill="rgba(0,0,0,0.07)"/>
      <line x1="94" y1="15" x2="94" y2="53" stroke={dark} strokeWidth="1.5" opacity="0.5"/>
      {/* Door handles */}
      <circle cx="78" cy="34" r="2" fill={dark} opacity="0.5"/>
      <circle cx="110" cy="34" r="2" fill={dark} opacity="0.5"/>
      {/* Reefer: refrigeration unit on left */}
      {type === 'reefer' && (
        <>
          <rect x="5" y="15" width="22" height="31" rx="1" fill={dark} opacity="0.28"/>
          <line x1="9"  y1="22" x2="23" y2="22" stroke={light} strokeWidth="1"/>
          <line x1="9"  y1="28" x2="23" y2="28" stroke={light} strokeWidth="1"/>
          <line x1="9"  y1="34" x2="23" y2="34" stroke={light} strokeWidth="1"/>
          <line x1="9"  y1="40" x2="23" y2="40" stroke={light} strokeWidth="1"/>
        </>
      )}
      {/* Open top: dashed top edge to show no roof */}
      {type === 'opentop' && (
        <rect x="3" y="10" width="124" height="5" rx="1"
          fill={highlight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.35)'}/>
      )}
    </svg>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Convert i18next global language strictly to 'FR', 'EN', 'AR'
  const currentLang = i18n.language.substring(0, 2).toUpperCase();
  const langKey = T[currentLang] ? currentLang : "FR";
  const t = T[langKey];

  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [form, setForm] = useState({ nom_complet: "", entreprise: "", email: "", objet: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  
  const statsRef = useRef(null);
  const statsVis = useInView(statsRef);
  const heroSlides = [IMG.hero1, IMG.hero2, IMG.hero3, IMG.hero4];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const ti = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(ti);
  }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let newErrors: Record<string, string> = {};

    if (!form.nom_complet.trim()) newErrors.nom_complet = i18n.t('contact.errors.required');
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = i18n.t('contact.errors.email_invalid');
    if (!form.objet) newErrors.objet = i18n.t('contact.errors.required');
    if (!form.message || form.message.length < 10) newErrors.message = i18n.t('contact.errors.message_too_short');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/contact', form);
      setSubmitted(true);
      setForm({ nom_complet: "", entreprise: "", email: "", objet: "", message: "" });
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: i18n.t('contact.errors.server_error') });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#1e293b", fontFamily: "inherit", width: "100%", transition: "border-color .2s" };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: "#1e293b", background: "#f7f9fc", overflowX: "hidden", direction: t.dir }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes modalIn{from{opacity:0;transform:scale(.94) translateY(24px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes heroFade{from{opacity:0;transform:scale(1.05);}to{opacity:1;transform:scale(1);}}
        .fade-up{animation:fadeUp .8s ease both;}
        .hero-active{animation:heroFade 1.4s ease both;}
        .spinner{animation:spin .8s linear infinite;}
        .inp:focus{border-color:#0D1F3C!important;outline:none;}
        .nav-btn:hover{color:#CFA030!important;}
        .svc-card:hover{transform:translateY(-8px)!important;box-shadow:0 24px 56px rgba(13,31,60,.14)!important;}
        .cnt-btn:hover{transform:translateY(-5px)!important;box-shadow:0 16px 36px rgba(13,31,60,.18)!important;}
        .gi:hover{transform:scale(1.06)!important;filter:brightness(1)!important;}
        .social-btn:hover{background:#CFA030!important;color:#0D1F3C!important;border-color:#CFA030!important;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#CFA030;border-radius:3px;}
        input:focus,textarea:focus,select:focus{outline:2px solid #0D1F3C;outline-offset:1px;}
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 75, background: scrolled ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${scrolled ? "rgba(203,213,225,.7)" : "rgba(203,213,225,.4)"}`, boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.08)" : "none", transition: "all .3s", display: "flex", alignItems: "center", padding: "0 2.5rem", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => scrollTo("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={IMG.logo} alt="NASHCO" style={{ height: 48, width: "auto", objectFit: "contain", borderRadius: 6 }} onError={e => { e.currentTarget.style.display = "none"; }} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 16, color: "#0D1F3C", letterSpacing: "-0.5px" }}>GSLC</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>NASHCO DZ</span>
          </div>
        </button>

        {/* Action Buttons & Localization */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Main Website Routing */}
          <nav style={{ display: "flex", gap: "2rem", alignItems: "center", marginRight: '2rem' }}>
            {t.nav.map((n: string, i: number) => (
              <button key={i} className="nav-btn" onClick={() => scrollTo(["home", "about", "services", "catalogue", "agencies", "contact"][i])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", transition: "color .2s", letterSpacing: ".02em" }}>{n}</button>
            ))}
          </nav>
          
          {/* I18n Switcher using i18n global state firmly */}
          <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 24, overflow: "hidden", fontSize: 11, fontWeight: 700 }}>
            {["FR", "AR", "EN"].map(l => (
              <button 
                key={l} 
                onClick={() => i18n.changeLanguage(l.toLowerCase())} 
                style={{ padding: "5px 12px", border: "none", cursor: "pointer", background: currentLang === l ? "var(--color-primary)" : "#fff", color: currentLang === l ? "#fff" : "var(--color-primary)", borderLeft: l !== "FR" ? "1.5px solid #e2e8f0" : "none", transition: "all .2s" }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Bold Noticeable Buttons connected dynamically via React Router dom native */}
          <a 
             href="/login"
             style={{ display: "inline-block", textDecoration: "none", padding: "10px 22px", border: "2px solid #CFA030", borderRadius: 8, background: "#fff", color: "#CFA030", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all .2s" }} 
             onMouseEnter={e => { e.currentTarget.style.background = "#CFA030"; e.currentTarget.style.color = "#fff"; }} 
             onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#CFA030"; }}
          >
            {t.login}
          </a>
          <a 
             href="/register"
             style={{ display: "inline-block", textDecoration: "none", padding: "10px 22px", border: "2px solid var(--color-primary)", borderRadius: 8, background: "var(--color-primary)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(13,31,60,.25)", transition: "all .2s" }} 
             onMouseEnter={e => { e.currentTarget.style.background = "#1a4a8c"; e.currentTarget.style.borderColor = "#1a4a8c"; }} 
             onMouseLeave={e => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.borderColor = "var(--color-primary)"; }}
          >
            {t.register}
          </a>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────── */}
      <section id="home" style={{ position: "relative", height: "92vh", minHeight: 640, display: "flex", alignItems: "center", overflow: "hidden", marginTop: 70 }}>
        {heroSlides.map((src, i) => (
          <img key={src} src={src} alt="Port" className={i === heroSlide ? "hero-active" : ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === heroSlide ? 1 : 0, transition: "opacity 1.4s ease", zIndex: 0 }} onError={e => e.currentTarget.style.display = "none"} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(9,21,44,.88) 0%,rgba(9,21,44,.45) 60%,transparent 100%)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", width: "100%" }}>
          <div className="fade-up" style={{ maxWidth: 720 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(207,160,48,.18)", border: "1px solid rgba(207,160,48,.45)", color: "#f4c842", padding: "6px 18px", borderRadius: 32, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", marginBottom: 28, backdropFilter: "blur(6px)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CFA030", display: "inline-block" }} />{t.hero_tag}
            </span>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: "clamp(2.4rem,5vw,4rem)", color: "#fff", lineHeight: 1.1, marginBottom: 28, letterSpacing: "-1.5px" }}>{t.hero_h1}</h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.8)", lineHeight: 1.85, marginBottom: 44, maxWidth: 560 }}>{t.hero_p}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <button onClick={() => scrollTo("contact")} style={{ padding: "15px 36px", borderRadius: 10, border: "none", background: "#CFA030", color: "#0D1F3C", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 28px rgba(207,160,48,.4)", transition: "all .25s" }} onMouseEnter={e => e.currentTarget.style.background = "#e6b832"} onMouseLeave={e => e.currentTarget.style.background = "#CFA030"}>{t.hero_cta1}</button>
              <a href="/register" style={{ display: "inline-block", textDecoration: "none", padding: "15px 36px", borderRadius: 10, border: "2px solid rgba(255,255,255,.6)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .25s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0D1F3C"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}>{t.hero_cta2}</a>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", gap: 8 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{ width: i === heroSlide ? 32 : 10, height: 10, borderRadius: 5, border: "none", cursor: "pointer", background: i === heroSlide ? "#CFA030" : "rgba(255,255,255,.4)", transition: "all .4s", padding: 0 }} />
          ))}
        </div>
      </section>

      {/* ── STATS BAND ─────────────────────────────── */}
      <div ref={statsRef} style={{ background: "#0D1F3C", padding: "3rem 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 16, padding: "2rem", textAlign: "center", border: "1px solid rgba(0,0,0,.04)" }}>
               <p style={{ fontSize: 36, fontWeight: 800, color: "#0D1F3C", lineHeight: 1 }}>{s.value}{s.suffix}</p>
               <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginTop: 8 }}>{t.stats[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ──────────────────────────────────── */}
      <section id="about" style={{ padding: "7rem 2.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, height: 500 }}>
            <div style={{ borderRadius: 20, overflow: "hidden", gridRow: "1/3", boxShadow: "0 24px 60px rgba(0,0,0,.14)" }}>
              <img src={IMG.about} alt="NASHCO" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }} className="gi" onError={e => e.currentTarget.style.display = "none"} />
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,.1)" }}>
              <img src={IMG.about2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.92)" }} className="gi" onError={e => e.currentTarget.style.display = "none"} />
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,.1)" }}>
              <img src={IMG.g[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.92)" }} className="gi" onError={e => e.currentTarget.style.display = "none"} />
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 14, display: "block" }}>{t.about_tag}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", lineHeight: 1.15, marginBottom: 36, letterSpacing: "-0.5px" }}>{t.about_h2}</h2>
            {[[t.about_def_t, t.about_def_p], [t.about_hist_t, t.about_hist_p]].map(([title, text]) => (
              <div key={title} style={{ marginBottom: 28, paddingInlineStart: 16, borderInlineStart: "3px solid #CFA030" }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0D1F3C", marginBottom: 10 }}>{title}</h4>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8 }}>{text}</p>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 32 }}>
              {IMG.g.slice(0, 6).map((src, i) => (
                <div key={i} style={{ height: 90, borderRadius: 12, overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.9)" }} className="gi" onError={e => e.currentTarget.style.display = "none"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────── */}
      <section id="services" style={{ padding: "7rem 2.5rem", background: "#f4f6fa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12, display: "block" }}>{t.svc_tag}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", letterSpacing: "-0.5px" }}>{t.svc_h2}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22 }}>
            {[IMG.svc1, IMG.svc2, IMG.svc3, IMG.svc4].map((img, i) => (
              <div key={i} className="svc-card" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e8edf3", boxShadow: "0 2px 8px rgba(0,0,0,.05)", transition: "all .3s" }}>
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img src={img} alt={t.svcs[i]} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onError={e => e.currentTarget.style.display = "none"} />
                </div>
                <div style={{ padding: "1.5rem 1.5rem 2rem" }}>
                  <div style={{ width: 36, height: 3, background: "#CFA030", borderRadius: 2, marginBottom: 14 }} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0D1F3C", marginBottom: 14 }}>{t.svcs[i]}</h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {t.svc_items[i].map((it: string) => (
                      <li key={it} style={{ fontSize: 13, color: "#64748b", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#CFA030", fontSize: 10 }}>▶</span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────── */}
      <section style={{ padding: "6rem 2.5rem", background: "#09152C" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12, display: "block" }}>{t.gallery_tag}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.6rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{t.gallery_h2}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "220px 220px", gap: 12 }}>
            {[
               { style: { gridColumn: "1/3", gridRow: "1/2" }, src: IMG.hero1 }, 
               { style: {}, src: IMG.g[0] }, 
               { style: {}, src: IMG.g[2] }, 
               { style: {}, src: IMG.g[3] }, 
               { style: {}, src: IMG.g[4] }, 
               { style: { gridColumn: "3/5", gridRow: "2/3" }, src: IMG.svc3 }
            ].map((item, i) => (
              <div key={i} style={{ ...item.style, borderRadius: 16, overflow: "hidden" }}>
                <img src={item.src} alt="" className="gi" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.88)" }} onError={e => e.currentTarget.style.display = "none"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATALOGUE ──────────────────────────────── */}
      <section id="catalogue" style={{ padding: "7rem 2.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12, display: "block" }}>{t.cat_tag}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", letterSpacing: "-0.5px" }}>{t.cat_h2}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 14 }}>
            {t.containers?.map((c: any) => (
              <button key={c.id} className="cnt-btn" onClick={() => setModal(c)} style={{ background: c.highlight ? "#0D1F3C" : "#f4f6fa", border: c.highlight ? "none" : "1.5px solid #e2e8f0", borderRadius: 16, padding: "1.25rem .75rem", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .3s" }}>
                {c.badge && <span style={{ position: "absolute", top: 8, right: 8, background: "#CFA030", color: "#0D1F3C", fontSize: 7, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{c.badge}</span>}
                <h4 style={{ fontSize: 12, fontWeight: 800, color: c.highlight ? "#fff" : "#0D1F3C", marginBottom: 10, direction: 'ltr' }}>{c.label}</h4>
                <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <ContainerSVG
                    color={CONTAINER_META[c.id]?.color ?? '#64748b'}
                    type={CONTAINER_META[c.id]?.type ?? 'dry'}
                    highlight={!!c.highlight}
                  />
                </div>
                <div style={{ fontSize: 9, color: c.highlight ? "#94a3b8" : "#64748b", lineHeight: 1.5 }}>{c.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPLANTATIONS MAP ─────────────────────── */}
      <section id="locations" style={{ padding: "7rem 2.5rem", background: "#09152C" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", display: "block", marginBottom: 12 }}>
              {t.port_marker}
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>
              {langKey === 'AR' ? 'شبكة موانئنا في الجزائر' : langKey === 'EN' ? 'Our Port Network in Algeria' : 'Nos Implantations Portuaires'}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "4rem", alignItems: "center" }}>

            {/* Algeria SVG Map */}
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 600 250" style={{ width: "100%", display: "block", borderRadius: 20, overflow: "hidden" }}>
                {/* Sea background */}
                <rect width="600" height="250" fill="#0C2340"/>
                {/* Nautical grid */}
                {[60,120,180,240,300,360,420,480,540].map(x=>(
                  <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="250" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                ))}
                {[50,100,150,200].map(y=>(
                  <line key={`hg${y}`} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                ))}
                {/* Algeria land polygon (coast path + fill below) */}
                <path
                  d="M 28,200 C 20,194 15,190 19,191 C 30,183 55,166 86,155 C 98,149 112,143 126,138 C 148,127 170,110 193,99 C 225,90 260,84 289,82 C 320,81 365,82 401,82 C 420,81 432,77 438,76 C 460,73 485,71 501,71 C 520,70 538,69 548,68 C 565,65 580,61 589,58 L 600,58 L 600,250 L 0,250 L 0,200 Z"
                  fill="#1A3A5C"
                />
                {/* Coastline stroke */}
                <path
                  d="M 28,200 C 20,194 15,190 19,191 C 30,183 55,166 86,155 C 98,149 112,143 126,138 C 148,127 170,110 193,99 C 225,90 260,84 289,82 C 320,81 365,82 401,82 C 420,81 432,77 438,76 C 460,73 485,71 501,71 C 520,70 538,69 548,68 C 565,65 580,61 589,58"
                  fill="none" stroke="#2D6A9F" strokeWidth="1.5"
                />
                {/* NASHCO watermark on land */}
                <text x="300" y="195" textAnchor="middle" fill="rgba(255,255,255,0.04)" fontSize="52" fontWeight="900" fontFamily="sans-serif">NASHCO</text>
                {/* Mer Méditerranée label */}
                <text x="300" y="38" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="13" fontWeight="500" fontFamily="'Inter',sans-serif" fontStyle="italic">
                  {langKey === 'AR' ? 'البحر المتوسط' : 'Mer Méditerranée'}
                </text>
                {/* Port markers */}
                {MAP_PORTS.map((port, idx) => (
                  <g key={port.name}>
                    {/* Pulsing ring */}
                    <circle cx={port.x} cy={port.y} r="4" fill="#CFA030" opacity="0.2">
                      <animate attributeName="r" values="4;16;4" dur="3s" begin={`${idx * 0.35}s`} repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" begin={`${idx * 0.35}s`} repeatCount="indefinite"/>
                    </circle>
                    {/* Main dot */}
                    <circle cx={port.x} cy={port.y} r={port.main ? 5 : 3.5} fill="#CFA030"/>
                    <circle cx={port.x} cy={port.y} r={port.main ? 2.5 : 1.5} fill="#fff"/>
                    {/* Label — only for ports with lx/ly defined */}
                    {port.lx !== undefined && (
                      <text
                        x={port.lx} y={port.ly}
                        textAnchor="middle"
                        fill={port.main ? "#fff" : "rgba(255,255,255,0.7)"}
                        fontSize={port.main ? 9 : 8}
                        fontFamily="'Inter',sans-serif"
                      >{i18n.t(`agencies.cities.${port.name}`)}</text>
                    )}
                  </g>
                ))}
                {/* Compass rose */}
                <g transform="translate(560,220)">
                  <circle r="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                  <polygon points="0,-13 3,-5 0,-7 -3,-5" fill="#CFA030"/>
                  <polygon points="0,13 3,5 0,7 -3,5" fill="rgba(255,255,255,0.25)"/>
                  <text textAnchor="middle" y="-15" fill="rgba(255,255,255,0.6)" fontSize="7" fontWeight="700" fontFamily="'Inter',sans-serif">N</text>
                </g>
              </svg>
            </div>

            {/* Port List */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#CFA030", marginBottom: 8, letterSpacing: "-0.3px" }}>
                {langKey === 'AR' ? '١٠ موانئ تجارية' : langKey === 'EN' ? '10 Commercial Ports' : '10 ports commerciaux'}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28, lineHeight: 1.7 }}>
                {langKey === 'AR'
                  ? 'نغطي جميع الموانئ التجارية على امتداد الساحل الجزائري من شرقه إلى غربه.'
                  : langKey === 'EN'
                  ? 'We cover every commercial port along the Algerian coastline from east to west.'
                  : 'Nous couvrons l\'ensemble des ports commerciaux le long du littoral algérien.'}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {MAP_PORTS.map((port, i) => (
                  <div key={port.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: port.main ? "#CFA030" : "rgba(207,160,48,0.4)", flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: port.main ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: port.main ? 600 : 400 }}>
                      {i18n.t(`agencies.cities.${port.name}`)}
                    </span>
                    {port.main && (
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#CFA030", fontWeight: 700, background: "rgba(207,160,48,0.12)", padding: "2px 8px", borderRadius: 20 }}>
                        {langKey === 'AR' ? 'رئيسي' : langKey === 'EN' ? 'Main' : 'Principal'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* HQ address */}
              <div style={{ marginTop: 28, padding: "16px 20px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
                  {langKey === 'AR' ? 'المقر الرئيسي' : langKey === 'EN' ? 'Head Office' : 'Siège Social'}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                  {langKey === 'AR' ? (
                    <>50 مكرر طريق جسر قسنطينة<br/>القبة — الجزائر العاصمة، الجزائر<br/></>
                  ) : langKey === 'EN' ? (
                    <>50 Bis Gué de Constantine Route<br/>Kouba — Algiers, Algeria<br/></>
                  ) : (
                    <>50 Bis Route de Gué de Constantine<br/>Kouba — Alger, Algérie<br/></>
                  )}
                  {/* Phone always LTR regardless of page direction */}
                  <span style={{ color: "#CFA030", direction: "ltr", display: "inline-block" }}>{t.footer_phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS AGENCES ────────────────────────────── */}
      <section 
        id="agencies" 
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        style={{ padding: "7rem 2.5rem", background: "#f4f6fa", textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }} className="fade-up">
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12, display: "block" }}>
              {i18n.t('agencies.title')}
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", letterSpacing: "-0.5px" }}>
              {i18n.t('agencies.subtitle')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "mostaganem", cityKey: "mostaganem", address: "Coopérative Colonel Amirouche N° B 01, Mostaganem", tel: "+213 45 41 78 76", email: ["direc-mos@nashco.com.dz", "com-mos@nashco.com.dz"], primary: true },
              { id: "alger", cityKey: "alger", address: "01 Rue des Frères Oukid, Square Port Saïd, Alger", tel: "+213 21 43 94 46", email: ["direc-alg@nashco.com.dz", "com-alg@nashco.com.dz"] },
              { id: "oran", cityKey: "oran", address: "08 Rue Tami Abdelkader, Miramar, Oran", tel: "+213 41 41 59 58", email: ["direc-oran@nashco.com.dz", "com-oran@nashco.com.dz"] },
              { id: "annaba", cityKey: "annaba", address: "Boulevard Ben Adelmalek Ramdane, BP N° 172, Annaba", tel: "+213 38 86 71 56", email: ["direc-anb@nashco.com.dz", "com-anb@nashco.com.dz"] },
              { id: "skikda", cityKey: "skikda", address: "Zone de Dépôt Hamrouche Hamoudi, BP N° 186, Skikda", tel: "+213 38 93 17 97", email: ["direc-skd@nashco.com.dz", "com-skd@nashco.com.dz"] },
              { id: "jijel", cityKey: "jijel", address: "10 Avenue Emir Abdelkader, Jijel 18000", tel: "+213 34 499 236", email: ["djendjen@nashco.com.dz"], branch: true },
              { id: "bejaia", cityKey: "bejaia", address: "Résidence la plaine, Béjaïa Ville", tel: "+213 34 09 01 21", email: ["direc-bej@nashco.com.dz", "com-bej@nashco.com.dz"] }
            ].map((a, i) => (
              <div 
                key={a.id} 
                className={`cnt-btn fade-up flex flex-col ${a.primary ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}
                style={{ 
                  background: "#0D1F3C", 
                  border: a.primary ? "1.5px solid #CFA030" : "1.5px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "1.25rem .75rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all .3s",
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: a.primary ? 22 : 18 }}>📍</span>
                    <h3 style={{ fontSize: a.primary ? 20 : 16, fontWeight: 800, color: "#fff", margin: 0 }}>
                      {i18n.t(`agencies.cities.${a.cityKey}`)}
                    </h3>
                  </div>
                  {a.primary && (
                    <span style={{ background: "rgba(207,160,48,0.15)", color: "#CFA030", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20, whiteSpace: "nowrap", border: "1px solid rgba(207,160,48,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>⚓</span> <span>{i18n.t('agencies.primary_badge')}</span>
                    </span>
                  )}
                  {a.branch && (
                    <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20 }}>
                      {i18n.t('agencies.branch')}
                    </span>
                  )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ opacity: 0.6, marginTop: 2 }}>🏢</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#CFA030", marginBottom: 2 }}>
                        {i18n.t('agencies.address')}
                      </span>
                      <span dir="ltr" style={{ lineHeight: 1.5, textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                        {i18n.t(`agencies.addresses.${a.id}`)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ opacity: 0.6, marginTop: 2 }}>📞</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#CFA030", marginBottom: 2 }}>
                        {i18n.t('agencies.phone')}
                      </span>
                      <span dir="ltr" style={{ color: "#fff", fontWeight: 600, textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                        {a.tel}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ opacity: 0.6, marginTop: 2 }}>✉️</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#CFA030", marginBottom: 2 }}>
                        {i18n.t('agencies.email')}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {a.email.map(e => (
                          <span key={e} dir="ltr" style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                            <a href={`mailto:${e}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>{e}</a>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────── */}
      <section id="contact" style={{ padding: "7rem 2.5rem", background: "#f4f6fa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12, display: "block" }}>{t.footer_contact}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", letterSpacing: "-0.5px" }}>{t.contact_h2}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}>
            {/* Info */}
            <div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: "1px solid #e2e8f0", marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0D1F3C", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#CFA030" }}>📍</span> {t.contact_addr}</h4>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{t.footer_addr}</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: "1px solid #e2e8f0", marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0D1F3C", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#CFA030" }}>📞</span> {t.phone_email_label}</h4>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8, direction: "ltr", textAlign: t.dir === "rtl" ? "right" : "left" }}>{t.footer_phone}</p>
                <p style={{ fontSize: 14, color: "#CFA030", fontWeight: 600, direction: "ltr", textAlign: t.dir === "rtl" ? "right" : "left" }}>{t.footer_email_val}</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0D1F3C", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#CFA030" }}>⚓</span> {t.contact_ports}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 1rem" }}>
                  {PORTS.map(p => (
                    <div key={p} style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CFA030", flexShrink: 0 }} />
                      {i18n.t(`agencies.cities.${p}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.08)", padding: "2.5rem" }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 900, color: "#0D1F3C", marginBottom: "2rem" }}>
                {t.contact_h2}
              </h3>
              
              {submitted ? (
                <div style={{ background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 12, padding: "2rem", color: "#166534", fontSize: 15, fontWeight: 600, textAlign: "center", lineHeight: 1.6 }}>
                  <div style={{ fontSize: 32, marginBottom: "1rem" }}>✅</div>
                  {i18n.t('contact.success_message')}
                </div>
              ) : (
                <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input className="inp" type="text" placeholder={t.form_name || "Nom complet *"} value={form.nom_complet} onChange={e => setForm(s => ({ ...s, nom_complet: e.target.value }))} style={{...inputStyle, borderColor: errors.nom_complet ? "#ef4444" : "#e2e8f0"}} />
                      {errors.nom_complet && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>{errors.nom_complet}</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input className="inp" type="text" placeholder={t.form_company || "Entreprise"} value={form.entreprise} onChange={e => setForm(s => ({ ...s, entreprise: e.target.value }))} style={{...inputStyle, borderColor: errors.entreprise ? "#ef4444" : "#e2e8f0"}} />
                      {errors.entreprise && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>{errors.entreprise}</span>}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <input className="inp" type="email" placeholder={t.form_email || "E-mail *"} value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} style={{...inputStyle, borderColor: errors.email ? "#ef4444" : "#e2e8f0"}} />
                    {errors.email && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>{errors.email}</span>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <select className="inp" value={form.objet} onChange={e => setForm(s => ({ ...s, objet: e.target.value }))} style={{ ...inputStyle, borderColor: errors.objet ? "#ef4444" : "#e2e8f0", color: form.objet ? "#1e293b" : "#94a3b8" }}>
                      <option value="">{t.form_subject || "Objet de votre demande *"}</option>
                      <option value="demande_location">{i18n.t('contact.objet.demande_location')}</option>
                      <option value="demande_devis">{i18n.t('contact.objet.demande_devis')}</option>
                      <option value="suivi_expedition">{i18n.t('contact.objet.suivi_expedition')}</option>
                      <option value="information_services">{i18n.t('contact.objet.information_services')}</option>
                      <option value="reclamation">{i18n.t('contact.objet.reclamation')}</option>
                      <option value="autre">{i18n.t('contact.objet.autre')}</option>
                    </select>
                    {errors.objet && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>{errors.objet}</span>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <textarea className="inp" rows={5} placeholder={t.form_msg || "Votre message *"} value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} style={{ ...inputStyle, resize: "vertical", borderColor: errors.message ? "#ef4444" : "#e2e8f0" }} />
                    {errors.message && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>{errors.message}</span>}
                  </div>

                  {errors.general && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{errors.general}</div>}

                  <button type="submit" disabled={loading} style={{ background: loading ? "#94a3b8" : "#0D1F3C", color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }} onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1a4a8c"; }} onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0D1F3C"; }}>
                    {loading ? <><span className="spinner" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />{i18n.t('contact.submit.loading')}</> : i18n.t('contact.submit.default')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: "#09152C", color: "#fff", padding: "5rem 2.5rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.4fr", gap: "2.5rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <img src={IMG.logo} alt="NASHCO" style={{ height: 50, width: "auto", objectFit: "contain", borderRadius: 8, background: "#fff", padding: "4px 10px" }} onError={e => e.currentTarget.style.display = "none"} />
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9, maxWidth: 280, marginBottom: 0 }}>{t.footer_desc}</p>
            </div>
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_nav}</h4>
              {t.nav.map((n: string, i: number) => (
                <button key={i} onClick={() => scrollTo(["home", "about", "services", "catalogue", "agencies", "contact"][i])} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", padding: "6px 0", transition: "color .2s", fontFamily: "inherit", width: "100%", textAlign: t.dir === "rtl" ? "right" : "left" }} onMouseEnter={e => e.currentTarget.style.color = "#CFA030"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
                  <span style={{ color: "#CFA030", fontSize: 8 }}>▶</span>{n}
                </button>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_contact}</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9, marginBottom: 12 }}>{t.footer_addr}</p>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 4, direction: 'ltr', textAlign: t.dir==='rtl'?'right':'left' }}>{t.footer_phone}</div>
              <div style={{ fontSize: 13, color: "#CFA030" }}>{t.footer_email_val}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
               <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_newsletter || 'Newsletter'}</h4>
               <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9, marginBottom: 12 }}>{t.footer_newsletter_p}</p>
            </div>
          </div>
          <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            {t.footer_copy}
          </div>
        </div>
      </footer>

      {/* ── MODAL CATALOGUE ─────────────────────────── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(9,21,44,.75)", backdropFilter: "blur(6px)" }} onClick={() => setModal(null)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 24, width: "100%", maxWidth: 640, padding: "2.5rem", boxShadow: "0 24px 80px rgba(0,0,0,.2)", animation: "modalIn .4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <button onClick={() => setModal(null)} style={{ position: "absolute", top: 20, right: 20, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", transition: "all .2s" }}>
               ✕
            </button>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem" }}>
               <div style={{ flexShrink: 0, width: 140, height: 140, background: "#f8fafc", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", border: "1px solid #e2e8f0" }}>
                  <img src={modal.img} alt={modal.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
               </div>
               <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0D1F3C", marginBottom: 4 }}>{modal.label}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", fontWeight: 600, marginBottom: 12 }}>{modal.sub}</p>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{modal.desc}</p>
               </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", padding: "1.5rem", borderRadius: 16, border: "1px solid #e2e8f0" }}>
               <div>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{t.modal_dims}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D1F3C", direction: 'ltr', textAlign: t.dir==='rtl'?'right':'left' }}>{modal.dims}</p>
               </div>
               <div>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{t.modal_vol}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D1F3C", direction: 'ltr', textAlign: t.dir==='rtl'?'right':'left' }}>{modal.vol}</p>
               </div>
               <div>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{t.modal_payload}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#CFA030", direction: 'ltr', textAlign: t.dir==='rtl'?'right':'left' }}>{modal.payload}</p>
               </div>
               <div>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{t.modal_tare}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D1F3C", direction: 'ltr', textAlign: t.dir==='rtl'?'right':'left' }}>{modal.tare}</p>
               </div>
            </div>

            <button onClick={() => setModal(null)} style={{ width: "100%", marginTop: "2rem", padding: "14px", background: "#0D1F3C", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
               {t.modal_close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}