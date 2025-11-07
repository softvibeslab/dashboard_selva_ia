# 🚀 Desplegar Supabase Self-Hosted en tu VPS

Esta guía te ayudará a desplegar tu propia instancia de Supabase en el mismo VPS de Hostinger donde tienes Easypanel.

## 📋 Prerrequisitos

- VPS con Easypanel instalado
- Docker y Docker Compose instalados
- Al menos 2GB RAM disponibles para Supabase
- Puertos disponibles: 5432, 8000, 8443, 3000

## 🔑 Paso 1: Generar Claves de Seguridad

Antes de desplegar, necesitas generar claves seguras. Conéctate a tu VPS por SSH y ejecuta:

```bash
# Generar JWT Secret (32+ caracteres)
openssl rand -base64 32

# Generar ANON_KEY (32+ caracteres)
openssl rand -base64 32

# Generar SERVICE_ROLE_KEY (32+ caracteres)
openssl rand -base64 32

# Generar POSTGRES_PASSWORD
openssl rand -base64 24
```

**IMPORTANTE**: Guarda estas claves en un lugar seguro. Las necesitarás en el siguiente paso.

## ⚙️ Paso 2: Configurar Variables de Entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.supabase.example .env.supabase
nano .env.supabase
```

Completa los siguientes campos:

```bash
# Usa las claves que generaste en el Paso 1
POSTGRES_PASSWORD=tu-password-de-postgres-aqui
JWT_SECRET=tu-jwt-secret-de-32-caracteres-aqui
ANON_KEY=tu-anon-key-aqui
SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Cambia estos a tu IP o dominio del VPS
API_EXTERNAL_URL=http://TU_IP_VPS:8000
SITE_URL=http://TU_IP_VPS

# Opcional: Configura SMTP si quieres emails de verificación
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

## 🐳 Opción A: Desplegar con Easypanel (Recomendado)

### 1. Crear Nueva App en Easypanel

1. Abre Easypanel en tu navegador
2. Click en "Create" → "App"
3. Nombre: `supabase-backend`

### 2. Configurar Source

- **Type**: Git
- **Owner**: softvibeslab
- **Repository**: dashboard_selva_ia
- **Branch**: claude/ana-feature-011CUreKkNuNxH5ennhNrkE3
- **Build Path**: /

### 3. Configurar Dockerfile

- **Dockerfile**: supabase-docker-compose.yml

### 4. Agregar Variables de Entorno

En la sección "Environment Variables", agrega:

```
POSTGRES_PASSWORD=tu-password-aqui
JWT_SECRET=tu-jwt-secret-aqui
ANON_KEY=tu-anon-key-aqui
SERVICE_ROLE_KEY=tu-service-role-key-aqui
API_EXTERNAL_URL=http://tu-ip:8000
SITE_URL=http://tu-ip
STUDIO_DEFAULT_ORGANIZATION=Selvadentro
STUDIO_DEFAULT_PROJECT=Dashboard IA
```

### 5. Configurar Puertos

En la sección "Ports", mapea:
- `8000` → HTTP (Kong API Gateway)
- `3000` → HTTP (Supabase Studio)
- `5432` → TCP (PostgreSQL)

### 6. Deploy

Click en "Deploy" y espera a que todos los servicios estén corriendo.

## 🐳 Opción B: Desplegar con Docker Compose Manual

### 1. Conectarse al VPS

```bash
ssh usuario@tu-vps-ip
```

### 2. Clonar o Subir Archivos

```bash
# Si tienes git configurado
git clone https://github.com/softvibeslab/dashboard_selva_ia.git
cd dashboard_selva_ia

# O sube los archivos manualmente con SCP
```

### 3. Configurar Variables

```bash
cp .env.supabase.example .env.supabase
nano .env.supabase
# Edita con tus valores
```

### 4. Iniciar Supabase

```bash
docker-compose -f supabase-docker-compose.yml --env-file .env.supabase up -d
```

### 5. Verificar que todo esté corriendo

```bash
docker ps
```

Deberías ver 8 contenedores:
- supabase-db (PostgreSQL)
- supabase-kong (API Gateway)
- supabase-auth (GoTrue)
- supabase-rest (PostgREST)
- supabase-realtime
- supabase-storage
- supabase-studio
- supabase-meta

## 🔗 Paso 3: Obtener URLs y Keys de Supabase

### Acceder a Supabase Studio

Abre en tu navegador:
```
http://TU_IP_VPS:3000
```

### URLs de API

- **API URL**: `http://TU_IP_VPS:8000`
- **Anon Key**: El valor de `ANON_KEY` que generaste
- **Service Role Key**: El valor de `SERVICE_ROLE_KEY` que generaste

## 🔌 Paso 4: Conectar Dashboard a Supabase

### Actualizar Variables del Dashboard

En Easypanel, ve a tu app `selvadentro-dashboard` y actualiza las variables:

```
VITE_SUPABASE_URL=http://TU_IP_VPS:8000
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
VITE_ANTHROPIC_API_KEY=tu-api-key-de-claude
```

