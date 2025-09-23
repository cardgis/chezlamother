"use client";
import React, { useState, useEffect } from 'react';
import CartModal from './CartModal';
import { cart } from '../utils/cart';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setCartCount(cart.getTotalItems());
    const update = items => setCartCount(items.reduce((t, i) => t + i.quantity, 0));
    cart.addListener(update);
    // Gestion utilisateur connecté avec expiration
    const checkUser = () => {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        if (userObj.expiresAt && Date.now() > userObj.expiresAt) {
          localStorage.removeItem("currentUser");
          setUser(null);
        } else {
          setUser(userObj);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => cart.removeListener(update);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/");
  };

  return (
    <div>
      <header className="py-6 px-4 flex justify-between items-center fixed top-0 left-0 w-full bg-white z-50 shadow">
        <div className="flex flex-row items-center w-full">
          <div>
            <p className="text-2xl sm:text-3xl font-bold">
              <span className="text-black">Chez la</span> <span className="text-green-800">Mother</span>
            </p>
          </div>
          {/* Section info livraison desktop */}
          {/* ...rien ici, section supprimée... */}
        {/* Menu desktop */}
          <nav className="hidden md:block ml-auto">
            <ul className="flex flex-row space-x-6 justify-end items-center">
            <li><a href="#menu" className="text-black hover:text-green-800 transition-colors font-medium">Menu</a></li>
            <li><a href="#about" className="text-black hover:text-green-800 transition-colors font-medium">À Propos</a></li>
            <li><a href="#contact" className="text-black hover:text-green-800 transition-colors font-medium">Contact</a></li>
            <li>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-gray-200 text-gray-900 py-2 inline-flex justify-center items-center px-4 rounded-lg hover:bg-gray-300 hover:text-gray-800 relative transition-colors"
              >
                🛒 Panier
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-800 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li>
                    <a 
                      href="/admin/payments" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      💳 Paiements
                    </a>
                  </li>
                )}
                {user.role === 'admin' && (
                  <li>
                    <a 
                      href="/admin/orders" 
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      🍽️ Cuisine
                    </a>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <li>
                <a href="/auth/login" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold">Connexion</a>
              </li>
            )}
          </ul>
        </nav>
        </div>
        {/* Menu burger mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none text-3xl"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
        </div>
      </header>
      <div className="mt-24"></div>
      {/* Menu mobile drawer */}
      {isMenuOpen && (
        <nav className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col items-center justify-center shadow-lg">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-6 text-3xl text-black"
            aria-label="Fermer le menu"
          >
            ×
          </button>
          <ul className="flex flex-col space-y-8 text-xl font-bold">
            <li><a href="#menu" className="text-black hover:text-green-800 transition-colors" onClick={() => setIsMenuOpen(false)}>Menu</a></li>
            <li><a href="#about" className="text-black hover:text-green-800 transition-colors" onClick={() => setIsMenuOpen(false)}>À Propos</a></li>
            <li><a href="#contact" className="text-black hover:text-green-800 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
            <li>
              <button
                onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                className="bg-gray-200 text-gray-900 py-2 px-6 rounded-lg hover:bg-gray-300 hover:text-gray-800 relative transition-colors"
              >
                🛒 Panier
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-800 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
            {user ? (
              <li>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Déconnexion
                </button>
              </li>
            ) : (
              <li>
                <a href="/auth/login" className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>Connexion</a>
              </li>
            )}
          </ul>
        </nav>
      )}
      {user && (
        <div className="flex justify-center items-center mt-2 mb-2">
          <h2 className="text-2xl font-bold text-center animate-bounce text-black">
            {`Bienvenue, `}
            {user.name.split('').map((char, i) => (
              <span
                key={i}
                className={`inline-block transition-all duration-300 ease-in-out px-1 rounded ${i % 2 === 0 ? 'text-green-700' : 'text-green-400'} hover:scale-125 hover:bg-green-100`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {char}
              </span>
            ))}
            <span className="ml-2 text-green-600 animate-pulse">!</span>
          </h2>
        </div>
      )}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Header;
