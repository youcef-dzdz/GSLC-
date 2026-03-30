import { useState, useEffect, useRef } from "react";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  FR: {
    dir: "ltr",
    nav: ["Accueil", "Services", "Conteneurs", "Contact"],
    login: "Connexion",
    register: "S'inscrire",
    heroTitle: "NASHCO : Votre Partenaire Maritime & Logistique en Algérie",
    heroSub:
      "Filiale du Groupe de Transport Maritime G.A.T.MA, NASHCO Spa accompagne les armateurs et opérateurs économiques depuis 1991 à travers l'ensemble des ports commerciaux algériens.",
    heroCta: "Découvrir nos services",
    heroDemo: "Nous contacter",
    dashPort: "Au port",
    dashWarehouse: "En attente",
    dashClient: "Opérations",
    dashLate: "Urgents",
    servicesTitle: "Nos Services",
    servicesSub: "Des solutions maritimes et logistiques intégrées sur mesure",
    services: [
      {
        title: "Consignation Maritime",
        desc: "Prise en charge complète des navires (Lignes régulières, Tramping et Car-ferries).",
      },
      {
        title: "Logistique & Conteneurs",
        desc: "Gestion, stockage de conteneurs vides, réparation, nettoyage et manutention.",
      },
      {
        title: "Transit & Douane",
        desc: "Expertise maritime, courtage et accomplissement de toutes les formalités douanières.",
      },
      {
        title: "Approvisionnement",
        desc: "Fourniture de vivres, soutes (Bunkering) et assistance technique complète aux navires.",
      },
    ],
    statsTitle: "NASHCO en chiffres",
    stats: [
      { value: 35, suffix: "+", label: "Années d'expérience", icon: "⚓" },
      { value: 236, suffix: "M", label: "Capital social (DZD)", icon: "💰" },
      { value: 10, suffix: "+", label: "Ports couverts", icon: "🏢" },
      { value: 3, suffix: "", label: "Succursales régionales", icon: "🗺️" },
    ],
    containersTitle: "Gestion des Conteneurs",
    containersSub:
      "Solutions d'entreposage et logistique adaptées à tous types de conteneurs",
    testTitle: "Pourquoi nous choisir ?",
    testimonials: [
      {
        initials: "NA",
        company: "Siège Social",
        city: "Alger",
        rating: 5,
        quote:
          "Une présence historique sur le marché algérien garantissant une fluidité maximale pour vos escales et vos opérations de transit.",
      },
      {
        initials: "SU",
        company: "Succursales",
        city: "Est & Ouest",
        rating: 5,
        quote:
          "Couverture totale de tous les ports commerciaux d'Algérie : Oran, Annaba, Béjaïa, Skikda, Mostaganem, Ghazaouet, Arzew, Tenes et Djen Djen.",
      },
      {
        initials: "EX",
        company: "Expertise",
        city: "Algérie",
        rating: 4,
        quote:
          "Un personnel hautement qualifié disponible 24h/24 pour répondre aux exigences techniques et logistiques les plus complexes.",
      },
    ],
    contactTitle: "Contactez-nous",
    contactSub: "Nos équipes locales sont à votre disposition",
    formName: "Votre nom complet",
    formCompany: "Nom de votre entreprise",
    formSubject: "Objet de votre message",
    formMessage: "Votre message...",
    formSend: "Envoyer le message",
    footerDesc:
      "Entreprise Publique Économique (EPE) NASHCO Spa - Filiale du Groupe G.A.T.MA.",
    footerNav: "Navigation",
    footerPorts: "Ports couverts",
    footerLegal: "Légal",
    ports: ["Alger", "Oran", "Annaba", "Béjaïa", "Mostaganem"],
    legal: ["Mentions Légales", "Politique de confidentialité", "CGU"],
    copyright: "© 2026 EPE NASHCO Spa — Tous droits réservés",
  },
  EN: {
    dir: "ltr",
    nav: ["Home", "Services", "Containers", "Contact"],
    login: "Login",
    register: "Contact Us",
    heroTitle: "NASHCO: Your Maritime & Logistics Partner in Algeria",
    heroSub:
      "As a subsidiary of the G.A.T.MA Maritime Transport Group, NASHCO Spa has been supporting shipowners and economic operators since 1991 across all Algerian commercial ports.",
    heroCta: "Our Services",
    heroDemo: "Contact Us",
    dashPort: "At Port",
    dashWarehouse: "Pending",
    dashClient: "Operations",
    dashLate: "Urgent",
    servicesTitle: "Our Services",
    servicesSub: "Tailor-made integrated maritime and logistics solutions",
    services: [
      {
        title: "Maritime Agency",
        desc: "Full management of vessel calls (Liners, Tramping, and Car-ferries).",
      },
      {
        title: "Logistics & Containers",
        desc: "Management, empty container storage, repair, cleaning, and handling.",
      },
      {
        title: "Transit & Customs",
        desc: "Maritime expertise, brokerage, and completion of all customs formalities.",
      },
      {
        title: "Ship Supply",
        desc: "Provision of food, bunkering, and complete technical assistance to vessels.",
      },
    ],
    statsTitle: "NASHCO by the numbers",
    stats: [
      { value: 35, suffix: "+", label: "Years of experience", icon: "⚓" },
      { value: 236, suffix: "M", label: "Share Capital (DZD)", icon: "💰" },
      { value: 10, suffix: "+", label: "Covered ports", icon: "🏢" },
      { value: 3, suffix: "", label: "Regional branches", icon: "🗺️" },
    ],
    containersTitle: "Container Management",
    containersSub: "Warehousing and logistics solutions for all container types",
    testTitle: "Why Choose Us?",
    testimonials: [
      {
        initials: "HQ",
        company: "Headquarters",
        city: "Algiers",
        rating: 5,
        quote:
          "A historical presence in the Algerian market guaranteeing maximum fluidity for your port calls and transit operations.",
      },
      {
        initials: "BR",
        company: "Branches",
        city: "East & West",
        rating: 5,
        quote:
          "Total coverage of all commercial ports in Algeria: Oran, Annaba, Béjaïa, Skikda, Mostaganem, Ghazaouet, Arzew, Tenes, and Djen Djen.",
      },
      {
        initials: "EX",
        company: "Expertise",
        city: "Algeria",
        rating: 4,
        quote:
          "Highly qualified staff available 24/7 to meet the most complex technical and logistical requirements.",
      },
    ],
    contactTitle: "Contact Us",
    contactSub: "Our local teams are at your disposal",
    formName: "Your full name",
    formCompany: "Company name",
    formSubject: "Message subject",
    formMessage: "Your message...",
    formSend: "Send Message",
    footerDesc: "EPE NASHCO Spa - Subsidiary of the G.A.T.MA Group.",
    footerNav: "Navigation",
    footerPorts: "Covered Ports",
    footerLegal: "Legal",
    ports: ["Algiers", "Oran", "Annaba", "Béjaïa", "Mostaganem"],
    legal: ["Legal Notice", "Privacy Policy", "Terms of Use"],
    copyright: "© 2026 EPE NASHCO Spa — All rights reserved",
  },
  AR: {
    dir: "rtl",
    nav: ["الرئيسية", "الخدمات", "الحاويات", "اتصل بنا"],
    login: "دخول",
    register: "اتصل بنا",
    heroTitle: "ناشكو: شريككم البحري واللوجستي في الجزائر",
    heroSub:
      "بصفتها فرعاً لمجمع النقل البحري G.A.T.MA، ترافق شركة ناشكو (NASHCO Spa) مجهزي السفن والمتعاملين الاقتصاديين منذ سنة 1991 عبر كافة الموانئ التجارية الجزائرية.",
    heroCta: "خدماتنا",
    heroDemo: "اتصل بنا",
    dashPort: "بالميناء",
    dashWarehouse: "في الانتظار",
    dashClient: "عمليات",
    dashLate: "مستعجل",
    servicesTitle: "خدماتنا",
    servicesSub: "حلول بحرية ولوجستية متكاملة ومصممة خصيصاً لتلبية احتياجاتكم",
    services: [
      { title: "الضبط البحري", desc: "تكليف وتسيير كامل للسفن (الخطوط المنتظمة، والترامبينغ، والعبارات)." },
      { title: "اللوجستيات والحاويات", desc: "تسيير، تخزين الحاويات الفارغة، إصلاح وتنظيف ومناولة." },
      { title: "الترانزيت والجمارك", desc: "الخبرة البحرية، والوساطة، وإتمام جميع الإجراءات الجمركية بسلاسة." },
      { title: "الإمداد والتزود", desc: "توفير المؤن الغذائية، وقود السفن (Bunkering)، والمساعدة التقنية." },
    ],
    statsTitle: "ناشكو بالأرقام",
    stats: [
      { value: 35, suffix: "+", label: "سنة من الخبرة", icon: "⚓" },
      { value: 236, suffix: "مليون", label: "رأس المال الاجتماعي (دج)", icon: "💰" },
      { value: 10, suffix: "+", label: "موانئ مغطاة", icon: "🏢" },
      { value: 3, suffix: "", label: "فروع جهوية", icon: "🗺️" },
    ],
    containersTitle: "تسيير الحاويات",
    containersSub: "حلول تخزين ولوجستيات مناسبة لجميع أنواع وأحجام الحاويات",
    testTitle: "لماذا تختارنا ؟",
    testimonials: [
      { initials: "HQ", company: "المقر الرئيسي", city: "الجزائر", rating: 5, quote: "حضور تاريخي في السوق الجزائرية يضمن أقصى درجات السلاسة لرسو سفنكم وعمليات العبور الخاصة بكم." },
      { initials: "BR", company: "الفروع", city: "الشرق والغرب", rating: 5, quote: "تغطية شاملة لجميع الموانئ التجارية في الجزائر: وهران، عنابة، بجاية، سكيكدة، مستغانم، الغزوات، أرزيو، تنس، وجن جن." },
      { initials: "EX", company: "الخبرة", city: "الجزائر", rating: 4, quote: "طاقم عمل مؤهل تأهيلاً عالياً ومتوفر على مدار الساعة لتلبية المتطلبات التقنية واللوجستية الأكثر تعقيداً." },
    ],
    contactTitle: "اتصل بنا",
    contactSub: "فرقنا المحلية رهن إشارتكم",
    formName: "اسمكم الكامل",
    formCompany: "اسم شركتكم",
    formSubject: "موضوع الرسالة",
    formMessage: "رسالتكم...",
    formSend: "إرسال الرسالة",
    footerDesc: "الشركة الوطنية المصلحة للخدمات اللوجستية والتسويق البحري (EPE NASHCO Spa) - فرع مجمع G.A.T.MA.",
    footerNav: "التنقل",
    footerPorts: "الموانئ المغطاة",
    footerLegal: "قانوني",
    ports: ["الجزائر", "وهران", "عنابة", "بجاية", "مستغانم"],
    legal: ["إشعار قانوني", "سياسة الخصوصية", "شروط الاستخدام"],
    copyright: "© 2026 EPE NASHCO Spa — جميع الحقوق محفوظة",
  },
};

