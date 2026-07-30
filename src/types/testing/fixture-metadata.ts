/**
 * Types para o sistema de metadados de fixtures CNAB
 * 
 * Define estruturas de dados para metadados JSON que documentam e validam
 * arquivos fixture CNAB de teste. Funciona para qualquer banco, CNAB 240/400,
 * e qualquer tipo de arquivo (remessa, retorno, múltiplos lotes).
 */

import type { CNABFormatCode } from '../core'

export type DocumentType = 'CPF' | 'CNPJ'

export interface FixtureMetadata {
  description: string
  bankCode: string
  bankName: string
  format: CNABFormatCode
  structure: FixtureStructure
  header?: FixtureHeader
  records: FixtureRecord[]
  totals: FixtureTotals
}

export interface FixtureStructure {
  totalLines: number
  headerLines: number
  detailLines: number
  trailerLines: number
  batchCount?: number
  messageLines?: number
}

export interface FixtureHeader {
  cedenteNome?: string
  dataGeracao?: string
  dataGeracaoRaw?: string
  tipoArquivo?: string
  codigoCliente?: string
  numeroInscricaoCedente?: string
  sequencialRemessa?: string
  versaoSistema?: string
}

/**
 * Representa um título/registro no arquivo CNAB
 * 
 * Campos com sufixo "Raw" contêm o formato original do arquivo
 * (ex: amountRaw é string numérica sem decimais, dueDateRaw é DDMMAA).
 */
export interface FixtureRecord {
  index: number
  name: string
  
  document: string
  documentRaw?: string
  documentType: DocumentType
  documentTypeCode?: string
  
  amount: number
  amountRaw?: string
  
  dueDate: string
  dueDateRaw?: string
  
  address?: string
  city?: string
  state?: string
  zipCode?: string

  nossoNumero?: string
  numeroDocumento?: string

  instrucao?: string
  especie?: string
}

export interface FixtureTotals {
  recordCount: number
  totalAmount: number
}
