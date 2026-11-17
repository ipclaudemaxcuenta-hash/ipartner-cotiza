// Envía a las vendedoras un correo con cada respuesta del formulario.
// Variables en Vercel (Settings → Environment Variables):
//   GMAIL_USER          correo de Gmail que envía los avisos
//   GMAIL_APP_PASSWORD  contraseña de aplicación de ese Gmail (16 letras)
//   AVISO_PARA          correos que reciben, separados por coma
const nodemailer = require('nodemailer');

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PREG = {
  p1: '¿Qué te llevó a buscarnos?', a1: '¿Cuántas personas evalúan al mes?', a2: '¿Qué te frena más?',
  b1: '¿Dónde se notaron las pérdidas?', b2: '¿Qué personal le preocupa?', c1: '¿Qué tipo de revisión?',
  c2: '¿A quiénes necesita evaluar?', d1: '¿Qué no le convence de su proveedor?', d2: '¿Cuántas personas evalúan al mes?',
  vol: '¿Cuántas personas evalúan al mes?', puestos: '¿Para qué puestos contrata?', rol: 'Su rol en la decisión',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return res.status(400).end(); } }
  if (!d || !/^9\d{8}$/.test(String(d.celular || '').replace(/\D/g, ''))) return res.status(400).end();

  const { GMAIL_USER, GMAIL_APP_PASSWORD, AVISO_PARA } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !AVISO_PARA) return res.status(500).json({ error: 'Faltan variables de entorno' });

  const cel = String(d.celular).replace(/\D/g, '');
  const parcial = d.tipo === 'parcial';
  const prueba = d.origen === 'prueba';
  const asunto = `${prueba ? '[PRUEBA] ' : ''}${parcial ? 'Lead parcial' : 'Nuevo lead'}: ${d.nombre || 'Sin nombre'}${d.dolor ? ' · ' + d.dolor : ''}`;
  const fila = (k, v) => v ? `<tr><td style="padding:6px 10px;color:#6B6584;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 10px;font-size:14px;color:#17122B">${esc(v)}</td></tr>` : '';
  const respuestas = Object.keys(PREG).filter(k => d[k]).map(k => fila(PREG[k], d[k])).join('');

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#17122B">
  <div style="background:#412780;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
    <div style="font-size:12px;opacity:.8">${prueba ? 'PRUEBA · ' : ''}Formulario iPartner · ${parcial ? 'dejó sus datos pero no terminó' : 'formulario completo'}</div>
    <div style="font-size:20px;font-weight:bold;margin-top:4px">${esc(d.nombre || 'Sin nombre')}</div>
  </div>
  <div style="border:1px solid #E6E1F2;border-top:0;padding:16px 20px;border-radius:0 0 12px 12px">
    <p style="margin:0 0 12px">
      <a href="tel:+51${cel}" style="display:inline-block;background:#412780;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:bold;margin-right:6px">Llamar +51 ${cel}</a>
      <a href="https://wa.me/51${cel}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:bold">WhatsApp</a>
    </p>
    <table style="border-collapse:collapse;width:100%">
      ${fila('RUC', d.ruc)}${fila('Estado', parcial ? 'Parcial · llamar para completar' : d.estado)}
    </table>
    ${d.dolor ? `<h3 style="color:#412780;font-size:15px;margin:18px 0 6px">Diagnóstico</h3><table style="border-collapse:collapse;width:100%">
      ${fila('Dolor detectado', d.dolor)}${fila('Proponer', d.combo)}${fila('Qué resaltar', d.resaltar)}${fila('Objeción probable', d.objecion)}</table>` : ''}
    ${respuestas ? `<h3 style="color:#412780;font-size:15px;margin:18px 0 6px">Sus respuestas</h3><table style="border-collapse:collapse;width:100%">${respuestas}</table>` : ''}
    <p style="font-size:12px;color:#6B6584;margin-top:18px">Después de llamar, marca en Supabase (tabla leads) si el diagnóstico acertó.</p>
  </div></div>`;

  try {
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    await t.sendMail({ from: `Formulario iPartner <${GMAIL_USER}>`, to: AVISO_PARA, subject: asunto, html });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'No se pudo enviar' });
  }
};
