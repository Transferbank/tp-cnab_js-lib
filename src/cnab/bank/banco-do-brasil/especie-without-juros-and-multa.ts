const ESPECIES_WITHOUT_JUROS_AND_MULTA = ['31', '32']

export function isEspecieWithoutJurosAndMulta(especie: string | null): boolean {
  return especie != null && ESPECIES_WITHOUT_JUROS_AND_MULTA.includes(especie)
}
