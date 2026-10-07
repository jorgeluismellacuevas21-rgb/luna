export default async function handler(req, res) {
 if (req.method === 'GET') {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
   return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
 }
 if (req.method === 'POST') {
  try {
   const value = req.body?.entry?.[0]?.changes?.[0]?.value;
   const msg = value?.messages?.[0];
   const from = msg?.from || '';
   const text = (msg?.text?.body || '').toLowerCase();
   if (msg) {
    let pais = "RD";
    if (from.startsWith("34")) pais = "España";
    else if (from.startsWith("1")) pais = "USA/RD";
    let isEcomm = /perfume|shein|temu|hotmart|amazon|amazon usa|amazon españa|ropa|comprar|afiliad|precio|reloj|zapatilla/i.test(text);
    let isIA = /crm|whatsapp|api|automatizar|ads|seo|video|redes|linkedin|ig|voz|implementa|vender/i.test(text);
    let replyBody = "";
    if (isEcomm || !isIA) {
     replyBody = `¡Hola! Soy Jorge Luis, agente de MellaShopCaribe 🛍️\n\nTenemos afiliación global: Temu USA/España, Shein, Hotmart, Amazon USA y Amazon España. Envío internacional.\n\nVi que escribes desde ${pais} - "${msg.text?.body || ''}"\n\n¿Prefieres Amazon USA, Amazon España, Temu o Shein? Te paso Top3 con link de tu país + alternativa local RD 2500RD$ perfume.`;
    } else {
     replyBody = `¡Hola! Soy Jorge Luis, agente de Implementa IA Academy 🚀\n\n10 destacadas + catálogo 120+:\n1 CRM AI, 2 WhatsApp API Meta, 3 GIP-AI Videos, 4 Google Ads AI, 5 Mega Redes 2.0, 6 VideoFlow, 7 SEO, 8 LinkedIn+IG, 9 Meta Ads, 10 Voz Real\n\n¿De las 10 cuál te duele más? Demo 5min para ${pais}.\n\nAcceso: https://go.hotmart.com/O107675193N?ap=27c6`;
    }
    await fetch(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
     body: JSON.stringify({ messaging_product: 'whatsapp', to: from, text: { body: replyBody } })
    });
   }
   return res.status(200).send('EVENT_RECEIVED');
  } catch(e) { return res.status(200).send('EVENT_RECEIVED'); }
 }
 return res.status(405).send('Method not allowed');
}
