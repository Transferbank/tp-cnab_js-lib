import { Cnab240BoletoNomeField } from '@cnab/field/cnab240/boleto-nome-field'

// Itau usa um range menor no CNAB240 (30 chars em vez de 40) para o nome do sacado no
// segmento Q - unico banco que diverge da base hoje.
export class Cnab240ItauBoletoNomeField extends Cnab240BoletoNomeField {
  readonly range: [number, number] = [34, 63]
}
