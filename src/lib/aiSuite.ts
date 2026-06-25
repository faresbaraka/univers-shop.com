import { AISuiteState, Product, AIDecision, AICampaign, AIMarketingCampaign, AIHistoricalStats } from '../types';

export const DEFAULT_AI_STATE: AISuiteState = {
  enabled: true,
  dynamicPricing: true,
  pricingStrategy: 'balanced',
  safetyMinPricePct: 75,
  safetyMaxPricePct: 125,
  requireHumanValidation: false,
  autoAdvertising: true,
  marketingAutomation: true,
  conversionIntelligence: true,
  profitLoopEnabled: true,
  adCampaigns: [
    { id: 'camp-1', name: 'Facebook Ads - Tech & Accessoires', budget: 15000, ctr: 2.1, conversions: 24, cpa: 625, roi: 2.8, status: 'active' },
    { id: 'camp-2', name: 'Instagram Story - Mode & Beauté', budget: 12000, ctr: 3.4, conversions: 35, cpa: 340, roi: 4.1, status: 'active' },
    { id: 'camp-3', name: 'TikTok Feed - Univers Tendance', budget: 8000, ctr: 1.2, conversions: 8, cpa: 1000, roi: 1.5, status: 'active' },
    { id: 'camp-4', name: 'Google Search - Achat Direct', budget: 5000, ctr: 0.8, conversions: 2, cpa: 2500, roi: 0.6, status: 'active' }
  ],
  pricingDecisions: [
    {
      id: 'dec-init',
      productId: 'all',
      productName: 'Système Global',
      oldPrice: 0,
      newPrice: 0,
      reason: 'Démarrage du modèle prédictif IA - Univers Shop',
      date: new Date().toISOString(),
      status: 'applied'
    }
  ],
  marketingCampaigns: [
    { id: 'mkt-1', name: 'Ciblage Heure Creuse (2h - 6h)', trigger: 'Heures creuses nocturnes', status: 'active', discount: 10 },
    { id: 'mkt-2', name: 'Retargeting Panier Abandonné', trigger: 'Inactivité panier > 30s', status: 'active', discount: 15 },
    { id: 'mkt-3', name: 'Boost Nouveaux Clients', trigger: 'Première visite détectée', status: 'active', discount: 5 }
  ],
  historicalStats: [
    { date: 'J-6', revenue: 45000, adSpend: 10000, conversionRate: 1.8, profit: 35000 },
    { date: 'J-5', revenue: 52000, adSpend: 10000, conversionRate: 2.1, profit: 42000 },
    { date: 'J-4', revenue: 49000, adSpend: 11000, conversionRate: 1.9, profit: 38000 },
    { date: 'J-3', revenue: 64000, adSpend: 11000, conversionRate: 2.5, profit: 53000 },
    { date: 'J-2', revenue: 72000, adSpend: 12000, conversionRate: 2.8, profit: 60000 },
    { date: 'J-1', revenue: 85000, adSpend: 12000, conversionRate: 3.2, profit: 73000 },
    { date: 'En cours', revenue: 95000, adSpend: 14000, conversionRate: 3.5, profit: 81000 }
  ]
};

/**
 * Runs a single AI optimization cycle, simulating sales, pricing decisions, ad tuning, and conversion boost.
 */
