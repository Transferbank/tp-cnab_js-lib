import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import { DocumentoSacadoBoletoField } from '@cnab/field/cnab240/documento-sacado-boleto-field'

// BB aceita "0" como indicador, tratado como CNPJ.
export class Cnab240BancoDoBrasilBoletoSacadoDocumentoField extends DocumentoSacadoBoletoField {
  protected documentType(): DocumentType | null {
    const tipoInscricao = this.extractRangeFromLine(17, 18)
    return documentTypeByIndicator(tipoInscricao == '0' ? '2' : tipoInscricao, '1', '2')
  }
}
