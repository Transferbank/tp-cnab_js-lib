export function parseImpliedDecimal(rawValue: string, decimals: number): number | null {
  if (!/^\d+$/.test(rawValue)) return null
  return parseInt(rawValue, 10) / 10 ** decimals
}

export function sumRawAmounts(rawAmounts: string[]): string {
  let total = 0
  for (const rawAmount of rawAmounts) {
    if (rawAmount == '') {
      continue
    }
    if (!/^\d+$/.test(rawAmount)) {
      return rawAmount
    }
    total += parseInt(rawAmount, 10)
  }
  return total == 0 ? '' : String(total)
}
