enum PasswordPolicyConfig {
    MinLength = "PASSWORD_POLICY_MIN_LENGTH",
    MaxLength = "PASSWORD_POLICY_MAX_LENGTH",
    RequireUppercase = "PASSWORD_POLICY_REQUIRE_UPPERCASE",
    RequireLowercase = "PASSWORD_POLICY_REQUIRE_LOWERCASE",
    RequireNumber = "PASSWORD_POLICY_REQUIRE_NUMBER",
    RequireSpecialChar = "PASSWORD_POLICY_REQUIRE_SPECIAL_CHAR",
    DisallowSpaces = "PASSWORD_POLICY_DISALLOW_SPACES",
    PreventReuse = "PASSWORD_POLICY_PREVENT_REUSE",
    ExpirationDays = "PASSWORD_POLICY_EXPIRATION_DAYS",
}

export default PasswordPolicyConfig;
export {PasswordPolicyConfig};
