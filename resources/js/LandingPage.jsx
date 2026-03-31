import { useState, useEffect, useRef } from "react";

/* ── TRANSLATIONS ─────────────────────────────────────────── */
const T = {
  FR: {
    dir: "ltr",
    nav: ["Accueil", "À Propos", "Services", "Conteneurs", "Contact"],
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
    footer_addr_label: "Adresse", footer_addr: "02 Rue de Béjaïa, Port d'Alger",
    footer_phone_label: "Téléphone", footer_phone: "+213 (0)21 43 XX XX",
    footer_email_label: "E-mail", footer_email_val: "contact@nashco-dz.com",
    footer_hours_label: "Horaires", footer_hours: "Lun–Jeu : 08h–17h\nDim : 08h–13h",
    footer_copy: "© 2026 EPE NASHCO Spa. Tous droits réservés.",
    footer_legal: ["Confidentialité", "Mentions Légales", "Cookies"],
    port_marker: "Réseau portuaire national",
  },
  AR: {
    dir: "rtl",
    nav: ["الرئيسية", "من نحن", "خدماتنا", "الحاويات", "اتصل بنا"],
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
    footer_addr_label: "العنوان", footer_addr: "02 شارع بجاية، ميناء الجزائر",
    footer_phone_label: "الهاتف", footer_phone: "21 43 XX XX (0)213+",
    footer_email_label: "البريد", footer_email_val: "contact@nashco-dz.com",
    footer_hours_label: "أوقات العمل", footer_hours: "الإثنين – الخميس: 08:00 – 17:00\nالأحد: 08:00 – 13:00",
    footer_copy: "© 2026 مؤسسة ناشكو — جميع الحقوق محفوظة.",
    footer_legal: ["سياسة الخصوصية", "الشروط القانونية", "ملفات تعريف الارتباط"],
    port_marker: "الشبكة الميناءية الوطنية",
  },
  EN: {
    dir: "ltr",
    nav: ["Home", "About", "Services", "Containers", "Contact"],
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
    footer_phone_label: "Phone", footer_phone: "+213 (0)21 43 XX XX",
    footer_email_label: "Email", footer_email_val: "contact@nashco-dz.com",
    footer_hours_label: "Office Hours", footer_hours: "Mon–Thu: 08:00–17:00\nSun: 08:00–13:00",
    footer_copy: "© 2026 EPE NASHCO Spa. All rights reserved.",
    footer_legal: ["Privacy Policy", "Terms of Use", "Cookies"],
    port_marker: "National port network",
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
const CONTAINERS = [
  { id: "dry20", label: "20' DC", sub: "Dry Cargo Standard", img: IMG.cnt_dry, highlight: false, dims: "5,89×2,35×2,39m", vol: "33,2 m³", payload: "23 000 kg", tare: "2 200 kg", desc: "Conteneur standard entièrement fermé, idéal pour la majorité des marchandises sèches." },
  { id: "dry40", label: "40' DC", sub: "Dry Cargo Standard", img: IMG.cnt_dry, highlight: false, dims: "12,03×2,35×2,39m", vol: "67,7 m³", payload: "25 000 kg", tare: "3 750 kg", desc: "Double volume du 20', parfait pour les grands lots de marchandises générales." },
  { id: "hc40", label: "40' HC", sub: "High Cube", img: IMG.cnt_dry, highlight: false, dims: "12,03×2,35×2,70m", vol: "76,4 m³", payload: "28 600 kg", tare: "3 900 kg", desc: "30 cm suppl. en hauteur pour les marchandises volumineuses." },
  { id: "reefer", label: "Reefer (RF)", sub: "Température contrôlée", img: IMG.cnt_reefer, highlight: true, badge: "Réfrigéré", dims: "11,59×2,29×2,25m", vol: "59,8 m³", payload: "27 700 kg", tare: "3 080 kg", temp: "−35°C à +20°C", desc: "Conteneur frigorifique pour produits frais, surgelés et pharmaceutiques." },
  { id: "opentop", label: "Open Top (OT)", sub: "Chargement vertical", img: IMG.cnt_opentop, highlight: false, dims: "5,89×2,35×2,35m", vol: "32,6 m³", payload: "28 130 kg", tare: "2 350 kg", desc: "Toit ouvert pour marchandises hautes chargées par grue." },
  { id: "flat", label: "Flat Rack (FR)", sub: "Hors gabarit", img: IMG.cnt_flat, highlight: false, dims: "12,13×2,40×2,00m", vol: "Variable", payload: "39 000 kg", tare: "5 000 kg", desc: "Sans parois latérales pour machines industrielles et équipements lourds." },
  { id: "tank", label: "ISO Tank", sub: "Transport de liquides", img: IMG.cnt_tank, highlight: false, dims: "Cadre ISO 20'", vol: "20 000–26 000 L", payload: "~25 000 kg", tare: "~3 000 kg", desc: "Citerne ISO pour liquides alimentaires ou dangereux." },
];

const STATS = [
  { value: 35, suffix: "+", bg: "#eef2ff" },
  { value: 4500, suffix: "+", bg: "#fff7ed" },
  { value: 320, suffix: "+", bg: "#f0fdf4" },
  { value: 10, suffix: "+", bg: "#fffbeb" },
];

const PORTS = ["Alger", "Oran", "Annaba", "Skikda", "Béjaïa", "Mostaganem", "Jijel / Djen-Djen", "Ghazaouet", "Arzew", "Tenes"];

/* ── HOOKS ─────────────────────────────────────────────────── */
function useCountUp(target, active, duration = 2000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0; const step = target / (duration / 16);
    const t = setInterval(() => { cur += step; if (cur >= target) { setN(target); clearInterval(t); } else setN(Math.floor(cur)); }, 16);
    return () => clearInterval(t);
  }, [active, target]);
  return n;
}
function useInView(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [ref]);
  return v;
}

