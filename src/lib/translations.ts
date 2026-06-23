export type Language = 'fr' | 'ar' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Nav & General
    store_name: "Univers Shop",
    home: "Accueil",
    categories: "Catégories",
    cart: "Panier",
    my_orders: "Mes Commandes",
    admin_panel: "Administration",
    contact_us: "Contactez-nous",
    search_placeholder: "Rechercher un produit...",
    all_categories: "Toutes les catégories",
    language: "Langue",
    offline_mode_banner: "Mode local activé. Vos modifications restent 100% fonctionnelles et enregistrées sur votre appareil.",
    sec_payments_banner: "Paiements 100% Chiffrés et Sécurisés par CIB / Edahabia",
    direct_purchase: "Achat Direct (CCP & BaridiMob)",
    algerian_support: "Service Client Algérien",

    // "Pourquoi nous choisir ?" Section
    why_us_title: "Pourquoi nous choisir ?",
    why_us_subtitle: "Le leader de l'e-commerce en Algérie avec des services premium conçus pour votre satisfaction.",
    stat_clients_title: "Clients Satisfaits",
    stat_clients_desc: "Une communauté de confiance partout au pays.",
    stat_wilayas_title: "Wilayas Livrées",
    stat_wilayas_desc: "Livraison rapide à domicile ou en point relais.",
    stat_satisfaction_title: "Taux de Satisfaction",
    stat_satisfaction_desc: "Évaluations positives par nos acheteurs vérifiés.",
    stat_support_title: "Support 24h/24",
    stat_support_desc: "Une équipe dédiée à votre écoute par téléphone ou chat.",

    // Live Activity Social Proof
    live_views_one: "1 personne regarde ce produit actuellement",
    live_views_multi: "{count} personnes regardent ce produit actuellement",
    popularity_high: "Très populaire ! Commandé {count} fois ces derniers jours.",
    reliable_seller: "Vendeur fiable : 100% de commandes livrées sans réclamation.",
    verified_buyer_badge: "Achat vérifié",
    sales_count_label: "{count} ventes réussies",

    // Product detail page & actions
    add_to_cart: "Ajouter au Panier",
    buy_now: "Acheter Immédiatement",
    similar_products: "Produits similaires",
    product_details: "Description détaillée",
    reviews_title: "Avis de nos clients vérifiés ({count})",
    no_reviews: "Aucun avis pour l'instant. Soyez le premier à donner votre avis !",
    write_review: "Écrire un avis",
    review_name_placeholder: "Votre nom complet (ex: Amine Benali)",
    review_comment_placeholder: "Votre commentaire sur la qualité du produit, la livraison...",
    review_submit: "Soumettre mon avis vérifié",
    star_rating_label: "Votre note :",
    video_demonstration: "Présentation Vidéo Premium",
    video_placeholder_text: "Vidéo démonstrative en cours de chargement... Découvrez le produit en conditions réelles.",

    // Checkout & Anti-fraud
    checkout_title: "Finaliser votre commande sécurisée",
    checkout_fullname: "Nom et Prénom complet",
    checkout_phone: "Numéro de téléphone (BaridiMob ou CCP)",
    checkout_address: "Adresse de livraison précise",
    checkout_wilaya: "Sélectionnez votre Wilaya",
    shipping_fees: "Frais de livraison",
    total_amount: "Montant Total",
    place_order: "Confirmer la commande",
    antifraud_warning: "Système de protection anti-fraude actif. Les requêtes abusives ou robots sont automatiquement bloqués.",
    antifraud_blocked: "Comportement suspect détecté. Veuillez patienter avant de soumettre à nouveau.",
    bot_challenge_label: "Sécurité : Veuillez cocher la case pour prouver que vous n'êtes pas un robot :",
    bot_challenge_checkbox: "Je suis un humain et je valide mon achat",

    // Returns Management
    returns_title: "Gestion simplifiée des retours",
    returns_easy_one_click: "Retour en un clic",
    returns_easy_desc: "Satisfait ou remboursé sous 7 jours ! Remplissez le formulaire ci-dessous.",
    returns_step_validation: "1. Validation de la demande",
    returns_step_sending: "2. Envoi du produit",
    returns_step_refund: "3. Remboursement CCP / BaridiMob",
    return_reason_label: "Sélectionnez le motif du retour",
    return_details_label: "Description complémentaire & Rib CCP / BaridiMob",
    return_submit: "Soumettre la demande de retour",
    return_status_requested: "Retour demandé (En attente d'examen)",
    return_status_approved: "Retour approuvé (Remboursement ou échange en cours)",
    return_status_rejected: "Retour refusé par le support",
    return_success_toast: "Votre demande de retour a été soumise avec succès !",

    // Order Tracking Portal
    tracking_portal_title: "Suivi Logistique en Direct",
    tracking_portal_desc: "Suivez l'état d'expédition de votre colis auprès de nos livreurs partenaires.",
    search_by_phone: "Recherche par Téléphone",
    search_by_id: "Recherche par ID de commande",
    track_order_btn: "Suivre mon colis",
    status_received: "Commande reçue",
    status_processing: "Préparation & Emballage",
    status_shipped: "En cours d'expédition",
    status_delivered: "Livrée à domicile",
    status_returned: "Retournée",
    no_orders_found: "Aucune commande trouvée. Veuillez vérifier les informations saisies."
  },
  ar: {
    // Nav & General
    store_name: "يونيفرس شوب",
    home: "الرئيسية",
    categories: "الفئات",
    cart: "السلة",
    my_orders: "طلباتي",
    admin_panel: "لوحة التحكم",
    contact_us: "اتصل بنا",
    search_placeholder: "ابحث عن منتج...",
    all_categories: "كل الفئات",
    language: "اللغة",
    offline_mode_banner: "تم تفعيل الوضع المحلي. تعديلاتك محفوظة 100٪ على جهازك.",
    sec_payments_banner: "مدفوعات مشفرة وآمنة 100٪ عن طريق الذهبية / CIB",
    direct_purchase: "شراء مباشر (CCP و بريدي موب)",
    algerian_support: "خدمة العملاء في الجزائر",

    // "Pourquoi nous choisir ?" Section
    why_us_title: "لماذا تختارنا؟",
    why_us_subtitle: "الرائد في التجارة الإلكترونية بالجزائر بخدمات متميزة مصممة لرضاكم الكامل.",
    stat_clients_title: "زبون راضٍ",
    stat_clients_desc: "مجتمع يثق بنا في جميع أنحاء الوطن.",
    stat_wilayas_title: "ولاية تم توصيلها",
    stat_wilayas_desc: "توصيل سريع إلى باب منزلك أو نقطة الاستلام.",
    stat_satisfaction_title: "نسبة الرضا",
    stat_satisfaction_desc: "تقييمات إيجابية ممتازة من مشترين حقيقيين.",
    stat_support_title: "دعم على مدار الساعة",
    stat_support_desc: "فريق مخصص متوفر دائماً للرد على مكالماتكم.",

    // Live Activity Social Proof
    live_views_one: "شخص واحد يشاهد هذا المنتج الآن",
    live_views_multi: "{count} أشخاص يشاهدون هذا المنتج حالياً",
    popularity_high: "مطلوب جداً! تم طلبه {count} مرات في الأيام الأخيرة.",
    reliable_seller: "بائع موثوق: 100٪ من الطلبات تم تسليمها بدون أي شكاوى.",
    verified_buyer_badge: "مشتري مؤكد",
    sales_count_label: "تم بيع {count} مرات",

    // Product detail page & actions
    add_to_cart: "أضف إلى السلة",
    buy_now: "شراء الآن مباشرة",
    similar_products: "منتجات مشابهة",
    product_details: "الوصف التفصيلي للمنتج",
    reviews_title: "تقييمات عملائنا المعتمدين ({count})",
    no_reviews: "لا توجد تقييمات بعد. كن أول من يكتب تقييماً لهذا المنتج!",
    write_review: "اكتب تقييماً",
    review_name_placeholder: "اسمك الكامل (مثال: أمين بن علي)",
    review_comment_placeholder: "رأيك حول جودة المنتج، سرعة التوصيل...",
    review_submit: "إرسال تقييمي المعتمد",
    star_rating_label: "تقييمك بالنجوم:",
    video_demonstration: "عرض فيديو توضيحي للمنتج",
    video_placeholder_text: "جاري تحميل الفيديو التوضيحي... شاهد المنتج على طبيعته.",

    // Checkout & Anti-fraud
    checkout_title: "إتمام طلبك الآمن والمشفر",
    checkout_fullname: "الاسم واللقب الكامل",
    checkout_phone: "رقم الهاتف (بريدي موب أو CCP)",
    checkout_address: "عنوان التوصيل بدقة",
    checkout_wilaya: "اختر ولايتك",
    shipping_fees: "تكاليف الشحن والتوصل",
    total_amount: "المبلغ الإجمالي الإجمالي",
    place_order: "تأكيد وإرسال الطلب",
    antifraud_warning: "نظام حماية ضد الاحتيال والروبوتات نشط حالياً. سيتم حظر أي طلبات آلية.",
    antifraud_blocked: "تم اكتشاف نشاط مشبوه. يرجى الانتظار قليلاً قبل المحاولة مجدداً.",
    bot_challenge_label: "الأمان: يرجى تحديد المربع لإثبات أنك لست روبوتًا:",
    bot_challenge_checkbox: "أنا إنسان وأؤكد رغبتي في الشراء",

    // Returns Management
    returns_title: "نظام إرجاع بسيط ومضمون",
    returns_easy_one_click: "إرجاع بضغطة زر واحدة",
    returns_easy_desc: "إرجاع أو استبدال مضمون خلال 7 أيام! املأ الاستمارة أدناه.",
    returns_step_validation: "1. مراجعة الطلب والموافقة عليه",
    returns_step_sending: "2. إرسال المنتج بالبريد",
    returns_step_refund: "3. استرجاع أموالك عبر CCP / بريدي موب",
    return_reason_label: "اختر سبب الإرجاع بدقة",
    return_details_label: "تفاصيل إضافية ورقم الحساب CCP / بريدي موب",
    return_submit: "إرسال طلب الإرجاع",
    return_status_requested: "تم تقديم طلب الإرجاع (قيد المراجعة)",
    return_status_approved: "تم قبول الإرجاع (جاري تحويل الأموال)",
    return_status_rejected: "تم رفض طلب الإرجاع من قبل الإدارة",
    return_success_toast: "تم تقديم طلب الإرجاع بنجاح وسيتصل بك الدعم قريباً!",

    // Order Tracking Portal
    tracking_portal_title: "تتبع شحنتك مباشرة",
    tracking_portal_desc: "تتبع حالة شحن طردك مع شركاء التوصيل لدينا في الوقت الحقيقي.",
    search_by_phone: "البحث برقم الهاتف",
    search_by_id: "البحث برقم الفاتورة والطلب",
    track_order_btn: "تتبع طردي الآن",
    status_received: "تم تلقي الطلب",
    status_processing: "جاري التحضير والتغليف",
    status_shipped: "تم الشحن وهي في الطريق إليك",
    status_delivered: "تم التسليم بنجاح",
    status_returned: "تم إرجاع الطرد",
    no_orders_found: "لم يتم العثور على أي طلبات. يرجى التأكد من البيانات المدخلة."
  },
  en: {
    // Nav & General
    store_name: "Univers Shop",
    home: "Home",
    categories: "Categories",
    cart: "Cart",
    my_orders: "My Orders",
    admin_panel: "Administration",
    contact_us: "Contact Us",
    search_placeholder: "Search for a product...",
    all_categories: "All categories",
    language: "Language",
    offline_mode_banner: "Local mode active. Your modifications are 100% functional and saved on your device.",
    sec_payments_banner: "100% Encrypted and Secured Payments by CIB / Edahabia",
    direct_purchase: "Direct Purchase (CCP & BaridiMob)",
    algerian_support: "Algerian Customer Service",

    // "Pourquoi nous choisir ?" Section
    why_us_title: "Why Choose Us?",
    why_us_subtitle: "The e-commerce leader in Algeria with premium services tailored for your absolute satisfaction.",
    stat_clients_title: "Satisfied Customers",
    stat_clients_desc: "A trusted community all over the country.",
    stat_wilayas_title: "Wilayas Delivered",
    stat_wilayas_desc: "Fast delivery to your doorstep or collection point.",
    stat_satisfaction_title: "Satisfaction Rate",
    stat_satisfaction_desc: "Highly positive feedback from verified buyers.",
    stat_support_title: "24/7 Premium Support",
    stat_support_desc: "A dedicated team always available via phone or chat.",

    // Live Activity Social Proof
    live_views_one: "1 person is looking at this product right now",
    live_views_multi: "{count} people are viewing this product right now",
    popularity_high: "Highly popular! Ordered {count} times over the last few days.",
    reliable_seller: "Reliable seller: 100% of orders shipped without disputes.",
    verified_buyer_badge: "Verified Buyer",
    sales_count_label: "{count} successful sales",

    // Product detail page & actions
    add_to_cart: "Add to Cart",
    buy_now: "Buy Instantly",
    similar_products: "Similar Products",
    product_details: "Detailed Description",
    reviews_title: "Reviews from verified buyers ({count})",
    no_reviews: "No reviews yet. Be the first to review this product!",
    write_review: "Write a review",
    review_name_placeholder: "Your full name (e.g., Amine Benali)",
    review_comment_placeholder: "Your thoughts on product quality, delivery speed...",
    review_submit: "Submit Verified Review",
    star_rating_label: "Your Rating:",
    video_demonstration: "Premium Product Video Demonstration",
    video_placeholder_text: "Demonstration video loading... Experience the product in real conditions.",

    // Checkout & Anti-fraud
    checkout_title: "Finalize your secure checkout",
    checkout_fullname: "Full First & Last Name",
    checkout_phone: "Phone number (BaridiMob or CCP)",
    checkout_address: "Precise shipping address",
    checkout_wilaya: "Select your Wilaya",
    shipping_fees: "Shipping fees",
    total_amount: "Total Amount",
    place_order: "Confirm Order",
    antifraud_warning: "Anti-fraud and bot protection active. Automated order attempts are strictly blocked.",
    antifraud_blocked: "Suspicious behavior detected. Please wait before submitting again.",
    bot_challenge_label: "Security: Please check the box to prove you are not a robot:",
    bot_challenge_checkbox: "I am a human and I validate my purchase",

    // Returns Management
    returns_title: "Simplified Returns Management",
    returns_easy_one_click: "One-Click Returns",
    returns_easy_desc: "7 days money back guaranteed! Fill out the short form below.",
    returns_step_validation: "1. Return Request Review",
    returns_step_sending: "2. Ship the Product back",
    returns_step_refund: "3. Refund processed via CCP / BaridiMob",
    return_reason_label: "Select return reason",
    return_details_label: "Additional description & CCP / BaridiMob bank details",
    return_submit: "Submit Return Request",
    return_status_requested: "Return requested (Under Review)",
    return_status_approved: "Return approved (Refund or exchange in progress)",
    return_status_rejected: "Return rejected by support",
    return_success_toast: "Your return request has been submitted successfully!",

    // Order Tracking Portal
    tracking_portal_title: "Live Logistics Tracking",
    tracking_portal_desc: "Track your shipment real-time with our local courier partners.",
    search_by_phone: "Search by Phone Number",
    search_by_id: "Search by Order ID",
    track_order_btn: "Track My Package",
    status_received: "Order Received",
    status_processing: "Preparing & Packing",
    status_shipped: "Shipped & Out for Delivery",
    status_delivered: "Delivered Successfully",
    status_returned: "Returned to Sender",
    no_orders_found: "No orders found. Please double-check your search details."
  }
};

/**
 * Hook or helper to resolve a string using a language.
 */
export function translate(key: string, lang: Language, replacements?: Record<string, string | number>): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS['fr'];
  let text = dictionary[key] || TRANSLATIONS['fr'][key] || key;
  
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
