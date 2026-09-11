import { Cnab240BoletoNameField } from '@cnab/field/cnab240/boleto-name-field'

// Itau usa um range menor no CNAB240 (30 chars em vez de 40) para o nome do sacado no
// segmento Q - unico banco que diverge da base hoje.
export class Cnab240ItauBoletoNameField extends Cnab240BoletoNameField {
  readonly range: [number, number] = [34, 63]
}
