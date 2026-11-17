// Plantilla del correo a las vendedoras (estilo Rabbit, colores iPartner).
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PREG = {
  p1: 'Motivo', a1: 'Personas al mes', a2: 'Lo que más le frena', b1: 'Dónde hubo pérdidas', b2: 'Personal que le preocupa',
  c1: 'Tipo de revisión', c2: 'A quiénes evaluará', d1: 'Qué no le convence', d2: 'Personas al mes', vol: 'Personas al mes',
  puestos: 'Puestos', rol: 'Rol en la decisión',
};
const LBL = 'font-size:11px;color:#8A84A0;text-transform:uppercase;letter-spacing:.08em';
const card = (label, value, extra = '') => `<div style="background:#ffffff;border:1px solid #ECE8F6;border-radius:12px;padding:12px 14px;min-height:46px${extra}"><div style="${LBL}">${label}</div><div style="margin-top:5px;font-size:15px;font-weight:700;color:#17122B;line-height:1.35">${value}</div></div>`;
const celda = (html, span = 1) => `<td colspan="${span}" width="${span === 2 ? '100%' : '50%'}" style="padding:5px;vertical-align:top">${html}</td>`;
const caja = filas => `<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0FC;border-radius:16px;padding:5px">${filas}</table>`;
const titulo = t => `<tr><td style="padding:22px 24px 8px"><div style="font-size:12px;font-weight:700;color:#412780;text-transform:uppercase;letter-spacing:.1em">${t}</div></td></tr>`;

