import { Cnab400BoletoVencimentoField } from '@cnab/field/cnab400/boleto-vencimento-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa registro de detalhe nao-padrao no CNAB400: comeca com '7'
// em vez do '1' usado pelos outros bancos.
export class Cnab400BancoDoBrasilBoletoVencimentoField extends Cnab400BoletoVencimentoField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
