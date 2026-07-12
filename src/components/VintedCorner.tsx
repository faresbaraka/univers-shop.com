import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  ShoppingBag, 
  Phone, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  Filter, 
  Upload, 
  Sparkles, 
  User, 
  Info, 
  ShieldCheck, 
  Heart, 
  AlertCircle, 
  X,
  MessageSquare,
  HelpCircle,
  Clock,
  Laptop,
  Smartphone,
  Cpu,
  BookOpen,
  Home,
  Compass,
  Car,
  TrendingDown,
  Globe,
  Share2
} from 'lucide-react';
import { Product } from '../types';
import { Language } from '../lib/translations';

interface VintedCornerProps {
  products: Product[];
  onAddProduct: (prod: Omit<Product, 'id' | 'salesCount' | 'createdAt'> & { isSecondHand?: boolean; sellerName?: string; sellerPhone?: string; condition?: string; size?: string; brand?: string }) => Promise<void>;
  onDeleteProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  language: Language;
  onClose: () => void;
}

// Preset high-quality Unsplash image suggestions for popular Algerian secondhand categories
const PRESET_IMAGES = [
  {
    name: 'iPhone (Apple iOS)',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    category: 'Téléphones & High-Tech'
  },
  {
    name: 'Smartphone Android (Samsung/Xiaomi)',
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    category: 'Téléphones & High-Tech'
  },
  {
    name: 'PC Portable / Laptop',
    url: 'https://images.unsplash.com/photo-1496181130204-7552cc1454a4?auto=format&fit=crop&q=80&w=600',
    category: 'PC & Informatique'
  },
  {
    name: 'Console PlayStation / Switch',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    category: 'Jeux Vidéo & Consoles'
  },
  {
    name: 'Casque Audio / Écouteurs',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    category: 'Téléphones & High-Tech'
  },
  {
    name: 'Robot Cuisine / Cafetière',
    url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600',
    category: 'Maison & Électroménager'
  },
  {
    name: 'Veste Jean / Denim',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600',
    category: 'Mode & Vêtements'
  },
  {
    name: 'Baskets de Sport',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
    category: 'Chaussures'
  },
  {
    name: 'Livre / Roman / Scolaire',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    category: 'Livres & Scolaire'
  },
  {
    name: 'Vélo / VTT de course',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    category: 'Sports & Loisirs'
  }
];

