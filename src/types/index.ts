/**
 * Exportações centralizadas de tipos
 * 
 * Estrutura organizada por domínio funcional:
 * - core: tipos fundamentais de CNAB
 * - bank: tipos relacionados a bancos e schemas
 * - read: tipos para leitura estruturada
 * - processing: tipos de processamento (agrupamento, etc.)
 * - testing: tipos para fixtures e testes
 * - errors: hierarquia de erros
 */

export * from './core'
export * from './bank'
export * from './read'
export * from './processing'
export * from './testing'
export * from './errors'

