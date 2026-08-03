/**
 * Validador de integridade entre arquivo CNAB e metadados JSON
 * 
 * Este módulo fornece funções para comparar o conteúdo do arquivo TXT
 * com os metadados JSON, detectando inconsistências automaticamente.
 */

import { FixtureMetadata } from '@tp-types/testing'
import { BankSchema } from '@tp-types/bank'
import { validateCnab240Content } from '@validators/cnab240-content-validator'
import { validateCnab400Content } from '@validators/cnab400-content-validator'
import { extractLineFields } from '@parser/field-extractor'
import { getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { CNABFormatCode, Cnab240RecordType, Cnab240SegmentCode } from '@tp-types/index'

/**
 * Erro de validação de integridade
 */
export interface IntegrityError {
  /** Tipo do erro */
  type: 'line-count' | 'record-count' | 'field-mismatch' | 'total-mismatch' | 'bank-code'
  
  /** Mensagem descritiva */
  message: string
  
  /** Campo afetado (se aplicável) */
  field?: string
  
  /** Valor esperado (do JSON) */
  expected?: unknown
  
  /** Valor encontrado (no TXT) */
  actual?: unknown
  
  /** Índice do registro (se aplicável) */
  recordIndex?: number
}

/**
 * Valida que arquivo TXT corresponde aos metadados JSON
 * 
 * Compara estrutura, código do banco, quantidade de registros,
 * valores dos títulos e totalizadores.
 * 
 * @param lines - Linhas do arquivo CNAB já parseadas
 * @param metadata - Metadados carregados do JSON
 * @param schema - Schema do banco para parsing
 * @returns Array de erros (vazio se tudo OK)
 * 
 * @example
 * ```typescript
 * const lines = readFixture('remessa-multipla.txt')
 * const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')
 * const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
 * 
 * if (errors.length > 0) {
 *   console.error('Inconsistências encontradas:', errors)
 * }
 * ```
 */
export function validateFixtureIntegrity(
  lines: string[],
  metadata: FixtureMetadata,
  schema: BankSchema
): IntegrityError[] {
  const errors: IntegrityError[] = []

  // 1. Validar tamanho de linha baseado no formato
  const expectedLineLength = metadata.format === CNABFormatCode.CNAB240 ? 240 : 400
  lines.forEach((line, index) => {
    if (line.length !== expectedLineLength) {
      errors.push({
        type: 'line-count',
        message: `Linha ${index + 1} tem tamanho incorreto`,
        field: 'lineLength',
        expected: expectedLineLength,
        actual: line.length
      })
    }
  })

  // 2. Validar total de linhas
  if (lines.length !== metadata.structure.totalLines) {
    errors.push({
      type: 'line-count',
      message: `Número de linhas não corresponde aos metadados`,
      field: 'totalLines',
      expected: metadata.structure.totalLines,
      actual: lines.length
    })
    // Se total de linhas está errado, outros erros serão cascata - retornar cedo
    return errors
  }

  // 3. Validar código do banco no header
  if (schema.headerArquivo && lines.length > 0) {
    const header = extractLineFields(lines[0], schema.headerArquivo)
    const bankCodeFromFile = header.controle_banco?.raw || header.controle_banco?.value

    if (bankCodeFromFile !== metadata.bankCode) {
      errors.push({
        type: 'bank-code',
        message: `Código do banco no arquivo não corresponde aos metadados`,
        field: 'bankCode',
        expected: metadata.bankCode,
        actual: bankCodeFromFile
      })
    }
  }

  // 4. Validar código do banco usando validator apropriado
  const result =
    metadata.format === CNABFormatCode.CNAB240 ? validateCnab240Content(lines, schema) : validateCnab400Content(lines, schema)

  // Se há erros de parsing, reportar mas continuar validação. Vencimento no passado é uma
  // regra de negócio esperada em arquivo real anonimizado (não um problema de parsing/schema),
  // então não conta como falha de integridade aqui  quem trata isso é outra camada.
  const parsingErrors = result.errors.filter(
    (error) => !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual'))
  )
  if (parsingErrors.length > 0) {
    parsingErrors.forEach(error => {
      errors.push({
        type: 'field-mismatch',
        message: `Erro ao processar arquivo (linha ${error.line}, ${error.field}): ${error.message}`,
        field: 'parsing'
      })
    })
  }

  // 5. Validar quantidade de registros
  if (result.records.length !== metadata.records.length) {
    errors.push({
      type: 'record-count',
      message: `Quantidade de registros não corresponde aos metadados`,
      field: 'recordCount',
      expected: metadata.records.length,
      actual: result.records.length
    })
    // Se quantidade difere, não faz sentido validar campos individuais
    return errors
  }

  // 6. Validar dados de cada registro
  metadata.records.forEach((expectedRecord, index) => {
    const actualRecord = result.records[index]

    // Validar valor (amount)
    if (actualRecord.amount !== expectedRecord.amount) {
      errors.push({
        type: 'field-mismatch',
        message: `Valor do título ${index} não corresponde`,
        field: 'amount',
        expected: expectedRecord.amount,
        actual: actualRecord.amount,
        recordIndex: index
      })
    }

    // Validar documento
    if (actualRecord.document !== expectedRecord.document) {
      errors.push({
        type: 'field-mismatch',
        message: `Documento do título ${index} não corresponde`,
        field: 'document',
        expected: expectedRecord.document,
        actual: actualRecord.document,
        recordIndex: index
      })
    }

    // Validar nome (deve conter o nome esperado)
    if (!actualRecord.name.includes(expectedRecord.name)) {
      errors.push({
        type: 'field-mismatch',
        message: `Nome do título ${index} não contém o esperado`,
        field: 'name',
        expected: expectedRecord.name,
        actual: actualRecord.name,
        recordIndex: index
      })
    }

    // Validar data de vencimento
    if (actualRecord.dueDate !== expectedRecord.dueDate) {
      errors.push({
        type: 'field-mismatch',
        message: `Data de vencimento do título ${index} não corresponde`,
        field: 'dueDate',
        expected: expectedRecord.dueDate,
        actual: actualRecord.dueDate,
        recordIndex: index
      })
    }

    // Validar endereço (se existir nos metadados)
    if (expectedRecord.address && actualRecord.address) {
      if (!actualRecord.address.includes(expectedRecord.address)) {
        errors.push({
          type: 'field-mismatch',
          message: `Endereço do título ${index} não contém o esperado`,
          field: 'address',
          expected: expectedRecord.address,
          actual: actualRecord.address,
          recordIndex: index
        })
      }
    }
  })

  // 7. Validar totalizadores
  if (result.records.length !== metadata.totals.recordCount) {
    errors.push({
      type: 'total-mismatch',
      message: `Total de registros não corresponde ao declarado em totals`,
      field: 'totals.recordCount',
      expected: metadata.totals.recordCount,
      actual: result.records.length
    })
  }

  const actualTotalAmount = result.records.reduce((sum, r) => sum + r.amount, 0)
  // Comparar com tolerância de 0.01 para evitar problemas de ponto flutuante
  if (Math.abs(actualTotalAmount - metadata.totals.totalAmount) > 0.01) {
    errors.push({
      type: 'total-mismatch',
      message: `Soma dos valores não corresponde ao total declarado`,
      field: 'totals.totalAmount',
      expected: metadata.totals.totalAmount,
      actual: actualTotalAmount
    })
  }

  // 8. Validar campos raw (se existirem)
  if (metadata.format === CNABFormatCode.CNAB240 && schema.segmentoP && schema.segmentoQ) {
    // Localiza as linhas de Segmento P/Q pelo conteúdo (pos 8 = '3', pos 14 = 'P'/'Q'),
    // não por índice fixo  o arquivo pode ter Header de Lote e Segmentos R/S entre os
    // títulos (ex.: fixtures com estrutura completa por título: P, Q, R, S).
    const segPLines = lines.filter((line) => line.length === 240 && getCnab240RecordType(line) === Cnab240RecordType.DETALHE && getCnab240SegmentCode(line) === Cnab240SegmentCode.P)
    const segQLines = lines.filter((line) => line.length === 240 && getCnab240RecordType(line) === Cnab240RecordType.DETALHE && getCnab240SegmentCode(line) === Cnab240SegmentCode.Q)

    metadata.records.forEach((expectedRecord, index) => {
      if (index < segPLines.length && schema.segmentoP) {
        const segP = extractLineFields(segPLines[index], schema.segmentoP)

        // Validar amountRaw
        if (expectedRecord.amountRaw && segP.valor_titulo?.raw !== expectedRecord.amountRaw) {
          errors.push({
            type: 'field-mismatch',
            message: `Valor raw do título ${index} não corresponde`,
            field: 'amountRaw',
            expected: expectedRecord.amountRaw,
            actual: segP.valor_titulo?.raw,
            recordIndex: index
          })
        }

        // Validar dueDateRaw
        if (expectedRecord.dueDateRaw && segP.vencimento_titulo?.raw !== expectedRecord.dueDateRaw) {
          errors.push({
            type: 'field-mismatch',
            message: `Data de vencimento raw do título ${index} não corresponde`,
            field: 'dueDateRaw',
            expected: expectedRecord.dueDateRaw,
            actual: segP.vencimento_titulo?.raw,
            recordIndex: index
          })
        }
      }

      if (index < segQLines.length && schema.segmentoQ) {
        const segQ = extractLineFields(segQLines[index], schema.segmentoQ)

        // Validar documentRaw
        if (expectedRecord.documentRaw && segQ.sacado_inscricao_numero?.raw !== expectedRecord.documentRaw) {
          errors.push({
            type: 'field-mismatch',
            message: `Documento raw do título ${index} não corresponde`,
            field: 'documentRaw',
            expected: expectedRecord.documentRaw,
            actual: segQ.sacado_inscricao_numero?.raw,
            recordIndex: index
          })
        }

        // Validar documentTypeCode
        if (expectedRecord.documentTypeCode && segQ.sacado_inscricao_tipo?.raw !== expectedRecord.documentTypeCode) {
          errors.push({
            type: 'field-mismatch',
            message: `Tipo de documento raw do título ${index} não corresponde`,
            field: 'documentTypeCode',
            expected: expectedRecord.documentTypeCode,
            actual: segQ.sacado_inscricao_tipo?.raw,
            recordIndex: index
          })
        }
      }
    })
  }

  // 9. Validar header (se existir nos metadados)
  if (metadata.header && schema.headerArquivo && lines.length > 0) {
    const header = extractLineFields(lines[0], schema.headerArquivo)

    // Validar dataGeracaoRaw
    if (metadata.header.dataGeracaoRaw && header.arquivo_data_de_geracao?.raw !== metadata.header.dataGeracaoRaw) {
      errors.push({
        type: 'field-mismatch',
        message: `Data de geração raw no header não corresponde`,
        field: 'header.dataGeracaoRaw',
        expected: metadata.header.dataGeracaoRaw,
        actual: header.arquivo_data_de_geracao?.raw
      })
    }

    // Validar cedenteNome (deve conter)
    if (metadata.header.cedenteNome && header.cedente_nome?.value) {
      const cedenteValue = String(header.cedente_nome.value)
      if (!cedenteValue.includes(metadata.header.cedenteNome)) {
        errors.push({
          type: 'field-mismatch',
          message: `Nome do cedente no header não contém o esperado`,
          field: 'header.cedenteNome',
          expected: metadata.header.cedenteNome,
          actual: cedenteValue
        })
      }
    }
  }

  return errors
}
