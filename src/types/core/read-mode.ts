/**
 * Modo de leitura de dados do arquivo CNAB.
 * 
 * - SIMPLE: leitura genérica com campos canônicos comuns a todos os bancos
 * - FULL: leitura completa com tipos específicos por banco
 */
export enum ReadMode {
  SIMPLE = 'SIMPLE',
  FULL = 'FULL',
}