/* ── STAT CARD ─────────────────────────────────────────────── */
function StatCard({ s, label, active }) {
  const n = useCountUp(s.value, active);
  return (
    <div style={{ background: s.bg, borderRadius: 16, padding: "2rem", textAlign: "center", border: "1px solid rgba(0,0,0,.04)" }}>
      <p style={{ fontSize: 36, fontWeight: 800, color: "#0D1F3C", lineHeight: 1 }}>{n.toLocaleString()}{s.suffix}</p>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginTop: 8 }}>{label}</p>
    </div>
  );
}

/* ── CONTAINER MODAL ───────────────────────────────────────── */
function Modal({ c, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.3)", animation: "modalIn .3s ease" }}>
        <div style={{ background: c.highlight ? "#0D1F3C" : "#f1f5f9", height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <img src={c.img} alt={c.label} style={{ maxHeight: 160, maxWidth: "80%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
          {c.badge && <span style={{ position: "absolute", top: 12, right: 12, background: "#CFA030", color: "#0D1F3C", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>{c.badge}</span>}
          <button onClick={onClose} style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.12)", color: c.highlight ? "#fff" : "#0D1F3C", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 4 }}>NASHCO — Conteneur Maritime</p>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0D1F3C", marginBottom: 8 }}>{c.label}</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.7 }}>{c.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Dimensions", c.dims], ["Volume", c.vol], ["Charge utile", c.payload], ["Tare", c.tare], ...(c.temp ? [["Température", c.temp]] : [])].map(([k, v]) => (
              <div key={k} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0D1F3C" }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ marginTop: "1.25rem", width: "100%", padding: "13px", background: "#0D1F3C", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>Nous contacter →</button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const [lang, setLang] = useState("FR");
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState(null);
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", subject: "", message: "" });
  const statsRef = useRef(null);
  const statsVis = useInView(statsRef);
  const t = T[lang];
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

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const handleSend = async e => {
    e.preventDefault(); setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setSending(false); setFormSent(true);
    setForm({ name: "", company: "", email: "", subject: "", message: "" });
    setTimeout(() => setFormSent(false), 5000);
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
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 70, background: scrolled ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${scrolled ? "rgba(203,213,225,.7)" : "rgba(203,213,225,.4)"}`, boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.08)" : "none", transition: "all .3s", display: "flex", alignItems: "center", padding: "0 2.5rem", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => scrollTo("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <img src={IMG.logo} alt="NASHCO" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 6 }} onError={e => { e.target.style.display = "none"; }} />
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 18, color: "#0D1F3C", letterSpacing: "-0.5px", lineHeight: 1 }}>NASHCO</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Entreprise Publique</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {t.nav.map((n, i) => (
            <button key={i} className="nav-btn" onClick={() => scrollTo(["home", "about", "services", "catalogue", "contact"][i])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", transition: "color .2s", letterSpacing: ".02em" }}>{n}</button>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 24, overflow: "hidden", fontSize: 11, fontWeight: 700 }}>
            {["FR", "AR", "EN"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", border: "none", cursor: "pointer", background: lang === l ? "#0D1F3C" : "#fff", color: lang === l ? "#fff" : "#0D1F3C", borderLeft: l !== "FR" ? "1.5px solid #e2e8f0" : "none", transition: "all .2s" }}>{l}</button>
            ))}
          </div>
          <button onClick={() => scrollTo("contact")} style={{ padding: "8px 18px", border: "1.5px solid #0D1F3C", borderRadius: 8, background: "transparent", color: "#0D1F3C", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#0D1F3C"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0D1F3C"; }}>{t.login}</button>
          <button onClick={() => scrollTo("contact")} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: "#0D1F3C", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(13,31,60,.25)", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#1a4a8c"} onMouseLeave={e => e.currentTarget.style.background = "#0D1F3C"}>{t.register}</button>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────── */}
      <section id="home" style={{ position: "relative", height: "92vh", minHeight: 640, display: "flex", alignItems: "center", overflow: "hidden", marginTop: 70 }}>
        {/* Slideshow */}
        {heroSlides.map((src, i) => (
          <img key={src} src={src} alt="Port" className={i === heroSlide ? "hero-active" : ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === heroSlide ? 1 : 0, transition: "opacity 1.4s ease", zIndex: 0 }} onError={e => e.target.style.display = "none"} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(9,21,44,.88) 0%,rgba(9,21,44,.45) 60%,transparent 100%)", zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", width: "100%" }}>
          <div className="fade-up" style={{ maxWidth: 720 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(207,160,48,.18)", border: "1px solid rgba(207,160,48,.45)", color: "#f4c842", padding: "6px 18px", borderRadius: 32, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", marginBottom: 28, backdropFilter: "blur(6px)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CFA030", display: "inline-block" }} />{t.hero_tag}
            </span>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: "clamp(2.4rem,5vw,4rem)", color: "#fff", lineHeight: 1.1, marginBottom: 28, letterSpacing: "-1.5px" }}>{t.hero_h1}</h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.8)", lineHeight: 1.85, marginBottom: 44, maxWidth: 560 }}>{t.hero_p}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <button onClick={() => scrollTo("contact")} style={{ padding: "15px 36px", borderRadius: 10, border: "none", background: "#CFA030", color: "#0D1F3C", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 28px rgba(207,160,48,.4)", transition: "all .25s" }} onMouseEnter={e => e.currentTarget.style.background = "#e6b832"} onMouseLeave={e => e.currentTarget.style.background = "#CFA030"}>{t.hero_cta1}</button>
              <button onClick={() => scrollTo("contact")} style={{ padding: "15px 36px", borderRadius: 10, border: "2px solid rgba(255,255,255,.6)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .25s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0D1F3C"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}>{t.hero_cta2}</button>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", gap: 8 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{ width: i === heroSlide ? 32 : 10, height: 10, borderRadius: 5, border: "none", cursor: "pointer", background: i === heroSlide ? "#CFA030" : "rgba(255,255,255,.4)", transition: "all .4s", padding: 0 }} />
          ))}
        </div>
      </section>

      {/* ── STATS BAND ─────────────────────────────── */}
      <div ref={statsRef} style={{ background: "#0D1F3C", padding: "3rem 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {STATS.map((s, i) => <StatCard key={i} s={s} label={t.stats[i]} active={statsVis} />)}
        </div>
      </div>

      {/* ── ABOUT ──────────────────────────────────── */}
      <section id="about" style={{ padding: "7rem 2.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, height: 500 }}>
            <div style={{ borderRadius: 20, overflow: "hidden", gridRow: "1/3", boxShadow: "0 24px 60px rgba(0,0,0,.14)" }}>
              <img src={IMG.about} alt="NASHCO" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }} className="gi" onError={e => e.target.style.display = "none"} />
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,.1)" }}>
              <img src={IMG.about2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.92)" }} className="gi" onError={e => e.target.style.display = "none"} />
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,.1)" }}>
              <img src={IMG.g[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.92)" }} className="gi" onError={e => e.target.style.display = "none"} />
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#CFA030", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 14, display: "block" }}>{t.about_tag}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, color: "#0D1F3C", lineHeight: 1.15, marginBottom: 36, letterSpacing: "-0.5px" }}>{t.about_h2}</h2>
            {[[t.about_def_t, t.about_def_p], [t.about_hist_t, t.about_hist_p]].map(([title, text]) => (
              <div key={title} style={{ marginBottom: 28, paddingLeft: 16, borderLeft: "3px solid #CFA030" }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0D1F3C", marginBottom: 10 }}>{title}</h4>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8 }}>{text}</p>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 32 }}>
              {IMG.g.slice(0, 6).map((src, i) => (
                <div key={i} style={{ height: 90, borderRadius: 12, overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.9)" }} className="gi" onError={e => e.target.style.display = "none"} />
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
                  <img src={img} alt={t.svcs[i]} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }} onMouseEnter={e => e.target.style.transform = "scale(1.08)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} onError={e => e.target.style.display = "none"} />
                </div>
                <div style={{ padding: "1.5rem 1.5rem 2rem" }}>
                  <div style={{ width: 36, height: 3, background: "#CFA030", borderRadius: 2, marginBottom: 14 }} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0D1F3C", marginBottom: 14 }}>{t.svcs[i]}</h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {t.svc_items[i].map(it => (
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
            {[{ style: { gridColumn: "1/3", gridRow: "1/2" }, src: IMG.hero1 }, { style: {}, src: IMG.g[0] }, { style: {}, src: IMG.g[2] }, { style: {}, src: IMG.g[3] }, { style: {}, src: IMG.g[4] }, { style: { gridColumn: "3/5", gridRow: "2/3" }, src: IMG.svc3 }].map((item, i) => (
              <div key={i} style={{ ...item.style, borderRadius: 16, overflow: "hidden" }}>
                <img src={item.src} alt="" className="gi" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.88)" }} onError={e => e.target.style.display = "none"} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 12 }}>
            {IMG.g.slice(5, 10).map((src, i) => (
              <div key={i} style={{ height: 150, borderRadius: 16, overflow: "hidden" }}>
                <img src={src} alt="" className="gi" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.88)" }} onError={e => e.target.style.display = "none"} />
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
            {CONTAINERS.map(c => (
              <button key={c.id} className="cnt-btn" onClick={() => setModal(c)} style={{ background: c.highlight ? "#0D1F3C" : "#f4f6fa", border: c.highlight ? "none" : "1.5px solid #e2e8f0", borderRadius: 16, padding: "1.25rem .75rem", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .3s" }}>
                {c.badge && <span style={{ position: "absolute", top: 8, right: 8, background: "#CFA030", color: "#0D1F3C", fontSize: 7, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{c.badge}</span>}
                <h4 style={{ fontSize: 12, fontWeight: 800, color: c.highlight ? "#fff" : "#0D1F3C", marginBottom: 10 }}>{c.label}</h4>
                <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <img src={c.img} alt={c.label} style={{ maxHeight: 64, maxWidth: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                </div>
                <div style={{ fontSize: 9, color: c.highlight ? "#94a3b8" : "#64748b", lineHeight: 1.5 }}>{c.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ────────────────────────────── */}
      <div style={{ display: "flex", height: 260, overflow: "hidden" }}>
        {[IMG.svc1, IMG.about2, IMG.svc4, IMG.g[6], IMG.hero2, IMG.g[8]].map((src, i) => (
          <div key={i} style={{ flex: 1, overflow: "hidden" }}>
            <img src={src} alt="" className="gi" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", filter: "brightness(.9)" }} onError={e => e.target.style.display = "none"} />
          </div>
        ))}
      </div>

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
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>02 Rue de Béjaïa, Port d'Alger — Algérie</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: "1px solid #e2e8f0", marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0D1F3C", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#CFA030" }}>📞</span> Téléphone & Email</h4>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>+213 (0)21 43 XX XX</p>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>+213 (0)21 43 XX XX</p>
                <p style={{ fontSize: 14, color: "#CFA030", fontWeight: 600 }}>contact@nashco-dz.com</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0D1F3C", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#CFA030" }}>⚓</span> {t.contact_ports}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 1rem" }}>
                  {PORTS.map(p => (
                    <div key={p} style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CFA030", flexShrink: 0 }} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.08)", padding: "2.5rem" }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 900, color: "#0D1F3C", marginBottom: "2rem" }}>
                {t.form_subject}
              </h3>
              {formSent && <div style={{ background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#166534", fontSize: 13, fontWeight: 600 }}>{t.form_ok}</div>}
              <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <input required className="inp" type="text" placeholder={t.form_name} value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} style={inputStyle} />
                  <input className="inp" type="text" placeholder={t.form_company} value={form.company} onChange={e => setForm(s => ({ ...s, company: e.target.value }))} style={inputStyle} />
                </div>
                <input required className="inp" type="email" placeholder={t.form_email} value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} style={inputStyle} />
                <select className="inp" value={form.subject} onChange={e => setForm(s => ({ ...s, subject: e.target.value }))} style={{ ...inputStyle, color: form.subject ? "#1e293b" : "#94a3b8" }}>
                  <option value="">{t.form_subject}</option>
                  {t.form_opts.map(o => <option key={o}>{o}</option>)}
                </select>
                <textarea required className="inp" rows={5} placeholder={t.form_msg} value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
                <button type="submit" disabled={sending} style={{ background: sending ? "#94a3b8" : "#0D1F3C", color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 13, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }} onMouseEnter={e => { if (!sending) e.currentTarget.style.background = "#1a4a8c"; }} onMouseLeave={e => { if (!sending) e.currentTarget.style.background = "#0D1F3C"; }}>
                  {sending ? <><span className="spinner" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />{t.form_sending}</> : t.form_send}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: "#09152C", color: "#fff", padding: "5rem 2.5rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ROW 1: Logo+Desc | Quick Links | Services | Contact | Newsletter */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.4fr", gap: "2.5rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,.08)" }}>

            {/* Brand + Description */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <img src={IMG.logo} alt="NASHCO" style={{ height: 50, width: "auto", objectFit: "contain", borderRadius: 8, background: "#fff", padding: "4px 10px" }} onError={e => e.target.style.display = "none"} />
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.9, maxWidth: 280, marginBottom: 0 }}>{t.footer_desc}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_nav}</h4>
              {t.nav.map((n, i) => (
                <button key={i} onClick={() => scrollTo(["home", "about", "services", "catalogue", "contact"][i])} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", padding: "6px 0", transition: "color .2s", fontFamily: "inherit", width: "100%", textAlign: t.dir === "rtl" ? "right" : "left" }} onMouseEnter={e => e.currentTarget.style.color = "#CFA030"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
                  <span style={{ color: "#CFA030", fontSize: 8 }}>▶</span>{n}
                </button>
              ))}
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_svc}</h4>
              {t.svcs.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", fontSize: 13, padding: "6px 0" }}>
                  <span style={{ color: "#CFA030", fontSize: 8 }}>▶</span>{s}
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_contact}</h4>
              {[
                { label: t.footer_addr_label, val: t.footer_addr, icon: "📍" },
                { label: t.footer_phone_label, val: t.footer_phone, icon: "📞" },
                { label: t.footer_email_label, val: t.footer_email_val, icon: "✉️" },
                { label: t.footer_hours_label, val: t.footer_hours, icon: "🕐" },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 11 }}>{icon}</span>{label}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#CFA030", marginBottom: 20, borderBottom: "1px solid rgba(207,160,48,.2)", paddingBottom: 10 }}>{t.footer_newsletter}</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.75, marginBottom: 18 }}>{t.footer_newsletter_p}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder={t.footer_newsletter_ph} style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} onFocus={e => e.target.style.borderColor = "#CFA030"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.12)"} />
                <button style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#CFA030", color: "#0D1F3C", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "background .2s", letterSpacing: ".04em" }} onMouseEnter={e => e.currentTarget.style.background = "#e6b832"} onMouseLeave={e => e.currentTarget.style.background = "#CFA030"}>{t.footer_newsletter_btn}</button>
              </div>
            </div>
          </div>

          {/* ROW 2: Social Icons */}
          <div style={{ padding: "2rem 0", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", letterSpacing: ".04em" }}>EPE NASHCO SPA — Filiale du Groupe G.A.T.MA</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { ic: "in", label: "LinkedIn" },
                { ic: "f", label: "Facebook" },
                { ic: "tw", label: "Twitter" },
                { ic: "yt", label: "YouTube" },
              ].map(({ ic, label }) => (
                <button key={ic} title={label} className="social-btn" style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 11, fontWeight: 800, transition: "all .25s" }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* ROW 3: Bottom bar */}
          <div style={{ padding: "1.5rem 0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.22)" }}>{t.footer_copy}</p>
            <div style={{ display: "flex", gap: 20 }}>
              {t.footer_legal.map(l => (
                <button key={l} style={{ background: "none", border: "none", color: "rgba(255,255,255,.22)", fontSize: 12, cursor: "pointer", transition: "color .2s", fontFamily: "inherit" }} onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.22)"}>{l}</button>
              ))}
            </div>
          </div>

        </div>
      </footer>

      {modal && <Modal c={modal} onClose={() => setModal(null)} />}
    </div>
  );
}