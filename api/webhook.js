import axios from 'axios';

// 1. Enlaces oficiales
const LINKS = {
  hotmartIA: 'https://go.hotmart.com/O107675193N?ap=27c6',
  temu: 'https://temu.to/k/ge7bkwnomjl',
  amazon: 'https://www.amazon.com',
  shein: 'https://www.shein.com',
  linktree: 'https://linktr.ee/mellashopcaribe',
  imagenBiblioteca: 'https://raw.githubusercontent.com/jorgeluismellacuevas21-rgb/luna/main/public/biblioteca.jpg'
};

// 2. Diccionarios de disparo
const IA_KEYWORDS = ['sdr', 'ia', 'inteligencia', 'bot', 'bots', 'crm', 'automatizacion', 'automatización', '120', 'catalogo', 'catálogo', 'sistema', 'sistemas', '2', 'academia', 'jorge', 'ceo', 'analisis ceo'];
const ECOMMERCE_KEYWORDS = ['belleza', 'hogar', 'herramientas', 'temu', 'shein', 'amazon', '1', 'luna', 'zapato', 'zapatos', 'compras', 'cartera', 'carteras', 'otros'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const rawText = message.text ? message.text.body.trim() : '';
      
      const cleanText = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const isIA = IA_KEYWORDS.some(key => cleanText.includes(key));
      const isEcom = ECOMMERCE_KEYWORDS.some(key => cleanText.includes(key));

      // A. RUTA JORGE LUIS (IA ACADEMY) CON IMAGEN + TEXTO UNIDOS
      if (isIA) {
        const iaCaption = 
          `¡Hola! Te habla Jorge Luis, especialista de Implementa IA Academy. ✨🚀\n\n` +
          `La inteligencia artificial está transformando los negocios al automatizar prospectos, ventas y análisis de gestión. Aquí te destaco las *10 Soluciones Principales* de nuestra academia:\n\n` +
          `1️⃣ *SDR Multi-Agent:* Calificación y prospección automática.\n` +
          `2️⃣ *CRM AI System:* Integración inteligente de leads.\n` +
          `3️⃣ *Análisis CEO & Métricas:* Dashboards de control directivo con IA.\n` +
          `4️⃣ *WhatsApp API Meta:* Automatización oficial 24/7 sin bloqueos.\n` +
          `5️⃣ *System Voice Agent AI:* Agentes de voz para llamadas automáticas.\n` +
          `6️⃣ *VideoFlow AI:* Generación masiva de contenido visual.\n` +
          `7️⃣ *Automaty Meta Ads:* Optimización de campañas.\n` +
          `8️⃣ *ChatBot Funnel AI:* Embudos de conversión en chat.\n` +
          `9️⃣ *Prompt Engineering PRO:* Dominio de instrucciones avanzadas.\n` +
          `🔟 *Database Lead Scraper:* Extracción de prospectos.\n\n` +
          `💡 *Nuestro catálogo completo incluye más de 120 soluciones y sistemas en IA.*\n\n` +
          `Puedes explorar el catálogo completo y acceder al programa oficial aquí:\n` +
          `👉 ${LINKS.hotmartIA}\n\n` +
          `¿Qué proceso de tu empresa te gustaría automatizar hoy?`;

        await sendWhatsAppImageWithCaption(from, LINKS.imagenBiblioteca, iaCaption);

      } 
      // B. RUTA LUNA (E-COMMERCE)
      else if (isEcom) {
        const ecomText = 
          `¡Hola! Te saluda LUNA, tu asesora de compras en MellaShopCaribe. 🛍️✨\n\n` +
          `En MellaShopCaribe seleccionamos lo mejor en tendencias, calidad y excelentes precios para Temu, Amazon, Shein y otros con envíos a RD y USA.\n\n` +
          `Accede a nuestro Linktree oficial para ingresar a las tiendas principales:\n` +
          `🔗 ${LINKS.linktree}\n\n` +
          `¿Buscas algún producto en específico hoy?`;

        await sendWhatsAppText(from, ecomText);
      } 
      // C. MENÚ PRINCIPAL
      else {
        const welcomeText = 
          `¡Hola! Te damos la bienvenida a MellaShopCaribe. 🛍️✨💻\n\n` +
          `Estamos listos para ayudarte:\n\n` +
          `1️⃣ *E-Commerce & Compras:* Temu, Amazon, Shein, otros (LUNA)\n` +
          `2️⃣ *Inteligencia Artificial & Automatizaciones:* SDR, CRM, Análisis CEO (Jorge Luis)\n\n` +
          `Escríbenos el número *1* o *2*, o la palabra *Catalogo*.`;

        await sendWhatsAppText(from, welcomeText);
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}

async function sendWhatsAppText(to, textBody) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: textBody }
      }
    });
  } catch (error) {
    console.error('Error texto:', error.response?.data || error.message);
  }
}

async function sendWhatsAppImageWithCaption(to, imageUrl, captionText) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        to: to,
        type: 'image',
        image: { 
          link: imageUrl,
          caption: captionText
        }
      }
    });
  } catch (error) {
    console.error('Error imagen+caption:', error.response?.data || error.message);
  }
}
