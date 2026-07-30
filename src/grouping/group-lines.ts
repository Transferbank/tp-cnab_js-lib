import type { ParsedLine, ParsedField } from '@tp-types/core'
import { CNABFormatCode } from '@tp-types/core'
import { Cnab240SegmentCode } from '@tp-types/cnab240-record-types'
import type {
  GroupingRule,
  BillGroup,
  GroupingError,
  GroupingResult,
  GroupingRecordType,
} from '@tp-types/processing/grouping'

/**
 * Busca campo por posição CNAB (não por nome, que varia entre bancos).
 * Ex: tipo_registro, codigo_registro, controle_registro todos na posição 1.
 */
function getFieldByPosition(line: ParsedLine, position: number): ParsedField | undefined {
  for (const field of Object.values(line)) {
    const fieldIsValid = field !== null && field !== undefined && typeof field === 'object'
    if (fieldIsValid) {
      const fieldWithPos = field as { pos?: [number, number] }
      if (Array.isArray(fieldWithPos.pos) && fieldWithPos.pos[0] === position) {
        return field as ParsedField
      }
    }
  }
  return undefined
}

/**
 * Identifica tipo de registro para agrupamento.
 * CNAB 400: posição 1 | CNAB 240: posição 14 (segmento) ou 8 (estruturais)
 */
function identifyRecordType(line: ParsedLine, format: CNABFormatCode): string {
  if (format === CNABFormatCode.CNAB400) {
    const recordTypeField = getFieldByPosition(line, 1)
    const hasRecordTypeField = recordTypeField !== null && recordTypeField !== undefined
    return hasRecordTypeField ? String(recordTypeField.value) : 'u'
  }
  
  const recordTypeField = getFieldByPosition(line, 8)
  const segmentField = getFieldByPosition(line, 14)
  
  const hasRecordTypeField = recordTypeField !== null && recordTypeField !== undefined
  if (hasRecordTypeField) {
    const recordType = String(recordTypeField.value)
    
    const hasSegmentField = segmentField !== null && segmentField !== undefined
    if (recordType === '3' && hasSegmentField) {
      const segment = String(segmentField.value)
      
      /**
       * Segmento Y: inclui sub-variante (pos 18, 2 dígitos).
       * Ex: Y01, Y04, Y50 (cada um com campos específicos).
       */
      if (segment === Cnab240SegmentCode.Y) {
        const subVariantField = getFieldByPosition(line, 18)
        const hasSubVariantField = subVariantField !== null && subVariantField !== undefined
        if (hasSubVariantField) {
          return `Y${subVariantField.value}`
        }
      }
      
      return segment
    }
    
    return recordType
  }
  
  return 'u'
}

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
  
  return 'structural'  // Unknown: trata como structural para não quebrar grouping
}

export function groupLines(
  lines: ParsedLine[],
  rule: GroupingRule,
  format: CNABFormatCode,
  fileStartLine: number = 2,
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
            field: 'Núcleo',
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
      if (expectedCoreIndex >= rule.mandatoryCore.length) {
        groups.push({
          core: currentCore,
          satellites: currentSatellites,
          startLine: groupStartLine,
        })
        
        currentCore = [line]
        currentSatellites = []
        groupStartLine = lineNumber
        expectedCoreIndex = 1
      } else {
        const expectedType = rule.mandatoryCore[expectedCoreIndex]
        
        if (type === expectedType) {
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
                field: 'Núcleo',
                message: `Núcleo incompleto: esperado ${rule.mandatoryCore.length} linha(s), encontrado ${currentCore.length}`,
              })
            }
            
            currentCore = []
            currentSatellites = []
            groupStartLine = lineNumber
          }
          
          if (expectedCoreIndex === 0) {
            groupStartLine = lineNumber
          }
          
          currentCore.push(line)
          expectedCoreIndex++
        } else {
          errors.push({
            line: lineNumber,
            field: 'Núcleo',
            message: `Esperado registro tipo '${expectedType}', encontrado '${type}'`,
          })
          
          if (type === rule.mandatoryCore[0]) {
            if (currentCore.length > 0) {
              errors.push({
                line: groupStartLine,
                field: 'Núcleo',
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
      if (currentCore.length === 0) {
        errors.push({
          line: lineNumber,
          field: 'Satélite',
          message: `Satélite órfã (tipo '${type}'): sem núcleo correspondente`,
        })
        continue
      }
      
      if (currentCore.length < rule.mandatoryCore.length) {
        errors.push({
          line: lineNumber,
          field: 'Satélite',
          message: `Satélite (tipo '${type}') antes do núcleo estar completo`,
        })
        errors.push({
          line: groupStartLine,
          field: 'Núcleo',
          message: `Núcleo abandonado: interrompido por satélite fora de ordem na linha ${lineNumber}`,
        })
        currentCore = []
        currentSatellites = []
        expectedCoreIndex = 0
        continue
      }
      
      currentSatellites.push(line)
    }
  }
  
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
        field: 'Núcleo',
        message: `Núcleo incompleto ao fim do arquivo: esperado ${rule.mandatoryCore.length} linha(s), encontrado ${currentCore.length}`,
      })
    }
  }
  
  return { groups, errors }
}



