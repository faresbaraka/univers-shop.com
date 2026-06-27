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

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Check if system credentials are ready
  app.get("/api/payments/config", (req, res) => {
    res.json({
      hasChargilyKey: !!process.env.CHARGILY_APP_KEY,
      mode: process.env.CHARGILY_APP_KEY ? "real" : "simulated",
    });
  });

  // AI Sales Assistant Endpoint
  app.post("/api/chat", async (req, res) => {
    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const { messages, products } = req.body;
      if (!Array.isArray(messages)) {
        res.write(`data: ${JSON.stringify({ error: "Le paramètre 'messages' est requis et doit être un tableau." })}\n\n`);
        return res.end();
      }

      const client = getGeminiClient();
      if (!client) {
        // Safe, responsive fallback simulation mode in case GEMINI_API_KEY is not configured yet
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
        let reply = "Marhaba ! 😊 Je suis Yanis, votre conseiller style IA d'Univers Shop.\n\nPour vous proposer la tenue idéale, dites-moi :\n1️⃣ Quel est votre **âge** ?\n2️⃣ Quelle est votre **taille** ou morphologie ?\n3️⃣ Quel **style** aimez-vous et pour quelle **occasion** ?";
        
        if (products && Array.isArray(products) && products.length > 0) {
          const hasAge = lastMsg.match(/\d+\s*(ans|years)/i) || lastMsg.includes("âge") || lastMsg.includes("ans");
          const hasSize = lastMsg.includes("taille") || lastMsg.match(/\b(s|m|l|xl|xxl)\b/i);
          const hasStyle = lastMsg.includes("style") || lastMsg.includes("chic") || lastMsg.includes("sport") || lastMsg.includes("classique") || lastMsg.includes("décontracté");

          if (hasAge || hasSize || hasStyle) {
            // Give customized style recommendation from available products
            const recProducts = products.slice(0, 2);
            reply = `✨ **Vos Conseils de Style Personnalisés par Yanis :**\n\nMerci pour ces détails ! D'après votre profil, voici la tenue idéale que je vous conseille vivement dans notre boutique :\n\n` + 
                    recProducts.map(p => `👕 *${p.name}* (${p.price.toLocaleString()} DA)\n📝 ${p.description}\n💡 *Pourquoi cette tenue ?* Cette pièce convient parfaitement à votre silhouette et s'accorde magnifiquement avec vos préférences pour un look élégant et moderne.`).join("\n\n") + 
                    `\n\n👉 *Comment l'obtenir ?* Il vous suffit de fermer cette fenêtre, de cliquer sur **Ajouter au panier** sur la fiche de l'article, puis de valider votre commande !`;
          } else if (lastMsg.includes("cher") || lastMsg.includes("budget")) {
            const cheapProducts = [...products].sort((a, b) => a.price - b.price).slice(0, 2);
            reply = `D'après vos critères de budget, voici nos options de tenues élégantes à prix très abordables :\n\n` + 
                    cheapProducts.map(p => `📍 *${p.name}* à *${p.price.toLocaleString()} DA* - ${p.description}`).join("\n\n") + 
                    `\n\nN'hésitez pas à les ajouter au panier !`;
          } else {
            const featured = products.slice(0, 3);
            reply = `Marhaba ! D'après notre catalogue actuel, voici les plus belles tenues du moment :\n\n` + 
                    featured.map(p => `🌟 *${p.name}* (${p.price.toLocaleString()} DA) - ${p.description}`).join("\n\n") + 
                    `\n\nDites-moi votre **âge**, votre **taille** et votre **style préféré** pour que je compose votre look idéal !`;
          }
        }

        // Stream the simulated response word-by-word with very minor delay
        const words = reply.split(/(\s+)/);
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ text: word })}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 8));
        }
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      const systemInstruction = `Tu es Yanis, le styliste et conseiller de mode virtuel d'Univers Shop, un site e-commerce algérien haut de gamme de prêt-à-porter.
Ton rôle est d'accompagner les acheteurs en leur proposant un conseil vestimentaire personnalisé et de composer la tenue ("outfit") idéale pour eux.

CONSIGNES STRICTES DE COMPORTEMENT :
1. Accueil chaleureux et typiquement algérien : Salue les visiteurs en disant "Salam !" ou "Marhaba ! Bienvenue chez Univers Shop !" tout en restant d'un professionnalisme impeccable et élégant. Parle principalement en français clair, raffiné et chaleureux.
2. Démarche de styliste :
   - Si le client ne les a pas encore donnés, demande-lui poliment de préciser son **âge**, sa **taille ou morphologie** (S, M, L, XL, ou sa hauteur/stature), ses **préférences de style** (sportswear, élégant, casual chic, classique, décontracté) et **l'occasion** (pour le travail, le quotidien, un mariage, l'Aïd, etc.).
   - Tu dois poser ces questions de manière fluide et engageante.
3. Recommandations de tenues :
   - Une fois que le client t'a fourni des détails, analyse ses réponses (âge, taille, style) pour lui composer une ou plusieurs tenues coordonnées ("outfit") à partir des vêtements disponibles.
   - Tu as accès à la liste complète des produits en temps réel ci-dessous. Ne recommande QUE des produits qui existent réellement dans cette liste ! Ne mentionne jamais d'articles imaginaires ou épuisés.
   - Pour chaque article recommandé, explique clairement en quoi il correspond à son âge, sa silhouette, et ses goûts stylisés (ex: "Ce haut fluide en taille M mettra en valeur votre stature, associé à..."). Donne son nom exact, son prix en DA (DZD) et sa description.
4. Guide vers l'achat :
   - Explique au client qu'il lui suffit de cliquer sur le bouton "Ajouter au panier" sur la fiche du vêtement correspondant dans la boutique en arrière-plan, puis de cliquer sur l'icône de son panier pour commander.
   - Rappelle-lui que la livraison est disponible sur les 58 wilayas d'Algérie avec paiement sécurisé à la livraison (Cash on Delivery) ou par carte CIB/Edahabia.
5. Sois visuellement structuré : Utilise des puces, des émojis de mode (👔, 👗, 👟, ✨), et met les noms de produits et prix en gras pour une lisibilité exceptionnelle.

Voici le catalogue de vêtements disponibles en temps réel chez Univers Shop :
${JSON.stringify(products || [], null, 2)}
`;

      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Initiate streaming request to Gemini 3.5 Flash
      const responseStream = await client.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch (err: any) {
      console.error("Erreur dans l'API de chat de l'assistant IA:", err);
      res.write(`data: ${JSON.stringify({ error: "Une erreur technique est survenue au niveau du conseiller IA.", details: err.message })}\n\n`);
      return res.end();
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
