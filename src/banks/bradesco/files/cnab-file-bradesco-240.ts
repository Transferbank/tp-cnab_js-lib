import { CnabFile240 } from '@/types/file/cnab240/cnab-file-240'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'

export class CnabFileBradesco240 extends CnabFile240<BoletoBradesco240> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoBradesco240 {
    return BoletoBradesco240
  }
}
