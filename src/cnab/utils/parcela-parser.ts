const PARCELA_PATTERNS: RegExp[] = [
  /. (\d{1,3})\/(\d{1,3})$/, // 12345 1/3
  /.-(\d{1,3})\/(\d{1,3})$/, // 123456-1/3
  /.-(\d{1,3}) (\d{1,3})$/, // 123456-2 5
  /.-(\d{1,3})$/, // XX12345-01
  /.\.(\d{1,3})$/, // 12.345678.01
  /.\/(\d{1,3})$/ // XX:123/2
]

export function findParcela(value: string): string | null {
  for (const pattern of PARCELA_PATTERNS) {
    const match = pattern.exec(value)
    if (match != null) {
      const parcela = Number(match[1])
      return match[2] == null ? `${parcela}` : `${parcela}/${Number(match[2])}`
    }
  }
  return null
}
