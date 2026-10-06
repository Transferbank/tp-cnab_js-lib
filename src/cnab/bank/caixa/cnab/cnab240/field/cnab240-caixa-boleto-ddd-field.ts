import { Cnab240BoletoDddField } from '@cnab/field/cnab240/boleto-ddd-field'

export class Cnab240CaixaBoletoDddField extends Cnab240BoletoDddField {
  protected readonly optionalRecordCode: string = '04'
}
