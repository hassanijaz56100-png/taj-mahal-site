// ╔══════════════════════════════════════════════════════════════╗
// ║         TAJ MAHAL LORIENT — v5.0                            ║
// ║  Stack : React 18 + Tailwind + Framer Motion + Supabase     ║
// ║  ✅ Mobile-first (iPhone prioritaire)                        ║
// ║  ✅ -10% automatique sur toutes les commandes à emporter     ║
// ║  ✅ Upsell pendant navigation + avant validation             ║
// ║  ✅ SMS Brevo (placeholder — voir commentaires)              ║
// ║  ✅ Notification push ntfy.sh (placeholder — voir comments)  ║
// ║  ✅ Suppression totale livraison                             ║
// ║  ✅ Naan offert → section avis 5 étoiles                    ║
// ║  ✅ Dashboard admin temps réel + impression 80mm             ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── SETUP BREVO SMS ────────────────────────────────────────────
// 1. Créer un compte sur https://www.brevo.com (gratuit = 300 SMS/mois)
// 2. Dans Brevo : Paramètres → Clés API → Créer une clé
// 3. Dans Supabase : Settings → Edge Functions → Secrets
//    Ajouter : BREVO_API_KEY = "votre-clé-ici"
//    Ajouter : BREVO_SENDER_PHONE = "votre-numéro-expéditeur"
// 4. Créer une Edge Function Supabase "send-sms" (voir fin de fichier)
// ────────────────────────────────────────────────────────────────

// ─── SETUP NTFY.SH (notifications iPhone) ───────────────────────
// 1. Installer l'app "ntfy" sur votre iPhone (gratuit App Store)
// 2. Choisir un nom de canal secret ex: "tajmahal-commandes-XXXX"
// 3. Dans l'app ntfy : s'abonner à ce canal
// 4. Dans Supabase Secrets : NTFY_TOPIC = "tajmahal-commandes-XXXX"
// La Edge Function "send-sms" envoie aussi la notif ntfy en même temps
// ────────────────────────────────────────────────────────────────

// ─── ADMIN PIN ──────────────────────────────────────────────────
// Remplacez "CHANGEZ-MOI" par votre code PIN personnel (4-6 chiffres)
// Ne partagez jamais ce fichier avec le PIN rempli
// ────────────────────────────────────────────────────────────────

// ─── GOOGLE PLACE ID ────────────────────────────────────────────
// Pour trouver votre Place ID :
// https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
// Cherchez "Taj Mahal Lorient" et copiez le Place ID
// Remplacez VOTRE_PLACE_ID ci-dessous
// ────────────────────────────────────────────────────────────────

