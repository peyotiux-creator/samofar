// ─── SUPABASE CLIENT ─────────────────────────────────────────────
// Las variables vienen de .env.local (desarrollo) o Vercel (producción)
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || URL.includes('TU_PROYECTO')) {
  console.warn('⚠️  Configura VITE_SUPABASE_URL en .env.local');
}

// Token en memoria — nunca en localStorage para mayor seguridad
let _token = null;
let _user  = null;
let _refreshTimer = null;

export const sb = {
  get user() { return _user; },
  get token() { return _token; },

  _headers(isUpload = false) {
    const h = { apikey: KEY, Authorization: `Bearer ${_token || KEY}` };
    if (!isUpload) h['Content-Type'] = 'application/json';
    return h;
  },

  // ── Auth ────────────────────────────────────────────────────────
  async signIn(email, password) {
    const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error_description || d.error);
    _token = d.access_token;
    _user  = d.user;
    // Auto-refresh antes de que expire (cada 55 min)
    _refreshTimer && clearInterval(_refreshTimer);
    _refreshTimer = setInterval(() => this._refresh(d.refresh_token), 55 * 60 * 1000);
    return _user;
  },

  async _refresh(refreshToken) {
    try {
      const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const d = await r.json();
      if (d.access_token) _token = d.access_token;
    } catch (e) {
      console.error('Refresh error:', e);
    }
  },

  async signOut() {
    await fetch(`${URL}/auth/v1/logout`, { method: 'POST', headers: this._headers() });
    _token = null; _user = null;
    _refreshTimer && clearInterval(_refreshTimer);
  },

  async getProfile(userId) {
    const r = await fetch(`${URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: this._headers(),
    });
    const d = await r.json();
    return d[0] || null;
  },

  // ── Admin: gestión de usuarios ──────────────────────────────────
  async adminListUsers() {
    const r = await fetch(`${URL}/rest/v1/profiles?select=*&order=created_at.desc`, {
      headers: this._headers(),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async adminCreateUser(email, password, nombre, empresa) {
    // Crear usuario en Supabase Auth vía service_role no está disponible
    // desde el frontend — se usa la función Edge o el admin endpoint
    // Por seguridad usamos el signup normal + confirmación manual en dashboard
    const r = await fetch(`${URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: { ...this._headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre, empresa },
      }),
    });
    if (!r.ok) {
      const e = await r.json();
      throw new Error(e.message || 'Error creando usuario');
    }
    return r.json();
  },

  async adminUpdateUserProfile(userId, data) {
    const r = await fetch(`${URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...this._headers(), Prefer: 'return=representation' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async adminGetAllRespuestas() {
    const r = await fetch(
      `${URL}/rest/v1/respuestas_far?select=*,profiles(nombre,empresa)&order=updated_at.desc`,
      { headers: this._headers() }
    );
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  // ── Respuestas ──────────────────────────────────────────────────
  async upsertRespuestas(answers) {
    const r = await fetch(`${URL}/rest/v1/respuestas_far`, {
      method: 'POST',
      headers: { ...this._headers(), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id:    _user.id,
        email:      _user.email,
        answers,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) throw new Error(await r.text());
  },

  async getRespuestas() {
    const r = await fetch(
      `${URL}/rest/v1/respuestas_far?user_id=eq.${_user.id}&select=*`,
      { headers: this._headers() }
    );
    const d = await r.json();
    return d[0] || null;
  },

  // ── Storage ─────────────────────────────────────────────────────
  async uploadFile(categoria, file) {
    const safe  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path  = `${_user.id}/${categoria}/${Date.now()}_${safe}`;
    const r = await fetch(`${URL}/storage/v1/object/documentos-far/${path}`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${_token}`, 'Content-Type': file.type },
      body: file,
    });
    if (!r.ok) throw new Error(await r.text());
    return path;
  },

  async listFiles(userId, categoria) {
    const uid = userId || _user.id;
    const r = await fetch(`${URL}/storage/v1/object/list/documentos-far`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ prefix: `${uid}/${categoria}/`, limit: 200 }),
    });
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  },

  async deleteFile(path) {
    const r = await fetch(`${URL}/storage/v1/object/documentos-far/${path}`, {
      method: 'DELETE', headers: this._headers(),
    });
    if (!r.ok) throw new Error(await r.text());
  },

  async getSignedUrl(path) {
    const r = await fetch(`${URL}/storage/v1/object/sign/documentos-far/${path}`, {
      method: 'POST', headers: this._headers(),
      body: JSON.stringify({ expiresIn: 3600 }),
    });
    const d = await r.json();
    return `${URL}/storage/v1${d.signedURL}`;
  },
};

export const SUPABASE_CONFIGURED = URL && !URL.includes('TU_PROYECTO');
