

import * as fs from 'fs'
import * as path from 'path'
import { FixtureMetadata, DocumentType } from '@tp-types/testing'
import { CNABFormatCode } from '@tp-types/index'


export function loadFixtureMetadata(
  bankName: string,
  fixtureName: string,
  format: CNABFormatCode.CNAB240 | CNABFormatCode.CNAB400 = CNABFormatCode.CNAB240,
  baseDir: string = path.join(__dirname, '../../banks')
): FixtureMetadata {
  const jsonPath = path.join(
    baseDir,
    bankName,
    'docs',
    format,
    `${fixtureName}.json`
  )

  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `Arquivo de metadados não encontrado: ${jsonPath}\n` +
      `Certifique-se de que o arquivo JSON existe no mesmo diretório do fixture TXT.`
    )
  }

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
      `JSON inválido no arquivo: ${jsonPath}\n` +
      `Detalhes: ${error instanceof Error ? error.message : String(error)}\n` +
      `Verifique a sintaxe do JSON (vírgulas, chaves, aspas).`
    )
  }

  validateMetadataSchema(data, jsonPath)
  return data as FixtureMetadata
}

/**
 * Valida que objeto JSON tem todos os campos obrigatórios
 */
function validateMetadataSchema(data: unknown, filePath: string): asserts data is FixtureMetadata {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    const receivedType = Array.isArray(data) ? 'array' : typeof data
    throw new Error(
      `Metadados inválidos em: ${filePath}\n` +
      `Esperado: objeto JSON\n` +
      `Recebido: ${receivedType}`
    )
  }

  const obj = data as Record<string, unknown>

  validateRequiredField(obj, 'description', 'string', filePath)
  validateRequiredField(obj, 'bankCode', 'string', filePath)
  validateRequiredField(obj, 'bankName', 'string', filePath)
  validateRequiredField(obj, 'format', 'string', filePath)
  validateRequiredField(obj, 'structure', 'object', filePath)
  validateRequiredField(obj, 'records', 'array', filePath)
  validateRequiredField(obj, 'totals', 'object', filePath)

  const validFormats = [CNABFormatCode.CNAB240, CNABFormatCode.CNAB400]
  if (!validFormats.includes(obj.format as CNABFormatCode)) {
    throw new Error(
      `Campo "format" inválido em: ${filePath}\n` +
      `Esperado: CNABFormatCode.CNAB240 ou CNABFormatCode.CNAB400\n` +
      `Recebido: "${obj.format}"`
    )
  }

  validateStructure(obj.structure as Record<string, unknown>, filePath)
  validateRecords(obj.records as unknown[], filePath)
  validateTotals(obj.totals as Record<string, unknown>, filePath)

  if (obj.header !== undefined) {
    validateHeader(obj.header as Record<string, unknown>, filePath)
  }
}

function validateRequiredField(
  obj: Record<string, unknown>,
  fieldName: string,
  expectedType: 'string' | 'number' | 'object' | 'array',
  filePath: string
): void {
  if (!(fieldName in obj) || obj[fieldName] == null) {
    throw new Error(
      `Campo obrigatório ausente: "${fieldName}" em ${filePath}\n` +
      `Adicione o campo "${fieldName}" ao JSON de metadados.`
    )
  }

  const actualType = Array.isArray(obj[fieldName]) ? 'array' : typeof obj[fieldName]
  if (actualType !== expectedType) {
    throw new Error(
      `Tipo incorreto para campo "${fieldName}" em: ${filePath}\n` +
      `Esperado: ${expectedType}\n` +
      `Recebido: ${actualType}`
    )
  }
}

function validateStructure(structure: Record<string, unknown>, filePath: string): void {
  validateRequiredField(structure, 'totalLines', 'number', filePath)
  validateRequiredField(structure, 'headerLines', 'number', filePath)
  validateRequiredField(structure, 'detailLines', 'number', filePath)
  validateRequiredField(structure, 'trailerLines', 'number', filePath)

  const numbers = ['totalLines', 'headerLines', 'detailLines', 'trailerLines']
  for (const field of numbers) {
    const value = structure[field] as number
    if (value < 0 || !Number.isInteger(value)) {
      throw new Error(
        `Campo "structure.${field}" deve ser um inteiro não-negativo em: ${filePath}\n` +
        `Recebido: ${value}`
      )
    }
  }
}


function validateRecords(records: unknown[], filePath: string): void {
  if (!Array.isArray(records)) {
    throw new Error(
      `Campo "records" deve ser um array em: ${filePath}\n` +
      `Recebido: ${typeof records}`
    )
  }

  if (records.length === 0) {
    throw new Error(
      `Campo "records" não pode ser vazio em: ${filePath}\n` +
      `Adicione pelo menos um registro ao array.`
    )
  }

  records.forEach((record, index) => {
    if (!record || typeof record !== 'object') {
      throw new Error(
        `Record[${index}] inválido em: ${filePath}\n` +
        `Cada elemento de "records" deve ser um objeto.`
      )
    }

    const rec = record as Record<string, unknown>
    const recordPath = `${filePath} (records[${index}])`

    // Campos obrigatórios do record
    validateRequiredField(rec, 'index', 'number', recordPath)
    validateRequiredField(rec, 'name', 'string', recordPath)
    validateRequiredField(rec, 'document', 'string', recordPath)
    validateRequiredField(rec, 'documentType', 'string', recordPath)
    validateRequiredField(rec, 'amount', 'number', recordPath)
    validateRequiredField(rec, 'dueDate', 'string', recordPath)

    const validDocTypes: DocumentType[] = ['CPF', 'CNPJ']
    if (!validDocTypes.includes(rec.documentType as DocumentType)) {
      throw new Error(
        `Campo "documentType" inválido em: ${recordPath}\n` +
        `Esperado: "CPF" ou "CNPJ"\n` +
        `Recebido: "${rec.documentType}"`
      )
    }

    if (typeof rec.amount === 'number' && rec.amount < 0) {
      throw new Error(
        `Campo "amount" deve ser não-negativo em: ${recordPath}\n` +
        `Recebido: ${rec.amount}`
      )
    }
  })
}

function validateTotals(totals: Record<string, unknown>, filePath: string): void {
  validateRequiredField(totals, 'recordCount', 'number', filePath)
  validateRequiredField(totals, 'totalAmount', 'number', filePath)

  if ((totals.recordCount as number) < 0) {
    throw new Error(
      `Campo "totals.recordCount" deve ser não-negativo em: ${filePath}\n` +
      `Recebido: ${totals.recordCount}`
    )
  }

  if ((totals.totalAmount as number) < 0) {
    throw new Error(
      `Campo "totals.totalAmount" deve ser não-negativo em: ${filePath}\n` +
      `Recebido: ${totals.totalAmount}`
    )
  }
}

function validateHeader(header: Record<string, unknown>, filePath: string): void {
  // Header é opcional, mas se existir, validar tipos dos campos presentes
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
