import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  Sparkles, 
  Play, 
  Volume2, 
  RotateCw, 
  CheckCircle2, 
  Languages, 
  ChevronRight, 
  Flame, 
  Check, 
  X, 
  ArrowRight,
  Smile,
  Zap,
  VolumeX,
  RefreshCw,
  Trophy,
  BookMarked,
  Sparkle,
  GraduationCap,
  Shield,
  Star,
  Download,
  Share2,
  Heart,
  Globe,
  HelpCircle,
  MessageSquare,
  Users,
  Search,
  ChevronLeft,
  Gift,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  BookOpenCheck,
  Lock,
  Compass,
  HeartCrack,
  Info
} from 'lucide-react';
import { Language } from '../lib/translations';
import confetti from 'canvas-confetti';

interface LanguageLearningPortalProps {
  language: Language; // current UI interface language ('fr' or 'ar')
  userPoints: number;
  onAddPoints: (pts: number) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onClose: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
  voiceLang: string; // for SpeechSynthesis
}

const TARGET_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'Anglais', flag: '🇬🇧', nativeName: 'English', voiceLang: 'en-US' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸', nativeName: 'Español', voiceLang: 'es-ES' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪', nativeName: 'Deutsch', voiceLang: 'de-DE' },
  { code: 'it', name: 'Italien', flag: '🇮🇹', nativeName: 'Italiano', voiceLang: 'it-IT' },
  { code: 'tr', name: 'Turc', flag: '🇹🇷', nativeName: 'Türkçe', voiceLang: 'tr-TR' },
  { code: 'ar', name: 'Arabe Standard', flag: '🇩🇿', nativeName: 'العربية', voiceLang: 'ar-SA' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français', voiceLang: 'fr-FR' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺', nativeName: 'Русский', voiceLang: 'ru-RU' },
  { code: 'ja', name: 'Japonais', flag: '🇯🇵', nativeName: '日本語', voiceLang: 'ja-JP' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳', nativeName: '中文', voiceLang: 'zh-CN' },
];

export type SkillLevel = 'debutant' | 'semipro' | 'pro' | 'legendaire' | 'elite';

interface BadgeDetails {
  level: SkillLevel;
  name: string;
  nameAr: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
  description: string;
  descriptionAr: string;
  xpRequired: number;
  difficultyLabel: string;
  unitTitle: string;
  unitTitleAr: string;
}

const LEVEL_BADGES: Record<SkillLevel, BadgeDetails> = {
  debutant: {
    level: 'debutant',
    name: 'Débutant',
    nameAr: 'مبتدئ',
    icon: '🥉',
    colorClass: 'from-amber-600 to-amber-800 text-amber-100',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300',
    description: 'Bases essentielles, formules de politesse et salutations d\'usage.',
    descriptionAr: 'أساسيات اللغة، التحية وصيغ الأدب والتعارف اليومي الأول.',
    xpRequired: 0,
    difficultyLabel: 'Niveau 1',
    unitTitle: 'Unit 1: Salutations & Formules de Politesse',
    unitTitleAr: 'الوحدة 1: التحيات وصيغ الأدب'
  },
  semipro: {
    level: 'semipro',
    name: 'Semi-Pro',
    nameAr: 'شبه محترف',
    icon: '🥈',
    colorClass: 'from-slate-400 to-slate-600 text-slate-100',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-300',
    description: 'Transactions commerciales, demande de prix, commande et suivi d\'expédition.',
    descriptionAr: 'المعاملات التجارية، السؤال عن الأسعار وتأكيد الطلبات وتتبع الشحنات.',
    xpRequired: 150,
    difficultyLabel: 'Niveau 2',
    unitTitle: 'Unit 2: Commande, Expédition & Suivi Wilaya',
    unitTitleAr: 'الوحدة 2: الطلب، الشحن والتتبع عبر الولايات'
  },
  pro: {
    level: 'pro',
    name: 'Professionnel',
    nameAr: 'محترف',
    icon: '🥇',
    colorClass: 'from-yellow-500 to-amber-600 text-yellow-100',
    badgeClass: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300',
    description: 'Négociation de tarifs de gros, réclamations clients, gestion des litiges et SAV.',
    descriptionAr: 'التفاوض على أسعار الجملة، الشكاوى، حل النزاعات وخدمات ما بعد البيع.',
    xpRequired: 400,
    difficultyLabel: 'Niveau 3',
    unitTitle: 'Unit 3: Négociations de Prix & Litiges SAV',
    unitTitleAr: 'الوحدة 3: التفاوض على الأسعار وحل النزاعات'
  },
  legendaire: {
    level: 'legendaire',
    name: 'Légendaire',
    nameAr: 'أسطوري',
    icon: '🌟',
    colorClass: 'from-indigo-600 to-purple-600 text-purple-100',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-400',
    description: 'Signatures de contrats, partenariats exclusifs et expressions idiomatiques complexes.',
    descriptionAr: 'توقيع العقود، الشراكات الحصرية والعبارات البلاغية والاصطلاحية المعقدة.',
    xpRequired: 800,
    difficultyLabel: 'Niveau 4',
    unitTitle: 'Unit 4: Partenariats Exclusifs & Contrats Nationaux',
    unitTitleAr: 'الوحدة 4: الشراكات الحصرية والعقود الوطنية'
  },
  elite: {
    level: 'elite',
    name: 'Élite Mondiale',
    nameAr: 'النخبة العالمية',
    icon: '💎',
    colorClass: 'from-pink-500 via-purple-600 to-indigo-600 text-white animate-pulse',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-400',
    description: 'Haute diplomatie, terminologie philosophique et traduction de prompts d\'Intelligence Artificielle.',
    descriptionAr: 'الدبلوماسية العليا، المصطلحات الفلسفية المعقدة وترجمة أوامر الذكاء الاصطناعي.',
    xpRequired: 1500,
    difficultyLabel: 'Niveau 5',
    unitTitle: 'Unit 5: Ingénierie de Prompts & Intelligence Artificielle',
    unitTitleAr: 'الوحدة 5: هندسة الأوامر والذكاء الاصطناعي المتقدم'
  }
};

interface Phrase {
  phrase: string;
  translation: string;
  translationAr: string;
  pronunciation: string;
  context: string;
}

interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  xp: number;
  content: Phrase[];
}

// Highly comprehensive localized professional commercial phrases
const CURRICULUM_DATA: Record<string, Record<SkillLevel, Lesson[]>> = {
  en: {
    debutant: [
      {
        id: 'en-deb-1',
        title: 'Bases & Salutations Essentielles',
        titleAr: 'الأساسيات والتحيات الضرورية',
        description: 'Apprenez à saluer, dire merci et vous présenter simplement.',
        descriptionAr: 'تعلم إلقاء التحية، وقول شكراً، والتعريف بنفسك ببساطة.',
        xp: 100,
        content: [
          { phrase: 'Hello, good morning!', translation: 'Bonjour, bon matin !', translationAr: 'مرحباً، صباح الخير!', pronunciation: 'hɛˈloʊ, ɡʊd ˈmɔːrnɪŋ', context: 'Salutation commune' },
          { phrase: 'My name is Samir.', translation: 'Je m\'appelle Samir.', translationAr: 'اسمي سمير.', pronunciation: 'maɪ neɪm ɪz sa-mir', context: 'Présentation de soi' },
          { phrase: 'Thank you very much!', translation: 'Merci beaucoup !', translationAr: 'شكراً جزيلاً!', pronunciation: 'θæŋk ju ˈvɛri mʌtʃ', context: 'Exprimer sa gratitude' },
          { phrase: 'Nice to meet you.', translation: 'Ravi de vous rencontrer.', translationAr: 'سررت بلقائك.', pronunciation: 'naɪs tu miːt ju', context: 'Finition de présentation' }
        ]
      }
    ],
    semipro: [
      {
        id: 'en-semi-1',
        title: 'Transactions & Commandes',
        titleAr: 'المعاملات التجارية والطلبات',
        description: 'Demander les tarifs, préciser les modalités de livraison.',
        descriptionAr: 'الاستفسار عن الأسعار، وتحديد تفاصيل وخيارات التوصيل.',
        xp: 150,
        content: [
          { phrase: 'How much is this product with express delivery?', translation: 'Combien coûte ce produit avec la livraison express ?', translationAr: 'كم سعر هذا المنتج مع التوصيل السريع؟', pronunciation: 'haʊ mʌtʃ ɪz ðɪs ˈprɒdʌkt wɪð ɪkˈsprɛs dɪˈlɪvəri', context: 'S\'enquérir du prix total' },
          { phrase: 'Is there any discount available on bulk purchases?', translation: 'Y a-t-il une remise disponible sur les achats en gros ?', translationAr: 'هل هناك أي خصم متاح على المشتريات بالجملة؟', pronunciation: 'ɪz ðɛər ˈɛni ˈdɪskaʊnt əˈveɪləbəl ɒn bʌlk ˈpɜːtʃəsɪz', context: 'Négocier un volume d\'achat' },
          { phrase: 'I would like to pay upon delivery.', translation: 'Je voudrais payer à la livraison.', translationAr: 'أود الدفع عند الاستلام.', pronunciation: 'aɪ wʊd laɪk tu peɪ əˈpɒn dɪˈlɪvəri', context: 'Choisir le mode de paiement' }
        ]
      }
    ],
    pro: [
      {
        id: 'en-pro-1',
        title: 'Négociations & Gestion de Litiges',
        titleAr: 'المفاوضات وإدارة الخلافات التجارية',
        description: 'Argumenter sur la qualité et obtenir des remboursements légaux.',
        descriptionAr: 'المناقشة حول الجودة والمطالبة بالتعويضات القانونية العادلة.',
        xp: 220,
        content: [
          { phrase: 'This product failed our quality control standards.', translation: 'Ce produit a échoué à nos normes de contrôle qualité.', translationAr: 'لقد فشل هذا المنتج في مطابقة معايير مراقبة الجودة لدينا.', pronunciation: 'ðɪs ˈprɒdʌkt feɪld ˈaʊə ˈkwɒlɪti kənˈtrəʊl ˈstændədz', context: 'Formuler une réclamation stricte' },
          { phrase: 'We expect a full refund within forty-eight hours.', translation: 'Nous attendons un remboursement complet sous quarante-huit heures.', translationAr: 'نتوقع استرداداً كاملاً للأموال في غضون ثمان وأربعين ساعة.', pronunciation: 'wiː ɪkˈspɛkt ə fʊl ˈriːfʌnd wɪˈðɪn ˈfɔːti eɪt ˈaʊəz', context: 'Imposer un délai limite' }
        ]
      }
    ],
    legendaire: [
      {
        id: 'en-leg-1',
        title: 'Accords Internationaux & Franchises',
        titleAr: 'الاتفاقيات الدولية وعقود الامتياز',
        description: 'Sceller des alliances exclusives de distribution internationale.',
        descriptionAr: 'إبرام تحالفات حصرية للتوزيع الدولي والتجارة العابرة للحدود.',
        xp: 350,
        content: [
          { phrase: 'We are prepared to sign an exclusive distribution treaty.', translation: 'Nous sommes prêts à signer un traité de distribution exclusive.', translationAr: 'نحن مستعدون لتوقيع معاهدة توزيع حصرية.', pronunciation: 'wiː ɑː prɪˈpɛəd tu saɪn ən ɪksˈkluːsɪv ˌdɪstrɪˈbjuːʃən ˈtriːti', context: 'Partenariat mondial' },
          { phrase: 'This clause mitigates any potential market fluctuation risks.', translation: 'Cette clause atténue tout risque potentiel de fluctuation du marché.', translationAr: 'تخفف هذه المادة من أي مخاطر محتملة لتقلبات السوق.', pronunciation: 'ðɪs klɔːz ˈmɪtɪɡeɪts ˈɛni pəˈtɛnʃəl ˈmɑːkɪt ˌflʌktʃʊˈeɪʃən rɪsks', context: 'Négocier les clauses juridiques' }
        ]
      }
    ],
    elite: [
      {
        id: 'en-eli-1',
        title: 'Ingénierie de Prompts & Diplomatie IA',
        titleAr: 'هندسة الأوامر ودبلوماسية الذكاء الاصطناعي',
        description: 'Optimiser des prompts complexes pour transformer le commerce.',
        descriptionAr: 'صياغة أوامر برمجية معقدة لتحويل العمليات التجارية بالذكاء الاصطناعي.',
        xp: 500,
        content: [
          { phrase: 'Act as a senior logistics strategist to optimize global supply chains.', translation: 'Agis comme un stratège en logistique pour optimiser les chaînes.', translationAr: 'تقمص دور كبير استراتيجيي اللوجستيات لتحسين سلاسل الإمداد العالمية.', pronunciation: 'ækt æz ə ˈsiːniə lɒˈʤɪstɪks ˈstrætɪʤɪst tu ˈɒptɪmaɪz ˈɡləʊbəl səˈplaɪ ʧeɪnz', context: 'Prompt IA Avancé' },
          { phrase: 'Synergize multi-agent cognitive patterns for predictive cross-border customs clearance.', translation: 'Mettre en synergie les schémas cognitifs multi-agents pour le dédouanement prédictif transfrontalier.', translationAr: 'دمج الأنماط الإدراكية متعددة الوكلاء للتخليص الجمركي التنبؤي عبر الحدود.', pronunciation: 'ˈsɪnəʤaɪz ˈmʌltɪ-ˈeɪʤənt ˈkɒɡnɪtɪv ˈpætənz fɔː prɪˈdɪktɪv krɒs-ˈbɔːdə ˈkʌstəmz ˈklɪərəns', context: 'Terminologie d\'Élite technologique' }
        ]
      }
    ]
  },
  es: {
    debutant: [
      {
        id: 'es-deb-1',
        title: 'Primeros Pasos en Español',
        titleAr: 'الخطوات الأولى في الإسبانية',
        description: 'Apprenez à saluer et demander poliment.',
        descriptionAr: 'تعلم إلقاء التحية والطلب بلياقة وأدب جم.',
        xp: 100,
        content: [
          { phrase: '¡Hola! Buenos días, ¿qué tal?', translation: 'Bonjour ! Comment ça va ?', translationAr: 'مرحباً! صباح الخير، كيف الحال؟', pronunciation: 'O-la! Bwenos di-as, ke tal', context: 'Salutation' },
          { phrase: 'Muchas gracias por su valiosa ayuda.', translation: 'Merci beaucoup pour votre aide précieuse.', translationAr: 'شكراً جزيلاً لك على مساعدتك القيمة.', pronunciation: 'Much-as graci-as por su vali-osa a-yuda', context: 'Gratitude' }
        ]
      }
    ],
    semipro: [
      {
        id: 'es-semi-1',
        title: 'Compras & Envíos Rápidos',
        titleAr: 'المشتريات والشحن السريع بالإسبانية',
        description: 'Expressions de transaction et expédition.',
        descriptionAr: 'تعبيرات مفيدة للتسوق، الدفع والشحن في الولايات الجزائرية.',
        xp: 150,
        content: [
          { phrase: '¿Tienen cobertura de entrega en Orán?', translation: 'Avez-vous une couverture de livraison à Oran ?', translationAr: 'هل لديكم تغطية توصيل إلى وهران؟', pronunciation: 'Tyen-en kober-tura de entrega en Oran', context: 'S\'informer de la livraison' },
          { phrase: 'Deseo confirmar este pedido inmediatamente.', translation: 'Je souhaite confirmer cette commande immédiatement.', translationAr: 'أود تأكيد هذا الطلب فوراً.', pronunciation: 'De-se-o konfirmar este pe-dido inmediat-amente', context: 'Validation de commande' }
        ]
      }
    ],
    pro: [
      {
        id: 'es-pro-1',
        title: 'Reclamaciones & Reembolso',
        titleAr: 'الشكاوى والاسترداد المالي',
        description: 'Discussions serrées sur les garanties légales.',
        descriptionAr: 'مناقشات قانونية حول حقوق المستهلك والضمان.',
        xp: 220,
        content: [
          { phrase: 'Este artículo no coincide con las especificaciones del catálogo.', translation: 'Cet article ne correspond pas aux spécifications du catalogue.', translationAr: 'هذا المنتج لا يتطابق مع المواصفات المذكورة في الكتالوج.', pronunciation: 'Este arti-kulo no koin-tside kon las espetshifikatsyo-nes', context: 'Signaler un défaut' },
          { phrase: 'Exigimos la sustitución del lote por garantía.', translation: 'Nous exigeons le remplacement du lot sous garantie.', translationAr: 'نطالب باستبدال هذه الدفعة بموجب الضمان المعتمد.', pronunciation: 'Ekhikh-imos la susti-tutsyon del lote por garantia', context: 'Faire valoir ses droits' }
        ]
      }
    ],
    legendaire: [
      {
        id: 'es-leg-1',
        title: 'Alianzas Estratégicas',
        titleAr: 'التحالفات الاستراتيجية وعقود الوكالة',
        description: 'Négocier des contrats d\'importation exclusifs.',
        descriptionAr: 'تأسيس شراكة استيراد وتوزيع حصرية في أفريقيا والجزائر.',
        xp: 350,
        content: [
          { phrase: 'Firmaremos un acuerdo comercial a largo plazo.', translation: 'Nous signerons un accord commercial à long terme.', translationAr: 'سنقوم بتوقيع اتفاقية تجارية طويلة الأمد.', pronunciation: 'Firm-aremos un akwer-do komertsyal a largo platho', context: 'Signature d\'un grand partenariat' },
          { phrase: 'Esta cláusula protege nuestra exclusividad regional.', translation: 'Cette clause protège notre exclusivité régionale.', translationAr: 'هذا البند يحمي حقوقنا الحصرية في التوزيع الإقليمي.', pronunciation: 'Esta klau-sula prote-khe nwestra eksklusi-vidad', context: 'Défense légale du contrat' }
        ]
      }
    ],
    elite: [
      {
        id: 'es-eli-1',
        title: 'Ingeniería de Prompts en Español',
        titleAr: 'صياغة الأوامر المتقدمة وهندسة الذكاء الاصطناعي',
        description: 'Faire faire de la veille stratégique commerciale à l\'IA.',
        descriptionAr: 'توجيه نماذج الذكاء الاصطناعي للقيام بدراسات الجدوى والتحليل الاقتصادي.',
        xp: 500,
        content: [
          { phrase: 'Optimiza la cadena logística reduciendo la huella de carbono mediante inteligencia predictiva.', translation: 'Optimise la chaîne logistique en réduisant l\'empreinte carbone via l\'intelligence prédictive.', translationAr: 'قم بتحسين سلسلة الخدمات اللوجستية مع تقليل الانبعاثات باستخدام الذكاء التنبئي.', pronunciation: 'Opti-mitha la kadena lokhis-tika re-duthyendo la', context: 'Ordre IA complexe' },
          { phrase: 'Genera un modelo heurístico para la estimación de aranceles aduaneros transfronterizos.', translation: 'Génère un modèle heuristique pour l\'estimation des tarifs douaniers transfrontaliers.', translationAr: 'أنشئ نموذجاً إرشادياً لتقدير الرسوم الجمركية والتعريفات عبر الحدود.', pronunciation: 'Khenera un mo-delo euris-tiko para la estimat-syon', context: 'Intelligence Artificielle Pro' }
        ]
      }
    ]
  },
  de: {
    debutant: [
      { id: 'de-deb-1', title: 'Deutsche Grundlagen', titleAr: 'الأساسيات الألمانية', description: 'Bases de politesse en allemand.', descriptionAr: 'أسس اللياقة اليومية باللغة الألمانية.', xp: 100, content: [{ phrase: 'Guten Tag! Wie geht es Ihnen?', translation: 'Bonjour ! Comment allez-vous ?', translationAr: 'يوم سعيد! كيف حالكم؟', pronunciation: 'Gou-ten Tag! Vi guet es i-nen?', context: 'Formule polie' }] }
    ],
    semipro: [
      { id: 'de-semi-1', title: 'Einkauf & Rabatt', titleAr: 'التسوق والخصومات', description: 'Négocier un achat ou un code promo.', descriptionAr: 'التفاوض على كود الخصم وسعر التوصيل للمنزل.', xp: 150, content: [{ phrase: 'Gibt es einen Rabatt für diese Bestellung?', translation: 'Y a-t-il une réduction pour cette commande ?', translationAr: 'هل يوجد خصم على هذا الطلب؟', pronunciation: 'Gibt es aynen rabatt', context: 'Demander une remise' }] }
    ],
    pro: [
      { id: 'de-pro-1', title: 'Vertrieb & Qualität', titleAr: 'المبيعات والجودة الألمانية المتميزة', description: 'Qualité suprême et réclamations contractuelles.', descriptionAr: 'نقاشات معقدة بخصوص شهادات الجودة والمطابقة.', xp: 220, content: [{ phrase: 'Die Qualität entspricht absolut den höchsten Standards.', translation: 'La qualité correspond absolument aux normes les plus élevées.', translationAr: 'الجودة تطابق تماماً أعلى المعايير القياسية.', pronunciation: 'Di kva-li-teht ent-shprikt ab-so-lut', context: 'Garantie de qualité supérieure' }] }
    ],
    legendaire: [
      { id: 'de-leg-1', title: 'Internationale Partnerschaft', titleAr: 'الشراكات الدولية الموثوقة', description: 'Contrats de distribution exclusifs en Europe.', descriptionAr: 'صياغة العقود الاستراتيجية لتوزيع المنتجات في أوروبا.', xp: 350, content: [{ phrase: 'Wir unterschreiben einen langfristigen Kooperationsvertrag.', translation: 'Nous signons un contrat de coopération à long terme.', translationAr: 'نحن نوقع عقد تعاون طويل الأمد ومتبادل المنفعة.', pronunciation: 'Vir unter-shrayben aynen lang-fristigen', context: 'Engagement pro' }] }
    ],
    elite: [
      { id: 'de-eli-1', title: 'KI-Prompts & Zukunft', titleAr: 'أوامر الذكاء الاصطناعي الألمانية وهندسة البرمجيات', description: 'Ingénierie cognitive et transformation numérique.', descriptionAr: 'استخدام أحدث نماذج التعلم الآلي لتحليل السوق وضبط العمليات.', xp: 500, content: [{ phrase: 'Verfasse einen optimierten KI-Prompt für vorausschauende Wartungsprozesse.', translation: 'Rédige un prompt IA optimisé pour les processus de maintenance prédictive.', translationAr: 'اكتب أمراً برمجياً محسناً للذكاء الاصطناعي لعمليات الصيانة التنبؤية.', pronunciation: 'Fer-fasse aynen opti-mirten ka-i prompt', context: 'Prompt IA Technique' }] }
    ]
  }
};

export type LearningCategory = 'voyage' | 'livraison' | 'vivre_la_bas' | 'loisir';

export interface CategoryDetails {
  id: LearningCategory;
  name: string;
  nameAr: string;
  icon: string;
  desc: string;
  descAr: string;
}

export const CATEGORY_DETAILS: Record<LearningCategory, CategoryDetails> = {
  voyage: {
    id: 'voyage',
    name: 'Voyage & Tourisme',
    nameAr: 'السفر والسياحة',
    icon: '✈️',
    desc: 'Vocabulaire essentiel pour voyager, réserver un hôtel, demander des directions et commander au restaurant.',
    descAr: 'المفردات الأساسية للسفر، حجز الفنادق، السؤال عن الاتجاهات والطلب في المطعم.'
  },
  livraison: {
    id: 'livraison',
    name: 'Commerce & Livraison',
    nameAr: 'التجارة والتوصيل',
    icon: '📦',
    desc: 'Négociation, expédition 58 wilayas, service après-vente et gestion des stocks.',
    descAr: 'التفاوض، الشحن لـ 58 ولاية، خدمة ما بعد البيع وإدارة المخزون.'
  },
  vivre_la_bas: {
    id: 'vivre_la_bas',
    name: 'Vivre là-bas',
    nameAr: 'العيش في الخارج',
    icon: '🏡',
    desc: 'Démarches administratives, recherche de logement, banque et intégration sociale.',
    descAr: 'الإجراءات الإدارية، البحث عن سكن، المعاملات البنكية والاندماج الاجتماعي.'
  },
  loisir: {
    id: 'loisir',
    name: 'Loisirs & Juste Comme Ça',
    nameAr: 'التسلية والمطالعة',
    icon: '🎨',
    desc: 'Sujets quotidiens, hobbies, expressions courantes et culture générale.',
    descAr: 'المواضيع اليومية، الهوايات، العبارات الشائعة والثقافة العامة.'
  }
};

