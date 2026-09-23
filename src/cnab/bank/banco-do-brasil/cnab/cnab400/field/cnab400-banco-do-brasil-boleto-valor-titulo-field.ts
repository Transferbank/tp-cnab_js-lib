import { Cnab400BoletoValorTituloField } from '@cnab/field/cnab400/boleto-valor-titulo-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa registro de detalhe nao-padrao no CNAB400: comeca com '7'
// em vez do '1' usado pelos outros bancos.
export class Cnab400BancoDoBrasilBoletoValorTituloField extends Cnab400BoletoValorTituloField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
