# 🚀 Guía de Deploy - Easypanel (Hostinger VPS)

## 📋 Requisitos Previos

✅ VPS en Hostinger con Easypanel instalado
✅ Acceso al panel de Easypanel
✅ Repositorio Git accesible
✅ Docker instalado en el VPS (viene con Easypanel)

---

## 🎯 MÉTODO 1: Deploy desde GitHub (Recomendado)

### **Paso 1: Preparar el Repositorio**

Ya está listo! El repositorio tiene:
- ✅ `Dockerfile` optimizado
- ✅ `nginx.conf` para SPA/PWA
- ✅ `.dockerignore` configurado
- ✅ `docker-compose.yml` opcional

### **Paso 2: Acceder a Easypanel**

1. Abre tu navegador
2. Ve a: `https://tu-vps-ip:3000` o `https://panel.tudominio.com`
3. Inicia sesión con tus credenciales de Easypanel

### **Paso 3: Crear Nueva Aplicación**

1. En el dashboard de Easypanel, haz clic en **"Create"** o **"New Project"**
2. Selecciona **"App"** (Application)
3. Elige el tipo: **"From Source"** o **"GitHub Repository"**

### **Paso 4: Conectar Repositorio**

**Si usas GitHub**:
1. Conecta tu cuenta de GitHub (si no lo has hecho)
2. Selecciona el repositorio: `softvibeslab/dashboard_selva_ia`
3. Branch: `claude/ana-feature-011CUreKkNuNxH5ennhNrkE3`

**Si usas otro Git provider**:
1. Ingresa la URL del repositorio
2. Proporciona credenciales si es privado

### **Paso 5: Configurar Build**

En la configuración de la app:

```yaml
Name: selvadentro-dashboard
Build Method: Dockerfile
Dockerfile Path: ./Dockerfile
Port: 80
```

**Settings avanzados**:
```yaml
Build Context: .
Build Args: (ninguno necesario)
Container Port: 80
Protocol: HTTP
```

### **Paso 6: Configurar Environment Variables**

En la sección de **Environment Variables**, añade:

```env
# Estos son OPCIONALES para el build, pero NECESARIOS para funcionalidad completa
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

**IMPORTANTE**: Las variables `VITE_*` deben estar presentes durante el BUILD, no solo en runtime.

**Solución**:
- Opción A: Define las variables en Easypanel antes de hacer deploy
- Opción B: Usa un archivo `.env` (no recomendado para producción)
- Opción C: Rebuilds la app después de añadir variables

### **Paso 7: Configurar Dominio**

1. En la sección **Domains**:
   - Añade tu dominio: `dashboard.tudominio.com`
   - O usa el dominio por defecto de Easypanel: `selvadentro-dashboard.xxxxx.easypanel.host`

2. **SSL Certificate**:
   - Easypanel automáticamente genera certificado Let's Encrypt
   - Espera 2-3 minutos para que se active

### **Paso 8: Deploy**

1. Haz clic en **"Deploy"** o **"Create & Deploy"**
2. Espera el proceso de build (3-5 minutos primera vez)
3. Verás los logs en tiempo real

**Build process**:
```
→ Cloning repository...
→ Building Docker image...
→ Stage 1: Installing dependencies...
→ Stage 2: Building React app...
→ Stage 3: Setting up Nginx...
→ Pushing image to registry...
→ Deploying container...
✓ Deployment successful!
```

### **Paso 9: Verificar Deployment**

1. Una vez completado, abre la URL:
   - `https://tu-dominio.com` o
   - `https://selvadentro-dashboard.xxxxx.easypanel.host`

2. Verifica:
   - ✅ App carga correctamente
   - ✅ Login funciona
   - ✅ PWA es instalable
   - ✅ HTTPS está activo

---

## 🎯 MÉTODO 2: Deploy Manual (Docker)

Si prefieres más control:

### **Paso 1: SSH a tu VPS**

```bash
ssh root@tu-vps-ip
# O
ssh tu-usuario@tu-vps-ip
```

### **Paso 2: Clonar Repositorio**

```bash
cd /home
git clone https://github.com/softvibeslab/dashboard_selva_ia.git
cd dashboard_selva_ia
git checkout claude/ana-feature-011CUreKkNuNxH5ennhNrkE3
```

### **Paso 3: Crear archivo .env**

```bash
nano .env
```