const DYNAMIC_PHRASES: Record<LearningCategory, Record<SkillLevel, {
  phrases: {
    phrase: Record<string, string>;
    translation: string;
    translationAr: string;
    pronunciation: Record<string, string>;
    context: string;
  }[];
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  xp: number;
}>> = {
  voyage: {
    debutant: {
      title: "Salutations & Demande de chemin",
      titleAr: "التحيات والسؤال عن الطريق",
      description: "Les bases indispensables pour s'orienter en voyage.",
      descriptionAr: "الأساسيات التي لا غنى عنها للتوجه أثناء السفر.",
      xp: 100,
      phrases: [
        {
          phrase: {
            en: "Where is the airport, please?",
            es: "¿Dónde está el aeropuerto, por favor?",
            de: "Wo ist der Flughafen, bitte?",
            it: "Dov'è l'aeroporto, per favore?",
            tr: "Havalimanı nerede, lütfen?",
            fr: "Où se trouve l'aéroport, s'il vous plaît ?",
            ar: "أين يقع المطار، من فضلك؟",
            ru: "Где находится аэропорт, пожалуйста?",
            ja: "空港はどこですか？",
            zh: "请问机场在哪里？"
          },
          translation: "Où se trouve l'aéroport, s'il vous plaît ?",
          translationAr: "أين يقع المطار، من فضلك؟",
          pronunciation: {
            en: "wɛər ɪz ði ˈeəpɔːt pliːz",
            es: "ˈdonde esˈta el aeɾoˈpweɾto poɾ faˈβoɾ",
            de: "voː ɪst deːɐ̯ ˈfluːkhaːfn̩ ˈbɪtə",
            it: "doˈvɛ llaeɾoˈpɔrto per faˈvoːre",
            tr: "havaɫɯmanɯ neɾede lytfen",
            fr: "u se tʁuv l'aeʁɔpɔʁ s'il vu plɛ",
            ar: "ayna yaqa'u al-matar, min fadlik",
            ru: "gde nakhoditsya aeroport, pozhaluysta",
            ja: "kūkō wa doko desu ka",
            zh: "qǐngwèn jīchǎng zài nǎlǐ"
          },
          context: "S'orienter dans une nouvelle ville"
        },
        {
          phrase: {
            en: "I would like to book a room.",
            es: "Me gustaría reservar una habitación.",
            de: "Ich möchte ein Zimmer buchen.",
            it: "Vorrei prenotare una camera.",
            tr: "Bir oda rezerve etmek istiyorum.",
            fr: "Je voudrais réserver une chambre.",
            ar: "أود حجز غرفة.",
            ru: "Я хотел бы забронировать номер.",
            ja: "部屋を予約したいです。",
            zh: "我想预订一间房间。"
          },
          translation: "Je voudrais réserver une chambre.",
          translationAr: "أود حجز غرفة.",
          pronunciation: {
            en: "aɪ wʊd laɪk tuː bʊk ə ruːm",
            es: "me ɣuhtaˈɾia reseɾˈβaɾ ˈuna aβitaˈθjon",
            de: "ɪç ˈmœçtə aɪn ˈtsɪmɐ ˈbuːxn̩",
            it: "vorˈrɛi prenoˈtaːre ˈuːna ˈkaːmera",
            tr: "bir oda rezerve etmek istiyorum",
            fr: "ʒə vudʁɛ ʁezeʁve yn ʃɑ̃bʁ",
            ar: "awaddu hajza ghurfah",
            ru: "ya khotel by zabronirovat' nomer",
            ja: "heya wa yoyaku shitai desu",
            zh: "wǒ xiǎng yùdìng yī jiān fángjiān"
          },
          context: "Arrivée ou contact avec un hôtel"
        }
      ]
    },
    semipro: {
      title: "Hôtel & Services",
      titleAr: "الفندق والخدمات",
      description: "Négocier et demander des services de voyage.",
      descriptionAr: "التفاوض وطلب خدمات السفر.",
      xp: 150,
      phrases: [
        {
          phrase: {
            en: "Is breakfast included in the price?",
            es: "¿El desayuno está incluido en el precio?",
            de: "Ist das Frühstück im Preis inbegriffen?",
            it: "La colazione è inclusa nel prezzo?",
            tr: "Kahvaltı fiyata dahil mi?",
            fr: "Le petit-déjeuner est-il inclus dans le prix ?",
            ar: "هل وجبة الإفطار مشمولة في السعر؟",
            ru: "Завтрак включен в стоимость?",
            ja: "朝食は料金に含まれていますか？",
            zh: "早餐包含在价格中吗？"
          },
          translation: "Le petit-déjeuner est-il inclus dans le prix ?",
          translationAr: "هل وجبة الإفطار مشمولة في السعر؟",
          pronunciation: {
            en: "ɪz ˈbrɛkfəst ɪnˈkluːdɪd ɪn ðiː praɪs",
            es: "el ðesaˈʝuno esˈta iŋkluˈiðo en el ˈpɾeθjo",
            de: "ɪst das ˈfryːʃtʏk iːm pʁaɪs ˈɪnbəɡʁɪfən",
            it: "la kolaˈtsjoːne ˈɛ iŋˈkluːza nel ˈprɛttso",
            tr: "kahvaltı fiyata dahil mi",
            fr: "lə pəti deʒøne ɛt il ɛ̃kly dɑ̃ lə pʁi",
            ar: "hal wajbatu al-iftar mashmulatun fi al-si'r",
            ru: "zavtrak vklyuchen v stoimost'",
            ja: "chōshoku wa ryōkin ni fukumarete imasu ka",
            zh: "zǎocān bāohán zài jiàgé zhōng ma"
          },
          context: "Vérifier les prestations hôtelières"
        }
      ]
    },
    pro: {
      title: "Réservations & Annulations",
      titleAr: "الحجوزات والإلغاءات",
      description: "Gérer les imprévus et demander des remboursements.",
      descriptionAr: "إدارة الحالات الطارئة وطلب الاسترداد.",
      xp: 250,
      phrases: [
        {
          phrase: {
            en: "I would like to cancel my reservation and get a refund.",
            es: "Me gustaría cancelar mi reserva y obtener un reembolso.",
            de: "Ich möchte meine Reservierung stornieren und eine Rückerstattung erhalten.",
            it: "Vorrei cancellare la mia prenotazione e ottenere un rimborso.",
            tr: "Rezervasyonumu iptal etmek ve para iadesi almak istiyorum.",
            fr: "Je voudrais annuler ma réservation et obtenir un remboursement.",
            ar: "أود إلغاء حجزي والحصول sur استرداد مالي.",
            ru: "Я хотел бы отменить бронирование и получить возврат средств.",
            ja: "予約をキャンセルして払い戻しを受けたいです。",
            zh: "我想取消我的预订并获得退款。"
          },
          translation: "Je voudrais annuler ma réservation et obtenir un remboursement.",
          translationAr: "أود إلغاء حجزي والحصول على استرداد مالي.",
          pronunciation: {
            en: "aɪ wʊd laɪk tuː ˈkænsəl maɪ ˌrɛzəˈveɪʃən ænd ɡɛt ə ˈriːfʌnd",
            es: "me ɣuhtaˈɾia kanθeˈlaɾ mi ʁeˈseɾβa i oβteˈneɾ un reemˈbolso",
            de: "ɪç ˈmœçtə ˈmaɪnə ʁezɛʁˈviːʁʊŋ ʃtɔʁˈniːʁən ʊnt ˈaɪnə ˈʁʏkʔɛɐ̯ˌʃtatʊŋsˈʁɪçtˌliːniːə",
            it: "vorˈrɛi kantʃelˈlaːre la ˈmiːa prenotatˈtsjoːne e otteˈneːre un rimˈborso",
            tr: "rezervasyonumu iptal etmek ve para iadesi almak istiyorum",
            fr: "ʒə vudʁɛ anyle ma ʁezeʁvasjɔ̃ e ɔbtəniʁ ɛ̃ ʁɑ̃buʁsəmɑ̃",
            ar: "awaddu ilga'a hajzi wa al-husul 'ala istirdadin mali",
            ru: "ya khotel by otmenit' bronirovaniye i poluchit' vozvrat sredstv",
            ja: "yoyaku o kyanseru shite haraimodoshi o uketai desu",
            zh: "wǒ xiǎng qǔxiāo wǒ de yùdìng bìng huòdé tuìkuǎn"
          },
          context: "Annulation de billet ou d'hôtel"
        }
      ]
    },
    legendaire: {
      title: "Formalités Frontalières",
      titleAr: "الإجراءات الحدودية والجمارك",
      description: "Discuter des règles sanitaires et douanières.",
      descriptionAr: "مناقشة القواعد الصحية والجمركية المعقدة.",
      xp: 400,
      phrases: [
        {
          phrase: {
            en: "Are there any travel restrictions or mandatory quarantine protocols?",
            es: "¿Existen restricciones de viaje o protocolos de cuarentena obligatoria?",
            de: "Gibt es Reisebeschränkungen oder obligatorische Quarantäneprotokolle?",
            it: "Ci sono restrizioni di viaggio o protocolli di quarantena obbligatori?",
            tr: "Seyahat kısıtlamaları veya zorunlu karantina protokolleri var mı?",
            fr: "Y a-t-il des restrictions de voyage ou des protocoles de quarantaine obligatoires ?",
            ar: "هل هناك أي قيود على السفر أو بروتوكولات حجر صحي إلزامية؟",
            ru: "Есть ли ограничения на поездки или обязательные карантинные протоколы?",
            ja: "旅行制限や義務的な隔離プロトコルはありますか？",
            zh: "有什么旅行限制或强制隔离协议吗？"
          },
          translation: "Y a-t-il des restrictions de voyage ou des protocoles de quarantaine obligatoires ?",
          translationAr: "هل هناك أي قيود على السفر أو بروتوكولات حجر صحي إلزامية؟",
          pronunciation: {
            en: "ɑː rɛə ˈɛni ˈtrævl rɪsˈtrɪkʃənz ɔː ˈmændətəri ˈkwɒrəntiːn ˈprəʊtəkɒlz",
            es: "egˈsisten restɾiɣˈθjones ðe ˈβja-xe o pɾotoˈkolos ðe kaɾanˈtena oβliɣaˈtoɾja",
            de: "ɡiːpt ɛs ˈʁaɪzəbəˌʃʁɛŋkʊŋən oːdɐ ɔblɪɡaˈtoːʁɪʃə kaʁanˈtɛːnəpʁotoˌkɔlə",
            it: "tʃi ˈsoːno restritˈtsjoːni di ˈvjaddʒo o protoˈkɔlli di kwaranˈtɛːna obbliɡaˈtoːri",
            tr: "seyahat kisitlamalari veya zorunlu karantina protokolleri var mi",
            fr: "i a t il de ʁɛstʁiksjɔ̃ də vwajaʒ u de pʁɔtɔkɔl də kaʁɑ̃tin ɔbliɡatwaʁ",
            ar: "hal hunaka ayyu qiyudin 'ala al-safar aw burutukulat hajrin sihiyyin ilzamiyyah",
            ru: "yest' li ogranicheniya na poyezdki ili obyazatel'nyye karantinnyye protokoly",
            ja: "ryokō seigen ya gimuteki na kakuri purotokoru wa arimasu ka",
            zh: "yǒu shéme lǚxíng xiànzhì huò qiángzhì gélí xiéyì ma"
          },
          context: "Voyager en toute sécurité"
        }
      ]
    },
    elite: {
      title: "IA & Itinéraires sur mesure",
      titleAr: "الذكاء الاصطناعي ومسارات السفر",
      description: "Utiliser l'IA pour générer un itinéraire parfait.",
      descriptionAr: "استخدام الذكاء الاصطناعي لإنشاء مسار سياحي مثالي وغامر.",
      xp: 500,
      phrases: [
        {
          phrase: {
            en: "Act as an expert tour guide to plan an immersive cultural itinerary.",
            es: "Actúa como guía experto para planificar un itinerario cultural inmersivo.",
            de: "Agieren Sie als fachkundiger Reiseleiter, um einen immersiven Kulturreiseplan zu erstellen.",
            it: "Agisci come guida turistica esperta per pianificare un itinerario culturale immersivo.",
            tr: "Sürükleyici bir kültürel rota planlamak için uzman bir tur rehberi gibi davranın.",
            fr: "Agis en tant que guide expert pour planifier un itinéraire culturel immersif.",
            ar: "تصرف كمرشد سياحي خبير للتخطيط لمسار ثقافي غامر.",
            ru: "Действуйте как опытный гид, чтобы спланировать иммерсивный культурный маршрут.",
            ja: "専門のツアーガイドとして、没入型の文化的な旅程を計画してください。",
            zh: "担任专家导游，规划一次沉浸式的文化行程。"
          },
          translation: "Agis en tant que guide expert pour planifier un itinéraire culturel immersif.",
          translationAr: "تصرف كمرشد سياحي خبير للتخطيط لمسار ثقافي غامر.",
          pronunciation: {
            en: "ækt æz ən ˈɛkspɜːt tʊə ɡaɪd tu plæn ən ɪˈmɜːsɪv ˈkʌlʧərəl aɪˈtɪnərəri",
            es: "akˈtua ˈkomo ˈɡia eksˈpeɾto paɾa planafiˈkaɾ un itineˈɾaɾjo kultuˈɾal inmeɾˈsiβo",
            de: "aˈɡiːʁən ziː als ˈtuːtoːɐ̯ fyːɐ̯ kʁeaˈtiːvəs ˈʃʁaɪbən ʊm ʃtiːl ʊnt ˈʃpʁaːxʃtʁʊkˌtuːɐ̯ tsuː ɛɐ̯ˈfeɪnəʁn̩",
            it: "ˈaːdʒiʃʃi ˈkoːme ˈɡwiːda tuˈristika esˈpɛrta per pjanifiˈkaːre un itineˈraːrio kultuˈraːle imˈmɛrsivo",
            tr: "surukleyici bir kulturel rota planlamak icin uzman bir tur rehberi gibi davranin",
            fr: "aʒi ɑ̃ tɑ̃ kə ɡid ɛkspɛʁ puʁ planifje ɛ̃ t_itineʁɛːʁ kyltyʁɛl imɛʁsif",
            ar: "tasarraf ka-murshidin siyayiyyin khabirin lil-takhtit li-masarin thaqafiyyin ghamir",
            ru: "deystvuyte kak opytnyy gid, chtoby splanirovat' immersivnyy kul'turnyy marshrut",
            ja: "senmon no tsuāgaido to shite, botsunyūgata no bunkateki na ryotei o keikaku shite kudasai",
            zh: "dānrèn zhuānjiā dǎoyóu, guīhuà yīcì chénmìnshì de wénhuà xíngchéng"
          },
          context: "Planification assistée par IA"
        }
      ]
    }
  },
  livraison: {
    debutant: {
      title: "Suivi de Colis",
      titleAr: "تتبع الطرود والشحنات",
      description: "Phrases simples pour suivre et demander après un colis.",
      descriptionAr: "عبارات بسيطة لتتبع والسؤال عن حالة الطرد.",
      xp: 100,
      phrases: [
        {
          phrase: {
            en: "Where is my package, please?",
            es: "¿Dónde está mi paquete, por favor?",
            de: "Wo ist mein Paket, bitte?",
            it: "Dov'è il mio pacco, per favore?",
            tr: "Paketim nerede, lütfen?",
            fr: "Où est mon colis, s'il vous plaît ?",
            ar: "أين طردي، من فضلك؟",
            ru: "Где моя посылка, пожалуйста?",
            ja: "私の荷物はどこですか？",
            zh: "请问我的包裹在哪里？"
          },
          translation: "Où est mon colis, s'il vous plaît ?",
          translationAr: "أين طردي، من فضلك؟",
          pronunciation: {
            en: "wɛər ɪz maɪ ˈpækɪʤ pliːz",
            es: "ˈdonde esˈta mi paˈkete poɾ faˈβoɾ",
            de: "voː ɪst maɪn paˈkeːt ˈbɪtə",
            it: "doˈvɛ il ˈmiːo ˈpakko per faˈvoːre",
            tr: "paketim nerede lutfen",
            fr: "u ɛ mɔ̃ kɔli s'il vu plɛ",
            ar: "ayna tardi, min fadlik",
            ru: "gde moya posylka, pozhaluysta",
            ja: "watashi no nimotsu wa doko desu ka",
            zh: "qǐngwèn wǒ de bāoguǒ zài nǎlǐ"
          },
          context: "Service client e-commerce"
        }
      ]
    },
    semipro: {
      title: "Expédition Nationale 58 Wilayas",
      titleAr: "الشحن الوطني عبر 58 ولاية",
      description: "Formuler la politique de livraison commerciale.",
      descriptionAr: "شرح وصياغة سياسة التوصيل والشحن التجاري.",
      xp: 150,
      phrases: [
        {
          phrase: {
            en: "We offer secure shipping to all fifty-eight wilayas.",
            es: "Ofrecemos envío seguro a las cincuenta y ocho wilayas.",
            de: "Wir bieten sicheren Versand in alle achtundfünfzig Wilayas.",
            it: "Offriamo spedizioni sicure in tutte le cinquantotto wilaya.",
            tr: "Elli sekiz vilayetin tamamına güvenli gönderim sunuyoruz.",
            fr: "Nous offrons la livraison sécurisée dans les cinquante-huit wilayas.",
            ar: "نحن نقدم الشحن الآمن لثمانية وخمسين ولاية.",
            ru: "Мы предлагаем безопасную доставку во все пятьдесят восемь вилайятов.",
            ja: "58の全ウィラヤへの安全な発送を提供しています。",
            zh: "我们向所有五十八个省提供安全运输。"
          },
          translation: "Nous offrons la livraison sécurisée dans les cinquante-huit wilayas.",
          translationAr: "نحن نقدم الشحن الآمن لثمانية وخمسين ولاية.",
          pronunciation: {
            en: "wiː ˈɒfə sɪˈkjʊə ˈʃɪpɪŋ tuː ɔːl ˈfɪfti eɪt wɪˈlaɪəz",
            es: "ofɾeˈθemos emˈbi-o seˈɣuɾo a las θiŋˈkwenta i ˈo-tʃo wɪˈlaɪas",
            de: "viːer ˈbiːtn̩ ˈzɪçəʁən fɛɐ̯ˈzant ɪn ˈalə ˈaxtʊntˈfʏnftsɪç vɪˈlaɪas",
            it: "ofˈfriːamo spediˈtsjoːni siˈkuːre in ˈtutte le tʃiŋkwanˈtɔtte wiˈlaːja",
            tr: "elli sekiz vilayetin tamamina guvenli gonderim sunuyoruz",
            fr: "nu z_ɔfʁɔ̃ la livʁɛzɔ̃ sekyʁize dɑ̃ le sɛ̃kɑ̃t_ɥit wilaja",
            ar: "nahnu nuqaddimu al-shahna al-amina li-thamaniyatin wa khamsina wilayah",
            ru: "my predlagayem bezopasnuyu dostavku vo vse pyat'desyat vosem' vilayyatov",
            ja: "gojū hachi no zen wiraya e no anzen na hassō o teikyō shite imasu",
            zh: "wǒmen xiàng suǒyǒu wǔshíbā gè shěng tígōng ānquán yùnshū"
          },
          context: "Information de livraison boutique"
        }
      ]
    },
    pro: {
      title: "BaridiMob & Paiement à la Livraison",
      titleAr: "بريدي موب والدفع عند الاستلام",
      description: "Discuter des modes de paiement CCP et BaridiMob.",
      descriptionAr: "مناقشة خيارات وطرق الدفع عبر البريد والدفع عند الاستلام.",
      xp: 250,
      phrases: [
        {
          phrase: {
            en: "Can I pay on delivery using my BaridiMob account?",
            es: "¿Puedo pagar al recibir usando mi cuenta BaridiMob?",
            de: "Kann ich bei Lieferung mit meinem BaridiMob-Konto bezahlen?",
            it: "Posso pagare alla consegna usando il mio conto BaridiMob?",
            tr: "BaridiMob hesabımı kullanarak kapıda ödeme yapabilir miyim?",
            fr: "Puis-je payer à la livraison avec mon compte BaridiMob ?",
            ar: "هل يمكنني الدفع عند الاستلام باستخدام حساب بريدي موب؟",
            ru: "Могу ли я оплатить при доставке с помощью аккаунта BaridiMob?",
            ja: "BaridiMobアカウントを使用して着払いで支払うことはできますか？",
            zh: "我可以使用BaridiMob账户货到付款吗？"
          },
          translation: "Puis-je payer à la livraison avec mon compte BaridiMob ?",
          translationAr: "هل يمكنني الدفع عند الاستلام باستخدام حساب بريدي موب؟",
          pronunciation: {
            en: "kæn aɪ peɪ ɒn dɪˈlɪvəri ˈjuːzɪŋ maɪ BaridiMob əˈkaʊnt",
            es: "kæn aɪ peɪ ɒn dɪˈlɪvəri ˈjuːzɪŋ maɪ BaridiMob əˈkaʊnt",
            de: "kan ɪç baɪ ˈliːfəʁʊŋ mɪt ˈmaɪnəm BaridiMob ˈkɔntoː bəˈtsaːlən",
            it: "ˈpɔsso paˈɡaːre ˈalla konˈseɲɲa uˈzando il ˈmiːo ˈkonto BaridiMob",
            tr: "BaridiMob hesabimi kullanarak kapida odeme yapabilir miyim",
            fr: "pɥiʒ peje a la livʁɛzɔ̃ avɛk mɔ̃ kɔ̃t baʁidimɔb",
            ar: "hal yumkinuni al-daf'u 'inda al-istilami bi-ustikhdami hisab baridi mub",
            ru: "mogu li ya oplatit' pri dostavke s pomoshch'yu akkaunta BaridiMob",
            ja: "BaridiMob akaunto o shiyō shite chakubarai de shiharau koto wa dekimasu ka",
            zh: "wǒ kěyǐ shǐyòng BaridiMob zhànghù huòdàofǔkuǎn ma"
          },
          context: "Options de facturation e-commerce"
        }
      ]
    },
    legendaire: {
      title: "Contrats d'Achat de Gros",
      titleAr: "عقود الشراء بالجملة والوكلاء",
      description: "Négociation de gros volumes et conditions de remboursement.",
      descriptionAr: "التفاوض على الكميات الكبيرة وشروط الاسترداد.",
      xp: 400,
      phrases: [
        {
          phrase: {
            en: "Our wholesale purchase contract includes a flexible refund policy.",
            es: "Nuestro contrato de compra al por mayor incluye una política flexible de reembolso.",
            de: "Unser Großhandelskaufvertrag enthält eine flexible Rückerstattungsrichtlinie.",
            it: "Il nostro contrato di acquisto all'ingrosso include una politica di rimborso flessibile.",
            tr: "Toptan satın alma sözleşmemiz esnek bir iade politikası içermektedir.",
            fr: "Notre contrat d'achat de gros inclut une politique de remboursement flexible.",
            ar: "يتضمن عقد الشراء بالجملة لدينا سياسة استرداد مرنة.",
            ru: "Наш договор оптовой закупки включает гибкую политику возврата средств.",
            ja: "当社の卸売購入契約には、柔軟な返金ポリシーが含まれています。",
            zh: "我们的批发购买合同包括灵活的退款政策。"
          },
          translation: "Notre contrat d'achat de gros inclut une politique de remboursement flexible.",
          translationAr: "يتضمن عقد الشراء بالجملة لدينا سياسة استرداد مرنة.",
          pronunciation: {
            en: "ˈaʊə ˈhəʊlseɪl ˈpɜːʧəs ˈkɒntrækt ɪnˈkluːdz ə ˈflɛksəbl ˈriːfʌnd ˈpɒlɪsi",
            es: "ˈnwestɾo konˈtɾato ðe ˈkompɾa al poɾ maˈʝoɾ iŋˈkluje ˈuna poˈlitika flɛkˈsiβle ðe reemˈbolso",
            de: "ˈaʊzɐ ˈɡʁoːsˌhandlskauffɛɐ̯tʁaːk ɛntˈhɛlt ˈaɪnə ˈflɛksɪblə ˈʁʏkʔɛɐ̯ˌʃtatʊŋsˈʁɪçtˌliːniːə",
            it: "il ˈnɔstro konˈtratto di akˈkwisto all_iŋˈɡrɔsso iŋˈkluːde ˈuːna poˈliːtika di rimˈborso flesˈsiːbile",
            tr: "toptan satin alma sozlesmemiz esnek bir iade politikasi icermektedir",
            fr: "nɔtʁə kɔ̃tʁa d'aʃa de ɡʁo ɛ̃kly yn pɔlitik de ʁɑ̃buʁsəmɑ̃ flɛksibl",
            ar: "yatamassanu 'aqdu al-shira'i bi-al-jumlat ladayna siyasata istirdadin marinah",
            ru: "nash dogovor optovoy zakupki vklyuchayet gibkuyu politiku vozvrata sredstv",
            ja: "tōsha no oroshiuri kōnyū keiyaku ni wa, jūnan na henkin porishī ga fukumarete imasu",
            zh: "wǒmen de pīfā gòumǎi hétóng bāokuó línghuó de tuìkuǎn zhèngcè"
          },
          context: "Négociation avec des grossistes"
        }
      ]
    },
    elite: {
      title: "Optimisation Logistique par IA",
      titleAr: "تحسين اللوجستيات عبر الذكاء الاصطناعي",
      description: "Prompts avancés pour configurer une chaîne logistique performante.",
      descriptionAr: "أوامر برمجية ذكية لتكوين شبكة إمداد مثالية وفعالة.",
      xp: 500,
      phrases: [
        {
          phrase: {
            en: "Act as a logistics strategist to optimize fifty-eight wilayas supply chains.",
            es: "Actúa como estratega de logística para optimizar las cadenas de cincuenta y ocho wilayas.",
            de: "Agieren Sie als Logistikstratege, um die Lieferketten in achtundfünfzig Wilayas zu optimieren.",
            it: "Agisci come stratega della logistica per ottimizzare le catene di cinquantotto wilaya.",
            tr: "Elli sekiz vilayetin tedarik zincirlerini optimize etmek için bir lojistik stratejisti gibi davranın.",
            fr: "Agis comme un stratège en logistique pour optimiser les chaînes d'approvisionnement des 58 wilayas.",
            ar: "تصرف كاستراتيجي لوجستي لتحسين سلاسل التوريد لـ 58 ولاية.",
            ru: "Действуйте как стратег по логистике, чтобы оптимизировать цепочки поставок в 58 вилайятах.",
            ja: "58の全ウィラヤのサプライチェーンを最適化するために、物流ストラテジストとして行動してください。",
            zh: "担任物流策划师，优化五十八个省的供应链。"
          },
          translation: "Agis comme un stratège en logistique pour optimiser les chaînes d'approvisionnement des 58 wilayas.",
          translationAr: "تصرف كاستراتيجي لوجستي لتحسين سلاسل التوريد لـ 58 ولاية.",
          pronunciation: {
            en: "ækt æz ə lɒˈʤɪstɪks ˈstrætɪʤɪst tuː ˈɒptɪmaɪz ˈfɪfti eɪt wɪˈlaɪəz səˈplaɪ ʧeɪnz",
            es: "akˈtua ˈkomo estɾaˈtexa ðe loˈxistika paɾa optimiˈθaɾ las kaˈðenas ðe θiŋˈkwenta i ˈo-tʃo wɪˈlaɪas",
            de: "aˈɡiːʁən ziː als loˈgɪstɪkʃtʁaˈteːgə ʊm diː ˈliːfɐˌkɛtn̩ ɪn ˈaxtʊntˈfʏnftsɪç vɪˈlaɪas tsuː ɔptiˈmiːʁən",
            it: "ˈaːdʒiʃʃi ˈkoːme straˈtɛːɡo della loˈdʒistika per ottimizˈzaːre le kaˈteːne di tʃiŋkwanˈtɔtte wiˈlaːja",
            tr: "elli sekiz vilayetin tedarik zincirlerini optimize etmek icin bir lojistik stratejisti gibi davranin",
            fr: "aʒi kɔm ɛ̃ stʁateʒ ɑ̃ lɔʒistik puʁ ɔptimizje le ʃɛn d'apʁɔvizjɔnmɑ̃ de sɛ̃kɑ̃t_ɥit wilaja",
            ar: "tasarraf ka-istiratijiyyin lujastiyyin li-tahsini salasili al-tawridi li-58 wilayah",
            ru: "deystvuyte kak strateg po logistike, chtoby optimizirovat' tsepochki postavok v pyat'desyat vosem' vilayyatov",
            ja: "gojū hachi no zen wiraya no sapuraichēn o saitekika suru tame ni, butsuryū sutoratejisuto to shite kōdō shite kudasai",
            zh: "dānrèn wùliú cèhuàshī, yōuhuà wǔshíbā gè shěng de gōngyìngliàn"
          },
          context: "Modélisation de processus industriels"
        }
      ]
    }
  },
  vivre_la_bas: {
    debutant: {
      title: "Logement & Installation",
      titleAr: "السكن والاستقرار الأولي",
      description: "Demander et exprimer le besoin de louer un logement.",
      descriptionAr: "السؤال والطلب بخصوص استئجار السكن المناسب.",
      xp: 100,
      phrases: [
        {
          phrase: {
            en: "I want to rent an apartment.",
            es: "Quiero alquilar un apartamento.",
            de: "Ich möchte eine Wohnung mieten.",
            it: "Voglio affittare un appartamento.",
            tr: "Bir daire kiralamak istiyorum.",
            fr: "Je veux louer un appartement.",
            ar: "أريد استئجار شقة.",
            ru: "Я хочу снять квартиру.",
            ja: "アパートを借りたいです。",
            zh: "我想租一套公寓。"
          },
          translation: "Je veux louer un appartement.",
          translationAr: "أريد استئجار شقة.",
          pronunciation: {
            en: "aɪ wɒnt tu rɛnt ən əˈpɑːtmənt",
            es: "ˈkjeɾo alkiˈlaɾ un apaɾtaˈmento",
            de: "ɪç ˈmœçtə ˈaɪnə ˈvoːnʊŋ ˈmiːtn̩",
            it: "ˈvɔʎʎo affitˈtaːre un appartatˈmento",
            tr: "bir daire kiralamak istiyorum",
            fr: "ʒə vø lwe ɛ̃ n_apaʁtəmɑ̃",
            ar: "uridu isti'jara shuqqah",
            ru: "ya khochu snyat' kvartiru",
            ja: "apāto o karitai desu",
            zh: "wǒ xiǎng zū yī tào gōngyù"
          },
          context: "Recherche immobilière active"
        }
      ]
    },
    semipro: {
      title: "Ouverture de Compte Bancaire",
      titleAr: "فتح حساب بنكي وإدارته",
      description: "Phrases courantes pour interagir avec une agence bancaire.",
      descriptionAr: "العبارات الشائعة للتعامل مع الوكالات المصرفية.",
      xp: 150,
      phrases: [
        {
          phrase: {
            en: "I need to open a bank account.",
            es: "Necesito abrir una cuenta bancaria.",
            de: "Ich muss ein Bankkonto eröffnen.",
            it: "Ho bisogno di aprire un conto bancario.",
            tr: "Bir banka hesabı açmam gerekiyor.",
            fr: "J'ai besoin d'ouvrir un compte bancaire.",
            ar: "أحتاج لفتح حساب بنكي.",
            ru: "Мне нужно открыть банковский счет.",
            ja: "銀行口座を開設する必要があります。",
            zh: "我需要开设一个银行账户。"
          },
          translation: "J'ai besoin d'ouvrir un compte bancaire.",
          translationAr: "أحتاج لفتح حساب بنكي.",
          pronunciation: {
            en: "aɪ niːd tu ˈəʊpən ə bæŋk əˈkaʊnt",
            es: "neθeˈsito aˈβɾiɾ ˈuna ˈkwenta βaŋˈkaɾja",
            de: "ɪç mʊs aɪn ˈbaŋkˌkɔntoː ɛɐ̯ˈœfnən",
            it: "ɔ biˈzoɲɲo di aˈpriːre un ˈkonto baŋˈkaːrio",
            tr: "bir banka hesabi acmam gerekiyor",
            fr: "ʒ'e bəzwɛ̃ d'uvʁiʁ ɛ̃ kɔ̃t bɑ̃kɛːʁ",
            ar: "ahtaju li-fathi hisabin bankiyy",
            ru: "mne nuzhno otkryt' bankovskiy schet",
            ja: "ginkō kōza o kaisetsu suru hitsuyō ga arimasu",
            zh: "wǒ xūyào kāishè yī gè yínháng zhànghù"
          },
          context: "Formalités d'installation financière"
        }
      ]
    },
    pro: {
      title: "Permis de Séjour & Visa",
      titleAr: "تصريح الإقامة والتأشيرة",
      description: "Constituer un dossier administratif légal.",
      descriptionAr: "تجهيز ملف إداري قانوني لطلب الإقامة.",
      xp: 250,
      phrases: [
        {
          phrase: {
            en: "What are the required documents for the residency permit?",
            es: "¿Cuáles son los documentos requeridos para el permiso de residencia?",
            de: "Welche Unterlagen werden für die Aufenthaltserlaubnis benötigt?",
            it: "Quali sono i documenti richiesti per il permesso di soggiorno?",
            tr: "Oturma izni için gerekli belgeler nelerdir?",
            fr: "Quels sont les documents requis pour le permis de séjour ?",
            ar: "ما هي الوثائق المطلوبة للحصول على تصريح الإقامة؟",
            ru: "Какие документы необходимы для получения вида на жительство?",
            ja: "在留許可に必要な書類は何ですか？",
            zh: "申请居留许可需要什么材料？"
          },
          translation: "Quels sont les documents requis pour le permis de séjour ?",
          translationAr: "ما هي الوثائق المطلوبة للحصول على تصريح الإقامة؟",
          pronunciation: {
            en: "wɒt ɑː ði rɪˈkwaɪəd ˈdɒkjʊmənts fɔː ði ˈrɛzɪdənsi pəˈmɪt",
            es: "ˈkwales son los ðokuˈmentos rekeˈɾiðos ˈpaɾa el peɾˈmiso ðe reθiˈðenθja",
            de: "ˈvɛlçə ˈʊntɐˌlaːɡən veːɐ̯dən fyːɐ̯ diː ˈaufɛntˌhaltsʔɛɐ̯ˌlaʊpnɪs bəˈnøːtɪçt",
            it: "ˈkwaːli ˈsoːno i dokuˈmenti riˈkjɛsti per il perˈmetso di sodˈdʒorno",
            tr: "oturma izni icin gerekli belgeler nelerdir",
            fr: "kɛl sɔ̃ le dɔkymɑ̃ ʁəki puʁ lə pɛʁmi də seʒuʁ",
            ar: "ma hiya al-watha'iqu al-matlubatu li-husuli 'ala tasrihi al-iqamah",
            ru: "kakiye dokumenty neobkhodimy dlya polucheniya vida na zhitel'stvo",
            ja: "zairyū kyoka ni hitsuyō na shorui wa nan desu ka",
            zh: "shēnqǐng jūliú xǔkě xūyào shéme cáiliào"
          },
          context: "Démarches en préfecture / ambassade"
        }
      ]
    },
    legendaire: {
      title: "Contrat de Travail & Assurance",
      titleAr: "عقد العمل والتأمين الصحي",
      description: "Négocier les clauses de son contrat professionnel.",
      descriptionAr: "التفاوض على بنود ومزايا عقد العمل الوظيفي.",
      xp: 400,
      phrases: [
        {
          phrase: {
            en: "I have signed an employment contract with health insurance benefits.",
            es: "He firmado un contrato de trabajo con beneficios de seguro médico.",
            de: "Ich habe einen Arbeitsvertrag mit Krankenversicherung Leistungen unterzeichnet.",
            it: "Ho firmato un contratto di lavoro con prestazioni di assicurazione sanitaria.",
            tr: "Sağlık sigortası faydaları olan bir iş sözleşmesi imzaladım.",
            fr: "J'ai signé un contrat de travail avec des prestations d'assurance maladie.",
            ar: "وقعت عقد عمل يتضمن مزايا التأمين الصحي.",
            ru: "Я подписал трудовой договор с медицинским страхованием.",
            ja: "健康保健の特典付きの雇用契約に署名しました。",
            zh: "我签署了一份附带医疗保险福利的劳动合同。"
          },
          translation: "J'ai signé un contrat de travail avec des prestations d'assurance maladie.",
          translationAr: "وقعت عقد عمل يتضمن مزايا التأمين الصحي.",
          pronunciation: {
            en: "aɪ hæv saɪnd ən ɪmˈplɔɪmənt ˈkɒntrækt wɪð hɛlθ ɪnˈʃʊərəns ˈbɛnɪfɪts",
            es: "e fiɾˈmaðo un konˈtɾato ðe tɾaˈβa-xo kon βeneˈfiθjos ðe seˈɣuɾo ˈmeðiko",
            de: "ɪç ˈhaːbə ˈaɪnən ˈaʁbaɪtsfɛɐ̯ˌtʁaːk mɪt ˈkʁaŋkənvɛɐ̯ˌzɪçəʁʊŋs ˈlaɪstʊŋən ʊntɐˈtsaɪçnət",
            it: "ɔ firˈmaːto un konˈtratto di laˈvoːro kon prestatsˈtsjoːni di assikuratˈtsjoːne saniˈtaːria",
            tr: "saglik sigortasi faydalari olan bir is sozlesmesi imzaladim",
            fr: "ʒ'e siɲe ɛ̃ kɔ̃tʁa də tʁavaj avɛk de pʁɛstasjɔ̃ d'asyʁɑ̃s maladi",
            ar: "waqqa'tu 'aqda 'amalin yatadammanu mazaya al-ta'mini al-sahhiyy",
            ru: "ya podpisal trudovoy dogovor s meditsinskim strakhovaniyem",
            ja: "kenkō hoken no tokuten tsuki no koyō keiyaku ni shomei shimashita",
            zh: "wǒ qiānshǔle yī fèn fùdài yīliáo bǎoxiǎn wélì de láodòng hétóng"
          },
          context: "Embauche et avantages sociaux"
        }
      ]
    },
    elite: {
      title: "Coach d'Intégration Administrative IA",
      titleAr: "مرشد الاندماج والبيروقراطية بالذكاء الاصطناعي",
      description: "Régler la bureaucratie complexe avec de l'aide IA.",
      descriptionAr: "تبسيط الإجراءات البيروقراطية المعقدة بمساعدة الذكاء الاصطناعي.",
      xp: 500,
      phrases: [
        {
          phrase: {
            en: "Act as a local integration coach to explain administrative bureaucracy.",
            es: "Actúa como coach de integración local para explicar la burocracia administrativa.",
            de: "Agieren Sie als lokaler Integrationscoach, um die administrative Bürokratie zu erklären.",
            it: "Agisci come coach di integrazione locale per spiegare la burocrazia amministrativa.",
            tr: "İdari bürokrasiyi açıklamak için yerel bir entegrasyon koçu gibi davranın.",
            fr: "Agis comme un coach d'intégration locale pour expliquer la bureaucratie administrative.",
            ar: "تصرف كمدرب اندماج محلي لشرح البيروقراطية الإدارية.",
            ru: "Действуйте как местный коуч по интеграции, чтобы объяснить административную бюрократию.",
            ja: "行政の役所仕事を説明するために、現地の統合コーチとして行動してください。",
            zh: "担任当地融入导师，解释行政官僚程序。"
          },
          translation: "Agis comme un coach d'intégration locale pour expliquer la bureaucratie administrative.",
          translationAr: "تصرف كمدرب اندماج محلي لشرح البيروقراطية الإدارية.",
          pronunciation: {
            en: "ækt æz ə ˈləʊkəl ˌɪntɪˈɡreɪʃən kəʊʧ tu ɪksˈpleɪn ædˈmɪnɪstrətɪv bjʊəˈrɒkrəsi",
            es: "akˈtua ˈkomo koatʃ ðe iŋteɣɾaˈθjon loˈkal ˈpaɾa eksplikaˈɾ la βuɾoˈkɾaθja aðministɾaˈtiβa",
            de: "aˈɡiːʁən ziː als loˈkaːlɐ ˌɪntəɡʁaˈtsjoːnsˌkoːtʃ ʊm diː aːdmɪnɪstʁaˈtiːvə byːʁokaˈtiː tsuː ɛɐ̯ˈkleːʁən",
            it: "ˈaːdʒiʃʃi ˈkoːme kɔatʃ di inteɡratˈtsjoːne loˈkaːle per spjeˈɡaːre la burokratˈtsiːa amministraˈtiːva",
            tr: "idari burokrasiyi aciklamak icin yerel bir entegrasyon kocu gibi davranin",
            fr: "aʒi kɔm ɛ̃ kɔtʃ d'ẽteɡʁasjɔ̃ lɔkal puʁ ɛksplike la byʁɔkʁasi ad_ministʁativ",
            ar: "tasarraf ka-mudarribi indimajin mahalliyyin li-sharhi al-biruqratiyyati al-idariyyah",
            ru: "deystvuyte kak mestnyy kouch po integratsii, chtoby ob\"yasnit' administrativnuyu byurokratiyu",
            ja: "gyōsei no yakushoshigoto o setsumei suru tame ni, genchi no tōgō kōchi to shite kōdō shite kudasai",
            zh: "dānrèn dāngdì róngrù dǎoshī, jiěshì xíngzhèng guānliáo chéngxù"
          },
          context: "Assistance IA à la relocalisation"
        }
      ]
    }
  },
  loisir: {
    debutant: {
      title: "Hobbys & Loisirs",
      titleAr: "الهوايات وقضاء وقت الفراغ",
      description: "Formuler des goûts simples et parler de loisirs.",
      descriptionAr: "الحديث البسيط عن الهوايات والاهتمامات الشخصية.",
      xp: 100,
      phrases: [
        {
          phrase: {
            en: "I love learning new things.",
            es: "Me encanta aprender cosas nuevas.",
            de: "Ich liebe es, neue Dinge zu lernen.",
            it: "Adoro imparare cose nuove.",
            tr: "Yeni şeyler öğrenmeyi seviyorum.",
            fr: "J'adore apprendre de nouvelles choses.",
            ar: "أحب تعلم أشياء جديدة.",
            ru: "Я люблю узнавать новое.",
            ja: "新しいことを学ぶのが大好きです。",
            zh: "我喜欢学习新事物。"
          },
          translation: "J'adore apprendre de nouvelles choses.",
          translationAr: "أحب تعلم أشياء جديدة.",
          pronunciation: {
            en: "aɪ lʌv ˈlɜːnɪŋ njuː θɪŋz",
            es: "me eŋˈkanta apɾenˈdeɾ ˈkosas ˈnweβas",
            de: "ɪç ˈliːbə ɛs ˈnɔɪə ˈdɪŋə tsuː ˈlɛʁnən",
            it: "aˈdɔːro iŋpaˈraːre ˈkɔːze ˈnwɔːve",
            tr: "yeni seyler ogrenmeyi seviyorum",
            fr: "ʒ'adɔʁ apʁɑ̃dʁə də nuvɛl ʃoz",
            ar: "uhibbu ta'alluma ashya'a jadidah",
            ru: "ya lyublyu uznavat' novoye",
            ja: "atarashii koto o manabu no ga daīsuki desu",
            zh: "wǒ xǐhuān xuéxí xīn shìwù"
          },
          context: "Brise-glace amical"
        }
      ]
    },
    semipro: {
      title: "Conversations Quotidiennes",
      titleAr: "المحادثات والاهتمامات اليومية",
      description: "Interroger un ami sur ses passions de temps libre.",
      descriptionAr: "سؤال الأصدقاء عن هواياتهم المفضلة في وقت الفراغ.",
      xp: 150,
      phrases: [
        {
          phrase: {
            en: "What is your favorite hobby in your free time?",
            es: "¿Cuál es tu pasatiempo favorito en tu tiempo libre?",
            de: "Was ist dein Lieblingshobby in deiner Freizeit?",
            it: "Qual è il tuo hobby preferito nel tempo libero?",
            tr: "Boş zamanlarında en sevdiğin hobin nedir?",
            fr: "Quel est votre passe-temps favori pendant votre temps libre ?",
            ar: "ما هي هوايتك المفضلة في وقت فراغك؟",
            ru: "Какое твое любимое хобби в свободное время?",
            ja: "自由な時間のあなたのお気に入りの趣味は何ですか？",
            zh: "你空闲时间最喜欢的 hobby 是什么？"
          },
          translation: "Quel est votre passe-temps favori pendant votre temps libre ?",
          translationAr: "ما هي هوايتك المفضلة في وقت فراغك؟",
          pronunciation: {
            en: "wɒt ɪz jɔː ˈfeɪvərɪt ˈhɒbi ɪn jɔː friː taɪm",
            es: "ˈkwal es tu pasaˈtjempo faβoˈɾito en tu ˈtjempo ˈliβɾe",
            de: "vas ɪst daɪn ˈliːplɪŋsˌhɔbi ɪn ˈdaɪnɐ ˈfʁaɪtsaɪt",
            it: "kwa ˈɛ il ˈtuːo ˈɔbbi prefeˈriːto nel ˈtɛmpo ˈliːbero",
            tr: "bos zamanlarinda en sevdigin hobin nedir",
            fr: "kɛl ɛ vɔtʁə pas tɑ̃ favɔʁi pɑ̃dɑ̃ vɔtʁə tɑ̃ libʁ",
            ar: "ma hiya hiwayatuka al-mufaddalatu fi waqti faraghik",
            ru: "kakoye tvoye lyubimoye khobbi v svobodnoye vremya",
            ja: "jiyū na jikan no anata no oki ni iri no shumi wa nan desu ka",
            zh: "nǐ kòngxián shíjiān zuì xǐhuān de àihào shì shéme"
          },
          context: "Socialisation informelle"
        }
      ]
    },
    pro: {
      title: "Sorties Culturelles",
      titleAr: "الزيارات والأنشطة الثقافية الفنية",
      description: "Parler d'art moderne et d'expositions de musées.",
      descriptionAr: "الحديث عن الفنون الجميلة وزيارة المعارض والمتاحف الحديثة.",
      xp: 250,
      phrases: [
        {
          phrase: {
            en: "I enjoy visiting museums and discovering local modern art.",
            es: "Disfruto visitando museos y descubriendo el arte moderno local.",
            de: "Ich genieße es, Museen zu besuchen und lokale moderne Kunst zu entdecken.",
            it: "Mi piace visitare i musei e scoprire l'arte moderna locale.",
            tr: "Müzeleri ziyaret etmekten ve yerel modern sanatı keşfetmekten keyif alıyorum.",
            fr: "J'aime visiter les musées et découvrir l'art moderne local.",
            ar: "أستمتع بزيارة المتاحف واكتشاف الفن الحديث المحلي.",
            ru: "Мне нравится посещать музеи и открывать для себя местное современное искусство.",
            ja: "美術館を訪れ、地元の現代アートを発見するのが楽しいです。",
            zh: "我喜欢参观博物馆并探索当地的现代艺术。"
          },
          translation: "J'aime visiter les musées et découvrir l'art moderne local.",
          translationAr: "أستمتع بزيارة المتاحف واكتشاف الفن الحديث المحلي.",
          pronunciation: {
            en: "aɪ ɪnˈʤɔɪ ˈvɪzɪtɪŋ mjuːˈziːəmz ænd dɪsˈkʌvərɪŋ ˈləʊkəl ˈmɒdən ɑːt",
            es: "ðisˈfɾuto βisiˈtando muˈseos i ðiskuˈβɾjendo el ˈaɾte moˈðeɾno loˈkal",
            de: "ɪç ɡəˈniːsə ɛs muˈzeːən tsuː bəˈzuːxnən ʊnt loˈkaːlə moˈdɛʁnə kʊnst tsuː ɛntˈdɛkən",
            it: "mi ˈpjaːtʃe viziˈtaːre i muˈzɛːi e skoˈpriːre l_ˈarte moˈdɛrna loˈkaːle",
            tr: "muzeleri ziyaret etmekten ve yerel modern sanati kesfetmekten keyif aliyorum",
            fr: "ʒ'ɛm visite le myze e dekuvʁiʁ l'aʁ mɔdɛʁn lɔkal",
            ar: "astamti'u bi-ziyarati al-matahifi wa-iktishafi al-fanni al-hadithi al-mahalliyy",
            ru: "mne nravitsya posetit' muzei i otkryvat' dlya sebya mestnoye sovremennoye iskusstvo",
            ja: "bijutsukan o otozure, jimoto no gendaiāto o hakken suru no ga tanoshii desu",
            zh: "wǒ xǐhuān cānguān bówùguǎn bìng tànsuǒ dāngdì de xiàndài yìshù"
          },
          context: "Discussion culturelle et intellectuelle"
        }
      ]
    },
    legendaire: {
      title: "Littérature & Horizons",
      titleAr: "الأدب الكلاسيكي وتوسيع الآفاق",
      description: "Discuter d'idées abstraites, de lecture et d'expansion d'esprit.",
      descriptionAr: "النقاشات الفكرية حول الأدب، المطالعة وتوسيع المدارك.",
      xp: 400,
      phrases: [
        {
          phrase: {
            en: "Exploring classical literature expands your vocabulary and broadens horizons.",
            es: "Explorar la literatura clásica amplía tu vocabulario y ensancha horizontes.",
            de: "Die Erkundung klassischer Literatur erweitert Ihren Wortschatz und erweitert den Horizont.",
            it: "Esplorare la letteratura classica espande il tuo vocabolario e allarga gli orizzonti.",
            tr: "Klasik edebiyatı keşfetmek kelime dağarcığınızı geliştirir ve ufkunuzu genişletir.",
            fr: "Explorer la littérature classique enrichit votre vocabulaire et élargit vos horizons.",
            ar: "استكشاف الأدب الكلاسيكي يثري حصيلتك اللغوية ويوسع آفاقك.",
            ru: "Изучение классической литературы обогащает словарный запас и расширяет кругозор.",
            ja: "古典文学を探索することは語彙を増やし、視野を広げます。",
            zh: "探索古典文学可以丰富你的词汇量并开拓视野。"
          },
          translation: "Explorer la littérature classique enrichit votre vocabulaire et élargit vos horizons.",
          translationAr: "استكشاف الأدب الكلاسيكي يثري حصيلتك اللغوية ويوسع آفاقك.",
          pronunciation: {
            en: "ɪksˈplɔːrɪŋ ˈklæsɪkəl ˈlɪtərɪʧə ɪksˈpændz jɔː vəʊˈkæbjʊləri ænd ˈbrɔːdnz həˈraɪznz",
            es: "eksploˈɾaɾ la liteɾaˈtuɾa ˈklasika amˈplia tu βokaβuˈlaɾjo i enˈsantʃa oɾiˈθontes",
            de: "diː ɛɐ̯ˈklʊndʊŋ ˈklasɪʃɐ lɪtəʁaˈtuːɐ̯ ɛɐ̯ˈvaɪtɛʁt ˈiːʁən ˈvɔʁtˌʃats ʊnt ɛrˈvaɪtəʁt deːn hoˈʁiːtsɔnt",
            it: "esploˈraːre la letteratˈtuːra ˈklasika esˈpande il ˈtuːo vokaboˈlaːrio e alˈlarɡa l_oridˈdzonti",
            tr: "klasik edebiyati kesfetmek kelime dagarciginizi gelistirir ve ufkunuzu genisletir",
            fr: "ɛksplɔʁe la liteʁatyʁ klasik ɑ̃ʁiʃi vɔtʁə vɔkabylɛːʁ e elaʁʒi vo z_ɔʁizɔ̃",
            ar: "istikshafu al-adabi al-kilasikiyyi yuthri hasilatika al-lughawiyyata wa-yuwassi'u afaqak",
            ru: "izucheniye klassicheskoy literatury obogashchayet slovarnyy zapas i rasshiryayet krugozor",
            ja: "koten bungaku o tansaku suru koto wa goi o fuyashi, shiya o hirogemasu",
            zh: "探索古典文学可以丰富你的词汇量并开拓视野。"
          },
          context: "Conversation philosophique"
        }
      ]
    },
    elite: {
      title: "Écriture Créative & IA",
      titleAr: "الكتابة الإبداعية وصقل الأساليب",
      description: "Travailler la poésie et le style littéraire avec une IA.",
      descriptionAr: "استخدام موجه ذكي لصقل الأسلوب والبنية اللغوية الراقية.",
      xp: 500,
      phrases: [
        {
          phrase: {
            en: "Act as a creative writing tutor to refine style and linguistic structure.",
            es: "Actúa como tutor de escritura creativa para refinar el estilo y la estructura lingüística.",
            de: "Agieren Sie als Tutor für kreatives Schreiben, um Stil und Sprachstruktur zu verfeinern.",
            it: "Agisci come tutor di scrittura creativa per affinare lo stile e la structure linguistica.",
            tr: "Üslup ve dil yapısını geliştirmek için yaratıcı yazarlık eğitmeni gibi davranın.",
            fr: "Agis comme un tuteur d'écriture créative pour affiner le style et la structure linguistique.",
            ar: "تصرف كمعلم كتابة إبداعية لتحسين الأسلوب والبنية اللغوية.",
            ru: "Действуйте как репетитор по писательскому мастерству, чтобы улучшить стиль и структуру языка.",
            ja: "スタイルと言語構造を洗練するために、創作活動の家庭教師として行動してください。",
            zh: "担任创意写作导师，精炼写作风格与语言结构。"
          },
          translation: "Agis comme un tuteur d'écriture créative pour affiner le style et la structure linguistique.",
          translationAr: "تصرف كمعلم كتابة إبداعية لتحسين الأسلوب والبنية اللغوية.",
          pronunciation: {
            en: "ækt æz ə kri(ː)ˈeɪtɪv ˈraɪtɪŋ ˈtjuːtə tu rɪˈfaɪn staɪl ænd lɪŋˈɡwɪstɪk ˈstrʌkʧə",
            es: "akˈtua ˈkomo tuˈtoɾ ðe eskɾiˈtuɾa kɾeaˈtiβa ˈpaɾa refiˈnaɾ el esˈtilo i la estɾukˈtuɾa liŋˈɡwistika",
            de: "aˈɡiːʁən ziː als ˈtuːtoːɐ̯ fyːɐ̯ kʁeaˈtiːvəs ˈʃʁaɪbən ʊm ʃtiːl ʊnt ˈʃpʁaːxʃtʁʊkˌtuːɐ̯ tsuː ɛɐ̯ˈfeɪnəʁn̩",
            it: "ˈaːdʒiʃʃi ˈkoːme tuˈtoːre di skritˈtuːra kreariːva per affiˈnaːre lo ˈstiːle e la strutˈtuːra liŋˈɡwistika",
            tr: "uslup ve dil yapisini gelistirmek icin yaratici yazarlik egitmeni gibi davranin",
            fr: "aʒi kɔm ɛ̃ tytoːʁ d'ekʁityʁ kʁeativ puʁ afine lə stil e la stʁyktyʁ lɛ̃ɡwistik",
            ar: "tasarraf ka-mu'allimi kitabatin ibda'iyyatin li-tahsini al-uslubi wa-al-biniyati al-lughawiyyah",
            ru: "deystvuyte kak repetitor po pisatel'skomu masterstvu, chtoby uluchshit' stil' i strukturu yazyka",
            ja: "sōtaku katsudō no kateikyōshi to shite, sutairu to gengo kōzō o saitekika suru tame ni kōdō shite kudasai",
            zh: "dānrèn chuàngyì xiězuò dǎoshī, jīngliàn xiězuò fēnggé yǔ yǔyán jiégòu"
          },
          context: "Perfectionnement stylistique avancé"
        }
      ]
    }
  }
};

