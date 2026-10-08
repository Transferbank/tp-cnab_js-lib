const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

export function parseEmailList(rawValue: string): string[] {
  return rawValue
    .split(';')
    .filter((email: string) => email.length > 0)
}

export function emailListErrorMessage(emails: string[]): string | null {
  if (emails.length == 0) {
    return 'Campo email do sacado inválido: nenhum e-mail informado'
  }
  const invalidEmail = emails.find((email: string) => !isValidEmail(email))
  return invalidEmail == null ? null : `Campo email do sacado inválido: ${invalidEmail} não é um e-mail`
}
