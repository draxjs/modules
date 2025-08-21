AI_BACK='cd ./packages/ai/ai-back && npm run prepublish'
COMMON_BACK='cd ./packages/common/common-back && npm run prepublish'
COMMON_SHARE='cd ./packages/common/common-share && npm run prepublish'
CRUD_BACK='cd ./packages/crud/crud-back && npm run prepublish'
CRUD_SHARE='cd ./packages/crud/crud-share && npm run prepublish'
DYNAMIC_BACK='cd ./packages/dynamic/dynamic-back && npm run prepublish'
EMAIL_BACK='cd ./packages/email/email-back && npm run prepublish'
I18N_SHARE='cd ./packages/i18n/i18n-share && npm run prepublish'
IDENTITY_BACK='cd ./packages/identity/identity-back && npm run prepublish'
IDENTITY_SHARE='cd ./packages/identity/identity-share && npm run prepublish'
MEDIA_BACK='cd ./packages/media/media-backend && npm run prepublish'
SETTINGS_BACK='cd ./packages/settings/settings-back && npm run prepublish'
SETTINGS_SHARE='cd ./packages/settings/settings-share && npm run prepublish'

echo "Running bootstrap..."

eval $AI_BACK &&
eval $COMMON_BACK &&
eval $COMMON_SHARE &&
eval $CRUD_BACK &&
eval $CRUD_SHARE && 
eval $DYNAMIC_BACK &&
eval $EMAIL_BACK &&
eval $I18N_SHARE &&
eval $IDENTITY_BACK &&
eval $IDENTITY_SHARE &&
eval $MEDIA_BACK &&
eval $SETTINGS_BACK &&
eval $SETTINGS_SHARE &&
await 
echo "Bootstrap completed successfully."
echo "You can now run 'npm run back' in the zuite-back directory to start the development