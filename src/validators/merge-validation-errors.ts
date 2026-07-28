import { ValidationError } from '@tp-types/index'

/**
 * Mescla erros estruturais e de negócio, removendo duplicatas.
 * Erro estrutural prevalece quando mesma (linha, field) - é schema-driven.
 */
export function mergeValidationErrors(
  structural: ValidationError[],
  business: ValidationError[]
): ValidationError[] {
  const structuralKeys = new Set(structural.map(e => `${e.line}::${e.field}`))
  const businessFiltered = business.filter(e => !structuralKeys.has(`${e.line}::${e.field}`))
  return [...structural, ...businessFiltered].sort((a, b) => a.line - b.line)
}
