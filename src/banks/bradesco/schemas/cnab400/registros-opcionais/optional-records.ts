/**
 * Bradesco (237) — CNAB 400 — Registros Opcionais de Remessa
 *
 * Registros opcionais complementam os registros obrigatórios (header tipo 0, detalhe tipo 1,
 * trailer tipo 9) com informações adicionais específicas para cada título.
 *
 * Registros implementados:
 * - TIPO 2: Mensagem / Descontos Adicionais (4 mensagens de 80 caracteres + 2º e 3º desconto)
 * - TIPO 6: Múltiplas Transferências / Débito Automático (transferência entre carteiras + débito automático)
 *
 * Registros pendentes de implementação (documentação já existente):
 * - TIPO 3: Rateio de crédito (ver tipo3/tipo3-rateio-credito.md)
 * - TIPO 7: Sacador/Avalista (ver tipo7/tipo7-sacador-avalista.md)
 *
 * Ver: README.md desta pasta para detalhes sobre cada registro opcional
 */

export { TYPE2_MESSAGES_DISCOUNTS } from './type2-messages-discounts/type2-messages-discounts'
export { TYPE6_PORTFOLIO_TRANSFER } from './type6-portfolio-transfer/type6-portfolio-transfer'
