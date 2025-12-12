#Setup para inicializar el proyecto
echo "Instalando dependencias..."
npm install
echo "Dependencias instaladas."

echo "Inicializando dependencias share..."
npm run prepublish --workspace @drax/common-share
npm run prepublish --workspace @drax/crud-share
npm run prepublish --workspace @drax/identity-share
npm run prepublish --workspace @drax/i18n-share
npm run prepublish --workspace @drax/settings-share
npm run prepublish --workspace @drax/audit-share
npm run prepublish --workspace @drax/dashboard-share
echo "Dependencias share inicializadas."

echo "Inicializando dependencias back..."
npm run prepublish --workspace @drax/common-back
npm run prepublish --workspace @drax/email-back
npm run prepublish --workspace @drax/crud-back
npm run prepublish --workspace @drax/dashboard-back
npm run prepublish --workspace @drax/identity-back
npm run prepublish --workspace @drax/media-back
npm run prepublish --workspace @drax/settings-back
npm run prepublish --workspace @drax/ai-back
npm run prepublish --workspace @drax/dynamic-back
npm run prepublish --workspace @drax/audit-back
echo "Dependencias back inicializadas."


#Quinto paso y ultimo: Copiar .env.example a .env del zuite
echo "Copiando .env.example a .env..."
cd ./packages/zuite/zuite-back && cp .env.example .env
