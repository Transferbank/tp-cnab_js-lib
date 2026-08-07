import { detectFormat, detectBank } from '@/parser/format-detector'
import { getBoletoClass } from '@/registry/boleto-registry'
import { CnabDocumentBradesco400 } from '@/banks/bradesco/documents/cnab-document-bradesco-400'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'
import { CnabDocument } from '@/types/document/cnab-document'

export function openCnabDocument(rawLines: string[]): CnabDocument {
  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const BoletoClass = getBoletoClass(bankCode, format)

  // Por enquanto, retorna apenas CnabDocumentBradesco400 (única combinação implementada)
  return new CnabDocumentBradesco400(
    rawLines,
    BoletoClass as new (lines: string[]) => BoletoBradesco400
  )
}
