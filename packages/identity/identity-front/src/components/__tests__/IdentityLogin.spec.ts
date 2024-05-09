import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import IdentityLogin from '../IdentityLogin/IdentityLogin.vue'

describe('IdentityLogin', () => {
  it('renders properly', () => {
    const wrapper = mount(IdentityLogin, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
