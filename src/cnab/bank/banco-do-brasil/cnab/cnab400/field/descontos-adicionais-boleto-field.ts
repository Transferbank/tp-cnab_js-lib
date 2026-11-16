import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { DescontosAdicionaisBoletoField as Cnab400DescontosAdicionaisBoletoField } from '@cnab/field/cnab400/descontos-adicionais-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DescontosAdicionaisBoletoField extends Cnab400DescontosAdicionaisBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '5'
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [4, 9], valor: [10, 26] },
    { data: [27, 32], valor: [33, 49] }
  ]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, this.recordType, '07')
  }
}
