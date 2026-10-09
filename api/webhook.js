import axios from "axios";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "implementa123";
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const BIBLIOTECA_IMG = "https://luna-fawn-one.vercel.app/biblioteca.jpg";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
  }

  if (req.method === "POST") {
    try {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message) return res.status(200).send("OK");

      const from = message.from;
      const text = message.text?.body?.toLowerCase() || "";

      if (text.includes("biblioteca") || text.includes("menu") || text.includes("soluciones") || text.includes("info")) {
        await axios.post(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            type: "image",
            image: {
              link: BIBLIOTECA_IMG,
              caption: "📚 *Biblioteca de Soluciones IA*\n\nImplementa IA Academy - 10 soluciones listas para tu negocio.\n\nEscribe el número que te interesa (1 al 10) 👇"
            }
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
      }

      return res.status(200).send("OK");
    } catch (error) {
      console.error("Error webhook:", error.response?.data || error.message);
      return res.status(200).send("OK");
    }
  }

  return res.status(405).send("Method not allowed");
}
