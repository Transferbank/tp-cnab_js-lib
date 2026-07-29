/**
 * Helper para carregar e validar metadados de fixtures CNAB
 * 
 * Este m�dulo fornece fun��es para ler arquivos JSON de metadados
 * e validar sua estrutura, garantindo que todos os campos obrigat�rios
 * est�o presentes e com os tipos corretos.
 */

import * as fs from 'fs'
import * as path from 'path'
import { FixtureMetadata, DocumentType } from '@tp-types/testing'
import { CNABFormatCode } from '@tp-types/index'

/**
 * Carrega e valida metadados JSON de um fixture
 * 
 * @param bankName - Nome do banco (pasta em fixtures/)
 * @param fixtureName - Nome do arquivo (sem extens�o)
 * @returns Objeto FixtureMetadata tipado
 * @throws Error se arquivo n�o existe ou JSON inv�lido
 * 
 * @example
 * ```typescript
 * // Carregar metadados do Bradesco
 * const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')
 * console.log(metadata.records.length) // 3
 * 
 * // Carregar metadados do Santander CNAB 400
 * const metadata2 = loadFixtureMetadata('santander', 'retorno-simples', CNABFormatCode.CNAB400)
 * console.log(metadata2.format) // CNABFormatCode.CNAB400
 * ```
 */
