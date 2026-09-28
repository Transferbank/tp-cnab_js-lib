import { Cnab400BoletoBairroField } from '@cnab/field/cnab400/boleto-bairro-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// BB usa um registro de detalhe CNAB400 não-padrão começando com '7' em vez de '1'.
export class Cnab400BancoDoBrasilBoletoBairroField extends Cnab400BoletoBairroField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