export function runAIOptimizationCycle(
  currentState: AISuiteState,
  products: Product[]
): {
  updatedState: AISuiteState;
  updatedProducts: Product[];
  logs: string[];
} {
  const logs: string[] = [];
  const updatedProducts = [...products];
  const updatedState = { ...currentState };

  if (!currentState.enabled) {
    logs.push("Le système d'IA global est désactivé. Aucune optimisation effectuée.");
    return { updatedState, updatedProducts, logs };
  }

  // 1. DYNAMIC PRICING ENGINE
  if (currentState.dynamicPricing && updatedProducts.length > 0) {
    // Pick a random product to evaluate
    const randomIndex = Math.floor(Math.random() * updatedProducts.length);
    const prod = updatedProducts[randomIndex];

    // Ensure the product has an original price to bound against
    const basePrice = prod.originalPrice || prod.price;
    if (!prod.originalPrice) {
      prod.originalPrice = basePrice;
    }

    const minAllowed = Math.round((basePrice * currentState.safetyMinPricePct) / 100);
    const maxAllowed = Math.round((basePrice * currentState.safetyMaxPricePct) / 100);

    let priceChangePct = 0;
    let reason = '';

    // Decide price change based on sales count (simulating demand) and strategy
    if (prod.salesCount > 5) {
      // High demand -> increase price to maximize margin
      priceChangePct = currentState.pricingStrategy === 'profit' ? 8 : currentState.pricingStrategy === 'conversion' ? 2 : 4;
      reason = `Demande extrêmement élevée (+${prod.salesCount} ventes). Augmentation pour optimiser la marge unitaire.`;
    } else if (prod.salesCount === 0) {
      // Low performance -> lower price to stimulate sales
      priceChangePct = currentState.pricingStrategy === 'profit' ? -4 : currentState.pricingStrategy === 'conversion' ? -12 : -8;
      reason = `Ralentissement des ventes détecté (0 ventes). Réduction stratégique pour stimuler l'intérêt des acheteurs.`;
    } else {
      // Moderate performance -> minor adjustment
      const isUp = Math.random() > 0.5;
      priceChangePct = isUp ? 3 : -3;
      reason = `Stabilité du marché. Ajustement fin de ±3% pour tester la sensibilité au prix de l'audience.`;
    }

    const priceDiff = Math.round((basePrice * priceChangePct) / 100);
    let targetPrice = prod.price + priceDiff;

    // Constrain to safety boundaries
    if (targetPrice < minAllowed) {
      targetPrice = minAllowed;
      reason += ' (Limité par le seuil de sécurité minimum)';
    }
    if (targetPrice > maxAllowed) {
      targetPrice = maxAllowed;
      reason += ' (Limité par le seuil de sécurité maximum)';
    }

    if (targetPrice !== prod.price) {
      const decisionId = 'dec-' + Math.floor(Math.random() * 100000);
      const isValidationRequired = currentState.requireHumanValidation;

      const newDecision: AIDecision = {
        id: decisionId,
        productId: prod.id,
        productName: prod.name,
        oldPrice: prod.price,
        newPrice: targetPrice,
        reason: reason,
        date: new Date().toISOString(),
        status: isValidationRequired ? 'pending' : 'applied'
      };

      updatedState.pricingDecisions = [newDecision, ...updatedState.pricingDecisions].slice(0, 50);

      if (!isValidationRequired) {
        // Apply immediately
        updatedProducts[randomIndex] = {
          ...prod,
          price: targetPrice
        };
        logs.push(`Dynamic Pricing : Ajusté le prix de "${prod.name}" de ${prod.price.toLocaleString()} DA à ${targetPrice.toLocaleString()} DA (${priceChangePct > 0 ? '+' : ''}${priceChangePct}%).`);
      } else {
        logs.push(`Dynamic Pricing : Nouvelle suggestion de prix pour "${prod.name}" (${targetPrice.toLocaleString()} DA). En attente de validation humaine.`);
      }
    }
  }

  // 2. AI ADVERTISING ENGINE
  if (currentState.autoAdvertising) {
    updatedState.adCampaigns = currentState.adCampaigns.map(camp => {
      if (camp.status === 'paused') {
        // 10% chance to automatically resume if optimized
        if (Math.random() > 0.90) {
          logs.push(`AI Ads : Campagne "${camp.name}" réoptimisée et relancée avec de nouveaux visuels.`);
          return { ...camp, status: 'active', budget: Math.round(camp.budget * 0.8), roi: 1.8, ctr: 1.5 };
        }
        return camp;
      }

      // Live campaign: optimize performance
      let nextBudget = camp.budget;
      let nextRoi = Number((camp.roi + (Math.random() * 0.8 - 0.35)).toFixed(2));
      let nextCtr = Number((camp.ctr + (Math.random() * 0.4 - 0.15)).toFixed(2));
      if (nextCtr < 0.2) nextCtr = 0.2;
      if (nextRoi < 0.1) nextRoi = 0.1;

      // Rule 1: High ROI (> 3.0) -> increase budget by 20%
      if (nextRoi > 3.0) {
        nextBudget = Math.round(camp.budget * 1.2);
        logs.push(`AI Ads : Budget de "${camp.name}" augmenté de +20% en raison d'un excellent ROI (${nextRoi}x).`);
      }
      // Rule 2: Low ROI (< 1.2) -> pause or drop budget
      else if (nextRoi < 1.2) {
        if (Math.random() > 0.5) {
          logs.push(`AI Ads : Campagne "${camp.name}" mise en PAUSE automatiquement (ROI insuffisant de ${nextRoi}x).`);
          return { ...camp, status: 'paused', roi: nextRoi, ctr: nextCtr };
        } else {
          nextBudget = Math.round(camp.budget * 0.7);
          logs.push(`AI Ads : Budget de "${camp.name}" réduit de -30% (Faible ROI de ${nextRoi}x).`);
        }
      }

      // CPA calculation helper
      const nextConversions = Math.round(camp.conversions + (Math.random() * 4));
      const nextCpa = Math.max(200, Math.round(nextBudget / (nextConversions || 1)));

      return {
        ...camp,
        budget: nextBudget,
        roi: nextRoi,
        ctr: nextCtr,
        conversions: nextConversions,
        cpa: nextCpa
      };
    });
  }

  // 3. CONVERSION & MARKETING AUTOMATION LAYER
  if (currentState.marketingAutomation) {
    // Randomly toggle or trigger marketing campaigns
    updatedState.marketingCampaigns = currentState.marketingCampaigns.map(camp => {
      const isToggled = Math.random() > 0.85;
      if (isToggled) {
        const nextStatus = camp.status === 'active' ? 'inactive' : 'active';
        logs.push(`AI Marketing : Statut de "${camp.name}" changé à [${nextStatus.toUpperCase()}].`);
        return { ...camp, status: nextStatus };
      }
      return camp;
    });
  }

  // 4. PROFIT OPTIMIZATION LOOP
  if (currentState.profitLoopEnabled) {
    // Compute new aggregate performance stats for the loop
    const activeCamps = updatedState.adCampaigns.filter(c => c.status === 'active');
    const totalAdSpend = activeCamps.reduce((sum, c) => sum + c.budget, 0);
    const avgRoi = activeCamps.length > 0 
      ? Number((activeCamps.reduce((sum, c) => sum + c.roi, 0) / activeCamps.length).toFixed(2))
      : 0;

    // Simulate revenue growth due to optimizations
    const lastStat = currentState.historicalStats[currentState.historicalStats.length - 1] || { revenue: 95000, conversionRate: 3.5 };
    
    // Revenue is influenced by current pricing strategy, campaigns ROI and global enabled status
    const strategyMultiplier = currentState.pricingStrategy === 'profit' ? 1.05 : currentState.pricingStrategy === 'conversion' ? 1.15 : 1.10;
    const nextRevenue = Math.round(lastStat.revenue * (1 + (avgRoi * 0.03) * strategyMultiplier) + (Math.random() * 3000 - 1000));
    const nextConvRate = Number(Math.max(1.5, Math.min(6.5, lastStat.conversionRate + (avgRoi * 0.1) - (currentState.pricingStrategy === 'profit' ? 0.2 : -0.3) + (Math.random() * 0.4 - 0.2))).toFixed(2));
    const nextProfit = Math.round(nextRevenue - totalAdSpend);

    // Format new historical state point
    const newPoint: AIHistoricalStats = {
      date: `Optimisé`,
      revenue: nextRevenue,
      adSpend: totalAdSpend,
      conversionRate: nextConvRate,
      profit: nextProfit
    };

    // Update current historical stats list, maintaining last 8 points
    let nextHistory = [...currentState.historicalStats];
    if (nextHistory.length >= 8) {
      nextHistory.shift();
    }
    // Rename previous "Optimisé" points to sequence numbers
    nextHistory = nextHistory.map((pt, idx) => {
      if (pt.date === 'Optimisé') {
        return { ...pt, date: `Cycle ${idx}` };
      }
      return pt;
    });
    nextHistory.push(newPoint);
    updatedState.historicalStats = nextHistory;
    logs.push(`Profit Loop : Performances agrégées mises à jour. Taux de conv : ${nextConvRate}%, Profit net estimé : ${nextProfit.toLocaleString()} DA.`);
  }

  return { updatedState, updatedProducts, logs };
}
