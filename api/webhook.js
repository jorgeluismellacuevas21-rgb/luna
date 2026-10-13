// api/webhook-lovable-test.js
// Webhook de PRUEBA para WhatsApp + Supabase (MellaShopCaribe)

const { createClient } = require('@supabase/supabase-js');

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// --- OFERTAS INTOCABLES CORREGIDAS - NO TOCAR ---
const HOTMART_URL = 'https://go.hotmart.com/O187675193N?ap=27c6';
const AMAZON_TAG = 'tag=jorgemella-21';

const OFERTAS = {
  HOTMART: {
    tipo: 'HOTMART',
    nombre: 'Biblioteca de Soluciones IA',
    url: HOTMART_URL,
    texto: 'Hoy te recomiendo la Biblioteca de Soluciones IA: plantillas y herramientas listas para vender mas con inteligencia artificial. Acceso inmediato aqui: ' + HOTMART_URL,
  },
  AMAZON: {
    tipo: 'AMAZON',
    nombre: 'Stanley',
    url: `https://www.amazon.com/dp/B0C8NQZ6Z3?${AMAZON_TAG}`,
    texto: `Oferta del dia: termo Stanley, el favorito para mantener tu bebida fria todo el dia. Compralo aqui: https://www.amazon.com/dp/B0C8NQZ6Z3?${AMAZON_TAG}`,
  },
};

function getOfertaHoy() {
  const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
  const dia = ahora.getDay();
  return dia === 0? OFERTAS.AMAZON : OFERTAS.HOTMART;
}

function buildCaption(oferta) {
  const caption = `${oferta.nombre}\n\n${oferta.texto}`;
  return caption.length > 900? caption.slice(0, 897) + '...' : caption;
}

async function guardarCliente(supabase, { telefono, nombre }) {
  const { data, error } = await supabase
 .from('clientes')
 .upsert({ telefono, nombre: nombre || null, ultimo_contacto: new Date().toISOString() }, { onConflict: 'telefono' })
 .select();
  if (error) { console.error('Error RLS/upsert clientes:', error.message); return { ok: false, error: error.message }; }
  return { ok: true, data };
}

async function enviarWhatsApp(para, texto) {
  const GRAPH_API = `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const res = await fetch(GRAPH_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: para, type: 'text', text: { body: texto } }),
  });
  const json = await res.json();
  if (!res.ok) { console.error('Error enviando WhatsApp:', JSON.stringify(json)); }
  return { ok: res.ok, status: res.status, json };
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) { return res.status(200).send(challenge); }
    return res.status(403).send('Forbidden');
  }
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      if (body.test === true) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const oferta = getOfertaHoy();
        const caption = buildCaption(oferta);
        const guardado = await guardarCliente(supabase, { telefono: body.telefono || 'test-000', nombre: body.nombre || 'Test Panel' });
        if (!guardado.ok) { return res.status(200).json({ log: 'Error RLS', detalle: guardado.error, oferta: oferta.tipo }); }
        return res.status(200).json({ log: '200 OK', oferta: oferta.tipo, caption, cliente: guardado.data });
      }
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const contacto = change?.value?.contacts?.[0];
      if (!message) { return res.status(200).json({ log: '200 OK', detalle: 'sin mensaje' }); }
      const telefono = message.from;
      const nombre = contacto?.profile?.name || null;
      const textoEntrante = (message.text?.body || '').trim().toUpperCase();
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const guardado = await guardarCliente(supabase, { telefono, nombre });
      if (!guardado.ok) { return res.status(200).json({ log: 'Error RLS', detalle: guardado.error }); }
      if (textoEntrante.startsWith('INFO')) {
        const oferta = getOfertaHoy();
        const caption = buildCaption(oferta);
        const envio = await enviarWhatsApp(telefono, caption);
        return res.status(200).json({ log: envio.ok? '200 OK' : 'Error WhatsApp', oferta: oferta.tipo, enviado: envio.ok });
      }
      return res.status(200).json({ log: '200 OK', detalle: 'mensaje sin comando INFO' });
    } catch (err) {
      console.error('Error webhook-lovable-test:', err);
      return res.status(200).json({ log: 'Error', detalle: err.message });
    }
  }
  return res.status(405).send('Method Not Allowed');
};