// ─── Container data ────────────────────────────────────────────────────────────
const CONTAINERS = [
  { id: "20dc", type: "20' Dry (DC)", dims: "5,9m × 2,35m × 2,39m", tare: "2 200 kg", volume: "33,2 m³", payload: "28 000 kg", desc: "Conteneur standard idéal pour marchandises sèches générales.", image: "https://images.unsplash.com/photo-1586528116311-ad8be3619883?auto=format&fit=crop&w=600&q=80" },
  { id: "40dc", type: "40' Dry (DC)", dims: "12,03m × 2,35m × 2,39m", tare: "3 750 kg", volume: "67,7 m³", payload: "28 800 kg", desc: "Double volume du 20', parfait pour les grands lots.", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80" },
  { id: "40hc", type: "40' High Cube (HC)", dims: "12,03m × 2,35m × 2,69m", tare: "3 900 kg", volume: "76,4 m³", payload: "28 600 kg", desc: "Haute capacité — 30 cm supplémentaires en hauteur.", image: "https://images.unsplash.com/photo-1611245558489-02690f307fc8?auto=format&fit=crop&w=600&q=80", badge: "Haute capacité", badgeColor: "#0B6B5C" },
  { id: "rf", type: "Reefer (RF)", dims: "11,59m × 2,29m × 2,25m", tare: "3 080 kg", volume: "59,8 m³", payload: "27 700 kg", desc: "Conteneur réfrigéré pour produits alimentaires et pharmaceutiques.", image: "https://images.unsplash.com/photo-1590496793907-4bfbc6300053?auto=format&fit=crop&w=600&q=80", badge: "Réfrigéré −25°C / +25°C", badgeColor: "#185FA5" },
  { id: "ot", type: "Open Top (OT)", dims: "5,9m × 2,35m × 2,35m", tare: "2 350 kg", volume: "32,6 m³", payload: "28 130 kg", desc: "Toit ouvert pour chargement en hauteur — grandes marchandises.", image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=600&q=80", badge: "Toit ouvert", badgeColor: "#BA7517" },
  { id: "fr", type: "Flat Rack (FR)", dims: "12,13m × 2,40m × 2,00m", tare: "5 000 kg", volume: "Variable", payload: "40 000 kg", desc: "Hors gabarit — machines industrielles, véhicules, équipements lourds.", image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=600&q=80", badge: "Hors gabarit", badgeColor: "#E24B4A" },
];

// ─── Ticker data ───────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "⚓ NASHCO - Entreprise Publique Économique filiale du groupe G.A.T.MA",
  "🏢 Couverture complète de l'ensemble des ports commerciaux algériens",
  "📞 Service Assistance aux Armateurs disponible 24h/24 et 7j/7",
  "📍 Siège Social : 02 Rue de Bejaia, Port d'Alger, Algérie",
  "🛳️ Consignation des lignes régulières, Tramping et Car-ferries",
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function useIntersection(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRating({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#CFA030" : "#334155", fontSize: 14 }}>★</span>
      ))}
    </div>
  );
}

function ContainerModal({ c, onClose, lang }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  const t = T[lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl p-8 w-full max-w-md relative animate-fadeIn" style={{ background: "#0D1F3C", border: "1px solid rgba(207,160,48,0.3)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors" style={{ fontSize: 18 }}>✕</button>
        <div style={{ width: "100%", height: 180, borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
          <img src={c.image} alt={c.type} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{c.type}</h3>
        {c.badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4" style={{ background: c.badgeColor }}>
            {c.badge}
          </span>
        )}
        <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>{c.desc}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Dimensions", c.dims],
            ["Tare", c.tare],
            ["Volume", c.volume],
            ["Charge utile", c.payload],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-xs mb-1" style={{ color: "#CFA030" }}>{k}</div>
              <div className="text-sm font-semibold text-white">{v}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90" style={{ background: "#CFA030", color: "#0D1F3C" }}>
          {t.register}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState("FR");
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [dashValues, setDashValues] = useState({ port: 12, warehouse: 5, client: 45, late: 2 });
  const [formState, setFormState] = useState({ name: "", company: "", subject: "", message: "", sending: false, sent: false, error: "" });
  const [formErrors, setFormErrors] = useState({});

  const statsRef = useRef(null);
  const statsVisible = useIntersection(statsRef);

  const t = T[lang];

  // Scroll detection
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Testimonial auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % t.testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [t.testimonials.length]);

  // Dashboard live simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setDashValues(v => ({
        port: Math.max(5, v.port + Math.floor(Math.random() * 3 - 1)),
        warehouse: Math.max(1, v.warehouse + Math.floor(Math.random() * 3 - 1)),
        client: Math.max(10, v.client + Math.floor(Math.random() * 3 - 1)),
        late: Math.max(0, v.late + Math.floor(Math.random() * 2 - 1)),
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const validateForm = () => {
    const errs = {};
    if (!formState.name.trim()) errs.name = "Champ obligatoire";
    if (!formState.subject.trim()) errs.subject = "Champ obligatoire";
    if (!formState.message.trim() || formState.message.length < 20) errs.message = "Minimum 20 caractères";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;
    setFormState(s => ({ ...s, sending: true, error: "" }));
    await new Promise(r => setTimeout(r, 1500));
    setFormState(s => ({ ...s, sending: false, sent: true }));
    setTimeout(() => setFormState(s => ({ ...s, sent: false, name: "", subject: "", message: "", company: "" })), 4000);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div dir={t.dir} style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", background: "#F4F6F9", color: "#1e293b", overflowX: "hidden" }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Playfair Display', serif; }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .live-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(13,31,60,0.18) !important; }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-secondary { transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.08) !important; }
        input, textarea { outline: none; }
        input:focus, textarea:focus { box-shadow: 0 0 0 2px #1A4A8C !important; }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-animate { animation: countUp 0.6s ease-out forwards; }
      `}</style>

      {/* ════════════════════════════════════════════════════
          SECTION 1 — NAVBAR
      ════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(13,31,60,0.92)" : "#0D1F3C",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(207,160,48,0.2)" : "none",
          transition: "all 0.3s ease",
          padding: "0 2rem",
          height: 68,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <button onClick={() => scrollTo("hero")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#CFA030", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#0D1F3C" }}>N</div>
          <span className="display-font" style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>NASHCO <span style={{ color: "#CFA030" }}>SPA</span></span>
        </button>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {t.nav.map((item, i) => {
            const ids = ["hero", "services", "containers", "contact"];
            return (
              <button key={i} onClick={() => scrollTo(ids[i])} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#CFA030")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
              >{item}</button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Lang switcher */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "3px 4px" }}>
            {["FR", "AR", "EN"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: lang === l ? "#CFA030" : "transparent",
                color: lang === l ? "#0D1F3C" : "rgba(255,255,255,0.7)",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>
          <button className="btn-secondary" onClick={() => scrollTo("contact")} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {t.login}
          </button>
          <button className="btn-primary" onClick={() => scrollTo("contact")} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#CFA030", color: "#0D1F3C", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {t.register}
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          SECTION 2 — TICKER
      ════════════════════════════════════════════════════ */}
      <div style={{ background: "#E24B4A", overflow: "hidden", whiteSpace: "nowrap", height: 36, display: "flex", alignItems: "center", marginTop: 68 }}>
        <div className="ticker-track" style={{ display: "inline-flex", gap: "4rem" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ color: "#fff", fontSize: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {item}
              <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 24 }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          SECTION 3 — HERO
      ════════════════════════════════════════════════════ */}
      <section id="hero" style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #1A4A8C 60%, #0D1F3C 100%)", minHeight: "88vh", display: "flex", alignItems: "center", padding: "4rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(207,160,48,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -150, left: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(26,74,140,0.3)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          {/* Left */}
          <div style={{ animation: "fadeIn 0.8s ease-out" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(207,160,48,0.15)", borderRadius: 20, padding: "6px 14px", marginBottom: "1.5rem" }}>
              <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#CFA030", display: "inline-block" }} />
              <span style={{ color: "#CFA030", fontSize: 12, fontWeight: 600 }}>EPE NASHCO SPA</span>
            </div>
            <h1 className="display-font" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1.5rem" }}>
              {t.heroTitle}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 480 }}>
              {t.heroSub}
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <button className="btn-primary" onClick={() => scrollTo("services")} style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "#CFA030", color: "#0D1F3C", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {t.heroCta}
              </button>
              <button className="btn-secondary" onClick={() => scrollTo("contact")} style={{ padding: "14px 28px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
                {t.heroDemo}
              </button>
            </div>
          </div>

          {/* Right — Live Operations Visual */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "2rem", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Surveillance Flotte</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#0B6B5C", display: "inline-block" }} />
                <span style={{ color: "#0B6B5C", fontSize: 11, fontWeight: 600 }}>EN DIRECT</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: t.dashPort, value: dashValues.port, color: "#1A4A8C", icon: "🚢" },
                { label: t.dashWarehouse, value: dashValues.warehouse, color: "#BA7517", icon: "⏱️" },
                { label: t.dashClient, value: dashValues.client, color: "#0B6B5C", icon: "⚙️" },
                { label: t.dashLate, value: dashValues.late, color: "#E24B4A", icon: "⚠️" },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.25rem", border: `1px solid ${item.color}40` }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(207,160,48,0.1)", borderRadius: 10, border: "1px solid rgba(207,160,48,0.2)" }}>
              <span style={{ color: "#CFA030", fontSize: 12 }}>🔄 Mises à jour du réseau portuaire national.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 4 — SERVICES
      ════════════════════════════════════════════════════ */}
      <section id="services" style={{ padding: "6rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 20, background: "rgba(13,31,60,0.08)", color: "#0D1F3C", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
              LOGISTIQUE ET MARITIME
            </div>
            <h2 className="display-font" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#0D1F3C", marginBottom: 12 }}>{t.servicesTitle}</h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>{t.servicesSub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              "https://images.unsplash.com/photo-1570126688035-1e6adbd61053?auto=format&fit=crop&w=600&q=80", // Consignation
              "https://images.unsplash.com/photo-1586528116311-ad8be3619883?auto=format&fit=crop&w=600&q=80", // Logistique
              "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80", // Douane
              "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"  // Approvisionnement
            ].map((imgUrl, i) => (
              <div key={i} className="card-hover" style={{ background: "#F4F6F9", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", cursor: "default" }}>
                <div style={{ width: "100%", height: 160, overflow: "hidden" }}>
                  <img src={imgUrl} alt={t.services[i].title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} 
                       onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                       onMouseLeave={e => e.target.style.transform = "scale(1)"}/>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D1F3C", marginBottom: 8 }}>{t.services[i].title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{t.services[i].desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 5 — STATS
      ════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ padding: "5rem 2rem", background: "#0D1F3C" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="display-font" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#fff" }}>{t.statsTitle}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {t.stats.map((s, i) => {
              const count = useCountUp(s.value, statsVisible);
              return (
                <div key={i} className={statsVisible ? "stat-animate" : ""} style={{ textAlign: "center", animationDelay: `${i * 0.15}s`, opacity: statsVisible ? 1 : 0 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: "#CFA030", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    {count.toLocaleString()}{s.suffix}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 6 — CONTAINERS
      ════════════════════════════════════════════════════ */}
      <section id="containers" style={{ padding: "6rem 2rem", background: "#F4F6F9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="display-font" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#0D1F3C", marginBottom: 10 }}>{t.containersTitle}</h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>{t.containersSub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {CONTAINERS.map((c) => (
              <button key={c.id} className="card-hover" onClick={() => setSelectedContainer(c)} style={{
                background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0",
                textAlign: "left", cursor: "pointer", width: "100%",
                boxShadow: "0 2px 8px rgba(13,31,60,0.06)",
              }}>
                <div style={{ width: "100%", height: 180, position: "relative" }}>
                  <img src={c.image} alt={c.type} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {c.badge && (
                    <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 600, color: "#fff", background: c.badgeColor, padding: "4px 12px", borderRadius: 20 }}>
                      {c.badge}
                    </span>
                  )}
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D1F3C", marginBottom: 6 }}>{c.type}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>{c.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#1A4A8C", background: "#EFF6FF", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>📐 {c.dims}</span>
                    <span style={{ fontSize: 11, color: "#0B6B5C", background: "#ECFDF5", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>📦 {c.volume}</span>
                  </div>
                  <div style={{ marginTop: 14, color: "#1A4A8C", fontSize: 13, fontWeight: 600 }}>Voir les détails →</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 7 — TESTIMONIALS (Why Choose Us)
      ════════════════════════════════════════════════════ */}
      <section style={{ padding: "6rem 2rem", background: "#0D1F3C" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="display-font" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#fff" }}>{t.testTitle}</h2>
          </div>
          <div style={{ position: "relative" }}>
            {t.testimonials.map((t2, i) => (
              <div key={i} style={{
                display: i === activeTestimonial ? "block" : "none",
                background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "2.5rem",
                border: "1px solid rgba(207,160,48,0.2)",
                animation: "fadeIn 0.5s ease-out",
              }}>
                <div style={{ fontSize: 40, color: "#CFA030", marginBottom: 16, lineHeight: 1 }}>"</div>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.8, marginBottom: "1.5rem" }}>
                  {t2.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#CFA030", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0D1F3C", fontSize: 16 }}>
                    {t2.initials}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{t2.company}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{t2.city}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <StarRating n={t2.rating} />
                  </div>
                </div>
              </div>
            ))}

            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: "2rem" }}>
              <button onClick={() => setActiveTestimonial(p => (p - 1 + t.testimonials.length) % t.testimonials.length)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 16 }}>←</button>
              {t.testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                  width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: 4, border: "none",
                  background: i === activeTestimonial ? "#CFA030" : "rgba(255,255,255,0.3)",
                  cursor: "pointer", transition: "all 0.3s",
                }} />
              ))}
              <button onClick={() => setActiveTestimonial(p => (p + 1) % t.testimonials.length)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 16 }}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 8 — CONTACT
      ════════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: "6rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="display-font" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#0D1F3C", marginBottom: 10 }}>{t.contactTitle}</h2>
            <p style={{ color: "#64748b" }}>{t.contactSub}</p>
          </div>

          {formState.sent && (
            <div style={{ background: "#ECFDF5", border: "1px solid #0B6B5C", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "#0B6B5C", fontWeight: 500, textAlign: "center" }}>
              ✅ Message envoyé avec succès — Nos services vous répondront dans les plus brefs délais.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Name */}
            <div>
              <input value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                placeholder={t.formName}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${formErrors.name ? "#E24B4A" : "#e2e8f0"}`, fontSize: 14, color: "#1e293b", background: "#F4F6F9" }}
              />
              {formErrors.name && <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 4 }}>{formErrors.name}</p>}
            </div>
            {/* Company */}
            <div>
              <input value={formState.company} onChange={e => setFormState(s => ({ ...s, company: e.target.value }))}
                placeholder={t.formCompany}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", background: "#F4F6F9" }}
              />
            </div>
            {/* Subject */}
            <div style={{ gridColumn: "1 / -1" }}>
              <input value={formState.subject} onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
                placeholder={t.formSubject}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${formErrors.subject ? "#E24B4A" : "#e2e8f0"}`, fontSize: 14, color: "#1e293b", background: "#F4F6F9" }}
              />
              {formErrors.subject && <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 4 }}>{formErrors.subject}</p>}
            </div>
            {/* Message */}
            <div style={{ gridColumn: "1 / -1" }}>
              <textarea value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                rows={5} placeholder={t.formMessage}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${formErrors.message ? "#E24B4A" : "#e2e8f0"}`, fontSize: 14, color: "#1e293b", background: "#F4F6F9", resize: "vertical" }}
              />
              {formErrors.message && <p style={{ color: "#E24B4A", fontSize: 12, marginTop: 4 }}>{formErrors.message}</p>}
            </div>
            {/* Submit */}
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn-primary" onClick={handleSend} disabled={formState.sending}
                style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: formState.sending ? "#94a3b8" : "#0D1F3C", color: "#fff", fontSize: 15, fontWeight: 600, cursor: formState.sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                {formState.sending ? (
                  <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ticker 0.8s linear infinite" }} /> Envoi...</>
                ) : t.formSend}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SECTION 9 — FOOTER
      ════════════════════════════════════════════════════ */}
      <footer style={{ background: "#0D1F3C", padding: "4rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#CFA030", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#0D1F3C" }}>N</div>
                <span className="display-font" style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>NASHCO <span style={{ color: "#CFA030" }}>SPA</span></span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>{t.footerDesc}</p>
              <div style={{ display: "flex", gap: 12 }}>
                {["in", "f"].map((icon) => (
                  <button key={icon} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#CFA030"; e.currentTarget.style.color = "#0D1F3C"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ color: "#CFA030", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 20, textTransform: "uppercase" }}>{t.footerNav}</h4>
              {t.nav.map((item, i) => {
                const ids = ["hero", "services", "containers", "contact"];
                return (
                  <button key={i} onClick={() => scrollTo(ids[i])} style={{ display: "block", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", padding: "5px 0", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  >{item}</button>
                );
              })}
            </div>

            {/* Ports */}
            <div>
              <h4 style={{ color: "#CFA030", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 20, textTransform: "uppercase" }}>{t.footerPorts}</h4>
              {t.ports.map((p) => (
                <div key={p} style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, padding: "5px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#CFA030", fontSize: 10 }}>⚓</span> {p}
                </div>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ color: "#CFA030", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 20, textTransform: "uppercase" }}>{t.footerLegal}</h4>
              {t.legal.map((l) => (
                <button key={l} style={{ display: "block", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", padding: "5px 0", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >{l}</button>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t.copyright}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Ports Commerciaux d'Algérie</span>
          </div>
        </div>
      </footer>

      {/* ── Container Modal ── */}
      {selectedContainer && (
        <ContainerModal c={selectedContainer} onClose={() => setSelectedContainer(null)} lang={lang} />
      )}
    </div>
  );
}