import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — DONNÉES EXHAUSTIVES DU RESTAURANT
// ─────────────────────────────────────────────────────────────────
const restaurantData = {
  nom: "Taj Mahal Lorient",
  tel: "+33297000000",           // ← À remplacer par le vrai numéro
  adresse: "12 Rue de la Paix, 56100 Lorient", // ← À remplacer
  histoire: [
    {
      titre: "Le secret du Tandoor",
      texte: "Notre four traditionnel en terre cuite monte à 400°C pour une saveur fumée incomparable.",
      emoji: "🔥",
    },
    {
      titre: "L'Art des Épices",
      texte: "Nous torréfions et composons nos propres Masalas chaque matin.",
      emoji: "🌿",
    },
    {
      titre: "Ancrage Lorientais",
      texte: "Le goût authentique du Pendjab au cœur du Morbihan.",
      emoji: "⚓",
    },
  ],
  menu: {
    "Entrées": [
      { nom: "Samosa Sabzi",           prix: 6.00,  desc: "Chaussons aux légumes du Pendjab.", veggie: true },
      { nom: "Pakora Mixte",           prix: 6.00,  desc: "Beignets de légumes à la farine de pois chiches.", veggie: true },
      { nom: "Oignon Bhaji",           prix: 6.00,  desc: "Beignets d'oignons croustillants.", veggie: true },
      { nom: "Samosa Keema",           prix: 7.00,  desc: "Chaussons à la viande hachée frite." },
      { nom: "Crevettes Pakora",       prix: 9.00,  desc: "Beignets de crevettes frits." },
      { nom: "Crevettes Raita",        prix: 6.00,  desc: "Crevettes, concombres, yaourt et épices." },
      { nom: "Crevettes Indiennes",    prix: 8.00,  desc: "Marinées sauce mangue sucrée-épicée." },
      { nom: "Chicken Pakora",         prix: 7.50,  desc: "Beignets de poulet à la farine de pois chiches." },
      { nom: "Mix Végétarien (2 pers)",prix: 11.50, desc: "Oignon Bhaji, Pakora, Samosa Sabzi.", veggie: true, badge: "Pour 2" },
    ],
    "Tandoori": [
      { nom: "Poulet Tikka",       prix: 9.00,  desc: "Poulet désossé mariné et grillé.", badge: "⭐ Incontournable" },
      { nom: "Agneau Kebab",       prix: 8.00,  desc: "Agneau haché en brochette aux fines herbes." },
      { nom: "Poisson Tikka",      prix: 11.50, desc: "Filets de saumon grillés au tandoor." },
      { nom: "Gambas Tandoori",    prix: 17.00, desc: "Gambas marinées aux aromates." },
      { nom: "Mix Grill (2 pers)", prix: 19.50, desc: "Poulet Tikka, Crevette Pakora, Agneau Kebab et Poisson Tikka.", badge: "Pour 2" },
    ],
    "Poulet": [
      { nom: "Poulet Curry",        prix: 12.50, desc: "Spécialité du Pendjab. Servi avec riz basmati." },
      { nom: "Poulet Vindaloo",     prix: 13.00, desc: "Sauce épicée et pommes de terre. Servi avec riz.", spicy: true },
      { nom: "Poulet Shahi Korma",  prix: 14.00, desc: "Sauce noix de cajou, raisins et crème. Servi avec riz." },
      { nom: "Poulet Madras",       prix: 13.50, desc: "Sauce très relevée au piment Madras. Servi avec riz.", spicy: true },
      { nom: "Poulet Tikka Masala", prix: 14.00, desc: "Grillé avec poivrons, tomates, oignons. Servi avec riz.", badge: "⭐ Best-seller" },
      { nom: "Butter Chicken",      prix: 14.00, desc: "Sauce onctueuse crème et beurre. Servi avec riz.", badge: "⭐ Best-seller" },
      { nom: "Poulet Palak",        prix: 14.00, desc: "Curry de poulet aux épinards. Servi avec riz." },
      { nom: "Poulet Jalfrezi",     prix: 14.50, desc: "Grillé avec oignons, poivrons et œuf. Servi avec riz." },
      { nom: "Poulet Dal",          prix: 14.00, desc: "Mijoté aux lentilles indiennes. Servi avec riz." },
      { nom: "Poulet Aubergine",    prix: 14.00, desc: "Curry aux aubergines et riz basmati." },
    ],
    "Agneau": [
      { nom: "Agneau Shahi Korma",  prix: 15.00, desc: "Noix de cajou, crème et raisins. Servi avec riz." },
      { nom: "Agneau Aubergine",    prix: 15.00, desc: "Agneau et aubergines fondues. Servi avec riz." },
      { nom: "Agneau Palak",        prix: 15.00, desc: "Agneau et épinards frais. Servi avec riz." },
      { nom: "Agneau Dal",          prix: 15.00, desc: "Cuisiné aux lentilles au curry. Servi avec riz." },
      { nom: "Agneau Curry",        prix: 14.00, desc: "Gigot en sauce traditionnelle. Servi avec riz." },
      { nom: "Agneau Tikka Masala", prix: 16.00, desc: "Grillé, sauce tomates et poivrons. Servi avec riz." },
      { nom: "Agneau Vindaloo",     prix: 15.00, desc: "Sauce épicée et pommes de terre. Servi avec riz.", spicy: true },
      { nom: "Agneau Butter",       prix: 16.00, desc: "Sauce crème et beurre. Servi avec riz." },
      { nom: "Achar Gosht",         prix: 15.00, desc: "Sauce curry aux pickles indiens. Servi avec riz." },
    ],
    "Boeuf": [
      { nom: "Boeuf au Curry",  prix: 13.00, desc: "Spécialité du Pendjab. Servi avec riz basmati." },
      { nom: "Boeuf Madras",    prix: 14.00, desc: "Sauce très relevée au piment Madras. Servi avec riz.", spicy: true },
      { nom: "Boeuf Masala",    prix: 15.00, desc: "Oignons, tomates, poivrons. Servi avec riz." },
      { nom: "Köfta Curry",     prix: 14.00, desc: "Boulettes de bœuf en sauce curry. Servi avec riz." },
      { nom: "Köfta Vindaloo",  prix: 14.50, desc: "Boulettes, sauce épicée, pommes de terre. Servi avec riz.", spicy: true },
      { nom: "Köfta Fromage",   prix: 15.00, desc: "Boulettes sauce curry et fromage. Servi avec riz." },
      { nom: "Allo Keema",      prix: 13.00, desc: "Viande hachée et pommes de terre. Servi avec riz." },
    ],
    "Poissons & Crevettes": [
      { nom: "Poisson Curry",         prix: 14.00, desc: "Saumon sauce gingembre et ail. Servi avec riz." },
      { nom: "Poisson Korma",         prix: 15.00, desc: "Saumon sauce noix de cajou et crème. Servi avec riz." },
      { nom: "Poisson Masala",        prix: 15.00, desc: "Saumon, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Crevettes Curry",       prix: 14.50, desc: "Crevettes décortiquées au curry. Servi avec riz." },
      { nom: "Crevettes Shahi Korma", prix: 14.50, desc: "Sauce douce amandes et cajou. Servi avec riz." },
      { nom: "Crevettes Masala",      prix: 14.50, desc: "Crevettes, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Gambas au Curry",       prix: 16.00, desc: "Gambas légèrement épicées. Servi avec riz." },
      { nom: "Gambas Shahi Korma",    prix: 16.50, desc: "Crème, cajou et raisins secs. Servi avec riz." },
      { nom: "Gambas Masala",         prix: 17.00, desc: "Gambas aux poivrons et piments verts. Servi avec riz.", spicy: true },
    ],
    "Biryanis": [
      { nom: "Biryani Poulet",   prix: 14.00, desc: "Poulet, riz, petits pois, raisins, 25 épices." },
      { nom: "Biryani Agneau",   prix: 16.00, desc: "Agneau, riz, raisins, 25 épices." },
      { nom: "Biryani Crevettes",prix: 16.00, desc: "Crevettes et riz aux 25 épices." },
      { nom: "Biryani Légumes",  prix: 13.00, desc: "Légumes variés mijotés au riz épicé.", veggie: true },
      { nom: "Biryani Mixte",    prix: 17.00, desc: "Poulet, Agneau, Gambas et coriandre fraîche.", badge: "⭐ Chef" },
      { nom: "Biryani Tikka",    prix: 14.00, desc: "Poulet Tikka grillé mijoté au riz." },
    ],
    "Végétarien": [
      { nom: "Macédoine de Légumes", prix: 12.00, desc: "Légumes au curry et riz basmati.", veggie: true },
      { nom: "Baigan Bharta",        prix: 12.50, desc: "Aubergines grillées au curry. Servi avec riz.", veggie: true },
      { nom: "Matar Paneer",         prix: 12.00, desc: "Petits pois au fromage indien et riz.", veggie: true },
      { nom: "Allo Saag Paneer",     prix: 12.00, desc: "Épinards, pommes de terre et fromage. Servi avec riz.", veggie: true },
      { nom: "Dal",                  prix: 12.00, desc: "Lentilles indiennes au curry. Servi avec riz.", veggie: true },
      { nom: "Légumes Masala",       prix: 13.00, desc: "Légumes variés et coriandre fraîche. Servi avec riz.", veggie: true },
    ],
    "Pains & Galettes": [
      { nom: "Chapati",         prix: 2.00, desc: "Farine complète cuite au tandoor.", veggie: true },
      { nom: "Naan Nature",     prix: 2.00, desc: "Farine blanche cuite au tandoor.", veggie: true },
      { nom: "Naan Fromage",    prix: 3.50, desc: "Fourré au fromage fondant.", veggie: true, badge: "⭐ Best-seller" },
      { nom: "Paratha",         prix: 3.00, desc: "Farine complète au beurre.", veggie: true },
      { nom: "Paratha Stuffed", prix: 3.00, desc: "Farine complète farcie aux légumes.", veggie: true },
      { nom: "Naan Keema",      prix: 4.00, desc: "Fourré à la viande hachée." },
      { nom: "Naan Ail",        prix: 4.00, desc: "Ail frais, piments et coriandre.", veggie: true },
    ],
    "Boissons": [
      { nom: "Canette 33cl",     prix: 2.50, desc: "Coca, Zéro, Fanta, Sprite, Oasis.", veggie: true },
      { nom: "Lassi Maison",     prix: 4.50, desc: "Mangue, Rose ou Sucré.", veggie: true },
      { nom: "Eau Minérale 50cl",prix: 2.50, desc: "Vittel ou San Pellegrino.", veggie: true },
    ],
  },
};

