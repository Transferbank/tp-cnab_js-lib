/**
 * Santander (033) — CNAB 400 — Registros Opcionais
 *
 * Registros complementares que podem acompanhar os registros obrigatórios
 * (header, detalhe tipo 1, trailer) em arquivos de remessa.
 *
 * REMESSA:
 * - Tipo 8: Pagamento via PIX/QR Code (implementado) — confirmado pelo manual oficial
 *   v2.36 (jul/2025) e por duas bibliotecas de terceiros (brcobranca, laravel-boleto)
 * - Tipo 2/4/5/6/7: Mensagem Variável por Título (implementado) — confirmado pelo
 *   manual oficial v2.36 (jul/2025); sem confirmação de terceiros
 *
 * IMPORTANTE:
 * - Tipo 8 (PIX): layout 100% confirmado pelo manual oficial 2025, sem incertezas
 * - Tipo 2/4/5/6/7 (Mensagem Variável): único RecordSchema reutilizado pelos 5 códigos;
 *   subsequencia_3 não tem padrão fixo (inconsistência do manual não resolvida)
 * - Nenhum destes registros aparece no fixture real do projeto (SANTANDER_cnab_400_140.REM)
 */

export { TYPE8_PIX } from './type8-pix/type8-pix'
export { VARIABLE_TITLE_MESSAGE } from './variable-title-message/variable-title-message'
