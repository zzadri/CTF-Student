export const AUTH_CONFIG = {
  PASSWORD_MIN_LENGTH: import.meta.env.VITE_PASSWORD_MIN_LENGTH || 6,
  PASSWORD_PATTERN: import.meta.env.VITE_PASSWORD_PATTERN || '^.{6,}$',
  EMAIL_PATTERN: /^\S+@\S+$/
} as const; 