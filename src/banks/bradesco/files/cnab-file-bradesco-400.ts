import { CnabFile400 } from '@/types/file/cnab400/cnab-file-400'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'

export class CnabFileBradesco400 extends CnabFile400<BoletoBradesco400> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoBradesco400 {
    return BoletoBradesco400
  }
}
