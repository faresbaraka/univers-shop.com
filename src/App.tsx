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
import { Product, CartItem, Order, StoreSettings } from './types';
import { INITIAL_PRODUCTS, ALGERIAN_WILAYAS } from './data/mockProducts';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import BuyerOrderPortal from './components/BuyerOrderPortal';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

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
  // Products state (persisted on Firestore with localStorage as instant fast-loading fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.warn("Could not parse products from localstorage:", e);
      return INITIAL_PRODUCTS;
    }
  });

  // Orders state (persisted on Firestore with localStorage as instant fast-loading fallback)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch (e) {
      console.warn("Could not parse orders from localstorage:", e);
      return INITIAL_ORDERS;
    }
  });

  // Shop settings (synchronized with Firestore in real-time)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_settings');
      return saved ? JSON.parse(saved) : {
        storeName: 'Univers Shop',
        logoUrl: '/logo_univers_shop.jpg',
        sellerPhone: '0558926754'
      };
    } catch (e) {
      console.warn("Could not parse settings from localstorage:", e);
      return {
        storeName: 'Univers Shop',
        logoUrl: '/logo_univers_shop.jpg',
        sellerPhone: '0558926754'
      };
    }
  });

  // Cart state (local user storage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Could not parse cart from localstorage:", e);
      return [];
    }
  });

  // UI state (Persist Admin login across refreshes so the user stays on their custom view)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_is_admin');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPortalOpen, setIsOrderPortalOpen] = useState(false);
  
  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist Admin view state
  useEffect(() => {
    localStorage.setItem('univers_shop_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Keep local storage up to date on changes/snapshots
  useEffect(() => {
    localStorage.setItem('univers_shop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('univers_shop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('univers_shop_settings', JSON.stringify(settings));
  }, [settings]);

  // Load and listen to Store Settings in Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'store'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let logo = data.logoUrl || '/logo_univers_shop.jpg';
        
        // Auto-clean heavy base64 to keep Firestore light and use our new high-quality design!
        if (logo.startsWith('data:') && logo.length > 6100) {
          logo = '/logo_univers_shop.jpg';
          setDoc(doc(db, 'settings', 'store'), {
            ...data,
            logoUrl: '/logo_univers_shop.jpg',
          }).catch(err => console.warn("Auto reset heavy logo warning:", err));
        }

        setSettings({
          storeName: data.storeName || 'Univers Shop',
          logoUrl: logo,
          sellerPhone: data.sellerPhone || '0558926754',
          promoBannerActive: data.promoBannerActive || false,
          promoBannerText: data.promoBannerText || '',
          promoCodeActive: data.promoCodeActive || false,
          promoCode: data.promoCode || '',
          promoDiscountType: data.promoDiscountType || 'percentage',
          promoDiscountValue: data.promoDiscountValue !== undefined ? Number(data.promoDiscountValue) : undefined
        });
      } else {
        // Safe seeding if the doc doesn't exist yet
        setDoc(doc(db, 'settings', 'store'), {
          storeName: 'Univers Shop',
          logoUrl: '/logo_univers_shop.jpg',
          sellerPhone: '0558926754'
        }).catch((err) => console.warn('Warning generating store document:', err));
      }
    }, (error) => {
      console.warn('Error listening to store settings (Falling back to Local Storage due to quota):', error);
      setIsOfflineMode(true);
    });

    return () => unsubscribe();
  }, []);

  // One-time migration of offline products/orders from localStorage to Firestore
  useEffect(() => {
    const migrateData = async () => {
      try {
        const migratedKey = 'univers_shop_migrated_v2';
        if (localStorage.getItem(migratedKey)) return;

        // 1. Migrate Products
        const savedProductsStr = localStorage.getItem('univers_shop_products');
        if (savedProductsStr) {
          const localProducts = JSON.parse(savedProductsStr) as Product[];
          if (Array.isArray(localProducts)) {
            const initialIds = new Set(INITIAL_PRODUCTS.map(p => p.id));
            const customProducts = localProducts.filter(p => !initialIds.has(p.id));
            for (const p of customProducts) {
              await setDoc(doc(db, 'products', p.id), p);
            }
          }
        }

        // 2. Migrate Orders
        const savedOrdersStr = localStorage.getItem('univers_shop_orders');
        if (savedOrdersStr) {
          const localOrders = JSON.parse(savedOrdersStr) as Order[];
          if (Array.isArray(localOrders)) {
            const initialOrderIds = new Set(INITIAL_ORDERS.map(o => o.id));
            const customOrders = localOrders.filter(o => !initialOrderIds.has(o.id));
            for (const o of customOrders) {
              await setDoc(doc(db, 'orders', o.id), o);
            }
          }
        }

        localStorage.setItem(migratedKey, 'true');
      } catch (err) {
        console.warn('Warning during data migration to Firestore:', err);
      }
    };
    migrateData();
  }, []);

  // Load and listen to Products & Orders in Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodsList: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        prodsList.push({
          id: data.id || docSnap.id,
          name: data.name || 'Produit sans nom',
          description: data.description || '',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
          category: data.category || 'Tous',
          stock: data.stock !== undefined ? Number(data.stock) : 10,
          salesCount: Number(data.salesCount) || 0,
          createdAt: data.createdAt || new Date().toISOString()
        } as Product);
      });
      
      // If collection is completely empty, seed standard products
      if (prodsList.length === 0 && INITIAL_PRODUCTS.length > 0) {
        setProducts(INITIAL_PRODUCTS);
        INITIAL_PRODUCTS.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch (e) {
            console.warn('Seeding product failed or under quota:', p.id, e);
          }
        });
      } else {
        // Sort products by creation date descending
        prodsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProducts(prodsList);

        // Cleanup food products that are being removed from standard catalog
        const foodIdsToDelete = ['prod-7', 'prod-8', 'prod-9'];
        foodIdsToDelete.forEach(async (id) => {
          if (prodsList.some(p => p.id === id)) {
            try {
              await deleteDoc(doc(db, 'products', id));
            } catch (e) {
              console.warn('Error cleaning up product:', id, e);
            }
          }
        });
      }
    }, (error) => {
      console.warn('Error reading live products (Falling back to Local Storage due to quota):', error);
      setIsOfflineMode(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        ordersList.push({
          id: data.id || docSnap.id,
          transactionId: data.transactionId || docSnap.id,
          customerName: data.customerName || 'Client',
          customerPhone: data.customerPhone || '',
          customerAddress: data.customerAddress || '',
          customerWilaya: data.customerWilaya || '',
          items: data.items || [],
          totalAmount: Number(data.totalAmount) || 0,
          paymentMethod: data.paymentMethod || 'CCP',
          paymentStatus: data.paymentStatus || 'pending',
          orderStatus: data.orderStatus || 'received',
          transactionDate: data.transactionDate || new Date().toLocaleString('fr-DZ'),
          otpVerified: !!data.otpVerified,
          ...data
        } as Order);
      });
      
      // If collection is empty, seed standard orders for dashboard
      if (ordersList.length === 0 && INITIAL_ORDERS.length > 0) {
        setOrders(INITIAL_ORDERS);
        INITIAL_ORDERS.forEach(async (o) => {
          try {
            await setDoc(doc(db, 'orders', o.id), o);
          } catch (e) {
            console.warn('Seeding order failed or under quota:', o.id, e);
          }
        });
      } else {
        // Sort orders by transactionDate/ID
        ordersList.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(ordersList);
      }
    }, (error) => {
      console.warn('Error reading live orders (Falling back to Local Storage due to quota):', error);
      setIsOfflineMode(true);
    });

    return () => unsubscribe();
  }, []);

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

  // Product CRUD management (called from admin with Firestore sync)
  const handleAddProduct = async (newProd: Omit<Product, 'id' | 'salesCount' | 'createdAt'>) => {
    const nextId = 'prod-' + (products.length + 1) + '-' + Math.floor(Math.random() * 1000);
    const productWithId: Product = {
      ...newProd,
      id: nextId,
      salesCount: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'products', nextId), productWithId);
      if (isOfflineMode) {
        setProducts(prev => [productWithId, ...prev]);
      }
    } catch (e) {
      console.warn('Failed to add product to Firestore, using local fallback:', e);
      setProducts(prev => [productWithId, ...prev]);
      alert('Mode Local : Produit ajouté avec succès de manière locale.');
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
      if (isOfflineMode) {
        setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      }
    } catch (e) {
      console.warn('Failed to update product in Firestore, using local fallback:', e);
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      alert('Mode Local : Produit mis à jour localement.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Voulez-vous vraiment retirer cet article d\'Univers Shop ?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        if (isOfflineMode) {
          setProducts(prev => prev.filter(p => p.id !== productId));
        }
      } catch (e) {
        console.warn('Failed to delete product from Firestore, using local fallback:', e);
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('Mode Local : Article retiré localement.');
      }
    }
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'store'), newSettings);
      setSettings(newSettings);
    } catch (e) {
      console.warn('Failed to update settings in Firestore, using local fallback:', e);
      setSettings(newSettings);
    }
  };

  // Orders status Updates (called from admin panel or buyer tracking, in Firestore)
  const handleUpdateOrderFields = async (orderId: string, fields: Partial<Order>) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const updated = { ...existingOrder, ...fields };
    
    // If order gets delivered, deduct stock from products to make simulation realistic!
    if (fields.orderStatus === 'delivered' && existingOrder.orderStatus !== 'delivered') {
      for (const orderItem of existingOrder.items) {
        const currentProd = products.find(p => p.id === orderItem.productId);
        if (currentProd) {
          const prodRef = doc(db, 'products', orderItem.productId);
          const updatedProd = {
            ...currentProd,
            stock: Math.max(0, currentProd.stock - orderItem.quantity),
            salesCount: currentProd.salesCount + orderItem.quantity
          };
          try {
            await setDoc(prodRef, updatedProd);
            if (isOfflineMode) {
              setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
            }
          } catch (e) {
            console.warn('Failed to deduct stock for product under quota, using local fallback:', orderItem.productId, e);
            setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
          }
        }
      }
    }
    
    // If a return is APPROVED, restock returned products to make it efficient & realistic!
    if (fields.returnStatus === 'approved' && existingOrder.returnStatus !== 'approved') {
      for (const orderItem of existingOrder.items) {
        const currentProd = products.find(p => p.id === orderItem.productId);
        if (currentProd) {
          const prodRef = doc(db, 'products', orderItem.productId);
          const updatedProd = {
            ...currentProd,
            stock: currentProd.stock + orderItem.quantity,
            salesCount: Math.max(0, currentProd.salesCount - orderItem.quantity)
          };
          try {
            await setDoc(prodRef, updatedProd);
            if (isOfflineMode) {
              setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
            }
          } catch (e) {
            console.warn('Failed to restock product under quota, using local fallback:', orderItem.productId, e);
            setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
          }
        }
      }
      updated.orderStatus = 'returned';
    }

    try {
      await setDoc(doc(db, 'orders', orderId), updated);
      if (isOfflineMode) {
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (e) {
      console.warn('Failed to update order fields in Firestore, using local fallback:', e);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    handleUpdateOrderFields(orderId, { orderStatus: status });
  };

  const handleUpdatePaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    handleUpdateOrderFields(orderId, { paymentStatus: status });
  };

  const handleOrderSuccess = async (newOrder: Order) => {
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      if (isOfflineMode) {
        setOrders(prev => [newOrder, ...prev]);
      }
      const myOrders = JSON.parse(localStorage.getItem('univers_shop_my_orders') || '[]');
      myOrders.push(newOrder.id);
      localStorage.setItem('univers_shop_my_orders', JSON.stringify(myOrders));
    } catch (e) {
      console.warn('Failed to write new order to Firestore, using local fallback:', e);
      setOrders(prev => [newOrder, ...prev]);
      const myOrders = JSON.parse(localStorage.getItem('univers_shop_my_orders') || '[]');
      myOrders.push(newOrder.id);
      localStorage.setItem('univers_shop_my_orders', JSON.stringify(myOrders));
      alert('Mode Local : Votre commande a été enregistrée avec succès de manière locale.');
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
      {settings.promoBannerActive && settings.promoBannerText && (
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white py-2 px-4 text-center font-display font-medium text-xs shadow-md flex items-center justify-center gap-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-white/10 select-none pointer-events-none mix-blend-overlay"></div>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="relative tracking-wide leading-relaxed truncate drop-shadow-xs font-bold">
            {settings.promoBannerText}
          </span>
        </div>
      )}

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
              Service Client Algérien : <b>{settings.sellerPhone}</b>
            </span>
          </div>
        </div>
      </div>

      {isOfflineMode && (
        <div className="bg-amber-500 text-white text-[11px] font-bold py-2.5 px-4 shadow-sm border-b border-amber-600 flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Boutique en mode local (la base de données cloud est en cours de maintenance / quota atteint, vos modifications restent 100% fonctionnelles et enregistrées sur votre appareil)</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar 
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={setIsAdmin}
        onOpenOrderPortal={() => setIsOrderPortalOpen(true)}
        sellerPhone={settings.sellerPhone}
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
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
          sellerPhone={settings.sellerPhone}
          storeSettings={settings}
          onUpdateSettings={handleUpdateSettings}
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
                    Profitez d'une expérience e-commerce premium sur <b>{settings.storeName}</b>. Ajoutez au panier, simulez votre paiement sécurisé ou réglez par BaridiMob, et faites-vous livrer chez vous dans les 58 wilayas d'Algérie !
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
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Au {settings.sellerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Promo Banner / Illustration block */}
                <div className="hidden md:flex relative h-72 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 items-center justify-center p-8 group">
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="inline-flex p-4 bg-white/15 text-white rounded-full mb-1">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">Achetez en Confiance sur {settings.storeName}</h3>
                    <p className="text-[11px] text-white/85 leading-normal">
                      La sécurité de vos fonds est assurée. Nous supportons la vérification par OTP Card et le dépôt sécurisé d'avoirs au compte de virement. 
                    </p>
                    <a href={`tel:${settings.sellerPhone}`} className="inline-flex items-center gap-1.5 text-xs text-[#0052FF] font-bold bg-white hover:bg-slate-50 px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer">
                      <Phone className="w-3.5 h-3.5" />
                      Appel Direct : {settings.sellerPhone}
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
          sellerPhone={settings.sellerPhone}
          storeSettings={settings}
        />
      )}

      {/* Buyer's Order history & live logistics tracking viewport */}
      {isOrderPortalOpen && (
        <BuyerOrderPortal 
          orders={orders}
          onUpdateOrderFields={handleUpdateOrderFields}
          onClose={() => setIsOrderPortalOpen(false)}
          sellerPhone={settings.sellerPhone}
        />
      )}

      {/* Universal footer */}
      <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            {/* Column 1 */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-white text-base">{settings.storeName}</h4>
              <p className="text-xs leading-relaxed">
                Une e-boutique moderne et fiable conçue pour offrir les meilleures garanties de paiement et d'expédition sécurisées en Algérie.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/25 border border-emerald-800/60 px-3 py-1 rounded-sm max-w-max">
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
                <a href={`tel:${settings.sellerPhone}`} className="text-sm font-bold text-white hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-400" />
                  <span>{settings.sellerPhone}</span>
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
            <p>&copy; 2026 {settings.storeName}. Tous droits réservés.</p>
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
