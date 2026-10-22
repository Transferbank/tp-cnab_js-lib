const PARCELA_PATTERNS: RegExp[] = [
  /. (\d{1,3})\/(\d{1,3})$/, // 12345 1/3
  /.-(\d{1,3})\/(\d{1,3})$/, // 123456-1/3
  /.-(\d{1,3}) (\d{1,3})$/, // 123456-2 5
  /.-(\d{1,3})$/, // XX12345-01
  /.\.(\d{1,3})$/, // 12.345678.01
  /.\/(\d{1,3})$/ // XX:123/2
]

export interface Parcela {
  parcela: number
  total: number | null
}

export function findParcela(value: string): Parcela | null {
  for (const pattern of PARCELA_PATTERNS) {
    const match = pattern.exec(value)
    if (match != null) {
      return {
        parcela: Number(match[1]),
        total: match[2] == null ? null : Number(match[2])
      }
    }
  }
  return null
}
