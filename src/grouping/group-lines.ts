/**
 * Agrupamento de linhas CNAB em boletos (núcleo + satélites).
 * 
 * Responsável por identificar quais linhas físicas do arquivo formam cada boleto lógico,
 * separando núcleos obrigatórios de satélites opcionais conforme regra do banco.
 */

import type { ParsedLine, ParsedField } from '../types/core'
import type {
  GroupingRule,
  BillGroup,
  GroupingError,
  GroupingResult,
  GroupingRecordType,
} from '../types/processing/grouping'

/**
 * Encontra, num ParsedLine, o campo cujo `pos[0]` bate com a posição dada —
 * não pelo nome do campo, que varia por banco (tipo_registro, codigo_registro,
 * controle_registro...). Mesmo princípio de getRecordTypePattern, aplicado a
 * dado já parseado em vez de definição de schema.
 */
function getFieldByPosition(line: ParsedLine, position: number): ParsedField | undefined {
  for (const field of Object.values(line)) {
    if (field && typeof field === 'object' && Array.isArray((field as any).pos)) {
      const pos = (field as any).pos
      if (pos[0] === position) {
        return field as ParsedField
      }
    }
  }
  return undefined
}

/**
 * Identifies the record type of a line for grouping purposes.
 * 
 * CNAB 400: uses position 1 (tipo_registro/codigo_registro/etc)
 * CNAB 240: uses position 14 (segmento) for details, position 8 (tipo_registro) for structural records
 * 
 * Corrigido: lê por posição, não por lista fixa de nomes de campo — nomes variam por banco.
 * 
 * @param line Parsed line
 * @param format 'CNAB240' or 'CNAB400'
 * @returns Record type identifier (e.g., '1', 'P', 'Q', '0', '9')
 */
function identifyRecordType(line: ParsedLine, format: 'CNAB240' | 'CNAB400'): string {
  if (format === 'CNAB400') {
    // CNAB 400: tipo de registro na posição 1
    const recordTypeField = getFieldByPosition(line, 1)
    return recordTypeField ? String(recordTypeField.value) : 'u'
  }
  
  // CNAB 240: tipo de registro na posição 8, segmento na posição 14
  const recordTypeField = getFieldByPosition(line, 8)
  const segmentField = getFieldByPosition(line, 14)
  
  if (recordTypeField) {
    const recordType = String(recordTypeField.value)
    
    if (recordType === '3' && segmentField) {
      const segment = String(segmentField.value)
      
      // For segment Y, include sub-variant (posição 18, 2 dígitos)
      if (segment === 'Y') {
        const subVariantField = getFieldByPosition(line, 18)
        if (subVariantField) {
          return `Y${subVariantField.value}`
        }
      }
      
      return segment
    }
    
    return recordType
  }
  
  return 'u' // unknown
}

/**
 * Classifies a record type according to grouping rules.
 */
function classifyRecordType(
  type: string,
  rule: GroupingRule,
): GroupingRecordType {
  if (rule.structural.includes(type)) {
    return 'structural'
  }
  
  if (rule.mandatoryCore.includes(type)) {
    return 'core'
  }
  
  if (rule.optionalSatellites.includes(type)) {
    return 'satellite'
  }
  
  // Unknown type: treat as structural to avoid breaking grouping
  return 'structural'
}

/**
 * Groups file body lines into bills.
 */
