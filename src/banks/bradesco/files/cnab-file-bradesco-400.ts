import { CnabFile400 } from '@/types/file/cnab400/cnab-file-400'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'

const HEADER_LITERALS: { start: number; end: number; expected: string; label: string }[] = [
  { start: 1, end: 2, expected: '1', label: 'identificação do arquivo-remessa' },
  { start: 2, end: 9, expected: 'REMESSA', label: 'literal remessa' },
  { start: 9, end: 11, expected: '01', label: 'código de serviço' },
  { start: 11, end: 26, expected: 'COBRANCA', label: 'literal serviço' },
  { start: 79, end: 94, expected: 'BRADESCO', label: 'nome do banco por extenso' },
  { start: 394, end: 400, expected: '000001', label: 'número sequencial do registro' },
]

export class CnabFileBradesco400 extends CnabFile400<BoletoBradesco400> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoBradesco400 {
    return BoletoBradesco400
  }

  protected validateHeader(): void {
    super.validateHeader()

    const header = this.rawLines[0]
    for (const { start, end, expected, label } of HEADER_LITERALS) {
      const actual = header.substring(start, end).trim()
      if (actual !== expected) {
        this.throwFileError(
          `header: ${label} deve ser '${expected}', encontrado '${actual}'`,
          0
        )
      }
    }
  }
}