import {
  createContext, useContext, useReducer, useEffect,
  useState, useRef, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ─────────────────────────────────────────────────────
const supabase = createClient(
  "https://etgausnbaxkcchgqrhjp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Z2F1c25iYXhrY2NoZ3FyaGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTYyMjIsImV4cCI6MjA5MTc3MjIyMn0.2BhqJxMAi4cnfytLOjd7vH7kEQkXnhydxElKJLhh5As"
);

// ── Palette ──────────────────────────────────────────────────────
// Fond crème chaud   : #FFFAF1
// Or/safran          : #F4BB44
// Terracotta         : #A45C40
// Texte principal    : #1A0A00
// Texte secondaire   : #6B4030
// Vert succès        : #2D6A4F

const ADMIN_PIN = "2497"; // ← remplacez par votre PIN
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=VOTRE_PLACE_ID"; // ← remplacez
const DISCOUNT_RATE = 0.10; // -10% automatique à emporter

// ── Données restaurant ───────────────────────────────────────────
const restaurantData = {
  nom: "Taj Mahal Lorient",
  tel: "+33297840404",
  adresse: "17 Boulevard Franchet d'Espérey, 56100 Lorient",
  coords: { lat: 47.7481, lng: -3.3699 },
  histoire: [
    { titre: "Le secret du Tandoor", texte: "Notre four traditionnel en terre cuite monte à 400°C pour une saveur fumée incomparable.", emoji: "🔥" },
    { titre: "L'Art des Épices", texte: "Nous torréfions et composons nos propres Masalas chaque matin.", emoji: "🌿" },
    { titre: "Ancrage Lorientais", texte: "Le goût authentique du Pendjab au cœur du Morbihan.", emoji: "⚓" },
  ],
  menu: {
    "Entrées": [
      { nom: "Samosa Sabzi", prix: 6.00, desc: "Chaussons aux légumes du Pendjab.", veggie: true },
      { nom: "Pakora Mixte", prix: 6.00, desc: "Beignets de légumes à la farine de pois chiches.", veggie: true },
      { nom: "Oignon Bhaji", prix: 6.00, desc: "Beignets d'oignons croustillants.", veggie: true },
      { nom: "Samosa Keema", prix: 7.00, desc: "Chaussons à la viande hachée frite." },
      { nom: "Crevettes Pakora", prix: 9.00, desc: "Beignets de crevettes frits." },
      { nom: "Crevettes Raita", prix: 6.00, desc: "Crevettes, concombres, yaourt et épices." },
      { nom: "Crevettes Indiennes", prix: 8.00, desc: "Marinées sauce mangue sucrée-épicée." },
      { nom: "Chicken Pakora", prix: 7.50, desc: "Beignets de poulet à la farine de pois chiches." },
      { nom: "Mix Végétarien (2 pers)", prix: 11.50, desc: "Oignon Bhaji, Pakora, Samosa Sabzi.", veggie: true, badge: "Pour 2" },
    ],
    "Tandoori": [
      { nom: "Poulet Tikka", prix: 9.00, desc: "Poulet désossé mariné et grillé.", badge: "⭐ Incontournable" },
      { nom: "Agneau Kebab", prix: 8.00, desc: "Agneau haché en brochette aux fines herbes." },
      { nom: "Poisson Tikka", prix: 11.50, desc: "Filets de saumon grillés au tandoor." },
      { nom: "Gambas Tandoori", prix: 17.00, desc: "Gambas marinées aux aromates." },
      { nom: "Mix Grill (2 pers)", prix: 19.50, desc: "Poulet Tikka, Crevette Pakora, Agneau Kebab et Poisson Tikka.", badge: "Pour 2" },
    ],
    "Poulet": [
      { nom: "Poulet Curry", prix: 12.50, desc: "Spécialité du Pendjab. Servi avec riz basmati." },
      { nom: "Poulet Vindaloo", prix: 13.00, desc: "Sauce épicée et pommes de terre. Servi avec riz.", spicy: true },
      { nom: "Poulet Shahi Korma", prix: 14.00, desc: "Sauce noix de cajou, raisins et crème. Servi avec riz." },
      { nom: "Poulet Madras", prix: 13.50, desc: "Sauce très relevée au piment Madras. Servi avec riz.", spicy: true },
      { nom: "Poulet Tikka Masala", prix: 14.00, desc: "Grillé avec poivrons, tomates, oignons. Servi avec riz.", badge: "⭐ Best-seller" },
      { nom: "Butter Chicken", prix: 14.00, desc: "Sauce onctueuse crème et beurre. Servi avec riz.", badge: "⭐ Best-seller" },
      { nom: "Poulet Palak", prix: 14.00, desc: "Curry de poulet aux épinards. Servi avec riz." },
      { nom: "Poulet Jalfrezi", prix: 14.50, desc: "Grillé avec oignons, poivrons et œuf. Servi avec riz." },
      { nom: "Poulet Dal", prix: 14.00, desc: "Mijoté aux lentilles indiennes. Servi avec riz." },
      { nom: "Poulet Aubergine", prix: 14.00, desc: "Curry aux aubergines et riz basmati." },
    ],
    "Agneau": [
      { nom: "Agneau Shahi Korma", prix: 15.00, desc: "Noix de cajou, crème et raisins. Servi avec riz." },
      { nom: "Agneau Aubergine", prix: 15.00, desc: "Agneau et aubergines fondues. Servi avec riz." },
      { nom: "Agneau Palak", prix: 15.00, desc: "Agneau et épinards frais. Servi avec riz." },
      { nom: "Agneau Dal", prix: 15.00, desc: "Cuisiné aux lentilles au curry. Servi avec riz." },
      { nom: "Agneau Curry", prix: 14.00, desc: "Gigot en sauce traditionnelle. Servi avec riz." },
      { nom: "Agneau Tikka Masala", prix: 16.00, desc: "Grillé, sauce tomates et poivrons. Servi avec riz." },
      { nom: "Agneau Vindaloo", prix: 15.00, desc: "Sauce épicée et pommes de terre. Servi avec riz.", spicy: true },
      { nom: "Agneau Butter", prix: 16.00, desc: "Sauce crème et beurre. Servi avec riz." },
      { nom: "Achar Gosht", prix: 15.00, desc: "Sauce curry aux pickles indiens. Servi avec riz." },
    ],
    "Boeuf": [
      { nom: "Boeuf au Curry", prix: 13.00, desc: "Spécialité du Pendjab. Servi avec riz basmati." },
      { nom: "Boeuf Madras", prix: 14.00, desc: "Sauce très relevée au piment Madras. Servi avec riz.", spicy: true },
      { nom: "Boeuf Masala", prix: 15.00, desc: "Oignons, tomates, poivrons. Servi avec riz." },
      { nom: "Köfta Curry", prix: 14.00, desc: "Boulettes de bœuf en sauce curry. Servi avec riz." },
      { nom: "Köfta Vindaloo", prix: 14.50, desc: "Boulettes, sauce épicée, pommes de terre.", spicy: true },
      { nom: "Köfta Fromage", prix: 15.00, desc: "Boulettes sauce curry et fromage. Servi avec riz." },
      { nom: "Allo Keema", prix: 13.00, desc: "Viande hachée et pommes de terre. Servi avec riz." },
    ],
    "Poissons & Crevettes": [
      { nom: "Poisson Curry", prix: 14.00, desc: "Saumon sauce gingembre et ail. Servi avec riz." },
      { nom: "Poisson Korma", prix: 15.00, desc: "Saumon sauce noix de cajou et crème. Servi avec riz." },
      { nom: "Poisson Masala", prix: 15.00, desc: "Saumon, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Crevettes Curry", prix: 14.50, desc: "Crevettes décortiquées au curry. Servi avec riz." },
      { nom: "Crevettes Shahi Korma", prix: 14.50, desc: "Sauce douce amandes et cajou. Servi avec riz." },
      { nom: "Crevettes Masala", prix: 14.50, desc: "Crevettes, poivrons, tomates, oignons. Servi avec riz." },
      { nom: "Gambas au Curry", prix: 16.00, desc: "Gambas légèrement épicées. Servi avec riz." },
      { nom: "Gambas Shahi Korma", prix: 16.50, desc: "Crème, cajou et raisins secs. Servi avec riz." },
      { nom: "Gambas Masala", prix: 17.00, desc: "Gambas aux poivrons et piments verts.", spicy: true },
    ],
    "Biryanis": [
      { nom: "Biryani Poulet", prix: 14.00, desc: "Poulet, riz, petits pois, raisins, 25 épices." },
      { nom: "Biryani Agneau", prix: 16.00, desc: "Agneau, riz, raisins, 25 épices." },
      { nom: "Biryani Crevettes", prix: 16.00, desc: "Crevettes et riz aux 25 épices." },
      { nom: "Biryani Légumes", prix: 13.00, desc: "Légumes variés mijotés au riz épicé.", veggie: true },
      { nom: "Biryani Mixte", prix: 17.00, desc: "Poulet, Agneau, Gambas et coriandre fraîche.", badge: "⭐ Chef" },
      { nom: "Biryani Tikka", prix: 14.00, desc: "Poulet Tikka grillé mijoté au riz." },
    ],
    "Végétarien": [
      { nom: "Macédoine de Légumes", prix: 12.00, desc: "Légumes au curry et riz basmati.", veggie: true },
      { nom: "Baigan Bharta", prix: 12.50, desc: "Aubergines grillées au curry. Servi avec riz.", veggie: true },
      { nom: "Matar Paneer", prix: 12.00, desc: "Petits pois au fromage indien et riz.", veggie: true },
      { nom: "Allo Saag Paneer", prix: 12.00, desc: "Épinards, pommes de terre et fromage.", veggie: true },
      { nom: "Dal", prix: 12.00, desc: "Lentilles indiennes au curry. Servi avec riz.", veggie: true },
      { nom: "Légumes Masala", prix: 13.00, desc: "Légumes variés et coriandre fraîche.", veggie: true },
    ],
    "Pains & Galettes": [
      { nom: "Chapati", prix: 2.00, desc: "Farine complète cuite au tandoor.", veggie: true },
      { nom: "Naan Nature", prix: 2.00, desc: "Farine blanche cuite au tandoor.", veggie: true },
      { nom: "Naan Fromage", prix: 3.50, desc: "Fourré au fromage fondant.", veggie: true, badge: "⭐ Best-seller" },
      { nom: "Paratha", prix: 3.00, desc: "Farine complète au beurre.", veggie: true },
      { nom: "Paratha Stuffed", prix: 3.00, desc: "Farine complète farcie aux légumes.", veggie: true },
      { nom: "Naan Keema", prix: 4.00, desc: "Fourré à la viande hachée." },
      { nom: "Naan Ail", prix: 4.00, desc: "Ail frais, piments et coriandre.", veggie: true },
    ],
    "Boissons": [
      { nom: "Canette 33cl", prix: 2.50, desc: "Coca, Zéro, Fanta, Sprite, Oasis.", veggie: true },
      { nom: "Lassi Maison", prix: 4.50, desc: "Mangue, Rose ou Sucré.", veggie: true },
      { nom: "Eau Minérale 50cl", prix: 2.50, desc: "Vittel ou San Pellegrino.", veggie: true },
    ],
  },
};

// Suggestions upsell rapides (affichées pendant et avant checkout)
const UPSELL_SUGGESTIONS = [
  { nom: "Naan Fromage", cat: "Pains & Galettes", prix: 3.50, emoji: "🫓" },
  { nom: "Lassi Maison", cat: "Boissons", prix: 4.50, emoji: "🥛" },
  { nom: "Samosa Sabzi", cat: "Entrées", prix: 6.00, emoji: "🥟" },
  { nom: "Canette 33cl", cat: "Boissons", prix: 2.50, emoji: "🥤" },
];

const makeId = (cat, nom) => `${cat}::${nom}`;
const MENU_FLAT = Object.entries(restaurantData.menu).flatMap(([cat, plats]) =>
  plats.map((p) => ({ ...p, id: makeId(cat, p.nom), cat }))
);
const CATEGORIES = Object.keys(restaurantData.menu);

function sanitize(str, { maxLength = 200 } = {}) {
  if (typeof str !== "string") return "";
  return str.slice(0, maxLength).replace(/[<>"'`]/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").trim();
}
function validatePhone(tel) {
  return /^(\+33|0)[0-9 .\-]{8,14}$/.test(tel.replace(/\s/g, ""));
}

// ── SEO JSON-LD ──────────────────────────────────────────────────
const SEO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Taj Mahal Lorient",
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
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "12:00", closes: "14:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "19:00", closes: "22:00" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.3", reviewCount: "435" },
};

