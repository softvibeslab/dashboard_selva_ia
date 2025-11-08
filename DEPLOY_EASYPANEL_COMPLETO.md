# 🚀 GUÍA COMPLETA DE DEPLOYMENT EN EASYPANEL
# Dashboard Selvadentro IA - VPS Hostinger Ubuntu

Esta guía te lleva paso a paso para hacer el deploy completo de la aplicación en tu VPS de Hostinger usando EasyPanel.

---

## 📋 PRE-REQUISITOS

Antes de comenzar, asegúrate de tener:

- ✅ Acceso SSH a tu VPS de Hostinger (Ubuntu)
- ✅ IP pública de tu VPS
- ✅ Todas las variables de entorno de `.env.production`
- ✅ Supabase Edge Function `ai-chat` desplegada (ver CONFIGURACION_SUPABASE_COMPLETA.md)

---

## 🔧 PASO 1: INSTALAR EASYPANEL EN TU VPS

### 1.1. Conectar por SSH

```bash
ssh root@TU_IP_DEL_VPS
```

Reemplaza `TU_IP_DEL_VPS` con la IP de tu servidor Hostinger.

### 1.2. Instalar EasyPanel

Ejecuta este comando en tu VPS:

```bash
curl -sSL https://get.easypanel.io | sh
```

Esto instalará:
- Docker
- Docker Compose
- EasyPanel

**Tiempo estimado**: 5-10 minutos

### 1.3. Verificar instalación

```bash
docker --version
docker-compose --version
```

### 1.4. Acceder a EasyPanel

Una vez instalado, accede a EasyPanel desde tu navegador:

```
http://TU_IP_DEL_VPS:3000
```

**Importante**: Crea tu cuenta de administrador en el primer acceso.

---

## 🔐 PASO 2: CONFIGURAR FIREWALL (OPCIONAL PERO RECOMENDADO)

```bash
# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS
ufw allow 443/tcp

# Permitir EasyPanel
ufw allow 3000/tcp

# Activar firewall
ufw enable
```

---

## 📦 PASO 3: SUBIR CÓDIGO A GIT (SI NO LO HAS HECHO)

EasyPanel puede deployar desde:
1. **Git Repository** (recomendado)
2. **Docker Hub**
3. **Upload manual**

### Opción A: Usar Git (Recomendado)

Si no tienes el código en Git:

```bash
# En tu computadora local, dentro del proyecto
git init
git add .
git commit -m "feat: Initial commit for EasyPanel deployment"

# Crear repo en GitHub y hacer push
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### Opción B: Build y Push a Docker Hub

```bash
# En tu computadora local
docker build \
  --build-arg VITE_SUPABASE_URL="https://qcvioktwdqcnizvqzekm.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8" \
  --build-arg VITE_GHL_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImNyTjJJaEF1T0JBbDdEODMyNHlJIiwidmVyc2lvbiI6MSwiaWF0IjoxNzQ5OTY5Njg5MjkxLCJzdWIiOiJnRFhtNHJJQjZJbjhxa3Q1dXpKWSJ9.HKfmsDYjb30fxRu6n40R39ED-NEuoWYhJjKvGtxjeUg" \
  --build-arg VITE_GHL_ACCESS_TOKEN="pit-84d7687f-d43f-4434-9804-c671c669dd0f" \
  --build-arg VITE_GHL_LOCATION_ID="crN2IhAuOBAl7D8324yI" \
  --build-arg VITE_ANTHROPIC_API_KEY="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" \
  -t tu-usuario/selvadentro-dashboard:latest .

docker push tu-usuario/selvadentro-dashboard:latest
```

---

## 🎯 PASO 4: CREAR PROYECTO EN EASYPANEL

### 4.1. Crear nuevo proyecto

1. Accede a EasyPanel: `http://TU_IP_DEL_VPS:3000`
2. Click en **"+ Create Project"**
3. **Project Name**: `selvadentro-dashboard`
4. Click **"Create"**

### 4.2. Añadir servicio

Dentro del proyecto:

1. Click en **"+ Add Service"**
2. Selecciona **"App"**
3. **Service Name**: `dashboard`

### 4.3. Configurar Source

Elige tu método de deploy:

#### Opción A: Git Repository (Recomendado)

