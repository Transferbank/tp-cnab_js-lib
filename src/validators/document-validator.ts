/**
 * Validação de documentos (CPF/CNPJ)
 *
 * Este arquivo é só um re-export — a implementação real vive em `utils/string-utils.ts`.
 * Existe para dar um ponto de import mais descritivo (`validators/document-validator`)
 * a quem só precisa validar CPF/CNPJ sem se importar com o resto dos utilitários de string.
 */

export { isValidCPF, isValidCNPJ, isValidCpfCnpj, validatePayerDocument } from '../utils/string-utils'
