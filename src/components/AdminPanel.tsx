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
  Upload
} from 'lucide-react';
import { Product, Order, PaymentMethod } from '../types';

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
  sellerPhone
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'dashboard'>('dashboard');

  // Add/Edit product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
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
      reader.onloadend = () => {
        setProdImageUrl(reader.result as string);
        setIsUploadingImage(false);
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
      category: prodCategory,
      description: prodDescription,
      stock: Number(prodStock) || 0,
      imageUrl: prodImageUrl || STOCK_IMAGE_PRESETS[0].url
    });

    // Reset Form
    setProdName('');
    setProdPrice('');
    setProdDescription('');
    setProdStock('10');
    setProdImageUrl(STOCK_IMAGE_PRESETS[0].url);
    setIsAdding(false);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
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
      category: prodCategory,
      description: prodDescription,
      stock: Number(prodStock),
      imageUrl: prodImageUrl
    });

    setEditingProduct(null);
    // Reset Form
    setProdName('');
    setProdPrice('');
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

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
        <div className="inline-flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl self-start">
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

                    <div className="grid grid-cols-2 gap-4">
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
                        <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono text-sm">
                          {product.price.toLocaleString('fr-DZ')} DA
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
    </div>
  );
}
