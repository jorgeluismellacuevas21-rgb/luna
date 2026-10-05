export default async function handler(req, res) {
  // VERIFICACIÓN META - GET
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // RECEPCIÓN MENSAJES - POST
  if (req.method === 'POST') {
    try {
      const value = req.body?.entry?.[0]?.changes?.[0]?.value;
      const msg = value?.messages?.[0];

      if (msg) {
        await fetch(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: msg.from,
            text: {
              body: `Hola, soy Jorge Luis, agente de Implementa IA. Recibí: ${msg.text?.body || ''}`
            }
          })
        });
      }
      return res.status(200).send('EVENT_RECEIVED');
    } catch(e) {
      return res.status(200).send('EVENT_RECEIVED');
    }
  }

  return res.status(405).send('Method not allowed');
}
