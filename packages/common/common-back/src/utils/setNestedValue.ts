function setNestedValue(obj: object, path: string, value: any) {
    const keys = path.split('.')
    const last = keys.pop()

    let ref = obj
    for (const key of keys) {
        ref[key] ??= {}
        ref = ref[key]
    }

    ref[last] = value
}

export default setNestedValue;

export {setNestedValue}
