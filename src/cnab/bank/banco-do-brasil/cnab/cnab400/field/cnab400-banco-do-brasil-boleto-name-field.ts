import { Cnab400BoletoNameField } from '@cnab/field/cnab400/boleto-name-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa registro de detalhe nao-padrao no CNAB400: comeca com '7'
// em vez do '1' usado pelos outros bancos.
export class Cnab400BancoDoBrasilBoletoNameField extends Cnab400BoletoNameField {
  readonly range: [number, number] = [235, 271]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
