import { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Sliders,
  Moon,
  Sun
} from 'lucide-react';
import { Product, CartItem, Order, StoreSettings, AISuiteState } from './types';
import { DEFAULT_AI_STATE, runAIOptimizationCycle } from './lib/aiSuite';
import { INITIAL_PRODUCTS, ALGERIAN_WILAYAS } from './data/mockProducts';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import BuyerOrderPortal from './components/BuyerOrderPortal';
import AIAssistant from './components/AIAssistant';
import DiscountWheel from './components/DiscountWheel';
import QuestSystem from './components/QuestSystem';
import { BackToTopButton } from './components/AIEnhancedSuite';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Language, translate } from './lib/translations';

const SELLER_PHONE = '0558926754';

export interface AdminNotification {
  id: string;
  customerName: string;
  customerWilaya: string;
  totalAmount: number;
  timestamp: Date;
  itemsCount: number;
}

const playAdminNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // First high note (bell sound)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
    
    // Second note slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio synthesis block or not allowed by browser autoplay policy:', e);
  }
};

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

// Define the exact set of default/template mock product IDs to filter out,
// so that ONLY the seller's custom-added products are displayed in the shop.
const DEMO_PRODUCT_IDS = new Set(['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8', 'prod-9']);

export default function App() {
  // Products state (persisted on Firestore with localStorage as instant fast-loading fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_products');
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        // Filter out any default template mock product IDs to keep the catalog clean
        return parsed.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
      }
      return [];
    } catch (e) {
      console.warn("Could not parse products from localstorage:", e);
      return [];
    }
  });

  // Orders state (persisted on Firestore with localStorage as instant fast-loading fallback)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Could not parse orders from localstorage:", e);
      return [];
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

  // AI Suite state
  const [aiState, setAiState] = useState<AISuiteState>(DEFAULT_AI_STATE);

  // Automatic Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('univers_shop_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Auto-detect night hours (after 18:00 or before 07:00)
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 7) {
      return true;
    }
    // Auto-detect browser/OS system dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('univers_shop_dark_mode', String(darkMode));
  }, [darkMode]);

  // Language & Detailed View selection states
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  // Advanced Dynamic Filters
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(250000);
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'sales'>('default');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Gamification: Mission Économies & profile details state
  const [userPoints, setUserPoints] = useState<number>(() => {
    return Number(localStorage.getItem('univers_shop_points') || '0');
  });
  const [completedQuests, setCompletedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('univers_shop_quests');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('univers_shop_cust_name') || '';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('univers_shop_cust_phone') || '';
  });
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);

  // Animated counters for "Why choose us?"
  const [clientsCount, setClientsCount] = useState(0);
  const [wilayasCount, setWilayasCount] = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);
  const [supportHours, setSupportHours] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const intervalTime = 30;
    const steps = duration / intervalTime;
    
    const clientsStep = 10000 / steps;
    const wilayasStep = 58 / steps;
    const satisfactionStep = 98 / steps;
    const supportStep = 24 / steps;

    const timer = setInterval(() => {
      start++;
      setClientsCount(prev => Math.min(10000, Math.round(clientsStep * start)));
      setWilayasCount(prev => Math.min(58, Math.round(wilayasStep * start)));
      setSatisfactionRate(prev => Math.min(98, Math.round(satisfactionStep * start)));
      setSupportHours(prev => Math.min(24, Math.round(supportStep * start)));

      if (start >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const completeQuest = (questId: string, pts: number, name: string) => {
    setCompletedQuests(prev => {
      if (prev.includes(questId)) return prev;
      const updated = [...prev, questId];
      localStorage.setItem('univers_shop_quests', JSON.stringify(updated));
      
      setUserPoints(current => {
        const nextPoints = current + pts;
        localStorage.setItem('univers_shop_points', String(nextPoints));
        return nextPoints;
      });

      showToast(`🎉 Défi Réussi ! +${pts} pts : ${name}`, 'success');
      return updated;
    });
  };

  const handleAddPoints = (pts: number) => {
    setUserPoints(current => {
      const nextPoints = Math.max(0, current + pts);
      localStorage.setItem('univers_shop_points', String(nextPoints));
      return nextPoints;
    });
  };

  const handleUpdateProfile = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    localStorage.setItem('univers_shop_cust_name', name);
    localStorage.setItem('univers_shop_cust_phone', phone);
  };

  const handleProductHeart = (product: Product) => {
    completeQuest('favori', 50, `Coup de cœur sur ${product.name}`);
  };

  const handleProductShare = (product: Product) => {
    try {
      const shareUrl = `${window.location.origin}/#product-${product.id}`;
      navigator.clipboard.writeText(shareUrl);
      showToast(`Lien copié dans le presse-papiers pour ${product.name} ! 🚀`, 'success');
      completeQuest('partage', 50, `Partager ${product.name}`);
    } catch (e) {
      showToast("Erreur lors de la copie du lien.", "error");
    }
  };
  
  // Custom non-blocking Toast & Dialog states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Safe global alert override
  useEffect(() => {
    window.alert = (msg: string) => {
      showToastRef.current(String(msg), 'info');
    };
  }, []);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
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
          promoDiscountValue: data.promoDiscountValue !== undefined ? Number(data.promoDiscountValue) : undefined,
          algeriaCupWinActive: data.algeriaCupWinActive || false,
          algeriaCupWinsCount: data.algeriaCupWinsCount !== undefined ? Number(data.algeriaCupWinsCount) : 0
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

  // Load and listen to AI Control state in Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'ai_control'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AISuiteState;
        // Make sure arrays are defined to avoid runtime errors
        setAiState({
          ...DEFAULT_AI_STATE,
          ...data,
          adCampaigns: data.adCampaigns || DEFAULT_AI_STATE.adCampaigns,
          pricingDecisions: data.pricingDecisions || DEFAULT_AI_STATE.pricingDecisions,
          marketingCampaigns: data.marketingCampaigns || DEFAULT_AI_STATE.marketingCampaigns,
          historicalStats: data.historicalStats || DEFAULT_AI_STATE.historicalStats
        });
      } else {
        // Safe seeding if the doc doesn't exist yet
        setDoc(doc(db, 'settings', 'ai_control'), DEFAULT_AI_STATE)
          .catch((err) => console.warn('Warning generating AI control document:', err));
      }
    }, (error) => {
      console.warn('Error listening to AI control state, falling back to local state:', error);
    });

    return () => unsubscribe();
  }, []);

  // Site visits tracking (Total and Daily) in Firestore
  useEffect(() => {
    // Only count once per browser session to get realistic unique session visits
    if (!sessionStorage.getItem('univers_shop_counted_session')) {
      sessionStorage.setItem('univers_shop_counted_session', 'true');
      const todayStr = new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-'); // Format as DD-MM-YYYY

      const recordVisit = async () => {
        try {
          const docRef = doc(db, 'analytics', 'visits');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const total = (data.total || 0) + 1;
            const daily = data.daily || {};
            daily[todayStr] = (daily[todayStr] || 0) + 1;
            await setDoc(docRef, { total, daily }, { merge: true });
          } else {
            await setDoc(docRef, {
              total: 1,
              daily: { [todayStr]: 1 }
            });
          }
        } catch (err) {
          console.warn('Analytics tracking bypassed or Firestore under quota:', err);
        }
      };
      recordVisit();
    }
  }, []);

  // One-time migration and cleanup of any existing demo products from Firestore
  useEffect(() => {
    const cleanAndMigrate = async () => {
      try {
        // 1. Force Active Cleanup of Predefined Demo Products from Firestore
        const cleanedKey = 'univers_shop_demo_cleaned_v1';
        if (!localStorage.getItem(cleanedKey)) {
          const demoIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'];
          for (const id of demoIds) {
            try {
              await deleteDoc(doc(db, 'products', id));
            } catch (e) {
              console.warn('Failed to delete demo product on cleanup:', id, e);
            }
          }
          localStorage.setItem(cleanedKey, 'true');
        }

        const migratedKey = 'univers_shop_migrated_v2';
        if (localStorage.getItem(migratedKey)) return;

        // 2. Migrate Products (only user's custom products)
        const savedProductsStr = localStorage.getItem('univers_shop_products');
        if (savedProductsStr) {
          const localProducts = JSON.parse(savedProductsStr) as Product[];
          if (Array.isArray(localProducts)) {
            const initialIds = new Set(INITIAL_PRODUCTS.map(p => p.id));
            const customProducts = localProducts.filter(p => !initialIds.has(p.id) && !DEMO_PRODUCT_IDS.has(p.id));
            for (const p of customProducts) {
              await setDoc(doc(db, 'products', p.id), p);
            }
          }
        }

        // 3. Migrate Orders
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
        console.warn('Warning during data migration/cleanup:', err);
      }
    };
    cleanAndMigrate();
  }, []);

  // Load and listen to Products & Orders in Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodsList: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Safely parse createdAt to always be a string ISO format
        let createdAtStr = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
          } else {
            const parsedDate = new Date(data.createdAt);
            if (!isNaN(parsedDate.getTime())) {
              createdAtStr = parsedDate.toISOString();
            }
          }
        }

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
          createdAt: createdAtStr
        } as Product);
      });
      
      // Sort products by creation date descending and filter out any default demo products to ensure only your items are displayed
      prodsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const cleanList = prodsList.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
      setProducts(cleanList);
    }, (error) => {
      console.warn('Error reading live products (Falling back to Local Storage due to quota):', error);
      setIsOfflineMode(true);
    });

    return () => unsubscribe();
  }, []);

  // Safe one-time cleanup of removed template products (Nourriture)
  useEffect(() => {
    const cleanupFoodProducts = async () => {
      const foodIdsToDelete = ['prod-7', 'prod-8', 'prod-9'];
      for (const id of foodIdsToDelete) {
        try {
          await deleteDoc(doc(db, 'products', id));
        } catch (e) {
          console.warn('Error cleaning up product:', id, e);
        }
      }
    };
    cleanupFoodProducts();
  }, []);

  useEffect(() => {
    let isInitial = true;
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
      
      // Sort orders by transactionDate/ID
      ordersList.sort((a, b) => b.id.localeCompare(a.id));
      setOrders(ordersList);

      // Live detection of newly placed orders (ignore initial snapshot fetch)
      if (isInitial) {
        isInitial = false;
      } else {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const orderId = data.id || change.doc.id;
            
            const freshOrder: AdminNotification = {
              id: orderId,
              customerName: data.customerName || 'Client',
              customerWilaya: data.customerWilaya || 'Algérie',
              totalAmount: Number(data.totalAmount) || 0,
              timestamp: new Date(),
              itemsCount: Array.isArray(data.items) ? data.items.length : 1
            };
            
            setAdminNotifications(prev => {
              if (prev.some(n => n.id === freshOrder.id)) return prev;
              return [freshOrder, ...prev];
            });
            
            // Sound play
            playAdminNotificationSound();
          }
        });
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
  const categories = [
    'Tous',
    ...Array.from(
      new Set(
        products
          .map(p => p.category)
          .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '')
      )
    )
  ];

  // Cart management operations
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        if (item.quantity >= product.stock) {
          showToast('Stock maximum atteint pour ce produit !', 'error');
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
            showToast('Quantité maximum pour le stock de cet article !', 'error');
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

    // Optimistic UI update: instantly append product locally so user sees feedback right away
    setProducts(prev => {
      if (prev.some(p => p.id === nextId)) return prev;
      return [productWithId, ...prev];
    });

    try {
      await setDoc(doc(db, 'products', nextId), productWithId);
      showToast('Produit ajouté avec succès !', 'success');
    } catch (e) {
      console.warn('Failed to add product to Firestore, using local fallback:', e);
      showToast('Mode Local : Produit ajouté avec succès de manière locale.', 'info');
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    // Optimistic UI update: instantly update product locally
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));

    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
      showToast('Produit mis à jour avec succès !', 'success');
    } catch (e) {
      console.warn('Failed to update product in Firestore, using local fallback:', e);
      showToast('Mode Local : Produit mis à jour localement.', 'info');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteProductId(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    const targetId = deleteProductId;
    setDeleteProductId(null);

    // Optimistic UI update: instantly remove product locally
    setProducts(prev => prev.filter(p => p.id !== targetId));

    try {
      await deleteDoc(doc(db, 'products', targetId));
      showToast('Article retiré avec succès de la boutique.', 'success');
    } catch (e) {
      console.warn('Failed to delete product from Firestore, using local fallback:', e);
      showToast('Mode Local : Article retiré localement.', 'info');
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

  const handleUpdateAIState = async (newState: AISuiteState) => {
    try {
      await setDoc(doc(db, 'settings', 'ai_control'), newState);
      setAiState(newState);
    } catch (e) {
      console.warn('Failed to update AI state in Firestore, using local fallback:', e);
      setAiState(newState);
    }
  };

  const handleRunAISimulation = async () => {
    // Run the optimization cycle
    const { updatedState, updatedProducts, logs } = runAIOptimizationCycle(aiState, products);
    
    // Update AI state in Firestore
    await handleUpdateAIState(updatedState);
    
    // If any product price was updated, update those products in Firestore!
    for (const prod of updatedProducts) {
      const origProd = products.find(p => p.id === prod.id);
      if (origProd && origProd.price !== prod.price) {
        try {
          await setDoc(doc(db, 'products', prod.id), prod);
        } catch (e) {
          console.warn(`Failed to update product ${prod.id} in Firestore:`, e);
        }
      }
    }

    return logs;
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
      showToast('Mode Local : Votre commande a été enregistrée avec succès de manière locale.', 'info');
    }

    // Complete the first purchase/order gamified quest!
    completeQuest('order_placed', 200, 'Première commande enregistrée');
    localStorage.removeItem('univers_shop_active_coupon');
  };

  // Filtering products for listing with Advanced Filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const name = product.name || '';
    const description = product.description || '';
    const category = product.category || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price <= maxPriceFilter;
    const matchesStock = !onlyInStock || product.stock > 0;
    return matchesCategory && matchesSearch && matchesPrice && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'sales') return b.salesCount - a.salesCount;
    return 0; // Default sorting by insertion/ID order
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Main Navbar
  const handleToggleAdminStatus = (status: boolean) => {
    setIsAdmin(status);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {settings.algeriaCupWinActive && (
        <div className="bg-gradient-to-r from-emerald-600 via-white via-red-600 to-emerald-600 text-slate-900 py-3 px-4 text-center font-display font-black text-xs shadow-md flex items-center justify-center gap-2 overflow-hidden relative border-b border-emerald-500/20">
          <div className="absolute inset-0 bg-black/5 select-none pointer-events-none mix-blend-overlay"></div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="relative tracking-wider font-extrabold text-[#064e3b] dark:text-[#064e3b] uppercase flex items-center gap-1.5 flex-wrap justify-center">
            🇩🇿 L'Algérie a gagné {settings.algeriaCupWinsCount || 1} match{(settings.algeriaCupWinsCount || 1) > 1 ? 's' : ''} f la Coupe du Monde 2026 ! Réduction de {((settings.algeriaCupWinsCount || 1) * 5)}% active automatiquement sur tout le site ! 🏆⚽🇩🇿
          </span>
        </div>
      )}

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
        onToggleAdmin={handleToggleAdminStatus}
        onOpenOrderPortal={() => setIsOrderPortalOpen(true)}
        sellerPhone={settings.sellerPhone}
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
        userPoints={userPoints}
        onOpenQuestLog={() => setIsQuestLogOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
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
          onShowToast={showToast}
          aiState={aiState}
          onUpdateAIState={handleUpdateAIState}
          onRunAISimulation={handleRunAISimulation}
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

          {/* Animated "Why Choose Us" Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bg-white border border-slate-150 rounded-[32px] p-6 sm:p-8 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-6">
                <h2 className="font-display font-black text-slate-950 text-base sm:text-lg tracking-tight">
                  {translate('why_choose_us_title', language)}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'ar' ? 'نلتزم بتقديم أفضل تجربة تسوق إلكتروني آمنة وموثوقة لزبائننا في الجزائر' : 'Nous nous engageons à offrir la meilleure expérience d\'achat en ligne sécurisée et fiable en Algérie.'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                
                {/* Metric 1 */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-500/30 transition-all">
                  <div className="text-sky-600 font-display font-black text-xl sm:text-2xl tracking-tight">
                    +{clientsCount.toLocaleString()}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'زبون راضٍ وفخور' : 'Clients Satisfaits'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'ar' ? 'ثقة ومصداقية كاملة' : 'Confiance & Engagement'}
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-500/30 transition-all">
                  <div className="text-[#FF5C00] font-display font-black text-xl sm:text-2xl tracking-tight">
                    {wilayasCount} {language === 'ar' ? 'ولاية' : 'Wilayas'}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'شحن لجميع الولايات' : 'Wilayas Desservies'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'ar' ? 'توصيل سريع وباب المنزل' : 'Livraison rapide à domicile'}
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-500/30 transition-all">
                  <div className="text-emerald-600 font-display font-black text-xl sm:text-2xl tracking-tight">
                    {satisfactionRate}%
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'معدل الرضا والقبول' : 'Clients Heureux'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'ar' ? 'ضمان جودة المنتج' : 'Garantie de qualité'}
                  </p>
                </div>

                {/* Metric 4 */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-500/30 transition-all">
                  <div className="text-indigo-600 font-display font-black text-xl sm:text-2xl tracking-tight">
                    {supportHours}h/7 & {language === 'ar' ? '٢٤س' : '24h'}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'دعم متواصل على مدار الساعة' : 'Support Client 24/7'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'ar' ? 'اتصال مباشر على ' : 'Appel direct au '}<b>{settings.sellerPhone}</b>
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Filtering and Stores Items Catalog */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Category Tags selection bar */}
            <div className="flex flex-col gap-5 mb-8 border-b border-slate-150 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                <div className="w-full lg:max-w-xs">
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'بحث عن منتج، موديل...' : 'Rechercher un modèle, une marque...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Advanced Dynamic Filters Tray */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{language === 'ar' ? 'السعر الأقصى:' : 'Prix Maximum:'}</span>
                    <span className="text-sky-600 font-mono">{maxPriceFilter.toLocaleString()} DA</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="300000"
                    step="5000"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Sort By Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">
                    {language === 'ar' ? 'ترتيب حسب:' : 'Trier par :'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                  >
                    <option value="default">{language === 'ar' ? 'افتراضي' : 'Par défaut'}</option>
                    <option value="priceAsc">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Prix : Croissant'}</option>
                    <option value="priceDesc">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Prix : Décroissant'}</option>
                    <option value="sales">{language === 'ar' ? 'الأكثر مبيعاً' : 'Les plus vendus'}</option>
                  </select>
                </div>

                {/* Stock toggle checkbox */}
                <div className="flex items-center gap-3 h-full pt-4 md:pt-0">
                  <input
                    type="checkbox"
                    id="onlyInStockCheckbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-200 rounded-sm focus:ring-sky-500"
                  />
                  <label htmlFor="onlyInStockCheckbox" className="text-xs font-black text-slate-600 cursor-pointer select-none">
                    {language === 'ar' ? 'المنتجات المتوفرة فقط' : 'Afficher uniquement les articles en stock'}
                  </label>
                </div>
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
                    onHeart={handleProductHeart}
                    onShare={handleProductShare}
                    language={language}
                    onSelect={setSelectedProductDetails}
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
          onShowToast={showToast}
          language={language}
        />
      )}

      {/* Premium Product Detail Modal View Overlay */}
      {selectedProductDetails && (
        <ProductDetailModal 
          product={selectedProductDetails}
          allProducts={products}
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedProductDetails(null)}
          language={language}
          onShowToast={showToast}
        />
      )}

      {/* Buyer's Order history & live logistics tracking viewport */}
      {isOrderPortalOpen && (
        <BuyerOrderPortal 
          orders={orders}
          onUpdateOrderFields={handleUpdateOrderFields}
          onClose={() => setIsOrderPortalOpen(false)}
          sellerPhone={settings.sellerPhone}
          onShowToast={showToast}
          storeSettings={settings}
        />
      )}

      {/* Gamification, Discount Wheel & AI Sales Assistant widgets */}
      {!isAdmin && (
        <>
          <QuestSystem 
            userPoints={userPoints}
            completedQuests={completedQuests}
            onAddPoints={handleAddPoints}
            onCompleteQuest={completeQuest}
            onApplyPromo={(code) => {
              localStorage.setItem('univers_shop_active_coupon', code);
              showToast(`Coupon "${code}" activé avec succès !`, 'success');
            }}
            onShowToast={showToast}
            isOpen={isQuestLogOpen}
            onClose={() => setIsQuestLogOpen(false)}
            customerName={customerName}
            customerPhone={customerPhone}
            onUpdateProfile={handleUpdateProfile}
          />
          
          <DiscountWheel 
            onApplyPromo={(code) => {
              localStorage.setItem('univers_shop_active_coupon', code);
            }}
            onShowToast={showToast}
            onCompleteQuest={completeQuest}
          />

          <AIAssistant 
            products={products}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            onCompleteQuest={completeQuest}
          />
        </>
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

      {/* Special Admin Real-Time Notifications Overlay */}
      {isAdmin && adminNotifications.length > 0 && (
        <div className="fixed top-20 right-5 z-50 flex flex-col gap-3 max-w-sm w-full animate-fade-in pointer-events-none">
          {adminNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="pointer-events-auto bg-slate-900 border border-amber-500/40 text-white rounded-2xl shadow-2xl p-4.5 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-amber-500"
            >
              {/* Background amber glow badge */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />
              
              <div className="flex items-start justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Nouvelle Commande Reçue !
                  </span>
                </div>
                <button
                  onClick={() => setAdminNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="z-10 space-y-1">
                <p className="text-sm font-bold tracking-tight">
                  {notification.customerName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-200">
                    📍 {notification.customerWilaya}
                  </span>
                  <span>•</span>
                  <span>{notification.itemsCount} article(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-1 pt-3 border-t border-slate-800 z-10">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Montant total</p>
                  <p className="text-sm font-black text-amber-400">{notification.totalAmount.toLocaleString()} DA</p>
                </div>
                <button
                  onClick={() => {
                    setAdminNotifications(prev => prev.filter(n => n.id !== notification.id));
                    showToast(`Affichage des détails de la commande de ${notification.customerName}`, 'success');
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/25"
                >
                  Voir la commande
                </button>
              </div>
            </div>
          ))}
          
          {adminNotifications.length > 1 && (
            <button
              onClick={() => setAdminNotifications([])}
              className="pointer-events-auto text-center text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white bg-slate-950/80 backdrop-blur-md py-2 px-4 rounded-xl border border-slate-800 transition-all self-center cursor-pointer hover:bg-slate-900"
            >
              Tout marquer comme lu ({adminNotifications.length})
            </button>
          )}
        </div>
      )}

      {/* Custom Toast Notification System */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 max-w-sm transition-all duration-300 transform scale-100">
            {toastType === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toastType === 'error' ? (
              <X className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-slate-400 hover:text-white p-0.5 rounded-lg cursor-pointer ml-auto transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Beautiful Custom Product Deletion Confirmation Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
              Retirer cet article ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Voulez-vous vraiment retirer cet article d'Univers Shop ? Cette action supprimera définitivement le produit du catalogue et de la base de données Firestore.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteProductId(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 transition-all cursor-pointer"
              >
                Retirer l'article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Dark Mode Toggle Button */}
      <div className="fixed bottom-24 right-5 z-45">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-800"
          title="Basculer le mode Sombre/Clair"
        >
          {darkMode ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-sky-400" />}
        </button>
      </div>

      {/* Back to Top Smart Button */}
      <BackToTopButton />
    </div>
  );
}
