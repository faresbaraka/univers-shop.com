import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. The AI assistant will operate in simulated fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check if system credentials are ready
  app.get("/api/payments/config", (req, res) => {
    res.json({
      hasChargilyKey: !!process.env.CHARGILY_APP_KEY,
      mode: process.env.CHARGILY_APP_KEY ? "real" : "simulated",
    });
  });

  // AI Sales Assistant Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, products } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Le paramètre 'messages' est requis et doit être un tableau." });
      }

      const client = getGeminiClient();
      if (!client) {
        // Safe, responsive fallback simulation mode in case GEMINI_API_KEY is not configured yet
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
        let reply = "Marhaba ! Bienvenue chez Univers Shop ! 😊 Je suis votre conseiller d'achat IA. Que recherchez-vous aujourd'hui ? (Indiquez votre budget ou vos besoins)";
        
        if (products && Array.isArray(products) && products.length > 0) {
          if (lastMsg.includes("budget") || lastMsg.includes("da") || lastMsg.includes("prix") || lastMsg.includes("cher")) {
            const cheapProducts = [...products].sort((a, b) => a.price - b.price).slice(0, 2);
            reply = `D'après vos critères de budget, voici nos options de choix :\n\n` + 
                    cheapProducts.map(p => `📍 *${p.name}* à *${p.price.toLocaleString()} DA* - ${p.description}`).join("\n\n") + 
                    `\n\nN'hésitez pas à les ajouter directement au panier pour finaliser votre commande !`;
          } else if (lastMsg.includes("compar") || lastMsg.includes("vs") || lastMsg.includes("mieux")) {
            const p1 = products[0];
            const p2 = products[1] || products[0];
            reply = `Voici un comparatif rapide entre deux de nos meilleurs articles :\n\n` +
                    `1️⃣ *${p1.name}* (${p1.price.toLocaleString()} DA) : ${p1.description}\n` +
                    `2️⃣ *${p2.name}* (${p2.price.toLocaleString()} DA) : ${p2.description}\n\n` +
                    `Lequel préférez-vous ajouter à votre panier ?`;
          } else {
            const featured = products.slice(0, 3);
            reply = `Marhaba ! D'après l'inventaire actuel d'Univers Shop, je vous conseille vivement d'examiner ces articles de qualité :\n\n` + 
                    featured.map(p => `🌟 *${p.name}* (${p.price.toLocaleString()} DA) - ${p.description}`).join("\n\n") + 
                    `\n\nQuelle est votre utilisation principale ou votre budget ? Je peux vous guider vers le meilleur choix !`;
          }
        }
        return res.json({ text: reply });
      }

      const systemInstruction = `Tu es l'assistant de vente virtuel d'Univers Shop, un site e-commerce algérien haut de gamme.
Ton rôle est d'accueillir chaleureusement les visiteurs, de comprendre leurs besoins et de leur recommander les meilleurs produits de la boutique.

CONSIGNES DE COMPORTEMENT :
1. Sois chaleureux, professionnel et proactif. Salue les visiteurs en disant "Salam" ou "Marhaba ! Bienvenue chez Univers Shop !" pour être amical et typiquement algérien, tout en restant professionnel. Parle principalement en français clair et soigné.
2. Tu as accès à la liste complète des produits en temps réel ci-dessous. Ne recommande QUE des produits qui existent réellement dans cette liste. Ne mentionne pas de produits fictifs. Pour chaque recommandation, précise le nom exact de l'article, son prix en DA (DZD) et sa description.
3. Si le client vient d'arriver, guide-le en lui posant des questions sur son budget (en DA), ses préférences, ou l'utilisation souhaitée.
4. Aide le client à comparer les produits s'il hésite entre plusieurs options de la liste.
5. Guide le client vers l'achat : explique-lui qu'il lui suffit de cliquer sur "Ajouter au panier" sur la fiche du produit correspondant, puis d'aller dans le panier et cliquer sur "Passer la commande" pour choisir la livraison (sur les 58 wilayas) avec paiement cash à la livraison ou en ligne de manière 100% sécurisée.
6. Sois concis et structuré dans tes réponses. Utilise des puces et du gras pour faciliter la lecture.

Voici les produits actuellement disponibles en boutique :
${JSON.stringify(products || [], null, 2)}
`;

      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Erreur dans l'API de chat de l'assistant IA:", err);
      return res.status(500).json({ error: "Une erreur technique est survenue au niveau du conseiller IA.", details: err.message });
    }
  });

  // Secure payment gateway proxy setup
  app.post("/api/payments/chargily-checkout", async (req, res) => {
    try {
      const { 
        amount, 
        customerName, 
        customerPhone, 
        customerAddress, 
        customerWilaya, 
        successUrl, 
        failureUrl 
      } = req.body;

      if (!amount || amount < 75) {
        return res.status(400).json({
          error: "Le montant minimum pour un paiement en ligne sécurisé par carte CIB/Edahabia est de 75 DA."
        });
      }

      const chargilyKey = process.env.CHARGILY_APP_KEY;

      if (!chargilyKey) {
        // Safe interactive simulation mode
        console.log("No CHARGILY_APP_KEY found in .env; falling back to interactive sandbox.");
        return res.json({
          simulation: true,
          message: "Mode simulation hautement sécurisé activé (Aucune clé de production n'est encore configurée)."
        });
      }

      // Configure official payload headers and body for Chargily v2
      const payload = {
        amount: Math.round(Number(amount)),
        currency: "dzd",
        success_url: successUrl,
        failure_url: failureUrl,
        description: `Facture Univers Shop - Client: ${customerName}`,
        payment_method: "edahabia", // Default key target
        metadata: {
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          customer_wilaya: customerWilaya
        }
      };

      console.log("Connecting securely to Chargily Pay API...");
      const response = await fetch("https://api.chargily.com/v2/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${chargilyKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Chargily platform error response:", errorDetails);
        return res.status(response.status).json({
          error: "La plateforme de transaction Chargily a renvoyé une erreur de sécurité.",
          details: errorDetails
        });
      }

      const data = await response.json() as { id: string; checkout_url: string };
      console.log("Secure checkout tokenized successfully with reference:", data.id);

      return res.json({
        simulation: false,
        checkoutUrl: data.checkout_url,
        id: data.id
      });

    } catch (err: any) {
      console.error("Critical error in payment pipeline:", err);
      return res.status(500).json({
        error: "Erreur technique de traitement réseau dans le gateway de paiement.",
        details: err.message
      });
    }
  });

  // Hot pipeline integration with Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Standard compressed production serving compiled dist bundles
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Univers Shop Secure Gate] listening on port ${PORT}`);
  });
}

startServer();