1. **Source Type**: Git
2. **Repository URL**: `https://github.com/TU_USUARIO/TU_REPO.git`
3. **Branch**: `main`
4. **Build Method**: Dockerfile
5. **Dockerfile Path**: `./Dockerfile`

#### Opción B: Docker Image

1. **Source Type**: Docker Image
2. **Image**: `tu-usuario/selvadentro-dashboard:latest`

---

## ⚙️ PASO 5: CONFIGURAR BUILD ARGUMENTS (CRÍTICO)

**MUY IMPORTANTE**: Si usas Git/Dockerfile, debes configurar los Build Arguments.

En la sección **Build**, añade estos **Build Args**:

```
VITE_SUPABASE_URL=https://qcvioktwdqcnizvqzekm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8
VITE_GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImNyTjJJaEF1T0JBbDdEODMyNHlJIiwidmVyc2lvbiI6MSwiaWF0IjoxNzQ5OTY5Njg5MjkxLCJzdWIiOiJnRFhtNHJJQjZJbjhxa3Q1dXpKWSJ9.HKfmsDYjb30fxRu6n40R39ED-NEuoWYhJjKvGtxjeUg
VITE_GHL_ACCESS_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
VITE_GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
VITE_ANTHROPIC_API_KEY=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
```

### Cómo añadir Build Args en EasyPanel:

1. En la configuración del servicio, busca la sección **"Build"**
2. Click en **"+ Add Build Arg"**
3. Añade cada variable con su valor

---

## 🌐 PASO 6: CONFIGURAR NETWORKING

### 6.1. Puerto

- **Container Port**: `80`
- **Protocol**: HTTP

### 6.2. Domain (Opcional)

Puedes configurar:

**Opción A: Usar IP directa**
- Accederás via: `http://TU_IP_DEL_VPS`

**Opción B: Configurar dominio personalizado**
1. Click en **"Add Domain"**
2. Ingresa tu dominio: `dashboard.tudominio.com`
3. Apunta un registro DNS `A` de tu dominio a la IP del VPS
4. EasyPanel configurará automáticamente HTTPS con Let's Encrypt

---

## 🚀 PASO 7: DEPLOY

1. Revisa que todo esté configurado
2. Click en **"Deploy"**
3. Espera a que se construya la imagen (5-10 minutos)
4. Observa los logs en tiempo real

### Verificar deployment

Una vez completado:

```bash
# En tu VPS
docker ps
```

Deberías ver el contenedor `selvadentro-dashboard` corriendo.

---

## ✅ PASO 8: VERIFICAR QUE TODO FUNCIONA

### 8.1. Acceder a la aplicación

Abre en tu navegador:
- Con IP: `http://TU_IP_DEL_VPS`
- Con dominio: `https://dashboard.tudominio.com`

### 8.2. Verificar en la consola del navegador

1. Presiona `F12` para abrir DevTools
2. Ve a la pestaña **Console**
3. Deberías ver:

```
🔑 GHL Config: {
  endpoint: "https://services.leadconnectorhq.com/mcp/",
  hasToken: true,
  hasApiKey: true,
  locationId: "crN2IhAuOBAl7D8324yI",
  tool: "contacts_get-contacts"
}
✅ MCP Success: contacts_get-contacts
```

### 8.3. Probar funcionalidades

- ✅ Login funciona
- ✅ Dashboard Executive muestra métricas
- ✅ Contacts carga sin errores 406
- ✅ Chat IA responde correctamente
- ✅ No hay errores en consola

---

## 🔄 PASO 9: CONFIGURAR AUTO-DEPLOY (OPCIONAL)

Para que EasyPanel redeploy automáticamente cuando hagas push a Git:

1. En el servicio, ve a **"Settings"**
2. Click en **"Enable Auto Deploy"**
3. Copia el **Webhook URL**
4. Ve a tu repositorio en GitHub:
   - Settings → Webhooks → Add webhook
   - Pega la URL
   - Content type: `application/json`
   - Trigger: `push` events

Ahora, cada vez que hagas `git push`, EasyPanel rebuildeará y redeployará automáticamente.

---

## 🐛 TROUBLESHOOTING

### Error: "Build failed"

**Solución**: Revisa los logs de build en EasyPanel. Probablemente faltan Build Args.

### Error: Container no inicia

**Solución**:
```bash
# En el VPS
docker logs selvadentro-dashboard
```

