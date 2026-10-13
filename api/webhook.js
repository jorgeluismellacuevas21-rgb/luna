if (oferta.tipo === 'IA') {
  const esMiercoles = new Date().getDay() === 3;
  
  let caption = '';
  
  if (esMiercoles) {
    // MIERCOLES 20:00 LIVE DE RAFA - TU DOCUMENTO
    caption = `${promptExtra? promptExtra + '\n\n' : ''}🔴 ¡HOY MIÉRCOLES 20:00 HORAS LIVE!

Rafa va a vender por mí el Agente Implementa IA en vivo.

🤖 ${oferta.data.titulo}
✅ Te va a mostrar como generar ingresos con IA en 30 min al día, sin cámara

💰 US$27 en Hotmart - Garantía 7 días

👉 Entra con MI LINK de divulgación para que me cuente la comisión:
${CONFIG.IA_COMISION}

¡No faltes! 20:00 hrs RD.`;
  } else {
    caption = `${promptExtra? promptExtra + '\n\n' : ''}🤖 ${oferta.data.titulo}\n\n✅ 10 Soluciones: CRM AI, WhatsApp API Meta, GIP-AI Videos, Google Ads AI, Mega Redes 2.0, VideoFlow, SEO, LinkedIn+IG, Meta Ads, Voz Real.\n\n💰 US$27 / RD$1,727 - Garantía 7 días\n\n👉 Mi link con comisión:\n${CONFIG.IA_COMISION}`;
  }

  try {
    await sendWhatsApp(from, 'image', { link: CONFIG.IMG_BIBLIOTECA, caption });
  } catch {
    await sendWhatsApp(from, 'text', caption);
  }
}
