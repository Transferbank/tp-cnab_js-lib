import { CnabFile400 } from '@/types/file/cnab400/cnab-file-400'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'

export class CnabFileBradesco400 extends CnabFile400<BoletoBradesco400> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[], lineOffset?: number) => BoletoBradesco400 {
    return BoletoBradesco400
  }

  protected validateHeader(): void {
    super.validateHeader()

    const header = this.rawLines[0]
    this.validateLiteral(header, 1, 2, '1', 'identificação do arquivo-remessa', 0)
    this.validateLiteral(header, 2, 9, 'REMESSA', 'literal remessa', 0)
    this.validateLiteral(header, 9, 11, '01', 'código de serviço', 0)
    this.validateLiteral(header, 11, 26, 'COBRANCA', 'literal serviço', 0)
    this.validateLiteral(header, 79, 94, 'BRADESCO', 'nome do banco por extenso', 0)
    this.validateLiteral(header, 394, 400, '000001', 'número sequencial do registro', 0)
  }

  protected validateTrailer(): void {
    super.validateTrailer()

    const trailer = this.rawLines[this.rawLines.length - 1]
    const blank = trailer.substring(1, 394).trim()
    if (blank.length > 0) {
      this.throwFileError('trailer: posições 2-394 devem estar em branco', this.rawLines.length - 1)
    }

    const sequencial = parseInt(trailer.substring(394, 400), 10)
    if (sequencial !== this.rawLines.length) {
      this.throwFileError(
        `trailer: sequencial de registro (${sequencial}) não bate com a quantidade real de linhas (${this.rawLines.length})`,
        this.rawLines.length - 1
      )
    }
  }
}
