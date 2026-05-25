import { useState } from 'react';
import { sb, SUPABASE_CONFIGURED } from './supabase.js';
import { validarPassword, nivelSeguridad, REGLAS_PASSWORD, validarEmail } from './seguridad.js';

// ─── SQL SETUP HINT ───────────────────────────────────────────────
const SQL_HINT = `-- Ejecuta en Supabase → SQL Editor (usa el archivo supabase_setup.sql)
-- Luego en Dashboard → Authentication → Users → Add user
-- Crea tu usuario admin y ejecuta:
-- update public.profiles set role = 'admin' where email = 'tu@email.com';`;

export default function Login({ marca, onLogin }) {
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [showSQL,  setShowSQL]  = useState(false);

  const esPertento = marca === 'pertento';
  const C = esPertento
    ? { bg: '#1B2A5C', acento: '#EDB512', btn: '#3A78C9', texto: '#1A2330', gris: '#8A9BBF', claro: '#F4F7FC', borde: '#C8D8F0' }
    : { bg: '#0D1117', acento: '#00A0DC', btn: '#00A0DC', texto: '#1A2330', gris: '#8A8A8A', claro: '#F0F7FB', borde: '#D8E8F0' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validarEmail(email)) { setError('Correo electrónico no válido'); return; }
    if (pass.length < 8)      { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    setCargando(true);
    try {
      const user = await sb.signIn(email, pass);
      const profile = await sb.getProfile(user.id);
      onLogin(user, profile);
    } catch (ex) {
      const msg = ex.message || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setError('Correo o contraseña incorrectos');
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Cuenta pendiente de confirmación — contacta a tu asesor');
      } else {
        setError(msg || 'Error al iniciar sesión');
      }
    } finally {
      setCargando(false);
    }
  }

  const inpStyle = {
    width: '100%', border: `1.5px solid ${C.borde}`, borderRadius: 8,
    padding: '0.65rem 0.9rem', fontSize: 14, color: C.texto,
    outline: 'none', boxSizing: 'border-box', background: C.claro,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '1.5rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {esPertento ? (
            <svg viewBox="0 0 680 200" style={{ height: 56, display: 'block', margin: '0 auto 0.5rem' }}>
              <g transform="translate(146,30)">
                <text x="0" y="72" fontFamily="'Trebuchet MS',Arial,sans-serif" fontSize="72" fontWeight="200" fill="#FFFFFF" letterSpacing="8">PERTENT</text>
                <line x1="358" y1="73" x2="358" y2="98" stroke="#3A78C9" strokeWidth="8" strokeLinecap="round"/>
                <circle cx="358" cy="46" r="27" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
                <circle cx="358" cy="46" r="14" fill="none" stroke="#3A78C9" strokeWidth="2" opacity="0.7"/>
                <line x1="0" y1="90" x2="340" y2="90" stroke="#EDB512" strokeWidth="6" strokeLinecap="round"/>
              </g>
            </svg>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
              <div style={{ background: '#00A0DC', color: 'white', fontWeight: 900, fontSize: 26, padding: '0.3rem 0.8rem', borderRadius: 6, letterSpacing: 1 }}>SAMO</div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 300, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.3 }}>CONSULTING<br/>GROUP</div>
            </div>
          )}
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, letterSpacing: 1 }}>
            PRECIOS DE TRANSFERENCIA · CUESTIONARIO FAR
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem 1.75rem', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ color: C.texto, fontWeight: 700, fontSize: 19, margin: '0 0 0.25rem' }}>Acceso al cuestionario</h2>
          <p style={{ color: C.gris, fontSize: 13, margin: '0 0 1.5rem' }}>
            Ingresa con las credenciales proporcionadas por tu asesor
          </p>

          {!SUPABASE_CONFIGURED && (
            <div style={{ background: '#FFF3CD', border: '1px solid #FBBF24', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: 12, color: '#92400E' }}>
              <strong>Configura Supabase:</strong> Crea un archivo <code>.env.local</code> con las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.{' '}
              <button onClick={() => setShowSQL(s => !s)} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                {showSQL ? 'Ocultar' : 'Ver instrucciones SQL'}
              </button>
              {showSQL && <pre style={{ marginTop: '0.5rem', background: '#1E1E2E', color: '#CDD6F4', padding: '0.6rem', borderRadius: 6, fontSize: 10, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{SQL_HINT}</pre>}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>CORREO ELECTRÓNICO</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                autoComplete="email"
                style={inpStyle}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, display: 'block', marginBottom: 4, letterSpacing: 1 }}>CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inpStyle, paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.gris, fontSize: 13, cursor: 'pointer' }}
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: 13, color: '#991B1B' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{ width: '100%', background: C.btn, color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem', fontSize: 14, fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1 }}
            >
              {cargando ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: '1.5rem' }}>
          {esPertento
            ? 'Pertento SC · jorge.meza@pertentosc.com · +52 (656) 201-4023'
            : 'SAMO Consulting Group · Análisis FAR · Precios de Transferencia'}
        </p>
      </div>
    </div>
  );
}
