import { Cnab400BoletoNomeField } from '@cnab/field/cnab400/boleto-nome-field'

// Itau usa um range menor no CNAB400 (30 chars em vez de 40) para o nome do sacado -
// unico banco, junto com o Banco do Brasil, que diverge da base hoje.
export class Cnab400ItauBoletoNomeField extends Cnab400BoletoNomeField {
  readonly range: [number, number] = [235, 264]
}
