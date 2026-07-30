import { BankSchema, ValidationError } from '@tp-types/index'
import { getRecordTypePattern } from '@parser/field-extractor'
import { getCnab400RecordType } from '@parser/position-reader'
import { getCnab400OptionalSuffix1, getCnab400OptionalSuffix2 } from '@parser/cnab-positions'

const LINE_LENGTH = 400

export interface Cnab400StructureResult {
  errors: ValidationError[]
  detailCount: number
}

export function validateCnab400Structure(
  lines: string[],
  bankSchema: BankSchema,
  failFast = false
): Cnab400StructureResult {
  const errors: ValidationError[] = []
  let detailCount = 0

  if (lines.length < 3) {
    errors.push({
      line: 1,
      field: 'Estrutura',
      message: 'Arquivo CNAB 400 deve ter no mínimo 3 registros (Header, Detalhe, Trailer)',
    })
    return { errors, detailCount }
  }

  const schemaErrors = validateRequiredSchemas(bankSchema)
  if (schemaErrors.length > 0) {
    return { errors: schemaErrors, detailCount }
  }

  // Banco do Brasil usa '7' para detail, outros usam '1'
  const headerType = String(getRecordTypePattern(bankSchema.header!, 1) ?? '0')
  const detailType = String(getRecordTypePattern(bankSchema.detail!, 1) ?? '1')
  const trailerType = String(getRecordTypePattern(bankSchema.trailer!, 1) ?? '9')

  const optionalByIdentifier = new Map(
    (bankSchema.optionalRecords ?? []).map(r => [r.identifier, r])
  )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (line.length !== LINE_LENGTH) {
      errors.push({
        line: lineNumber,
        field: 'Tamanho do registro',
        message: `Esperado ${LINE_LENGTH} caracteres, encontrado ${line.length}`,
      })
      if (failFast) return { errors, detailCount }
      continue
    }

    const recordType = getCnab400RecordType(line)

    if (i === 0) {
      const headerError = validateHeaderPosition(recordType, headerType, lineNumber)
      if (headerError) {
        errors.push(headerError)
        if (failFast) return { errors, detailCount }
      }
      continue
    }

    if (i === lines.length - 1) {
      const trailerError = validateTrailerPosition(recordType, trailerType, lineNumber)
      if (trailerError) {
        errors.push(trailerError)
        if (failFast) return { errors, detailCount }
      }
      continue
    }

    const lineResult = validateMiddleLine(
      line,
      recordType,
      lineNumber,
      headerType,
      detailType,
      trailerType,
      optionalByIdentifier
    )

    if (lineResult.error) {
      errors.push(lineResult.error)
      if (failFast) return { errors, detailCount }
    }

    if (lineResult.isDetail) {
      detailCount++
    }
  }

  const finalErrors = validateFinalConstraints(detailCount, bankSchema, lines)
  errors.push(...finalErrors)

  return { errors, detailCount }
}

function validateRequiredSchemas(bankSchema: BankSchema): ValidationError[] {
  const errors: ValidationError[] = []

  if (!bankSchema.header) {
    errors.push({
      line: 1,
      field: 'Schema',
      message: 'Schema do banco não define header para CNAB 400',
    })
  }

  if (!bankSchema.detail) {
    errors.push({
      line: 1,
      field: 'Schema',
      message: 'Schema do banco não define detail para CNAB 400',
    })
  }

  if (!bankSchema.trailer) {
    errors.push({
      line: 1,
      field: 'Schema',
      message: 'Schema do banco não define trailer para CNAB 400',
    })
  }

  return errors
}

function validateHeaderPosition(
  recordType: string,
  expectedHeaderType: string,
  lineNumber: number
): ValidationError | null {
  if (recordType !== expectedHeaderType) {
    return {
      line: lineNumber,
      field: 'Header',
      message: `Primeira linha deve ser Header (tipo ${expectedHeaderType}), encontrado tipo ${recordType}`,
    }
  }
  return null
}

function validateTrailerPosition(
  recordType: string,
  expectedTrailerType: string,
  lineNumber: number
): ValidationError | null {
  if (recordType !== expectedTrailerType) {
    return {
      line: lineNumber,
      field: 'Trailer',
      message: `Última linha deve ser Trailer (tipo ${expectedTrailerType}), encontrado tipo ${recordType}`,
    }
  }
  return null
}

function validateMiddleLine(
  line: string,
  recordType: string,
  lineNumber: number,
  headerType: string,
  detailType: string,
  trailerType: string,
  optionalByIdentifier: Map<string, any>
): { error: ValidationError | null; isDetail: boolean } {
  if (recordType === detailType) {
    return { error: null, isDetail: true }
  }

  if (recordType === headerType) {
    return {
      error: {
        line: lineNumber,
        field: 'Header',
        message: 'Header encontrado no meio do arquivo (deve estar apenas na primeira linha)',
      },
      isDetail: false,
    }
  }

  if (recordType === trailerType) {
    return {
      error: {
        line: lineNumber,
        field: 'Trailer',
        message: 'Trailer encontrado no meio do arquivo (deve estar apenas na última linha)',
      },
      isDetail: false,
    }
  }

  const suffix2 = getCnab400OptionalSuffix2(line)
  const suffix1 = getCnab400OptionalSuffix1(line)

  // Ordem de tentativa: '5-99' (BB), '6-1' (Itaú), '2' (simples)
  const optionalRecord =
    optionalByIdentifier.get(`${recordType}-${suffix2}`) ||
    optionalByIdentifier.get(`${recordType}-${suffix1}`) ||
    optionalByIdentifier.get(recordType)

  const hasOptionalRecord = optionalRecord !== null && optionalRecord !== undefined
  if (!hasOptionalRecord) {
    return {
      error: {
        line: lineNumber,
        field: 'Tipo de registro',
        message: `Tipo de registro '${recordType}' não corresponde a nenhum tipo reconhecido (Header=${headerType}, Detalhe=${detailType}, Trailer=${trailerType})`,
      },
      isDetail: false,
    }
  }

  return { error: null, isDetail: false }
}

function validateFinalConstraints(
  detailCount: number,
  bankSchema: BankSchema,
  lines: string[]
): ValidationError[] {
  const errors: ValidationError[] = []

  if (detailCount === 0) {
    errors.push({
      line: 2,
      field: 'Detalhe',
      message: 'Arquivo deve conter pelo menos um registro de detalhe',
    })
  }

  const trailerSchema = bankSchema.trailer
  if (trailerSchema?.qtd_documentos && lines.length >= 3) {
    const trailerLine = lines[lines.length - 1]

    if (trailerLine.length === LINE_LENGTH) {
      const pos = trailerSchema.qtd_documentos.pos
      const startIdx = pos[0] - 1
      const endIdx = pos[1]
      const rawValue = trailerLine.substring(startIdx, endIdx).trim()

      if (rawValue !== '') {
        const declaredCount = parseInt(rawValue, 10)

        if (Number.isNaN(declaredCount)) {
          errors.push({
            line: lines.length,
            field: 'Quantidade no Trailer',
            message: `Campo de quantidade no Trailer contém valor não numérico: "${rawValue}"`,
          })
        } else if (declaredCount > 0 && declaredCount !== detailCount) {
          errors.push({
            line: lines.length,
            field: 'Quantidade no Trailer',
            message: `Trailer declara ${declaredCount} títulos, mas o arquivo contém ${detailCount}`,
          })
        }
      }
    }
  }

  return errors
}