### Redesplegar Dashboard

Click en "Redeploy" para que tome las nuevas variables.

## ✅ Paso 5: Verificar Instalación

### 1. Verificar Supabase Studio

```bash
curl http://TU_IP_VPS:3000/health
# Debería retornar: healthy
```

### 2. Verificar API Gateway

```bash
curl http://TU_IP_VPS:8000
# Debería retornar respuesta de Kong
```

### 3. Verificar PostgreSQL

```bash
docker exec -it supabase-db psql -U supabase_admin -d postgres -c "SELECT version();"
# Debería mostrar la versión de PostgreSQL
```

### 4. Probar Login en Dashboard

1. Abre tu dashboard en el navegador
2. Intenta crear una cuenta nueva
3. Deberías ver la cuenta creada en Supabase Studio

## 🗄️ Gestión de Base de Datos

### Crear Tablas Iniciales

Conecta a Supabase Studio (`http://TU_IP_VPS:3000`) y ejecuta el siguiente SQL:

```sql
-- Tabla de usuarios (ya existe por defecto en auth.users)

-- Tabla de configuración de usuario
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'broker',
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' o 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes generados
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB,
  sent_to TEXT,
  status TEXT DEFAULT 'generated'
);

-- Habilitar Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (usuarios solo pueden ver sus propios datos)
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own reports" ON public.generated_reports
  FOR SELECT USING (auth.uid() = user_id);
```

## 🔒 Seguridad y Respaldos

### Cambiar Passwords por Defecto

Si usaste passwords por defecto, cámbialos inmediatamente:

```bash
docker exec -it supabase-db psql -U supabase_admin -d postgres
ALTER USER supabase_admin WITH PASSWORD 'nuevo-password-super-seguro';
\q
```

### Configurar Respaldos Automáticos

```bash
# Crear script de respaldo
cat > /root/backup-supabase.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/supabase-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Respaldar base de datos
docker exec supabase-db pg_dump -U supabase_admin postgres > $BACKUP_DIR/db_$DATE.sql

# Respaldar storage
docker cp supabase-storage:/var/lib/storage $BACKUP_DIR/storage_$DATE

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

chmod +x /root/backup-supabase.sh

# Agregar a cron (diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-supabase.sh") | crontab -
```

## 🌐 Configurar Dominio (Opcional)

Si tienes un dominio, puedes configurarlo:

### 1. Agregar registros DNS

```
A     supabase.tudominio.com  →  TU_IP_VPS
A     api.tudominio.com       →  TU_IP_VPS
```

### 2. Configurar SSL con Certbot

```bash
apt install certbot
certbot certonly --standalone -d supabase.tudominio.com -d api.tudominio.com
```

### 3. Actualizar URLs

En `.env.supabase`:
```bash
API_EXTERNAL_URL=https://api.tudominio.com
SITE_URL=https://supabase.tudominio.com
```

## 🔧 Troubleshooting

### Los servicios no inician

```bash
# Ver logs de todos los servicios
docker-compose -f supabase-docker-compose.yml logs

# Ver logs de un servicio específico
docker logs supabase-db
docker logs supabase-auth
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker exec -it supabase-db pg_isready -U supabase_admin

# Reiniciar PostgreSQL
docker restart supabase-db
```

### Kong no responde

```bash
# Verificar configuración de Kong
docker exec -it supabase-kong kong config parse /var/lib/kong/kong.yml

# Reiniciar Kong
docker restart supabase-kong
```

### Problemas con Auth

```bash
# Ver logs de GoTrue
docker logs supabase-auth -f

# Verificar variables de entorno
docker exec supabase-auth env | grep GOTRUE
```

### Dashboard no puede conectar a Supabase

1. Verifica que `VITE_SUPABASE_URL` apunte a `http://TU_IP:8000`
2. Verifica que `VITE_SUPABASE_ANON_KEY` sea correcto
3. Asegúrate de haber redeployado el dashboard después de cambiar las variables
4. Verifica CORS en Kong:
   ```bash
   docker logs supabase-kong | grep CORS
   ```

## 📊 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver todos los contenedores

```bash
docker ps -a
```

### Reiniciar todos los servicios

```bash
docker-compose -f supabase-docker-compose.yml restart
```

### Detener todos los servicios

```bash
docker-compose -f supabase-docker-compose.yml down
```

### Iniciar nuevamente

```bash
docker-compose -f supabase-docker-compose.yml up -d
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica las variables de entorno en `.env.supabase`
3. Asegúrate de que todos los puertos estén disponibles
4. Consulta la documentación oficial: https://supabase.com/docs/guides/self-hosting

## ✨ ¡Listo!

Tu Supabase está corriendo en:
- **Studio (UI)**: http://TU_IP_VPS:3000
- **API**: http://TU_IP_VPS:8000
- **PostgreSQL**: TU_IP_VPS:5432

Recuerda actualizar las variables de tu dashboard y redesplegar para que use tu Supabase self-hosted.