// ── Cart Context ─────────────────────────────────────────────────
const CartContext = createContext(null);
const STORAGE_KEY = "tj_cart_v5";

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists) return state.map((i) => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "DEC": {
      const item = state.find((i) => i.id === action.id);
      if (!item) return state;
      if (item.qty === 1) return state.filter((i) => i.id !== action.id);
      return state.map((i) => i.id === action.id ? { ...i, qty: i.qty - 1 } : i);
    }
    case "REMOVE": return state.filter((i) => i.id !== action.id);
    case "CLEAR": return [];
    default: return state;
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });

  // Toast upsell après ajout
  const [upsellToast, setUpsellToast] = useState(null);
  const upsellTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const baseTotal = cart.reduce((s, i) => s + i.prix * i.qty, 0);
  const discount = Math.round(baseTotal * DISCOUNT_RATE * 100) / 100;
  const grandTotal = Math.max(0, baseTotal - discount);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const addWithUpsell = useCallback((item) => {
    dispatch({ type: "ADD", item });
    // Suggère un accompagnement aléatoire non déjà dans le panier
    clearTimeout(upsellTimerRef.current);
    const cartIds = cart.map(c => c.nom);
    const suggestions = UPSELL_SUGGESTIONS.filter(s => s.nom !== item.nom && !cartIds.includes(s.nom));
    if (suggestions.length > 0) {
      const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
      setUpsellToast(pick);
      upsellTimerRef.current = setTimeout(() => setUpsellToast(null), 4000);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch, addWithUpsell, baseTotal, discount, grandTotal, count, upsellToast, setUpsellToast }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

// ── Toast Upsell ─────────────────────────────────────────────────
function UpsellToast() {
  const { upsellToast, setUpsellToast, addWithUpsell } = useCart();
  if (!upsellToast) return null;
  const menuItem = MENU_FLAT.find(i => i.nom === upsellToast.nom);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: 80, x: "-50%" }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-24 left-1/2 z-[100] bg-white border border-[#F4BB44]/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[320px] w-[90vw]"
      >
        <span className="text-2xl">{upsellToast.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[#1A0A00] font-bold text-xs leading-tight">Ajouter {upsellToast.nom} ?</p>
          <p className="text-[#A45C40] text-xs font-semibold">{upsellToast.prix.toFixed(2)} €</p>
        </div>
        <button
          onClick={() => { if (menuItem) addWithUpsell(menuItem); setUpsellToast(null); }}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#F4BB44] text-[#1A0A00] font-bold text-xs hover:brightness-105 transition"
        >
          Oui +
        </button>
        <button onClick={() => setUpsellToast(null)} className="text-[#6B4030]/40 hover:text-[#6B4030] text-xs">✕</button>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Vendredi Banner ──────────────────────────────────────────────
function FridayBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const now = new Date();
    if (now.getDay() === 5 && now.getHours() >= 17 && now.getHours() < 22) setVisible(true);
  }, []);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 18, delay: 1.5 }}
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#A45C40] to-[#F4BB44] text-[#1A0A00] text-center py-2 px-4 shadow-lg"
    >
      <p className="text-xs font-bold">🔥 Vendredi soir — Commandez maintenant pour être servi à l'heure !
        <button onClick={() => setVisible(false)} className="ml-3 underline text-[#1A0A00]/60 font-normal">Fermer</button>
      </p>
    </motion.div>
  );
}