export function groupLines(
  lines: ParsedLine[],
  rule: GroupingRule,
  format: 'CNAB240' | 'CNAB400',
  fileStartLine: number = 2, // assume header na linha 1
): GroupingResult {
  const groups: BillGroup[] = []
  const errors: GroupingError[] = []
  
  let currentCore: ParsedLine[] = []
  let currentSatellites: ParsedLine[] = []
  let groupStartLine: number = fileStartLine
  let expectedCoreIndex = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = fileStartLine + i
    const type = identifyRecordType(line, format)
    const classification = classifyRecordType(type, rule)
    
    if (classification === 'structural') {
      // Batch header/trailer: finalize current bill if exists
      if (currentCore.length > 0) {
        if (currentCore.length === rule.mandatoryCore.length) {
          groups.push({
            core: currentCore,
            satellites: currentSatellites,
            startLine: groupStartLine,
          })
        } else {
          errors.push({
            line: groupStartLine,
            column: 'Núcleo',
            message: `Núcleo incompleto: esperado ${rule.mandatoryCore.length} linha(s), encontrado ${currentCore.length}`,
          })
        }
        
        currentCore = []
        currentSatellites = []
        expectedCoreIndex = 0
      }
      
      continue
    }
    
    if (classification === 'core') {
      // Check if core is already complete
      if (expectedCoreIndex >= rule.mandatoryCore.length) {
        // Core complete, this is the start of a new bill
        // Finalize previous bill
        groups.push({
          core: currentCore,
          satellites: currentSatellites,
          startLine: groupStartLine,
        })
        
        // Start new bill
        currentCore = [line]
        currentSatellites = []
        groupStartLine = lineNumber
        expectedCoreIndex = 1
      } else {
        // Check if it's the expected next core type
        const expectedType = rule.mandatoryCore[expectedCoreIndex]
        
        if (type === expectedType) {
          // First core record: finalize previous bill if exists
          if (expectedCoreIndex === 0 && currentCore.length > 0) {
            if (currentCore.length === rule.mandatoryCore.length) {
              groups.push({
                core: currentCore,
                satellites: currentSatellites,
                startLine: groupStartLine,
              })
            } else {
              errors.push({
                line: groupStartLine,
                column: 'Núcleo',
                message: `Núcleo incompleto: esperado ${rule.mandatoryCore.length} linha(s), encontrado ${currentCore.length}`,
              })
            }
            
            currentCore = []
            currentSatellites = []
            groupStartLine = lineNumber
          }
          
          // Add to current core
          if (expectedCoreIndex === 0) {
            groupStartLine = lineNumber
          }
          
          currentCore.push(line)
          expectedCoreIndex++
        } else {
          // Core type out of order
          errors.push({
            line: lineNumber,
            column: 'Núcleo',
            message: `Esperado registro tipo '${expectedType}', encontrado '${type}'`,
          })
          
          // Reset and start new bill if it's the first of the core
          if (type === rule.mandatoryCore[0]) {
            if (currentCore.length > 0) {
              errors.push({
                line: groupStartLine,
                column: 'Núcleo',
                message: `Núcleo incompleto abandonado devido a novo núcleo`,
              })
            }
            
            currentCore = [line]
            currentSatellites = []
            expectedCoreIndex = 1
            groupStartLine = lineNumber
          }
        }
      }
    } else if (classification === 'satellite') {
      // Satellite without core before
      if (currentCore.length === 0) {
        errors.push({
          line: lineNumber,
          column: 'Satélite',
          message: `Satélite órfã (tipo '${type}'): sem núcleo correspondente`,
        })
        continue
      }
      
      // Satellite before core is complete
      if (currentCore.length < rule.mandatoryCore.length) {
        errors.push({
          line: lineNumber,
          column: 'Satélite',
          message: `Satélite (tipo '${type}') antes do núcleo estar completo`,
        })
        // Strict mode: out-of-order satellite invalidates in-progress core
        errors.push({
          line: groupStartLine,
          column: 'Núcleo',
          message: `Núcleo abandonado: interrompido por satélite fora de ordem na linha ${lineNumber}`,
        })
        currentCore = []
        currentSatellites = []
        expectedCoreIndex = 0
        continue
      }
      
      // Add satellite to current bill
      currentSatellites.push(line)
    }
  }
  
  // Finalize last bill if exists
  if (currentCore.length > 0) {
    if (currentCore.length === rule.mandatoryCore.length) {
      groups.push({
        core: currentCore,
        satellites: currentSatellites,
        startLine: groupStartLine,
      })
    } else {
      errors.push({
        line: groupStartLine,
        column: 'Núcleo',
        message: `Núcleo incompleto ao fim do arquivo: esperado ${rule.mandatoryCore.length} linha(s), encontrado ${currentCore.length}`,
      })
    }
  }
  
  return { groups, errors }
}



