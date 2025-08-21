#Setup para inicializar el proyecto

#Antes de correr el proyecto asegurate de tener nodejs 
#actualizado v22.18.0 o LTS

#Primer paso: Instalar dependencias
echo "Instalando dependencias..."
npm install

#Segundo paso: Prepublish de modulos share


COMMON_SHARE='cd ./packages/common/common-share && npm run prepublish'
CRUD_SHARE='cd ./packages/crud/crud-share && npm run prepublish'
IDENTITY_SHARE='cd ./packages/identity/identity-share && npm run prepublish'
DYNAMIC_SHARE='cd ./packages/dynamic/dynamic-share && npm run prepublish'
I18N_SHARE='cd ./packages/i18n/i18n-share && npm run prepublish'
SETTINGS_SHARE='cd ./packages/settings/settings-share && npm run prepublish'

echo "Inicializando dependencias compartidas..."

eval "$COMMON_SHARE" &
eval "$CRUD_SHARE" &
eval "$IDENTITY_SHARE" &
eval "$DYNAMIC_SHARE" &
eval "$I18N_SHARE" &
eval "$SETTINGS_SHARE" &
wait

echo "Dependencias compartidas inicializadas."

#Tercer paso: Prepublish de modulos complicados que pueden dar error

COMMON_BACK='cd ./packages/common/common-back && npm run prepublish'
CRUD_BACK='cd ./packages/crud/crud-back && npm run prepublish'
IDENTITY_BACK='cd ./packages/identity/identity-back && npm run prepublish'
MEDIA_BACK='cd ./packages/media/media-backend && npm run prepublish'
EMAIL_BACK='cd ./packages/email/email-back && npm run prepublish'

echo "Inicializando dependencias complicadas..."
eval "$COMMON_BACK" || true &
eval "$CRUD_BACK" || true &
eval "$IDENTITY_BACK" || true &
eval "$MEDIA_BACK" || true &
eval "$EMAIL_BACK" || true &
wait
echo "Ejecutando por segunda vez debido a errores la inicializacion de dependencias complicadas..."
eval "$COMMON_BACK" || true &
eval "$CRUD_BACK" || true &
eval "$IDENTITY_BACK" || true &
eval "$MEDIA_BACK" || true &
eval "$EMAIL_BACK" || true &
wait
echo "Dependencias complicadas inicializadas."

#Cuarto paso: Prepublish de modulos que no dan error

SETTINGS_BACK='cd ./packages/settings/settings-back && npm run prepublish'
AI_BACK='cd ./packages/ai/ai-back && npm run prepublish'
DYNAMIC_BACK='cd ./packages/dynamic/dynamic-back && npm run prepublish'

echo "Inicializando dependencias que no dan error..."
eval "$SETTINGS_BACK" &
eval "$AI_BACK" &
eval "$DYNAMIC_BACK" &
wait
echo "Dependencias que no dan error inicializadas."

#Quinto paso y ultimo: Copiar .env.example a .env del zuite
echo "Copiando .env.example a .env..."
cd ./packages/zuite/zuite-back && cp .env.example .env