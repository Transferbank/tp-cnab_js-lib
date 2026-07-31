import { BankSchema, ValidationError, OptionalRecordSchema } from '@tp-types/index'
import { getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { getCnab240SegmentYVariant } from '@parser/cnab-positions'
import type { Cnab240RecordKind, Cnab240MandatoryRecordKey } from '@tp-types/cnab240-record-types'
import { Cnab240SegmentCode } from '@tp-types/cnab240-record-types'
import { buildOptionalMap } from './build-optional-map'

const LINE_LENGTH = 240

export interface Cnab240StructureResult {
  errors: ValidationError[]
  batchCount: number
  billCount: number
}

type MachineState =
  | 'aguardando_header_arquivo'
  | 'fora_de_lote'
  | 'dentro_lote_aguardando_boleto'
  | 'dentro_boleto_aguardando_q'
  | 'dentro_boleto_com_nucleo_completo'
  | 'pareamento_interrompido'
  | 'arquivo_fechado'

function identifyRecordKind(line: string): Cnab240RecordKind | 'desconhecido' {
  if (line.length !== LINE_LENGTH) {
    return 'desconhecido'
  }
  const recordType = getCnab240RecordType(line)

  switch (recordType) {
    case '0':
      return 'headerArquivo'
    case '1':
      return 'headerLote'
    case '5':
      return 'trailerLote'
    case '9':
      return 'trailerArquivo'
    case '3': {
      const segment = getCnab240SegmentCode(line)

      switch (segment) {
        case Cnab240SegmentCode.P:
          return 'segmentoP'
        case Cnab240SegmentCode.Q:
          return 'segmentoQ'
        case Cnab240SegmentCode.R:
          return { kind: 'optional', identifier: 'R' }
        case Cnab240SegmentCode.S:
          return { kind: 'optional', identifier: 'S' }
        case Cnab240SegmentCode.Y: {
          const variant = getCnab240SegmentYVariant(line)
          return { kind: 'optional', identifier: `Y${variant}` }
        }
        default:
          return 'desconhecido'
      }
    }
    default:
      return 'desconhecido'
  }
}

export function validateCnab240Structure(
  lines: string[],
  bankSchema: BankSchema,
  failFast = false
): Cnab240StructureResult {
  const errors: ValidationError[] = []
  let batchCount = 0
  let billCount = 0

  if (lines.length < 4) {
    errors.push({
      line: 1,
      field: 'Estrutura',
      message: 'Arquivo CNAB 240 deve ter no mínimo 4 registros (Header Arquivo, Header Lote, Detalhe, Trailer Lote, Trailer Arquivo)',
    })
    return { errors, batchCount, billCount }
  }

  const optionalByIdentifier = buildOptionalMap(bankSchema)

  let state: MachineState = 'aguardando_header_arquivo'
  let sawFileHeader = false
  let sawFileTrailer = false
  let batchOpen = false
  let billInProgress = false
  let pairingInterruption: { line: number; reason: string } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (line.length !== LINE_LENGTH) {
      errors.push({
        line: lineNumber,
        field: 'Tamanho do registro',
        message: `Esperado ${LINE_LENGTH} caracteres, encontrado ${line.length}`,
      })
      if (failFast) return { errors, batchCount, billCount }
      
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { line: lineNumber, reason: 'tamanho de linha incorreto' }
      }
      continue
    }

    const kind = identifyRecordKind(line)

    if (kind === 'desconhecido') {
      errors.push({
        line: lineNumber,
        field: 'Tipo de registro',
        message: 'Tipo de registro não reconhecido ou não suportado',
      })
      if (failFast) return { errors, batchCount, billCount }
      
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { line: lineNumber, reason: 'tipo de registro desconhecido' }
      }
      continue
    }

    const schemaError = validateRecordExistsInSchema(kind, lineNumber, bankSchema, optionalByIdentifier)
    if (schemaError) {
      errors.push(schemaError)
      if (failFast) return { errors, batchCount, billCount }
      
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { 
          line: lineNumber, 
          reason: typeof kind === 'string' ? `registro ${kind} não definido no schema do banco` : `segmento opcional ${kind.identifier} não definido no schema do banco`
        }
      }
      continue
    }

    if (typeof kind === 'object' && kind.kind === 'optional') {
      const optionalError = handleOptionalSegment(kind, lineNumber, state)
      if (optionalError) {
        errors.push(optionalError)
        if (failFast) return { errors, batchCount, billCount }
      }
      
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { line: lineNumber, reason: `segmento opcional ${kind.identifier} fora de ordem` }
      }
      continue
    }

    const transitionResult = processStateTransition(
      kind as Cnab240MandatoryRecordKey,
      lineNumber,
      lines.length,
      state,
      sawFileHeader,
      sawFileTrailer,
      batchOpen,
      billInProgress,
      pairingInterruption
    )

    errors.push(...transitionResult.errors)
    if (failFast && transitionResult.errors.length > 0) {
      return { errors, batchCount, billCount }
    }

    state = transitionResult.newState
    sawFileHeader = transitionResult.sawFileHeader
    sawFileTrailer = transitionResult.sawFileTrailer
    batchOpen = transitionResult.batchOpen
    billInProgress = transitionResult.billInProgress
    pairingInterruption = transitionResult.pairingInterruption
    batchCount += transitionResult.batchCount
    billCount += transitionResult.billCount
  }

  const finalErrors = validateFinalState(sawFileHeader, sawFileTrailer, lines.length)
  errors.push(...finalErrors)

  return { errors, batchCount, billCount }
}

