import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240BoletoEnderecoField } from '@cnab/field/cnab240/boleto-endereco-field'

// Nota do manual: obrigatório "principalmente naqueles casos em que o Banco quem faz
// a distribuição dos bloquetos" - nos demais casos pode vir em branco.
export class Cnab240BancoDoBrasilBoletoEnderecoField extends Cnab240BoletoEnderecoField {
  static readonly isOptional = true

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }
}
