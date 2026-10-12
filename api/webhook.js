import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const LINKS = {
  hotmartIA: 'https://go.hotmart.com/O107675193N?ap=27c6',
  temu: 'https://temu.to/k/ge7bkwnomjl',
  amazon: 'https://www.amazon.com',
  shein: 'https://www.shein.com',
  linktree: 'https://linktr.ee/mellashopcaribe',
  imagenBiblioteca: 'https://raw.githubusercontent.com/jorgeluismellacuevas21-rgb/luna/main/public/biblioteca.jpg'
};

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

      // Consulta dinámica a Supabase para obtener el Prompt Master oficial
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('prompt_text')
        .eq('id', 1)
        .single();

      if (promptError) {
        console.error("Error leyendo prompt de Supabase:", promptError);
      }

      const systemPrompt = promptData ? promptData.prompt_text : "Eres un asistente virtual de MellaShop Caribe e Implementa IA Academy.";

      // Lógica de respuesta usando el systemPrompt devuelto por Supabase
      console.log('Mensaje recibido:', text);
      console.log('Prompt cargado de Supabase:', systemPrompt ? 'OK' : 'FAIL');
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
