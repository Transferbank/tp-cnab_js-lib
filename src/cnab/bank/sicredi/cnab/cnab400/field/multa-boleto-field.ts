import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB400
  protected readonly codigoRange: [number, number] = [20, 20]
  protected readonly percentualRange: [number, number] = [93, 96]
  protected readonly valorMonetarioRange: [number, number] = [97, 108]
  readonly range: [number, number] = this.isValorMonetario() ? this.valorMonetarioRange : this.percentualRange

  private isValorMonetario(): boolean {
    return this.extractRangeFromLine(this.codigoRange[0] - 1, this.codigoRange[1]) == 'A'
  }
}
