#!/bin/bash

echo "🚀 DEPLOYMENT DE EDGE FUNCTION AI-CHAT"
echo "======================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_REF="qcvioktwdqcnizvqzekm"
ANTHROPIC_KEY="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"

echo -e "${YELLOW}Paso 1:${NC} Configurar secret ANTHROPIC_API_KEY"
supabase secrets set ANTHROPIC_API_KEY=$ANTHROPIC_KEY --project-ref $PROJECT_REF

echo ""
echo -e "${YELLOW}Paso 2:${NC} Desplegar Edge Function ai-chat"
supabase functions deploy ai-chat --project-ref $PROJECT_REF --no-verify-jwt

echo ""
echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""
echo "Prueba la función con:"
echo "curl -X POST 'https://qcvioktwdqcnizvqzekm.supabase.co/functions/v1/ai-chat' \\"
echo "  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"model\":\"claude-3-5-sonnet-20240620\",\"max_tokens\":1024,\"messages\":[{\"role\":\"user\",\"content\":\"Hola\"}]}'"
