/**
 * CNAB-Lib — Biblioteca TypeScript para processamento de arquivos CNAB
 * 
 * Suporta CNAB 240 e CNAB 400 com validação estrutural e de negócio
 */

import { detectFormat, detectBank } from './parser/format-detector'
import { getBankSchema } from './schemas'
import { validateCnab400Business } from './validators/cnab400-business-validator'
import { validateCnab240Business } from './validators/cnab240-business-validator'
import { CNABValidationResult, CNABFormat } from './types'
import { CNABFile } from './types/core'
import {
  CNABEmptyFileError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
  CNABSchemaNotFoundError,
} from './types/errors'

/**
 * Abre um arquivo CNAB e retorna um objeto CNABFile com metadados detectados.
 * 
 * Detecta automaticamente tipo (CNAB 240/400) e banco. Exige que banco+formato
 * tenham schema cadastrado no sistema.
 * 
 * @param raw - Conteúdo bruto do arquivo (decodificado em Latin-1)
 * @returns Instância de CNABFile com schema disponível
 * @throws {CNABEmptyFileError} se arquivo vazio ou contém apenas linhas em branco
 * @throws {CNABFormatNotRecognizedError} se formato não é CNAB 240 nem CNAB 400
 * @throws {CNABBankNotFoundError} se código do banco não encontrado no header
 * @throws {CNABSchemaNotFoundError} se banco+formato não possui schema cadastrado
 * @throws {CNABUnknownFieldCodeError} (via read/readAsync) se código de campo não reconhecido durante extração canônica
 * 
 * @example
 * ```typescript
 * const fileContent = readFileSync('remessa.rem', 'latin1')
 * const cnabFile = openCnab(fileContent)
 * 
 * console.log(cnabFile.type)       // 'cnab400'
 * console.log(cnabFile.bankName)   // 'Bradesco'
 * console.log(cnabFile.lineCount)  // 150
 * ```
 */
export function openCnab(raw: string): CNABFile {
  const rawLines = (raw || '').split(/\r?\n/).filter((line) => line.length > 0)

  
  if (rawLines.length === 0) {
    throw new CNABEmptyFileError()
  }

  const format = detectFormat(rawLines)

  if (!format) {
    const lineLength = rawLines[0]?.length ?? 0
    throw new CNABFormatNotRecognizedError(lineLength)
  }

  const bankCode = detectBank(rawLines[0], format)

  if (!bankCode) {
    throw new CNABBankNotFoundError(format)
  }

  const bankSchema = getBankSchema(bankCode, format)

  if (!bankSchema) {
    throw new CNABSchemaNotFoundError(bankCode, format)
  }

  return new CNABFile(format, bankSchema, rawLines)
}

/**
 * Valida um arquivo CNAB completo: detecta formato (240/400) e banco automaticamente
 * pelo conteúdo do header, escolhe o schema correspondente e delega a validação
 * campo-a-campo/negócio para `validateCnab240`/`validateCnab400`.
 *
 * Atenção com a numeração de linha nos erros retornados (`ValidationError.line`):
 * ela se refere à posição da linha no array já filtrado (sem linhas vazias), não à
 * linha real do arquivo original. Se o arquivo tiver linhas em branco no meio, os
 * números reportados podem não bater com o que se vê ao abrir o arquivo num editor.
 *
 * @param fileContent - Conteúdo bruto do arquivo (decodificado em Latin-1 — CNAB é
 *   tradicionalmente um arquivo de texto ANSI/Latin-1, não UTF-8; decodificar errado
 *   corrompe caracteres acentuados nos campos alfa)
 * @returns Resultado da validação com erros, registros e metadados. Note que
 *   `valid: false` pode significar tanto "formato não reconhecido" quanto "formato
 *   reconhecido mas com erros de conteúdo" — sempre cheque `format`/`bank` junto de `errors`
 *   para saber em qual caso está.
 */
export function validateCnabFile(fileContent: string): CNABValidationResult {
  if (!fileContent?.trim()) {
    return {
      valid: false,
      format: null,
      bank: null,
      totalRecords: 0,
      records: [],
      errors: [{ line: 1, column: 'Arquivo', message: 'Arquivo vazio' }],
    }
  }

  // Aceita quebra de linha Unix (\n) ou Windows (\r\n); linhas vazias são descartadas
  // (é comum um arquivo CNAB terminar com uma linha em branco). É esse array filtrado
  // que define a numeração de linha usada em todos os erros retornados (ver aviso acima).
  const lines = fileContent.split(/\r?\n/).filter((l) => l.length > 0)

  const format = detectFormat(lines)

  if (!format) {
    return {
      valid: false,
      format: null,
      bank: null,
      totalRecords: 0,
      records: [],
      errors: [
        {
          line: 1,
          column: 'Formato',
          message: `Não reconhecido (${lines[0].length} caracteres). Esperado: 240 ou 400`,
        },
      ],
    }
  }

  // Detectar banco pelo header. bankSchema fica null tanto se o código do banco não foi
  // lido do header quanto se foi lido mas não está cadastrado em `schemas/index.ts` — nos
  // dois casos os validadores seguem em frente usando só os fallbacks de posição fixa.
  const bankCode = detectBank(lines[0], format)
  const bankSchema = bankCode ? getBankSchema(bankCode, format) : null

  const result =
    format === 'cnab240'
      ? validateCnab240Business(lines, bankSchema)
      : validateCnab400Business(lines, bankSchema)

  const formatLabel: CNABFormat = format === 'cnab240' ? 'CNAB 240' : 'CNAB 400'
  // Se o banco foi identificado mas não tem schema cadastrado, ainda expomos o código
  // lido do header com um nome genérico ("Banco 999") em vez de deixar `bank` null —
  // é diferente de não ter conseguido ler nenhum código do header.
  const bankInfo = bankSchema
    ? { code: bankSchema.bankCode, name: bankSchema.bankName }
    : bankCode
    ? { code: bankCode, name: `Banco ${bankCode}` }
    : null

  return {
    valid: result.errors.length === 0,
    format: formatLabel,
    bank: bankInfo,
    totalRecords: result.records.length,
    records: result.records,
    errors: result.errors,
  }
}

// Exportações públicas
export * from './types'
export { detectFormat, detectBank } from './parser/format-detector'
export { getBankSchema } from './schemas'
export { extractLineFields } from './parser/field-extractor'
export { validateCnab240Business as validateCnab240 } from './validators/cnab240-business-validator'
export { validateCnab400Business as validateCnab400 } from './validators/cnab400-business-validator'
export * from './utils/date-parser'
export * from './utils/string-utils'
