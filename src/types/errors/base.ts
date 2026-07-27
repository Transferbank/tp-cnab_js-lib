/**
 * Classes base abstratas para hierarquia de exceptions da lib.
 */

/**
 * Base abstrata para todas as exceptions da lib.
 * Define name, message e code para todas as exceptions concretas.
 */
export abstract class CNABError extends Error {
  /** Código único para identificar o tipo de erro (ex: 'EMPTY_FILE') */
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = new.target.name
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target)
    }
  }
}

/**
 * Base para erros causados por input inválido do consumidor.
 * Ex: arquivo vazio, formato não reconhecido, banco não cadastrado.
 */
export abstract class CNABInputError extends CNABError {}

/**
 * Base para inconsistências internas da lib (bugs).
 * Ex: schema cadastrado mas provider não encontrado.
 * Consumidores que receberem este erro devem reportar como issue.
 */
export abstract class CNABInternalError extends CNABError {}
