import { BankSchema, ValidationError } from '@tp-types/index'
import { getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { getCnab240SegmentYVariant } from '@parser/cnab-positions'

const LINE_LENGTH = 240

export interface Cnab240StructureResult {
  errors: ValidationError[]
  batchCount: number
  billCount: number
}

type Cnab240RecordKind =
  | 'headerArquivo'
  | 'headerLote'
  | 'trailerLote'
  | 'trailerArquivo'
  | 'segmentoP'
  | 'segmentoQ'
  | { kind: 'optional'; identifier: string }

type MachineState =
  | 'aguardando_header_arquivo'
  | 'fora_de_lote'
  | 'dentro_lote_aguardando_boleto'
  | 'dentro_boleto_aguardando_q'
  | 'dentro_boleto_com_nucleo_completo'
  | 'pareamento_interrompido'
  | 'arquivo_fechado'

/**
 * Identifica tipo de registro por posições FEBRABAN fixas.
 */
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
        case 'P':
          return 'segmentoP'
        case 'Q':
          return 'segmentoQ'
        case 'R':
          return { kind: 'optional', identifier: 'R' }
        case 'S':
          return { kind: 'optional', identifier: 'S' }
        case 'Y': {
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

/**
 * Valida a estrutura de um arquivo CNAB 240.
 * 
 * Verifica:
 * - Tamanho correto de todas as linhas (240 caracteres)
 * - Tipos de registro reconhecidos pelo schema do banco
 * - Sequência correta: Header Arquivo → Lotes → Trailer Arquivo
 * - Dentro de cada lote: pares P+Q obrigatórios, opcionais R/S/Y* após cada par
 * - Lotes fechados corretamente (Header Lote → Títulos → Trailer Lote)
 * 
 * @param lines - Linhas do arquivo (já separadas, sem linhas vazias)
 * @param bankSchema - Schema do banco (obrigatório - sem schema não há como validar)
 * @returns Erros estruturais encontrados e contagens de lotes/boletos
 */
export function validateCnab240Structure(
  lines: string[],
  bankSchema: BankSchema
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

  const optionalByIdentifier = new Map(
    (bankSchema.optionalRecords ?? []).map(r => [r.identifier, r])
  )

  let state: MachineState = 'aguardando_header_arquivo'
  let sawFileHeader = false
  let sawFileTrailer = false
  let batchOpen = false
  let billInProgress = false
  let pairingInterruption: { line: number; reason: string } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // Checagem de tamanho
    if (line.length !== LINE_LENGTH) {
      errors.push({
        line: lineNumber,
        field: 'Tamanho do registro',
        message: `Esperado ${LINE_LENGTH} caracteres, encontrado ${line.length}`,
      })
      // Modo estrito: se estava aguardando Q, interrompe o pareamento
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { line: lineNumber, reason: 'tamanho de linha incorreto' }
      }
      continue // Linha inválida não participa da máquina de estados
    }

    // Identificar tipo de registro
    const kind = identifyRecordKind(line)

    // Verificar se o tipo existe no schema do banco
    if (kind === 'desconhecido') {
      errors.push({
        line: lineNumber,
        field: 'Tipo de registro',
        message: 'Tipo de registro não reconhecido ou não suportado',
      })
      // Modo estrito: se estava aguardando Q, interrompe o pareamento
      if (state === 'dentro_boleto_aguardando_q') {
        state = 'pareamento_interrompido'
        pairingInterruption = { line: lineNumber, reason: 'tipo de registro desconhecido' }
      }
      continue // Não participa da máquina de estados
    }

    // Para registros obrigatórios, verificar se o schema do banco os define
    // Para registros opcionais, verificar no lookup
    if (typeof kind === 'string') {
      // Registro obrigatório (header, trailer, P, Q)
      if (!bankSchema[kind]) {
        errors.push({
          line: lineNumber,
          field: 'Tipo de registro',
          message: `Registro ${kind} não está definido no schema do banco ${bankSchema.bankName}`,
        })
        // Modo estrito: se estava aguardando Q, interrompe o pareamento
        if (state === 'dentro_boleto_aguardando_q') {
          state = 'pareamento_interrompido'
          pairingInterruption = { line: lineNumber, reason: `registro ${kind} não definido no schema do banco` }
        }
        continue // Não participa da máquina de estados
      }
    } else {
      // Registro opcional (R, S, Y*)
      const optionalRecord = optionalByIdentifier.get(kind.identifier)
      if (!optionalRecord) {
        errors.push({
          line: lineNumber,
          field: `Segmento ${kind.identifier}`,
          message: `Segmento ${kind.identifier} não está definido no schema do banco ${bankSchema.bankName}`,
        })
        // Modo estrito: se estava aguardando Q, interrompe o pareamento
        if (state === 'dentro_boleto_aguardando_q') {
          state = 'pareamento_interrompido'
          pairingInterruption = { line: lineNumber, reason: `segmento opcional ${kind.identifier} não definido no schema do banco` }
        }
        continue // Não participa da máquina de estados
      }
    }

    // Máquina de estados
    // Registros opcionais são tratados juntos (mesmo comportamento para todos)
    if (typeof kind === 'object' && kind.kind === 'optional') {
      // Registro opcional (R, S, Y*)
      if (state !== 'dentro_boleto_com_nucleo_completo') {
        errors.push({
          line: lineNumber,
          field: `Segmento ${kind.identifier}`,
          message: `Segmento opcional ${kind.identifier} sem par P+Q completo antes`,
        })
        // Modo estrito: se estava aguardando Q, registra a interrupção
        if (state === 'dentro_boleto_aguardando_q') {
          state = 'pareamento_interrompido'
          pairingInterruption = { line: lineNumber, reason: `segmento opcional ${kind.identifier} fora de ordem` }
        }
      }
      // Múltiplos segmentos opcionais em sequência são permitidos
      // Estado permanece 'dentro_boleto_com_nucleo_completo'
      continue
    }

    // Registros obrigatórios
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
        sawFileHeader = true
        state = 'fora_de_lote'
        batchOpen = false
        billInProgress = false
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
        batchOpen = true
        billInProgress = false
        pairingInterruption = null // Novo lote, estado limpo
        state = 'dentro_lote_aguardando_boleto'
        break
      }

      case 'segmentoP': {
        if (!batchOpen) {
          errors.push({
            line: lineNumber,
            field: 'Segmento P',
            message: 'Segmento P fora de lote',
          })
          // Não avançar o estado - tratar como ruído estrutural
          break
        }
        if (billInProgress) {
          errors.push({
            line: lineNumber,
            field: 'Segmento P',
            message: 'Segmento P sem Segmento Q correspondente do título anterior',
          })
        }
        billInProgress = true
        pairingInterruption = null // Novo P, estado limpo para novo pareamento
        state = 'dentro_boleto_aguardando_q'
        break
      }

      case 'segmentoQ': {
        // Modo estrito: distingue entre "nunca teve P" e "teve P mas pareamento foi interrompido"
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
          // Pareamento bem-sucedido
          billCount++
          billInProgress = false
          state = 'dentro_boleto_com_nucleo_completo'
        }
        pairingInterruption = null // Consumido, não vazar para próximo P/Q
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
        batchOpen = false
        billInProgress = false
        state = 'fora_de_lote'
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
        if (lineNumber !== lines.length) {
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
        sawFileTrailer = true
        state = 'arquivo_fechado'
        break
      }
    }
  }

  // Verificações finais após processar todas as linhas
  if (!sawFileHeader) {
    errors.push({
      line: 1,
      field: 'Estrutura',
      message: 'Arquivo sem Header de Arquivo',
    })
  }

  if (!sawFileTrailer) {
    errors.push({
      line: lines.length,
      field: 'Estrutura',
      message: 'Arquivo sem Trailer de Arquivo',
    })
  }

  return { errors, batchCount, billCount }
}
