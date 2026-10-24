import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {AuthHelper} from '../src/helpers/AuthHelper'

const now = 1_800_000_000
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
const jwt = (payload: unknown) => `${encode({alg: 'HS256', typ: 'JWT'})}.${encode(payload)}.c2lnbmF0dXJl`

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now * 1000)
})
afterEach(() => vi.useRealTimers())

describe('AuthHelper.isJWTValid', () => {
    it('defaults to no margin and expires exactly at exp', () => {
        expect(AuthHelper.isJWTValid(jwt({exp: now + 1}))).toBe(true)
        expect(AuthHelper.isJWTValid(jwt({exp: now}))).toBe(false)
        expect(AuthHelper.isJWTValid(jwt({exp: now - 1}))).toBe(false)
    })

    it('supports the 30-second needsRefresh window, including its exact boundary', () => {
        expect(AuthHelper.isJWTValid(jwt({exp: now + 31}), 30)).toBe(true)
        expect(AuthHelper.isJWTValid(jwt({exp: now + 30}), 30)).toBe(false)
        expect(AuthHelper.isJWTValid(jwt({exp: now + 29}), 30)).toBe(false)
        expect(AuthHelper.isJWTValid(jwt({exp: now + 30}))).toBe(true)
        expect(AuthHelper.isJWTValid(jwt({exp: now + 0.5}), 0.25)).toBe(true)
    })

    it.each([{}, {exp: null}, {exp: '1900000000'}, {exp: true}, {exp: []}, {exp: {}}, {exp: 0}, {exp: -1}, null, [], 'payload'])('rejects missing, non-numeric or expired exp: %j', payload => {
        expect(AuthHelper.isJWTValid(jwt(payload))).toBe(false)
    })

    it.each(['', 'invalid', 'a.b', 'a.b.c.d', '.e30.c2ln', 'e30..c2ln', 'e30.e30.', 'e30.%%%.c2ln', 'e30.bm90LWpzb24.c2ln', `${encode(null)}.${encode({exp: now + 60})}.c2ln`, `${encode([])}.${encode({exp: now + 60})}.c2ln`])('rejects malformed JWT without throwing: %s', token => {
        expect(AuthHelper.isJWTValid(token)).toBe(false)
    })

    it('rejects non-finite exp even when JSON.parse returns Infinity', () => {
        const payload = Buffer.from('{"exp":1e400}').toString('base64url')
        expect(AuthHelper.isJWTValid(`${encode({alg: 'HS256'})}.${payload}.c2ln`)).toBe(false)
    })

    it.each([NaN, Infinity, -Infinity, -1])('rejects invalid margins: %s', margin => {
        expect(AuthHelper.isJWTValid(jwt({exp: now + 60}), margin)).toBe(false)
    })

    it.each([undefined, null, 123, {}, []])('defensively rejects non-string tokens: %j', token => {
        expect(AuthHelper.isJWTValid(token as string)).toBe(false)
    })
})
