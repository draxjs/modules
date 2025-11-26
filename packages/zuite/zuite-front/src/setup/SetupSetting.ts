import {useSetting} from '@drax/settings-vue'

async function setupSetting() {
  const {fetchSettings, suscribeAuth} = useSetting()
  await fetchSettings()
  await suscribeAuth()
}

export default setupSetting