Añade:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_key
VITE_ANTHROPIC_API_KEY=tu_key
```

Guarda: `Ctrl+X`, `Y`, `Enter`

### **Paso 4: Build Docker Image**

```bash
docker build -t selvadentro-dashboard:latest .
```

Esto tomará 3-5 minutos la primera vez.

### **Paso 5: Run Container**

```bash
docker run -d \
  --name selvadentro-dashboard \
  --restart unless-stopped \
  -p 80:80 \
  selvadentro-dashboard:latest
```

### **Paso 6: Verificar**

```bash
# Check container status
docker ps | grep selvadentro

# Check logs
docker logs selvadentro-dashboard

# Check health
curl http://localhost/health
```

Deberías ver: `healthy`

### **Paso 7: Configurar Reverse Proxy (Opcional)**

Si ya tienes otros servicios en el puerto 80:

```bash
# Cambia el puerto
docker stop selvadentro-dashboard
docker rm selvadentro-dashboard

docker run -d \
  --name selvadentro-dashboard \
  --restart unless-stopped \
  -p 8080:80 \
  selvadentro-dashboard:latest
```

Luego configura nginx o traefik para hacer proxy a puerto 8080.

---

## 🎯 MÉTODO 3: Docker Compose

### **Paso 1: Editar docker-compose.yml**

El archivo ya está creado. Solo necesitas ajustar el puerto si es necesario:

```yaml
version: '3.8'

services:
  dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: selvadentro-dashboard
    restart: unless-stopped
    ports:
      - "80:80"  # Cambia si necesitas otro puerto
    environment:
      - NODE_ENV=production
    # ... resto igual
```

### **Paso 2: Deploy**

```bash
# Build y start
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Configuración de Easypanel

### **Resources (Recursos)**

```yaml
CPU Limit: 0.5 (50% de 1 core) - suficiente
Memory Limit: 512 MB - suficiente para nginx
Disk Space: 1 GB - más que suficiente
```

### **Scaling**

```yaml
Min Instances: 1
Max Instances: 1 (aumenta si necesitas)
Auto-scaling: Off (no necesario para static site)
```

### **Health Check**

```yaml
Path: /health
Port: 80
Interval: 30s
Timeout: 3s
Healthy Threshold: 3
Unhealthy Threshold: 2
```

### **Restart Policy**

```yaml
Policy: unless-stopped
Max Retries: 3
```

---

## 🌐 Configuración de Dominio

### **Opción 1: Usar Dominio Easypanel**

Easypanel te da un dominio automático:
```
https://selvadentro-dashboard.xxxxx.easypanel.host
```

**Ventajas**:
- ✅ Automático
- ✅ SSL gratis
- ✅ Sin configuración DNS

### **Opción 2: Dominio Personalizado**

1. **En Easypanel**:
   - Ve a tu app → Domains
   - Add domain: `dashboard.tudominio.com`

2. **En tu DNS provider** (Hostinger DNS, Cloudflare, etc):
   ```
   Type: A
   Name: dashboard
   Value: [IP de tu VPS]
   TTL: 3600
   ```

   O si usas CNAME:
   ```
   Type: CNAME
   Name: dashboard
   Value: xxxxx.easypanel.host
   TTL: 3600
   ```

3. **Espera propagación**: 5-30 minutos

4. **SSL**: Easypanel automáticamente genera Let's Encrypt

---

## 🔐 Environment Variables en Easypanel

### **Importante**: Build-time vs Runtime

Las variables `VITE_*` son **build-time variables** - deben estar disponibles cuando se construye la app.

### **Cómo configurarlas en Easypanel**:

1. **Antes del primer deploy**:
   - Ve a tu app → Settings → Environment
   - Add variables:
     ```
     VITE_SUPABASE_URL=https://xxx.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_key
     VITE_ANTHROPIC_API_KEY=tu_key
     ```
   - Save
   - Deploy

2. **Si ya deployaste sin variables**:
   - Add las variables
   - Rebuild la aplicación:
     - En Easypanel: Deploy → Rebuild
     - O trigger nuevo deploy desde Git

### **Verificar variables funcionan**:

```bash
# SSH a tu VPS
docker exec selvadentro-dashboard cat /usr/share/nginx/html/index.html | grep "VITE"

# Si ves "VITE_" en el HTML, las variables NO se aplicaron correctamente
# Si NO ves "VITE_", las variables se aplicaron bien
```

---

## 📊 Monitoreo en Easypanel

### **Metrics**

Easypanel muestra automáticamente:
- CPU Usage
- Memory Usage
- Network I/O
- Container Status
- Uptime

### **Logs**

```bash
# En Easypanel UI
App → Logs → Live logs

# O via Docker
docker logs -f selvadentro-dashboard
```

