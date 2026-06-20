import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Phone, 
  HelpCircle,
  Truck, 
  ArrowRight,
  ShoppingCart,
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  X,
  Lock,
  MessageSquare
} from 'lucide-react';
import { Product, CartItem, Order } from './types';
import { INITIAL_PRODUCTS, ALGERIAN_WILAYAS } from './data/mockProducts';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import BuyerOrderPortal from './components/BuyerOrderPortal';

const SELLER_PHONE = '0558926754';

// Seed initial orders to make the admin dashboard look fully functional and dynamic
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-982341',
    transactionId: 'TXN-73489123',
    customerName: 'Karim Zerrouki',
    customerPhone: '0661223344',
    customerAddress: 'Cité des Amandiers, Villa 42',
    customerWilaya: '31 - Oran',
    items: [
      {
        productId: 'prod-2',
        name: 'Casque Sans Fil Réducteur de Bruit Sony WH-1000XM5',
        price: 54000,
        quantity: 1
      }
    ],
    totalAmount: 54600,
    paymentMethod: 'edahabia',
    paymentStatus: 'verified',
    orderStatus: 'shipped',
    transactionDate: '18 Juin 2026, 14:32',
    otpVerified: true
  },
  {
    id: 'ORD-129483',
    transactionId: 'TXN-90124832',
    customerName: 'Yacine Belkacem',
    customerPhone: '0772445566',
    customerAddress: 'Quartier Bellevue, Imm B, Esc 3, Appt 12',
    customerWilaya: '25 - Constantine',
    items: [
      {
        productId: 'prod-5',
        name: 'Sac à Dos Premium Antivol Ergonomique BANGE',
        price: 7800,
        quantity: 1
      }
    ],
    totalAmount: 8350,
    paymentMethod: 'baridimob',
    paymentStatus: 'pending',
    orderStatus: 'received',
    transactionDate: '19 Juin 2026, 09:15',
    receiptScreenshot: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    otpVerified: false
  }
];