// Fallback initial multi-category secondhand items if Firestore currently has none
const FALLBACK_MARKETPLACE_ITEMS: Product[] = [
  {
    id: 'sh-1',
    name: 'iPhone 13 Pro Max 256Go Bleu Alpin',
    description: 'iPhone 13 Pro Max en parfait état de fonctionnement, batterie à 88%. Toujours protégé par un verre trempé et une coque Spigen. Vendu avec boîte et câble de recharge d\'origine. Aucun pixel mort ni rayure sur l\'écran.',
    price: 89000,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    category: 'Téléphones & High-Tech',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Karim',
    sellerPhone: '0550124578',
    condition: 'excellent',
    size: '256 Go',
    brand: 'Apple'
  },
  {
    id: 'sh-android-1',
    name: 'Samsung Galaxy S23 Ultra 5G 256Go Noir',
    description: 'Superbe smartphone Android haut de gamme Samsung Galaxy S23 Ultra en parfait état de marche. Capteur photo 200 Mpx incroyable avec zoom x100. Stylet S-Pen inclus et fonctionnel. Écran Dynamic AMOLED 120Hz impeccable. Vendu avec chargeur rapide d\'origine.',
    price: 98000,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    category: 'Téléphones & High-Tech',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Fares',
    sellerPhone: '0771234567',
    condition: 'excellent',
    size: '256 Go / 12Go RAM',
    brand: 'Samsung'
  },
  {
    id: 'sh-2',
    name: 'PlayStation 5 Slim Edition Standard 1To',
    description: 'PS5 Slim achetée il y a 6 mois, encore sous garantie avec facture d\'achat. Fournie avec sa manette DualSense blanche d\'origine, les câbles et le jeu FC 24 préinstallé. Fonctionne silencieusement, aucun bug.',
    price: 74000,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    category: 'Jeux Vidéo & Consoles',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Amine',
    sellerPhone: '0661254789',
    condition: 'excellent',
    size: '1 To Standard',
    brand: 'Sony'
  },
  {
    id: 'sh-3',
    name: 'Veste en Jean Levis Trucker Vintage',
    description: 'Une superbe veste Levi\'s authentique en coton épais des années 90, très peu portée. Le denim est lourd et a une superbe patine naturelle. Idéal pour un style rétro chic.',
    price: 4900,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600',
    category: 'Mode & Vêtements',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Sofiane',
    sellerPhone: '0555321456',
    condition: 'excellent',
    size: 'M',
    brand: 'Levi\'s'
  },
  {
    id: 'sh-4',
    name: 'Baskets Air Jordan 1 Low Retro',
    description: 'Baskets Jordan portées seulement 3-4 fois. Très propres, semelle impeccable. Vente car taille légèrement trop petite pour moi. Boîte d\'origine incluse.',
    price: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
    category: 'Chaussures',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Yassine',
    sellerPhone: '0770984521',
    condition: 'very_good',
    size: '43',
    brand: 'Nike'
  },
  {
    id: 'sh-5',
    name: 'Machine à Café Delonghi Dedica EC685',
    description: 'Machine expresso Delonghi en excellent état. Permet d\'utiliser du café moulu ou des dosettes ESE. Buse vapeur performante pour de superbes cappuccinos mousseux. Détartrage fait récemment.',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600',
    category: 'Maison & Électroménager',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Meriem',
    sellerPhone: '0552361478',
    condition: 'excellent',
    size: 'EC685 Rouge',
    brand: 'Delonghi'
  },
  {
    id: 'sh-6',
    name: 'VTT Rockrider ST 120 27.5"',
    description: 'Vélo tout terrain Décathlon Rockrider ST 120, taille L. Cadre en aluminium léger, 9 vitesses monoplateau très intuitif, freins à disque mécaniques très réactifs. Idéal pour sorties et déplacements urbains algérois.',
    price: 36000,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    category: 'Sports & Loisirs',
    stock: 1,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    isSecondHand: true,
    sellerName: 'Riad',
    sellerPhone: '0658963214',
    condition: 'very_good',
    size: 'Taille L',
    brand: 'Decathlon'
  }
];

// Eco impact statistics mapping: CO2 (kg) and Water (Liters) saved per secondhand purchase
const ECO_SAVINGS: Record<string, { co2: number; water: number }> = {
  'Mode & Vêtements': { co2: 25, water: 2500 },
  'Chaussures': { co2: 15, water: 8000 },
  'Téléphones & High-Tech': { co2: 80, water: 12000 },
  'PC & Informatique': { co2: 150, water: 20000 },
  'Jeux Vidéo & Consoles': { co2: 45, water: 3000 },
  'Maison & Électroménager': { co2: 120, water: 15000 },
  'Livres & Scolaire': { co2: 3, water: 100 },
  'Sports & Loisirs': { co2: 50, water: 4000 },
  'Auto & Moto': { co2: 500, water: 50000 },
  'Autre': { co2: 10, water: 500 }
};