// ID unique stable pour chaque plat
const makeId = (cat, nom) => `${cat}::${nom}`;

// Catalogue enrichi avec id + cat
const MENU_FLAT = Object.entries(restaurantData.menu).flatMap(([cat, plats]) =>
  plats.map((p) => ({ ...p, id: makeId(cat, p.nom), cat }))
);
const CATEGORIES = Object.keys(restaurantData.menu);

// ─────────────────────────────────────────────────────────────────
// SECTION 2 — SÉCURITÉ : sanitisation des saisies (anti-XSS)
// ─────────────────────────────────────────────────────────────────
function sanitize(str, { maxLength = 200 } = {}) {
  if (typeof str !== "string") return "";
  return str
    .slice(0, maxLength)
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function validatePhone(tel) {
  return /^(\+33|0)[0-9 .\-]{8,14}$/.test(tel.replace(/\s/g, ""));
}

// ─────────────────────────────────────────────────────────────────
// SECTION 3 — CART CONTEXT (persistance localStorage)
// ─────────────────────────────────────────────────────────────────
const CartContext = createContext(null);
const STORAGE_KEY = "tj_cart_v2";

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists)
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...state, { ...action.item, qty: 1 }];
    }
    case "DEC": {
      const item = state.find((i) => i.id === action.id);
      if (!item) return state;
      if (item.qty === 1) return state.filter((i) => i.id !== action.id);
      return state.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty - 1 } : i
      );
    }
    case "REMOVE": return state.filter((i) => i.id !== action.id);
    case "CLEAR":  return [];
    default:       return state;
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const total       = cart.reduce((s, i) => s + i.prix * i.qty, 0);
  const count       = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = total > 0 && total < 25 ? 2.5 : 0;
  const grandTotal  = total + deliveryFee;

  return (
    <CartContext.Provider value={{ cart, dispatch, total, count, deliveryFee, grandTotal }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

// ─────────────────────────────────────────────────────────────────
// SECTION 4 — SEO / JSON-LD
// ─────────────────────────────────────────────────────────────────
const SEO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Taj Mahal",
  image: "https://tajmahal-lorient.fr/og.jpg",
  "@id": "https://tajmahal-lorient.fr",
  url: "https://tajmahal-lorient.fr",
  telephone: restaurantData.tel,
  address: {
    "@type": "PostalAddress",
    streetAddress: "12 Rue de la Paix",
    addressLocality: "Lorient",
    postalCode: "56100",
    addressCountry: "FR",
  },
  geo: { "@type": "GeoCoordinates", latitude: 47.7481, longitude: -3.3699 },
  servesCuisine: "Indian",
  priceRange: "€€",
  hasMenu: "https://tajmahal-lorient.fr/#menu",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "11:30",
      closes: "14:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "18:30",
      closes: "22:30",
    },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "218" },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 5 — CARTE MENU (composant unitaire)
