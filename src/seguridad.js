// ─── VALIDACIÓN DE CONTRASEÑAS ───────────────────────────────────

export const REGLAS_PASSWORD = [
  { id: 'longitud',   label: 'Mínimo 8 caracteres',                   test: (p) => p.length >= 8 },
  { id: 'mayuscula',  label: 'Al menos una letra mayúscula',          test: (p) => /[A-Z]/.test(p) },
  { id: 'minuscula',  label: 'Al menos una letra minúscula',          test: (p) => /[a-z]/.test(p) },
  { id: 'numero',     label: 'Al menos un número',                    test: (p) => /[0-9]/.test(p) },
  { id: 'especial',   label: 'Al menos un carácter especial (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export function validarPassword(password) {
  return {
    valida:   REGLAS_PASSWORD.every(r => r.test(password)),
    reglas:   REGLAS_PASSWORD.map(r => ({ ...r, cumple: r.test(password) })),
    puntaje:  REGLAS_PASSWORD.filter(r => r.test(password)).length,
  };
}

export function nivelSeguridad(puntaje) {
  if (puntaje <= 2) return { label: 'Débil',   color: '#DC2626' };
  if (puntaje <= 3) return { label: 'Regular', color: '#D97706' };
  if (puntaje <= 4) return { label: 'Buena',   color: '#2563EB' };
  return              { label: 'Fuerte',  color: '#059669' };
}

export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
