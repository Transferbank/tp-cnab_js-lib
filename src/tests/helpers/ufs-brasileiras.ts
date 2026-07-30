/**
 * Lista de UFs (Unidades Federativas) brasileiras
 *
 * Total: 27 UFs (26 estados + 1 Distrito Federal)
 *
 * Uso comum em testes de validação de campos de estado em registros CNAB.
 */

export const UFS_VALIDAS = [
  'AC', // Acre
  'AL', // Alagoas
  'AP', // Amapá
  'AM', // Amazonas
  'BA', // Bahia
  'CE', // Ceará
  'DF', // Distrito Federal
  'ES', // Espírito Santo
  'GO', // Goiás
  'MA', // Maranhão
  'MT', // Mato Grosso
  'MS', // Mato Grosso do Sul
  'MG', // Minas Gerais
  'PA', // Pará
  'PB', // Paraíba
  'PR', // Paraná
  'PE', // Pernambuco
  'PI', // Piauí
  'RJ', // Rio de Janeiro
  'RN', // Rio Grande do Norte
  'RS', // Rio Grande do Sul
  'RO', // Rondônia
  'RR', // Roraima
  'SC', // Santa Catarina
  'SP', // São Paulo
  'SE', // Sergipe
  'TO', // Tocantins
] as const

/**
 * Tipo TypeScript para UFs válidas
 */
export type UF = (typeof UFS_VALIDAS)[number]

/**
 * Valida se uma string é uma UF brasileira válida
 */
export function isValidUF(uf: string): boolean {
  return UFS_VALIDAS.includes(uf as UF)
}
