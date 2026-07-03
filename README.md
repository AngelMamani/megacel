# admin-frontend

Tienda online + panel administrativo MEGA CEL. React 19 + TypeScript + Vite + Firebase (Auth, Firestore, Storage).

## Requisitos

- Node.js 18+
- Proyecto Firebase configurado

## Uso local

```bash
npm install
cp .env.local.example .env.local   # Completa VITE_FIREBASE_*
npm run dev
```

Comandos útiles:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción → `dist/` |
| `npm run preview` | Previsualizar el build local |
| `npm run lint` | ESLint |

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Tienda (inicio) |
| `/catalogo` | Catálogo de productos |
| `/login` | Inicio de sesión |
| `/registro` | Crear cuenta cliente |
| `/admin` | Panel admin (requiere rol administrador) |
| `/admin/productos` | Gestión de productos |
| `/admin/pedidos` | Pedidos |
| `/admin/usuarios` | Usuarios y administradores |

---

## Despliegue en Vercel

### 1. Checklist antes de subir

- [ ] `npm run build` termina sin errores
- [ ] Variables `VITE_FIREBASE_*` listas (ver `.env.local.example`)
- [ ] Cambios commiteados y pusheados a GitHub (`main`)

### 2. Conectar el repositorio

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. **Add New → Project** e importa el repo.
3. Vercel detecta **Vite** automáticamente:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

El archivo `vercel.json` ya incluye:
- Rewrites SPA para React Router (`/admin/*`, `/catalogo`, etc.)
- Header `Cross-Origin-Opener-Policy` para login con Google/Firebase

### 3. Variables de entorno (obligatorio)

En **Settings → Environment Variables**, añade:

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | API Key de Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Opcional; por defecto `PROJECT_ID.firebaseapp.com` |

Asígnalas a **Production** y **Preview** si quieres que los deploys de preview también funcionen.

### 4. Firebase Console (obligatorio para auth)

En [Firebase Console](https://console.firebase.google.com) → **Authentication → Settings → Authorized domains**, agrega:

- Tu dominio de producción: `tu-proyecto.vercel.app`
- Dominio personalizado si usas uno
- `localhost` ya viene por defecto (desarrollo)

Sin esto, el login con Google fallará en producción con `auth/unauthorized-domain`.

### 5. Deploy

- Pulsa **Deploy** en el primer import, o haz push a `main` para deploy automático.
- Cada PR genera un **Preview URL** en Vercel (útil para probar antes de merge).

### 6. Verificación post-deploy

1. Abre la URL de Vercel → debe cargar la tienda en `/`
2. Prueba `/login` y `/registro`
3. Prueba `/admin` con cuenta administrador
4. Prueba login con Google si lo usas

### Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| Pantalla en blanco al recargar rutas | `vercel.json` rewrites ya configurados; redeploy |
| `Falta variable de entorno: VITE_FIREBASE_*` | Revisa env vars en Vercel y redeploy |
| Google login: dominio no autorizado | Añade dominio Vercel en Firebase Authorized domains |
| Storage/Firestore denegado | Revisa reglas de seguridad en Firebase |
