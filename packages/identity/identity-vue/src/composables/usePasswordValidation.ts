import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSetting } from '@drax/settings-vue'

interface PasswordRule {
  label: string
  valid: boolean
}


const DEFAULT_SETTINGS = {
  passwordMinLength: 8,
  passwordRequireLowercase: 0,
  passwordRequireUppercase: 0,
  passwordSymbolsAllowed: '!@#$%^&*',
  passwordRequireSymbols: 0,
  passwordRequireNumbers: 0
}

export function usePasswordValidation() {
  const { t } = useI18n()
  const { settings } = useSetting()

  const config = computed(() => {
    const s = settings.value || []
    
    const numericKeys = [
      'passwordMinLength',
      'passwordRequireLowercase',
      'passwordRequireUppercase',
      'passwordRequireSymbols',
      'passwordRequireNumbers'
    ]
    
    const getSetting = (key: string, defaultValue: any) => {
      const found = s.find((setting: any) => setting.key === key)
      if (!found) return defaultValue
      
      if (numericKeys.includes(key)) {
        return Number(found.value) || defaultValue
      }
      
      return found.value
    }

    return {
      minLength: getSetting('passwordMinLength', DEFAULT_SETTINGS.passwordMinLength),
      requireLowercase: getSetting('passwordRequireLowercase', DEFAULT_SETTINGS.passwordRequireLowercase),
      requireUppercase: getSetting('passwordRequireUppercase', DEFAULT_SETTINGS.passwordRequireUppercase),
      symbolsAllowed: getSetting('passwordSymbolsAllowed', DEFAULT_SETTINGS.passwordSymbolsAllowed),
      requireSymbols: getSetting('passwordRequireSymbols', DEFAULT_SETTINGS.passwordRequireSymbols),
      requireNumbers: getSetting('passwordRequireNumbers', DEFAULT_SETTINGS.passwordRequireNumbers)
    }
  })

  const passwordRulesState = (password: string): PasswordRule[] => {
    const pwd = password || ''
    const rules: PasswordRule[] = []

    const countLowercase = (pwd.match(/[a-z]/g) || []).length
    const countUppercase = (pwd.match(/[A-Z]/g) || []).length
    const countNumbers = (pwd.match(/[0-9]/g) || []).length
    
    const symbolsAllowed = config.value.symbolsAllowed || ''
    const symbolsRegex = symbolsAllowed ? new RegExp(`[${symbolsAllowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g') : null
    const countSymbols = symbolsRegex ? (pwd.match(symbolsRegex) || []).length : 0

    rules.push({
      label: `${t('validation.password.MinChar')} ${config.value.minLength}`,
      valid: pwd.length >= config.value.minLength
    })

    if (config.value.requireLowercase > 0) {
      rules.push({
        label: `${t('validation.password.MinLowerCase')} ${config.value.requireLowercase}`,
        valid: countLowercase >= config.value.requireLowercase
      })
    }

    if (config.value.requireUppercase > 0) {
      rules.push({
        label: `${t('validation.password.MinUppercase')} ${config.value.requireUppercase}`,
        valid: countUppercase >= config.value.requireUppercase
      })
    }

    if (config.value.requireNumbers > 0) {
      rules.push({
        label: `${t('validation.password.MinNumber')} ${config.value.requireNumbers}`,
        valid: countNumbers >= config.value.requireNumbers
      })
    }

    if (config.value.requireSymbols > 0 && symbolsAllowed) {
      rules.push({
        label: `${t('validation.password.MinSymbol')} ${config.value.requireSymbols} (${symbolsAllowed})`,
        valid: countSymbols >= config.value.requireSymbols
      })
    }

    return rules
  }

  const passwordComplexityRule = (value: string): boolean | string => {
    if (!value) return true

    const pwd = value.trim()
    const rules = passwordRulesState(pwd)

    const allValid = rules.every(rule => rule.valid)

    if (!allValid) {
      const invalidLabels = rules
        .filter(rule => !rule.valid)
        .map(rule => rule.label)
        .join(', ')
      return `${t('validation.password.complexity')} ${invalidLabels}`
    }

    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) return false
    const pwd = password.trim()
    const rules = passwordRulesState(pwd)
    return rules.every(rule => rule.valid)
  }

  const getInvalidRules = (password: string): PasswordRule[] => {
    if (!password) return []
    const pwd = password.trim()
    return passwordRulesState(pwd).filter(rule => !rule.valid)
  }

  return {
    config,
    passwordRulesState,
    passwordComplexityRule,
    validatePassword,
    getInvalidRules
  }
}