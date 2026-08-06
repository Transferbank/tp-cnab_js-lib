import { CnabDocument400 } from '@/types/document/cnab-document-400'
import { BANK_CODES } from '@/types/bank/bank-codes'

export class CnabDocumentBradesco400 extends CnabDocument400 {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }
}