// ─────────────────────────────────────────────────────────────────
function MenuCard({ item }) {
  const { cart, dispatch } = useCart();
  const inCart = cart.find((i) => i.id === item.id);
  const [popped, setPopped] = useState(false);

  const handleAdd = useCallback(() => {
    dispatch({ type: "ADD", item });
    setPopped(true);
    setTimeout(() => setPopped(false), 350);
  }, [dispatch, item]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex flex-col bg-[#3d1a0e]/60 border border-[#a45c40]/30 rounded-2xl overflow-hidden hover:border-[#f4bb44]/50 hover:shadow-lg hover:shadow-[#f4bb44]/5 transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap z-10">
        {item.badge && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#f4bb44]/20 text-[#f4bb44] border border-[#f4bb44]/40 uppercase tracking-wide">
            {item.badge}
          </span>
        )}
        {item.veggie && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-700/40 uppercase tracking-wide">
            🌿 Veg
          </span>
        )}
        {item.spicy && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40 uppercase tracking-wide">
            🌶 Pimenté
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 pt-9 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="font-semibold text-[#f5f5dc] text-sm leading-snug flex-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {item.nom}
          </h3>
          <span className="text-[#f4bb44] font-bold text-sm shrink-0">
            {item.prix.toFixed(2)} €
          </span>
        </div>
        <p className="text-[#c4a882] text-xs leading-relaxed flex-1">{item.desc}</p>

        <div className="mt-auto pt-2">
          {inCart ? (
            <div className="flex items-center justify-between bg-[#f4bb44]/10 border border-[#f4bb44]/30 rounded-xl px-3 py-1.5">
              <button
                onClick={() => dispatch({ type: "DEC", id: item.id })}
                aria-label="Diminuer quantité"
                className="w-7 h-7 flex items-center justify-center text-[#f4bb44] hover:bg-[#f4bb44]/20 rounded-lg font-bold transition"
              >
                −
              </button>
              <span className="text-[#f5f5dc] font-bold text-sm">{inCart.qty}</span>
              <button
                onClick={handleAdd}
                aria-label="Augmenter quantité"
                className="w-7 h-7 flex items-center justify-center text-[#f4bb44] hover:bg-[#f4bb44]/20 rounded-lg font-bold transition"
              >
                +
              </button>
            </div>
          ) : (
            <motion.button
              animate={popped ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.3 }}
              onClick={handleAdd}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#a45c40] to-[#c4723a] text-[#f5f5dc] font-semibold text-xs tracking-wide hover:from-[#f4bb44] hover:to-[#e8a832] hover:text-[#3d1a0e] active:scale-95 transition-all duration-300"
            >
              Ajouter +
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 6 — SECTION MENU COMPLÈTE
// ─────────────────────────────────────────────────────────────────
function MenuSection() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const tabsRef = useRef(null);

  const filtered = MENU_FLAT.filter((i) => i.cat === activeCat);

  const scrollTabIntoView = (cat) => {
    setActiveCat(cat);
    const btn = tabsRef.current?.querySelector(`[data-cat="${cat}"]`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section id="menu" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[#f4bb44]/70 text-xs uppercase tracking-[0.4em] mb-2 font-sans">
            Notre carte complète
          </p>
          <h2
            className="text-4xl md:text-5xl text-[#f5f5dc]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Saveurs d'exception
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#f4bb44]/60 to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Onglets catégories sticky */}
        <div
          ref={tabsRef}
          className="sticky top-[56px] z-20 flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none bg-gradient-to-b from-[#2c0f06] via-[#2c0f06]/95 to-transparent pt-2 -mx-4 px-4"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              data-cat={cat}
              onClick={() => scrollTabIntoView(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                activeCat === cat
                  ? "bg-[#f4bb44] text-[#3d1a0e] border-[#f4bb44]"
                  : "bg-[#3d1a0e]/50 border-[#a45c40]/30 text-[#c4a882] hover:border-[#f4bb44]/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[#c4a882]/50 text-xs mt-6">
          {filtered.length} plat{filtered.length > 1 ? "s" : ""} dans cette catégorie
          &nbsp;·&nbsp; {MENU_FLAT.length} plats au total
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 7 — TIROIR PANIER (Slide-over)
// ─────────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch, total, count, deliveryFee, grandTotal } = useCart();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-label="Panier de commande"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[360px] z-50 flex flex-col bg-[#2c0f06] border-l border-[#a45c40]/40 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#a45c40]/30">
              <div>
                <h2
                  className="text-[#f5f5dc] font-bold text-base"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Votre commande
                </h2>
                <p className="text-[#c4a882] text-xs">
                  {count} article{count > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer le panier"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#c4a882] hover:text-[#f5f5dc] hover:bg-[#a45c40]/20 transition text-lg"
              >
                ✕
              </button>
            </div>

            {/* Articles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-52 text-[#c4a882] gap-3"
                  >
                    <span className="text-4xl">🛒</span>
                    <p className="text-sm">Votre panier est vide</p>
                    <button
                      onClick={onClose}
                      className="text-xs text-[#f4bb44] underline"
                    >
                      Voir le menu
                    </button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex items-start gap-3 p-3 bg-[#3d1a0e]/70 rounded-xl border border-[#a45c40]/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[#f5f5dc] text-xs font-semibold leading-snug mb-0.5 truncate"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {item.nom}
                        </p>
                        <p className="text-[#f4bb44] text-xs font-bold">
                          {(item.prix * item.qty).toFixed(2)} €
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => dispatch({ type: "DEC", id: item.id })}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#a45c40]/30 text-[#c4a882] hover:bg-[#f4bb44]/20 hover:text-[#f4bb44] transition text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="text-[#f5f5dc] text-xs font-bold w-5 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => dispatch({ type: "ADD", item })}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#a45c40]/30 text-[#c4a882] hover:bg-[#f4bb44]/20 hover:text-[#f4bb44] transition text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                        aria-label={`Supprimer ${item.nom}`}
                        className="text-[#c4a882]/40 hover:text-red-400 transition text-xs shrink-0 mt-0.5"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#a45c40]/30 space-y-2.5">
                {total < 25 && (
                  <div>
                    <p className="text-xs text-[#c4a882] mb-1.5">
                      Encore{" "}
                      <span className="text-[#f4bb44] font-bold">
                        {(25 - total).toFixed(2)} €
                      </span>{" "}
                      pour la livraison offerte
                    </p>
                    <div className="h-1.5 bg-[#3d1a0e] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((total / 25) * 100, 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#a45c40] to-[#f4bb44] rounded-full"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#c4a882]">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#c4a882]">Livraison</span>
                  <span className={total >= 25 ? "text-green-400 font-semibold" : "text-[#f5f5dc]"}>
                    {total >= 25 ? "Offerte 🎉" : `${deliveryFee.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-[#a45c40]/20">
                  <span className="text-[#f5f5dc]">Total</span>
                  <span className="text-[#f4bb44]">{grandTotal.toFixed(2)} €</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#f4bb44] to-[#e8a832] text-[#3d1a0e] hover:brightness-110 active:scale-95 transition-all duration-200"
                >
                  Commander — {grandTotal.toFixed(2)} €
                </button>
                <button
                  onClick={() => dispatch({ type: "CLEAR" })}
                  className="w-full text-xs text-[#c4a882]/50 hover:text-red-400 transition py-1"
                >
                  Vider le panier
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 8 — CHECKOUT ONE-PAGE
// ─────────────────────────────────────────────────────────────────
function CheckoutPage({ onBack }) {
  const { cart, grandTotal, dispatch } = useCart();
  const [mode, setMode]       = useState("pickup");
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm]       = useState({
    name: "", phone: "", heure: "", address: "", note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: sanitize(value, { maxLength: name === "note" ? 300 : 100 }),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2)
      errs.name = "Nom requis (min. 2 caractères)";
    if (!validatePhone(form.phone))
      errs.phone = "Numéro invalide (ex : 06 12 34 56 78)";
    if (!form.heure)
      errs.heure = "Heure de retrait requise";
    if (mode === "delivery" && form.address.length < 5)
      errs.address = "Adresse de livraison requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    // ── Stripe PaymentIntent ──────────────────────────────────────────
    // const res = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: grandTotal, items: cart, ...form, mode }),
    // });
    // const { clientSecret } = await res.json();
    // → monter <Elements stripe={stripePromise} options={{ clientSecret }}>
    //     <PaymentElement />
    //   </Elements>
    //
    // ── Supabase (commandes temps réel) ──────────────────────────────
    // import { createClient } from '@supabase/supabase-js';
    // const supabase = createClient(
    //   process.env.REACT_APP_SUPABASE_URL,
    //   process.env.REACT_APP_SUPABASE_ANON_KEY
    // );
    // await supabase.from('orders').insert([{
    //   items: cart, total: grandTotal, customer: form,
    //   mode, status: 'pending', created_at: new Date().toISOString()
    // }]);
    await new Promise((r) => setTimeout(r, 1600)); // simulation
    setLoading(false);
    setStep(2);
    dispatch({ type: "CLEAR" });
  };

  if (step === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-[#2c0f06] flex flex-col items-center justify-center text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h2
          className="text-2xl text-[#f5f5dc] font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Commande confirmée !
        </h2>
        <p className="text-[#c4a882] mb-1">
          {mode === "pickup"
            ? `À retirer à ${form.heure} — environ 25-30 min de préparation.`
            : `Livraison estimée : 40-50 min à votre adresse.`}
        </p>
        <p className="text-[#f4bb44] font-bold text-lg mb-8">
          Total : {grandTotal.toFixed(2)} €
        </p>
        <p className="text-[#c4a882] text-sm mb-6">
          Un SMS de confirmation sera envoyé au {form.phone}.
        </p>
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f4bb44] to-[#e8a832] text-[#3d1a0e] font-bold hover:brightness-110 transition"
        >
          Retour au menu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2c0f06] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="text-[#c4a882] hover:text-[#f4bb44] transition text-lg"
          >
            ←
          </button>
          <h1
            className="text-[#f5f5dc] text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Finaliser la commande
          </h1>
        </div>

        {/* Récap commande */}
        <div className="bg-[#3d1a0e]/60 border border-[#a45c40]/30 rounded-2xl p-4 mb-6">
          <p className="text-xs text-[#c4a882] uppercase tracking-wider mb-3">
            Récapitulatif
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.id} className="flex justify-between text-xs">
                <span className="text-[#c4a882] truncate mr-2">
                  {i.nom} × {i.qty}
                </span>
                <span className="text-[#f5f5dc] shrink-0">
                  {(i.prix * i.qty).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#a45c40]/20 mt-3 pt-3 flex justify-between font-bold">
            <span className="text-[#f5f5dc] text-sm">Total</span>
            <span className="text-[#f4bb44]">{grandTotal.toFixed(2)} €</span>
          </div>
        </div>

        {/* Mode livraison / à emporter */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { k: "pickup",   icon: "🏪", label: "À emporter" },
            { k: "delivery", icon: "🛵", label: "Livraison"  },
          ].map((m) => (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
              className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all ${
                mode === m.k
                  ? "border-[#f4bb44] bg-[#f4bb44]/10 text-[#f4bb44]"
                  : "border-[#a45c40]/30 text-[#c4a882] hover:border-[#a45c40]"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-sm font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <div className="space-y-4 mb-6">
          {[
            { name: "name",  label: "Nom complet *",     type: "text", placeholder: "Prénom Nom"       },
            { name: "phone", label: "Téléphone *",        type: "tel",  placeholder: "06 XX XX XX XX"   },
            { name: "heure", label: "Heure de retrait *", type: "time", placeholder: ""                 },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-[#c4a882] mb-1.5 uppercase tracking-wider">
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                autoComplete={
                  f.name === "phone" ? "tel" : f.name === "name" ? "name" : "off"
                }
                className={`w-full bg-[#3d1a0e] border rounded-xl px-4 py-3 text-[#f5f5dc] text-sm placeholder:text-[#6b4030] focus:outline-none transition ${
                  errors[f.name]
                    ? "border-red-500"
                    : "border-[#a45c40]/40 focus:border-[#f4bb44]/60"
                }`}
              />
              {errors[f.name] && (
                <p className="text-red-400 text-xs mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}

          {mode === "delivery" && (
            <div>
              <label className="block text-xs text-[#c4a882] mb-1.5 uppercase tracking-wider">
                Adresse de livraison *
              </label>
              <input
                name="address"
                type="text"
                placeholder="12 Rue de la Paix, Lorient"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
                className={`w-full bg-[#3d1a0e] border rounded-xl px-4 py-3 text-[#f5f5dc] text-sm placeholder:text-[#6b4030] focus:outline-none transition ${
                  errors.address
                    ? "border-red-500"
                    : "border-[#a45c40]/40 focus:border-[#f4bb44]/60"
                }`}
              />
              {errors.address && (
                <p className="text-red-400 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#c4a882] mb-1.5 uppercase tracking-wider">
              Instructions spéciales
            </label>
            <textarea
              name="note"
              placeholder="Allergie, sans piment, etc."
              value={form.note}
              onChange={handleChange}
              rows={2}
              className="w-full bg-[#3d1a0e] border border-[#a45c40]/40 rounded-xl px-4 py-3 text-[#f5f5dc] text-sm placeholder:text-[#6b4030] focus:outline-none focus:border-[#f4bb44]/60 transition resize-none"
            />
            <p className="text-xs text-[#6b4030] text-right mt-0.5">
              {form.note.length}/300
            </p>
          </div>
        </div>

        {/* Stripe Placeholder */}
        <div className="bg-[#3d1a0e]/60 border border-[#a45c40]/30 rounded-2xl p-4 mb-6">
          <p className="text-xs text-[#c4a882] uppercase tracking-wider mb-3">
            Paiement sécurisé
          </p>
          {/* Remplacer ce bloc par <Elements><PaymentElement /></Elements> */}
          <div className="border border-dashed border-[#f4bb44]/20 rounded-xl p-5 text-center">
            <p className="text-[#f4bb44] text-sm font-semibold mb-1">
              🔒 Stripe Elements
            </p>
            <p className="text-[#c4a882] text-xs leading-relaxed">
              Intégrez{" "}
              <code className="bg-[#2c0f06] px-1 rounded text-[#f4bb44]">
                {"<PaymentElement />"}
              </code>{" "}
              de{" "}
              <code className="bg-[#2c0f06] px-1 rounded text-[#f4bb44]">
                @stripe/react-stripe-js
              </code>
            </p>
          </div>
          <label className="flex items-center gap-3 mt-3 p-3 border border-[#a45c40]/20 rounded-xl cursor-pointer">
            <input
              type="radio"
              name="payment"
              defaultChecked
              className="accent-[#f4bb44]"
            />
            <span className="text-sm text-[#c4a882]">
              Payer en espèces à la livraison / au comptoir
            </span>
          </label>
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading || cart.length === 0}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-bold text-base tracking-wide bg-gradient-to-r from-[#f4bb44] to-[#e8a832] text-[#3d1a0e] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Traitement en cours…
            </span>
          ) : (
            `Confirmer — ${grandTotal.toFixed(2)} €`
          )}
        </motion.button>

        <p className="text-center text-xs text-[#6b4030] mt-3">
          🔒 Vos données personnelles ne sont jamais stockées sans chiffrement.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 9 — NAVBAR STICKY
// ─────────────────────────────────────────────────────────────────
function Navbar({ onCartOpen }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3.5 transition-all duration-300 border-b border-[#a45c40]/20 ${
        scrolled
          ? "bg-[#2c0f06]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div>
        <span
          className="text-[#f5f5dc] text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Taj Mahal
        </span>
        <span className="text-[#f4bb44]/70 text-xs ml-2 hidden sm:inline font-sans">
          · Lorient
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm text-[#c4a882]">
        <a href="#menu"     className="hover:text-[#f4bb44] transition">Menu</a>
        <a href="#histoire" className="hover:text-[#f4bb44] transition">Notre histoire</a>
        <a href={`tel:${restaurantData.tel}`} className="hover:text-[#f4bb44] transition">
          Réserver
        </a>
      </nav>

      <button
        onClick={onCartOpen}
        aria-label={`Ouvrir le panier (${count} articles)`}
        className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-[#a45c40] to-[#c4723a] text-[#f5f5dc] hover:from-[#f4bb44] hover:to-[#e8a832] hover:text-[#3d1a0e] transition-all duration-300"
      >
        🛒 Panier
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#f4bb44] text-[#3d1a0e] text-[10px] rounded-full flex items-center justify-center font-black"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 10 — HERO
// ─────────────────────────────────────────────────────────────────
function Hero({ onOrder }) {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4bb44' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#a45c40]/10 blur-3xl" />
        <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-[#f4bb44]/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#f4bb44]/50" />
          <span className="text-[#f4bb44]/70 text-xs uppercase tracking-[0.4em] font-sans">
            Restaurant Indien
          </span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#f4bb44]/50" />
        </div>

        <h1
          className="text-6xl sm:text-7xl md:text-8xl text-[#f5f5dc] mb-3 leading-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Taj Mahal
        </h1>
        <p className="text-[#f4bb44]/80 text-sm tracking-widest mb-4 font-sans uppercase">
          Lorient · Morbihan
        </p>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#f4bb44]/50 to-transparent mx-auto mb-6" />

        <p className="text-[#c4a882] text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed font-sans">
          Saveurs authentiques du Pendjab, four tandoor à 400°C, épices torréfiées chaque matin.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOrder}
            className="px-8 py-4 rounded-xl font-bold text-base tracking-wide bg-gradient-to-r from-[#f4bb44] to-[#e8a832] text-[#3d1a0e] shadow-xl shadow-[#f4bb44]/20 hover:brightness-110 transition-all duration-300"
          >
            🛵 Commander à emporter
          </motion.button>
          <a
            href={`tel:${restaurantData.tel}`}
            className="px-8 py-4 rounded-xl font-semibold text-base border border-[#a45c40]/60 text-[#f4bb44] hover:bg-[#a45c40]/20 transition-all duration-300 flex items-center justify-center"
          >
            📞 Réserver une table
          </a>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 text-sm text-[#c4a882]">
          <span>⭐ 4.7 / 5</span>
          <span className="w-px h-4 bg-[#a45c40]/40" />
          <span>218 avis Google</span>
          <span className="w-px h-4 bg-[#a45c40]/40" />
          <span>Ouvert 7j/7</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-5 h-8 border border-[#a45c40]/40 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#f4bb44]/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 11 — HISTOIRE DU RESTAURANT
// ─────────────────────────────────────────────────────────────────
function StorySection() {
  return (
    <section id="histoire" className="py-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        className="grid md:grid-cols-3 gap-6"
      >
        {restaurantData.histoire.map((item, i) => (
          <motion.div
            key={item.titre}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-[#3d1a0e]/40 border border-[#a45c40]/25 rounded-2xl p-6 text-center hover:border-[#f4bb44]/30 transition-all duration-300"
          >
            <span className="text-4xl block mb-4">{item.emoji}</span>
            <h3
              className="text-[#f5f5dc] font-bold text-lg mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {item.titre}
            </h3>
            <p className="text-[#c4a882] text-sm leading-relaxed">{item.texte}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 12 — FOOTER
// ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#a45c40]/20 py-12 px-4 text-center">
      <p
        className="text-[#f5f5dc] font-bold text-xl mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Taj Mahal
      </p>
      <p className="text-[#c4a882] text-sm mb-1">{restaurantData.adresse}</p>
      <p className="text-[#c4a882] text-sm mb-1">
        <a href={`tel:${restaurantData.tel}`} className="hover:text-[#f4bb44] transition">
          {restaurantData.tel}
        </a>
      </p>
      <p className="text-[#c4a882] text-sm mb-6">
        Lun–Dim : 11h30–14h30 · 18h30–22h30
      </p>
      <div className="flex justify-center gap-4 text-xs text-[#6b4030]">
        <a href="/mentions-legales" className="hover:text-[#c4a882] transition">
          Mentions légales
        </a>
        <span>·</span>
        <a href="/cgv" className="hover:text-[#c4a882] transition">CGV</a>
        <span>·</span>
        <a href="/confidentialite" className="hover:text-[#c4a882] transition">
          Confidentialité
        </a>
      </div>
      <p className="text-[#4a2a1a] text-xs mt-4">
        © {new Date().getFullYear()} Taj Mahal Lorient
      </p>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 13 — APP ROOT
// CartProvider unique qui englobe TOUT le contenu (home + checkout)
// ─────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage]       = useState("home");
  const [cartOpen, setCartOpen] = useState(false);

  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setPage("checkout");
  }, []);

  const goHome = useCallback(() => setPage("home"), []);

  return (
    <CartProvider>
      {/* JSON-LD SEO — déplacer dans <Head> si Next.js */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_JSON_LD) }}
      />

      {/* Playfair Display */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {page === "checkout" ? (
        <CheckoutPage onBack={goHome} />
      ) : (
        <div className="min-h-screen bg-[#2c0f06] text-[#f5f5dc] font-sans antialiased">
          <Navbar onCartOpen={() => setCartOpen(true)} />

          <main>
            <Hero onOrder={() => setCartOpen(true)} />
            <StorySection />
            <MenuSection />
          </main>

          <Footer />

          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={openCheckout}
          />
        </div>
      )}
    </CartProvider>
  );
}

export default App;