### **Alerts** (Opcional)

Configura alertas en Easypanel:
- Container down
- High CPU/Memory
- Deploy failures

---

## 🔄 CI/CD - Auto-Deploy

### **Configurar Auto-Deploy desde Git**

1. En Easypanel, ve a tu app
2. Settings → Git
3. Enable: **"Auto deploy on push"**
4. Branch: `claude/ana-feature-011CUreKkNuNxH5ennhNrkE3`

Ahora cada vez que hagas `git push`, Easypanel:
1. Detecta el cambio
2. Pull nuevo código
3. Rebuild imagen Docker
4. Deploy automáticamente

**Webhook** (opcional):
- Easypanel genera un webhook URL
- Añádelo a GitHub → Settings → Webhooks
- Cada push trigger deploy automático

---

## 🛠️ Troubleshooting

### **Problema: Build falla**

**Error común**: `npm install` fails

**Solución**:
```bash
# Verifica que package.json esté en root
# Verifica que node_modules no esté en Git

# Rebuild desde cero
docker system prune -a
# Luego redeploy en Easypanel
```

### **Problema: Container no arranca**

**Síntomas**: Container status = Exited

**Solución**:
```bash
# Ver logs
docker logs selvadentro-dashboard

# Común: Port 80 ya está en uso
# Cambia puerto en docker-compose.yml o Easypanel config
```

### **Problema: App muestra página en blanco**

**Causa**: Variables de entorno no configuradas en build time

**Solución**:
1. Añade variables en Easypanel
2. Rebuild app (no solo restart)
3. Verifica que variables se aplicaron:
   ```bash
   docker exec selvadentro-dashboard env | grep VITE
   ```

### **Problema: PWA no instala**

**Causa**: HTTPS no está activo

**Solución**:
- Verifica SSL certificate en Easypanel
- Dale tiempo (2-3 minutos) para generar
- Fuerza refresh de certificado si es necesario

### **Problema: Service Worker no registra**

**Causa**: Cache de nginx

**Solución**: Ya está configurado en `nginx.conf`:
```nginx
location = /service-worker.js {
    add_header Cache-Control "no-cache";
}
```

### **Problema: 404 en rutas del SPA**

**Causa**: Nginx no redirige a index.html

**Solución**: Ya está en `nginx.conf`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🚀 Performance Tips

### **1. Habilitar Gzip** (Ya configurado)
```nginx
gzip on;
gzip_types text/plain text/css application/javascript;
```

### **2. Cache de Assets** (Ya configurado)
```nginx
location ~* \.(js|css|png|jpg)$ {
    expires 1y;
}
```

### **3. Usar CDN** (Opcional)

Si usas Cloudflare:
1. Apunta tu dominio a Cloudflare
2. Enable "Proxy" (naranja cloud)
3. Cache automático

---

## 📋 Checklist Post-Deploy

Después de deployar, verifica:

- [ ] App carga en la URL
- [ ] Login funciona
- [ ] Navegación entre secciones OK
- [ ] PWA instalable (check en DevTools)
- [ ] Service Worker registra
- [ ] Manifest carga
- [ ] HTTPS activo (candado verde)
- [ ] Mobile responsive
- [ ] Performance (Lighthouse >90)
- [ ] Logs no muestran errores
- [ ] Health check responde

---

## 🎯 URL Final

Después del deploy, tu dashboard estará en:

**Con dominio Easypanel**:
```
https://selvadentro-dashboard.xxxxx.easypanel.host
```

**Con dominio personalizado**:
```
https://dashboard.selvadentro.com
```

---

## 📞 Soporte

**Easypanel Docs**: https://easypanel.io/docs
**Docker Docs**: https://docs.docker.com
**Nginx Docs**: https://nginx.org/en/docs/

**Para este proyecto**:
- Ver `DOCUMENTACION_TECNICA.md`
- Ver `GUIA_USUARIO.md`

---

## 🎉 ¡Listo!

Tu Selvadentro Dashboard IA está ahora:
- ✅ Deployado en tu VPS
- ✅ Corriendo en Docker
- ✅ Con HTTPS
- ✅ Con auto-deploy opcional
- ✅ Con monitoreo en Easypanel
- ✅ Listo para producción

**Comparte la URL con tu equipo y empieza a usar el dashboard! 🚀**

---

*Selvadentro Tulum - Dashboard IA v1.0.0*
*Deployado en Hostinger VPS con Easypanel*
*Noviembre 2025*
