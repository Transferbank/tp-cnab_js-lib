import { Cnab400BoletoNameField } from '@cnab/field/cnab400-boleto-name-field'

export class Cnab400ItauBoletoNameField extends Cnab400BoletoNameField {
  readonly range: [number, number] = [235, 264]
}
