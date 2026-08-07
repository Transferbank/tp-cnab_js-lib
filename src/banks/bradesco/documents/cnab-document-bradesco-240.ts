import { CnabDocument240 } from '@/types/document/cnab240/cnab-document-240'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'

export class CnabDocumentBradesco240 extends CnabDocument240<BoletoBradesco240> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoBradesco240 {
    return BoletoBradesco240
  }
}
