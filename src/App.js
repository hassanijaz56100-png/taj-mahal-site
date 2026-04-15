
import React, { useState, useReducer, createContext, useContext } from "react";

// --- LOGIQUE PANIER ---
const CartContext = createContext();
const cartReducer = (state, action) => {
  if (action.type === "ADD") {
    const exists = state.find(i => i.id === action.item.id);
    return exists ? state.map(i => i.id === action.item.id ? {...i, qty: i.qty + 1} : i) : [...state, {...action.item, qty: 1}];
  }
  if (action.type === "DEC") {
    const item = state.find(i => i.id === action.id);
    return item?.qty === 1 ? state.filter(i => i.id !== action.id) : state.map(i => i.id === action.id ? {...i, qty: i.qty - 1} : i);
  }
  return state;
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const total = cart.reduce((s, i) => s + i.prix * i.qty, 0);
  const naanOffert = total >= 35;
  const grandTotal = total > 0 && total < 25 ? total + 2.5 : total;
  return (
    <CartContext.Provider value={{ cart, dispatch, total, grandTotal, naanOffert, count: cart.reduce((s, i) => s + i.qty, 0) }}>
      {children}
    </CartContext.Provider>
  );
};

// --- COMPOSANTS INTERFACE ---
const MenuSection = () => {
  const { dispatch } = useContext(CartContext);
  const plats = [
    { id: 1, nom: "Butter Chicken", prix: 14.00, desc: "Sauce onctueuse crème et beurre." },
    { id: 2, nom: "Poulet Tikka Masala", prix: 14.00, desc: "Grillé avec poivrons et épices." },
    { id: 3, nom: "Biryani Poulet", prix: 14.00, desc: "Riz épicé aux 25 épices." },
    { id: 4, nom: "Naan Fromage", prix: 3.50, desc: "Le classique fondant." }
  ];
  return (
    <div className="p-4 grid gap-4 max-w-2xl mx-auto">
      {plats.map(p => (
        <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold">{p.nom}</h3>
            <p className="text-xs text-gray-500">{p.prix.toFixed(2)}€</p>
          </div>
          <button onClick={() => dispatch({ type: "ADD", item: p })} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold"> + </button>
        </div>
      ))}
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, dispatch, grandTotal, naanOffert } = useContext(CartContext);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#FFFAF1] h-full shadow-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Ma Commande</h2>
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
              <span className="text-sm font-bold">{item.qty}x {item.nom}</span>
              <div className="flex gap-3">
                <button onClick={() => dispatch({ type: "DEC", id: item.id })} className="text-orange-600 font-bold"> - </button>
                <button onClick={() => dispatch({ type: "ADD", item })} className="text-orange-600 font-bold"> + </button>
              </div>
            </div>
          ))}
          {naanOffert && <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-bold">🎁 Naan Fromage Offert !</div>}
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-bold text-xl"><span>Total</span><span>{grandTotal.toFixed(2)}€</span></div>
          <button className="w-full bg-black text-white py-4 rounded-2xl font-bold">Commander maintenant</button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { count, grandTotal } = useContext(CartContext);
  return (
    <div className="min-h-screen bg-[#FFFAF1] font-sans text-gray-900">
      <nav className="p-4 bg-white border-b border-orange-100 sticky top-0 flex justify-between items-center z-40">
        <h1 className="font-black text-orange-800 text-xl">TAJ MAHAL</h1>
        <button onClick={() => setIsCartOpen(true)} className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">
          Panier ({count}) • {grandTotal.toFixed(2)}€
        </button>
      </nav>
      <div className="py-8 text-center">
        <h2 className="text-3xl font-bold">L'Art de l'Inde à Lorient</h2>
        <p className="text-orange-600 text-sm">Naan Fromage offert dès 35€ !</p>
      </div>
      <MenuSection />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function WrappedApp() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}
