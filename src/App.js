
// ╔══════════════════════════════════════════════════════════════════╗
// ║       TAJ MAHAL LORIENT — SPA v4.0 (Sprint 2 — Supabase)       ║
// ║  Stack : React 18 + Tailwind CSS + Framer Motion + Supabase    ║
// ║  Design: Light & Airy Luxury — Fond crème #FFFAF1              ║
// ║  ✅ Naan Fromage offert automatique à 35€                       ║
// ║  ✅ Menus Midi bloqués à l'emporté                              ║
// ║  ✅ Double barre de progression (livraison + cadeau)            ║
// ║  ✅ Commandes réelles → Supabase                                ║
// ║  ✅ Dashboard admin temps réel (PIN protégé)                    ║
// ║  ✅ Notification sonore nouvelle commande                       ║
// ╚══════════════════════════════════════════════════════════════════╝

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
import { createClient } from "@supabase/supabase-js";

// ── Supabase — connexion temps réel ─────────────────────────────
const supabase = createClient(
  "https://etgausnbaxkcchgqrhjp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Z2F1c25iYXhrY2NoZ3FyaGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTYyMjIsImV4cCI6MjA5MTc3MjIyMn0.2BhqJxMAi4cnfytLOjd7vH7kEQkXnhydxElKJLhh5As"
);

// ─────────────────────────────────────────────────────────────────
// PALETTE — Light & Airy Luxury (validée et figée)
// ─────────────────────────────────────────────────────────────────
// Fond principal    : #FFFAF1  (crème chaud)
// Accent or/safran  : #F4BB44
// Terracotta        : #A45C40  (accents seulement)
// Texte principal   : #1A0A00  (brun très foncé)
// Texte secondaire  : #6B4030
// Succès/cadeau     : #2D6A4F  (vert naturel)

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — DONNÉES DU RESTAURANT
// ─────────────────────────────────────────────────────────────────
const restaurantData = {
  nom: "Taj Mahal Lorient",
  tel: "+33297840404",
  adresse: "17 Boulevard Franchet d'Espérey, 56100 Lorient",
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
    // ── Menus Midi : RÉSERVÉS SUR PLACE — bloqués à l'emporté ──────
    "Menus Midi 🏠": [
      { nom: "Menu Midi Poulet",      prix: 13.00, desc: "Entrée + curry de poulet + riz basmati + naan nature.", onSiteOnly: true },
      { nom: "Menu Midi Végétarien",  prix: 13.00, desc: "Entrée + plat végétarien + riz basmati + naan nature.", onSiteOnly: true, veggie: true },
      { nom: "Menu Midi Agneau",      prix: 13.00, desc: "Entrée + curry d'agneau + riz basmati + naan nature.", onSiteOnly: true },
      { nom: "Menu Midi Poisson",     prix: 13.00, desc: "Entrée + curry de saumon + riz basmati + naan nature.", onSiteOnly: true },
      { nom: "Menu Midi Boeuf",       prix: 13.00, desc: "Entrée + curry de bœuf + riz basmati + naan nature.", onSiteOnly: true },
    ],
    "Entrées": [
      { nom: "Samosa Sabzi",            prix: 6.00,  desc: "Chaussons aux légumes du Pendjab.", veggie: true },
      { nom: "Pakora Mixte",            prix: 6.00,  desc: "Beignets de légumes à la farine de pois chiches.", veggie: true },
      { nom: "Oignon Bhaji",            prix: 6.00,  desc: "Beignets d'oignons croustillants.", veggie: true },
      { nom: "Samosa Keema",            prix: 7.00,  desc: "Chaussons à la viande hachée frite." },
      { nom: "Crevettes Pakora",        prix: 9.00,  desc: "Beignets de crevettes frits." },
      { nom: "Crevettes Raita",         prix: 6.00,  desc: "Crevettes, concombres, yaourt et épices." },
      { nom: "Crevettes Indiennes",     prix: 8.00,  desc: "Marinées sauce mangue sucrée-épicée." },
      { nom: "Chicken Pakora",          prix: 7.50,  desc: "Beignets de poulet à la farine de pois chiches." },
      { nom: "Mix Végétarien (2 pers)", prix: 11.50, desc: "Oignon Bhaji, Pakora, Samosa Sabzi.", veggie: true, badge: "Pour 2" },
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
      { nom: "Poisson Curry",          prix: 14.00, desc: "Saumon sauce gingembre et ail. Servi avec riz." },
      { nom: "Poisson Korma",          prix: 15.00, desc: "Saumon sauce noix de cajou et crème. Servi avec riz." },
      { nom: "Poisson Masala",         prix: 15.00, desc: "Saumon, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Crevettes Curry",        prix: 14.50, desc: "Crevettes décortiquées au curry. Servi avec riz." },
      { nom: "Crevettes Shahi Korma",  prix: 14.50, desc: "Sauce douce amandes et cajou. Servi avec riz." },
      { nom: "Crevettes Masala",       prix: 14.50, desc: "Crevettes, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Gambas au Curry",        prix: 16.00, desc: "Gambas légèrement épicées. Servi avec riz." },
      { nom: "Gambas Shahi Korma",     prix: 16.50, desc: "Crème, cajou et raisins secs. Servi avec riz." },
      { nom: "Gambas Masala",          prix: 17.00, desc: "Gambas aux poivrons et piments verts. Servi avec riz.", spicy: true },
    ],
    "Biryanis": [
      { nom: "Biryani Poulet",    prix: 14.00, desc: "Poulet, riz, petits pois, raisins, 25 épices." },
      { nom: "Biryani Agneau",    prix: 16.00, desc: "Agneau, riz, raisins, 25 épices." },
      { nom: "Biryani Crevettes", prix: 16.00, desc: "Crevettes et riz aux 25 épices." },
      { nom: "Biryani Légumes",   prix: 13.00, desc: "Légumes variés mijotés au riz épicé.", veggie: true },
      { nom: "Biryani Mixte",     prix: 17.00, desc: "Poulet, Agneau, Gambas et coriandre fraîche.", badge: "⭐ Chef" },
      { nom: "Biryani Tikka",     prix: 14.00, desc: "Poulet Tikka grillé mijoté au riz." },
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
      { nom: "Canette 33cl",      prix: 2.50, desc: "Coca, Zéro, Fanta, Sprite, Oasis.", veggie: true },
      { nom: "Lassi Maison",      prix: 4.50, desc: "Mangue, Rose ou Sucré.", veggie: true },
      { nom: "Eau Minérale 50cl", prix: 2.50, desc: "Vittel ou San Pellegrino.", veggie: true },
    ],
  },
};

