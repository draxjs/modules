import {setupAuthSession} from '@drax/identity-vue'

export async function setupAuth() {
  await setupAuthSession()
}