### Error 502 Bad Gateway

**Solución**: El contenedor probablemente no está escuchando en el puerto 80.

```bash
docker exec -it selvadentro-dashboard sh
wget -O- http://localhost
```

### Variables de entorno undefined en la app

**Causa**: No configuraste los Build Args correctamente.

**Solución**:
1. Para a la app en EasyPanel
2. Ve a Build → Build Args
3. Añade TODAS las variables `VITE_*`
4. Redeploy

### Error CORS en Chat IA

**Solución**: Verifica que la Edge Function `ai-chat` esté desplegada correctamente en Supabase.

```bash
curl -X POST 'https://qcvioktwdqcnizvqzekm.supabase.co/functions/v1/ai-chat' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8' \
  -H 'Content-Type: application/json' \
  -d '{"model":"claude-3-5-sonnet-20240620","max_tokens":1024,"messages":[{"role":"user","content":"Hola"}]}'
```

---

## 📊 MONITOREO Y LOGS

### Ver logs en tiempo real

En EasyPanel:
1. Ve a tu servicio
2. Click en **"Logs"**
3. Verás logs de nginx en tiempo real

### Ver logs de Docker directamente

```bash
# En el VPS
docker logs -f selvadentro-dashboard
```

### Health check

La aplicación tiene un endpoint de salud:

```bash
curl http://TU_IP_DEL_VPS/health
# Respuesta: healthy
```

---

## 🔒 SEGURIDAD RECOMENDADA

### 1. Configurar HTTPS

Si usas dominio personalizado, EasyPanel configurará automáticamente Let's Encrypt SSL.

### 2. Cambiar puerto de EasyPanel (opcional)

Por defecto EasyPanel corre en puerto 3000. Para más seguridad:

```bash
# En el VPS
docker stop easypanel
# Edita la configuración para usar otro puerto
# Reinicia
docker start easypanel
```

### 3. Configurar backup automático

En EasyPanel:
1. Settings → Backups
2. Configura backups automáticos diarios

---

## 📝 COMANDOS ÚTILES

```bash
# Ver todos los contenedores
docker ps -a

# Ver logs de un contenedor
docker logs selvadentro-dashboard

# Entrar al contenedor
docker exec -it selvadentro-dashboard sh

# Reiniciar contenedor
docker restart selvadentro-dashboard

# Ver uso de recursos
docker stats

# Limpiar imágenes antiguas
docker system prune -a
```

---

## 🎉 CHECKLIST FINAL

Antes de considerar el deployment completado, verifica:

- [ ] ✅ EasyPanel instalado y accesible
- [ ] ✅ Proyecto creado en EasyPanel
- [ ] ✅ Build Args configurados correctamente
- [ ] ✅ Aplicación deployada sin errores
- [ ] ✅ Accesible via IP o dominio
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard muestra datos reales de GHL
- [ ] ✅ Chat IA responde correctamente
- [ ] ✅ No hay errores 406 de GoHighLevel
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ Supabase Edge Function funcionando
- [ ] ✅ HTTPS configurado (si usas dominio)

---

## 🚀 PRÓXIMOS PASOS

Una vez deployado exitosamente:

1. **Configurar monitoreo**: Usa herramientas como Uptime Robot para monitorear disponibilidad
2. **Configurar alertas**: Configura alertas de EasyPanel para errores
3. **Backup regular**: Asegura backups automáticos de la base de datos Supabase
4. **Dominio personalizado**: Si no lo hiciste, configura un dominio profesional
5. **CDN**: Considera usar Cloudflare como CDN para mejor performance

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa los logs en EasyPanel
2. Verifica que todas las variables estén configuradas
3. Consulta la documentación oficial de EasyPanel: https://easypanel.io/docs
4. Verifica el estado de Supabase: https://status.supabase.com/

---

## 📚 ARCHIVOS RELACIONADOS

- `CONFIGURACION_SUPABASE_COMPLETA.md` - Setup de Supabase y Edge Functions
- `ARREGLO_GHL_MCP.md` - Arreglo de GoHighLevel MCP
- `DEPLOY_SUPABASE_FUNCTION.sh` - Script para deployar Edge Function
- `.env.production` - Variables de entorno
- `Dockerfile` - Configuración de Docker con build args
- `nginx.conf` - Configuración de Nginx

---

**¡Listo para producción! 🎉**