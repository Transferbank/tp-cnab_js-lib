export function blankIfZeros(rawValue: string): string {
  return /^0+$/.test(rawValue) ? '' : rawValue
}

export function isValidDdd(ddd: string): boolean {
  return /^\d{2}$/.test(ddd)
}

export function isValidCelular(celular: string): boolean {
  return /^\d{8,9}$/.test(celular)
}
