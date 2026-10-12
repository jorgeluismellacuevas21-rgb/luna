import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Credenciales quirúrgicas de Supabase
const SUPABASE_URL = 'https://tdtrisvlyxfhpofsoydg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHJpc3ZseXhmaHBvZnNveWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwMzE4OTYsImV4cCI6MjA0MzYwNzg5Nn0.2XlG-5-8A1z9G4c82S9D9E0F1G2H3I4J5K6L7M8N9O0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendWhatsAppMessage(to, textBody) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN}`,
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
    console.error('Error enviando texto:', error.response?.data || error.message);
  }
}

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
      const text = message.text?.body || '';

      // Obtener el Prompt Master desde Supabase
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('prompt_text')
        .eq('id', 1)
        .single();

      if (promptError) {
        console.error("Error leyendo prompt de Supabase:", promptError);
      }

      const systemPrompt = promptData ? promptData.prompt_text : "Eres un asistente virtual de MellaShop Caribe e Implementa IA Academy.";

      try {
        const aiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const replyMessage = aiResponse.data.choices[0].message.content;
        await sendWhatsAppMessage(from, replyMessage);
      } catch (err) {
        console.error('Error en la API de IA:', err.response?.data || err.message);
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
