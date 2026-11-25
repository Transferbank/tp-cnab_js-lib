const ESPECIES_WITHOUT_CHARGES = ['31', '32']

export function isEspecieWithoutCharges(especie: string | null): boolean {
  return especie != null && ESPECIES_WITHOUT_CHARGES.includes(especie)
}
