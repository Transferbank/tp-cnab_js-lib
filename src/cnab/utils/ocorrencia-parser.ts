export function isValidOcorrenciaCode(code: string): boolean {
  return /^[A-Z0-9]{2}$/.test(code)
}
