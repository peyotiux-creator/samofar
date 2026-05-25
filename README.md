# Cuestionario FAR — Precios de Transferencia
Aplicación web para levantamiento de información de análisis funcional (FAR).
Pertento SC / SAMO Consulting Group

---

## Setup en 20 minutos

### 1. Supabase (base de datos + autenticación + storage)

1. Ve a **supabase.com** → New Project
2. En **SQL Editor** → New query → pega el contenido de `supabase_setup.sql` → Run
3. Ve a **Settings → API** y copia:
   - `Project URL` → tu `VITE_SUPABASE_URL`
   - `anon public` key → tu `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → tu `VITE_SUPABASE_SERVICE_KEY` *(solo para crear usuarios desde el panel admin)*

### 2. Crear tu usuario administrador

1. Supabase Dashboard → **Authentication → Users → Add user**
2. Ingresa tu correo y una contraseña segura (mínimo 8 caracteres, mayúscula, número y especial)
3. En **SQL Editor** ejecuta:
   ```sql
   update public.profiles set role = 'admin' where email = 'tu@correo.com';
   ```

### 3. Crear usuarios para tus clientes

**Opción A — Desde el panel admin de la app** (requiere `VITE_SUPABASE_SERVICE_KEY`):
- Ve a `tu-app.vercel.app/admin` → inicia sesión → pestaña "Usuarios" → "+ Nuevo usuario"

**Opción B — Desde Supabase Dashboard** (siempre disponible):
- Authentication → Users → Add user → ingresa correo y contraseña
- Comparte las credenciales con el cliente por correo

### 4. Despliegue en Vercel

1. Sube este proyecto a GitHub (nuevo repositorio)
2. Ve a **vercel.com** → New Project → importa el repo
3. En **Settings → Environment Variables** agrega:
   ```
   VITE_SUPABASE_URL      = https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY = tu_anon_key_aqui
   VITE_SUPABASE_SERVICE_KEY = tu_service_role_key (opcional, para crear usuarios desde admin)
   ```
4. Deploy → listo

### 5. Dos versiones (Pertento SC y SAMO)

Para la versión SAMO, crea un segundo proyecto en Vercel con el mismo repo pero cambia en `src/App.jsx`:
```js
const MARCA = 'samo'; // línea 11
```
Y agrega las mismas variables de entorno (pueden ser el mismo proyecto Supabase o uno diferente).

---

## Rutas de la aplicación

| Ruta       | Descripción                              |
|------------|------------------------------------------|
| `/`        | Cuestionario (clientes)                  |
| `/admin`   | Panel de administración (solo admin)     |

---

## Estructura del proyecto

```
src/
  App.jsx          Enrutador principal + configuración de marca
  main.jsx         Punto de entrada React
  index.css        Estilos globales base
  Login.jsx        Pantalla de acceso (se adapta a la marca)
  Cuestionario.jsx Cuestionario completo (8 secciones + documentos)
  Admin.jsx        Panel admin (usuarios, respuestas, exportar PDF)
  supabase.js      Cliente Supabase (autenticación + datos + storage)
  data.js          Preguntas, secciones y lógica de alertas
  seguridad.js     Validación de contraseñas
  pdf.js           Generador de reporte PDF vía API de Claude
supabase_setup.sql Script SQL completo para configurar Supabase
public/
  logo-pertento.svg Logo de Pertento SC
  logo-samo.png     Logo de SAMO Consulting Group
```

---

## Seguridad de contraseñas

Las contraseñas de los usuarios deben cumplir:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (!@#$%...)

Estas reglas se validan en el frontend al crear usuarios y se muestran visualmente con un indicador de seguridad.

---

## Nota sobre el PDF

El botón "Exportar PDF" envía las respuestas a la API de Claude para generar un reporte HTML profesional que se abre en una nueva ventana del navegador lista para imprimir o guardar como PDF (Ctrl+P → Guardar como PDF).

El PDF incluye: portada, resumen ejecutivo, respuestas por sección, alertas de riesgo identificadas y conclusiones preliminares.

---

## Contacto

Jorge Armando Meza · Pertento SC
jorge.meza@pertentosc.com · +52 (656) 201-4023
