import { useState, useEffect } from 'react';
import Login      from './Login.jsx';
import Cuestionario from './Cuestionario.jsx';
import Admin      from './Admin.jsx';
import { sb }     from './supabase.js';

// ─── CONFIGURACIÓN DE MARCA ───────────────────────────────────────
// Para cambiar entre Pertento SC y SAMO, modifica esta línea:
// 'pertento'  → colores navy/dorado/azul de Pertento SC
// 'samo'      → colores oscuro/azul SAMO Consulting Group
const MARCA = 'samo'; // <-- cambia a 'samo' para la versión SAMO

export default function App() {
  const [estado,  setEstado]  = useState('cargando'); // 'cargando' | 'login' | 'app' | 'admin'
  const [user,    setUser]    = useState(null);
  const [perfil,  setPerfil]  = useState(null);

  useEffect(() => {
    // Comprueba si hay una sesión en la URL (magic link) o simplemente inicia en login
    const path = window.location.pathname;
    if (path === '/admin') {
      // Si ya hay sesión activa la recuperamos al hacer login
      setEstado('login');
    } else {
      setEstado('login');
    }
  }, []);

  async function handleLogin(user, profile) {
    setUser(user);
    setPerfil(profile);
    const esAdmin   = profile?.role === 'admin';
    const rutaAdmin = window.location.pathname.startsWith('/admin');
    if (esAdmin && rutaAdmin) {
      setEstado('admin');
    } else if (esAdmin && !rutaAdmin) {
      // Admin que entra por la ruta normal — deja entrar al cuestionario también
      setEstado('app');
    } else {
      setEstado('app');
    }
  }

  function handleLogout() {
    sb.signOut().finally(() => {
      setUser(null);
      setPerfil(null);
      setEstado('login');
      window.history.pushState({}, '', '/');
    });
  }

  if (estado === 'cargando') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: MARCA === 'pertento' ? '#1B2A5C' : '#0D1117' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Cargando...</p>
      </div>
    );
  }

  if (estado === 'login') {
    return <Login marca={MARCA} onLogin={handleLogin} />;
  }

  if (estado === 'admin') {
    return <Admin marca={MARCA} user={user} perfil={perfil} onLogout={handleLogout} />;
  }

  return (
    <Cuestionario
      marca={MARCA}
      user={user}
      perfil={perfil}
      onLogout={handleLogout}
      onGoAdmin={perfil?.role === 'admin' ? () => setEstado('admin') : null}
    />
  );
}