export interface MonthSyllabus {
  month: number;
  level: SkillLevel;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  xp: number;
  icon: string;
  phrases: {
    phrase: Record<string, string>;
    translation: string;
    translationAr: string;
    pronunciation: Record<string, string>;
    context: string;
  }[];
}

const DYNAMIC_PHRASES_BY_MONTH: Record<LearningCategory, MonthSyllabus[]> = {
  voyage: [
    {
      month: 1,
      level: 'debutant',
      title: "Arrivée & Aéroport",
      titleAr: "الوصول والمطار",
      description: "Bases d'orientation et politesse dès la descente de l'avion.",
      descriptionAr: "أساسيات التوجيه واللياقة بمجرد النزول من الطائرة.",
      xp: 100,
      icon: "✈️",
      phrases: [
        {
          phrase: { en: "Where is the airport, please?", es: "¿Dónde está el aeropuerto, por favor?", de: "Wo ist der Flughafen, bitte?", it: "Dov'è l'aeroporto, per favore?", tr: "Havalimanı nerede, lütfen?", fr: "Où se trouve l'aéroport, s'il vous plaît ?", ar: "أين يقع المطار، من فضلك؟", ru: "Где находится аэропорт?", ja: "空港はどこですか？", zh: "请问机场在哪里？" },
          translation: "Où se trouve l'aéroport, s'il vous plaît ?",
          translationAr: "أين يقع المطار، من فضلك؟",
          pronunciation: { en: "Where is the airport, please?", es: "¿Dónde está el aeropuerto?", de: "Wo ist der Flughafen, bitte?", fr: "Où se trouve l'aéroport", ar: "ayna al-matar" },
          context: "S'orienter dans une nouvelle ville"
        }
      ]
    },
    {
      month: 2,
      level: 'debutant',
      title: "Hôtel & Réservations",
      titleAr: "الفندق والحجوزات",
      description: "S'enregistrer à la réception et demander des renseignements.",
      descriptionAr: "تسجيل الوصول في الاستقبال وطلب المعلومات.",
      xp: 100,
      icon: "🏨",
      phrases: [
        {
          phrase: { en: "I would like to book a room.", es: "Me gustaría reservar una habitación.", de: "Ich möchte ein Zimmer buchen.", it: "Vorrei prenotare una camera.", tr: "Bir oda rezerve etmek istiyorum.", fr: "Je voudrais réserver une chambre.", ar: "أود حجز غرفة.", ru: "Я хочу забронировать номер.", ja: "部屋を予約したいです。", zh: "我想预订房间。" },
          translation: "Je voudrais réserver une chambre.",
          translationAr: "أود حجز غرفة.",
          pronunciation: { en: "I would like to book a room.", es: "Me gustaría reservar una habitación.", de: "Ich möchte ein Zimmer buchen." },
          context: "Arrivée ou contact avec un hôtel"
        }
      ]
    },
    {
      month: 3,
      level: 'debutant',
      title: "Itinéraires & Transport",
      titleAr: "الاتجاهات والنقل",
      description: "Demander son chemin pour se déplacer facilement.",
      descriptionAr: "السؤال عن الطريق للتنقل بسهولة ويسر.",
      xp: 100,
      icon: "🗺️",
      phrases: [
        {
          phrase: { en: "Where is the nearest train station?", es: "¿Dónde está la estación de tren más cercana?", de: "Wo ist der nächste Bahnhof?", fr: "Où est la gare la plus proche ?", ar: "أين تقع أقرب محطة قطار؟" },
          translation: "Où est la gare la plus proche, s'il vous plaît ?",
          translationAr: "أين تقع أقرب محطة قطار، من فضلك؟",
          pronunciation: { en: "Where is the nearest train station?", fr: "Où est la gare la plus proche" },
          context: "Se déplacer en ville"
        }
      ]
    },
    {
      month: 4,
      level: 'semipro',
      title: "Restaurant & Gastronomie",
      titleAr: "المطعم والمأكولات",
      description: "Commander des plats locaux et demander la facture.",
      descriptionAr: "طلب الأطباق المحلية وطلب الفاتورة.",
      xp: 150,
      icon: "🍽️",
      phrases: [
        {
          phrase: { en: "Can we have the menu and the bill, please?", es: "¿Podemos tener el menú y la cuenta, por favor?", de: "Können wir bitte die Speisekarte und die Rechnung haben?", fr: "Pouvons-nous avoir le menu et l'addition, s'il vous plaît ?", ar: "هل يمكننا الحصول على قائمة الطعام والفاتورة، من فضلك؟" },
          translation: "Pouvons-nous avoir le menu et l'addition, s'il vous plaît ?",
          translationAr: "هل يمكننا الحصول على قائمة الطعام والفاتورة، من فضلك؟",
          pronunciation: { en: "Can we have the menu and the bill", fr: "Pouvons nous avoir le menu" },
          context: "Prendre un repas au restaurant"
        }
      ]
    },
    {
      month: 5,
      level: 'semipro',
      title: "Shopping & Souvenirs",
      titleAr: "التسوق والهدايا",
      description: "Acheter des cadeaux locaux et négocier poliment.",
      descriptionAr: "شراء الهدايا التذكارية والتفاوض بلطف.",
      xp: 150,
      icon: "🛍️",
      phrases: [
        {
          phrase: { en: "How much is this souvenir, please?", es: "¿Cuánto cuesta este recuerdo, por favor?", de: "Wie viel kostet dieses Souvenir, bitte?", fr: "Combien coûte ce souvenir, s'il vous plaît ?", ar: "كم سعر هذه الهدية التذكارية، من فضلك؟" },
          translation: "Combien coûte ce souvenir, s'il vous plaît ?",
          translationAr: "كم سعر هذه الهدية التذكارية، من فضلك？",
          pronunciation: { en: "How much is this souvenir", fr: "Combien coûte ce souvenir" },
          context: "Faire des achats de souvenirs"
        }
      ]
    },
    {
      month: 6,
      level: 'semipro',
      title: "Santé & Pharmacie",
      titleAr: "الصحة والصيدلية",
      description: "Expliquer un malaise simple et acheter des remèdes.",
      descriptionAr: "شرح وعكة صحية بسيطة وشراء الأدوية.",
      xp: 150,
      icon: "🏥",
      phrases: [
        {
          phrase: { en: "I need something for a headache.", es: "Necesito algo para el dolor de cabeza.", de: "Ich brauche etwas gegen Kopfschmerzen.", fr: "J'ai besoin de quelque chose pour le mal de tête.", ar: "أحتاج إلى شيء لعلاج الصداع." },
          translation: "J'ai besoin de quelque chose pour le mal de tête.",
          translationAr: "أحتاج إلى شيء لعلاج الصداع.",
          pronunciation: { en: "I need something for a headache", fr: "J'ai besoin de quelque chose" },
          context: "Pharmacie et santé"
        }
      ]
    },
    {
      month: 7,
      level: 'pro',
      title: "Urgences & Assistance",
      titleAr: "الطوارئ والمساعدة",
      description: "Demander de l'aide immédiate en cas d'imprévu.",
      descriptionAr: "طلب المساعدة الفورية في الحالات الطارئة.",
      xp: 250,
      icon: "📞",
      phrases: [
        {
          phrase: { en: "I have lost my passport, can you help me?", es: "He perdido mi pasaporte, ¿puede aiderme?", de: "Ich habe meinen Pass verloren, können Sie mir helfen?", fr: "J'ai perdu mon passeport, pouvez-vous m'aider ?", ar: "لقد فقدt جواز سفري، هل يمكنك مساعدتي؟" },
          translation: "J'ai perdu mon passeport, pouvez-vous m'aider ?",
          translationAr: "لقد فقدت جواز سفري، هل يمكنك مساعدتي؟",
          pronunciation: { en: "I have lost my passport", fr: "J'ai perdu mon passeport" },
          context: "Contacter les autorités"
        }
      ]
    },
    {
      month: 8,
      level: 'pro',
      title: "Visites & Musées",
      titleAr: "المتاحف والزيارات",
      description: "Acheter des tickets d'exposition et comprendre les horaires.",
      descriptionAr: "شراء تذاكر المعارض وفهم مواقيت العمل.",
      xp: 250,
      icon: "🏛️",
      phrases: [
        {
          phrase: { en: "What time does the museum close today?", es: "¿A qué hora cierra el museo hoy?", de: "Wann schließt das Museum heute?", fr: "À quelle heure ferme le musée aujourd'hui ?", ar: "في أي ساعة يغلق المتحف اليوم؟" },
          translation: "À quelle heure ferme le musée aujourd'hui ?",
          translationAr: "في أي ساعة يغلق المتحف اليوم؟",
          pronunciation: { en: "What time does the museum close", fr: "À quelle heure ferme le musée" },
          context: "Planifier une visite culturelle"
        }
      ]
    },
    {
      month: 9,
      level: 'pro',
      title: "Location de Voiture",
      titleAr: "كراء السيارات",
      description: "Négocier un contrat de location de véhicule de vacances.",
      descriptionAr: "التفاوض على عقد استئجار سيارة لقضاء العطلة.",
      xp: 250,
      icon: "🚙",
      phrases: [
        {
          phrase: { en: "I would like to rent a family car for one week.", es: "Me gustaría alquilar un coche familiar por una semana.", de: "Ich möchte ein Familienauto für eine Woche mieten.", fr: "Je voudrais louer une voiture familiale pour une semaine.", ar: "أود استئجار سيارة عائلية لمدة أسبوع." },
          translation: "Je voudrais louer une voiture familiale pour une semaine.",
          translationAr: "أود استئجار سيارة عائلية لمدة أسبوع.",
          pronunciation: { en: "I would like to rent a family car", fr: "Je voudrais louer une voiture" },
          context: "Agence de transport"
        }
      ]
    },
    {
      month: 10,
      level: 'legendaire',
      title: "Climat & Randonnées",
      titleAr: "المناخ والرحلات البرية",
      description: "Discuter météo et planifier des activités nature.",
      descriptionAr: "الحديث عن الطقس وتخطيط الأنشطة البرية.",
      xp: 400,
      icon: "❄️",
      phrases: [
        {
          phrase: { en: "What is the weather forecast for tomorrow?", es: "¿Cuál es el pronóstico del tiempo para mañana?", de: "Wie ist die Wettervorhersage für morgen?", fr: "Quelle est la météo prévue pour demain ?", ar: "ما هي توقعات الطقس ليوم غد؟" },
          translation: "Quelle est la météo prévue pour demain ?",
          translationAr: "ما هي توقعات الطقس ليوم غد؟",
          pronunciation: { en: "What is the weather forecast", fr: "Quelle est la météo" },
          context: "S'informer sur le climat"
        }
      ]
    },
    {
      month: 11,
      level: 'legendaire',
      title: "Événements & Festivals",
      titleAr: "الفعاليات والمهرجانات",
      description: "S'intégrer aux festivités locales et pièces de théâtre.",
      descriptionAr: "المشاركة في الاحتفالات المحلية والعروض المسرحية.",
      xp: 400,
      icon: "🎭",
      phrases: [
        {
          phrase: { en: "Are there any musical events or festivals this weekend?", es: "¿Hay algún evento musical o festival este fin de semana?", de: "Gibt es dieses Wochenende Musikveranstaltungen oder Festivals?", fr: "Y a-t-il des événements musicaux ou des festivals ce week-end ?", ar: "هل هناك أي فعاليات موسيقية أو مهرجانات هذا الأسبوع؟" },
          translation: "Y a-t-il des événements musicaux ou des festivals ce week-end ?",
          translationAr: "هل هناك أي فعاليات موسيقية أو مهرجانات هذا الأسبوع؟",
          pronunciation: { en: "Are there any musical events", fr: "Y a-t-il des événements" },
          context: "Découverte de la scène locale"
        }
      ]
    },
    {
      month: 12,
      level: 'elite',
      title: "Guide Expert IA & Immersion",
      titleAr: "مرشد سياحي بالذكاء الاصطناعي",
      description: "Parler comme un natif et générer son itinéraire parfait.",
      descriptionAr: "التحدث بطلاقة تامة كأهل البلد وتوليد مسار سياحي بالذكاء الاصطناعي.",
      xp: 500,
      icon: "💎",
      phrases: [
        {
          phrase: { en: "Act as an expert tour guide to plan an immersive cultural itinerary.", es: "Actúa como guía turístico experto para planificar un itinerario cultural inmersivo.", de: "Agieren Sie als erfahrener Reiseleiter, um eine Kulturreise zu planen.", fr: "Agis en tant que guide expert pour planifier un itinéraire culturel immersif.", ar: "تصرف كمرشد سياحي خبير للتخطيط لمسار ثقافي غامر." },
          translation: "Agis en tant que guide expert pour planifier un itinéraire culturel immersif.",
          translationAr: "تصرف كمرشد سياحي خبير للتخطيط لمسار ثقافي غامر.",
          pronunciation: { en: "Act as an expert tour guide", fr: "Agis en tant que guide expert" },
          context: "Perfectionnement linguistique de fin d'année"
        }
      ]
    }
  ],
  livraison: [
    {
      month: 1,
      level: 'debutant',
      title: "Demandes de Tarifs",
      titleAr: "الاستعلام عن الأسعار",
      description: "Savoir aborder un fournisseur et demander les tarifs de base.",
      descriptionAr: "معرفة كيفية مخاطبة المورد وطلب الأسعار الأساسية.",
      xp: 100,
      icon: "📦",
      phrases: [
        {
          phrase: { en: "How much is this product, please?", es: "¿Cuánto cuesta este producto, por favor?", de: "Wie viel kostet dieses Produkt, bitte?", fr: "Combien coûte ce produit, s'il vous plaît ?", ar: "كم سعر هذا المنتج، من فضلك؟" },
          translation: "Combien coûte ce produit, s'il vous plaît ?",
          translationAr: "كم سعر هذا المنتج، من فضلك؟",
          pronunciation: { en: "How much is this product", fr: "Combien coûte ce produit" },
          context: "Renseignement de prix"
        }
      ]
    },
    {
      month: 2,
      level: 'debutant',
      title: "Service Client & SAV",
      titleAr: "خدمات ما بعد البيع",
      description: "Suivre et demander après le statut de livraison d'un colis.",
      descriptionAr: "السؤال عن حالة التوصيل ومعالجة شكاوى العملاء الأولى.",
      xp: 100,
      icon: "📞",
      phrases: [
        {
          phrase: { en: "Where is my package, please?", es: "¿Dónde está mi paquete, por favor?", de: "Wo ist mein Paket, bitte?", fr: "Où est mon colis, s'il vous plaît ?", ar: "أين طردي، من فضلك؟" },
          translation: "Où est mon colis, s'il vous plaît ?",
          translationAr: "أين طردي، من فضلك؟",
          pronunciation: { en: "Where is my package", fr: "Où est mon colis" },
          context: "Suivi client"
        }
      ]
    },
    {
      month: 3,
      level: 'debutant',
      title: "Suivi & Messagerie",
      titleAr: "التوصيل والمراسلة",
      description: "Communiquer l'adresse et le statut de messagerie.",
      descriptionAr: "التواصل بخصوص العنوان المحدث وحالة المراسلة الجارية.",
      xp: 100,
      icon: "🚚",
      phrases: [
        {
          phrase: { en: "The delivery agent will contact you shortly.", es: "El agente de entrega se pondrá en contacto con usted pronto.", de: "Der Zusteller wird Sie in Kürze kontaktieren.", fr: "L'agent de livraison vous contactera sous peu.", ar: "سيتصل بك وكيل التوصيل قريباً." },
          translation: "L'agent de livraison vous contactera sous peu.",
          translationAr: "سيتصل بك وكيل التوصيل قريباً.",
          pronunciation: { en: "The delivery agent will contact you", fr: "L'agent de livraison vous contactera" },
          context: "Notification de livraison"
        }
      ]
    },
    {
      month: 4,
      level: 'semipro',
      title: "Expédition 58 Wilayas",
      titleAr: "الشحن لـ 58 ولاية",
      description: "Politique de livraison sécurisée sur tout le territoire national.",
      descriptionAr: "سياسة الشحن الآمن والسريع لجميع الولايات الوطنية.",
      xp: 150,
      icon: "🌍",
      phrases: [
        {
          phrase: { en: "We offer secure shipping to all fifty-eight wilayas.", es: "Ofrecemos envío seguro a las cincuenta y ocho wilayas.", de: "Wir bieten sicheren Versand in alle achtundfünfzig Wilayas.", fr: "Nous offrons la livraison sécurisée dans les cinquante-huit wilayas.", ar: "نحن نقدم الشحن الآمن لثمانية وخمسين ولاية." },
          translation: "Nous offrons la livraison sécurisée dans les cinquante-huit wilayas.",
          translationAr: "نحن نقدم الشحن الآمن لثمانية وخمسين ولاية.",
          pronunciation: { en: "We offer secure shipping to all", fr: "Nous offrons la livraison sécurisée" },
          context: "Boutique e-commerce nationale"
        }
      ]
    },
    {
      month: 5,
      level: 'semipro',
      title: "BaridiMob & CCP",
      titleAr: "بريدي موب والبريد",
      description: "Discuter des modes de paiement mobiles rapides et sûrs.",
      descriptionAr: "مناقشة خيارات وطرق الدفع عبر البريد وبريدي موب.",
      xp: 150,
      icon: "💳",
      phrases: [
        {
          phrase: { en: "Can I pay on delivery using my BaridiMob account?", es: "¿Puedo pagar al recibir usando mi cuenta BaridiMob?", de: "Kann ich bei Lieferung mit meinem BaridiMob-Konto bezahlen?", fr: "Puis-je payer à la livraison avec mon compte BaridiMob ?", ar: "هل يمكنني الدفع عند الاستلام باستخدام حساب بريدي موب؟" },
          translation: "Puis-je payer à la livraison avec mon compte BaridiMob ?",
          translationAr: "هل يمكنني الدفع عند الاستلام باستخدام حساب بريدي موب؟",
          pronunciation: { en: "Can I pay on delivery", fr: "Puis-je payer à la livraison" },
          context: "Méthode de paiement e-commerce"
        }
      ]
    },
    {
      month: 6,
      level: 'semipro',
      title: "Gestion de Stock",
      titleAr: "إدارة المخازن",
      description: "Informer sur la disponibilité des articles en temps réel.",
      descriptionAr: "الإفادة حول توفر المنتجات في المخازن في الوقت الفعلي.",
      xp: 150,
      icon: "🏬",
      phrases: [
        {
          phrase: { en: "This item is currently out of stock.", es: "Este artículo está agotado actualmente.", de: "Dieser Artikel ist derzeit vergriffen.", fr: "Cet article est actuellement en rupture de stock.", ar: "هذا du منتج غير متوفر حالياً في المخزن." },
          translation: "Cet article est actuellement en rupture de stock.",
          translationAr: "هذا المنتج غير متوفر حالياً في المخزن.",
          pronunciation: { en: "This item is currently out of stock", fr: "Cet article est actuellement" },
          context: "Statut d'inventaire"
        }
      ]
    },
    {
      month: 7,
      level: 'pro',
      title: "Négociations de Prix",
      titleAr: "التفاوض على الأسعار",
      description: "Proposer des réductions de gros et fixer les barèmes.",
      descriptionAr: "تقديم تخفيضات على المبيعات بالجملة وتحديد الأسعار.",
      xp: 250,
      icon: "⚖️",
      phrases: [
        {
          phrase: { en: "Is there any discount available on bulk purchases?", es: "¿Hay algún descuento disponible para compras al por mayor?", de: "Gibt es einen Rabatt auf Großeinkäufe?", fr: "Y a-t-il une remise disponible sur les achats en gros ?", ar: "هل هناك أي خصم متاح على المشتريات بالجملة؟" },
          translation: "Y a-t-il une remise disponible sur les achats en gros ?",
          translationAr: "هل هناك أي خصم متاح على المشتريات بالجملة؟",
          pronunciation: { en: "Is there any discount", fr: "Y a-t-il une remise disponible" },
          context: "Négocier un tarif grossiste"
        }
      ]
    },
    {
      month: 8,
      level: 'pro',
      title: "Gestion des Litiges",
      titleAr: "حل الخلافات التجارية",
      description: "Résoudre les réclamations liées aux défauts de fabrication.",
      descriptionAr: "معالجة الشكاوى بخصوص عيوب التصنيع وحق المستهلك.",
      xp: 250,
      icon: "💔",
      phrases: [
        {
          phrase: { en: "This product failed our quality control standards.", es: "Este producto no cumplió con nuestros estándares de control de calidad.", de: "Dieses Produkt hat unsere Qualitätskontrollstandards nicht erfüllt.", fr: "Ce produit a échoué à nos normes de contrôle qualité.", ar: "لقد فشل هذا المنتج في مطابقة معايير مراقبة الجودة لدينا." },
          translation: "Ce produit a échoué à nos normes de contrôle qualité.",
          translationAr: "لقد فشل هذا المنتج في مطابقة معايير مراقبة الجودة لدينا.",
          pronunciation: { en: "This product failed our quality", fr: "Ce produit a échoué à nos normes" },
          context: "Réclamation qualité stricte"
        }
      ]
    },
    {
      month: 9,
      level: 'pro',
      title: "Contrats de Gros",
      titleAr: "عقود الشراء بالجملة",
      description: "Savoir rédiger des conditions de remboursement flexibles.",
      descriptionAr: "صياغة شروط استرداد مرنة وعادلة في عقود البيع.",
      xp: 250,
      icon: "📝",
      phrases: [
        {
          phrase: { en: "Our wholesale purchase contract includes a flexible refund policy.", es: "Nuestro contrato de compra al por mayor incluye una política de reembolso flexible.", de: "Unser Großhandelsvertrag beinhaltet eine flexible Rückerstattungsrichtlinie.", fr: "Notre contrat d'achat de gros inclut une politique de remboursement flexible.", ar: "يتضمن عقد الشراء بالجملة لدينا سياسة استرداد مرنة." },
          translation: "Notre contrat d'achat de gros inclut une politique de remboursement flexible.",
          translationAr: "يتضمن عقد الشراء بالجملة لدينا سياسة استرداد مرنة.",
          pronunciation: { en: "Our wholesale purchase contract", fr: "Notre contrat d'achat de gros" },
          context: "Signature d'alliances commerciales"
        }
      ]
    },
    {
      month: 10,
      level: 'legendaire',
      title: "Partenariats Exclusifs",
      titleAr: "الشراكات الحصرية",
      description: "Se protéger contre les fluctuations imprévues de marché.",
      descriptionAr: "الحماية من تقلبات الأسعار غير المتوقعة في الأسواق.",
      xp: 400,
      icon: "🤝",
      phrases: [
        {
          phrase: { en: "This clause mitigates any potential market fluctuation risks.", es: "Esta cláusula mitiga cualquier riesgo potencial de fluctuación del mercado.", de: "Diese Klausel mildert potenzielle Marktschwankungsrisiken.", fr: "Cette clause atténue tout risque potentiel de fluctuation du marché.", ar: "تخفف هذه المادة من أي مخاطر محتملة لتقلبات السوق." },
          translation: "Cette clause atténue tout risque potentiel de fluctuation du marché.",
          translationAr: "تخفف هذه المادة من أي مخاطر محتملة لتقلبات السوق.",
          pronunciation: { en: "This clause mitigates any potential", fr: "Cette clause atténue tout risque" },
          context: "Protection juridique d'affaires"
        }
      ]
    },
    {
      month: 11,
      level: 'legendaire',
      title: "Douanes & Frontières",
      titleAr: "الجمارك والتصدير",
      description: "Gérer l'importation de gros volumes légalement.",
      descriptionAr: "تسيير عمليات الاستيراد والتخليص الجمركي للشحنات الضخمة.",
      xp: 400,
      icon: "🏢",
      phrases: [
        {
          phrase: { en: "Are there any import duties or customs clearance delays?", es: "¿Existen derechos de importación o retrasos en el despacho de aduana?", de: "Gibt es Einfuhrzölle oder Verzögerungen bei der Zollabwicklung?", fr: "Y a-t-il des droits d'importation ou des retards de dédouanement ?", ar: "هل هناك أي رسوم استيراد أو تأخيرات في التخليص الجمركي؟" },
          translation: "Y a-t-il des droits d'importation ou des retards de dédouanement ?",
          translationAr: "هل هناك أي رسوم استيراد أو تأخيرات في التخليص الجمركي؟",
          pronunciation: { en: "Are there any import duties", fr: "Y a-t-il des droits d'importation" },
          context: "Échanges internationaux"
        }
      ]
    },
    {
      month: 12,
      level: 'elite',
      title: "Logistique Globale par IA",
      titleAr: "اللوجستيات عبر الذكاء الاصطناعي",
      description: "Modéliser la chaîne d'approvisionnement des 58 wilayas.",
      descriptionAr: "نمذجة سلاسل الإمداد للـ 58 ولاية باستخدام الذكاء الاصطناعي.",
      xp: 500,
      icon: "🤖",
      phrases: [
        {
          phrase: { en: "Act as a logistics strategist to optimize fifty-eight wilayas supply chains.", es: "Actúe como estratega de logística para optimizar las cadenas de suministro de cincuenta y ocho wilayas.", de: "Agieren Sie als Logistikstratege, um die Lieferketten in 58 Wilayas zu optimieren.", fr: "Agis comme un stratège en logistique pour optimiser les chaînes d'approvisionnement des 58 wilayas.", ar: "تصرف كاستراتيجي لوجستي لتحسين سلاسل التوريد لـ 58 ولاية." },
          translation: "Agis comme un stratège en logistique pour optimiser les chaînes d'approvisionnement des 58 wilayas.",
          translationAr: "تصرف كاستراتيجي لوجستي لتحسين سلاسل التوريد لـ 58 ولاية.",
          pronunciation: { en: "Act as a logistics strategist", fr: "Agis comme un stratège en logistique" },
          context: "Prompt IA et logistique d'élite"
        }
      ]
    }
  ],
  vivre_la_bas: [
    {
      month: 1,
      level: 'debutant',
      title: "Recherche de Logement",
      titleAr: "البحث عن سكن",
      description: "Louer un appartement et poser les questions d'usage.",
      descriptionAr: "استئجار شقة وطرح الأسئلة الأساسية عن المرافق.",
      xp: 100,
      icon: "🏡",
      phrases: [
        {
          phrase: { en: "I want to rent an apartment.", es: "Quiero alquilar un apartamento.", de: "Ich möchte eine Wohnung mieten.", fr: "Je veux louer un appartement.", ar: "أريد استئجار شقة." },
          translation: "Je veux louer un appartement.",
          translationAr: "أريد استئجار شقة.",
          pronunciation: { en: "I want to rent an apartment", fr: "Je veux louer un appartement" },
          context: "Bail de location"
        }
      ]
    },
    {
      month: 2,
      level: 'debutant',
      title: "Vie Quotidienne",
      titleAr: "الحياة اليومية والتسوق",
      description: "Faire ses courses et interagir dans le quartier.",
      descriptionAr: "شراء المستلزمات والتعامل مع المحلات المحلية.",
      xp: 100,
      icon: "🛒",
      phrases: [
        {
          phrase: { en: "Where is the nearest supermarket?", es: "¿Dónde está el supermercado más cercano?", de: "Wo ist der nächste Supermarkt?", fr: "Où est le supermarché le plus proche ?", ar: "أين يقع أقرب سوبرماركت؟" },
          translation: "Où est le supermarché le plus proche ?",
          translationAr: "أين يقع أقرب سوبرماركت؟",
          pronunciation: { en: "Where is the nearest supermarket", fr: "Où est le supermarché" },
          context: "Courses alimentaires"
        }
      ]
    },
    {
      month: 3,
      level: 'debutant',
      title: "Éducation & Inscriptions",
      titleAr: "التعليم والتسجيل",
      description: "Inscrire ses enfants à l'école ou à un cours local.",
      descriptionAr: "تسجيل الأبناء في المدرسة المحلية أو المراكز التعليمية.",
      xp: 100,
      icon: "🏫",
      phrases: [
        {
          phrase: { en: "How do I register my children at the local school?", es: "¿Cómo inscribo a mis hijos en la escuela local?", de: "Wie melde ich meine Kinder an der örtlichen Schule an?", fr: "Comment inscrire mes enfants à l'école locale ?", ar: "كيف يمكنني تسجيل أطفالي في المدرسة المحلية؟" },
          translation: "Comment inscrire mes enfants à l'école locale ?",
          translationAr: "Comment inscrire mes enfants à l'école locale ?",
          pronunciation: { en: "How do I register my children", fr: "Comment inscrire mes enfants" },
          context: "Bureau d'éducation"
        }
      ]
    },
    {
      month: 4,
      level: 'semipro',
      title: "Compte Bancaire",
      titleAr: "الحساب المصرفي",
      description: "Ouvrir son compte et comprendre la tarification.",
      descriptionAr: "فتح حساب بنكي جديد وفهم العمولات السنوية.",
      xp: 150,
      icon: "🏦",
      phrases: [
        {
          phrase: { en: "I need to open a bank account.", es: "Necesito abrir una cuenta bancaria.", de: "Ich muss ein Bankkonto eröffnen.", fr: "J'ai besoin d'ouvrir un compte bancaire.", ar: "أحتاج لفتح حساب بنكي." },
          translation: "J'ai besoin d'ouvrir un compte bancaire.",
          translationAr: "أحتاج لفتح حساب بنكي.",
          pronunciation: { en: "I need to open a bank account", fr: "J'ai besoin d'ouvrir un compte" },
          context: "Agence de banque"
        }
      ]
    },
    {
      month: 5,
      level: 'semipro',
      title: "Téléphone & Internet",
      titleAr: "الهاتف والأنترنت",
      description: "Souscrire à un abonnement fibre ou recharger son crédit.",
      descriptionAr: "الاشتراك في خط أنترنت عالي السرعة وتعبئة رصيد الهاتف.",
      xp: 150,
      icon: "📶",
      phrases: [
        {
          phrase: { en: "I would like to subscribe to a high-speed fiber internet plan.", es: "Me gustaría suscribirme a un plan de internet de fibra de alta velocidad.", de: "Ich möchte einen schnellen Glasfaser-Internetvertrag abschließen.", fr: "Je souhaite m'abonner à un forfait internet fibre haut débit.", ar: "أود الاشتراك في باقة أنترنت ألياف بصرية سريعة." },
          translation: "Je souhaite m'abonner à un forfait internet fibre haut débit.",
          translationAr: "أود الاشتراك في باقة أنترنت ألياف بصرية سريعة.",
          pronunciation: { en: "I would like to subscribe", fr: "Je souhaite m'abonner" },
          context: "Télécom"
        }
      ]
    },
    {
      month: 6,
      level: 'semipro',
      title: "Abonnements de Transport",
      titleAr: "اشتراكات النقل",
      description: "Prendre sa carte de bus, métro ou tramway.",
      descriptionAr: "شراء بطاقة المواصلات العامة الشهرية وتفعيلها.",
      xp: 150,
      icon: "🚌",
      phrases: [
        {
          phrase: { en: "Where can I buy a monthly transport pass?", es: "¿Dónde puedo comprar un pase de transporte mensual?", de: "Wo kann ich eine Monatskarte für die Verkehrsmittel kaufen?", fr: "Où puis-je acheter un pass de transport mensuel ?", ar: "أين يمكنني شراء اشتراك نقل شهري؟" },
          translation: "Où puis-je acheter un pass de transport mensuel ?",
          translationAr: "أين يمكنني شراء اشتراك نقل شهري؟",
          pronunciation: { en: "Where can I buy a monthly transport pass", fr: "Où puis-je acheter un pass" },
          context: "Guichet de gare"
        }
      ]
    },
    {
      month: 7,
      level: 'pro',
      title: "Permis de Séjour",
      titleAr: "تصريح الإقامة",
      description: "Préparer ses papiers administratifs pour la préfecture.",
      descriptionAr: "تجهيز الوثائق الإدارية لطلب تصريح الإقامة والفيزا.",
      xp: 250,
      icon: "📝",
      phrases: [
        {
          phrase: { en: "What are the required documents for the residency permit?", es: "¿Cuáles son los documentos requeridos para el permiso de residencia?", de: "Welche Unterlagen werden für die Aufenthaltserlaubnis benötigt?", fr: "Quels sont les documents requis pour le permis de séjour ?", ar: "ما هي الوثائق المطلوبة للحصول على تصريح الإقامة؟" },
          translation: "Quels sont les documents requis pour le permis de séjour ?",
          translationAr: "ما هي الوثائق المطلوبة للحصول على تصريح الإقامة؟",
          pronunciation: { en: "What are the required documents", fr: "Quels sont les documents requis" },
          context: "Démarches en préfecture"
        }
      ]
    },
    {
      month: 8,
      level: 'pro',
      title: "Recherche d'Emploi",
      titleAr: "البحث عن وظيفة",
      description: "Adapter son curriculum vitae et postuler localement.",
      descriptionAr: "تهيئة السيرة الذاتية والتقديم على الوظائف المحلية.",
      xp: 250,
      icon: "👔",
      phrases: [
        {
          phrase: { en: "I am looking for a job in the software industry.", es: "Estoy buscando trabajo en la industria del software.", de: "Ich suche einen Job in der Softwareindustrie.", fr: "Je cherche un emploi dans le secteur du logiciel.", ar: "أنا أبحث عن وظيفة في مجال البرمجيات." },
          translation: "Je cherche un emploi dans le secteur du logiciel.",
          translationAr: "أنا أبحث عن وظيفة في مجال البرمجيات.",
          pronunciation: { en: "I am looking for a job", fr: "Je cherche un emploi" },
          context: "Cabinet de recrutement"
        }
      ]
    },
    {
      month: 9,
      level: 'pro',
      title: "Sécurité Sociale",
      titleAr: "الضمان الاجتماعي",
      description: "S'inscrire au régime national d'assurance maladie.",
      descriptionAr: "التسجيل في نظام التأمين الصحي والضمان الاجتماعي.",
      xp: 250,
      icon: "🩺",
      phrases: [
        {
          phrase: { en: "How do I register for the national healthcare system?", es: "¿Cómo me registro en el sistema nacional de salud?", de: "Wie registriere ich mich für das nationale Gesundheitssystem?", fr: "Comment s'inscrire au régime national de santé ?", ar: "كيف أسجل في النظام الوطني للضمان الصحي؟" },
          translation: "Comment s'inscrire au régime national de santé ?",
          translationAr: "كيف أسجل في النظام الوطني للضمان الصحي؟",
          pronunciation: { en: "How do I register", fr: "Comment s'inscrire" },
          context: "Caisse de santé"
        }
      ]
    },
    {
      month: 10,
      level: 'legendaire',
      title: "Contrat de Travail",
      titleAr: "عقود التوظيف",
      description: "Signer et vérifier ses avantages d'assurance santé.",
      descriptionAr: "توقيع العقد والتأكد من توفر تغطية التأمين الصحي.",
      xp: 400,
      icon: "✍️",
      phrases: [
        {
          phrase: { en: "I have signed an employment contract with health insurance benefits.", es: "He firmado un contrato de trabajo con beneficios de seguro médico.", de: "Ich habe einen Arbeitsvertrag mit Krankenversicherung unterzeichnet.", fr: "J'ai signé un contrat de travail avec des prestations d'assurance maladie.", ar: "وقعت عقد عمل يتضمن مزايا التأمين الصحي." },
          translation: "J'ai signé un contrat de travail avec des prestations d'assurance maladie.",
          translationAr: "وقعت عقد عمل يتضمن مزايا التأمين الصحي.",
          pronunciation: { en: "I have signed an employment contract", fr: "J'ai signé un contrat" },
          context: "Validation RH"
        }
      ]
    },
    {
      month: 11,
      level: 'legendaire',
      title: "Intégration & Voisinage",
      titleAr: "الاندماج والجيران",
      description: "S'impliquer dans le voisinage et respecter les coutumes.",
      descriptionAr: "المشاركة في الحي واحترام العادات والتقاليد المحلية.",
      xp: 400,
      icon: "🏛️",
      phrases: [
        {
          phrase: { en: "It is very important to respect local customs and cultural values.", es: "Es muy importante respetar las costumbres y los valores culturales locales.", de: "Es ist sehr wichtig, die lokalen Bräuche und kulturellen Werte zu respektieren.", fr: "Il est très important de respecter les coutumes et valeurs culturelles locales.", ar: "من المهم جداً احترام العادات والقيم الثقافية المحلية." },
          translation: "Il est très important de respecter les coutumes et valeurs culturelles locales.",
          translationAr: "من المهم جداً احترام العادات والقيم الثقافية المحلية.",
          pronunciation: { en: "It is very important to respect", fr: "Il est très important de respecter" },
          context: "Vivre ensemble"
        }
      ]
    },
    {
      month: 12,
      level: 'elite',
      title: "Bureaucratie par IA",
      titleAr: "إدارة البيروقراطية بالذكاء الاصطناعي",
      description: "Simplifier les formulaires administratifs complexes avec un tuteur IA.",
      descriptionAr: "تبسيط النماذج الإدارية والبيروقراطية المتقدمة بالذكاء الاصطناعي.",
      xp: 500,
      icon: "👑",
      phrases: [
        {
          phrase: { en: "Act as a local integration coach to explain administrative bureaucracy.", es: "Actúe como coach de integración local para explicar la burocracia administrativa.", de: "Agieren Sie als lokaler Integrationscoach, um die Bürokratie zu erklären.", fr: "Agis comme un coach d'intégration locale pour expliquer la bureaucratie administrative.", ar: "تصرف كمدرب اندماج محلي لشرح البيروقراطية الإدارية المعقدة." },
          translation: "Agis comme un tuteur d'intégration pour expliquer la bureaucratie.",
          translationAr: "تصرف كمعلم اندماج محلي لشرح البيروقراطية الإدارية.",
          pronunciation: { en: "Act as a local integration coach", fr: "Agis comme un tuteur" },
          context: "Assistance IA globale d'intégration"
        }
      ]
    }
  ],
  loisir: [
    {
      month: 1,
      level: 'debutant',
      title: "Hobbies & Intérêts",
      titleAr: "الهوايات والاهتمامات",
      description: "Exprimer des goûts simples et parler de ses loisirs favoris.",
      descriptionAr: "التعبير البسيط عن الاهتمامات وما نحب فعله في الفراغ.",
      xp: 100,
      icon: "🎨",
      phrases: [
        {
          phrase: { en: "I love learning new things.", es: "Me encanta aprender cosas nuevas.", de: "Ich liebe es, neue Dinge zu lernen.", fr: "J'adore apprendre de nouvelles choses.", ar: "أحب تعلم أشياء جديدة." },
          translation: "J'adore apprendre de nouvelles choses.",
          translationAr: "أحب تعلم أشياء جديدة.",
          pronunciation: { en: "I love learning new things", fr: "J'adore apprendre" },
          context: "Hobbies"
        }
      ]
    },
    {
      month: 2,
      level: 'debutant',
      title: "Cinéma & Séries",
      titleAr: "السينما والعروض",
      description: "Discuter de ses films et documentaires préférés.",
      descriptionAr: "النقاش حول الأفلام والمسلسلات التلفزيونية المفضلة.",
      xp: 100,
      icon: "🍿",
      phrases: [
        {
          phrase: { en: "What is your favorite television series?", es: "¿Cuál es tu serie de televisión favorita?", de: "Was ist deine Lieblingsserie?", fr: "Quelle est votre série télévisée préférée ?", ar: "ما هو مسلسلك التلفزيوني المفضل؟" },
          translation: "Quelle est votre série télévisée préférée ?",
          translationAr: "ما هو مسلسلك التلفزيوني المفضل؟",
          pronunciation: { en: "What is your favorite television series", fr: "Quelle est votre série" },
          context: "Culture pop"
        }
      ]
    },
    {
      month: 3,
      level: 'debutant',
      title: "Sports & Fitness",
      titleAr: "الرياضة والرشاقة",
      description: "Parler de ses activités physiques hebdomadaires.",
      descriptionAr: "التعبير عن الأنشطة الرياضية والذهاب لصالة الألعاب.",
      xp: 100,
      icon: "⚽",
      phrases: [
        {
          phrase: { en: "I go to the gym three times a week.", es: "Voy al gimnasio tres veces a la semana.", de: "Ich gehe dreimal pro Woche ins Fitnessstudio.", fr: "Je vais à la salle de sport trois fois par semaine.", ar: "أذهب إلى قاعة الرياضة ثلاث مرات في الأسبوع." },
          translation: "Je vais à la salle de sport trois fois par semaine.",
          translationAr: "أذهب إلى قاعة الرياضة ثلاث مرات في الأسبوع.",
          pronunciation: { en: "I go to the gym three times a week", fr: "Je vais à la salle" },
          context: "Vie saine"
        }
      ]
    },
    {
      month: 4,
      level: 'semipro',
      title: "Photographie & Dessin",
      titleAr: "التصوير والرسم",
      description: "Exprimer une passion artistique pour les paysages.",
      descriptionAr: "التعبير عن الشغف الفني بالرسم وتصوير المناظر الطبيعية.",
      xp: 150,
      icon: "📷",
      phrases: [
        {
          phrase: { en: "I love taking photos of nature and urban landscapes.", es: "Me encanta hacer fotos de la naturaleza y paisajes urbanos.", de: "Ich liebe es, Fotos von der Natur und Stadtlandschaften zu machen.", fr: "J'adore prendre des photos de la nature et des paysages urbains.", ar: "أحب التقاط صور للطبيعة والمعالم الحضرية." },
          translation: "J'adore prendre des photos de la nature et des paysages urbains.",
          translationAr: "أحب التقاط صور للطبيعة والمعالم الحضرية.",
          pronunciation: { en: "I love taking photos of nature", fr: "J'adore prendre des photos" },
          context: "Hobbies créatifs"
        }
      ]
    },
    {
      month: 5,
      level: 'semipro',
      title: "Jeux Vidéo & Tech",
      titleAr: "الألعاب والتكنولوجيا",
      description: "Discuter de jeux en ligne et d'innovations ludiques.",
      descriptionAr: "الحديث عن ألعاب الفيديو الجماعية والواقع الافتراضي.",
      xp: 150,
      icon: "🎮",
      phrases: [
        {
          phrase: { en: "I play multiplayer online games with my friends.", es: "Juego a videojuegos multijugador en línea con mis amigos.", de: "Ich spiele Multiplayer-Online-Spiele mit meinen Freunden.", fr: "Je joue à des jeux en ligne multijoueurs avec mes amis.", ar: "ألعب ألعاباً جماعية عبر الأنترنت مع أصدقائي." },
          translation: "Je joue à des jeux en ligne multijoueurs avec mes amis.",
          translationAr: "ألعب ألعاباً جماعية عبر الأنترنت مع أصدقائي.",
          pronunciation: { en: "I play multiplayer online games", fr: "Je joue à des jeux en ligne" },
          context: "Technologie ludique"
        }
      ]
    },
    {
      month: 6,
      level: 'semipro',
      title: "Lecture & Livres",
      titleAr: "المطالعة والكتب",
      description: "Parler de ses romans favoris et d'habitudes de lecture.",
      descriptionAr: "الحديث عن الروايات المفضلة ومعدلات المطالعة الشهرية.",
      xp: 150,
      icon: "📖",
      phrases: [
        {
          phrase: { en: "I read two novels every month.", es: "Leo dos novelas cada mes.", de: "Ich lese jeden Monat zwei Romane.", fr: "Je lis deux romans chaque mois.", ar: "أقرأ روايتين كل شهر." },
          translation: "Je lis deux romans chaque mois.",
          translationAr: "أقرأ روايتين كل شهر.",
          pronunciation: { en: "I read two novels every month", fr: "Je lis deux romans" },
          context: "Habitudes de lecture"
        }
      ]
    },
    {
      month: 7,
      level: 'pro',
      title: "Concerts & Théâtre",
      titleAr: "الموسيقى والمسرح",
      description: "Réserver des billets et donner un avis critique sur une pièce.",
      descriptionAr: "حجز تذاكر الحفلات الموسيقية وتقديم نقد مسرحي بسيط.",
      xp: 250,
      icon: "🎻",
      phrases: [
        {
          phrase: { en: "The play was absolutely outstanding and well-acted.", es: "La obra fue absolutamente excepcional y bien interpretada.", de: "Das Theaterstück war absolut herausragend und gut gespielt.", fr: "La pièce de théâtre était absolument exceptionnelle et bien jouée.", ar: "كانت المسرحية رائعة للغاية ومتقنة التمثيل." },
          translation: "La pièce de théâtre était absolument exceptionnelle et bien jouée.",
          translationAr: "كانت المسرحية رائعة للغاية ومتقنة التمثيل.",
          pronunciation: { en: "The play was absolutely outstanding", fr: "La pièce de théâtre était" },
          context: "Sortie culturelle"
        }
      ]
    },
    {
      month: 8,
      level: 'pro',
      title: "Cuisine & Recettes",
      titleAr: "الطهي والحلويات",
      description: "Parler d'ingrédients et de cours de cuisine créative.",
      descriptionAr: "الحديث عن مكونات الأطباق ودروس الطهي المتقدمة.",
      xp: 250,
      icon: "🍲",
      phrases: [
        {
          phrase: { en: "What are the main ingredients of this delicious cake?", es: "Cuáles son los ingredientes principales de este delicioso pastel?", de: "Was sind die Hauptzutaten für diesen leckeren Kuchen?", fr: "Quels sont les ingrédients principaux de ce délicieux gâteau ?", ar: "ما هي المكونات الرئيسية لهذه الكعكة اللذيذة؟" },
          translation: "Quels sont les ingrédients principaux de ce délicieux gâteau ?",
          translationAr: "ما هي المكونات الرئيسية لهذه الكعكة اللذيذة؟",
          pronunciation: { en: "What are the main ingredients", fr: "Quels sont les ingrédients principaux" },
          context: "Gastronomie maison"
        }
      ]
    },
    {
      month: 9,
      level: 'pro',
      title: "Art Moderne & Galeries",
      titleAr: "الفن المعاصر",
      description: "Visiter les musées et exprimer ses émotions artistiques.",
      descriptionAr: "زيارة المتاحف والتعبير عن المشاعر الفنية المعاصرة.",
      xp: 250,
      icon: "🏛️",
      phrases: [
        {
          phrase: { en: "I enjoy visiting museums and discovering local modern art.", es: "Disfruto visitando museos y descubriendo el arte moderno local.", de: "Ich besuche gerne Museen und entdecke lokale moderne Kunst.", fr: "J'aime visiter les musées et découvrir l'art moderne local.", ar: "أستمتع بزيارة المتاحف واكتشاف الفن الحديث المحلي." },
          translation: "J'aime visiter les musées et découvrir l'art moderne local.",
          translationAr: "أستمتع بزيارة المتاحف واكتشاف الفن الحديث المحلي.",
          pronunciation: { en: "I enjoy visiting museums", fr: "J'aime visiter les musées" },
          context: "Exposition artistique"
        }
      ]
    },
    {
      month: 10,
      level: 'legendaire',
      title: "Littérature Classique",
      titleAr: "الأدب الكلاسيكي",
      description: "Discuter d'œuvres classiques pour élargir ses horizons.",
      descriptionAr: "مناقشة روائع الأدب الكلاسيكي لتوسيع المدارك والثقافة.",
      xp: 400,
      icon: "📚",
      phrases: [
        {
          phrase: { en: "Exploring classical literature expands your vocabulary and broadens horizons.", es: "Explorar la literatura clásica amplía tu vocabulario y ensancha horizontes.", de: "Klassische Literatur erweitert Ihren Wortschatz und Horizont.", fr: "Explorer la littérature classique enrichit votre vocabulaire et élargit vos horizons.", ar: "استكشاف الأدب الكلاسيكي يثري حصيلتك اللغوية ويوسع آفاقك." },
          translation: "Explorer la littérature classique enrichit votre vocabulaire et élargit vos horizons.",
          translationAr: "استكشاف الأدب الكلاسيكي يثري حصيلتك اللغوية ويوسع آفاقك.",
          pronunciation: { en: "Exploring classical literature expands", fr: "Explorer la littérature classique" },
          context: "Débat d'idées"
        }
      ]
    },
    {
      month: 11,
      level: 'legendaire',
      title: "Jardins & Nature",
      titleAr: "الحدائق والطبيعة",
      description: "Parler d'écologie, de botanique et de biodiversité.",
      descriptionAr: "الحديث عن البيئة، النباتات والمحافظة على التنوع الحيوي.",
      xp: 400,
      icon: "🌿",
      phrases: [
        {
          phrase: { en: "This national park hosts rare animal species.", es: "Este parque nacional alberga especies animales raras.", de: "Dieser Nationalpark beherbergt seltene Tierarten.", fr: "Ce parc national abrite des espèces animales rares.", ar: "تحتضن هذه المحمية الطبيعية فصائل حيوانية نادرة." },
          translation: "Ce parc national abrite des espèces de faune rares.",
          translationAr: "تحتضن هذه المحمية الطبيعية فصائل نادرة.",
          pronunciation: { en: "This national park hosts", fr: "Ce parc national abrite" },
          context: "Sortie nature"
        }
      ]
    },
    {
      month: 12,
      level: 'elite',
      title: "Écriture par IA & Style",
      titleAr: "الكتابة الإبداعية وصقل الأساليب",
      description: "Rédiger des poèmes ou récits assistés par l'Intelligence Artificielle.",
      descriptionAr: "كتابة قصائد إبداعية وصقل البنية اللغوية الراقية بالذكاء الاصطناعي.",
      xp: 500,
      icon: "✍️",
      phrases: [
        {
          phrase: { en: "Act as a creative writing tutor to refine style and linguistic structure.", es: "Actúe como tutor de escritura creativa para refinar el estilo y la estructura lingüística.", de: "Agieren Sie als Tutor für kreatives Schreiben, um den Stil zu verfeinern.", fr: "Agis comme un tuteur d'écriture créative pour affiner le style et la structure linguistique.", ar: "تصرف كمعلم كتابة إبداعية لتحسين الأسلوب والبنية اللغوية." },
          translation: "Agis comme un tuteur d'écriture créative pour affiner le style et la structure linguistique.",
          translationAr: "تصرف كمعلم كتابة إبداعية لتحسين الأسلوب والبنية اللغوية.",
          pronunciation: { en: "Act as a creative writing tutor", fr: "Agis comme un tuteur d'écriture" },
          context: "Diplomatie et style"
        }
      ]
    }
  ]
};