function correo(d, logo) {
  const cel = String(d.celular || '').replace(/\D/g, '');
  const nom = esc(d.nombre || 'Sin nombre'), primer = esc(String(d.nombre || '').trim().split(/\s+/)[0] || 'este lead');
  const parcial = d.tipo === 'parcial', prueba = d.origen === 'prueba';
  const vol = d.a1 || d.d2 || d.vol;
  const revisar = String(d.estado || '').startsWith('revisar');
  const etiqueta = prueba ? 'PRUEBA' : parcial ? 'PARCIAL' : 'NUEVO';
  const accion = parcial ? `Dejó sus datos pero no terminó el formulario. Llámalo para completar su necesidad.`
    : revisar ? `Evalúa menos de 50 personas al mes. Revisa con el RUC si conviene llamar.`
    : `${esc(d.rol) === 'Yo decido' ? 'Es quien decide la compra. ' : ''}Llámalo hoy: ya sabemos por dónde empezar.`;

  const resaltar = String(d.resaltar || '').split(/;\s*/).filter(Boolean).map(x => x.replace(/\.$/, '')).map(x => x.charAt(0).toUpperCase() + x.slice(1));
  const [obj, resp] = String(d.objecion || '').split(/:\s(.+)/);

  let h = `<!doctype html><html><body style="margin:0;background:#EEEBFA">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEEBFA;padding:28px 12px;font-family:Arial,Helvetica,sans-serif"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E3DDF3">
    <tr><td style="background:#2A1758;background-image:linear-gradient(135deg,#2A1758,#412780);padding:20px 24px"><table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="${logo}" width="110" alt="iPartner" style="display:block;border:0"><div style="font-size:12px;color:#C9BFE6;margin-top:6px">Formulario de cotización</div></td>
      <td align="right"><span style="display:inline-block;background:${prueba ? '#EF801C' : '#ffffff'};color:${prueba ? '#ffffff' : '#412780'};font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px">${etiqueta}</span></td>
    </tr></table></td></tr>
    <tr><td style="padding:26px 24px 4px"><h1 style="margin:0;font-size:22px;line-height:1.3;color:#17122B">${nom} ${parcial ? 'dejó sus datos' : 'pidió una cotización'}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#6B6584;line-height:1.5">${accion}</p></td></tr>
    <tr><td style="padding:16px 24px 0"><table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" style="padding-right:5px"><a href="tel:+51${cel}" style="display:block;background:#412780;color:#ffffff;text-align:center;padding:13px 8px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">Llamar</a></td>
      <td width="50%" style="padding-left:5px"><a href="https://wa.me/51${cel}?text=${encodeURIComponent('Hola ' + (String(d.nombre || '').split(' ')[0]) + ', te escribo de iPartner por tu solicitud de cotización.')}" style="display:block;background:#25D366;color:#ffffff;text-align:center;padding:13px 8px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">WhatsApp</a></td>
    </tr></table></td></tr>`;

  h += titulo('Contacto') + `<tr><td style="padding:0 19px">${caja(
    `<tr>${celda(card('Celular', '+51 ' + esc(cel.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'))))}${celda(card('RUC', esc(d.ruc) || '—'))}</tr>` +
    (parcial ? '' : `<tr>${celda(card('Personas al mes', esc(vol) || '—'))}${celda(card('Rol en la decisión', esc(d.rol) || '—'))}</tr>`)
  )}</td></tr>`;

  if (!parcial && d.dolor) {
    h += titulo('Su necesidad') + `<tr><td style="padding:0 24px"><div style="background:#412780;border-radius:14px;padding:16px 18px">
      <div style="font-size:11px;color:#C9BFE6;text-transform:uppercase;letter-spacing:.08em">Dolor detectado</div>
      <div style="margin-top:6px;font-size:18px;font-weight:700;color:#ffffff;line-height:1.35">${esc(d.dolor)}</div>
      <div style="margin-top:10px;font-size:13px;color:#E4DCFA;line-height:1.45">Nos buscó porque: <b style="color:#ffffff">${esc(d.p1)}</b></div></div></td></tr>`;

    h += titulo('Qué ofrecerle') + `<tr><td style="padding:0 19px">${caja(
      `<tr>${celda(card('Propuesta', esc(d.combo)), 2)}</tr>` +
      `<tr>${celda(`<div style="background:#ffffff;border:1px solid #ECE8F6;border-radius:12px;padding:12px 14px"><div style="${LBL}">Qué resaltar en la llamada</div>${resaltar.map(x => `<div style="margin-top:7px;font-size:14px;color:#17122B;line-height:1.4">✓&nbsp; ${esc(x)}</div>`).join('')}</div>`, 2)}</tr>`
    )}</td></tr>`;

    if (obj) h += `<tr><td style="padding:10px 24px 0"><div style="border-left:4px solid #EF801C;background:#FFF4EA;border-radius:0 12px 12px 0;padding:12px 14px">
      <div style="font-size:11px;color:#C2410C;text-transform:uppercase;letter-spacing:.08em;font-weight:700">Objeción probable</div>
      <div style="margin-top:5px;font-size:14px;color:#17122B;font-weight:700">${esc(obj)}</div>
      ${resp ? `<div style="margin-top:4px;font-size:13.5px;color:#4A4560;line-height:1.45">Respuesta: ${esc(resp)}</div>` : ''}</div></td></tr>`;

    const resp2 = Object.keys(PREG).filter(k => d[k] && !['p1', 'rol', 'a1', 'd2', 'vol'].includes(k));
    if (resp2.length) h += titulo('Lo que respondió') + `<tr><td style="padding:0 24px"><table width="100%" cellpadding="0" cellspacing="0">${resp2.map(k =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #F0EDF8;font-size:13px;color:#8A84A0;width:42%;vertical-align:top">${PREG[k]}</td><td style="padding:8px 0;border-bottom:1px solid #F0EDF8;font-size:14px;color:#17122B;font-weight:600">${esc(d[k])}</td></tr>`).join('')}</table></td></tr>`;
  }

  h += `<tr><td style="padding:22px 24px 24px"><p style="margin:0;font-size:12.5px;color:#8A84A0;line-height:1.5;text-align:center">Después de llamar, marca en Supabase (tabla <b>leads</b>) si el diagnóstico acertó.</p></td></tr>
  </table>
  <p style="font-size:11px;color:#8A84A0;margin:16px 0 0">Correo automático del formulario | iPartner</p>
</td></tr></table></body></html>`;

  const asunto = `${prueba ? '[PRUEBA] ' : ''}${parcial ? 'Lead parcial' : 'Nuevo lead'}: ${d.nombre || 'Sin nombre'}${!parcial && d.dolor ? ' · ' + d.dolor : ''}`;
  return { asunto, html: h };
}
module.exports = { correo };
