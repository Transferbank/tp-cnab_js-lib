import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'

export type BoletoConstructor = new (lines: string[]) => CnabBoleto

const BOLETO_CLASS_REGISTRY: Partial<
  Record<CNABFormatCode, Record<string, BoletoConstructor>>
> = {
  [CNABFormatCode.CNAB400]: {
    [BANK_CODES.BRADESCO]: BoletoBradesco400,
  },
}

export function getBoletoClass(
  bankCode: string,
  format: CNABFormatCode
): BoletoConstructor {
  const boletoClass = BOLETO_CLASS_REGISTRY[format]?.[bankCode]
  
  if (boletoClass == null) {
    throw new CNABDocumentValidationError(
      `combinação banco '${bankCode}' + formato '${format}' ainda não suportada`
    )
  }
  
  return boletoClass
}
