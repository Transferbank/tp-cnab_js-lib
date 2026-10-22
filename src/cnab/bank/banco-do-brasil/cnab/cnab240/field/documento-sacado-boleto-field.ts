import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import { DocumentoSacadoBoletoField as Cnab240DocumentoSacadoBoletoField } from '@cnab/field/cnab240/documento-sacado-boleto-field'

// BB aceita "0" como indicador, tratado como CNPJ.
export class DocumentoSacadoBoletoField extends Cnab240DocumentoSacadoBoletoField {
  protected documentType(): DocumentType | null {
    const tipoInscricao = this.extractRangeFromLine(17, 18)
    return documentTypeByIndicator(tipoInscricao == '0' ? '2' : tipoInscricao, '1', '2')
  }
}
