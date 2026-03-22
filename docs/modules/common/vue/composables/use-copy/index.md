# useCopy

## Propósito

`useCopy` expone una utilidad de copiado al portapapeles.

## Qué hace

Prefiere `navigator.clipboard.writeText` y, si no está disponible, cae en una estrategia con `textarea` y `document.execCommand('copy')`.
