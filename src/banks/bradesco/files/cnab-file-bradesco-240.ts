import { CnabFile240 } from '@/types/file/cnab240/cnab-file-240'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'

export class CnabFileBradesco240 extends CnabFile240<BoletoBradesco240> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[], lineOffset?: number) => BoletoBradesco240 {
    return BoletoBradesco240
  }

  protected validateHeader(): void {
    super.validateHeader()

    const header = this.rawLines[0]
    this.validateLiteral(header, 0, 3, '237', 'código do banco', 0)
    this.validateLiteral(header, 3, 7, '0000', 'controle de lote (header de arquivo)', 0)
    this.validateLiteral(header, 142, 143, '1', 'código do arquivo (remessa)', 0)
    this.validateLiteral(header, 163, 166, '084', 'versão do layout', 0)
  }

  protected validateTrailer(): void {
    super.validateTrailer()

    const trailerIndex = this.rawLines.length - 1
    const trailer = this.rawLines[trailerIndex]
    this.validateLiteral(trailer, 0, 3, '237', 'código do banco', trailerIndex)
    this.validateLiteral(trailer, 3, 7, '9999', 'controle de lote (trailer de arquivo)', trailerIndex)
  }
}
