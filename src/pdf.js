import { SECCIONES } from './data.js';

export async function generarPDF(respuestas, email, nombre, empresa, marca) {
  const resumen = SECCIONES.map(sec => {
    const sa = respuestas[sec.id] || {};
    const lineas = sec.preguntas.map(p => {
      const v = sa[p.id];
      if (!v) return null;
      const val = typeof v === 'object' && !Array.isArray(v)
        ? Object.entries(v).map(([k, vv]) => `${sec.preguntas.find(q=>q.id===p.id)?.filas?.[k] || k}: ${vv}`).join('; ')
        : Array.isArray(v) ? v.join(', ') : v;
      return `- ${p.label.split(' — ')[0]}: ${val}`;
    }).filter(Boolean).join('\n');
    return `## Sección ${sec.num}: ${sec.titulo}\n${lineas || '(sin respuestas)'}`;
  }).join('\n\n');

  const esPertento = marca === 'pertento';
  const colores = esPertento
    ? { principal: '#1B2A5C', acento: '#EDB512', azul: '#3A78C9', fondo: '#F4F7FC' }
    : { principal: '#0D1117', acento: '#00A0DC', azul: '#00A0DC', fondo: '#F0F7FB' };

  const logoHTML = esPertento
    ? `<svg viewBox="0 0 680 200" style="height:60px"><g transform="translate(146,30)"><text x="0" y="72" font-family="'Trebuchet MS',Arial,sans-serif" font-size="72" font-weight="200" fill="#1B2A5C" letter-spacing="8">PERTENT</text><line x1="358" y1="73" x2="358" y2="98" stroke="#3A78C9" stroke-width="8" stroke-linecap="round"/><circle cx="358" cy="46" r="27" fill="none" stroke="#1B2A5C" stroke-width="5"/><circle cx="358" cy="46" r="14" fill="none" stroke="#3A78C9" stroke-width="2" opacity="0.55"/><line x1="0" y1="90" x2="340" y2="90" stroke="#EDB512" stroke-width="6" stroke-linecap="round"/></g></svg>`
    : `<div style="display:flex;align-items:center;gap:10px"><div style="background:#00A0DC;color:white;font-weight:900;font-size:28px;padding:4px 12px;border-radius:4px;letter-spacing:1px">SAMO</div><div style="color:#0D1117;font-size:13px;font-weight:300;letter-spacing:3px;text-transform:uppercase;line-height:1.3">CONSULTING<br>GROUP</div></div>`;

  const prompt = `Eres un especialista en precios de transferencia. Genera un reporte HTML profesional de análisis funcional (FAR — Functions, Assets, Risks) basado en el cuestionario respondido.

INSTRUCCIONES DE DISEÑO:
- HTML completo y autocontenido, listo para imprimir/guardar como PDF
- Colores: principal ${colores.principal}, acento ${colores.acento}, azul ${colores.azul}, fondo ${colores.fondo}
- Tipografía: Trebuchet MS o Arial
- Sin emojis ni iconos — diseño profesional y sobrio
- Incluye estilos CSS de impresión (@media print)
- Usa tablas HTML para estructurar la información claramente

ESTRUCTURA DEL REPORTE:
1. Portada: logo textual "${esPertento ? 'PERTENTO SC' : 'SAMO Consulting Group'}", título "Análisis Funcional — Precios de Transferencia", nombre del cliente "${nombre || email}", empresa "${empresa || ''}", fecha ${new Date().toLocaleDateString('es-MX', {day:'2-digit',month:'long',year:'numeric'})}
2. Resumen ejecutivo (3–4 párrafos con los hallazgos más relevantes y el perfil funcional identificado)
3. Secciones del cuestionario con respuestas bien formateadas — usa tablas
4. Sección de alertas y áreas de atención si hay respuestas de riesgo
5. Conclusiones y recomendaciones preliminares
6. Pie con datos de contacto de ${esPertento ? 'Pertento SC — jorge.meza@pertentosc.com — +52 (656) 201-4023' : 'SAMO Consulting Group'}
7. Disclaimer: "Este reporte tiene fines informativos. Las situaciones particulares de cada contribuyente pueden diferir. Se recomienda consultar con un especialista en precios de transferencia."

RESPUESTAS DEL CUESTIONARIO:
Cliente: ${email}
${resumen}

Responde ÚNICAMENTE con el HTML completo. Sin explicaciones, sin markdown, sin bloques de código.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!r.ok) throw new Error(`Error API: ${r.status}`);
  const d = await r.json();
  const html = (d.content?.map(b => b.text || '').join('') || '')
    .replace(/```html|```/g, '')
    .trim();

  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    throw new Error('La respuesta no es HTML válido');
  }

  const win = window.open('', '_blank');
  if (!win) throw new Error('El navegador bloqueó la ventana emergente — permite ventanas emergentes para este sitio');
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try { win.print(); } catch(e) { /* el usuario puede imprimir manualmente */ }
  }, 1000);
}
