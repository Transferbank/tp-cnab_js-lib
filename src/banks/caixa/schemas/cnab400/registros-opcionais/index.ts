/**
 * Caixa Econômica Federal (104) — CNAB 400 — Registros Opcionais
 *
 * Registros complementares que podem acompanhar os registros obrigatórios
 * (header, detalhe tipo 1, trailer) em arquivos de remessa.
 *
 * REMESSA:
 * - Tipo 2: Mensagens do Título (implementado)
 * - Tipo 3: Envio por E-mail/SMS (implementado)
 * - Tipo 4: Tipo de Pagamento e Rateio de Crédito (implementado)
 *
 * IMPORTANTE: Nenhum destes registros tem confirmação de biblioteca de terceiros
 * (laravel-boleto não os implementa) nem fixture real/sintética disponível no projeto.
 * Todas as posições vêm exclusivamente do manual oficial Caixa 2024.
 *
 * O campo codigo_registro dos três ('2', '3', '4') é INFERIDO do contexto (nome das
 * seções no manual), não confirmado explicitamente pelas tabelas. Vale conferir contra
 * um arquivo real antes de tratar como certeza absoluta.
 */

export { TYPE2_TITLE_MESSAGES } from './type2-title-messages/type2-title-messages'
export { TYPE3_EMAIL_SMS } from './type3-email-sms/type3-email-sms'
export { TYPE4_PAYMENT_ALLOCATION } from './type4-payment-allocation/type4-payment-allocation'