function validateRecordExistsInSchema(
  kind: Cnab240RecordKind,
  lineNumber: number,
  bankSchema: BankSchema,
  optionalByIdentifier: Map<string, OptionalRecordSchema>
): ValidationError | null {
  if (typeof kind === 'string') {
    if (bankSchema[kind] == null) {
      return {
        line: lineNumber,
        field: 'Tipo de registro',
        message: `Registro ${kind} não está definido no schema do banco ${bankSchema.bankName}`,
      }
    }
  } else {
    const optionalRecord = optionalByIdentifier.get(kind.identifier)
    if (optionalRecord == null) {
      return {
        line: lineNumber,
        field: `Segmento ${kind.identifier}`,
        message: `Segmento ${kind.identifier} não está definido no schema do banco ${bankSchema.bankName}`,
      }
    }
  }
  return null
}

function handleOptionalSegment(
  kind: { kind: 'optional'; identifier: string },
  lineNumber: number,
  state: MachineState
): ValidationError | null {
  if (state !== 'dentro_boleto_com_nucleo_completo') {
    return {
      line: lineNumber,
      field: `Segmento ${kind.identifier}`,
      message: `Segmento opcional ${kind.identifier} sem par P+Q completo antes`,
    }
  }
  return null
}

function processStateTransition(
  kind: Cnab240MandatoryRecordKey,
  lineNumber: number,
  totalLines: number,
  state: MachineState,
  sawFileHeader: boolean,
  sawFileTrailer: boolean,
  batchOpen: boolean,
  billInProgress: boolean,
  pairingInterruption: { line: number; reason: string } | null
): {
  errors: ValidationError[]
  newState: MachineState
  sawFileHeader: boolean
  sawFileTrailer: boolean
  batchOpen: boolean
  billInProgress: boolean
  pairingInterruption: { line: number; reason: string } | null
  batchCount: number
  billCount: number
} {
  const errors: ValidationError[] = []
  let newState = state
  let newSawFileHeader = sawFileHeader
  let newSawFileTrailer = sawFileTrailer
  let newBatchOpen = batchOpen
  let newBillInProgress = billInProgress
  let newPairingInterruption = pairingInterruption
  let batchCount = 0
  let billCount = 0

  switch (kind) {
    case 'headerArquivo': {
      if (sawFileHeader) {
        errors.push({
          line: lineNumber,
          field: 'Header de Arquivo',
          message: 'Header de Arquivo duplicado',
        })
      }
      if (lineNumber !== 1) {
        errors.push({
          line: lineNumber,
          field: 'Header de Arquivo',
          message: 'Header de Arquivo deve ser a primeira linha',
        })
      }
      if (state === 'arquivo_fechado') {
        errors.push({
          line: lineNumber,
          field: 'Header de Arquivo',
          message: 'Header de Arquivo após Trailer de Arquivo',
        })
      }
      newSawFileHeader = true
      newState = 'fora_de_lote'
      newBatchOpen = false
      newBillInProgress = false
      break
    }

    case 'headerLote': {
      if (!sawFileHeader) {
        errors.push({
          line: lineNumber,
          field: 'Header de Lote',
          message: 'Header de Lote antes do Header de Arquivo',
        })
      }
      if (batchOpen) {
        errors.push({
          line: lineNumber,
          field: 'Header de Lote',
          message: 'Header de Lote sem Trailer de Lote correspondente do lote anterior',
        })
      }
      if (state === 'arquivo_fechado') {
        errors.push({
          line: lineNumber,
          field: 'Header de Lote',
          message: 'Header de Lote após Trailer de Arquivo',
        })
      }
      batchCount++
      newBatchOpen = true
      newBillInProgress = false
      newPairingInterruption = null
      newState = 'dentro_lote_aguardando_boleto'
      break
    }

    case 'segmentoP': {
      if (!batchOpen) {
        errors.push({
          line: lineNumber,
          field: 'Segmento P',
          message: 'Segmento P fora de lote',
        })
        break
      }
      if (billInProgress) {
        errors.push({
          line: lineNumber,
          field: 'Segmento P',
          message: 'Segmento P sem Segmento Q correspondente do título anterior',
        })
      }
      newBillInProgress = true
      newPairingInterruption = null
      newState = 'dentro_boleto_aguardando_q'
      break
    }

    case 'segmentoQ': {
      if (state !== 'dentro_boleto_aguardando_q') {
        const detail = pairingInterruption
          ? ` — pareamento interrompido na linha ${pairingInterruption.line} (${pairingInterruption.reason})`
          : ''
        errors.push({
          line: lineNumber,
          field: 'Segmento Q',
          message: `Segmento Q sem Segmento P correspondente${detail}`,
        })
      } else {
        billCount++
        newBillInProgress = false
        newState = 'dentro_boleto_com_nucleo_completo'
      }
      newPairingInterruption = null
      break
    }

    case 'trailerLote': {
      if (billInProgress) {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Lote',
          message: 'Trailer de Lote com Segmento P pendente (sem Segmento Q correspondente)',
        })
      }
      if (!batchOpen) {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Lote',
          message: 'Trailer de Lote sem Header de Lote correspondente',
        })
      }
      if (state === 'dentro_lote_aguardando_boleto') {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Lote',
          message: 'Lote sem nenhum título (nenhum par P+Q)',
        })
      }
      newBatchOpen = false
      newBillInProgress = false
      newState = 'fora_de_lote'
      break
    }

    case 'trailerArquivo': {
      if (sawFileTrailer) {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Arquivo',
          message: 'Trailer de Arquivo duplicado',
        })
      }
      if (lineNumber !== totalLines) {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Arquivo',
          message: 'Trailer de Arquivo deve ser a última linha',
        })
      }
      if (batchOpen) {
        errors.push({
          line: lineNumber,
          field: 'Trailer de Arquivo',
          message: 'Trailer de Arquivo com lote ainda aberto (falta Trailer de Lote)',
        })
      }
      newSawFileTrailer = true
      newState = 'arquivo_fechado'
      break
    }
  }

  return {
    errors,
    newState,
    sawFileHeader: newSawFileHeader,
    sawFileTrailer: newSawFileTrailer,
    batchOpen: newBatchOpen,
    billInProgress: newBillInProgress,
    pairingInterruption: newPairingInterruption,
    batchCount,
    billCount,
  }
}

function validateFinalState(
  sawFileHeader: boolean,
  sawFileTrailer: boolean,
  totalLines: number
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!sawFileHeader) {
    errors.push({
      line: 1,
      field: 'Estrutura',
      message: 'Arquivo sem Header de Arquivo',
    })
  }

  if (!sawFileTrailer) {
    errors.push({
      line: totalLines,
      field: 'Estrutura',
      message: 'Arquivo sem Trailer de Arquivo',
    })
  }

  return errors
}
