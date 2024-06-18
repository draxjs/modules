export class InvalidTokenError extends Error {
}
InvalidTokenError.prototype.name = "InvalidTokenError";

export interface JwtDecodeOptions {
    header?: boolean;
}
export interface JwtHeader {
    typ?: string;
    alg?: string;
    kid?: string;
}
export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string[] | string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}


function b64DecodeUnicode(str:string) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}
function base64UrlDecode(str:string) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length");
    }
    try {
        return b64DecodeUnicode(output);
    }
    catch (err) {
        return atob(output);
    }
}
export function jwtDecodeHelper(token:string, options?: JwtDecodeOptions):JwtPayload|JwtHeader {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
        decoded = base64UrlDecode(part);
    }
    catch (e) {
        const errorMessage = e instanceof Error ? e.message : "unknown error";
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${errorMessage})`);
    }
    try {
        return JSON.parse(decoded);
    }
    catch (e) {
        const errorMessage = e instanceof Error ? e.message : "unknown error";
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${errorMessage})`);
    }
}
