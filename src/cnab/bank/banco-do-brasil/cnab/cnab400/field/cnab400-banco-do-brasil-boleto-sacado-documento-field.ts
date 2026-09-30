import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'

// Registro de detalhe '7' em vez de '1'. "00"=Isento: título é registrado normalmente
// sem validar CPF/CNPJ.
export class Cnab400BancoDoBrasilBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  protected readonly recordType = '7'

  protected performValidation(): CnabValidationResult {
    if (this.extractRangeFromLine(218, 220) == '00') {
      return { isValid: true, errors: [] }
    }

    return super.performValidation()
  }
}
