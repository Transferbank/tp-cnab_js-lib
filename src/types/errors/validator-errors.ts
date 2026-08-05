/**
 * Erro base para validação de campos por validators.
 * Todos os validators lançam este erro com mensagens específicas.
 */
export class FieldValidationError extends Error {
  readonly name = 'FieldValidationError'
  
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, FieldValidationError.prototype)
  }
}
