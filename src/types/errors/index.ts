/**
 * Hierarquia de exceptions da lib tp-cnab-lib.
 * 
 * CNABInputError: erros causados por input inválido do consumidor
 * CNABInternalError: inconsistências internas da lib (bugs)
 */

// Re-export classes base abstratas
export * from './base'

// Re-export exceptions concretas
export * from './input-errors'
export * from './internal-errors'
export * from './grouping-errors'
export * from './lazy-errors'
export * from './extraction-errors'
