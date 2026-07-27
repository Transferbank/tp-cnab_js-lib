/**
 * Modo de leitura de dados do arquivo CNAB.
 * 
 * - SIMPLE: leitura genérica com campos canônicos comuns a todos os bancos
 * - FULL: leitura completa com tipos específicos por banco (não implementado na Fase 5)
 */
export type ReadMode = 'SIMPLE' | 'FULL'
