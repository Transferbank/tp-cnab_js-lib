import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'

export class Cnab240CaixaBoletoEmailField extends Cnab240BoletoEmailField {
  protected readonly optionalRecordCode: string = '04'
}
