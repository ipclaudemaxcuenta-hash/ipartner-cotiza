// iPartner · Envío de avisos del formulario
// 1. Cambia el valor de CLAVE por una palabra larga que inventes (la misma irá en Vercel como CORREO_CLAVE).
// 2. Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo · Acceso: Cualquier persona.
const CLAVE = 'CAMBIA-ESTA-CLAVE';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.clave !== CLAVE) return salida({ ok: false, error: 'clave' });
    if (!d.para || !d.asunto || !d.html) return salida({ ok: false, error: 'faltan datos' });
    MailApp.sendEmail({ to: d.para, subject: d.asunto, htmlBody: d.html, name: 'Formulario iPartner' });
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
