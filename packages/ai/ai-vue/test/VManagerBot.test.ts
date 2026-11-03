import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {nextTick} from 'vue'
import {flushPromises, mount, type VueWrapper} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import {VIcon} from 'vuetify/components/VIcon'
import {VList, VListItem, VListItemTitle, VListSubheader} from 'vuetify/components/VList'
import {VMenu} from 'vuetify/components/VMenu'
import VManagerBot from '../src/components/vbots/VManagerBot.vue'

// Real Vuetify components require server.deps.inline: ['vuetify'] when running this suite.
const storageKey = 'drax.visualBot.selected'
const wrappers: VueWrapper[] = []
const hosts: HTMLElement[] = []

function setup(props: {speaking?: boolean; silenceOnClick?: boolean; onSilence?: () => void} = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  hosts.push(host)
  const wrapper = mount(VManagerBot, {
    attachTo: host,
    props: {visible: true, speaking: false, ...props},
    global: {
      plugins: [createVuetify({components: {VMenu, VList, VListItem, VListItemTitle, VListSubheader, VIcon}})],
    },
  })
  wrappers.push(wrapper)
  return wrapper
}

async function settle() {
  await nextTick()
  await flushPromises()
}

function expectMenu(wrapper: VueWrapper, open: boolean) {
  expect(wrapper.getComponent(VMenu).props('modelValue')).toBe(open)
  expect(document.querySelector('.v-overlay--active .visual-bot-manager__list') !== null).toBe(open)
}

async function selectBot(label: string) {
  const item = Array.from(document.querySelectorAll<HTMLElement>('.v-overlay--active .v-list-item'))
    .find((element) => element.textContent?.trim() === label)
  expect(item, `Visible menu option ${label}`).toBeDefined()
  item!.click()
  await settle()
}

beforeEach(() => {
  window.localStorage.removeItem(storageKey)
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })))
  vi.stubGlobal('visualViewport', undefined)
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  hosts.splice(0).forEach((host) => host.remove())
  document.querySelectorAll('.v-overlay-container').forEach((container) => container.remove())
  window.localStorage.removeItem(storageKey)
  vi.unstubAllGlobals()
})

