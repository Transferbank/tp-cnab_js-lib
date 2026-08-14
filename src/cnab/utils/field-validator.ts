export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value)
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value)
}

export function isMoney(value: string): boolean {
  return /^\d+$/.test(value)
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max
}