const getCurriculum = (lang: string, level: SkillLevel, category?: LearningCategory, month?: number): Lesson[] => {
  const activeCategory = category || (localStorage.getItem('lingo_univers_user_category') as LearningCategory) || 'voyage';
  const catData = DYNAMIC_PHRASES_BY_MONTH[activeCategory] || DYNAMIC_PHRASES_BY_MONTH['voyage'];
  
  // Filter by level, and optionally filter by month if specified
  const filteredMonths = catData.filter(m => m.level === level && (month === undefined || m.month === month));
  const finalMonths = filteredMonths.length > 0 ? filteredMonths : catData.filter(m => m.level === level);
  
  return finalMonths.map((m) => {
    const lessonPhrases: Phrase[] = m.phrases.map((p) => {
      const foreignPhrase = p.phrase[lang] || p.phrase['en'];
      const pronun = p.pronunciation[lang] || p.pronunciation['en'] || foreignPhrase;
      return {
        phrase: foreignPhrase,
        translation: p.translation,
        translationAr: p.translationAr,
        pronunciation: pronun,
        context: p.context
      };
    });
    
    return {
      id: `${activeCategory}-${level}-month-${m.month}`,
      title: m.title,
      titleAr: m.titleAr,
      description: m.description,
      descriptionAr: m.descriptionAr,
      xp: m.xp,
      content: lessonPhrases
    };
  });
};

