import { Cnab400BoletoEmailField } from '@cnab/field/cnab400/boleto-email-field'

// No Banco do Brasil CNAB400, o e-mail do pagador fica no registro 5 com 
// tipo de serviço '01' (envio de boleto por e-mail), e não no registro 3 
// como na Caixa.
export class Cnab400BancoDoBrasilBoletoEmailField extends Cnab400BoletoEmailField {
  protected readonly recordType: string = '5'
  protected readonly serviceType: string = '01'
  readonly range: [number, number] = [4, 139]

  protected parseValue(rawValue: string): string[] {
    return rawValue
      .split(';')
      .filter((email: string) => email.length > 0)
  }
}
