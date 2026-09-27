import { Cnab400BoletoNomeField } from '@cnab/field/cnab400/boleto-nome-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa um range menor no CNAB400 (37 chars em vez de 40) para o nome
// do sacado, e um registro de detalhe nao-padrao comecando com '7' em vez de '1' -
// unico banco que diverge da base em ambos os pontos hoje.
export class Cnab400BancoDoBrasilBoletoNomeField extends Cnab400BoletoNomeField {
  readonly range: [number, number] = [235, 271]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }
}