const makeId = (cat, nom) => `${cat}::${nom}`;
const MENU_FLAT = Object.entries(restaurantData.menu).flatMap(([cat, plats]) =>
  plats.map((p) => ({ ...p, id: makeId(cat, p.nom), cat }))
);
const CATEGORIES = Object.keys(restaurantData.menu);

// ─────────────────────────────────────────────────────────────────
// SECTION 2 — SÉCURITÉ : sanitisation anti-XSS
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
// SECTION 3 — CART CONTEXT + LOGIQUE CADEAU NAAN 35€
// ─────────────────────────────────────────────────────────────────
const CartContext = createContext(null);
const STORAGE_KEY = "tj_cart_v3";
const LIVRAISON_THRESHOLD = 25;   // livraison offerte
const NAAN_THRESHOLD = 35;        // Naan Fromage offert
const NAAN_GIFT = {
  id: "gift::naan-fromage",
  nom: "Naan Fromage 🎁",
  desc: "Offert pour votre commande de plus de 35€ !",
  cat: "Pains & Galettes",
  prix: 0,
  qty: 1,
  isGift: true,
  originalPrice: 3.50,
  veggie: true,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      // Bloquer l'ajout des articles "cadeau" manuellement
      if (action.item.isGift) return state;
      const exists = state.find((i) => i.id === action.item.id);
      if (exists)
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...state, { ...action.item, qty: 1 }];
    }
    case "DEC": {
      if (action.id === NAAN_GIFT.id) return state; // cadeau non supprimable
      const item = state.find((i) => i.id === action.id);
      if (!item) return state;
      if (item.qty === 1) return state.filter((i) => i.id !== action.id);
      return state.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty - 1 } : i
      );
    }
    case "REMOVE": {
      if (action.id === NAAN_GIFT.id) return state; // cadeau non supprimable
      return state.filter((i) => i.id !== action.id);
    }
    case "CLEAR": return [];
    default:      return state;
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

  // Toast cadeau Naan
  const [naanToast, setNaanToast] = useState(false);
  const prevNaanRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Calculs panier
  const baseTotal = cart.reduce((s, i) => s + i.prix * i.qty, 0);
  const naanGiftEarned = baseTotal >= NAAN_THRESHOLD;

  // Déclenchement du toast quand on atteint 35€
  useEffect(() => {
    if (naanGiftEarned && !prevNaanRef.current) {
      setNaanToast(true);
      setTimeout(() => setNaanToast(false), 5000);
    }
    prevNaanRef.current = naanGiftEarned;
  }, [naanGiftEarned]);

  // Panier affiché = panier réel + cadeau si éligible
  const displayCart = naanGiftEarned ? [...cart, NAAN_GIFT] : cart;
  const total       = baseTotal;
  const count       = displayCart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = total > 0 && total < LIVRAISON_THRESHOLD ? 2.50 : 0;
  const grandTotal  = total + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart: displayCart,
        rawCart: cart,
        dispatch,
        total,
        baseTotal,
        count,
        deliveryFee,
        grandTotal,
        naanGiftEarned,
        naanToast,
        setNaanToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