// Translatable terms
const dictionary = {
  fr: {
    title: "Algérie Occasions 🇩🇿 - Marché d'Occasion Tout-en-Un",
    subtitle: "Achetez et vendez absolument TOUT : High-Tech, Électronique, Consoles, Mode, Livres, Véhicules...",
    badge: "Marché d'Occasion & Vide-Grenier 100% Gratuit",
    secureTx: "Transactions directes et sans commission",
    wilayas: "Disponible dans les 58 Wilayas",
    zeroComm: "Aucun frais de vente",
    buyOccasion: "Acheter d'Occasion",
    sellArticle: "Vendre un Objet",
    myListings: "Mes Annonces",
    backToShop: "Retour Boutique",
    searchPlaceholder: "Chercher un PC portable, iPhone, baskets, robot de cuisine...",
    allStates: "Tous les états",
    maxPrice: "Prix maximum :",
    noItemFound: "Aucun objet trouvé",
    noItemDesc: "Aucun article ne correspond à vos filtres. Modifiez votre recherche ou publiez le premier article !",
    resetFilters: "Réinitialiser",
    sellerLabel: "Vendeur :",
    conditionLabel: "État :",
    priceLabel: "Prix Occasion",
    buyBtn: "Contacter",
    publishTitle: "Publier une annonce gratuite",
    publishSubtitle: "Vendez vos objets en 30 secondes sans aucun frais ni commission !",
    titleLabel: "Titre de l'annonce *",
    categoryLabel: "Catégorie *",
    priceField: "Prix souhaité * (DA)",
    stateField: "État de l'objet *",
    brandField: "Marque / Fabricant",
    specField: "Taille / Modèle / Version",
    descField: "Description détaillée *",
    sellerNameField: "Votre Nom / Pseudo *",
    sellerPhoneField: "Numéro de téléphone * (Algérie)",
    publishBtn: "Publier mon annonce instantanément",
    ecoTitle: "Votre Impact Écologique ♻️",
    ecoDesc: "En achetant d'occasion sur Algérie Occasions, vous évitez la production de nouveaux biens !",
    magicDescBtn: "✨ Description Magique par IA",
    whatsappBtn: "WhatsApp / Viber",
    callBtn: "Appeler",
    detailsTitle: "Détails de l'annonce",
    addToCart: "Ajouter au Panier"
  },
  ar: {
    title: "سوق المستعمل بالجزائر 🇩🇿 - كل شيء في مكان واحد",
    subtitle: "اشترِ وبع أي شيء: هواتف، أجهزة كمبيوتر، ألعاب، ملابس، كهرومنزلي، سيارات...",
    badge: "سوق مفتوح مجاني 100% بدون عمولة",
    secureTx: "تواصل مباشر وآمن بين المشتري والبائع",
    wilayas: "متوفر في 58 ولاية جزائرية",
    zeroComm: "0% عمولة - بيع مجاني تماماً",
    buyOccasion: "🛒 تصفح وشراء",
    sellArticle: "➕ أضف إعلاناً مجاناً",
    myListings: "💼 إعلاناتي النشطة",
    backToShop: "➔ العودة للمتجر",
    searchPlaceholder: "ابحث عن هاتف، حاسوب، ملابس، خلاط، ألعاب...",
    allStates: "كل الحالات",
    maxPrice: "السعر الأقصى:",
    noItemFound: "لم يتم العثور على أي منتج",
    noItemDesc: "لا توجد نتائج تطابق بحثك حالياً. غير الفلاتر أو كن أول من يضيف إعلاناً هنا!",
    resetFilters: "إعادة تعيين الفلاتر",
    sellerLabel: "البائع:",
    conditionLabel: "الحالة:",
    priceLabel: "سعر المستعمل",
    buyBtn: "اتصال ومراسلة",
    publishTitle: "انشر إعلانك مجاناً الآن",
    publishSubtitle: "قم ببيع أغراضك المستعملة أو الجديدة في 30 ثانية مجاناً ودون أي عمولة !",
    titleLabel: "عنوان الإعلان *",
    categoryLabel: "الفئة / القسم *",
    priceField: "السعر المطلوب * (دج)",
    stateField: "حالة الغرض *",
    brandField: "الماركة / المصنع",
    specField: "المقاس / الموديل / النسخة",
    descField: "الوصف التفصيلي للغرض *",
    sellerNameField: "اسمك الكريم / اللقب *",
    sellerPhoneField: "رقم الهاتف * (الجزائر)",
    publishBtn: "انشر إعلانك فوراً",
    ecoTitle: "أثرك البيئي الإيجابي ♻️",
    ecoDesc: "بشرائك للمستعمل في الجزائر، تساهم في حماية البيئة وتقليل التلوث والنفايات الصناعية!",
    magicDescBtn: "✨ توليد وصف سحري تلقائي",
    whatsappBtn: "واتساب / فايبر",
    callBtn: "اتصل الآن",
    detailsTitle: "تفاصيل الإعلان",
    addToCart: "إضافة للسلة"
  },
  en: {
    title: "Algeria Secondhand Market 🇩🇿 - All-in-One",
    subtitle: "Buy & sell absolutely ANYTHING: Phones, Laptops, Consoles, Fashion, Appliances, Books...",
    badge: "100% Free Peer-to-Peer Secondhand Marketplace",
    secureTx: "Direct secure trades, zero fees",
    wilayas: "Active in all 58 Wilayas",
    zeroComm: "No fees, keep 100% of your earnings",
    buyOccasion: "Buy Secondhand",
    sellArticle: "Post Free Ad",
    myListings: "My Ad Listings",
    backToShop: "Back to Shop",
    searchPlaceholder: "Search laptop, iPhone, sneakers, espresso machine...",
    allStates: "All conditions",
    maxPrice: "Maximum price:",
    noItemFound: "No items found",
    noItemDesc: "No listings match your current filters. Adjust your search or be the first to sell here!",
    resetFilters: "Reset filters",
    sellerLabel: "Seller:",
    conditionLabel: "Condition:",
    priceLabel: "Used Price",
    buyBtn: "Contact Seller",
    publishTitle: "Publish a Free Listing",
    publishSubtitle: "Sell your unused items in 30 seconds with zero fees or commissions!",
    titleLabel: "Listing Title *",
    categoryLabel: "Category *",
    priceField: "Desired Price * (DA)",
    stateField: "Item Condition *",
    brandField: "Brand / Manufacturer",
    specField: "Size / Model / Specifications",
    descField: "Detailed Description *",
    sellerNameField: "Your Name / Alias *",
    sellerPhoneField: "Phone Number * (Algeria)",
    publishBtn: "Publish My Listing Now",
    ecoTitle: "Your Eco Impact ♻️",
    ecoDesc: "By buying secondhand on Algeria Occasions, you save natural resources and CO2 emissions!",
    magicDescBtn: "✨ Magic AI Description",
    whatsappBtn: "WhatsApp / Viber",
    callBtn: "Call Seller",
    detailsTitle: "Listing Details",
    addToCart: "Add to Cart"
  }
};

