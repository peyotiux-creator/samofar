import { useState, useEffect } from 'react';
import { sb } from './supabase.js';
import { validarPassword, validarEmail, nivelSeguridad, REGLAS_PASSWORD } from './seguridad.js';
import { generarPDF } from './pdf.js';
import { SECCIONES } from './data.js';

// ─── MODAL CREAR USUARIO ──────────────────────────────────────────
function ModalCrearUsuario({ C, onClose, onCreado }) {
  const [email,    setEmail]    = useState('');
  const [nombre,   setNombre]   = useState('');
  const [empresa,  setEmpresa]  = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [creando,  setCreando]  = useState(false);

  const { valida, reglas, puntaje } = validarPassword(pass);
  const seg = nivelSeguridad(puntaje);

  async function crear(e) {
    e.preventDefault();
    setError('');
    if (!validarEmail(email))  { setError('Correo electrónico no válido'); return; }
    if (!nombre.trim())        { setError('El nombre es requerido'); return; }
    if (!valida)               { setError('La contraseña no cumple todos los requisitos'); return; }
    setCreando(true);
    try {
      await sb.adminCreateUser(email, pass, nombre, empresa);
      onCreado();
      onClose();
    } catch (ex) {
      const msg = ex.message || '';
      if (msg.includes('already')) setError('Este correo ya está registrado');
      else if (msg.includes('service_role')) setError('Se requiere la clave service_role en el servidor. Crea el usuario desde Supabase Dashboard → Authentication → Users');
      else setError(msg || 'Error al crear usuario');
    } finally {
      setCreando(false);
    }
  }

  const inp = { width: '100%', border: `1.5px solid ${C.borde}`, borderRadius: 7, padding: '0.6rem 0.85rem', fontSize: 13, color: C.texto, outline: 'none', boxSizing: 'border-box', background: C.fondo, fontFamily: 'inherit' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: C.texto, fontWeight: 700, fontSize: 17, margin: 0 }}>Crear nuevo usuario</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.gris, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Nota sobre service_role */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '0.7rem', marginBottom: '1rem', fontSize: 12, color: '#1E40AF' }}>
          <strong>Nota:</strong> Para crear usuarios desde el panel admin, necesitas agregar <code>VITE_SUPABASE_SERVICE_KEY</code> en tus variables de entorno (Vercel → Settings → Environment Variables) con la clave <em>service_role</em> de Supabase (Dashboard → Settings → API → service_role secret). <strong>Nunca compartas esta clave.</strong>
          <br/><br/>
          Alternativa: crea el usuario manualmente en <strong>Supabase → Authentication → Users → Add user</strong> y actívalo con email confirm.
        </div>

        <form onSubmit={crear}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>NOMBRE COMPLETO *</label>
            <input style={inp} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del responsable" required />
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>EMPRESA / CLIENTE</label>
            <input style={inp} value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Razón social" />
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>CORREO ELECTRÓNICO *</label>
            <input type="email" style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>CONTRASEÑA TEMPORAL *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} style={{ ...inp, paddingRight: '2.8rem' }} value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" required />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.gris, fontSize: 12, cursor: 'pointer' }}>
                {showPass ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            {/* Indicador de seguridad */}
            {pass.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.gris }}>Seguridad:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: seg.color }}>{seg.label}</span>
                </div>
                <div style={{ height: 4, background: C.borde, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(puntaje / REGLAS_PASSWORD.length) * 100}%`, background: seg.color, transition: 'width 0.3s, background 0.3s' }} />
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {reglas.map(r => (
                    <span key={r.id} style={{ fontSize: 11, color: r.cumple ? '#059669' : C.gris }}>
                      {r.cumple ? '✓' : '·'} {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 7, padding: '0.6rem', marginBottom: '0.85rem', fontSize: 13, color: '#991B1B' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ background: 'white', color: C.gris, border: `1.5px solid ${C.borde}`, borderRadius: 7, padding: '0.6rem 1.2rem', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={creando || !valida} style={{ background: C.azul, color: 'white', border: 'none', borderRadius: 7, padding: '0.6rem 1.2rem', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (!valida || creando) ? 0.6 : 1 }}>
              {creando ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DETALLE DE RESPUESTAS ────────────────────────────────────────
function DetalleRespuestas({ resp, C, onClose, marca }) {
  const [genPDF, setGenPDF] = useState(false);

  async function exportar() {
    setGenPDF(true);
    try {
      await generarPDF(resp.answers || {}, resp.email, resp.profiles?.nombre, resp.profiles?.empresa, marca);
    } catch (e) {
      alert('Error al generar PDF: ' + e.message);
    } finally {
      setGenPDF(false);
    }
  }

  const totalP = SECCIONES.reduce((a, s) => a + s.preguntas.length, 0);
  const contestadas = SECCIONES.reduce((a, s) => {
    const sa = (resp.answers || {})[s.id] || {};
    return a + s.preguntas.filter(p => { const v = sa[p.id]; return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''); }).length;
  }, 0);
  const pct = Math.round((contestadas / totalP) * 100);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        {/* Header del modal */}
        <div style={{ background: C.principal, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${C.acento}` }}>
          <div>
            <p style={{ color: C.acento, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }}>Respuestas del cuestionario</p>
            <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '2px 0 0' }}>{resp.profiles?.nombre || resp.email}</h3>
            {resp.profiles?.empresa && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>{resp.profiles.empresa}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{pct}% completado</span>
            <button onClick={exportar} disabled={genPDF}
              style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {genPDF ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ overflowY: 'auto', padding: '1.25rem', flex: 1 }}>
          {SECCIONES.map(sec => {
            const sa = (resp.answers || {})[sec.id] || {};
            const tieneRespuestas = sec.preguntas.some(p => {
              const v = sa[p.id]; return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== '');
            });
            return (
              <div key={sec.id} style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: C.principal, fontWeight: 700, fontSize: 13, margin: '0 0 0.6rem', borderBottom: `2px solid ${C.acento}`, paddingBottom: 4 }}>
                  {sec.num}. {sec.titulo}
                </h4>
                {!tieneRespuestas ? (
                  <p style={{ color: C.gris, fontSize: 12, fontStyle: 'italic' }}>Sin respuestas en esta sección</p>
                ) : (
                  sec.preguntas.map(p => {
                    const v = sa[p.id];
                    if (!v) return null;
                    const display = p.tipo === 'matriz'
                      ? Object.entries(v).map(([ri, col]) => `${p.filas[ri]}: ${col}`).join(' | ')
                      : Array.isArray(v) ? v.join(', ') : v;
                    return (
                      <div key={p.id} style={{ display: 'flex', gap: 12, padding: '0.4rem 0', borderBottom: `1px solid ${C.borde}` }}>
                        <span style={{ color: C.gris, fontSize: 11.5, flex: '0 0 45%', lineHeight: 1.5 }}>
                          {p.label.split(' — ')[0].split(' — ')[0]}
                        </span>
                        <span style={{ color: C.texto, fontSize: 12, fontWeight: 600, flex: 1, lineHeight: 1.5 }}>{display}</span>
                      </div>
                    );
                  }).filter(Boolean)
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PANEL ADMIN PRINCIPAL ────────────────────────────────────────
export default function Admin({ marca, user, onLogout }) {
  const [tab,         setTab]         = useState('usuarios');
  const [usuarios,    setUsuarios]    = useState([]);
  const [respuestas,  setRespuestas]  = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [modalCrear,  setModalCrear]  = useState(false);
  const [detalle,     setDetalle]     = useState(null);
  const [busqueda,    setBusqueda]    = useState('');
  const [msg,         setMsg]         = useState('');

  const esPertento = marca === 'pertento';
  const C = esPertento
    ? { principal: '#1B2A5C', principalMid: '#243070', acento: '#EDB512', azul: '#3A78C9', azulClaro: '#EEF4FF', borde: '#C8D8F0', fondo: '#F4F7FC', texto: '#1A2330', gris: '#8A9BBF' }
    : { principal: '#0D1117', principalMid: '#1A2A3A', acento: '#00A0DC', azul: '#00A0DC', azulClaro: '#EBF7FC', borde: '#D8E8F0', fondo: '#F0F7FB', texto: '#1A2330', gris: '#8A8A8A' };

  useEffect(() => { cargarTodo(); }, []);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [u, r] = await Promise.all([sb.adminListUsers(), sb.adminGetAllRespuestas()]);
      setUsuarios(u.filter(u => u.role !== 'admin'));
      setRespuestas(r);
    } catch (e) {
      setMsg('Error al cargar datos: ' + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function toggleActivo(u) {
    try {
      await sb.adminUpdateUserProfile(u.id, { activo: !u.activo });
      setMsg(`Usuario ${!u.activo ? 'activado' : 'desactivado'}`);
      setTimeout(() => setMsg(''), 3000);
      await cargarTodo();
    } catch (e) {
      setMsg('Error: ' + e.message);
    }
  }

  const fmtFecha = d => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const usuariosFiltrados = usuarios.filter(u =>
    u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.empresa?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const respuestasFiltradas = respuestas.filter(r =>
    r.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.profiles?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.profiles?.empresa?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular % completado de un set de respuestas
  function calcPct(answers) {
    if (!answers) return 0;
    const total = SECCIONES.reduce((a, s) => a + s.preguntas.length, 0);
    const done  = SECCIONES.reduce((a, s) => {
      const sa = answers[s.id] || {};
      return a + s.preguntas.filter(p => { const v = sa[p.id]; return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''); }).length;
    }, 0);
    return Math.round((done / total) * 100);
  }

  const cardStyle = { background: 'white', borderRadius: 10, border: `1.5px solid ${C.borde}`, padding: '1.1rem 1.25rem', marginBottom: '0.75rem' };

  return (
    <div style={{ minHeight: '100vh', background: C.fondo, fontFamily: "'Trebuchet MS','Helvetica Neue',Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.principal, borderLeft: `4px solid ${C.acento}`, padding: '0.7rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: C.acento, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
              Panel de Administración · {esPertento ? 'Pertento SC' : 'SAMO Consulting Group'}
            </p>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{user.email}</p>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: `1px solid rgba(255,255,255,0.3)`, color: 'rgba(255,255,255,0.7)', borderRadius: 7, padding: '0.45rem 1rem', fontSize: 12, cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {msg && (
          <div style={{ background: msg.includes('Error') ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${msg.includes('Error') ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 8, padding: '0.5rem 1rem', fontSize: 13, color: msg.includes('Error') ? '#991B1B' : '#166534', marginBottom: '1rem' }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', background: 'white', borderRadius: 10, border: `1.5px solid ${C.borde}`, overflow: 'hidden', width: 'fit-content' }}>
          {[
            { id: 'usuarios',   label: 'Usuarios' },
            { id: 'respuestas', label: 'Cuestionarios' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? C.principal : 'transparent',
              color: tab === t.id ? 'white' : C.gris,
              border: 'none', padding: '0.65rem 1.4rem', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              borderRight: `1px solid ${C.borde}`,
            }}>
              {t.label}
              {t.id === 'usuarios' && <span style={{ marginLeft: 6, background: tab === t.id ? C.acento : C.borde, color: tab === t.id ? C.principal : C.gris, borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{usuarios.length}</span>}
              {t.id === 'respuestas' && <span style={{ marginLeft: 6, background: tab === t.id ? C.acento : C.borde, color: tab === t.id ? C.principal : C.gris, borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{respuestas.length}</span>}
            </button>
          ))}
        </div>

        {/* Buscador + acción */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center' }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, empresa o correo..."
            style={{ flex: 1, border: `1.5px solid ${C.borde}`, borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: 13, color: C.texto, outline: 'none', background: 'white', fontFamily: 'inherit' }}
          />
          {tab === 'usuarios' && (
            <button onClick={() => setModalCrear(true)}
              style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Nuevo usuario
            </button>
          )}
          <button onClick={cargarTodo} style={{ background: 'white', color: C.gris, border: `1.5px solid ${C.borde}`, borderRadius: 8, padding: '0.6rem 1rem', fontSize: 12, cursor: 'pointer' }}>
            Actualizar
          </button>
        </div>

        {cargando ? (
          <p style={{ textAlign: 'center', color: C.gris, padding: '3rem' }}>Cargando...</p>
        ) : (
          <>
            {/* TAB: USUARIOS */}
            {tab === 'usuarios' && (
              <>
                {usuariosFiltrados.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', color: C.gris, padding: '2.5rem' }}>
                    {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay usuarios registrados aún'}
                  </div>
                ) : (
                  usuariosFiltrados.map(u => {
                    const respUser = respuestas.find(r => r.user_id === u.id);
                    const pct = respUser ? calcPct(respUser.answers) : null;
                    return (
                      <div key={u.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.activo ? C.azulClaro : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: u.activo ? C.azul : C.gris, fontWeight: 700, fontSize: 14 }}>
                            {(u.nombre || u.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: C.texto, fontWeight: 700, fontSize: 13.5, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.nombre || '(sin nombre)'}
                          </p>
                          <p style={{ color: C.gris, fontSize: 12, margin: '1px 0 0' }}>{u.email}</p>
                          {u.empresa && <p style={{ color: C.gris, fontSize: 11, margin: '1px 0 0' }}>{u.empresa}</p>}
                        </div>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          {pct !== null ? (
                            <>
                              <p style={{ color: C.azul, fontSize: 18, fontWeight: 700, margin: 0 }}>{pct}%</p>
                              <p style={{ color: C.gris, fontSize: 10, margin: 0 }}>completado</p>
                            </>
                          ) : (
                            <p style={{ color: C.gris, fontSize: 11, margin: 0 }}>Sin respuestas</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                          <span style={{ background: u.activo ? '#DCFCE7' : '#F3F4F6', color: u.activo ? '#166534' : C.gris, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <p style={{ color: C.gris, fontSize: 10, margin: 0, textAlign: 'center' }}>Desde {fmtFecha(u.created_at)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {respUser && (
                            <button onClick={() => setDetalle(respUser)}
                              style={{ background: C.azulClaro, color: C.azul, border: `1px solid ${C.borde}`, borderRadius: 7, padding: '0.4rem 0.8rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Ver respuestas
                            </button>
                          )}
                          <button onClick={() => toggleActivo(u)}
                            style={{ background: u.activo ? '#FEF2F2' : '#F0FDF4', color: u.activo ? '#991B1B' : '#166534', border: `1px solid ${u.activo ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 7, padding: '0.4rem 0.8rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAB: CUESTIONARIOS */}
            {tab === 'respuestas' && (
              <>
                {respuestasFiltradas.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', color: C.gris, padding: '2.5rem' }}>
                    {busqueda ? 'Sin resultados para esa búsqueda' : 'Aún no hay cuestionarios respondidos'}
                  </div>
                ) : (
                  respuestasFiltradas.map(r => {
                    const pct = calcPct(r.answers);
                    return (
                      <div key={r.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: C.texto, fontWeight: 700, fontSize: 13.5, margin: 0 }}>
                            {r.profiles?.nombre || r.email}
                          </p>
                          {r.profiles?.empresa && <p style={{ color: C.gris, fontSize: 12, margin: '1px 0 0' }}>{r.profiles.empresa}</p>}
                          <p style={{ color: C.gris, fontSize: 11, margin: '2px 0 0' }}>Última actualización: {fmtFecha(r.updated_at)}</p>
                        </div>
                        {/* Barra de progreso */}
                        <div style={{ flexShrink: 0, width: 120 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 11, color: C.gris }}>Progreso</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? '#059669' : C.azul }}>{pct}%</span>
                          </div>
                          <div style={{ height: 5, background: C.borde, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#059669' : C.azul, borderRadius: 3 }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => setDetalle(r)}
                            style={{ background: C.azulClaro, color: C.azul, border: `1px solid ${C.borde}`, borderRadius: 7, padding: '0.4rem 0.8rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Ver detalles
                          </button>
                          <button onClick={async () => {
                            try { await generarPDF(r.answers || {}, r.email, r.profiles?.nombre, r.profiles?.empresa, marca); }
                            catch (e) { setMsg('Error PDF: ' + e.message); }
                          }}
                            style={{ background: C.acento, color: C.principal, border: 'none', borderRadius: 7, padding: '0.4rem 0.8rem', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Exportar PDF
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </div>

      {modalCrear && (
        <ModalCrearUsuario C={C} onClose={() => setModalCrear(false)} onCreado={cargarTodo} />
      )}
      {detalle && (
        <DetalleRespuestas resp={detalle} C={C} onClose={() => setDetalle(null)} marca={marca} />
      )}
    </div>
  );
}