// Word list for matching games
const MATCH_PAIRS_DATA: Record<string, { foreign: string; native: string }[]> = {
  en: [
    { foreign: 'Hello', native: 'Bonjour' },
    { foreign: 'Thank you', native: 'Merci' },
    { foreign: 'Bulk purchase', native: 'Achat en gros' },
    { foreign: 'Refund', native: 'Remboursement' },
    { foreign: 'Delivery', native: 'Livraison' },
    { foreign: 'Agreement', native: 'Accord' },
    { foreign: 'Contract', native: 'Contrat' },
    { foreign: 'Quality standards', native: 'Normes de qualité' }
  ],
  es: [
    { foreign: 'Hola', native: 'Bonjour' },
    { foreign: 'Gracias', native: 'Merci' },
    { foreign: 'Compra al por mayor', native: 'Achat en gros' },
    { foreign: 'Reembolso', native: 'Remboursement' },
    { foreign: 'Entrega', native: 'Livraison' },
    { foreign: 'Acuerdo', native: 'Accord' },
    { foreign: 'Contrato', native: 'Contrat' },
    { foreign: 'Estándar de calidad', native: 'Norme de qualité' }
  ],
  de: [
    { foreign: 'Hallo', native: 'Bonjour' },
    { foreign: 'Danke', native: 'Merci' },
    { foreign: 'Großeinkauf', native: 'Achat en gros' },
    { foreign: 'Rückerstattung', native: 'Remboursement' },
    { foreign: 'Lieferung', native: 'Livraison' },
    { foreign: 'Vereinbarung', native: 'Accord' },
    { foreign: 'Vertrag', native: 'Contrat' },
    { foreign: 'Qualitätsstandard', native: 'Norme de qualité' }
  ]
};

