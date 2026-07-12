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

      // Initiate streaming request to Gemini 2.5 Flash
      const responseStream = await client.models.generateContentStream({
        model: "gemini-2.5-flash",
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

  // Dynamic Gemini Language Exercises Generator Endpoint
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

      const prompt = `You are an expert language teacher. Generate an interactive quiz for a student learning the language with code '${lang}' in the category '${cat}'.
You must return a single JSON object with the exact structure:
{
  "matchPairs": [
    {"foreign": "word in target language relating to category", "native": "French translation"},
    {"foreign": "word in target language relating to category", "native": "French translation"},
    {"foreign": "word in target language relating to category", "native": "French translation"},
    {"foreign": "word in target language relating to category", "native": "French translation"}
  ],
  "wordBank": {
    "targetPhrase": "A full sentence in target language (e.g., 'I want to buy this')",
    "translation": "French translation of that full sentence",
    "availableWords": ["Word1", "Word2", "Word3", "distractor1", "distractor2", "distractor3"],
    "correctWords": ["Word1", "Word2", "Word3"],
    "pronunciation": "Phonetic pronunciation guide"
  },
  "multipleChoice": {
    "targetPhrase": "Another phrase in target language to check comprehension",
    "options": ["Correct French translation", "Incorrect translation 1", "Incorrect translation 2"],
    "correctIndex": 0,
    "pronunciation": "Phonetic pronunciation guide"
  }
}
Return ONLY valid JSON. Do not include markdown or backticks. Translate terms accurately and make the content interesting and realistic for category '${cat}' (options: voyage, commerce, vivre_la_bas, loisir).`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });

      const responseText = response.text || "";
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      } catch (parseErr) {
        console.error("Failed to parse Gemini response for exercises. Content was:", responseText);
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
      const { transcription, history, targetLang, category } = req.body;
      const lang = targetLang || "en";
      const cat = category || "voyage";

      const client = getGeminiClient();
      if (!client) {
        // Fallback simulated chat coach
        const isStart = !transcription;
        let speechText = "";
        let corrections = "";
        let nextTask = "";

        if (isStart) {
          speechText = lang === "es"
            ? "¡Hola! Soy tu entrenadora de idiomas Lia. ¿Cuál es tu objetivo al aprender español y cuáles son tus puntos débiles? (En français : Quel est ton but et tes points faibles ?)"
            : lang === "de"
            ? "Hallo! Ich bin deine Sprachtrainerin Lia. Was ist dein Ziel beim Deutschlernen und was sind deine Schwachstellen? (En français : Quel est ton but et tes points faibles ?)"
            : "Hello! I am your language coach Lia. What is your goal in learning English and what are your main weaknesses? (En français : Quel est ton but et tes points faibles ?)";
          corrections = "💡 Lia a lancé l'appel ! Dites-lui votre but d'apprentissage ou vos points faibles pour qu'elle puisse adapter ses exercices.";
          nextTask = "Partage ton but ou tes points faibles (par exemple: parler, grammaire, voyager...)";
        } else {
          const userWords = transcription.toLowerCase();
          const isUserLost = userWords.includes("sais pas") || userWords.includes("comprends pas") || userWords.includes("pas la réponse") || userWords.includes("aide") || userWords.includes("lost") || userWords.includes("perdu") || userWords.includes("pourquoi") || userWords.includes("connais pas");
          
          if (isUserLost) {
            speechText = lang === "es"
              ? "No te preocupes. Estoy aquí para ayudarte. Vamos a ir paso a paso. Repite conmigo: '¿Cuánto cuesta?'"
              : lang === "de"
              ? "Keine Sorge. Ich bin hier, um dir zu helfen. Lass uns Schritt für Schritt gehen. Wiederhole mit mir: 'Wie viel kostet das?'"
              : "Don't worry. I am here to help you. Let's go step by step. Repeat after me: 'How much does it cost?'";
            corrections = `💡 Explication (Français) : C'est tout à fait normal de ne pas savoir ! L'apprentissage se fait par essais et erreurs. La phrase demandée signifie 'Combien coûte cette livraison ?'. En anglais, on dit 'How much does this delivery cost?'. N'hésite pas à répéter à ton rythme !`;
            nextTask = "Répétez la phrase simple après Lia.";
          } else {
            const matchesCost = userWords.includes("how") || userWords.includes("much") || userWords.includes("cost") || userWords.includes("delivery") || userWords.includes("cuánto") || userWords.includes("cuesta") || userWords.includes("kostet") || userWords.includes("but") || userWords.includes("objectif") || userWords.includes("voyag") || userWords.includes("parler");

            if (matchesCost) {
              speechText = lang === "es"
                ? "¡Excelente! Comprendo perfectamente tu situación. Vamos a practicar con esta frase de entrega: 'El envío es muy rápido.'"
                : lang === "de"
                ? "Hervorragend! Ich verstehe deine Situation vollkommen. Lass uns mit diesem Liefersatz üben: 'Die Lieferung ist sehr schnell.'"
                : "Excellent! I understand your situation perfectly. Let's practice with this delivery phrase: 'The delivery is very fast.'";
              corrections = `✨ Encouragement : Merveilleuse réponse ! Vous vous exprimez très bien. Nous allons progresser ensemble sur vos objectifs.`;
              nextTask = lang === "es" ? "Prononcer : 'El envío es muy rápido.'" : lang === "de" ? "Prononcer : 'Die Lieferung ist sehr schnell.'" : "Prononcer : 'The delivery is very fast.'";
            } else {
              speechText = lang === "es"
                ? "Interesante. Te escucho y quiero ayudarte. Dime, ¿puedes repetir: 'Quiero aprender rápido'?"
                : lang === "de"
                ? "Interessant. Ich höre dir zu und möchte dir helfen. Sag mir, kannst du wiederholen: 'Ich möchte schnell lernen'?"
                : "Interesting. I am listening to you and want to help you. Tell me, can you repeat: 'I want to learn fast'?";
              corrections = `💡 Conseil : J'ai bien reçu votre message : "${transcription}". Continuez à parler librement, je vais vous guider à chaque étape !`;
              nextTask = "Répétez la phrase d'apprentissage.";
            }
          }
        }

        return res.json({ speechText, corrections, nextTask });
      }

      const historyStr = (history || [])
        .map((h: any) => `${h.role === 'coach' ? 'Lia' : 'Student'}: "${h.text}"`)
        .join("\n");

      const prompt = `You are "Lia", an extremely warm, empathetic, and highly professional AI Language Coach simulating a realistic, highly immersive phone call with a student.
The student has chosen to practice the language with code '${lang}' in the specialized context of their learning category: '${cat}' (e.g. travel, shipping logistics, living/working abroad, hobbies and entertainment).

Here is the conversation history so far:
${historyStr || "(No conversation history yet - this is the beginning of the call)"}

Student's latest transcription: "${transcription || ""}"

CRITICAL CONVERSATIONAL DIRECTIVES (STRICTLY COMPLY WITH THE STUDENT'S INTENTION):
1. INITIAL QUESTION (GOAL & WEAK POINT ASSESSMENT):
   If this is the beginning of the call (i.e. conversation history is empty and transcription is empty, undefined, or indicates starting), Lia MUST ask the student (in target language '${lang}', followed by a brief, friendly French explanation) about:
   - What is their language learning goal (but / objectif)?
   - What is their main weakness or struggle (point faible / difficulté)?
   Example speechText for English: "Hello! I am your language coach Lia. Welcome! What is your main goal in learning English, and what are your main weaknesses? Quel est ton but principal ou tes difficultés ?"

2. VOICE CORRECTION & ANALYSIS:
   Lia MUST analyze the Student's latest transcription ("${transcription || ""}").
   - If there are grammatical, vocabulary, or pronunciation errors (or if they translated something poorly), provide a constructive, supportive breakdown of the errors in French or Arabic.
   - If they did well, warmly praise and encourage them.
   - Explain any new words, grammar concepts, or native idioms relevant to their response, keeping it highly educational.
   - Write this detailed coach feedback in the "corrections" field. Do not put this in "speechText".

3. GRACEFUL FRENCH FALLBACK & EMPOWERMENT:
   If the student's transcription is in French or contains phrases of confusion/defeat like "je ne sais pas", "je ne comprends pas", "je comprends rien", "aide-moi", "je suis perdu", "je ne trouve pas la réponse" or any other French words:
   - Lia must NOT get frustrated or stop. She must facilitate the student.
   - Lia must explain what the student didn't understand in the "corrections" field in French/Arabic, breaking it down into simple terms.
   - In "speechText" (spoken in target language with code '${lang}'), she should speak in a simplified, slow-paced target language to guide them, encouraging them and asking them to repeat a very basic, simple phrase first to build confidence.

4. KEEP THE CONVERSATION MOVING:
   - Do NOT just repeat "are you ready for more?". Instead, keep a natural, immersive roleplay conversation!
   - Based on what the student said, ask a follow-up question or present a realistic situation/exercise (e.g. "Now, imagine you are at the airport. How would you ask where the baggage claim is?" or "Try to say: I would like to order this item").
   - Ensure the conversation is interactive, teaching them relevant phrases for '${cat}' in '${lang}'.

5. DIALOGUE CONSTRAINTS:
   - "speechText": Write this primarily in target language with code '${lang}' (so the speech synthesizer of '${lang}' reads it beautifully without sounding garbled). If the student is deeply lost, you may include very brief, clear French words, but keep the core spoken voice in '${lang}'. Keep it concise (1 to 3 short sentences).
   - "corrections": Write this 100% in French or Arabic. This is shown on screen and read by the user. Use it to give amazing coaching tips, explain grammatical rules, translate phrases, and analyze the user's input: "${transcription || "(Connecting...)"}".
   - "nextTask": A very short, clear instruction written in French on what the user should speak/do next.

Format your output exactly as a single valid JSON object:
{
  "speechText": "Your direct spoken response strictly in the target language with code '${lang}'",
  "corrections": "Your detailed grammar/vocabulary corrections, conceptual explanation in French/Arabic, and warm encouragement.",
  "nextTask": "A short instruction indicating what the user should do or translate next, written in French"
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const responseText = response.text || "";
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      } catch (parseErr) {
        console.error("Failed to parse Gemini voice session response:", responseText);
        return res.json({
          speechText: "Pardon, je n'ai pas bien compris. Pouvez-vous répéter ?",
          corrections: "• Une erreur technique de compréhension est survenue. Réessayez.",
          nextTask: "Répétez votre phrase s'il vous plaît"
        });
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
