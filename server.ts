import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Clean and safely parse JSON strings returned by Gemini
function safeParseJson(text: string): any {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }
  // Find the first outer '{' and the last outer '}' to crop any accidental junk text
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  return JSON.parse(cleaned);
}

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

  // Dynamic AI Product Description Generator Endpoint
  app.post("/api/generate-description", async (req, res) => {
    try {
      const { name, category, condition, size, brand, language } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Le nom de l'article est requis." });
      }

      const client = getGeminiClient();
      if (!client) {
        // Fallback description generator
        const brandStr = brand ? ` (${brand})` : "";
        const sizeStr = size ? `\n- Spécifications / Taille : ${size}` : "";
        const lang = language || "fr";

        let fallbackText = "";
        if (lang === "ar") {
          fallbackText = `السلام عليكم، أضع بين أيديكم للبيع: ${name}${brandStr}.
- القسم: ${category || "عام"}
- الحالة: ${condition || "ممتازة"}${sizeStr}

الغرض في حالة ممتازة ومثالي للاستخدام اليومي. البيع مستعجل وبسعر جد معقول.
الرجاء التواصل معي مباشرة للمزيد من التفاصيل أو لتنسيق التسليم. شكراً !`;
        } else {
          fallbackText = `Bonjour, je mets en vente cet article d'occasion : ${name}${brandStr}.
- Catégorie : ${category || "Autre"}
- État : ${condition || "Bon état"}${sizeStr}

L'objet fonctionne parfaitement et est prêt à l'usage. Vente rapide et prix très raisonnable.
N'hésitez pas à me contacter pour plus d'informations ou pour convenir d'un rendez-vous.`;
        }
        return res.json({ description: fallbackText });
      }

      const prompt = `You are a professional e-commerce copywriter. Generate an extremely appealing, high-converting product description for a second-hand item being sold on a premium local Algerian marketplace (Vinted Corner style).

Item Details:
- Name: "${name}"
- Category: "${category || 'N/A'}"
- Condition: "${condition || 'N/A'}"
- Size / Specifications: "${size || 'N/A'}"
- Brand: "${brand || 'N/A'}"
- Target Language: "${language || 'fr'}" (Must be strictly 'fr' for French or 'ar' for Arabic)

CRITICAL WRITING DIRECTIVES:
1. Make it professional, captivating, and highly trustworthy.
2. Structure the description with bullet points (e.g. details, specifications, condition, reason for selling/use cases).
3. Use engaging emojis (e.g., ✨, 👗, 👞, 📱, 👌, 🇩🇿) suitable for a fashionable secondhand sale in Algeria.
4. Mention that hand-to-hand delivery is preferred or delivery can be organized.
5. Keep it clear, concise, and beautifully formatted. Do NOT include markdown code blocks or wrapping text outside of the direct description output. Just return the description text directly.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.8
        }
      });

      const description = response.text || "";
      return res.json({ description: description.trim() });
    } catch (err: any) {
      console.error("Error generating product description:", err);
      return res.status(500).json({ error: "Erreur lors de la génération de la description." });
    }
  });

  app.post("/api/lingo/generate-exercises", async (req, res) => {
    try {
      const { category, targetLang } = req.body;
      const cat = category || "commerce";
      const lang = targetLang || "en";

      const fallbackData = {
        matchPairs: [
          { foreign: lang === "es" ? "Pagar" : lang === "de" ? "Bezahlen" : "To pay", native: "Payer" },
          { foreign: lang === "es" ? "Precio" : lang === "de" ? "Preis" : "Prix", native: "Prix" },
          { foreign: lang === "es" ? "Descuento" : lang === "de" ? "Rabatt" : "Réduction", native: "Réduction" },
          { foreign: lang === "es" ? "Factura" : lang === "de" ? "Rechnung" : "Facture", native: "Facture" }
        ],
        wordBank: {
          targetPhrase: lang === "es" ? "Quiero pagar con tarjeta de crédito" : lang === "de" ? "Ich möchte mit Kreditkarte bezahlen" : "I want to pay with credit card",
          translation: "Je veux payer par carte de crédit",
          availableWords: lang === "es" 
            ? ["Quiero", "pagar", "con", "tarjeta", "de", "crédito", "Alger", "CIB", "CCP"]
            : lang === "de"
            ? ["Ich", "möchte", "mit", "Kreditkarte", "bezahlen", "Alger", "CIB", "CCP"]
            : ["I", "want", "to", "pay", "with", "credit", "card", "Alger", "CIB", "CCP"],
          correctWords: lang === "es"
            ? ["Quiero", "pagar", "con", "tarjeta", "de", "crédito"]
            : lang === "de"
            ? ["Ich", "möchte", "mit", "Kreditkarte", "bezahlen"]
            : ["I", "want", "to", "pay", "with", "credit", "card"],
          pronunciation: lang === "es" ? "ky-ay-ro pa-gar con tar-he-ta" : lang === "de" ? "ich mukh-te mit" : "ai wont tu pei..."
        },
        multipleChoice: {
          targetPhrase: lang === "es" ? "¿Dónde está el centro comercial?" : lang === "de" ? "Wo ist das Einkaufszentrum?" : "Where is the shopping center?",
          options: ["Où se trouve le centre commercial ?", "Combien coûte ce costume ?", "Puis-je avoir un reçu ?"],
          correctIndex: 0,
          pronunciation: lang === "es" ? "don-de es-ta el cen-tro" : lang === "de" ? "vo ist das" : "wear iz the..."
        }
      };

      const client = getGeminiClient();
      if (!client) {
        console.log("Using rich offline fallbacks for dynamic exercise generation (Missing GEMINI_API_KEY).");
        return res.json(fallbackData);
      }

      try {
        const prompt = `You are an expert language teacher. Generate an interactive quiz for a student learning the language with code '${lang}' in the category '${cat}'.
Generate matching terms, word sorting exercises, and multiple choice questions.
Translate terms accurately and make the content interesting, useful, and realistic for category '${cat}' (options: voyage, commerce, vivre_la_bas, loisir).`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchPairs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      foreign: { type: Type.STRING, description: `A word or short phrase in target language '${lang}'` },
                      native: { type: Type.STRING, description: "The exact translation in French" }
                    },
                    required: ["foreign", "native"]
                  },
                  description: "List of 4 distinct matching word/phrase pairs."
                },
                wordBank: {
                  type: Type.OBJECT,
                  properties: {
                    targetPhrase: { type: Type.STRING, description: `A full meaningful sentence in target language '${lang}'` },
                    translation: { type: Type.STRING, description: "The exact French translation of the sentence." },
                    availableWords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Individual words from the target phrase mixed with 3-4 distraction words to choose from." },
                    correctWords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The correct sequence of words in the target language that forms the targetPhrase." },
                    pronunciation: { type: Type.STRING, description: "Phonetic pronunciation guide written for a French speaker." }
                  },
                  required: ["targetPhrase", "translation", "availableWords", "correctWords", "pronunciation"]
                },
                multipleChoice: {
                  type: Type.OBJECT,
                  properties: {
                    targetPhrase: { type: Type.STRING, description: `A question or phrase in target language '${lang}'` },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 different translation options in French, only one of which must be correct." },
                    correctIndex: { type: Type.INTEGER, description: "The 0-based index of the correct option inside the options array." },
                    pronunciation: { type: Type.STRING, description: "Phonetic pronunciation guide written for a French speaker." }
                  },
                  required: ["targetPhrase", "options", "correctIndex", "pronunciation"]
                }
              },
              required: ["matchPairs", "wordBank", "multipleChoice"]
            },
            temperature: 0.8
          }
        });

        const responseText = response.text || "";
        try {
          const parsed = safeParseJson(responseText);
          return res.json(parsed);
        } catch (parseErr) {
          console.error("Failed to parse Gemini response for exercises. Content was:", responseText);
          return res.json(fallbackData);
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed for generate-exercises. Falling back to offline exercises fallback. Error:", geminiErr.message || geminiErr);
        return res.json(fallbackData);
      }
    } catch (err: any) {
      console.error("Error in dynamic exercise generator:", err);
      return res.status(500).json({ error: "Erreur lors de la génération d'exercices." });
    }
  });

  // AI Voice Coach Call Session Endpoint
  app.post("/api/lingo/voice-session", async (req, res) => {
    try {
      const { transcription, history, targetLang, category, callMode } = req.body;
      const lang = targetLang || "en";
      const cat = category || "voyage";
      const mode = callMode || "exercises";

      // Comprehensive offline fallback database for all 10 target languages
      const fallbackPhrases: Record<string, { start: string; startNext: string; matchExplanation: string; matchSpeech: string; matchNext: string; failSpeech: string; failExplanation: string; failNext: string }> = {
        en: {
          start: "Hello! I am your language coach Lia. What is your goal in learning English, and what are your main weaknesses? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Merveilleux début ! Vous vous exprimez très bien. Nous allons progresser ensemble. Travaillons sur la livraison d'articles !",
          matchSpeech: "Excellent! Let's practice with this sentence: 'The delivery is very fast and secure.' Repeat with me!",
          matchNext: "Prononcez : 'The delivery is very fast and secure.'",
          failSpeech: "Don't worry, we are here to learn. Repeat after me: 'How much does it cost?'",
          failExplanation: "💡 Explication : C'est normal de faire des erreurs ! Cette phrase signifie 'Combien ça coûte ?'. En anglais : 'How much does it cost?'. N'hésitez pas à répéter.",
          failNext: "Répétez la phrase simple après Lia."
        },
        es: {
          start: "¡Hola! Soy tu entrenadora de idiomas Lia. ¿Cuál es tu objetivo al aprender español y cuáles son tus puntos débiles? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Excellent ! Vous parlez déjà très bien. Pratiquons maintenant le vocabulaire du commerce et de la livraison.",
          matchSpeech: "¡Excelente! Vamos a practicar con esta frase de entrega: 'El envío es muy rápido y seguro.' ¡Repite conmigo!",
          matchNext: "Prononcez : 'El envío es muy rápido y seguro.'",
          failSpeech: "No te preocupe. Estoy aquí para ayudarte. Repite conmigo: '¿Cuánto cuesta?'",
          failExplanation: "💡 Explication : Les erreurs sont normales. Cette phrase signifie 'Combien ça coûte ?'. En espagnol : '¿Cuánto cuesta?'. Répétez tranquillement.",
          failNext: "Répétez la phrase simple après Lia."
        },
        de: {
          start: "Hallo! Ich bin deine Sprachtrainerin Lia. Was ist dein Ziel beim Deutschlernen und was sind deine Schwachstellen? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Très bon début ! Vos bases en allemand sont encourageantes. Travaillons sur le commerce de vêtements.",
          matchSpeech: "Hervorragend! Lass uns mit diesem Satz üben: 'Die Lieferung ist sehr schnell und sicher.' Sprich mir nach!",
          matchNext: "Prononcez : 'Die Lieferung ist sehr schnell und sicher.'",
          failSpeech: "Keine Sorge, ich bin hier um dir zu helfen. Wiederhole mit mir: 'Wie viel kostet das?'",
          failExplanation: "💡 Explication : C'est en faisant des erreurs qu'on apprend. La phrase signifie 'Combien ça coûte ?'. En allemand : 'Wie viel kostet das?'. Répétez après moi.",
          failNext: "Répétez la phrase simple après Lia."
        },
        it: {
          start: "Ciao! Sono la tua insegnante di lingua Lia. Qual è il tuo obiettivo nell'apprendimento dell'italiano e quali sono le tue difficoltà? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Magnifico! Un ottimo inizio. Pratiquons maintenant le vocabulaire de la mode et de l'expédition.",
          matchSpeech: "Eccellente! Pratichiamo con questa frase: 'La spedizione è molto veloce e sicura.' Ripeti con me!",
          matchNext: "Prononcez : 'La spedizione è molto veloce e sicura.'",
          failSpeech: "Non ti preoccupare, sono qui per aiutarti. Ripeti con me: 'Quanto costa?'",
          failExplanation: "💡 Explication : Ne vous inquiétez pas, l'italien s'apprend pas à pas. 'Quanto costa?' signifie 'Combien ça coûte ?'. Répétez tranquillement.",
          failNext: "Répétez la phrase simple après Lia."
        },
        tr: {
          start: "Merhaba! Ben dil koçunuz Lia. Türkçe öğrenmedeki hedefiniz nedir ve en çok nerede zorlanıyorsunuz? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Harika! Très bien formulé. Travaillons maintenant sur la commande d'un vêtement en turc.",
          matchSpeech: "Harika! Şu cümleyle pratik yapalım: 'Teslimat çok hızlı ve güvenli.' Benimle tekrar edin!",
          matchNext: "Prononcez : 'Teslimat çok hızlı ve güvenli.'",
          failSpeech: "Endişelenmeyin, size yardım etmek için buradayım. Benimle tekrar edin: 'Bu ne kadar?'",
          failExplanation: "💡 Explication : Pas de soucis, le turc est une langue très logique. 'Bu ne kadar?' signifie 'Combien ça coûte ?'. Répétez doucement.",
          failNext: "Répétez la phrase simple après Lia."
        },
        ar: {
          start: "مرحباً! أنا مدربتك اللغوية ليا. ما هو هدفك من تعلم اللغة العربية وما هي نقاط ضعفك؟ (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ رائع جداً! إجابة ممتازة وسليمة. دعنا نتدرب الآن على التوصيل والشراء.",
          matchSpeech: "ممتاز! فلنتدرب على هذه الجملة: 'التوصيل سريع جداً وآمن.' كرر معي!",
          matchNext: "Prononcez : 'التوصيل سريع جداً وآمن.'",
          failSpeech: "لا تقلق، أنا هنا لمساعدتك. كرر معي: 'كم ثمن هذا؟'",
          failExplanation: "💡 توضيح: لا بأس بالخطأ، فنحن نتعلم بالتدريج. جملة 'كم ثمن هذا؟' تعني 'Combien coûte ceci ?'. كررها ببطء.",
          failNext: "Répétez la phrase simple après Lia."
        },
        fr: {
          start: "Bonjour ! Je suis Lia, votre coach de français. Quel est votre objectif d'apprentissage et quelles sont vos principales difficultés ?",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Excellent français ! Votre prononciation est impeccable. Continuons sur le vocabulaire e-commerce.",
          matchSpeech: "Superbe ! Répétez après moi : 'La livraison de ce colis est extrêmement rapide et sécurisée.'",
          matchNext: "Prononcez : 'La livraison de ce colis est extrêmement rapide et sécurisée.'",
          failSpeech: "Ne vous inquiétez pas, tout s'apprend ! Répétez avec moi : 'Combien coûte cet article ?'",
          failExplanation: "💡 Explication : Prenez votre temps. La phrase clé pour demander un tarif est : 'Combien coûte cet article ?'. Reprenez à votre rythme.",
          failNext: "Répétez la phrase simple après Lia."
        },
        ru: {
          start: "Привет! Я твой тренер по языку Лия. Какова твоя цель в изучении русского языка и какие у тебя трудности? (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ Отлично! Une superbe réponse en russe. Pratiquons le vocabulaire des commandes en ligne.",
          matchSpeech: "Отлично! Давай попрактикуемся с этой фразой: 'Доставка очень быстрая и безопасная.' Повторяй за мной!",
          matchNext: "Prononcez : 'Доставка очень быстрая и безопасная.'",
          failSpeech: "Не переживай, я здесь, чтобы помочь. Повторяй за мной: 'Сколько это стоит?'",
          failExplanation: "💡 Explication : C'est normal de buter au début, le russe est очень богатый (très riche). 'Сколько это стоит?' signifie 'Combien ça coûte ?'. Répétez doucement.",
          failNext: "Répétez la phrase simple après Lia."
        },
        ja: {
          start: "こんにちは！語学コーチのリアです。日本語を学ぶ目的は何ですか？また、苦手なところはどこですか？ (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ 素晴らしい！ C'est parfait. Pratiquons maintenant l'achat en ligne en japonais.",
          matchSpeech: "素晴らしいですね！次のフレーズを練習しましょう：'配送はとても早くて安全です。' リピートしてください！",
          matchNext: "Prononcez : '配送はとても早くて安全です。'",
          failSpeech: "心配しないで、私がサポートします。リピートしてください：'いくらですか？'",
          failExplanation: "💡 Explication : C'est normal, le japonais s'apprend par l'usage quotidien. 'いくらですか？' (Ikura desu ka?) signifie 'Combien ça coûte ?'. Reprenez sereinement.",
          failNext: "Répétez la phrase simple après Lia."
        },
        zh: {
          start: "你好！我是你的语言教练莉亚。你学习中文的目标是什么？你觉得最难的是什么？ (Quel est ton but principal ou tes difficultés ?)",
          startNext: "Partagez vos objectifs de langue ou vos points faibles.",
          matchExplanation: "✨ 太棒了！ Une prononciation et une grammaire admirables. Travaillons sur les achats.",
          matchSpeech: "太棒了！让我们练习这个句子：'配送非常快速且安全。' 跟我读！",
          matchNext: "Prononcez : '配送非常快速且安全。'",
          failSpeech: "别担心，我会帮助你的。跟我读：'这个多少钱？'",
          failExplanation: "💡 Explication : Le chinois nécessite de la patience. '这个多少钱？' (Zhège duōshǎo qián?) signifie 'Combien coûte ceci ?'. Répétez doucement.",
          failNext: "Répétez la phrase simple après Lia."
        }
      };

      const defaultLangData = fallbackPhrases[lang] || fallbackPhrases["en"];

      const runVoiceFallback = () => {
        // High fidelity multi-lingual simulator fallback
        const isStart = !transcription;
        if (isStart) {
          if (mode === "conversation") {
            return res.json({
              speechText: lang === "es" ? "¡Hola! Soy Lia, tu entrenadora de idiomas. ¿Cómo estás hoy? ¿Cómo te llamas?" : "Hello! I am Lia, your language coach. How are you doing today? What is your name?",
              corrections: "💡 Lia est prête à d'iscuter librement h24 ! Présentez-vous, demandez-lui comment elle va, parlez de ce que vous faites et ce que vous aimez.",
              nextTask: "Présentez-vous à Lia (Nom, comment ça va, ce que vous aimez...)"
            });
          } else {
            return res.json({
              speechText: defaultLangData.start,
              corrections: "💡 Lia a lancé l'appel ! Partagez vos objectifs de langue ou vos difficultés pour commencer votre coaching personnalisé.",
              nextTask: defaultLangData.startNext
            });
          }
        }

        const userWords = transcription.toLowerCase();
        const isUserLost = userWords.includes("sais pas") || userWords.includes("comprends pas") || userWords.includes("pas la réponse") || userWords.includes("aide") || userWords.includes("lost") || userWords.includes("perdu") || userWords.includes("pourquoi") || userWords.includes("connais pas");

        if (isUserLost) {
          return res.json({
            speechText: defaultLangData.failSpeech,
            corrections: defaultLangData.failExplanation,
            nextTask: defaultLangData.failNext
          });
        }

        if (mode === "conversation") {
          return res.json({
            speechText: lang === "es" ? "¡Qué bien! Me gusta mucho hablar contigo. ¿Cuáles son tus pasatiempos favoritos?" : "That's wonderful! I really enjoy talking with you. What are your favorite hobbies?",
            corrections: "✨ Discussion libre : Lia apprécie votre présentation ! Elle vous demande maintenant quels sont vos loisirs préférés.",
            nextTask: "Parlez de vos loisirs et demandez à Lia ce qu'elle aime faire."
          });
        }

        return res.json({
          speechText: defaultLangData.matchSpeech,
          corrections: defaultLangData.matchExplanation,
          nextTask: defaultLangData.matchNext
        });
      };

      const client = getGeminiClient();
      if (!client) {
        return runVoiceFallback();
      }

      try {
        const historyStr = (history || [])
          .map((h: any) => `${h.role === 'coach' ? 'Lia' : 'Student'}: "${h.text}"`)
          .join("\n");

        const prompt = `You are "Lia", an extremely warm, empathetic, friendly, and highly professional AI Language Coach simulating a realistic, highly immersive phone call with a student.
The student has chosen to practice the language with code '${lang}' in the specialized context of their learning category: '${cat}' (e.g. travel, shipping logistics, living/working abroad, hobbies and entertainment).
We are currently in the call mode: '${mode}' (options: 'exercises' or 'conversation').

Here is the conversation history so far:
${historyStr || "(No conversation history yet - this is the beginning of the call)"}

Student's latest transcription: "${transcription || ""}"

CRITICAL CONVERSATIONAL DIRECTIVES BASED ON MODE:

--- MODE: 'conversation' (Discussion Libre, Présentation & Chat) ---
- Goal: Engage in a friendly, unlimited, 24/7 free-flowing conversation with the student. Chat about how they are doing, ask them to introduce themselves, share details about yourself when asked (You are Lia, you love teaching languages, you are always available 24/7 to help, you love cultural exchanges, Algerian coffee, and traditional Algerian pastries like baklawa!). Ask them about their interests, daily life, hobbies, or whatever they want to talk about.
- Do NOT act like a rigid school teacher giving formal tests. Keep the vibe natural, friendly, warm, and highly engaging.
- In "speechText", respond naturally in the target language '${lang}' (1 to 3 short, friendly sentences). Speak clearly and at a moderate pace.
- In "corrections" (written 100% in French), provide a highly supportive breakdown of any minor grammar, vocabulary, or pronunciation errors they made in their response. If they did great, warmly praise them and explain any native idioms or cultural facts. If they asked you questions (e.g., "what do you like?", "how are you?"), answer them here in French so they understand fully what you said, while keeping "speechText" in '${lang}'.
- In "nextTask", suggest a short friendly conversational topic in French (e.g., "Parlez de ce que vous faites dans la vie", "Demandez à Lia ce qu'elle aime faire", "Partagez votre plat préféré").

--- MODE: 'exercises' (Exercices de Langue Variés & Riches) ---
- Goal: Provide the student with a highly diverse set of verbal exercises (NOT just simple translation tasks!).
- You must rotate through or choose different interactive exercise types from turn to turn:
  1. **Pronunciation repeating (Prononciation)**: Present a highly useful, realistic sentence in '${lang}' related to '${cat}' and ask the student to repeat it after you exactly.
  2. **Fill-in-the-blank (Phrases à trous)**: Provide a sentence with one word missing (e.g., "In the sentence 'The delivery arrives ___ Monday', what is the missing preposition?") and ask them to find it.
  3. **Vocabulary quiz (Vocabulaire)**: Ask for synonyms/antonyms of a word, or ask them to list 3 specific words in '${lang}' related to a topic (e.g., "Name 3 fruits in English" or "Name 3 travel items").
  4. **Grammar drill (Grammaire)**: Ask them to change a sentence (e.g., convert "I buy shoes" to past tense) or conjugate a specific verb.
  5. **Scenario roleplay (Mises en situation)**: Set up a realistic scenario (e.g., "You are at a store and want to ask if they accept credit cards. How do you ask the seller in '${lang}'?").
- In "speechText", present the exercise clearly, warmly, and concisely in target language '${lang}'.
- In "corrections" (written 100% in French), explain the grammar rule or word meaning, correct their input, and provide encouraging feedback.
- In "nextTask", write a short, clear instruction in French on what they should speak next (e.g., "Complétez la phrase", "Répétez la phrase", "Répondez au quiz de vocabulaire").

GENERAL CORE RULES:
1. INITIAL GREETING:
   If this is the beginning of the call (history and transcription are empty), start with a friendly introduction of yourself as Lia and launch the chosen mode:
   - If conversation mode: greet them, say you are excited to chat, introduce yourself, and ask how they are doing today.
   - If exercises mode: greet them, say we will do dynamic exercises to boost their skills, and present the first exercise.
2. SUPPORTIVE CORRECTIONS:
   Always analyze the student's transcript "${transcription}". Provide the corrections, tips, and translations in French in the "corrections" field.
3. GRACEFUL FRENCH FALLBACK:
   If they speak in French or say "je ne sais pas", "je comprends pas", "aide-moi", support them 100%. Explain the answer in French in "corrections" and speak in simplified, slow target language in "speechText" to help them repeat a very simple word/phrase.
4. DIALOGUE CONSTRAINTS:
   - "speechText": Must be strictly in target language '${lang}' (no markdown, clean for TTS).
   - "corrections": Must be 100% in French.
   - "nextTask": Short, clear instruction in French.`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                speechText: { type: Type.STRING, description: "Your direct spoken response strictly in the target language (no markdown, keep it friendly and short for text-to-speech)." },
                corrections: { type: Type.STRING, description: "Your detailed grammar/vocabulary corrections, conceptual explanation in French, and warm encouragement." },
                nextTask: { type: Type.STRING, description: "A short instruction in French of what the user should try to say/translate next." }
              },
              required: ["speechText", "corrections", "nextTask"]
            },
            temperature: 0.7
          }
        });

        const responseText = response.text || "";
        try {
          const parsed = safeParseJson(responseText);
          return res.json(parsed);
        } catch (parseErr) {
          console.error("Failed to parse Gemini voice session response:", responseText);
          return res.json({
            speechText: defaultLangData.failSpeech,
            corrections: "• Une légère erreur d'analyse est survenue. " + defaultLangData.failExplanation,
            nextTask: defaultLangData.failNext
          });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed for voice-session. Falling back to offline voice fallback. Error:", geminiErr.message || geminiErr);
        return runVoiceFallback();
      }
    } catch (err: any) {
      console.error("Error in AI voice call endpoint:", err);
      return res.status(500).json({ error: "Erreur lors du traitement de l'appel vocal." });
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
