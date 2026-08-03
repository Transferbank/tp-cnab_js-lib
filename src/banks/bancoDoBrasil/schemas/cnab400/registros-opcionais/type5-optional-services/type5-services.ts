/**
 * Banco do Brasil (001) — CNAB 400 — Registros Tipo 5 (Registros Opcionais de Remessa)
 *
 * O BB usa o registro tipo 5 para informações opcionais que complementam o detalhe tipo 7.
 * Existem 5 variantes identificadas pelo campo `tipo_servico` [2,3] (ver detalhamento
 * completo em `../tipo5-registros-opcionais-remessa.md`):
 *
 * - '99': Multa (implementado)
 * - '07': 2º e 3º Descontos (implementado — revelado no manual 2024)
 * - '08': Agente Negativador (implementado — revelado no manual 2024)
 * - '01': E-mail do sacado (não implementado)
 * - '03': Seu número com 15 posições (não implementado)
 *
 * Quando enviado, o registro tipo 5 deve vir imediatamente após o detalhe tipo 7
 * ao qual se refere.
 */

export { TYPE5_FINE } from './type5-fine'
export { TYPE5_DISCOUNTS } from './type5-discounts'
export { TYPE5_CREDIT_BUREAU } from './type5-credit-bureau'
