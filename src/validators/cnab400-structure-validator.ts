/**
 * Validador estrutural para CNAB 400
 * 
 * Foca exclusivamente em estrutura/formato do documento:
 * - Tamanho de linha (400 caracteres)
 * - Tipos de registro válidos (header, detail, trailer)
 * - Posicionamento correto (header primeira linha, trailer última, detalhes no meio)
 * - Contagem de registros quando o banco define qtd_documentos no trailer
 * 
 * Estrutura linear: Header → Detalhes → Trailer (sem lotes/segmentos como no CNAB 240)
 * 
 * Não valida dados de negócio (valores, datas, documentos).
 */

import { BankSchema, ValidationError } from '../types'
import { getRecordTypePattern } from '../parser/field-extractor'

const LINE_LENGTH = 400

export interface Cnab400StructureResult {
  errors: ValidationError[]
  detailCount: number
}

/**
 * Valida a estrutura de um arquivo CNAB 400.
 * 
 * Verifica:
 * - Tamanho correto de todas as linhas (400 caracteres)
 * - Header na primeira linha
 * - Trailer na última linha
 * - Apenas registros de detalhe no meio
 * - Pelo menos 1 registro de detalhe
 * - Quantidade de registros declarada no trailer (quando o banco define esse campo)
 * 
 * @param lines - Linhas do arquivo (já separadas, sem linhas vazias)
 * @param bankSchema - Schema do banco (obrigatório)
 * @returns Erros estruturais encontrados e contagem de detalhes
 */
export function validateCnab400Structure(
  lines: string[],
  bankSchema: BankSchema
): Cnab400StructureResult {
  const errors: ValidationError[] = []
  let detailCount = 0

  // Guard inicial: arquivo deve ter no mínimo 3 linhas
  if (lines.length < 3) {
    errors.push({
      line: 1,
      column: 'Estrutura',
      message: 'Arquivo CNAB 400 deve ter no mínimo 3 registros (Header, Detalhe, Trailer)',
    })
    return { errors, detailCount }
  }

  // Guard: schemas obrigatórios devem estar definidos
  if (!bankSchema.header) {
    errors.push({
      line: 1,
      column: 'Schema',
      message: 'Schema do banco não define header para CNAB 400',
    })
    return { errors, detailCount }
  }

  if (!bankSchema.detail) {
    errors.push({
      line: 1,
      column: 'Schema',
      message: 'Schema do banco não define detail para CNAB 400',
    })
    return { errors, detailCount }
  }

  if (!bankSchema.trailer) {
    errors.push({
      line: 1,
      column: 'Schema',
      message: 'Schema do banco não define trailer para CNAB 400',
    })
    return { errors, detailCount }
  }

  // Ler tipos de registro do schema (com fallback para valores padrão)
  // Banco do Brasil usa '7' para detail, outros usam '1'
  // Lê pela posição (1 em CNAB 400), não pelo nome do campo (varia: tipo_registro, codigo_registro...)
  const headerType = String(getRecordTypePattern(bankSchema.header, 1) ?? '0')
  const detailType = String(getRecordTypePattern(bankSchema.detail, 1) ?? '1')
  const trailerType = String(getRecordTypePattern(bankSchema.trailer, 1) ?? '9')

  // Pré-computar lookup de registros opcionais (O(1) por linha)
  const optionalByIdentifier = new Map(
    (bankSchema.optionalRecords ?? []).map(r => [r.identifier, r])
  )

  // Validar cada linha
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // Checagem de tamanho
    if (line.length !== LINE_LENGTH) {
      errors.push({
        line: lineNumber,
        column: 'Tamanho do registro',
        message: `Esperado ${LINE_LENGTH} caracteres, encontrado ${line.length}`,
      })
      continue
    }

    // Tipo do registro (posição 1, charAt(0))
    const recordType = line.charAt(0)

    // Primeira linha deve ser Header
    if (i === 0) {
      if (recordType !== headerType) {
        errors.push({
          line: lineNumber,
          column: 'Header',
          message: `Primeira linha deve ser Header (tipo ${headerType}), encontrado tipo ${recordType}`,
        })
      }
      continue
    }

    // Última linha deve ser Trailer
    if (i === lines.length - 1) {
      if (recordType !== trailerType) {
        errors.push({
          line: lineNumber,
          column: 'Trailer',
          message: `Última linha deve ser Trailer (tipo ${trailerType}), encontrado tipo ${recordType}`,
        })
      }
      continue
    }

    // Linhas do meio devem ser registros de detalhe ou registros opcionais
    if (recordType === detailType) {
      detailCount++
    } else if (recordType === headerType) {
      errors.push({
        line: lineNumber,
        column: 'Header',
        message: 'Header encontrado no meio do arquivo (deve estar apenas na primeira linha)',
      })
    } else if (recordType === trailerType) {
      errors.push({
        line: lineNumber,
        column: 'Trailer',
        message: 'Trailer encontrado no meio do arquivo (deve estar apenas na última linha)',
      })
    } else {
      // Tentar casar com registro opcional antes de declarar erro
      // Ordem de tentativa:
      // 1. Chave composta com 2 dígitos de sufixo (ex: '5-99' do BB)
      // 2. Chave composta com 1 dígito de sufixo (ex: '6-1' do Itaú)
      // 3. Chave simples (ex: '2')
      const suffix2 = line.substring(1, 3) // Posições 2-3
      const suffix1 = line.substring(1, 2) // Posição 2
      
      const optionalRecord = 
        optionalByIdentifier.get(`${recordType}-${suffix2}`) ||
        optionalByIdentifier.get(`${recordType}-${suffix1}`) ||
        optionalByIdentifier.get(recordType)

      if (!optionalRecord) {
        // Não é um registro opcional reconhecido
        errors.push({
          line: lineNumber,
          column: 'Tipo de registro',
          message: `Tipo de registro '${recordType}' não corresponde a nenhum tipo reconhecido (Header=${headerType}, Detalhe=${detailType}, Trailer=${trailerType})`,
        })
      }
      // Se é um registro opcional reconhecido, não gera erro e não conta como detail
    }
  }

  // Deve ter pelo menos 1 detalhe
  if (detailCount === 0) {
    errors.push({
      line: 2,
      column: 'Detalhe',
      message: 'Arquivo deve conter pelo menos um registro de detalhe',
    })
  }

  // Validar quantidade de documentos no trailer (se o banco define esse campo)
  const trailerSchema = bankSchema.trailer
  if (trailerSchema.qtd_documentos && lines.length >= 3) {
    const trailerLine = lines[lines.length - 1]
    
    if (trailerLine.length === LINE_LENGTH) {
      // Ler o campo manualmente via posição
      const pos = trailerSchema.qtd_documentos.pos
      const startIdx = pos[0] - 1 // Converter de 1-indexed para 0-indexed
      const endIdx = pos[1] // pos[1] já é exclusivo em substring
      const rawValue = trailerLine.substring(startIdx, endIdx).trim()
      const declaredCount = parseInt(rawValue, 10) || 0

      if (declaredCount > 0 && declaredCount !== detailCount) {
        errors.push({
          line: lines.length,
          column: 'Quantidade no Trailer',
          message: `Trailer declara ${declaredCount} títulos, mas o arquivo contém ${detailCount}`,
        })
      }
    }
  }

  return { errors, detailCount }
}
