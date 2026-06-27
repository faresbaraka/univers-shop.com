import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Truck, 
  DollarSign, 
  Grid, 
  Save, 
  X, 
  Check, 
  Camera, 
  Eye, 
  User, 
  Phone,
  Upload,
  Brain,
  Sparkles,
  Sliders,
  BarChart3,
  RefreshCw,
  Play,
  Shield,
  Megaphone,
  Percent,
  Lightbulb
} from 'lucide-react';
import { Product, Order, PaymentMethod, StoreSettings, AISuiteState, AICampaign, AIDecision, AIMarketingCampaign } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id' | 'salesCount' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  onUpdatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  onUpdateOrderFields?: (orderId: string, fields: Partial<Order>) => void;
  sellerPhone: string;
  storeSettings?: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  aiState?: AISuiteState;
  onUpdateAIState?: (newState: AISuiteState) => void;
  onRunAISimulation?: () => Promise<string[]>;
}

const STOCK_IMAGE_PRESETS = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600' },
  { label: 'Ordinateur Portable', url: 'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=600' },
  { label: 'Casque Haute Technologie', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600' },
  { label: 'Machine à Café', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Baskets / Mode', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600' },
  { label: 'Sac de Luxe', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' },
  { label: 'Montre analogique', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600' },
  { label: 'Parfum', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600' }
];

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onUpdateOrderFields,
  sellerPhone,
  storeSettings,
  onUpdateSettings,
  onShowToast,
  aiState,
  onUpdateAIState,
  onRunAISimulation
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'dashboard' | 'settings' | 'ai_control'>('dashboard');
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);

  // Store general settings form states
  const [localStoreName, setLocalStoreName] = useState(storeSettings?.storeName || 'Univers Shop');
  const [localLogoUrl, setLocalLogoUrl] = useState(storeSettings?.logoUrl || '/logo_univers_shop.jpg');
  const [localSellerPhone, setLocalSellerPhone] = useState(storeSettings?.sellerPhone || sellerPhone);
  const [localPromoBannerActive, setLocalPromoBannerActive] = useState(storeSettings?.promoBannerActive || false);
  const [localPromoBannerText, setLocalPromoBannerText] = useState(storeSettings?.promoBannerText || '');
  const [localPromoCodeActive, setLocalPromoCodeActive] = useState(storeSettings?.promoCodeActive || false);
  const [localPromoCode, setLocalPromoCode] = useState(storeSettings?.promoCode || '');
  const [localPromoDiscountType, setLocalPromoDiscountType] = useState<'percentage' | 'fixed'>(storeSettings?.promoDiscountType || 'percentage');
  const [localPromoDiscountValue, setLocalPromoDiscountValue] = useState(storeSettings?.promoDiscountValue?.toString() || '');
  const [localAlgeriaCupWinActive, setLocalAlgeriaCupWinActive] = useState(storeSettings?.algeriaCupWinActive || false);
  const [localAlgeriaCupWinsCount, setLocalAlgeriaCupWinsCount] = useState<number>(storeSettings?.algeriaCupWinsCount || 1);
  const [localGoogleMapsApiKey, setLocalGoogleMapsApiKey] = useState(storeSettings?.googleMapsApiKey || '');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  React.useEffect(() => {
    if (storeSettings) {
      setLocalStoreName(storeSettings.storeName);
      setLocalLogoUrl(storeSettings.logoUrl);
      setLocalSellerPhone(storeSettings.sellerPhone);
      setLocalPromoBannerActive(storeSettings.promoBannerActive || false);
      setLocalPromoBannerText(storeSettings.promoBannerText || '');
      setLocalPromoCodeActive(storeSettings.promoCodeActive || false);
      setLocalPromoCode(storeSettings.promoCode || '');
      setLocalPromoDiscountType(storeSettings.promoDiscountType || 'percentage');
      setLocalPromoDiscountValue(storeSettings.promoDiscountValue?.toString() || '');
      setLocalAlgeriaCupWinActive(storeSettings.algeriaCupWinActive || false);
      setLocalAlgeriaCupWinsCount(storeSettings.algeriaCupWinsCount || 1);
      setLocalGoogleMapsApiKey(storeSettings.googleMapsApiKey || '');
    }
  }, [storeSettings]);

  // Visitor analytics real-time hook
  const [visits, setVisits] = useState<{ total: number; daily: Record<string, number> }>({ total: 0, daily: {} });
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'analytics', 'visits'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVisits({
          total: data.total || 0,
          daily: data.daily || {}
        });
      }
    }, (error) => {
      console.warn("Error listening to visits analytics:", error);
    });
    return unsub;
  }, []);

  const handleQuickToggleAlgeriaCup = async () => {
    if (!onUpdateSettings || !storeSettings) return;
    try {
      const nextActive = !storeSettings.algeriaCupWinActive;
      const wins = storeSettings.algeriaCupWinsCount || 1;
      await onUpdateSettings({
        ...storeSettings,
        algeriaCupWinActive: nextActive,
        algeriaCupWinsCount: wins
      });
      if (onShowToast) {
        onShowToast(
          nextActive 
            ? `🏆 Algérie gagne ! Réduction globale de ${wins * 5}% activée avec succès !` 
            : "🇩🇿 Réduction de la Coupe du Monde désactivée.",
          'success'
        );
      }
    } catch (e) {
      console.warn("Error toggling cup settings:", e);
    }
  };

  // AI Suite helper functions
  const updateAISuiteParam = (key: keyof AISuiteState, value: any) => {
    if (aiState && onUpdateAIState) {
      onUpdateAIState({
        ...aiState,
        [key]: value
      });
      if (onShowToast) {
        onShowToast(`Paramètre IA mis à jour dans Firebase.`, 'success');
      }
    }
  };

  const handleToggleAdCampaign = (campId: string) => {
    if (aiState && onUpdateAIState) {
      const updatedCampaigns = aiState.adCampaigns.map(camp => {
        if (camp.id === campId) {
          const nextStatus = (camp.status === 'active' ? 'paused' : 'active') as 'active' | 'paused';
          return { ...camp, status: nextStatus };
        }
        return camp;
      });
      onUpdateAIState({
        ...aiState,
        adCampaigns: updatedCampaigns
      });
      if (onShowToast) {
        onShowToast(`Campagne publicitaire mise en pause / activée.`, 'info');
      }
    }
  };

  const handleAdjustAdBudget = (campId: string, amount: number) => {
    if (aiState && onUpdateAIState) {
      const updatedCampaigns = aiState.adCampaigns.map(camp => {
        if (camp.id === campId) {
          return { ...camp, budget: Math.max(1000, camp.budget + amount) };
        }
        return camp;
      });
      onUpdateAIState({
        ...aiState,
        adCampaigns: updatedCampaigns
      });
    }
  };

  const handleToggleMarketingCampaign = (mktId: string) => {
    if (aiState && onUpdateAIState) {
      const updatedMarketing = aiState.marketingCampaigns.map(mkt => {
        if (mkt.id === mktId) {
          const nextStatus = (mkt.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive';
          return { ...mkt, status: nextStatus };
        }
        return mkt;
      });
      onUpdateAIState({
        ...aiState,
        marketingCampaigns: updatedMarketing
      });
    }
  };

  const handlePricingDecisionAction = async (decisionId: string, action: 'approve' | 'reject' | 'rollback') => {
    if (!aiState || !onUpdateAIState) return;

    const decision = aiState.pricingDecisions.find(d => d.id === decisionId);
    if (!decision) return;

    let updatedDecisions = [...aiState.pricingDecisions];

    if (action === 'approve') {
      const prodIndex = products.findIndex(p => p.id === decision.productId);
      if (prodIndex !== -1) {
        const prod = products[prodIndex];
        const updatedProd = { ...prod, price: decision.newPrice, originalPrice: prod.originalPrice || prod.price };
        if (onUpdateProduct) {
          await onUpdateProduct(updatedProd);
        }
      }
      
      updatedDecisions = aiState.pricingDecisions.map(d => 
        d.id === decisionId ? { ...d, status: 'applied' as const } : d
      );
      if (onShowToast) onShowToast('Tarif validé avec succès ! Appliqué sur la boutique.', 'success');

    } else if (action === 'reject') {
      updatedDecisions = aiState.pricingDecisions.map(d => 
        d.id === decisionId ? { ...d, status: 'rejected' as const } : d
      );
      if (onShowToast) onShowToast('Suggestion de prix rejetée.', 'info');

    } else if (action === 'rollback') {
      const prodIndex = products.findIndex(p => p.id === decision.productId);
      if (prodIndex !== -1) {
        const prod = products[prodIndex];
        const updatedProd = { ...prod, price: decision.oldPrice };
        if (onUpdateProduct) {
          await onUpdateProduct(updatedProd);
        }
      }

      updatedDecisions = aiState.pricingDecisions.map(d => 
        d.id === decisionId ? { ...d, status: 'rolled_back' as const } : d
      );
      if (onShowToast) onShowToast('Rollback effectué. Le produit a repris son ancien prix.', 'info');
    }

    onUpdateAIState({
      ...aiState,
      pricingDecisions: updatedDecisions
    });
  };

  const triggerAIOptimization = async () => {
    if (!onRunAISimulation) return;
    setIsRunningSimulation(true);
    try {
      const logs = await onRunAISimulation();
      setSimulationLogs(prev => [...logs, ...prev].slice(0, 50));
      if (onShowToast) {
        onShowToast('Cycle d\'optimisation IA simulé avec succès.', 'success');
      }
    } catch (e) {
      console.error(e);
      if (onShowToast) {
        onShowToast('Erreur lors du cycle IA.', 'error');
      }
    } finally {
      setIsRunningSimulation(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit logo size to max 280px width/height while keeping aspect ratio
          const MAX_SIZE = 280;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as PNG to preserve transparency and keep it ultra lightweight (< 20KB)
            const compressed = canvas.toDataURL('image/png');
            setLocalLogoUrl(compressed);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateSettings) return;
    setIsUpdatingSettings(true);
    try {
      await onUpdateSettings({
        storeName: localStoreName,
        logoUrl: localLogoUrl,
        sellerPhone: localSellerPhone,
        promoBannerActive: localPromoBannerActive,
        promoBannerText: localPromoBannerText,
        promoCodeActive: localPromoCodeActive,
        promoCode: localPromoCode.trim(),
        promoDiscountType: localPromoDiscountType,
        promoDiscountValue: localPromoDiscountValue ? Number(localPromoDiscountValue) : undefined,
        algeriaCupWinActive: localAlgeriaCupWinActive,
        algeriaCupWinsCount: Number(localAlgeriaCupWinsCount) || 1,
        googleMapsApiKey: localGoogleMapsApiKey.trim()
      });
      if (onShowToast) {
        onShowToast('Paramètres de la boutique mis à jour avec succès !', 'success');
      } else {
        console.log('Paramètres de la boutique mis à jour avec succès !');
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) {
        onShowToast('Erreur lors de la mise à jour des paramètres.', 'error');
      } else {
        console.warn('Erreur lors de la mise à jour des paramètres.');
      }
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Add/Edit product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Électronique');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodImageUrl, setProdImageUrl] = useState(STOCK_IMAGE_PRESETS[0].url);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit product image size to max 800px width/height while keeping aspect ratio
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG to make it ultra lightweight (0.75 quality is perfect for mobile)
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setProdImageUrl(compressed);
            setIsUploadingImage(false);
          } else {
            setProdImageUrl(event.target?.result as string);
            setIsUploadingImage(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter & Search
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Selected receipt magnification state
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Financial calculations
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'received' || o.orderStatus === 'processing').length;
  const completedDeliveries = orders.filter(o => o.orderStatus === 'delivered').length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) return;

    onAddProduct({
      name: prodName,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      category: prodCategory,
      description: prodDescription,
      stock: Number(prodStock) || 0,
      imageUrl: prodImageUrl || STOCK_IMAGE_PRESETS[0].url
    });

    // Reset Form
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdDescription('');
    setProdStock('10');
    setProdImageUrl(STOCK_IMAGE_PRESETS[0].url);
    setIsAdding(false);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setProdCategory(product.category);
    setProdDescription(product.description);
    setProdStock(product.stock.toString());
    setProdImageUrl(product.imageUrl);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProduct({
      ...editingProduct,
      name: prodName,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      category: prodCategory,
      description: prodDescription,
      stock: Number(prodStock),
      imageUrl: prodImageUrl
    });

    setEditingProduct(null);
    // Reset Form
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdDescription('');
    setProdStock('10');
    setProdImageUrl(STOCK_IMAGE_PRESETS[0].url);
  };

  const cancelFormState = () => {
    setEditingProduct(null);
    setIsAdding(false);
    // Reset fields
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdDescription('');
    setProdStock('10');
    setProdImageUrl(STOCK_IMAGE_PRESETS[0].url);
  };

  const selectPresetImage = (url: string) => {
    setProdImageUrl(url);
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'edahabia':
        return <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-0.5 rounded-full">💳 Edahabia/CIB</span>;
      case 'baridimob':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">📱 BaridiMob</span>;
      case 'delivery':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">💵 Livraison</span>;
    }
  };

  const getOrderStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'received': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'returned': return 'bg-rose-50 text-rose-700 border border-rose-100';
    }
  };

  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const category = p.category || '';
    return name.toLowerCase().includes(productSearch.toLowerCase()) ||
           category.toLowerCase().includes(productSearch.toLowerCase());
  });

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'returns_all') return o.returnStatus && o.returnStatus !== 'none';
    return o.paymentStatus === orderFilter || o.orderStatus === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Espace Administration d'Univers Shop</h2>
          <p className="text-slate-500 text-sm font-medium">Gérez vos stocks de produits, suivez les versements et validez les livraisons sécurisées.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Vue Globale
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer  ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Vos Produits ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer  ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dossier Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_control')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'ai_control' ? 'bg-[#0052FF]/10 text-[#0052FF] font-extrabold shadow-xs' : 'text-slate-600 hover:text-[#0052FF]'}`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Pilotage IA 🧠</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer  ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            ⚙️ Paramètres
          </button>
        </div>
      </div>

      {/* CASE 1: STATS DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Cards Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Ventes Validées</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
              <h4 className="text-2xl font-display font-black text-slate-900">{totalRevenue.toLocaleString('fr-DZ')} DA</h4>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">Action requise</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Commandes en Cours</p>
              <h4 className="text-2xl font-display font-black text-slate-900">{pendingOrdersCount}</h4>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Succès Logistique</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Colis Livrés</p>
              <h4 className="text-2xl font-display font-black text-slate-900">{completedDeliveries}</h4>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><Grid className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">Vitrine Active</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Produits Exposés</p>
              <h4 className="text-2xl font-display font-black text-slate-900">{products.length}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick configuration instructions */}
            <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-850 p-6 rounded-3xl text-white flex flex-col justify-between shadow-xl">
              <div>
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="font-display font-black text-xl mb-2">Instructions de Vente</h3>
                <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
                  Pour tester la sécurité optimale d'Univers Shop :
                </p>
                <div className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <div className="flex gap-2">
                    <span className="bg-white/10 h-5 w-5 rounded-full flex items-center justify-center text-sky-300 text-[10px] flex-shrink-0">1</span>
                    <p>Passez en client et achetez un produit d'essai en Dinars.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-white/10 h-5 w-5 rounded-full flex items-center justify-center text-sky-300 text-[10px] flex-shrink-0">2</span>
                    <p>Découvrez la simulation OTP de la carte ou uploadez un faux reçu.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-white/10 h-5 w-5 rounded-full flex items-center justify-center text-sky-300 text-[10px] flex-shrink-0">3</span>
                    <p>Revenez ici, l'achat s'affichera immédiatement dans "Dossier Commandes". Vous pourrez valider le payement !</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Support Algérie :</span>
                <span className="font-bold text-white font-mono">{sellerPhone}</span>
              </div>
            </div>

            {/* Recents Incoming Orders List */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-lg text-slate-900">Activité Récente des Commandes</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-lg border border-sky-100 cursor-pointer"
                >
                  Voir Tout
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">Aucune commande passée pour le moment.</p>
                  <p className="text-xs text-slate-400 mt-1">Créez votre première commande en mode client pour tester !</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-sm">{order.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getOrderStatusColor(order.orderStatus)}`}>
                            {order.orderStatus === 'received' ? 'Reçu' : order.orderStatus === 'processing' ? 'En cours' : order.orderStatus === 'shipped' ? 'Expédié' : 'Livré'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{order.customerName} &bull; {order.customerWilaya} &bull; {order.customerPhone}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{order.totalAmount.toLocaleString('fr-DZ')} DA</p>
                          <p className="text-[10px] text-slate-400 font-medium">{order.transactionDate}</p>
                        </div>
                        {getPaymentMethodBadge(order.paymentMethod)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick World Cup 2026 Algeria Toggle & Status Widget */}
          <div className="bg-gradient-to-r from-emerald-900 via-[#064e3b] to-emerald-900 text-white rounded-3xl p-6 border border-emerald-800 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.1),transparent)] pointer-events-none"></div>
            <div className="space-y-1 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-400/20">
                🏆 Coupe du Monde 2026 ⚽
              </div>
              <h3 className="font-display font-black text-lg">Actionneur de Victoire de l'Algérie</h3>
              <p className="text-slate-300 text-xs max-w-xl">
                Chaque victoire ajoute 5% de réduction cumulable. Actuellement : <span className="text-emerald-400 font-black">{storeSettings?.algeriaCupWinsCount || 1} match(s)</span> gagné(s) soit <span className="text-emerald-400 font-black">{((storeSettings?.algeriaCupWinsCount || 1) * 5)}%</span> de réduction automatique pour l'ensemble des visiteurs !
              </p>
            </div>
            <button
              onClick={handleQuickToggleAlgeriaCup}
              className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2 ${
                storeSettings?.algeriaCupWinActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/20' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-950/20'
              }`}
            >
              <span>{storeSettings?.algeriaCupWinActive ? `🔴 Désactiver la réduction (${((storeSettings?.algeriaCupWinsCount || 1) * 5)}%)` : `🟢 Activer la réduction (${((storeSettings?.algeriaCupWinsCount || 1) * 5)}%)`}</span>
            </button>
          </div>

          {/* Secondary Stats Row: Visits and Deliveries */}
          {(() => {
            const todayAlgerianDate = new Date().toLocaleDateString('fr-DZ', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '-');
            const totalVisitsCount = visits.total || 0;
            const visitsTodayCount = visits.daily?.[todayAlgerianDate] || 0;

            const todayISOString = new Date().toISOString().split('T')[0];
            const totalDeliveriesCount = orders.filter(o => o.orderStatus === 'delivered').length;
            
            const deliveriesDailyMap: Record<string, number> = {};
            orders.forEach(o => {
              if (o.orderStatus === 'delivered' && o.deliveryDate) {
                deliveriesDailyMap[o.deliveryDate] = (deliveriesDailyMap[o.deliveryDate] || 0) + 1;
              }
            });
            const deliveriesTodayCount = deliveriesDailyMap[todayISOString] || 0;

            const sortedVisitsDaily = Object.entries(visits.daily || {}).sort((a, b) => b[0].localeCompare(a[0]));
            const sortedDeliveriesDaily = Object.entries(deliveriesDailyMap).sort((a, b) => b[0].localeCompare(a[0]));

            return (
              <div className="space-y-8 animate-fade-in" id="seller-visits-deliveries-analytics-section">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">Aujourd'hui</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Visites d'Aujourd'hui</p>
                    <h4 className="text-2xl font-display font-black text-slate-900">{visitsTodayCount}</h4>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Depuis le début</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Visiteurs Cumulés</p>
                    <h4 className="text-2xl font-display font-black text-slate-900">{totalVisitsCount}</h4>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Livraison Jour</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Livraisons d'Aujourd'hui</p>
                    <h4 className="text-2xl font-display font-black text-slate-900">{deliveriesTodayCount}</h4>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Historique</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Livraisons Totales</p>
                    <h4 className="text-2xl font-display font-black text-slate-900">{totalDeliveriesCount}</h4>
                  </div>
                </div>

                {/* Grid for Daily Log Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visits Log Table */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <span className="text-lg">📊</span>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">Suivi des Visiteurs par Jour</h4>
                        <p className="text-[10px] text-slate-400">Nombre de clients ayant visité le même jour</p>
                      </div>
                    </div>

                    {sortedVisitsDaily.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">Aucune donnée de fréquentation disponible.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-2.5">Date Calendrier</th>
                              <th className="py-2.5 text-right">Nombre de Visiteurs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700 font-medium">
                            {sortedVisitsDaily.slice(0, 10).map(([date, count]) => (
                              <tr key={date} className={date === todayAlgerianDate ? 'bg-sky-50/50 font-bold text-sky-950' : ''}>
                                <td className="py-2.5 flex items-center gap-1.5">
                                  <span>📅</span> {date}
                                  {date === todayAlgerianDate && <span className="text-[9px] bg-sky-100 text-sky-800 font-bold uppercase px-1.5 py-0.5 rounded ml-1">Aujourd'hui</span>}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-950 text-sm">{count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Deliveries Log Table */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <span className="text-lg">📦</span>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">Rapport de Livraisons Réalisées</h4>
                        <p className="text-[10px] text-slate-400">Nombre de colis livrés triés par date</p>
                      </div>
                    </div>

                    {sortedDeliveriesDaily.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">Aucun colis marqué comme 'Livré' pour le moment.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-2.5">Date Prévue de Livraison</th>
                              <th className="py-2.5 text-right">Colis Livrés</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700 font-medium">
                            {sortedDeliveriesDaily.slice(0, 10).map(([date, count]) => (
                              <tr key={date} className={date === todayISOString ? 'bg-rose-50/50 font-bold text-rose-950' : ''}>
                                <td className="py-2.5 flex items-center gap-1.5">
                                  <span>🚚</span> {date}
                                  {date === todayISOString && <span className="text-[9px] bg-rose-100 text-rose-800 font-bold uppercase px-1.5 py-0.5 rounded ml-1">Aujourd'hui</span>}
                                </td>
                                <td className="py-2.5 text-right font-black text-slate-950 text-sm">{count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* CASE 2: CRUD PRODUCTS SHEET */}
      {activeTab === 'products' && (
        <div className="space-y-8 animate-fade-in">
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-xs gap-4">
            <div className="w-full sm:max-w-xs relative">
              <input
                type="text"
                placeholder="Rechercher un produit ou une catégorie..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            
            {!isAdding && !editingProduct ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Mettre en vente un nouveau produit
              </button>
            ) : null}
          </div>

          {/* Create or Edit Forms */}
          {(isAdding || editingProduct) && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-display font-bold text-slate-900 text-base">
                  {editingProduct ? `Modifier l'article : ${editingProduct.name}` : 'Mettre en vente un nouveau produit'}
                </h3>
                <button onClick={cancelFormState} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={editingProduct ? handleSaveProductEdit : handleCreateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom de l'article *</label>
                      <input
                        type="text"
                        placeholder="Ex: iPhone 15 Pro Max, Casque Sony..."
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix de vente en DA *</label>
                        <input
                          type="number"
                          placeholder="Ex: 54000"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix avant promo (Optionnel)</label>
                        <input
                          type="number"
                          placeholder="Ex: 65000"
                          value={prodOriginalPrice}
                          onChange={(e) => setProdOriginalPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-slate-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stock disponible *</label>
                        <input
                          type="number"
                          placeholder="Ex: 10"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      >
                        <option value="Électronique">Électronique</option>
                        <option value="Audio">Audio</option>
                        <option value="Maison">Maison</option>
                        <option value="Accessoires">Accessoires</option>
                        <option value="Mode">Mode</option>
                        <option value="Nourriture">Nourriture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description détaillée de l'article *</label>
                      <textarea
                        rows={4}
                        placeholder="Quels sont les atouts, l'état de l'article, la garantie, etc..."
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column Layout: Image Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Image de l'article (Depuis votre Téléphone / Galerie ou via URL)</label>
                      
                      {/* Direct Upload / Camera Access Zone */}
                      <div className="border-2 border-dashed border-slate-200/80 hover:border-sky-500 rounded-2xl p-4 py-5 bg-slate-50/50 hover:bg-white text-center transition-all cursor-pointer relative">
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <Upload className="w-7 h-7 text-sky-600 mb-1.5" />
                          <span className="text-xs font-black text-slate-800">Prendre une photo ou Choisir un fichier</span>
                          <span className="text-[10px] text-slate-400 mt-1 leading-snug">
                            Cliquez pour activer l'appareil photo du téléphone ou visiter votre galerie d'images.
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {isUploadingImage && (
                        <div className="text-xs text-sky-600 font-bold bg-sky-50 p-2.5 rounded-xl border border-sky-100/80 text-center animate-pulse mt-2">
                          Chiffrement et conversion de l'image en cours...
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OU ENTRER UNE ADRESSE WEB</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (Saisir un d'internet)"
                        value={prodImageUrl.startsWith('data:') ? '' : prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OU CHOISIR UN MODÈLE UNIQUE</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {STOCK_IMAGE_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectPresetImage(preset.url)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              prodImageUrl === preset.url ? 'border-sky-600 ring-2 ring-sky-500/15' : 'border-slate-100 hover:border-slate-300'
                            }`}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                            {prodImageUrl === preset.url && (
                              <div className="absolute inset-0 bg-sky-900/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 font-bold" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 text-center flex flex-col items-center justify-center aspect-video max-w-sm mx-auto overflow-hidden">
                      {prodImageUrl ? (
                        <>
                          <img src={prodImageUrl} alt="Prévisualisation" className="max-h-24 rounded-lg object-contain shadow-xs border border-white" />
                          <span className="text-[10px] text-slate-400 mt-1.5 font-bold">Prévisualisation de l'article</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-300 mb-1" />
                          <span className="text-[10px] text-slate-400 font-semibold">Aucune image sélectionnée</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={cancelFormState}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? 'Enregistrer les Modifications' : 'Mettre l\'Article en Vente'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List Grid */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-base">Vos Stocks Actifs sur Univers Shop</h3>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="font-semibold">Aucun produit ne correspond à votre recherche.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-4.5 px-6">Article</th>
                      <th className="py-4.5 px-3">Catégorie</th>
                      <th className="py-4.5 px-3 text-right">Prix</th>
                      <th className="py-4.5 px-3 text-center">Quantité Stock</th>
                      <th className="py-4.5 px-6 text-right">Actions de gestion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{product.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-900 font-mono text-sm">
                              {product.price.toLocaleString('fr-DZ')} DA
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-red-500 font-semibold line-through font-mono">
                                {product.originalPrice.toLocaleString('fr-DZ')} DA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center font-mono font-medium">
                          {product.stock <= 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm font-bold">Rupture</span>
                          ) : (
                            <span className="text-slate-700">{product.stock} unités</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => handleStartEdit(product)}
                            className="inline-flex p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="inline-flex p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASE 3: ORDERS MANAGEMENT DIRECTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fade-in">
          {/* Filtering row */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wide">Filtres :</span>
            {[
              { id: 'all', label: 'Toutes les commandes' },
              { id: 'pending', label: 'Non vérifiées / À valider' },
              { id: 'verified', label: 'Paiements Vérifiés' },
              { id: 'received', label: 'Statut : Reçu' },
              { id: 'processing', label: 'Statut : Préparation' },
              { id: 'shipped', label: 'Statut : En cours de route' },
              { id: 'delivered', label: 'Statut : Livré sagement' },
              { id: 'returns_all', label: '🔍 Demandes de Retours' },
              { id: 'returned', label: '📦 Retours Terminés' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setOrderFilter(filter.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  orderFilter === filter.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">Aucune commande ne correspond à ces critères d'administration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-xs relative hover:border-slate-300 transition-all"
                >
                  {/* Top Bar item */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                      <span className="text-xs text-slate-400 font-medium">| {order.transactionDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getPaymentMethodBadge(order.paymentMethod)}
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                        Statut : {order.orderStatus === 'received' ? 'Reçu' : order.orderStatus === 'processing' ? 'Préparation' : order.orderStatus === 'shipped' ? 'Expédié' : 'Livré'}
                      </span>
                    </div>
                  </div>

                  {/* Details matrix */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Buyer details */}
                    <div className="space-y-2.5 font-medium border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client & expédition</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><User className="w-4 h-4" /></div>
                        <p className="text-sm font-semibold text-slate-800">{order.customerName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Phone className="w-4 h-4 text-sky-600" /></div>
                        <a href={`tel:${order.customerPhone}`} className="text-xs font-bold text-slate-700 hover:text-sky-600 transiton-colors">{order.customerPhone}</a>
                      </div>

                      <div className="flex items-start gap-2 pt-1 font-sans">
                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Truck className="w-4 h-4 text-emerald-600" /></div>
                        <div>
                          <p className="text-slate-800 text-xs font-semibold">{order.customerWilaya}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{order.customerAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ordered items details */}
                    <div className="space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Articles Commandés ({order.items.reduce((sum, i) => sum + i.quantity, 0)})</p>
                      <div className="space-y-1.5 font-sans">
                        {order.items.map((item, id) => (
                          <div key={id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-700 truncate max-w-[200px]" title={item.name}>{item.name}</span>
                            <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-sm">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-500 text-xs">TOTAL FACTURE :</span>
                        <span className="font-black text-slate-900 font-mono">{order.totalAmount.toLocaleString('fr-DZ')} DA</span>
                      </div>
                    </div>

                    {/* Secure verify, status logs & Receipt attachments */}
                    <div className="space-y-4 md:pl-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contrôle de Sécurité & Expédition</p>

                      {/* Display PDF snapshot or Baridimob coupon screenshot */}
                      {order.paymentMethod === 'baridimob' && (
                        <div>
                          {order.receiptScreenshot ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptUrl(order.receiptScreenshot || null)}
                              className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 p-2.5 rounded-xl text-amber-900 text-left flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <Eye className="w-4 h-4 text-amber-700" />
                                <span className="font-bold">Afficher le reçu virement</span>
                              </div>
                              <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded-sm uppercase">Reçu</span>
                            </button>
                          ) : (
                            <p className="text-xs text-rose-500 bg-rose-50 font-bold p-2.5 rounded-xl">⚠️ Reçu manquant !</p>
                          )}
                        </div>
                      )}

                      {/* Card or Delivery checks safety indicators */}
                      {order.paymentMethod === 'edahabia' && (
                        <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center gap-2 text-sky-950 font-sans">
                          <CheckCircle className="w-5 h-5 text-sky-600 flex-shrink-0" />
                          <div className="text-[10px]">
                            <p className="font-bold">Authentifié par Algérie Poste</p>
                            <p className="text-slate-500 mt-0.5">Flipping sécurisé. Carte (*{order.cardLastFour}) &bull; OTP Validé</p>
                          </div>
                        </div>
                      )}

                      {order.paymentMethod === 'delivery' && (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-emerald-950 font-sans">
                          <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div className="text-[10px]">
                            <p className="font-bold">Paiement à la Livraison</p>
                            <p className="text-slate-500 mt-0.5">Prévoyez l'envoi rapide du code SMS avant expédition.</p>
                          </div>
                        </div>
                      )}

                      {/* Controls for status updates */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Order status */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mettre à jour livraison</label>
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['orderStatus'])}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                          >
                            <option value="received">1. Reçu</option>
                            <option value="processing">2. En Préparation</option>
                            <option value="shipped">3. Expédié</option>
                            <option value="delivered">4. Livré</option>
                            <option value="returned">5. Retourné</option>
                          </select>
                        </div>

                        {/* Payment Verification status */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Authentifier virement</label>
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                          >
                            <option value="pending">⚠️ Non Validé</option>
                            <option value="verified">✅ Payé / Reçu OK</option>
                            <option value="failed">❌ Rejeté / Faux</option>
                          </select>
                        </div>
                      </div>

                      {/* Return Request Management Panel */}
                      {order.returnStatus && order.returnStatus !== 'none' && (
                        <div className="bg-amber-50/70 p-3.5 border border-amber-200 rounded-2xl space-y-2 mt-2 font-sans text-xs">
                          <p className="font-bold text-amber-900 flex items-center gap-1">
                            <span>🔄</span> Demande de Retour : {order.returnStatus === 'requested' ? 'À Valider' : order.returnStatus === 'approved' ? 'Acceptée' : 'Refusée'}
                          </p>
                          <p className="text-[10px] text-slate-700 leading-normal font-medium bg-white p-2 rounded-xl border border-slate-100 italic">
                            Motif déclaré : "{order.returnReason}"
                          </p>
                          
                          {/* Input for admin Return Notes */}
                          <div className="space-y-1">
                            <label className="block text-[8px] text-slate-400 font-black uppercase">Fiche / Notes de l'administrateur</label>
                            <input
                              type="text"
                              value={order.adminReturnNotes || ''}
                              placeholder="Frais retenus, CCP, ou détails..."
                              onChange={(e) => onUpdateOrderFields && onUpdateOrderFields(order.id, { adminReturnNotes: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                            />
                          </div>

                          {order.returnStatus === 'requested' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateOrderFields) {
                                    onUpdateOrderFields(order.id, { returnStatus: 'approved', orderStatus: 'returned' });
                                  } else {
                                    onUpdateOrderStatus(order.id, 'returned');
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                              >
                                ✓ Accepter & Restocker
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateOrderFields) {
                                    onUpdateOrderFields(order.id, { returnStatus: 'rejected' });
                                  }
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                              >
                                ✕ Refuser
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Receipt Zoom Lightbox */}
          {viewingReceiptUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
                <button 
                  onClick={() => setViewingReceiptUrl(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
                <div className="text-center mb-4">
                  <h4 className="font-display font-bold text-slate-900 border-b pb-2 mb-1 text-sm">Preuve de virement BaridiMob Uploade par l'acheteur</h4>
                  <p className="text-slate-400 text-xs">Vérifiez les numéros CCP, date et montant avant de passer le payement à "Validé OK".</p>
                </div>
                <div className="overflow-auto max-h-[70vh] flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  <img src={viewingReceiptUrl} alt="Reçu Virement" className="max-w-full object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CASE 4: SHOP SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 border-b border-slate-100 pb-4">
              <span className="p-2.5 bg-sky-50 text-[#0052FF] rounded-2xl text-lg">⚙️</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Profil & Identité de la Boutique</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Personnalisez le logo, le nom du site et le numéro de téléphone officiel d'assistance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 pt-4">
              {/* Store Name input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nom de la Boutique
                </label>
                <input
                  type="text"
                  value={localStoreName}
                  onChange={(e) => setLocalStoreName(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all"
                  placeholder="Ex: Univers Shop"
                  required
                />
              </div>

              {/* Secure Phone contact */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Numéro de Téléphone (WhatsApp & Appels direct)
                </label>
                <input
                  type="text"
                  value={localSellerPhone}
                  onChange={(e) => setLocalSellerPhone(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all"
                  placeholder="Ex: 0558926754"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Ce numéro est affiché sur le bandeau supérieur, les boutons d'appel direct, la page de caisse sécurisée et le portail de suivi des colis.
                </p>
              </div>

              {/* Promotion Banner Configuration */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bannière d'Annonce / Promotionnelle
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Affiche un message défilant ou fixe en haut du site pour capter l'attention des clients.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localPromoBannerActive} 
                      onChange={(e) => setLocalPromoBannerActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0052FF]"></div>
                  </label>
                </div>

                {localPromoBannerActive && (
                  <div className="space-y-2 animate-fade-in animate-duration-200">
                    <input
                      type="text"
                      value={localPromoBannerText}
                      onChange={(e) => setLocalPromoBannerText(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-[#0052FF] transition-all"
                      placeholder="Ex: 🔥 Livraison Gratuite (Alger) pour toute commande supérieure à 10000 DA !"
                      required={localPromoBannerActive}
                    />
                  </div>
                )}
              </div>

              {/* Promo Coupon Configuration */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Code de Réduction / Coupon Promo
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Permet aux clients d'appliquer un code de réduction lors du paiement.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localPromoCodeActive} 
                      onChange={(e) => setLocalPromoCodeActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0052FF]"></div>
                  </label>
                </div>

                {localPromoCodeActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mots Clés du Code</label>
                      <input
                        type="text"
                        value={localPromoCode}
                        onChange={(e) => setLocalPromoCode(e.target.value.toUpperCase())}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-[#0052FF] font-mono uppercase"
                        placeholder="Ex: PROMO20, DZ2026"
                        required={localPromoCodeActive}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type de Remise</label>
                      <select
                        value={localPromoDiscountType}
                        onChange={(e) => setLocalPromoDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-[#0052FF]"
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant Fixe (DA)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Valeur de la Remise</label>
                      <input
                        type="number"
                        value={localPromoDiscountValue}
                        onChange={(e) => setLocalPromoDiscountValue(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-[#0052FF] font-mono"
                        placeholder={localPromoDiscountType === 'percentage' ? "Ex: 15 (pour -15%)" : "Ex: 1000 (pour -1000 DA)"}
                        required={localPromoCodeActive}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Logo Settings */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Logo Web Universel (Image ou Texte)
                </label>

                {/* Live Header Logo Preview */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperçu en Direct du Header</span>
                  <div className="h-16 flex items-center justify-center px-8 bg-white border border-slate-100 rounded-2xl w-full max-w-sm shadow-xs">
                    {localLogoUrl ? (
                      <img 
                        src={localLogoUrl} 
                        alt="Logo Preview" 
                        className="h-10 w-auto object-contain max-w-[170px]" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-display font-black text-2xl tracking-tighter text-[#0052FF] uppercase">
                        {localStoreName || "Univers Shop"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {localLogoUrl ? "🎨 Logo Image (Importé / Lien externe) activé" : "📝 Mode Texte (Logo en texte automatique) activé"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload option */}
                  <div className="p-4 border border-dashed border-slate-200 bg-slate-50/25 hover:bg-slate-50/50 rounded-2xl flex flex-col justify-between space-y-4 transition-all col-span-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Importer une image de logo</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Sélectionnez une image de logo moderne (conseillé sur fond blanc / transparent).
                      </p>
                    </div>
                    
                    <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-95 text-center">
                      <Camera className="w-4 h-4" />
                      <span>Choisir une image...</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>

                  {/* Remote URL input */}
                  <div className="p-4 border border-slate-200 bg-slate-50/25 rounded-2xl flex flex-col justify-between space-y-4 col-span-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Saisir une adresse URL d'image</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Vous pouvez coller l'URL directe d'une image stockée en ligne.
                      </p>
                    </div>

                    <input
                      type="text"
                      value={localLogoUrl}
                      onChange={(e) => setLocalLogoUrl(e.target.value)}
                      className="w-full text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0052FF]"
                      placeholder="https://example.com/images/mon-logo.png"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  {localLogoUrl !== '/logo_univers_shop.jpg' && (
                    <button
                      type="button"
                      onClick={() => setLocalLogoUrl('/logo_univers_shop.jpg')}
                      className="text-xs font-bold text-[#0052FF] hover:text-[#003BCC] flex items-center gap-1.5 transition-all cursor-pointer bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg"
                    >
                      🔄 Utiliser le logo officiel (/logo_univers_shop.jpg)
                    </button>
                  )}
                  {localLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setLocalLogoUrl('')}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-all cursor-pointer bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-lg"
                    >
                      🗑 Désactiver l'image (Repasser en texte)
                    </button>
                  )}
                </div>
              </div>

              {/* Algeria World Cup 2026 Match Victory Promo Configuration */}
              <div className="space-y-4 border-t border-slate-100 pt-6 animate-fade-in">
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🇩🇿</span>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Réduction Coupe du Monde 2026 (Algérie)</span>
                          <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                            {localAlgeriaCupWinsCount * 5}% TOTAL AUTO
                          </span>
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Activez cette option et ajustez le nombre de victoires. Chaque victoire de l'Algérie ajoute 5% de réduction automatique cumulable pour tout le monde !
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localAlgeriaCupWinActive} 
                        onChange={(e) => setLocalAlgeriaCupWinActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {localAlgeriaCupWinActive && (
                    <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-emerald-100/50 animate-fade-in">
                      <span className="text-xs font-bold text-slate-700">Nombre de matchs gagnés :</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLocalAlgeriaCupWinsCount(Math.max(1, localAlgeriaCupWinsCount - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-black text-sm text-slate-900">
                          {localAlgeriaCupWinsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLocalAlgeriaCupWinsCount(localAlgeriaCupWinsCount + 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="ml-auto text-xs font-black text-emerald-700 font-mono bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        = Réduction de {localAlgeriaCupWinsCount * 5}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Maps API Key Configuration */}
              <div className="space-y-4 border-t border-slate-100 pt-6 animate-fade-in">
                <div className="bg-sky-50/50 border border-sky-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2 bg-sky-100 text-sky-600 rounded-xl text-sm">
                      📍
                    </span>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Clé API Google Maps (Suivi GPS Réel)</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Optionnel. Permet d'activer la vraie carte satellite Google Maps interactive à la place de notre radar GPS vectoriel simulé pour les clients.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localGoogleMapsApiKey}
                      onChange={(e) => setLocalGoogleMapsApiKey(e.target.value)}
                      className="w-full text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all"
                      placeholder="Ex: AIzaSyD..."
                    />
                    <div className="bg-white border border-slate-100 p-3 rounded-xl text-[10px] text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700">💡 Où trouver cette clé ?</p>
                      <p>Rendez-vous sur la console Google Cloud, activez l'API Maps SDK for JavaScript, générez une clé API et collez-la ici. Elle sera immédiatement sauvegardée dans votre base de données sécurisée Firestore.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="bg-[#0052FF] hover:bg-[#003BCC] text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-md shadow-[#0052FF]/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isUpdatingSettings ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'ai_control' && aiState && (
        <div className="space-y-8 animate-fade-in">
          {/* AI Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(0,82,255,0.15),transparent)] pointer-events-none"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#0052FF]/20 text-sky-400 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                  <span>Moteur de Décision Autonome Univers Shop</span>
                </div>
                <h3 className="text-2xl font-display font-black tracking-tight">AI Suite & Profit Optimization Layer</h3>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Pilotez votre boutique e-commerce à 100% grâce à l'intelligence artificielle. Tarification dynamique, gestion automatisée des budgets publicitaires, marketing prédictif et optimisation en boucle fermée du profit net.
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 self-stretch md:self-auto justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Statut Général IA</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${aiState.enabled ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
                    <span className={`w-3.5 h-3.5 rounded-full absolute ${aiState.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="text-xs font-black uppercase tracking-wide ml-2">{aiState.enabled ? 'ACTIF (En ligne)' : 'INACTIF (Désactivé)'}</span>
                  </div>
                </div>
                <button
                  onClick={() => updateAISuiteParam('enabled', !aiState.enabled)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    aiState.enabled 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25' 
                      : 'bg-[#0052FF] text-white hover:bg-[#003BCC]'
                  }`}
                >
                  {aiState.enabled ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Business KPI Control Dashboard & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-sans">Ventes Optimisées IA</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
              <h4 className="text-2xl font-display font-black text-slate-900">
                {(aiState.historicalStats[aiState.historicalStats.length - 1]?.revenue || 0).toLocaleString()} DA
              </h4>
              <p className="text-[10px] text-emerald-600 mt-2 font-bold">
                ▲ +14% par rapport à hier
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                  <Megaphone className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md font-sans">Budget Publicitaire</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dépense Pub Totale</p>
              <h4 className="text-2xl font-display font-black text-slate-900">
                {aiState.adCampaigns.reduce((sum, c) => sum + (c.status === 'active' ? c.budget : 0), 0).toLocaleString()} DA
              </h4>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Réalloué dynamiquement
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Percent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-sans">Conversion Client</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taux de Conversion</p>
              <h4 className="text-2xl font-display font-black text-slate-900">
                {aiState.historicalStats[aiState.historicalStats.length - 1]?.conversionRate || 3.5}%
              </h4>
              <p className="text-[10px] text-indigo-600 mt-2 font-bold">
                Moyenne sectorielle : 1.8%
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md font-sans">Marge Nette Optimisée</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bénéfice Net Estimé</p>
              <h4 className="text-2xl font-display font-black text-slate-900">
                {(aiState.historicalStats[aiState.historicalStats.length - 1]?.profit || 0).toLocaleString()} DA
              </h4>
              <p className="text-[10px] text-violet-600 mt-2 font-bold">
                Marge brute moyenne : 68%
              </p>
            </div>
          </div>

          {/* Simulated Control Loop Terminal & Action Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-sky-50 text-[#0052FF] rounded-2xl text-lg">🤖</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Centre d'Exécution & Simulation IA</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Simulez des cycles d'activité client pour entraîner le modèle prédictif.</p>
                  </div>
                </div>
                <button
                  onClick={triggerAIOptimization}
                  disabled={isRunningSimulation || !aiState.enabled}
                  className="bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-slate-900/10 hover:scale-[1.02] active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningSimulation ? 'animate-spin' : ''}`} />
                  <span>{isRunningSimulation ? 'Optimisation en cours...' : 'Lancer un Cycle d\'Optimisation'}</span>
                </button>
              </div>

              {/* Terminal Logs View */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Terminal d'analyse IA en direct</span>
                <div className="bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-300 p-4 rounded-2xl h-64 overflow-y-auto border border-slate-900 shadow-inner space-y-2">
                  <p className="text-sky-400 font-bold">{"[SYSTEM] INITIALIZING UNIVERS SHOP AI ENGINE..."}</p>
                  <p className="text-slate-500">{"[INFO] Loading current active catalogs and order structures."}</p>
                  <p className="text-emerald-400">{"[SUCCESS] Firestore real-time listener established with credentials."}</p>
                  
                  {simulationLogs.length === 0 ? (
                    <p className="text-slate-500 italic">{"[TERMINAL CLOUD] Aucun log d'exécution récent. Cliquez sur \"Lancer un Cycle d'Optimisation\" ci-dessus pour simuler une optimisation du système."}</p>
                  ) : (
                    simulationLogs.map((log, idx) => {
                      let color = 'text-slate-300';
                      if (log.includes('Ajusté le prix')) color = 'text-amber-400 font-semibold';
                      if (log.includes('Budget')) color = 'text-emerald-400 font-semibold';
                      if (log.includes('mise en PAUSE')) color = 'text-rose-400 font-semibold';
                      if (log.includes('Statut de')) color = 'text-sky-300';
                      return (
                        <p key={idx} className={color}>
                          {`[CYCLE-${idx + 1}] ${log}`}
                        </p>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Smart Alerts & Business Advisor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="p-2.5 bg-amber-50 text-amber-500 rounded-2xl text-lg"><Lightbulb className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recommandations IA</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Suggestions d'actions générées automatiquement.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Alert 1 */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-sans">Ajustement Pub</span>
                    <span className="text-[10px] text-slate-400 font-medium">Recommandé</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    La campagne "Google Search" produit un ROI insuffisant (0.6x).
                  </p>
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    Nous vous suggérons de couper cette campagne pour réinjecter ses 5 000 DA de budget sur "Instagram Story - Mode" qui culmine à un ROI exceptionnel de 4.1x.
                  </p>
                  <button
                    onClick={async () => {
                      if (aiState && onUpdateAIState) {
                        const updated = aiState.adCampaigns.map(c => {
                          if (c.id === 'camp-4') return { ...c, status: 'paused' as const, budget: 0 };
                          if (c.id === 'camp-2') return { ...c, budget: c.budget + 5000 };
                          return c;
                        });
                        onUpdateAIState({ ...aiState, adCampaigns: updated });
                        if (onShowToast) onShowToast('Budget réalloué avec succès ! Campagne non rentable stoppée.', 'success');
                      }
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all"
                  >
                    Réallouer le budget pub
                  </button>
                </div>

                {/* Alert 2 */}
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-sans">Conversion</span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-appliqué</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    Pic d'abandons de paniers détecté entre 14h et 16h.
                  </p>
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    Le module "Conversion Intelligence" a automatiquement activé une bannière d'urgence avec un compte à rebours de 15 minutes pour booster les checkouts hésitants.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 1: AI Dynamic Pricing Engine */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-50 text-amber-500 rounded-2xl text-lg"><Sliders className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">1. AI Dynamic Pricing Engine (Tarification Intelligente)</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Ajustement continu et prédictif des prix selon la demande réelle.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Statut Module</span>
                <button
                  onClick={() => updateAISuiteParam('dynamicPricing', !aiState.dynamicPricing)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${aiState.dynamicPricing ? 'bg-[#0052FF] justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>
            </div>

            {aiState.dynamicPricing && (
              <div className="space-y-6 animate-fade-in">
                {/* Settings Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Strategy Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Stratégie de Prix Principale</label>
                    <select
                      value={aiState.pricingStrategy}
                      onChange={(e) => updateAISuiteParam('pricingStrategy', e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0052FF]/20"
                    >
                      <option value="balanced">Équilibré (Volume de Ventes & Marge)</option>
                      <option value="profit">Maximisation de la Marge Nette</option>
                      <option value="conversion">Volume maximal (Taux de Conversion)</option>
                    </select>
                  </div>

                  {/* Safety Min Limit */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seuil de Prix Minimum ({aiState.safetyMinPricePct}%)
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={95}
                      step={5}
                      value={aiState.safetyMinPricePct}
                      onChange={(e) => updateAISuiteParam('safetyMinPricePct', Number(e.target.value))}
                      className="w-full accent-[#0052FF] h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">Le prix ne sera jamais rabaissé sous {aiState.safetyMinPricePct}% du tarif initial.</p>
                  </div>

                  {/* Safety Max Limit */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seuil de Prix Maximum ({aiState.safetyMaxPricePct}%)
                    </label>
                    <input
                      type="range"
                      min={105}
                      max={180}
                      step={5}
                      value={aiState.safetyMaxPricePct}
                      onChange={(e) => updateAISuiteParam('safetyMaxPricePct', Number(e.target.value))}
                      className="w-full accent-[#0052FF] h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">Le prix ne sera jamais augmenté au-dessus de {aiState.safetyMaxPricePct}% du tarif initial.</p>
                  </div>
                </div>

                {/* Validation Requirement */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#0052FF]" />
                      <span>Mode de Validation de Sécurité (Validation Humaine)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Si activé, chaque ajustement proposé par l'IA doit être validé manuellement ci-dessous avant d'être publié.
                    </p>
                  </div>
                  <button
                    onClick={() => updateAISuiteParam('requireHumanValidation', !aiState.requireHumanValidation)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      aiState.requireHumanValidation
                        ? 'bg-[#0052FF] text-white border-[#0052FF]'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {aiState.requireHumanValidation ? 'Validation Humaine : ACTIVE' : 'Ajustement direct : AUTONOME'}
                  </button>
                </div>

                {/* Pricing Decisions Table / List */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Historique des Suggestions & Décisions de Prix</span>
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Produit</th>
                          <th className="py-3 px-4 text-right">Ancien Prix</th>
                          <th className="py-3 px-4 text-right text-[#0052FF]">Nouveau Prix</th>
                          <th className="py-3 px-4">Justification IA</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {aiState.pricingDecisions.map((dec) => {
                          let statusBadge = '';
                          if (dec.status === 'applied') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (dec.status === 'pending') statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                          if (dec.status === 'rejected') statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';
                          if (dec.status === 'rolled_back') statusBadge = 'bg-slate-100 text-slate-500 border-slate-200';

                          return (
                            <tr key={dec.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                                {new Date(dec.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-800">{dec.productName}</td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                                {dec.oldPrice > 0 ? `${dec.oldPrice.toLocaleString()} DA` : '-'}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold font-mono text-[#0052FF]">
                                {dec.newPrice > 0 ? `${dec.newPrice.toLocaleString()} DA` : '-'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={dec.reason}>
                                {dec.reason}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${statusBadge}`}>
                                  {dec.status === 'applied' && 'Appliqué'}
                                  {dec.status === 'pending' && 'En Attente'}
                                  {dec.status === 'rejected' && 'Rejeté'}
                                  {dec.status === 'rolled_back' && 'Rétabli'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {dec.status === 'pending' && (
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => handlePricingDecisionAction(dec.id, 'approve')}
                                      className="px-2.5 py-1 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                    >
                                      Approuver
                                    </button>
                                    <button
                                      onClick={() => handlePricingDecisionAction(dec.id, 'reject')}
                                      className="px-2.5 py-1 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                    >
                                      Rejeter
                                    </button>
                                  </div>
                                )}
                                {dec.status === 'applied' && dec.productId !== 'all' && (
                                  <button
                                    onClick={() => handlePricingDecisionAction(dec.id, 'rollback')}
                                    className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                  >
                                    Reverser (Rollback)
                                  </button>
                                )}
                                {dec.status !== 'pending' && dec.status !== 'applied' && (
                                  <span className="text-[10px] text-slate-400 font-semibold">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Module 2: AI Advertising Engine */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl text-lg"><Megaphone className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">2. AI Advertising Engine (Optimisation Budgets Pubs)</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Allocation automatique des budgets publicitaires vers les canaux les plus rentables.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Statut Module</span>
                <button
                  onClick={() => updateAISuiteParam('autoAdvertising', !aiState.autoAdvertising)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${aiState.autoAdvertising ? 'bg-[#0052FF] justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>
            </div>

            {aiState.autoAdvertising && (
              <div className="space-y-6 animate-fade-in">
                {/* Active Ad Campaigns */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
                        <th className="py-3 px-4">Campagne Pub active</th>
                        <th className="py-3 px-4">Statut IA</th>
                        <th className="py-3 px-4 text-right">Budget Alloué</th>
                        <th className="py-3 px-4 text-right">Taux de Clic (CTR)</th>
                        <th className="py-3 px-4 text-right">Ventes Générées</th>
                        <th className="py-3 px-4 text-right">Coût par Achat (CPA)</th>
                        <th className="py-3 px-4 text-right text-sky-600">Retour sur Invest. (ROI)</th>
                        <th className="py-3 px-4 text-right">Actions Manuelles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {aiState.adCampaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{camp.name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${
                              camp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {camp.status === 'active' ? 'En Cours' : 'En Pause'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAdjustAdBudget(camp.id, -1000)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center rounded-sm text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span>{camp.budget.toLocaleString()} DA</span>
                              <button
                                onClick={() => handleAdjustAdBudget(camp.id, 1000)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center rounded-sm text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium">{camp.ctr}%</td>
                          <td className="py-3.5 px-4 text-right font-mono">{camp.conversions}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500">{camp.cpa.toLocaleString()} DA</td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono text-sky-600">{camp.roi}x</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleAdCampaign(camp.id)}
                              className={`px-3 py-1 font-bold text-[10px] rounded-lg cursor-pointer transition-all ${
                                camp.status === 'active'
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {camp.status === 'active' ? 'Mettre en pause' : 'Relancer la pub'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Module 3: AI Marketing Automation Layer & Module 6: Customer Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Marketing triggers */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl text-lg"><Percent className="w-5 h-5" /></span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">3. AI Marketing Automation Layer</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Offres ciblées générées automatiquement selon les événements.</p>
                  </div>
                </div>
                <button
                  onClick={() => updateAISuiteParam('marketingAutomation', !aiState.marketingAutomation)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${aiState.marketingAutomation ? 'bg-[#0052FF] justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>

              {aiState.marketingAutomation && (
                <div className="space-y-4 animate-fade-in">
                  {aiState.marketingCampaigns.map((mkt) => (
                    <div key={mkt.id} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center hover:shadow-xs transition-shadow">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Trigger : {mkt.trigger}</span>
                        <h4 className="text-sm font-bold text-slate-800">{mkt.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Promotion :</span>
                          <span className="text-xs font-black font-mono text-violet-600">-{mkt.discount}% de réduction</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">{mkt.status === 'active' ? 'Activé' : 'Désactivé'}</span>
                        <button
                          onClick={() => handleToggleMarketingCampaign(mkt.id)}
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${mkt.status === 'active' ? 'bg-[#0052FF] justify-end' : 'bg-slate-300 justify-start'}`}
                        >
                          <span className="bg-white w-4 h-4 rounded-full shadow-xs"></span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Intelligence Engine */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-lg"><User className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">6. Customer Intelligence Engine</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Segmentation prédictive et recommandations automatiques.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Segment 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Clients Hésitants (Abandons de panier potentiels)</span>
                    <span className="font-mono text-slate-500 font-bold">40% d'audience</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed font-sans">
                    🎯 Recommandation IA : Retargeting panier automatique activé. Relance de réduction de -15% après 30 secondes d'inactivité.
                  </p>
                </div>

                {/* Segment 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Nouveaux Visiteurs (Froid)</span>
                    <span className="font-mono text-slate-500 font-bold">35% d'audience</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed font-sans">
                    🎯 Recommandation IA : Offre de bienvenue active. Réduction immédiate de -5% proposée à l'arrivée pour déclencher la 1ère commande.
                  </p>
                </div>

                {/* Segment 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Acheteurs Réguliers & Ambassadeurs</span>
                    <span className="font-mono text-slate-500 font-bold">20% d'audience</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed font-sans">
                    🎯 Recommandation IA : Programme fidélité automatique en cours d'attribution. Doublement des points de fidélité pour maintenir l'engagement.
                  </p>
                </div>

                {/* Segment 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Clients VIP à Haute Valeur Ajoutée</span>
                    <span className="font-mono text-slate-500 font-bold">5% d'audience</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed font-sans">
                    🎯 Recommandation IA : Recommandations ultra-personnalisées basées sur l'historique d'achat. Accès anticipé aux ventes privées.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: Conversion Intelligence & Module 5: Profit Optimization Loop */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="p-2.5 bg-[#0052FF]/10 text-[#0052FF] rounded-2xl text-lg"><BarChart3 className="w-5 h-5" /></span>
              <div>
                <h3 className="text-base font-bold text-slate-900">4. Conversion Intelligence & 5. Profit Optimization Loop</h3>
                <p className="text-slate-500 text-xs mt-0.5">Suivi de la performance globale et apprentissage autonome en boucle continue.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Funnel visualization */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Entonnoir de Conversion Optimisé en Temps Réel</span>
                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                      <span className="font-bold text-slate-800 font-sans">Visites sur la Boutique</span>
                    </div>
                    <span className="font-mono font-bold text-slate-500">100% (12 400 visiteurs)</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex justify-between items-center text-xs w-[92%]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                      <span className="font-bold text-slate-800 font-sans">Ajouts au Panier</span>
                    </div>
                    <span className="font-mono font-bold text-sky-600">32% (3 968 utilisateurs)</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex justify-between items-center text-xs w-[84%]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                      <span className="font-bold text-slate-800 font-sans">Initiation du Checkout</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-600">14.5% (1 798 checkouts)</span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 bg-[#0052FF]/5 border border-[#0052FF]/10 rounded-xl flex justify-between items-center text-xs w-[76%]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold text-[10px]">4</span>
                      <span className="font-bold text-[#0052FF] font-sans">Commandes Confirmées (Optimisé par l'IA)</span>
                    </div>
                    <span className="font-mono font-bold text-[#0052FF]">{aiState.historicalStats[aiState.historicalStats.length - 1]?.conversionRate || 3.5}% (434 ventes)</span>
                  </div>
                </div>
              </div>

              {/* Loop trend graph representation */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Boucle d'Apprentissage Continu (Chiffre d'Affaires vs Profit Net)</span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 h-52 flex flex-col justify-between">
                  <div className="flex items-end justify-between h-36 pt-4 px-2">
                    {aiState.historicalStats.map((stat, idx) => {
                      const maxRevenue = Math.max(...aiState.historicalStats.map(s => s.revenue), 100000);
                      const revenueHeight = `${(stat.revenue / maxRevenue) * 100}%`;
                      const profitHeight = `${(stat.profit / maxRevenue) * 100}%`;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end w-8">
                          <div className="flex items-end gap-1 h-full w-full justify-center">
                            {/* Revenue Bar */}
                            <div className="bg-sky-400/80 w-2.5 rounded-t-sm transition-all duration-500 hover:opacity-100 opacity-80" style={{ height: revenueHeight }} title={`Revenue: ${stat.revenue.toLocaleString()} DA`}></div>
                            {/* Profit Bar */}
                            <div className="bg-[#0052FF] w-2.5 rounded-t-sm transition-all duration-500" style={{ height: profitHeight }} title={`Profit: ${stat.profit.toLocaleString()} DA`}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 block truncate max-w-[32px]">{stat.date}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center gap-6 border-t border-slate-200/60 pt-2 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                      <span className="text-slate-500 font-sans">Chiffre d'Affaires</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#0052FF] rounded-full"></span>
                      <span className="text-slate-500 font-sans">Marge Nette (Bénéfice)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
