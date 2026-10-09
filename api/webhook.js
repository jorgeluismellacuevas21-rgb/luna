import axios from 'axios';

export default async function handler(req, res) {
  // 1. Verificación del Webhook para Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(400).send('Bad Request');
  }

  // 2. Recepción y respuesta de mensajes (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const text = message.text ? message.text.body.trim().toLowerCase() : '';

        console.log('Mensaje recibido de:', from, 'Texto:', text);

        if (text === 'ia' || text === 'biblioteca') {
          await sendWhatsAppMessage(from);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('Not Found');
    }
  }

  return res.status(405).send('Method Not Allowed');
}

// 3. Función para enviar la imagen y el enlace
async function sendWhatsAppMessage(to) {
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
        image: {
          link: imageUrl,
          caption: captionText
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Mensaje enviado con éxito a:', to);
  } catch (error) {
    console.error('Error al enviar mensaje:', error.response ? error.response.data : error.message);
  }
}
