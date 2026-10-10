import axios from 'axios';

// 1. Catálogo de enlaces oficiales
const LINKS = {
  hotmartIA: 'https://go.hotmart.com/O107675193N?ap=27c6',
  temu: 'https://temu.to/k/ge7bkwnomjl',
  amazon: 'https://www.amazon.com',
  shein: 'https://www.shein.com',
  linktree: 'https://linktr.ee/mellashopcaribe',
  // Se usa el dominio principal de Vercel asignado a tu proyecto
  imagenBiblioteca: 'https://luna-fawn-one.vercel.app/biblioteca.jpg'
};

// 2. Diccionario de disparo para Jorge Luis (Implementa IA Academy - PRIORIDAD ABSOLUTA)
const IA_KEYWORDS = [
  'sdr', 'ia', 'inteligencia artificial', 'bot', 'bots', 'crm', 'automatizacion', 
  'automatización', 'prompts', 'videoflow', 'agente', 'implementa', 'soluciones',
  'inteligencia', 'academia', 'hotmart ia', 'curso ia', 'curso', 'cursos',
  '120', 'catalogo', 'catálogo', 'sistema', 'sistemas', 'programa', 'implementa ia'
];

// 3. Diccionario de disparo para LUNA (MellaShopCaribe / E-Commerce)
const ECOMMERCE_KEYWORDS = [
  'belleza', 'nails', 'perfume', 'fragancia', 'maquillaje', 'hogar', 'casa', 
  'cocina', 'bano', 'baño', 'limpieza', 'decoracion', 'decoración', 'todo para el hogar', 
  'herramientas genericas', 'herramientas', 'equipos electricos', 'mecanica', 'mecánica', 
  'taladro', 'destornillador', 'ferreteria', 'ferretera', 'bricolaje', 'taller', 
  'temu', 'shein', 'amazon', 'producto de hogar', 'compras de producto de hogar', 
  'tienda', 'precio', 'envio', 'envío', 'rd', 'usa', 'audifonos', 'auriculares', 'luna'
];

export default async function handler(req, res) {
  // Verificación del Webhook de Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Procesamiento de Mensajes Entrantes (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const rawText = message.text ? message.text.body.trim() : '';
      const textLower = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // A. RUTA JORGE LUIS (Implementa IA Academy)
      if (IA_KEYWORDS.some(key => textLower === key || textLower.includes(key))) {
        const iaCaption = 
          `¡Hola! Te habla Jorge Luis, especialista de Implementa IA Academy. ✨🚀\n\n` +
          `La inteligencia artificial está transformando los negocios al automatizar prospectos, ventas y contenido. Aquí te destaco las *10 Soluciones Principales* de nuestra academia:\n\n` +
          `1️⃣ *CRM AI System:* Gestión y calificado inteligente de leads.\n` +
          `2️⃣ *WhatsApp API Meta:* Automatización oficial 24/7 sin bloqueos.\n` +
          `3️⃣ *System Voice Agent AI:* Agentes de voz para llamadas automáticas.\n` +
          `4️⃣ *SDR Multi-Agent:* Calificación y prospección en piloto automático.\n` +
          `5️⃣ *VideoFlow AI:* Generación masiva de contenido visual.\n` +
          `6️⃣ *Automaty Meta Ads:* Optimización y escalado de campañas.\n` +
          `7️⃣ *ChatBot Funnel AI:* Embudos de conversión en chat.\n` +
          `8️⃣ *Prompt Engineering PRO:* Dominio de instrucciones avanzadas.\n` +
          `9️⃣ *Database Lead Scraper:* Extracción de prospectos locales y globales.\n` +
          `🔟 *Content Creator AI:* Creación de guiones y copys persuasivos.\n\n` +
          `💡 *Estas 10 herramientas son solo el comienzo: nuestro catálogo completo incluye más de 120 soluciones y sistemas en IA.*\n\n` +
          `Puedes explorar el catálogo completo y acceder al programa oficial aquí:\n` +
          `👉 ${LINKS.hotmartIA}\n\n` +
          `¿Qué proceso o área de tu empresa te gustaría automatizar hoy?`;

        // Intentar enviar la imagen con el texto como caption
        const imageSent = await sendWhatsAppImage(from, LINKS.imagenBiblioteca, iaCaption);
        
        // Si la imagen falla por tema de servidor/URL, enviar como texto plano para asegurar que siempre reciba el link
        if (!imageSent) {
          await sendWhatsAppText(from, iaCaption);
        }
      } 
      
      // B. RUTA LUNA (MellaShopCaribe / E-Commerce)
      else if (ECOMMERCE_KEYWORDS.some(key => textLower === key || textLower.includes(key))) {
        let destinationLink = LINKS.linktree;
        let storeName = "nuestra tienda principal";

        if (textLower.includes('temu') || textLower.includes('audifonos') || textLower.includes('auriculares')) {
          destinationLink = LINKS.temu;
          storeName = "el buscador directo de Temu";
        } else if (textLower.includes('amazon')) {
          destinationLink = LINKS.amazon;
          storeName = "el catálogo de Amazon";
        } else if (textLower.includes('shein')) {
          destinationLink = LINKS.shein;
          storeName = "la sección oficial de Shein";
        }

        const ecomText = 
          `¡Hola! Te saluda LUNA, tu asesora de compras en MellaShopCaribe. 🛍️✨\n\n` +
          `En MellaShopCaribe seleccionamos lo mejor en tendencias, calidad y excelentes precios para hogar, belleza, herramientas, tecnología, mecánica y bricolaje con envíos a República Dominicana (RD) y Estados Unidos (USA).\n\n` +
          `Ingresa a ${storeName} para ver disponibilidades y buscador directo:\n` +
          `👉 ${destinationLink}\n\n` +
          `O accede a nuestro Linktree oficial (con todas las tiendas arriba y nuestro enlace de IA en la parte inferior):\n` +
          `🔗 ${LINKS.linktree}\n\n` +
          `¿Buscas algún producto en específico hoy?`;

        await sendWhatsAppText(from, ecomText);
      } 

      // C. SALUDO GENERAL Y MENÚ INICIAL
      else {
        const welcomeText = 
          `¡Hola! Te damos la bienvenida a MellaShopCaribe. 🛍️✨💻\n\n` +
          `Estamos listos para ayudarte en dos áreas principales:\n\n` +
          `1️⃣ *E-Commerce & Compras:* Belleza, herramientas, hogar y tecnología para RD y USA (Atendido por LUNA).\n` +
          `2️⃣ *Inteligencia Artificial & Automatizaciones:* Catálogo de +120 soluciones y sistemas con Implementa IA Academy (Atendido por Jorge Luis).\n\n` +
          `Escríbenos qué producto o solución necesitas y con gusto te guiamos.`;

        await sendWhatsAppText(from, welcomeText);
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}

// FUNCIONES AUXILIARES DE ENVÍO POR API DE META

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
    return true;
  } catch (error) {
    console.error('Error enviando texto a WhatsApp:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function sendWhatsAppImage(to, imageUrl, captionText) {
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
    return true;
  } catch (error) {
    console.error('Error enviando imagen a WhatsApp:', error.response ? error.response.data : error.message);
    return false;
  }
}
