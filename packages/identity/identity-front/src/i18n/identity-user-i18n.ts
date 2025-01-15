const messages = {
    en: {
        user: {
            entity: 'User',
            profile:'Profile',
            code: "Code",
            passwordChanged: "Password Changed",
            operation: {
                changePassword: "Changing User Password",
            },
            events: {
                passwordChanged: "Password Changed",
                recoveryPasswordInfo: "Password recovery information has been sent",
                registrationComplete: "Registration Complete",
            },
            action: {
                changePassword: "Change Password",
                changeOwnPassword: "Change Password",
                recoveryPassword: "Recovery Password",
                recoveryPasswordRequest: "Recovery Password Request",
                recoveryPasswordComplete: "Recovery Password Complete",
                register: "Register",
                login:'Login',
                logout:'Logout',
            },
            field: {
                name: "Name",
                username: "Username",
                email: "Email",
                password: "Password",
                phone: "Phone",
                avatar: "Avatar",
                role: "Role",
                tenant: "Tenant",
                active: "Active",
                groups: "Groups",
                currentPassword: "Current Password",
                newPassword: "New Password",
                confirmPassword: "Confirm Password",
                recoveryCode: "Recovery Code",
            }
        }
    },
    es: {
        user:{
            entity: 'Usuario',

            profile:'Perfil',
            code: "Codigo",
            passwordChanged: "Contraseña Cambiada",
            operation: {
                changePassword: "Cambiando Contraseña de Usuario",
            },
            events: {
                passwordChanged: "Se ha cambiado la Contraseña",
                recoveryPasswordInfo: "Se ha enviado información de recuperación de Contraseña",
                registrationComplete: "Revisa tu correo electrónico para completar el registro.",
            },
            action: {
                changePassword: "Cambiar Contraseña",
                changeOwnPassword: "Cambiar Contraseña",
                recoveryPassword: "Recuperar Contraseña",
                recoveryPasswordRequest: "Petición de Recuperación de Contraseña",
                recoveryPasswordComplete: "Completar Recuperación de Contraseña",
                register: "Registro",
                login:'Iniciar Sesión',
                logout:'Cerrar Sesión',

            },
            field: {
                name: "Nombre",
                username: "Usuario",
                email: "Email",
                password: "Clave",
                phone: "Télefono",
                avatar: "Avatar",
                role: "Rol",
                tenant: "Tenant",
                active: "Activo",
                groups: "Grupos",
                currentPassword: "Clave Actual",
                newPassword: "Nueva Clave",
                confirmPassword: "Confirmar Clave",
                recoveryCode: "Código de Recuperación",
            }
        }
    }
}


export default messages