// ─────────────────────────────────────────────────────────────────
// SECTION 4 — SEO / JSON-LD (référencement local Lorient)
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
    streetAddress: "17 Boulevard Franchet d'Espérey",
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
      opens: "12:00",
      closes: "14:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "19:00",
      closes: "22:00",
    },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "218" },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 5 — TOAST NOTIFICATION CADEAU NAAN
// ─────────────────────────────────────────────────────────────────
function NaanToast() {
  const { naanToast, setNaanToast } = useCart();

  return (
    <AnimatePresence>
      {naanToast && (
        <motion.div
          initial={{ opacity: 0, y: -80, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -80, x: "-50%" }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed top-20 left-1/2 z-[100] bg-[#2D6A4F] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm"
        >
          <span className="text-3xl">🎁</span>
          <div>
            <p className="font-bold text-sm">Naan Fromage offert !</p>
            <p className="text-xs opacity-90">Ajouté automatiquement à votre commande</p>
          </div>
          <button
            onClick={() => setNaanToast(false)}
            className="ml-2 text-white/70 hover:text-white text-lg leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 6 — CARTE MENU (composant unitaire)
// ─────────────────────────────────────────────────────────────────
function MenuCard({ item }) {
  const { rawCart, dispatch } = useCart();
  const inCart = rawCart.find((i) => i.id === item.id);
  const [popped, setPopped] = useState(false);

  const handleAdd = useCallback(() => {
    if (item.onSiteOnly) return;
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
      className="relative flex flex-col bg-white border border-[#A45C40]/15 rounded-2xl overflow-hidden hover:border-[#F4BB44]/60 hover:shadow-md hover:shadow-[#F4BB44]/10 transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap z-10">
        {item.onSiteOnly && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#A45C40]/10 text-[#A45C40] border border-[#A45C40]/30 uppercase tracking-wide">
            🏠 Sur place
          </span>
        )}
        {item.badge && !item.onSiteOnly && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F4BB44]/20 text-[#A45C40] border border-[#F4BB44]/40 uppercase tracking-wide">
            {item.badge}
          </span>
        )}
        {item.veggie && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
            🌿 Veg
          </span>
        )}
        {item.spicy && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 uppercase tracking-wide">
            🌶 Épicé
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 pt-9 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="font-semibold text-[#1A0A00] text-sm leading-snug flex-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {item.nom}
          </h3>
          <span className="text-[#A45C40] font-bold text-sm shrink-0">
            {item.prix.toFixed(2)} €
          </span>
        </div>
        <p className="text-[#6B4030] text-xs leading-relaxed flex-1">{item.desc}</p>

        <div className="mt-auto pt-2">
          {item.onSiteOnly ? (
            // Menus midi : bouton désactivé avec mention
            <div className="w-full py-2 px-3 rounded-xl bg-[#FFFAF1] border border-[#A45C40]/20 text-center">
              <span className="text-[#A45C40] text-xs font-semibold">Sur place uniquement</span>
            </div>
          ) : inCart ? (
            <div className="flex items-center justify-between bg-[#F4BB44]/10 border border-[#F4BB44]/30 rounded-xl px-3 py-1.5">
              <button
                onClick={() => dispatch({ type: "DEC", id: item.id })}
                aria-label="Diminuer quantité"
                className="w-7 h-7 flex items-center justify-center text-[#A45C40] hover:bg-[#F4BB44]/20 rounded-lg font-bold transition"
              >
                −
              </button>
              <span className="text-[#1A0A00] font-bold text-sm">{inCart.qty}</span>
              <button
                onClick={handleAdd}
                aria-label="Augmenter quantité"
                className="w-7 h-7 flex items-center justify-center text-[#A45C40] hover:bg-[#F4BB44]/20 rounded-lg font-bold transition"
              >
                +
              </button>
            </div>
          ) : (
            <motion.button
              animate={popped ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.3 }}
              onClick={handleAdd}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#A45C40] to-[#F4BB44] text-white font-semibold text-xs tracking-wide hover:brightness-105 active:scale-95 transition-all duration-300"
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
// SECTION 7 — SECTION MENU COMPLÈTE
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
    <section id="menu" className="py-16 px-4 bg-[#FFFAF1]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[#A45C40]/80 text-xs uppercase tracking-[0.4em] mb-2 font-sans">
            Notre carte complète
          </p>
          <h2
            className="text-4xl md:text-5xl text-[#1A0A00]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Saveurs d'exception
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#F4BB44] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Note menus midi */}
        <div className="mb-6 flex items-center gap-2 justify-center">
          <span className="text-[#A45C40] text-sm bg-[#A45C40]/8 border border-[#A45C40]/20 rounded-xl px-4 py-2">
            🏠 Les menus midi sont réservés à la <strong>restauration sur place</strong> uniquement
          </span>
        </div>

        {/* Onglets catégories sticky */}
        <div
          ref={tabsRef}
          className="sticky top-[60px] z-20 flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none bg-gradient-to-b from-[#FFFAF1] via-[#FFFAF1]/95 to-transparent pt-2 -mx-4 px-4"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              data-cat={cat}
              onClick={() => scrollTabIntoView(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                activeCat === cat
                  ? "bg-[#F4BB44] text-[#1A0A00] border-[#F4BB44] shadow-sm"
                  : "bg-white border-[#A45C40]/20 text-[#6B4030] hover:border-[#F4BB44]/60 hover:text-[#1A0A00]"
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

        <p className="text-center text-[#6B4030]/50 text-xs mt-6">
          {filtered.length} plat{filtered.length > 1 ? "s" : ""} dans cette catégorie
          &nbsp;·&nbsp; {MENU_FLAT.length} plats au total
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION 8 — DOUBLE BARRE DE PROGRESSION (panier)
// ─────────────────────────────────────────────────────────────────
function CartProgressBars({ total }) {
  const livraisonDone = total >= LIVRAISON_THRESHOLD;
  const naanDone      = total >= NAAN_THRESHOLD;

  if (naanDone) {
    return (
      <div className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 rounded-xl p-3 text-center">
        <p className="text-[#2D6A4F] text-xs font-bold">
          🎁 Livraison offerte + Naan Fromage offert !
        </p>
      </div>
    );
  }

  if (livraisonDone) {
    // Progression vers le Naan (25€ → 35€)
    const progress = Math.min(((total - LIVRAISON_THRESHOLD) / (NAAN_THRESHOLD - LIVRAISON_THRESHOLD)) * 100, 100);
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-[#6B4030]">
            🎁 Encore{" "}
            <span className="text-[#2D6A4F] font-bold">
              {(NAAN_THRESHOLD - total).toFixed(2)} €
            </span>{" "}
            pour votre <strong>Naan Fromage offert</strong>
          </p>
          <span className="text-[10px] text-[#6B4030]/60">35 €</span>
        </div>
        <div className="h-2 bg-[#FFFAF1] border border-[#A45C40]/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 20 }}
            className="h-full bg-gradient-to-r from-[#F4BB44] to-[#2D6A4F] rounded-full"
          />
        </div>
        <p className="text-[10px] text-[#2D6A4F] mt-1">✓ Livraison offerte débloquée !</p>
      </div>
    );
  }

  // Progression vers livraison offerte (0 → 25€)
  const progress = Math.min((total / LIVRAISON_THRESHOLD) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-[#6B4030]">
          🛵 Encore{" "}
          <span className="text-[#A45C40] font-bold">
            {(LIVRAISON_THRESHOLD - total).toFixed(2)} €
          </span>{" "}
          pour la livraison offerte
        </p>
        <span className="text-[10px] text-[#6B4030]/60">25 €</span>
      </div>
      <div className="h-2 bg-[#FFFAF1] border border-[#A45C40]/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 20 }}
          className="h-full bg-gradient-to-r from-[#A45C40] to-[#F4BB44] rounded-full"
        />
      </div>
      <p className="text-[10px] text-[#6B4030]/60 mt-1">
        À 35€ : Naan Fromage offert 🎁
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch, total, count, deliveryFee, grandTotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A0A00]/40 z-40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-full max-w-[360px] z-50 flex flex-col bg-[#FFFAF1] shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#A45C40]/15 bg-white">
              <h2 className="text-[#1A0A00] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Votre commande</h2>
              <button onClick={onClose} className="p-2 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className={`p-3 rounded-xl border ${item.isGift ? "bg-green-50 border-green-200" : "bg-white border-orange-100"}`}>
                  <div className="flex justify-between font-bold text-sm">
                    <span>{item.qty}x {item.nom}</span>
                    <span>{item.isGift ? "OFFERT" : `${(item.prix * item.qty).toFixed(2)}€`}</span>
                  </div>
                  {!item.isGift && (
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => dispatch({ type: "DEC", id: item.id })} className="text-orange-600 font-bold"> - </button>
                      <button onClick={() => dispatch({ type: "ADD", item })} className="text-orange-600 font-bold"> + </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 bg-white border-t border-[#A45C40]/15 space-y-4">
              <CartProgressBars total={total} />
              <div className="text-lg font-bold flex justify-between border-t pt-2">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
              <button onClick={onCheckout} className="w-full py-4 rounded-2xl bg-[#1A0A00] text-white font-bold active:scale-95 transition">
                Valider la commande
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { count, grandTotal } = useCart();

  return (
    <div className="min-h-screen bg-[#FFFAF1]">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-orange-100">
        <h1 className="text-xl font-bold text-[#A45C40]" style={{ fontFamily: "'Playfair Display', serif" }}>TAJ MAHAL</h1>
        <button onClick={() => setIsCartOpen(true)} className="bg-[#1A0A00] text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
          Panier ({count}) — {grandTotal.toFixed(2)}€
        </button>
      </nav>

      <main>
        <div className="py-12 px-6 text-center bg-white border-b border-orange-50">
           <h2 className="text-4xl font-serif mb-2 text-[#1A0A00]">L'Art du Tandoor</h2>
           <p className="text-[#6B4030] italic">Cuisine indienne authentique à Lorient</p>
        </div>
        <MenuSection />
      </main>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => alert("Commande envoyée !")} />
    </div>
  );
}

// L'EXPORT CORRECT QUI ENVELOPPE TOUT AVEC LE PANIER
export default function WrappedApp() {
  return (
    <CartProvider>
      <App />
      <NaanToast />
    </CartProvider>
  );
}
