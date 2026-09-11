import { Cnab400BoletoValorTituloField } from '@cnab/field/cnab400-boleto-valor-titulo-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa um registro de detalhe CNAB400 nao-padrao (comeca com '7' em vez
// de '1') - unico banco que diverge da base hoje, e diverge no shouldValidate, nao no
// range.
export class Cnab400BancoDoBrasilBoletoValorTituloField extends Cnab400BoletoValorTituloField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
