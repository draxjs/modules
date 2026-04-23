const messages = {
    en: {
        validation: {
            email: {
                invalid: 'Invalid Email',
            },
            password: {
                min8: 'Password must be at least 8 characters long',
                minLength: 'Password does not meet the minimum length',
                max32: 'Password must be at most 32 characters long',
                max64: 'Password must be at most 64 characters long',
                maxLength: 'Password exceeds the maximum length',
                requireUppercase: 'Password must contain at least one uppercase letter',
                requireLowercase: 'Password must contain at least one lowercase letter',
                requireNumber: 'Password must contain at least one number',
                requireSpecialChar: 'Password must contain at least one allowed special character',
                disallowSpaces: 'Password cannot contain spaces',
                preventReuse: 'Password cannot be the same as a recently used password',
                confirmed: 'Passwords do not match',
                currentDifferent: 'New password must be different from current password'
            },
        }
    },
    es: {
        validation: {
            email:{
                invalid: 'Email invalido',
            },
            password:{
                min8: 'La contraseña debe tener al menos 8 caracteres',
                minLength: 'La contraseña no cumple con la longitud minima',
                max32: 'La contraseña debe tener como maximo 32 caracteres',
                max64: 'La contraseña debe tener como maximo 64 caracteres',
                maxLength: 'La contraseña supera la longitud maxima',
                requireUppercase: 'La contraseña debe contener al menos una letra mayuscula',
                requireLowercase: 'La contraseña debe contener al menos una letra minuscula',
                requireNumber: 'La contraseña debe contener al menos un numero',
                requireSpecialChar: 'La contraseña debe contener al menos un caracter especial permitido',
                disallowSpaces: 'La contraseña no puede contener espacios',
                preventReuse: 'La contraseña no puede ser igual a una usada recientemente',
                confirmed: 'Las contraseñas no coinciden',
                currentDifferent: 'Nueva contraseña debe ser diferente de la actual'
            },
        }
    }
}


export default messages
