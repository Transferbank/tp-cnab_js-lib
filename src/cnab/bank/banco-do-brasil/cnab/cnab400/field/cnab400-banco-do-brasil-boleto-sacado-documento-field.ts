import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BancoDoBrasilBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
