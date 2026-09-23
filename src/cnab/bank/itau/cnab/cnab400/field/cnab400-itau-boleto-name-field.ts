import { Cnab400BoletoNameField } from '@cnab/field/cnab400/boleto-name-field'

// Itau usa um range menor no CNAB400 (30 chars em vez de 40) para o nome do sacado -
// unico banco, junto com o Banco do Brasil, que diverge da base hoje.
export class Cnab400ItauBoletoNameField extends Cnab400BoletoNameField {
  readonly range: [number, number] = [235, 264]
}
