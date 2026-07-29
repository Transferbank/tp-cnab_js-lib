/**
 * Types para o sistema de metadados de fixtures CNAB
 * 
 * Este módulo define as estruturas de dados para metadados JSON que documentam
 * e validam arquivos fixture CNAB de teste.
 * 
 * O sistema é genérico e funciona para:
 * - Qualquer banco (Bradesco, Santander, Itaú, Caixa, etc)
 * - CNAB 240 e CNAB 400
 * - Qualquer tipo de arquivo (remessa, retorno, múltiplos lotes)
 */

import type { CNABFormatCode } from '../core'

/**
 * Tipo de documento do pagador/sacado
 */
export type DocumentType = 'CPF' | 'CNPJ'

/**
 * Metadados completos de um arquivo fixture CNAB
 */
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

/**
 * Estrutura de linhas do arquivo
 * 
 * Para CNAB 240: totalLines = headerLines + detailLines + trailerLines
 * Para CNAB 400: estrutura similar mas com formato diferente
 */
export interface FixtureStructure {
  totalLines: number
  headerLines: number
  detailLines: number
  trailerLines: number
  batchCount?: number
  messageLines?: number
}

/**
 * Dados do header de arquivo
 */
export interface FixtureHeader {
  cedenteNome?: string
  dataGeracao?: string
  dataGeracaoRaw?: string // Formato raw do arquivo (ex: DDMMAA ou DDMMAAAA)
  tipoArquivo?: string
  codigoCliente?: string
  numeroInscricaoCedente?: string
  sequencialRemessa?: string
  versaoSistema?: string
}

/**
 * Representa um título/registro no arquivo CNAB
 * 
 * Contém os dados principais extraídos do arquivo CNAB, nos formatos
 * que a aplicação realmente usa (valores convertidos, datas formatadas).
 */
export interface FixtureRecord {
  index: number
  name: string
  
  // Documento do pagador/sacado
  document: string
  documentRaw?: string // Formato raw do arquivo (com zeros à esquerda)
  documentType: DocumentType
  documentTypeCode?: string // Código do tipo (ex: "01" = CPF, "02" = CNPJ)
  
  // Valor do título (em reais)
  amount: number
  amountRaw?: string // Formato raw do arquivo (string numérica sem decimais)
  
  // Data de vencimento (DD/MM/AAAA)
  dueDate: string
  dueDateRaw?: string // Formato raw do arquivo (ex: DDMMAA ou DDMMAAAA)
  
  // Endereço
  address?: string
  city?: string
  state?: string
  zipCode?: string

  // Identificadores do título
  nossoNumero?: string // Identificador único do título no banco
  numeroDocumento?: string // "Seu número"/número do documento na empresa

  // Campos específicos de alguns bancos
  instrucao?: string // Código de instrução/ocorrência (ex: Sicredi)
  especie?: string // Código de espécie do título (ex: Sicredi)
}

/**
 * Totalizadores para validação de integridade
 * 
 * Permite validar que soma dos valores e quantidade de registros
 * batem com o esperado
 */
export interface FixtureTotals {
  /** Quantidade de registros/títulos */
  recordCount: number

  /** Soma total dos valores (em reais) */
  totalAmount: number
}
