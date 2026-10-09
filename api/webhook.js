import axios from 'axios';

export default async function handler(req, res) {
  // 1. Verificación del Webhook para Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Recepción y respuesta de mensajes (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const rawText = message.text ? message.text.body.trim() : '';

      console.log('Mensaje recibido de:', from, 'Texto:', rawText);

      // Limpieza y sanitización de texto
      const text = rawText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // CASO ESPECIAL: Si piden explícitamente "ia" o "biblioteca", envía la IMAGEN
      if (text === 'ia' || text === 'biblioteca') {
        await sendWhatsAppImage(from);
        return res.status(200).send('EVENT_RECEIVED');
      }

      // PRIORIDAD 1: JORGE LUIS (Implementa IA Academy)
      const keywordsJorge = [
        '10', '120', 'implementa', 'soluciones', 'incluye', 'inteligencia',
        'automatizar', 'agente', 'bot', 'chatbot', 'negocio', 'empresa', 'leads',
        'ventas', 'crm', 'pipeline', 'embudo', 'funnel', 'whatsapp api', 'voz',
        'elevenlabs', 'maps', 'seo', 'ads', 'facturar', 'escalar', 'sistema', 'academy'
      ];

      // PRIORIDAD 2: LUNA (MellaShopCaribe)
      const keywordsLuna = [
        'bella', 'nails', 'perfume', 'fragancia', 'maquillaje', 'hogar', 'casa',
        'cocina', 'bano', 'limpieza', 'decoracion', 'todo para el hogar',
        'herramientas', 'electrica', 'mecanica', 'taladro', 'destornillador',
        'ferreteria', 'bricolaje', 'taller', 'temu', 'shein', 'amazon', 'hotmart',
        'producto', 'comprar', 'tienda', 'precio', 'envio', 'rd', 'usa'
      ];

      const isJorge = keywordsJorge.some(keyword => text.includes(keyword));
      const isLuna = keywordsLuna.some(keyword => text.includes(keyword));

      if (isJorge) {
        const responseJorge = "Hola, soy Jorge Luis de Implementa IA Academy 🚀 10 destacadas + catalogo 120+: 1 CRM AI, 2 WhatsApp API Meta, 3 GIP-AI Videos, 4 Google Ads AI, 5 Mega Redes 2.0, 6 VideoFlow, 7 SEO, 8 LinkedIn+IG, 9 Meta Ads, 10 Voz Real. Acceso: https://go.hotmart.com/O107675193N?ap=27c6";
        await sendWhatsAppText(from, responseJorge);
      } else if (isLuna) {
        const responseLuna = "Hola, soy LUNA de MellaShopCaribe 🛍️ Afiliación global Temu USA/España, Shein, Hotmart, Amazon USA y España. Todo para el hogar, herramientas eléctricas y mecánicas, belleza y más. Envío internacional USA/RD. ¿Qué producto buscas?";
        await sendWhatsAppText(from, responseLuna);
      }

      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(200).send('NO_MESSAGE');
  }

  return res.status(405).send('Method Not Allowed');
}

// Función para enviar la IMAGEN de la Biblioteca IA
async function sendWhatsAppImage(to) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const imageUrl = 'https://luna-fawn-one.vercel.app/biblioteca.jpg';

  const captionText = 
    '🚀 *Biblioteca de Soluciones IA - Implementa IA Academy*\n\n' +
    '10 soluciones de Inteligencia Artificial listas para automatizar y escalar tu negocio.\n\n' +
    '🔗 *Acceso inmediato al catálogo completo:*\n' +
    'https://go.hotmart.com/O107675193N?ap=27c6\n\n' +
    'Escribe el número de la solución que más te interesa (del 1 al 10) para ver una demostración.';

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'image',
        image: { link: imageUrl, caption: captionText }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error enviando imagen:', error.response ? error.response.data : error.message);
  }
}

// Función para enviar TEXTO
async function sendWhatsAppText(to, messageText) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: messageText }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error enviando texto:', error.response ? error.response.data : error.message);
  }
}
