// Envía a las vendedoras un correo con cada respuesta del formulario.
// El correo lo envía un Google Apps Script publicado en el Gmail del proyecto (igual que en Rabbit).
// Variables en Vercel (Settings → Environment Variables):
//   CORREO_URL    dirección de la aplicación web de Apps Script
//   CORREO_CLAVE  clave compartida (la misma que la constante CLAVE del script)
//   AVISO_PARA    correos que reciben, separados por coma

const { correo } = require('./_plantilla.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return res.status(400).end(); } }
  if (!d || !/^9\d{8}$/.test(String(d.celular || '').replace(/\D/g, ''))) return res.status(400).end();

  const { CORREO_URL, CORREO_CLAVE, AVISO_PARA } = process.env;
  if (!CORREO_URL || !CORREO_CLAVE || !AVISO_PARA) return res.status(500).json({ error: 'Faltan variables de entorno' });

  const { asunto, html } = correo(d, 'https://ipartner-cotiza.vercel.app/logo-correo.png');

  try {
    const r = await fetch(CORREO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ clave: CORREO_CLAVE, para: AVISO_PARA, asunto, html }) });
    const txt = await r.text();
    if (!r.ok || /"ok"\s*:\s*false/.test(txt)) throw new Error('Apps Script: ' + r.status + ' ' + txt.slice(0, 200));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'No se pudo enviar' });
  }
};
