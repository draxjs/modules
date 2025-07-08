function isValidIsoDate(value:string) {
    // Verifica si es una cadena y si coincide con el formato ISO básico
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

    if (typeof value !== 'string' || !isoRegex.test(value)) {
        return false;
    }

    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString() === value;
}

export default isValidIsoDate;
export {
    isValidIsoDate
}
