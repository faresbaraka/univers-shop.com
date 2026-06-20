import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

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