export default function App() {
  // Products state (persisted)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('univers_shop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders state (persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('univers_shop_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('univers_shop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPortalOpen, setIsOrderPortalOpen] = useState(false);
  
  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Save states to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('univers_shop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('univers_shop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('univers_shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Categories list derived from current products catalog
  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];

  // Cart management operations
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        if (item.quantity >= product.stock) {
          alert('Stock maximum atteint pour ce produit !');
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, amount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const nextQuantity = item.quantity + amount;
          if (nextQuantity <= 0) return null;
          if (nextQuantity > item.product.stock) {
            alert('Quantité maximum pour le stock de cet article !');
            return item;
          }
          return { ...item, quantity: nextQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Product CRUD management (called from admin)
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'salesCount' | 'createdAt'>) => {
    const productWithId: Product = {
      ...newProd,
      id: 'prod-' + (products.length + 1) + '-' + Math.floor(Math.random() * 1000),
      salesCount: 0,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [productWithId, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Voulez-vous vraiment retirer cet article d\'Univers Shop ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Orders status Updates (called from admin panel or buyer tracking)
  const handleUpdateOrderFields = (orderId: string, fields: Partial<Order>) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, ...fields };
        
        // If order gets delivered, deduct stock from products to make simulation realistic!
        if (fields.orderStatus === 'delivered' && order.orderStatus !== 'delivered') {
          order.items.forEach(orderItem => {
            setProducts(currentProducts => currentProducts.map(p => {
              if (p.id === orderItem.productId) {
                return { ...p, stock: Math.max(0, p.stock - orderItem.quantity), salesCount: p.salesCount + orderItem.quantity };
              }
              return p;
            }));
          });
        }
        
        // If a return is APPROVED, restock returned products to make it efficient & realistic!
        if (fields.returnStatus === 'approved' && order.returnStatus !== 'approved') {
          order.items.forEach(orderItem => {
            setProducts(currentProducts => currentProducts.map(p => {
              if (p.id === orderItem.productId) {
                return { ...p, stock: p.stock + orderItem.quantity, salesCount: Math.max(0, p.salesCount - orderItem.quantity) };
              }
              return p;
            }));
          });
          updated.orderStatus = 'returned';
        }
        
        return updated;
      }
      return order;
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    handleUpdateOrderFields(orderId, { orderStatus: status });
  };

  const handleUpdatePaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    handleUpdateOrderFields(orderId, { paymentStatus: status });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    try {
      const myOrders = JSON.parse(localStorage.getItem('univers_shop_my_orders') || '[]');
      myOrders.push(newOrder.id);
      localStorage.setItem('univers_shop_my_orders', JSON.stringify(myOrders));
    } catch (e) {
      console.warn("Could not save new order locally:", e);
    }
  };

  // Filtering products for listing
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Dynamic Security Ribbon */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold tracking-wide uppercase">Paiements 100% Chiffrés et Sécurisés par CIB / Edahabia</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 font-sans">
            <span>Achat Direct (CCP & BaridiMob)</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-sky-400">
              <Phone className="w-3 h-3" />
              Service Client Algérien : <b>0558926754</b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar 
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={setIsAdmin}
        onOpenOrderPortal={() => setIsOrderPortalOpen(true)}
        sellerPhone={SELLER_PHONE}
      />

      {/* Primary viewport switch */}
      {isAdmin ? (
        <AdminPanel 
          products={products}
          orders={orders}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onUpdateOrderFields={handleUpdateOrderFields}
          sellerPhone={SELLER_PHONE}
        />
      ) : (
        /* CLIENT STOREFRONT VIEW */
        <main className="flex-grow animate-fade-in py-4">
          {/* Custom Elegant Hero Banner with Vibrant linear gradient */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 mt-2">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0052FF] to-[#0035A3] shadow-lg text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
              <div className="px-6 py-10 md:py-14 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/10 uppercase tracking-widest leading-none">
                    <Lock className="w-3 h-3 text-sky-200" /> Boutiques Assurées SSL
                  </span>
                  <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                    Achetez en Sécurité en <span className="underline decoration-white/30 decoration-wavy">Dinars Algériens</span>
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-lg">
                    Profitez d'une expérience e-commerce premium sur <b>Univers Shop</b>. Ajoutez au panier, simulez votre paiement sécurisé ou réglez par BaridiMob, et faites-vous livrer chez vous dans les 58 wilayas d'Algérie !
                  </p>

                  {/* Secure Trust stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="font-display font-black text-white text-lg tracking-tight">58 Wilayas</p>
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Livraison Rapide d'expédition</p>
                    </div>
                    <div>
                      <p className="font-display font-black text-white text-lg tracking-tight">CIB & Baridi</p>
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Paiement Garanti</p>
                    </div>
                    <div>
                      <p className="font-display font-black text-white text-lg tracking-tight">24h/24 Support</p>
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Au 0558926754</p>
                    </div>
                  </div>
                </div>

                {/* Promo Banner / Illustration block */}
                <div className="hidden md:flex relative h-72 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 items-center justify-center p-8 group">
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="inline-flex p-4 bg-white/15 text-white rounded-full mb-1">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">Achetez en Confiance sur Univers Shop</h3>
                    <p className="text-[11px] text-white/85 leading-normal">
                      La sécurité de vos fonds est assurée. Nous supportons la vérification par OTP Card et le dépôt sécurisé d'avoirs au compte de virement. 
                    </p>
                    <a href={`tel:${SELLER_PHONE}`} className="inline-flex items-center gap-1.5 text-xs text-[#0052FF] font-bold bg-white hover:bg-slate-50 px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer">
                      <Phone className="w-3.5 h-3.5" />
                      Appel Direct : {SELLER_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Stores Items Catalog */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Category Tags selection bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-150 pb-6">
              {/* Sliders categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-sky-50 border-sky-200/60 text-sky-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sky-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Standard text search */}
              <div className="w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Rechercher un modèle, une marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Empty states or Catalog view */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs max-w-md mx-auto">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Aucun produit disponible dans cette étagère.</p>
                <p className="text-xs text-slate-400 mt-1">Gérez vos articles en accédant à l'Espace Vendeur en haut à droite !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Shopping Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative border-l border-slate-100 animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                <h2 className="font-display font-bold text-slate-900 text-base">Votre Panier d'Achat</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 px-2.5 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition-all text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Contents */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300" />
                  <p className="font-semibold text-sm">Votre panier d'achats est vide.</p>
                  <p className="text-xs text-slate-400 max-w-xs">Parcourez le catalogue Univers Shop et dénichez des pépites exceptionnelles.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-55/40 hover:bg-slate-50 transition-colors">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-150 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-xs truncate">{item.product.name}</h4>
                      <p className="text-slate-500 font-bold text-xs mt-1">{item.product.price.toLocaleString('fr-DZ')} DA</p>

                      {/* Quantity tools */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-slate-200 bg-slate-100 rounded text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-slate-200 bg-slate-100 rounded text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Sous-total des articles</span>
                  <span className="font-black text-slate-900 text-lg font-mono">{cartTotal.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="text-[10px] text-slate-400 text-center leading-normal">
                  💡 Les frais d'expédition d'Algérie Poste s'appliqueront lors de checkout sécurisé selon la Wilaya.
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-sky-600/10 hover:shadow-sky-600/20"
                >
                  <span>Passer à la Caisse Sécurisée</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main secure Checkout side panel drawer */}
      {isCheckoutOpen && (
        <Checkout 
          cart={cart}
          onClearCart={handleClearCart}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
          sellerPhone={SELLER_PHONE}
        />
      )}

      {/* Buyer's Order history & live logistics tracking viewport */}
      {isOrderPortalOpen && (
        <BuyerOrderPortal 
          orders={orders}
          onUpdateOrderFields={handleUpdateOrderFields}
          onClose={() => setIsOrderPortalOpen(false)}
          sellerPhone={SELLER_PHONE}
        />
      )}

      {/* Universal footer */}
      <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            {/* Column 1 */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-white text-base">Univers Shop</h4>
              <p className="text-xs leading-relaxed">
                Une e-boutique moderne et fiable conçue pour offrir les meilleures garanties de paiement et d'expédition sécurisées en Algérie.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-900/25 border border-emerald-800/60 px-3 py-1 rounded-sm max-w-max">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sécurité SSL (AES-256) Installée</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3 font-sans">
              <h4 className="font-display font-medium text-white text-xs uppercase tracking-wider">Contact & Commandes</h4>
              <p className="text-xs">
                Vous préférez commander par téléphone ou sur WhatsApp ? Contactez-nous à tout moment.
              </p>
              <div className="flex flex-col gap-1">
                <a href={`tel:${SELLER_PHONE}`} className="text-sm font-bold text-white hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-400" />
                  <span>{SELLER_PHONE}</span>
                </a>
                <p className="text-[10px] text-slate-500">Appels directs & Validation de bordereaux 7j/7</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <h4 className="font-display font-medium text-white text-xs uppercase tracking-wider">Expédition 58 Wilayas</h4>
              <p className="text-xs leading-relaxed">
                Notre logistique dessert toutes les régions d'Algérie : Alger, Oran, Constantine, Sétif, Ghardaïa, Tindouf, etc. avec tarification d'expédition transparente intégrée à la caisse.
              </p>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-xs text-slate-500">
            <p>&copy; 2026 Univers Shop. Tous droits réservés.</p>
            <p className="flex items-center gap-1 text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Cryptage cryptographique de bout en bout</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
