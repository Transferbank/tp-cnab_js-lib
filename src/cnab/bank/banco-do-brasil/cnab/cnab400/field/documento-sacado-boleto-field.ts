import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { DocumentoSacadoBoletoField } from '@cnab/field/cnab400/documento-sacado-boleto-field'

// Registro de detalhe '7' em vez de '1'. "00"=Isento: título é registrado normalmente
// sem validar CPF/CNPJ.
export class Cnab400BancoDoBrasilBoletoSacadoDocumentoField extends DocumentoSacadoBoletoField {
  protected readonly recordType = '7'

  protected performValidation(): CnabValidationResult {
    if (this.extractRangeFromLine(218, 220) == '00') {
      return { isValid: true, errors: [] }
    }

    return super.performValidation()
  }
}
