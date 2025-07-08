import {ObjectId} from "mongodb";

function isValidObjectId(id: any): boolean {
    // Verificar si es una cadena con exactamente 24 caracteres hexadecimales
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
        return ObjectId.isValid(id);
    }
    return false;
}

export default isValidObjectId;

export {isValidObjectId}
