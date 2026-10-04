export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
      return res.status(200).send(req.query['hub.challenge']);
    }
    return res.status(403).send('Forbidden');
  }
  if (req.method === 'POST') {
    try {
      const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
      const msg = entry?.messages?.[0];
      if (msg) {
        await fetch(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: msg.from,
            text: { body: `Hola soy Luna 🌙 WABA ${process.env.WABA_ID} recibí: ${msg.text?.body}` }
          })
        });
      }
      return res.status(200).send('OK');
    } catch (e) {
      return res.status(200).send('OK');
    }
  }
}
