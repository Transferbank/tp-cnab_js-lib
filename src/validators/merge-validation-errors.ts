import { ValidationError } from '@/types/all-types'

/**
 * Mescla erros estruturais e de negócio, removendo duplicatas.
 * Erro estrutural prevalece quando mesma (linha, field) - é schema-driven.
 */
export function mergeValidationErrors(
  structural: ValidationError[],
  content: ValidationError[]
): ValidationError[] {
  const structuralKeys = new Set(structural.map(e => `${e.line}::${e.field}`))
  const contentFiltered = content.filter(e => !structuralKeys.has(`${e.line}::${e.field}`))
  return [...structural, ...contentFiltered].sort((a, b) => a.line - b.line)
}