export function loadFixtureMetadata(
  bankName: string,
  fixtureName: string,
  format: CNABFormatCode.CNAB240 | CNABFormatCode.CNAB400 = CNABFormatCode.CNAB240
): FixtureMetadata {
  // Construir path do arquivo JSON
  const jsonPath = path.join(
    __dirname,
    '../fixtures',
    format,
    bankName,
    `${fixtureName}.json`
  )

  // Verificar se arquivo existe
  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `Arquivo de metadados n�o encontrado: ${jsonPath}\n` +
      `Certifique-se de que o arquivo JSON existe no mesmo diret�rio do fixture TXT.`
    )
  }

  // Ler e parsear JSON
  let rawData: string
  try {
    rawData = fs.readFileSync(jsonPath, 'utf8')
  } catch (error) {
    throw new Error(
      `Erro ao ler arquivo de metadados: ${jsonPath}\n` +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  let data: unknown
  try {
    data = JSON.parse(rawData)
  } catch (error) {
    throw new Error(
      `JSON inv�lido no arquivo: ${jsonPath}\n` +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}\n` +
      `Verifique a sintaxe do JSON (v�rgulas, chaves, aspas).`
    )
  }

  // Validar schema e retornar tipado
  validateMetadataSchema(data, jsonPath)
  return data as FixtureMetadata
}

/**
 * Valida que objeto JSON tem todos os campos obrigat�rios
 * 
 * @param data - Dados parseados do JSON
 * @param filePath - Path do arquivo (para mensagens de erro)
 * @throws Error se algum campo obrigat�rio est� ausente ou com tipo incorreto
 * 
 * @internal
 */
function validateMetadataSchema(data: unknown, filePath: string): asserts data is FixtureMetadata {
  // Validar que � um objeto (n�o array, n�o primitivo)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    const receivedType = Array.isArray(data) ? 'array' : typeof data
    throw new Error(
      `Metadados inv�lidos em: ${filePath}\n` +
      `Esperado: objeto JSON\n` +
      `Recebido: ${receivedType}`
    )
  }

  const obj = data as Record<string, unknown>

  // Validar campos obrigat�rios de primeiro n�vel
  validateRequiredField(obj, 'description', 'string', filePath)
  validateRequiredField(obj, 'bankCode', 'string', filePath)
  validateRequiredField(obj, 'bankName', 'string', filePath)
  validateRequiredField(obj, 'format', 'string', filePath)
  validateRequiredField(obj, 'structure', 'object', filePath)
  validateRequiredField(obj, 'records', 'array', filePath)
  validateRequiredField(obj, 'totals', 'object', filePath)

  // Validar formato CNAB
  const validFormats = [CNABFormatCode.CNAB240, CNABFormatCode.CNAB400]
  if (!validFormats.includes(obj.format as CNABFormatCode)) {
    throw new Error(
      `Campo "format" inv�lido em: ${filePath}\n` +
      `Esperado: CNABFormatCode.CNAB240 ou CNABFormatCode.CNAB400\n` +
      `Recebido: "${obj.format}"`
    )
  }

  // Validar estrutura
  validateStructure(obj.structure as Record<string, unknown>, filePath)

  // Validar records
  validateRecords(obj.records as unknown[], filePath)

  // Validar totais
  validateTotals(obj.totals as Record<string, unknown>, filePath)

  // Validar header (se existir)
  if (obj.header !== undefined) {
    validateHeader(obj.header as Record<string, unknown>, filePath)
  }
}

/**
 * Valida campo obrigat�rio
 */
function validateRequiredField(
  obj: Record<string, unknown>,
  fieldName: string,
  expectedType: 'string' | 'number' | 'object' | 'array',
  filePath: string
): void {
  // Verificar se campo existe
  if (!(fieldName in obj) || obj[fieldName] === undefined || obj[fieldName] === null) {
    throw new Error(
      `Campo obrigat�rio ausente: "${fieldName}" em ${filePath}\n` +
      `Adicione o campo "${fieldName}" ao JSON de metadados.`
    )
  }

  // Verificar tipo
  const actualType = Array.isArray(obj[fieldName]) ? 'array' : typeof obj[fieldName]
  if (actualType !== expectedType) {
    throw new Error(
      `Tipo incorreto para campo "${fieldName}" em: ${filePath}\n` +
      `Esperado: ${expectedType}\n` +
      `Recebido: ${actualType}`
    )
  }
}

/**
 * Valida objeto structure
 */
function validateStructure(structure: Record<string, unknown>, filePath: string): void {
  validateRequiredField(structure, 'totalLines', 'number', filePath)
  validateRequiredField(structure, 'headerLines', 'number', filePath)
  validateRequiredField(structure, 'detailLines', 'number', filePath)
  validateRequiredField(structure, 'trailerLines', 'number', filePath)

  // Validar que s�o n�meros positivos
  const numbers = ['totalLines', 'headerLines', 'detailLines', 'trailerLines']
  for (const field of numbers) {
    const value = structure[field] as number
    if (value < 0 || !Number.isInteger(value)) {
      throw new Error(
        `Campo "structure.${field}" deve ser um inteiro n�o-negativo em: ${filePath}\n` +
        `Recebido: ${value}`
      )
    }
  }
}

/**
 * Valida array de records
 */
function validateRecords(records: unknown[], filePath: string): void {
  if (!Array.isArray(records)) {
    throw new Error(
      `Campo "records" deve ser um array em: ${filePath}\n` +
      `Recebido: ${typeof records}`
    )
  }

  if (records.length === 0) {
    throw new Error(
      `Campo "records" n�o pode ser vazio em: ${filePath}\n` +
      `Adicione pelo menos um registro ao array.`
    )
  }

  // Validar cada record
  records.forEach((record, index) => {
    if (!record || typeof record !== 'object') {
      throw new Error(
        `Record[${index}] inv�lido em: ${filePath}\n` +
        `Cada elemento de "records" deve ser um objeto.`
      )
    }

    const rec = record as Record<string, unknown>
    const recordPath = `${filePath} (records[${index}])`

    // Campos obrigat�rios do record
    validateRequiredField(rec, 'index', 'number', recordPath)
    validateRequiredField(rec, 'name', 'string', recordPath)
    validateRequiredField(rec, 'document', 'string', recordPath)
    validateRequiredField(rec, 'documentType', 'string', recordPath)
    validateRequiredField(rec, 'amount', 'number', recordPath)
    validateRequiredField(rec, 'dueDate', 'string', recordPath)

    // Validar documentType
    const validDocTypes: DocumentType[] = ['CPF', 'CNPJ']
    if (!validDocTypes.includes(rec.documentType as DocumentType)) {
      throw new Error(
        `Campo "documentType" inv�lido em: ${recordPath}\n` +
        `Esperado: "CPF" ou "CNPJ"\n` +
        `Recebido: "${rec.documentType}"`
      )
    }

    // Validar que amount � positivo
    if (typeof rec.amount === 'number' && rec.amount < 0) {
      throw new Error(
        `Campo "amount" deve ser n�o-negativo em: ${recordPath}\n` +
        `Recebido: ${rec.amount}`
      )
    }
  })
}

/**
 * Valida objeto totals
 */
function validateTotals(totals: Record<string, unknown>, filePath: string): void {
  validateRequiredField(totals, 'recordCount', 'number', filePath)
  validateRequiredField(totals, 'totalAmount', 'number', filePath)

  // Validar que s�o n�o-negativos
  if ((totals.recordCount as number) < 0) {
    throw new Error(
      `Campo "totals.recordCount" deve ser n�o-negativo em: ${filePath}\n` +
      `Recebido: ${totals.recordCount}`
    )
  }

  if ((totals.totalAmount as number) < 0) {
    throw new Error(
      `Campo "totals.totalAmount" deve ser n�o-negativo em: ${filePath}\n` +
      `Recebido: ${totals.totalAmount}`
    )
  }
}

/**
 * Valida objeto header (opcional)
 */
function validateHeader(header: Record<string, unknown>, filePath: string): void {
  // Header � opcional, mas se existir, validar tipos dos campos presentes
  if (header.cedenteNome !== undefined && typeof header.cedenteNome !== 'string') {
    throw new Error(
      `Campo "header.cedenteNome" deve ser string em: ${filePath}\n` +
      `Recebido: ${typeof header.cedenteNome}`
    )
  }

  if (header.dataGeracao !== undefined && typeof header.dataGeracao !== 'string') {
    throw new Error(
      `Campo "header.dataGeracao" deve ser string em: ${filePath}\n` +
      `Recebido: ${typeof header.dataGeracao}`
    )
  }

  if (header.dataGeracaoRaw !== undefined && typeof header.dataGeracaoRaw !== 'string') {
    throw new Error(
      `Campo "header.dataGeracaoRaw" deve ser string em: ${filePath}\n` +
      `Recebido: ${typeof header.dataGeracaoRaw}`
    )
  }

  if (header.tipoArquivo !== undefined && typeof header.tipoArquivo !== 'string') {
    throw new Error(
      `Campo "header.tipoArquivo" deve ser string em: ${filePath}\n` +
      `Recebido: ${typeof header.tipoArquivo}`
    )
  }
}
