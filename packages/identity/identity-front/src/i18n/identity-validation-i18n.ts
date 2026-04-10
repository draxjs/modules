const messages = {
    en: {
        validation: {
            email: {
                invalid: 'Invalid Email',
            },
            password: {
                complexity: 'Password is invalid, it must contain: ',
                min8: 'Password must be at least 8 characters long',
                max32: 'Password must be at most 32 characters long',
                max64: 'Password must be at most 64 characters long',
                confirmed: 'Passwords do not match',
                currentDifferent: 'New password must be different from current password',
                MinChar: 'Minimum characters: ',
                MinLowerCase: 'Lowercase required: ',
                MinUppercase: 'Uppercase required: ',
                MinNumber: 'Numbers required: ',
                MinSymbol: 'Symbols required: ',
            },
        }
    },
    es: {
        validation: {
            email:{
                invalid: 'Email invalido',
            },
            password:{
                complexity: 'La contraseña es inválida, debe contener: ',
                min8: 'La contraseña debe tener al menos 8 caracteres',
                max32: 'La contraseña debe tener como maximo 32 caracteres',
                max64: 'La contraseña debe tener como maximo 64 caracteres',
                confirmed: 'Las contraseñas no coinciden',
                currentDifferent: 'Nueva contraseña debe ser diferente de la actual',
                MinChar: 'Caracteres minimos: ',
                MinLowerCase: 'Minusculas requeridas: ',
                MinUppercase: 'Mayusculas requeridas: ',
                MinNumber: 'Numeros requeridos: ',
                MinSymbol: 'Simbolos requeridos: ',
            },
        }
    }
}


export default messages
