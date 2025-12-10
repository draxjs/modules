import { test, describe } from 'vitest';
import assert from 'node:assert/strict';
import DraxCache from '../../src/cache/DraxCache.js';

describe("CacheTest", ()=>{
    test('verificar si se puede añadir y recuperar un valor', async () => {
        const cache = new DraxCache<string>();
        await cache.set('testKey', 'testValue', 1000); // TTL de 1000 ms
        const value = await cache.get('testKey');
        assert.equal(value, 'testValue', 'El valor recuperado debe ser "testValue"');
    });

    test('verificar la eliminación automática después del TTL', async () => {
        const cache = new DraxCache<string>();
        await cache.set('tempKey', 'tempValue', 100); // TTL de 100 ms

        await new Promise(resolve => setTimeout(resolve, 150)); // Espera a que el TTL expire

        const hasKey = await cache.has('tempKey');
        assert.equal(hasKey, false, 'El valor debe ser eliminado después del TTL');
    });

    test('verificar la funcionalidad clear', async () => {
        const cache = new DraxCache<string>();
        await cache.set('key1', 'value1', 1000);
        await cache.set('key2', 'value2', 1000);

        await cache.clear();

        const hasKey1 = await cache.has('key1');
        assert.equal(hasKey1, false, 'Todos los valores deben ser eliminados');
        const hasKey2 = await cache.has('key2');
        assert.equal(hasKey2, false, 'Todos los valores deben ser eliminados');
    });


    test('verificar getOrLoad carga un valor si no está presente', async () => {
        const cache = new DraxCache<string>();
        const key = 'missingKey';
        const expectedValue = 'loadedValue';

        // Función loader que será llamada para cargar el valor cuando no esté presente en la caché
        const loader = async (k: string) => {
            assert.equal(k, key, 'La clave pasada al loader debe coincidir con la solicitada');
            return expectedValue;
        };

        // Primero, verifica que el valor no esté presente
        const hasKey = await cache.has(key);
        assert.equal(hasKey, false, 'Inicialmente, la clave no debe estar presente en la caché');

        // Luego, usa getOrLoad y verifica que el valor retornado y almacenado sea el correcto
        const value = await cache.getOrLoad(key, loader);
        assert.equal(value, expectedValue, 'El valor cargado debe coincidir con el esperado');

        const cachedValue = await cache.get(key);
        assert.equal(cachedValue, expectedValue, 'El valor debe estar presente en la caché después de cargarlo');
    });
})


