/**
 * Utilitário para mesclar erros de validação estrutural e de negócio
 */

import { ValidationError } from '../types'

/**
 * Junta erros estruturais e de negócio, removendo duplicatas.
 * 
 * Quando os dois validadores relatam um erro na MESMA (linha, coluna), a versão
 * estrutural prevalece — ela é schema-driven; a de negócio às vezes assume valores
 * fixos hardcoded (ex: tipo de trailer '9') que a estrutural lê corretamente do
 * schema do banco.
 * 
 * @param structural - Erros do validador estrutural (validateCnab240Structure/validateCnab400Structure)
 * @param business - Erros do validador de negócio (validateCnab240/validateCnab400)
 * @returns Lista mesclada de erros, ordenada por linha, sem duplicatas
 */
export function mergeValidationErrors(
  structural: ValidationError[],
  business: ValidationError[]
): ValidationError[] {
  // Cria um Set com chaves (linha, coluna) dos erros estruturais
  const structuralKeys = new Set(structural.map(e => `${e.line}::${e.column}`))
  
  // Filtra erros de negócio que já foram reportados pela camada estrutural
  const businessFiltered = business.filter(e => !structuralKeys.has(`${e.line}::${e.column}`))
  
  // Junta ambos e ordena por número de linha
  return [...structural, ...businessFiltered].sort((a, b) => a.line - b.line)
}
