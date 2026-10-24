import {describe, it, expect, vi} from 'vitest'
import {AuthSystem} from '@drax/identity-front'
import type {IAuthProvider} from '@drax/identity-front'

function createProvider() {
  return {
    login: vi.fn<IAuthProvider['login']>(),
    me: vi.fn<IAuthProvider['me']>(),
    switchTenant: vi.fn<IAuthProvider['switchTenant']>(),
    logout: vi.fn<IAuthProvider['logout']>(),
    passwordPolicy: vi.fn<IAuthProvider['passwordPolicy']>(),
    registrationOptions: vi.fn<IAuthProvider['registrationOptions']>(),
    changeOwnPassword: vi.fn<IAuthProvider['changeOwnPassword']>(),
    recoveryPasswordRequest: vi.fn<IAuthProvider['recoveryPasswordRequest']>(),
    recoveryPasswordComplete: vi.fn<IAuthProvider['recoveryPasswordComplete']>(),
    register: vi.fn<IAuthProvider['register']>(),
    changeAvatar: vi.fn<IAuthProvider['changeAvatar']>(),
  } satisfies IAuthProvider
}

describe('AuthSystem', () => {
  it('returns the login response and forwards credentials without an implicit opt-in', async () => {
    const provider = createProvider()
    const response = {accessToken: 'mocked-token'}
    provider.login.mockResolvedValue(response)
    const authSystem = new AuthSystem(provider)

    expect(await authSystem.login('testuser', 'testpassword')).toEqual(response)
    expect(provider.login).toHaveBeenCalledExactlyOnceWith('testuser', 'testpassword')
  })

  it('propagates rejected credentials', async () => {
    const provider = createProvider()
    const error = new Error('BadCredentials')
    provider.login.mockRejectedValue(error)
    const authSystem = new AuthSystem(provider)

    await expect(authSystem.login('baduser', 'testpassword')).rejects.toBe(error)
    expect(provider.login).toHaveBeenCalledExactlyOnceWith('baduser', 'testpassword')
  })
})
