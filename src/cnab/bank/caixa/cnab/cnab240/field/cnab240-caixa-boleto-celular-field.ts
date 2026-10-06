import { Cnab240BoletoCelularField } from '@cnab/field/cnab240/boleto-celular-field'

export class Cnab240CaixaBoletoCelularField extends Cnab240BoletoCelularField {
  protected readonly optionalRecordCode: string = '04'
}
