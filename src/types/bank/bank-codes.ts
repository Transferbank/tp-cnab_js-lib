/**
 * Códigos FEBRABAN dos bancos implementados pela biblioteca
 *
 * Este é o registro central de códigos de banco — fonte única de verdade
 * para identificação de bancos em:
 * - Registries de schema (src/schemas/index.ts)
 * - Definições de BankSchema (bankCode em cada banco)
 * - Testes de identidade de banco
 * - Scripts de geração de metadados
 *
 * IMPORTANTE: NÃO usar para campos de wire format (ex.: codigo_banco no header/detail/trailer).
 * Aqueles campos representam bytes literais exigidos pela Febraban na posição do arquivo,
 * não referências à identidade do banco.
 *
 * Padrão: as const em vez de enum — evita objeto extra em runtime, mapeamento reverso,
 * e é mais idiomático para constantes de string em libs TypeScript modernas.
 */

export const BANK_CODES = {
  BANCO_DO_BRASIL: '001',
  SANTANDER: '033',
  CAIXA: '104',
  BRADESCO: '237',
  ITAU: '341',
  SICREDI: '748',
  SICOOB: '756',
} as const

/**
 * Tipo TypeScript para códigos de banco válidos
 */
export type BankCode = (typeof BANK_CODES)[keyof typeof BANK_CODES]
