function castDateValue(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') {
        return null
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
        return null
    }

    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

export {castDateValue}