// ── Menu Card ────────────────────────────────────────────────────
function MenuCard({ item }) {
  const { cart, dispatch, addWithUpsell } = useCart();
  const inCart = cart.find((i) => i.id === item.id);
  const [popped, setPopped] = useState(false);

  const handleAdd = useCallback(() => {
    addWithUpsell(item);
    setPopped(true);
    setTimeout(() => setPopped(false), 350);
  }, [addWithUpsell, item]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex flex-col bg-white border border-[#A45C40]/15 rounded-2xl overflow-hidden hover:border-[#F4BB44]/60 hover:shadow-md hover:shadow-[#F4BB44]/10 transition-all duration-300"
    >
      <div className="absolute top-2 left-2 flex gap-1 flex-wrap z-10">
        {item.badge && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F4BB44]/20 text-[#A45C40] border border-[#F4BB44]/40 uppercase tracking-wide">{item.badge}</span>
        )}
        {item.veggie && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">🌿 Veg</span>
        )}
        {item.spicy && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 uppercase tracking-wide">🌶 Épicé</span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 pt-8 gap-1.5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-[#1A0A00] text-sm leading-snug flex-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {item.nom}
          </h3>
          <span className="text-[#A45C40] font-bold text-sm shrink-0">{item.prix.toFixed(2)} €</span>
        </div>
        <p className="text-[#6B4030] text-xs leading-relaxed flex-1">{item.desc}</p>

        <div className="mt-auto pt-2">
          {inCart ? (
            <div className="flex items-center justify-between bg-[#F4BB44]/10 border border-[#F4BB44]/30 rounded-xl px-3 py-1.5">
              <button onClick={() => dispatch({ type: "DEC", id: item.id })} className="w-7 h-7 flex items-center justify-center text-[#A45C40] hover:bg-[#F4BB44]/20 rounded-lg font-bold transition">−</button>
              <span className="text-[#1A0A00] font-bold text-sm">{inCart.qty}</span>
              <button onClick={handleAdd} className="w-7 h-7 flex items-center justify-center text-[#A45C40] hover:bg-[#F4BB44]/20 rounded-lg font-bold transition">+</button>
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

// ── Menu Section ─────────────────────────────────────────────────
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
    <section id="menu" className="py-12 px-4 bg-[#FFFAF1]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <p className="text-[#A45C40]/80 text-xs uppercase tracking-[0.4em] mb-2">Notre carte complète</p>
          <h2 className="text-3xl md:text-4xl text-[#1A0A00]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Saveurs d'exception</h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#F4BB44] to-transparent mx-auto mt-3" />
          {/* Badge -10% bien visible */}
          <div className="inline-flex items-center gap-2 mt-4 bg-[#F4BB44]/20 border border-[#F4BB44]/40 text-[#A45C40] text-xs font-bold px-4 py-2 rounded-full">
            🎉 -10% sur toutes les commandes à emporter
          </div>
        </motion.div>

        <div ref={tabsRef} className="sticky top-[56px] z-20 flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none bg-gradient-to-b from-[#FFFAF1] via-[#FFFAF1]/95 to-transparent pt-2 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button key={cat} data-cat={cat} onClick={() => scrollTabIntoView(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${activeCat === cat ? "bg-[#F4BB44] text-[#1A0A00] border-[#F4BB44] shadow-sm" : "bg-white border-[#A45C40]/20 text-[#6B4030] hover:border-[#F4BB44]/60"}`}>
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => <MenuCard key={item.id} item={item} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ── Cart Drawer ──────────────────────────────────────────────────
function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch, baseTotal, discount, grandTotal, count } = useCart();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#1A0A00]/40 z-40 backdrop-blur-sm" />
          <motion.aside
            role="dialog" aria-modal="true" aria-label="Panier"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[360px] z-50 flex flex-col bg-[#FFFAF1] border-l border-[#A45C40]/20 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#A45C40]/15 bg-white">
              <div>
                <h2 className="text-[#1A0A00] font-bold text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Votre commande</h2>
                <p className="text-[#6B4030] text-xs">{count} article{count > 1 ? "s" : ""} · À emporter</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B4030] hover:bg-[#A45C40]/10 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-52 text-[#6B4030] gap-3">
                    <span className="text-4xl">🛒</span>
                    <p className="text-sm">Votre panier est vide</p>
                    <button onClick={onClose} className="text-xs text-[#A45C40] underline">Voir le menu</button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#A45C40]/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A0A00] truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{item.nom}</p>
                        <p className="text-xs font-bold text-[#A45C40]">{(item.prix * item.qty).toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => dispatch({ type: "DEC", id: item.id })} className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#A45C40]/10 text-[#6B4030] hover:bg-[#F4BB44]/20 transition text-sm font-bold">−</button>
                        <span className="text-[#1A0A00] text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => dispatch({ type: "ADD", item })} className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#A45C40]/10 text-[#6B4030] hover:bg-[#F4BB44]/20 transition text-sm font-bold">+</button>
                      </div>
                      <button onClick={() => dispatch({ type: "REMOVE", id: item.id })} className="text-[#6B4030]/30 hover:text-red-400 transition text-xs">✕</button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-[#A45C40]/15 bg-white space-y-3">
                {/* Récap prix */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#6B4030]">
                    <span>Sous-total</span>
                    <span>{baseTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#2D6A4F] font-semibold">
                    <span>🎉 Remise à emporter (-10%)</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#A45C40]/10">
                    <span className="text-[#1A0A00]">Total</span>
                    <span className="text-[#A45C40]">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
                <button onClick={onCheckout} className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] hover:brightness-105 active:scale-95 transition-all shadow-sm">
                  Commander — {grandTotal.toFixed(2)} €
                </button>
                <button onClick={() => dispatch({ type: "CLEAR" })} className="w-full text-xs text-[#6B4030]/40 hover:text-red-400 transition py-1">Vider le panier</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Upsell Checkout Screen ───────────────────────────────────────
function UpsellScreen({ onContinue }) {
  const { cart, addWithUpsell } = useCart();
  const cartNoms = cart.map(i => i.nom);
  const suggestions = MENU_FLAT.filter(i => UPSELL_SUGGESTIONS.some(u => u.nom === i.nom) && !cartNoms.includes(i.nom));
  const [added, setAdded] = useState([]);

  if (suggestions.length === 0) { onContinue(); return null; }

  return (
    <div className="min-h-screen bg-[#FFFAF1] flex flex-col px-4 py-8">
      <div className="max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-2xl mb-2">🍽</p>
          <h2 className="text-2xl text-[#1A0A00] font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Et pour accompagner ?</h2>
          <p className="text-[#6B4030] text-sm">Quelques suggestions avant de finaliser</p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {suggestions.map((item, i) => {
            const isAdded = added.includes(item.id);
            const upsellInfo = UPSELL_SUGGESTIONS.find(u => u.nom === item.nom);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-white border border-[#A45C40]/15 rounded-2xl p-4">
                <span className="text-3xl">{upsellInfo?.emoji}</span>
                <div className="flex-1">
                  <p className="text-[#1A0A00] font-semibold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{item.nom}</p>
                  <p className="text-[#A45C40] font-bold text-xs">{item.prix.toFixed(2)} €</p>
                </div>
                <button
                  onClick={() => { if (!isAdded) { addWithUpsell(item); setAdded(prev => [...prev, item.id]); } }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isAdded ? "bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/30" : "bg-gradient-to-r from-[#A45C40] to-[#F4BB44] text-white hover:brightness-105 active:scale-95"}`}
                >
                  {isAdded ? "✓ Ajouté" : "Ajouter"}
                </button>
              </motion.div>
            );
          })}
        </div>

        <button onClick={onContinue} className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] hover:brightness-105 active:scale-95 transition-all shadow-md">
          Continuer → Finaliser la commande
        </button>
        <button onClick={onContinue} className="w-full text-xs text-[#6B4030]/50 mt-2 py-2 hover:text-[#6B4030] transition">Non merci, continuer sans</button>
      </div>
    </div>
  );
}

// ── Checkout Page ────────────────────────────────────────────────
function CheckoutPage({ onBack }) {
  const { cart, baseTotal, discount, grandTotal, dispatch } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", phone: "", heure: "", note: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: sanitize(value, { maxLength: name === "note" ? 300 : 100 }) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = "Nom requis (min. 2 caractères)";
    if (!validatePhone(form.phone)) errs.phone = "Numéro invalide (ex : 06 12 34 56 78)";
    if (!form.heure) errs.heure = "Heure de retrait requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendSMSAndNotif = async (orderData) => {
    // Cette fonction appelle votre Edge Function Supabase "send-sms"
    // La Edge Function doit être créée dans votre dashboard Supabase :
    // supabase/functions/send-sms/index.ts
    // Elle envoie un SMS via Brevo ET une notification via ntfy.sh
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: orderData.customer_phone,
          name: orderData.customer_name,
          pickup_time: orderData.pickup_time,
          total: orderData.total,
          order_id: orderData.id,
        }
      });
    } catch (e) {
      console.warn("SMS/notif non envoyé (configurez Brevo + ntfy) :", e);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("orders").insert([{
        items: cart,
        base_total: baseTotal,
        discount: discount,
        total: grandTotal,
        mode: "pickup",
        customer_name: form.name,
        customer_phone: form.phone,
        pickup_time: form.heure,
        note: form.note || null,
        status: "pending",
      }]).select().single();
      if (error) throw error;
      await sendSMSAndNotif(data);
      setStep(2);
      dispatch({ type: "CLEAR" });
    } catch (err) {
      console.error("Erreur commande :", err);
      alert("Une erreur est survenue. Veuillez appeler le restaurant au 02 97 84 04 04.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen bg-[#FFFAF1] flex flex-col items-center justify-center text-center p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 12 }} className="text-6xl mb-6">🎉</motion.div>
        <h2 className="text-2xl text-[#1A0A00] font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Commande confirmée !</h2>
        <p className="text-[#6B4030] mb-1">À retirer à {form.heure} — environ 25-30 min de préparation.</p>
        <p className="text-[#A45C40] font-bold text-lg mb-2">Total payé : {grandTotal.toFixed(2)} €</p>
        <p className="text-[#2D6A4F] text-sm mb-8 font-semibold">🎉 Vous avez économisé {discount.toFixed(2)} € avec la remise à emporter !</p>
        <button onClick={onBack} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] font-bold hover:brightness-105 transition shadow-sm">
          Retour au menu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF1] py-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-[#6B4030] hover:text-[#A45C40] transition text-xl">←</button>
          <h1 className="text-[#1A0A00] text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Finaliser la commande</h1>
        </div>

        {/* Récap */}
        <div className="bg-white border border-[#A45C40]/15 rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-[#6B4030] uppercase tracking-wider mb-3">Récapitulatif · À emporter 🛍</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.id} className="flex justify-between text-xs">
                <span className="truncate mr-2 text-[#6B4030]">{i.nom} × {i.qty}</span>
                <span className="shrink-0 font-semibold text-[#1A0A00]">{(i.prix * i.qty).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#A45C40]/10 mt-3 pt-2 space-y-1">
            <div className="flex justify-between text-xs text-[#6B4030]">
              <span>Sous-total</span><span>{baseTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-[#2D6A4F] font-semibold">
              <span>🎉 Remise à emporter -10%</span><span>-{discount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1">
              <span className="text-[#1A0A00]">Total</span>
              <span className="text-[#A45C40]">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="space-y-4 mb-6">
          {[
            { name: "name", label: "Nom complet *", type: "text", placeholder: "Prénom Nom", auto: "name" },
            { name: "phone", label: "Téléphone *", type: "tel", placeholder: "06 XX XX XX XX", auto: "tel" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-[#6B4030] mb-1.5 uppercase tracking-wider font-medium">{f.label}</label>
              <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} autoComplete={f.auto}
                className={`w-full bg-white border rounded-xl px-4 py-3 text-[#1A0A00] text-sm placeholder:text-[#A45C40]/40 focus:outline-none transition shadow-sm ${errors[f.name] ? "border-red-400" : "border-[#A45C40]/20 focus:border-[#F4BB44]"}`} />
              {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
            </div>
          ))}

          {/* Créneaux */}
          <div>
            <label className="block text-xs text-[#6B4030] mb-2 uppercase tracking-wider font-medium">Heure de retrait *</label>
            {[
              { label: "🌞 Midi", slots: ["12h00","12h30","13h00","13h30","14h00"] },
              { label: "🌙 Soir", slots: ["19h00","19h30","20h00","20h30","21h00","21h30","22h00"] },
            ].map(({ label, slots }) => (
              <div key={label} className="mb-3">
                <p className="text-[10px] text-[#A45C40] uppercase tracking-wider font-semibold mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button key={slot} type="button"
                      onClick={() => { setForm((f) => ({ ...f, heure: slot })); setErrors((e) => ({ ...e, heure: "" })); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${form.heure === slot ? "bg-[#F4BB44] border-[#F4BB44] text-[#1A0A00] shadow-sm" : "bg-white border-[#A45C40]/20 text-[#6B4030] hover:border-[#F4BB44]/60"}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {errors.heure && <p className="text-red-500 text-xs mt-1">{errors.heure}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-[#6B4030] mb-1.5 uppercase tracking-wider font-medium">Instructions spéciales</label>
            <textarea name="note" placeholder="Allergie, sans piment, etc." value={form.note} onChange={handleChange} rows={2}
              className="w-full bg-white border border-[#A45C40]/20 rounded-xl px-4 py-3 text-[#1A0A00] text-sm placeholder:text-[#A45C40]/40 focus:outline-none focus:border-[#F4BB44] transition resize-none shadow-sm" />
          </div>
        </div>

        {/* Paiement sur place */}
        <div className="bg-white border border-[#A45C40]/15 rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-xs text-[#6B4030] uppercase tracking-wider mb-2">Paiement</p>
          <div className="flex items-center gap-3 p-3 border border-[#A45C40]/10 rounded-xl bg-[#FFFAF1]">
            <span className="text-lg">💵</span>
            <span className="text-sm text-[#6B4030]">Espèces ou carte au comptoir</span>
          </div>
        </div>

        <motion.button onClick={handleSubmit} disabled={loading || cart.length === 0} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] disabled:opacity-50 hover:brightness-105 active:scale-95 transition-all shadow-md">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Traitement en cours…
            </span>
          ) : `Confirmer — ${grandTotal.toFixed(2)} €`}
        </motion.button>
        <p className="text-center text-xs text-[#6B4030]/50 mt-3">🔒 Vos données sont sécurisées</p>
      </div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────
function Navbar({ onCartOpen }) {
  const { count, grandTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 transition-all duration-300 border-b ${scrolled ? "bg-[#FFFAF1]/95 backdrop-blur-md shadow-sm border-[#A45C40]/15" : "bg-transparent border-transparent"}`}>
      <span className="text-[#1A0A00] text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Taj Mahal <span className="text-[#A45C40]/60 text-xs font-normal hidden sm:inline">· Lorient</span>
      </span>
      <nav className="hidden md:flex items-center gap-5 text-sm text-[#6B4030]">
        <a href="#menu" className="hover:text-[#A45C40] transition font-medium">Menu</a>
        <a href="#histoire" className="hover:text-[#A45C40] transition font-medium">Notre histoire</a>
        <a href={`tel:${restaurantData.tel}`} className="hover:text-[#A45C40] transition font-medium">Réserver</a>
      </nav>
      <button onClick={onCartOpen} aria-label={`Panier (${count} articles)`}
        className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-[#A45C40] to-[#F4BB44] text-white hover:brightness-105 active:scale-95 transition-all shadow-sm">
        🛍 {count > 0 ? `${grandTotal.toFixed(2)} €` : "Panier"}
        <AnimatePresence>
          {count > 0 && (
            <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1A0A00] text-white text-[10px] rounded-full flex items-center justify-center font-black">
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero({ onOrder }) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#FFFAF1]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#F4BB44]/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#A45C40]/6 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#F4BB44]" />
          <span className="text-[#A45C40] text-xs uppercase tracking-[0.4em]">Restaurant Indien · Lorient</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#F4BB44]" />
        </div>

        <h1 className="text-5xl sm:text-7xl text-[#1A0A00] mb-2 leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Taj Mahal
        </h1>
        <p className="text-[#A45C40] text-sm tracking-widest mb-4 uppercase">Morbihan</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#F4BB44] to-transparent mx-auto mb-5" />
        <p className="text-[#6B4030] text-base md:text-lg max-w-md mx-auto mb-5 leading-relaxed">
          Saveurs authentiques du Pendjab, four tandoor à 400°C, épices torréfiées chaque matin.
        </p>

        {/* Badge -10% */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-[#F4BB44]/20 border border-[#F4BB44]/40 text-[#A45C40] text-sm font-bold px-5 py-2.5 rounded-full mb-6">
          🎉 -10% sur toutes les commandes à emporter
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onOrder}
            className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] shadow-lg shadow-[#F4BB44]/25 hover:brightness-105 transition-all">
            🛍 Commander à emporter
          </motion.button>
          <a href={`tel:${restaurantData.tel}`}
            className="px-8 py-4 rounded-xl font-semibold text-base border border-[#A45C40]/40 text-[#A45C40] hover:bg-[#A45C40]/8 transition-all flex items-center justify-center gap-2">
            📞 Réserver une table
          </a>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 text-sm text-[#6B4030]">
          <span>⭐ 4.3 / 5</span>
          <span className="w-px h-4 bg-[#A45C40]/30" />
          <span>435 avis Google</span>
          <span className="w-px h-4 bg-[#A45C40]/30" />
          <span>Ouvert 7j/7</span>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        <div className="w-5 h-8 border border-[#A45C40]/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#A45C40]/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

// ── Story Section ────────────────────────────────────────────────
function StorySection() {
  return (
    <section id="histoire" className="py-14 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
        <p className="text-[#A45C40]/80 text-xs uppercase tracking-[0.4em] mb-2">Notre engagement</p>
        <h2 className="text-3xl text-[#1A0A00]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>L'Authenticité avant tout</h2>
        <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#F4BB44] to-transparent mx-auto mt-3" />
      </motion.div>
      <div className="grid md:grid-cols-3 gap-5">
        {restaurantData.histoire.map((item, i) => (
          <motion.div key={item.titre} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
            className="bg-white border border-[#A45C40]/12 rounded-2xl p-6 text-center hover:border-[#F4BB44]/50 hover:shadow-md transition-all shadow-sm">
            <span className="text-4xl block mb-3">{item.emoji}</span>
            <h3 className="text-[#1A0A00] font-bold text-base mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{item.titre}</h3>
            <p className="text-[#6B4030] text-sm leading-relaxed">{item.texte}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Review Section ───────────────────────────────────────────────
function ReviewSection() {
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", damping: 10 }}
                className="text-[#F4BB44] text-3xl">★</motion.span>
            ))}
          </div>
          <p className="text-[#A45C40] text-xs uppercase tracking-[0.4em] mb-2">Programme fidélité</p>
            <h2 className="text-3xl text-[#1A0A00] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Un avis 5★ = un naan fromage offert</h2>
          <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#F4BB44] to-transparent mx-auto mb-5" />
          <p className="text-[#6B4030] text-sm leading-relaxed mb-7 max-w-md mx-auto">
            Vous avez apprécié votre repas ? Laissez-nous un avis <strong className="text-[#1A0A00]">5 étoiles sur Google</strong> et recevez un <strong className="text-[#1A0A00]">naan fromage offert</strong> à votre prochaine visite. Mentionnez simplement votre avis au comptoir.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { num: "1", icon: "📱", text: "Cliquez sur le bouton ci-dessous" },
              { num: "2", icon: "⭐", text: "Laissez un avis 5 étoiles" },
              { num: "3", icon: "🍮", text: "Réclamez votre dessert au comptoir" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F4BB44] text-[#1A0A00] flex items-center justify-center text-xs font-black">{s.num}</div>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-[#6B4030] text-xs leading-snug">{s.text}</p>
              </div>
            ))}
          </div>

          <motion.a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] shadow-lg hover:brightness-105 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Laisser un avis Google 5★
          </motion.a>
          <p className="text-[#6B4030]/50 text-xs mt-4">⭐ <span className="font-semibold text-[#6B4030]">435 avis</span> · Note moyenne <span className="font-semibold text-[#6B4030]">4.3/5</span> — Aidez-nous à atteindre 500 avis !</p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Google Maps Embed ─────────────────────────────────────────────
function MapSection() {
  return (
    <section className="py-10 px-4 bg-[#FFFAF1]">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5">
          <h2 className="text-2xl text-[#1A0A00] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Nous trouver</h2>
          <p className="text-[#6B4030] text-sm mt-1">{restaurantData.adresse}</p>
        </motion.div>
        <div className="rounded-2xl overflow-hidden border border-[#A45C40]/15 shadow-sm h-56">
          <iframe
            title="Taj Mahal Lorient"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2685.5!2d-3.3699!3d47.7481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s17+Boulevard+Franchet+d%27Esp%C3%A9rey%2C+56100+Lorient!5e0!3m2!1sfr!2sfr!4v1`}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <a href="https://maps.apple.com/?q=17+Boulevard+Franchet+d%27Esp%C3%A9rey+Lorient" target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold border border-[#A45C40]/20 text-[#A45C40] hover:bg-[#A45C40]/8 transition">
            🗺 Apple Maps
          </a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=17+Boulevard+Franchet+d%27Esperey+56100+Lorient" target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold border border-[#A45C40]/20 text-[#A45C40] hover:bg-[#A45C40]/8 transition">
            📍 Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#A45C40]/12 py-10 px-4 text-center bg-white">
      <p className="text-[#1A0A00] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Taj Mahal</p>
      <p className="text-[#6B4030] text-sm mb-1">{restaurantData.adresse}</p>
      <a href={`tel:${restaurantData.tel}`} className="text-[#6B4030] text-sm hover:text-[#A45C40] transition block mb-1">02 97 84 04 04</a>
      <p className="text-[#6B4030] text-sm mb-5">Tous les jours : 12h–14h · 19h–22h</p>
      <div className="flex justify-center gap-4 text-xs text-[#A45C40]/60">
        <a href="/mentions-legales" className="hover:text-[#A45C40] transition">Mentions légales</a>
        <span>·</span>
        <a href="/cgv" className="hover:text-[#A45C40] transition">CGV</a>
        <span>·</span>
        <a href="/confidentialite" className="hover:text-[#A45C40] transition">Confidentialité</a>
      </div>
      <p className="text-[#A45C40]/40 text-xs mt-4">© {new Date().getFullYear()} Taj Mahal Lorient</p>
    </footer>
  );
}

// ── Admin ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "Nouveau",        color: "bg-amber-100 text-amber-800 border-amber-200",  next: "preparing", nextLabel: "→ En préparation" },
  preparing: { label: "En préparation", color: "bg-blue-100 text-blue-800 border-blue-200",     next: "ready",     nextLabel: "→ Prêt !" },
  ready:     { label: "Prêt !",         color: "bg-green-100 text-green-800 border-green-200",  next: "done",      nextLabel: "→ Archiver" },
  done:      { label: "Terminé",        color: "bg-gray-100 text-gray-500 border-gray-200",     next: null,        nextLabel: null },
};

function AdminLogin({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) { onLogin(); }
    else { setError(true); setPin(""); setTimeout(() => setError(false), 1500); }
  };
  return (
    <div className="min-h-screen bg-[#FFFAF1] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-[#A45C40]/15 p-8 w-full max-w-sm text-center">
        <p className="text-3xl mb-4">🔐</p>
        <h1 className="text-[#1A0A00] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Dashboard Admin</h1>
        <p className="text-[#6B4030] text-sm mb-6">Taj Mahal Lorient</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Code PIN" autoFocus
            className={`w-full text-center text-2xl tracking-[0.5em] bg-[#FFFAF1] border rounded-xl px-4 py-3 text-[#1A0A00] focus:outline-none transition ${error ? "border-red-400 animate-pulse" : "border-[#A45C40]/20 focus:border-[#F4BB44]"}`} />
          {error && <p className="text-red-500 text-sm">Code incorrect</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] font-bold hover:brightness-105 transition">Accéder</button>
        </form>
      </motion.div>
    </div>
  );
}

function OrderCard({ order, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const time = new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const [updating, setUpdating] = useState(false);

  const handleNext = async () => {
    if (!cfg.next) return;
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ status: cfg.next }).eq("id", order.id);
    if (!error) onStatusChange(order.id, cfg.next);
    setUpdating(false);
  };

  const handlePrint = () => {
    const items = (order.items || []).map(i => `<tr><td style="padding:1px 0">${i.nom} × ${i.qty}</td><td style="text-align:right">${(i.prix * i.qty).toFixed(2)} €</td></tr>`).join("");
    const noteRow = order.note ? `<p style="margin:6px 0;padding:4px 6px;background:#fff8e1;border:1px solid #f9a825;border-radius:4px;font-size:11px">⚠ ${order.note}</p>` : "";
    const win = window.open("", "_blank", "width=340,height=600");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; padding: 8px; color: #000; }
      h1 { font-size: 16px; text-align: center; font-weight: bold; margin-bottom: 2px; }
      .sub { font-size: 10px; text-align: center; margin-bottom: 6px; color: #444; }
      hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .discount { font-size: 11px; text-align: right; color: #2D6A4F; }
      .total { font-size: 14px; font-weight: bold; text-align: right; margin-top: 4px; }
      .footer { text-align: center; font-size: 10px; margin-top: 8px; }
      @media print { @page { margin: 0; size: 80mm auto; } }
    </style></head><body>
      <h1>TAJ MAHAL</h1>
      <div class="sub">Restaurant Indien — Lorient<br>02 97 84 04 04</div>
      <hr>
      <div style="font-size:11px;margin-bottom:4px">
        <strong>${order.customer_name}</strong> — 📞 ${order.customer_phone}<br>
        🕐 Retrait à <strong>${order.pickup_time}</strong> — ${date} ${time}<br>
        Commande #${order.id.slice(-6).toUpperCase()}
      </div>
      <hr>
      <table>${items}</table>
      <hr>
      <div class="discount">Remise à emporter -10% : -${Number(order.discount || 0).toFixed(2)} €</div>
      <div class="total">TOTAL : ${Number(order.total).toFixed(2)} €</div>
      ${noteRow}
      <hr>
      <div class="footer">Merci pour votre commande !<br>Un avis Google 5★ = un naan fromage offert ⭐</div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border shadow-sm p-4 ${order.status === "done" ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[#1A0A00] font-bold text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{order.customer_name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B4030]">
            <a href={`tel:${order.customer_phone}`} className="hover:text-[#A45C40] transition">📞 {order.customer_phone}</a>
            <span>·</span><span>🕐 {order.pickup_time}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#A45C40] font-bold text-lg">{Number(order.total).toFixed(2)} €</p>
          <p className="text-[#6B4030]/50 text-xs">{time}</p>
          <button onClick={handlePrint} className="text-[10px] px-2 py-1 rounded-lg border border-[#A45C40]/20 text-[#6B4030] hover:bg-[#F4BB44]/10 transition mt-1">🖨 Imprimer</button>
        </div>
      </div>

      <div className="bg-[#FFFAF1] rounded-xl p-3 mb-3 space-y-1">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-[#1A0A00]">{item.nom} × {item.qty}</span>
            <span className="text-[#6B4030]">{(item.prix * item.qty).toFixed(2)} €</span>
          </div>
        ))}
        {order.discount > 0 && (
          <div className="flex justify-between text-xs text-[#2D6A4F] font-semibold border-t border-[#A45C40]/10 pt-1">
            <span>Remise à emporter -10%</span><span>-{Number(order.discount).toFixed(2)} €</span>
          </div>
        )}
      </div>

      {order.note && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-3">⚠ {order.note}</p>}

      {cfg.next && (
        <button onClick={handleNext} disabled={updating} className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#F4BB44] to-[#e8a832] text-[#1A0A00] hover:brightness-105 active:scale-95 transition disabled:opacity-50">
          {updating ? "…" : cfg.nextLabel}
        </button>
      )}
    </motion.div>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new, ...prev]);
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
          } catch {}
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map(o => o.id === payload.new.id ? payload.new : o));
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleStatusChange = (id, newStatus) => setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  const activeOrders = orders.filter(o => o.status !== "done");
  const doneOrders = orders.filter(o => o.status === "done");
  const displayed = filter === "active" ? activeOrders : doneOrders;
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#FFFAF1]">
      <header className="bg-white border-b border-[#A45C40]/15 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-[#1A0A00] font-bold text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Taj Mahal — Commandes</h1>
          <p className="text-[#6B4030] text-xs">
            {activeOrders.length} en cours
            {pendingCount > 0 && <span className="ml-2 bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingCount} nouvelle{pendingCount > 1 ? "s" : ""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[#6B4030] text-xs">Live</span>
        </div>
      </header>

      <div className="px-4 pt-4 flex gap-2">
        {[{ k: "active", label: `🔔 En cours (${activeOrders.length})` }, { k: "done", label: `✅ Terminées (${doneOrders.length})` }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${filter === f.k ? "bg-[#F4BB44] border-[#F4BB44] text-[#1A0A00]" : "bg-white border-[#A45C40]/20 text-[#6B4030]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {loading ? <div className="text-center py-12 text-[#6B4030]">Chargement…</div> :
          displayed.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">{filter === "active" ? "🎉" : "📦"}</p>
              <p className="text-[#6B4030] text-sm">{filter === "active" ? "Aucune commande en cours" : "Aucune commande archivée"}</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayed.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />)}
            </AnimatePresence>
          )}
      </div>
    </div>
  );
}

function AdminPage() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem("tj_admin") === "1");
  if (!auth) return <AdminLogin onLogin={() => { sessionStorage.setItem("tj_admin", "1"); setAuth(true); }} />;
  return <AdminDashboard />;
}

// ── App Root ─────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState(() => window.location.search.includes("admin") ? "admin" : "home");
  const [cartOpen, setCartOpen] = useState(false);
  // "home" | "upsell" | "checkout" | "admin"

  const openCheckout = useCallback(() => { setCartOpen(false); setPage("upsell"); }, []);
  const goCheckout = useCallback(() => setPage("checkout"), []);
  const goHome = useCallback(() => setPage("home"), []);

  if (page === "admin") return <AdminPage />;

  return (
    <CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_JSON_LD) }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />

      <UpsellToast />
      <FridayBanner />

      {page === "upsell" && <UpsellScreen onContinue={goCheckout} />}
      {page === "checkout" && <CheckoutPage onBack={goHome} />}
      {page === "home" && (
        <div className="min-h-screen bg-[#FFFAF1] text-[#1A0A00] font-sans antialiased">
          <Navbar onCartOpen={() => setCartOpen(true)} />
          <main>
            <Hero onOrder={() => setCartOpen(true)} />
            <StorySection />
            <ReviewSection />
            <MenuSection />
            <MapSection />
          </main>
          <Footer />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={openCheckout} />
        </div>
      )}
    </CartProvider>
  );
}

export default App;

// ═══════════════════════════════════════════════════════════════
// EDGE FUNCTION SUPABASE "send-sms"
// À créer dans : supabase/functions/send-sms/index.ts
// ═══════════════════════════════════════════════════════════════
//
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
//
// serve(async (req) => {
//   const { phone, name, pickup_time, total, order_id } = await req.json()
//
//   const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")
//   const NTFY_TOPIC = Deno.env.get("NTFY_TOPIC") // ex: "tajmahal-commandes-XXXX"
//
//   // 1. SMS client via Brevo
//   const smsMessage = `Taj Mahal Lorient - Commande #${order_id.slice(-6).toUpperCase()} confirmée ! Retrait à ${pickup_time}. Total : ${total}€. À tout de suite !`
//   await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
//     method: "POST",
//     headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
//     body: JSON.stringify({
//       sender: "TajMahal",
//       recipient: phone.replace(/\s/g, "").replace(/^0/, "+33"),
//       content: smsMessage,
//       type: "transactional"
//     })
//   })
//
//   // 2. Notification push iPhone via ntfy.sh
//   await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
//     method: "POST",
//     headers: {
//       "Title": `🛍 Nouvelle commande — ${name}`,
//       "Priority": "high",
//       "Tags": "bell,curry"
//     },
//     body: `${name} · Retrait ${pickup_time} · ${total}€ · #${order_id.slice(-6).toUpperCase()}`
//   })
//
//   return new Response("ok", { status: 200 })
// })
// ═══════════════════════════════════════════════════════════════
