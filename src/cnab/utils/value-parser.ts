export function parseImpliedDecimal(rawValue: string, decimals: number): number | null {
  if (!/^\d+$/.test(rawValue)) return null
  return parseInt(rawValue, 10) / 10 ** decimals
}
