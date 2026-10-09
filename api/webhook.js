const requestTracker = new Map();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const body = req.body;
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (message && message.text) {
      const fromNumber = message.from;
      const rawMsg = message.text.body || "";

      // --- CAPA 1 ANTI-SPAM ---
      if (rawMsg.length > 1000) {
        return res.status(200).json({ status: 'ignored_spam_length' });
      }

      const now = Date.now();
      const userRequests = requestTracker.get(fromNumber) || [];
      const recentRequests = userRequests.filter(time => now - time < 10000);

      if (recentRequests.length >= 4) {
        return res.status(200).json({ status: 'ignored_rate_limit' });
      }
      recentRequests.push(now);
      requestTracker.set(fromNumber, recentRequests);

      // --- LÓGICA DE RESPUESTA BIFURCADA ---
      const cleanMsg = rawMsg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const triggersIA = ["10", "120", "implementa", "soluciones", "incluye", "ia", "crm", "sdr", "bot", "automatizar", "academy"];
      const esIA = triggersIA.some(word => cleanMsg.includes(word));

      let replyText = "";

      if (esIA) {
        replyText = "¡Hola! Soy Jorge Luis, agente de Implementa IA Academy 🚀\n\n10 destacadas + catálogo 120+:\n1 CRM AI, 2 WhatsApp API Meta, 3 GIP-AI Videos, 4 Google Ads AI, 5 Mega Redes 2.0, 6 VideoFlow, 7 SEO, 8 LinkedIn+IG, 9 Meta Ads, 10 Voz Real\n\n¿De las 10 cuál te duele más? Demo 5min para USA/RD.\n\nAcceso: https://go.hotmart.com/O107675193N?ap=27c6";
      } else {
        replyText = "¡Hola! Soy LUNA de MellaShopCaribe 🛍️\n\nTenemos afiliación global: Temu USA/España, Shein, Hotmart, Amazon USA y Amazon España. Envío internacional.\n\n¿Prefieres Amazon USA, Amazon España, Temu o Shein? Te paso Top3 con link de tu país + alternativa local RD 2500RD$ perfume.\n\nSi buscas Soluciones de Inteligencia Artificial escribe: IA";
      }

      await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: fromNumber,
          text: { body: replyText },
        }),
      });
    }

    return res.status(200).json({ status: 'success' });
  }

  return res.status(405).end();
}
