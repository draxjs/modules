# LDAP nativo

## Propósito

Identity autentica cuentas LDAP mediante el login existente de REST y GraphQL. Reutiliza JWT, sesiones, auditoría y refresh tokens de Drax. No agrega otro endpoint ni una estrategia de proveedores configurable.

La implementación cubre el esquema usado por Dracul: DN `cn=<usuario>,<base de usuarios>`, atributos `cn`, `mail` y `gidNumber`, y búsqueda del grupo primario bajo la base de grupos. No implementa Active Directory ni grupos anidados. El usuario autenticado debe poder leer su identidad y el nombre de su grupo; no se solicita `userPassword`.

Requiere Node.js 22 o posterior y `ldapts` 9.2.0. LDAP está deshabilitado por defecto.

## Configuración

Agregar estas variables y ejecutar `LoadIdentityConfigFromEnv()` durante la inicialización normal de la aplicación:

```dotenv
DRAX_LDAP_ENABLED=true
DRAX_LDAP_URL=ldaps://ldap.example.test:636
DRAX_LDAP_USERS_DN=ou=people,dc=example,dc=test
DRAX_LDAP_GROUPS_DN=ou=group,dc=example,dc=test
DRAX_LDAP_STARTTLS=false
DRAX_LDAP_DEFAULT_ROLE=Desarrollo
```

En el primer ingreso, Drax busca un rol existente con el nombre exacto del grupo primario de LDAP, respetando mayúsculas y minúsculas. Si la búsqueda no devuelve un nombre de grupo, usa el rol configurado en `DRAX_LDAP_DEFAULT_ROLE`. Si el rol elegido no existe, la búsqueda devuelve varios grupos o no hay grupo ni rol por defecto configurado, se rechaza el alta.

Con LDAP habilitado, las bases DN y una URL válida son obligatorias. Una aplicación también puede establecer las claves del enum `IdentityConfig` mediante `DraxConfig`, como el resto de la configuración del framework.

Para StartTLS usar `DRAX_LDAP_URL=ldap://...` y `DRAX_LDAP_STARTTLS=true`. Para LDAPS usar `ldaps://...` y StartTLS deshabilitado. `ldap://` sin StartTLS conserva el transporte legacy solo si se configura explícitamente; transmite credenciales sin cifrado.

Usar `NODE_EXTRA_CA_CERTS` al arrancar Node cuando se necesita confiar en una CA corporativa. La verificación del certificado se mantiene habilitada tanto en LDAPS como en StartTLS, incluso si otro componente utiliza el opt-out global de TLS. No hay una opción LDAP para omitirla. Cada conexión tiene timeout de conexión de 1500 ms y timeout por operación de 5000 ms; búsquedas limitadas y conexión cerrada al finalizar.

## Identidad y permisos

El primer login válido crea un usuario con `origin: 'LDAP'`, `ldapDn` canónico, sin password local y con el rol asignado. Mongo y SQLite persisten el mismo vínculo. Se usa el `cn` canónico del directorio, incluyendo cuando el usuario ingresó otra combinación de mayúsculas. DN y filtros se construyen con el escape de `ldapts`.

Un usuario existente conserva ID, rol, perfil y estado activo: LDAP verifica identidad, no sobrescribe las decisiones del administrador en cada ingreso. Puede ingresar aunque el directorio ya no publique `mail`; las altas nuevas requieren un email válido y no se inventa uno. Las ediciones de usuario no pueden alterar `origin` o `ldapDn`, cambiar password ni renombrar una cuenta LDAP. Tampoco puede autenticarse por email como alternativa al bind LDAP.

Las cuentas locales existentes continúan con su contraseña local y no dependen de la disponibilidad del directorio. La coincidencia de username con una cuenta local nunca la convierte automáticamente en LDAP; tampoco se vincula una cuenta por coincidencia de email. La provisión se realiza desde el login, no desde el CRUD genérico de usuarios.

Las cuentas LDAP no pueden cambiar ni recuperar una contraseña local, ni usar un hash local importado como fallback. Deshabilitar LDAP impide nuevos logins y refresh de estas cuentas. Desactivar un usuario en Drax impide nuevos logins y refresh aunque el bind sea correcto.

Los refresh tokens LDAP se vinculan al DN y mantienen la rotación y vencimiento absoluto existentes. No consultan el directorio en cada refresh. Un cambio o baja exclusivamente en LDAP no revoca inmediatamente un JWT o refresh ya emitido; para cortar nuevas renovaciones se desactiva la cuenta en Drax. Un JWT vigente conserva la política habitual del framework hasta su vencimiento.

## Migración desde Dracul

El importador de la aplicación debe traducir `fromLDAP: true` a `origin: 'LDAP'` y guardar el DN canónico validado en `ldapDn`, preservando ID, rol y estado. Una cuenta marcada LDAP sin un vínculo válido no puede ingresar: no se completa silenciosamente con la primera identidad que coincida por email.

No importar contraseñas, `userPassword`, hashes ni sesiones legacy para las cuentas LDAP. Las cuentas locales conservan su esquema y validación de password. No es necesario compartir la base de Dracul con Drax.

## Contrato de errores

REST continúa usando `POST /api/auth/login` con `{username,password,rememberMe?}` y las respuestas habituales de tokens. Credenciales inválidas, cuenta desactivada, identidad distinta, alta sin un rol válido y colisiones devuelven el `BadCredentialsError` neutral existente, HTTP 401. El controlador produce una única respuesta.

Indisponibilidad de LDAP, fallo de TLS o configuración no utilizable devuelven HTTP 503 con `LdapUnavailableError` y mensaje `error.ldapUnavailable`. El error no contiene mensajes, atributos ni credenciales del proveedor. GraphQL utiliza el resolver existente y su contrato de error genérico de servidor ante un fallo técnico.

## Pruebas y build

Desde la raíz del monorepo, con sus dependencias inicializadas:

```sh
npm run testLdap --workspace @drax/identity-back
npm run prepublish --workspace @drax/identity-share
npm run prepublish --workspace @drax/identity-back
npm run testLdapIntegration --workspace @drax/identity-back
```

Las pruebas rápidas usan Vitest, como los tests recientes de Identity; prueban el transporte mediante un mock de `ldapts` y las rutas con servicios Drax y SQLite reales. Los scripts existentes con Node Test Runner no ejecutan estos tests Vitest.

La integración requiere Docker y OpenSSL. Levanta un OpenLDAP aislado, fijado por digest, en puertos aleatorios publicados solo en loopback. Usa LDIF sintético, habilita lectura de grupos para usuarios autenticados y genera su CA/certificados temporales para evitar los certificados vencidos incluidos en la imagen de fixture. No cambia el LDAP corporativo ni el estado del Swarm.

El runner verifica HTTP, persistencia real de SQLite y MongoDB, provisión, JWT/refresh, DN con caracteres escapados, permisos y fallos, y ambos transportes TLS. Mongo usa `mongodb-memory-server`. Una comprobación adicional ejecuta el transporte compilado contra un certificado no confiable. Las credenciales y claves TLS de la fixture son temporales y se eliminan al finalizar; no son valores de producción.

La suite real es separada de los tests rápidos y falla si Docker, OpenSSL o la fixture no están disponibles. No reemplaza la prueba de conectividad, certificados y esquema del directorio corporativo antes de usar LDAP en una aplicación real.
