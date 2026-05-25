import { useState, useEffect, useRef } from 'react';
import { sb } from './supabase.js';
import { SECCIONES, CATEGORIAS_DOCS, getRiesgos } from './data.js';
import { generarPDF } from './pdf.js';

// ─── CAMPO DE PREGUNTA ────────────────────────────────────────────
function Campo({ p, valor, onChange, C }) {
  const tieneRespuesta = valor && (Array.isArray(valor) ? valor.length > 0 : String(valor).trim() !== '');
  const hl = tieneRespuesta
    ? { border: `1.5px solid ${C.azul}`, boxShadow: `0 0 0 3px ${C.azulClaro}` }
    : { border: `1.5px solid ${C.borde}` };
  const inp = {
    width: '100%', border: `1.5px solid ${tieneRespuesta ? C.azul : C.borde}`,
    borderRadius: 7, padding: '0.6rem 0.85rem', fontSize: 13,
    color: C.texto, outline: 'none', boxSizing: 'border-box',
    background: tieneRespuesta ? C.azulClaro : 'white', fontFamily: 'inherit',
  };

  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '1rem 1.15rem', marginBottom: '0.75rem', transition: 'all 0.2s', ...hl }}>
      <label style={{ color: C.texto, fontWeight: 600, fontSize: 13, lineHeight: 1.55, display: 'block', marginBottom: '0.65rem' }}>
        {p.label}
      </label>

      {p.tipo === 'texto'    && <input style={inp} value={valor || ''} onChange={e => onChange(e.target.value)} placeholder={p.ph} />}
      {p.tipo === 'textarea' && <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} rows={3} value={valor || ''} onChange={e => onChange(e.target.value)} placeholder={p.ph} />}
      {p.tipo === 'select'   && (
        <select style={{ ...inp, cursor: 'pointer' }} value={valor || ''} onChange={e => onChange(e.target.value)}>
          <option value="">— Selecciona una opción —</option>
          {p.opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {p.tipo === 'radio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {p.opts.map(o => {
            const sel = valor === o;
            return (
              <label key={o} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', padding: '6px 9px', borderRadius: 7, background: sel ? C.azulClaro : 'transparent', border: `1px solid ${sel ? C.azul : 'transparent'}` }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? C.azul : C.borde}`, background: sel ? C.azul : 'white', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </div>
                <input type="radio" checked={sel} onChange={() => onChange(o)} style={{ display: 'none' }} />
                <span style={{ fontSize: 13, color: sel ? C.texto : C.gris, fontWeight: sel ? 600 : 400, lineHeight: 1.45 }}>{o}</span>
              </label>
            );
          })}
        </div>
      )}
      {p.tipo === 'multi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {p.opts.map(o => {
            const sel = (valor || []).includes(o);
            return (
              <label key={o} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, cursor: 'pointer', padding: '6px 9px', borderRadius: 7, background: sel ? C.azulClaro : 'transparent', border: `1px solid ${sel ? C.azul : 'transparent'}` }}
                onClick={() => { const prev = valor || []; onChange(sel ? prev.filter(v => v !== o) : [...prev, o]); }}>
                <div style={{ width: 15, height: 15, borderRadius: 3, border: `2px solid ${sel ? C.azul : C.borde}`, background: sel ? C.azul : 'white', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: sel ? C.texto : C.gris, fontWeight: sel ? 600 : 400, lineHeight: 1.45 }}>{o}</span>
              </label>
            );
          })}
        </div>
      )}
      {p.tipo === 'matriz' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.principal }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', color: C.acento, fontWeight: 700, border: `1px solid ${C.principalMid}`, width: '35%' }}>Decisión</th>
                {p.cols.map(c => <th key={c} style={{ padding: '6px 8px', textAlign: 'center', color: 'white', fontWeight: 600, border: `1px solid ${C.principalMid}`, fontSize: 10.5 }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {p.filas.map((fila, ri) => {
                const v = (valor || {})[ri];
                return (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? C.fondo : 'white' }}>
                    <td style={{ padding: '6px 8px', color: C.texto, border: `1px solid ${C.borde}`, fontSize: 12 }}>{fila}</td>
                    {p.cols.map(col => (
                      <td key={col} style={{ padding: '6px 8px', textAlign: 'center', border: `1px solid ${C.borde}` }}>
                        <input type="radio" name={`m_${p.id}_${ri}`} checked={v === col} onChange={() => onChange({ ...(valor || {}), [ri]: col })}
                          style={{ accentColor: C.azul, cursor: 'pointer', width: 14, height: 14 }} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SECCIÓN DE DOCUMENTOS ────────────────────────────────────────
function SeccionDocumentos({ C, userId }) {
  const [archivos,   setArchivos]   = useState({});
  const [subiendo,   setSubiendo]   = useState({});
  const [cargando,   setCargando]   = useState(true);
  const [msg,        setMsg]        = useState('');
  const refs = useRef({});
  const uid  = userId || sb.user?.id;

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    try {
      const res = {};
      for (const cat of CATEGORIAS_DOCS) {
        const items = await sb.listFiles(uid, cat.id);
        res[cat.id] = items.map(f => ({
          nombre:   f.name.split('/').pop().replace(/^\d+_/, ''),
          ruta:     `${uid}/${cat.id}/${f.name}`,
          tamanio:  f.metadata?.size || 0,
          fecha:    f.created_at,
        }));
      }
      setArchivos(res);
    } catch (e) {
      setMsg('Error al cargar archivos: ' + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function subir(cat, lista) {
    if (!lista?.length) return;
    setSubiendo(p => ({ ...p, [cat.id]: true }));
    setMsg('');
    try {
      for (const file of Array.from(lista)) {
        if (file.size > 20 * 1024 * 1024) { setMsg(`${file.name} supera el límite de 20 MB`); continue; }
        await sb.uploadFile(cat.id, file);
      }
      setMsg('Archivo(s) subido(s) correctamente');
      await cargar();
      setTimeout(() => setMsg(''), 3500);
    } catch (e) {
      setMsg('Error al subir: ' + e.message);
    } finally {
      setSubiendo(p => ({ ...p, [cat.id]: false }));
      if (refs.current[cat.id]) refs.current[cat.id].value = '';
    }
  }

  async function eliminar(cat, archivo) {
    if (!confirm(`¿Eliminar "${archivo.nombre}"?`)) return;
    try { await sb.deleteFile(archivo.ruta); await cargar(); }
    catch (e) { setMsg('Error al eliminar: ' + e.message); }
  }

  async function descargar(archivo) {
    try { window.open(await sb.getSignedUrl(archivo.ruta), '_blank'); }
    catch (e) { setMsg('Error al descargar: ' + e.message); }
  }

  const fmtTam  = b => !b ? '—' : b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
  const fmtFech = d => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ background: C.principal, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', borderLeft: `4px solid ${C.acento}` }}>
        <p style={{ color: C.acento, fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 3px' }}>Sección 09 de 09</p>
        <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: '0 0 3px' }}>Carga de Documentos</h2>
        <p style={{ color: C.blancoMid, fontSize: 12, margin: 0 }}>Estados financieros, contratos con partes relacionadas y documentación de soporte</p>
      </div>

      {msg && (
        <div style={{ background: msg.includes('Error') || msg.includes('supera') ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${msg.includes('Error') || msg.includes('supera') ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: 13, color: msg.includes('Error') || msg.includes('supera') ? '#991B1B' : '#166534' }}>
          {msg}
        </div>
      )}

      {cargando ? (
        <p style={{ textAlign: 'center', color: C.gris, padding: '2rem' }}>Cargando archivos...</p>
      ) : (
        CATEGORIAS_DOCS.map(cat => {
          const lista = archivos[cat.id] || [];
          return (
            <div key={cat.id} style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.borde}`, marginBottom: '1rem', overflow: 'hidden' }}>
              {/* Header de categoría */}
              <div style={{ background: C.principal, padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>{cat.label}</p>
                  <p style={{ color: C.blancoMid, fontSize: 11, margin: 0 }}>{cat.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                    {lista.length} {lista.length === 1 ? 'archivo' : 'archivos'}
                  </span>
                  <button onClick={() => refs.current[cat.id]?.click()} disabled={subiendo[cat.id]}
                    style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 7, padding: '0.45rem 1rem', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {subiendo[cat.id] ? 'Subiendo...' : '+ Subir'}
                  </button>
                  <input ref={el => refs.current[cat.id] = el} type="file" multiple accept={cat.acepta} style={{ display: 'none' }} onChange={e => subir(cat, e.target.files)} />
                </div>
              </div>

              {/* Zona de arrastrar */}
              <div style={{ margin: '0.75rem 1rem 0' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.firstChild.style.background = C.azulClaro; }}
                onDragLeave={e => { e.currentTarget.firstChild.style.background = 'transparent'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.firstChild.style.background = 'transparent'; subir(cat, e.dataTransfer.files); }}>
                <div onClick={() => refs.current[cat.id]?.click()}
                  style={{ border: `2px dashed ${C.borde}`, borderRadius: 8, padding: '0.65rem', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <p style={{ color: C.gris, fontSize: 12, margin: 0 }}>
                    Arrastra archivos aquí o <span style={{ color: C.azul, fontWeight: 600 }}>selecciona</span>
                    <span style={{ display: 'block', fontSize: 11, marginTop: 2 }}>{cat.acepta.split(',').join('  ·  ')} &nbsp;·&nbsp; Máx. 20 MB por archivo</span>
                  </p>
                </div>
              </div>

              {/* Lista de archivos */}
              <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
                {lista.length === 0 ? (
                  <p style={{ color: C.gris, fontSize: 12, textAlign: 'center', padding: '0.6rem 0', margin: 0 }}>No hay archivos subidos aún en esta categoría</p>
                ) : (
                  lista.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.4rem 0.5rem', borderRadius: 7, marginBottom: '0.2rem', background: i % 2 === 0 ? C.fondo : 'transparent' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: C.texto, fontSize: 12.5, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nombre}</p>
                        <p style={{ color: C.gris, fontSize: 10.5, margin: 0 }}>{fmtTam(a.tamanio)} · {fmtFech(a.fecha)}</p>
                      </div>
                      <button onClick={() => descargar(a)} style={{ background: 'none', border: `1px solid ${C.borde}`, borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: 12, color: C.azul, cursor: 'pointer' }}>Descargar</button>
                      <button onClick={() => eliminar(cat, a)} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: 12, color: '#DC2626', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })
      )}

      <div style={{ background: C.fondo, borderRadius: 10, padding: '0.85rem 1rem', border: `1px solid ${C.borde}` }}>
        <p style={{ color: C.texto, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          Tus documentos son privados — solo tu asesor y tú tienen acceso. Se almacenan de forma segura y encriptada. Cada archivo está vinculado exclusivamente a tu cuenta.
        </p>
      </div>
    </div>
  );
}

// ─── CUESTIONARIO PRINCIPAL ───────────────────────────────────────
export default function Cuestionario({ marca, user, perfil, onLogout }) {
  const [seccion,   setSeccion]   = useState(0);
  const [respuestas,setRespuestas]= useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado,  setGuardado]  = useState(false);
  const [genPDF,    setGenPDF]    = useState(false);
  const [msg,       setMsg]       = useState('');

  const esPertento = marca === 'pertento';
  const C = esPertento
    ? { principal: '#1B2A5C', principalMid: '#243070', acento: '#EDB512', azul: '#3A78C9', azulClaro: '#EEF4FF', borde: '#C8D8F0', fondo: '#F4F7FC', texto: '#1A2330', gris: '#8A9BBF', blancoMid: 'rgba(255,255,255,0.65)' }
    : { principal: '#0D1117', principalMid: '#1A2A3A', acento: '#00A0DC', azul: '#00A0DC', azulClaro: '#EBF7FC', borde: '#D8E8F0', fondo: '#F0F7FB', texto: '#1A2330', gris: '#8A8A8A', blancoMid: 'rgba(255,255,255,0.55)' };

  const ES_DOCS = seccion === SECCIONES.length;
  const sec     = !ES_DOCS ? SECCIONES[seccion] : null;
  const secAns  = sec ? (respuestas[sec.id] || {}) : {};
  const TODO     = [...SECCIONES, { id: 'docs', num: '09', titulo: 'Documentos' }];

  useEffect(() => {
    sb.getRespuestas().then(r => { if (r?.answers) setRespuestas(r.answers); });
  }, []);

  const totalP    = SECCIONES.reduce((a, s) => a + s.preguntas.length, 0);
  const contestadas = SECCIONES.reduce((a, s) => {
    const sa = respuestas[s.id] || {};
    return a + s.preguntas.filter(p => { const v = sa[p.id]; return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''); }).length;
  }, 0);
  const pct = Math.round((contestadas / totalP) * 100);

  function setResp(pid, val) {
    setRespuestas(prev => ({ ...prev, [sec.id]: { ...(prev[sec.id] || {}), [pid]: val } }));
    setGuardado(false);
  }

  async function guardar() {
    setGuardando(true); setMsg('');
    try {
      await sb.upsertRespuestas(respuestas);
      setGuardado(true);
      setMsg('Respuestas guardadas correctamente');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Error al guardar: ' + e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function exportarPDF() {
    setGenPDF(true);
    setMsg('Generando reporte PDF con inteligencia artificial...');
    try {
      await generarPDF(respuestas, user.email, perfil?.nombre, perfil?.empresa, marca);
      setMsg('Reporte generado — se abrió para imprimir o guardar como PDF');
    } catch (e) {
      setMsg('Error al generar PDF: ' + e.message);
    } finally {
      setGenPDF(false);
    }
  }

  const riesgos = !ES_DOCS ? getRiesgos(respuestas) : [];

  return (
    <div style={{ minHeight: '100vh', background: C.fondo, fontFamily: "'Trebuchet MS','Helvetica Neue',Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.principal, borderLeft: `4px solid ${C.acento}`, padding: '0.7rem 1.5rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ color: C.acento, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
              {esPertento ? 'Pertento SC' : 'SAMO Consulting Group'} · Precios de Transferencia
            </p>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <p style={{ color: C.acento, fontSize: 16, fontWeight: 700, margin: 0 }}>{pct}%</p>
              <p style={{ color: C.gris, fontSize: 9, margin: 0 }}>{contestadas}/{totalP}</p>
            </div>
            {!ES_DOCS && (
              <button onClick={guardar} disabled={guardando}
                style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {guardando ? '...' : guardado ? 'Guardado' : 'Guardar'}
              </button>
            )}
            <button onClick={exportarPDF} disabled={genPDF}
              style={{ background: 'white', color: C.principal, border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {genPDF ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: C.gris, cursor: 'pointer', fontSize: 11 }}>Salir</button>
          </div>
        </div>
        <div style={{ maxWidth: 860, margin: '0.45rem auto 0', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: C.acento, transition: 'width 0.4s' }} />
        </div>
      </div>

      {msg && (
        <div style={{ maxWidth: 860, margin: '0.5rem auto 0', padding: '0 1rem' }}>
          <div style={{ background: msg.includes('Error') ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${msg.includes('Error') ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 8, padding: '0.5rem 1rem', fontSize: 13, color: msg.includes('Error') ? '#991B1B' : '#166534' }}>
            {msg}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.25rem 1rem 4rem' }}>

        {/* Navegación de secciones */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {TODO.map((s, i) => {
            const esDocs = i === SECCIONES.length;
            const sa = respuestas[s.id] || {};
            const completa = !esDocs && s.preguntas.filter(p => { const v = sa[p.id]; return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''); }).length === s.preguntas.length;
            const activa = i === seccion;
            return (
              <button key={s.id} onClick={() => setSeccion(i)} style={{
                background: activa ? C.acento : completa ? C.azulClaro : 'white',
                border: `1.5px solid ${activa ? C.acento : completa ? C.azul : C.borde}`,
                borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                color: activa ? C.principal : completa ? C.principal : C.gris,
                cursor: 'pointer',
              }}>
                {s.num}{completa && !activa ? ' ✓' : ''}
              </button>
            );
          })}
        </div>

        {/* Header de sección */}
        {!ES_DOCS && (
          <div style={{ background: C.principal, borderRadius: 12, padding: '0.95rem 1.25rem', marginBottom: '1rem', borderLeft: `4px solid ${C.acento}` }}>
            <p style={{ color: C.acento, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 3px' }}>
              Sección {sec.num} de {TODO.length}
            </p>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: '0 0 4px' }}>{sec.titulo}</h2>
            {sec.desc && (
              <p style={{ color: C.blancoMid, fontSize: 11.5, margin: 0, lineHeight: 1.5 }}>{sec.desc}</p>
            )}
          </div>
        )}

        {/* Preguntas o sección de documentos */}
        {ES_DOCS ? (
          <SeccionDocumentos C={C} userId={sb.user?.id} />
        ) : (
          <>
            {sec.preguntas.map(p => (
              <Campo key={p.id} p={p} valor={secAns[p.id]} onChange={v => setResp(p.id, v)} C={C} />
            ))}
            {riesgos.length > 0 && (
              <div style={{ background: '#FFFBEB', border: `1.5px solid ${C.acento}`, borderRadius: 10, padding: '0.9rem 1.1rem', margin: '1rem 0' }}>
                <p style={{ color: C.principal, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
                  Áreas de atención identificadas
                </p>
                {riesgos.map((r, i) => (
                  <p key={i} style={{ color: r.nivel === 'alto' ? '#DC2626' : '#D97706', fontSize: 12.5, margin: '0 0 4px', lineHeight: 1.5 }}>
                    {r.nivel === 'alto' ? '— ' : '· '}{r.msg}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {/* Navegación anterior / siguiente */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: 10 }}>
          <button onClick={() => setSeccion(s => s - 1)} disabled={seccion === 0}
            style={{ background: 'white', color: C.gris, border: `1.5px solid ${C.borde}`, borderRadius: 8, padding: '0.65rem 1.4rem', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: seccion === 0 ? 0.4 : 1 }}>
            Anterior
          </button>
          <div style={{ display: 'flex', gap: 5 }}>
            {TODO.map((_, i) => (
              <div key={i} onClick={() => setSeccion(i)} style={{ width: i === seccion ? 16 : 5, height: 5, borderRadius: 3, cursor: 'pointer', background: i === seccion ? C.acento : C.borde, transition: 'all 0.3s' }} />
            ))}
          </div>
          {seccion < TODO.length - 1 ? (
            <button onClick={() => setSeccion(s => s + 1)}
              style={{ background: C.azul, color: 'white', border: 'none', borderRadius: 8, padding: '0.65rem 1.4rem', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Siguiente
            </button>
          ) : (
            <button onClick={guardar}
              style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 8, padding: '0.65rem 1.4rem', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Finalizar y guardar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
