import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { DescontosBoletoField } from '@cnab/field/cnab240/descontos-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DescontosAdicionaisBoletoField extends DescontosBoletoField {
  protected readonly descontos: CnabDescontoRanges[] = [
    { codigo: [18, 18], data: [19, 26], valor: [27, 41] },
    { codigo: [42, 42], data: [43, 50], valor: [51, 65] }
  ]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(this.rawLine)
  }
}
