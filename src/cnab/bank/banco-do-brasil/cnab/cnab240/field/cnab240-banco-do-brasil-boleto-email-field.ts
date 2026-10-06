import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoEmailField extends Cnab240BoletoEmailField {
  readonly range: [number, number] = [21, 160]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoS(this.rawLine, '8')
  }

  protected parseValue(rawValue: string): string[] {
    return rawValue
      .split(';')
      .filter((email: string) => email.length > 0)
  }
}