export default function VintedCorner({ 
  products, 
  onAddProduct, 
  onDeleteProduct, 
  onAddToCart,
  language,
  onClose
}: VintedCornerProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-listings'>('buy');
  
  // Browsing and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedCondition, setSelectedCondition] = useState('Tous');
  const [sizeFilter, setSizeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  // New Listing form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Téléphones & High-Tech');
  const [formCondition, setFormCondition] = useState<'new_with_tag' | 'excellent' | 'very_good' | 'good' | 'fair'>('excellent');
  const [formSize, setFormSize] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSellerName, setFormSellerName] = useState('');
  const [formSellerPhone, setFormSellerPhone] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Manage listings auth state
  const [myPhoneAuth, setMyPhoneAuth] = useState('');

  // Modal visual details state
  const [selectedItemDetails, setSelectedItemDetails] = useState<Product | null>(null);

  const categories = [
    'Tous', 
    'Téléphones & High-Tech',
    'PC & Informatique',
    'Jeux Vidéo & Consoles',
    'Maison & Électroménager',
    'Mode & Vêtements', 
    'Chaussures', 
    'Livres & Scolaire', 
    'Sports & Loisirs', 
    'Auto & Moto', 
    'Autre'
  ];

  const conditions = [
    { value: 'Tous', label: 'Tous les états' },
    { value: 'new_with_tag', label: 'Neuf avec étiquette / scellé 🏷️' },
    { value: 'excellent', label: 'Excellent état ✨' },
    { value: 'very_good', label: 'Très bon état 👍' },
    { value: 'good', label: 'Bon état 👌' },
    { value: 'fair', label: 'Satisfaisant 🤝' }
  ];

  // Combine real Firestore products (where `isSecondHand === true`) with our preloaded fallbacks
  const firestoreSecondHand = products.filter(p => p.isSecondHand === true);
  const allSecondHandItems = firestoreSecondHand.length > 0 
    ? firestoreSecondHand 
    : FALLBACK_MARKETPLACE_ITEMS;

  // Filter & Sort items based on user inputs
  const filteredItems = allSecondHandItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'Tous' || item.condition === selectedCondition;
    const matchesSize = !sizeFilter || (item.size && item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    const matchesBrand = !brandFilter || (item.brand && item.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    const matchesPrice = item.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesCondition && matchesSize && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    // Default newest
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });

  // Calculate dynamic Eco Savings of all active listings
  const totalEcoStats = allSecondHandItems.reduce((acc, item) => {
    const savings = ECO_SAVINGS[item.category || 'Autre'] || ECO_SAVINGS['Autre'];
    return {
      co2: acc.co2 + savings.co2,
      water: acc.water + savings.water
    };
  }, { co2: 0, water: 0 });

  // Handle local File Upload and conversion to Base64 (DataURL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("L'image est trop volumineuse. Veuillez choisir une image de moins de 3 Mo.");
      return;
    }

    setUploadProgress("Traitement de l'image...");
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
      setUploadProgress("Image prête ! ✨");
    };
    reader.readAsDataURL(file);
  };

  const generateMagicDescription = () => {
    if (!formName) {
      alert("Veuillez d'abord entrer un titre pour que l'IA puisse générer une description.");
      return;
    }

    const stateLabel = getConditionLabel(formCondition);
    const specInfo = formSize ? `\n- Spécifications / Version : ${formSize}` : '';
    const brandInfo = formBrand ? ` (${formBrand})` : '';

    let generated = "";
    if (language === 'ar') {
      generated = `السلام عليكم، أضع بين أيديكم للبيع: ${formName}${brandInfo}.
- القسم: ${formCategory}
- الحالة: ${stateLabel}${specInfo}

الغرض في حالة ممتازة ومثالي للاستخدام اليومي. البيع مستعجل وبسعر جد معقول.
الرجاء التواصل معي مباشرة للمزيد من التفاصيل أو لتنسيق التسليم (متوفر التسليم يد بيد أو الإرسال). شكراً !`;
    } else {
      generated = `Bonjour, je mets en vente cet article d'occasion : ${formName}${brandInfo}.
- Catégorie : ${formCategory}
- État : ${stateLabel}${specInfo}

L'objet fonctionne parfaitement et est prêt à l'usage. Vente rapide et prix très raisonnable.
N'hésitez pas à me contacter par téléphone ou messagerie pour plus d'informations ou pour convenir d'un rendez-vous pour la remise en main propre.`;
    }

    setFormDescription(generated);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formDescription || !formSellerName || !formSellerPhone) {
      alert("Veuillez remplir tous les champs obligatoires (Titre, Prix, Description, Votre Nom et Téléphone).");
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Veuillez entrer un prix valide en Dinars Algériens.");
      return;
    }

    const finalImage = formImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';

    setIsSubmitting(true);
    try {
      await onAddProduct({
        name: formName.trim(),
        description: formDescription.trim(),
        price: priceNum,
        imageUrl: finalImage,
        category: formCategory,
        stock: 1, // Second-hand items are unique listings
        isSecondHand: true,
        sellerName: formSellerName.trim(),
        sellerPhone: formSellerPhone.trim(),
        condition: formCondition,
        size: formSize.trim() || undefined,
        brand: formBrand.trim() || undefined
      });

      // Save user phone in local storage as a helper for auto-login to "My Listings"
      localStorage.setItem('vinted_my_phone_number', formSellerPhone.trim());
      
      // Reset form
      setFormName('');
      setFormDescription('');
      setFormPrice('');
      setFormSize('');
      setFormBrand('');
      setFormImageUrl('');
      setUploadProgress(null);
      
      // Switch to Buy tab to see listing
      setActiveTab('buy');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication de votre annonce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper translations for conditions
  const getConditionLabel = (cond?: string) => {
    switch (cond) {
      case 'new_with_tag': return language === 'ar' ? 'جديد غير مستعمل 🏷️' : 'Neuf avec étiquette / scellé 🏷️';
      case 'excellent': return language === 'ar' ? 'شبه جديد ✨' : 'Excellent état ✨';
      case 'very_good': return language === 'ar' ? 'حالة ممتازة 👍' : 'Très bon état 👍';
      case 'good': return language === 'ar' ? 'حالة جيدة 👌' : 'Bon état 👌';
      case 'fair': return language === 'ar' ? 'مقبول / مستعمل 🤝' : 'Satisfaisant 🤝';
      default: return language === 'ar' ? 'حالة جيدة' : 'Bon état';
    }
  };

  const getConditionColor = (cond?: string) => {
    switch (cond) {
      case 'new_with_tag': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'excellent': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'very_good': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'good': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fair': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Get active user's posted listings
  useEffect(() => {
    const savedPhone = localStorage.getItem('vinted_my_phone_number');
    if (savedPhone) {
      setMyPhoneAuth(savedPhone);
    }
  }, []);

  const myListings = allSecondHandItems.filter(item => {
    return item.sellerPhone === myPhoneAuth;
  });

  const isRtl = language === 'ar';
  const dict = dictionary[language] || dictionary['fr'];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Vinted Brand Styled Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0d9488] to-[#14b8a6] text-white py-14 px-6 sm:px-12 text-center shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/25 text-teal-200 text-[10px] font-black px-4 py-2 rounded-full border border-teal-500/20 uppercase tracking-widest leading-none">
            🚀 {dict.badge}
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            {dict.title}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-medium">
            {dict.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-white/5">
              🔌 {dict.zeroComm}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-white/5">
              🇩🇿 {dict.wilayas}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-white/5">
              🤝 {dict.secureTx}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{dict.buyOccasion}</span>
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sell'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{dict.sellArticle}</span>
            </button>
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-listings'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{dict.myListings}</span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-850 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {dict.backToShop}
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* BUY TAB */}
        {activeTab === 'buy' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left Sidebar Filters */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-teal-500" />
                  <span>Filtres</span>
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('Tous');
                    setSelectedCondition('Tous');
                    setSearchQuery('');
                    setSizeFilter('');
                    setBrandFilter('');
                    setMaxPrice(150000);
                    setSortBy('newest');
                  }}
                  className="text-teal-600 hover:text-teal-700 text-[11px] font-bold cursor-pointer"
                >
                  {dict.resetFilters}
                </button>
              </div>

              {/* Price filter slider */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  {dict.maxPrice}
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">500 DA</span>
                  <span className="text-teal-600 font-mono font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-md">
                    {maxPrice.toLocaleString()} DA
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={200000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Condition selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  {dict.stateField}
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/25 cursor-pointer"
                >
                  {conditions.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Sorting option */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Plus récents d'abord 🆕</option>
                  <option value="priceAsc">Prix croissant 📈</option>
                  <option value="priceDesc">Prix décroissant 📉</option>
                </select>
              </div>

              {/* Brand search filter */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Marque / Fabricant
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apple, Sony, Nike..."
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Specifications search filter */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Taille / Modèle / Version
                </label>
                <input
                  type="text"
                  placeholder="Ex: L, 43, 256 Go..."
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Eco Impact Widget ♻️ */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">♻️</span>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider">
                    {dict.ecoTitle}
                  </h4>
                </div>
                <p className="text-[10px] text-white/90 leading-relaxed">
                  {dict.ecoDesc}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-center">
                  <div>
                    <span className="text-[10px] text-teal-100 block">CO₂ Évité</span>
                    <span className="font-display font-black text-sm">{totalEcoStats.co2.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-100 block">Eau Sauvée</span>
                    <span className="font-display font-black text-sm">{totalEcoStats.water.toLocaleString()} L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side search bar and main list */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Top search bar & Categories row */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={dict.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-150 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                  />
                </div>

                {/* Horizontal scrolling Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Quick Brand/OS Filters for Mobile/Smartphone Integration */}
                {(selectedCategory === 'Tous' || selectedCategory === 'Téléphones & High-Tech') && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>📱</span>
                      <span>Filtres Mobiles :</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandFilter('');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        !brandFilter 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-150'
                      }`}
                    >
                      Tous les mobiles
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandFilter('Apple');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        brandFilter.toLowerCase() === 'apple' 
                          ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-150'
                      }`}
                    >
                       iPhones (iOS)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandFilter('Samsung');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        brandFilter.toLowerCase() === 'samsung' 
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-150'
                      }`}
                    >
                      🤖 Android (Samsung)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandFilter('Xiaomi');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        brandFilter.toLowerCase() === 'xiaomi' 
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-150'
                      }`}
                    >
                      🤖 Android (Xiaomi)
                    </button>
                  </div>
                )}
              </div>

              {/* Item grid */}
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">{dict.noItemFound}</h3>
                  <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto">
                    {dict.noItemDesc}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Tous');
                      setSelectedCondition('Tous');
                      setSearchQuery('');
                      setSizeFilter('');
                      setBrandFilter('');
                      setMaxPrice(150000);
                    }}
                    className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetails(item)}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Condition Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase border rounded-full backdrop-blur-md shadow-xs ${getConditionColor(item.condition)}`}>
                            {getConditionLabel(item.condition)}
                          </span>
                        </div>

                        {/* Specs & brand overlay */}
                        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
                          {item.size && (
                            <span className="bg-black/75 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                              {item.size}
                            </span>
                          )}
                          {item.brand && (
                            <span className="bg-teal-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                              {item.brand}
                            </span>
                          )}
                        </div>

                        {/* Quick category badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-slate-900/65 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-md uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4.5 flex-grow flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                            <User className="w-3 h-3 text-teal-500" />
                            <span>{dict.sellerLabel} {item.sellerName || 'Particulier'}</span>
                          </div>

                          <h3 className="font-display font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Footer Price & CTAs */}
                        <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{dict.priceLabel}</p>
                            <p className="font-display font-black text-teal-600 text-base">{item.price.toLocaleString()} DA</p>
                          </div>
                          
                          <div className="flex gap-1.5">
                            {item.sellerPhone && (
                              <a
                                href={`tel:${item.sellerPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-slate-50 hover:bg-teal-50 border border-slate-150 text-slate-700 hover:text-teal-600 p-2 rounded-xl transition-all"
                                title="Appeler le vendeur"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(item);
                                alert(`${item.name} a été ajouté à votre panier de commande avec succès !`);
                              }}
                              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              Acheter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELL TAB */}
        {activeTab === 'sell' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-display font-bold text-slate-800 text-xl flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-500" />
                  <span>{dict.publishTitle}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {dict.publishSubtitle}
                </p>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                {/* Title and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.titleLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: iPhone 13 Pro, Robot Moulinex, Vélo Décathlon..."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.categoryLabel}
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none cursor-pointer focus:ring-2 focus:ring-teal-500/20"
                    >
                      {categories.filter(c => c !== 'Tous').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price, Condition and Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.priceField}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 24000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.stateField}
                    </label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none cursor-pointer focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="new_with_tag">Neuf scellé / avec étiquette 🏷️</option>
                      <option value="excellent">Excellent état ✨</option>
                      <option value="very_good">Très bon état 👍</option>
                      <option value="good">Bon état 👌</option>
                      <option value="fair">Satisfaisant / Utilisé 🤝</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.specField}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: L, 43, 128Go, 1000W..."
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Brand and image url */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      {dict.brandField}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Apple, Samsung, Sony, Tefal..."
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Lien d'image externe (Optionnel)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Image upload and presets selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Photo de l'objet * (Sélectionnez un fichier ou choisissez un visuel rapide)
                  </label>
                  
                  {/* File picker */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-50/50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-700 font-bold">Glissez-déposez ou cliquez pour sélectionner un fichier</p>
                    <p className="text-[10px] text-slate-400 mt-1">Fichiers images JPG, PNG acceptés (Max 3 Mo)</p>
                    
                    {uploadProgress && (
                      <p className="text-xs text-teal-600 font-bold mt-2 bg-teal-50 py-1 px-3 rounded-lg inline-block">
                        {uploadProgress}
                      </p>
                    )}
                  </div>

                  {/* Preset visual suggestions */}
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold mb-2">💡 R : Sélectionnez un visuel pro correspondant en un clic :</p>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormImageUrl(preset.url);
                            setUploadProgress(`Visuel "${preset.name}" sélectionné !`);
                          }}
                          className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            formImageUrl === preset.url ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-100'
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black text-white text-center px-1 leading-tight">{preset.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description with MAGIC GENERATOR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {dict.descField}
                    </label>
                    <button
                      type="button"
                      onClick={generateMagicDescription}
                      className="text-teal-600 hover:text-teal-700 font-black text-[11px] uppercase flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                      <span>{dict.magicDescBtn}</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Décrivez précisément votre objet pour rassurer les acheteurs (Ex : Modèle exact, état cosmétique, rayures ou défauts éventuels, accessoires livrés avec)."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Contact Coordinates */}
                <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5">
                      {dict.sellerNameField}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sidali, Meriem..."
                      value={formSellerName}
                      onChange={(e) => setFormSellerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5">
                      {dict.sellerPhoneField}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0550123456"
                      value={formSellerPhone}
                      onChange={(e) => setFormSellerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publication en cours...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{dict.publishBtn}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-teal-500" />
                  <span>Charte de Confiance</span>
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="text-teal-500 shrink-0 mt-0.5">✔</span>
                    <span><b>Honnêteté</b> : Décrivez précisément l'état de l'objet et signalez les moindres défauts ou usures.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-teal-500 shrink-0 mt-0.5">✔</span>
                    <span><b>Photos claires</b> : Prenez des clichés de l'objet réel sous une bonne lumière sous plusieurs angles.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-teal-500 shrink-0 mt-0.5">✔</span>
                    <span><b>Zéro Commission</b> : Le service est 100% gratuit ! Vous recevez directement l'argent des acheteurs.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-teal-500 shrink-0 mt-0.5">✔</span>
                    <span><b>Sécurité</b> : Nous recommandons l'échange de la marchandise en main propre dans un lieu public sécurisé.</span>
                  </li>
                </ul>
              </div>

              {/* Security Advisory */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4 className="font-bold text-xs uppercase tracking-wide">Conseils de Sécurité</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ne transmettez jamais d'informations confidentielles ou de codes PIN de cartes CIB / Edahabia. Lors d'une livraison, vérifiez le colis avant de régler. Notre plateforme agit comme un facilitateur d'annonces gratuit et décline toute responsabilité en cas de litige entre particuliers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MY LISTINGS TAB */}
        {activeTab === 'my-listings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-800 text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span>Gérer mes annonces publiées</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Saisissez votre numéro de téléphone de vendeur pour retrouver, modifier ou supprimer vos annonces en ligne.
                </p>
              </div>

              {/* Login/Filter by seller phone */}
              <div className="flex gap-2 w-full sm:max-w-xs">
                <input
                  type="tel"
                  placeholder="Votre téléphone (Ex: 0550123456)"
                  value={myPhoneAuth}
                  onChange={(e) => {
                    setMyPhoneAuth(e.target.value);
                    localStorage.setItem('vinted_my_phone_number', e.target.value);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full"
                />
              </div>
            </div>

            {/* List */}
            {!myPhoneAuth ? (
              <div className="py-12 text-center text-slate-400">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-semibold">Veuillez saisir votre numéro de téléphone ci-dessus pour afficher vos annonces actives.</p>
              </div>
            ) : myListings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Tag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">Aucune annonce trouvée pour le numéro "{myPhoneAuth}".</p>
                <button
                  onClick={() => setActiveTab('sell')}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Créer ma première annonce
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">État</th>
                      <th className="py-3 px-4">Prix</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myListings.map((listing) => (
                      <tr key={listing.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img src={listing.imageUrl} alt={listing.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block">{listing.name}</span>
                            <span className="text-[10px] text-slate-400 block">{listing.brand || 'Sans marque'} • {listing.size || 'Unique'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600">{listing.category}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md ${getConditionColor(listing.condition)}`}>
                            {getConditionLabel(listing.condition)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">{listing.price.toLocaleString()} DA</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
                                onDeleteProduct(listing.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/50 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer l'annonce"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL MODAL OVERLAY FOR MARKETPLACE ITEMS */}
      {selectedItemDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all flex flex-col md:flex-row">
            {/* Visual Part */}
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-slate-50 min-h-[300px]">
              <img src={selectedItemDetails.imageUrl} alt={selectedItemDetails.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedItemDetails(null)}
                className="absolute top-4 left-4 p-2 bg-slate-900/65 text-white hover:bg-slate-950/80 rounded-full transition-all duration-200 z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1">
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase border rounded-full backdrop-blur-md shadow-xs ${getConditionColor(selectedItemDetails.condition)}`}>
                  {getConditionLabel(selectedItemDetails.condition)}
                </span>
              </div>
            </div>

            {/* Information Part */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase border border-teal-100">
                    🤝 Marché d'Occasion Algérie
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {selectedItemDetails.id}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-800 text-xl">{selectedItemDetails.name}</h3>
                  <p className="text-slate-500 text-xs">Catégorie : <b>{selectedItemDetails.category}</b></p>
                </div>

                {/* Second-hand specifics table */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Marque / Fabricant</span>
                    <span className="font-bold text-slate-800">{selectedItemDetails.brand || 'Sans Marque'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Taille / Modèle</span>
                    <span className="font-bold text-slate-800">{selectedItemDetails.size || 'Unique / Standard'}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-150/50 mt-1">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Annonceur</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-teal-500" /> {selectedItemDetails.sellerName || 'Particulier'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Description de l'article</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-h-[120px] overflow-y-auto whitespace-pre-line">{selectedItemDetails.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Prix Occasion</span>
                    <span className="font-display font-black text-teal-600 text-2xl">{selectedItemDetails.price.toLocaleString()} DA</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedItemDetails.sellerPhone && (
                    <a
                      href={`tel:${selectedItemDetails.sellerPhone}`}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedItemDetails.sellerPhone}</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      onAddToCart(selectedItemDetails);
                      setSelectedItemDetails(null);
                      alert(`${selectedItemDetails.name} a été ajouté à votre panier avec succès !`);
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ajouter au Panier</span>
                  </button>
                </div>

                <p className="text-[9px] text-slate-400 text-center leading-normal">
                  💡 En achetant cet article d'occasion, vous économisez sur la production et préservez l'environnement ! 🇩🇿♻️
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