describe('VManagerBot with the real Vuetify menu', () => {
  it.each(['click', 'tap', 'Enter', 'Space'] as const)(
    'emits silence exactly once on %s while speaking with opt-in, without opening the menu',
    async (activation) => {
      const wrapper = setup({speaking: true, silenceOnClick: true})
      const button = wrapper.get<HTMLButtonElement>('button.visual-bot-manager')
      await settle()

      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('title')).toBe('Silenciar esta respuesta')
      expect(button.attributes('aria-label')).toBe('Silenciar esta respuesta')
      expect(button.attributes('aria-haspopup')).toBeUndefined()
      expect(button.attributes('aria-expanded')).toBeUndefined()
      expectMenu(wrapper, false)

      if (activation === 'tap') {
        await button.trigger('pointerdown', {pointerType: 'touch', isPrimary: true})
        await button.trigger('pointerup', {pointerType: 'touch', isPrimary: true})
        // JSDOM does not synthesize the compatibility click after touch/pointer events.
        button.element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}))
      } else if (activation === 'Enter' || activation === 'Space') {
        button.element.focus()
        expect(document.activeElement).toBe(button.element)
        const key = activation === 'Space' ? ' ' : 'Enter'
        await button.trigger('keydown', {key, code: activation})
        if (activation === 'Space') {
          await button.trigger('keyup', {key, code: activation})
        }
        // JSDOM does not implement default activation: supply the keyboard's detail=0 click.
        button.element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, detail: 0}))
        if (activation === 'Enter') {
          await button.trigger('keyup', {key, code: activation})
        }
      } else {
        button.element.click()
      }
      await settle()

      expect(wrapper.emitted('silence')).toEqual([[]])
      expectMenu(wrapper, false)
      expect(window.localStorage.getItem(storageKey)).toBeNull()
    },
  )

  it('keeps the idle selector usable with opt-in, changes the bot and persists it across mounts', async () => {
    const wrapper = setup({silenceOnClick: true})
    const button = wrapper.get('button.visual-bot-manager')
    await settle()

    expect(button.attributes('title')).toBe('Bot visual: Robot')
    expect(button.attributes('aria-label')).toBe('Seleccionar bot visual. Actual: Robot')
    expect(button.attributes('aria-haspopup')).toBe('menu')
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    await settle()

    expectMenu(wrapper, true)
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(Array.from(document.querySelectorAll('.v-overlay--active .v-list-item-title'))
      .map((item) => item.textContent)).toEqual(['Robot', 'Jarvis', 'Nexus'])
    await selectBot('Jarvis')

    expectMenu(wrapper, false)
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('title')).toBe('Bot visual: Jarvis')
    expect(button.attributes('aria-label')).toBe('Seleccionar bot visual. Actual: Jarvis')
    expect(wrapper.find('.jarvis-bot').exists()).toBe(true)
    expect(window.localStorage.getItem(storageKey)).toBe('jarvis')
    expect(wrapper.emitted('silence')).toBeUndefined()

    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    const restored = setup({silenceOnClick: true})
    await settle()
    expect(restored.get('button').attributes('aria-label')).toBe('Seleccionar bot visual. Actual: Jarvis')
    expect(restored.find('.jarvis-bot').exists()).toBe(true)
    expectMenu(restored, false)
  })

  it('closes an already open selector when speaking starts and does not reopen when speaking stops', async () => {
    const wrapper = setup({silenceOnClick: true})
    await wrapper.get('button').trigger('click')
    await settle()
    expectMenu(wrapper, true)

    await wrapper.setProps({speaking: true})
    await settle()
    expectMenu(wrapper, false)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Silenciar esta respuesta')
    expect(wrapper.emitted('silence')).toBeUndefined()

    await wrapper.setProps({speaking: false})
    await settle()
    expectMenu(wrapper, false)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('silence')).toBeUndefined()
  })

  it('does not open the selector when the silence listener stops speaking, but allows the next click to select', async () => {
    const onSilence = vi.fn(() => { void wrapper.setProps({speaking: false}) })
    const wrapper = setup({speaking: true, silenceOnClick: true, onSilence})
    await settle()
    await wrapper.get('button').trigger('click')
    await settle()

    expect(onSilence).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('silence')).toEqual([[]])
    expect(wrapper.props('speaking')).toBe(false)
    expectMenu(wrapper, false)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Seleccionar bot visual. Actual: Robot')
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')

    await wrapper.get('button').trigger('click')
    await settle()
    expectMenu(wrapper, true)
    await selectBot('Nexus')

    expectMenu(wrapper, false)
    expect(wrapper.find('.nexus-bot').exists()).toBe(true)
    expect(window.localStorage.getItem(storageKey)).toBe('nexus')
    expect(onSilence).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('silence')).toEqual([[]])
  })

  it.each([undefined, false])('preserves the legacy selector while speaking with silenceOnClick=%s', async (silenceOnClick) => {
    const wrapper = setup(silenceOnClick === undefined ? {speaking: true} : {speaking: true, silenceOnClick})
    await settle()
    const button = wrapper.get('button')
    expect(button.attributes('title')).toBe('Bot visual: Robot')
    expect(button.attributes('aria-label')).toBe('Seleccionar bot visual. Actual: Robot')
    expect(button.attributes('aria-haspopup')).toBe('menu')
    await button.trigger('click')
    await settle()

    expectMenu(wrapper, true)
    expect(button.attributes('aria-expanded')).toBe('true')
    await selectBot('Jarvis')
    expectMenu(wrapper, false)
    expect(wrapper.find('.jarvis-bot--speaking').exists()).toBe(true)
    expect(window.localStorage.getItem(storageKey)).toBe('jarvis')
    expect(wrapper.emitted('silence')).toBeUndefined()
  })
})
