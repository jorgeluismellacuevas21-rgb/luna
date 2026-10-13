import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const CONFIG = {
  IA_COMISION: 'https://go.hotmart.com/O107675193N?ap=27c6',
  IA_DIRECTO: 'https://go.hotmart.com/O107675193N?dp=1',
  IMG_BIBLIOTECA: 'https://luna-fawn-one.vercel.app/biblioteca.jpg',
  TAG: 'jorgemella-21',
  PRODUCTOS: {
    FIRE: { nombre: 'Fire TV Stick 4K Max $39.99', url: 'https://www.amazon.com/dp/B08C1W5N87?tag=jorgemella-21' },
    AIRPODS: { nombre: 'Apple AirPods 4 $94.62', url: 'https://www.amazon.com/dp/B0DGHMNQ5Z?tag=jorgemella-21' },
    STANLEY: { nombre: 'Stanley Quencher $45.00', url: 'https://www.amazon.com/dp/B0BQZBFGZN?tag=jorgemella-21' },
    TEMU: { nombre: 'Organizador Premium Temu', url: 'https://www.temu.com/affiliate_account_activity.html' }
  }
};
async function sendWhatsApp(to, type, content) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const headers = { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' };
  const payload = type === 'text'? { messaging_product: 'whatsapp', to, type: 'text', text: { body: content } } : { messaging_product: 'whatsapp', to, type: 'image', image: { link: content.link, caption: content.caption } };
  await axios.post(url, payload, { headers });
}
function getOfertaHoy() {
  const dia = new Date().getDay();
  if (dia === 1) return { tipo: 'IA', data: { titulo: 'LUNES DÍA 1 - Agente Implementa IA US$27' } };
  if (dia === 2) return { tipo: 'AMAZON', data: CONFIG.PRODUCTOS.FIRE };
  if (dia === 3) return { tipo: 'IA', data: { titulo: 'MIÉRCOLES LIVE 20:00 - Rafa vende Implementa IA US$27' } };
  if (dia === 4) return { tipo: 'AMAZON', data: CONFIG.PRODUCTOS.AIRPODS };
  if (dia === 5) return { tipo: 'TEMU', data: CONFIG.PRODUCTOS.TEMU };
  if (dia === 6) return { tipo: 'IA', data: { titulo: 'SÁBADO - Agente Implementa IA US$27' } };
  return { tipo: 'ESTRELLA', data: CONFIG.PRODUCTOS.STANLEY };
}
export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.sendStatus(403);
  }
  if (req.method === 'POST') {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.status(200).send('OK');
    const from = message.from;
    const text = (message.text?.body || '').toLowerCase().trim();
    try {
      const oferta = getOfertaHoy();
      const { data: promptRow } = await supabase.from('prompts').select('prompt_text').eq('id', 1).single();
      const promptExtra = promptRow?.prompt_text || '';
      if (text === '' || text.includes('hola') || text.includes('info') || text.includes('inicio') || text.includes('menu')) {
        await sendWhatsApp(from, 'text', `¡Hola! 👋 Soy Luna de MellaShop Caribe.\nHoy ${oferta.data.titulo || oferta.data.nombre} está activo.\n¿Te mando los detalles? Responde SI`);
        return res.status(200).send('OK');
      }
      if (text.includes('si') || text.includes('sí') || text.includes('ver')) {
        const esMiercoles = new Date().getDay() === 3;
        if (oferta.tipo === 'IA') {
          let caption = esMiercoles? `${promptExtra? promptExtra + '\n\n' : ''}🔴 ¡HOY MIÉRCOLES 20:00 HORAS LIVE!\nRafa va a vender por mí el Agente Implementa IA en vivo.\n\n🤖 ${oferta.data.titulo}\n✅ 30 min al día, sin cámara, desde el celular\n\n💰 US$27 - Garantía 7 días\n👉 Entra con MI LINK:\n${CONFIG.IA_COMISION}\n\n¡No faltes! 20:00 hrs RD.` : `${promptExtra? promptExtra + '\n\n' : ''}🤖 ${oferta.data.titulo}\n\n✅ 10 Soluciones: CRM AI, WhatsApp API, GIP-AI, Google Ads, Mega Redes, VideoFlow, SEO, LinkedIn+IG, Meta Ads, Voz Real.\n\n💰 US$27 / RD$1,727 - Garantía 7 días\n👉 Mi link:\n${CONFIG.IA_COMISION}`;
          try { await sendWhatsApp(from, 'image', { link: CONFIG.IMG_BIBLIOTECA, caption }); } catch { await sendWhatsApp(from, 'text', caption); }
        } else {
          await sendWhatsApp(from, 'text', `🛍️ ${oferta.data.nombre}\n\n👉 Link con mi etiqueta ${CONFIG.TAG}:\n${oferta.data.url}\n\nResponde SI para otro producto.`);
        }
        return res.status(200).send('OK');
      }
      await sendWhatsApp(from, 'text', `Hoy tenemos ${oferta.data.titulo || oferta.data.nombre}. Escribe SI.`);
      return res.status(200).send('OK');
    } catch (err) { console.error(err.response?.data || err.message); return res.status(200).send('OK'); }
  }
}
