# 🚀 Instrucciones de Deploy - Selvadentro Dashboard IA

## ✅ Estado Actual

- ✅ **Build completado**: `dist/` contiene 483 KB optimizado
- ✅ **Servidor local corriendo**: `http://localhost:8080`
- ✅ **Git pusheado**: Branch `claude/ana-feature-011CUreKkNuNxH5ennhNrkE3`
- ✅ **Listo para deploy público**

---

## 🌐 OPCIÓN 1: Deploy con Vercel (Recomendado)

### **Método A: Via Web UI** (Más Fácil)

1. **Ve a Vercel**:
   - Abre https://vercel.com
   - Haz clic en "Sign Up" o "Log In"
   - Conecta tu cuenta de GitHub

2. **Importa el Proyecto**:
   - Clic en "Add New Project"
   - Selecciona el repositorio: `softvibeslab/dashboard_selva_ia`
   - Branch: `claude/ana-feature-011CUreKkNuNxH5ennhNrkE3`

3. **Configura el Proyecto**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Añade Environment Variables**:
   ```
   VITE_SUPABASE_URL = tu_supabase_url
   VITE_SUPABASE_ANON_KEY = tu_supabase_key
   VITE_ANTHROPIC_API_KEY = tu_anthropic_key
   ```

5. **Deploy**:
   - Clic en "Deploy"
   - Espera 2-3 minutos
   - ✅ **Tu URL será**: `https://dashboard-selva-ia-xxx.vercel.app`

### **Método B: Via CLI**

```bash
# 1. Login en Vercel
vercel login
# Sigue las instrucciones en el browser

# 2. Deploy (desde la raíz del proyecto)
cd /home/user/dashboard_selva_ia
vercel --prod

# 3. Sigue el wizard:
#    - Set up and deploy? Yes
#    - Which scope? Tu username
#    - Link to existing project? No
#    - What's your project's name? dashboard-selva-ia
#    - In which directory is your code? ./
#    - Auto-detected Vite! Override? No
#    - Build Command: npm run build
#    - Output Directory: dist

# ✅ Obtendrás la URL al final!
```

---

## 🟦 OPCIÓN 2: Deploy con Netlify

### **Método A: Via Web UI**

1. **Ve a Netlify**:
   - Abre https://netlify.com
   - Haz clic en "Sign up" o "Log in"
   - Conecta GitHub

2. **Import Project**:
   - "Add new site" → "Import an existing project"
   - Selecciona GitHub
   - Busca `dashboard_selva_ia`
   - Branch: `claude/ana-feature-011CUreKkNuNxH5ennhNrkE3`

3. **Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment Variables**:
   - Site settings → Environment variables
   - Add:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     VITE_ANTHROPIC_API_KEY
     ```

5. **Deploy**:
   - Clic en "Deploy site"
   - ✅ **Tu URL**: `https://dashboard-selva-ia.netlify.app`

### **Método B: Via CLI**

```bash
# 1. Instalar CLI (ya instalado si usaste npm)
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
cd /home/user/dashboard_selva_ia
netlify deploy --prod --dir=dist

# ✅ Obtendrás la URL!
```

---

## 📦 OPCIÓN 3: Deploy con GitHub Pages

```bash
# 1. Instalar gh-pages
npm install -g gh-pages

# 2. Añade script a package.json
# (Ya deberías tenerlo si no lo tienes)

# 3. Deploy
cd /home/user/dashboard_selva_ia
npm run build
gh-pages -d dist -b gh-pages

# 4. Activa GitHub Pages
# - Ve a repo Settings → Pages
# - Source: Deploy from branch
# - Branch: gh-pages
# - Folder: / (root)
# - Save

# ✅ Tu URL: https://softvibeslab.github.io/dashboard_selva_ia/
```

**IMPORTANTE para GitHub Pages**:
Actualiza `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/dashboard_selva_ia/', // Nombre del repo
  // ... resto de config
});
```

Luego rebuild y redeploy.

---

## 🐳 OPCIÓN 4: Deploy con Docker

### **Dockerfile** (Ya incluido):

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **nginx.conf**:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### **Build y Run**:

```bash
# Build
docker build -t selvadentro-dashboard .

# Run localmente
docker run -p 80:80 selvadentro-dashboard

# O push a Docker Hub y deploya en servidor
docker tag selvadentro-dashboard tu-usuario/selvadentro-dashboard
docker push tu-usuario/selvadentro-dashboard
```

---

## 🔐 Environment Variables

**Necesitas configurar estas variables en tu plataforma de deploy**:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic Claude AI (Required)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# GoHighLevel (Optional, si usas MCP)
VITE_GHL_API_KEY=tu_ghl_key
VITE_GHL_LOCATION_ID=tu_location_id
```

**¿Dónde están mis keys?**
- Supabase: https://app.supabase.com → Project Settings → API
- Anthropic: https://console.anthropic.com → API Keys
- GoHighLevel: Tu dashboard de GHL → Settings → API

---

## ✅ Post-Deploy Checklist

Después de deployar, verifica:

- [ ] La app carga correctamente
- [ ] Login funciona
- [ ] Se pueden ver las métricas
- [ ] Navegación entre secciones funciona
- [ ] PWA es instalable (ver en DevTools)
- [ ] Service Worker registra correctamente
- [ ] Manifest.json carga
- [ ] Funciona en móvil
- [ ] HTTPS está activo
- [ ] Environment variables funcionan

---

## 🌐 URLs de Deploy

Una vez deployado, tendrás una URL como:

**Vercel**:
```
https://dashboard-selva-ia.vercel.app
https://dashboard-selva-ia-git-claude-xxx.vercel.app (preview)
https://dashboard-selva-ia-xxx.vercel.app (production)
```

**Netlify**:
```
https://dashboard-selva-ia.netlify.app
https://dashbo ard-selva-ia--xxx.netlify.app (preview)
```

**GitHub Pages**:
```
https://softvibeslab.github.io/dashboard_selva_ia/
```

**Custom Domain** (Opcional):
Una vez deployado, puedes agregar tu dominio custom:
- `dashboard.selvadentro.com`
- Configura DNS con CNAME apuntando a tu URL de Vercel/Netlify

---

## 🆘 Troubleshooting

### **"Build failed"**
```bash
# Limpia y rebuilds
rm -rf node_modules dist
npm install
npm run build
```

### **"Environment variables not working"**
- Verifica que empiecen con `VITE_`
- Reinicia el deploy después de añadirlas
- Check en "Deployments" → "Functions" logs

### **"PWA not installing"**
- Verifica HTTPS (required)
- Check manifest.json carga
- Service Worker debe estar en root

### **"Page not found on refresh"**
- Configura rewrites/redirects para SPA
- Vercel: Ya configurado automáticamente
- Netlify: Añade `_redirects` file:
  ```
  /* /index.html 200
  ```

---

## 📞 Necesitas Ayuda?

- 📧 Email: soporte@selvadentro.com
- 📖 Docs: Ver `DOCUMENTACION_TECNICA.md`
- 💬 Chat: Usa el Chat IA en el dashboard (una vez deployado)

---

## 🎯 Opción Más Rápida

**Si quieres el deploy MÁS rápido (2 minutos)**:

```bash
# 1. Login en Vercel
vercel login

# 2. Deploy
vercel --prod

# 3. ¡Listo! Copia la URL que te da
```

Eso es todo. Vercel hace todo automáticamente.

---

**¡Feliz Deploy! 🚀**

*Selvadentro Tulum - Dashboard IA*
*Noviembre 2025*
