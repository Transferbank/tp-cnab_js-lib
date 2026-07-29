/**
 * Tipos e helpers compartilhados para testes do Bradesco
 */

import * as fs from 'fs'
import * as path from 'path'

export interface FixtureHeader {
  cedenteNome?: string
  dataGeracao?: string
  dataGeracaoRaw?: string
  tipoArquivo?: string
}

export interface FixtureRecord {
  index: number
  name: string
  document: string
  documentRaw?: string
  documentType: string
  documentTypeCode?: string
  amount: number
  amountRaw?: string
  dueDate: string
  dueDateRaw?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface FixtureStructure {
  totalLines: number
  headerLines?: number
  detailLines?: number
  trailerLines?: number
  batchCount?: number
}

export interface FixtureTotals {
  recordCount: number
  totalAmount: number
}

export interface FixtureMetadata {
  description?: string
  bankCode?: string
  bankName?: string
  format?: string
  header?: FixtureHeader
  records: FixtureRecord[]
  structure?: FixtureStructure
  totals?: FixtureTotals
}

/**
 * Carrega metadados do fixture CNAB400 do Bradesco
 */
export function loadCnab400Metadata(): FixtureMetadata {
  const jsonPath = path.join(__dirname, '../__fixtures__/cnab400/remessa-multipla.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf8')
  return JSON.parse(jsonContent)
}

/**
 * Carrega metadados do fixture CNAB240 do Bradesco
 */
export function loadCnab240Metadata(): FixtureMetadata {
  const jsonPath = path.join(__dirname, '../__fixtures__/cnab240/remessa-multipla.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf8')
  return JSON.parse(jsonContent)
}
