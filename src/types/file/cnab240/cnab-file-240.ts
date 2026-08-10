import { CnabFile, BoletoRange } from '../cnab-file'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import { GroupingRule } from '@/types/processing/grouping'
import { getGroupingRule } from '@/grouping/grouping-rules'
import {
  getCnab240RecordType,
  getCnab240SegmentCode
} from '@/parser/position-reader'
import { getCnab240SegmentYVariant } from '@/parser/cnab-positions'
import { Cnab240SegmentCode } from '@/types/cnab240-record-types'

interface GroupingState {
  insideLote: boolean
  currentRange: BoletoRange | null
  coreComplete: boolean
}

export abstract class CnabFile240<
  TBoleto extends CnabBoleto = CnabBoleto
> extends CnabFile<TBoleto> {
  get type(): CNABFormatCode {
    return CNABFormatCode.CNAB240
  }

  protected abstract get bankCode(): string

  private validateStructuralLine(
    line: string,
    lineNumber: number,
    expectedType: string,
    label: string
  ): void {
    if (line.length !== 240) {
      this.throwFileError(
        `${label} deve ter 240 caracteres, tem ${line.length}`,
        lineNumber
      )
    }
    const recordType = getCnab240RecordType(line)
    if (recordType !== expectedType) {
      this.throwFileError(
        `${label} deve ser tipo '${expectedType}', encontrado '${recordType}'`,
        lineNumber
      )
    }
  }

  protected validateHeader(): void {
    if (this.rawLines.length < 2) {
      this.throwFileError('arquivo deve ter pelo menos header e trailer')
    }
    this.validateStructuralLine(this.rawLines[0], 0, '0', 'header de arquivo')
  }

  protected validateTrailer(): void {
    const lastIndex = this.rawLines.length - 1
    this.validateStructuralLine(
      this.rawLines[lastIndex],
      lastIndex,
      '9',
      'trailer de arquivo'
    )
  }

  protected groupBoletos(): BoletoRange[] {
    const rule = getGroupingRule(this.bankCode, CNABFormatCode.CNAB240)
    const ranges: BoletoRange[] = []
    const state: GroupingState = {
      insideLote: false,
      currentRange: null,
      coreComplete: false
    }

    for (let i = 1; i < this.rawLines.length - 1; i++) {
      this.processBodyLine(this.rawLines[i], i, rule, state, ranges)
    }

    if (state.insideLote) {
      this.recordFileError('arquivo termina com lote aberto (sem trailer de lote)')
      if (state.currentRange != null && state.coreComplete) {
        ranges.push(state.currentRange)
      }
    }

    return ranges
  }

  private processBodyLine(
    line: string,
    index: number,
    rule: GroupingRule,
    state: GroupingState,
    ranges: BoletoRange[]
  ): void {
    const recordType = getCnab240RecordType(line)

    if (recordType === '1') {
      this.handleLoteHeader(index, state)
      return
    }

    if (recordType === '5') {
      this.handleLoteTrailer(index, state, ranges)
      return
    }

    if (recordType !== '3') {
      this.throwFileError(
        `tipo de registro '${recordType}' não reconhecido no corpo do arquivo`,
        index
      )
    }

    if (!state.insideLote) {
      this.throwFileError('segmento fora de um lote', index)
    }

    const segmentType = this.resolveSegmentType(line)
    this.handleSegment(segmentType, index, rule, state, ranges)
  }

  private handleLoteHeader(index: number, state: GroupingState): void {
    if (state.insideLote) {
      this.throwFileError(
        'header de lote dentro de outro lote (sem trailer de lote anterior)',
        index
      )
    }
    state.insideLote = true
  }

  private handleLoteTrailer(
    index: number,
    state: GroupingState,
    ranges: BoletoRange[]
  ): void {
    if (!state.insideLote) {
      this.throwFileError(
        'trailer de lote sem header de lote correspondente',
        index
      )
    }
    if (state.currentRange != null && !state.coreComplete) {
      this.recordFileError(
        'boleto incompleto (núcleo P+Q) antes do trailer de lote',
        index
      )
      state.currentRange = null
      state.coreComplete = false
    }
    if (state.currentRange != null) {
      ranges.push(state.currentRange)
      state.currentRange = null
      state.coreComplete = false
    }
    state.insideLote = false
  }

  private resolveSegmentType(line: string): string {
    const segmentCode = getCnab240SegmentCode(line)
    return segmentCode === Cnab240SegmentCode.Y
      ? `Y${getCnab240SegmentYVariant(line)}`
      : segmentCode
  }

  private handleSegment(
    type: string,
    index: number,
    rule: GroupingRule,
    state: GroupingState,
    ranges: BoletoRange[]
  ): void {
    const [coreType, secondCoreType] = rule.mandatoryCore

    if (type === coreType) {
      this.handleCoreStart(index, state, ranges)
    } else if (type === secondCoreType) {
      this.handleCoreComplete(index, state)
    } else if (rule.optionalSatellites.includes(type)) {
      this.handleSatellite(type, index, state)
    } else {
      this.recordFileError(
        `segmento '${type}' não reconhecido para este banco`,
        index
      )
    }
  }

  private handleCoreStart(
    index: number,
    state: GroupingState,
    ranges: BoletoRange[]
  ): void {
    if (state.currentRange != null && !state.coreComplete) {
      this.recordFileError('segmento P sem segmento Q do boleto anterior', index)
    } else if (state.currentRange != null && state.coreComplete) {
      ranges.push(state.currentRange)
    }
    state.currentRange = { startLine: index, endLine: index + 1 }
    state.coreComplete = false
  }

  private handleCoreComplete(index: number, state: GroupingState): void {
    if (state.currentRange == null || state.coreComplete) {
      this.recordFileError('segmento Q sem segmento P correspondente', index)
      return
    }
    state.currentRange.endLine = index + 1
    state.coreComplete = true
  }

  private handleSatellite(
    type: string,
    index: number,
    state: GroupingState
  ): void {
    if (state.currentRange == null || !state.coreComplete) {
      this.recordFileError(
        `satélite '${type}' antes do núcleo P+Q estar completo`,
        index
      )
      return
    }
    state.currentRange.endLine = index + 1
  }
}
