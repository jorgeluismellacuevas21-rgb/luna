import axios from 'axios';

export default async function handler(req, res) {
  // 1. Validación del Webhook de Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification token mismatch' });
      }
    }
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // 2. Recepción y procesamiento de mensajes (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message) {
          const from = message.from;
          const text = message.text?.body || '';
          const lowerText = text.toLowerCase().trim();

          // Capa Anti-Spam: Filtro de longitud
          if (text.length > 1000) {
            return res.status(200).json({ status: 'ignored_spam' });
          }

          // RUTA 1: Detección para Implementa IA Academy
          if (
            lowerText.includes('ia') ||
            lowerText.includes('implementa') ||
            lowerText.includes('crm') ||
            lowerText.includes('automatizar') ||
            lowerText.includes('ads') ||
            lowerText.includes('seo') ||
            lowerText.includes('video')
          ) {
            await sendWhatsAppMessage(from, {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: from,
              type: "text",
              text: {
                preview_url: true,
                body: "¡Hola! Soy Jorge Luis, agente de Implementa IA Academy 🚀\n\n10 destacadas + catálogo 120+:\n1 CRM AI, 2 WhatsApp API Meta, 3 GIP-AI Videos, 4 Google Ads AI, 5 Mega Redes 2.0, 6 VideoFlow, 7 SEO, 8 LinkedIn+IG, 9 Meta Ads, 10 Voz Real\n\n¿De las 10 cuál te duele más?\nDemo 5min para USA/RD.\n\nAcceso: https://go.hotmart.com/O107675193N?ap=27c6"
              }
            });
          } 
          // RUTA 2: Detección para MellaShopCaribe
          else {
            await sendWhatsAppMessage(from, {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: from,
              type: "text",
              text: {
                preview_url: true,
                body: "¡Hola! Soy LUNA de MellaShopCaribe 🛍️\n\nTenemos afiliación global: Temu USA/España, Shein, Hotmart, Amazon USA y Amazon España. Envío internacional.\n\n¿Prefieres Amazon USA, Amazon España, Temu o Shein? Te paso Top3 con link de tu país + alternativa local RD 2500RD$ perfume.\n\nSi buscas Soluciones de Inteligencia Artificial escribe: IA"
              }
            });
          }
        }
        return res.status(200).json({ status: 'success' });
      }

      return res.status(404).json({ error: 'Event not supported' });
    } catch (error) {
      console.error('Error procesando mensaje:', error?.response?.data || error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(451).json({ error: 'Method Not Allowed' });
}

async function sendWhatsAppMessage(to, payload) {
  const url = `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`;
  await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}