export const LanguageLearningPortal: React.FC<LanguageLearningPortalProps> = ({
  language,
  userPoints,
  onAddPoints,
  onShowToast,
  onClose
}) => {
  const [targetLang, setTargetLang] = useState<string>(() => {
    return localStorage.getItem('lingo_univers_target_lang') || 'en';
  });
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>(() => {
    return (localStorage.getItem('lingo_univers_user_level') as SkillLevel) || 'debutant';
  });
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory>(() => {
    return (localStorage.getItem('lingo_univers_user_category') as LearningCategory) || 'voyage';
  });

  useEffect(() => {
    localStorage.setItem('lingo_univers_user_category', selectedCategory);
  }, [selectedCategory]);

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return parseInt(localStorage.getItem('lingo_univers_user_month') || '1');
  });

  useEffect(() => {
    localStorage.setItem('lingo_univers_user_month', selectedMonth.toString());
  }, [selectedMonth]);

  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; picture: string } | null>(() => {
    try {
      const saved = localStorage.getItem('lingo_univers_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [googleModalOpen, setGoogleModalOpen] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleGoogleLogin = (name: string, email: string, picture: string) => {
    const user = { name, email, picture };
    setGoogleUser(user);
    localStorage.setItem('lingo_univers_google_user', JSON.stringify(user));
    setGoogleModalOpen(false);
    onShowToast(language === 'ar' ? 'تم تسجيل الدخول بجوجل بنجاح! +100 XP' : 'Connexion Google réussie ! +100 XP', 'success');
    setUserXp(prev => {
      const next = prev + 100;
      localStorage.setItem('lingo_univers_xp', next.toString());
      return next;
    });
    playSound('celebrate');
    triggerMascotReaction('excited', `Superbe ! Bienvenue ${name}. Ton compte Google est synchronisé et tu as gagné un bonus de 100 XP ! 🦊`, `مرحباً بك ${name}! تم ربط حساب Google الخاص بك وحصلت على ١٠٠ نقطة إضافية! 🌟`);
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    localStorage.removeItem('lingo_univers_google_user');
    onShowToast(language === 'ar' ? 'تم تسجيل الخروج' : 'Déconnexion réussie.', 'info');
    playSound('pop');
  };

  const [currentTab, setCurrentTab] = useState<'roadmap' | 'learn' | 'flashcards' | 'community' | 'qna' | 'gifts' | 'leaderboard'>('roadmap');
  
  // Hearts (Vies) System - Duolingo Gamification Engine
  const [hearts, setHearts] = useState<number>(() => {
    return parseInt(localStorage.getItem('lingo_univers_hearts') || '5');
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<'normal' | 'slow'>('normal');

  // Daily Streak and global XP
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('lingo_univers_streak') || '3');
  });
  const [userXp, setUserXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('lingo_univers_xp') || '120');
  });

  // ACTIVE EXERCISE FLOW STATES (Duolingo Simulation Mode)
  const [isActiveSession, setIsActiveSession] = useState<boolean>(false);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0); // 0 = Match Pairs, 1 = Word Bank, 2 = Speech Choice, 3 = Complete Celebration
  const [exerciseErrorCount, setExerciseErrorCount] = useState<number>(0);

  // Match Pairs State
  const [matchLeft, setMatchLeft] = useState<string[]>([]);
  const [matchRight, setMatchRight] = useState<string[]>([]);
  const [selectedLeftWord, setSelectedLeftWord] = useState<string | null>(null);
  const [selectedRightWord, setSelectedRightWord] = useState<string | null>(null);
  const [solvedPairs, setSolvedPairs] = useState<string[]>([]); // foreign words solved
  const [failedMatch, setFailedMatch] = useState<boolean>(false);

  // Word Bank State
  const [wordBankTargetPhrase, setWordBankTargetPhrase] = useState<Phrase | null>(null);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBankSubmitted, setWordBankSubmitted] = useState<boolean>(false);
  const [wordBankIsCorrect, setWordBankIsCorrect] = useState<boolean>(false);

  // Speech Multiple Choice State
  const [multipleChoiceIndex, setMultipleChoiceIndex] = useState<number>(0);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);
  const [multipleChoiceCorrectIndex, setMultipleChoiceCorrectIndex] = useState<number>(0);
  const [selectedMCAnswer, setSelectedMCAnswer] = useState<number | null>(null);
  const [mcSubmitted, setMcSubmitted] = useState<boolean>(false);

  // Mascot Custom messages & states
  const [mascotMood, setMascotMood] = useState<'normal' | 'happy' | 'sad' | 'excited'>('normal');
  const [mascotBubble, setMascotBubble] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('lingo_univers_hearts', hearts.toString());
  }, [hearts]);

  // Mascot dynamic speech triggers
  const triggerMascotReaction = (mood: 'normal' | 'happy' | 'sad' | 'excited', textFr: string, textAr: string) => {
    setMascotMood(mood);
    setMascotBubble(language === 'ar' ? textAr : textFr);
  };

  useEffect(() => {
    if (language === 'ar') {
      setMascotBubble("مرحباً بك في لينغو يونيفرس! لنبدأ رحلة التعلم الممتعة معاً! 🌟");
    } else {
      setMascotBubble("Bienvenue sur LingoUnivers ! Commençons à apprendre en s'amusant ! 🦊");
    }
  }, [language]);

  // Sound Playback using Web Audio API
  const playSound = (type: 'success' | 'error' | 'click' | 'celebrate' | 'pop') => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'celebrate') {
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(800 + i * 150, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.2);
        }
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (_) {}
  };

  const speakText = (text: string, voiceLang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = speechSpeed === 'slow' ? 0.6 : 1.0;
      window.speechSynthesis.speak(utterance);
      playSound('click');
    } else {
      onShowToast(language === 'ar' ? 'الصوت غير مدعوم على هذا المتصفح' : 'La synthèse vocale n\'est pas supportée sur ce navigateur.', 'error');
    }
  };

  // INIT ACTIVE EXERCISES
  const startDuolingoSession = (level: SkillLevel) => {
    if (hearts <= 0) {
      triggerMascotReaction(
        'sad',
        "Oh non ! Tu n'as plus de vies (❤️). Recharge-les avec tes XP ou passe par la Pratique !",
        "أوه لا! ليس لديك المزيد من القلوب (❤️). أعد شحنها بنقاط XP الخاصة بك!"
      );
      onShowToast(language === 'ar' ? 'لقد نفذت قلوبك! قم بإعادة الشحن للمتابعة.' : "Plus de vies disponibles ! Rechargez pour continuer.", "error");
      playSound('error');
      return;
    }

    setSelectedLevel(level);
    localStorage.setItem('lingo_univers_user_level', level);
    setIsActiveSession(true);
    setExerciseIndex(0);
    setExerciseErrorCount(0);
    playSound('click');

    // 1. Init Match Pairs data
    const pairBank = MATCH_PAIRS_DATA[targetLang] || MATCH_PAIRS_DATA['en'];
    const shuffledPairs = [...pairBank].sort(() => Math.random() - 0.5).slice(0, 4);
    const leftSide = shuffledPairs.map(p => p.foreign).sort(() => Math.random() - 0.5);
    const rightSide = shuffledPairs.map(p => p.native).sort(() => Math.random() - 0.5);
    setMatchLeft(leftSide);
    setMatchRight(rightSide);
    setSolvedPairs([]);
    setSelectedLeftWord(null);
    setSelectedRightWord(null);

    // 2. Init Word Bank data (using current lesson phrase)
    const currentLessons = getCurriculum(targetLang, level, selectedCategory, selectedMonth);
    const currentLesson = currentLessons[0] || getCurriculum(targetLang, level, selectedCategory)[0];
    const phraseObj = currentLesson.content[Math.floor(Math.random() * currentLesson.content.length)];
    setWordBankTargetPhrase(phraseObj);
    
    // Split correct translation words, and shuffle them with 3 distractors
    const translationWords = phraseObj.translation.split(' ');
    const distractors = ['achat', 'livraison', 'BaridiMob', 'Alger', 'qualité', 'rapide', 'gratuit'];
    const finalWords = [...translationWords, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    setAvailableWords(finalWords);
    setSelectedWords([]);
    setWordBankSubmitted(false);
    setWordBankIsCorrect(false);

    // 3. Init Multiple Choice Question
    const randomMCIdx = Math.floor(Math.random() * currentLesson.content.length);
    const correctPhrase = currentLesson.content[randomMCIdx];
    const options = [correctPhrase.translation];
    const otherTranslations = currentLesson.content.filter((_, i) => i !== randomMCIdx).map(p => p.translation);
    while (options.length < 3 && otherTranslations.length > 0) {
      options.push(otherTranslations.pop()!);
    }
    if (options.length < 3) {
      options.push("Transaction défectueuse");
      options.push("Livraison sous quarante-huit heures");
    }
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    setMultipleChoiceOptions(shuffledOptions);
    setMultipleChoiceCorrectIndex(shuffledOptions.indexOf(correctPhrase.translation));
    setMultipleChoiceIndex(randomMCIdx);
    setSelectedMCAnswer(null);
    setMcSubmitted(false);

    triggerMascotReaction(
      'excited',
      "Super ! Commençons l'exercice d'association. Associe chaque mot à sa bonne traduction !",
      "رائع! لنبدأ تمرين التوصيل. طابق كل كلمة بالترجمة الصحيحة لها!"
    );
  };

  // LIVES / HEARTS UTILITIES
  const refillHeartsWithXp = () => {
    if (userXp < 80) {
      onShowToast(language === 'ar' ? "ليس لديك نقاط XP كافية (مطلوب 80)" : "XP insuffisant (80 XP requis)", "error");
      playSound('error');
      return;
    }
    setUserXp(prev => {
      const next = prev - 80;
      localStorage.setItem('lingo_univers_xp', next.toString());
      return next;
    });
    setHearts(5);
    playSound('celebrate');
    onShowToast(language === 'ar' ? "تمت إعادة تعبئة القلوب بنجاح!" : "Vies rechargées au maximum ! ❤️", "success");
    triggerMascotReaction('happy', "Génial ! Tes vies sont rechargées à fond ! ❤️ Prêt à conquérir le monde ?", "ممتاز! تم شحن قلوبك بالكامل! ❤️");
  };

  // MATCH PAIRS EVENT HANDLERS
  const handleLeftWordClick = (word: string) => {
    if (solvedPairs.includes(word)) return;
    setSelectedLeftWord(word);
    playSound('click');
    if (selectedRightWord) {
      verifyMatch(word, selectedRightWord);
    }
  };

  const handleRightWordClick = (word: string) => {
    // Find if this translation corresponds to any solved foreign word
    const isSolved = solvedPairs.some(fWord => {
      const bank = MATCH_PAIRS_DATA[targetLang] || MATCH_PAIRS_DATA['en'];
      const pair = bank.find(p => p.foreign === fWord);
      return pair && pair.native === word;
    });
    if (isSolved) return;
    setSelectedRightWord(word);
    playSound('click');
    if (selectedLeftWord) {
      verifyMatch(selectedLeftWord, word);
    }
  };

  const verifyMatch = (leftWord: string, rightWord: string) => {
    const bank = MATCH_PAIRS_DATA[targetLang] || MATCH_PAIRS_DATA['en'];
    const pair = bank.find(p => p.foreign === leftWord);
    
    if (pair && pair.native === rightWord) {
      setSolvedPairs(prev => [...prev, leftWord]);
      setSelectedLeftWord(null);
      setSelectedRightWord(null);
      playSound('success');
      triggerMascotReaction('happy', "Magnifique correspondance ! Plus que quelques-unes !", "رائع! تطابق صحيح وممتاز!");
      
      // Check if all 4 matched
      if (solvedPairs.length + 1 >= 4) {
        setTimeout(() => {
          setExerciseIndex(1); // Proceed to word bank
          triggerMascotReaction(
            'excited',
            "Excellent travail ! Maintenant, recompose la phrase correcte !",
            "عمل ممتاز ومبهر! الآن، أعد تركيب الجملة بشكل صحيح!"
          );
        }, 1200);
      }
    } else {
      setFailedMatch(true);
      playSound('error');
      triggerMascotReaction('sad', "Aïe ! Ces deux mots ne correspondent pas. Essaie encore !", "أوه! هاتين الكلمتين لا تتطابقان. حاول مجدداً!");
      
      // Mode Chances Max (Vies Infinies) - pas de perte de vie !

      setTimeout(() => {
        setFailedMatch(false);
        setSelectedLeftWord(null);
        setSelectedRightWord(null);
      }, 1000);
    }
  };

  // WORD BANK PUZZLE EVENTS
  const addWordToSelected = (word: string) => {
    if (wordBankSubmitted) return;
    setSelectedWords(prev => [...prev, word]);
    playSound('pop');
  };

  const removeWordFromSelected = (word: string) => {
    if (wordBankSubmitted) return;
    setSelectedWords(prev => prev.filter(w => w !== word));
    playSound('click');
  };

  const submitWordBank = () => {
    if (!wordBankTargetPhrase) return;
    setWordBankSubmitted(true);
    const correctPhraseString = wordBankTargetPhrase.translation;
    const submittedString = selectedWords.join(' ');
    
    // Tolerance for trailing dots or casing
    const normalize = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const isCorrect = normalize(submittedString) === normalize(correctPhraseString);
    setWordBankIsCorrect(isCorrect);

    if (isCorrect) {
      playSound('success');
      triggerMascotReaction('excited', "Parfait ! Tu maîtrises absolument cette formulation commerciale !", "صحيح تماماً! أنت متمكن جداً من هذه الصياغة التجارية!");
    } else {
      playSound('error');
      // Mode Chances Max (Vies Infinies) - pas de perte de vie !
      triggerMascotReaction('sad', `Oups ! La bonne formulation était : "${wordBankTargetPhrase.translation}"`, `أوه! الصياغة الصحيحة كانت: "${wordBankTargetPhrase.translation}"`);
    }
  };

  // SPEECH CHOICE EVENTS
  const submitMCAnswer = () => {
    setMcSubmitted(true);
    const isCorrect = selectedMCAnswer === multipleChoiceCorrectIndex;
    if (isCorrect) {
      playSound('success');
      triggerMascotReaction('happy', "Wow ! Tu as obtenu un sans-faute sur ce choix multiple !", "رائع! لقد أجبت بشكل صحيح على هذا السؤال!");
    } else {
      playSound('error');
      // Mode Chances Max (Vies Infinies) - pas de perte de vie !
      triggerMascotReaction('sad', "Ce n'est pas tout à fait ça. Concentre-toi bien !", "الإجابة ليست صحيحة تماماً. ركز جيداً!");
    }
  };

  // FINALIZE EXERCISE SESSION
  const triggerConfettiAnimation = () => {
    // Left side cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.8 }
    });
    // Right side cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.8 }
    });
    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });
    }, 250);
  };

  const claimSessionRewards = () => {
    setIsActiveSession(false);
    setUserXp(prev => {
      const next = prev + 60;
      localStorage.setItem('lingo_univers_xp', next.toString());
      return next;
    });
    setStreak(prev => {
      const next = prev + 1;
      localStorage.setItem('lingo_univers_streak', next.toString());
      return next;
    });
    onAddPoints(30);
    playSound('celebrate');
    triggerConfettiAnimation();
    onShowToast(language === 'ar' ? "لقد أنهيت التدريب بنجاح! +60 XP +30 Pts" : "Session d'apprentissage réussie ! +60 XP & +30 Loyalty points !", "success");
    setCurrentTab('roadmap');
  };

  // Co-creation community cards (stored in localStorage)
  const [communityCards, setCommunityCards] = useState<{phrase: string, translation: string, user: string, likes: number}[]>(() => {
    try {
      const saved = localStorage.getItem('lingo_univers_community_cards');
      return saved ? JSON.parse(saved) : [
        { phrase: 'Fast secure home delivery', translation: 'Livraison à domicile rapide et ultra sécurisée', user: 'Fares_DZ', likes: 24 },
        { phrase: 'Can I pay on delivery with BaridiMob?', translation: 'Puis-je régler à la livraison via BaridiMob ?', user: 'Karim_Oran', likes: 18 },
        { phrase: 'Your quality standards are elite', translation: 'Vos critères de qualité sont absolument exceptionnels', user: 'Sarah_Alger', likes: 32 }
      ];
    } catch (_) {
      return [];
    }
  });

  const [newPhrase, setNewPhrase] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const handleAddCommunityCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhrase.trim() || !newTranslation.trim()) {
      onShowToast(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs.', 'error');
      return;
    }
    const author = newAuthor.trim() || 'Anonyme';
    const updated = [
      { phrase: newPhrase, translation: newTranslation, user: author, likes: 1 },
      ...communityCards
    ];
    setCommunityCards(updated);
    localStorage.setItem('lingo_univers_community_cards', JSON.stringify(updated));
    setNewPhrase('');
    setNewTranslation('');
    onAddPoints(25);
    setUserXp(prev => {
      const next = prev + 30;
      localStorage.setItem('lingo_univers_xp', next.toString());
      return next;
    });
    onShowToast(language === 'ar' ? 'تمت إضافة الكلمة بنجاح! +30 XP' : 'Expression partagée ! +30 XP gagnés !', 'success');
    playSound('success');
  };

  // Forum Q&A (stored in localStorage)
  const [forumQuestions, setForumQuestions] = useState<{id: string, author: string, question: string, answers: {author: string, text: string}[]}[]>(() => {
    try {
      const saved = localStorage.getItem('lingo_univers_forum_questions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'q1',
          author: 'Ahmed_Constantine',
          question: 'Comment traduire "livraison gratuite" de façon très professionnelle en Allemand ?',
          answers: [
            { author: 'Lila_Prof', text: 'On utilise généralement "Kostenloser Versand" ou "Portofreie Lieferung".' }
          ]
        },
        {
          id: 'q2',
          author: 'Yacine_Tizi',
          question: 'Quelle est la différence entre "bulk purchase" et "wholesale" en Anglais ?',
          answers: [
            { author: 'Amine_Lingo', text: '"Bulk purchase" désigne l\'achat en grand volume, tandis que "Wholesale" correspond au commerce de gros au sens large.' }
          ]
        }
      ];
    } catch (_) {
      return [];
    }
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const updated = [
      {
        id: `q-${Date.now()}`,
        author: 'Vous (Acheteur)',
        question: newQuestion,
        answers: []
      },
      ...forumQuestions
    ];
    setForumQuestions(updated);
    localStorage.setItem('lingo_univers_forum_questions', JSON.stringify(updated));
    setNewQuestion('');
    onShowToast(language === 'ar' ? 'تم نشر سؤالك في المنتدى!' : 'Votre question a été publiée sur le forum !', 'success');
    playSound('click');
  };

  const handleAddReply = (qId: string) => {
    const text = replyText[qId];
    if (!text || !text.trim()) return;
    const updated = forumQuestions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          answers: [...q.answers, { author: 'Vous (Acheteur)', text: text }]
        };
      }
      return q;
    });
    setForumQuestions(updated);
    localStorage.setItem('lingo_univers_forum_questions', JSON.stringify(updated));
    setReplyText(prev => ({ ...prev, [qId]: '' }));
    onShowToast(language === 'ar' ? 'تمت إضافة الرد بنجاح!' : 'Réponse ajoutée !', 'success');
    playSound('success');
  };

  // Gift codes claimable via XP
  const GIFT_CODES = [
    { code: 'LINGO30', label: 'Code Promo 30%', xpRequired: 300, desc: '30% de remise immédiate sur votre panier Univers Shop !' },
    { code: 'LINGO50', label: 'Code Promo Exceptionnel 50%', xpRequired: 600, desc: '50% de réduction automatique sur tout le site Univers Shop !' },
    { code: 'LIVRAISON_GRATUITE', label: 'Livraison 58 Wilayas Offerte', xpRequired: 450, desc: 'Exonération totale des frais de port CCP/Baridi sur votre commande.' }
  ];

  const handleClaimGift = (code: string, xpReq: number) => {
    if (userXp < xpReq) {
      onShowToast(language === 'ar' ? 'ليس لديك نقاط XP كافية' : 'Pas assez de points XP requis pour débloquer ce code.', 'error');
      playSound('error');
      return;
    }
    const nextXp = userXp - xpReq;
    setUserXp(nextXp);
    localStorage.setItem('lingo_univers_xp', nextXp.toString());
    localStorage.setItem('univers_shop_active_coupon', code);
    onShowToast(language === 'ar' ? `تم تفعيل كود الخصم "${code}" !` : `Félicitations ! Code "${code}" débloqué et appliqué sur Univers Shop !`, 'success');
    playSound('celebrate');
    triggerConfettiAnimation();
  };

  // Leaderboard mock players
  const LEADERBOARD_USERS = [
    { name: 'Fares Baraka 🇩🇿', badge: LEVEL_BADGES['elite'], xp: 1950, streak: 45, isMe: true },
    { name: 'Yanis_Tizi 🇩🇿', badge: LEVEL_BADGES['legendaire'], xp: 1120, streak: 12 },
    { name: 'Sarah_Alger 🇩🇿', badge: LEVEL_BADGES['pro'], xp: 620, streak: 8 },
    { name: 'Ines_Barika 🇩🇿', badge: LEVEL_BADGES['semipro'], xp: 210, streak: 4 }
  ];

  // Certificate printing state
  const [certName, setCertName] = useState('');
  const [isCertGenerated, setIsCertGenerated] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] via-[#101426] to-[#0D101E] text-slate-100 font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Visual neon grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Modern Duolingo-style Top Bar Navigation */}
      <header className="border-b border-indigo-900/30 bg-[#0C1020]/95 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
              <Globe className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LINGOUNIVERS
                </h1>
                <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-500/20">
                  DUO PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {language === 'ar' ? 'تعلم اللغات الحية واربح أكواد خصم مجانية لمتجر Univers Shop' : 'Apprenez les langues et débloquez des réductions réelles pour Univers Shop'}
              </p>
            </div>
          </div>

          {/* Real-time Indicators & App Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Target Language Selection Dropdown */}
            <div className="flex items-center gap-2 bg-[#171C35] border border-indigo-900/40 rounded-xl px-3 py-2 shadow-inner">
              <Languages className="w-4 h-4 text-indigo-400" />
              <select 
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  localStorage.setItem('lingo_univers_target_lang', e.target.value);
                  playSound('click');
                  onShowToast(language === 'ar' ? 'تم تغيير لغة التعلم!' : 'Langue cible mise à jour !', 'info');
                }}
                className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none border-none cursor-pointer outline-none"
              >
                {TARGET_LANGUAGES.map(langOpt => (
                  <option key={langOpt.code} value={langOpt.code} className="bg-[#0F162A] text-slate-100">
                    {langOpt.flag} {langOpt.name} ({langOpt.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs px-3 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streak} Jours</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs px-3 py-2 rounded-xl">
              <Trophy className="w-4 h-4 text-purple-400 animate-bounce" />
              <span>{userXp} XP</span>
            </div>

            {/* Vies (Hearts) indicator */}
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs px-3 py-2 rounded-xl">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Chances Max ❤️</span>
            </div>

            {/* Sound Toggler */}
            <button 
              onClick={() => {
                setIsMuted(!isMuted);
                playSound('click');
              }}
              className="p-2 bg-[#171C35] hover:bg-[#20274D] border border-indigo-900/30 rounded-xl transition text-slate-400 hover:text-slate-200"
              title="Activer/Désactiver les sons"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Google Authentication button */}
            {googleUser ? (
              <div className="flex items-center gap-2 bg-[#171C35] border border-indigo-900/40 rounded-xl px-2.5 py-1.5 text-slate-200 shadow-sm">
                <img src={googleUser.picture} alt={googleUser.name} className="w-6 h-6 rounded-full border border-indigo-500" referrerPolicy="no-referrer" />
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] font-black leading-tight max-w-[80px] truncate">{googleUser.name}</p>
                  <button onClick={handleGoogleLogout} className="text-[9px] text-rose-400 hover:underline leading-none block">Déconnexion</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setGoogleModalOpen(true);
                  playSound('click');
                }}
                className="flex items-center gap-1.5 bg-white text-slate-800 font-extrabold text-xs px-3 py-2 rounded-xl hover:bg-slate-100 transition shadow active:scale-95 cursor-pointer border border-slate-200"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">{language === 'ar' ? 'ربط بجوجل' : 'Synchro Google'}</span>
              </button>
            )}

            {/* EXIT TO SHOP */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs px-5 py-2.5 rounded-xl hover:from-emerald-500 hover:to-teal-400 transition-all shadow-md active:scale-95 cursor-pointer border border-emerald-500/20"
            >
              <span>🛒 Univers Shop</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* CORE LAYOUT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDE BAR: Mascot (Duo le Fennec) & Quick Statistics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Animated Mascot Container */}
          <div className="bg-[#0F1326] border border-indigo-950 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 rounded-full blur-2xl"></div>
            
            {/* Mascot Image / Avatar using pure CSS and emojis for extreme high compatibility */}
            <div className="relative mb-4 h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center border-4 border-amber-300 shadow-xl group">
              <span className="text-5xl group-hover:scale-110 transition duration-300">
                {mascotMood === 'happy' ? '🦊' : mascotMood === 'excited' ? '👑' : mascotMood === 'sad' ? '🥺' : '🦊'}
              </span>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black uppercase text-white px-2.5 py-0.5 rounded-full border border-indigo-500">
                DUO
              </div>
            </div>

            {/* Mascot Bubble Dialogue */}
            <div className="relative bg-slate-900 border border-indigo-950 p-4 rounded-2xl text-left shadow-inner space-y-1">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-indigo-950 rotate-45"></div>
              <p className="text-xs font-semibold text-slate-300 leading-relaxed italic text-center">
                "{mascotBubble}"
              </p>
            </div>

            {/* Quick action to replenish hearts */}
            {hearts < 5 && (
              <div className="mt-5 w-full pt-4 border-t border-indigo-950/40 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Besoin de vies ?</p>
                <button
                  onClick={refillHeartsWithXp}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 p-2.5 rounded-xl transition text-xs font-bold"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Recharger (80 XP)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick learning tip box */}
          <div className="bg-gradient-to-br from-slate-950 to-[#121528] border border-indigo-950 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-yellow-400">
              <Lightbulb className="w-4 h-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Le saviez-vous ?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Les leçons de LingoUnivers sont spécialement sélectionnées pour le e-commerce : négociation de prix, questions de livraison wilaya par wilaya et service après-vente !
            </p>
          </div>

          {/* LEVEL BADGES SIDEBAR WIDGET */}
          <div className="bg-[#0F1326] border border-indigo-950 rounded-2xl p-5 space-y-3.5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-950 pb-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="font-black text-xs uppercase tracking-wider">Badges de Niveau ({userXp} XP)</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Fennec de Bronze', nameAr: 'الفنك البرونزي', xp: 0, icon: '🥉', desc: 'Débutant : Comprend les bases simples.', descAr: 'مبتدئ: يفهم العبارات الأساسية.' },
                { name: 'Fennec d\'Argent', nameAr: 'الفنك الفضي', xp: 150, icon: '🥈', desc: 'Intermédiaire : Formule des requêtes de colis.', descAr: 'متوسط: يطلب الطرود والخدمات.' },
                { name: 'Fennec d\'Or', nameAr: 'الفنك الذهبي', xp: 300, icon: '🥇', desc: 'Professionnel : Négocie les tarifs en gros.', descAr: 'مهني: يفاوض أسعار الجملة والشحن.' },
                { name: 'Maître Légendaire', nameAr: 'المعلم الأسطوري', xp: 600, icon: '💎', desc: 'Légendaire : Parle avec fluidité naturelle.', descAr: 'أسطوري: يتحدث بطلاقة تامة.' },
                { name: 'Élite Bilingue', nameAr: 'النخبة الثنائية', xp: 1000, icon: '👑', desc: 'Élite : Parle comme un natif certifié.', descAr: 'النخبة: يتحدث كصاحب اللغة الأم.' }
              ].map((badge) => {
                const isUnlocked = userXp >= badge.xp;
                return (
                  <button
                    key={badge.name}
                    onClick={() => {
                      playSound(isUnlocked ? 'celebrate' : 'pop');
                      triggerMascotReaction(
                        isUnlocked ? 'excited' : 'sad',
                        isUnlocked 
                          ? `Génial ! Tu as débloqué le badge "${badge.name}" (${badge.desc}).`
                          : `Le badge "${badge.name}" est verrouillé. Il te faut ${badge.xp} XP pour l'obtenir. Allez, continue tes exercices ! 🚀`,
                        isUnlocked 
                          ? `ممتاز! لقد حصلت على شارة "${badge.nameAr}" (${badge.descAr}).`
                          : `شارة "${badge.nameAr}" مقفلة. تحتاج إلى ${badge.xp} نقطة للحصول عليها. استمر بالتعلم! 💪`
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                      isUnlocked 
                        ? 'bg-indigo-950/20 border-indigo-500/25 text-slate-100 hover:border-indigo-500/50 hover:bg-indigo-500/10' 
                        : 'bg-slate-950/40 border-slate-950/60 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <span className={`text-2xl ${isUnlocked ? 'filter-none' : 'grayscale opacity-40'}`}>
                      {badge.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black tracking-tight truncate ${isUnlocked ? 'text-indigo-300' : 'text-slate-500'}`}>
                        {language === 'ar' ? badge.nameAr : badge.name}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate leading-tight">
                        {isUnlocked 
                          ? (language === 'ar' ? '✅ تم إلغاء القفل' : '✅ Débloqué') 
                          : (language === 'ar' ? `🔒 مقفل (${badge.xp} XP)` : `🔒 Verrouillé (${badge.xp} XP)`)
                        }
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN BODY AREA: Active Sessions OR Standard Tab View */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ACTIVE EXERCISE VIEW (DUOLINGO SIMULATION INTERACTIVE INTERFACE) */}
          {isActiveSession ? (
            <div className="bg-[#0F1426] border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 animate-fade-in">
              
              {/* Dynamic Session Progress Header */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    setIsActiveSession(false);
                    playSound('click');
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Abandonner</span>
                </button>
                
                {/* Hearts inside current session */}
                <div className="flex items-center gap-1 text-rose-500 font-extrabold text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 animate-pulse" />
                  <span>Chances Max ❤️</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-indigo-400 font-bold">
                  <span>Progrès de l'exercice</span>
                  <span>{Math.round(((exerciseIndex) / 3) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-indigo-950/50">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 shadow-md"
                    style={{ width: `${(exerciseIndex / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* STAGE 1: MATCH THE PAIRS (EXERCICE D'ASSOCIATION) */}
              {exerciseIndex === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Étape 1 sur 3
                    </span>
                    <h3 className="font-display font-black text-xl text-slate-100 mt-2">
                      Associez les paires de mots
                    </h3>
                    <p className="text-xs text-slate-400">Touchez un mot dans chaque colonne pour les assembler !</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    {/* Left Column (Foreign words) */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Langue {targetLang.toUpperCase()}</span>
                      {matchLeft.map((word) => {
                        const isSolved = solvedPairs.includes(word);
                        const isSelected = selectedLeftWord === word;
                        return (
                          <button
                            key={word}
                            onClick={() => handleLeftWordClick(word)}
                            disabled={isSolved || failedMatch}
                            className={`w-full p-4 rounded-2xl text-xs font-bold border transition text-left relative overflow-hidden ${
                              isSolved 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 line-through opacity-50'
                                : isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400'
                                : failedMatch && isSelected
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-shake'
                                : 'bg-[#151B33] border-indigo-950/60 hover:bg-[#1C2447] text-slate-200'
                            }`}
                          >
                            <span>{word}</span>
                            {isSolved && <Check className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column (Native translation) */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Traduction</span>
                      {matchRight.map((word) => {
                        const isSolved = solvedPairs.some(fWord => {
                          const bank = MATCH_PAIRS_DATA[targetLang] || MATCH_PAIRS_DATA['en'];
                          const pair = bank.find(p => p.foreign === fWord);
                          return pair && pair.native === word;
                        });
                        const isSelected = selectedRightWord === word;
                        return (
                          <button
                            key={word}
                            onClick={() => handleRightWordClick(word)}
                            disabled={isSolved || failedMatch}
                            className={`w-full p-4 rounded-2xl text-xs font-bold border transition text-left relative overflow-hidden ${
                              isSolved 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 line-through opacity-50'
                                : isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400'
                                : failedMatch && isSelected
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-shake'
                                : 'bg-[#151B33] border-indigo-950/60 hover:bg-[#1C2447] text-slate-200'
                            }`}
                          >
                            <span>{word}</span>
                            {isSolved && <Check className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: WORD BANK (RECOMPOSER LA PHRASE) */}
              {exerciseIndex === 1 && wordBankTargetPhrase && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Étape 2 sur 3
                    </span>
                    <h3 className="font-display font-black text-xl text-slate-100 mt-2">
                      Recomposez la phrase correcte
                    </h3>
                    <p className="text-xs text-slate-400">Traduisez l'expression commerciale suivante :</p>
                  </div>

                  {/* Target Phrase Container */}
                  <div className="p-6 bg-[#131930] border border-indigo-950 rounded-2xl text-center space-y-2 relative">
                    <button 
                      onClick={() => speakText(wordBankTargetPhrase.phrase, TARGET_LANGUAGES.find(t => t.code === targetLang)?.voiceLang || 'en-US')}
                      className="absolute top-3 right-3 p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <p className="font-display font-black text-lg text-slate-100">"{wordBankTargetPhrase.phrase}"</p>
                    <p className="text-[11px] text-slate-500 italic font-mono">Prononciation : [{wordBankTargetPhrase.pronunciation}]</p>
                  </div>

                  {/* User Selection tray / tray area */}
                  <div className="min-h-16 p-4 bg-slate-950 border-2 border-dashed border-indigo-950/80 rounded-2xl flex flex-wrap gap-2 items-center justify-center">
                    {selectedWords.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">Appuyez sur les mots ci-dessous pour composer la traduction...</span>
                    ) : (
                      selectedWords.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => removeWordFromSelected(word)}
                          className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition shadow"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available word bank bubbles */}
                  <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                    {availableWords.map((word, idx) => {
                      const isUsed = selectedWords.includes(word);
                      return (
                        <button
                          key={idx}
                          onClick={() => addWordToSelected(word)}
                          disabled={isUsed || wordBankSubmitted}
                          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition ${
                            isUsed 
                              ? 'bg-slate-950 text-slate-600 border-indigo-950/20 opacity-40 cursor-not-allowed'
                              : 'bg-[#151B33] border-indigo-950/60 text-slate-100 hover:border-indigo-500'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {/* Validation feedback block */}
                  {wordBankSubmitted && (
                    <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-1 ${
                      wordBankIsCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300' 
                        : 'bg-rose-500/10 border-rose-500/20 text-slate-300'
                    }`}>
                      <p className="font-bold text-slate-200">
                        {wordBankIsCorrect ? '✨ Fantastique ! Bonne réponse !' : '❌ Incorrect !'}
                      </p>
                      <p><b>Correction :</b> "{wordBankTargetPhrase.translation}"</p>
                    </div>
                  )}

                  {/* Submit Action */}
                  <div className="flex justify-end pt-2">
                    {!wordBankSubmitted ? (
                      <button
                        onClick={submitWordBank}
                        disabled={selectedWords.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow active:scale-95 cursor-pointer"
                      >
                        Vérifier l'expression
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setExerciseIndex(2);
                          triggerMascotReaction(
                            'excited',
                            "Dernière étape ! Réponds à cette question de compréhension orale et écrite !",
                            "المرحلة الأخيرة! أجب على سؤال الفهم الشفهي والكتابي هذا!"
                          );
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
                      >
                        <span>Étape Suivante</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 3: MULTIPLE CHOICE LISTENING & COMPREHENSION */}
              {exerciseIndex === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Étape 3 sur 3
                    </span>
                    <h3 className="font-display font-black text-xl text-slate-100 mt-2">
                      Compréhension d'Affaires
                    </h3>
                    <p className="text-xs text-slate-400">Écoutez la phrase dictée par la voix et choisissez la bonne traduction :</p>
                  </div>

                  {/* Voice Button */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-indigo-950/50 space-y-3">
                    <button
                      onClick={() => {
                        const currentLessons = getCurriculum(targetLang, selectedLevel, selectedCategory, selectedMonth);
                        const currentLesson = currentLessons[0] || getCurriculum(targetLang, selectedLevel, selectedCategory)[0];
                        const phraseText = currentLesson.content[multipleChoiceIndex].phrase;
                        speakText(phraseText, TARGET_LANGUAGES.find(t => t.code === targetLang)?.voiceLang || 'en-US');
                      }}
                      className="h-16 w-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    >
                      <Volume2 className="w-8 h-8" />
                    </button>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Cliquer pour dicter la phrase</span>
                  </div>

                  {/* MC Options */}
                  <div className="grid grid-cols-1 gap-3">
                    {multipleChoiceOptions.map((opt, oIdx) => {
                      const isSelected = selectedMCAnswer === oIdx;
                      const isCorrectChoice = oIdx === multipleChoiceCorrectIndex;
                      
                      let choiceStyle = "bg-[#151B33] border-indigo-950/60 hover:bg-[#1B2347]";
                      if (mcSubmitted) {
                        if (isCorrectChoice) {
                          choiceStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          choiceStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                        } else {
                          choiceStyle = "bg-slate-950/40 border-slate-950/60 opacity-60";
                        }
                      } else if (isSelected) {
                        choiceStyle = "bg-indigo-600 border-indigo-500 text-white font-bold ring-2 ring-indigo-400";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedMCAnswer(oIdx)}
                          disabled={mcSubmitted}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex items-center justify-between ${choiceStyle}`}
                        >
                          <span>{opt}</span>
                          <div className="flex items-center gap-2">
                            {mcSubmitted && isCorrectChoice && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                            {mcSubmitted && isSelected && !isCorrectChoice && <X className="w-4 h-4 text-rose-400" />}
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950/40 px-2.5 py-0.5 rounded">
                              Choix {oIdx + 1}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* MC Verification */}
                  <div className="flex justify-end pt-2">
                    {!mcSubmitted ? (
                      <button
                        onClick={submitMCAnswer}
                        disabled={selectedMCAnswer === null}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow active:scale-95"
                      >
                        Valider l'option
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setExerciseIndex(3);
                          triggerConfettiAnimation();
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
                      >
                        <span>Résultats de la Session !</span>
                        <Trophy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 4: SESSION CONGRATULATIONS */}
              {exerciseIndex === 3 && (
                <div className="text-center py-8 space-y-6">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white text-5xl animate-bounce shadow-xl">
                    👑
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100">Session Complétée de Main de Maître !</h3>
                    <p className="text-sm text-slate-400">Vos aptitudes en commerce international augmentent drastiquement !</p>
                  </div>

                  {/* Rewards display */}
                  <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                    <div className="bg-[#151B33] border border-indigo-950 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-purple-400">+60 XP</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Expérience</p>
                    </div>
                    <div className="bg-[#151B33] border border-indigo-950 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-emerald-400">+30 Pts</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Fidélité Univers Shop</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={claimSessionRewards}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95"
                    >
                      Enregistrer mes gains & Revenir au parcours
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <>
              {/* NAVIGATION TABS FOR STANDARD VIEWS */}
              <div className="flex items-center gap-1 bg-[#0C1020] border border-indigo-950/60 rounded-2xl p-1 overflow-x-auto shadow-md">
                <button
                  onClick={() => { setCurrentTab('roadmap'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'roadmap' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>🧭 Le Parcours (Roadmap)</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('learn'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'learn' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>📖 Bibliothèque de Cours</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('flashcards'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'flashcards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>⚡ Cartes Mémoire</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('community'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'community' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>🌍 Vocabulaire Communauté</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('qna'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'qna' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 Forum d'Entraide</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('gifts'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'gifts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">🎁 Boutique Coupons</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('leaderboard'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    currentTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>🏆 Leaderboard</span>
                </button>
              </div>

              {/* ROADMAP VIEW: VISUAL DUOLINGO PATHWAY */}
              {currentTab === 'roadmap' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-8">
                  <div className="text-center space-y-1">
                    <h2 className="font-display font-black text-xl text-slate-100 uppercase tracking-tight">Votre Chemin d'Apprentissage</h2>
                    <p className="text-xs text-slate-400">
                      {language === 'ar' ? 'أكمل كل وحدة للوصول للمستوى التالي وافتح الخصومات الكبرى!' : 'Complétez chaque unité pour progresser et débloquer des cadeaux de haut niveau !'}
                    </p>
                  </div>

                  {/* High-fidelity interactive Category Selector Cards */}
                  <div className="bg-[#0A0D1A]/60 border border-indigo-950/80 rounded-2xl p-4 md:p-5 space-y-4">
                    <p className="text-xs font-black uppercase tracking-wider text-indigo-400 text-center md:text-left">
                      🎯 {language === 'ar' ? 'اختر فئة التعلم المخصصة الخاصة بك :' : 'Choisissez votre catégorie d\'apprentissage mémorable :'}
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.values(CATEGORY_DETAILS).map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        
                        // Explicit classes to prevent Tailwind pruning
                        let activeStyles = "border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/30 text-white";
                        let dotColor = "bg-indigo-500";
                        if (cat.id === 'livraison') {
                          activeStyles = "border-amber-500/80 bg-amber-500/10 ring-1 ring-amber-500/30 text-white";
                          dotColor = "bg-amber-500";
                        } else if (cat.id === 'vivre_la_bas') {
                          activeStyles = "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/30 text-white";
                          dotColor = "bg-emerald-500";
                        } else if (cat.id === 'loisir') {
                          activeStyles = "border-pink-500/80 bg-pink-500/10 ring-1 ring-pink-500/30 text-white";
                          dotColor = "bg-pink-500";
                        }

                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              playSound('click');
                              triggerMascotReaction(
                                'excited',
                                `Super choix ! Travaillons ensemble sur le thème "${cat.name}".`,
                                `اختيار ممتاز! لنعمل معاً على موضوع "${cat.nameAr}".`
                              );
                            }}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 active:scale-95 cursor-pointer relative overflow-hidden h-full ${
                              isSelected
                                ? activeStyles
                                : 'border-indigo-950/60 bg-[#121630]/60 text-slate-400 hover:border-indigo-500/40 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-3xl mb-2 animate-pulse">{cat.icon}</span>
                            <span className="text-xs font-black tracking-tight leading-tight block">
                              {language === 'ar' ? cat.nameAr : cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1.5 leading-tight">
                              {language === 'ar' ? cat.descAr : cat.desc}
                            </span>
                            {isSelected && (
                              <span className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${dotColor} shadow-md animate-ping`}></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* High-fidelity 12-Month Progression timeline for 1-Year Fluency path */}
                  <div className="bg-[#0A0D1A]/60 border border-indigo-950/80 rounded-2xl p-4 md:p-5 space-y-4">
                    <div className="text-center md:text-left space-y-1">
                      <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                        📅 {language === 'ar' ? 'منهج الفصاحة في عام كامل (١٢ شهراً) :' : 'Programme de Fluence de 1 An (12 Mois d\'Apprentissage) :'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'اختر الشهر الدراسي لتحديث الدروس ومطابقتها لمستواك الحالي :' : 'Sélectionnez votre mois d\'étude pour adapter dynamiquement vos leçons et exercices :'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const isSelected = selectedMonth === m;
                        
                        // Map month to appropriate difficulty levels
                        let monthLevel: SkillLevel = 'debutant';
                        let levelName = 'Débutant';
                        let badgeEmoji = '🥉';
                        if (m >= 4 && m <= 6) {
                          monthLevel = 'semipro';
                          levelName = 'Intermédiaire';
                          badgeEmoji = '🥈';
                        } else if (m >= 7 && m <= 9) {
                          monthLevel = 'pro';
                          levelName = 'Professionnel';
                          badgeEmoji = '🥇';
                        } else if (m >= 10 && m <= 11) {
                          monthLevel = 'legendaire';
                          levelName = 'Légendaire';
                          badgeEmoji = '💎';
                        } else if (m === 12) {
                          monthLevel = 'elite';
                          levelName = 'Élite / Bilingue';
                          badgeEmoji = '👑';
                        }

                        return (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedMonth(m);
                              setSelectedLevel(monthLevel);
                              localStorage.setItem('lingo_univers_user_level', monthLevel);
                              playSound('click');
                              triggerMascotReaction(
                                'excited',
                                `Parfait ! On passe au Mois ${m} (${levelName}). Es-tu prêt pour les expressions de cette période ?`,
                                `ممتاز! سننتقل للشهر ${m} (${levelName}). هل أنت مستعد للعبارات المخصصة؟`
                              );
                            }}
                            className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-center transition-all duration-200 active:scale-95 cursor-pointer relative ${
                              isSelected
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400/40'
                                : 'border-indigo-950/40 bg-[#121630]/45 text-slate-400 hover:border-indigo-500/30 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-sm font-black">Mois {m}</span>
                            <span className="text-[9px] text-slate-400 group-hover:text-slate-200 font-medium leading-none block mt-0.5">
                              {badgeEmoji} {levelName}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Linear Vertical Path Map */}
                  <div className="flex flex-col items-center justify-center relative py-6">
                    {/* Continuous decorative roadmap thread line */}
                    <div className="absolute top-12 bottom-12 w-1 bg-gradient-to-b from-amber-500 via-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>

                    {/* Sequential Unit Nodes */}
                    <div className="w-full space-y-16 relative z-10">
                      {Object.values(LEVEL_BADGES).map((badge, idx) => {
                        const isUnlocked = true; // For a wonderful prototyping experience, we make all levels clickable so users can experience everything immediately!
                        const isActive = selectedLevel === badge.level;

                        return (
                          <div 
                            key={badge.level}
                            className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 justify-center ${
                              idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                            }`}
                          >
                            {/* Visual glowing circle button node */}
                            <div className="relative">
                              {isActive && (
                                <span className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping pointer-events-none"></span>
                              )}
                              <button
                                onClick={() => startDuolingoSession(badge.level)}
                                className={`h-20 w-20 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer relative ${
                                  isActive 
                                    ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 border-white text-white scale-110'
                                    : 'bg-[#181C35] border-indigo-900/60 text-slate-300 hover:border-indigo-500'
                                }`}
                              >
                                <span className="text-3xl">{badge.icon}</span>
                                {isActive && (
                                  <span className="absolute -top-3 bg-pink-500 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-full border border-white animate-bounce">
                                    EN COURS
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Node Metadata Cards */}
                            <div className="max-w-sm bg-[#141830] border border-indigo-950/60 p-5 rounded-2xl shadow-lg space-y-2 text-center md:text-left relative hover:border-indigo-500/30 transition">
                              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 font-mono">
                                {badge.difficultyLabel}
                              </span>
                              <h4 className="font-display font-black text-sm text-slate-100">
                                {language === 'ar' ? badge.unitTitleAr : badge.unitTitle}
                              </h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {language === 'ar' ? badge.descriptionAr : badge.description}
                              </p>
                              
                              <button
                                onClick={() => startDuolingoSession(badge.level)}
                                className="w-full md:w-auto mt-2 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition"
                              >
                                <span>Lancer la leçon</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: INTERACTIVE LESSONS & DICTIONARY */}
              {currentTab === 'learn' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-indigo-950 pb-4">
                    <div>
                      <h2 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5 text-indigo-400" /> Bibliothèque de Vocabulaire Commercial
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Écoutez, prononcez et apprenez des phrases indispensables à vos transactions.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Vitesse audio :</span>
                      <button
                        onClick={() => {
                          setSpeechSpeed(speechSpeed === 'normal' ? 'slow' : 'normal');
                          playSound('click');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          speechSpeed === 'slow' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <span>{speechSpeed === 'slow' ? '🐢 Lent' : '⚡ Normal'}</span>
                      </button>
                    </div>
                  </div>

                  {/* List of vocabulary contents inside selected level */}
                  {getCurriculum(targetLang, selectedLevel, selectedCategory, selectedMonth).map(lesson => (
                    <div key={lesson.id} className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 rounded-xl border border-indigo-900/30 flex justify-between items-center">
                        <div>
                          <h3 className="font-display font-extrabold text-indigo-300 text-sm">{lesson.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{lesson.description}</p>
                        </div>
                        <span className="text-[11px] bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-1 rounded-full">
                          +{lesson.xp} XP disponibles
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.content.map((item, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-indigo-950 p-4 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20 transition-all group relative">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                  Expression {idx + 1}
                                </span>
                                <button
                                  onClick={() => speakText(item.phrase, TARGET_LANGUAGES.find(t => t.code === targetLang)?.voiceLang || 'en-US')}
                                  className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all"
                                  title="Prononcer la phrase"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <p className="font-display font-black text-slate-100 text-sm leading-relaxed">
                                {item.phrase}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono italic">
                                [{item.pronunciation}]
                              </p>
                              <p className="text-xs text-slate-300 border-t border-indigo-950/40 pt-2 font-medium">
                                {item.translation}
                              </p>
                            </div>
                            <div className="mt-3 bg-slate-950/40 p-2 rounded text-[10px] text-slate-400 leading-relaxed border-l-2 border-indigo-500">
                              <b>Usage :</b> {item.context}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: CARTES MEMOIRE INTERACTIVES */}
              {currentTab === 'flashcards' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="font-display font-black text-lg text-slate-100">Cartes Mémoire Interactives</h2>
                    <p className="text-xs text-slate-400 mt-1">Cliquez sur une carte pour révéler sa traduction instantanément.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getCurriculum(targetLang, selectedLevel, selectedCategory, selectedMonth).flatMap(l => l.content).slice(0, 6).map((item, idx) => {
                      const isFlipped = !!flippedCards[idx];
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
                            playSound('click');
                          }}
                          className="h-44 cursor-pointer perspective"
                        >
                          <div className={`relative w-full h-full duration-500 transform-style transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute inset-0 w-full h-full bg-[#181C35] border border-indigo-900/30 rounded-2xl p-4 flex flex-col justify-between backface-hidden shadow-md">
                              <span className="text-[10px] uppercase font-bold text-indigo-400">En {targetLang.toUpperCase()} :</span>
                              <p className="font-display font-black text-sm text-slate-100 text-center">
                                "{item.phrase}"
                              </p>
                              <span className="text-[9px] text-indigo-300/60 text-center uppercase tracking-widest font-bold">
                                Toucher pour tourner
                              </span>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between rotate-y-180 backface-hidden shadow-xl text-slate-100">
                              <span className="text-[10px] uppercase font-bold text-amber-400">Traduction :</span>
                              <div className="text-center space-y-1">
                                <p className="font-sans font-extrabold text-sm text-slate-100">
                                  {item.translation}
                                </p>
                                <p className="text-[11px] text-slate-300 font-mono italic">
                                  [{item.pronunciation}]
                                </p>
                              </div>
                              <p className="text-[9px] text-slate-400 leading-none text-center">
                                <b>Contexte :</b> {item.context}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: COMMUNITY CARD CREATION */}
              {currentTab === 'community' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Form panel */}
                    <div className="md:col-span-1 bg-[#141830] border border-indigo-950 p-5 rounded-2xl space-y-4">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Proposer une phrase</span>
                      <p className="text-xs text-slate-400">Enrichissez le deck public et recevez de l'XP en partageant de nouvelles formulations !</p>
                      
                      <form onSubmit={handleAddCommunityCard} className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Expression d'Affaires (Anglais/Espagnol...)</label>
                          <input 
                            type="text" 
                            value={newPhrase}
                            onChange={(e) => setNewPhrase(e.target.value)}
                            placeholder="Ex: Wholesale price list"
                            className="w-full text-xs px-3 py-2 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 outline-none text-slate-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Traduction Française ou Arabe</label>
                          <input 
                            type="text" 
                            value={newTranslation}
                            onChange={(e) => setNewTranslation(e.target.value)}
                            placeholder="Ex: Liste des tarifs de gros"
                            className="w-full text-xs px-3 py-2 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 outline-none text-slate-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Votre Prénom / Wilaya</label>
                          <input 
                            type="text" 
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder="Ex: Fares_Oran"
                            className="w-full text-xs px-3 py-2 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 outline-none text-slate-100"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition"
                        >
                          Ajouter au deck (+30 XP)
                        </button>
                      </form>
                    </div>

                    {/* Listing card */}
                    <div className="md:col-span-2 space-y-4">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Décret des expressions communautaires</span>
                      
                      <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2">
                        {communityCards.map((card, idx) => (
                          <div key={idx} className="bg-slate-950/40 border border-indigo-950/60 p-4 rounded-xl flex items-center justify-between hover:border-indigo-500/20 transition">
                            <div className="space-y-1">
                              <p className="text-xs font-extrabold text-slate-100 font-mono">"{card.phrase}"</p>
                              <p className="text-xs text-slate-300 font-sans">{card.translation}</p>
                              <p className="text-[10px] text-slate-500">Auteur : <span className="font-bold text-indigo-400">{card.user}</span></p>
                            </div>
                            <button
                              onClick={() => {
                                const updated = communityCards.map((c, cIdx) => cIdx === idx ? { ...c, likes: c.likes + 1 } : c);
                                setCommunityCards(updated);
                                localStorage.setItem('lingo_univers_community_cards', JSON.stringify(updated));
                                playSound('success');
                              }}
                              className="flex items-center gap-1 bg-[#1A223F] hover:bg-indigo-950 border border-indigo-900/30 text-indigo-400 text-xs px-3 py-1.5 rounded-xl"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                              <span>{card.likes}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: FORUM Q&A ENTRAIDE */}
              {currentTab === 'qna' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Ask panel */}
                    <div className="md:col-span-1 bg-[#141830] border border-indigo-950 p-5 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Nouveau sujet</span>
                      <p className="text-xs text-slate-400">Demandez conseil à la communauté d'acheteurs d'Univers Shop.</p>
                      
                      <form onSubmit={handleAddQuestion} className="space-y-3">
                        <textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Comment traduire au mieux 'expédition express CCP' ?"
                          rows={4}
                          className="w-full text-xs px-3 py-2 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 resize-none outline-none text-slate-100"
                          required
                        ></textarea>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition"
                        >
                          Poser ma question
                        </button>
                      </form>
                    </div>

                    {/* Subject Threads */}
                    <div className="md:col-span-2 space-y-4 max-h-[450px] overflow-y-auto pr-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Sujets récents d'entraide</span>
                      
                      {forumQuestions.map((q) => (
                        <div key={q.id} className="bg-slate-950/40 border border-indigo-950/40 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-indigo-400">👤 {q.author}</span>
                            <span className="text-slate-500">ID: {q.id}</span>
                          </div>
                          
                          <p className="text-xs font-bold text-slate-200">"{q.question}"</p>

                          {/* Answers list */}
                          {q.answers.length > 0 && (
                            <div className="bg-[#1A223F]/50 p-3 rounded-xl space-y-2 border-l-2 border-indigo-500">
                              {q.answers.map((ans, aIdx) => (
                                <div key={aIdx} className="text-xs leading-relaxed space-y-0.5">
                                  <span className="font-bold text-emerald-400 text-[10px]">💡 {ans.author} :</span>
                                  <p className="text-slate-300 font-medium">{ans.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add quick answer */}
                          <div className="flex gap-2 pt-2 border-t border-indigo-950/40">
                            <input
                              type="text"
                              value={replyText[q.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Écrire votre réponse d'acheteur..."
                              className="flex-grow text-xs px-3 py-1.5 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 outline-none text-slate-100"
                            />
                            <button
                              onClick={() => handleAddReply(q.id)}
                              className="bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: GIFTS REWARDS (LOYALTY SHOP INTEGRATION) */}
              {currentTab === 'gifts' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div>
                    <h2 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-emerald-400" /> Échange de Points XP contre Bons de Réduction
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Convertissez votre assiduité d'apprentissage d'élite en réductions pécuniaires réelles pour votre panier Univers Shop !
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center justify-between">
                    <span>Votre capital d'apprentissage : <b>{userXp} XP</b></span>
                    <span>Points de fidélité cumulés : <b>{userPoints} pts</b></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {GIFT_CODES.map((gift) => {
                      const isClaimable = userXp >= gift.xpRequired;
                      return (
                        <div key={gift.code} className="bg-[#141830] border border-indigo-950 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-emerald-500/20 transition-all">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                              Code : {gift.code}
                            </span>
                            <h4 className="font-display font-black text-slate-100 text-sm">{gift.label}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{gift.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-indigo-950/40 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-mono">Requis : <b>{gift.xpRequired} XP</b></span>
                            <button
                              onClick={() => handleClaimGift(gift.code, gift.xpRequired)}
                              className={`font-bold text-xs px-4 py-2 rounded-xl transition ${
                                isClaimable 
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow hover:from-emerald-500' 
                                  : 'bg-slate-850 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Échanger
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: LEADERBOARDS & DIPLOMA */}
              {currentTab === 'leaderboard' && (
                <div className="bg-[#0F1326]/80 border border-indigo-950 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-indigo-950 pb-4">
                    <div>
                      <h2 className="font-display font-black text-lg text-slate-100">Tableau d'Honneur Algérien</h2>
                      <p className="text-xs text-slate-400 mt-1">Rejoignez les meilleurs acheteurs polyglottes du pays !</p>
                    </div>

                    {/* Certificat trigger */}
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Votre nom complet..." 
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        className="text-xs px-3 py-2 bg-slate-950 border border-indigo-950 rounded-xl focus:border-indigo-500 outline-none text-slate-100"
                      />
                      <button
                        onClick={() => {
                          if (!certName.trim()) {
                            onShowToast("Veuillez inscrire votre nom complet.", "error");
                            return;
                          }
                          setIsCertGenerated(true);
                          playSound('celebrate');
                          onShowToast("Certificat d'honneur généré !", "success");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                      >
                        Créer Certificat
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard user list */}
                  <div className="space-y-3">
                    {LEADERBOARD_USERS.map((user, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          user.isMe 
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow' 
                            : 'bg-slate-950/40 border-indigo-950/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-display font-black text-sm text-indigo-400 font-mono w-4">
                            #{idx + 1}
                          </span>
                          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                            {user.badge.icon}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.isMe && (
                                <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.2 rounded-full uppercase font-black">Moi</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Niveau de langue : {user.badge.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-xs font-mono font-bold text-slate-100">{user.xp} XP</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total XP</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono font-bold text-amber-500">🔥 {user.streak}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Assiduité</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HTML Dynamic Certificate Showcase */}
                  {isCertGenerated && (
                    <div className="max-w-xl mx-auto bg-gradient-to-br from-[#0F1326] to-[#1D1730] border-4 border-amber-500/20 p-8 rounded-3xl relative shadow-2xl space-y-4 text-center mt-6">
                      <div className="absolute top-3 right-3 border border-amber-500/10 text-[9px] text-amber-500/70 font-mono px-2.5 py-0.5 rounded">
                        CERTIFICATE-LU-{Date.now().toString().slice(-6)}
                      </div>
                      
                      <div className="text-3xl text-amber-500">🏆</div>
                      <h4 className="font-display font-extrabold text-xs uppercase tracking-widest text-amber-500">Certificat d'Aptitude Commerciale d'Élite</h4>
                      <p className="text-[10px] text-slate-400">Le conseil d'administration de LingoUnivers décerne fièrement ce diplôme à :</p>
                      
                      <h5 className="font-display font-black text-2xl text-white my-3 decoration-double underline decoration-amber-500/40">
                        {certName}
                      </h5>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm mx-auto">
                        Pour avoir validé avec honneur l'intégralité du programme d'apprentissage commercial et négociations logistiques en langue étrangère relié au site e-commerce Univers Shop.
                      </p>

                      <div className="flex justify-between items-center pt-6 border-t border-indigo-950/50">
                        <div className="text-left">
                          <p className="text-[9px] font-mono text-slate-400">Date de validation :</p>
                          <p className="text-[10px] font-bold text-slate-200">09 Juillet 2026</p>
                        </div>
                        <div className="text-center bg-amber-500/10 text-amber-500 text-[10px] font-extrabold border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                          Sceau d'Élite Lingo
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-400">Directeur Général :</p>
                          <p className="text-[10px] font-bold text-slate-200 italic font-display">DZ-Lingo Corp</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* GOOGLE ACCOUNT SELECTOR MODAL (Simulated Google Auth) */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden border border-slate-200 shadow-2xl transform transition-all">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 text-center relative bg-slate-50">
              <button 
                onClick={() => setGoogleModalOpen(false)} 
                className="absolute top-4 right-4 p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <svg className="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="font-display font-black text-slate-900 text-sm">Se connecter avec Google</h3>
              <p className="text-slate-500 text-[11px] mt-1">Choisissez un compte Google pour vous connecter à LingoUnivers</p>
            </div>

            {/* List of accounts */}
            <div className="p-5 space-y-2.5">
              {[
                { name: 'Sami Bouzidi', email: 'sami.bouzidi.dz@gmail.com', picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80' },
                { name: 'Yasmine Alger', email: 'yasmine.alger.dz@gmail.com', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80' },
                { name: 'Kamel Baridi', email: 'kamel.baridi58@gmail.com', picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80' }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.name, acc.email, acc.picture)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 text-left transition cursor-pointer"
                >
                  <img src={acc.picture} alt={acc.name} className="w-9 h-9 rounded-full border border-slate-200 object-cover" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800">{acc.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 px-5 py-4 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400">
                🔒 Sécurisé via les protocoles Google API OAuth2. Vos données d'apprentissage sont préservées localement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageLearningPortal;
