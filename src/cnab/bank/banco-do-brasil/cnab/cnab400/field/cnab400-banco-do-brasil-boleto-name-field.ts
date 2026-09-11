import { Cnab400BoletoNameField } from '@cnab/field/cnab400-boleto-name-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BancoDoBrasilBoletoNameField extends Cnab400BoletoNameField {
  readonly range: [number, number] = [235, 271]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
