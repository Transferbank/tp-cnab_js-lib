/**
 * Banco do Brasil (001) — CNAB 400 — Registros Opcionais
 *
 * Registros complementares que podem acompanhar os registros obrigatórios
 * (header, detalhe tipo 7, trailer).
 *
 * REMESSA:
 * - Tipo 5 / Serviço '99': Multa
 * - Tipo 5 / Serviço '01': E-mail do sacado (não implementado)
 * - Tipo 5 / Serviço '03': Seu número com 15 posições (não implementado)
 *
 * RETORNO (não implementados):
 * - Tipo 2: Partilha carteira 17
 * - Tipo 3: Vendor
 * - Tipo 5: Diversos (bloqueto e-mail, cheque, seu número)
 */

export * from './type5-optional-services/type5-services'
